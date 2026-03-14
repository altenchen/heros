/**
 * 地形效果管理器
 * 管理战场地形对战斗单位的效果影响
 * 遵循阿里巴巴开发者手册规范
 */

import { TerrainType, Hex } from '../config/GameTypes';
import { EventCenter } from '../utils/EventTarget';
import {
    TerrainEffectConfig,
    TerrainEffectType,
    TerrainSpecialEffect,
    TerrainEffectState,
    TerrainEventType,
    TerrainEventData,
    TerrainEffectConfigs,
    getTerrainEffectConfig,
    isTerrainWalkable
} from '../config/TerrainTypes';
import { HexGrid, HexCell } from './HexGrid';
import { BattleUnit } from './BattleUnit';

/**
 * 地形效果管理器
 * 单例模式，管理战场上的所有地形效果
 */
export class TerrainEffectManager {
    private static _instance: TerrainEffectManager | null = null;

    /** 单位地形效果状态缓存 */
    private _unitTerrainStates: Map<string, TerrainEffectState> = new Map();

    /** 当前战场网格引用 */
    private _grid: HexGrid | null = null;

    /** 当前回合数 */
    private _currentTurn: number = 0;

    /** 随机数种子 */
    private _seed: number = 0;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): TerrainEffectManager {
        if (!TerrainEffectManager._instance) {
            TerrainEffectManager._instance = new TerrainEffectManager();
        }
        return TerrainEffectManager._instance;
    }

    /**
     * 初始化地形效果管理器
     * @param grid 战场网格
     */
    init(grid: HexGrid): void {
        this._grid = grid;
        this._unitTerrainStates.clear();
        this._currentTurn = 0;
        this._seed = Date.now();
        console.log('[TerrainEffectManager] 初始化完成');
    }

    /**
     * 设置回合数
     */
    setTurn(turn: number): void {
        this._currentTurn = turn;
    }

    /**
     * 生成随机数 (简单的线性同余生成器)
     */
    private random(): number {
        this._seed = (this._seed * 1103515245 + 12345) & 0x7fffffff;
        return this._seed / 0x7fffffff;
    }

    /**
     * 单位进入地形
     * @param unit 进入的单位
     * @param terrain 地形类型
     */
    onUnitEnterTerrain(unit: BattleUnit, terrain: TerrainType): void {
        const config = getTerrainEffectConfig(terrain);
        const unitRace = unit.config?.race;

        // 检查种族免疫
        const isImmune = unitRace && config.immuneRaces.includes(unitRace);

        // 创建地形效果状态
        const state: TerrainEffectState = {
            terrain,
            effects: [],
            lastProcessTurn: this._currentTurn
        };

        if (!isImmune) {
            // 添加各种效果
            if (config.speedModifier !== 0) {
                state.effects.push({
                    type: TerrainEffectType.SPEED_MODIFIER,
                    value: config.speedModifier,
                    sourceTerrain: terrain
                });
            }

            if (config.attackModifier !== 0) {
                state.effects.push({
                    type: TerrainEffectType.ATTACK_MODIFIER,
                    value: config.attackModifier,
                    sourceTerrain: terrain
                });
            }

            if (config.defenseModifier !== 0) {
                state.effects.push({
                    type: TerrainEffectType.DEFENSE_MODIFIER,
                    value: config.defenseModifier,
                    sourceTerrain: terrain
                });
            }

            if (config.rangedModifier !== 0) {
                state.effects.push({
                    type: TerrainEffectType.RANGED_MODIFIER,
                    value: config.rangedModifier,
                    sourceTerrain: terrain
                });
            }

            if (config.magicModifier !== 0) {
                state.effects.push({
                    type: TerrainEffectType.MAGIC_MODIFIER,
                    value: config.magicModifier,
                    sourceTerrain: terrain
                });
            }
        }

        this._unitTerrainStates.set(unit.id, state);

        // 触发进入地形事件
        EventCenter.emit(TerrainEventType.ENTER_TERRAIN, {
            unitId: unit.id,
            terrain,
            turn: this._currentTurn
        } as TerrainEventData);

        // 处理进入时的特殊效果
        if (!isImmune) {
            this._processEnterSpecialEffect(unit, config);
        }

        console.log(`[TerrainEffectManager] ${unit.id} 进入地形 ${config.name}`);
    }

    /**
     * 处理进入地形时的特殊效果
     */
    private _processEnterSpecialEffect(unit: BattleUnit, config: TerrainEffectConfig): void {
        switch (config.specialEffect) {
            case TerrainSpecialEffect.BURNING:
                // 进入熔岩时立即受到伤害
                if (this.random() < config.specialProbability) {
                    const damage = Math.floor(config.specialValue * unit.count);
                    unit.takeDamage(damage);

                    EventCenter.emit(TerrainEventType.TERRAIN_DAMAGE, {
                        unitId: unit.id,
                        terrain: config.terrain,
                        effectType: TerrainEffectType.TURN_DAMAGE,
                        value: damage,
                        turn: this._currentTurn
                    } as TerrainEventData);

                    console.log(`[TerrainEffectManager] ${unit.id} 因熔岩受到 ${damage} 点伤害`);
                }
                break;

            case TerrainSpecialEffect.STEALTH:
                // 进入隐蔽地形，远程闪避效果会在攻击时处理
                break;

            case TerrainSpecialEffect.SLOW_TRAP:
                // 减速陷阱效果已通过速度修正处理
                break;

            default:
                break;
        }
    }

    /**
     * 单位离开地形
     * @param unit 离开的单位
     */
    onUnitLeaveTerrain(unit: BattleUnit): void {
        const state = this._unitTerrainStates.get(unit.id);
        if (!state) {
            return;
        }

        const terrain = state.terrain;

        // 移除地形效果状态
        this._unitTerrainStates.delete(unit.id);

        // 触发离开地形事件
        EventCenter.emit(TerrainEventType.LEAVE_TERRAIN, {
            unitId: unit.id,
            terrain,
            turn: this._currentTurn
        } as TerrainEventData);

        console.log(`[TerrainEffectManager] ${unit.id} 离开地形`);
    }

    /**
     * 单位移动时更新地形效果
     * @param unit 移动的单位
     * @param fromHex 起始位置
     * @param toHex 目标位置
     */
    onUnitMove(unit: BattleUnit, fromHex: Hex, toHex: Hex): void {
        if (!this._grid) {
            return;
        }

        const fromCell = this._grid.getCellByHex(fromHex);
        const toCell = this._grid.getCellByHex(toHex);

        if (!fromCell || !toCell) {
            return;
        }

        // 离开旧地形
        if (fromCell.terrain !== TerrainType.GRASS) {
            this.onUnitLeaveTerrain(unit);
        }

        // 进入新地形
        if (toCell.terrain !== TerrainType.GRASS) {
            this.onUnitEnterTerrain(unit, toCell.terrain);
        }
    }

    /**
     * 回合开始时处理地形效果
     * @param unit 单位
     */
    processTurnStartTerrainEffects(unit: BattleUnit): void {
        const state = this._unitTerrainStates.get(unit.id);
        if (!state) {
            return;
        }

        // 防止同一回合重复处理
        if (state.lastProcessTurn >= this._currentTurn) {
            return;
        }

        state.lastProcessTurn = this._currentTurn;

        const config = getTerrainEffectConfig(state.terrain);
        const unitRace = unit.config?.race;
        const isImmune = unitRace && config.immuneRaces.includes(unitRace);

        if (isImmune) {
            return;
        }

        // 处理回合伤害
        if (config.turnDamage > 0) {
            const damage = Math.floor(config.turnDamage * unit.count);
            unit.takeDamage(damage);

            EventCenter.emit(TerrainEventType.TERRAIN_DAMAGE, {
                unitId: unit.id,
                terrain: state.terrain,
                effectType: TerrainEffectType.TURN_DAMAGE,
                value: damage,
                turn: this._currentTurn
            } as TerrainEventData);

            console.log(`[TerrainEffectManager] ${unit.id} 受到地形伤害 ${damage}`);
        }

        // 处理回合治疗
        if (config.turnHeal > 0) {
            const heal = Math.floor(config.turnHeal * unit.count);
            unit.heal(heal);

            EventCenter.emit(TerrainEventType.TERRAIN_HEAL, {
                unitId: unit.id,
                terrain: state.terrain,
                effectType: TerrainEffectType.TURN_HEAL,
                value: heal,
                turn: this._currentTurn
            } as TerrainEventData);

            console.log(`[TerrainEffectManager] ${unit.id} 受到地形治疗 ${heal}`);
        }

        // 处理特殊效果
        this._processSpecialEffect(unit, config);
    }

    /**
     * 处理特殊效果
     */
    private _processSpecialEffect(unit: BattleUnit, config: TerrainEffectConfig): void {
        if (config.specialEffect === TerrainSpecialEffect.NONE) {
            return;
        }

        // 根据概率触发
        if (this.random() > config.specialProbability) {
            return;
        }

        switch (config.specialEffect) {
            case TerrainSpecialEffect.HEALING_SPRING:
                const heal = Math.floor(config.specialValue * unit.count);
                unit.heal(heal);
                console.log(`[TerrainEffectManager] ${unit.id} 在治疗泉恢复 ${heal} 生命`);
                break;

            case TerrainSpecialEffect.MAGIC_AMPLIFY:
                // 魔法增幅效果在计算伤害时处理
                break;

            default:
                break;
        }
    }

    /**
     * 获取单位的地形效果修正值
     * @param unitId 单位ID
     * @param effectType 效果类型
     * @returns 修正值百分比
     */
    getTerrainEffectModifier(unitId: string, effectType: TerrainEffectType): number {
        const state = this._unitTerrainStates.get(unitId);
        if (!state) {
            return 0;
        }

        const effect = state.effects.find(e => e.type === effectType);
        return effect ? effect.value : 0;
    }

    /**
     * 获取单位的总攻击修正
     */
    getAttackModifier(unitId: string): number {
        return this.getTerrainEffectModifier(unitId, TerrainEffectType.ATTACK_MODIFIER);
    }

    /**
     * 获取单位的总防御修正
     */
    getDefenseModifier(unitId: string): number {
        return this.getTerrainEffectModifier(unitId, TerrainEffectType.DEFENSE_MODIFIER);
    }

    /**
     * 获取单位的速度修正
     */
    getSpeedModifier(unitId: string): number {
        return this.getTerrainEffectModifier(unitId, TerrainEffectType.SPEED_MODIFIER);
    }

    /**
     * 获取单位的远程伤害修正
     */
    getRangedModifier(unitId: string): number {
        return this.getTerrainEffectModifier(unitId, TerrainEffectType.RANGED_MODIFIER);
    }

    /**
     * 获取单位的魔法伤害修正
     */
    getMagicModifier(unitId: string): number {
        return this.getTerrainEffectModifier(unitId, TerrainEffectType.MAGIC_MODIFIER);
    }

    /**
     * 检查单位是否有隐蔽效果
     */
    hasStealthEffect(unitId: string): boolean {
        const state = this._unitTerrainStates.get(unitId);
        if (!state) {
            return false;
        }

        const config = getTerrainEffectConfig(state.terrain);
        return config.specialEffect === TerrainSpecialEffect.STEALTH;
    }

    /**
     * 检查单位是否有魔法增幅效果
     */
    hasMagicAmplify(unitId: string): boolean {
        const state = this._unitTerrainStates.get(unitId);
        if (!state) {
            return false;
        }

        const config = getTerrainEffectConfig(state.terrain);
        return config.specialEffect === TerrainSpecialEffect.MAGIC_AMPLIFY;
    }

    /**
     * 检查单位是否有魔法抑制效果
     */
    hasMagicSuppress(unitId: string): boolean {
        const state = this._unitTerrainStates.get(unitId);
        if (!state) {
            return false;
        }

        const config = getTerrainEffectConfig(state.terrain);
        return config.specialEffect === TerrainSpecialEffect.MAGIC_SUPPRESS;
    }

    /**
     * 获取单位当前所在的地形
     */
    getUnitTerrain(unitId: string): TerrainType | null {
        const state = this._unitTerrainStates.get(unitId);
        return state ? state.terrain : null;
    }

    /**
     * 初始化战场地形
     * @param terrainMap 地形映射表 { "q,r": TerrainType }
     */
    initBattlefieldTerrain(terrainMap: Record<string, TerrainType>): void {
        if (!this._grid) {
            console.warn('[TerrainEffectManager] 未初始化网格');
            return;
        }

        for (const [key, terrain] of Object.entries(terrainMap)) {
            const [q, r] = key.split(',').map(Number);
            this._grid.setTerrain({ q, r }, terrain);
        }

        console.log('[TerrainEffectManager] 战场地形初始化完成，共', Object.keys(terrainMap).length, '个特殊地形');
    }

    /**
     * 生成随机地形
     * @param obstacleCount 障碍物数量
     * @param specialTerrainCount 特殊地形数量
     */
    generateRandomTerrain(obstacleCount: number = 5, specialTerrainCount: number = 3): void {
        if (!this._grid) {
            console.warn('[TerrainEffectManager] 未初始化网格');
            return;
        }

        const cells = this._grid.getAllCells();

        // 过滤出可用地形（排除起始区域）
        const availableCells = cells.filter(cell => {
            // 排除玩家和敌人的起始区域
            return Math.abs(cell.q) >= 1;
        });

        // 随机放置障碍物
        for (let i = 0; i < obstacleCount && availableCells.length > 0; i++) {
            const index = Math.floor(this.random() * availableCells.length);
            const cell = availableCells.splice(index, 1)[0];
            this._grid.setTerrain({ q: cell.q, r: cell.r }, TerrainType.OBSTACLE);
        }

        // 随机放置特殊地形
        const specialTerrains = [
            TerrainType.SWAMP,
            TerrainType.LAVA,
            TerrainType.SNOW,
            TerrainType.SAND
        ];

        for (let i = 0; i < specialTerrainCount && availableCells.length > 0; i++) {
            const index = Math.floor(this.random() * availableCells.length);
            const cell = availableCells.splice(index, 1)[0];
            const terrainType = specialTerrains[Math.floor(this.random() * specialTerrains.length)];
            this._grid.setTerrain({ q: cell.q, r: cell.r }, terrainType);
        }

        console.log('[TerrainEffectManager] 随机地形生成完成');
    }

    /**
     * 清除所有地形效果状态
     */
    clear(): void {
        this._unitTerrainStates.clear();
        this._grid = null;
        this._currentTurn = 0;
        console.log('[TerrainEffectManager] 清理完成');
    }

    /**
     * 获取调试信息
     */
    getDebugInfo(): { unitCount: number; terrainCount: number } {
        let terrainCount = 0;

        if (this._grid) {
            const cells = this._grid.getAllCells();
            terrainCount = cells.filter(c => c.terrain !== TerrainType.GRASS).length;
        }

        return {
            unitCount: this._unitTerrainStates.size,
            terrainCount
        };
    }
}

// 导出单例
export const terrainEffectManager = TerrainEffectManager.getInstance();