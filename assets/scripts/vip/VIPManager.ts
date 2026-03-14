/**
 * VIP管理器
 * 管理VIP等级、充值、月卡、成长基金等功能
 * 遵循阿里巴巴开发者手册规范
 */

import { EventCenter } from '../utils/EventTarget';
import {
    VIPData,
    VIPLevelConfig,
    PaymentProductConfig,
    MonthlyCardConfig,
    GrowthFundConfig,
    MonthlyCardData,
    GrowthFundData,
    PaymentRecord,
    VIPProgress,
    PaymentStatus,
    MonthlyCardStatus,
    VIPPrivilegeType,
    VIPEventType
} from '../config/VIPTypes';
import {
    vipLevels,
    paymentProducts,
    monthlyCards,
    growthFunds,
    getVIPLevelConfig,
    getPaymentProductConfig,
    getMonthlyCardConfig,
    getGrowthFundConfig
} from '../config/vip.json';

/**
 * VIP管理器类
 */
export class VIPManager {
    /** 单例实例 */
    private static _instance: VIPManager | null = null;

    /** VIP数据 */
    private _data: VIPData;

    /**
     * 获取单例
     */
    static getInstance(): VIPManager {
        if (!VIPManager._instance) {
            VIPManager._instance = new VIPManager();
        }
        return VIPManager._instance;
    }

    /**
     * 私有构造函数
     */
    private constructor() {
        this._data = this._createDefaultData();
    }

    /**
     * 创建默认数据
     */
    private _createDefaultData(): VIPData {
        return {
            vipExp: 0,
            totalRecharge: 0,
            firstChargeDone: false,
            claimedVIPRewards: [],
            paymentRecords: [],
            monthlyCards: {},
            growthFunds: {}
        };
    }

    /**
     * 初始化
     */
    init(): void {
        console.log('[VIPManager] 初始化VIP系统');
        this._checkMonthlyCardsExpiry();
    }

    // ==================== VIP等级相关 ====================

    /**
     * 获取VIP等级
     */
    getVIPLevel(): number {
        const exp = this._data.vipExp;
        let level = 0;

        for (const config of vipLevels) {
            if (exp >= config.requiredExp) {
                level = config.level;
            } else {
                break;
            }
        }

        return level;
    }

    /**
     * 获取VIP经验
     */
    getVIPExp(): number {
        return this._data.vipExp;
    }

    /**
     * 获取下一级所需经验
     */
    getNextLevelExp(): number {
        const currentLevel = this.getVIPLevel();
        const nextConfig = getVIPLevelConfig(currentLevel + 1);
        return nextConfig ? nextConfig.requiredExp : 0;
    }

    /**
     * 获取VIP进度
     */
    getVIPProgress(): VIPProgress {
        const level = this.getVIPLevel();
        const exp = this._data.vipExp;
        const currentConfig = getVIPLevelConfig(level);
        const nextConfig = getVIPLevelConfig(level + 1);

        const currentLevelExp = currentConfig ? currentConfig.requiredExp : 0;
        const nextLevelExp = nextConfig ? nextConfig.requiredExp : currentLevelExp;

        const progress = nextLevelExp > currentLevelExp
            ? (exp - currentLevelExp) / (nextLevelExp - currentLevelExp)
            : 1;

        return {
            level,
            exp,
            nextLevelExp,
            progress: Math.min(1, Math.max(0, progress))
        };
    }

    /**
     * 获取VIP等级配置
     */
    getVIPLevelConfig(level: number): VIPLevelConfig | undefined {
        return getVIPLevelConfig(level);
    }

    /**
     * 检查是否有特权
     */
    hasPrivilege(privilegeType: VIPPrivilegeType): boolean {
        const level = this.getVIPLevel();
        const config = getVIPLevelConfig(level);

        if (!config) {
            return false;
        }

        // 检查当前等级及以下所有等级的特权
        for (let i = 1; i <= level; i++) {
            const levelConfig = getVIPLevelConfig(i);
            if (levelConfig) {
                const privilege = levelConfig.privileges.find(p => p.type === privilegeType);
                if (privilege) {
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 获取特权值
     */
    getPrivilegeValue(privilegeType: VIPPrivilegeType): number {
        let maxValue = 0;
        const level = this.getVIPLevel();

        // 找出该特权的最大值（高等级覆盖低等级）
        for (let i = 1; i <= level; i++) {
            const config = getVIPLevelConfig(i);
            if (config) {
                const privilege = config.privileges.find(p => p.type === privilegeType);
                if (privilege && privilege.value > maxValue) {
                    maxValue = privilege.value;
                }
            }
        }

        return maxValue;
    }

    /**
     * 领取VIP等级奖励
     */
    claimVIPLevelReward(level: number): { success: boolean; rewards?: any[]; message?: string } {
        // 检查是否达到该等级
        if (this.getVIPLevel() < level) {
            return { success: false, message: 'VIP等级不足' };
        }

        // 检查是否已领取
        if (this._data.claimedVIPRewards.includes(level)) {
            return { success: false, message: '奖励已领取' };
        }

        const config = getVIPLevelConfig(level);
        if (!config) {
            return { success: false, message: '配置不存在' };
        }

        // 标记已领取
        this._data.claimedVIPRewards.push(level);

        // 触发事件
        EventCenter.emit(VIPEventType.VIP_LEVEL_CHANGED, { level, rewards: config.rewards });

        return { success: true, rewards: config.rewards };
    }

    // ==================== 充值相关 ====================

    /**
     * 获取总充值金额（元）
     */
    getTotalRecharge(): number {
        return this._data.totalRecharge / 100;
    }

    /**
     * 是否已首充
     */
    isFirstChargeDone(): boolean {
        return this._data.firstChargeDone;
    }

    /**
     * 充值
     */
    purchase(productId: string): { success: boolean; gems?: number; vipExp?: number; message?: string } {
        const config = getPaymentProductConfig(productId);
        if (!config) {
            return { success: false, message: '产品不存在' };
        }

        // 检查VIP等级限制
        if (config.requiredVIP && this.getVIPLevel() < config.requiredVIP) {
            return { success: false, message: `需要VIP ${config.requiredVIP}` };
        }

        // 计算钻石
        let totalGems = config.gems + config.bonusGems;
        const isFirst = !this._data.firstChargeDone && config.firstDouble;
        if (isFirst) {
            totalGems *= 2;
            this._data.firstChargeDone = true;
        }

        // 增加VIP经验 (1元=1经验)
        const vipExp = config.price;
        this._data.vipExp += vipExp;

        // 记录充值
        this._data.totalRecharge += config.price * 100;

        const record: PaymentRecord = {
            orderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            productId,
            amount: config.price,
            gems: totalGems,
            status: PaymentStatus.COMPLETED,
            timestamp: Date.now(),
            isFirst
        };
        this._data.paymentRecords.push(record);

        // 触发事件
        EventCenter.emit(VIPEventType.PAYMENT_SUCCESS, { productId, gems: totalGems, vipExp });

        return { success: true, gems: totalGems, vipExp };
    }

    /**
     * 获取充值记录
     */
    getPaymentRecords(): PaymentRecord[] {
        return this._data.paymentRecords;
    }

    // ==================== 月卡相关 ====================

    /**
     * 获取月卡状态
     */
    getMonthlyCardStatus(cardId: string): MonthlyCardStatus {
        const cardData = this._data.monthlyCards[cardId];

        if (!cardData) {
            return MonthlyCardStatus.NOT_PURCHASED;
        }

        const now = Date.now();
        if (now > cardData.expireTime) {
            return MonthlyCardStatus.EXPIRED;
        }

        if (!cardData.todayClaimed) {
            return MonthlyCardStatus.PENDING_CLAIM;
        }

        return MonthlyCardStatus.ACTIVE;
    }

    /**
     * 购买月卡
     */
    purchaseMonthlyCard(cardId: string): { success: boolean; instantReward?: any[]; message?: string } {
        const config = getMonthlyCardConfig(cardId);
        if (!config) {
            return { success: false, message: '月卡不存在' };
        }

        // 检查是否已购买且未过期
        const existingCard = this._data.monthlyCards[cardId];
        if (existingCard && Date.now() < existingCard.expireTime) {
            return { success: false, message: '月卡尚未过期' };
        }

        // 创建月卡数据
        const now = Date.now();
        const cardData: MonthlyCardData = {
            cardId,
            purchaseTime: now,
            expireTime: now + config.duration * 24 * 60 * 60 * 1000,
            todayClaimed: false,
            lastClaimDate: ''
        };

        this._data.monthlyCards[cardId] = cardData;

        // 增加VIP经验
        this._data.vipExp += config.price;
        this._data.totalRecharge += config.price * 100;

        // 触发事件
        EventCenter.emit(VIPEventType.MONTHLY_CARD_PURCHASED, { cardId, instantReward: config.instantReward });

        return { success: true, instantReward: config.instantReward };
    }

    /**
     * 领取月卡每日奖励
     */
    claimMonthlyCardDailyReward(cardId: string): { success: boolean; dailyReward?: any[]; message?: string } {
        const config = getMonthlyCardConfig(cardId);
        if (!config) {
            return { success: false, message: '月卡不存在' };
        }

        const cardData = this._data.monthlyCards[cardId];
        if (!cardData) {
            return { success: false, message: '未购买月卡' };
        }

        const status = this.getMonthlyCardStatus(cardId);
        if (status === MonthlyCardStatus.EXPIRED) {
            return { success: false, message: '月卡已过期' };
        }

        if (status === MonthlyCardStatus.ACTIVE) {
            return { success: false, message: '今日已领取' };
        }

        // 标记已领取
        const today = new Date().toISOString().split('T')[0];
        cardData.todayClaimed = true;
        cardData.lastClaimDate = today;

        // 触发事件
        EventCenter.emit(VIPEventType.MONTHLY_CARD_CLAIMED, { cardId, dailyReward: config.dailyReward });

        return { success: true, dailyReward: config.dailyReward };
    }

    /**
     * 检查月卡过期并重置领取状态
     */
    private _checkMonthlyCardsExpiry(): void {
        const today = new Date().toISOString().split('T')[0];

        for (const cardId in this._data.monthlyCards) {
            const cardData = this._data.monthlyCards[cardId];

            // 检查是否过期
            if (Date.now() > cardData.expireTime) {
                continue;
            }

            // 如果是新的一天，重置领取状态
            if (cardData.lastClaimDate !== today) {
                cardData.todayClaimed = false;
            }
        }
    }

    /**
     * 获取月卡剩余天数
     */
    getMonthlyCardRemainingDays(cardId: string): number {
        const cardData = this._data.monthlyCards[cardId];
        if (!cardData) {
            return 0;
        }

        const remaining = cardData.expireTime - Date.now();
        return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
    }

    // ==================== 成长基金相关 ====================

    /**
     * 是否已购买成长基金
     */
    isGrowthFundPurchased(fundId: string): boolean {
        const fundData = this._data.growthFunds[fundId];
        return fundData ? fundData.purchased : false;
    }

    /**
     * 购买成长基金
     */
    purchaseGrowthFund(fundId: string): { success: boolean; message?: string } {
        const config = getGrowthFundConfig(fundId);
        if (!config) {
            return { success: false, message: '成长基金不存在' };
        }

        const fundData = this._data.growthFunds[fundId];
        if (fundData && fundData.purchased) {
            return { success: false, message: '已购买' };
        }

        // 创建基金数据
        this._data.growthFunds[fundId] = {
            fundId,
            purchased: true,
            claimedLevels: []
        };

        // 增加VIP经验
        this._data.vipExp += config.price;
        this._data.totalRecharge += config.price * 100;

        // 触发事件
        EventCenter.emit(VIPEventType.GROWTH_FUND_PURCHASED, { fundId });

        return { success: true };
    }

    /**
     * 领取成长基金等级奖励
     */
    claimGrowthFundReward(fundId: string, level: number): { success: boolean; gems?: number; message?: string } {
        const config = getGrowthFundConfig(fundId);
        if (!config) {
            return { success: false, message: '成长基金不存在' };
        }

        const fundData = this._data.growthFunds[fundId];
        if (!fundData || !fundData.purchased) {
            return { success: false, message: '未购买成长基金' };
        }

        // 检查等级奖励是否存在
        const levelReward = config.levelRewards.find(r => r.level === level);
        if (!levelReward) {
            return { success: false, message: '奖励不存在' };
        }

        // 检查是否已领取
        if (fundData.claimedLevels.includes(level)) {
            return { success: false, message: '奖励已领取' };
        }

        // 标记已领取
        fundData.claimedLevels.push(level);

        // 触发事件
        EventCenter.emit(VIPEventType.GROWTH_FUND_CLAIMED, { fundId, level, gems: levelReward.gems });

        return { success: true, gems: levelReward.gems };
    }

    /**
     * 获取可领取的成长基金奖励等级
     */
    getClaimableGrowthFundLevels(fundId: string, playerLevel: number): number[] {
        const config = getGrowthFundConfig(fundId);
        if (!config) {
            return [];
        }

        const fundData = this._data.growthFunds[fundId];
        if (!fundData || !fundData.purchased) {
            return [];
        }

        return config.levelRewards
            .filter(r => r.level <= playerLevel && !fundData.claimedLevels.includes(r.level))
            .map(r => r.level);
    }

    // ==================== 序列化 ====================

    /**
     * 序列化数据
     */
    serialize(): string {
        return JSON.stringify(this._data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);
            this._data = { ...this._createDefaultData(), ...parsed };
            this._checkMonthlyCardsExpiry();
        } catch (e) {
            console.error('[VIPManager] 反序列化失败:', e);
            this._data = this._createDefaultData();
        }
    }
}

/** 导出单例 */
export const vipManager = VIPManager.getInstance();