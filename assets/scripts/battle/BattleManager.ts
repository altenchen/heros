/**
 * MVP 简化版战斗管理器
 * 管理整个战斗流程
 */

import {
    Hex,
    UnitState,
    INITIAL_FOCUS_POINTS,
    MAX_BATTLE_TURNS,
    StatusEffect,
    TerrainType
} from '../config/GameTypes';
import { HexGrid } from './HexGrid';
import { BattleUnit, SimpleHeroData } from './BattleUnit';
import { EventCenter, GameEvent } from '../utils/EventTarget';

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
 * 战斗结果
 */
export interface BattleResult {
    winner: 'player' | 'enemy' | null;
    turns: number;
    rewards: {
        gold: number;
        experience: number;
    };
}

/**
 * 战斗状态
 */
interface BattleState {
    turn: number;
    phase: 'preparation' | 'battle' | 'end';
    units: BattleUnit[];
    currentUnit: BattleUnit | null;
    winner: 'player' | 'enemy' | null;
}

/**
 * 行动类型
 */
enum ActionType {
    MOVE = 'move',
    ATTACK = 'attack',
    WAIT = 'wait'
}

/**
 * AI决策
 */
interface AIDecision {
    type: ActionType;
    target?: Hex;
    targetUnit?: BattleUnit;
}

/**
 * 简化版战斗管理器
 */
export class BattleManager {
    private grid: HexGrid;
    private state: BattleState;
    private events: BattleEvent[] = [];
    private eventListeners: Map<BattleEventType, Function[]> = new Map();

    private playerHero: SimpleHeroData | null = null;
    private enemyHero: SimpleHeroData | null = null;

    constructor() {
        this.grid = new HexGrid();
        this.state = this.createInitialState();
    }

    /**
     * 创建初始战斗状态
     */
    private createInitialState(): BattleState {
        return {
            turn: 0,
            phase: 'preparation',
            units: [],
            currentUnit: null,
            winner: null
        };
    }

    /**
     * 初始化战斗
     */
    initBattle(
        playerUnits: { config: any; count: number; position: Hex }[],
        enemyUnits: { config: any; count: number; position: Hex }[],
        playerHero: SimpleHeroData,
        enemyHero: SimpleHeroData
    ): void {
        this.grid.reset();
        this.events = [];
        this.state = this.createInitialState();

        this.playerHero = playerHero;
        this.enemyHero = enemyHero;

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
            this.grid.placeUnit(unitData.position, unit as any);
            this.state.units.push(unit);
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
            this.grid.placeUnit(unitData.position, unit as any);
            this.state.units.push(unit);
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
        if (this.checkBattleEnd()) {
            return;
        }

        if (this.state.turn > MAX_BATTLE_TURNS) {
            this.endBattle(null);
            return;
        }

        // 重置所有单位的回合状态
        for (const unit of this.state.units) {
            if (unit.isAlive()) {
                unit.resetTurn();
            }
        }

        // 按速度排序单位
        const sortedUnits = this.getSortedUnits();

        // 执行每个单位的行动
        for (const unit of sortedUnits) {
            if (!unit.isAlive()) continue;

            this.state.currentUnit = unit;

            // AI决策并执行
            const decision = this.makeAIDecision(unit);
            this.executeDecision(unit, decision);

            if (this.checkBattleEnd()) {
                return;
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
        const livingUnits = this.state.units.filter(u => u.isAlive());

        livingUnits.sort((a, b) => {
            if (a.speed !== b.speed) {
                return b.speed - a.speed;
            }
            if (a.team !== b.team) {
                return a.team === 'player' ? -1 : 1;
            }
            return a.id.localeCompare(b.id);
        });

        return livingUnits;
    }

    /**
     * AI决策
     */
    private makeAIDecision(unit: BattleUnit): AIDecision {
        const enemies = this.state.units.filter(
            u => u.team !== unit.team && u.isAlive()
        );

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
        const path = this.grid.findPath(unit.position, nearestEnemy.position);

        if (path.length === 0) {
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

        // 计算伤害
        let damage = attacker.calculateDamage(target, isRanged, distance);

        // 造成伤害
        const actualDamage = target.takeDamage(damage);

        this.emit(BattleEventType.UNIT_ATTACK, {
            attackerId: attacker.id,
            targetId: target.id,
            damage: actualDamage,
            isRanged
        });

        EventCenter.emit(GameEvent.UNIT_DAMAGED, {
            unitId: target.id,
            damage: actualDamage
        });

        // 检查目标是否死亡
        if (!target.isAlive()) {
            this.emit(BattleEventType.UNIT_DIE, { unitId: target.id });
            this.grid.removeUnit(target.position);
        } else {
            // 目标反击
            if (!isRanged || distance === 1) {
                const counterDamage = target.counterAttack(attacker);
                if (counterDamage > 0) {
                    attacker.takeDamage(counterDamage);

                    if (!attacker.isAlive()) {
                        this.emit(BattleEventType.UNIT_DIE, { unitId: attacker.id });
                        this.grid.removeUnit(attacker.position);
                    }
                }
            }
        }
    }

    /**
     * 检查战斗是否结束
     */
    private checkBattleEnd(): boolean {
        const playerAlive = this.state.units.some(
            u => u.team === 'player' && u.isAlive()
        );
        const enemyAlive = this.state.units.some(
            u => u.team === 'enemy' && u.isAlive()
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
            rewards: {
                gold: winner === 'player' ? 1000 : 0,
                experience: winner === 'player' ? 500 : 0
            }
        };

        this.emit(BattleEventType.BATTLE_END, { result });
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
     * 清理战斗资源
     */
    cleanup(): void {
        this.state.units = [];
        this.events = [];
        this.eventListeners.clear();
        this.playerHero = null;
        this.enemyHero = null;
    }
}

/** 战斗管理器单例 */
export const battleManager = new BattleManager();