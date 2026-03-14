/**
 * 关卡配置数据
 * 包含章节和关卡配置
 * 遵循阿里巴巴开发者手册规范
 */

import {
    LevelConfig,
    ChapterConfig,
    LevelType,
    LevelDifficulty,
    StarConditionType
} from './LevelTypes';

// ==================== 第一章：初入战场 ====================

/** 第一章关卡 */
export const Chapter1Levels: LevelConfig[] = [
    {
        id: 'level_1_1',
        name: '初次交锋',
        description: '击败敌人的先锋部队，证明你的实力。',
        type: LevelType.MAIN,
        difficulty: LevelDifficulty.EASY,
        chapterId: 'chapter_1',
        order: 1,
        recommendedLevel: 1,
        staminaCost: 6,
        dailyLimit: 0,
        enemies: [
            { unitId: 'castle_tier1_pikeman', count: 5, position: { q: 2, r: 0 } },
            { unitId: 'castle_tier2_archer', count: 3, position: { q: 2, r: 1 } }
        ],
        rewards: {
            firstClear: { gold: 100, experience: 50 },
            normal: { gold: 50, experience: 20 }
        },
        starConditions: [
            { type: StarConditionType.TURN_LIMIT, target: 10 },
            { type: StarConditionType.NO_DEATH, target: 0 },
            { type: StarConditionType.HP_PERCENT, target: 80 }
        ]
    },
    {
        id: 'level_1_2',
        name: '枪兵突击',
        description: '敌人的枪兵部队正在逼近，准备好迎接挑战。',
        type: LevelType.MAIN,
        difficulty: LevelDifficulty.EASY,
        chapterId: 'chapter_1',
        order: 2,
        recommendedLevel: 2,
        staminaCost: 6,
        dailyLimit: 0,
        prerequisite: 'level_1_1',
        enemies: [
            { unitId: 'castle_tier1_pikeman', count: 8, position: { q: 2, r: 0 } },
            { unitId: 'castle_tier1_pikeman', count: 5, position: { q: 2, r: -1 } },
            { unitId: 'castle_tier2_archer', count: 4, position: { q: 3, r: 0 } }
        ],
        rewards: {
            firstClear: { gold: 150, experience: 80 },
            normal: { gold: 60, experience: 30 }
        },
        starConditions: [
            { type: StarConditionType.TURN_LIMIT, target: 12 },
            { type: StarConditionType.NO_DEATH, target: 0 },
            { type: StarConditionType.HP_PERCENT, target: 70 }
        ]
    },
    {
        id: 'level_1_3',
        name: '弓箭手埋伏',
        description: '小心！敌人在远处布置了弓箭手。',
        type: LevelType.MAIN,
        difficulty: LevelDifficulty.NORMAL,
        chapterId: 'chapter_1',
        order: 3,
        recommendedLevel: 3,
        staminaCost: 6,
        dailyLimit: 0,
        prerequisite: 'level_1_2',
        enemies: [
            { unitId: 'castle_tier2_archer', count: 8, position: { q: 3, r: 0 } },
            { unitId: 'castle_tier2_archer', count: 5, position: { q: 3, r: -1 } },
            { unitId: 'castle_tier1_pikeman', count: 6, position: { q: 2, r: 1 } }
        ],
        rewards: {
            firstClear: { gold: 200, experience: 100, gems: 10 },
            normal: { gold: 80, experience: 40 }
        },
        starConditions: [
            { type: StarConditionType.TURN_LIMIT, target: 15 },
            { type: StarConditionType.NO_DEATH, target: 0 },
            { type: StarConditionType.HP_PERCENT, target: 60 }
        ]
    },
    {
        id: 'level_1_4',
        name: '狮鹫骑士',
        description: '敌人的狮鹫部队出现了！这是真正的考验。',
        type: LevelType.MAIN,
        difficulty: LevelDifficulty.NORMAL,
        chapterId: 'chapter_1',
        order: 4,
        recommendedLevel: 5,
        staminaCost: 8,
        dailyLimit: 0,
        prerequisite: 'level_1_3',
        enemies: [
            { unitId: 'castle_tier3_griffin', count: 3, position: { q: 2, r: 0 } },
            { unitId: 'castle_tier2_archer', count: 6, position: { q: 3, r: -1 } },
            { unitId: 'castle_tier1_pikeman', count: 8, position: { q: 2, r: 1 } }
        ],
        enemyHero: { heroId: 'hero_catherine', level: 3 },
        rewards: {
            firstClear: { gold: 300, experience: 150, gems: 20 },
            normal: { gold: 100, experience: 50 }
        },
        starConditions: [
            { type: StarConditionType.TURN_LIMIT, target: 18 },
            { type: StarConditionType.NO_DEATH, target: 0 },
            { type: StarConditionType.HP_PERCENT, target: 50 }
        ]
    },
    {
        id: 'level_1_5',
        name: '章节BOSS：城堡守卫',
        description: '击败城堡的守卫部队，完成第一章！',
        type: LevelType.MAIN,
        difficulty: LevelDifficulty.HARD,
        chapterId: 'chapter_1',
        order: 5,
        recommendedLevel: 7,
        staminaCost: 10,
        dailyLimit: 3,
        prerequisite: 'level_1_4',
        enemies: [
            { unitId: 'castle_tier4_swordsman', count: 5, position: { q: 2, r: 0 } },
            { unitId: 'castle_tier3_griffin', count: 4, position: { q: 2, r: -1 } },
            { unitId: 'castle_tier2_archer', count: 8, position: { q: 3, r: 1 } },
            { unitId: 'castle_tier1_pikeman', count: 10, position: { q: 3, r: 0 } }
        ],
        enemyHero: { heroId: 'hero_catherine', level: 5 },
        rewards: {
            firstClear: { gold: 500, experience: 300, gems: 50, heroFragments: [{ heroId: 'hero_catherine', count: 5 }] },
            normal: { gold: 150, experience: 80 },
            threeStar: { gold: 300, gems: 30 }
        },
        starConditions: [
            { type: StarConditionType.TURN_LIMIT, target: 20 },
            { type: StarConditionType.NO_DEATH, target: 0 },
            { type: StarConditionType.HP_PERCENT, target: 40 }
        ]
    }
];

// ==================== 第二章：墓园阴影 ====================

export const Chapter2Levels: LevelConfig[] = [
    {
        id: 'level_2_1',
        name: '不死军团',
        description: '墓园的亡灵部队开始进攻了。',
        type: LevelType.MAIN,
        difficulty: LevelDifficulty.NORMAL,
        chapterId: 'chapter_2',
        order: 1,
        recommendedLevel: 8,
        staminaCost: 8,
        dailyLimit: 0,
        enemies: [
            { unitId: 'necropolis_tier1_skeleton', count: 15, position: { q: 2, r: 0 } },
            { unitId: 'necropolis_tier2_zombie', count: 5, position: { q: 2, r: 1 } }
        ],
        rewards: {
            firstClear: { gold: 300, experience: 150 },
            normal: { gold: 100, experience: 50 }
        },
        starConditions: [
            { type: StarConditionType.TURN_LIMIT, target: 15 },
            { type: StarConditionType.NO_DEATH, target: 0 },
            { type: StarConditionType.HP_PERCENT, target: 60 }
        ]
    },
    {
        id: 'level_2_2',
        name: '幽灵船',
        description: '幽灵从黑暗中现身...',
        type: LevelType.MAIN,
        difficulty: LevelDifficulty.NORMAL,
        chapterId: 'chapter_2',
        order: 2,
        recommendedLevel: 10,
        staminaCost: 8,
        dailyLimit: 0,
        prerequisite: 'level_2_1',
        enemies: [
            { unitId: 'necropolis_tier3_wraith', count: 4, position: { q: 2, r: 0 } },
            { unitId: 'necropolis_tier1_skeleton', count: 12, position: { q: 3, r: -1 } },
            { unitId: 'necropolis_tier2_zombie', count: 8, position: { q: 2, r: 1 } }
        ],
        rewards: {
            firstClear: { gold: 400, experience: 200, gems: 15 },
            normal: { gold: 120, experience: 60 }
        },
        starConditions: [
            { type: StarConditionType.TURN_LIMIT, target: 18 },
            { type: StarConditionType.NO_DEATH, target: 0 },
            { type: StarConditionType.HP_PERCENT, target: 50 }
        ]
    },
    {
        id: 'level_2_3',
        name: '吸血鬼伯爵',
        description: '吸血鬼伯爵率领着他的眷属。',
        type: LevelType.MAIN,
        difficulty: LevelDifficulty.HARD,
        chapterId: 'chapter_2',
        order: 3,
        recommendedLevel: 12,
        staminaCost: 10,
        dailyLimit: 0,
        prerequisite: 'level_2_2',
        enemies: [
            { unitId: 'necropolis_tier4_vampire', count: 4, position: { q: 2, r: 0 } },
            { unitId: 'necropolis_tier3_wraith', count: 5, position: { q: 2, r: -1 } },
            { unitId: 'necropolis_tier1_skeleton', count: 15, position: { q: 3, r: 1 } }
        ],
        enemyHero: { heroId: 'hero_sandro', level: 8 },
        rewards: {
            firstClear: { gold: 500, experience: 300, gems: 25 },
            normal: { gold: 150, experience: 80 }
        },
        starConditions: [
            { type: StarConditionType.TURN_LIMIT, target: 20 },
            { type: StarConditionType.NO_DEATH, target: 0 },
            { type: StarConditionType.HP_PERCENT, target: 40 }
        ]
    },
    {
        id: 'level_2_4',
        name: '章节BOSS：鬼龙降临',
        description: '传说中的鬼龙出现了！击败它，拯救这片土地！',
        type: LevelType.MAIN,
        difficulty: LevelDifficulty.HARD,
        chapterId: 'chapter_2',
        order: 4,
        recommendedLevel: 15,
        staminaCost: 12,
        dailyLimit: 3,
        prerequisite: 'level_2_3',
        enemies: [
            { unitId: 'necropolis_tier6_ghost_dragon', count: 1, position: { q: 2, r: 0 } },
            { unitId: 'necropolis_tier4_vampire', count: 5, position: { q: 2, r: -1 } },
            { unitId: 'necropolis_tier5_lich', count: 3, position: { q: 3, r: 1 } },
            { unitId: 'necropolis_tier1_skeleton', count: 20, position: { q: 3, r: 0 } }
        ],
        enemyHero: { heroId: 'hero_sandro', level: 12 },
        rewards: {
            firstClear: { gold: 800, experience: 500, gems: 80, heroFragments: [{ heroId: 'hero_sandro', count: 10 }] },
            normal: { gold: 200, experience: 100 },
            threeStar: { gold: 400, gems: 50 }
        },
        starConditions: [
            { type: StarConditionType.TURN_LIMIT, target: 25 },
            { type: StarConditionType.NO_DEATH, target: 0 },
            { type: StarConditionType.HP_PERCENT, target: 30 }
        ]
    }
];

// ==================== 精英关卡 ====================

export const EliteLevels: LevelConfig[] = [
    {
        id: 'elite_1_1',
        name: '精英：枪兵训练场',
        description: '与训练有素的精英枪兵进行战斗。',
        type: LevelType.ELITE,
        difficulty: LevelDifficulty.HARD,
        chapterId: 'elite',
        order: 1,
        recommendedLevel: 10,
        staminaCost: 12,
        dailyLimit: 2,
        enemies: [
            { unitId: 'castle_tier1_pikeman', count: 20, position: { q: 2, r: 0 } },
            { unitId: 'castle_tier1_pikeman', count: 15, position: { q: 2, r: -1 } },
            { unitId: 'castle_tier1_pikeman', count: 15, position: { q: 2, r: 1 } }
        ],
        rewards: {
            firstClear: { gold: 500, experience: 300, items: [{ id: 'pikeman_badge', count: 5 }] },
            normal: { gold: 150, experience: 80, items: [{ id: 'pikeman_badge', count: 2 }] }
        },
        starConditions: [
            { type: StarConditionType.TURN_LIMIT, target: 20 },
            { type: StarConditionType.NO_DEATH, target: 0 },
            { type: StarConditionType.HP_PERCENT, target: 50 }
        ]
    },
    {
        id: 'elite_1_2',
        name: '精英：弓箭手靶场',
        description: '面对精英弓箭手的箭雨！',
        type: LevelType.ELITE,
        difficulty: LevelDifficulty.HARD,
        chapterId: 'elite',
        order: 2,
        recommendedLevel: 15,
        staminaCost: 12,
        dailyLimit: 2,
        prerequisite: 'elite_1_1',
        enemies: [
            { unitId: 'castle_tier2_archer', count: 15, position: { q: 3, r: 0 } },
            { unitId: 'castle_tier2_archer', count: 10, position: { q: 3, r: -1 } },
            { unitId: 'castle_tier2_archer', count: 10, position: { q: 3, r: 1 } }
        ],
        rewards: {
            firstClear: { gold: 600, experience: 400, items: [{ id: 'archer_badge', count: 5 }] },
            normal: { gold: 180, experience: 100, items: [{ id: 'archer_badge', count: 2 }] }
        },
        starConditions: [
            { type: StarConditionType.TURN_LIMIT, target: 18 },
            { type: StarConditionType.NO_DEATH, target: 0 },
            { type: StarConditionType.HP_PERCENT, target: 40 }
        ]
    }
];

// ==================== 章节配置 ====================

export const Chapters: ChapterConfig[] = [
    {
        id: 'chapter_1',
        name: '初入战场',
        description: '圣堂城堡的冒险开始了，准备好迎接挑战吧！',
        order: 1,
        levels: ['level_1_1', 'level_1_2', 'level_1_3', 'level_1_4', 'level_1_5'],
        unlockLevel: 1,
        completionReward: { gold: 1000, gems: 100, items: [{ id: 'chapter1_chest', count: 1 }] }
    },
    {
        id: 'chapter_2',
        name: '墓园阴影',
        description: '墓园的亡灵大军正在逼近，勇敢的冒险者必须面对黑暗！',
        order: 2,
        levels: ['level_2_1', 'level_2_2', 'level_2_3', 'level_2_4'],
        prerequisite: 'chapter_1',
        unlockLevel: 8,
        completionReward: { gold: 2000, gems: 200, items: [{ id: 'chapter2_chest', count: 1 }] }
    }
];

// ==================== 汇总导出 ====================

/** 所有关卡配置 */
export const AllLevels: LevelConfig[] = [
    ...Chapter1Levels,
    ...Chapter2Levels,
    ...EliteLevels
];

/** 关卡配置Map */
export const LevelConfigMap: Map<string, LevelConfig> = new Map(
    AllLevels.map(config => [config.id, config])
);

/** 章节配置Map */
export const ChapterConfigMap: Map<string, ChapterConfig> = new Map(
    Chapters.map(config => [config.id, config])
);