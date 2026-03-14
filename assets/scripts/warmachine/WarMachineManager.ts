/**
 * 战争机器管理器
 * 管理战争机器的获取、装备、升级和战斗
 */

import {
    WarMachineType,
    WarMachineRarity,
    WarMachineConfig,
    WarMachineInstance,
    WarMachineBattleState,
    WarMachineEventType,
    WarMachineActionResult,
    WarMachineSaveData
} from '../config/WarMachineTypes';
import {
    WarMachineConfigs,
    WarMachineConfigMap,
    WarMachinesByType,
    getNextLevelWarMachine
} from '../../configs/war_machine.json';
import { EventCenter } from '../utils/EventTarget';

/**
 * 战争机器管理器类
 */
export class WarMachineManager {
    private static instance: WarMachineManager | null = null;

    /** 拥有的战争机器 */
    private machines: Map<string, WarMachineInstance> = new Map();

    /** 英雄装备映射 */
    private heroEquipments: Map<string, string[]> = new Map();

    /** 战斗中的战争机器状态 */
    private battleStates: Map<string, WarMachineBattleState> = new Map();

    private constructor() {}

    /**
     * 获取单例
     */
    static getInstance(): WarMachineManager {
        if (!WarMachineManager.instance) {
            WarMachineManager.instance = new WarMachineManager();
        }
        return WarMachineManager.instance;
    }

    /**
     * 初始化
     */
    init(): void {
        console.log('[WarMachineManager] 初始化战争机器系统');
    }

    /**
     * 获取战争机器配置
     */
    getConfig(configId: string): WarMachineConfig | undefined {
        return WarMachineConfigMap.get(configId);
    }

    /**
     * 添加战争机器
     */
    addMachine(configId: string, level: number = 1): WarMachineInstance | null {
        const config = WarMachineConfigMap.get(configId);
        if (!config) {
            console.warn(`[WarMachineManager] 配置不存在: ${configId}`);
            return null;
        }

        const instanceId = `war_machine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const maxHp = config.stats.hp! + (config.growth.hp || 0) * (level - 1);

        const instance: WarMachineInstance = {
            instanceId,
            configId,
            level,
            currentHp: maxHp,
            maxHp,
            equipped: false
        };

        this.machines.set(instanceId, instance);

        // 触发事件
        EventCenter.emit(WarMachineEventType.OBTAINED, {
            instanceId,
            configId,
            level
        });

        console.log(`[WarMachineManager] 获得战争机器: ${config.name}`);
        return instance;
    }

    /**
     * 移除战争机器
     */
    removeMachine(instanceId: string): boolean {
        const instance = this.machines.get(instanceId);
        if (!instance) return false;

        // 如果已装备，先卸下
        if (instance.equipped && instance.heroId) {
            this.unequipMachine(instanceId);
        }

        this.machines.delete(instanceId);
        return true;
    }

    /**
     * 获取战争机器实例
     */
    getMachine(instanceId: string): WarMachineInstance | undefined {
        return this.machines.get(instanceId);
    }

    /**
     * 获取所有战争机器
     */
    getAllMachines(): WarMachineInstance[] {
        return Array.from(this.machines.values());
    }

    /**
     * 按类型获取战争机器
     */
    getMachinesByType(type: WarMachineType): WarMachineInstance[] {
        return Array.from(this.machines.values()).filter(m => {
            const config = WarMachineConfigMap.get(m.configId);
            return config?.type === type;
        });
    }

    /**
     * 装备战争机器到英雄
     */
    equipMachine(instanceId: string, heroId: string): boolean {
        const instance = this.machines.get(instanceId);
        if (!instance) {
            console.warn(`[WarMachineManager] 战争机器不存在: ${instanceId}`);
            return false;
        }

        if (instance.equipped) {
            console.warn(`[WarMachineManager] 战争机器已被装备`);
            return false;
        }

        // 检查英雄是否已有同类型战争机器
        const config = WarMachineConfigMap.get(instance.configId);
        if (config) {
            const heroMachines = this.getHeroMachines(heroId);
            const hasSameType = heroMachines.some(m => {
                const mConfig = WarMachineConfigMap.get(m.configId);
                return mConfig?.type === config.type;
            });

            if (hasSameType) {
                console.warn(`[WarMachineManager] 英雄已有同类型战争机器`);
                return false;
            }
        }

        // 装备
        instance.equipped = true;
        instance.heroId = heroId;

        // 更新英雄装备映射
        if (!this.heroEquipments.has(heroId)) {
            this.heroEquipments.set(heroId, []);
        }
        this.heroEquipments.get(heroId)!.push(instanceId);

        // 触发事件
        EventCenter.emit(WarMachineEventType.EQUIPPED, {
            instanceId,
            heroId
        });

        console.log(`[WarMachineManager] 装备战争机器到英雄: ${heroId}`);
        return true;
    }

    /**
     * 卸下战争机器
     */
    unequipMachine(instanceId: string): boolean {
        const instance = this.machines.get(instanceId);
        if (!instance || !instance.equipped || !instance.heroId) {
            return false;
        }

        const heroId = instance.heroId;

        // 更新实例状态
        instance.equipped = false;
        instance.heroId = undefined;

        // 更新英雄装备映射
        const heroMachines = this.heroEquipments.get(heroId);
        if (heroMachines) {
            const index = heroMachines.indexOf(instanceId);
            if (index >= 0) {
                heroMachines.splice(index, 1);
            }
        }

        // 触发事件
        EventCenter.emit(WarMachineEventType.UNEQUIPPED, {
            instanceId,
            heroId
        });

        return true;
    }

    /**
     * 获取英雄装备的战争机器
     */
    getHeroMachines(heroId: string): WarMachineInstance[] {
        const instanceIds = this.heroEquipments.get(heroId) || [];
        return instanceIds
            .map(id => this.machines.get(id))
            .filter((m): m is WarMachineInstance => m !== undefined);
    }

    /**
     * 升级战争机器
     */
    upgradeMachine(instanceId: string): { success: boolean; newLevel?: number; cost?: number } {
        const instance = this.machines.get(instanceId);
        if (!instance) {
            return { success: false };
        }

        const config = WarMachineConfigMap.get(instance.configId);
        if (!config) {
            return { success: false };
        }

        // 检查是否有下一级
        const nextLevelConfig = getNextLevelWarMachine(instance.configId);
        if (!nextLevelConfig) {
            console.log(`[WarMachineManager] 已是最高级`);
            return { success: false };
        }

        // 计算升级费用
        const upgradeCost = Math.floor(config.cost * 0.5 * instance.level);

        // 升级
        const oldLevel = instance.level;
        instance.level++;
        instance.configId = nextLevelConfig.id;

        // 更新属性
        const newMaxHp = nextLevelConfig.stats.hp! + (nextLevelConfig.growth.hp || 0) * (instance.level - 1);
        instance.maxHp = newMaxHp;
        instance.currentHp = Math.min(instance.currentHp + (newMaxHp - instance.maxHp), newMaxHp);

        // 触发事件
        EventCenter.emit(WarMachineEventType.UPGRADED, {
            instanceId,
            oldLevel,
            newLevel: instance.level
        });

        console.log(`[WarMachineManager] 战争机器升级: Lv.${oldLevel} -> Lv.${instance.level}`);
        return { success: true, newLevel: instance.level, cost: upgradeCost };
    }

    /**
     * 出售战争机器
     */
    sellMachine(instanceId: string): { success: boolean; gold?: number } {
        const instance = this.machines.get(instanceId);
        if (!instance) {
            return { success: false };
        }

        const config = WarMachineConfigMap.get(instance.configId);
        if (!config) {
            return { success: false };
        }

        // 计算售价（基础价格的50% * 等级系数）
        const sellPrice = Math.floor(config.cost * 0.5 * (1 + instance.level * 0.1));

        // 移除
        this.removeMachine(instanceId);

        // 触发事件
        EventCenter.emit(WarMachineEventType.SOLD, {
            instanceId,
            gold: sellPrice
        });

        return { success: true, gold: sellPrice };
    }

    // ==================== 战斗相关 ====================

    /**
     * 初始化战斗状态
     */
    initBattleState(heroId: string): WarMachineBattleState[] {
        const heroMachines = this.getHeroMachines(heroId);
        const states: WarMachineBattleState[] = [];

        for (const instance of heroMachines) {
            const config = WarMachineConfigMap.get(instance.configId);
            if (!config) continue;

            const attack = (config.stats.attack || 0) + (config.growth.attack || 0) * (instance.level - 1);
            const defense = (config.stats.defense || 0) + (config.growth.defense || 0) * (instance.level - 1);

            const state: WarMachineBattleState = {
                instanceId: instance.instanceId,
                configId: instance.configId,
                type: config.type,
                currentHp: instance.currentHp,
                maxHp: instance.maxHp,
                attack,
                defense,
                shotsRemaining: config.stats.shots || 0,
                hasActed: false
            };

            this.battleStates.set(instance.instanceId, state);
            states.push(state);
        }

        return states;
    }

    /**
     * 获取战斗状态
     */
    getBattleState(instanceId: string): WarMachineBattleState | undefined {
        return this.battleStates.get(instanceId);
    }

    /**
     * 执行弩车攻击
     */
    executeBallistaAttack(
        instanceId: string,
        targetId: string,
        heroAttack: number
    ): WarMachineActionResult {
        const state = this.battleStates.get(instanceId);
        if (!state || state.type !== WarMachineType.BALLISTA) {
            return { success: false, actionType: 'attack' };
        }

        if (state.shotsRemaining <= 0 || state.hasActed) {
            return { success: false, actionType: 'attack' };
        }

        // 计算伤害：基础攻击 + 英雄攻击力加成
        const baseDamage = state.attack + heroAttack * 0.5;
        const variance = 0.2; // 20%浮动
        const damage = Math.floor(baseDamage * (1 + (Math.random() * 2 - 1) * variance));

        state.shotsRemaining--;
        state.hasActed = true;

        // 触发事件
        EventCenter.emit(WarMachineEventType.BATTLE_ACTION, {
            instanceId,
            actionType: 'attack',
            targetId,
            damage
        });

        return {
            success: true,
            actionType: 'attack',
            targetIds: [targetId],
            damage,
            shotsUsed: 1
        };
    }

    /**
     * 执行医疗帐篷治疗
     */
    executeFirstAidHeal(
        instanceId: string,
        targetId: string,
        heroSpellPower: number
    ): WarMachineActionResult {
        const state = this.battleStates.get(instanceId);
        const instance = this.machines.get(instanceId);
        if (!state || state.type !== WarMachineType.FIRST_AID_TENT || !instance) {
            return { success: false, actionType: 'heal' };
        }

        if (state.hasActed) {
            return { success: false, actionType: 'heal' };
        }

        const config = WarMachineConfigMap.get(instance.configId);
        if (!config) {
            return { success: false, actionType: 'heal' };
        }

        // 计算治疗量：基础治疗 + 英雄魔法强度加成
        const baseHeal = (config.stats.healAmount || 0) + (config.growth.healAmount || 0) * (instance.level - 1);
        const healAmount = Math.floor(baseHeal + heroSpellPower * 5);

        state.hasActed = true;

        // 触发事件
        EventCenter.emit(WarMachineEventType.BATTLE_ACTION, {
            instanceId,
            actionType: 'heal',
            targetId,
            healAmount
        });

        return {
            success: true,
            actionType: 'heal',
            targetIds: [targetId],
            healAmount
        };
    }

    /**
     * 执行投石车攻击
     */
    executeCatapultAttack(
        instanceId: string,
        targetId: string,
        heroAttack: number
    ): WarMachineActionResult {
        const state = this.battleStates.get(instanceId);
        if (!state || state.type !== WarMachineType.CATAPULT) {
            return { success: false, actionType: 'attack' };
        }

        if (state.shotsRemaining <= 0 || state.hasActed) {
            return { success: false, actionType: 'attack' };
        }

        // 计算伤害：投石车攻击 + 英雄攻击力加成（攻城加成）
        const baseDamage = state.attack + heroAttack * 0.3;
        const siegeBonus = 1.5; // 攻城加成
        const variance = 0.3;
        const damage = Math.floor(baseDamage * siegeBonus * (1 + (Math.random() * 2 - 1) * variance));

        state.shotsRemaining--;
        state.hasActed = true;

        // 触发事件
        EventCenter.emit(WarMachineEventType.BATTLE_ACTION, {
            instanceId,
            actionType: 'attack',
            targetId,
            damage
        });

        return {
            success: true,
            actionType: 'attack',
            targetIds: [targetId],
            damage,
            shotsUsed: 1
        };
    }

    /**
     * 获取弹药车加成
     */
    getAmmoCartBonus(heroId: string): number {
        const heroMachines = this.getHeroMachines(heroId);
        let totalBonus = 0;

        for (const instance of heroMachines) {
            const config = WarMachineConfigMap.get(instance.configId);
            if (config?.type === WarMachineType.AMMO_CART) {
                const bonus = (config.stats.ammoBonus || 0) + (config.growth.ammoBonus || 0) * (instance.level - 1);
                totalBonus += bonus;
            }
        }

        return totalBonus;
    }

    /**
     * 战争机器受到伤害
     */
    damageMachine(instanceId: string, damage: number): boolean {
        const state = this.battleStates.get(instanceId);
        if (!state) return false;

        state.currentHp = Math.max(0, state.currentHp - damage);

        // 触发事件
        EventCenter.emit(WarMachineEventType.BATTLE_DAMAGED, {
            instanceId,
            damage,
            remainingHp: state.currentHp
        });

        // 更新实例
        const instance = this.machines.get(instanceId);
        if (instance) {
            instance.currentHp = state.currentHp;
        }

        return state.currentHp <= 0; // 是否被摧毁
    }

    /**
     * 修复战争机器
     */
    repairMachine(instanceId: string, amount: number): void {
        const instance = this.machines.get(instanceId);
        if (!instance) return;

        const oldHp = instance.currentHp;
        instance.currentHp = Math.min(instance.maxHp, instance.currentHp + amount);

        // 触发事件
        EventCenter.emit(WarMachineEventType.BATTLE_REPAIRED, {
            instanceId,
            repairedAmount: instance.currentHp - oldHp
        });
    }

    /**
     * 重置战斗状态
     */
    resetBattleState(): void {
        // 重置所有战争机器的行动状态
        for (const state of this.battleStates.values()) {
            state.hasActed = false;
        }
    }

    /**
     * 清理战斗状态
     */
    clearBattleState(): void {
        this.battleStates.clear();
    }

    /**
     * 结束战斗，保存状态
     */
    endBattle(): void {
        // 将战斗状态同步回实例
        for (const [instanceId, state] of this.battleStates) {
            const instance = this.machines.get(instanceId);
            if (instance) {
                instance.currentHp = state.currentHp;
            }
        }

        this.battleStates.clear();
    }

    // ==================== 存档相关 ====================

    /**
     * 获取存档数据
     */
    getSaveData(): WarMachineSaveData {
        const machines = Array.from(this.machines.values());
        const heroEquipments: Record<string, string[]> = {};

        for (const [heroId, instanceIds] of this.heroEquipments) {
            heroEquipments[heroId] = instanceIds;
        }

        return {
            machines,
            heroEquipments
        };
    }

    /**
     * 加载存档数据
     */
    loadSaveData(data: WarMachineSaveData): void {
        this.machines.clear();
        this.heroEquipments.clear();

        if (data.machines) {
            for (const machine of data.machines) {
                this.machines.set(machine.instanceId, machine);
            }
        }

        if (data.heroEquipments) {
            for (const [heroId, instanceIds] of Object.entries(data.heroEquipments)) {
                this.heroEquipments.set(heroId, instanceIds);
            }
        }

        console.log(`[WarMachineManager] 加载存档: ${this.machines.size}个战争机器`);
    }

    /**
     * 序列化（兼容存档系统）
     */
    serialize(): WarMachineSaveData {
        return this.getSaveData();
    }

    /**
     * 反序列化（兼容存档系统）
     */
    deserialize(data: WarMachineSaveData): void {
        this.loadSaveData(data);
    }
}

// 导出单例
export const warMachineManager = WarMachineManager.getInstance();