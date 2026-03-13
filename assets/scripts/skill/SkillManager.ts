/**
 * 技能管理器
 * 管理技能的加载、创建和释放
 */

import {
    SkillConfig,
    SkillInstance,
    EffectType,
    TargetType,
    Hex,
    StatusEffect
} from '../config/GameTypes';
import { SkillConfigs, SkillConfigMap } from '../../configs/skills.json';
import { BattleUnit } from '../battle/BattleUnit';
import { HexGrid } from '../battle/HexGrid';

/**
 * 技能类
 */
export class Skill {
    config: SkillConfig;
    caster: BattleUnit;
    currentCooldown: number;

    constructor(config: SkillConfig, caster: BattleUnit) {
        this.config = config;
        this.caster = caster;
        this.currentCooldown = 0;
    }

    /**
     * 是否可以释放
     */
    canCast(focusPoints: number, mana: number): boolean {
        // 检查冷却
        if (this.currentCooldown > 0) {
            return false;
        }

        // 检查专注点消耗
        if (this.config.cost.focus && focusPoints < this.config.cost.focus) {
            return false;
        }

        // 检查魔法值消耗
        if (this.config.cost.mana && mana < this.config.cost.mana) {
            return false;
        }

        return true;
    }

    /**
     * 进入冷却
     */
    enterCooldown(): void {
        this.currentCooldown = this.config.cooldown;
    }

    /**
     * 减少冷却
     */
    reduceCooldown(): void {
        if (this.currentCooldown > 0) {
            this.currentCooldown--;
        }
    }
}

/**
 * 技能管理器
 */
export class SkillManager {
    private skillConfigs: Map<string, SkillConfig> = SkillConfigMap;
    private activeSkills: Map<string, Skill> = new Map();

    constructor() {
        // 初始化
    }

    /**
     * 获取技能配置
     */
    getSkill(id: string): SkillConfig | undefined {
        return this.skillConfigs.get(id);
    }

    /**
     * 创建技能实例
     */
    createSkill(skillId: string, caster: BattleUnit): Skill | null {
        const config = this.skillConfigs.get(skillId);
        if (!config) {
            return null;
        }
        return new Skill(config, caster);
    }

    /**
     * 释放技能
     */
    castSkill(
        skill: Skill,
        caster: BattleUnit,
        target: Hex | BattleUnit,
        grid: HexGrid
    ): boolean {
        // 检查范围
        if (this.isTargetValid(skill, caster, target, grid)) {
            // 应用效果
            this.applyEffects(skill, caster, target, grid);

            // 进入冷却
            skill.enterCooldown();

            return true;
        }

        return false;
    }

    /**
     * 检查目标是否有效
     */
    private isTargetValid(
        skill: Skill,
        caster: BattleUnit,
        target: Hex | BattleUnit,
        grid: HexGrid
    ): boolean {
        const config = skill.config;

        // 获取目标位置
        const targetHex: Hex = 'position' in target ? target.position : target;

        // 检查施法范围
        const distance = grid.getDistance(caster.position, targetHex);
        if (distance > config.range) {
            return false;
        }

        // 根据目标类型检查
        switch (config.targetType) {
            case TargetType.SELF:
                return 'id' in target && target.id === caster.id;

            case TargetType.SINGLE:
                return 'position' in target || grid.getCellByHex(targetHex) !== undefined;

            case TargetType.AREA:
                return grid.isValidHex(targetHex.q, targetHex.r);

            case TargetType.ALL_ENEMY:
                return true;

            case TargetType.ALL_ALLY:
                return true;

            case TargetType.ALL_DEAD_ALLY:
                return true;

            default:
                return false;
        }
    }

    /**
     * 应用技能效果
     */
    private applyEffects(
        skill: Skill,
        caster: BattleUnit,
        target: Hex | BattleUnit,
        grid: HexGrid
    ): void {
        const config = skill.config;

        // 获取目标单位列表
        const targets = this.getTargets(skill, caster, target, grid);

        // 应用每个效果
        for (const effect of config.effect) {
            for (const targetUnit of targets) {
                this.applyEffect(skill, caster, targetUnit, effect);
            }
        }
    }

    /**
     * 获取目标单位
     */
    private getTargets(
        skill: Skill,
        caster: BattleUnit,
        target: Hex | BattleUnit,
        grid: HexGrid
    ): BattleUnit[] {
        const config = skill.config;
        const targets: BattleUnit[] = [];

        switch (config.targetType) {
            case TargetType.SELF:
                targets.push(caster);
                break;

            case TargetType.SINGLE:
                if (target instanceof BattleUnit) {
                    targets.push(target);
                }
                break;

            case TargetType.AREA:
                // 获取范围内的单位
                const targetHex: Hex = 'position' in target ? target.position : target;
                const cells = grid.getRange(targetHex, 1);
                for (const cell of cells) {
                    if (cell.unit && cell.unit instanceof BattleUnit) {
                        targets.push(cell.unit);
                    }
                }
                break;

            case TargetType.ALL_ENEMY:
                // 获取所有敌人
                const allUnits = grid.getAllCells();
                for (const cell of allUnits) {
                    if (cell.unit && cell.unit instanceof BattleUnit && cell.unit.team !== caster.team) {
                        targets.push(cell.unit);
                    }
                }
                break;

            case TargetType.ALL_ALLY:
                // 获取所有友军
                const allAllies = grid.getAllCells();
                for (const cell of allAllies) {
                    if (cell.unit && cell.unit instanceof BattleUnit && cell.unit.team === caster.team) {
                        targets.push(cell.unit);
                    }
                }
                break;
        }

        return targets;
    }

    /**
     * 应用单个效果
     */
    private applyEffect(
        skill: Skill,
        caster: BattleUnit,
        target: BattleUnit,
        effectConfig: { type: EffectType; value: number | string; duration?: number; status?: StatusEffect }
    ): void {
        const value = this.calculateEffectValue(effectConfig.value, caster);

        switch (effectConfig.type) {
            case EffectType.DAMAGE:
                target.takeDamage(value);
                break;

            case EffectType.HEAL:
                target.heal(value);
                break;

            case EffectType.BUFF:
                target.addBuff({
                    id: `${skill.config.id}_${Date.now()}`,
                    status: effectConfig.status!,
                    duration: effectConfig.duration || 3,
                    value: typeof value === 'number' ? value : 0,
                    source: caster.id
                });
                break;

            case EffectType.DEBUFF:
                target.addBuff({
                    id: `${skill.config.id}_${Date.now()}`,
                    status: effectConfig.status!,
                    duration: effectConfig.duration || 3,
                    value: typeof value === 'number' ? value : 0,
                    source: caster.id
                });
                break;

            case EffectType.REVIVE:
                // 复活逻辑在BattleManager中处理
                break;

            case EffectType.DISPEL:
                target.clearBuffs();
                break;
        }
    }

    /**
     * 计算效果数值
     */
    private calculateEffectValue(value: number | string, caster: BattleUnit): number {
        if (typeof value === 'number') {
            return value;
        }

        // 解析公式字符串
        // 例如: "spell_power * 20" -> spellPower * 20
        const formula = value.replace(/spell_power/g, String(caster.hero.spellPower));

        try {
            // 简单公式计算（注意：实际项目中应该使用更安全的表达式解析器）
            return eval(formula);
        } catch (e) {
            console.error(`Failed to calculate effect value: ${value}`, e);
            return 0;
        }
    }

    /**
     * 获取英雄可用技能
     */
    getHeroSkills(heroSkills: string[]): SkillConfig[] {
        return heroSkills
            .map(id => this.skillConfigs.get(id))
            .filter((config): config is SkillConfig => config !== undefined);
    }

    /**
     * 获取兵种技能
     */
    getUnitSkill(unitId: string): SkillConfig | undefined {
        return this.skillConfigs.get(`skill_${unitId}`);
    }

    /**
     * 获取所有技能配置
     */
    getAllSkills(): SkillConfig[] {
        return Array.from(this.skillConfigs.values());
    }

    /**
     * 获取魔法派系技能
     */
    getSkillsByMagicSchool(school: string): SkillConfig[] {
        return Array.from(this.skillConfigs.values()).filter(
            config => config.magicSchool === school
        );
    }
}