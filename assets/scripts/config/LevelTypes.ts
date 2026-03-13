/**
 * 关卡系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

// ==================== 枚举定义 ====================

/**
 * 关卡类型
 */
export enum LevelType {
    /** 主线关卡 */
    MAIN = 'main',
    /** 精英关卡 */
    ELITE = 'elite',
/** 副本关卡 */
    DUNGEON = 'dungeon',
    /** 活动关卡 */
    EVENT = 'event',
    /** 挑战关卡 */
    CHALLENGE = 'challenge'
}

/**
 * 关卡难度
 */
export enum LevelDifficulty {
    /** 简单 */
    EASY = 'easy',
    /** 普通 */
    NORMAL = 'normal',
    /** 困难 */
    HARD = 'hard',
    /** 噩梦 */
    NIGHTMARE = 'nightmare',
    /** 地狱 */
    HELL = 'hell'
}

/**
 * 关卡状态
 */
export enum LevelStatus {
    /** 未解锁 */
    LOCKED = 'locked',
    /** 可挑战 */
    AVAILABLE = 'available',
    /** 已通关 */
    CLEARED = 'cleared',
    /** 完美通关（三星） */
    PERFECT = 'perfect'
}

/**
 * 星级评价
 */
export enum StarRating {
    /** 无星 */
    NONE = 0,
    /** 一星 */
    ONE = 1,
    /** 二星 */
    TWO = 2,
    /** 三星 */
    THREE = 3
}

// ==================== 接口定义 ====================

/**
 * 关卡敌人配置
 */
export interface LevelEnemy {
    /** 敌人单位ID */
    unitId: string;
    /** 数量 */
    count: number;
    /** 位置（六边形坐标） */
    position: { q: number; r: number };
}

/**
 * 关卡英雄配置
 */
export interface LevelHero {
    /** 英雄ID */
    heroId: string;
    /** 等级 */
    level: number;
}

/**
 * 关卡奖励配置
 */
export interface LevelReward {
    /** 首次通关奖励 */
    firstClear?: LevelRewardItems;
    /** 通关奖励 */
    normal?: LevelRewardItems;
    /** 三星奖励 */
    threeStar?: LevelRewardItems;
}

/**
 * 奖励物品
 */
export interface LevelRewardItems {
    /** 金币 */
    gold?: number;
    /** 钻石 */
    gems?: number;
    /** 经验 */
    experience?: number;
    /** 物品列表 */
    items?: Array<{ id: string; count: number }>;
    /** 英雄碎片 */
    heroFragments?: Array<{ heroId: string; count: number }>;
}

/**
 * 星级条件
 */
export interface StarCondition {
    /** 条件类型 */
    type: StarConditionType;
    /** 目标值 */
    target: number;
}

/**
 * 星级条件类型
 */
export enum StarConditionType {
    /** 回合数限制 */
    TURN_LIMIT = 'turn_limit',
    /** 无阵亡 */
    NO_DEATH = 'no_death',
    /** 血量百分比 */
    HP_PERCENT = 'hp_percent',
    /** 使用技能次数 */
    SKILL_USE = 'skill_use',
    /** 连胜 */
    WIN_STREAK = 'win_streak'
}

/**
 * 关卡配置
 */
export interface LevelConfig {
    /** 关卡ID */
    id: string;
    /** 关卡名称 */
    name: string;
    /** 关卡描述 */
    description: string;
    /** 关卡类型 */
    type: LevelType;
    /** 难度 */
    difficulty: LevelDifficulty;
    /** 所属章节ID */
    chapterId: string;
    /** 关卡序号 */
    order: number;
    /** 推荐等级 */
    recommendedLevel: number;
    /** 体力消耗 */
    staminaCost: number;
    /** 每日挑战次数限制（0为无限） */
    dailyLimit: number;
    /** 敌人配置 */
    enemies: LevelEnemy[];
    /** 敌方英雄 */
    enemyHero?: LevelHero;
    /** 奖励配置 */
    rewards: LevelReward;
    /** 星级条件 */
    starConditions: StarCondition[];
    /** 前置关卡ID */
    prerequisite?: string;
    /** 解锁等级 */
    unlockLevel?: number;
    /** 战场背景 */
    battlefield?: string;
}

/**
 * 章节配置
 */
export interface ChapterConfig {
    /** 章节ID */
    id: string;
    /** 章节名称 */
    name: string;
    /** 章节描述 */
    description: string;
    /** 章节序号 */
    order: number;
    /** 章节图标 */
    icon?: string;
    /** 章节背景 */
    background?: string;
    /** 关卡ID列表 */
    levels: string[];
    /** 解锁条件：通关前置章节 */
    prerequisite?: string;
    /** 解锁等级 */
    unlockLevel?: number;
    /** 章节奖励（通关所有关卡） */
    completionReward?: LevelRewardItems;
}

/**
 * 关卡进度
 */
export interface LevelProgress {
    /** 关卡ID */
    levelId: string;
    /** 关卡状态 */
    status: LevelStatus;
    /** 星级 */
    stars: StarRating;
    /** 最佳通关回合数 */
    bestTurns?: number;
    /** 挑战次数 */
    challengeCount: number;
    /** 今日挑战次数 */
    dailyChallengeCount: number;
    /** 首次通关时间 */
    firstClearTime?: number;
    /** 最近挑战时间 */
    lastChallengeTime?: number;
}

/**
 * 章节进度
 */
export interface ChapterProgress {
    /** 章节ID */
    chapterId: string;
    /** 已解锁 */
    unlocked: boolean;
    /** 关卡进度 */
    levelProgress: Map<string, LevelProgress>;
    /** 已领取章节奖励 */
    rewardClaimed: boolean;
}

/**
 * 关卡挑战结果
 */
export interface LevelChallengeResult {
    /** 是否胜利 */
    victory: boolean;
    /** 获得星级 */
    stars: StarRating;
    /** 通关回合数 */
    turns: number;
    /** 获得奖励 */
    rewards: LevelRewardItems;
    /** 是否首次通关 */
    firstClear: boolean;
    /** 战斗统计 */
    statistics: {
        /** 总伤害 */
        totalDamage: number;
        /** 总治疗 */
        totalHeal: number;
        /** 使用技能次数 */
        skillCount: number;
        /** 阵亡单位数 */
        deathCount: number;
    };
}