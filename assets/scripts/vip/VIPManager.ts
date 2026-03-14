/**
 * VIP与充值管理器
 * 管理VIP等级、充值、月卡、成长基金
 * 遵循阿里巴巴开发者手册规范
 */

import {
    VIPProgress,
    VIPLevelConfig,
    MonthlyCardProgress,
    MonthlyCardStatus,
    GrowthFundProgress,
    PaymentRecord,
    PaymentResult,
    VIPEventType,
    VIPEventData,
    DEFAULT_VIP_SETTINGS
} from '../config/VIPTypes';
import {
    vipLevelConfigs,
    paymentProducts,
    monthlyCardConfigs,
    growthFundConfigs,
    getVIPLevelConfig,
    getPaymentProduct,
    getMonthlyCardConfig,
    getGrowthFundConfig
} from '../config/vip.json';
import { EventCenter } from '../utils/EventTarget';
import { playerDataManager } from '../utils/PlayerDataManager';
import { inventoryManager } from '../inventory';

/**
 * VIP管理器
 * 单例模式
 */
export class VIPManager {
    private static _instance: VIPManager | null = null;

    /** VIP进度 */
    private _vipProgress: VIPProgress = {
        level: 0,
        exp: 0,
        totalRecharge: 0,
        claimedLevelRewards: []
    };

    /** 月卡进度 */
    private _monthlyCardProgress: Map<string, MonthlyCardProgress> = new Map();

    /** 成长基金进度 */
    private _growthFundProgress: Map<string, GrowthFundProgress> = new Map();

    /** 充值记录 */
    private _paymentRecords: PaymentRecord[] = [];

    /** 首充标记 */
    private _firstPurchaseProducts: Set<string> = new Set();

    /** 存储键 */
    private readonly SETTINGS_KEY = 'hmm_legacy_vip';

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): VIPManager {
        if (!VIPManager._instance) {
            VIPManager._instance = new VIPManager();
        }
        return VIPManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this._checkMonthlyCards();
        console.log('[VIPManager] 初始化完成');
    }

    /**
     * 检查月卡过期
     */
    private _checkMonthlyCards(): void {
        const now = Date.now();

        this._monthlyCardProgress.forEach((progress, cardId) => {
            if (progress.expireTime < now) {
                // 月卡已过期
                console.log(`[VIPManager] 月卡过期: ${cardId}`);
            }
        });
    }

    /**
     * 获取VIP等级
     */
    getVIPLevel(): number {
        return this._vipProgress.level;
    }

    /**
     * 获取VIP经验
     */
    getVIPExp(): number {
        return this._vipProgress.exp;
    }

    /**
     * 获取VIP配置
     */
    getVIPConfig(): VIPLevelConfig | undefined {
        return getVIPLevelConfig(this._vipProgress.level);
    }

    /**
     * 获取下一级VIP所需经验
     */
    getNextLevelExp(): number {
        const nextLevel = this._vipProgress.level + 1;
        const config = getVIPLevelConfig(nextLevel);
        return config?.requiredExp || 0;
    }

    /**
     * 获取当前等级进度
     */
    getVIPProgress(): number {
        const currentExp = this._vipProgress.exp;
        const currentLevelConfig = getVIPLevelConfig(this._vipProgress.level);
        const nextLevelConfig = getVIPLevelConfig(this._vipProgress.level + 1);

        if (!nextLevelConfig) {
            return 100; // 已满级
        }

        const prevExp = currentLevelConfig?.requiredExp || 0;
        const nextExp = nextLevelConfig.requiredExp;
        const progress = ((currentExp - prevExp) / (nextExp - prevExp)) * 100;

        return Math.min(100, Math.max(0, progress));
    }

    /**
     * 获取总充值金额
     */
    getTotalRecharge(): number {
        return this._vipProgress.totalRecharge;
    }

    /**
     * 增加VIP经验
     */
    addVIPExp(exp: number): boolean {
        const oldLevel = this._vipProgress.level;
        this._vipProgress.exp += exp;

        // 检查升级
        let newLevel = this._vipProgress.level;
        for (let level = this._vipProgress.level + 1; level <= DEFAULT_VIP_SETTINGS.maxVIPLevel; level++) {
            const config = getVIPLevelConfig(level);
            if (config && this._vipProgress.exp >= config.requiredExp) {
                newLevel = level;
            } else {
                break;
            }
        }

        if (newLevel > oldLevel) {
            this._vipProgress.level = newLevel;
            console.log(`[VIPManager] VIP升级: ${oldLevel} -> ${newLevel}`);

            // 发送升级事件
            const eventData: VIPEventData = { level: newLevel };
            EventCenter.emit(VIPEventType.VIP_LEVEL_UP, eventData);

            return true;
        }

        return false;
    }

    /**
     * 领取VIP等级奖励
     */
    claimVIPLevelReward(level: number): boolean {
        if (this._vipProgress.level < level) {
            console.warn(`[VIPManager] VIP等级不足: ${level}`);
            return false;
        }

        if (this._vipProgress.claimedLevelRewards.includes(level)) {
            console.warn(`[VIPManager] 已领取VIP${level}奖励`);
            return false;
        }

        const config = getVIPLevelConfig(level);
        if (!config || !config.levelReward) {
            return false;
        }

        // 发放奖励
        const reward = config.levelReward;
        if (reward.gold) {
            playerDataManager.addResource('gold', reward.gold);
        }
        if (reward.gems) {
            playerDataManager.addResource('gems', reward.gems);
        }
        if (reward.items) {
            reward.items.forEach(item => {
                inventoryManager.addItem(item.itemId, item.count);
            });
        }

        this._vipProgress.claimedLevelRewards.push(level);

        console.log(`[VIPManager] 领取VIP${level}奖励成功`);

        return true;
    }

    /**
     * 充值
     */
    purchase(productId: string): PaymentResult {
        const product = getPaymentProduct(productId);
        if (!product) {
            return {
                success: false,
                error: '产品不存在'
            };
        }

        // 检查VIP等级要求
        if (product.vipRequired && this._vipProgress.level < product.vipRequired) {
            return {
                success: false,
                error: `需要VIP${product.vipRequired}`
            };
        }

        // 生成订单ID
        const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 模拟支付成功
        const isFirstPurchase = !this._firstPurchaseProducts.has(productId);
        let totalGems = product.gems;
        let bonusGems = product.bonusGems || 0;

        // 首充双倍
        if (isFirstPurchase && product.firstDouble) {
            totalGems *= 2;
        }

        totalGems += bonusGems;

        // 发放钻石
        playerDataManager.addResource('gems', totalGems);

        // 计算VIP经验 (每元10点经验)
        const vipExp = Math.floor(product.price / 100) * DEFAULT_VIP_SETTINGS.expPerYuan;
        this.addVIPExp(vipExp);

        // 更新充值金额
        this._vipProgress.totalRecharge += product.price;

        // 记录首充
        if (isFirstPurchase) {
            this._firstPurchaseProducts.add(productId);
        }

        // 记录充值
        const record: PaymentRecord = {
            orderId,
            productId,
            amount: product.price,
            gems: totalGems,
            time: Date.now(),
            isFirstPurchase
        };
        this._paymentRecords.push(record);

        // 发送充值成功事件
        const eventData: VIPEventData = {
            orderId,
            gems: totalGems
        };
        EventCenter.emit(VIPEventType.PAYMENT_SUCCESS, eventData);

        console.log(`[VIPManager] 充值成功: ${product.name}, 获得${totalGems}钻石`);

        return {
            success: true,
            orderId,
            gems: totalGems,
            bonusGems,
            vipExp
        };
    }

    /**
     * 购买月卡
     */
    purchaseMonthlyCard(cardId: string): boolean {
        const config = getMonthlyCardConfig(cardId);
        if (!config) {
            console.warn('[VIPManager] 月卡配置不存在');
            return false;
        }

        // 检查是否已购买且未过期
        const existing = this._monthlyCardProgress.get(cardId);
        if (existing && existing.expireTime > Date.now()) {
            console.warn('[VIPManager] 月卡有效期内不能重复购买');
            return false;
        }

        // 模拟支付成功
        const now = Date.now();

        // 发放立即奖励
        if (config.instantReward.gems) {
            playerDataManager.addResource('gems', config.instantReward.gems);
        }
        if (config.instantReward.gold) {
            playerDataManager.addResource('gold', config.instantReward.gold);
        }
        if (config.instantReward.items) {
            config.instantReward.items.forEach(item => {
                inventoryManager.addItem(item.itemId, item.count);
            });
        }

        // 增加VIP经验
        this.addVIPExp(config.vipExp);

        // 记录进度
        const progress: MonthlyCardProgress = {
            cardId,
            purchaseTime: now,
            expireTime: now + config.duration * 24 * 60 * 60 * 1000,
            lastClaimTime: 0,
            claimedDays: 0
        };
        this._monthlyCardProgress.set(cardId, progress);

        // 发送事件
        const eventData: VIPEventData = { cardId };
        EventCenter.emit(VIPEventType.MONTHLY_CARD_PURCHASE, eventData);

        console.log(`[VIPManager] 购买月卡成功: ${config.name}`);

        return true;
    }

    /**
     * 获取月卡状态
     */
    getMonthlyCardStatus(cardId: string): MonthlyCardStatus {
        const progress = this._monthlyCardProgress.get(cardId);
        const now = Date.now();

        if (!progress || progress.expireTime < now) {
            return MonthlyCardStatus.NOT_PURCHASED;
        }

        // 检查今日是否已领取
        const today = new Date().setHours(0, 0, 0, 0);
        if (progress.lastClaimTime >= today) {
            return MonthlyCardStatus.CLAIMED_TODAY;
        }

        return MonthlyCardStatus.PENDING_CLAIM;
    }

    /**
     * 领取月卡每日奖励
     */
    claimMonthlyCardDailyReward(cardId: string): boolean {
        const config = getMonthlyCardConfig(cardId);
        const progress = this._monthlyCardProgress.get(cardId);

        if (!config || !progress) {
            return false;
        }

        const status = this.getMonthlyCardStatus(cardId);
        if (status !== MonthlyCardStatus.PENDING_CLAIM) {
            return false;
        }

        const now = Date.now();

        // 发放每日奖励
        if (config.dailyReward.gems) {
            playerDataManager.addResource('gems', config.dailyReward.gems);
        }
        if (config.dailyReward.gold) {
            playerDataManager.addResource('gold', config.dailyReward.gold);
        }
        if (config.dailyReward.stamina) {
            playerDataManager.addResource('stamina', config.dailyReward.stamina);
        }
        if (config.dailyReward.items) {
            config.dailyReward.items.forEach(item => {
                inventoryManager.addItem(item.itemId, item.count);
            });
        }

        progress.lastClaimTime = now;
        progress.claimedDays++;

        // 发送事件
        const eventData: VIPEventData = { cardId };
        EventCenter.emit(VIPEventType.MONTHLY_CARD_CLAIM, eventData);

        console.log(`[VIPManager] 领取月卡每日奖励: ${config.name}`);

        return true;
    }

    /**
     * 购买成长基金
     */
    purchaseGrowthFund(fundId: string): boolean {
        const config = getGrowthFundConfig(fundId);
        if (!config) {
            return false;
        }

        const existing = this._growthFundProgress.get(fundId);
        if (existing?.purchased) {
            console.warn('[VIPManager] 已购买该基金');
            return false;
        }

        // 模拟支付成功
        const progress: GrowthFundProgress = {
            fundId,
            purchased: true,
            claimedLevels: []
        };
        this._growthFundProgress.set(fundId, progress);

        // 发送事件
        const eventData: VIPEventData = { fundId };
        EventCenter.emit(VIPEventType.GROWTH_FUND_PURCHASE, eventData);

        console.log(`[VIPManager] 购买成长基金成功: ${config.name}`);

        return true;
    }

    /**
     * 领取成长基金等级奖励
     */
    claimGrowthFundReward(fundId: string, level: number): boolean {
        const config = getGrowthFundConfig(fundId);
        const progress = this._growthFundProgress.get(fundId);

        if (!config || !progress || !progress.purchased) {
            return false;
        }

        // 检查玩家等级
        const playerLevel = playerDataManager.getPlayerLevel();
        if (playerLevel < level) {
            return false;
        }

        // 检查是否已领取
        if (progress.claimedLevels.includes(level)) {
            return false;
        }

        // 查找奖励
        const levelReward = config.levelRewards.find(r => r.level === level);
        if (!levelReward) {
            return false;
        }

        // 发放奖励
        if (levelReward.reward.gems) {
            playerDataManager.addResource('gems', levelReward.reward.gems);
        }
        if (levelReward.reward.gold) {
            playerDataManager.addResource('gold', levelReward.reward.gold);
        }

        progress.claimedLevels.push(level);

        // 发送事件
        const eventData: VIPEventData = { fundId };
        EventCenter.emit(VIPEventType.GROWTH_FUND_CLAIM, eventData);

        console.log(`[VIPManager] 领取成长基金奖励: 等级${level}`);

        return true;
    }

    /**
     * 检查是否有VIP特权
     */
    hasPrivilege(privilegeType: string): boolean {
        const config = this.getVIPConfig();
        if (!config) {
            return false;
        }
        return config.privileges.some(p => p.type === privilegeType);
    }

    /**
     * 获取特权值
     */
    getPrivilegeValue(privilegeType: string): number {
        const config = this.getVIPConfig();
        if (!config) {
            return 0;
        }
        const privilege = config.privileges.find(p => p.type === privilegeType);
        return privilege?.value || 0;
    }

    /**
     * 获取充值记录
     */
    getPaymentRecords(): PaymentRecord[] {
        return [...this._paymentRecords];
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            vipProgress: this._vipProgress,
            monthlyCardProgress: Array.from(this._monthlyCardProgress.entries()),
            growthFundProgress: Array.from(this._growthFundProgress.entries()),
            paymentRecords: this._paymentRecords,
            firstPurchaseProducts: Array.from(this._firstPurchaseProducts)
        };
        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);

            if (parsed.vipProgress) {
                this._vipProgress = parsed.vipProgress;
            }

            if (parsed.monthlyCardProgress) {
                this._monthlyCardProgress = new Map(parsed.monthlyCardProgress);
            }

            if (parsed.growthFundProgress) {
                this._growthFundProgress = new Map(parsed.growthFundProgress);
            }

            if (parsed.paymentRecords) {
                this._paymentRecords = parsed.paymentRecords;
            }

            if (parsed.firstPurchaseProducts) {
                this._firstPurchaseProducts = new Set(parsed.firstPurchaseProducts);
            }

            this._checkMonthlyCards();
            console.log('[VIPManager] 数据加载完成');
        } catch (e) {
            console.error('[VIPManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._vipProgress = {
            level: 0,
            exp: 0,
            totalRecharge: 0,
            claimedLevelRewards: []
        };
        this._monthlyCardProgress.clear();
        this._growthFundProgress.clear();
        this._paymentRecords = [];
        this._firstPurchaseProducts.clear();
    }
}

// 导出单例
export const vipManager = VIPManager.getInstance();