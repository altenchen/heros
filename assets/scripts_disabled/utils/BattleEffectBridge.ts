/**
 * 战斗特效桥接
 * 连接战斗系统和特效系统
 */

import { Vec3 } from 'cc';
import { EventCenter, GameEvent } from './EventTarget';
import { effectManager } from './EffectManager';
import { BattleManager, BattleEventType, BattleEvent } from '../battle/BattleManager';
import { HexGrid } from '../battle/HexGrid';
import { DamageNumberConfig, SkillEffectConfig, SkillEffectType } from '../config/EffectTypes';

/**
 * 战斗特效桥接类
 */
export class BattleEffectBridge {
    private static _instance: BattleEffectBridge | null = null;

    /** 战斗管理器引用 */
    private _battleManager: BattleManager | null = null;

    /** 六边形网格引用 */
    private _hexGrid: HexGrid | null = null;

    /** 六边形大小（像素） */
    private readonly HEX_SIZE: number = 40;

    /** 是否已绑定 */
    private _bound: boolean = false;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): BattleEffectBridge {
        if (!BattleEffectBridge._instance) {
            BattleEffectBridge._instance = new BattleEffectBridge();
        }
        return BattleEffectBridge._instance;
    }

    /**
     * 绑定到战斗管理器
     */
    bindToBattle(battleManager: BattleManager): void {
        if (this._bound) {
            this.unbind();
        }

        this._battleManager = battleManager;
        this._hexGrid = battleManager.getGrid();
        this._bound = true;

        // 监听战斗事件
        this._bindBattleEvents();

        console.log('[BattleEffectBridge] 已绑定到战斗');
    }

    /**
     * 解除绑定
     */
    unbind(): void {
        if (!this._bound) return;

        this._unbindBattleEvents();
        this._battleManager = null;
        this._hexGrid = null;
        this._bound = false;

        console.log('[BattleEffectBridge] 已解除绑定');
    }

    /**
     * 绑定战斗事件
     */
    private _bindBattleEvents(): void {
        if (!this._battleManager) return;

        this._battleManager.on(BattleEventType.UNIT_ATTACK, this._onUnitAttack.bind(this));
        this._battleManager.on(BattleEventType.UNIT_DIE, this._onUnitDie.bind(this));
        this._battleManager.on(BattleEventType.SKILL_CAST, this._onSkillCast.bind(this));
        this._battleManager.on(BattleEventType.BATTLE_END, this._onBattleEnd.bind(this));

        // 同时监听游戏事件
        EventCenter.on(GameEvent.UNIT_DAMAGED, this._onUnitDamaged, this);
        EventCenter.on(GameEvent.UNIT_HEALED, this._onUnitHealed, this);
    }

    /**
     * 解绑战斗事件
     */
    private _unbindBattleEvents(): void {
        if (!this._battleManager) return;

        this._battleManager.off(BattleEventType.UNIT_ATTACK, this._onUnitAttack.bind(this));
        this._battleManager.off(BattleEventType.UNIT_DIE, this._onUnitDie.bind(this));
        this._battleManager.off(BattleEventType.SKILL_CAST, this._onSkillCast.bind(this));
        this._battleManager.off(BattleEventType.BATTLE_END, this._onBattleEnd.bind(this));

        EventCenter.off(GameEvent.UNIT_DAMAGED, this._onUnitDamaged, this);
        EventCenter.off(GameEvent.UNIT_HEALED, this._onUnitHealed, this);
    }

    /**
     * 六边形坐标转像素坐标
     */
    private hexToPixel(q: number, r: number): Vec3 {
        const x = this.HEX_SIZE * (3/2 * q);
        const y = this.HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
        return new Vec3(x, y, 0);
    }

    /**
     * 单位攻击事件处理
     */
    private _onUnitAttack(event: BattleEvent): void {
        const { attackerId, targetId, damage, isRanged, missed } = event.data;

        if (missed) {
            // 显示闪避效果
            const targetUnit = this._findUnitById(targetId);
            if (targetUnit) {
                const pos = this.hexToPixel(targetUnit.position.q, targetUnit.position.r);
                effectManager.showDamageNumber({
                    value: 0,
                    isDodge: true
                }, pos);
            }
            return;
        }

        // 显示伤害数字
        const targetUnit = this._findUnitById(targetId);
        if (targetUnit && damage > 0) {
            const pos = this.hexToPixel(targetUnit.position.q, targetUnit.position.r);
            effectManager.showDamageNumber({
                value: damage,
                isCritical: damage > 100 // 简化判断，实际应根据暴击逻辑
            }, pos);
        }

        // 播放攻击特效
        const attackerUnit = this._findUnitById(attackerId);
        if (attackerUnit && targetUnit) {
            const fromPos = this.hexToPixel(attackerUnit.position.q, attackerUnit.position.r);
            const toPos = this.hexToPixel(targetUnit.position.q, targetUnit.position.r);
            effectManager.playAttackEffect(fromPos, toPos, isRanged);
        }
    }

    /**
     * 单位死亡事件处理
     */
    private _onUnitDie(event: BattleEvent): void {
        const { unitId } = event.data;

        const unit = this._findUnitById(unitId);
        if (unit) {
            const pos = this.hexToPixel(unit.position.q, unit.position.r);
            effectManager.playDeathEffect(pos);
        }
    }

    /**
     * 技能施放事件处理
     */
    private _onSkillCast(event: BattleEvent): void {
        const { skillId, casterId, target } = event.data;

        // 获取施法者位置
        const casterUnit = this._findUnitById(casterId);
        if (!casterUnit) return;

        const casterPos = this.hexToPixel(casterUnit.position.q, casterUnit.position.r);

        // 根据技能类型确定特效
        let skillType = SkillEffectType.SINGLE_TARGET;
        let targets: { x: number; y: number }[] = [];

        // 检查目标类型
        if (target && typeof target.q === 'number') {
            // 目标是位置
            targets.push({ x: target.q * this.HEX_SIZE, y: target.r * this.HEX_SIZE });
        } else if (target && target.id) {
            // 目标是单位
            const targetUnit = this._findUnitById(target.id);
            if (targetUnit) {
                targets.push({
                    x: targetUnit.position.q * this.HEX_SIZE,
                    y: targetUnit.position.r * this.HEX_SIZE
                });
            }
        }

        // 根据技能ID确定特效类型
        if (skillId.includes('fireball') || skillId.includes('fire')) {
            skillType = SkillEffectType.PROJECTILE;
        } else if (skillId.includes('lightning') || skillId.includes('chain')) {
            skillType = SkillEffectType.AOE;
        } else if (skillId.includes('heal') || skillId.includes('bless')) {
            skillType = SkillEffectType.BUFF;
        } else if (skillId.includes('curse') || skillId.includes('poison')) {
            skillType = SkillEffectType.DEBUFF;
        }

        // 播放技能特效
        const config: SkillEffectConfig = {
            skillId,
            skillType,
            targets,
            caster: { x: casterPos.x, y: casterPos.y },
            duration: 0.8
        };

        effectManager.playSkillEffect(config);
    }

    /**
     * 战斗结束事件处理
     */
    private _onBattleEnd(event: BattleEvent): void {
        const { result } = event.data;

        if (result.winner === 'player') {
            // 播放胜利特效
            effectManager.playPresetEffect('level_up', new Vec3(0, 0, 0), 2.0);
        } else {
            // 播放失败特效（暂时不做特殊处理）
            console.log('[BattleEffectBridge] 战斗失败');
        }

        // 清理特效
        setTimeout(() => {
            effectManager.clear();
        }, 2000);
    }

    /**
     * 单位受伤事件处理
     */
    private _onUnitDamaged(data: { unitId: string; damage: number; isCritical?: boolean }): void {
        const unit = this._findUnitById(data.unitId);
        if (!unit) return;

        const pos = this.hexToPixel(unit.position.q, unit.position.r);
        effectManager.showDamageNumber({
            value: data.damage,
            isCritical: data.isCritical
        }, pos);
    }

    /**
     * 单位治疗事件处理
     */
    private _onUnitHealed(data: { unitId: string; amount: number }): void {
        const unit = this._findUnitById(data.unitId);
        if (!unit) return;

        const pos = this.hexToPixel(unit.position.q, unit.position.r);
        effectManager.showDamageNumber({
            value: data.amount,
            isHeal: true
        }, pos);
    }

    /**
     * 根据ID查找单位
     */
    private _findUnitById(unitId: string): any {
        if (!this._battleManager) return null;

        const state = this._battleManager.getState();
        return state.units.find(u => u.id === unitId);
    }

    /**
     * 显示 Buff 获得特效
     */
    showBuffApplied(unitId: string, buffName: string, isDebuff: boolean = false): void {
        const unit = this._findUnitById(unitId);
        if (!unit) return;

        const pos = this.hexToPixel(unit.position.q, unit.position.r);

        // 显示 Buff 名称飘字
        effectManager.showDamageNumber({
            value: 0,
            isHeal: !isDebuff
        }, pos);

        // 播放 Buff 特效
        effectManager.playPresetEffect(
            isDebuff ? 'skill_curse' : 'skill_bless',
            pos,
            0.8
        );
    }

    /**
     * 显示 Buff 移除特效
     */
    showBuffRemoved(unitId: string, buffName: string): void {
        // 简单的淡出效果，暂时不实现
    }

    /**
     * 显示单位移动特效
     */
    showUnitMove(unitId: string, from: { q: number; r: number }, to: { q: number; r: number }): void {
        const fromPos = this.hexToPixel(from.q, from.r);
        const toPos = this.hexToPixel(to.q, to.r);

        // 可以在这里添加移动轨迹特效
        // 暂时不实现复杂的移动特效
    }

    /**
     * 显示反击特效
     */
    showCounterAttack(attackerId: string, targetId: string, damage: number): void {
        const attacker = this._findUnitById(attackerId);
        const target = this._findUnitById(targetId);

        if (!attacker || !target) return;

        const targetPos = this.hexToPixel(target.position.q, target.position.r);

        // 显示伤害数字
        effectManager.showDamageNumber({
            value: damage,
            isCritical: false
        }, targetPos);
    }

    /**
     * 是否已绑定
     */
    isBound(): boolean {
        return this._bound;
    }
}

// 导出单例
export const battleEffectBridge = BattleEffectBridge.getInstance();