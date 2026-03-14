/**
 * 战斗准备面板（布阵界面）
 * 显示玩家部队配置、敌人预览，准备进入战斗
 */

import { _decorator, Node, Label, Sprite, SpriteFrame, Prefab, instantiate, ScrollView, Vec3, Color, Graphics, UITransform } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { Game } from '../../Game';
import { UIManager } from '../UIManager';
import { EventCenter, GameEvent } from '../../utils/EventTarget';
import { PlayerDataManager } from '../../utils/PlayerDataManager';
import { Hex, ArmySlot, UnitConfig, HeroData } from '../../config/GameTypes';
import { UnitConfigMap } from '../../../configs/units.json';
import { HeroConfigMap } from '../../../configs/heroes.json';
import { LevelConfigMap } from '../../config/levels.json';
import { levelBattleBridge, PlayerBattleUnit } from '../../level/LevelBattleBridge';
import { levelManager } from '../../level/LevelManager';
import { BATTLEFIELD_RADIUS } from '../../config/GameTypes';

const { ccclass, property } = _decorator;

/**
 * 军队槽位数据
 */
interface ArmySlotData {
    configId: string;
    count: number;
    unitConfig: UnitConfig | null;
    selected: boolean;
}

/**
 * 战斗准备面板
 */
@ccclass('FormationPanel')
export class FormationPanel extends UIPanel {
    // ==================== 标题区域 ====================

    /** 标题标签 */
    @property(Label)
    titleLabel: Label | null = null;

    /** 关卡名称 */
    @property(Label)
    levelNameLabel: Label | null = null;

    // ==================== 英雄信息区域 ====================

    /** 英雄头像 */
    @property(Sprite)
    heroPortrait: Sprite | null = null;

    /** 英雄名称 */
    @property(Label)
    heroNameLabel: Label | null = null;

    /** 英雄等级 */
    @property(Label)
    heroLevelLabel: Label | null = null;

    /** 英雄战力 */
    @property(Label)
    heroPowerLabel: Label | null = null;

    // ==================== 玩家部队区域 ====================

    /** 玩家部队容器 */
    @property(Node)
    playerArmyContainer: Node | null = null;

    /** 军队槽位预制体 */
    @property(Prefab)
    armySlotPrefab: Prefab | null = null;

    /** 总战力标签 */
    @property(Label)
    totalPowerLabel: Label | null = null;

    // ==================== 敌人预览区域 ====================

    /** 敌人预览容器 */
    @property(Node)
    enemyPreviewContainer: Node | null = null;

    /** 敌人英雄名称 */
    @property(Label)
    enemyHeroNameLabel: Label | null = null;

    /** 敌人战力标签 */
    @property(Label)
    enemyPowerLabel: Label | null = null;

    // ==================== 操作按钮 ====================

    /** 开始战斗按钮 */
    @property(Node)
    startBattleButton: Node | null = null;

    /** 快速布阵按钮 */
    @property(Node)
    autoFormationButton: Node | null = null;

    /** 返回按钮 */
    @property(Node)
    backButton: Node | null = null;

    // ==================== 提示信息 ====================

    /** 体力消耗标签 */
    @property(Label)
    staminaCostLabel: Label | null = null;

    /** 推荐战力标签 */
    @property(Label)
    recommendedPowerLabel: Label | null = null;

    // ==================== 状态 ====================

    /** 游戏实例 */
    private _game: Game = Game.getInstance();

    /** UI管理器 */
    private _uiManager: UIManager = UIManager.getInstance();

    /** 玩家数据管理器 */
    private _playerData: PlayerDataManager | null = null;

    /** 当前关卡ID */
    private _levelId: string | null = null;

    /** 关卡配置 */
    private _levelConfig: any = null;

    /** 玩家军队数据 */
    private _playerArmy: ArmySlotData[] = [];

    /** 玩家英雄数据 */
    private _playerHero: HeroData | null = null;

    /** 槽位节点列表 */
    private _slotNodes: Node[] = [];

    /** 默认玩家起始位置 */
    private readonly DEFAULT_POSITIONS: Hex[] = [
        { q: -3, r: -1 },
        { q: -3, r: 0 },
        { q: -3, r: 1 },
        { q: -2, r: -1 },
        { q: -2, r: 0 },
        { q: -2, r: 1 },
        { q: -1, r: 0 }
    ];

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 2,
            cache: true,
            animationType: PanelAnimationType.SLIDE_LEFT,
            animationDuration: 0.3
        });

        this._playerData = this._game.getPlayerDataManager();
    }

    /**
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);

        // 获取关卡ID
        if (data && data.levelId) {
            this._levelId = data.levelId;
            this._loadLevelConfig();
        }

        // 加载玩家数据
        this._loadPlayerData();

        // 更新UI
        this._updateUI();

        // 设置按钮
        this._setupButtons();
    }

    /**
     * 加载关卡配置
     */
    private _loadLevelConfig(): void {
        if (!this._levelId) return;

        this._levelConfig = LevelConfigMap.get(this._levelId);

        if (this._levelConfig) {
            if (this.levelNameLabel) {
                this.levelNameLabel.string = this._levelConfig.name;
            }
            if (this.staminaCostLabel) {
                this.staminaCostLabel.string = `体力消耗: ${this._levelConfig.staminaCost || 10}`;
            }
            if (this.recommendedPowerLabel) {
                this.recommendedPowerLabel.string = `推荐战力: ${this._levelConfig.recommendedPower || '未知'}`;
            }
        }
    }

    /**
     * 加载玩家数据
     */
    private _loadPlayerData(): void {
        // 获取玩家英雄
        const heroes = this._playerData?.getAllHeroes() || [];
        if (heroes.length > 0) {
            this._playerHero = heroes[0].toJSON();
        }

        // 获取玩家军队
        const army = this._playerHero?.army || [];
        this._playerArmy = army.map(slot => ({
            configId: slot.configId,
            count: slot.count,
            unitConfig: UnitConfigMap.get(slot.configId) || null,
            selected: true
        }));

        // 如果没有军队，使用默认部队
        if (this._playerArmy.length === 0) {
            this._playerArmy = this._getDefaultArmy();
        }
    }

    /**
     * 获取默认军队
     */
    private _getDefaultArmy(): ArmySlotData[] {
        return [
            { configId: 'castle_tier1_pikeman', count: 10, unitConfig: UnitConfigMap.get('castle_tier1_pikeman') || null, selected: true },
            { configId: 'castle_tier2_archer', count: 6, unitConfig: UnitConfigMap.get('castle_tier2_archer') || null, selected: true },
            { configId: 'castle_tier3_griffin', count: 3, unitConfig: UnitConfigMap.get('castle_tier3_griffin') || null, selected: true }
        ];
    }

    /**
     * 更新UI
     */
    private _updateUI(): void {
        this._updateHeroInfo();
        this._updatePlayerArmy();
        this._updateEnemyPreview();
        this._updateTotalPower();
    }

    /**
     * 更新英雄信息
     */
    private _updateHeroInfo(): void {
        if (!this._playerHero) {
            if (this.heroNameLabel) this.heroNameLabel.string = '无英雄';
            if (this.heroLevelLabel) this.heroLevelLabel.string = 'Lv.1';
            if (this.heroPowerLabel) this.heroPowerLabel.string = '战力: 0';
            return;
        }

        const heroConfig = HeroConfigMap.get(this._playerHero.configId);

        if (this.heroNameLabel) {
            this.heroNameLabel.string = heroConfig?.name || '未知英雄';
        }
        if (this.heroLevelLabel) {
            this.heroLevelLabel.string = `Lv.${this._playerHero.level}`;
        }
        if (this.heroPowerLabel) {
            const power = this._calculateHeroPower(this._playerHero);
            this.heroPowerLabel.string = `战力: ${power}`;
        }
    }

    /**
     * 更新玩家军队显示
     */
    private _updatePlayerArmy(): void {
        if (!this.playerArmyContainer) return;

        // 清空现有槽位
        this.playerArmyContainer.removeAllChildren();
        this._slotNodes = [];

        // 创建槽位
        for (let i = 0; i < 7; i++) {
            const slotData = this._playerArmy[i];
            const slotNode = this._createArmySlot(slotData, i);
            slotNode.setParent(this.playerArmyContainer);
            this._slotNodes.push(slotNode);
        }
    }

    /**
     * 创建军队槽位
     */
    private _createArmySlot(slotData: ArmySlotData | undefined, index: number): Node {
        const slotNode = this.armySlotPrefab ? instantiate(this.armySlotPrefab) : new Node(`Slot_${index}`);

        // 添加点击事件
        slotNode.on(Node.EventType.TOUCH_START, () => {
            this._onSlotClick(index);
        });

        if (!slotData || !slotData.unitConfig) {
            // 空槽位
            this._setupEmptySlot(slotNode, index);
            return slotNode;
        }

        // 有单位的槽位
        this._setupUnitSlot(slotNode, slotData, index);

        return slotNode;
    }

    /**
     * 设置空槽位
     */
    private _setupEmptySlot(slotNode: Node, index: number): void {
        // 设置背景
        let bgGraphics = slotNode.getChildByName('Background')?.getComponent(Graphics);
        if (!bgGraphics) {
            const bgNode = new Node('Background');
            bgNode.setParent(slotNode);
            bgNode.setPosition(new Vec3(0, 0, 0));
            bgGraphics = bgNode.addComponent(Graphics);
        }
        bgGraphics.clear();
        bgGraphics.rect(-40, -40, 80, 80);
        bgGraphics.fillColor = new Color(80, 80, 80, 150);
        bgGraphics.strokeColor = new Color(100, 100, 100, 200);
        bgGraphics.lineWidth = 2;
        bgGraphics.fill();
        bgGraphics.stroke();

        // 设置空槽位标签
        let emptyLabel = slotNode.getChildByName('EmptyLabel')?.getComponent(Label);
        if (!emptyLabel) {
            const labelNode = new Node('EmptyLabel');
            labelNode.setParent(slotNode);
            labelNode.setPosition(new Vec3(0, 0, 0));
            emptyLabel = labelNode.addComponent(Label);
            emptyLabel.fontSize = 12;
            emptyLabel.color = new Color(150, 150, 150, 255);
        }
        emptyLabel.string = `槽位 ${index + 1}`;
    }

    /**
     * 设置单位槽位
     */
    private _setupUnitSlot(slotNode: Node, slotData: ArmySlotData, index: number): void {
        const unitConfig = slotData.unitConfig!;

        // 设置背景颜色（根据种族）
        let bgGraphics = slotNode.getChildByName('Background')?.getComponent(Graphics);
        if (!bgGraphics) {
            const bgNode = new Node('Background');
            bgNode.setParent(slotNode);
            bgNode.setPosition(new Vec3(0, 0, 0));
            bgGraphics = bgNode.addComponent(Graphics);
        }

        const raceColors: { [key: string]: Color } = {
            'castle': new Color(100, 150, 255, 200),
            'rampart': new Color(100, 200, 100, 200),
            'tower': new Color(200, 200, 100, 200),
            'inferno': new Color(255, 100, 100, 200),
            'necropolis': new Color(150, 100, 200, 200),
            'dungeon': new Color(100, 100, 150, 200),
            'stronghold': new Color(200, 150, 100, 200)
        };

        const bgColor = raceColors[unitConfig.race] || new Color(100, 100, 100, 200);

        bgGraphics.clear();
        bgGraphics.rect(-40, -40, 80, 80);
        bgGraphics.fillColor = slotData.selected ? bgColor : new Color(80, 80, 80, 150);
        bgGraphics.strokeColor = slotData.selected ? new Color(255, 255, 255, 255) : new Color(100, 100, 100, 200);
        bgGraphics.lineWidth = slotData.selected ? 3 : 1;
        bgGraphics.fill();
        bgGraphics.stroke();

        // 单位名称
        let nameLabel = slotNode.getChildByName('NameLabel')?.getComponent(Label);
        if (!nameLabel) {
            const labelNode = new Node('NameLabel');
            labelNode.setParent(slotNode);
            labelNode.setPosition(new Vec3(0, 20, 0));
            nameLabel = labelNode.addComponent(Label);
            nameLabel.fontSize = 12;
            nameLabel.color = Color.WHITE;
        }
        nameLabel.string = unitConfig.name;

        // 单位数量
        let countLabel = slotNode.getChildByName('CountLabel')?.getComponent(Label);
        if (!countLabel) {
            const labelNode = new Node('CountLabel');
            labelNode.setParent(slotNode);
            labelNode.setPosition(new Vec3(0, -20, 0));
            countLabel = labelNode.addComponent(Label);
            countLabel.fontSize = 16;
            countLabel.color = Color.WHITE;
        }
        countLabel.string = `x${slotData.count}`;

        // 单位等级
        let tierLabel = slotNode.getChildByName('TierLabel')?.getComponent(Label);
        if (!tierLabel) {
            const labelNode = new Node('TierLabel');
            labelNode.setParent(slotNode);
            labelNode.setPosition(new Vec3(25, 25, 0));
            tierLabel = labelNode.addComponent(Label);
            tierLabel.fontSize = 10;
            tierLabel.color = new Color(255, 215, 0, 255);
        }
        tierLabel.string = `T${unitConfig.tier}`;
    }

    /**
     * 更新敌人预览
     */
    private _updateEnemyPreview(): void {
        if (!this.enemyPreviewContainer) return;

        // 清空敌人预览
        this.enemyPreviewContainer.removeAllChildren();

        if (!this._levelConfig) {
            if (this.enemyHeroNameLabel) this.enemyHeroNameLabel.string = '未知敌人';
            if (this.enemyPowerLabel) this.enemyPowerLabel.string = '战力: ???';
            return;
        }

        // 显示敌人英雄
        if (this._levelConfig.enemyHero) {
            const enemyHeroConfig = HeroConfigMap.get(this._levelConfig.enemyHero.heroId);
            if (this.enemyHeroNameLabel) {
                this.enemyHeroNameLabel.string = enemyHeroConfig?.name || '敌方英雄';
            }
        } else {
            if (this.enemyHeroNameLabel) this.enemyHeroNameLabel.string = '怪物';
        }

        // 显示敌人列表
        const enemies = this._levelConfig.enemies || [];
        let totalEnemyPower = 0;

        enemies.forEach((enemy: any, index: number) => {
            const unitConfig = UnitConfigMap.get(enemy.unitId);
            if (unitConfig) {
                const enemyNode = this._createEnemyPreviewNode(unitConfig, enemy.count);
                enemyNode.setParent(this.enemyPreviewContainer);

                // 计算敌人战力
                totalEnemyPower += this._calculateUnitPower(unitConfig, enemy.count);
            }
        });

        if (this.enemyPowerLabel) {
            this.enemyPowerLabel.string = `战力: ${totalEnemyPower}`;
        }
    }

    /**
     * 创建敌人预览节点
     */
    private _createEnemyPreviewNode(unitConfig: UnitConfig, count: number): Node {
        const node = new Node(`Enemy_${unitConfig.id}`);

        // 背景
        const bgGraphics = node.addComponent(Graphics);
        bgGraphics.rect(-30, -30, 60, 60);
        bgGraphics.fillColor = new Color(255, 100, 100, 150);
        bgGraphics.strokeColor = new Color(255, 150, 150, 200);
        bgGraphics.lineWidth = 1;
        bgGraphics.fill();
        bgGraphics.stroke();

        // 名称
        const nameNode = new Node('Name');
        nameNode.setParent(node);
        nameNode.setPosition(new Vec3(0, 15, 0));
        const nameLabel = nameNode.addComponent(Label);
        nameLabel.fontSize = 10;
        nameLabel.color = Color.WHITE;
        nameLabel.string = unitConfig.name;

        // 数量
        const countNode = new Node('Count');
        countNode.setParent(node);
        countNode.setPosition(new Vec3(0, -15, 0));
        const countLabel = countNode.addComponent(Label);
        countLabel.fontSize = 14;
        countLabel.color = Color.WHITE;
        countLabel.string = `x${count}`;

        return node;
    }

    /**
     * 更新总战力
     */
    private _updateTotalPower(): void {
        let totalPower = 0;

        // 英雄战力
        if (this._playerHero) {
            totalPower += this._calculateHeroPower(this._playerHero);
        }

        // 军队战力
        this._playerArmy.forEach(slot => {
            if (slot.selected && slot.unitConfig) {
                totalPower += this._calculateUnitPower(slot.unitConfig, slot.count);
            }
        });

        if (this.totalPowerLabel) {
            this.totalPowerLabel.string = `总战力: ${totalPower}`;
        }
    }

    /**
     * 计算英雄战力
     */
    private _calculateHeroPower(hero: HeroData): number {
        return (hero.attack + hero.defense + hero.spellPower + hero.knowledge) * 100;
    }

    /**
     * 计算单位战力
     */
    private _calculateUnitPower(unitConfig: UnitConfig, count: number): number {
        const basePower = (unitConfig.damage[0] + unitConfig.damage[1]) / 2 * 10 + unitConfig.hp / 5;
        return Math.floor(basePower * count);
    }

    /**
     * 槽位点击事件
     */
    private _onSlotClick(index: number): void {
        const slotData = this._playerArmy[index];
        if (!slotData || !slotData.unitConfig) return;

        // 切换选中状态
        slotData.selected = !slotData.selected;

        // 更新显示
        this._updatePlayerArmy();
        this._updateTotalPower();
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        if (this.startBattleButton) {
            const btn = this.startBattleButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onStartBattle.bind(this));
            }
        }

        if (this.autoFormationButton) {
            const btn = this.autoFormationButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onAutoFormation.bind(this));
            }
        }

        if (this.backButton) {
            const btn = this.backButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onBack.bind(this));
            }
        }
    }

    /**
     * 开始战斗
     */
    private _onStartBattle(): void {
        // 获取选中的单位
        const selectedUnits = this._playerArmy.filter(slot => slot.selected && slot.unitConfig);

        if (selectedUnits.length === 0) {
            this._uiManager.showToast('请至少选择一个单位参战！');
            return;
        }

        // 转换为战斗单位配置
        const playerUnits: PlayerBattleUnit[] = selectedUnits.map((slot, index) => ({
            configId: slot.configId,
            count: slot.count,
            position: this.DEFAULT_POSITIONS[index] || { q: -2, r: 0 }
        }));

        // 如果有关卡ID，使用关卡战斗流程
        if (this._levelId) {
            if (!levelBattleBridge.prepareBattle(this._levelId, playerUnits)) {
                this._uiManager.showToast('无法开始战斗，请检查体力是否足够');
                return;
            }

            // 设置战斗结束回调
            levelBattleBridge.setOnBattleEndCallback((result) => {
                console.log('[FormationPanel] 战斗结束:', result.victory ? '胜利' : '失败');
            });

            // 隐藏面板
            this.hide();

            // 开始关卡战斗
            this._game.startLevelBattle(this._levelId);
        } else {
            // 无关卡ID，使用普通战斗流程
            this.hide();
            this._game.startBattle(
                playerUnits.map(u => ({ configId: u.configId, count: u.count, position: u.position })),
                [],
                'hero_catherine'
            );
        }
    }

    /**
     * 快速布阵
     */
    private _onAutoFormation(): void {
        // 自动选择所有单位
        this._playerArmy.forEach(slot => {
            if (slot.unitConfig) {
                slot.selected = true;
            }
        });

        this._updatePlayerArmy();
        this._updateTotalPower();

        this._uiManager.showToast('已自动选择所有单位');
    }

    /**
     * 返回
     */
    private _onBack(): void {
        this.hide();
        this._uiManager.showUI('town_panel');
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();
    }
}