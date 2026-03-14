/**
 * 活动系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

/**
 * 活动类型
 */
export enum ActivityType {
    /** 限时活动 */
    LIMITED_TIME = 'limited_time',
    /** 节日活动 */
    FESTIVAL = 'festival',
    /** 周期活动 */
    PERIODIC = 'periodic',
    /** 充值活动 */
    RECHARGE = 'recharge',
    /** 消费活动 */
    CONSUME = 'consume',
    /** 累计签到活动 */
    ACCUMULATED_SIGNIN = 'accumulated_signin',
    /** 限时副本 */
    LIMITED_DUNGEON = 'limited_dungeon',
    /** 限时商店 */
    LIMITED_SHOP = 'limited_shop'
}

/**
 * 活动状态
 */
export enum ActivityState {
    /** 未开始 */
    NOT_STARTED = 'not_started',
    /** 进行中 */
    ACTIVE = 'active',
    /** 已结束 */
    ENDED = 'ended',
    /** 已关闭 */
    DISABLED = 'disabled'
}

/**
 * 活动周期类型
 */
export enum ActivityPeriodType {
    /** 每天 */
    DAILY = 'daily',
    /** 每周 */
    WEEKLY = 'weekly',
    /** 每月 */
    MONTHLY = 'monthly',
    /** 一次性 */
    ONE_TIME = 'one_time'
}

/**
 * 任务进度类型
 */
export enum TaskProgressType {
    /** 累计次数 */
    ACCUMULATED = 'accumulated',
    /** 单次达成 */
    SINGLE = 'single',
    /** 连续达成 */
    CONTINUOUS = 'continuous'
}

/**
 * 活动任务条件
 */
export interface ActivityTaskCondition {
    /** 条件类型 */
    type: string;
    /** 目标值 */
    target: number;
    /** 参数 */
    params?: Record<string, any>;
}

/**
 * 活动任务奖励
 */
export interface ActivityTaskReward {
    /** 奖励类型 */
    type: string;
    /** 物品ID */
    itemId?: string;
    /** 数量 */
    amount: number;
}

/**
 * 活动任务配置
 */
export interface ActivityTaskConfig {
    /** 任务ID */
    taskId: string;
    /** 任务名称 */
    name: string;
    /** 任务描述 */
    description: string;
    /** 条件 */
    condition: ActivityTaskCondition;
    /** 奖励 */
    rewards: ActivityTaskReward[];
    /** 排序权重 */
    weight: number;
    /** 进度类型 */
    progressType: TaskProgressType;
}

/**
 * 活动任务进度
 */
export interface ActivityTaskProgress {
    /** 任务ID */
    taskId: string;
    /** 当前进度 */
    current: number;
    /** 目标值 */
    target: number;
    /** 是否已完成 */
    completed: boolean;
    /** 是否已领取奖励 */
    claimed: boolean;
    /** 完成时间 */
    completeTime?: number;
}

/**
 * 活动配置
 */
export interface ActivityConfig {
    /** 活动ID */
    activityId: string;
    /** 活动类型 */
    type: ActivityType;
    /** 活动名称 */
    name: string;
    /** 活动描述 */
    description: string;
    /** 图标 */
    icon: string;
    /** 开始时间 (时间戳) */
    startTime: number;
    /** 结束时间 (时间戳) */
    endTime: number;
    /** 预告时间（开始前多久显示预告）秒 */
    previewTime: number;
    /** 活动任务列表 */
    tasks: ActivityTaskConfig[];
    /** 活动商店商品ID列表 */
    shopItems?: string[];
    /** 最大进度 */
    maxProgress?: number;
    /** 周期类型 */
    periodType?: ActivityPeriodType;
    /** 是否重复 */
    repeatable?: boolean;
    /** 重置时间 */
    resetTime?: string;
    /** 等级限制 */
    levelRequired?: number;
    /** VIP限制 */
    vipRequired?: number;
}

/**
 * 活动进度
 */
export interface ActivityProgress {
    /** 活动ID */
    activityId: string;
    /** 任务进度 */
    taskProgress: Map<string, ActivityTaskProgress>;
    /** 总进度 */
    totalProgress: number;
    /** 参与时间 */
    joinTime: number;
    /** 最后更新时间 */
    updateTime: number;
}

/**
 * 活动事件类型
 */
export enum ActivityEventType {
    /** 活动开始 */
    ACTIVITY_START = 'activity_start',
    /** 活动结束 */
    ACTIVITY_END = 'activity_end',
    /** 活动预告 */
    ACTIVITY_PREVIEW = 'activity_preview',
    /** 任务进度更新 */
    TASK_PROGRESS_UPDATE = 'task_progress_update',
    /** 任务完成 */
    TASK_COMPLETE = 'task_complete',
    /** 奖励领取 */
    REWARD_CLAIMED = 'reward_claimed',
    /** 活动数据更新 */
    ACTIVITY_DATA_UPDATE = 'activity_data_update'
}

/**
 * 活动事件数据
 */
export interface ActivityEventData {
    /** 活动ID */
    activityId?: string;
    /** 活动 */
    activity?: ActivityConfig;
    /** 任务ID */
    taskId?: string;
    /** 任务进度 */
    taskProgress?: ActivityTaskProgress;
    /** 奖励 */
    rewards?: ActivityTaskReward[];
    /** 进度增量 */
    progressIncrement?: number;
}

/**
 * 活动列表结果
 */
export interface ActivityListResult {
    /** 活动列表 */
    activities: ActivityConfig[];
    /** 进行中数量 */
    activeCount: number;
    /** 预告中数量 */
    previewCount: number;
}

/**
 * 活动详情结果
 */
export interface ActivityDetailResult {
    /** 活动 */
    activity: ActivityConfig;
    /** 进度 */
    progress: ActivityProgress;
    /** 状态 */
    state: ActivityState;
}

/**
 * 领取奖励结果
 */
export interface ClaimActivityResult {
    /** 是否成功 */
    success: boolean;
    /** 活动ID */
    activityId: string;
    /** 任务ID */
    taskId: string;
    /** 奖励列表 */
    rewards: ActivityTaskReward[];
    /** 错误信息 */
    error?: string;
}