/**
 * 兵种配置数据
 * 7大种族 × 6阶 = 42种兵种
 */

import { UnitConfig, Race, UnitType, ResourceType, StatusEffect, EffectType } from '../scripts/config/GameTypes';

export const UnitConfigs: UnitConfig[] = [
    // ==================== 圣堂（Castle）====================
    {
        id: 'castle_tier1_pikeman',
        name: '枪兵',
        race: Race.CASTLE,
        tier: 1,
        type: UnitType.DEFENSE,
        attack: 4,
        defense: 6,
        speed: 4,
        hp: 10,
        damage: [1, 3],
        growth: 14,
        cost: { [ResourceType.GOLD]: 60 },
        specialty: {
            id: 'pikeman_charge',
            name: '斜向攻击',
            description: '可同时攻击前方3个相邻格子',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                range: 3
            }
        }
    },
    {
        id: 'castle_tier2_archer',
        name: '弓箭手',
        race: Race.CASTLE,
        tier: 2,
        type: UnitType.SHOOTER,
        attack: 6,
        defense: 3,
        speed: 6,
        hp: 10,
        damage: [2, 3],
        growth: 9,
        cost: { [ResourceType.GOLD]: 100 },
        specialty: {
            id: 'archer_ranged',
            name: '远程',
            description: '半屏内100%伤害，超半屏50%',
            type: 'passive',
            effect: {
                type: EffectType.DAMAGE
            }
        }
    },
    {
        id: 'castle_tier3_griffin',
        name: '狮鹫',
        race: Race.CASTLE,
        tier: 3,
        type: UnitType.ASSAULT,
        attack: 8,
        defense: 8,
        speed: 6,
        hp: 25,
        damage: [3, 5],
        growth: 7,
        cost: { [ResourceType.GOLD]: 200 },
        specialty: {
            id: 'griffin_counter',
            name: '无限反击',
            description: '被攻击时无限次反击',
            type: 'passive',
            trigger: 'on_hit',
            effect: {
                type: EffectType.DAMAGE,
                value: 'counter'
            }
        }
    },
    {
        id: 'castle_tier4_swordsman',
        name: '剑士',
        race: Race.CASTLE,
        tier: 4,
        type: UnitType.ATTACK,
        attack: 10,
        defense: 12,
        speed: 5,
        hp: 30,
        damage: [6, 9],
        growth: 4,
        cost: { [ResourceType.GOLD]: 300 },
        specialty: {
            id: 'swordsman_combo',
            name: '连击',
            description: '每次攻击有20%概率连击',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                probability: 0.2,
                value: 'double'
            }
        }
    },
    {
        id: 'castle_tier5_monk',
        name: '僧侣',
        race: Race.CASTLE,
        tier: 5,
        type: UnitType.MAGIC,
        attack: 12,
        defense: 7,
        speed: 5,
        hp: 30,
        damage: [10, 12],
        growth: 3,
        cost: { [ResourceType.GOLD]: 400 },
        specialty: {
            id: 'monk_heal',
            name: '治疗',
            description: '可消耗专注点治疗友军',
            type: 'active',
            effect: {
                type: EffectType.HEAL,
                value: 50
            },
            focusCost: 1
        }
    },
    {
        id: 'castle_tier6_angel',
        name: '大天使',
        race: Race.CASTLE,
        tier: 6,
        type: UnitType.ASSAULT,
        attack: 20,
        defense: 20,
        speed: 12,
        hp: 50,
        damage: [50, 50],
        growth: 1,
        cost: { [ResourceType.GOLD]: 3000, [ResourceType.GEM]: 2 },
        specialty: {
            id: 'angel_revive',
            name: '复活',
            description: '消耗专注点复活1个阵亡单位',
            type: 'active',
            effect: {
                type: EffectType.REVIVE,
                value: 0.3
            },
            focusCost: 2
        }
    },

    // ==================== 壁垒（Rampart）====================
    {
        id: 'rampart_tier1_centaur',
        name: '半人马',
        race: Race.RAMPART,
        tier: 1,
        type: UnitType.ASSAULT,
        attack: 5,
        defense: 3,
        speed: 6,
        hp: 8,
        damage: [2, 3],
        growth: 14,
        cost: { [ResourceType.GOLD]: 70 },
        specialty: {
            id: 'centaur_first_strike',
            name: '先发制人',
            description: '战斗开始时先攻+3',
            type: 'passive',
            effect: {
                type: EffectType.BUFF,
                status: StatusEffect.HASTE,
                value: 3
            }
        }
    },
    {
        id: 'rampart_tier2_dwarf',
        name: '矮人',
        race: Race.RAMPART,
        tier: 2,
        type: UnitType.DEFENSE,
        attack: 6,
        defense: 7,
        speed: 3,
        hp: 20,
        damage: [2, 4],
        growth: 10,
        cost: { [ResourceType.GOLD]: 150 },
        specialty: {
            id: 'dwarf_magic_resist',
            name: '抗魔',
            description: '50%概率免疫魔法伤害',
            type: 'passive',
            trigger: 'on_hit',
            effect: {
                type: EffectType.DEBUFF,
                probability: 0.5,
                status: StatusEffect.SHIELD
            }
        }
    },
    {
        id: 'rampart_tier3_wood_elf',
        name: '木精灵',
        race: Race.RAMPART,
        tier: 3,
        type: UnitType.SHOOTER,
        attack: 9,
        defense: 5,
        speed: 6,
        hp: 15,
        damage: [3, 5],
        growth: 6,
        cost: { [ResourceType.GOLD]: 225 },
        specialty: {
            id: 'wood_elf_double_shot',
            name: '双箭',
            description: '远程攻击时射出2支箭',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                value: 2
            }
        }
    },
    {
        id: 'rampart_tier4_pegasus',
        name: '飞马',
        race: Race.RAMPART,
        tier: 4,
        type: UnitType.ASSAULT,
        attack: 9,
        defense: 8,
        speed: 8,
        hp: 30,
        damage: [5, 9],
        growth: 4,
        cost: { [ResourceType.GOLD]: 350 },
        specialty: {
            id: 'pegasus_fly',
            name: '飞行',
            description: '无视地形障碍',
            type: 'passive',
            effect: {
                type: EffectType.BUFF
            }
        }
    },
    {
        id: 'rampart_tier5_dendroid',
        name: '树妖',
        race: Race.RAMPART,
        tier: 5,
        type: UnitType.DEFENSE,
        attack: 10,
        defense: 12,
        speed: 3,
        hp: 55,
        damage: [10, 14],
        growth: 2,
        cost: { [ResourceType.GOLD]: 500 },
        specialty: {
            id: 'dendroid_root',
            name: '扎根',
            description: '无法移动，防御+30%',
            type: 'passive',
            effect: {
                type: EffectType.BUFF,
                value: 0.3
            }
        }
    },
    {
        id: 'rampart_tier6_gold_dragon',
        name: '金龙',
        race: Race.RAMPART,
        tier: 6,
        type: UnitType.ASSAULT,
        attack: 19,
        defense: 18,
        speed: 11,
        hp: 80,
        damage: [40, 50],
        growth: 1,
        cost: { [ResourceType.GOLD]: 4000, [ResourceType.CRYSTAL]: 2 },
        specialty: {
            id: 'gold_dragon_immune',
            name: '免疫魔法',
            description: '免疫所有魔法效果',
            type: 'passive',
            effect: {
                type: EffectType.BUFF,
                status: StatusEffect.SHIELD
            }
        }
    },

    // ==================== 墓园（Necropolis）====================
    {
        id: 'necropolis_tier1_skeleton',
        name: '骷髅兵',
        race: Race.NECROPOLIS,
        tier: 1,
        type: UnitType.ATTACK,
        attack: 5,
        defense: 4,
        speed: 4,
        hp: 6,
        damage: [1, 3],
        growth: 20,
        cost: { [ResourceType.GOLD]: 40 },
        specialty: {
            id: 'skeleton_numbers',
            name: '数量优势',
            description: '每有1个同类单位，攻击+1%',
            type: 'passive',
            effect: {
                type: EffectType.BUFF,
                value: 'per_unit_0.01'
            }
        }
    },
    {
        id: 'necropolis_tier2_zombie',
        name: '僵尸',
        race: Race.NECROPOLIS,
        tier: 2,
        type: UnitType.DEFENSE,
        attack: 5,
        defense: 5,
        speed: 2,
        hp: 20,
        damage: [2, 3],
        growth: 10,
        cost: { [ResourceType.GOLD]: 50 },
        specialty: {
            id: 'zombie_disease',
            name: '疾病',
            description: '攻击降低目标速度1点',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DEBUFF,
                status: StatusEffect.SLOW,
                value: 1
            }
        }
    },
    {
        id: 'necropolis_tier3_wraith',
        name: '幽灵',
        race: Race.NECROPOLIS,
        tier: 3,
        type: UnitType.ASSAULT,
        attack: 8,
        defense: 6,
        speed: 7,
        hp: 18,
        damage: [3, 5],
        growth: 6,
        cost: { [ResourceType.GOLD]: 200 },
        specialty: {
            id: 'wraith_aging',
            name: '衰老',
            description: '攻击降低目标防御10%',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DEBUFF,
                status: StatusEffect.AGING,
                value: 0.1
            }
        }
    },
    {
        id: 'necropolis_tier4_vampire',
        name: '吸血鬼',
        race: Race.NECROPOLIS,
        tier: 4,
        type: UnitType.ASSAULT,
        attack: 10,
        defense: 9,
        speed: 6,
        hp: 30,
        damage: [5, 8],
        growth: 4,
        cost: { [ResourceType.GOLD]: 500 },
        specialty: {
            id: 'vampire_drain',
            name: '吸血',
            description: '造成伤害的20%恢复生命值',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.HEAL,
                value: 0.2
            }
        }
    },
    {
        id: 'necropolis_tier5_lich',
        name: '尸巫',
        race: Race.NECROPOLIS,
        tier: 5,
        type: UnitType.MAGIC,
        attack: 13,
        defense: 10,
        speed: 5,
        hp: 30,
        damage: [11, 15],
        growth: 2,
        cost: { [ResourceType.GOLD]: 600 },
        specialty: {
            id: 'lich_death_cloud',
            name: '死亡之云',
            description: '范围攻击，无视防御',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                range: 1
            }
        }
    },
    {
        id: 'necropolis_tier6_ghost_dragon',
        name: '鬼龙',
        race: Race.NECROPOLIS,
        tier: 6,
        type: UnitType.ASSAULT,
        attack: 19,
        defense: 17,
        speed: 14,
        hp: 75,
        damage: [25, 35],
        growth: 1,
        cost: { [ResourceType.GOLD]: 3400, [ResourceType.MERCURY]: 2 },
        specialty: {
            id: 'ghost_dragon_aging',
            name: '衰老',
            description: '攻击有20%概率使目标衰老',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DEBUFF,
                status: StatusEffect.AGING,
                probability: 0.2
            }
        }
    },

    // ==================== 地下城（Dungeon）====================
    {
        id: 'dungeon_tier1_troglodyte',
        name: '穴居人',
        race: Race.DUNGEON,
        tier: 1,
        type: UnitType.ATTACK,
        attack: 4,
        defense: 4,
        speed: 4,
        hp: 5,
        damage: [1, 3],
        growth: 14,
        cost: { [ResourceType.GOLD]: 50 },
        specialty: {
            id: 'troglodyte_blind',
            name: '盲眼',
            description: '不受失明魔法影响',
            type: 'passive',
            effect: {
                type: EffectType.BUFF
            }
        }
    },
    {
        id: 'dungeon_tier2_harpy',
        name: '鹰身女妖',
        race: Race.DUNGEON,
        tier: 2,
        type: UnitType.ASSAULT,
        attack: 6,
        defense: 5,
        speed: 6,
        hp: 14,
        damage: [1, 4],
        growth: 8,
        cost: { [ResourceType.GOLD]: 130 },
        specialty: {
            id: 'harpy_return',
            name: '返回',
            description: '攻击后返回原位置',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.BUFF
            }
        }
    },
    {
        id: 'dungeon_tier3_evil_eye',
        name: '邪眼',
        race: Race.DUNGEON,
        tier: 3,
        type: UnitType.SHOOTER,
        attack: 8,
        defense: 7,
        speed: 5,
        hp: 22,
        damage: [3, 5],
        growth: 6,
        cost: { [ResourceType.GOLD]: 250 },
        specialty: {
            id: 'evil_eye_pierce',
            name: '穿透',
            description: '远程攻击穿透目标',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                range: 2
            }
        }
    },
    {
        id: 'dungeon_tier4_medusa',
        name: '美杜莎',
        race: Race.DUNGEON,
        tier: 4,
        type: UnitType.SHOOTER,
        attack: 9,
        defense: 9,
        speed: 5,
        hp: 25,
        damage: [6, 9],
        growth: 4,
        cost: { [ResourceType.GOLD]: 450 },
        specialty: {
            id: 'medusa_stone',
            name: '石化',
            description: '攻击有20%概率石化目标',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DEBUFF,
                status: StatusEffect.STONE,
                probability: 0.2,
                duration: 1
            }
        }
    },
    {
        id: 'dungeon_tier5_minotaur',
        name: '牛头怪',
        race: Race.DUNGEON,
        tier: 5,
        type: UnitType.ATTACK,
        attack: 14,
        defense: 12,
        speed: 6,
        hp: 50,
        damage: [12, 20],
        growth: 3,
        cost: { [ResourceType.GOLD]: 600 },
        specialty: {
            id: 'minotaur_berserk',
            name: '狂暴',
            description: '生命值低于30%时攻击+50%',
            type: 'passive',
            effect: {
                type: EffectType.BUFF,
                value: 0.5
            }
        }
    },
    {
        id: 'dungeon_tier6_black_dragon',
        name: '黑龙',
        race: Race.DUNGEON,
        tier: 6,
        type: UnitType.ASSAULT,
        attack: 25,
        defense: 25,
        speed: 15,
        hp: 100,
        damage: [40, 50],
        growth: 1,
        cost: { [ResourceType.GOLD]: 4500, [ResourceType.SULFUR]: 3 },
        specialty: {
            id: 'black_dragon_immune',
            name: '免疫魔法+末日审判',
            description: '免疫所有魔法',
            type: 'passive',
            effect: {
                type: EffectType.BUFF,
                status: StatusEffect.SHIELD
            }
        }
    },

    // ==================== 塔楼（Tower）====================
    {
        id: 'tower_tier1_sprite',
        name: '大妖精',
        race: Race.TOWER,
        tier: 1,
        type: UnitType.SHOOTER,
        attack: 4,
        defense: 4,
        speed: 4,
        hp: 5,
        damage: [1, 2],
        growth: 16,
        cost: { [ResourceType.GOLD]: 60 },
        specialty: {
            id: 'sprite_mechanical',
            name: '机械',
            description: '不受心智魔法影响',
            type: 'passive',
            effect: {
                type: EffectType.BUFF
            }
        }
    },
    {
        id: 'tower_tier2_gargoyle',
        name: '石像鬼',
        race: Race.TOWER,
        tier: 2,
        type: UnitType.ASSAULT,
        attack: 6,
        defense: 6,
        speed: 6,
        hp: 16,
        damage: [2, 4],
        growth: 8,
        cost: { [ResourceType.GOLD]: 130 },
        specialty: {
            id: 'gargoyle_stone',
            name: '石像',
            description: '可变为石像，防御+100%',
            type: 'active',
            effect: {
                type: EffectType.BUFF,
                status: StatusEffect.STONE,
                value: 1.0
            }
        }
    },
    {
        id: 'tower_tier3_golem',
        name: '铁人',
        race: Race.TOWER,
        tier: 3,
        type: UnitType.DEFENSE,
        attack: 7,
        defense: 10,
        speed: 3,
        hp: 35,
        damage: [4, 5],
        growth: 5,
        cost: { [ResourceType.GOLD]: 300 },
        specialty: {
            id: 'golem_magic',
            name: '魔像',
            description: '免疫部分魔法',
            type: 'passive',
            effect: {
                type: EffectType.BUFF
            }
        }
    },
    {
        id: 'tower_tier4_mage',
        name: '法师',
        race: Race.TOWER,
        tier: 4,
        type: UnitType.MAGIC,
        attack: 10,
        defense: 7,
        speed: 5,
        hp: 25,
        damage: [7, 9],
        growth: 4,
        cost: { [ResourceType.GOLD]: 500 },
        specialty: {
            id: 'mage_enhance',
            name: '法术增强',
            description: '英雄魔法效果+20%',
            type: 'passive',
            effect: {
                type: EffectType.BUFF,
                value: 0.2
            }
        }
    },
    {
        id: 'tower_tier5_genie',
        name: '神怪',
        race: Race.TOWER,
        tier: 5,
        type: UnitType.ASSAULT,
        attack: 12,
        defense: 11,
        speed: 7,
        hp: 40,
        damage: [13, 17],
        growth: 2,
        cost: { [ResourceType.GOLD]: 700 },
        specialty: {
            id: 'genie_random',
            name: '随机增益',
            description: '每回合随机获得增益',
            type: 'passive',
            effect: {
                type: EffectType.BUFF
            }
        }
    },
    {
        id: 'tower_tier6_titan',
        name: '泰坦巨人',
        race: Race.TOWER,
        tier: 6,
        type: UnitType.SHOOTER,
        attack: 24,
        defense: 24,
        speed: 11,
        hp: 100,
        damage: [40, 70],
        growth: 1,
        cost: { [ResourceType.GOLD]: 5500, [ResourceType.GEM]: 2 },
        specialty: {
            id: 'titan_pierce',
            name: '无视防御',
            description: '远程攻击无视目标防御',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                value: 'ignore_defense'
            }
        }
    },

    // ==================== 据点（Stronghold）====================
    {
        id: 'stronghold_tier1_goblin',
        name: '大耳怪',
        race: Race.STRONGHOLD,
        tier: 1,
        type: UnitType.ATTACK,
        attack: 4,
        defense: 3,
        speed: 5,
        hp: 5,
        damage: [1, 2],
        growth: 15,
        cost: { [ResourceType.GOLD]: 40 },
        specialty: {
            id: 'goblin_plunder',
            name: '掠夺',
            description: '击败敌人获得额外金币',
            type: 'passive',
            trigger: 'on_kill',
            effect: {
                type: EffectType.BUFF,
                value: 10
            }
        }
    },
    {
        id: 'stronghold_tier2_wolf_rider',
        name: '狼骑士',
        race: Race.STRONGHOLD,
        tier: 2,
        type: UnitType.ASSAULT,
        attack: 7,
        defense: 5,
        speed: 8,
        hp: 15,
        damage: [3, 5],
        growth: 7,
        cost: { [ResourceType.GOLD]: 150 },
        specialty: {
            id: 'wolf_charge',
            name: '冲锋',
            description: '移动距离越远伤害越高',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                value: 'distance_bonus'
            }
        }
    },
    {
        id: 'stronghold_tier3_orc',
        name: '半兽人',
        race: Race.STRONGHOLD,
        tier: 3,
        type: UnitType.SHOOTER,
        attack: 8,
        defense: 4,
        speed: 5,
        hp: 15,
        damage: [2, 5],
        growth: 7,
        cost: { [ResourceType.GOLD]: 200 },
        specialty: {
            id: 'orc_precise',
            name: '精准',
            description: '远程攻击必中',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE
            }
        }
    },
    {
        id: 'stronghold_tier4_ogre',
        name: '食人魔',
        race: Race.STRONGHOLD,
        tier: 4,
        type: UnitType.ATTACK,
        attack: 13,
        defense: 7,
        speed: 4,
        hp: 40,
        damage: [6, 12],
        growth: 4,
        cost: { [ResourceType.GOLD]: 350 },
        specialty: {
            id: 'ogre_bloodlust',
            name: '嗜血',
            description: '击败敌人后攻击+10%',
            type: 'passive',
            trigger: 'on_kill',
            effect: {
                type: EffectType.BUFF,
                status: StatusEffect.BLOODLUST,
                value: 0.1
            }
        }
    },
    {
        id: 'stronghold_tier5_thunderbird',
        name: '雷鸟',
        race: Race.STRONGHOLD,
        tier: 5,
        type: UnitType.ASSAULT,
        attack: 13,
        defense: 11,
        speed: 7,
        hp: 60,
        damage: [11, 15],
        growth: 2,
        cost: { [ResourceType.GOLD]: 600 },
        specialty: {
            id: 'thunder_lightning',
            name: '闪电',
            description: '攻击附带闪电伤害',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                value: 10
            }
        }
    },
    {
        id: 'stronghold_tier6_behemoth',
        name: '比蒙巨兽',
        race: Race.STRONGHOLD,
        tier: 6,
        type: UnitType.ATTACK,
        attack: 19,
        defense: 19,
        speed: 9,
        hp: 120,
        damage: [30, 50],
        growth: 1,
        cost: { [ResourceType.GOLD]: 4500, [ResourceType.CRYSTAL]: 1 },
        specialty: {
            id: 'behemoth_armor_break',
            name: '破甲',
            description: '攻击无视目标50%防御',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                value: 'armor_break_50'
            }
        }
    },

    // ==================== 地狱（Inferno）====================
    {
        id: 'inferno_tier1_imp',
        name: '小恶魔',
        race: Race.INFERNO,
        tier: 1,
        type: UnitType.ASSAULT,
        attack: 4,
        defense: 3,
        speed: 5,
        hp: 4,
        damage: [1, 2],
        growth: 16,
        cost: { [ResourceType.GOLD]: 50 },
        specialty: {
            id: 'imp_teleport',
            name: '传送',
            description: '可传送至任意空格',
            type: 'active',
            effect: {
                type: EffectType.BUFF
            }
        }
    },
    {
        id: 'inferno_tier2_gog',
        name: '歌革',
        race: Race.INFERNO,
        tier: 2,
        type: UnitType.SHOOTER,
        attack: 6,
        defense: 4,
        speed: 4,
        hp: 13,
        damage: [2, 4],
        growth: 8,
        cost: { [ResourceType.GOLD]: 125 },
        specialty: {
            id: 'gog_fireball',
            name: '火球',
            description: '远程攻击附带溅射',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                range: 1
            }
        }
    },
    {
        id: 'inferno_tier3_hell_hound',
        name: '地狱犬',
        race: Race.INFERNO,
        tier: 3,
        type: UnitType.ASSAULT,
        attack: 8,
        defense: 6,
        speed: 7,
        hp: 20,
        damage: [2, 5],
        growth: 6,
        cost: { [ResourceType.GOLD]: 200 },
        specialty: {
            id: 'hell_hound_triple',
            name: '三头',
            description: '可同时攻击3个相邻敌人',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                range: 3
            }
        }
    },
    {
        id: 'inferno_tier4_horned_demon',
        name: '长角恶魔',
        race: Race.INFERNO,
        tier: 4,
        type: UnitType.DEFENSE,
        attack: 10,
        defense: 10,
        speed: 5,
        hp: 55,
        damage: [7, 9],
        growth: 3,
        cost: { [ResourceType.GOLD]: 350 },
        specialty: {
            id: 'horned_shield',
            name: '肉盾',
            description: '可替相邻友军承受攻击',
            type: 'active',
            effect: {
                type: EffectType.BUFF,
                status: StatusEffect.SHIELD
            }
        }
    },
    {
        id: 'inferno_tier5_pit_lord',
        name: '邪神王',
        race: Race.INFERNO,
        tier: 5,
        type: UnitType.ATTACK,
        attack: 13,
        defense: 13,
        speed: 6,
        hp: 45,
        damage: [13, 17],
        growth: 2,
        cost: { [ResourceType.GOLD]: 700 },
        specialty: {
            id: 'pit_lord_execute',
            name: '斩首剑',
            description: '对高生命值目标伤害+50%',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                value: 'execute_50'
            }
        }
    },
    {
        id: 'inferno_tier6_arch_devil',
        name: '大恶魔',
        race: Race.INFERNO,
        tier: 6,
        type: UnitType.ASSAULT,
        attack: 26,
        defense: 24,
        speed: 17,
        hp: 100,
        damage: [36, 66],
        growth: 1,
        cost: { [ResourceType.GOLD]: 5000, [ResourceType.MERCURY]: 2 },
        specialty: {
            id: 'arch_devil_no_counter',
            name: '瞬移+反击免疫',
            description: '不受反击',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.BUFF
            }
        }
    }
];

// 创建兵种配置查找表
export const UnitConfigMap: Map<string, UnitConfig> = new Map(
    UnitConfigs.map(config => [config.id, config])
);

// 按种族分组的兵种配置
export const UnitsByRace: Map<Race, UnitConfig[]> = new Map(
    Object.values(Race).map(race => [
        race,
        UnitConfigs.filter(unit => unit.race === race)
    ])
);