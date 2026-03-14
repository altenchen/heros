/**
 * 英雄配置数据
 * 20位英雄
 */

import { HeroConfig, Race, HeroClass } from '../scripts/config/GameTypes';

export const HeroConfigs: HeroConfig[] = [
    // ==================== 圣堂英雄 ====================
    {
        id: 'hero_catherine',
        name: '凯瑟琳',
        race: Race.CASTLE,
        heroClass: HeroClass.KNIGHT,
        specialty: '骑士：防御术效果+10%',
        attackGrowth: 3,
        defenseGrowth: 4,
        spellPowerGrowth: 2,
        knowledgeGrowth: 2,
        skillTree: ['defense', 'first_aid', 'leadership'],
        initialSkill: 'defense',
        portrait: 'hero_castle_catherine_portrait'
    },
    {
        id: 'hero_roland',
        name: '罗兰德',
        race: Race.CASTLE,
        heroClass: HeroClass.KNIGHT,
        specialty: '骑士：进攻术效果+10%',
        attackGrowth: 4,
        defenseGrowth: 3,
        spellPowerGrowth: 2,
        knowledgeGrowth: 2,
        skillTree: ['offense', 'tactics', 'leadership'],
        initialSkill: 'offense',
        portrait: 'hero_castle_roland_portrait'
    },
    {
        id: 'hero_christian',
        name: '克里斯汀',
        race: Race.CASTLE,
        heroClass: HeroClass.CLERIC,
        specialty: '牧师：水系魔法效果+10%',
        attackGrowth: 2,
        defenseGrowth: 2,
        spellPowerGrowth: 3,
        knowledgeGrowth: 4,
        skillTree: ['water_magic', 'wisdom', 'first_aid'],
        initialSkill: 'water_magic',
        portrait: 'hero_castle_christian_portrait'
    },
    {
        id: 'hero_edric',
        name: '艾德力克',
        race: Race.CASTLE,
        heroClass: HeroClass.CLERIC,
        specialty: '牧师：领导术效果+10%',
        attackGrowth: 2,
        defenseGrowth: 3,
        spellPowerGrowth: 3,
        knowledgeGrowth: 3,
        skillTree: ['leadership', 'diplomacy', 'estates'],
        initialSkill: 'leadership',
        portrait: 'hero_castle_edric_portrait'
    },

    // ==================== 壁垒英雄 ====================
    {
        id: 'hero_mephala',
        name: '姆拉克',
        race: Race.RAMPART,
        heroClass: HeroClass.RANGER,
        specialty: '巡逻兵：防御术效果+10%',
        attackGrowth: 3,
        defenseGrowth: 3,
        spellPowerGrowth: 2,
        knowledgeGrowth: 3,
        skillTree: ['defense', 'pathfinding', 'logistics'],
        initialSkill: 'defense',
        portrait: 'hero_rampart_mephala_portrait'
    },
    {
        id: 'hero_men Chem',
        name: '孟斐拉',
        race: Race.RAMPART,
        heroClass: HeroClass.RANGER,
        specialty: '巡逻兵：箭术效果+10%',
        attackGrowth: 2,
        defenseGrowth: 4,
        spellPowerGrowth: 2,
        knowledgeGrowth: 3,
        skillTree: ['defense', 'archery', 'resistance'],
        initialSkill: 'archery',
        portrait: 'hero_rampart_menchem_portrait'
    },
    {
        id: 'hero_gru',
        name: '格鲁',
        race: Race.RAMPART,
        heroClass: HeroClass.RANGER,
        specialty: '精灵：箭术效果+15%',
        attackGrowth: 3,
        defenseGrowth: 2,
        spellPowerGrowth: 3,
        knowledgeGrowth: 3,
        skillTree: ['archery', 'logistics', 'tactics'],
        initialSkill: 'archery',
        portrait: 'hero_rampart_gru_portrait'
    },
    {
        id: 'hero_ivor',
        name: '伊沃',
        race: Race.RAMPART,
        heroClass: HeroClass.RANGER,
        specialty: '精灵：进攻术效果+10%',
        attackGrowth: 4,
        defenseGrowth: 3,
        spellPowerGrowth: 2,
        knowledgeGrowth: 2,
        skillTree: ['offense', 'tactics', 'leadership'],
        initialSkill: 'offense',
        portrait: 'hero_rampart_ivor_portrait'
    },

    // ==================== 墓园英雄 ====================
    {
        id: 'hero_sandro',
        name: '山德鲁',
        race: Race.NECROPOLIS,
        heroClass: HeroClass.NECROMANCER,
        specialty: '亡灵巫师：招魂术效果+20%',
        attackGrowth: 2,
        defenseGrowth: 2,
        spellPowerGrowth: 4,
        knowledgeGrowth: 4,
        skillTree: ['necromancy', 'corpse_explosion', 'earth_magic'],
        initialSkill: 'necromancy',
        portrait: 'hero_necropolis_sandro_portrait'
    },
    {
        id: 'hero_vidomina',
        name: '维德尼娜',
        race: Race.NECROPOLIS,
        heroClass: HeroClass.NECROMANCER,
        specialty: '亡灵巫师：智慧术效果+10%',
        attackGrowth: 2,
        defenseGrowth: 2,
        spellPowerGrowth: 3,
        knowledgeGrowth: 4,
        skillTree: ['necromancy', 'wisdom', 'water_magic'],
        initialSkill: 'wisdom',
        portrait: 'hero_necropolis_vidomina_portrait'
    },
    {
        id: 'hero_straker',
        name: '斯特德',
        race: Race.NECROPOLIS,
        heroClass: HeroClass.DEATH_KNIGHT,
        specialty: '死亡骑士：进攻术效果+10%',
        attackGrowth: 4,
        defenseGrowth: 3,
        spellPowerGrowth: 2,
        knowledgeGrowth: 2,
        skillTree: ['offense', 'tactics', 'resistance'],
        initialSkill: 'offense',
        portrait: 'hero_necropolis_straker_portrait'
    },
    {
        id: 'hero_moldo',
        name: '摩尔多',
        race: Race.NECROPOLIS,
        heroClass: HeroClass.DEATH_KNIGHT,
        specialty: '死亡骑士：防御术效果+10%',
        attackGrowth: 3,
        defenseGrowth: 4,
        spellPowerGrowth: 2,
        knowledgeGrowth: 2,
        skillTree: ['defense', 'pathfinding', 'logistics'],
        initialSkill: 'defense',
        portrait: 'hero_necropolis_moldo_portrait'
    },

    // ==================== 地下城英雄 ====================
    {
        id: 'hero_alagar',
        name: '艾拉戈',
        race: Race.DUNGEON,
        heroClass: HeroClass.OVERLORD,
        specialty: '地下领主：进攻术效果+10%',
        attackGrowth: 4,
        defenseGrowth: 3,
        spellPowerGrowth: 3,
        knowledgeGrowth: 2,
        skillTree: ['offense', 'tactics', 'dungeon_knowledge'],
        initialSkill: 'offense',
        portrait: 'hero_dungeon_alagar_portrait'
    },
    {
        id: 'hero_shakti',
        name: '莎克特',
        race: Race.DUNGEON,
        heroClass: HeroClass.OVERLORD,
        specialty: '地下领主：理财术效果+10%',
        attackGrowth: 3,
        defenseGrowth: 4,
        spellPowerGrowth: 2,
        knowledgeGrowth: 3,
        skillTree: ['defense', 'estates', 'diplomacy'],
        initialSkill: 'estates',
        portrait: 'hero_dungeon_shakti_portrait'
    },

    // ==================== 塔楼英雄 ====================
    {
        id: 'hero_solmyr',
        name: '索姆拉',
        race: Race.TOWER,
        heroClass: HeroClass.ALCHEMIST,
        specialty: '炼金术士：气系魔法效果+10%',
        attackGrowth: 2,
        defenseGrowth: 2,
        spellPowerGrowth: 4,
        knowledgeGrowth: 3,
        skillTree: ['air_magic', 'wisdom', 'intelligence'],
        initialSkill: 'air_magic',
        portrait: 'hero_tower_solmyr_portrait'
    },
    {
        id: 'hero_dacon',
        name: '德肯',
        race: Race.TOWER,
        heroClass: HeroClass.WIZARD,
        specialty: '术士：火系魔法效果+10%',
        attackGrowth: 2,
        defenseGrowth: 2,
        spellPowerGrowth: 3,
        knowledgeGrowth: 4,
        skillTree: ['fire_magic', 'wisdom', 'scholar'],
        initialSkill: 'fire_magic',
        portrait: 'hero_tower_dacon_portrait'
    },

    // ==================== 据点英雄 ====================
    {
        id: 'hero_kreel',
        name: '科尔格',
        race: Race.STRONGHOLD,
        heroClass: HeroClass.BARBARIAN,
        specialty: '野蛮人：进攻术效果+15%',
        attackGrowth: 5,
        defenseGrowth: 3,
        spellPowerGrowth: 1,
        knowledgeGrowth: 1,
        skillTree: ['offense', 'rage', 'tactics'],
        initialSkill: 'offense',
        portrait: 'hero_stronghold_kreel_portrait'
    },
    {
        id: 'hero_gunnar',
        name: '格尼森',
        race: Race.STRONGHOLD,
        heroClass: HeroClass.BATTLE_MAGE,
        specialty: '战斗法师：后勤学效果+10%',
        attackGrowth: 3,
        defenseGrowth: 2,
        spellPowerGrowth: 3,
        knowledgeGrowth: 3,
        skillTree: ['logistics', 'pathfinding', 'wisdom'],
        initialSkill: 'logistics',
        portrait: 'hero_stronghold_gunnar_portrait'
    },

    // ==================== 地狱英雄 ====================
    {
        id: 'hero_seryl',
        name: '塞尔伦',
        race: Race.INFERNO,
        heroClass: HeroClass.DEMON,
        specialty: '恶魔：进攻术效果+10%',
        attackGrowth: 4,
        defenseGrowth: 3,
        spellPowerGrowth: 3,
        knowledgeGrowth: 2,
        skillTree: ['offense', 'tactics', 'fire_magic'],
        initialSkill: 'offense',
        portrait: 'hero_inferno_seryl_portrait'
    },
    {
        id: 'hero_riscka',
        name: '瑞斯卡',
        race: Race.INFERNO,
        heroClass: HeroClass.DEMON,
        specialty: '恶魔：火系魔法效果+15%',
        attackGrowth: 3,
        defenseGrowth: 3,
        spellPowerGrowth: 4,
        knowledgeGrowth: 2,
        skillTree: ['fire_magic', 'wisdom', 'scholar'],
        initialSkill: 'fire_magic',
        portrait: 'hero_inferno_riscka_portrait'
    }
];

// 创建英雄配置查找表
export const HeroConfigMap: Map<string, HeroConfig> = new Map(
    HeroConfigs.map(config => [config.id, config])
);

// 按种族分组的英雄配置
export const HeroesByRace: Map<Race, HeroConfig[]> = new Map(
    Object.values(Race).map(race => [
        race,
        HeroConfigs.filter(hero => hero.race === race)
    ])
);