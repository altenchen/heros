/**
 * VIP与充值系统类型定义
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
    /** 额外签到奖励 */
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
 * 充值档位类型
 */
export enum PaymentType {
    /** 小额充值 */
    SMALL = 'small',
    /** 中额充值 */
    MEDIUM = 'medium',
    /** 大额充值 */
    LARGE = 'large',
    /** 月卡 */
    MONTHLY_CARD = 'monthly_card',
    /** 成长基金 */
    GROWTH_FUND = 'growth_fund',
    /** 限时礼包 */
    LIMITED_PACK = 'limited_pack'
}

/**
 * 充值状态
 */
export enum PaymentStatus {
    /** 可购买 */
    AVAILABLE = 'available',
    /** 已购买 */
    PURCHASED = 'purchased',
    /** 限时已结束 */
    EXPIRED = 'expired',
    /** VIP等级不足 */
    VIP_REQUIRED = 'vip_required'
}

/**
 * 月卡状态
 */
export enum MonthlyCardStatus {
    /** 未购买 */
    NOT_PURCHASED = 'not_purchased',
    /** 已购买待领取 */
    PENDING_CLAIM = 'pending_claim',
    /** 今日已领取 */
    CLAIMED_TODAY = 'claimed_today',
    /** 已过期 */
    EXPIRED = 'expired'
}

/**
 * VIP特权配置
 */
export interface VIPPrivilegeConfig {
    /** 特权类型 */
    type: VIPPrivilegeType;
    /** 特权名称 */
    name: string;
    /** 特权描述 */
    description: string;
    /** 特权值 */
    value: number;
    /** 参数 */
    params?: Record<string, any>;
}

/**
 * VIP等级配置
 */
export interface VIPLevelConfig {
    /** VIP等级 */
    level: number;
    /** 所需经验 */
    requiredExp: number;
    /** 等级名称 */
    name: string;
    /** 图标 */
    icon: string;
    /** 特权列表 */
    privileges: VIPPrivilegeConfig[];
    /** 等级奖励 */
    levelReward?: {
        gold?: number;
        gems?: number;
        items?: { itemId: string; count: number }[];
    };
}

/**
 * 充值档位配置
 */
export interface PaymentProductConfig {
    /** 产品ID */
    productId: string;
    /** 产品名称 */
    name: string;
    /** 产品描述 */
    description?: string;
    /** 充值类型 */
    type: PaymentType;
    /** 钻石数量 */
    gems: number;
    /** 额外赠送钻石 */
    bonusGems?: number;
    /** 价格（人民币分） */
    price: number;
    /** 是否首充双倍 */
    firstDouble?: boolean;
    /** 首充奖励 */
    firstPurchaseReward?: {
        gold?: number;
        gems?: number;
        items?: { itemId: string; count: number }[];
    };
    /** VIP等级要求 */
    vipRequired?: number;
    /** 是否热门 */
    isHot?: boolean;
    /** 是否推荐 */
    isRecommended?: boolean;
    /** 排序权重 */
    sortOrder?: number;
}

/**
 * 月卡配置
 */
export interface MonthlyCardConfig {
    /** 月卡ID */
    cardId: string;
    /** 月卡名称 */
    name: string;
    /** 月卡描述 */
    description: string;
    /** 价格（人民币分） */
    price: number;
    /** 持续天数 */
    duration: number;
    /** 立即获得 */
    instantReward: {
        gems?: number;
        gold?: number;
        items?: { itemId: string; count: number }[];
    };
    /** 每日领取 */
    dailyReward: {
        gems?: number;
        gold?: number;
        stamina?: number;
        items?: { itemId: string; count: number }[];
    };
    /** VIP经验 */
    vipExp: number;
    /** 图标 */
    icon: string;
}

/**
 * 成长基金配置
 */
export interface GrowthFundConfig {
    /** 基金ID */
    fundId: string;
    /** 基金名称 */
    name: string;
    /** 描述 */
    description: string;
    /** 价格 */
    price: number;
    /** 总返还 */
    totalReturn: number;
    /** 返还倍率 */
    returnRate: number;
    /** 等级奖励 */
    levelRewards: {
        level: number;
        reward: {
            gems?: number;
            gold?: number;
        };
    }[];
}

/**
 * VIP进度
 */
export interface VIPProgress {
    /** 当前VIP等级 */
    level: number;
    /** 当前经验 */
    exp: number;
    /** 总充值金额（分） */
    totalRecharge: number;
    /** 是否已领取等级奖励 */
    claimedLevelRewards: number[];
}

/**
 * 月卡进度
 */
export interface MonthlyCardProgress {
    /** 月卡ID */
    cardId: string;
    /** 购买时间 */
    purchaseTime: number;
    /** 过期时间 */
    expireTime: number;
    /** 上次领取时间 */
    lastClaimTime: number;
    /** 已领取天数 */
    claimedDays: number;
}

/**
 * 成长基金进度
 */
export interface GrowthFundProgress {
    /** 基金ID */
    fundId: string;
    /** 是否已购买 */
    purchased: boolean;
    /** 已领取的等级 */
    claimedLevels: number[];
}

/**
 * 充值记录
 */
export interface PaymentRecord {
    /** 订单ID */
    orderId: string;
    /** 产品ID */
    productId: string;
    /** 充值金额（分） */
    amount: number;
    /** 获得钻石 */
    gems: number;
    /** 充值时间 */
    time: number;
    /** 是否首充 */
    isFirstPurchase: boolean;
}

/**
 * 充值结果
 */
export interface PaymentResult {
    /** 是否成功 */
    success: boolean;
    /** 订单ID */
    orderId?: string;
    /** 获得钻石 */
    gems?: number;
    /** 额外奖励 */
    bonusGems?: number;
    /** 首充奖励 */
    firstPurchaseReward?: any;
    /** VIP经验 */
    vipExp?: number;
    /** 错误信息 */
    error?: string;
}

/**
 * VIP事件类型
 */
export enum VIPEventType {
    /** VIP升级 */
    VIP_LEVEL_UP = 'vip_level_up',
    /** 充值成功 */
    PAYMENT_SUCCESS = 'payment_success',
    /** 月卡购买 */
    MONTHLY_CARD_PURCHASE = 'monthly_card_purchase',
    /** 月卡领取 */
    MONTHLY_CARD_CLAIM = 'monthly_card_claim',
    /** 成长基金购买 */
    GROWTH_FUND_PURCHASE = 'growth_fund_purchase',
    /** 成长基金领取 */
    GROWTH_FUND_CLAIM = 'growth_fund_claim'
}

/**
 * VIP事件数据
 */
export interface VIPEventData {
    /** VIP等级 */
    level?: number;
    /** 订单ID */
    orderId?: string;
    /** 钻石 */
    gems?: number;
    /** 月卡ID */
    cardId?: string;
    /** 基金ID */
    fundId?: string;
}

/**
 * 默认VIP设置
 */
export const DEFAULT_VIP_SETTINGS = {
    maxVIPLevel: 15,
    expPerYuan: 10, // 每充值1元获得10点VIP经验
    monthlyCardDuration: 30
};