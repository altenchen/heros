/**
 * 商店系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

/**
 * 商品类型
 */
export enum ShopItemType {
    /** 资源包 */
    RESOURCE = 'resource',
    /** 道具 */
    ITEM = 'item',
    /** 英雄碎片 */
    HERO_SHARD = 'hero_shard',
    /** 兵种 */
    UNIT = 'unit',
    /** 礼包 */
    BUNDLE = 'bundle',
    /** 皮肤 */
    SKIN = 'skin'
}

/**
 * 货币类型
 */
export enum CurrencyType {
    /** 金币 */
    GOLD = 'gold',
    /** 钻石 */
    GEMS = 'gems',
    /** 体力 */
    STAMINA = 'stamina',
    /** 公会币 */
    GUILD_COIN = 'guild_coin',
    /** 竞技币 */
    ARENA_COIN = 'arena_coin',
    /** 活动币 */
    EVENT_COIN = 'event_coin'
}

/**
 * 商店类型
 */
export enum ShopType {
    /** 普通商店 */
    NORMAL = 'normal',
    /** 钻石商店 */
    GEMS = 'gems',
    /** 公会商店 */
    GUILD = 'guild',
    /** 竞技商店 */
    ARENA = 'arena',
    /** 活动商店 */
    EVENT = 'event',
    /** 限时商店 */
    LIMITED = 'limited'
}

/**
 * 商品状态
 */
export enum ShopItemState {
    /** 可购买 */
    AVAILABLE = 'available',
    /** 已售罄 */
    SOLD_OUT = 'sold_out',
    /** 未解锁 */
    LOCKED = 'locked',
    /** 限时已结束 */
    EXPIRED = 'expired'
}

/**
 * 折扣类型
 */
export enum DiscountType {
    /** 无折扣 */
    NONE = 'none',
    /** 百分比折扣 */
    PERCENT = 'percent',
    /** 固定金额折扣 */
    FIXED = 'fixed'
}

/**
 * 商品内容
 */
export interface ShopItemContent {
    /** 内容类型 */
    type: ShopItemType;
    /** 物品ID */
    itemId?: string;
    /** 数量 */
    amount: number;
    /** 显示图标 */
    icon?: string;
}

/**
 * 商品价格
 */
export interface ShopItemPrice {
    /** 货币类型 */
    currency: CurrencyType;
    /** 原价 */
    originalPrice: number;
    /** 现价 */
    currentPrice: number;
    /** 折扣类型 */
    discountType?: DiscountType;
    /** 折扣值 */
    discountValue?: number;
}

/**
 * 商品配置
 */
export interface ShopItemConfig {
    /** 商品ID */
    itemId: string;
    /** 商品名称 */
    name: string;
    /** 商品描述 */
    description?: string;
    /** 商品类型 */
    type: ShopItemType;
    /** 所属商店 */
    shopType: ShopType;
    /** 商品内容 */
    contents: ShopItemContent[];
    /** 价格列表 */
    prices: ShopItemPrice[];
    /** 购买限制 */
    buyLimit?: number;
    /** 每日限制 */
    dailyLimit?: number;
    /** 每周限制 */
    weeklyLimit?: number;
    /** VIP等级要求 */
    vipRequired?: number;
    /** 玩家等级要求 */
    levelRequired?: number;
    /** 是否热门 */
    isHot?: boolean;
    /** 是否新品 */
    isNew?: boolean;
    /** 是否推荐 */
    isRecommended?: boolean;
    /** 排序权重 */
    sortOrder?: number;
    /** 开始时间（限时商品） */
    startTime?: number;
    /** 结束时间（限时商品） */
    endTime?: number;
    /** 图标路径 */
    icon?: string;
}

/**
 * 商品购买记录
 */
export interface ShopPurchaseRecord {
    /** 商品ID */
    itemId: string;
    /** 购买时间 */
    purchaseTime: number;
    /** 购买数量 */
    quantity: number;
    /** 花费 */
    cost: { currency: CurrencyType; amount: number };
}

/**
 * 商品购买结果
 */
export interface ShopPurchaseResult {
    /** 是否成功 */
    success: boolean;
    /** 商品ID */
    itemId?: string;
    /** 购买数量 */
    quantity?: number;
    /** 获得的内容 */
    contents?: ShopItemContent[];
    /** 剩余购买次数 */
    remainingCount?: number;
    /** 错误信息 */
    error?: string;
}

/**
 * 货币兑换配置
 */
export interface CurrencyExchangeConfig {
    /** 兑换ID */
    exchangeId: string;
    /** 源货币 */
    fromCurrency: CurrencyType;
    /** 源数量 */
    fromAmount: number;
    /** 目标货币 */
    toCurrency: CurrencyType;
    /** 目标数量 */
    toAmount: number;
    /** 每日限制 */
    dailyLimit?: number;
    /** 兑换率 */
    rate?: number;
}

/**
 * 商店刷新配置
 */
export interface ShopRefreshConfig {
    /** 商店类型 */
    shopType: ShopType;
    /** 自动刷新时间（小时） */
    autoRefreshHours: number[];
    /** 手动刷新消耗 */
    manualRefreshCost?: {
        currency: CurrencyType;
        amount: number;
    };
    /** 每日手动刷新次数 */
    dailyManualRefreshLimit?: number;
}

/**
 * 商店事件类型
 */
export enum ShopEventType {
    /** 购买成功 */
    PURCHASE_SUCCESS = 'shop_purchase_success',
    /** 商品刷新 */
    SHOP_REFRESH = 'shop_refresh',
    /** 限时商品上架 */
    LIMITED_ITEM_AVAILABLE = 'limited_item_available',
    /** 限时商品下架 */
    LIMITED_ITEM_EXPIRED = 'limited_item_expired'
}

/**
 * 商店事件数据
 */
export interface ShopEventData {
    /** 商店类型 */
    shopType?: ShopType;
    /** 商品ID */
    itemId?: string;
    /** 购买数量 */
    quantity?: number;
    /** 获得内容 */
    contents?: ShopItemContent[];
}

/**
 * 商店进度
 */
export interface ShopProgress {
    /** 商店类型 */
    shopType: ShopType;
    /** 购买记录 */
    purchases: ShopPurchaseRecord[];
    /** 每日购买计数 */
    dailyPurchaseCount: Map<string, number>;
    /** 每周购买计数 */
    weeklyPurchaseCount: Map<string, number>;
    /** 总购买计数 */
    totalPurchaseCount: Map<string, number>;
    /** 上次刷新时间 */
    lastRefreshTime: number;
    /** 手动刷新次数 */
    manualRefreshCount: number;
}

/**
 * 默认商店刷新配置
 */
export const DEFAULT_SHOP_REFRESH: ShopRefreshConfig[] = [
    {
        shopType: ShopType.NORMAL,
        autoRefreshHours: [0, 12],
        manualRefreshCost: { currency: CurrencyType.GEMS, amount: 50 },
        dailyManualRefreshLimit: 3
    },
    {
        shopType: ShopType.GEMS,
        autoRefreshHours: [0],
        dailyManualRefreshLimit: 0
    },
    {
        shopType: ShopType.GUILD,
        autoRefreshHours: [0],
        manualRefreshCost: { currency: CurrencyType.GEMS, amount: 100 },
        dailyManualRefreshLimit: 2
    },
    {
        shopType: ShopType.ARENA,
        autoRefreshHours: [0],
        manualRefreshCost: { currency: CurrencyType.GEMS, amount: 100 },
        dailyManualRefreshLimit: 2
    },
    {
        shopType: ShopType.LIMITED,
        autoRefreshHours: [0, 6, 12, 18],
        dailyManualRefreshLimit: 0
    }
];