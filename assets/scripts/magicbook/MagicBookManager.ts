/**
 * 魔法书管理器
 * 英雄无敌Ⅲ：传承
 * 管理英雄魔法书、魔法学习、派系熟练度等
 */

import { EventCenter } from '../utils/EventTarget';
import {
    SpellConfig,
    HeroSpell,
    HeroMagicBook,
    SchoolMastery,
    SpellCastResult,
    SpellLearnResult,
    MasteryUpgradeResult,
    MagicBookSaveData,
    SpellPreview,
    SpellQuickSlot,
    MagicBookEventType,
    SpellLevel,
    SpellType,
    MagicMastery
} from '../config/MagicBookTypes';
import { MagicSchool, TargetType } from '../config/GameTypes';
import { SpellConfigMap, AllSpells, SpellsBySchool } from '../../configs/magic_book.json';
import { BattleUnit } from '../battle/BattleUnit';
import { HexGrid } from '../battle/HexGrid';
import { BuffManager } from '../battle/BuffManager';

/**
 * 魔法书管理器
 */
export class MagicBookManager {
    private static _instance: MagicBookManager;

    /** 英雄魔法书数据 */
    private heroBooks: Map<string, HeroMagicBook> = new Map();

    /** 魔法配置 */
    private spellConfigs: Map<string, SpellConfig> = SpellConfigMap;

    /** 快捷栏配置 */
    private quickSlots: SpellQuickSlot[] = [];

    /** 初始化标志 */
    private _initialized: boolean = false;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): MagicBookManager {
        if (!this._instance) {
            this._instance = new MagicBookManager();
        }
        return this._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        if (this._initialized) return;

        // 初始化快捷栏（10个槽位）
        for (let i = 0; i < 10; i++) {
            this.quickSlots.push({ slotIndex: i, spellId: '', heroId: '' });
        }

        this._initialized = true;
        console.log('MagicBookManager initialized');
    }

    // ==================== 魔法书初始化 ====================

    /**
     * 初始化英雄魔法书
     */
    initHeroMagicBook(
        heroId: string,
        initialMana: number = 20,
        spellPower: number = 1,
        wisdom: number = 1
    ): HeroMagicBook {
        const book: HeroMagicBook = {
            heroId,
            spells: new Map(),
            schoolMasteries: this.initSchoolMasteries(),
            maxMana: initialMana,
            currentMana: initialMana,
            manaRegen: 1,
            spellPower,
            wisdom
        };

        this.heroBooks.set(heroId, book);
        return book;
    }

    /**
     * 初始化派系熟练度
     */
    private initSchoolMasteries(): Map<MagicSchool, SchoolMastery> {
        const masteries = new Map<MagicSchool, SchoolMastery>();
        const schools = [MagicSchool.FIRE, MagicSchool.WATER, MagicSchool.EARTH, MagicSchool.AIR];

        for (const school of schools) {
            masteries.set(school, {
                school,
                level: MagicMastery.NONE,
                exp: 0,
                expToNext: 100
            });
        }

        return masteries;
    }

    // ==================== 魔法学习 ====================

    /**
     * 学习魔法
     */
    learnSpell(
        heroId: string,
        spellId: string,
        checkRequirements: boolean = true
    ): SpellLearnResult {
        const book = this.heroBooks.get(heroId);
        if (!book) {
            return { success: false, spellId, cost: { gold: 0 }, errorMessage: '英雄魔法书不存在' };
        }

        const spellConfig = this.spellConfigs.get(spellId);
        if (!spellConfig) {
            return { success: false, spellId, cost: { gold: 0 }, errorMessage: '魔法配置不存在' };
        }

        // 检查是否已学习
        if (book.spells.has(spellId)) {
            return { success: false, spellId, cost: { gold: 0 }, errorMessage: '已经学习了该魔法' };
        }

        // 检查学习需求
        if (checkRequirements && spellConfig.requirements) {
            const req = spellConfig.requirements;

            // 检查英雄等级
            // if (req.heroLevel && heroLevel < req.heroLevel) {
            //     return { success: false, spellId, cost: { gold: 0 }, errorMessage: '英雄等级不足' };
            // }

            // 检查派系熟练度
            if (req.magicSchoolLevel) {
                const schoolLevel = req.magicSchoolLevel[spellConfig.school];
                if (schoolLevel) {
                    const mastery = book.schoolMasteries.get(spellConfig.school);
                    if (!mastery || mastery.level < schoolLevel) {
                        return { success: false, spellId, cost: { gold: 0 }, errorMessage: '派系熟练度不足' };
                    }
                }
            }
        }

        // 计算学习费用
        const cost = this.calculateLearnCost(spellConfig);

        // 创建英雄魔法实例
        const heroSpell: HeroSpell = {
            spellId,
            level: 1,
            mastery: MagicMastery.BASIC,
            castCount: 0
        };

        book.spells.set(spellId, heroSpell);

        // 触发事件
        EventCenter.emit(MagicBookEventType.SPELL_LEARNED, {
            heroId,
            spellId,
            spellName: spellConfig.name
        });

        return { success: true, spellId, cost };
    }

    /**
     * 计算学习费用
     */
    private calculateLearnCost(spell: SpellConfig): { gold: number } {
        const baseCost = [500, 1000, 2000, 4000, 8000];
        return { gold: baseCost[spell.level - 1] || 500 };
    }

    /**
     * 升级魔法
     */
    upgradeSpell(heroId: string, spellId: string): { success: boolean; newLevel: number; cost: number } {
        const book = this.heroBooks.get(heroId);
        if (!book) {
            return { success: false, newLevel: 0, cost: 0 };
        }

        const heroSpell = book.spells.get(spellId);
        if (!heroSpell) {
            return { success: false, newLevel: 0, cost: 0 };
        }

        const spellConfig = this.spellConfigs.get(spellId);
        if (!spellConfig) {
            return { success: false, newLevel: 0, cost: 0 };
        }

        // 检查是否满级
        if (heroSpell.level >= 5) {
            return { success: false, newLevel: heroSpell.level, cost: 0 };
        }

        // 升级
        heroSpell.level++;
        const cost = heroSpell.level * 500;

        // 更新熟练度
        if (heroSpell.level >= 3) {
            heroSpell.mastery = MagicMastery.ADVANCED;
        }
        if (heroSpell.level >= 5) {
            heroSpell.mastery = MagicMastery.EXPERT;
        }

        // 触发事件
        EventCenter.emit(MagicBookEventType.SPELL_UPGRADED, {
            heroId,
            spellId,
            newLevel: heroSpell.level
        });

        return { success: true, newLevel: heroSpell.level, cost };
    }

    /**
     * 遗忘魔法
     */
    forgetSpell(heroId: string, spellId: string): boolean {
        const book = this.heroBooks.get(heroId);
        if (!book) return false;

        const result = book.spells.delete(spellId);
        if (result) {
            EventCenter.emit(MagicBookEventType.SPELL_FORGOTTEN, { heroId, spellId });
        }
        return result;
    }

    // ==================== 派系熟练度 ====================

    /**
     * 获取派系熟练度
     */
    getSchoolMastery(heroId: string, school: MagicSchool): SchoolMastery | undefined {
        const book = this.heroBooks.get(heroId);
        return book?.schoolMasteries.get(school);
    }

    /**
     * 升级派系熟练度
     */
    upgradeSchoolMastery(
        heroId: string,
        school: MagicSchool
    ): MasteryUpgradeResult {
        const book = this.heroBooks.get(heroId);
        if (!book) {
            return {
                success: false,
                school,
                oldLevel: MagicMastery.NONE,
                newLevel: MagicMastery.NONE,
                cost: { gold: 0 },
                errorMessage: '英雄魔法书不存在'
            };
        }

        const mastery = book.schoolMasteries.get(school);
        if (!mastery) {
            return {
                success: false,
                school,
                oldLevel: MagicMastery.NONE,
                newLevel: MagicMastery.NONE,
                cost: { gold: 0 },
                errorMessage: '派系数据不存在'
            };
        }

        // 检查是否满级
        if (mastery.level >= MagicMastery.MASTER) {
            return {
                success: false,
                school,
                oldLevel: mastery.level,
                newLevel: mastery.level,
                cost: { gold: 0 },
                errorMessage: '已达到最高熟练度'
            };
        }

        const oldLevel = mastery.level;
        mastery.level++;
        mastery.exp = 0;
        mastery.expToNext = this.calculateMasteryExpToNext(mastery.level);

        const cost = {
            gold: mastery.level * 2000,
            spellScrolls: mastery.level * 5
        };

        // 触发事件
        EventCenter.emit(MagicBookEventType.MASTERY_UPGRADED, {
            heroId,
            school,
            oldLevel,
            newLevel: mastery.level
        });

        return {
            success: true,
            school,
            oldLevel,
            newLevel: mastery.level,
            cost
        };
    }

    /**
     * 增加派系经验
     */
    addSchoolExp(heroId: string, school: MagicSchool, exp: number): void {
        const book = this.heroBooks.get(heroId);
        if (!book) return;

        const mastery = book.schoolMasteries.get(school);
        if (!mastery || mastery.level >= MagicMastery.MASTER) return;

        mastery.exp += exp;

        // 检查升级
        while (mastery.exp >= mastery.expToNext && mastery.level < MagicMastery.MASTER) {
            mastery.exp -= mastery.expToNext;
            mastery.level++;
            mastery.expToNext = this.calculateMasteryExpToNext(mastery.level);

            EventCenter.emit(MagicBookEventType.MASTERY_UPGRADED, {
                heroId,
                school,
                newLevel: mastery.level
            });
        }
    }

    /**
     * 计算下一级所需经验
     */
    private calculateMasteryExpToNext(level: MagicMastery): number {
        return level * 500 + 100;
    }

    // ==================== 魔法值管理 ====================

    /**
     * 获取当前魔法值
     */
    getCurrentMana(heroId: string): number {
        return this.heroBooks.get(heroId)?.currentMana || 0;
    }

    /**
     * 获取最大魔法值
     */
    getMaxMana(heroId: string): number {
        return this.heroBooks.get(heroId)?.maxMana || 0;
    }

    /**
     * 消耗魔法值
     */
    consumeMana(heroId: string, amount: number): boolean {
        const book = this.heroBooks.get(heroId);
        if (!book || book.currentMana < amount) return false;

        book.currentMana -= amount;
        EventCenter.emit(MagicBookEventType.MANA_CHANGED, {
            heroId,
            currentMana: book.currentMana,
            maxMana: book.maxMana
        });
        return true;
    }

    /**
     * 恢复魔法值
     */
    restoreMana(heroId: string, amount: number): void {
        const book = this.heroBooks.get(heroId);
        if (!book) return;

        book.currentMana = Math.min(book.maxMana, book.currentMana + amount);
        EventCenter.emit(MagicBookEventType.MANA_CHANGED, {
            heroId,
            currentMana: book.currentMana,
            maxMana: book.maxMana
        });
    }

    /**
     * 增加最大魔法值
     */
    increaseMaxMana(heroId: string, amount: number): void {
        const book = this.heroBooks.get(heroId);
        if (!book) return;

        book.maxMana += amount;
        book.currentMana += amount;
        EventCenter.emit(MagicBookEventType.MANA_CHANGED, {
            heroId,
            currentMana: book.currentMana,
            maxMana: book.maxMana
        });
    }

    /**
     * 魔法值自然恢复（每回合）
     */
    regenerateMana(heroId: string): void {
        const book = this.heroBooks.get(heroId);
        if (!book) return;

        this.restoreMana(heroId, book.manaRegen);
    }

    // ==================== 施法系统 ====================

    /**
     * 施放魔法
     */
    castSpell(
        heroId: string,
        spellId: string,
        caster: BattleUnit,
        target: { q: number; r: number } | BattleUnit,
        grid: HexGrid
    ): SpellCastResult {
        const book = this.heroBooks.get(heroId);
        if (!book) {
            return { success: false, spellId, manaCost: 0, errorMessage: '英雄魔法书不存在' };
        }

        const heroSpell = book.spells.get(spellId);
        if (!heroSpell) {
            return { success: false, spellId, manaCost: 0, errorMessage: '未学习该魔法' };
        }

        const spellConfig = this.spellConfigs.get(spellId);
        if (!spellConfig) {
            return { success: false, spellId, manaCost: 0, errorMessage: '魔法配置不存在' };
        }

        // 计算实际魔法消耗（考虑升级加成）
        let manaCost = spellConfig.manaCost;
        if (spellConfig.upgradeBonus.manaCostReduction) {
            manaCost -= (heroSpell.level - 1) * spellConfig.upgradeBonus.manaCostReduction;
            manaCost = Math.max(1, manaCost);
        }

        // 检查魔法值
        if (book.currentMana < manaCost) {
            return { success: false, spellId, manaCost: 0, errorMessage: '魔法值不足' };
        }

        // 检查施法范围
        const targetHex = 'position' in target ? target.position : target;
        const distance = grid.getDistance(caster.position, targetHex);
        let range = spellConfig.range;
        if (spellConfig.upgradeBonus.rangeBonus) {
            range += (heroSpell.level - 1) * spellConfig.upgradeBonus.rangeBonus;
        }
        if (distance > range) {
            return { success: false, spellId, manaCost: 0, errorMessage: '目标超出范围' };
        }

        // 消耗魔法值
        this.consumeMana(heroId, manaCost);

        // 更新施放次数
        heroSpell.castCount++;
        heroSpell.lastCastTime = Date.now();

        // 增加派系经验
        this.addSchoolExp(heroId, spellConfig.school, spellConfig.level * 5);

        // 获取目标单位
        const targets = this.getSpellTargets(spellConfig, caster, target, grid);

        // 应用效果
        const totalDamage = { value: 0 };
        const totalHeal = { value: 0 };

        for (const targetUnit of targets) {
            this.applySpellEffects(spellConfig, heroSpell, book, caster, targetUnit, totalDamage, totalHeal);
        }

        // 触发事件
        EventCenter.emit(MagicBookEventType.SPELL_CAST, {
            heroId,
            spellId,
            spellName: spellConfig.name,
            manaCost,
            targets: targets.map(t => t.id),
            damage: totalDamage.value,
            heal: totalHeal.value
        });

        return {
            success: true,
            spellId,
            manaCost,
            targets: targets.map(t => t.id),
            damage: totalDamage.value > 0 ? totalDamage.value : undefined,
            heal: totalHeal.value > 0 ? totalHeal.value : undefined
        };
    }

    /**
     * 获取魔法目标
     */
    private getSpellTargets(
        spell: SpellConfig,
        caster: BattleUnit,
        target: { q: number; r: number } | BattleUnit,
        grid: HexGrid
    ): BattleUnit[] {
        const targets: BattleUnit[] = [];

        switch (spell.targetType) {
            case TargetType.SELF:
                targets.push(caster);
                break;

            case TargetType.SINGLE:
                if (target instanceof BattleUnit) {
                    targets.push(target);
                }
                break;

            case TargetType.AREA:
                const targetHex = 'position' in target ? target.position : target;
                const radius = spell.areaRadius || 1;
                const cells = grid.getRange(targetHex, radius);
                for (const cell of cells) {
                    if (cell.unit && cell.unit instanceof BattleUnit) {
                        targets.push(cell.unit);
                    }
                }
                break;

            case TargetType.ALL_ENEMY:
                for (const cell of grid.getAllCells()) {
                    if (cell.unit && cell.unit instanceof BattleUnit && cell.unit.team !== caster.team) {
                        targets.push(cell.unit);
                    }
                }
                break;

            case TargetType.ALL_ALLY:
                for (const cell of grid.getAllCells()) {
                    if (cell.unit && cell.unit instanceof BattleUnit && cell.unit.team === caster.team) {
                        targets.push(cell.unit);
                    }
                }
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
        book: HeroMagicBook,
        caster: BattleUnit,
        target: BattleUnit,
        totalDamage: { value: number },
        totalHeal: { value: number }
    ): void {
        const spellPower = book.spellPower;
        const spellLevel = heroSpell.level;

        for (const effect of spell.effects) {
            // 计算效果值
            let value = this.calculateEffectValue(effect.value, spellPower, spellLevel, spell);

            switch (effect.type) {
                case 'damage':
                    // 应用升级伤害加成
                    if (spell.upgradeBonus.damageBonus) {
                        value += (spellLevel - 1) * spell.upgradeBonus.damageBonus;
                    }
                    target.takeDamage(value);
                    totalDamage.value += value;
                    break;

                case 'heal':
                    // 应用升级治疗加成
                    if (spell.upgradeBonus.healBonus) {
                        value += (spellLevel - 1) * spell.upgradeBonus.healBonus;
                    }
                    target.heal(value);
                    totalHeal.value += value;
                    break;

                case 'buff':
                case 'debuff':
                    let duration = effect.duration || 3;
                    // 应用持续回合加成
                    if (spell.upgradeBonus.durationBonus) {
                        duration += (spellLevel - 1) * spell.upgradeBonus.durationBonus;
                    }
                    // 使用 BuffManager
                    BuffManager.getInstance().applyStatusBuff(
                        target.id,
                        effect.status!,
                        caster.id,
                        duration,
                        typeof value === 'number' ? value : 0
                    );
                    break;

                case 'dispel':
                    BuffManager.getInstance().dispelBuffs(target.id, 99, true);
                    target.clearBuffs();
                    break;
            }
        }
    }

    /**
     * 计算效果值
     */
    private calculateEffectValue(
        value: number | string,
        spellPower: number,
        spellLevel: number,
        spell: SpellConfig
    ): number {
        if (typeof value === 'number') return value;

        // 解析公式
        let formula = value.toString();
        formula = formula.replace(/spellPower/g, String(spellPower));
        formula = formula.replace(/spell_power/g, String(spellPower));
        formula = formula.replace(/level/g, String(spellLevel));

        try {
            return eval(formula);
        } catch (e) {
            console.error('Failed to calculate effect value:', value, e);
            return 0;
        }
    }

    /**
     * 检查是否可以施放魔法
     */
    canCastSpell(heroId: string, spellId: string): { canCast: boolean; reason?: string } {
        const book = this.heroBooks.get(heroId);
        if (!book) {
            return { canCast: false, reason: '英雄魔法书不存在' };
        }

        const heroSpell = book.spells.get(spellId);
        if (!heroSpell) {
            return { canCast: false, reason: '未学习该魔法' };
        }

        const spellConfig = this.spellConfigs.get(spellId);
        if (!spellConfig) {
            return { canCast: false, reason: '魔法配置不存在' };
        }

        // 检查魔法值
        let manaCost = spellConfig.manaCost;
        if (spellConfig.upgradeBonus.manaCostReduction) {
            manaCost -= (heroSpell.level - 1) * spellConfig.upgradeBonus.manaCostReduction;
            manaCost = Math.max(1, manaCost);
        }

        if (book.currentMana < manaCost) {
            return { canCast: false, reason: '魔法值不足' };
        }

        return { canCast: true };
    }

    // ==================== 查询接口 ====================

    /**
     * 获取英雄魔法书
     */
    getHeroMagicBook(heroId: string): HeroMagicBook | undefined {
        return this.heroBooks.get(heroId);
    }

    /**
     * 获取英雄已学魔法列表
     */
    getHeroSpells(heroId: string): { config: SpellConfig; heroSpell: HeroSpell }[] {
        const book = this.heroBooks.get(heroId);
        if (!book) return [];

        const result: { config: SpellConfig; heroSpell: HeroSpell }[] = [];
        for (const [spellId, heroSpell] of book.spells) {
            const config = this.spellConfigs.get(spellId);
            if (config) {
                result.push({ config, heroSpell });
            }
        }
        return result;
    }

    /**
     * 获取魔法配置
     */
    getSpellConfig(spellId: string): SpellConfig | undefined {
        return this.spellConfigs.get(spellId);
    }

    /**
     * 获取所有魔法
     */
    getAllSpells(): SpellConfig[] {
        return AllSpells;
    }

    /**
     * 按派系获取魔法
     */
    getSpellsBySchool(school: MagicSchool): SpellConfig[] {
        return SpellsBySchool[school] || [];
    }

    /**
     * 获取魔法预览
     */
    getSpellPreview(heroId: string, spellId: string): SpellPreview | null {
        const spell = this.spellConfigs.get(spellId);
        if (!spell) return null;

        const book = this.heroBooks.get(heroId);
        const heroSpell = book?.spells.get(spellId);
        const canCast = this.canCastSpell(heroId, spellId);

        // 计算实际消耗
        let manaCost = spell.manaCost;
        if (heroSpell && spell.upgradeBonus.manaCostReduction) {
            manaCost -= (heroSpell.level - 1) * spell.upgradeBonus.manaCostReduction;
            manaCost = Math.max(1, manaCost);
        }

        return {
            spell,
            heroSpell,
            canLearn: !heroSpell,
            canCast: canCast.canCast,
            manaCost,
            estimatedDamage: spell.baseDamage,
            estimatedHeal: spell.baseHeal
        };
    }

    // ==================== 快捷栏 ====================

    /**
     * 设置快捷栏魔法
     */
    setQuickSlot(slotIndex: number, spellId: string, heroId: string): boolean {
        if (slotIndex < 0 || slotIndex >= this.quickSlots.length) return false;

        this.quickSlots[slotIndex] = { slotIndex, spellId, heroId };
        return true;
    }

    /**
     * 获取快捷栏魔法
     */
    getQuickSlot(slotIndex: number): SpellQuickSlot | undefined {
        return this.quickSlots[slotIndex];
    }

    /**
     * 获取所有快捷栏
     */
    getAllQuickSlots(): SpellQuickSlot[] {
        return this.quickSlots;
    }

    /**
     * 清空快捷栏
     */
    clearQuickSlot(slotIndex: number): void {
        if (slotIndex >= 0 && slotIndex < this.quickSlots.length) {
            this.quickSlots[slotIndex] = { slotIndex, spellId: '', heroId: '' };
        }
    }

    // ==================== 存档系统 ====================

    /**
     * 获取存档数据
     */
    getSaveData(): MagicBookSaveData {
        const heroBooks: MagicBookSaveData['heroBooks'] = {};

        for (const [heroId, book] of this.heroBooks) {
            const spells: { [spellId: string]: HeroSpell } = {};
            for (const [spellId, heroSpell] of book.spells) {
                spells[spellId] = heroSpell;
            }

            const schoolMasteries: { [school: string]: SchoolMastery } = {};
            for (const [school, mastery] of book.schoolMasteries) {
                schoolMasteries[school] = mastery;
            }

            heroBooks[heroId] = {
                spells,
                schoolMasteries,
                maxMana: book.maxMana,
                currentMana: book.currentMana,
                manaRegen: book.manaRegen,
                spellPower: book.spellPower,
                wisdom: book.wisdom
            };
        }

        return { heroBooks };
    }

    /**
     * 加载存档数据
     */
    loadSaveData(data: MagicBookSaveData): void {
        this.heroBooks.clear();

        for (const heroId in data.heroBooks) {
            const bookData = data.heroBooks[heroId];

            const spells = new Map<string, HeroSpell>();
            for (const spellId in bookData.spells) {
                spells.set(spellId, bookData.spells[spellId]);
            }

            const schoolMasteries = new Map<MagicSchool, SchoolMastery>();
            for (const school in bookData.schoolMasteries) {
                schoolMasteries.set(school as MagicSchool, bookData.schoolMasteries[school]);
            }

            this.heroBooks.set(heroId, {
                heroId,
                spells,
                schoolMasteries,
                maxMana: bookData.maxMana,
                currentMana: bookData.currentMana,
                manaRegen: bookData.manaRegen,
                spellPower: bookData.spellPower,
                wisdom: bookData.wisdom
            });
        }
    }
}

// 导出单例
export const magicBookManager = MagicBookManager.getInstance();