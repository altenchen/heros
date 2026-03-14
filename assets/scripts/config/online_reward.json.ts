/**
 * 在线奖励配置数据
 */

import { OnlineRewardConfig } from './OnlineRewardTypes';

/** 在线奖励配置列表 */
export const onlineRewardConfigs: OnlineRewardConfig[] = [
    {
        id: 'online_reward_5min',
        requiredMinutes: 5,
        rewards: [
            { type: 'gold', amount: 500 },
            { type: 'exp', amount: 50 }
        ],
        vipBonus: 0.1,
        icon: 'icon_gold'
    },
    {
        id: 'online_reward_15min',
        requiredMinutes: 15,
        rewards: [
            { type: 'gold', amount: 1000 },
            { type: 'exp', amount: 100 },
            { type: 'item', itemId: 'item_potion_hp', amount: 3 }
        ],
        vipBonus: 0.1,
        icon: 'icon_chest_bronze'
    },
    {
        id: 'online_reward_30min',
        requiredMinutes: 30,
        rewards: [
            { type: 'gold', amount: 2000 },
            { type: 'gems', amount: 20 },
            { type: 'exp', amount: 200 }
        ],
        vipBonus: 0.15,
        icon: 'icon_chest_silver'
    },
    {
        id: 'online_reward_60min',
        requiredMinutes: 60,
        rewards: [
            { type: 'gold', amount: 5000 },
            { type: 'gems', amount: 50 },
            { type: 'exp', amount: 500 },
            { type: 'item', itemId: 'item_speedup_30min', amount: 1 }
        ],
        vipBonus: 0.2,
        icon: 'icon_chest_gold'
    },
    {
        id: 'online_reward_90min',
        requiredMinutes: 90,
        rewards: [
            { type: 'gold', amount: 8000 },
            { type: 'gems', amount: 80 },
            { type: 'exp', amount: 800 },
            { type: 'hero_shard', itemId: 'hero_shard_common', amount: 5 }
        ],
        vipBonus: 0.2,
        icon: 'icon_chest_platinum'
    },
    {
        id: 'online_reward_120min',
        requiredMinutes: 120,
        rewards: [
            { type: 'gold', amount: 12000 },
            { type: 'gems', amount: 120 },
            { type: 'exp', amount: 1200 },
            { type: 'item', itemId: 'item_random_shard', amount: 3 }
        ],
        vipBonus: 0.25,
        icon: 'icon_chest_diamond'
    },
    {
        id: 'online_reward_180min',
        requiredMinutes: 180,
        rewards: [
            { type: 'gold', amount: 20000 },
            { type: 'gems', amount: 200 },
            { type: 'exp', amount: 2000 },
            { type: 'hero_shard', itemId: 'hero_shard_rare', amount: 3 }
        ],
        vipBonus: 0.3,
        icon: 'icon_chest_legendary'
    },
    {
        id: 'online_reward_240min',
        requiredMinutes: 240,
        rewards: [
            { type: 'gold', amount: 30000 },
            { type: 'gems', amount: 300 },
            { type: 'exp', amount: 3000 },
            { type: 'item', itemId: 'item_epic_chest', amount: 1 }
        ],
        vipBonus: 0.3,
        icon: 'icon_chest_mythic'
    }
];

/** 在线奖励配置映射 */
export const onlineRewardConfigMap: Map<string, OnlineRewardConfig> = new Map(
    onlineRewardConfigs.map(config => [config.id, config])
);

/** 获取可领取的在线奖励列表 */
export function getClaimableRewards(onlineMinutes: number, claimedIds: string[]): OnlineRewardConfig[] {
    return onlineRewardConfigs.filter(config =>
        config.requiredMinutes <= onlineMinutes && !claimedIds.includes(config.id)
    );
}

/** 获取下一个在线奖励 */
export function getNextReward(onlineMinutes: number): OnlineRewardConfig | null {
    const sorted = [...onlineRewardConfigs].sort((a, b) => a.requiredMinutes - b.requiredMinutes);
    return sorted.find(config => config.requiredMinutes > onlineMinutes) || null;
}