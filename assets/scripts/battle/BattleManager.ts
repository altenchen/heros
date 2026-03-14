/**
 * 战斗管理器
 * 管理整个战斗流程
 */

import {
    Hex,
    UnitState,
    INITIAL_FOCUS_POINTS,
    MAX_FOCUS_POINTS,
    MAX_BATTLE_TURNS,
    StatusEffect,
    TerrainType
} from '../config/GameTypes';
import { HexGrid, HexCell } from './HexGrid';
import { BattleUnit } from './BattleUnit';
import { SkillManager } from '../skill/SkillManager';
import { battlePoolManager, PooledBuffData } from '../utils/pool';
import { BuffManager, buffManager } from './BuffManager';
import { BuffEventType, BuffEffectType, AttributeType } from '../config/BuffTypes';
import { TerrainEffectManager, terrainEffectManager } from './TerrainEffectManager';
import { EventCenter, GameEvent } from '../utils/EventTarget';
import { battleMagicBridge, SpellTarget, BattleMagicEventType } from '../magicbook/BattleMagicBridge';
import { battleWarMachineBridge, WarMachineBattleEventType } from '../warmachine/BattleWarMachineBridge';
import { WarMachineType } from '../config/WarMachineTypes';

/**
 * 战斗事件类型
 */
export enum BattleEventType {
    BATTLE_START = 'battle_start',
    TURN_START = 'turn_start',
    UNIT_ACTION = 'unit_action',
    UNIT_MOVE = 'unit_move',
    UNIT_ATTACK = 'unit_attack',
    UNIT_DIE = 'unit_die',
    SKILL_CAST = 'skill_cast',
    SPELL_CAST = 'spell_cast',
    WAR_MACHINE_ACTION = 'war_machine_action',
    FOCUS_CHANGE = 'focus_change',
    BATTLE_END = 'battle_end'
}

/**
 * 战斗事件
 */
export interface BattleEvent {
    type: BattleEventType;
    data: any;
    timestamp: number;
}

/**
 * 战斗单位接口（用于类型兼容）
 */
type IBattleUnit = BattleUnit;

/**
 * 战斗状态（使用 BattleUnit 类类型）
 */
interface LocalBattleState {
    turn: number;
    phase: 'preparation' | 'battle' | 'end';
    focusPoints: number;
    maxFocusPoints: number;
    units: BattleUnit[];
    currentUnit: BattleUnit | null;
    terrain: TerrainType[][];
    winner: 'player' | 'enemy' | null;
}

/**
 * 战斗结果
 */
export interface BattleResult {
    winner: 'player' | 'enemy' | null;
    turns: number;
    survivedUnits: IBattleUnit[];
    rewards: {
        gold: number;
        experience: number;
    };
    events: BattleEvent[];
}

/**
 * 行动类型
 */
enum ActionType {
    MOVE = 'move',
    ATTACK = 'attack',
    WAIT = 'wait',
    SKILL = 'skill'
}

/**
 * 战斗AI决策
 */
interface AIDecision {
    type: ActionType;
    target?: Hex;
    targetUnit?: BattleUnit;
    skillId?: string;
}

/**
 * 战斗管理器
 */
export class BattleManager {
    private grid: HexGrid;
    private state: BattleState;
    private events: BattleEvent[] = [];
    private skillManager: SkillManager;
    private buffManager: BuffManager;
    private terrainEffectManager: TerrainEffectManager;
    private eventListeners: Map<BattleEventType, Function[]> = new Map();

    /** 玩家英雄数据 */
    private playerHero: any = null;

    /** 敌人英雄数据 */
    private enemyHero: any = null;

    constructor() {
        this.grid = new HexGrid();
        this.skillManager = new SkillManager();
        this.buffManager = BuffManager.getInstance();
        this.terrainEffectManager = TerrainEffectManager.getInstance();
        this.state = this.createInitialState();
    }

    /**
     * 创建初始战斗状态
     */
    private createInitialState(): BattleState {
        return {
            turn: 0,
            phase: 'preparation',
            focusPoints: INITIAL_FOCUS_POINTS,
            maxFocusPoints: INITIAL_FOCUS_POINTS,
            units: [],
            currentUnit: null,
            terrain: [],
            winner: null
        };
    }

    /**
     * 初始化战斗
     */
    initBattle(
        playerUnits: { config: any; count: number; position: Hex }[],
        enemyUnits: { config: any; count: number; position: Hex }[],
        playerHero: any,
        enemyHero: any
    ): void {
        // 清空战场
        this.grid.reset();
        this.events = [];
        this.state = this.createInitialState();

        // 存储英雄数据
        this.playerHero = playerHero;
        this.enemyHero = enemyHero;

        // 初始化地形效果管理器
        this.terrainEffectManager.init(this.grid);

        // 初始化魔法书桥接器
        if (playerHero && playerHero.id) {
            battleMagicBridge.bindToBattle(this, playerHero.id);
        }

        // 初始化战争机器桥接器
        if (playerHero && playerHero.id) {
            battleWarMachineBridge.bindToBattle(this, playerHero.id);
        }

        // 放置玩家单位
        playerUnits.forEach((unitData, index) => {
            const unit = new BattleUnit(
                `player_unit_${index}`,
                unitData.config,
                playerHero,
                'player',
                unitData.position,
                unitData.count
            );
            this.grid.placeUnit(unitData.position, unit);
            this.state.units.push(unit);

            // 检查初始位置的地形效果
            const cell = this.grid.getCellByHex(unitData.position);
            if (cell && cell.terrain !== TerrainType.GRASS) {
                this.terrainEffectManager.onUnitEnterTerrain(unit, cell.terrain);
            }
        });

        // 放置敌人单位
        enemyUnits.forEach((unitData, index) => {
            const unit = new BattleUnit(
                `enemy_unit_${index}`,
                unitData.config,
                enemyHero,
                'enemy',
                unitData.position,
                unitData.count
            );
            this.grid.placeUnit(unitData.position, unit);
            this.state.units.push(unit);

            // 检查初始位置的地形效果
            const cell = this.grid.getCellByHex(unitData.position);
            if (cell && cell.terrain !== TerrainType.GRASS) {
                this.terrainEffectManager.onUnitEnterTerrain(unit, cell.terrain);
            }
        });

        this.emit(BattleEventType.BATTLE_START, { state: this.state });
    }

    /**
     * 开始战斗
     */
    startBattle(): void {
        this.state.phase = 'battle';
        this.state.turn = 1;
        this.emit(BattleEventType.TURN_START, { turn: this.state.turn });
        this.executeTurn();
    }

    /**
     * 执行回合
     */
    private executeTurn(): void {
        // 检查战斗是否结束
        if (this.checkBattleEnd()) {
            return;
        }

        // 检查回合限制
        if (this.state.turn > MAX_BATTLE_TURNS) {
            this.endBattle(null);
            return;
        }

        // 设置当前回合到地形效果管理器
        this.terrainEffectManager.setTurn(this.state.turn);

        // 重置所有单位的回合状态
        for (const unit of this.state.units) {
            if (unit instanceof BattleUnit) {
                // 回合开始时处理 Buff 效果
                this.buffManager.processTurnStartBuffs(unit);
                // 回合开始时处理地形效果
                this.terrainEffectManager.processTurnStartTerrainEffects(unit);
                unit.resetTurn();
            }
        }

        // 按速度排序单位
        const sortedUnits = this.getSortedUnits();

        // 执行每个单位的行动
        for (const unit of sortedUnits) {
            if (!unit.isAlive()) continue;

            // 检查是否被眩晕或石化
            if (this.buffManager.hasStatus(unit.id, StatusEffect.STUN) ||
                this.buffManager.hasStatus(unit.id, StatusEffect.STONE)) {
                console.log(`[BattleManager] ${unit.id} 被控制，跳过行动`);
                continue;
            }

            this.state.currentUnit = unit;

            // AI决策并执行
            if (unit.team === 'enemy') {
                const decision = this.makeAIDecision(unit);
                this.executeDecision(unit, decision);
            } else {
                // 玩家单位由玩家控制，这里先执行AI模拟
                const decision = this.makeAIDecision(unit);
                this.executeDecision(unit, decision);
            }

            // 检查战斗是否结束
            if (this.checkBattleEnd()) {
                return;
            }
        }

        // 回合结束时处理所有单位的 Buff
        for (const unit of this.state.units) {
            if (unit instanceof BattleUnit && unit.isAlive()) {
                this.buffManager.processTurnEndBuffs(unit);
            }
        }

        // 回合结束
        this.state.turn++;
        this.emit(BattleEventType.TURN_START, { turn: this.state.turn });

        // 继续下一回合
        this.executeTurn();
    }

    /**
     * 按速度排序单位
     */
    private getSortedUnits(): BattleUnit[] {
        const livingUnits = this.state.units.filter(
            u => u instanceof BattleUnit && u.isAlive()
        ) as BattleUnit[];

        // 按速度降序排序
        livingUnits.sort((a, b) => {
            // 速度高的先动
            if (a.speed !== b.speed) {
                return b.speed - a.speed;
            }
            // 同速度时，玩家单位优先
            if (a.team !== b.team) {
                return a.team === 'player' ? -1 : 1;
            }
            // 都同队时，按位置排序
            return a.id.localeCompare(b.id);
        });

        return livingUnits;
    }

    /**
     * AI决策
     */
    private makeAIDecision(unit: BattleUnit): AIDecision {
        const enemies = this.state.units.filter(
            u => u instanceof BattleUnit && u.team !== unit.team && u.isAlive()
        ) as BattleUnit[];

        if (enemies.length === 0) {
            return { type: ActionType.WAIT };
        }

        // 寻找最近的敌人
        let nearestEnemy: BattleUnit | null = null;
        let minDistance = Infinity;

        for (const enemy of enemies) {
            const distance = this.grid.getDistance(unit.position, enemy.position);
            if (distance < minDistance) {
                minDistance = distance;
                nearestEnemy = enemy;
            }
        }

        if (!nearestEnemy) {
            return { type: ActionType.WAIT };
        }

        // 判断是否可以攻击
        const attackRange = unit.getAttackRange();
        if (minDistance <= attackRange) {
            return {
                type: ActionType.ATTACK,
                targetUnit: nearestEnemy
            };
        }

        // 需要移动
        // 寻路到目标
        const path = this.grid.findPath(unit.position, nearestEnemy.position);

        if (path.length === 0) {
            // 无法到达，尝试攻击其他目标
            for (const enemy of enemies) {
                const distance = this.grid.getDistance(unit.position, enemy.position);
                if (distance <= attackRange) {
                    return {
                        type: ActionType.ATTACK,
                        targetUnit: enemy
                    };
                }
            }
            return { type: ActionType.WAIT };
        }

        // 移动到路径上最远可达位置
        const moveRange = unit.getMoveRange();
        const moveTarget = path[Math.min(moveRange - 1, path.length - 1)];

        return {
            type: ActionType.MOVE,
            target: moveTarget,
            targetUnit: minDistance <= unit.getAttackRange() + moveRange ? nearestEnemy : undefined
        };
    }

    /**
     * 执行决策
     */
    private executeDecision(unit: BattleUnit, decision: AIDecision): void {
        switch (decision.type) {
            case ActionType.MOVE:
                this.executeMove(unit, decision.target!);
                // 移动后检查是否可以攻击
                if (decision.targetUnit) {
                    const distance = this.grid.getDistance(unit.position, decision.targetUnit.position);
                    if (distance <= unit.getAttackRange()) {
                        this.executeAttack(unit, decision.targetUnit);
                    }
                }
                break;

            case ActionType.ATTACK:
                this.executeAttack(unit, decision.targetUnit!);
                break;

            case ActionType.WAIT:
                // 等待不做任何事
                break;
        }

        unit.hasActed = true;
    }

    /**
     * 执行移动
     */
    private executeMove(unit: BattleUnit, target: Hex): void {
        const oldPosition = { ...unit.position };
        this.grid.moveUnit(unit.position, target);
        unit.position = target;

        // 处理地形效果变化
        this.terrainEffectManager.onUnitMove(unit, oldPosition, target);

        this.emit(BattleEventType.UNIT_MOVE, {
            unitId: unit.id,
            from: oldPosition,
            to: target
        });
    }

    /**
     * 执行攻击
     */
    private executeAttack(attacker: BattleUnit, target: BattleUnit): void {
        const distance = this.grid.getDistance(attacker.position, target.position);
        const isRanged = attacker.isRanged && distance > 1;

        // 检查失明效果
        if (this.buffManager.hasStatus(attacker.id, StatusEffect.BLIND)) {
            // 失明有50%概率攻击失误
            if (Math.random() < 0.5) {
                console.log(`[BattleManager] ${attacker.id} 因失明攻击失误`);
                this.emit(BattleEventType.UNIT_ATTACK, {
                    attackerId: attacker.id,
                    targetId: target.id,
                    damage: 0,
                    isRanged,
                    missed: true
                });
                attacker.hasActed = true;
                return;
            }
        }

        // 计算伤害
        let damage = attacker.calculateDamage(target, isRanged, distance);

        // 应用地形攻击修正
        const attackModifier = this.terrainEffectManager.getAttackModifier(attacker.id);
        if (attackModifier !== 0) {
            damage = damage * (1 + attackModifier / 100);
        }

        // 应用地形防御修正
        const defenseModifier = this.terrainEffectManager.getDefenseModifier(target.id);
        if (defenseModifier !== 0) {
            damage = damage * (1 - defenseModifier / 200); // 防御修正效果减半
        }

        // 应用地形远程修正
        if (isRanged) {
            const rangedModifier = this.terrainEffectManager.getRangedModifier(attacker.id);
            if (rangedModifier !== 0) {
                damage = damage * (1 + rangedModifier / 100);
            }
        }

        // 祝福效果：伤害最大化
        if (this.buffManager.hasStatus(attacker.id, StatusEffect.BLESS)) {
            damage = attacker.config.damage[1] * attacker.count;
            console.log(`[BattleManager] ${attacker.id} 祝福效果，伤害最大化`);
        }

        // 诅咒效果：伤害最小化
        if (this.buffManager.hasStatus(attacker.id, StatusEffect.CURSE)) {
            damage = attacker.config.damage[0] * attacker.count;
            console.log(`[BattleManager] ${attacker.id} 诅咒效果，伤害最小化`);
        }

        // 应用特技
        this.applySpecialtyOnAttack(attacker, target, damage);

        // 造成伤害
        const actualDamage = target.takeDamage(damage);

        this.emit(BattleEventType.UNIT_ATTACK, {
            attackerId: attacker.id,
            targetId: target.id,
            damage: actualDamage,
            isRanged
        });

        // 触发特效事件：单位受伤
        EventCenter.emit(GameEvent.UNIT_DAMAGED, {
            unitId: target.id,
            damage: actualDamage,
            isCritical: false // 可以根据伤害值判断是否暴击
        });

        // 积累专注点
        this.addFocusPoint(1);

        // 检查目标是否死亡
        if (!target.isAlive()) {
            this.emit(BattleEventType.UNIT_DIE, { unitId: target.id });
            this.grid.removeUnit(target.position);
            // 清除目标的所有Buff
            this.buffManager.clearBuffs(target.id);
        } else {
            // 目标反击
            if (!isRanged || distance === 1) {
                // 检查目标是否被眩晕或石化
                if (this.buffManager.hasStatus(target.id, StatusEffect.STUN) ||
                    this.buffManager.hasStatus(target.id, StatusEffect.STONE)) {
                    console.log(`[BattleManager] ${target.id} 被控制，无法反击`);
                } else {
                    const counterDamage = target.counterAttack(attacker);
                    if (counterDamage > 0) {
                        attacker.takeDamage(counterDamage);

                        if (!attacker.isAlive()) {
                            this.emit(BattleEventType.UNIT_DIE, { unitId: attacker.id });
                            this.grid.removeUnit(attacker.position);
                            this.buffManager.clearBuffs(attacker.id);
                        }
                    }
                }
            }
        }
    }

    /**
     * 应用攻击时特技
     */
    private applySpecialtyOnAttack(attacker: BattleUnit, target: BattleUnit, damage: number): void {
        const specialty = attacker.config.specialty;

        // 检查概率触发
        if (specialty.effect.probability && Math.random() > specialty.effect.probability) {
            return;
        }

        switch (specialty.id) {
            case 'vampire_drain':
                // 吸血鬼吸血
                const healAmount = Math.floor(damage * 0.2);
                attacker.heal(healAmount);
                break;

            case 'wraith_aging':
            case 'ghost_dragon_aging':
                // 幽灵/鬼龙衰老 - 使用BuffManager
                this.buffManager.applyStatusBuff(
                    target.id,
                    StatusEffect.AGING,
                    attacker.id,
                    3,
                    specialty.effect.value as number
                );
                // 同步到BattleUnit（兼容）
                target.addBuff({
                    id: 'aging',
                    status: specialty.effect.status!,
                    duration: 3,
                    value: specialty.effect.value as number,
                    source: attacker.id
                });
                break;

            case 'zombie_disease':
                // 僵尸疾病
                target.modifySpeed(-(specialty.effect.value as number));
                break;

            case 'medusa_stone':
                // 美杜莎石化 - 使用BuffManager
                this.buffManager.applyStatusBuff(
                    target.id,
                    StatusEffect.STONE,
                    attacker.id,
                    specialty.effect.duration!
                );
                // 同步到BattleUnit（兼容）
                target.addBuff({
                    id: 'stone',
                    status: specialty.effect.status!,
                    duration: specialty.effect.duration!,
                    value: 0,
                    source: attacker.id
                });
                break;
        }
    }

    /**
     * 检查战斗是否结束
     */
    private checkBattleEnd(): boolean {
        const playerAlive = this.state.units.some(
            u => u instanceof BattleUnit && u.team === 'player' && u.isAlive()
        );
        const enemyAlive = this.state.units.some(
            u => u instanceof BattleUnit && u.team === 'enemy' && u.isAlive()
        );

        if (!playerAlive) {
            this.endBattle('enemy');
            return true;
        }

        if (!enemyAlive) {
            this.endBattle('player');
            return true;
        }

        return false;
    }

    /**
     * 结束战斗
     */
    private endBattle(winner: 'player' | 'enemy' | null): void {
        this.state.winner = winner;
        this.state.phase = 'end';

        const result: BattleResult = {
            winner,
            turns: this.state.turn,
            survivedUnits: this.state.units.filter(
                u => u instanceof BattleUnit && u.isAlive()
            ).map(u => (u as BattleUnit).toJSON()),
            rewards: {
                gold: winner === 'player' ? 1000 : 0,
                experience: winner === 'player' ? 500 : 0
            },
            events: this.events
        };

        this.emit(BattleEventType.BATTLE_END, { result });
    }

    /**
     * 添加专注点
     */
    addFocusPoint(amount: number): void {
        this.state.focusPoints = Math.min(
            this.state.maxFocusPoints,
            this.state.focusPoints + amount
        );
        this.emit(BattleEventType.FOCUS_CHANGE, { focusPoints: this.state.focusPoints });
    }

    /**
     * 消耗专注点
     */
    useFocusPoint(amount: number): boolean {
        if (this.state.focusPoints < amount) {
            return false;
        }
        this.state.focusPoints -= amount;
        this.emit(BattleEventType.FOCUS_CHANGE, { focusPoints: this.state.focusPoints });
        return true;
    }

    /**
     * 释放技能
     */
    castSkill(skillId: string, target: Hex | BattleUnit): boolean {
        if (!this.state.currentUnit) {
            return false;
        }

        const skillConfig = this.skillManager.getSkill(skillId);
        if (!skillConfig) {
            return false;
        }

        // 检查专注点消耗
        if (skillConfig.cost.focus && !this.useFocusPoint(skillConfig.cost.focus)) {
            return false;
        }

        // 创建技能实例
        const skill = this.skillManager.createSkill(skillId, this.state.currentUnit);
        if (!skill) {
            return false;
        }

        // 执行技能
        const success = this.skillManager.castSkill(
            skill,
            this.state.currentUnit,
            target,
            this.grid
        );

        if (success) {
            this.emit(BattleEventType.SKILL_CAST, {
                skillId,
                casterId: this.state.currentUnit.id,
                target
            });
        }

        return success;
    }

    /**
     * 施放魔法
     */
    castSpell(spellId: string, target: SpellTarget): boolean {
        const result = battleMagicBridge.castSpell(spellId, target);

        if (result.success) {
            this.emit(BattleEventType.SPELL_CAST, {
                spellId,
                casterId: this.playerHero?.id,
                targets: result.targets,
                damage: result.damage,
                heal: result.heal,
                manaCost: result.manaCost
            });

            // 检查是否有单位死亡
            this.checkAndRemoveDeadUnits();
        }

        return result.success;
    }

    /**
     * 执行战争机器行动
     */
    executeWarMachineAction(): void {
        if (!this.playerHero) return;

        const heroAttack = this.playerHero.attack || 10;
        const heroSpellPower = this.playerHero.spellPower || 10;

        const result = battleWarMachineBridge.executeAIAction(heroAttack, heroSpellPower);

        if (result) {
            this.emit(BattleEventType.WAR_MACHINE_ACTION, {
                type: result.type,
                instanceId: result.instanceId,
                targetId: result.targetId,
                damage: result.damage,
                heal: result.heal
            });
        }
    }

    /**
     * 检查并移除死亡单位
     */
    private checkAndRemoveDeadUnits(): void {
        const deadUnits = this.state.units.filter(
            u => u instanceof BattleUnit && !u.isAlive()
        ) as BattleUnit[];

        for (const unit of deadUnits) {
            this.emit(BattleEventType.UNIT_DIE, { unitId: unit.id });
            this.grid.removeUnit(unit.position);
            this.buffManager.clearBuffs(unit.id);
        }

        // 更新单位列表
        this.state.units = this.state.units.filter(
            u => u instanceof BattleUnit && u.isAlive()
        );
    }

    /**
     * 获取玩家英雄
     */
    getPlayerHero(): any {
        return this.playerHero;
    }

    /**
     * 获取敌人英雄
     */
    getEnemyHero(): any {
        return this.enemyHero;
    }

    /**
     * 获取魔法书桥接器
     */
    getMagicBridge(): typeof battleMagicBridge {
        return battleMagicBridge;
    }

    /**
     * 获取战争机器桥接器
     */
    getWarMachineBridge(): typeof battleWarMachineBridge {
        return battleWarMachineBridge;
    }

    /**
     * 发送事件
     */
    emit(type: BattleEventType, data: any): void {
        const event: BattleEvent = {
            type,
            data,
            timestamp: Date.now()
        };
        this.events.push(event);

        const listeners = this.eventListeners.get(type);
        if (listeners) {
            listeners.forEach(callback => callback(event));
        }
    }

    /**
     * 添加事件监听器
     */
    on(type: BattleEventType, callback: Function): void {
        if (!this.eventListeners.has(type)) {
            this.eventListeners.set(type, []);
        }
        this.eventListeners.get(type)!.push(callback);
    }

    /**
     * 移除事件监听器
     */
    off(type: BattleEventType, callback: Function): void {
        const listeners = this.eventListeners.get(type);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index >= 0) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 获取战斗状态
     */
    getState(): BattleState {
        return this.state;
    }

    /**
     * 获取网格
     */
    getGrid(): HexGrid {
        return this.grid;
    }

    /**
     * 获取战斗事件历史
     */
    getEvents(): BattleEvent[] {
        return [...this.events];
    }

    /**
     * 获取Buff管理器
     */
    getBuffManager(): BuffManager {
        return this.buffManager;
    }

    /**
     * 获取地形效果管理器
     */
    getTerrainEffectManager(): TerrainEffectManager {
        return this.terrainEffectManager;
    }

    /**
     * 清理战斗资源
     */
    cleanup(): void {
        // 归还所有单位的buff到池中
        for (const unit of this.state.units) {
            if (unit instanceof BattleUnit) {
                unit.buffs.forEach(buff => {
                    // 尝试归还buff到池中
                    if ('reset' in buff && typeof (buff as any).reset === 'function') {
                        (buff as PooledBuffData).reset();
                        battlePoolManager.returnBuff(buff as PooledBuffData);
                    }
                });
                // 清除BuffManager中的buff
                this.buffManager.clearBuffs(unit.id);
            }
        }

        // 清理战斗池
        battlePoolManager.clear();

        // 清理地形效果管理器
        this.terrainEffectManager.clear();

        // 清理魔法书桥接器
        battleMagicBridge.cleanup();

        // 清理战争机器桥接器
        battleWarMachineBridge.cleanup();

        // 清空英雄引用
        this.playerHero = null;
        this.enemyHero = null;

        // 清空引用
        this.state.units = [];
        this.events = [];
        this.eventListeners.clear();
    }

    /**
     * 创建池化的Buff数据
     */
    createBuff(
        id: string,
        status: StatusEffect,
        duration: number,
        value: number,
        source: string
    ): PooledBuffData {
        return battlePoolManager.getBuff({
            id,
            status,
            duration,
            value,
            source
        });
    }
}

/** 战斗管理器单例 */
export const battleManager = new BattleManager();