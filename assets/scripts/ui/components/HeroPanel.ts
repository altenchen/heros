/**
 * 英雄面板
 * 显示英雄属性、技能、军队配置
 */

import { _decorator, Node, Label, Sprite, SpriteFrame, Prefab, instantiate, ScrollView, Vec3, ProgressBar, resources, ImageAsset, Texture2D } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { Game } from '../../Game';
import { UIManager } from '../UIManager';
import { EventCenter, GameEvent } from '../../utils/EventTarget';
import { PlayerDataManager } from '../../utils/PlayerDataManager';
import { HeroData, SkillInstance, ArmySlot, HeroConfig, UnitConfig } from '../../config/GameTypes';
import { HeroConfigMap } from '../../../configs/heroes.json';
import { SkillConfigMap } from '../../../configs/skills.json';
import { UnitConfigMap } from '../../../configs/units.json';

const { ccclass, property } = _decorator;

/**
 * 英雄面板
 */
@ccclass('HeroPanel')
export class HeroPanel extends UIPanel {
    // ==================== 英雄基本信息 ====================

    /** 英雄头像 */
    @property(Sprite)
    heroPortrait: Sprite | null = null;

    /** 英雄名称 */
    @property(Label)
    heroName: Label | null = null;

    /** 英雄等级 */
    @property(Label)
    heroLevel: Label | null = null;

    /** 英雄职业 */
    @property(Label)
    heroClass: Label | null = null;

    /** 经验条 */
    @property(ProgressBar)
    expBar: ProgressBar | null = null;

    /** 经验标签 */
    @property(Label)
    expLabel: Label | null = null;

    // ==================== 属性面板 ====================

    /** 攻击力标签 */
    @property(Label)
    attackLabel: Label | null = null;

    /** 防御力标签 */
    @property(Label)
    defenseLabel: Label | null = null;

    /** 咒力标签 */
    @property(Label)
    spellPowerLabel: Label | null = null;

    /** 知识标签 */
    @property(Label)
    knowledgeLabel: Label | null = null;

    /** 法力值标签 */
    @property(Label)
    manaLabel: Label | null = null;

    // ==================== 技能面板 ====================

    /** 技能列表容器 */
    @property(Node)
    skillListContainer: Node | null = null;

    /** 技能项预制体 */
    @property(Prefab)
    skillItemPrefab: Prefab | null = null;

    // ==================== 军队面板 ====================

    /** 军队槽位容器 */
    @property(Node)
    armySlotsContainer: Node | null = null;

    /** 军队槽位预制体 */
    @property(Prefab)
    armySlotPrefab: Prefab | null = null;

    // ==================== 操作按钮 ====================

    /** 关闭按钮 */
    @property(Node)
    closeButton: Node | null = null;

    /** 技能树按钮 */
    @property(Node)
    skillTreeButton: Node | null = null;

    /** 编队按钮 */
    @property(Node)
    formationButton: Node | null = null;

    // ==================== 状态 ====================

    /** 游戏实例 */
    private _game: Game = Game.getInstance();

    /** 玩家数据管理器 */
    private _playerData: PlayerDataManager | null = null;

    /** UI管理器 */
    private _uiManager: UIManager = UIManager.getInstance();

    /** 当前显示的英雄ID */
    private _currentHeroId: string | null = null;

    /** 当前英雄数据 */
    private _currentHero: HeroData | null = null;

    /** 当前英雄配置 */
    private _currentHeroConfig: HeroConfig | null = null;

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 2, // UILayer.PANEL
            cache: true,
            animationType: PanelAnimationType.SCALE,
            animationDuration: 0.3
        });

        this._playerData = this._game.getPlayerDataManager();
    }

    /**
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);

        // 获取要显示的英雄ID
        if (data && data.heroId) {
            this._currentHeroId = data.heroId;
        } else {
            // 默认显示第一个英雄
            const heroes = this._playerData?.getAllHeroes() || [];
            if (heroes.length > 0) {
                this._currentHeroId = heroes[0].id;
            }
        }

        this._loadHeroData();
        this._updateHeroInfo();
        this._updateAttributes();
        this._updateSkills();
        this._updateArmy();
        this._setupButtons();
    }

    /**
     * 加载英雄数据
     */
    private _loadHeroData(): void {
        if (!this._playerData || !this._currentHeroId) return;

        this._currentHero = this._playerData.getHero(this._currentHeroId);
        if (this._currentHero) {
            this._currentHeroConfig = HeroConfigMap.get(this._currentHero.configId) || null;
        }
    }

    /**
     * 更新英雄基本信息
     */
    private _updateHeroInfo(): void {
        if (!this._currentHero || !this._currentHeroConfig) return;

        // 名称
        if (this.heroName) {
            this.heroName.string = this._currentHeroConfig.name;
        }

        // 等级
        if (this.heroLevel) {
            this.heroLevel.string = `Lv.${this._currentHero.level}`;
        }

        // 职业
        if (this.heroClass) {
            this.heroClass.string = this._currentHeroConfig.heroClass;
        }

        // 经验
        const expForNextLevel = this._getExpForLevel(this._currentHero.level + 1);
        const expForCurrentLevel = this._getExpForLevel(this._currentHero.level);
        const expProgress = (this._currentHero.experience - expForCurrentLevel) / (expForNextLevel - expForCurrentLevel);

        if (this.expBar) {
            this.expBar.progress = expProgress;
        }

        if (this.expLabel) {
            this.expLabel.string = `${this._currentHero.experience}/${expForNextLevel}`;
        }

        // 加载头像
        this._loadHeroPortrait();
    }

    /**
     * 加载英雄头像
     */
    private _loadHeroPortrait(): void {
        if (!this.heroPortrait || !this._currentHeroConfig) return;

        const portraitPath = this._currentHeroConfig.portrait;

        // 尝试从 resources 目录加载头像
        resources.load(`portraits/${portraitPath}/spriteFrame`, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.warn(`[HeroPanel] 加载头像失败: ${portraitPath}`, err);
                // 尝试从 ui 目录加载
                resources.load(`ui/portraits/${portraitPath}/spriteFrame`, SpriteFrame, (err2, sf2) => {
                    if (err2) {
                        console.warn(`[HeroPanel] 备用路径加载头像也失败: ${portraitPath}`);
                        return;
                    }
                    this.heroPortrait!.spriteFrame = sf2;
                });
                return;
            }
            this.heroPortrait!.spriteFrame = spriteFrame;
        });
    }

    /**
     * 获取等级所需经验
     */
    private _getExpForLevel(level: number): number {
        // 简单的经验公式
        return Math.floor(100 * Math.pow(1.5, level - 1));
    }

    /**
     * 更新属性
     */
    private _updateAttributes(): void {
        if (!this._currentHero) return;

        if (this.attackLabel) {
            this.attackLabel.string = this._currentHero.attack.toString();
        }

        if (this.defenseLabel) {
            this.defenseLabel.string = this._currentHero.defense.toString();
        }

        if (this.spellPowerLabel) {
            this.spellPowerLabel.string = this._currentHero.spellPower.toString();
        }

        if (this.knowledgeLabel) {
            this.knowledgeLabel.string = this._currentHero.knowledge.toString();
        }

        if (this.manaLabel) {
            this.manaLabel.string = `${this._currentHero.mana}/${this._currentHero.maxMana}`;
        }
    }

    /**
     * 更新技能列表
     */
    private _updateSkills(): void {
        if (!this._currentHero || !this.skillListContainer) return;

        // 清空现有内容
        this.skillListContainer.removeAllChildren();

        this._currentHero.skills.forEach((skill, index) => {
            this._createSkillItem(skill, index);
        });
    }

    /**
     * 创建技能项
     */
    private _createSkillItem(skill: SkillInstance, index: number): void {
        if (!this.skillListContainer) return;

        const itemNode = this.skillItemPrefab ? instantiate(this.skillItemPrefab) : new Node(`Skill_${index}`);
        itemNode.setParent(this.skillListContainer);

        // 设置技能信息
        const nameLabel = itemNode.getChildByName('NameLabel')?.getComponent(Label);
        if (nameLabel) {
            const config = SkillConfigMap.get(skill.configId);
            nameLabel.string = config?.name || skill.configId;
        }

        const levelLabel = itemNode.getChildByName('LevelLabel')?.getComponent(Label);
        if (levelLabel) {
            levelLabel.string = `Lv.${skill.level}`;
        }

        // 点击显示技能详情
        itemNode.on(Node.EventType.TOUCH_END, () => {
            this._showSkillDetail(skill);
        });
    }

    /**
     * 显示技能详情
     */
    private _showSkillDetail(skill: SkillInstance): void {
        const config = SkillConfigMap.get(skill.configId);
        if (config) {
            this._uiManager.showConfirm(
                config.name,
                config.description,
                () => {}
            );
        }
    }

    /**
     * 更新军队
     */
    private _updateArmy(): void {
        if (!this._currentHero || !this.armySlotsContainer) return;

        // 清空现有内容
        this.armySlotsContainer.removeAllChildren();

        this._currentHero.army.forEach((slot, index) => {
            this._createArmySlot(slot, index);
        });
    }

    /**
     * 创建军队槽位
     */
    private _createArmySlot(slot: ArmySlot, index: number): void {
        if (!this.armySlotsContainer) return;

        const slotNode = this.armySlotPrefab ? instantiate(this.armySlotPrefab) : new Node(`ArmySlot_${index}`);
        slotNode.setParent(this.armySlotsContainer);

        // 获取兵种配置
        const unitConfig = UnitConfigMap.get(slot.configId);

        // 显示兵种名称
        const nameLabel = slotNode.getChildByName('NameLabel')?.getComponent(Label);
        if (nameLabel && unitConfig) {
            nameLabel.string = unitConfig.name;
        }

        // 显示兵种数量
        const countLabel = slotNode.getChildByName('CountLabel')?.getComponent(Label);
        if (countLabel) {
            countLabel.string = `x${slot.count}`;
        }

        // 显示兵种图标
        const iconSprite = slotNode.getChildByName('Icon')?.getComponent(Sprite);
        if (iconSprite && unitConfig) {
            this._loadUnitIcon(iconSprite, unitConfig);
        }

        // 点击显示兵种详情或编辑
        slotNode.on(Node.EventType.TOUCH_END, () => {
            this._showUnitDetail(slot);
        });
    }

    /**
     * 加载兵种图标
     */
    private _loadUnitIcon(sprite: Sprite, config: UnitConfig): void {
        // 尝试从 resources 目录加载兵种图标
        const iconPath = `units/${config.id}/spriteFrame`;
        resources.load(iconPath, SpriteFrame, (err, spriteFrame) => {
            if (err) {
                console.warn(`[HeroPanel] 加载兵种图标失败: ${config.id}`);
                return;
            }
            sprite.spriteFrame = spriteFrame;
        });
    }

    /**
     * 显示兵种详情
     */
    private _showUnitDetail(slot: ArmySlot): void {
        const unitConfig = UnitConfigMap.get(slot.configId);
        if (!unitConfig) {
            console.warn(`[HeroPanel] 未找到兵种配置: ${slot.configId}`);
            return;
        }

        // 构建详情信息
        const details = [
            `【${unitConfig.name}】`,
            `等级: ${unitConfig.tier}阶`,
            `攻击: ${unitConfig.attack}`,
            `防御: ${unitConfig.defense}`,
            `速度: ${unitConfig.speed}`,
            `生命: ${unitConfig.hp}`,
            `伤害: ${unitConfig.damage[0]}-${unitConfig.damage[1]}`,
            ``,
            `数量: ${slot.count}`,
            `生命: ${slot.currentHp}/${slot.maxHp}`
        ];

        if (unitConfig.specialty) {
            details.push(``, `特性: ${unitConfig.specialty.name}`, unitConfig.specialty.description);
        }

        this._uiManager.showConfirm(
            unitConfig.name,
            details.join('\n'),
            () => {}
        );
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        if (this.closeButton) {
            const btn = this.closeButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this.close.bind(this));
            } else {
                this.closeButton.on(Node.EventType.TOUCH_END, this.close, this);
            }
        }

        if (this.skillTreeButton) {
            const btn = this.skillTreeButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._showSkillTree.bind(this));
            }
        }

        if (this.formationButton) {
            const btn = this.formationButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._showFormation.bind(this));
            }
        }
    }

    /**
     * 显示技能树
     */
    private _showSkillTree(): void {
        // TODO: 显示技能树面板
        console.log('Show skill tree');
    }

    /**
     * 显示编队界面
     */
    private _showFormation(): void {
        this._uiManager.showUI('formation_panel', { heroId: this._currentHeroId });
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();
        this._currentHeroId = null;
        this._currentHero = null;
        this._currentHeroConfig = null;
    }
}