/**
 * 成就配置数据
 * 定义所有成就、成就链和任务
 */

import {
    AchievementConfig,
    AchievementType,
    AchievementRarity,
    AchievementConditionType,
    AchievementChainConfig,
    TaskConfig,
    TaskType
} from './AchievementTypes';

// ==================== 成就配置 ====================

/** 战斗成就 */
export const BattleAchievements: AchievementConfig[] = [
    // 初级战斗成就
    {
        id: 'battle_novice',
        name: '战斗新手',
        description: '赢得10场战斗',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.WIN_BATTLES, target: 10 }],
        reward: { gold: 500 }
    },
    {
        id: 'battle_veteran',
        name: '战斗老兵',
        description: '赢得100场战斗',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.RARE,
        conditions: [{ type: AchievementConditionType.WIN_BATTLES, target: 100 }],
        reward: { gold: 2000, gems: 50 },
        chain: 'battle_master',
        chainOrder: 2
    },
    {
        id: 'battle_master',
        name: '战斗大师',
        description: '赢得500场战斗',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.EPIC,
        conditions: [{ type: AchievementConditionType.WIN_BATTLES, target: 500 }],
        reward: { gold: 10000, gems: 200 },
        chain: 'battle_master',
        chainOrder: 3
    },
    {
        id: 'battle_legend',
        name: '战场传说',
        description: '赢得1000场战斗',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.LEGENDARY,
        conditions: [{ type: AchievementConditionType.WIN_BATTLES, target: 1000 }],
        reward: { gold: 50000, gems: 500, unlockHero: 'catherine' },
        chain: 'battle_master',
        chainOrder: 4
    },

    // 连胜成就
    {
        id: 'winning_streak_5',
        name: '小试牛刀',
        description: '获得5连胜',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.WIN_STREAK, target: 5 }],
        reward: { gold: 300 }
    },
    {
        id: 'winning_streak_10',
        name: '势如破竹',
        description: '获得10连胜',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.RARE,
        conditions: [{ type: AchievementConditionType.WIN_STREAK, target: 10 }],
        reward: { gold: 1000, gems: 30 }
    },
    {
        id: 'winning_streak_20',
        name: '所向披靡',
        description: '获得20连胜',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.EPIC,
        conditions: [{ type: AchievementConditionType.WIN_STREAK, target: 20 }],
        reward: { gold: 5000, gems: 100 }
    },

    // 击杀成就
    {
        id: 'slayer_100',
        name: '初露锋芒',
        description: '击败100名敌人',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.DEFEAT_ENEMIES, target: 100 }],
        reward: { gold: 200 }
    },
    {
        id: 'slayer_1000',
        name: '战无不胜',
        description: '击败1000名敌人',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.RARE,
        conditions: [{ type: AchievementConditionType.DEFEAT_ENEMIES, target: 1000 }],
        reward: { gold: 1000, gems: 50 }
    },
    {
        id: 'slayer_10000',
        name: '万人敌',
        description: '击败10000名敌人',
        type: AchievementType.BATTLE,
        rarity: AchievementRarity.EPIC,
        conditions: [{ type: AchievementConditionType.DEFEAT_ENEMIES, target: 10000 }],
        reward: { gold: 5000, gems: 200 }
    }
];

/** 收集成就 */
export const CollectionAchievements: AchievementConfig[] = [
    // 英雄收集
    {
        id: 'hero_collector_3',
        name: '英雄初聚',
        description: '拥有3名英雄',
        type: AchievementType.COLLECTION,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.COLLECT_HEROES, target: 3 }],
        reward: { gold: 500 }
    },
    {
        id: 'hero_collector_5',
        name: '英雄云集',
        description: '拥有5名英雄',
        type: AchievementType.COLLECTION,
        rarity: AchievementRarity.RARE,
        conditions: [{ type: AchievementConditionType.COLLECT_HEROES, target: 5 }],
        reward: { gold: 2000, gems: 100 }
    },
    {
        id: 'hero_collector_10',
        name: '英雄殿堂',
        description: '拥有10名英雄',
        type: AchievementType.COLLECTION,
        rarity: AchievementRarity.EPIC,
        conditions: [{ type: AchievementConditionType.COLLECT_HEROES, target: 10 }],
        reward: { gold: 10000, gems: 300 }
    },
    {
        id: 'hero_collector_all',
        name: '英雄传说',
        description: '收集全部20名英雄',
        type: AchievementType.COLLECTION,
        rarity: AchievementRarity.LEGENDARY,
        conditions: [{ type: AchievementConditionType.COLLECT_HEROES, target: 20 }],
        reward: { gold: 50000, gems: 1000 }
    },

    // 金币收集
    {
        id: 'gold_10000',
        name: '小有积蓄',
        description: '累计获得10000金币',
        type: AchievementType.COLLECTION,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.COLLECT_GOLD, target: 10000 }],
        reward: { gems: 20 }
    },
    {
        id: 'gold_100000',
        name: '富甲一方',
        description: '累计获得100000金币',
        type: AchievementType.COLLECTION,
        rarity: AchievementRarity.RARE,
        conditions: [{ type: AchievementConditionType.COLLECT_GOLD, target: 100000 }],
        reward: { gems: 50 }
    },
    {
        id: 'gold_1000000',
        name: '点石成金',
        description: '累计获得1000000金币',
        type: AchievementType.COLLECTION,
        rarity: AchievementRarity.EPIC,
        conditions: [{ type: AchievementConditionType.COLLECT_GOLD, target: 1000000 }],
        reward: { gems: 200 }
    }
];

/** 进度成就 */
export const ProgressAchievements: AchievementConfig[] = [
    {
        id: 'level_10',
        name: '初出茅庐',
        description: '玩家等级达到10级',
        type: AchievementType.PROGRESS,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.REACH_LEVEL, target: 10 }],
        reward: { gold: 1000 }
    },
    {
        id: 'level_30',
        name: '小有成就',
        description: '玩家等级达到30级',
        type: AchievementType.PROGRESS,
        rarity: AchievementRarity.RARE,
        conditions: [{ type: AchievementConditionType.REACH_LEVEL, target: 30 }],
        reward: { gold: 5000, gems: 100 }
    },
    {
        id: 'level_50',
        name: '名震一方',
        description: '玩家等级达到50级',
        type: AchievementType.PROGRESS,
        rarity: AchievementRarity.EPIC,
        conditions: [{ type: AchievementConditionType.REACH_LEVEL, target: 50 }],
        reward: { gold: 20000, gems: 300 }
    },

    // 建筑升级
    {
        id: 'builder_10',
        name: '建筑学徒',
        description: '完成10次建筑升级',
        type: AchievementType.PROGRESS,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.UPGRADE_BUILDINGS, target: 10 }],
        reward: { gold: 500 }
    },
    {
        id: 'builder_50',
        name: '建筑大师',
        description: '完成50次建筑升级',
        type: AchievementType.PROGRESS,
        rarity: AchievementRarity.RARE,
        conditions: [{ type: AchievementConditionType.UPGRADE_BUILDINGS, target: 50 }],
        reward: { gold: 3000, gems: 50 }
    },

    // 招募单位
    {
        id: 'recruiter_100',
        name: '初建军团',
        description: '累计招募100个单位',
        type: AchievementType.PROGRESS,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.RECRUIT_UNITS, target: 100 }],
        reward: { gold: 500 }
    },
    {
        id: 'recruiter_1000',
        name: '军团壮大',
        description: '累计招募1000个单位',
        type: AchievementType.PROGRESS,
        rarity: AchievementRarity.RARE,
        conditions: [{ type: AchievementConditionType.RECRUIT_UNITS, target: 1000 }],
        reward: { gold: 3000, gems: 100 }
    }
];

/** 特殊成就 */
export const SpecialAchievements: AchievementConfig[] = [
    {
        id: 'first_blood',
        name: '首战告捷',
        description: '赢得第一场战斗',
        type: AchievementType.SPECIAL,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.WIN_BATTLES, target: 1 }],
        reward: { gold: 100, gems: 10 }
    },
    {
        id: 'play_7_days',
        name: '坚持一周',
        description: '累计游戏7天',
        type: AchievementType.SPECIAL,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.PLAY_DAYS, target: 7 }],
        reward: { gold: 1000, gems: 50 }
    },
    {
        id: 'play_30_days',
        name: '月度达人',
        description: '累计游戏30天',
        type: AchievementType.SPECIAL,
        rarity: AchievementRarity.RARE,
        conditions: [{ type: AchievementConditionType.PLAY_DAYS, target: 30 }],
        reward: { gold: 5000, gems: 200 }
    },
    {
        id: 'task_master_10',
        name: '任务达人',
        description: '完成10个每日任务',
        type: AchievementType.SPECIAL,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.COMPLETE_TASKS, target: 10 }],
        reward: { gold: 500 }
    },
    {
        id: 'skill_user_100',
        name: '技能施放者',
        description: '在战斗中使用技能100次',
        type: AchievementType.SPECIAL,
        rarity: AchievementRarity.COMMON,
        conditions: [{ type: AchievementConditionType.USE_SKILL, target: 100 }],
        reward: { gold: 500 }
    }
];

/** 种族成就 */
export const RaceAchievements: AchievementConfig[] = [
    {
        id: 'castle_master',
        name: '圣堂守护者',
        description: '使用圣堂阵营赢得50场战斗',
        type: AchievementType.SPECIAL,
        rarity: AchievementRarity.RARE,
        conditions: [
            { type: AchievementConditionType.WIN_WITH_RACE, target: 50, params: { race: 'castle' } }
        ],
        reward: { gold: 5000, gems: 100 }
    },
    {
        id: 'rampart_master',
        name: '壁垒守望者',
        description: '使用壁垒阵营赢得50场战斗',
        type: AchievementType.SPECIAL,
        rarity: AchievementRarity.RARE,
        conditions: [
            { type: AchievementConditionType.WIN_WITH_RACE, target: 50, params: { race: 'rampart' } }
        ],
        reward: { gold: 5000, gems: 100 }
    },
    {
        id: 'necropolis_master',
        name: '墓园统治者',
        description: '使用墓园阵营赢得50场战斗',
        type: AchievementType.SPECIAL,
        rarity: AchievementRarity.RARE,
        conditions: [
            { type: AchievementConditionType.WIN_WITH_RACE, target: 50, params: { race: 'necropolis' } }
        ],
        reward: { gold: 5000, gems: 100 }
    }
];

/** 所有成就 */
export const AllAchievements: AchievementConfig[] = [
    ...BattleAchievements,
    ...CollectionAchievements,
    ...ProgressAchievements,
    ...SpecialAchievements,
    ...RaceAchievements
];

/** 成就Map */
export const AchievementConfigMap: Map<string, AchievementConfig> = new Map(
    AllAchievements.map(config => [config.id, config])
);

// ==================== 成就链配置 ====================

export const AchievementChains: AchievementChainConfig[] = [
    {
        id: 'battle_master',
        name: '战斗大师之路',
        description: '从新手到传奇的战斗历程',
        achievements: ['battle_novice', 'battle_veteran', 'battle_master', 'battle_legend'],
        finalReward: { gold: 100000, gems: 1000 }
    }
];

/** 成就链Map */
export const AchievementChainMap: Map<string, AchievementChainConfig> = new Map(
    AchievementChains.map(config => [config.id, config])
);

// ==================== 任务配置 ====================

/** 每日任务模板 */
export const DailyTaskTemplates: TaskConfig[] = [
    {
        id: 'daily_win_3',
        name: '每日征战',
        description: '赢得3场战斗',
        type: TaskType.DAILY,
        conditions: [{ type: AchievementConditionType.WIN_BATTLES, target: 3 }],
        reward: { gold: 200, playerExp: 50 },
        refreshable: true,
        autoAccept: true
    },
    {
        id: 'daily_defeat_50',
        name: '斩将夺旗',
        description: '击败50名敌人',
        type: TaskType.DAILY,
        conditions: [{ type: AchievementConditionType.DEFEAT_ENEMIES, target: 50 }],
        reward: { gold: 150, playerExp: 30 },
        refreshable: true,
        autoAccept: true
    },
    {
        id: 'daily_skill_5',
        name: '技能释放',
        description: '在战斗中使用技能5次',
        type: TaskType.DAILY,
        conditions: [{ type: AchievementConditionType.USE_SKILL, target: 5 }],
        reward: { gold: 100, playerExp: 20 },
        refreshable: true,
        autoAccept: true
    },
    {
        id: 'daily_recruit',
        name: '招募士兵',
        description: '招募10个单位',
        type: TaskType.DAILY,
        conditions: [{ type: AchievementConditionType.RECRUIT_UNITS, target: 10 }],
        reward: { gold: 100, playerExp: 20 },
        refreshable: true,
        autoAccept: true
    },
    {
        id: 'daily_gold',
        name: '金币收集',
        description: '获得1000金币',
        type: TaskType.DAILY,
        conditions: [{ type: AchievementConditionType.COLLECT_GOLD, target: 1000 }],
        reward: { playerExp: 30 },
        refreshable: true,
        autoAccept: true
    }
];

/** 每周任务模板 */
export const WeeklyTaskTemplates: TaskConfig[] = [
    {
        id: 'weekly_win_20',
        name: '周常征战',
        description: '赢得20场战斗',
        type: TaskType.WEEKLY,
        conditions: [{ type: AchievementConditionType.WIN_BATTLES, target: 20 }],
        reward: { gold: 1000, gems: 50, playerExp: 200 },
        refreshable: true,
        autoAccept: true
    },
    {
        id: 'weekly_defeat_300',
        name: '周常歼敌',
        description: '击败300名敌人',
        type: TaskType.WEEKLY,
        conditions: [{ type: AchievementConditionType.DEFEAT_ENEMIES, target: 300 }],
        reward: { gold: 800, gems: 30, playerExp: 150 },
        refreshable: true,
        autoAccept: true
    },
    {
        id: 'weekly_streak_5',
        name: '周常连胜',
        description: '获得5连胜',
        type: TaskType.WEEKLY,
        conditions: [{ type: AchievementConditionType.WIN_STREAK, target: 5 }],
        reward: { gold: 500, gems: 20, playerExp: 100 },
        refreshable: true,
        autoAccept: true
    }
];

/** 主线任务 */
export const MainTasks: TaskConfig[] = [
    {
        id: 'main_1',
        name: '初入战场',
        description: '完成新手引导，赢得第一场战斗',
        type: TaskType.MAIN,
        conditions: [{ type: AchievementConditionType.WIN_BATTLES, target: 1 }],
        reward: { gold: 500, gems: 50 },
        autoAccept: true
    },
    {
        id: 'main_2',
        name: '建造城镇',
        description: '完成第一个建筑的建造',
        type: TaskType.MAIN,
        conditions: [{ type: AchievementConditionType.UPGRADE_BUILDINGS, target: 1 }],
        reward: { gold: 300 },
        prerequisite: 'main_1',
        autoAccept: true
    },
    {
        id: 'main_3',
        name: '招募士兵',
        description: '招募你的第一支部队',
        type: TaskType.MAIN,
        conditions: [{ type: AchievementConditionType.RECRUIT_UNITS, target: 5 }],
        reward: { gold: 500 },
        prerequisite: 'main_2',
        autoAccept: true
    },
    {
        id: 'main_4',
        name: '英雄招募',
        description: '获得第二名英雄',
        type: TaskType.MAIN,
        conditions: [{ type: AchievementConditionType.COLLECT_HEROES, target: 2 }],
        reward: { gold: 1000, gems: 30 },
        prerequisite: 'main_3',
        autoAccept: true
    }
];

/** 所有任务 */
export const AllTasks: TaskConfig[] = [
    ...DailyTaskTemplates,
    ...WeeklyTaskTemplates,
    ...MainTasks
];

/** 任务Map */
export const TaskConfigMap: Map<string, TaskConfig> = new Map(
    AllTasks.map(config => [config.id, config])
);