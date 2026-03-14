/**
 * 魔法书配置数据
 * 英雄无敌Ⅲ：传承
 * 包含火、水、土、气四系魔法配置
 */

import {
    SpellConfig,
    SpellLevel,
    SpellType,
    SpellCategory
} from '../config/MagicBookTypes';
import { MagicSchool, TargetType, EffectType, StatusEffect } from '../config/GameTypes';

// ==================== 火系魔法 ====================

/** 火系魔法配置 */
export const FireSpells: SpellConfig[] = [
    // 一级魔法
    {
        id: 'spell_magic_arrow',
        name: '魔法箭',
        description: '对单个敌人造成伤害',
        icon: 'spell_magic_arrow',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 5,
        baseDamage: 10,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 10 + 10' }
        ],
        upgradeBonus: {
            damageBonus: 5
        },
        animation: 'effect_magic_arrow',
        sound: 'sfx_magic_arrow'
    },
    {
        id: 'spell_bloodlust',
        name: '嗜血术',
        description: '增加友军的攻击力',
        icon: 'spell_bloodlust',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 5,
        duration: 3,
        effects: [
            { type: EffectType.BUFF, value: 6, status: StatusEffect.BLOODLUST, duration: 3 }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'effect_bloodlust',
        sound: 'sfx_buff_fire'
    },
    {
        id: 'spell_fireball',
        name: '火球术',
        description: '对一个区域内的敌人造成火焰伤害',
        icon: 'spell_fireball',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.AREA,
        range: 4,
        manaCost: 15,
        baseDamage: 15,
        areaRadius: 1,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 15 + 15' }
        ],
        upgradeBonus: {
            damageBonus: 10,
            rangeBonus: 1
        },
        animation: 'effect_fireball',
        sound: 'sfx_fireball'
    },
    {
        id: 'spell_fire_wall',
        name: '火墙术',
        description: '创建一道火焰墙，对穿过的敌人造成伤害',
        icon: 'spell_fire_wall',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_3,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.AREA,
        range: 3,
        manaCost: 20,
        baseDamage: 10,
        duration: 2,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 10', duration: 2 }
        ],
        upgradeBonus: {
            damageBonus: 5,
            durationBonus: 1
        },
        animation: 'effect_fire_wall',
        sound: 'sfx_fire_wall'
    },
    {
        id: 'spell_inferno',
        name: '地狱火',
        description: '对所有敌人造成大量火焰伤害',
        icon: 'spell_inferno',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_4,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.ALL_ENEMY,
        range: 99,
        manaCost: 35,
        baseDamage: 20,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 20 + 20' }
        ],
        upgradeBonus: {
            damageBonus: 15,
            manaCostReduction: 5
        },
        requirements: {
            heroLevel: 10,
            magicSchoolLevel: {
                [MagicSchool.FIRE]: 2
            }
        },
        animation: 'effect_inferno',
        sound: 'sfx_inferno'
    },
    {
        id: 'spell_armageddon',
        name: '末日审判',
        description: '毁灭性的魔法，对战场上的所有单位造成巨大伤害',
        icon: 'spell_armageddon',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_5,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.ALL_ENEMY,
        range: 99,
        manaCost: 50,
        baseDamage: 50,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 50 + 50' }
        ],
        upgradeBonus: {
            damageBonus: 25,
            manaCostReduction: 10
        },
        requirements: {
            heroLevel: 20,
            magicSchoolLevel: {
                [MagicSchool.FIRE]: 3
            }
        },
        animation: 'effect_armageddon',
        sound: 'sfx_armageddon'
    }
];

// ==================== 水系魔法 ====================

/** 水系魔法配置 */
export const WaterSpells: SpellConfig[] = [
    {
        id: 'spell_bless',
        name: '祝福术',
        description: '使友军在攻击时造成最大伤害',
        icon: 'spell_bless',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 5,
        duration: 3,
        effects: [
            { type: EffectType.BUFF, value: 1, status: StatusEffect.BLESS, duration: 3 }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'effect_bless',
        sound: 'sfx_buff_water'
    },
    {
        id: 'spell_cure',
        name: '治疗术',
        description: '恢复友军的生命值并移除负面状态',
        icon: 'spell_cure',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.HEAL,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 6,
        baseHeal: 10,
        effects: [
            { type: EffectType.HEAL, value: 'spellPower * 10 + 5' },
            { type: EffectType.DISPEL, value: 1 }
        ],
        upgradeBonus: {
            healBonus: 5
        },
        animation: 'effect_cure',
        sound: 'sfx_cure'
    },
    {
        id: 'spell_weakness',
        name: '虚弱术',
        description: '降低敌人的攻击力',
        icon: 'spell_weakness',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.DEBUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 4,
        duration: 3,
        effects: [
            { type: EffectType.DEBUFF, value: -3, status: StatusEffect.CURSE, duration: 3 }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'effect_weakness',
        sound: 'sfx_debuff_water'
    },
    {
        id: 'spell_dispel',
        name: '驱散术',
        description: '移除目标单位的所有状态效果',
        icon: 'spell_dispel',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.SPECIAL,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 8,
        effects: [
            { type: EffectType.DISPEL, value: 99 }
        ],
        upgradeBonus: {
            manaCostReduction: 2
        },
        animation: 'effect_dispel',
        sound: 'sfx_dispel'
    },
    {
        id: 'spell_ice_bolt',
        name: '冰箭术',
        description: '对单个敌人造成冰冷伤害并减速',
        icon: 'spell_ice_bolt',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 12,
        baseDamage: 20,
        duration: 2,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 20 + 10' },
            { type: EffectType.DEBUFF, value: -2, status: StatusEffect.SLOW, duration: 2, chance: 0.5 }
        ],
        upgradeBonus: {
            damageBonus: 10,
            durationBonus: 1
        },
        animation: 'effect_ice_bolt',
        sound: 'sfx_ice_bolt'
    },
    {
        id: 'spell_frost_ring',
        name: '霜环术',
        description: '在目标周围创建一个冰霜圆环',
        icon: 'spell_frost_ring',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_3,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.AREA,
        range: 4,
        manaCost: 18,
        baseDamage: 25,
        areaRadius: 1,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 25 + 10' }
        ],
        upgradeBonus: {
            damageBonus: 15
        },
        animation: 'effect_frost_ring',
        sound: 'sfx_frost_ring'
    },
    {
        id: 'spell_mass_bless',
        name: '群体祝福',
        description: '使所有友军获得祝福效果',
        icon: 'spell_mass_bless',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_4,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.ALL_ALLY,
        range: 99,
        manaCost: 25,
        duration: 3,
        effects: [
            { type: EffectType.BUFF, value: 1, status: StatusEffect.BLESS, duration: 3 }
        ],
        upgradeBonus: {
            durationBonus: 1,
            manaCostReduction: 5
        },
        requirements: {
            heroLevel: 12,
            magicSchoolLevel: {
                [MagicSchool.WATER]: 2
            }
        },
        animation: 'effect_mass_bless',
        sound: 'sfx_buff_water'
    },
    {
        id: 'spell_summon_water_elemental',
        name: '召唤水元素',
        description: '召唤水元素为你战斗',
        icon: 'spell_summon_water_elemental',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_5,
        type: SpellType.COMBAT,
        category: SpellCategory.SUMMON,
        targetType: TargetType.SELF,
        range: 0,
        manaCost: 40,
        effects: [
            { type: EffectType.SUMMON, value: 'water_elemental' }
        ],
        upgradeBonus: {
            manaCostReduction: 10
        },
        requirements: {
            heroLevel: 18,
            magicSchoolLevel: {
                [MagicSchool.WATER]: 3
            }
        },
        animation: 'effect_summon_water',
        sound: 'sfx_summon'
    }
];

// ==================== 土系魔法 ====================

/** 土系魔法配置 */
export const EarthSpells: SpellConfig[] = [
    {
        id: 'spell_stoneskin',
        name: '石肤术',
        description: '增加友军的防御力',
        icon: 'spell_stoneskin',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 5,
        duration: 3,
        effects: [
            { type: EffectType.BUFF, value: 6, status: StatusEffect.SHIELD, duration: 3 }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'effect_stoneskin',
        sound: 'sfx_buff_earth'
    },
    {
        id: 'spell_slow',
        name: '迟缓术',
        description: '降低敌人的移动速度',
        icon: 'spell_slow',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.DEBUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 4,
        duration: 3,
        effects: [
            { type: EffectType.DEBUFF, value: -3, status: StatusEffect.SLOW, duration: 3 }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'effect_slow',
        sound: 'sfx_debuff_earth'
    },
    {
        id: 'spell_quicksand',
        name: '流沙术',
        description: '使敌人的速度大幅降低',
        icon: 'spell_quicksand',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.DEBUFF,
        targetType: TargetType.ALL_ENEMY,
        range: 99,
        manaCost: 12,
        duration: 2,
        effects: [
            { type: EffectType.DEBUFF, value: -2, status: StatusEffect.SLOW, duration: 2, chance: 0.6 }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'effect_quicksand',
        sound: 'sfx_quicksand'
    },
    {
        id: 'spell_death_ripple',
        name: '死亡波纹',
        description: '对所有活体敌人造成伤害（亡灵无效）',
        icon: 'spell_death_ripple',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.ALL_ENEMY,
        range: 99,
        manaCost: 15,
        baseDamage: 10,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 10 + 5' }
        ],
        upgradeBonus: {
            damageBonus: 8
        },
        animation: 'effect_death_ripple',
        sound: 'sfx_death_ripple'
    },
    {
        id: 'spell_animate_dead',
        name: '亡灵复生',
        description: '复活阵亡的亡灵单位',
        icon: 'spell_animate_dead',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_3,
        type: SpellType.COMBAT,
        category: SpellCategory.SPECIAL,
        targetType: TargetType.ALL_DEAD_ALLY,
        range: 4,
        manaCost: 20,
        effects: [
            { type: EffectType.REVIVE, value: 'spellPower * 20' }
        ],
        upgradeBonus: {
            manaCostReduction: 5
        },
        animation: 'effect_animate_dead',
        sound: 'sfx_animate_dead'
    },
    {
        id: 'spell_stone_arrow',
        name: '碎石术',
        description: '对单个敌人造成大量伤害',
        icon: 'spell_stone_arrow',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_3,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 16,
        baseDamage: 25,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 25 + 10' }
        ],
        upgradeBonus: {
            damageBonus: 15
        },
        animation: 'effect_stone_arrow',
        sound: 'sfx_stone_arrow'
    },
    {
        id: 'spell_meteor_shower',
        name: '陨石术',
        description: '召唤陨石对区域造成毁灭性打击',
        icon: 'spell_meteor_shower',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_4,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.AREA,
        range: 4,
        manaCost: 30,
        baseDamage: 40,
        areaRadius: 2,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 40 + 20' }
        ],
        upgradeBonus: {
            damageBonus: 20,
            areaRadius: 1
        },
        requirements: {
            heroLevel: 15,
            magicSchoolLevel: {
                [MagicSchool.EARTH]: 2
            }
        },
        animation: 'effect_meteor_shower',
        sound: 'sfx_meteor_shower'
    },
    {
        id: 'spell_earthquake',
        name: '地震术',
        description: '摧毁城墙并对所有敌人造成伤害',
        icon: 'spell_earthquake',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_5,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.ALL_ENEMY,
        range: 99,
        manaCost: 45,
        baseDamage: 30,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 30 + 15' }
        ],
        upgradeBonus: {
            damageBonus: 20
        },
        requirements: {
            heroLevel: 20,
            magicSchoolLevel: {
                [MagicSchool.EARTH]: 3
            }
        },
        animation: 'effect_earthquake',
        sound: 'sfx_earthquake'
    }
];

// ==================== 气系魔法 ====================

/** 气系魔法配置 */
export const AirSpells: SpellConfig[] = [
    {
        id: 'spell_haste',
        name: '加速术',
        description: '增加友军的移动速度',
        icon: 'spell_haste',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 5,
        duration: 3,
        effects: [
            { type: EffectType.BUFF, value: 3, status: StatusEffect.HASTE, duration: 3 }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'effect_haste',
        sound: 'sfx_buff_air'
    },
    {
        id: 'spell_lightning_bolt',
        name: '闪电术',
        description: '对单个敌人造成闪电伤害',
        icon: 'spell_lightning_bolt',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 10,
        baseDamage: 15,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 15 + 10' }
        ],
        upgradeBonus: {
            damageBonus: 10
        },
        animation: 'effect_lightning_bolt',
        sound: 'sfx_lightning_bolt'
    },
    {
        id: 'spell_chain_lightning',
        name: '连锁闪电',
        description: '闪电在多个敌人之间跳跃',
        icon: 'spell_chain_lightning',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 18,
        baseDamage: 25,
        effects: [
            { type: EffectType.DAMAGE, value: 'spellPower * 25 + 15' }
        ],
        upgradeBonus: {
            damageBonus: 12
        },
        animation: 'effect_chain_lightning',
        sound: 'sfx_chain_lightning'
    },
    {
        id: 'spell_disrupting_ray',
        name: '破坏光线',
        description: '降低敌人的防御力',
        icon: 'spell_disrupting_ray',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.DEBUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 10,
        duration: 3,
        effects: [
            { type: EffectType.DEBUFF, value: -5, status: StatusEffect.CURSE, duration: 3 }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'effect_disrupting_ray',
        sound: 'sfx_disrupting_ray'
    },
    {
        id: 'spell_mass_haste',
        name: '群体加速',
        description: '使所有友军获得加速效果',
        icon: 'spell_mass_haste',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_3,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.ALL_ALLY,
        range: 99,
        manaCost: 20,
        duration: 3,
        effects: [
            { type: EffectType.BUFF, value: 2, status: StatusEffect.HASTE, duration: 3 }
        ],
        upgradeBonus: {
            durationBonus: 1,
            manaCostReduction: 3
        },
        animation: 'effect_mass_haste',
        sound: 'sfx_buff_air'
    },
    {
        id: 'spell_air_shield',
        name: '空气护盾',
        description: '为友军创造护盾抵挡远程伤害',
        icon: 'spell_air_shield',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_3,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 15,
        duration: 3,
        effects: [
            { type: EffectType.BUFF, value: 50, status: StatusEffect.SHIELD, duration: 3 }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'effect_air_shield',
        sound: 'sfx_air_shield'
    },
    {
        id: 'spell_town_portal',
        name: '城镇传送',
        description: '传送英雄到己方城镇',
        icon: 'spell_town_portal',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_4,
        type: SpellType.ADVENTURE,
        category: SpellCategory.TELEPORT,
        targetType: TargetType.SELF,
        range: 0,
        manaCost: 35,
        effects: [],
        upgradeBonus: {
            manaCostReduction: 10
        },
        requirements: {
            heroLevel: 10,
            magicSchoolLevel: {
                [MagicSchool.AIR]: 2
            }
        },
        animation: 'effect_town_portal',
        sound: 'sfx_teleport'
    },
    {
        id: 'spell_dimension_door',
        name: '异次元门',
        description: '传送英雄到任意已探索的位置',
        icon: 'spell_dimension_door',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_5,
        type: SpellType.ADVENTURE,
        category: SpellCategory.TELEPORT,
        targetType: TargetType.SELF,
        range: 0,
        manaCost: 50,
        effects: [],
        upgradeBonus: {
            manaCostReduction: 15
        },
        requirements: {
            heroLevel: 20,
            magicSchoolLevel: {
                [MagicSchool.AIR]: 3
            }
        },
        animation: 'effect_dimension_door',
        sound: 'sfx_teleport'
    },
    {
        id: 'spell_summon_air_elemental',
        name: '召唤气元素',
        description: '召唤气元素为你战斗',
        icon: 'spell_summon_air_elemental',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_5,
        type: SpellType.COMBAT,
        category: SpellCategory.SUMMON,
        targetType: TargetType.SELF,
        range: 0,
        manaCost: 40,
        effects: [
            { type: EffectType.SUMMON, value: 'air_elemental' }
        ],
        upgradeBonus: {
            manaCostReduction: 10
        },
        requirements: {
            heroLevel: 18,
            magicSchoolLevel: {
                [MagicSchool.AIR]: 3
            }
        },
        animation: 'effect_summon_air',
        sound: 'sfx_summon'
    }
];

// ==================== 综合导出 ====================

/** 所有魔法配置 */
export const AllSpells: SpellConfig[] = [
    ...FireSpells,
    ...WaterSpells,
    ...EarthSpells,
    ...AirSpells
];

/** 魔法配置映射 */
export const SpellConfigMap: Map<string, SpellConfig> = new Map(
    AllSpells.map(spell => [spell.id, spell])
);

/** 按派系分组的魔法 */
export const SpellsBySchool: Record<string, SpellConfig[]> = {
    [MagicSchool.FIRE]: FireSpells,
    [MagicSchool.WATER]: WaterSpells,
    [MagicSchool.EARTH]: EarthSpells,
    [MagicSchool.AIR]: AirSpells
};

/** 按等级分组的魔法 */
export const SpellsByLevel: Record<number, SpellConfig[]> = {
    1: AllSpells.filter(s => s.level === SpellLevel.LEVEL_1),
    2: AllSpells.filter(s => s.level === SpellLevel.LEVEL_2),
    3: AllSpells.filter(s => s.level === SpellLevel.LEVEL_3),
    4: AllSpells.filter(s => s.level === SpellLevel.LEVEL_4),
    5: AllSpells.filter(s => s.level === SpellLevel.LEVEL_5)
};

/** 魔法神殿配置 */
export const MagicShrines: { [key: string]: import('../config/MagicBookTypes').MagicShrineConfig } = {
    shrine_fire_1: {
        id: 'shrine_fire_1',
        name: '火系魔法神殿',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_1,
        spells: ['spell_magic_arrow', 'spell_bloodlust'],
        learnCost: { gold: 500 },
        upgradeCost: { gold: 1000, spellScrolls: 3 }
    },
    shrine_fire_2: {
        id: 'shrine_fire_2',
        name: '高级火系魔法神殿',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_3,
        spells: ['spell_fireball', 'spell_fire_wall', 'spell_inferno'],
        learnCost: { gold: 2000 },
        upgradeCost: { gold: 5000, spellScrolls: 10 }
    },
    shrine_water_1: {
        id: 'shrine_water_1',
        name: '水系魔法神殿',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_1,
        spells: ['spell_bless', 'spell_cure', 'spell_weakness'],
        learnCost: { gold: 500 },
        upgradeCost: { gold: 1000, spellScrolls: 3 }
    },
    shrine_water_2: {
        id: 'shrine_water_2',
        name: '高级水系魔法神殿',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_3,
        spells: ['spell_ice_bolt', 'spell_frost_ring', 'spell_mass_bless'],
        learnCost: { gold: 2000 },
        upgradeCost: { gold: 5000, spellScrolls: 10 }
    },
    shrine_earth_1: {
        id: 'shrine_earth_1',
        name: '土系魔法神殿',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_1,
        spells: ['spell_stoneskin', 'spell_slow'],
        learnCost: { gold: 500 },
        upgradeCost: { gold: 1000, spellScrolls: 3 }
    },
    shrine_earth_2: {
        id: 'shrine_earth_2',
        name: '高级土系魔法神殿',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_3,
        spells: ['spell_quicksand', 'spell_death_ripple', 'spell_meteor_shower'],
        learnCost: { gold: 2000 },
        upgradeCost: { gold: 5000, spellScrolls: 10 }
    },
    shrine_air_1: {
        id: 'shrine_air_1',
        name: '气系魔法神殿',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_1,
        spells: ['spell_haste', 'spell_lightning_bolt'],
        learnCost: { gold: 500 },
        upgradeCost: { gold: 1000, spellScrolls: 3 }
    },
    shrine_air_2: {
        id: 'shrine_air_2',
        name: '高级气系魔法神殿',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_3,
        spells: ['spell_chain_lightning', 'spell_mass_haste', 'spell_town_portal'],
        learnCost: { gold: 2000 },
        upgradeCost: { gold: 5000, spellScrolls: 10 }
    }
};