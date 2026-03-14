/**
 * 魔法书面板
 * 英雄无敌Ⅲ：传承
 * 显示英雄魔法书、魔法学习、派系熟练度
 */

import { _decorator, Node, Label, Button, ScrollView, Color, Sprite, UIOpacity } from 'cc';
import { UIPanel } from './UIPanel';
import { magicBookManager, MagicBookManager } from '../magicbook/MagicBookManager';
import {
    SpellConfig,
    HeroSpell,
    SchoolMastery,
    MagicBookEventType,
    SpellLevel,
    MagicMastery
} from '../config/MagicBookTypes';
import { MagicSchool } from '../config/GameTypes';
import { EventCenter } from '../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 派系颜色配置 */
const SchoolColors: Record<MagicSchool, Color> = {
    [MagicSchool.FIRE]: new Color(255, 100, 50, 255),    // 火红
    [MagicSchool.WATER]: new Color(50, 150, 255, 255),   // 水蓝
    [MagicSchool.EARTH]: new Color(150, 100, 50, 255),   // 土黄
    [MagicSchool.AIR]: new Color(200, 200, 255, 255)     // 气白
};

/** 派系名称配置 */
const SchoolNames: Record<MagicSchool, string> = {
    [MagicSchool.FIRE]: '火系',
    [MagicSchool.WATER]: '水系',
    [MagicSchool.EARTH]: '土系',
    [MagicSchool.AIR]: '气系'
};

/** 熟练度名称配置 */
const MasteryNames: Record<MagicMastery, string> = {
    [MagicMastery.NONE]: '未学习',
    [MagicMastery.BASIC]: '基础',
    [MagicMastery.ADVANCED]: '高级',
    [MagicMastery.EXPERT]: '专家',
    [MagicMastery.MASTER]: '大师'
};

@ccclass('MagicBookPanel')
export class MagicBookPanel extends UIPanel {
    // ==================== 属性绑定 ====================

    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    manaLabel: Label | null = null;

    @property(Label)
    spellPowerLabel: Label | null = null;

    @property(Button)
    closeButton: Button | null = null;

    // 派系选择按钮
    @property(Button)
    fireSchoolBtn: Button | null = null;

    @property(Button)
    waterSchoolBtn: Button | null = null;

    @property(Button)
    earthSchoolBtn: Button | null = null;

    @property(Button)
    airSchoolBtn: Button | null = null;

    // 派系熟练度
    @property(Label)
    fireMasteryLabel: Label | null = null;

    @property(Label)
    waterMasteryLabel: Label | null = null;

    @property(Label)
    earthMasteryLabel: Label | null = null;

    @property(Label)
    airMasteryLabel: Label | null = null;

    // 魔法列表
    @property(ScrollView)
    spellScrollView: ScrollView | null = null;

    @property(Node)
    spellListContent: Node | null = null;

    // 魔法详情
    @property(Label)
    spellNameLabel: Label | null = null;

    @property(Label)
    spellDescLabel: Label | null = null;

    @property(Label)
    spellLevelLabel: Label | null = null;

    @property(Label)
    spellManaCostLabel: Label | null = null;

    @property(Label)
    spellRangeLabel: Label | null = null;

    @property(Button)
    learnBtn: Button | null = null;

    @property(Button)
    upgradeBtn: Button | null = null;

    @property(Button)
    castBtn: Button | null = null;

    // ==================== 私有属性 ====================

    private _heroId: string = '';
    private _currentSchool: MagicSchool = MagicSchool.FIRE;
    private _selectedSpellId: string = '';

    // ==================== 生命周期 ====================

    protected onLoad(): void {
        super.onLoad();
        this.initEvents();
    }

    protected onDestroy(): void {
        this.removeEvents();
        super.onDestroy();
    }

    // ==================== 初始化 ====================

    private initEvents(): void {
        // 按钮事件
        this.closeButton?.node.on(Button.EventType.CLICK, this.onCloseClick, this);
        this.fireSchoolBtn?.node.on(Button.EventType.CLICK, () => this.onSchoolClick(MagicSchool.FIRE), this);
        this.waterSchoolBtn?.node.on(Button.EventType.CLICK, () => this.onSchoolClick(MagicSchool.WATER), this);
        this.earthSchoolBtn?.node.on(Button.EventType.CLICK, () => this.onSchoolClick(MagicSchool.EARTH), this);
        this.airSchoolBtn?.node.on(Button.EventType.CLICK, () => this.onSchoolClick(MagicSchool.AIR), this);
        this.learnBtn?.node.on(Button.EventType.CLICK, this.onLearnClick, this);
        this.upgradeBtn?.node.on(Button.EventType.CLICK, this.onUpgradeClick, this);
        this.castBtn?.node.on(Button.EventType.CLICK, this.onCastClick, this);

        // 监听魔法书事件
        EventCenter.on(MagicBookEventType.SPELL_LEARNED, this.onSpellLearned, this);
        EventCenter.on(MagicBookEventType.SPELL_UPGRADED, this.onSpellUpgraded, this);
        EventCenter.on(MagicBookEventType.MANA_CHANGED, this.onManaChanged, this);
        EventCenter.on(MagicBookEventType.MASTERY_UPGRADED, this.onMasteryUpgraded, this);
    }

    private removeEvents(): void {
        EventCenter.off(MagicBookEventType.SPELL_LEARNED, this.onSpellLearned, this);
        EventCenter.off(MagicBookEventType.SPELL_UPGRADED, this.onSpellUpgraded, this);
        EventCenter.off(MagicBookEventType.MANA_CHANGED, this.onManaChanged, this);
        EventCenter.off(MagicBookEventType.MASTERY_UPGRADED, this.onMasteryUpgraded, this);
    }

    /**
     * 设置数据
     */
    setData(data: { heroId: string; school?: MagicSchool }): void {
        this._heroId = data.heroId;
        if (data.school) {
            this._currentSchool = data.school;
        }
        this.refresh();
    }

    /**
     * 刷新面板
     */
    refresh(): void {
        this.updateHeader();
        this.updateMasteries();
        this.updateSpellList();
        this.updateSpellDetail();
    }

    // ==================== 头部信息 ====================

    private updateHeader(): void {
        const book = magicBookManager.getHeroMagicBook(this._heroId);
        if (!book) return;

        this.manaLabel && (this.manaLabel.string = `魔法值: ${book.currentMana}/${book.maxMana}`);
        this.spellPowerLabel && (this.spellPowerLabel.string = `魔法强度: ${book.spellPower}`);
    }

    // ==================== 派系熟练度 ====================

    private updateMasteries(): void {
        const masteries = [
            { school: MagicSchool.FIRE, label: this.fireMasteryLabel },
            { school: MagicSchool.WATER, label: this.waterMasteryLabel },
            { school: MagicSchool.EARTH, label: this.earthMasteryLabel },
            { school: MagicSchool.AIR, label: this.airMasteryLabel }
        ];

        for (const { school, label } of masteries) {
            const mastery = magicBookManager.getSchoolMastery(this._heroId, school);
            if (label && mastery) {
                label.string = `${SchoolNames[school]}: ${MasteryNames[mastery.level]}`;
                label.color = SchoolColors[school];
            }
        }
    }

    // ==================== 魔法列表 ====================

    private updateSpellList(): void {
        if (!this.spellListContent) return;

        // 清空现有列表
        this.spellListContent.removeAllChildren();

        // 获取当前派系的魔法
        const spells = magicBookManager.getSpellsBySchool(this._currentSchool);
        const heroSpells = magicBookManager.getHeroSpells(this._heroId);
        const heroSpellMap = new Map(heroSpells.map(s => [s.config.id, s.heroSpell]));

        // 创建魔法条目
        for (const spell of spells) {
            const heroSpell = heroSpellMap.get(spell.id);
            this.createSpellItem(spell, heroSpell);
        }
    }

    private createSpellItem(spell: SpellConfig, heroSpell?: HeroSpell): void {
        if (!this.spellListContent) return;

        const item = new Node(`spell_${spell.id}`);

        // 创建名称标签
        const nameLabel = item.addComponent(Label);
        nameLabel.string = spell.name;
        nameLabel.fontSize = 20;
        nameLabel.color = heroSpell ? Color.WHITE : Color.GRAY;

        // 创建等级标签
        const levelLabel = item.addComponent(Label);
        levelLabel.string = heroSpell ? `Lv.${heroSpell.level}` : '未学习';
        levelLabel.fontSize = 16;
        levelLabel.color = heroSpell ? SchoolColors[spell.school] : Color.GRAY;

        // 添加点击事件
        item.on(Node.EventType.TOUCH_END, () => {
            this.onSpellItemClick(spell.id);
        });

        this.spellListContent.addChild(item);
    }

    // ==================== 魔法详情 ====================

    private updateSpellDetail(): void {
        if (!this._selectedSpellId) {
            this.clearSpellDetail();
            return;
        }

        const preview = magicBookManager.getSpellPreview(this._heroId, this._selectedSpellId);
        if (!preview) return;

        const { spell, heroSpell, canCast, manaCost, estimatedDamage, estimatedHeal } = preview;

        this.spellNameLabel && (this.spellNameLabel.string = spell.name);
        this.spellNameLabel && (this.spellNameLabel.color = SchoolColors[spell.school]);

        this.spellDescLabel && (this.spellDescLabel.string = spell.description);

        this.spellLevelLabel && (this.spellLevelLabel.string = heroSpell
            ? `等级: ${heroSpell.level} (${MasteryNames[heroSpell.mastery]})`
            : `等级: 未学习`);

        this.spellManaCostLabel && (this.spellManaCostLabel.string = `魔法消耗: ${manaCost}`);

        this.spellRangeLabel && (this.spellRangeLabel.string = `施法范围: ${spell.range}`);

        // 更新按钮状态
        if (this.learnBtn) {
            this.learnBtn.node.active = !heroSpell;
        }

        if (this.upgradeBtn) {
            this.upgradeBtn.node.active = !!heroSpell && heroSpell.level < 5;
        }

        if (this.castBtn) {
            this.castBtn.node.active = canCast;
        }
    }

    private clearSpellDetail(): void {
        this.spellNameLabel && (this.spellNameLabel.string = '');
        this.spellDescLabel && (this.spellDescLabel.string = '请选择一个魔法');
        this.spellLevelLabel && (this.spellLevelLabel.string = '');
        this.spellManaCostLabel && (this.spellManaCostLabel.string = '');
        this.spellRangeLabel && (this.spellRangeLabel.string = '');

        if (this.learnBtn) this.learnBtn.node.active = false;
        if (this.upgradeBtn) this.upgradeBtn.node.active = false;
        if (this.castBtn) this.castBtn.node.active = false;
    }

    // ==================== 事件处理 ====================

    private onCloseClick(): void {
        this.hide();
    }

    private onSchoolClick(school: MagicSchool): void {
        this._currentSchool = school;
        this._selectedSpellId = '';
        this.updateSpellList();
        this.updateSpellDetail();
    }

    private onSpellItemClick(spellId: string): void {
        this._selectedSpellId = spellId;
        this.updateSpellDetail();
    }

    private onLearnClick(): void {
        if (!this._selectedSpellId) return;

        const result = magicBookManager.learnSpell(this._heroId, this._selectedSpellId);
        if (result.success) {
            // TODO: 扣除金币
            this.refresh();
        } else {
            console.warn('学习失败:', result.errorMessage);
        }
    }

    private onUpgradeClick(): void {
        if (!this._selectedSpellId) return;

        const result = magicBookManager.upgradeSpell(this._heroId, this._selectedSpellId);
        if (result.success) {
            // TODO: 扣除金币
            this.refresh();
        }
    }

    private onCastClick(): void {
        // TODO: 进入施法模式
        console.log('进入施法模式:', this._selectedSpellId);
    }

    // ==================== 事件回调 ====================

    private onSpellLearned(data: { heroId: string; spellId: string }): void {
        if (data.heroId === this._heroId) {
            this.updateSpellList();
            this.updateSpellDetail();
        }
    }

    private onSpellUpgraded(data: { heroId: string; spellId: string; newLevel: number }): void {
        if (data.heroId === this._heroId && data.spellId === this._selectedSpellId) {
            this.updateSpellDetail();
        }
    }

    private onManaChanged(data: { heroId: string; currentMana: number; maxMana: number }): void {
        if (data.heroId === this._heroId) {
            this.updateHeader();
        }
    }

    private onMasteryUpgraded(data: { heroId: string; school: MagicSchool }): void {
        if (data.heroId === this._heroId) {
            this.updateMasteries();
        }
    }
}