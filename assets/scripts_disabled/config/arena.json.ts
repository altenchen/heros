/**
 * 竞技场配置数据
 * 遵循阿里巴巴开发者手册规范
 */

import {
    ArenaTier,
    ArenaTierConfig,
    ArenaTierReward,
    ArenaSeasonData,
    MatchConfig,
    MatchType
} from './ArenaTypes';

// ==================== 段位配置 ====================

/** 段位配置列表 */
export const arenaTierConfigs: ArenaTierConfig[] = [
    {
        tier: ArenaTier.BRONZE,
        name: '青铜',
        minScore: 0,
        maxScore: 999,
        icon: 'arena_bronze',
        frame: 'frame_bronze',
        stars: 3,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 1000 },
            { type: 'resource', itemId: 'gems', amount: 50 }
        ]
    },
    {
        tier: ArenaTier.SILVER,
        name: '白银',
        minScore: 1000,
        maxScore: 1499,
        icon: 'arena_silver',
        frame: 'frame_silver',
        stars: 4,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 2000 },
            { type: 'resource', itemId: 'gems', amount: 100 }
        ]
    },
    {
        tier: ArenaTier.GOLD,
        name: '黄金',
        minScore: 1500,
        maxScore: 1999,
        icon: 'arena_gold',
        frame: 'frame_gold',
        stars: 4,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 3000 },
            { type: 'resource', itemId: 'gems', amount: 150 },
            { type: 'item', itemId: 'hero_shard_random', amount: 5 }
        ]
    },
    {
        tier: ArenaTier.PLATINUM,
        name: '铂金',
        minScore: 2000,
        maxScore: 2499,
        icon: 'arena_platinum',
        frame: 'frame_platinum',
        stars: 5,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 5000 },
            { type: 'resource', itemId: 'gems', amount: 200 },
            { type: 'item', itemId: 'hero_shard_random', amount: 10 }
        ]
    },
    {
        tier: ArenaTier.DIAMOND,
        name: '钻石',
        minScore: 2500,
        maxScore: 2999,
        icon: 'arena_diamond',
        frame: 'frame_diamond',
        stars: 5,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 8000 },
            { type: 'resource', itemId: 'gems', amount: 300 },
            { type: 'item', itemId: 'hero_shard_epic', amount: 5 },
            { type: 'skin', itemId: 'skin_avatar_frame_diamond', amount: 1 }
        ]
    },
    {
        tier: ArenaTier.MASTER,
        name: '大师',
        minScore: 3000,
        maxScore: 3499,
        icon: 'arena_master',
        frame: 'frame_master',
        stars: 5,
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 12000 },
            { type: 'resource', itemId: 'gems', amount: 500 },
            { type: 'item', itemId: 'hero_shard_epic', amount: 10 },
            { type: 'skin', itemId: 'skin_avatar_frame_master', amount: 1 }
        ]
    },
    {
        tier: ArenaTier.KING,
        name: '王者',
        minScore: 3500,
        maxScore: 99999,
        icon: 'arena_king',
        frame: 'frame_king',
        stars: 0, // 王者不显示星级
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 20000 },
            { type: 'resource', itemId: 'gems', amount: 1000 },
            { type: 'hero', itemId: 'hero_legendary_random', amount: 1 },
            { type: 'skin', itemId: 'skin_avatar_frame_king', amount: 1 }
        ]
    }
];

// ==================== 匹配配置 ====================

/** 匹配配置列表 */
export const matchConfigs: MatchConfig[] = [
    {
        type: MatchType.QUICK,
        scoreRange: 500,
        timeout: 30,
        dailyFreeCount: 5,
        buyCost: {
            type: 'gems',
            amount: 30
        }
    },
    {
        type: MatchType.RANKED,
        scoreRange: 200,
        timeout: 60,
        dailyFreeCount: 10,
        buyCost: {
            type: 'gems',
            amount: 50
        }
    },
    {
        type: MatchType.FRIEND,
        scoreRange: 0, // 好友对战不限积分
        timeout: 120,
        dailyFreeCount: 999, // 无限制
        buyCost: {
            type: 'gems',
            amount: 0
        }
    }
];

// ==================== 赛季配置 ====================

/** 当前赛季 */
export const currentSeason: ArenaSeasonData = {
    seasonId: 'season_1',
    seasonName: '第一赛季',
    startTime: Date.now(),
    endTime: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30天
    status: 'active',
    rewards: [
        {
            rankStart: 1,
            rankEnd: 1,
            rewards: [
                { type: 'resource', itemId: 'gems', amount: 5000 },
                { type: 'hero', itemId: 'hero_legendary_random', amount: 1 },
                { type: 'skin', itemId: 'skin_hero_random', amount: 1 }
            ]
        },
        {
            rankStart: 2,
            rankEnd: 10,
            rewards: [
                { type: 'resource', itemId: 'gems', amount: 3000 },
                { type: 'hero', itemId: 'hero_epic_random', amount: 1 }
            ]
        },
        {
            rankStart: 11,
            rankEnd: 100,
            rewards: [
                { type: 'resource', itemId: 'gems', amount: 1500 },
                { type: 'item', itemId: 'hero_shard_epic', amount: 20 }
            ]
        },
        {
            rankStart: 101,
            rankEnd: 500,
            rewards: [
                { type: 'resource', itemId: 'gems', amount: 800 },
                { type: 'item', itemId: 'hero_shard_rare', amount: 30 }
            ]
        },
        {
            rankStart: 501,
            rankEnd: 9999,
            rewards: [
                { type: 'resource', itemId: 'gems', amount: 300 },
                { type: 'item', itemId: 'hero_shard_rare', amount: 10 }
            ]
        }
    ]
};

// ==================== 辅助函数 ====================

/**
 * 根据积分获取段位配置
 */
export function getTierByScore(score: number): ArenaTierConfig {
    for (let i = arenaTierConfigs.length - 1; i >= 0; i--) {
        const config = arenaTierConfigs[i];
        if (score >= config.minScore) {
            return config;
        }
    }
    return arenaTierConfigs[0];
}

/**
 * 根据段位获取配置
 */
export function getTierConfig(tier: ArenaTier): ArenaTierConfig | undefined {
    return arenaTierConfigs.find(c => c.tier === tier);
}

/**
 * 获取匹配配置
 */
export function getMatchConfig(type: MatchType): MatchConfig | undefined {
    return matchConfigs.find(c => c.type === type);
}

/**
 * 计算下一个段位
 */
export function getNextTier(tier: ArenaTier): ArenaTier | null {
    const tiers = Object.values(ArenaTier);
    const index = tiers.indexOf(tier);
    if (index >= 0 && index < tiers.length - 1) {
        return tiers[index + 1];
    }
    return null;
}

/**
 * 计算上一个段位
 */
export function getPrevTier(tier: ArenaTier): ArenaTier | null {
    const tiers = Object.values(ArenaTier);
    const index = tiers.indexOf(tier);
    if (index > 0) {
        return tiers[index - 1];
    }
    return null;
}

/**
 * 计算升星所需积分
 */
export function getScoreForNextStar(tier: ArenaTier, currentStars: number): number {
    const config = getTierConfig(tier);
    if (!config || config.stars === 0) return 0;

    const scoreRange = config.maxScore - config.minScore;
    const scorePerStar = Math.floor(scoreRange / config.stars);
    return config.minScore + (currentStars + 1) * scorePerStar;
}