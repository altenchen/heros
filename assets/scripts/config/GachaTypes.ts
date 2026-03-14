/**
 * 招募系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

// ==================== 枚举定义 ====================

/** 招募池类型 */
export enum GachaPoolType {
    /** 英雄招募池 */
    HERO = 'hero',
    /** 兵种招募池 */
    UNIT = 'unit',
    /** 道具招募池 */
    ITEM = 'item',
    /** 限定池 */
    LIMITED = 'limited',
    /** 新手池 */
    BEGINNER = 'beginner'
}

/** 稀有度 */
export enum Rarity {
    /** 普通 */
    COMMON = 'common',
    /** 稀有 */
    RARE = 'rare',
    /** 史诗 */
    EPIC = 'epic',
    /** 传说 */
    LEGENDARY = 'legendary'
}

/** 抽卡结果类型 */
export enum GachaResultType {
    /** 英雄碎片 */
    HERO_SHARD = 'hero_shard',
    /** 英雄 */
    HERO = 'hero',
    /** 兵种碎片 */
    UNIT_SHARD = 'unit_shard',
    /** 兵种 */
    UNIT = 'unit',
    /** 道具 */
    ITEM = 'item',
    /** 资源 */
    RESOURCE = 'resource'
}

// ==================== 接口定义 ====================

/** 招募池配置 */
export interface GachaPoolConfig {
    /** 池ID */
    poolId: string;
    /** 池名称 */
    name: string;
    /** 池类型 */
    type: GachaPoolType;
    /** 描述 */
    description: string;
    /** 开始时间 */
    startTime: number;
    /** 结束时间 */
    endTime: number;
    /** 是否开启 */
    enabled: boolean;
    /** 单抽消耗 */
    singleCost: GachaCost;
    /** 十连消耗 */
    tenCost: GachaCost;
    /** 保底配置 */
    pity: GachaPityConfig;
    /** 保底阈值（别名，与 pity.hardPity 一致） */
    pityThreshold?: number;
    /** 奖品池 */
    items: GachaPoolItem[];
    /** UP物品 */
    upItems?: string[];
    /** 背景图 */
    bgImage: string;
    /** Banner图 */
    bannerImage: string;
}

/** 抽卡消耗 */
export interface GachaCost {
    /** 货币类型 */
    currency: string;
    /** 数量 */
    amount: number;
    /** 折扣（十连） */
    discount?: number;
}

/** 保底配置 */
export interface GachaPityConfig {
    /** 软保底（概率提升）起始次数 */
    softPity: number;
    /** 硬保底（必出）次数 */
    hardPity: number;
    /** 保底稀有度 */
    pityRarity: Rarity;
    /** 保底计数器是否独立 */
    independentCounter: boolean;
}

/** 招募池物品 */
export interface GachaPoolItem {
    /** 物品ID */
    itemId: string;
    /** 结果类型 */
    resultType: GachaResultType;
    /** 稀有度 */
    rarity: Rarity;
    /** 基础概率 */
    baseRate: number;
    /** 是否UP */
    isUp?: boolean;
    /** 数量范围 */
    amountRange: [number, number];
    /** 权重（用于保底计算） */
    weight: number;
}

/** 单次抽卡结果 */
export interface GachaResult {
    /** 结果ID */
    resultId: string;
    /** 物品ID */
    itemId: string;
    /** 结果类型 */
    resultType: GachaResultType;
    /** 稀有度 */
    rarity: Rarity;
    /** 数量 */
    amount: number;
    /** 是否UP */
    isUp: boolean;
    /** 是否保底 */
    isPity: boolean;
}

/** 抽卡响应 */
export interface GachaResponse {
    /** 是否成功 */
    success: boolean;
    /** 抽卡结果 */
    results: GachaResult[];
    /** 当前保底计数 */
    pityCount: number;
    /** 是否触发保底 */
    pityTriggered: boolean;
    /** 消耗资源 */
    cost: {
        currency: string;
        amount: number;
    };
    /** 错误信息 */
    error?: string;
}

/** 抽卡记录 */
export interface GachaRecord {
    /** 记录ID */
    recordId: string;
    /** 池ID */
    poolId: string;
    /** 抽卡时间 */
    gachaTime: number;
    /** 抽卡次数 */
    count: number;
    /** 结果 */
    results: GachaResult[];
    /** 消耗 */
    cost: {
        currency: string;
        amount: number;
    };
}

/** 玩家招募数据 */
export interface PlayerGachaData {
    /** 各池保底计数 */
    pityCounters: Map<string, number>;
    /** 总抽卡次数 */
    totalPulls: number;
    /** 今日抽卡次数 */
    dailyPulls: number;
    /** 上次重置日期 */
    lastResetDate: string;
    /** 抽卡记录 */
    records: GachaRecord[];
    /** 保底历史（用于分析） */
    pityHistory: {
        poolId: string;
        pityCount: number;
        result: GachaResult;
        time: number;
    }[];
}

/** 概率配置 */
export interface RateConfig {
    /** 稀有度 */
    rarity: Rarity;
    /** 基础概率 */
    baseRate: number;
    /** 保底加成 */
    pityBonus: number;
}

/** 招募事件类型 */
export enum GachaEventType {
    /** 单抽 */
    SINGLE_PULL = 'gacha_single_pull',
    /** 十连 */
    TEN_PULL = 'gacha_ten_pull',
    /** 获得稀有物品 */
    GET_RARE = 'gacha_get_rare',
    /** 触发保底 */
    PITY_TRIGGERED = 'gacha_pity_triggered',
    /** 池开启 */
    POOL_OPEN = 'gacha_pool_open',
    /** 池关闭 */
    POOL_CLOSE = 'gacha_pool_close'
}

/** 招募事件数据 */
export interface GachaEventData {
    /** 事件类型 */
    type: GachaEventType;
    /** 池ID */
    poolId?: string;
    /** 抽卡结果 */
    results?: GachaResult[];
    /** 稀有度 */
    rarity?: Rarity;
    /** 保底次数 */
    pityCount?: number;
}

// ==================== 默认值 ====================

/** 默认稀有度概率 */
export const DEFAULT_RARITY_RATES: RateConfig[] = [
    { rarity: Rarity.COMMON, baseRate: 0.60, pityBonus: 0 },
    { rarity: Rarity.RARE, baseRate: 0.30, pityBonus: 0.05 },
    { rarity: Rarity.EPIC, baseRate: 0.08, pityBonus: 0.10 },
    { rarity: Rarity.LEGENDARY, baseRate: 0.02, pityBonus: 0.15 }
];