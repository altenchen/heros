/**
 * 排行榜配置数据
 * 遵循阿里巴巴开发者手册规范
 */

import {
    RankType,
    RankPeriod,
    RankConfig,
    RankRewardConfig
} from './RankTypes';

/**
 * 排行榜奖励配置
 */
const rankRewards: RankRewardConfig[] = [
    // 战力排行奖励
    {
        startRank: 1,
        endRank: 1,
        rewards: [
            { type: 'gems', amount: 500 },
            { type: 'gold', amount: 50000 },
            { type: 'item', itemId: 'hero_fragment_epic', amount: 10 }
        ]
    },
    {
        startRank: 2,
        endRank: 3,
        rewards: [
            { type: 'gems', amount: 300 },
            { type: 'gold', amount: 30000 },
            { type: 'item', itemId: 'hero_fragment_epic', amount: 5 }
        ]
    },
    {
        startRank: 4,
        endRank: 10,
        rewards: [
            { type: 'gems', amount: 200 },
            { type: 'gold', amount: 20000 },
            { type: 'item', itemId: 'hero_fragment_rare', amount: 10 }
        ]
    },
    {
        startRank: 11,
        endRank: 50,
        rewards: [
            { type: 'gems', amount: 100 },
            { type: 'gold', amount: 10000 },
            { type: 'item', itemId: 'hero_fragment_rare', amount: 5 }
        ]
    },
    {
        startRank: 51,
        endRank: 100,
        rewards: [
            { type: 'gems', amount: 50 },
            { type: 'gold', amount: 5000 }
        ]
    },
    {
        startRank: 101,
        endRank: 500,
        rewards: [
            { type: 'gems', amount: 30 },
            { type: 'gold', amount: 3000 }
        ]
    }
];

/**
 * 排行榜配置列表
 */
export const rankConfigs: RankConfig[] = [
    // 战力排行 - 周榜
    {
        type: RankType.POWER,
        period: RankPeriod.WEEKLY,
        maxDisplay: 100,
        hasReward: true,
        rewards: rankRewards,
        resetHour: 22 // 每周日22点结算
    },
    // 关卡星数排行 - 周榜
    {
        type: RankType.STARS,
        period: RankPeriod.WEEKLY,
        maxDisplay: 100,
        hasReward: true,
        rewards: rankRewards,
        resetHour: 22
    },
    // PVP竞技排行 - 周榜
    {
        type: RankType.PVP,
        period: RankPeriod.WEEKLY,
        maxDisplay: 100,
        hasReward: true,
        rewards: rankRewards,
        resetHour: 22
    },
    // 公会排行 - 周榜
    {
        type: RankType.GUILD,
        period: RankPeriod.WEEKLY,
        maxDisplay: 50,
        hasReward: true,
        rewards: [
            {
                startRank: 1,
                endRank: 1,
                rewards: [
                    { type: 'gems', amount: 1000 },
                    { type: 'gold', amount: 100000 },
                    { type: 'item', itemId: 'guild_exp', amount: 500 }
                ]
            },
            {
                startRank: 2,
                endRank: 3,
                rewards: [
                    { type: 'gems', amount: 600 },
                    { type: 'gold', amount: 60000 },
                    { type: 'item', itemId: 'guild_exp', amount: 300 }
                ]
            },
            {
                startRank: 4,
                endRank: 10,
                rewards: [
                    { type: 'gems', amount: 400 },
                    { type: 'gold', amount: 40000 },
                    { type: 'item', itemId: 'guild_exp', amount: 200 }
                ]
            },
            {
                startRank: 11,
                endRank: 20,
                rewards: [
                    { type: 'gems', amount: 200 },
                    { type: 'gold', amount: 20000 },
                    { type: 'item', itemId: 'guild_exp', amount: 100 }
                ]
            }
        ],
        resetHour: 22
    },
    // 英雄战力排行 - 周榜
    {
        type: RankType.HERO_POWER,
        period: RankPeriod.WEEKLY,
        maxDisplay: 100,
        hasReward: true,
        rewards: rankRewards,
        resetHour: 22
    }
];

/**
 * 排行榜配置映射
 */
export const RankConfigMap = new Map<RankType, RankConfig>(
    rankConfigs.map(config => [config.type, config])
);

/**
 * 获取排行榜配置
 */
export function getRankConfig(type: RankType, period: RankPeriod = RankPeriod.WEEKLY): RankConfig | undefined {
    return rankConfigs.find(c => c.type === type && c.period === period);
}

/**
 * 获取排行奖励
 */
export function getRankReward(rank: number, type: RankType): RankRewardConfig | undefined {
    const config = getRankConfig(type);
    if (!config || !config.rewards) {
        return undefined;
    }

    return config.rewards.find(r => rank >= r.startRank && rank <= r.endRank);
}

/**
 * 排行榜常量
 */
export const RANK_CONSTANTS = {
    /** 更新间隔（毫秒） */
    UPDATE_INTERVAL: 60000,
    /** 最大缓存条目数 */
    MAX_CACHE_ENTRIES: 500,
    /** 结算提前时间（毫秒） */
    SETTLE_ADVANCE_TIME: 300000,
    /** 排名变化阈值（显示上升/下降） */
    RANK_CHANGE_THRESHOLD: 100
};