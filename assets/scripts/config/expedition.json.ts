/**
 * 远征配置数据
 */

import { ExpeditionConfig, ExpeditionDifficulty, ExpeditionRewardType } from './ExpeditionTypes';

/** 远征配置列表 */
export const expeditionConfigs: ExpeditionConfig[] = [
    {
        id: 'expedition_001',
        name: '水晶矿洞',
        description: '探索神秘的水晶矿洞，寻找珍贵的矿石资源。',
        difficulty: ExpeditionDifficulty.EASY,
        duration: 1800, // 30分钟
        requiredPower: 1000,
        requiredLevel: 1,
        heroSlots: 1,
        rewards: [
            { type: ExpeditionRewardType.GOLD, amount: 1000 },
            { type: ExpeditionRewardType.EXP, amount: 100 },
            { type: ExpeditionRewardType.ITEMS, itemId: 'item_crystal', amount: 5, probability: 0.8 }
        ],
        bonusRewards: [
            { type: ExpeditionRewardType.GEMS, amount: 10, probability: 0.1 }
        ],
        icon: 'expedition_crystal_mine'
    },
    {
        id: 'expedition_002',
        name: '迷失森林',
        description: '深入迷失森林，收集木材和草药。',
        difficulty: ExpeditionDifficulty.EASY,
        duration: 2400, // 40分钟
        requiredPower: 1500,
        requiredLevel: 3,
        heroSlots: 1,
        rewards: [
            { type: ExpeditionRewardType.GOLD, amount: 1500 },
            { type: ExpeditionRewardType.EXP, amount: 150 },
            { type: ExpeditionRewardType.ITEMS, itemId: 'item_wood', amount: 20, probability: 1.0 }
        ],
        bonusRewards: [
            { type: ExpeditionRewardType.ITEMS, itemId: 'item_herb', amount: 10, probability: 0.3 }
        ],
        icon: 'expedition_forest'
    },
    {
        id: 'expedition_003',
        name: '龙之巢穴',
        description: '勇闯龙之巢穴，挑战强大的龙族守卫。',
        difficulty: ExpeditionDifficulty.NORMAL,
        duration: 3600, // 1小时
        requiredPower: 5000,
        requiredLevel: 10,
        heroSlots: 2,
        rewards: [
            { type: ExpeditionRewardType.GOLD, amount: 5000 },
            { type: ExpeditionRewardType.EXP, amount: 500 },
            { type: ExpeditionRewardType.HERO_SHARDS, itemId: 'hero_shard_dragon', amount: 1, probability: 0.5 }
        ],
        bonusRewards: [
            { type: ExpeditionRewardType.GEMS, amount: 50, probability: 0.2 },
            { type: ExpeditionRewardType.ITEMS, itemId: 'item_dragon_scale', amount: 3, probability: 0.3 }
        ],
        icon: 'expedition_dragon_lair'
    },
    {
        id: 'expedition_004',
        name: '古代遗迹',
        description: '探索古代遗迹，发掘失落的宝藏。',
        difficulty: ExpeditionDifficulty.NORMAL,
        duration: 5400, // 1.5小时
        requiredPower: 8000,
        requiredLevel: 15,
        heroSlots: 2,
        rewards: [
            { type: ExpeditionRewardType.GOLD, amount: 8000 },
            { type: ExpeditionRewardType.EXP, amount: 800 },
            { type: ExpeditionRewardType.GEMS, amount: 30 }
        ],
        bonusRewards: [
            { type: ExpeditionRewardType.HERO_SHARDS, itemId: 'hero_shard_ancient', amount: 2, probability: 0.15 }
        ],
        icon: 'expedition_ruins'
    },
    {
        id: 'expedition_005',
        name: '恶魔深渊',
        description: '挑战恶魔深渊，面对无尽的黑暗军团。',
        difficulty: ExpeditionDifficulty.HARD,
        duration: 7200, // 2小时
        requiredPower: 15000,
        requiredLevel: 25,
        heroSlots: 3,
        rewards: [
            { type: ExpeditionRewardType.GOLD, amount: 15000 },
            { type: ExpeditionRewardType.EXP, amount: 1500 },
            { type: ExpeditionRewardType.GEMS, amount: 80 },
            { type: ExpeditionRewardType.ITEMS, itemId: 'item_demon_heart', amount: 5, probability: 0.6 }
        ],
        bonusRewards: [
            { type: ExpeditionRewardType.HERO_SHARDS, itemId: 'hero_shard_demon', amount: 3, probability: 0.1 }
        ],
        icon: 'expedition_demon_abyss'
    },
    {
        id: 'expedition_006',
        name: '天界之门',
        description: '踏入天界之门，接受神圣的试炼。',
        difficulty: ExpeditionDifficulty.HARD,
        duration: 9000, // 2.5小时
        requiredPower: 25000,
        requiredLevel: 35,
        heroSlots: 3,
        rewards: [
            { type: ExpeditionRewardType.GOLD, amount: 25000 },
            { type: ExpeditionRewardType.EXP, amount: 2500 },
            { type: ExpeditionRewardType.GEMS, amount: 120 },
            { type: ExpeditionRewardType.ITEMS, itemId: 'item_holy_crystal', amount: 5, probability: 0.5 }
        ],
        bonusRewards: [
            { type: ExpeditionRewardType.HERO_SHARDS, itemId: 'hero_shard_archangel', amount: 2, probability: 0.1 }
        ],
        icon: 'expedition_heaven_gate'
    },
    {
        id: 'expedition_007',
        name: '深渊魔域',
        description: '勇闯深渊魔域，挑战最强大的魔王。',
        difficulty: ExpeditionDifficulty.HELL,
        duration: 14400, // 4小时
        requiredPower: 50000,
        requiredLevel: 50,
        heroSlots: 5,
        rewards: [
            { type: ExpeditionRewardType.GOLD, amount: 50000 },
            { type: ExpeditionRewardType.EXP, amount: 5000 },
            { type: ExpeditionRewardType.GEMS, amount: 200 },
            { type: ExpeditionRewardType.HERO_SHARDS, itemId: 'hero_shard_demon_lord', amount: 3, probability: 0.4 }
        ],
        bonusRewards: [
            { type: ExpeditionRewardType.UNIT_SHARDS, itemId: 'unit_shard_black_dragon', amount: 5, probability: 0.05 },
            { type: ExpeditionRewardType.ITEMS, itemId: 'item_legendary_chest', amount: 1, probability: 0.1 }
        ],
        icon: 'expedition_abyss'
    },
    {
        id: 'expedition_008',
        name: '混沌时空',
        description: '穿越混沌时空，挑战超越极限的敌人。',
        difficulty: ExpeditionDifficulty.HELL,
        duration: 18000, // 5小时
        requiredPower: 100000,
        requiredLevel: 60,
        heroSlots: 5,
        rewards: [
            { type: ExpeditionRewardType.GOLD, amount: 100000 },
            { type: ExpeditionRewardType.EXP, amount: 10000 },
            { type: ExpeditionRewardType.GEMS, amount: 300 },
            { type: ExpeditionRewardType.HERO_SHARDS, itemId: 'hero_shard_chaos', amount: 5, probability: 0.3 }
        ],
        bonusRewards: [
            { type: ExpeditionRewardType.ITEMS, itemId: 'item_mythic_chest', amount: 1, probability: 0.05 }
        ],
        icon: 'expedition_chaos'
    }
];

/** 远征配置映射 */
export const expeditionConfigMap: Map<string, ExpeditionConfig> = new Map(
    expeditionConfigs.map(config => [config.id, config])
);

/** 获取指定难度的远征列表 */
export function getExpeditionsByDifficulty(difficulty: ExpeditionDifficulty): ExpeditionConfig[] {
    return expeditionConfigs.filter(config => config.difficulty === difficulty);
}

/** 获取解锁的远征列表 */
export function getUnlockedExpeditions(playerLevel: number): ExpeditionConfig[] {
    return expeditionConfigs.filter(config => config.requiredLevel <= playerLevel);
}