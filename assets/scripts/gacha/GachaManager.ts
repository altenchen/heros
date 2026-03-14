/**
 * 招募管理器
 * 管理抽卡、招募、保底机制
 * 遵循阿里巴巴开发者手册规范
 */

import {
    GachaPoolType,
    Rarity,
    GachaResultType,
    GachaPoolConfig,
    GachaPoolItem,
    GachaResult,
    GachaResponse,
    GachaRecord,
    PlayerGachaData,
    GachaEventType,
    GachaEventData
} from '../config/GachaTypes';
import {
    gachaPools,
    getGachaPool,
    getActivePools,
    getItemsByRarity,
    getUpItems,
    calculateActualRate
} from '../config/gacha.json';
import { EventCenter } from '../utils/EventTarget';
import { playerDataManager } from '../utils/PlayerDataManager';
import { rewardManager, RewardConfig } from '../utils/RewardManager';

/**
 * 招募管理器
 * 单例模式
 */
export class GachaManager {
    private static _instance: GachaManager | null = null;

    /** 玩家招募数据 */
    private _playerData: PlayerGachaData;

    /** 存储键 */
    private readonly STORAGE_KEY = 'hmm_legacy_gacha';

    private constructor() {
        this._playerData = {
            pityCounters: new Map(),
            totalPulls: 0,
            dailyPulls: 0,
            lastResetDate: '',
            records: [],
            pityHistory: []
        };
    }

    /**
     * 获取单例实例
     */
    static getInstance(): GachaManager {
        if (!GachaManager._instance) {
            GachaManager._instance = new GachaManager();
        }
        return GachaManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this._checkDailyReset();
        console.log('[GachaManager] 初始化完成');
    }

    /**
     * 检查每日重置
     */
    private _checkDailyReset(): void {
        const today = new Date().toDateString();
        if (this._playerData.lastResetDate !== today) {
            this._playerData.dailyPulls = 0;
            this._playerData.lastResetDate = today;
        }
    }

    /**
     * 获取所有开启中的招募池
     */
    getActivePools(): GachaPoolConfig[] {
        return getActivePools();
    }

    /**
     * 获取招募池配置
     */
    getPoolConfig(poolId: string): GachaPoolConfig | undefined {
        return getGachaPool(poolId);
    }

    /**
     * 获取保底计数
     */
    getPityCount(poolId: string): number {
        return this._playerData.pityCounters.get(poolId) || 0;
    }

    /**
     * 距离保底还需要多少抽
     */
    getPityRemaining(poolId: string): number {
        const pool = getGachaPool(poolId);
        if (!pool) return 0;

        const currentCount = this.getPityCount(poolId);
        return Math.max(0, pool.pity.hardPity - currentCount);
    }

    /**
     * 获取总抽卡次数
     */
    getTotalPulls(): number {
        return this._playerData.totalPulls;
    }

    /**
     * 获取今日抽卡次数
     */
    getDailyPulls(): number {
        this._checkDailyReset();
        return this._playerData.dailyPulls;
    }

    /**
     * 获取抽卡消耗
     */
    getPullCost(poolId: string, count: 1 | 10): { currency: string; amount: number } | null {
        const pool = getGachaPool(poolId);
        if (!pool) return null;

        if (count === 1) {
            return { currency: pool.singleCost.currency, amount: pool.singleCost.amount };
        } else {
            return { currency: pool.tenCost.currency, amount: pool.tenCost.amount };
        }
    }

    /**
     * 单抽
     */
    singlePull(poolId: string): GachaResponse {
        return this._pull(poolId, 1);
    }

    /**
     * 十连
     */
    tenPull(poolId: string): GachaResponse {
        return this._pull(poolId, 10);
    }

    /**
     * 执行抽卡
     */
    private _pull(poolId: string, count: number): GachaResponse {
        const pool = getGachaPool(poolId);
        if (!pool) {
            return {
                success: false,
                results: [],
                pityCount: 0,
                pityTriggered: false,
                cost: { currency: '', amount: 0 },
                error: '招募池不存在'
            };
        }

        // 检查资源
        const cost = this.getPullCost(poolId, count as 1 | 10);
        if (!cost) {
            return {
                success: false,
                results: [],
                pityCount: 0,
                pityTriggered: false,
                cost: { currency: '', amount: 0 },
                error: '配置错误'
            };
        }

        const hasResource = playerDataManager.getResource(cost.currency as any) >= cost.amount;
        if (!hasResource) {
            return {
                success: false,
                results: [],
                pityCount: 0,
                pityTriggered: false,
                cost,
                error: '资源不足'
            };
        }

        // 扣除资源
        playerDataManager.addResource(cost.currency as any, -cost.amount);

        // 执行抽卡
        const results: GachaResult[] = [];
        let pityTriggered = false;
        const startPityCount = this.getPityCount(poolId);

        for (let i = 0; i < count; i++) {
            const result = this._doSinglePull(pool);
            results.push(result);

            if (result.isPity) {
                pityTriggered = true;
            }
        }

        // 更新统计
        this._playerData.totalPulls += count;
        this._playerData.dailyPulls += count;

        // 记录
        this._recordGacha(poolId, count, results, cost);

        // 发放奖励
        this._grantRewards(results);

        // 发送事件
        const eventData: GachaEventData = {
            type: count === 1 ? GachaEventType.SINGLE_PULL : GachaEventType.TEN_PULL,
            poolId,
            results,
            pityCount: this.getPityCount(poolId)
        };
        EventCenter.emit(eventData.type, eventData);

        // 检查稀有物品
        const rareItems = results.filter(r =>
            r.rarity === Rarity.EPIC || r.rarity === Rarity.LEGENDARY
        );
        if (rareItems.length > 0) {
            EventCenter.emit(GachaEventType.GET_RARE, {
                ...eventData,
                type: GachaEventType.GET_RARE,
                rarity: rareItems[0].rarity
            });
        }

        return {
            success: true,
            results,
            pityCount: this.getPityCount(poolId),
            pityTriggered,
            cost
        };
    }

    /**
     * 执行单次抽卡
     */
    private _doSinglePull(pool: GachaPoolConfig): GachaResult {
        const pityCount = this.getPityCount(pool.poolId);
        const newPityCount = pityCount + 1;
        this._playerData.pityCounters.set(pool.poolId, newPityCount);

        // 检查硬保底
        if (newPityCount >= pool.pity.hardPity) {
            return this._getPityResult(pool);
        }

        // 正常抽卡
        const result = this._randomResult(pool, pityCount);

        // 重置保底计数（如果抽到高稀有度）
        if (result.rarity === Rarity.EPIC || result.rarity === Rarity.LEGENDARY) {
            this._playerData.pityCounters.set(pool.poolId, 0);

            if (result.rarity === pool.pity.pityRarity) {
                result.isPity = true;
            }
        }

        return result;
    }

    /**
     * 随机结果
     */
    private _randomResult(pool: GachaPoolConfig, pityCount: number): GachaResult {
        // 确定稀有度
        const rarity = this._determineRarity(pool, pityCount);

        // 从该稀有度的物品中随机选择
        const items = getItemsByRarity(pool, rarity);
        if (items.length === 0) {
            // 降级到下一稀有度
            return this._randomResult(pool, pityCount);
        }

        // 考虑UP物品权重
        let selectedItems = items;
        const upItems = getUpItems(pool);

        // 随机选择物品
        const totalWeight = selectedItems.reduce((sum, item) => sum + item.weight, 0);
        let random = Math.random() * totalWeight;

        let selectedItem: GachaPoolItem = selectedItems[0];
        for (const item of selectedItems) {
            random -= item.weight;
            if (random <= 0) {
                selectedItem = item;
                break;
            }
        }

        // 检查是否UP
        const isUp = upItems.some(up => up.itemId === selectedItem.itemId);

        // 随机数量
        const amount = Math.floor(
            Math.random() * (selectedItem.amountRange[1] - selectedItem.amountRange[0] + 1)
        ) + selectedItem.amountRange[0];

        return {
            resultId: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            itemId: selectedItem.itemId,
            resultType: selectedItem.resultType,
            rarity: selectedItem.rarity,
            amount,
            isUp,
            isPity: false
        };
    }

    /**
     * 确定稀有度
     */
    private _determineRarity(pool: GachaPoolConfig, pityCount: number): Rarity {
        // 保底影响
        const softPity = pool.pity.softPity;
        const hardPity = pool.pity.hardPity;

        // 基础概率
        let legendaryRate = 0.015; // 1.5%
        let epicRate = 0.085;      // 8.5%
        let rareRate = 0.30;       // 30%

        // 软保底加成
        if (pityCount >= softPity) {
            const pityProgress = (pityCount - softPity) / (hardPity - softPity);
            legendaryRate += pityProgress * 0.10; // 最高+10%
            epicRate += pityProgress * 0.15;       // 最高+15%
        }

        // 随机
        const rand = Math.random();

        if (rand < legendaryRate) {
            return Rarity.LEGENDARY;
        } else if (rand < legendaryRate + epicRate) {
            return Rarity.EPIC;
        } else if (rand < legendaryRate + epicRate + rareRate) {
            return Rarity.RARE;
        } else {
            return Rarity.COMMON;
        }
    }

    /**
     * 获取保底结果
     */
    private _getPityResult(pool: GachaPoolConfig): GachaResult {
        // 重置保底计数
        this._playerData.pityCounters.set(pool.poolId, 0);

        // 获取保底稀有度的物品
        const items = getItemsByRarity(pool, pool.pity.pityRarity);
        if (items.length === 0) {
            // 降级到史诗
            const epicItems = getItemsByRarity(pool, Rarity.EPIC);
            if (epicItems.length > 0) {
                const item = epicItems[Math.floor(Math.random() * epicItems.length)];
                return this._createResult(item, true);
            }
        }

        // 优先UP物品
        const upItems = getUpItems(pool);
        if (upItems.length > 0) {
            const item = upItems[Math.floor(Math.random() * upItems.length)];
            return this._createResult(item, true, true);
        }

        // 随机选择
        const item = items[Math.floor(Math.random() * items.length)];
        return this._createResult(item, true);
    }

    /**
     * 创建抽卡结果
     */
    private _createResult(
        item: GachaPoolItem,
        isPity: boolean,
        isUp: boolean = false
    ): GachaResult {
        const amount = Math.floor(
            Math.random() * (item.amountRange[1] - item.amountRange[0] + 1)
        ) + item.amountRange[0];

        return {
            resultId: `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            itemId: item.itemId,
            resultType: item.resultType,
            rarity: item.rarity,
            amount,
            isUp,
            isPity
        };
    }

    /**
     * 发放奖励
     */
    private _grantRewards(results: GachaResult[]): void {
        const rewards: RewardConfig[] = results.map(result => ({
            type: result.resultType as any,
            itemId: result.itemId,
            amount: result.amount
        }));
        rewardManager.grantRewards(rewards);
    }

    /**
     * 记录抽卡
     */
    private _recordGacha(
        poolId: string,
        count: number,
        results: GachaResult[],
        cost: { currency: string; amount: number }
    ): void {
        const record: GachaRecord = {
            recordId: `record_${Date.now()}`,
            poolId,
            gachaTime: Date.now(),
            count,
            results,
            cost
        };

        this._playerData.records.unshift(record);

        // 只保留最近100条记录
        if (this._playerData.records.length > 100) {
            this._playerData.records = this._playerData.records.slice(0, 100);
        }

        // 记录保底历史
        const pityResult = results.find(r => r.isPity);
        if (pityResult) {
            this._playerData.pityHistory.push({
                poolId,
                pityCount: this.getPityCount(poolId),
                result: pityResult,
                time: Date.now()
            });
        }
    }

    /**
     * 获取抽卡记录
     */
    getRecords(count: number = 20): GachaRecord[] {
        return this._playerData.records.slice(0, count);
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            pityCounters: Object.fromEntries(this._playerData.pityCounters),
            totalPulls: this._playerData.totalPulls,
            dailyPulls: this._playerData.dailyPulls,
            lastResetDate: this._playerData.lastResetDate,
            records: this._playerData.records,
            pityHistory: this._playerData.pityHistory
        };
        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(jsonStr: string): void {
        try {
            const data = JSON.parse(jsonStr);
            if (data.pityCounters) {
                this._playerData.pityCounters = new Map(Object.entries(data.pityCounters));
            }
            if (data.totalPulls !== undefined) {
                this._playerData.totalPulls = data.totalPulls;
            }
            if (data.dailyPulls !== undefined) {
                this._playerData.dailyPulls = data.dailyPulls;
            }
            if (data.lastResetDate) {
                this._playerData.lastResetDate = data.lastResetDate;
            }
            if (data.records) {
                this._playerData.records = data.records;
            }
            if (data.pityHistory) {
                this._playerData.pityHistory = data.pityHistory;
            }
            this._checkDailyReset();
        } catch (e) {
            console.error('[GachaManager] 反序列化失败', e);
        }
    }
}

/** 导出单例实例 */
export const gachaManager = GachaManager.getInstance();