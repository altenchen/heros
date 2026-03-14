/**
 * 成就与任务配置数据
 * 定义成就、任务、成就链等配置
 * 遵循阿里巴巴开发者手册规范
 */

import {
    AchievementConfig,
    AchievementType,
    AchievementRarity,
    AchievementConditionType,
    AchievementReward,
    TaskConfig,
    TaskType,
    AchievementChainConfig
} from '../scripts/config/AchievementTypes';

// ==================== 任务配置 ====================

/**
 * 每日任务模板
 */
export const DailyTaskTemplates: TaskConfig[] = [
    {
        id: 'daily_login',
        name: '每日登录',
        description: '登录游戏',
        type: TaskType.DAILY,
        conditions: [{ type: AchievementConditionType.LOGIN_DAYS, target: 1 }],
        reward: { gold: 1000, playerExp: 50 },
        autoAccept: true
    },
    {
        id: 'daily_battle',
        name: '每日战斗',
        description: '完成3场战斗',
        type: TaskType.DAILY,
        conditions: [{ type: AchievementConditionType.BATTLES, target: 3 }],
        reward: { gold: 2000, playerExp: 100 },
        autoAccept: true
    },
    {
        id: 'daily_win',
        name: '每日胜利',
        description: '赢得1场战斗',
        type: TaskType.DAILY,
        conditions: [{ type: AchievementConditionType.WIN_BATTLES, target: 1 }],
        reward: { gold: 3000, gems: 10, playerExp: 150 },
        autoAccept: true
    },
    {
        id: 'daily_level',
        name: '关卡挑战',
        description: '挑战2个关卡',
        type: TaskType.DAILY,
        conditions: [{ type: AchievementConditionType.CLEAR_LEVELS, target: 2 }],
        reward: { gold: 2500, playerExp: 120 },
        autoAccept: true
    },
    {
        id: 'daily_summon',
        name: '招募兵种',
        description: '招募任意兵种',
        type: TaskType.DAILY,
        conditions: [{ type: AchievementConditionType.UNITS_RECRUITED, target: 1 }],
        reward: { gold: 1500, playerExp: 80 },
        autoAccept: true
    }
];

/**
 * 每周任务模板
 */
export const WeeklyTaskTemplates: TaskConfig[] = [
    {
        id: 'weekly_login',
        name: '周常登录',
        description: '登录游戏7天',
        type: TaskType.WEEKLY,
        conditions: [{ type: AchievementConditionType.LOGIN_DAYS, target: 7 }],
        reward: { gold: 10000, gems: 50, playerExp: 500 },
        autoAccept: true
    },
    {
        id: 'weekly_battle',
        name: '战斗达人',
        description: '完成20场战斗',
        type: TaskType.WEEKLY,
        conditions: [{ type: AchievementConditionType.BATTLES, target: 20 }],
        reward: { gold: 15000, gems: 80, playerExp: 800 },
        autoAccept: true
    },
    {
        id: 'weekly_win',
        name: '胜利先锋',
        description: '赢得10场战斗',
        type: TaskType.WEEKLY,
        conditions: [{ type: AchievementConditionType.WIN_BATTLES, target: 10 }],
        reward: { gold: 20000, gems: 100, playerExp: 1000 },
        autoAccept: true
    },
    {
        id: 'weekly_level',
        name: '关卡大师',
        description: '通关15个关卡',
        type: TaskType.WEEKLY,
        conditions: [{ type: AchievementConditionType.CLEAR_LEVELS, target: 15 }],
        reward: { gold: 18000, gems: 90, playerExp: 900 },
        autoAccept: true
    }
];

/**
 * 主线任务
 */
export const MainTasks: TaskConfig[] = [
    {
        id: 'main_1',
        name: '初入战场',
        description: '完成第一场战斗',
        type: TaskType.MAIN,
        conditions: [{ type: AchievementConditionType.BATTLES, target: 1 }],
        reward: { gold: 5000, gems: 30, playerExp: 200 },
        autoAccept: true
    },
    {
        id: 'main_2',
        name: '初尝胜利',
        description: '赢得第一场战斗',
        type: TaskType.MAIN,
        conditions: [{ type: AchievementConditionType.WIN_BATTLES, target: 1 }],
        reward: { gold: 8000, gems: 50, playerExp: 300 },
        prerequisite: 'main_1',
        autoAccept: true
    },
    {
        id: 'main_3',
        name: '关卡探索',
        description: '通关第1章第1关',
        type: TaskType.MAIN,
        conditions: [{ type: AchievementConditionType.CLEAR_LEVELS, target: 1 }],
        reward: { gold: 10000, gems: 60, playerExp: 400 },
        prerequisite: 'main_2',
        autoAccept: true
    },
    {
        id: 'main_4',
        name: '英雄之路',
        description: '将任意英雄升至5级',
        type: TaskType.MAIN,
        conditions: [{ type: AchievementConditionType.HERO_LEVEL, target: 5, params: { heroId: 'any' } }],
        reward: { gold: 15000, gems: 80, playerExp: 500 },
        prerequisite: 'main_3',
        autoAccept: true
    },
    {
        id: 'main_5',
        name: '阵营之力',
        description: '组建一支同阵营军队（3个同阵营单位）',
        type: TaskType.MAIN,
        conditions: [{ type: AchievementConditionType.FACTION_UNITS, target: 3 }],
        reward: { gold: 20000, gems: 100, playerExp: 600 },
        prerequisite: 'main_4',
        autoAccept: true
    }
];

/**
 * 所有任务配置映射
 */
export const TaskConfigMap: Map<string, TaskConfig> = new Map([
    ...DailyTaskTemplates.map(task => [task.id, task] as [string, TaskConfig]),
    ...WeeklyTaskTemplates.map(task => [task.id, task] as [string, TaskConfig]),
    ...MainTasks.map(task => [task.id, task] as [string, TaskConfig])
]);

// ==================== 成就配置 ====================

/**
 * 成就配置列表
 */
export const AchievementConfigs: AchievementConfig[] = [
    // 战斗成就
    {
        id: 'ach_battle_1',
        name: '初出茅庐',
        description: '完成第一场战斗',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.COMMON,
        condition: { type: AchievementConditionType.BATTLES, target: 1 },
        reward: { gold: 1000, playerExp: 100 }
    },
    {
        id: 'ach_battle_2',
        name: '身经百战',
        description: '完成100场战斗',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.RARE,
        condition: { type: AchievementConditionType.BATTLES, target: 100 },
        reward: { gold: 50000, gems: 100, playerExp: 5000 }
    },
    {
        id: 'ach_battle_3',
        name: '战场传奇',
        description: '完成1000场战斗',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.EPIC,
        condition: { type: AchievementConditionType.BATTLES, target: 1000 },
        reward: { gold: 200000, gems: 500, playerExp: 20000 }
    },
    // 胜利成就
    {
        id: 'ach_win_1',
        name: '首战告捷',
        description: '赢得第一场战斗',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.COMMON,
        condition: { type: AchievementConditionType.WIN_BATTLES, target: 1 },
        reward: { gold: 2000, playerExp: 150 }
    },
    {
        id: 'ach_win_2',
        name: '常胜将军',
        description: '赢得50场战斗',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.RARE,
        condition: { type: AchievementConditionType.WIN_BATTLES, target: 50 },
        reward: { gold: 30000, gems: 80, playerExp: 3000 }
    },
    {
        id: 'ach_win_3',
        name: '战无不胜',
        description: '赢得500场战斗',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.EPIC,
        condition: { type: AchievementConditionType.WIN_BATTLES, target: 500 },
        reward: { gold: 150000, gems: 300, playerExp: 15000 }
    },
    // 关卡成就
    {
        id: 'ach_level_1',
        name: '关卡探索者',
        description: '通关10个关卡',
        type: AchievementType.CHALLENGE,
        rarity: AchievementRarity.COMMON,
        condition: { type: AchievementConditionType.CLEAR_LEVELS, target: 10 },
        reward: { gold: 5000, gems: 20, playerExp: 500 }
    },
    {
        id: 'ach_level_2',
        name: '关卡征服者',
        description: '通关50个关卡',
        type: AchievementType.CHALLENGE,
        rarity: AchievementRarity.RARE,
        condition: { type: AchievementConditionType.CLEAR_LEVELS, target: 50 },
        reward: { gold: 25000, gems: 100, playerExp: 2500 }
    },
    // 连胜成就
    {
        id: 'ach_streak_1',
        name: '连胜起步',
        description: '达成3连胜',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.UNCOMMON,
        condition: { type: AchievementConditionType.WIN_STREAK, target: 3 },
        reward: { gold: 3000, gems: 15, playerExp: 200 }
    },
    {
        id: 'ach_streak_2',
        name: '连胜达人',
        description: '达成10连胜',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.RARE,
        condition: { type: AchievementConditionType.WIN_STREAK, target: 10 },
        reward: { gold: 15000, gems: 50, playerExp: 1500 }
    },
    {
        id: 'ach_streak_3',
        name: '不可阻挡',
        description: '达成30连胜',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.EPIC,
        condition: { type: AchievementConditionType.WIN_STREAK, target: 30 },
        reward: { gold: 50000, gems: 150, playerExp: 5000 }
    }
];

/**
 * 成就配置映射
 */
export const AchievementConfigMap: Map<string, AchievementConfig> = new Map(
    AchievementConfigs.map(ach => [ach.id, ach] as [string, AchievementConfig])
);

// ==================== 成就链配置 ====================

/**
 * 成就链配置
 */
export const AchievementChains: AchievementChainConfig[] = [
    {
        id: 'chain_battle',
        name: '战斗之路',
        description: '从初出茅庐到战场传奇',
        achievements: ['ach_battle_1', 'ach_battle_2', 'ach_battle_3'],
        finalReward: { gold: 100000, gems: 200, playerExp: 10000 }
    },
    {
        id: 'chain_victory',
        name: '胜利之巅',
        description: '从首战告捷到战无不胜',
        achievements: ['ach_win_1', 'ach_win_2', 'ach_win_3'],
        finalReward: { gold: 80000, gems: 150, playerExp: 8000 }
    }
];

/**
 * 获取任务配置
 */
export function getTaskConfig(taskId: string): TaskConfig | undefined {
    return TaskConfigMap.get(taskId);
}

/**
 * 获取成就配置
 */
export function getAchievementConfig(achievementId: string): AchievementConfig | undefined {
    return AchievementConfigMap.get(achievementId);
}

/**
 * 获取指定类型的任务
 */
export function getTasksByType(type: TaskType): TaskConfig[] {
    return Array.from(TaskConfigMap.values()).filter(task => task.type === type);
}