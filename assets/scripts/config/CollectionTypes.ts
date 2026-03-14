/**
 * 图鉴系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

// ==================== 枚举定义 ====================

/** 图鉴类型 */
export enum CollectionType {
    /** 英雄图鉴 */
    HERO = 'hero',
    /** 兵种图鉴 */
    UNIT = 'unit',
    /** 物品图鉴 */
    ITEM = 'item',
    /** 技能图鉴 */
    SKILL = 'skill',
    /** 成就图鉴 */
    ACHIEVEMENT = 'achievement'
}

/** 收集状态 */
export enum CollectionState {
    /** 未解锁 */
    LOCKED = 'locked',
    /** 已解锁（未收集） */
    UNLOCKED = 'unlocked',
    /** 已收集 */
    COLLECTED = 'collected',
    /** 已满级 */
    MAX_LEVEL = 'max_level'
}

/** 图鉴奖励状态 */
export enum CollectionRewardState {
    /** 未达成 */
    NOT_REACHED = 'not_reached',
    /** 可领取 */
    CLAIMABLE = 'claimable',
    /** 已领取 */
    CLAIMED = 'claimed'
}

// ==================== 接口定义 ====================

/** 图鉴条目配置 */
export interface CollectionEntryConfig {
    /** 条目ID */
    entryId: string;
    /** 图鉴类型 */
    type: CollectionType;
    /** 关联ID（英雄ID/兵种ID/物品ID） */
    targetId: string;
    /** 名称 */
    name: string;
    /** 描述 */
    description: string;
    /** 稀有度 */
    rarity: string;
    /** 解锁条件 */
    unlockCondition?: CollectionCondition;
    /** 碎片需求 */
    shardRequired: number;
    /** 奖励 */
    rewards: CollectionReward[];
    /** 图标 */
    icon: string;
    /** 背景图 */
    bgImage: string;
    /** 排序 */
    order: number;
}

/** 收集条件 */
export interface CollectionCondition {
    /** 条件类型 */
    type: 'level' | 'battle' | 'own' | 'achievement';
    /** 目标ID */
    targetId?: string;
    /** 所需数量 */
    value: number;
}

/** 收集奖励 */
export interface CollectionReward {
    /** 奖励类型 */
    type: string;
    /** 物品ID */
    itemId: string;
    /** 数量 */
    amount: number;
}

/** 图鉴条目数据 */
export interface CollectionEntryData {
    /** 条目ID */
    entryId: string;
    /** 状态 */
    state: CollectionState;
    /** 碎片数量 */
    shards: number;
    /** 解锁时间 */
    unlockTime?: number;
    /** 收集时间 */
    collectTime?: number;
}

/** 图鉴进度奖励配置 */
export interface CollectionProgressReward {
    /** 奖励ID */
    rewardId: string;
    /** 图鉴类型 */
    type: CollectionType;
    /** 所需收集数量 */
    requiredCount: number;
    /** 奖励内容 */
    rewards: CollectionReward[];
}

/** 图鉴进度奖励数据 */
export interface CollectionProgressRewardData {
    /** 奖励ID */
    rewardId: string;
    /** 状态 */
    state: CollectionRewardState;
    /** 领取时间 */
    claimTime?: number;
}

/** 玩家图鉴数据 */
export interface PlayerCollectionData {
    /** 各类型条目数据 */
    entries: Map<string, CollectionEntryData>;
    /** 进度奖励数据 */
    progressRewards: Map<string, CollectionProgressRewardData>;
    /** 总收集数 */
    totalCollected: number;
    /** 各类型收集数 */
    typeCollected: Map<CollectionType, number>;
    /** 最后更新时间 */
    lastUpdateTime: number;
}

/** 图鉴统计 */
export interface CollectionStats {
    /** 总条目数 */
    total: number;
    /** 已收集数 */
    collected: number;
    /** 已解锁数 */
    unlocked: number;
    /** 完成率 */
    completionRate: number;
    /** 各稀有度统计 */
    rarityStats: Map<string, { total: number; collected: number }>;
}

/** 图鉴事件类型 */
export enum CollectionEventType {
    /** 条目解锁 */
    ENTRY_UNLOCKED = 'collection_entry_unlocked',
    /** 条目收集 */
    ENTRY_COLLECTED = 'collection_collected',
    /** 进度达成 */
    PROGRESS_REACHED = 'collection_progress_reached',
    /** 奖励领取 */
    REWARD_CLAIMED = 'collection_reward_claimed'
}

/** 图鉴事件数据 */
export interface CollectionEventData {
    /** 事件类型 */
    type: CollectionEventType;
    /** 条目ID */
    entryId?: string;
    /** 图鉴类型 */
    collectionType?: CollectionType;
    /** 收集数量 */
    count?: number;
    /** 奖励ID */
    rewardId?: string;
}

// ==================== 默认值 ====================

/** 默认图鉴设置 */
export const DEFAULT_COLLECTION_SETTINGS = {
    autoUnlock: true,
    showNotification: true,
    sortType: 'rarity' as 'rarity' | 'time' | 'name'
};