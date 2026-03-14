/**
 * 战争机器战斗桥接器
 * 将战争机器系统集成到战斗中
 * 英雄无敌III：传承
 */

import { BattleManager, BattleEventType } from '../battle/BattleManager';
import { BattleUnit } from '../battle/BattleUnit';
import { Hex } from '../config/GameTypes';
import { WarMachineManager, warMachineManager } from '../warmachine/WarMachineManager';
import {
    WarMachineType,
    WarMachineBattleState,
    WarMachineEventType
} from '../config/WarMachineTypes';
import { EventCenter } from '../utils/EventTarget';

/**
 * 战争机器战斗事件类型
 */
export enum WarMachineBattleEventType {
    MACHINE_ACTION = 'machine_action',
    MACHINE_ATTACK = 'machine_attack',
    MACHINE_HEAL = 'machine_heal',
    MACHINE_DAMAGED = 'machine_damaged',
    MACHINE_DESTROYED = 'machine_destroyed'
}

/**
 * 战争机器行动结果
 */
export interface WarMachineActionResult {
    success: boolean;
    type: WarMachineType;
    instanceId: string;
    damage?: number;
    heal?: number;
    targetId?: string;
}

/**
 * 战争机器战斗桥接器
 */
export class BattleWarMachineBridge {
    private static instance: BattleWarMachineBridge | null = null;

    /** 关联的战斗管理器 */
    private battleManager: BattleManager | null = null;

    /** 当前英雄ID */
    private heroId: string | null = null;

    /** 战争机器战斗状态列表 */
    private battleStates: WarMachineBattleState[] = [];

    /** 事件监听器 */
    private eventListeners: Map<WarMachineBattleEventType, Function[]> = new Map();

    private constructor() {}

    /**
     * 获取单例
     */
    static getInstance(): BattleWarMachineBridge {
        if (!BattleWarMachineBridge.instance) {
            BattleWarMachineBridge.instance = new BattleWarMachineBridge();
        }
        return BattleWarMachineBridge.instance;
    }

    /**
     * 绑定到战斗管理器
     */
    bindToBattle(battleManager: BattleManager, heroId: string): void {
        this.battleManager = battleManager;
        this.heroId = heroId;

        // 初始化战争机器战斗状态
        this.initBattleStates();
    }

    /**
     * 解绑战斗
     */
    unbindBattle(): void {
        this.battleManager = null;
        this.heroId = null;
        this.battleStates = [];
    }

    /**
     * 初始化战斗状态
     */
    private initBattleStates(): void {
        if (!this.heroId) return;

        this.battleStates = warMachineManager.initBattleState(this.heroId);
    }

    /**
     * 获取战斗中的战争机器
     */
    getBattleMachines(): WarMachineBattleState[] {
        return this.battleStates.filter(s => s.currentHp > 0);
    }

    /**
     * 获取弹药车加成
     */
    getAmmoCartBonus(): number {
        const ammoCart = this.battleStates.find(
            s => s.type === WarMachineType.AMMO_CART && s.currentHp > 0
        );
        if (!ammoCart) return 0;

        // 弹药车存活时，远程单位弹药无限
        return Infinity;
    }

    /**
     * 检查是否有弩车
     */
    hasBallista(): boolean {
        return this.battleStates.some(
            s => s.type === WarMachineType.BALLISTA && s.currentHp > 0 && s.shotsRemaining > 0
        );
    }

    /**
     * 检查是否有医疗帐篷
     */
    hasFirstAidTent(): boolean {
        return this.battleStates.some(
            s => s.type === WarMachineType.FIRST_AID_TENT && s.currentHp > 0 && s.shotsRemaining > 0
        );
    }

    /**
     * 执行弩车攻击
     */
    executeBallistaAttack(targetUnit: BattleUnit, heroAttack: number): WarMachineActionResult | null {
        if (!this.heroId || !this.battleManager) {
            return null;
        }

        const ballista = this.battleStates.find(
            s => s.type === WarMachineType.BALLISTA && s.currentHp > 0 && s.shotsRemaining > 0 && !s.hasActed
        );

        if (!ballista) {
            return null;
        }

        // 标记已行动
        ballista.hasActed = true;
        ballista.shotsRemaining--;

        // 计算伤害
        const baseDamage = 10 + ballista.attack + heroAttack * 0.5;
        const damage = Math.floor(baseDamage * (0.8 + Math.random() * 0.4)); // 80%-120%浮动

        // 造成伤害
        const actualDamage = targetUnit.takeDamage(damage);

        // 发送事件
        this.emit(WarMachineBattleEventType.MACHINE_ATTACK, {
            instanceId: ballista.instanceId,
            type: WarMachineType.BALLISTA,
            targetId: targetUnit.id,
            damage: actualDamage
        });

        // 检查目标是否死亡
        if (!targetUnit.isAlive()) {
            this.battleManager.emit(BattleEventType.UNIT_DIE, { unitId: targetUnit.id });
        }

        return {
            success: true,
            type: WarMachineType.BALLISTA,
            instanceId: ballista.instanceId,
            damage: actualDamage,
            targetId: targetUnit.id
        };
    }

    /**
     * 执行医疗帐篷治疗
     */
    executeFirstAidHeal(targetUnit: BattleUnit, heroSpellPower: number): WarMachineActionResult | null {
        if (!this.heroId || !this.battleManager) {
            return null;
        }

        const tent = this.battleStates.find(
            s => s.type === WarMachineType.FIRST_AID_TENT && s.currentHp > 0 && s.shotsRemaining > 0 && !s.hasActed
        );

        if (!tent) {
            return null;
        }

        // 标记已行动
        tent.hasActed = true;
        tent.shotsRemaining--;

        // 计算治疗量
        const baseHeal = 10 + heroSpellPower * 2;
        const heal = Math.floor(baseHeal * (0.8 + Math.random() * 0.4)); // 80%-120%浮动

        // 执行治疗
        const actualHeal = targetUnit.heal(heal);

        // 发送事件
        this.emit(WarMachineBattleEventType.MACHINE_HEAL, {
            instanceId: tent.instanceId,
            type: WarMachineType.FIRST_AID_TENT,
            targetId: targetUnit.id,
            heal: actualHeal
        });

        return {
            success: true,
            type: WarMachineType.FIRST_AID_TENT,
            instanceId: tent.instanceId,
            heal: actualHeal,
            targetId: targetUnit.id
        };
    }

    /**
     * 执行投石车攻击（攻城战）
     */
    executeCatapultAttack(targetHex: Hex, wallSegment?: number): WarMachineActionResult | null {
        if (!this.heroId || !this.battleManager) {
            return null;
        }

        const catapult = this.battleStates.find(
            s => s.type === WarMachineType.CATAPULT && s.currentHp > 0 && s.shotsRemaining > 0 && !s.hasActed
        );

        if (!catapult) {
            return null;
        }

        // 标记已行动
        catapult.hasActed = true;
        catapult.shotsRemaining--;

        // 投石车伤害计算
        const damage = 50 + catapult.attack * 2;

        // 发送事件
        this.emit(WarMachineBattleEventType.MACHINE_ATTACK, {
            instanceId: catapult.instanceId,
            type: WarMachineType.CATAPULT,
            targetHex,
            wallSegment,
            damage
        });

        return {
            success: true,
            type: WarMachineType.CATAPULT,
            instanceId: catapult.instanceId,
            damage
        };
    }

    /**
     * 战争机器受到伤害
     */
    damageMachine(instanceId: string, damage: number): void {
        const machine = this.battleStates.find(s => s.instanceId === instanceId);
        if (!machine) return;

        machine.currentHp = Math.max(0, machine.currentHp - damage);

        this.emit(WarMachineBattleEventType.MACHINE_DAMAGED, {
            instanceId,
            type: machine.type,
            currentHp: machine.currentHp,
            maxHp: machine.maxHp,
            damage
        });

        if (machine.currentHp <= 0) {
            this.emit(WarMachineBattleEventType.MACHINE_DESTROYED, {
                instanceId,
                type: machine.type
            });
        }
    }

    /**
     * 重置回合状态
     */
    resetTurn(): void {
        for (const machine of this.battleStates) {
            machine.hasActed = false;
        }
    }

    /**
     * AI选择战争机器行动
     */
    selectAIAction(): { type: WarMachineType; targetUnit?: BattleUnit } | null {
        if (!this.battleManager) return null;

        const state = this.battleManager.getState();

        // 1. 检查是否有可用的医疗帐篷
        if (this.hasFirstAidTent()) {
            const playerUnits = state.units.filter(
                u => u instanceof BattleUnit && u.team === 'player' && u.isAlive()
            ) as BattleUnit[];

            // 找血量最低的友军
            const woundedUnit = playerUnits.reduce((min, u) => {
                const hpPercent = u.currentHp / u.maxHp;
                const minPercent = min ? min.currentHp / min.maxHp : 1;
                return hpPercent < minPercent && hpPercent < 0.8 ? u : min;
            }, null as BattleUnit | null);

            if (woundedUnit) {
                return { type: WarMachineType.FIRST_AID_TENT, targetUnit: woundedUnit };
            }
        }

        // 2. 检查是否有可用的弩车
        if (this.hasBallista()) {
            const enemyUnits = state.units.filter(
                u => u instanceof BattleUnit && u.team === 'enemy' && u.isAlive()
            ) as BattleUnit[];

            // 优先攻击血量最高的敌人
            const target = enemyUnits.reduce((max, u) => {
                const hp = u.currentHp;
                const maxHp = max ? max.currentHp : 0;
                return hp > maxHp ? u : max;
            }, null as BattleUnit | null);

            if (target) {
                return { type: WarMachineType.BALLISTA, targetUnit: target };
            }
        }

        return null;
    }

    /**
     * 执行AI选择的战争机器行动
     */
    executeAIAction(heroAttack: number, heroSpellPower: number): WarMachineActionResult | null {
        const action = this.selectAIAction();
        if (!action || !action.targetUnit) return null;

        switch (action.type) {
            case WarMachineType.BALLISTA:
                return this.executeBallistaAttack(action.targetUnit, heroAttack);

            case WarMachineType.FIRST_AID_TENT:
                return this.executeFirstAidHeal(action.targetUnit, heroSpellPower);

            default:
                return null;
        }
    }

    /**
     * 获取战争机器状态摘要
     */
    getStatusSummary(): { type: WarMachineType; hp: number; maxHp: number; available: boolean }[] {
        return this.battleStates.map(s => ({
            type: s.type,
            hp: s.currentHp,
            maxHp: s.maxHp,
            available: s.currentHp > 0 && !s.hasActed && s.shotsRemaining > 0
        }));
    }

    /**
     * 添加事件监听
     */
    on(eventType: WarMachineBattleEventType, callback: Function): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType)!.push(callback);
    }

    /**
     * 移除事件监听
     */
    off(eventType: WarMachineBattleEventType, callback: Function): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index >= 0) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 发送事件
     */
    private emit(eventType: WarMachineBattleEventType, data: any): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }

        // 同时触发全局事件
        EventCenter.emit(`war_machine_battle_${eventType}`, data);
    }

    /**
     * 清理
     */
    cleanup(): void {
        this.unbindBattle();
        this.eventListeners.clear();
    }
}

// 导出单例
export const battleWarMachineBridge = BattleWarMachineBridge.getInstance();