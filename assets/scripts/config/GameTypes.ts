/**
 * 英雄无敌Ⅲ：传承 - 核心类型定义
 * 包含所有游戏核心数据结构和枚举类型
 */

// ==================== 枚举定义 ====================

/** 阵营类型 */
export enum Faction {
    LIGHT = 'light',     // 光明阵营
    DARK = 'dark'        // 黑暗阵营
}

/** 种族类型 */
export enum Race {
    CASTLE = 'castle',           // 圣堂
    RAMPART = 'rampart',         // 壁垒
    NECROPOLIS = 'necropolis',   // 墓园
    DUNGEON = 'dungeon',         // 地下城
    TOWER = 'tower',             // 塔楼
    STRONGHOLD = 'stronghold',   // 据点
    INFERNO = 'inferno'          // 地狱
}

/** 兵种类型 */
export enum UnitType {
    ATTACK = 'attack',    // 攻击型
    DEFENSE = 'defense',  // 防御型
    SHOOTER = 'shooter',  // 射手型
    ASSAULT = 'assault',  // 突击型（飞行/冲锋）
    MAGIC = 'magic'       // 魔法型
}

/** 地形类型 */
export enum TerrainType {
    GRASS = 'grass',       // 草地
    SNOW = 'snow',         // 雪地
    SAND = 'sand',         // 沙漠
    SWAMP = 'swamp',       // 沼泽
    LAVA = 'lava',         // 熔岩
    WATER = 'water',       // 水域
    WALL = 'wall',         // 城墙
    OBSTACLE = 'obstacle'  // 障碍物
}

/** 技能类型 */
export enum SkillType {
    HERO = 'hero',    // 英雄技能
    UNIT = 'unit'     // 兵种技能
}

/** 魔法派系 */
export enum MagicSchool {
    FIRE = 'fire',     // 火系
    WATER = 'water',   // 水系
    EARTH = 'earth',   // 土系
    AIR = 'air'        // 气系
}

/** 目标类型 */
export enum TargetType {
    SELF = 'self',                    // 自身
    SINGLE = 'single',                // 单体
    AREA = 'area',                    // 区域
    ALL_ENEMY = 'all_enemy',          // 所有敌人
    ALL_ALLY = 'all_ally',            // 所有友军
    ALL_DEAD_ALLY = 'all_dead_ally'   // 所有阵亡友军
}

/** 效果类型 */
export enum EffectType {
    DAMAGE = 'damage',       // 伤害
    HEAL = 'heal',           // 治疗
    BUFF = 'buff',           // 增益
    DEBUFF = 'debuff',       // 减益
    SUMMON = 'summon',       // 召唤
    REVIVE = 'revive',       // 复活
    DISPEL = 'dispel',       // 驱散
    SPECIAL = 'special'      // 特殊效果
}

/** 状态效果 */
export enum StatusEffect {
    STUN = 'stun',           // 眩晕
    SLOW = 'slow',           // 减速
    HASTE = 'haste',         // 加速
    BLIND = 'blind',         // 失明
    STONE = 'stone',         // 石化
    POISON = 'poison',       // 中毒
    CURSE = 'curse',         // 诅咒
    BLESS = 'bless',         // 祝福
    BLOODLUST = 'bloodlust', // 嗜血
    SHIELD = 'shield',       // 护盾
    AGING = 'aging',         // 衰老
    ATTACK_UP = 'attack_up',      // 攻击力提升
    ATTACK_DOWN = 'attack_down',  // 攻击力降低
    DEFENSE_UP = 'defense_up',    // 防御力提升
    DEFENSE_DOWN = 'defense_down' // 防御力降低
}

/** 单位状态 */
export enum UnitState {
    IDLE = 'idle',
    MOVING = 'moving',
    ATTACKING = 'attacking',
    CASTING = 'casting',
    DEAD = 'dead'
}

/** 英雄职业 */
export enum HeroClass {
    KNIGHT = 'knight',           // 骑士
    CLERIC = 'cleric',           // 牧师
    RANGER = 'ranger',           // 巡逻兵
    DRUID = 'druid',             // 德鲁伊
    NECROMANCER = 'necromancer', // 亡灵巫师
    DEATH_KNIGHT = 'death_knight', // 死亡骑士
    WARLOCK = 'warlock',         // 术士
    OVERLORD = 'overlord',       // 地下领主
    WIZARD = 'wizard',           // 术士
    ALCHEMIST = 'alchemist',     // 炼金术士
    BARBARIAN = 'barbarian',     // 野蛮人
    BATTLE_MAGE = 'battle_mage', // 战斗法师
    DEMON = 'demon'              // 恶魔
}

/** 资源类型 */
export enum ResourceType {
    GOLD = 'gold',         // 金币
    GEMS = 'gems',         // 钻石
    WOOD = 'wood',         // 木材
    ORE = 'ore',           // 矿石
    CRYSTAL = 'crystal',   // 水晶
    GEM = 'gem',           // 宝石
    SULFUR = 'sulfur',     // 硫磺
    MERCURY = 'mercury',   // 水银
    STAMINA = 'stamina'    // 体力
}

// ==================== 接口定义 ====================

/** 六边形坐标 */
export interface Hex {
    q: number;  // 列
    r: number;  // 行
}

/** 兵种配置 */
export interface UnitConfig {
    id: string;
    name: string;
    race: Race;
    tier: number;           // 阶位 1-6
    type: UnitType;
    attack: number;
    defense: number;
    speed: number;
    hp: number;
    damage: [number, number]; // [最小伤害, 最大伤害]
    growth: number;          // 每周产量
    cost: Partial<Record<ResourceType, number>>;
    specialty: SpecialtyConfig;
    upgrades?: string[];     // 升级后的兵种ID
}

/** 特技配置 */
export interface SpecialtyConfig {
    id: string;
    name: string;
    description: string;
    type: 'passive' | 'active';
    trigger?: 'on_attack' | 'on_hit' | 'on_kill' | 'on_death' | 'always';
    effect: SpecialtyEffect;
    focusCost?: number;
}

/** 特技效果 */
export interface SpecialtyEffect {
    type: EffectType;
    value?: number | string;
    duration?: number;
    status?: StatusEffect;
    range?: number;
    probability?: number;
}

/** 英雄配置 */
export interface HeroConfig {
    id: string;
    name: string;
    race: Race;
    heroClass: HeroClass;
    specialty: string;       // 特长描述
    attackGrowth: number;    // 攻击成长 (星级 1-5)
    defenseGrowth: number;   // 防御成长
    spellPowerGrowth: number; // 咒力成长
    knowledgeGrowth: number; // 知识成长
    skillTree: string[];     // 技能树ID列表
    initialSkill: string;    // 初始技能
    portrait: string;        // 头像资源名
}

/** 英雄实例数据 */
export interface HeroData {
    id: string;
    configId: string;
    level: number;
    experience: number;
    attack: number;
    defense: number;
    spellPower: number;
    knowledge: number;
    mana: number;
    maxMana: number;
    skills: SkillInstance[];
    army: ArmySlot[];
}

/** 技能配置 */
export interface SkillConfig {
    id: string;
    name: string;
    type: SkillType;
    magicSchool?: MagicSchool;
    level: number;
    cost: {
        focus?: number;
        mana?: number;
    };
    cooldown: number;
    targetType: TargetType;
    range: number;
    effect: EffectConfig[];
    animation: string;
    icon: string;
    description: string;
}

/** 效果配置 */
export interface EffectConfig {
    type: EffectType;
    value?: number | string;
    duration?: number;
    status?: StatusEffect;
}

/** 技能实例 */
export interface SkillInstance {
    configId: string;
    level: number;
    currentCooldown: number;
}

/** 军队槽位 */
export interface ArmySlot {
    unitId: string;
    configId: string;
    count: number;
    currentHp: number;
    maxHp: number;
    position: Hex;
}

/** 战斗单位 */
export interface BattleUnit {
    id: string;
    config: UnitConfig;
    hero: HeroData;
    team: 'player' | 'enemy';
    position: Hex;
    count: number;
    currentHp: number;
    maxHp: number;
    state: UnitState;
    buffs: BuffData[];
    canCounter: boolean;
    hasActed: boolean;
}

/** 增益/减益数据 */
export interface BuffData {
    id: string;
    status: StatusEffect;
    duration: number;
    value: number;
    source: string;
}

/** 战斗状态 */
export interface BattleState {
    turn: number;
    phase: 'preparation' | 'battle' | 'end';
    focusPoints: number;
    maxFocusPoints: number;
    units: BattleUnit[];
    currentUnit: BattleUnit | null;
    terrain: TerrainType[][];
    winner: 'player' | 'enemy' | null;
}

/** 主城建筑 */
export interface BuildingConfig {
    id: string;
    name: string;
    race: Race;
    type: 'dwelling' | 'production' | 'magic' | 'special';
    level: number;
    cost: Partial<Record<ResourceType, number>>;
    buildTime: number;       // 建造时间（小时）
    requirements: string[];  // 前置建筑ID
    production?: {
        resource: ResourceType;
        amount: number;
    };
    unitProduction?: {
        unitId: string;
        amount: number;
    };
}

/** 玩家数据 */
export interface PlayerData {
    id: string;
    name: string;
    faction: Faction;
    level: number;
    experience: number;
    resources: Partial<Record<ResourceType, number>>;
    heroes: HeroData[];
    mainTown: TownData;
    unlockedUnits: string[];
    unlockedHeroes: string[];
    achievements: string[];
    lastLoginTime: number;
    offlineRewards: OfflineRewards;
}

/** 主城数据 */
export interface TownData {
    race: Race;
    level: number;
    buildings: BuildingInstance[];
    garrison: ArmySlot[];
}

/** 建筑实例 */
export interface BuildingInstance {
    configId: string;
    level: number;
    buildingTime: number;  // 剩余建造时间
}

/** 离线奖励 */
export interface OfflineRewards {
    gold: number;
    resources: Partial<Record<ResourceType, number>>;
    calculateTime: number;
}

// ==================== 常量定义 ====================

/** 战场半径（格） */
export const BATTLEFIELD_RADIUS = 4;

/** 初始专注点上限 */
export const INITIAL_FOCUS_POINTS = 3;

/** 最大专注点 */
export const MAX_FOCUS_POINTS = 10;

/** 最大军队槽位 */
export const MAX_ARMY_SLOTS = 7;

/** 最大战斗回合 */
export const MAX_BATTLE_TURNS = 100;

/** 阵营光环阈值 */
export const FACTION_AURA_THRESHOLDS = {
    LEVEL_1: 3,  // 3个同阵营
    LEVEL_2: 5,  // 5个同阵营
    LEVEL_3: 7   // 7个同阵营
};

/** 阵营光环效果 */
export const FACTION_AURA_EFFECTS = {
    LEVEL_1: { attack: 0.1, defense: 0 },
    LEVEL_2: { attack: 0.1, defense: 0.1 },
    LEVEL_3: { attack: 0.15, defense: 0.15, specialtyRate: 0.1 }
};

/** 远程伤害衰减 */
export const RANGED_DAMAGE_DECAY = {
    CLOSE_RANGE: 4,      // 近距离阈值（格）
    CLOSE_DAMAGE: 1.0,   // 近距离伤害倍率
    FAR_DAMAGE: 0.5      // 远距离伤害倍率
};

/** 近战惩罚 */
export const MELEE_PENALTY = 0.7;

/** 反击次数 */
export const COUNTER_ATTACK_LIMIT = 1;