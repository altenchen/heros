/**
 * 地形效果类型定义
 * 定义战场地形对战斗单位的各种影响
 * 遵循阿里巴巴开发者手册规范
 */

import { TerrainType } from './GameTypes';

/**
 * 地形效果类型
 */
export enum TerrainEffectType {
    /** 移动消耗增加 */
    MOVEMENT_COST = 'movement_cost',
    /** 速度修正 */
    SPEED_MODIFIER = 'speed_modifier',
    /** 攻击修正 */
    ATTACK_MODIFIER = 'attack_modifier',
    /** 防御修正 */
    DEFENSE_MODIFIER = 'defense_modifier',
    /** 回合伤害 */
    TURN_DAMAGE = 'turn_damage',
    /** 回合治疗 */
    TURN_HEAL = 'turn_heal',
    /** 远程伤害修正 */
    RANGED_MODIFIER = 'ranged_modifier',
    /** 魔法伤害修正 */
    MAGIC_MODIFIER = 'magic_modifier',
    /** 特殊效果 */
    SPECIAL_EFFECT = 'special_effect'
}

/**
 * 地形特殊效果
 */
export enum TerrainSpecialEffect {
    /** 无 */
    NONE = 'none',
    /** 隐蔽 - 远程攻击有概率闪避 */
    STEALTH = 'stealth',
    /** 防御工事 - 提供额外防御 */
    FORTIFICATION = 'fortification',
    /** 燃烧 - 进入时受到伤害 */
    BURNING = 'burning',
    /** 治疗泉 - 每回合恢复生命 */
    HEALING_SPRING = 'healing_spring',
    /** 减速陷阱 - 降低速度 */
    SLOW_TRAP = 'slow_trap',
    /** 魔法增幅 - 提升魔法效果 */
    MAGIC_AMPLIFY = 'magic_amplify',
    /** 魔法抑制 - 降低魔法效果 */
    MAGIC_SUPPRESS = 'magic_suppress'
}

/**
 * 地形效果配置
 */
export interface TerrainEffectConfig {
    /** 地形类型 */
    terrain: TerrainType;
    /** 地形名称 */
    name: string;
    /** 地形描述 */
    description: string;
    /** 移动消耗 */
    movementCost: number;
    /** 速度修正 (百分比) */
    speedModifier: number;
    /** 攻击修正 (百分比) */
    attackModifier: number;
    /** 防御修正 (百分比) */
    defenseModifier: number;
    /** 远程伤害修正 (百分比) */
    rangedModifier: number;
    /** 魔法伤害修正 (百分比) */
    magicModifier: number;
    /** 回合伤害 */
    turnDamage: number;
    /** 回合治疗 */
    turnHeal: number;
    /** 特殊效果 */
    specialEffect: TerrainSpecialEffect;
    /** 特殊效果数值 */
    specialValue: number;
    /** 特殊效果触发概率 (0-1) */
    specialProbability: number;
    /** 免疫种族 (这些种族不受地形负面影响) */
    immuneRaces: string[];
    /** 视觉效果 */
    visualEffect: string;
}

/**
 * 单位上的地形效果状态
 */
export interface TerrainEffectState {
    /** 地形类型 */
    terrain: TerrainType;
    /** 当前效果 */
    effects: ActiveTerrainEffect[];
    /** 最后结算回合 */
    lastProcessTurn: number;
}

/**
 * 激活的地形效果
 */
export interface ActiveTerrainEffect {
    /** 效果类型 */
    type: TerrainEffectType;
    /** 效果数值 */
    value: number;
    /** 来源地形 */
    sourceTerrain: TerrainType;
}

/**
 * 地形效果事件
 */
export enum TerrainEventType {
    /** 进入地形 */
    ENTER_TERRAIN = 'enter_terrain',
    /** 离开地形 */
    LEAVE_TERRAIN = 'leave_terrain',
    /** 地形效果触发 */
    TERRAIN_EFFECT_TRIGGERED = 'terrain_effect_triggered',
    /** 地形伤害 */
    TERRAIN_DAMAGE = 'terrain_damage',
    /** 地形治疗 */
    TERRAIN_HEAL = 'terrain_heal'
}

/**
 * 地形效果事件数据
 */
export interface TerrainEventData {
    /** 单位ID */
    unitId: string;
    /** 地形类型 */
    terrain: TerrainType;
    /** 效果类型 */
    effectType?: TerrainEffectType;
    /** 效果数值 */
    value?: number;
    /** 当前回合 */
    turn?: number;
}

/**
 * 地形效果配置表
 */
export const TerrainEffectConfigs: Record<TerrainType, TerrainEffectConfig> = {
    [TerrainType.GRASS]: {
        terrain: TerrainType.GRASS,
        name: '草地',
        description: '普通的草地，无特殊效果',
        movementCost: 1,
        speedModifier: 0,
        attackModifier: 0,
        defenseModifier: 0,
        rangedModifier: 0,
        magicModifier: 0,
        turnDamage: 0,
        turnHeal: 0,
        specialEffect: TerrainSpecialEffect.NONE,
        specialValue: 0,
        specialProbability: 0,
        immuneRaces: [],
        visualEffect: 'grass_normal'
    },
    [TerrainType.SNOW]: {
        terrain: TerrainType.SNOW,
        name: '雪地',
        description: '寒冷的雪地，降低移动速度',
        movementCost: 1.5,
        speedModifier: -10,
        attackModifier: 0,
        defenseModifier: 0,
        rangedModifier: 0,
        magicModifier: 0,
        turnDamage: 0,
        turnHeal: 0,
        specialEffect: TerrainSpecialEffect.NONE,
        specialValue: 0,
        specialProbability: 0,
        immuneRaces: [],
        visualEffect: 'snow_slow'
    },
    [TerrainType.SAND]: {
        terrain: TerrainType.SAND,
        name: '沙漠',
        description: '炎热的沙漠，降低远程伤害',
        movementCost: 1.5,
        speedModifier: 0,
        attackModifier: 0,
        defenseModifier: 0,
        rangedModifier: -15,
        magicModifier: 0,
        turnDamage: 0,
        turnHeal: 0,
        specialEffect: TerrainSpecialEffect.NONE,
        specialValue: 0,
        specialProbability: 0,
        immuneRaces: [],
        visualEffect: 'sand_debuff'
    },
    [TerrainType.SWAMP]: {
        terrain: TerrainType.SWAMP,
        name: '沼泽',
        description: '危险的沼泽，大幅降低移动速度，每回合受到少量伤害',
        movementCost: 2,
        speedModifier: -20,
        attackModifier: -5,
        defenseModifier: -5,
        rangedModifier: 0,
        magicModifier: 0,
        turnDamage: 5,
        turnHeal: 0,
        specialEffect: TerrainSpecialEffect.SLOW_TRAP,
        specialValue: 20,
        specialProbability: 1,
        immuneRaces: ['necropolis'], // 墓园单位免疫
        visualEffect: 'swamp_poison'
    },
    [TerrainType.LAVA]: {
        terrain: TerrainType.LAVA,
        name: '熔岩',
        description: '炽热的熔岩，进入时受到大量伤害，每回合持续受到伤害',
        movementCost: 3,
        speedModifier: -30,
        attackModifier: 0,
        defenseModifier: -10,
        rangedModifier: 0,
        magicModifier: 0,
        turnDamage: 20,
        turnHeal: 0,
        specialEffect: TerrainSpecialEffect.BURNING,
        specialValue: 15,
        specialProbability: 1,
        immuneRaces: ['inferno'], // 地狱单位免疫
        visualEffect: 'lava_burn'
    },
    [TerrainType.WATER]: {
        terrain: TerrainType.WATER,
        name: '水域',
        description: '浅水区域，降低移动速度和防御',
        movementCost: 2,
        speedModifier: -15,
        attackModifier: 0,
        defenseModifier: -10,
        rangedModifier: 0,
        magicModifier: 0,
        turnDamage: 0,
        turnHeal: 0,
        specialEffect: TerrainSpecialEffect.NONE,
        specialValue: 0,
        specialProbability: 0,
        immuneRaces: [],
        visualEffect: 'water_slow'
    },
    [TerrainType.WALL]: {
        terrain: TerrainType.WALL,
        name: '城墙',
        description: '坚固的城墙，不可通行，但可提供掩护',
        movementCost: 999,
        speedModifier: 0,
        attackModifier: 0,
        defenseModifier: 0,
        rangedModifier: 0,
        magicModifier: 0,
        turnDamage: 0,
        turnHeal: 0,
        specialEffect: TerrainSpecialEffect.FORTIFICATION,
        specialValue: 50,
        specialProbability: 1,
        immuneRaces: [],
        visualEffect: 'wall_block'
    },
    [TerrainType.OBSTACLE]: {
        terrain: TerrainType.OBSTACLE,
        name: '障碍物',
        description: '战场障碍物，不可通行',
        movementCost: 999,
        speedModifier: 0,
        attackModifier: 0,
        defenseModifier: 0,
        rangedModifier: 0,
        magicModifier: 0,
        turnDamage: 0,
        turnHeal: 0,
        specialEffect: TerrainSpecialEffect.NONE,
        specialValue: 0,
        specialProbability: 0,
        immuneRaces: [],
        visualEffect: 'obstacle_block'
    }
};

/**
 * 获取地形效果配置
 */
export function getTerrainEffectConfig(terrain: TerrainType): TerrainEffectConfig {
    return TerrainEffectConfigs[terrain];
}

/**
 * 判断地形是否可通行
 */
export function isTerrainWalkable(terrain: TerrainType): boolean {
    return terrain !== TerrainType.WALL && terrain !== TerrainType.OBSTACLE;
}

/**
 * 计算地形移动消耗
 */
export function calculateMovementCost(terrain: TerrainType, unitRace?: string): number {
    const config = TerrainEffectConfigs[terrain];

    // 检查种族免疫
    if (unitRace && config.immuneRaces.includes(unitRace)) {
        // 免疫种族消耗减半
        return Math.max(1, config.movementCost * 0.5);
    }

    return config.movementCost;
}