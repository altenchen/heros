/**
 * VIP系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

/**
 * VIP特权类型
 */
export enum VIPPrivilegeType {
    /** 资源产出加成 */
    RESOURCE_BONUS = 'resource_bonus',
    /** 经验加成 */
    EXP_BONUS = 'exp_bonus',
    /** 建造加速 */
    BUILD_SPEEDUP = 'build_speedup',
    /** 额外购买次数 */
    EXTRA_PURCHASE = 'extra_purchase',
    /** 签到额外奖励 */
    SIGNIN_BONUS = 'signin_bonus',
    /** 免费体力 */
    FREE_STAMINA = 'free_stamina',
    /** 免费抽卡 */
    FREE_GACHA = 'free_gacha',
    /** 解锁功能 */
    UNLOCK_FEATURE = 'unlock_feature',
    /** VIP专属商店 */
    VIP_SHOP = 'vip_shop',
    /** 专属皮肤 */
    EXCLUSIVE_SKIN = 'exclusive_skin'
}

/**
 * 充值类型
 */
export enum PaymentType {
    /** 钻石直充 */
    DIAMONDS = 'diamonds',
    /** 月卡 */
    MONTHLY_CARD = 'monthly_card',
    /** 成长基金 */
    GROWTH_FUND = 'growth_fund',
    /** 礼包 */
    GIFT = 'gift'
}

/**
 * 支付状态
 */
export enum PaymentStatus {
    /** 待支付 */
    PENDING = 'pending',
    /** 已完成 */
    COMPLETED = 'completed',
    /** 已取消 */
    CANCELLED = 'cancelled',
    /** 已退款 */
    REFUNDED = 'refunded'
}

/**
 * 月卡状态
 */
export enum MonthlyCardStatus {
    /** 未购买 */
    NOT_PURCHASED = 'not_purchased',
    /** 进行中 */
    ACTIVE = 'active',
    /** 待领取 */
    PENDING_CLAIM = 'pending_claim',
    /** 已过期 */
    EXPIRED = 'expired'
}

/**
 * VIP等级配置
 */
export interface VIPLevelConfig {
    /** 等级 */
    level: number;
    /** 所需经验 */
    requiredExp: number;
    /** 等级名称 */
    name: string;
    /** 特权列表 */
    privileges: {
        type: VIPPrivilegeType;
        value: number;
        description: string;
    }[];
    /** 等级奖励 */
    rewards: {
        type: string;
        itemId?: string;
        amount: number;
    }[];
}

/**
 * 充值产品配置
 */
export interface PaymentProductConfig {
    /** 产品ID */
    productId: string;
    /** 产品名称 */
    name: string;
    /** 钻石数量 */
    gems: number;
    /** 赠送钻石 */
    bonusGems: number;
    /** 价格（元） */
    price: number;
    /** 充值类型 */
    type: PaymentType;
    /** 首充双倍 */
    firstDouble: boolean;
    /** 解锁所需VIP等级 */
    requiredVIP?: number;
    /** 图标 */
    icon: string;
    /** 是否热门 */
    isHot?: boolean;
}

/**
 * 月卡配置
 */
export interface MonthlyCardConfig {
    /** 月卡ID */
    cardId: string;
    /** 名称 */
    name: string;
    /** 价格（元） */
    price: number;
    /** 持续天数 */
    duration: number;
    /** 立即获得 */
    instantReward: {
        type: string;
        itemId?: string;
        amount: number;
    }[];
    /** 每日奖励 */
    dailyReward: {
        type: string;
        itemId?: string;
        amount: number;
    }[];
    /** 图标 */
    icon: string;
}

/**
 * 成长基金配置
 */
export interface GrowthFundConfig {
    /** 基金ID */
    fundId: string;
    /** 名称 */
    name: string;
    /** 价格（元） */
    price: number;
    /** 总返还钻石 */
    totalGems: number;
    /** 等级奖励 */
    levelRewards: {
        level: number;
        gems: number;
    }[];
    /** 图标 */
    icon: string;
}

/**
 * VIP进度数据
 */
export interface VIPProgress {
    /** 当前等级 */
    level: number;
    /** 当前经验 */
    exp: number;
    /** 下一级所需经验 */
    nextLevelExp: number;
    /** 升级进度 */
    progress: number;
}

/**
 * 充值记录
 */
export interface PaymentRecord {
    /** 订单ID */
    orderId: string;
    /** 产品ID */
    productId: string;
    /** 金额 */
    amount: number;
    /** 钻石 */
    gems: number;
    /** 状态 */
    status: PaymentStatus;
    /** 时间戳 */
    timestamp: number;
    /** 是否首充 */
    isFirst: boolean;
}

/**
 * 月卡数据
 */
export interface MonthlyCardData {
    /** 月卡ID */
    cardId: string;
    /** 购买时间 */
    purchaseTime: number;
    /** 过期时间 */
    expireTime: number;
    /** 今日是否已领取 */
    todayClaimed: boolean;
    /** 最后领取日期 */
    lastClaimDate: string;
}

/**
 * 成长基金数据
 */
export interface GrowthFundData {
    /** 基金ID */
    fundId: string;
    /** 是否已购买 */
    purchased: boolean;
    /** 已领取的等级 */
    claimedLevels: number[];
}

/**
 * VIP数据
 */
export interface VIPData {
    /** VIP经验 */
    vipExp: number;
    /** 总充值金额（分） */
    totalRecharge: number;
    /** 首充状态 */
    firstChargeDone: boolean;
    /** 已领取的VIP等级奖励 */
    claimedVIPRewards: number[];
    /** 充值记录 */
    paymentRecords: PaymentRecord[];
    /** 月卡数据 */
    monthlyCards: { [cardId: string]: MonthlyCardData };
    /** 成长基金数据 */
    growthFunds: { [fundId: string]: GrowthFundData };
}

/**
 * VIP事件类型
 */
export enum VIPEventType {
    /** VIP等级变化 */
    VIP_LEVEL_CHANGED = 'vip_level_changed',
    /** 充值成功 */
    PAYMENT_SUCCESS = 'payment_success',
    /** 月卡购买 */
    MONTHLY_CARD_PURCHASED = 'monthly_card_purchased',
    /** 月卡领取 */
    MONTHLY_CARD_CLAIMED = 'monthly_card_claimed',
    /** 成长基金购买 */
    GROWTH_FUND_PURCHASED = 'growth_fund_purchased',
    /** 成长基金领取 */
    GROWTH_FUND_CLAIMED = 'growth_fund_claimed'
}

/**
 * 月卡状态详情（用于UI显示）
 */
export interface MonthlyCardStatusInfo {
    /** 是否已激活 */
    active: boolean;
    /** 剩余天数 */
    remainingDays: number;
    /** 今日是否已领取 */
    claimedToday: boolean;
    /** 月卡ID */
    cardId: string;
}

/**
 * 成长基金状态（用于UI显示）
 */
export interface GrowthFundStatusInfo {
    /** 是否已购买 */
    purchased: boolean;
    /** 已领取的等级 */
    claimedLevels: number[];
    /** 基金ID */
    fundId: string;
}

/**
 * VIP购买项（用于UI显示）
 */
export interface VIPPurchaseItem {
    /** 商品ID */
    id: string;
    /** 商品名称 */
    name: string;
    /** 钻石数量 */
    gems: number;
    /** 价格 */
    price: number;
    /** 是否热门 */
    isHot?: boolean;
    /** 图标 */
    icon?: string;
}