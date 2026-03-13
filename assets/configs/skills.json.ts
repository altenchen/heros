/**
 * 技能配置数据
 * 英雄技能和兵种技能
 */

import { SkillConfig, SkillType, MagicSchool, TargetType, EffectType, StatusEffect } from '../scripts/config/GameTypes';

export const SkillConfigs: SkillConfig[] = [
    // ==================== 火系魔法 ====================
    {
        id: 'skill_fireball',
        name: '火球术',
        type: SkillType.HERO,
        magicSchool: MagicSchool.FIRE,
        level: 1,
        cost: { mana: 5 },
        cooldown: 0,
        targetType: TargetType.AREA,
        range: 4,
        effect: [
            { type: EffectType.DAMAGE, value: 'spell_power * 20' }
        ],
        animation: 'effect_fireball',
        icon: 'icon_fireball',
        description: '对目标区域造成火焰伤害'
    },
    {
        id: 'skill_fire_wall',
        name: '火墙术',
        type: SkillType.HERO,
        magicSchool: MagicSchool.FIRE,
        level: 2,
        cost: { mana: 8 },
        cooldown: 0,
        targetType: TargetType.AREA,
        range: 4,
        effect: [
            { type: EffectType.DAMAGE, value: 'spell_power * 10', duration: 2, status: StatusEffect.POISON }
        ],
        animation: 'effect_fire_wall',
        icon: 'icon_fire_wall',
        description: '创建一道持续2回合的火墙'
    },
    {
        id: 'skill_bloodlust',
        name: '嗜血术',
        type: SkillType.HERO,
        magicSchool: MagicSchool.FIRE,
        level: 2,
        cost: { mana: 5 },
        cooldown: 0,
        targetType: TargetType.SINGLE,
        range: 4,
        effect: [
            { type: EffectType.BUFF, value: 6, duration: 3, status: StatusEffect.BLOODLUST }
        ],
        animation: 'effect_bloodlust',
        icon: 'icon_bloodlust',
        description: '增加目标攻击力，持续3回合'
    },
    {
        id: 'skill_armageddon',
        name: '末日审判',
        type: SkillType.HERO,
        magicSchool: MagicSchool.FIRE,
        level: 4,
        cost: { mana: 24 },
        cooldown: 0,
        targetType: TargetType.ALL_ENEMY,
        range: 0,
        effect: [
            { type: EffectType.DAMAGE, value: 'spell_power * 50' }
        ],
        animation: 'effect_armageddon',
        icon: 'icon_armageddon',
        description: '对所有敌人造成巨大火焰伤害'
    },

    // ==================== 水系魔法 ====================
    {
        id: 'skill_bless',
        name: '祝福术',
        type: SkillType.HERO,
        magicSchool: MagicSchool.WATER,
        level: 1,
        cost: { mana: 5 },
        cooldown: 0,
        targetType: TargetType.SINGLE,
        range: 4,
        effect: [
            { type: EffectType.BUFF, status: StatusEffect.BLESS, duration: 3 }
        ],
        animation: 'effect_bless',
        icon: 'icon_bless',
        description: '使目标单位伤害最大化'
    },
    {
        id: 'skill_cure',
        name: '治疗术',
        type: SkillType.HERO,
        magicSchool: MagicSchool.WATER,
        level: 1,
        cost: { mana: 6 },
        cooldown: 0,
        targetType: TargetType.SINGLE,
        range: 4,
        effect: [
            { type: EffectType.HEAL, value: 'spell_power * 10 + 10' },
            { type: EffectType.DISPEL }
        ],
        animation: 'effect_cure',
        icon: 'icon_cure',
        description: '治疗目标并移除负面效果'
    },
    {
        id: 'skill_frost_ring',
        name: '霜环术',
        type: SkillType.HERO,
        magicSchool: MagicSchool.WATER,
        level: 2,
        cost: { mana: 8 },
        cooldown: 0,
        targetType: TargetType.AREA,
        range: 4,
        effect: [
            { type: EffectType.DAMAGE, value: 'spell_power * 15' }
        ],
        animation: 'effect_frost_ring',
        icon: 'icon_frost_ring',
        description: '在目标区域创建霜环造成伤害'
    },
    {
        id: 'skill_teleport',
        name: '传送术',
        type: SkillType.HERO,
        magicSchool: MagicSchool.WATER,
        level: 3,
        cost: { mana: 10 },
        cooldown: 0,
        targetType: TargetType.SINGLE,
        range: 6,
        effect: [
            { type: EffectType.BUFF }
        ],
        animation: 'effect_teleport',
        icon: 'icon_teleport',
        description: '传送目标单位到指定位置'
    },

    // ==================== 土系魔法 ====================
    {
        id: 'skill_slow',
        name: '迟缓大法',
        type: SkillType.HERO,
        magicSchool: MagicSchool.EARTH,
        level: 1,
        cost: { mana: 6 },
        cooldown: 0,
        targetType: TargetType.SINGLE,
        range: 4,
        effect: [
            { type: EffectType.DEBUFF, status: StatusEffect.SLOW, duration: 3 }
        ],
        animation: 'effect_slow',
        icon: 'icon_slow',
        description: '降低目标速度'
    },
    {
        id: 'skill_stone_skin',
        name: '石肤术',
        type: SkillType.HERO,
        magicSchool: MagicSchool.EARTH,
        level: 1,
        cost: { mana: 5 },
        cooldown: 0,
        targetType: TargetType.SINGLE,
        range: 4,
        effect: [
            { type: EffectType.BUFF, status: StatusEffect.SHIELD, value: 6, duration: 3 }
        ],
        animation: 'effect_stone_skin',
        icon: 'icon_stone_skin',
        description: '增加目标防御力'
    },
    {
        id: 'skill_meteor_shower',
        name: '流星火雨',
        type: SkillType.HERO,
        magicSchool: MagicSchool.EARTH,
        level: 4,
        cost: { mana: 16 },
        cooldown: 0,
        targetType: TargetType.AREA,
        range: 4,
        effect: [
            { type: EffectType.DAMAGE, value: 'spell_power * 25' }
        ],
        animation: 'effect_meteor_shower',
        icon: 'icon_meteor_shower',
        description: '召唤流星雨对目标区域造成伤害'
    },
    {
        id: 'skill_resurrection',
        name: '复活术',
        type: SkillType.HERO,
        magicSchool: MagicSchool.EARTH,
        level: 4,
        cost: { mana: 20, focus: 2 },
        cooldown: 3,
        targetType: TargetType.ALL_DEAD_ALLY,
        range: 0,
        effect: [
            { type: EffectType.REVIVE, value: 'spell_power * 50' }
        ],
        animation: 'effect_resurrection',
        icon: 'icon_resurrection',
        description: '复活阵亡友军单位'
    },

    // ==================== 气系魔法 ====================
    {
        id: 'skill_haste',
        name: '加速术',
        type: SkillType.HERO,
        magicSchool: MagicSchool.AIR,
        level: 1,
        cost: { mana: 6 },
        cooldown: 0,
        targetType: TargetType.SINGLE,
        range: 4,
        effect: [
            { type: EffectType.BUFF, status: StatusEffect.HASTE, value: 3, duration: 3 }
        ],
        animation: 'effect_haste',
        icon: 'icon_haste',
        description: '增加目标速度'
    },
    {
        id: 'skill_lightning_bolt',
        name: '闪电箭',
        type: SkillType.HERO,
        magicSchool: MagicSchool.AIR,
        level: 2,
        cost: { mana: 10 },
        cooldown: 0,
        targetType: TargetType.SINGLE,
        range: 4,
        effect: [
            { type: EffectType.DAMAGE, value: 'spell_power * 25' }
        ],
        animation: 'effect_lightning_bolt',
        icon: 'icon_lightning_bolt',
        description: '对目标造成闪电伤害'
    },
    {
        id: 'skill_chain_lightning',
        name: '连锁闪电',
        type: SkillType.HERO,
        magicSchool: MagicSchool.AIR,
        level: 3,
        cost: { mana: 15 },
        cooldown: 0,
        targetType: TargetType.SINGLE,
        range: 4,
        effect: [
            { type: EffectType.DAMAGE, value: 'spell_power * 40', duration: 1 }
        ],
        animation: 'effect_chain_lightning',
        icon: 'icon_chain_lightning',
        description: '闪电在敌人间跳跃造成伤害'
    },
    {
        id: 'skill_dimension_door',
        name: '次元门',
        type: SkillType.HERO,
        magicSchool: MagicSchool.AIR,
        level: 4,
        cost: { mana: 15 },
        cooldown: 0,
        targetType: TargetType.SELF,
        range: 0,
        effect: [
            { type: EffectType.BUFF }
        ],
        animation: 'effect_dimension_door',
        icon: 'icon_dimension_door',
        description: '瞬间传送英雄到战场任意位置'
    },

    // ==================== 被动技能 ====================
    {
        id: 'skill_offense',
        name: '进攻术',
        type: SkillType.HERO,
        level: 1,
        cost: {},
        cooldown: 0,
        targetType: TargetType.SELF,
        range: 0,
        effect: [
            { type: EffectType.BUFF, value: 0.1 }
        ],
        animation: '',
        icon: 'icon_offense',
        description: '增加己方单位攻击力10%'
    },
    {
        id: 'skill_defense',
        name: '防御术',
        type: SkillType.HERO,
        level: 1,
        cost: {},
        cooldown: 0,
        targetType: TargetType.SELF,
        range: 0,
        effect: [
            { type: EffectType.BUFF, value: 0.1 }
        ],
        animation: '',
        icon: 'icon_defense',
        description: '增加己方单位防御力10%'
    },
    {
        id: 'skill_leadership',
        name: '领导术',
        type: SkillType.HERO,
        level: 1,
        cost: {},
        cooldown: 0,
        targetType: TargetType.SELF,
        range: 0,
        effect: [
            { type: EffectType.BUFF, value: 0.05 }
        ],
        animation: '',
        icon: 'icon_leadership',
        description: '己方单位有5%概率再次行动'
    },
    {
        id: 'skill_archery',
        name: '箭术',
        type: SkillType.HERO,
        level: 1,
        cost: {},
        cooldown: 0,
        targetType: TargetType.SELF,
        range: 0,
        effect: [
            { type: EffectType.BUFF, value: 0.1 }
        ],
        animation: '',
        icon: 'icon_archery',
        description: '增加远程单位伤害10%'
    },
    {
        id: 'skill_necromancy',
        name: '招魂术',
        type: SkillType.HERO,
        level: 1,
        cost: {},
        cooldown: 0,
        targetType: TargetType.SELF,
        range: 0,
        effect: [
            { type: EffectType.BUFF }
        ],
        animation: '',
        icon: 'icon_necromancy',
        description: '战后将部分阵亡敌人转化为骷髅兵'
    },

    // ==================== 兵种技能 ====================
    {
        id: 'skill_monk_heal',
        name: '治疗',
        type: SkillType.UNIT,
        level: 1,
        cost: { focus: 1 },
        cooldown: 1,
        targetType: TargetType.SINGLE,
        range: 3,
        effect: [
            { type: EffectType.HEAL, value: 50 }
        ],
        animation: 'effect_heal',
        icon: 'icon_heal',
        description: '僧侣：治疗友军单位'
    },
    {
        id: 'skill_angel_revive',
        name: '复活',
        type: SkillType.UNIT,
        level: 1,
        cost: { focus: 2 },
        cooldown: 3,
        targetType: TargetType.ALL_DEAD_ALLY,
        range: 0,
        effect: [
            { type: EffectType.REVIVE, value: 0.3 }
        ],
        animation: 'effect_revive',
        icon: 'icon_revive',
        description: '大天使：复活阵亡单位，恢复30%生命值'
    }
];

// 创建技能配置查找表
export const SkillConfigMap: Map<string, SkillConfig> = new Map(
    SkillConfigs.map(config => [config.id, config])
);

// 按魔法派系分组的技能
export const SkillsByMagicSchool: Map<MagicSchool | 'passive' | 'unit', SkillConfig[]> = new Map([
    [MagicSchool.FIRE, SkillConfigs.filter(s => s.magicSchool === MagicSchool.FIRE)],
    [MagicSchool.WATER, SkillConfigs.filter(s => s.magicSchool === MagicSchool.WATER)],
    [MagicSchool.EARTH, SkillConfigs.filter(s => s.magicSchool === MagicSchool.EARTH)],
    [MagicSchool.AIR, SkillConfigs.filter(s => s.magicSchool === MagicSchool.AIR)],
    ['passive', SkillConfigs.filter(s => s.type === SkillType.HERO && !s.magicSchool)],
    ['unit', SkillConfigs.filter(s => s.type === SkillType.UNIT)]
]);