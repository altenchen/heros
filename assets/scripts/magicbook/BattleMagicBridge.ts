/**
 * 战斗魔法桥接器
 * 将魔法书系统集成到战斗系统中
 * 英雄无敌III：传承
 */

import { BattleManager, BattleEventType, BattleEvent } from '../battle/BattleManager';
import { BattleUnit } from '../battle/BattleUnit';
import { HexGrid } from '../battle/HexGrid';
import { Hex, StatusEffect, MagicSchool, TargetType, EffectType } from '../config/GameTypes';
import {
    SpellConfig,
    SpellEffect,
    SpellCastResult,
    HeroSpell,
    MagicMastery,
    SpellCategory,
    MagicBookEventType
} from '../config/MagicBookTypes';
import { magicBookManager } from './MagicBookManager';
import { buffManager } from '../battle/BuffManager';
import { EventCenter } from '../utils/EventTarget';

/**
 * 魔法目标
 */
export interface SpellTarget {
    type: 'unit' | 'hex' | 'area';
    unit?: BattleUnit;
    hex?: Hex;
    units?: BattleUnit[];
}

/**
 * 战斗魔法事件类型
 */
export enum BattleMagicEventType {
    SPELL_CAST_START = 'spell_cast_start',
    SPELL_CAST_COMPLETE = 'spell_cast_complete',
    SPELL_EFFECT_APPLIED = 'spell_effect_applied',
    MANA_CHANGED = 'mana_changed'
}

/**
 * 战斗魔法桥接器
 */
export class BattleMagicBridge {
    private static instance: BattleMagicBridge | null = null;

    /** 关联的战斗管理器 */
    private battleManager: BattleManager | null = null;

    /** 关联的六边形网格 */
    private grid: HexGrid | null = null;

    /** 当前英雄ID */
    private heroId: string | null = null;

    /** 事件监听器 */
    private eventListeners: Map<BattleMagicEventType, Function[]> = new Map();

    private constructor() {}

    /**
     * 获取单例
     */
    static getInstance(): BattleMagicBridge {
        if (!BattleMagicBridge.instance) {
            BattleMagicBridge.instance = new BattleMagicBridge();
        }
        return BattleMagicBridge.instance;
    }

    /**
     * 绑定到战斗管理器
     */
    bindToBattle(battleManager: BattleManager, heroId: string): void {
        this.battleManager = battleManager;
        this.grid = battleManager.getGrid();
        this.heroId = heroId;
    }

    /**
     * 解绑战斗
     */
    unbindBattle(): void {
        this.battleManager = null;
        this.grid = null;
        this.heroId = null;
    }

    /**
     * 获取英雄可用魔法列表
     */
    getAvailableSpells(): Array<{ config: SpellConfig; heroSpell: HeroSpell }> {
        if (!this.heroId) return [];

        const spells = magicBookManager.getHeroSpells(this.heroId);
        return spells.filter(({ config, heroSpell }) => {
            // 只返回战斗魔法
            return config.type === 'combat';
        });
    }

    /**
     * 检查是否可以施放魔法
     */
    canCastSpell(spellId: string): { canCast: boolean; reason?: string } {
        if (!this.heroId) {
            return { canCast: false, reason: '未绑定英雄' };
        }

        if (!this.battleManager) {
            return { canCast: false, reason: '未绑定战斗' };
        }

        const state = this.battleManager.getState();
        if (state.phase !== 'battle') {
            return { canCast: false, reason: '不在战斗中' };
        }

        const preview = magicBookManager.getSpellPreview(this.heroId, spellId);
        if (!preview) {
            return { canCast: false, reason: '未学习该魔法' };
        }

        if (!preview.canCast) {
            return { canCast: false, reason: '魔法值不足' };
        }

        return { canCast: true };
    }

    /**
     * 施放魔法
     */
    castSpell(spellId: string, target: SpellTarget): SpellCastResult {
        // 前置检查
        const check = this.canCastSpell(spellId);
        if (!check.canCast) {
            return {
                success: false,
                spellId,
                manaCost: 0,
                errorMessage: check.reason
            };
        }

        const preview = magicBookManager.getSpellPreview(this.heroId!, spellId);
        if (!preview) {
            return {
                success: false,
                spellId,
                manaCost: 0,
                errorMessage: '魔法预览获取失败'
            };
        }

        const { spell, heroSpell, manaCost } = preview;

        // 发送施法开始事件
        this.emit(BattleMagicEventType.SPELL_CAST_START, {
            spellId,
            spellName: spell.name,
            casterId: this.heroId,
            target
        });

        // 获取实际目标列表
        const targets = this.resolveTargets(spell, target);
        if (targets.length === 0 && spell.targetType !== TargetType.SELF) {
            return {
                success: false,
                spellId,
                manaCost: 0,
                errorMessage: '无有效目标'
            };
        }

        // 消耗魔法值
        const manaConsumed = magicBookManager.consumeMana(this.heroId!, manaCost);
        if (!manaConsumed) {
            return {
                success: false,
                spellId,
                manaCost: 0,
                errorMessage: '魔法值消耗失败'
            };
        }

        // 发送魔法值变化事件
        this.emit(BattleMagicEventType.MANA_CHANGED, {
            heroId: this.heroId,
            currentMana: magicBookManager.getCurrentMana(this.heroId!),
            maxMana: magicBookManager.getMaxMana(this.heroId!)
        });

        // 应用魔法效果
        const result = this.applySpellEffects(spell, heroSpell, targets);

        // 更新施放次数
        magicBookManager.recordSpellCast(this.heroId!, spellId);

        // 发送施法完成事件
        this.emit(BattleMagicEventType.SPELL_CAST_COMPLETE, {
            spellId,
            spellName: spell.name,
            casterId: this.heroId,
            targets: targets.map(t => t.id),
            damage: result.damage,
            heal: result.heal
        });

        return {
            success: true,
            spellId,
            manaCost,
            targets: targets.map(t => t.id),
            damage: result.damage,
            heal: result.heal,
            effects: spell.effects
        };
    }

    /**
     * 解析魔法目标
     */
    private resolveTargets(spell: SpellConfig, target: SpellTarget): BattleUnit[] {
        const targets: BattleUnit[] = [];

        if (!this.battleManager) return targets;

        const state = this.battleManager.getState();
        const allUnits = state.units.filter(u => u instanceof BattleUnit && u.isAlive()) as BattleUnit[];

        switch (spell.targetType) {
            case TargetType.SELF:
                // 自身（这里返回所有友军）
                targets.push(...allUnits.filter(u => u.team === 'player'));
                break;

            case TargetType.SINGLE:
                // 单体目标
                if (target.unit && target.unit.isAlive()) {
                    targets.push(target.unit);
                }
                break;

            case TargetType.AREA:
                // 区域目标
                if (target.hex && this.grid && spell.areaRadius) {
                    const centerCell = this.grid.getCellByHex(target.hex);
                    if (centerCell) {
                        const areaCells = this.grid.getCellsInRadius(centerCell, spell.areaRadius);
                        for (const cell of areaCells) {
                            const unit = this.grid.getUnitByHex(cell.hex);
                            if (unit && unit.isAlive()) {
                                targets.push(unit);
                            }
                        }
                    }
                }
                break;

            case TargetType.ALL_ENEMY:
                // 所有敌人
                targets.push(...allUnits.filter(u => u.team === 'enemy'));
                break;

            case TargetType.ALL_ALLY:
                // 所有友军
                targets.push(...allUnits.filter(u => u.team === 'player'));
                break;

            case TargetType.ALL_DEAD_ALLY:
                // 所有阵亡友军（复活魔法）
                // TODO: 需要维护阵亡单位列表
                break;
        }

        return targets;
    }

    /**
     * 应用魔法效果
     */
    private applySpellEffects(
        spell: SpellConfig,
        heroSpell: HeroSpell,
        targets: BattleUnit[]
    ): { damage: number; heal: number } {
        let totalDamage = 0;
        let totalHeal = 0;

        // 获取派系熟练度加成
        const mastery = magicBookManager.getSchoolMastery(this.heroId!, spell.school);
        const masteryBonus = this.getMasteryBonus(mastery?.level || MagicMastery.NONE);

        // 计算魔法强度加成
        const spellPower = magicBookManager.getSpellPower(this.heroId!);

        for (const effect of spell.effects) {
            for (const target of targets) {
                const result = this.applyEffect(effect, target, heroSpell.level, masteryBonus, spellPower);

                if (result.damage) {
                    totalDamage += result.damage;
                }
                if (result.heal) {
                    totalHeal += result.heal;
                }

                // 发送效果应用事件
                this.emit(BattleMagicEventType.SPELL_EFFECT_APPLIED, {
                    spellId: spell.id,
                    effectType: effect.type,
                    targetId: target.id,
                    damage: result.damage,
                    heal: result.heal,
                    status: effect.status
                });
            }
        }

        return { damage: totalDamage, heal: totalHeal };
    }

    /**
     * 应用单个效果
     */
    private applyEffect(
        effect: SpellEffect,
        target: BattleUnit,
        spellLevel: number,
        masteryBonus: number,
        spellPower: number
    ): { damage?: number; heal?: number } {
        const result: { damage?: number; heal?: number } = {};

        switch (effect.type) {
            case EffectType.DAMAGE:
                // 伤害效果
                const baseDamage = typeof effect.value === 'number' ? effect.value : 0;
                const damage = Math.floor(baseDamage * (1 + spellLevel * 0.1) * (1 + masteryBonus) * (1 + spellPower * 0.05));
                target.takeDamage(damage);
                result.damage = damage;

                // 检查目标是否死亡
                if (!target.isAlive() && this.battleManager) {
                    this.battleManager.emit(BattleEventType.UNIT_DIE, { unitId: target.id });
                }
                break;

            case EffectType.HEAL:
                // 治疗效果
                const baseHeal = typeof effect.value === 'number' ? effect.value : 0;
                const heal = Math.floor(baseHeal * (1 + spellLevel * 0.1) * (1 + masteryBonus));
                target.heal(heal);
                result.heal = heal;
                break;

            case EffectType.BUFF:
            case EffectType.DEBUFF:
                // 状态效果
                if (effect.status && effect.duration) {
                    const value = typeof effect.value === 'number' ? effect.value : 0;
                    buffManager.applyStatusBuff(
                        target.id,
                        effect.status,
                        this.heroId || 'spell',
                        effect.duration,
                        value
                    );

                    // 同步到BattleUnit
                    target.addBuff({
                        id: `spell_${effect.status}`,
                        status: effect.status,
                        duration: effect.duration,
                        value: value,
                        source: this.heroId || 'spell'
                    });
                }
                break;

            case EffectType.DISPEL:
                // 驱散效果
                const dispelCount = typeof effect.value === 'number' ? effect.value : 1;
                buffManager.dispelBuffs(target.id, dispelCount, effect.type === EffectType.BUFF);
                break;

            case EffectType.SUMMON:
                // 召唤效果 - TODO: 实现召唤逻辑
                break;

            case EffectType.REVIVE:
                // 复活效果 - TODO: 实现复活逻辑
                break;
        }

        return result;
    }

    /**
     * 获取派系熟练度加成
     */
    private getMasteryBonus(mastery: MagicMastery): number {
        switch (mastery) {
            case MagicMastery.NONE: return 0;
            case MagicMastery.BASIC: return 0.1;
            case MagicMastery.ADVANCED: return 0.2;
            case MagicMastery.EXPERT: return 0.3;
            case MagicMastery.MASTER: return 0.5;
            default: return 0;
        }
    }

    /**
     * 获取AI推荐的施法目标
     */
    getAISpellTarget(spellId: string): SpellTarget | null {
        if (!this.battleManager || !this.grid) return null;

        const preview = magicBookManager.getSpellPreview(this.heroId!, spellId);
        if (!preview) return null;

        const { spell } = preview;
        const state = this.battleManager.getState();
        const playerUnits = state.units.filter(u => u instanceof BattleUnit && u.team === 'player' && u.isAlive()) as BattleUnit[];
        const enemyUnits = state.units.filter(u => u instanceof BattleUnit && u.team === 'enemy' && u.isAlive()) as BattleUnit[];

        switch (spell.category) {
            case SpellCategory.DAMAGE:
                // 伤害魔法：优先攻击敌方单位密集区域或高价值目标
                if (spell.targetType === TargetType.SINGLE) {
                    // 找最高血量敌人
                    const target = enemyUnits.reduce((max, u) =>
                        u.count * u.config.hp > (max?.count || 0) * (max?.config?.hp || 0) ? u : max,
                        enemyUnits[0]
                    );
                    return target ? { type: 'unit', unit: target } : null;
                } else if (spell.targetType === TargetType.AREA && spell.areaRadius) {
                    // 找敌人最密集的位置
                    const bestTarget = this.findDensestPosition(enemyUnits);
                    return bestTarget ? { type: 'hex', hex: bestTarget } : null;
                } else if (spell.targetType === TargetType.ALL_ENEMY) {
                    return { type: 'area', units: enemyUnits };
                }
                break;

            case SpellCategory.HEAL:
                // 治疗魔法：优先治疗血量最低的友军
                if (spell.targetType === TargetType.SINGLE) {
                    const target = playerUnits.reduce((min, u) =>
                        u.currentHp / u.getMaxHp() < (min?.currentHp || 0) / (min?.getMaxHp?.() || 1) ? u : min,
                        playerUnits[0]
                    );
                    return target ? { type: 'unit', unit: target } : null;
                } else if (spell.targetType === TargetType.ALL_ALLY) {
                    return { type: 'area', units: playerUnits };
                }
                break;

            case SpellCategory.BUFF:
                // 增益魔法：优先给输出单位加buff
                if (spell.targetType === TargetType.SINGLE) {
                    const target = playerUnits.find(u => u.config.type === 'attack' || u.config.type === 'shooter');
                    return target ? { type: 'unit', unit: target || playerUnits[0] } : null;
                } else if (spell.targetType === TargetType.ALL_ALLY) {
                    return { type: 'area', units: playerUnits };
                }
                break;

            case SpellCategory.DEBUFF:
                // 减益魔法：优先给敌方强力单位
                if (spell.targetType === TargetType.SINGLE) {
                    const target = enemyUnits.reduce((max, u) =>
                        u.config.attack > (max?.config?.attack || 0) ? u : max,
                        enemyUnits[0]
                    );
                    return target ? { type: 'unit', unit: target } : null;
                } else if (spell.targetType === TargetType.ALL_ENEMY) {
                    return { type: 'area', units: enemyUnits };
                }
                break;
        }

        return null;
    }

    /**
     * 找到单位最密集的位置
     */
    private findDensestPosition(units: BattleUnit[]): Hex | null {
        if (units.length === 0 || !this.grid) return null;

        let bestHex: Hex | null = null;
        let maxCount = 0;

        for (const unit of units) {
            const cell = this.grid.getCellByHex(unit.position);
            if (!cell) continue;

            // 统计周围单位数量
            const nearbyCells = this.grid.getCellsInRadius(cell, 2);
            let count = 0;
            for (const c of nearbyCells) {
                if (this.grid.getUnitByHex(c.hex)) {
                    count++;
                }
            }

            if (count > maxCount) {
                maxCount = count;
                bestHex = unit.position;
            }
        }

        return bestHex;
    }

    /**
     * 获取当前魔法值
     */
    getCurrentMana(): number {
        if (!this.heroId) return 0;
        return magicBookManager.getCurrentMana(this.heroId);
    }

    /**
     * 获取最大魔法值
     */
    getMaxMana(): number {
        if (!this.heroId) return 0;
        return magicBookManager.getMaxMana(this.heroId);
    }

    /**
     * 添加事件监听
     */
    on(eventType: BattleMagicEventType, callback: Function): void {
        if (!this.eventListeners.has(eventType)) {
            this.eventListeners.set(eventType, []);
        }
        this.eventListeners.get(eventType)!.push(callback);
    }

    /**
     * 移除事件监听
     */
    off(eventType: BattleMagicEventType, callback: Function): void {
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
    private emit(eventType: BattleMagicEventType, data: any): void {
        const listeners = this.eventListeners.get(eventType);
        if (listeners) {
            listeners.forEach(callback => callback(data));
        }

        // 同时触发全局事件
        EventCenter.emit(`battle_magic_${eventType}`, data);
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
export const battleMagicBridge = BattleMagicBridge.getInstance();