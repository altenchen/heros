/**
 * 在线奖励类型定义
 * 定义在线奖励系统的数据结构
 */

/** 在线奖励事件类型 */
export enum OnlineRewardEventType {
    REWARD_CLAIMED = 'online_reward_claimed',
    REWARD_AVAILABLE = 'online_reward_available',
    ONLINE_TIME_UPDATED = 'online_time_updated',
    DAILY_RESET = 'online_reward_daily_reset'
}

/** 在线奖励配置 */
export interface OnlineRewardConfig {
    id: string;
    requiredMinutes: number;    // 需要在线分钟数
    rewards: OnlineRewardItem[];
    vipBonus?: number;          // VIP额外奖励倍率
    icon?: string;
}

/** 在线奖励物品 */
export interface OnlineRewardItem {
    type: 'gold' | 'gems' | 'exp' | 'item' | 'hero_shard';
    itemId?: string;
    amount: number;
}

/** 在线奖励状态 */
export interface OnlineRewardState {
    claimedRewardIds: string[]; // 已领取的奖励ID
    todayOnlineMinutes: number; // 今日在线分钟数
    lastClaimTime: number;      // 上次领取时间
    lastResetDate: string;      // 上次重置日期
}

/** 在线奖励预览 */
export interface OnlineRewardPreview {
    config: OnlineRewardConfig;
    claimed: boolean;
    available: boolean;
    progress: number;           // 0-100
    remainingMinutes: number;
}

/** 在线奖励数据 */
export interface OnlineRewardData {
    todayMinutes: number;
    totalClaimed: number;
    availableCount: number;
    nextRewardIn: number;       // 下一个奖励需要的分钟数
}

/** 在线奖励领取结果 */
export interface OnlineRewardClaimResult {
    success: boolean;
    error?: string;
    rewards?: OnlineRewardItem[];
    rewardId?: string;
}