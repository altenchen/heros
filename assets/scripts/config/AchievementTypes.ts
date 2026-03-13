/**
 * 成就与任务系统类型定义
 */

// ==================== 成就系统 ====================

/** 成就类型 */
export enum AchievementType {
    BATTLE = 'battle',           // 战斗相关
    COLLECTION = 'collection',   // 收集相关
    PROGRESS = 'progress',       // 进度相关
    SOCIAL = 'social',           // 社交相关
    SPECIAL = 'special'          // 特殊成就
}

/** 成就条件类型 */
export enum AchievementConditionType {
    WIN_BATTLES = 'win_battles',             // 赢得战斗次数
    DEFEAT_ENEMIES = 'defeat_enemies',       // 击败敌人数量
    RECRUIT_UNITS = 'recruit_units',         // 招募单位数量
    UPGRADE_BUILDINGS = 'upgrade_buildings', // 升级建筑次数
    COLLECT_GOLD = 'collect_gold',           // 收集金币总量
    COLLECT_HEROES = 'collect_heroes',       // 收集英雄数量
    WIN_WITH_RACE = 'win_with_race',         // 使用特定种族获胜
    REACH_LEVEL = 'reach_level',             // 达到等级
    COMPLETE_TASKS = 'complete_tasks',       // 完成任务数
    WIN_STREAK = 'win_streak',               // 连胜次数
    USE_SKILL = 'use_skill',                 // 使用技能次数
    SUMMON_UNITS = 'summon_units',           // 召唤单位次数
    PLAY_DAYS = 'play_days'                  // 累计游戏天数
}

/** 成就稀有度 */
export enum AchievementRarity {
    COMMON = 'common',       // 普通
    RARE = 'rare',           // 稀有
    EPIC = 'epic',           // 史诗
    LEGENDARY = 'legendary'  // 传说
}

/** 成就条件 */
export interface AchievementCondition {
    type: AchievementConditionType;
    target: number;
    current?: number;
    params?: Record<string, any>;
}

/** 成就奖励 */
export interface AchievementReward {
    gold?: number;
    gems?: number;
    heroExp?: number;
    items?: Array<{ id: string; count: number }>;
    unlockHero?: string;
    unlockUnit?: string;
}

/** 成就配置 */
export interface AchievementConfig {
    id: string;
    name: string;
    description: string;
    type: AchievementType;
    rarity: AchievementRarity;
    icon?: string;
    conditions: AchievementCondition[];
    reward: AchievementReward;
    hidden?: boolean;       // 是否隐藏（未达成前不显示详情）
    chain?: string;         // 成就链ID
    chainOrder?: number;    // 成就链顺序
}

/** 成就进度 */
export interface AchievementProgress {
    achievementId: string;
    conditions: AchievementCondition[];
    completed: boolean;
    claimed: boolean;
    completedAt?: number;
}

// ==================== 任务系统 ====================

/** 任务类型 */
export enum TaskType {
    DAILY = 'daily',     // 每日任务
    WEEKLY = 'weekly',   // 每周任务
    MAIN = 'main',       // 主线任务
    SIDE = 'side'        // 支线任务
}

/** 任务状态 */
export enum TaskStatus {
    LOCKED = 'locked',       // 未解锁
    AVAILABLE = 'available', // 可接取
    IN_PROGRESS = 'in_progress', // 进行中
    COMPLETED = 'completed', // 已完成
    CLAIMED = 'claimed'      // 已领取奖励
}

/** 任务条件 */
export interface TaskCondition {
    type: AchievementConditionType;
    target: number;
    current?: number;
    params?: Record<string, any>;
}

/** 任务奖励 */
export interface TaskReward {
    gold?: number;
    gems?: number;
    heroExp?: number;
    playerExp?: number;
    items?: Array<{ id: string; count: number }>;
}

/** 任务配置 */
export interface TaskConfig {
    id: string;
    name: string;
    description: string;
    type: TaskType;
    icon?: string;
    conditions: TaskCondition[];
    reward: TaskReward;
    prerequisite?: string;   // 前置任务ID
    unlockLevel?: number;    // 解锁等级
    refreshable?: boolean;   // 是否可刷新（每日/每周任务）
    autoAccept?: boolean;    // 是否自动接取
}

/** 任务进度 */
export interface TaskProgress {
    taskId: string;
    conditions: TaskCondition[];
    status: TaskStatus;
    acceptedAt?: number;
    completedAt?: number;
    claimedAt?: number;
}

// ==================== 成就链 ====================

/** 成就链配置 */
export interface AchievementChainConfig {
    id: string;
    name: string;
    description: string;
    achievements: string[];  // 成就ID列表（按顺序）
    finalReward?: AchievementReward;  // 完成整条链的奖励
}

// ==================== 事件类型 ====================

/** 成就事件 */
export interface AchievementEvent {
    type: AchievementConditionType;
    value: number;
    params?: Record<string, any>;
}

/** 任务事件 */
export interface TaskEvent {
    type: AchievementConditionType;
    value: number;
    params?: Record<string, any>;
}