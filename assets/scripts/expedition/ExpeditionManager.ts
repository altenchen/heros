/**
 * 远征管理器
 * 管理远征系统，处理英雄派遣、奖励获取等
 */

import { EventCenter } from '../utils/EventTarget';
import {
    ExpeditionState,
    ExpeditionDifficulty,
    ExpeditionEventType,
    ExpeditionConfig,
    ExpeditionData,
    ExpeditionHero,
    ExpeditionReward,
    ExpeditionListData,
    ExpeditionDetail,
    ExpeditionStartResult,
    ExpeditionCompleteResult
} from '../config/ExpeditionTypes';
import { expeditionConfigMap, expeditionConfigs } from '../config/expedition.json';

/** 远征管理器 */
export class ExpeditionManager {
    private static instance: ExpeditionManager | null = null;

    /** 远征数据 */
    private expeditionData: Map<string, ExpeditionData> = new Map();

    /** 刷新时间 */
    private refreshTime: number = 0;

    /** 每日完成次数 */
    private dailyCompletions: number = 0;

    /** 每日最大次数 */
    private maxDailyCompletions: number = 10;

    /** 是否已初始化 */
    private initialized: boolean = false;

    /** 上次更新时间 */
    private lastUpdateTime: number = 0;

    private constructor() {}

    /**
     * 获取单例
     */
    static getInstance(): ExpeditionManager {
        if (!ExpeditionManager.instance) {
            ExpeditionManager.instance = new ExpeditionManager();
        }
        return ExpeditionManager.instance;
    }

    /**
     * 初始化
     */
    init(): void {
        if (this.initialized) return;

        // 初始化所有远征
        expeditionConfigs.forEach(config => {
            this.expeditionData.set(config.id, {
                expeditionId: config.id,
                state: ExpeditionState.LOCKED,
                heroes: [],
                startTime: 0,
                endTime: 0,
                progress: 0,
                starRating: 0
            });
        });

        // 设置下次刷新时间
        this.refreshTime = this._getNextRefreshTime();

        this.initialized = true;
        console.log('[ExpeditionManager] 初始化完成');
    }

    /**
     * 更新远征状态（每帧调用）
     */
    update(deltaTime: number): void {
        if (!this.initialized) return;

        const now = Date.now();

        // 检查每日刷新
        if (now >= this.refreshTime) {
            this._dailyRefresh();
        }

        // 更新进行中的远征
        this.expeditionData.forEach((data, expeditionId) => {
            if (data.state === ExpeditionState.IN_PROGRESS) {
                const config = expeditionConfigMap.get(expeditionId);
                if (!config) return;

                // 更新进度
                const elapsed = now - data.startTime;
                const total = config.duration * 1000;
                data.progress = Math.min(100, (elapsed / total) * 100);

                // 检查是否完成
                if (elapsed >= total) {
                    this._completeExpedition(expeditionId);
                }
            }
        });

        this.lastUpdateTime = now;
    }

    /**
     * 获取远征列表数据
     */
    getExpeditionList(): ExpeditionListData {
        return {
            expeditions: Array.from(this.expeditionData.values()),
            refreshTime: this.refreshTime,
            dailyCompletions: this.dailyCompletions,
            maxDailyCompletions: this.maxDailyCompletions
        };
    }

    /**
     * 获取远征详情
     */
    getExpeditionDetail(expeditionId: string, playerLevel: number, playerPower: number): ExpeditionDetail | null {
        const config = expeditionConfigMap.get(expeditionId);
        const data = this.expeditionData.get(expeditionId);

        if (!config || !data) return null;

        const now = Date.now();
        const remainingTime = Math.max(0, data.endTime - now);
        const totalPower = this._calculateTotalPower(data.heroes);

        // 更新状态
        if (data.state === ExpeditionState.LOCKED) {
            if (playerLevel >= config.requiredLevel) {
                data.state = ExpeditionState.AVAILABLE;
            }
        }

        return {
            config,
            data,
            canStart: data.state === ExpeditionState.AVAILABLE &&
                      totalPower >= config.requiredPower &&
                      data.heroes.length > 0 &&
                      this.dailyCompletions < this.maxDailyCompletions,
            canSpeedUp: data.state === ExpeditionState.IN_PROGRESS,
            remainingTime,
            totalPower,
            recommendedPower: config.requiredPower
        };
    }

    /**
     * 分配英雄到远征
     */
    assignHero(expeditionId: string, heroId: string): boolean {
        const data = this.expeditionData.get(expeditionId);
        const config = expeditionConfigMap.get(expeditionId);

        if (!data || !config) return false;
        if (data.state !== ExpeditionState.AVAILABLE && data.state !== ExpeditionState.LOCKED) return false;
        if (data.heroes.length >= config.heroSlots) return false;

        // 检查英雄是否已被分配
        for (const [id, expeditionData] of this.expeditionData) {
            if (id !== expeditionId && expeditionData.heroes.some(h => h.heroId === heroId)) {
                console.warn(`[ExpeditionManager] 英雄 ${heroId} 已被分配到其他远征`);
                return false;
            }
        }

        data.heroes.push({
            heroId,
            assignedTime: Date.now()
        });

        // 更新状态
        if (data.state === ExpeditionState.LOCKED) {
            data.state = ExpeditionState.AVAILABLE;
        }

        EventCenter.emit(ExpeditionEventType.HERO_ASSIGNED, { expeditionId, heroId });
        return true;
    }

    /**
     * 召回英雄
     */
    recallHero(expeditionId: string, heroId: string): boolean {
        const data = this.expeditionData.get(expeditionId);
        if (!data) return false;
        if (data.state === ExpeditionState.IN_PROGRESS) return false;

        const index = data.heroes.findIndex(h => h.heroId === heroId);
        if (index === -1) return false;

        data.heroes.splice(index, 1);

        EventCenter.emit(ExpeditionEventType.HERO_RECALLED, { expeditionId, heroId });
        return true;
    }

    /**
     * 开始远征
     */
    startExpedition(expeditionId: string, playerPower: number): ExpeditionStartResult {
        const data = this.expeditionData.get(expeditionId);
        const config = expeditionConfigMap.get(expeditionId);

        if (!data || !config) {
            return { success: false, error: '远征不存在' };
        }

        if (data.state !== ExpeditionState.AVAILABLE) {
            return { success: false, error: '远征状态不正确' };
        }

        if (data.heroes.length === 0) {
            return { success: false, error: '请先分配英雄' };
        }

        const totalPower = this._calculateTotalPower(data.heroes);
        if (totalPower < config.requiredPower) {
            return { success: false, error: `战力不足，需要 ${config.requiredPower}` };
        }

        if (this.dailyCompletions >= this.maxDailyCompletions) {
            return { success: false, error: '今日远征次数已用完' };
        }

        // 开始远征
        const now = Date.now();
        data.state = ExpeditionState.IN_PROGRESS;
        data.startTime = now;
        data.endTime = now + config.duration * 1000;
        data.progress = 0;

        EventCenter.emit(ExpeditionEventType.EXPEDITION_START, { expeditionId, data });

        return { success: true, data };
    }

    /**
     * 加速远征
     */
    speedUpExpedition(expeditionId: string, minutes: number): boolean {
        const data = this.expeditionData.get(expeditionId);
        if (!data || data.state !== ExpeditionState.IN_PROGRESS) return false;

        data.endTime -= minutes * 60 * 1000;

        EventCenter.emit(ExpeditionEventType.EXPEDITION_SPEED_UP, { expeditionId, minutes });
        return true;
    }

    /**
     * 立即完成远征（使用钻石）
     */
    instantComplete(expeditionId: string): boolean {
        const data = this.expeditionData.get(expeditionId);
        if (!data || data.state !== ExpeditionState.IN_PROGRESS) return false;

        data.endTime = Date.now();
        return true;
    }

    /**
     * 领取奖励
     */
    claimReward(expeditionId: string): ExpeditionCompleteResult | null {
        const data = this.expeditionData.get(expeditionId);
        const config = expeditionConfigMap.get(expeditionId);

        if (!data || !config) return null;
        if (data.state !== ExpeditionState.COMPLETED) return null;

        // 计算奖励
        const rewards = this._calculateRewards(config, data.starRating);
        const bonusRewards = this._calculateBonusRewards(config);

        // 更新状态
        data.state = ExpeditionState.CLAIMED;
        this.dailyCompletions++;

        EventCenter.emit(ExpeditionEventType.EXPEDITION_CLAIM, {
            expeditionId,
            rewards,
            bonusRewards,
            starRating: data.starRating
        });

        return {
            success: true,
            rewards,
            starRating: data.starRating,
            bonusRewards: bonusRewards.length > 0 ? bonusRewards : undefined
        };
    }

    /**
     * 完成远征（内部方法）
     */
    private _completeExpedition(expeditionId: string): void {
        const data = this.expeditionData.get(expeditionId);
        const config = expeditionConfigMap.get(expeditionId);

        if (!data || !config) return;

        // 计算星级
        const totalPower = this._calculateTotalPower(data.heroes);
        const powerRatio = totalPower / config.requiredPower;
        let starRating = 1;
        if (powerRatio >= 1.5) starRating = 3;
        else if (powerRatio >= 1.2) starRating = 2;

        data.state = ExpeditionState.COMPLETED;
        data.progress = 100;
        data.starRating = starRating;

        EventCenter.emit(ExpeditionEventType.EXPEDITION_COMPLETE, {
            expeditionId,
            starRating
        });
    }

    /**
     * 计算总战力
     */
    private _calculateTotalPower(heroes: ExpeditionHero[]): number {
        // 这里需要实际获取英雄战力，暂时返回模拟值
        return heroes.length * 5000;
    }

    /**
     * 计算奖励
     */
    private _calculateRewards(config: ExpeditionConfig, starRating: number): ExpeditionReward[] {
        const multiplier = starRating; // 星级倍率
        return config.rewards.map(reward => ({
            ...reward,
            amount: Math.floor(reward.amount * multiplier)
        }));
    }

    /**
     * 计算额外奖励
     */
    private _calculateBonusRewards(config: ExpeditionConfig): ExpeditionReward[] {
        if (!config.bonusRewards) return [];

        const rewards: ExpeditionReward[] = [];
        config.bonusRewards.forEach(reward => {
            const probability = reward.probability || 1;
            if (Math.random() < probability) {
                rewards.push({ ...reward });
            }
        });

        return rewards;
    }

    /**
     * 每日刷新
     */
    private _dailyRefresh(): void {
        // 重置完成次数
        this.dailyCompletions = 0;

        // 重置远征状态
        this.expeditionData.forEach(data => {
            if (data.state === ExpeditionState.COMPLETED || data.state === ExpeditionState.CLAIMED) {
                data.state = ExpeditionState.AVAILABLE;
                data.heroes = [];
                data.startTime = 0;
                data.endTime = 0;
                data.progress = 0;
                data.starRating = 0;
            }
        });

        // 设置下次刷新时间
        this.refreshTime = this._getNextRefreshTime();

        console.log('[ExpeditionManager] 每日刷新完成');
    }

    /**
     * 获取下次刷新时间
     */
    private _getNextRefreshTime(): number {
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(5, 0, 0, 0); // 凌晨5点刷新
        return tomorrow.getTime();
    }

    /**
     * 序列化数据
     */
    serialize(): any {
        return {
            expeditions: Array.from(this.expeditionData.entries()),
            refreshTime: this.refreshTime,
            dailyCompletions: this.dailyCompletions
        };
    }

    /**
     * 反序列化数据
     */
    deserialize(data: any): void {
        if (!data) return;

        if (data.expeditions) {
            this.expeditionData = new Map(data.expeditions);
        }

        if (data.refreshTime) {
            this.refreshTime = data.refreshTime;
        }

        if (data.dailyCompletions !== undefined) {
            this.dailyCompletions = data.dailyCompletions;
        }
    }

    /**
     * 获取剩余次数
     */
    getRemainingCount(): number {
        return this.maxDailyCompletions - this.dailyCompletions;
    }

    /**
     * 获取进行中的远征数量
     */
    getActiveExpeditionCount(): number {
        let count = 0;
        this.expeditionData.forEach(data => {
            if (data.state === ExpeditionState.IN_PROGRESS) count++;
        });
        return count;
    }

    /**
     * 获取可领取奖励的远征数量
     */
    getClaimableCount(): number {
        let count = 0;
        this.expeditionData.forEach(data => {
            if (data.state === ExpeditionState.COMPLETED) count++;
        });
        return count;
    }
}

/** 导出单例 */
export const expeditionManager = ExpeditionManager.getInstance();