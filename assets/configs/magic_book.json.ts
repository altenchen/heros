/**
 * 魔法书配置
 * 英雄无敌Ⅲ：传承
 * 包含所有魔法的配置数据
 */

import { SpellConfig, SpellLevel, SpellType, SpellCategory } from '../scripts/config/MagicBookTypes';
import { MagicSchool, TargetType, EffectType, StatusEffect } from '../scripts/config/GameTypes';

// ==================== 火系魔法 ====================

/** 火系魔法配置 */
const FireSpells: SpellConfig[] = [
    {
        id: 'spell_fire_arrow',
        name: '火焰箭',
        description: '发射一支火焰箭，对单个敌人造成伤害。',
        icon: 'spell_fire_arrow',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 5,
        baseDamage: 10,
        effects: [
            {
                type: EffectType.DAMAGE,
                value: 'spellPower * 10 + 10'
            }
        ],
        upgradeBonus: {
            damageBonus: 5,
            manaCostReduction: 0
        },
        animation: 'fire_arrow',
        sound: 'sfx_fire_arrow'
    },
    {
        id: 'spell_fire_ball',
        name: '火球术',
        description: '发射一个火球，对范围内敌人造成伤害。',
        icon: 'spell_fire_ball',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.AREA,
        range: 4,
        areaRadius: 1,
        manaCost: 15,
        baseDamage: 15,
        effects: [
            {
                type: EffectType.DAMAGE,
                value: 'spellPower * 15 + 15'
            }
        ],
        upgradeBonus: {
            damageBonus: 10,
            rangeBonus: 0
        },
        animation: 'fire_ball',
        sound: 'sfx_fire_ball'
    },
    {
        id: 'spell_fire_wall',
        name: '火焰墙',
        description: '创建一道火焰墙，对穿过的敌人造成伤害。',
        icon: 'spell_fire_wall',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_3,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.AREA,
        range: 3,
        areaRadius: 2,
        manaCost: 25,
        baseDamage: 20,
        effects: [
            {
                type: EffectType.DAMAGE,
                value: 'spellPower * 20 + 10'
            }
        ],
        upgradeBonus: {
            damageBonus: 15,
            durationBonus: 1
        },
        animation: 'fire_wall',
        sound: 'sfx_fire_wall'
    },
    {
        id: 'spell_inferno',
        name: '地狱火',
        description: '召唤地狱之火，对所有敌人造成大量伤害。',
        icon: 'spell_inferno',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_4,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.ALL_ENEMY,
        range: 99,
        manaCost: 40,
        baseDamage: 30,
        effects: [
            {
                type: EffectType.DAMAGE,
                value: 'spellPower * 30 + 20'
            }
        ],
        upgradeBonus: {
            damageBonus: 20
        },
        animation: 'inferno',
        sound: 'sfx_inferno'
    },
    {
        id: 'spell_armageddon',
        name: '末日审判',
        description: '召唤末日审判，对所有单位造成毁灭性伤害。',
        icon: 'spell_armageddon',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_5,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.AREA,
        range: 99,
        areaRadius: 99,
        manaCost: 60,
        baseDamage: 50,
        effects: [
            {
                type: EffectType.DAMAGE,
                value: 'spellPower * 50 + 30'
            }
        ],
        upgradeBonus: {
            damageBonus: 30
        },
        requirements: {
            heroLevel: 20,
            magicSchoolLevel: {
                [MagicSchool.FIRE]: 3
            }
        },
        animation: 'armageddon',
        sound: 'sfx_armageddon'
    },
    {
        id: 'spell_bloodlust',
        name: '嗜血术',
        description: '增加己方单位的攻击力。',
        icon: 'spell_bloodlust',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 8,
        effects: [
            {
                type: EffectType.BUFF,
                value: 6,
                status: StatusEffect.ATTACK_UP,
                duration: 3
            }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'bloodlust',
        sound: 'sfx_buff'
    },
    {
        id: 'spell_frenzy',
        name: '狂暴术',
        description: '大幅增加己方单位的攻击力，但降低防御。',
        icon: 'spell_frenzy',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_3,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 20,
        effects: [
            {
                type: EffectType.BUFF,
                value: 12,
                status: StatusEffect.ATTACK_UP,
                duration: 3
            },
            {
                type: EffectType.DEBUFF,
                value: -3,
                status: StatusEffect.DEFENSE_DOWN,
                duration: 3
            }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'frenzy',
        sound: 'sfx_buff'
    }
];

// ==================== 水系魔法 ====================

/** 水系魔法配置 */
const WaterSpells: SpellConfig[] = [
    {
        id: 'spell_ice_bolt',
        name: '冰箭',
        description: '发射一支冰箭，对单个敌人造成伤害并减速。',
        icon: 'spell_ice_bolt',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 5,
        baseDamage: 8,
        effects: [
            {
                type: EffectType.DAMAGE,
                value: 'spellPower * 8 + 8'
            },
            {
                type: EffectType.DEBUFF,
                value: 2,
                status: StatusEffect.SLOW,
                duration: 2
            }
        ],
        upgradeBonus: {
            damageBonus: 4,
            durationBonus: 1
        },
        animation: 'ice_bolt',
        sound: 'sfx_ice_bolt'
    },
    {
        id: 'spell_frost_ring',
        name: '冰环术',
        description: '释放冰环，对范围内敌人造成伤害并减速。',
        icon: 'spell_frost_ring',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.AREA,
        range: 4,
        areaRadius: 1,
        manaCost: 12,
        baseDamage: 12,
        effects: [
            {
                type: EffectType.DAMAGE,
                value: 'spellPower * 12 + 12'
            },
            {
                type: EffectType.DEBUFF,
                value: 2,
                status: StatusEffect.SLOW,
                duration: 2
            }
        ],
        upgradeBonus: {
            damageBonus: 8,
            durationBonus: 1
        },
        animation: 'frost_ring',
        sound: 'sfx_frost_ring'
    },
    {
        id: 'spell_cure',
        name: '治疗术',
        description: '治疗单个己方单位，并驱散负面效果。',
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
            {
                type: EffectType.HEAL,
                value: 'spellPower * 10 + 10'
            },
            {
                type: EffectType.DISPEL,
                value: 0
            }
        ],
        upgradeBonus: {
            healBonus: 5
        },
        animation: 'cure',
        sound: 'sfx_heal'
    },
    {
        id: 'spell_mass_cure',
        name: '群体治疗',
        description: '治疗所有己方单位，并驱散负面效果。',
        icon: 'spell_mass_cure',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_4,
        type: SpellType.COMBAT,
        category: SpellCategory.HEAL,
        targetType: TargetType.ALL_ALLY,
        range: 99,
        manaCost: 35,
        baseHeal: 20,
        effects: [
            {
                type: EffectType.HEAL,
                value: 'spellPower * 20 + 15'
            },
            {
                type: EffectType.DISPEL,
                value: 0
            }
        ],
        upgradeBonus: {
            healBonus: 10
        },
        animation: 'mass_cure',
        sound: 'sfx_heal'
    },
    {
        id: 'spell_bless',
        name: '祝福术',
        description: '祝福己方单位，提高攻击和防御。',
        icon: 'spell_bless',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 10,
        effects: [
            {
                type: EffectType.BUFF,
                value: 3,
                status: StatusEffect.ATTACK_UP,
                duration: 4
            },
            {
                type: EffectType.BUFF,
                value: 3,
                status: StatusEffect.DEFENSE_UP,
                duration: 4
            }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'bless',
        sound: 'sfx_buff'
    },
    {
        id: 'spell_mirror_image',
        name: '镜像术',
        description: '创建一个单位的镜像分身。',
        icon: 'spell_mirror_image',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_5,
        type: SpellType.COMBAT,
        category: SpellCategory.SPECIAL,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 50,
        effects: [
            {
                type: EffectType.SPECIAL,
                value: 1
            }
        ],
        upgradeBonus: {},
        requirements: {
            heroLevel: 15,
            magicSchoolLevel: {
                [MagicSchool.WATER]: 3
            }
        },
        animation: 'mirror_image',
        sound: 'sfx_special'
    }
];

// ==================== 土系魔法 ====================

/** 土系魔法配置 */
const EarthSpells: SpellConfig[] = [
    {
        id: 'spell_stone_skin',
        name: '石肤术',
        description: '增加己方单位的防御力。',
        icon: 'spell_stone_skin',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 6,
        effects: [
            {
                type: EffectType.BUFF,
                value: 6,
                status: StatusEffect.DEFENSE_UP,
                duration: 3
            }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'stone_skin',
        sound: 'sfx_buff'
    },
    {
        id: 'spell_slow',
        name: '迟缓术',
        description: '降低敌人的移动速度。',
        icon: 'spell_slow',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.DEBUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 6,
        effects: [
            {
                type: EffectType.DEBUFF,
                value: 3,
                status: StatusEffect.SLOW,
                duration: 3
            }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'slow',
        sound: 'sfx_debuff'
    },
    {
        id: 'spell_quicksand',
        name: '流沙术',
        description: '创建流沙区域，减速范围内的敌人。',
        icon: 'spell_quicksand',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.DEBUFF,
        targetType: TargetType.AREA,
        range: 4,
        areaRadius: 2,
        manaCost: 12,
        effects: [
            {
                type: EffectType.DEBUFF,
                value: 4,
                status: StatusEffect.SLOW,
                duration: 4
            }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'quicksand',
        sound: 'sfx_debuff'
    },
    {
        id: 'spell_meteor_shower',
        name: '流星雨',
        description: '召唤流星雨，对范围内敌人造成大量伤害。',
        icon: 'spell_meteor_shower',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_4,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.AREA,
        range: 4,
        areaRadius: 2,
        manaCost: 40,
        baseDamage: 40,
        effects: [
            {
                type: EffectType.DAMAGE,
                value: 'spellPower * 40 + 25'
            }
        ],
        upgradeBonus: {
            damageBonus: 25
        },
        animation: 'meteor_shower',
        sound: 'sfx_meteor'
    },
    {
        id: 'spell_resurrection',
        name: '复活术',
        description: '复活阵亡的单位。',
        icon: 'spell_resurrection',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_5,
        type: SpellType.COMBAT,
        category: SpellCategory.HEAL,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 50,
        baseHeal: 50,
        effects: [
            {
                type: EffectType.HEAL,
                value: 'spellPower * 50 + 30'
            }
        ],
        upgradeBonus: {
            healBonus: 25
        },
        requirements: {
            heroLevel: 18,
            magicSchoolLevel: {
                [MagicSchool.EARTH]: 3
            }
        },
        animation: 'resurrection',
        sound: 'sfx_resurrection'
    },
    {
        id: 'spell_shield',
        name: '护盾术',
        description: '为目标创建护盾，吸收伤害。',
        icon: 'spell_shield',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_3,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 20,
        effects: [
            {
                type: EffectType.BUFF,
                value: 'spellPower * 20',
                status: StatusEffect.SHIELD,
                duration: 3
            }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'shield',
        sound: 'sfx_shield'
    }
];

// ==================== 气系魔法 ====================

/** 气系魔法配置 */
const AirSpells: SpellConfig[] = [
    {
        id: 'spell_lightning_bolt',
        name: '闪电箭',
        description: '发射闪电，对单个敌人造成伤害。',
        icon: 'spell_lightning_bolt',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.SINGLE,
        range: 5,
        manaCost: 6,
        baseDamage: 12,
        effects: [
            {
                type: EffectType.DAMAGE,
                value: 'spellPower * 12 + 12'
            }
        ],
        upgradeBonus: {
            damageBonus: 6
        },
        animation: 'lightning_bolt',
        sound: 'sfx_lightning'
    },
    {
        id: 'spell_chain_lightning',
        name: '连锁闪电',
        description: '发射连锁闪电，在多个敌人之间跳跃。',
        icon: 'spell_chain_lightning',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_3,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.SINGLE,
        range: 5,
        manaCost: 24,
        baseDamage: 25,
        effects: [
            {
                type: EffectType.DAMAGE,
                value: 'spellPower * 25 + 20'
            }
        ],
        upgradeBonus: {
            damageBonus: 15
        },
        animation: 'chain_lightning',
        sound: 'sfx_lightning'
    },
    {
        id: 'spell_haste',
        name: '加速术',
        description: '提高己方单位的移动速度和攻击速度。',
        icon: 'spell_haste',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_1,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 8,
        effects: [
            {
                type: EffectType.BUFF,
                value: 2,
                status: StatusEffect.HASTE,
                duration: 3
            }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'haste',
        sound: 'sfx_buff'
    },
    {
        id: 'spell_mass_haste',
        name: '群体加速',
        description: '提高所有己方单位的移动速度和攻击速度。',
        icon: 'spell_mass_haste',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_4,
        type: SpellType.COMBAT,
        category: SpellCategory.BUFF,
        targetType: TargetType.ALL_ALLY,
        range: 99,
        manaCost: 35,
        effects: [
            {
                type: EffectType.BUFF,
                value: 2,
                status: StatusEffect.HASTE,
                duration: 3
            }
        ],
        upgradeBonus: {
            durationBonus: 1
        },
        animation: 'mass_haste',
        sound: 'sfx_buff'
    },
    {
        id: 'spell_dispel',
        name: '驱散术',
        description: '驱散目标身上的所有效果。',
        icon: 'spell_dispel',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_2,
        type: SpellType.COMBAT,
        category: SpellCategory.SPECIAL,
        targetType: TargetType.SINGLE,
        range: 4,
        manaCost: 10,
        effects: [
            {
                type: EffectType.DISPEL,
                value: 0
            }
        ],
        upgradeBonus: {},
        animation: 'dispel',
        sound: 'sfx_dispel'
    },
    {
        id: 'spell_dimension_door',
        name: '时空门',
        description: '传送目标单位到指定位置。',
        icon: 'spell_dimension_door',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_5,
        type: SpellType.COMBAT,
        category: SpellCategory.TELEPORT,
        targetType: TargetType.SINGLE,
        range: 99,
        manaCost: 45,
        effects: [
            {
                type: EffectType.SPECIAL,
                value: 1
            }
        ],
        upgradeBonus: {},
        requirements: {
            heroLevel: 15,
            magicSchoolLevel: {
                [MagicSchool.AIR]: 3
            }
        },
        animation: 'dimension_door',
        sound: 'sfx_teleport'
    },
    {
        id: 'spell_tornado',
        name: '龙卷风',
        description: '召唤龙卷风，对敌人造成伤害并击退。',
        icon: 'spell_tornado',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_4,
        type: SpellType.COMBAT,
        category: SpellCategory.DAMAGE,
        targetType: TargetType.AREA,
        range: 4,
        areaRadius: 1,
        manaCost: 35,
        baseDamage: 30,
        effects: [
            {
                type: EffectType.DAMAGE,
                value: 'spellPower * 30 + 20'
            },
            {
                type: EffectType.DEBUFF,
                value: 1,
                status: StatusEffect.STUN,
                duration: 1
            }
        ],
        upgradeBonus: {
            damageBonus: 20,
            durationBonus: 1
        },
        animation: 'tornado',
        sound: 'sfx_tornado'
    }
];

// ==================== 导出配置 ====================

/** 所有魔法配置 */
export const AllSpells: SpellConfig[] = [
    ...FireSpells,
    ...WaterSpells,
    ...EarthSpells,
    ...AirSpells
];

/** 按派系分类的魔法 */
export const SpellsBySchool: Record<MagicSchool, SpellConfig[]> = {
    [MagicSchool.FIRE]: FireSpells,
    [MagicSchool.WATER]: WaterSpells,
    [MagicSchool.EARTH]: EarthSpells,
    [MagicSchool.AIR]: AirSpells
};

/** 魔法配置映射 */
export const SpellConfigMap: Map<string, SpellConfig> = new Map(
    AllSpells.map(spell => [spell.id, spell])
);

/** 按等级分类的魔法 */
export const SpellsByLevel: Record<SpellLevel, SpellConfig[]> = {
    [SpellLevel.LEVEL_1]: AllSpells.filter(s => s.level === SpellLevel.LEVEL_1),
    [SpellLevel.LEVEL_2]: AllSpells.filter(s => s.level === SpellLevel.LEVEL_2),
    [SpellLevel.LEVEL_3]: AllSpells.filter(s => s.level === SpellLevel.LEVEL_3),
    [SpellLevel.LEVEL_4]: AllSpells.filter(s => s.level === SpellLevel.LEVEL_4),
    [SpellLevel.LEVEL_5]: AllSpells.filter(s => s.level === SpellLevel.LEVEL_5)
};

/** 魔法神殿配置 */
export const MagicShrines = [
    {
        id: 'shrine_fire_1',
        name: '火焰神殿',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_1,
        spells: ['spell_fire_arrow', 'spell_bloodlust'],
        learnCost: { gold: 500 },
        upgradeCost: { gold: 1000, spellScrolls: 3 }
    },
    {
        id: 'shrine_fire_2',
        name: '烈焰神殿',
        school: MagicSchool.FIRE,
        level: SpellLevel.LEVEL_2,
        spells: ['spell_fire_ball', 'spell_fire_wall', 'spell_frenzy'],
        learnCost: { gold: 1000 },
        upgradeCost: { gold: 2000, spellScrolls: 5 }
    },
    {
        id: 'shrine_water_1',
        name: '流水神殿',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_1,
        spells: ['spell_ice_bolt', 'spell_cure', 'spell_bless'],
        learnCost: { gold: 500 },
        upgradeCost: { gold: 1000, spellScrolls: 3 }
    },
    {
        id: 'shrine_water_2',
        name: '深洋神殿',
        school: MagicSchool.WATER,
        level: SpellLevel.LEVEL_2,
        spells: ['spell_frost_ring', 'spell_mass_cure'],
        learnCost: { gold: 1000 },
        upgradeCost: { gold: 2000, spellScrolls: 5 }
    },
    {
        id: 'shrine_earth_1',
        name: '大地神殿',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_1,
        spells: ['spell_stone_skin', 'spell_slow', 'spell_shield'],
        learnCost: { gold: 500 },
        upgradeCost: { gold: 1000, spellScrolls: 3 }
    },
    {
        id: 'shrine_earth_2',
        name: '山脉神殿',
        school: MagicSchool.EARTH,
        level: SpellLevel.LEVEL_2,
        spells: ['spell_quicksand', 'spell_meteor_shower', 'spell_resurrection'],
        learnCost: { gold: 1000 },
        upgradeCost: { gold: 2000, spellScrolls: 5 }
    },
    {
        id: 'shrine_air_1',
        name: '风之神殿',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_1,
        spells: ['spell_lightning_bolt', 'spell_haste', 'spell_dispel'],
        learnCost: { gold: 500 },
        upgradeCost: { gold: 1000, spellScrolls: 3 }
    },
    {
        id: 'shrine_air_2',
        name: '风暴神殿',
        school: MagicSchool.AIR,
        level: SpellLevel.LEVEL_2,
        spells: ['spell_chain_lightning', 'spell_mass_haste', 'spell_tornado', 'spell_dimension_door'],
        learnCost: { gold: 1000 },
        upgradeCost: { gold: 2000, spellScrolls: 5 }
    }
];