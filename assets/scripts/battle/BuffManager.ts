/**
 * Buff管理器
 * 管理战斗中的Buff效果，包括创建、应用、更新、移除
 * 遵循阿里巴巴开发者手册规范
 */

import {
    BuffConfig,
    BuffInstance,
    BuffApplyResult,
    BuffQueryOptions,
    BuffEventType,
    BuffEventData,
    BuffEffectType,
    BuffCategory,
    BuffStackRule,
    AttributeType
} from '../config/BuffTypes';
import { StatusEffect, BuffData } from '../config/GameTypes';
import { BattleUnit } from '../battle/BattleUnit';
import { EventCenter } from '../utils/EventTarget';

/**
 * 状态效果到Buff ID的映射
 */
const STATUS_TO_BUFF_ID: Record<string, string> = {
    [StatusEffect.STUN]: 'buff_stun',
    [StatusEffect.SLOW]: 'buff_slow',
    [StatusEffect.HASTE]: 'buff_haste',
    [StatusEffect.BLIND]: 'buff_blind',
    [StatusEffect.STONE]: 'buff_stone',
    [StatusEffect.POISON]: 'buff_poison',
    [StatusEffect.CURSE]: 'buff_curse',
    [StatusEffect.BLESS]: 'buff_bless',
    [StatusEffect.BLOODLUST]: 'buff_bloodlust',
    [StatusEffect.SHIELD]: 'buff_shield',
    [StatusEffect.AGING]: 'buff_aging'
};

/**
 * Buff管理器
 * 单例模式，管理所有Buff配置和实例
 */
export class BuffManager {
    private static _instance: BuffManager | null = null;

    /** Buff配置映射 */
    private _buffConfigs: Map<string, BuffConfig> = new Map();

    /** 活跃的Buff实例（按目标ID分组） */
    private _activeBuffs: Map<string, BuffInstance[]> = new Map();

    /** Buff实例ID计数器 */
    private _instanceIdCounter: number = 0;

    /** 事件监听器 */
    private _listeners: Map<BuffEventType, Function[]> = new Map();

    private constructor() {
        this._initializeDefaultBuffs();
    }

    /**
     * 获取单例实例
     */
    static getInstance(): BuffManager {
        if (!BuffManager._instance) {
            BuffManager._instance = new BuffManager();
        }
        return BuffManager._instance;
    }

    /**
     * 初始化默认Buff配置
     */
    private _initializeDefaultBuffs(): void {
        const defaultBuffs: BuffConfig[] = [
            // 控制效果
            {
                id: 'buff_stun',
                name: '眩晕',
                description: '无法行动',
                icon: 'buff_stun',
                category: BuffCategory.CONTROL,
                effectType: BuffEffectType.STATUS,
                statusEffect: StatusEffect.STUN,
                duration: 1,
                dispellable: true,
                stackRule: BuffStackRule.REFRESH,
                maxStacks: 1,
                effects: [{
                    type: BuffEffectType.STATUS,
                    baseValue: 1
                }],
                visualEffect: {
                    tint: { r: 200, g: 200, b: 100, a: 255 }
                }
            },
            {
                id: 'buff_stone',
                name: '石化',
                description: '无法行动，防御提高',
                icon: 'buff_stone',
                category: BuffCategory.CONTROL,
                effectType: BuffEffectType.STATUS,
                statusEffect: StatusEffect.STONE,
                duration: 2,
                dispellable: false,
                stackRule: BuffStackRule.REFRESH,
                maxStacks: 1,
                effects: [
                    { type: BuffEffectType.STATUS, baseValue: 1 },
                    { type: BuffEffectType.ATTRIBUTE, attribute: AttributeType.DEFENSE, modifyType: 'percent', baseValue: 0.5 }
                ],
                visualEffect: {
                    tint: { r: 150, g: 150, b: 150, a: 255 }
                }
            },

            // 增益效果
            {
                id: 'buff_haste',
                name: '加速',
                description: '速度提高',
                icon: 'buff_haste',
                category: BuffCategory.BUFF,
                effectType: BuffEffectType.ATTRIBUTE,
                statusEffect: StatusEffect.HASTE,
                duration: 3,
                dispellable: true,
                stackRule: BuffStackRule.REFRESH,
                maxStacks: 1,
                effects: [{
                    type: BuffEffectType.ATTRIBUTE,
                    attribute: AttributeType.SPEED,
                    modifyType: 'flat',
                    baseValue: 3
                }],
                visualEffect: {
                    tint: { r: 100, g: 200, b: 255, a: 255 }
                }
            },
            {
                id: 'buff_bless',
                name: '祝福',
                description: '伤害最大化',
                icon: 'buff_bless',
                category: BuffCategory.BUFF,
                effectType: BuffEffectType.SPECIAL,
                statusEffect: StatusEffect.BLESS,
                duration: 3,
                dispellable: true,
                stackRule: BuffStackRule.REFRESH,
                maxStacks: 1,
                effects: [{
                    type: BuffEffectType.SPECIAL,
                    baseValue: 1,
                    trigger: 'on_attack'
                }],
                visualEffect: {
                    tint: { r: 255, g: 255, b: 150, a: 255 }
                }
            },
            {
                id: 'buff_bloodlust',
                name: '嗜血',
                description: '攻击力提高',
                icon: 'buff_bloodlust',
                category: BuffCategory.BUFF,
                effectType: BuffEffectType.ATTRIBUTE,
                statusEffect: StatusEffect.BLOODLUST,
                duration: 3,
                dispellable: true,
                stackRule: BuffStackRule.REFRESH,
                maxStacks: 1,
                effects: [{
                    type: BuffEffectType.ATTRIBUTE,
                    attribute: AttributeType.ATTACK,
                    modifyType: 'percent',
                    baseValue: 0.25
                }],
                visualEffect: {
                    tint: { r: 255, g: 100, b: 100, a: 255 }
                }
            },
            {
                id: 'buff_shield',
                name: '护盾',
                description: '防御力提高',
                icon: 'buff_shield',
                category: BuffCategory.BUFF,
                effectType: BuffEffectType.ATTRIBUTE,
                statusEffect: StatusEffect.SHIELD,
                duration: 3,
                dispellable: true,
                stackRule: BuffStackRule.REFRESH,
                maxStacks: 1,
                effects: [{
                    type: BuffEffectType.ATTRIBUTE,
                    attribute: AttributeType.DEFENSE,
                    modifyType: 'percent',
                    baseValue: 0.3
                }],
                visualEffect: {
                    tint: { r: 150, g: 200, b: 255, a: 255 }
                }
            },

            // 减益效果
            {
                id: 'buff_slow',
                name: '减速',
                description: '速度降低',
                icon: 'buff_slow',
                category: BuffCategory.DEBUFF,
                effectType: BuffEffectType.ATTRIBUTE,
                statusEffect: StatusEffect.SLOW,
                duration: 3,
                dispellable: true,
                stackRule: BuffStackRule.REFRESH,
                maxStacks: 1,
                effects: [{
                    type: BuffEffectType.ATTRIBUTE,
                    attribute: AttributeType.SPEED,
                    modifyType: 'flat',
                    baseValue: -2
                }],
                visualEffect: {
                    tint: { r: 100, g: 100, b: 200, a: 255 }
                }
            },
            {
                id: 'buff_blind',
                name: '失明',
                description: '攻击可能失误',
                icon: 'buff_blind',
                category: BuffCategory.DEBUFF,
                effectType: BuffEffectType.STATUS,
                statusEffect: StatusEffect.BLIND,
                duration: 2,
                dispellable: true,
                stackRule: BuffStackRule.REFRESH,
                maxStacks: 1,
                effects: [{
                    type: BuffEffectType.STATUS,
                    baseValue: 0.5,
                    trigger: 'on_attack'
                }],
                visualEffect: {
                    tint: { r: 50, g: 50, b: 50, a: 255 }
                }
            },
            {
                id: 'buff_curse',
                name: '诅咒',
                description: '伤害最小化',
                icon: 'buff_curse',
                category: BuffCategory.DEBUFF,
                effectType: BuffEffectType.SPECIAL,
                statusEffect: StatusEffect.CURSE,
                duration: 3,
                dispellable: true,
                stackRule: BuffStackRule.REFRESH,
                maxStacks: 1,
                effects: [{
                    type: BuffEffectType.SPECIAL,
                    baseValue: 1,
                    trigger: 'on_attack'
                }],
                visualEffect: {
                    tint: { r: 100, g: 50, b: 150, a: 255 }
                }
            },
            {
                id: 'buff_aging',
                name: '衰老',
                description: '属性全面下降',
                icon: 'buff_aging',
                category: BuffCategory.DEBUFF,
                effectType: BuffEffectType.ATTRIBUTE,
                statusEffect: StatusEffect.AGING,
                duration: 3,
                dispellable: true,
                stackRule: BuffStackRule.REFRESH,
                maxStacks: 1,
                effects: [
                    { type: BuffEffectType.ATTRIBUTE, attribute: AttributeType.ATTACK, modifyType: 'percent', baseValue: -0.1 },
                    { type: BuffEffectType.ATTRIBUTE, attribute: AttributeType.DEFENSE, modifyType: 'percent', baseValue: -0.1 },
                    { type: BuffEffectType.ATTRIBUTE, attribute: AttributeType.SPEED, modifyType: 'percent', baseValue: -0.1 }
                ],
                visualEffect: {
                    tint: { r: 150, g: 100, b: 100, a: 255 }
                }
            },

            // 持续效果
            {
                id: 'buff_poison',
                name: '中毒',
                description: '每回合受到伤害',
                icon: 'buff_poison',
                category: BuffCategory.DOT,
                effectType: BuffEffectType.DAMAGE_OVER_TIME,
                statusEffect: StatusEffect.POISON,
                duration: 3,
                dispellable: true,
                stackRule: BuffStackRule.STACK_VALUE,
                maxStacks: 5,
                effects: [{
                    type: BuffEffectType.DAMAGE_OVER_TIME,
                    baseValue: 50,
                    stackValue: 20,
                    trigger: 'on_turn_end'
                }],
                visualEffect: {
                    tint: { r: 100, g: 200, b: 100, a: 255 }
                }
            }
        ];

        defaultBuffs.forEach(buff => {
            this._buffConfigs.set(buff.id, buff);
        });

        console.log('[BuffManager] 初始化完成，共', this._buffConfigs.size, '个Buff配置');
    }

    /**
     * 注册Buff配置
     */
    registerBuff(config: BuffConfig): void {
        this._buffConfigs.set(config.id, config);
    }

    /**
     * 获取Buff配置
     */
    getBuffConfig(buffId: string): BuffConfig | null {
        return this._buffConfigs.get(buffId) || null;
    }

    /**
     * 根据状态效果获取Buff配置
     */
    getBuffConfigByStatus(status: StatusEffect): BuffConfig | null {
        const buffId = STATUS_TO_BUFF_ID[status];
        return buffId ? this._buffConfigs.get(buffId) || null : null;
    }

    /**
     * 应用Buff到单位
     */
    applyBuff(
        targetId: string,
        buffId: string,
        sourceId: string,
        duration?: number,
        customValue?: number
    ): BuffApplyResult {
        const config = this._buffConfigs.get(buffId);
        if (!config) {
            return { success: false, error: `Buff配置不存在: ${buffId}` };
        }

        // 获取目标现有的Buff列表
        let targetBuffs = this._activeBuffs.get(targetId);
        if (!targetBuffs) {
            targetBuffs = [];
            this._activeBuffs.set(targetId, targetBuffs);
        }

        // 检查叠加规则
        const existingBuff = targetBuffs.find(b => b.configId === buffId);
        let replaced: BuffInstance | undefined;

        if (existingBuff) {
            switch (config.stackRule) {
                case BuffStackRule.REPLACE:
                    // 替换旧Buff
                    replaced = existingBuff;
                    targetBuffs = targetBuffs.filter(b => b.instanceId !== existingBuff.instanceId);
                    this._activeBuffs.set(targetId, targetBuffs);
                    break;

                case BuffStackRule.REFRESH:
                    // 刷新持续时间
                    existingBuff.remainingDuration = duration ?? config.duration;
                    this._emitEvent(BuffEventType.BUFF_REFRESHED, existingBuff, targetId, sourceId);
                    return { success: true, buff: existingBuff };

                case BuffStackRule.STACK_VALUE:
                    // 叠加效果值
                    if (existingBuff.stacks < config.maxStacks) {
                        existingBuff.stacks++;
                        existingBuff.currentValue += config.effects[0]?.stackValue ?? 0;
                        this._emitEvent(BuffEventType.BUFF_STACKED, existingBuff, targetId, sourceId);
                    }
                    return { success: true, buff: existingBuff };

                case BuffStackRule.STACK_DURATION:
                    // 叠加持续时间
                    existingBuff.remainingDuration = Math.min(
                        existingBuff.remainingDuration + (duration ?? config.duration),
                        config.duration * config.maxStacks
                    );
                    this._emitEvent(BuffEventType.BUFF_DURATION_UPDATED, existingBuff, targetId, sourceId);
                    return { success: true, buff: existingBuff };

                case BuffStackRule.INDEPENDENT:
                    // 独立存在，继续创建新的
                    break;
            }
        }

        // 创建新的Buff实例
        const instance: BuffInstance = {
            instanceId: `buff_${++this._instanceIdCounter}`,
            configId: buffId,
            sourceId,
            targetId,
            remainingDuration: duration ?? config.duration,
            stacks: 1,
            currentValue: customValue ?? config.effects[0]?.baseValue ?? 0,
            createdAt: Date.now()
        };

        targetBuffs.push(instance);
        this._emitEvent(BuffEventType.BUFF_APPLIED, instance, targetId, sourceId);

        return { success: true, buff: instance, replaced };
    }

    /**
     * 应用状态效果Buff
     */
    applyStatusBuff(
        targetId: string,
        status: StatusEffect,
        sourceId: string,
        duration?: number,
        value?: number
    ): BuffApplyResult {
        const buffId = STATUS_TO_BUFF_ID[status];
        if (!buffId) {
            // 没有对应的Buff配置，创建临时Buff
            return this._applyLegacyBuff(targetId, status, sourceId, duration ?? 3, value ?? 0);
        }
        return this.applyBuff(targetId, buffId, sourceId, duration, value);
    }

    /**
     * 应用旧版Buff（兼容BattleUnit）
     */
    private _applyLegacyBuff(
        targetId: string,
        status: StatusEffect,
        sourceId: string,
        duration: number,
        value: number
    ): BuffApplyResult {
        // 直接创建一个临时Buff实例
        const instance: BuffInstance = {
            instanceId: `buff_${++this._instanceIdCounter}`,
            configId: `legacy_${status}`,
            sourceId,
            targetId,
            remainingDuration: duration,
            stacks: 1,
            currentValue: value,
            createdAt: Date.now()
        };

        let targetBuffs = this._activeBuffs.get(targetId);
        if (!targetBuffs) {
            targetBuffs = [];
            this._activeBuffs.set(targetId, targetBuffs);
        }
        targetBuffs.push(instance);

        return { success: true, buff: instance };
    }

    /**
     * 移除Buff
     */
    removeBuff(targetId: string, instanceId: string): boolean {
        const targetBuffs = this._activeBuffs.get(targetId);
        if (!targetBuffs) {
            return false;
        }

        const index = targetBuffs.findIndex(b => b.instanceId === instanceId);
        if (index < 0) {
            return false;
        }

        const buff = targetBuffs[index];
        targetBuffs.splice(index, 1);

        this._emitEvent(BuffEventType.BUFF_REMOVED, buff, targetId, buff.sourceId);
        return true;
    }

    /**
     * 移除指定配置的所有Buff
     */
    removeBuffByConfig(targetId: string, configId: string): number {
        const targetBuffs = this._activeBuffs.get(targetId);
        if (!targetBuffs) {
            return 0;
        }

        const toRemove = targetBuffs.filter(b => b.configId === configId);
        toRemove.forEach(buff => {
            this.removeBuff(targetId, buff.instanceId);
        });

        return toRemove.length;
    }

    /**
     * 驱散Buff
     */
    dispelBuffs(targetId: string, count: number = 1, debuffOnly: boolean = true): BuffInstance[] {
        const targetBuffs = this._activeBuffs.get(targetId);
        if (!targetBuffs) {
            return [];
        }

        const dispellable = targetBuffs.filter(buff => {
            const config = this._buffConfigs.get(buff.configId);
            if (!config) return false;
            if (!config.dispellable) return false;
            if (debuffOnly && config.category !== BuffCategory.DEBUFF && config.category !== BuffCategory.CONTROL) {
                return false;
            }
            return true;
        });

        const toRemove = dispellable.slice(0, count);
        toRemove.forEach(buff => {
            this.removeBuff(targetId, buff.instanceId);
        });

        return toRemove;
    }

    /**
     * 更新目标所有Buff的持续时间
     */
    updateBuffDurations(targetId: string): BuffInstance[] {
        const targetBuffs = this._activeBuffs.get(targetId);
        if (!targetBuffs) {
            return [];
        }

        const expired: BuffInstance[] = [];

        targetBuffs.forEach(buff => {
            const config = this._buffConfigs.get(buff.configId);
            if (config && config.duration > 0) {
                buff.remainingDuration--;

                if (buff.remainingDuration <= 0) {
                    expired.push(buff);
                } else {
                    this._emitEvent(BuffEventType.BUFF_DURATION_UPDATED, buff, targetId, buff.sourceId);
                }
            }
        });

        // 移除过期的Buff
        expired.forEach(buff => {
            this.removeBuff(targetId, buff.instanceId);
        });

        return expired;
    }

    /**
     * 处理回合开始时的Buff效果
     */
    processTurnStartBuffs(unit: BattleUnit): void {
        const targetBuffs = this._activeBuffs.get(unit.id);
        if (!targetBuffs) return;

        targetBuffs.forEach(buff => {
            const config = this._buffConfigs.get(buff.configId);
            if (!config) return;

            config.effects.forEach(effect => {
                if (effect.trigger === 'on_turn_start') {
                    this._executeBuffEffect(unit, buff, effect);
                }
            });
        });
    }

    /**
     * 处理回合结束时的Buff效果
     */
    processTurnEndBuffs(unit: BattleUnit): void {
        const targetBuffs = this._activeBuffs.get(unit.id);
        if (!targetBuffs) return;

        targetBuffs.forEach(buff => {
            const config = this._buffConfigs.get(buff.configId);
            if (!config) return;

            config.effects.forEach(effect => {
                if (effect.trigger === 'on_turn_end') {
                    this._executeBuffEffect(unit, buff, effect);
                }
            });
        });

        // 更新持续时间
        this.updateBuffDurations(unit.id);
    }

    /**
     * 执行Buff效果
     */
    private _executeBuffEffect(unit: BattleUnit, buff: BuffInstance, effect: any): void {
        const probability = effect.probability ?? 1;
        if (Math.random() > probability) return;

        switch (effect.type) {
            case BuffEffectType.DAMAGE_OVER_TIME:
                const damage = buff.currentValue * buff.stacks;
                unit.takeDamage(damage);
                this._emitEvent(BuffEventType.BUFF_TRIGGERED, buff, unit.id, buff.sourceId, { damage, effectType: 'dot' });
                console.log(`[BuffManager] ${unit.id} 受到持续伤害 ${damage} (${buff.configId})`);
                break;

            case BuffEffectType.HEAL_OVER_TIME:
                const heal = buff.currentValue * buff.stacks;
                unit.heal(heal);
                this._emitEvent(BuffEventType.BUFF_TRIGGERED, buff, unit.id, buff.sourceId, { heal, effectType: 'hot' });
                console.log(`[BuffManager] ${unit.id} 受到持续治疗 ${heal} (${buff.configId})`);
                break;
        }
    }

    /**
     * 获取目标的所有Buff
     */
    getBuffs(targetId: string): BuffInstance[] {
        return this._activeBuffs.get(targetId) || [];
    }

    /**
     * 查询Buff
     */
    queryBuffs(targetId: string, options: BuffQueryOptions): BuffInstance[] {
        let buffs = this.getBuffs(targetId);

        if (options.configId) {
            buffs = buffs.filter(b => b.configId === options.configId);
        }

        if (options.sourceId) {
            buffs = buffs.filter(b => b.sourceId === options.sourceId);
        }

        if (options.category) {
            buffs = buffs.filter(b => {
                const config = this._buffConfigs.get(b.configId);
                return config?.category === options.category;
            });
        }

        if (options.buffOnly) {
            buffs = buffs.filter(b => {
                const config = this._buffConfigs.get(b.configId);
                return config?.category === BuffCategory.BUFF;
            });
        }

        if (options.debuffOnly) {
            buffs = buffs.filter(b => {
                const config = this._buffConfigs.get(b.configId);
                return config?.category === BuffCategory.DEBUFF || config?.category === BuffCategory.CONTROL;
            });
        }

        if (options.dispellableOnly) {
            buffs = buffs.filter(b => {
                const config = this._buffConfigs.get(b.configId);
                return config?.dispellable === true;
            });
        }

        return buffs;
    }

    /**
     * 检查是否拥有某状态效果
     */
    hasStatus(targetId: string, status: StatusEffect): boolean {
        const buffId = STATUS_TO_BUFF_ID[status];
        if (!buffId) {
            // 检查旧版Buff
            const buffs = this.getBuffs(targetId);
            return buffs.some(b => b.configId === `legacy_${status}`);
        }
        return this.getBuffs(targetId).some(b => b.configId === buffId);
    }

    /**
     * 获取属性修改值
     */
    getAttributeModifier(targetId: string, attribute: AttributeType): number {
        const buffs = this.getBuffs(targetId);
        let totalModifier = 0;

        buffs.forEach(buff => {
            const config = this._buffConfigs.get(buff.configId);
            if (!config) return;

            config.effects.forEach(effect => {
                if (effect.type === BuffEffectType.ATTRIBUTE && effect.attribute === attribute) {
                    if (effect.modifyType === 'flat') {
                        totalModifier += effect.baseValue * buff.stacks;
                    }
                }
            });
        });

        return totalModifier;
    }

    /**
     * 获取属性修改百分比
     */
    getAttributeModifierPercent(targetId: string, attribute: AttributeType): number {
        const buffs = this.getBuffs(targetId);
        let totalModifier = 0;

        buffs.forEach(buff => {
            const config = this._buffConfigs.get(buff.configId);
            if (!config) return;

            config.effects.forEach(effect => {
                if (effect.type === BuffEffectType.ATTRIBUTE && effect.attribute === attribute) {
                    if (effect.modifyType === 'percent') {
                        totalModifier += effect.baseValue * buff.stacks;
                    }
                }
            });
        });

        return totalModifier;
    }

    /**
     * 转换为旧版BuffData格式（兼容BattleUnit）
     */
    toBuffDataArray(targetId: string): BuffData[] {
        return this.getBuffs(targetId).map(buff => ({
            id: buff.instanceId,
            status: this._extractStatusFromConfigId(buff.configId) as StatusEffect,
            duration: buff.remainingDuration,
            value: buff.currentValue,
            source: buff.sourceId
        }));
    }

    /**
     * 从配置ID提取状态效果
     */
    private _extractStatusFromConfigId(configId: string): string {
        if (configId.startsWith('buff_')) {
            return configId.substring(5);
        }
        if (configId.startsWith('legacy_')) {
            return configId.substring(7);
        }
        return configId;
    }

    /**
     * 清除目标的所有Buff
     */
    clearBuffs(targetId: string): void {
        const buffs = this._activeBuffs.get(targetId);
        if (buffs) {
            buffs.forEach(buff => {
                this._emitEvent(BuffEventType.BUFF_REMOVED, buff, targetId, buff.sourceId);
            });
        }
        this._activeBuffs.delete(targetId);
    }

    /**
     * 清除所有Buff
     */
    clearAll(): void {
        this._activeBuffs.clear();
        this._instanceIdCounter = 0;
    }

    /**
     * 发送事件
     */
    private _emitEvent(type: BuffEventType, buff: BuffInstance, targetId: string, sourceId: string, data?: any): void {
        const eventData: BuffEventData = {
            type,
            buff,
            targetId,
            sourceId,
            timestamp: Date.now(),
            data
        };

        const listeners = this._listeners.get(type);
        if (listeners) {
            listeners.forEach(callback => callback(eventData));
        }

        // 也发送到全局事件中心
        EventCenter.emit(`buff_${type}`, eventData);
    }

    /**
     * 添加事件监听器
     */
    on(type: BuffEventType, callback: Function): void {
        if (!this._listeners.has(type)) {
            this._listeners.set(type, []);
        }
        this._listeners.get(type)!.push(callback);
    }

    /**
     * 移除事件监听器
     */
    off(type: BuffEventType, callback: Function): void {
        const listeners = this._listeners.get(type);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index >= 0) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 获取统计信息
     */
    getStats(): { totalConfigs: number; activeInstances: number } {
        let totalInstances = 0;
        this._activeBuffs.forEach(buffs => {
            totalInstances += buffs.length;
        });

        return {
            totalConfigs: this._buffConfigs.size,
            activeInstances: totalInstances
        };
    }
}

// 导出单例
export const buffManager = BuffManager.getInstance();