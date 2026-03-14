/**
 * 图鉴系统配置数据
 * 遵循阿里巴巴开发者手册规范
 */

import {
    CollectionType,
    CollectionState,
    CollectionEntryConfig,
    CollectionProgressReward
} from './CollectionTypes';
import { Race } from './GameTypes';

// ==================== 英雄图鉴条目 ====================

/** 英雄图鉴条目 */
export const heroCollectionEntries: CollectionEntryConfig[] = [
    // 圣堂英雄
    {
        entryId: 'collection_hero_castle_1',
        type: CollectionType.HERO,
        targetId: 'hero_castle_knight',
        name: '圣堂骑士',
        description: '圣堂阵营的骑士英雄，擅长防御和支援',
        rarity: 'rare',
        shardRequired: 30,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 5000 },
            { type: 'resource', itemId: 'gems', amount: 100 }
        ],
        icon: 'icon_hero_castle_knight',
        bgImage: 'bg_collection_hero',
        order: 1
    },
    {
        entryId: 'collection_hero_castle_2',
        type: CollectionType.HERO,
        targetId: 'hero_castle_cleric',
        name: '圣堂牧师',
        description: '圣堂阵营的牧师英雄，精通治疗魔法',
        rarity: 'rare',
        shardRequired: 30,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 5000 },
            { type: 'resource', itemId: 'gems', amount: 100 }
        ],
        icon: 'icon_hero_castle_cleric',
        bgImage: 'bg_collection_hero',
        order: 2
    },
    // 壁垒英雄
    {
        entryId: 'collection_hero_rampart_1',
        type: CollectionType.HERO,
        targetId: 'hero_rampart_ranger',
        name: '壁垒巡逻兵',
        description: '壁垒阵营的巡逻兵英雄，精通远程攻击',
        rarity: 'rare',
        shardRequired: 30,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 5000 },
            { type: 'resource', itemId: 'gems', amount: 100 }
        ],
        icon: 'icon_hero_rampart_ranger',
        bgImage: 'bg_collection_hero',
        order: 3
    },
    {
        entryId: 'collection_hero_rampart_2',
        type: CollectionType.HERO,
        targetId: 'hero_rampart_druid',
        name: '壁垒德鲁伊',
        description: '壁垒阵营的德鲁伊英雄，精通自然魔法',
        rarity: 'epic',
        shardRequired: 50,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 10000 },
            { type: 'resource', itemId: 'gems', amount: 200 }
        ],
        icon: 'icon_hero_rampart_druid',
        bgImage: 'bg_collection_hero',
        order: 4
    },
    // 墓园英雄
    {
        entryId: 'collection_hero_necropolis_1',
        type: CollectionType.HERO,
        targetId: 'hero_necropolis_necromancer',
        name: '墓园亡灵巫师',
        description: '墓园阵营的亡灵巫师，精通死灵魔法',
        rarity: 'epic',
        shardRequired: 50,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 10000 },
            { type: 'resource', itemId: 'gems', amount: 200 }
        ],
        icon: 'icon_hero_necropolis_necromancer',
        bgImage: 'bg_collection_hero',
        order: 5
    },
    // 传说英雄
    {
        entryId: 'collection_hero_legendary_1',
        type: CollectionType.HERO,
        targetId: 'hero_legendary_catherine',
        name: '凯瑟琳女王',
        description: '传说中的光明女王，拥有无与伦比的统帅力',
        rarity: 'legendary',
        unlockCondition: {
            type: 'achievement',
            targetId: 'achievement_castle_master',
            value: 1
        },
        shardRequired: 100,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 50000 },
            { type: 'resource', itemId: 'gems', amount: 1000 },
            { type: 'skin', itemId: 'skin_hero_catherine', amount: 1 }
        ],
        icon: 'icon_hero_catherine',
        bgImage: 'bg_collection_hero_legendary',
        order: 100
    }
];

// ==================== 兵种图鉴条目 ====================

/** 兵种图鉴条目 */
export const unitCollectionEntries: CollectionEntryConfig[] = [
    // 圣堂兵种
    {
        entryId: 'collection_unit_castle_1',
        type: CollectionType.UNIT,
        targetId: 'unit_castle_pikeman',
        name: '枪兵',
        description: '圣堂阵营的基础步兵，手持长枪的忠诚卫士',
        rarity: 'common',
        shardRequired: 20,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 1000 }
        ],
        icon: 'icon_unit_pikeman',
        bgImage: 'bg_collection_unit',
        order: 1
    },
    {
        entryId: 'collection_unit_castle_2',
        type: CollectionType.UNIT,
        targetId: 'unit_castle_archer',
        name: '弓箭手',
        description: '圣堂阵营的远程单位，精准的箭术令人胆寒',
        rarity: 'common',
        shardRequired: 20,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 1000 }
        ],
        icon: 'icon_unit_archer',
        bgImage: 'bg_collection_unit',
        order: 2
    },
    {
        entryId: 'collection_unit_castle_7',
        type: CollectionType.UNIT,
        targetId: 'unit_castle_angel',
        name: '天使',
        description: '圣堂阵营的顶级单位，神圣的天使降临战场',
        rarity: 'legendary',
        shardRequired: 80,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 30000 },
            { type: 'resource', itemId: 'gems', amount: 500 }
        ],
        icon: 'icon_unit_angel',
        bgImage: 'bg_collection_unit_legendary',
        order: 7
    }
];

// ==================== 物品图鉴条目 ====================

/** 物品图鉴条目 */
export const itemCollectionEntries: CollectionEntryConfig[] = [
    {
        entryId: 'collection_item_potion_hp',
        type: CollectionType.ITEM,
        targetId: 'item_potion_hp',
        name: '生命药水',
        description: '恢复部队生命值的神奇药水',
        rarity: 'common',
        shardRequired: 10,
        rewards: [
            { type: 'item', itemId: 'item_potion_hp', amount: 5 }
        ],
        icon: 'icon_item_potion_hp',
        bgImage: 'bg_collection_item',
        order: 1
    },
    {
        entryId: 'collection_item_potion_mp',
        type: CollectionType.ITEM,
        targetId: 'item_potion_mp',
        name: '魔法药水',
        description: '恢复英雄魔法值的珍贵药水',
        rarity: 'rare',
        shardRequired: 15,
        rewards: [
            { type: 'item', itemId: 'item_potion_mp', amount: 3 }
        ],
        icon: 'icon_item_potion_mp',
        bgImage: 'bg_collection_item',
        order: 2
    }
];

// ==================== 进度奖励配置 ====================

/** 进度奖励配置 */
export const collectionProgressRewards: CollectionProgressReward[] = [
    // 英雄图鉴进度奖励
    {
        rewardId: 'progress_hero_5',
        type: CollectionType.HERO,
        requiredCount: 5,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 10000 },
            { type: 'resource', itemId: 'gems', amount: 200 }
        ]
    },
    {
        rewardId: 'progress_hero_10',
        type: CollectionType.HERO,
        requiredCount: 10,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 30000 },
            { type: 'resource', itemId: 'gems', amount: 500 },
            { type: 'item', itemId: 'hero_shard_epic', amount: 10 }
        ]
    },
    {
        rewardId: 'progress_hero_20',
        type: CollectionType.HERO,
        requiredCount: 20,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 100000 },
            { type: 'resource', itemId: 'gems', amount: 1500 },
            { type: 'hero', itemId: 'hero_epic_random', amount: 1 }
        ]
    },
    // 兵种图鉴进度奖励
    {
        rewardId: 'progress_unit_10',
        type: CollectionType.UNIT,
        requiredCount: 10,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 5000 },
            { type: 'resource', itemId: 'gems', amount: 100 }
        ]
    },
    {
        rewardId: 'progress_unit_30',
        type: CollectionType.UNIT,
        requiredCount: 30,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 20000 },
            { type: 'resource', itemId: 'gems', amount: 300 }
        ]
    },
    // 总收集进度奖励
    {
        rewardId: 'progress_total_50',
        type: CollectionType.HERO, // 用HERO表示总进度
        requiredCount: 50,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 50000 },
            { type: 'resource', itemId: 'gems', amount: 800 },
            { type: 'skin', itemId: 'skin_avatar_frame_collector', amount: 1 }
        ]
    }
];

// ==================== 所有图鉴条目 ====================

/** 所有图鉴条目 */
export const allCollectionEntries: CollectionEntryConfig[] = [
    ...heroCollectionEntries,
    ...unitCollectionEntries,
    ...itemCollectionEntries
];

// ==================== 辅助函数 ====================

/**
 * 获取图鉴条目配置
 */
export function getCollectionEntry(entryId: string): CollectionEntryConfig | undefined {
    return allCollectionEntries.find(e => e.entryId === entryId);
}

/**
 * 获取指定类型的图鉴条目
 */
export function getEntriesByType(type: CollectionType): CollectionEntryConfig[] {
    return allCollectionEntries.filter(e => e.type === type);
}

/**
 * 获取指定稀有度的图鉴条目
 */
export function getEntriesByRarity(rarity: string): CollectionEntryConfig[] {
    return allCollectionEntries.filter(e => e.rarity === rarity);
}

/**
 * 通过目标ID获取图鉴条目
 */
export function getEntryByTargetId(targetId: string): CollectionEntryConfig | undefined {
    return allCollectionEntries.find(e => e.targetId === targetId);
}

/**
 * 获取进度奖励配置
 */
export function getProgressReward(rewardId: string): CollectionProgressReward | undefined {
    return collectionProgressRewards.find(r => r.rewardId === rewardId);
}

/**
 * 获取指定类型的进度奖励
 */
export function getProgressRewardsByType(type: CollectionType): CollectionProgressReward[] {
    return collectionProgressRewards.filter(r => r.type === type);
}

/**
 * 获取稀有度颜色
 */
export function getRarityColorHex(rarity: string): string {
    switch (rarity) {
        case 'common': return '#FFFFFF';
        case 'rare': return '#4A90D9';
        case 'epic': return '#A335EE';
        case 'legendary': return '#FF8000';
        default: return '#FFFFFF';
    }
}