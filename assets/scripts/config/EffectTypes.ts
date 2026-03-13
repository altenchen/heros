/**
 * 战斗特效类型定义
 */

/**
 * 特效类型
 */
export enum EffectType {
    /** 伤害数字 */
    DAMAGE_NUMBER = 'damage_number',
    /** 治疗数字 */
    HEAL_NUMBER = 'heal_number',
    /** 攻击特效 */
    ATTACK = 'attack',
    /** 技能特效 */
    SKILL = 'skill',
    /** Buff特效 */
    BUFF = 'buff',
    /** Debuff特效 */
    DEBUFF = 'debuff',
    /** 暴击特效 */
    CRITICAL = 'critical',
    /** 闪避特效 */
    DODGE = 'dodge',
    /** 死亡特效 */
    DEATH = 'death',
    /** 升级特效 */
    LEVEL_UP = 'level_up',
    /** 通用粒子特效 */
    PARTICLE = 'particle'
}

/**
 * 特效配置
 */
export interface EffectConfig {
    /** 特效ID */
    id: string;
    /** 特效类型 */
    type: EffectType;
    /** 特效名称 */
    name: string;
    /** 资源路径 */
    resourcePath?: string;
    /** 持续时间（秒） */
    duration: number;
    /** 是否循环 */
    loop?: boolean;
    /** 音效ID */
    soundId?: string;
    /** 缩放 */
    scale?: number;
    /** 偏移 */
    offset?: { x: number; y: number };
}

/**
 * 伤害飘字配置
 */
export interface DamageNumberConfig {
    /** 伤害值 */
    value: number;
    /** 是否暴击 */
    isCritical?: boolean;
    /** 是否治疗 */
    isHeal?: boolean;
    /** 是否闪避 */
    isDodge?: boolean;
    /** 颜色 */
    color?: string;
    /** 字体大小 */
    fontSize?: number;
    /** 动画时长 */
    duration?: number;
    /** 飘动高度 */
    floatHeight?: number;
}

/**
 * 技能特效配置
 */
export interface SkillEffectConfig {
    /** 技能ID */
    skillId: string;
    /** 技能类型 */
    skillType: SkillEffectType;
    /** 目标位置列表 */
    targets: { x: number; y: number }[];
    /** 施法者位置 */
    caster?: { x: number; y: number };
    /** 特效持续时间 */
    duration?: number;
}

/**
 * 技能特效类型
 */
export enum SkillEffectType {
    /** 单体攻击 */
    SINGLE_TARGET = 'single_target',
    /** 范围攻击 */
    AOE = 'aoe',
    /** 直线攻击 */
    LINE = 'line',
    /** 投射物 */
    PROJECTILE = 'projectile',
    /** 持续效果 */
    PERSISTENT = 'persistent',
    /** 召唤 */
    SUMMON = 'summon',
    /** 增益 */
    BUFF = 'buff',
    /** 减益 */
    DEBUFF = 'debuff'
}

/**
 * Buff图标配置
 */
export interface BuffIconConfig {
    /** Buff ID */
    id: string;
    /** 状态类型 */
    status: number;
    /** 剩余回合数 */
    duration: number;
    /** 图标路径 */
    iconPath?: string;
    /** 颜色 */
    color?: string;
    /** 是否是Debuff */
    isDebuff?: boolean;
    /** 叠加层数 */
    stacks?: number;
}

/**
 * 特效实例
 */
export interface EffectInstance {
    /** 实例ID */
    id: string;
    /** 特效配置 */
    config: EffectConfig;
    /** 节点引用 */
    node?: any;
    /** 创建时间 */
    createTime: number;
    /** 是否激活 */
    active: boolean;
}

/**
 * 特效预设配置
 */
export const EffectPresets: Record<string, EffectConfig> = {
    // 攻击特效
    attack_slash: {
        id: 'attack_slash',
        type: EffectType.ATTACK,
        name: '斩击',
        duration: 0.3,
        scale: 1.0
    },
    attack_pierce: {
        id: 'attack_pierce',
        type: EffectType.ATTACK,
        name: '穿刺',
        duration: 0.3,
        scale: 1.0
    },
    attack_blunt: {
        id: 'attack_blunt',
        type: EffectType.ATTACK,
        name: '重击',
        duration: 0.4,
        scale: 1.2
    },

    // 技能特效
    skill_fireball: {
        id: 'skill_fireball',
        type: EffectType.SKILL,
        name: '火球术',
        duration: 0.8,
        scale: 1.5,
        soundId: 'sfx_skill_fireball'
    },
    skill_lightning: {
        id: 'skill_lightning',
        type: EffectType.SKILL,
        name: '闪电术',
        duration: 0.5,
        scale: 1.3,
        soundId: 'sfx_skill_lightning'
    },
    skill_ice_blast: {
        id: 'skill_ice_blast',
        type: EffectType.SKILL,
        name: '冰冻术',
        duration: 0.6,
        scale: 1.2,
        soundId: 'sfx_skill_ice'
    },
    skill_heal: {
        id: 'skill_heal',
        type: EffectType.SKILL,
        name: '治疗术',
        duration: 1.0,
        scale: 1.0,
        soundId: 'sfx_skill_heal'
    },
    skill_bless: {
        id: 'skill_bless',
        type: EffectType.BUFF,
        name: '祝福',
        duration: 0.8,
        scale: 1.0,
        soundId: 'sfx_skill_bless'
    },
    skill_curse: {
        id: 'skill_curse',
        type: EffectType.DEBUFF,
        name: '诅咒',
        duration: 0.8,
        scale: 1.0,
        soundId: 'sfx_skill_curse'
    },

    // 通用特效
    critical_hit: {
        id: 'critical_hit',
        type: EffectType.CRITICAL,
        name: '暴击',
        duration: 0.5,
        scale: 1.5
    },
    dodge: {
        id: 'dodge',
        type: EffectType.DODGE,
        name: '闪避',
        duration: 0.3,
        scale: 1.0
    },
    death: {
        id: 'death',
        type: EffectType.DEATH,
        name: '死亡',
        duration: 1.0,
        scale: 1.0,
        soundId: 'sfx_unit_death'
    },
    level_up: {
        id: 'level_up',
        type: EffectType.LEVEL_UP,
        name: '升级',
        duration: 1.5,
        scale: 1.5,
        soundId: 'sfx_level_up'
    }
};

/**
 * 颜色预设
 */
export const ColorPresets = {
    /** 普通伤害 - 红色 */
    DAMAGE_NORMAL: '#FF3333',
    /** 暴击伤害 - 橙红色 */
    DAMAGE_CRITICAL: '#FF6600',
    /** 治疗 - 绿色 */
    HEAL: '#33FF33',
    /** 闪避 - 灰色 */
    DODGE: '#888888',
    /** Buff - 蓝色 */
    BUFF: '#3366FF',
    /** Debuff - 紫色 */
    DEBUFF: '#9933FF',
    /** 护盾 - 黄色 */
    SHIELD: '#FFCC00'
};