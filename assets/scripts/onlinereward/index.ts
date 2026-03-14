/**
 * 在线奖励模块
 * 导出在线奖励系统相关类
 */

export * from './config/OnlineRewardTypes';
export { OnlineRewardManager, onlineRewardManager, OnlineRewardEventType } from './onlinereward/OnlineRewardManager';
export { onlineRewardConfigs, onlineRewardConfigMap, getClaimableRewards, getNextReward } from './config/online_reward.json';