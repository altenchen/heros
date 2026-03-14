/**
 * 每日签到类型定义
 * 遵循阿里巴巴开发者手册规范
 */

/**
 * 签到奖励类型
 */
export enum RewardType {
    /** 金币 */
    GOLD = 'gold',
    /** 钻石 */
    GEMS = 'gems',
    /** 体力 */
    STAMINA = 'stamina',
    /** 经验 */
    EXP = 'exp',
    /** 英雄碎片 */
    HERO_SHARD = 'hero_shard',
    /** 道具 */
    ITEM = 'item',
    /** 兵种 */
    UNIT = 'unit'
}

/**
 * 签到状态
 */
export enum SigninState {
    /** 未签到 */
    NOT_SIGNED = 'not_signed',
    /** 已签到 */
    SIGNED = 'signed',
    /** 可补签 */
    CAN_MAKEUP = 'can_makeup',
    /** 已过期 */
    EXPIRED = 'expired'
}

/**
 * 签到周期类型
 */
export enum SigninCycleType {
    /** 每日签到 */
    DAILY = 'daily',
    /** 周签到 */
    WEEKLY = 'weekly',
    /** 月签到 */
    MONTHLY = 'monthly'
}

/**
 * 奖励配置
 */
export interface RewardConfig {
    /** 奖励类型 */
    type: RewardType;
    /** 数量 */
    amount: number;
    /** 道具ID（当type为ITEM/HERO_SHARD/UNIT时需要） */
    itemId?: string;
    /** 显示图标路径 */
    icon?: string;
}

/**
 * 签到奖励配置
 */
export interface SigninRewardConfig {
    /** 天数（第几天） */
    day: number;
    /** 奖励列表 */
    rewards: RewardConfig[];
    /** 是否为特殊奖励 */
    isSpecial?: boolean;
    /** 特殊描述 */
    description?: string;
    /** VIP等级要求 */
    vipRequired?: number;
}

/**
 * 签到周期配置
 */
export interface SigninCycleConfig {
    /** 周期ID */
    cycleId: string;
    /** 周期名称 */
    name: string;
    /** 周期类型 */
    type: SigninCycleType;
    /** 总天数 */
    totalDays: number;
    /** 开始时间（月签用） */
    startTime?: string;
    /** 结束时间 */
    endTime?: string;
    /** 奖励配置 */
    rewards: SigninRewardConfig[];
    /** 连续签到额外奖励 */
    continuousBonus?: {
        /** 连续天数 */
        days: number;
        /** 奖励 */
        reward: RewardConfig;
    }[];
    /** 补签消耗 */
    makeupCost?: {
        /** 金币消耗 */
        gold?: number;
        /** 钻石消耗 */
        gems?: number;
    };
    /** 补签最大次数 */
    maxMakeupCount?: number;
    /** 是否激活 */
    isActive?: boolean;
}

/**
 * 签到进度
 */
export interface SigninProgress {
    /** 周期ID */
    cycleId: string;
    /** 已签到天数 */
    signedDays: number;
    /** 连续签到天数 */
    continuousDays: number;
    /** 最大连续天数 */
    maxContinuousDays: number;
    /** 今日是否已签到 */
    todaySigned: boolean;
    /** 上次签到时间 */
    lastSignTime: number;
    /** 已领取的奖励天数 */
    claimedDays: number[];
    /** 补签次数 */
    makeupCount: number;
    /** 本周期补签已用次数 */
    makeupUsedCount: number;
}

/**
 * 签到结果
 */
export interface SigninResult {
    /** 是否成功 */
    success: boolean;
    /** 签到天数 */
    day: number;
    /** 获得的奖励 */
    rewards: RewardConfig[];
    /** 连续签到奖励 */
    continuousBonus?: RewardConfig;
    /** 是否为补签 */
    isMakeup?: boolean;
    /** 错误信息 */
    error?: string;
}

/**
 * 签到预览数据
 */
export interface SigninPreview {
    /** 周期信息 */
    cycle: SigninCycleConfig;
    /** 进度信息 */
    progress: SigninProgress;
    /** 今日状态 */
    todayState: SigninState;
    /** 今日奖励 */
    todayReward: SigninRewardConfig;
    /** 可补签天数 */
    makeupDays: number[];
}

/**
 * 签到事件类型
 */
export enum SigninEventType {
    /** 签到成功 */
    SIGNIN_SUCCESS = 'signin_success',
    /** 补签成功 */
    MAKEUP_SUCCESS = 'makeup_success',
    /** 签到周期重置 */
    CYCLE_RESET = 'cycle_reset',
    /** 连续签到奖励 */
    CONTINUOUS_BONUS = 'continuous_bonus'
}

/**
 * 签到事件数据
 */
export interface SigninEventData {
    /** 周期ID */
    cycleId: string;
    /** 签到天数 */
    day?: number;
    /** 奖励 */
    rewards?: RewardConfig[];
    /** 连续奖励 */
    continuousBonus?: RewardConfig;
}

/**
 * 默认签到周期配置
 */
export const DEFAULT_SIGNIN_CONFIG: SigninCycleConfig = {
    cycleId: 'default_monthly',
    name: '月度签到',
    type: SigninCycleType.MONTHLY,
    totalDays: 30,
    rewards: [],
    maxMakeupCount: 3,
    makeupCost: {
        gold: 100,
        gems: 10
    }
};