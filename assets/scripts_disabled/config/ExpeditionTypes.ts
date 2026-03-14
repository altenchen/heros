/**
 * 远征类型定义
 * 定义远征系统的数据结构和枚举
 */

/** 远征状态 */
export enum ExpeditionState {
    LOCKED = 'locked',           // 未解锁
    AVAILABLE = 'available',     // 可开始
    IN_PROGRESS = 'in_progress', // 进行中
    COMPLETED = 'completed',     // 已完成
    CLAIMED = 'claimed'          // 已领取奖励
}

/** 远征难度 */
export enum ExpeditionDifficulty {
    EASY = 'easy',
    NORMAL = 'normal',
    HARD = 'hard',
    HELL = 'hell'
}

/** 远征奖励类型 */
export enum ExpeditionRewardType {
    GOLD = 'gold',
    GEMS = 'gems',
    EXP = 'exp',
    ITEMS = 'items',
    HERO_SHARDS = 'hero_shards',
    UNIT_SHARDS = 'unit_shards'
}

/** 远征事件类型 */
export enum ExpeditionEventType {
    EXPEDITION_START = 'expedition_start',
    EXPEDITION_COMPLETE = 'expedition_complete',
    EXPEDITION_CLAIM = 'expedition_claim',
    EXPEDITION_SPEED_UP = 'expedition_speed_up',
    HERO_ASSIGNED = 'hero_assigned',
    HERO_RECALLED = 'hero_recalled'
}

/** 远征奖励配置 */
export interface ExpeditionReward {
    type: ExpeditionRewardType;
    itemId?: string;
    amount: number;
    probability?: number; // 掉落概率 0-1
}

/** 远征配置 */
export interface ExpeditionConfig {
    id: string;
    name: string;
    description: string;
    difficulty: ExpeditionDifficulty;
    duration: number;           // 持续时间（秒）
    requiredPower: number;      // 需要战力
    requiredLevel: number;      // 需要玩家等级
    heroSlots: number;          // 英雄槽位数量
    rewards: ExpeditionReward[];
    bonusRewards?: ExpeditionReward[]; // 额外奖励（概率触发）
    icon?: string;
    unlockCondition?: string;   // 解锁条件
}

/** 远征英雄数据 */
export interface ExpeditionHero {
    heroId: string;
    assignedTime: number;
}

/** 远征实例数据 */
export interface ExpeditionData {
    expeditionId: string;
    state: ExpeditionState;
    heroes: ExpeditionHero[];
    startTime: number;
    endTime: number;
    progress: number;           // 0-100
    starRating: number;         // 星级评价 1-3
}

/** 远征列表数据 */
export interface ExpeditionListData {
    expeditions: ExpeditionData[];
    refreshTime: number;        // 下次刷新时间
    dailyCompletions: number;   // 今日完成次数
    maxDailyCompletions: number; // 每日最大完成次数
}

/** 远征详情数据 */
export interface ExpeditionDetail {
    config: ExpeditionConfig;
    data: ExpeditionData;
    canStart: boolean;
    canSpeedUp: boolean;
    remainingTime: number;
    totalPower: number;
    recommendedPower: number;
}

/** 远征开始结果 */
export interface ExpeditionStartResult {
    success: boolean;
    error?: string;
    data?: ExpeditionData;
}

/** 远征完成结果 */
export interface ExpeditionCompleteResult {
    success: boolean;
    rewards: ExpeditionReward[];
    starRating: number;
    bonusRewards?: ExpeditionReward[];
}