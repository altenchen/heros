/**
 * 魔法书系统类型定义
 * 英雄无敌Ⅲ：传承
 */

import { MagicSchool, TargetType, EffectType, StatusEffect } from './GameTypes';

// ==================== 枚举定义 ====================

/** 魔法等级 */
export enum SpellLevel {
    LEVEL_1 = 1,  // 一级魔法
    LEVEL_2 = 2,  // 二级魔法
    LEVEL_3 = 3,  // 三级魔法
    LEVEL_4 = 4,  // 四级魔法
    LEVEL_5 = 5   // 五级魔法
}

/** 魔法类型 */
export enum SpellType {
    COMBAT = 'combat',      // 战斗魔法
    ADVENTURE = 'adventure' // 冒险魔法
}

/** 魔法效果分类 */
export enum SpellCategory {
    DAMAGE = 'damage',           // 伤害类
    HEAL = 'heal',               // 治疗类
    BUFF = 'buff',               // 增益类
    DEBUFF = 'debuff',           // 减益类
    SUMMON = 'summon',           // 召唤类
    TELEPORT = 'teleport',       // 传送类
    SPECIAL = 'special'          // 特殊类
}

/** 魔法派系熟练度等级 */
export enum MagicMastery {
    NONE = 0,      // 未学习
    BASIC = 1,     // 基础
    ADVANCED = 2,  // 高级
    EXPERT = 3,    // 专家
    MASTER = 4     // 大师
}

/** 魔法书事件类型 */
export enum MagicBookEventType {
    SPELL_LEARNED = 'spell_learned',           // 学习魔法
    SPELL_UPGRADED = 'spell_upgraded',         // 升级魔法
    SPELL_FORGOTTEN = 'spell_forgotten',       // 遗忘魔法
    MASTERY_UPGRADED = 'mastery_upgraded',     // 派系熟练度提升
    MANA_CHANGED = 'mana_changed',             // 魔法值变化
    SPELL_CAST = 'spell_cast'                  // 施放魔法
}

// ==================== 接口定义 ====================

/** 魔法配置 */
export interface SpellConfig {
    id: string;                          // 魔法ID
    name: string;                        // 魔法名称
    description: string;                 // 魔法描述
    icon: string;                        // 图标资源
    school: MagicSchool;                 // 魔法派系
    level: SpellLevel;                   // 魔法等级
    type: SpellType;                     // 魔法类型
    category: SpellCategory;             // 效果分类
    targetType: TargetType;              // 目标类型
    range: number;                       // 施法范围
    manaCost: number;                    // 魔法值消耗
    baseDamage?: number;                 // 基础伤害
    baseHeal?: number;                   // 基础治疗
    duration?: number;                   // 持续回合
    areaRadius?: number;                 // 范围半径
    effects: SpellEffect[];              // 效果列表
    upgradeBonus: SpellUpgradeBonus;     // 升级加成
    requirements?: SpellRequirement;     // 学习需求
    animation?: string;                  // 动画资源
    sound?: string;                      // 音效资源
}

/** 魔法效果 */
export interface SpellEffect {
    type: EffectType;                    // 效果类型
    value: number | string;              // 效果值（数字或公式）
    status?: StatusEffect;               // 状态效果
    duration?: number;                   // 持续回合
    chance?: number;                     // 触发概率
}

/** 魔法升级加成 */
export interface SpellUpgradeBonus {
    damageBonus?: number;                // 伤害加成（每级）
    healBonus?: number;                  // 治疗加成（每级）
    durationBonus?: number;              // 持续回合加成（每级）
    manaCostReduction?: number;          // 魔法消耗减少（每级）
    rangeBonus?: number;                 // 范围加成（每级）
    areaRadiusBonus?: number;            // 范围半径加成（每级）
}

/** 魔法学习需求 */
export interface SpellRequirement {
    heroLevel?: number;                  // 英雄等级
    magicSchoolLevel?: {                 // 派系熟练度需求
        [key in MagicSchool]?: MagicMastery;
    };
    preSpell?: string;                   // 前置魔法
    wisdom?: number;                     // 智慧属性
}

/** 英雄魔法实例 */
export interface HeroSpell {
    spellId: string;                     // 魔法ID
    level: number;                       // 魔法等级（1-5，通过升级提升）
    mastery: MagicMastery;               // 掌握程度
    castCount: number;                   // 施放次数
    lastCastTime?: number;               // 上次施放时间
}

/** 魔法派系熟练度 */
export interface SchoolMastery {
    school: MagicSchool;                 // 派系
    level: MagicMastery;                 // 熟练度等级
    exp: number;                         // 当前经验
    expToNext: number;                   // 升级所需经验
}

/** 英雄魔法书数据 */
export interface HeroMagicBook {
    heroId: string;                      // 英雄ID
    spells: Map<string, HeroSpell>;      // 已学魔法
    schoolMasteries: Map<MagicSchool, SchoolMastery>; // 派系熟练度
    maxMana: number;                     // 最大魔法值
    currentMana: number;                 // 当前魔法值
    manaRegen: number;                   // 魔法恢复速度
    spellPower: number;                  // 魔法强度
    wisdom: number;                      // 智慧属性
}

/** 魔法施放结果 */
export interface SpellCastResult {
    success: boolean;                    // 是否成功
    spellId: string;                     // 魔法ID
    manaCost: number;                    // 实际消耗
    targets?: string[];                  // 目标ID列表
    damage?: number;                     // 造成伤害
    heal?: number;                       // 治疗量
    effects?: SpellEffect[];             // 应用的效果
    errorMessage?: string;               // 错误信息
}

/** 魔法学习结果 */
export interface SpellLearnResult {
    success: boolean;
    spellId: string;
    cost: {
        gold: number;
        resources?: { [key: string]: number };
    };
    errorMessage?: string;
}

/** 魔法派系熟练度提升结果 */
export interface MasteryUpgradeResult {
    success: boolean;
    school: MagicSchool;
    oldLevel: MagicMastery;
    newLevel: MagicMastery;
    cost: {
        gold: number;
        spellScrolls?: number;
    };
    errorMessage?: string;
}

/** 魔法书存档数据 */
export interface MagicBookSaveData {
    heroBooks: {
        [heroId: string]: {
            spells: { [spellId: string]: HeroSpell };
            schoolMasteries: { [school: string]: SchoolMastery };
            maxMana: number;
            currentMana: number;
            manaRegen: number;
            spellPower: number;
            wisdom: number;
        };
    };
}

/** 魔法卷轴 */
export interface SpellScroll {
    id: string;
    spellId: string;
    count: number;
}

/** 魔法神殿配置 */
export interface MagicShrineConfig {
    id: string;
    name: string;
    school: MagicSchool;
    level: SpellLevel;
    spells: string[];                    // 可学习的魔法
    learnCost: {
        gold: number;
        resources?: { [key: string]: number };
    };
    upgradeCost: {
        gold: number;
        spellScrolls: number;
    };
}

/** 魔法快捷栏配置 */
export interface SpellQuickSlot {
    slotIndex: number;                   // 槽位索引（0-9）
    spellId: string;                     // 魔法ID
    heroId: string;                      // 所属英雄
}

/** 魔法书面板数据 */
export interface MagicBookPanelData {
    heroId: string;
    school?: MagicSchool;                // 筛选派系
    level?: SpellLevel;                  // 筛选等级
    type?: SpellType;                    // 筛选类型
}

/** 魔法预览数据 */
export interface SpellPreview {
    spell: SpellConfig;
    heroSpell?: HeroSpell;
    canLearn: boolean;
    canCast: boolean;
    manaCost: number;
    estimatedDamage?: number;
    estimatedHeal?: number;
}