/**
 * 主城面板
 * 显示资源、建筑、招募等主城功能
 */

import { _decorator, Node, Label, Sprite, SpriteFrame, Prefab, instantiate, ScrollView, Vec3 } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { Game, GameState } from '../../Game';
import { UIManager } from '../UIManager';
import { EventCenter, GameEvent } from '../../utils/EventTarget';
import { PlayerDataManager } from '../../utils/PlayerDataManager';
import { ResourceType, Race, BuildingConfig, UnitConfig } from '../../config/GameTypes';
import { UnitConfigMap } from '../../../configs/units.json';
import { HeroConfigMap } from '../../../configs/heroes.json';
import { nodePoolManager } from '../../utils/pool';

const { ccclass, property } = _decorator;

/**
 * 资源显示项
 */
interface ResourceItem {
    node: Node;
    icon: Sprite | null;
    label: Label | null;
}

/**
 * 建筑显示项
 */
interface BuildingItem {
    node: Node;
    icon: Sprite | null;
    nameLabel: Label | null;
    statusLabel: Label | null;
    config: BuildingConfig | null;
}

/**
 * 主城面板
 */
@ccclass('TownPanel')
export class TownPanel extends UIPanel {
    // ==================== 资源区域 ====================

    /** 金币显示 */
    @property(Label)
    goldLabel: Label | null = null;

    /** 木材显示 */
    @property(Label)
    woodLabel: Label | null = null;

    /** 矿石显示 */
    @property(Label)
    oreLabel: Label | null = null;

    /** 水晶显示 */
    @property(Label)
    crystalLabel: Label | null = null;

    /** 宝石显示 */
    @property(Label)
    gemLabel: Label | null = null;

    /** 硫磺显示 */
    @property(Label)
    sulfurLabel: Label | null = null;

    /** 水银显示 */
    @property(Label)
    mercuryLabel: Label | null = null;

    // ==================== 英雄区域 ====================

    /** 英雄列表容器 */
    @property(Node)
    heroListContainer: Node | null = null;

    /** 英雄头像预制体 */
    @property(Prefab)
    heroIconPrefab: Prefab | null = null;

    // ==================== 建筑区域 ====================

    /** 建筑列表容器 */
    @property(ScrollView)
    buildingScrollView: ScrollView | null = null;

    /** 建筑列表内容 */
    @property(Node)
    buildingContent: Node | null = null;

    /** 建筑项预制体 */
    @property(Prefab)
    buildingItemPrefab: Prefab | null = null;

    // ==================== 操作按钮 ====================

    /** 招募按钮 */
    @property(Node)
    recruitButton: Node | null = null;

    /** 战斗按钮 */
    @property(Node)
    battleButton: Node | null = null;

    /** 英雄按钮 */
    @property(Node)
    heroButton: Node | null = null;

    /** 设置按钮 */
    @property(Node)
    settingsButton: Node | null = null;

    /** 魔法书按钮 */
    @property(Node)
    magicBookButton: Node | null = null;

    /** 市场按钮 */
    @property(Node)
    marketButton: Node | null = null;

    // ==================== 状态 ====================

    /** 游戏实例 */
    private _game: Game = Game.getInstance();

    /** 玩家数据管理器 */
    private _playerData: PlayerDataManager | null = null;

    /** UI管理器 */
    private _uiManager: UIManager = UIManager.getInstance();

    /** 资源标签映射 */
    private _resourceLabels: Map<ResourceType, Label> = new Map();

    /** 池名称常量 */
    private static readonly POOL_HERO_ICON = 'town_hero_icon';
    private static readonly POOL_BUILDING_ITEM = 'town_building_item';

    /** 当前创建的英雄节点 */
    private _heroNodes: Node[] = [];

    /** 当前创建的建筑节点 */
    private _buildingNodes: Node[] = [];

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 1,
            cache: true,
            animationType: PanelAnimationType.FADE,
            animationDuration: 0.3
        });

        this._playerData = this._game.getPlayerDataManager();

        // 初始化节点池
        this._initNodePools();
    }

    /**
     * 初始化节点池
     */
    private _initNodePools(): void {
        // 英雄头像池
        if (this.heroIconPrefab && !nodePoolManager.getPool(TownPanel.POOL_HERO_ICON)) {
            nodePoolManager.createPool(TownPanel.POOL_HERO_ICON, {
                prefab: this.heroIconPrefab,
                initialSize: 5,
                maxSize: 10,
                onGet: (node) => {
                    node.active = true;
                },
                onReturn: (node) => {
                    node.active = false;
                    node.removeFromParent();
                }
            });
        }

        // 建筑项池
        if (this.buildingItemPrefab && !nodePoolManager.getPool(TownPanel.POOL_BUILDING_ITEM)) {
            nodePoolManager.createPool(TownPanel.POOL_BUILDING_ITEM, {
                prefab: this.buildingItemPrefab,
                initialSize: 10,
                maxSize: 20,
                onGet: (node) => {
                    node.active = true;
                },
                onReturn: (node) => {
                    node.active = false;
                    node.removeFromParent();
                }
            });
        }
    }

    /**
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);
        this._initResourceLabels();
        this._updateResources();
        this._updateHeroList();
        this._updateBuildingList();
        this._setupButtons();
        this._bindEvents();
    }

    /**
     * 初始化资源标签映射
     */
    private _initResourceLabels(): void {
        this._resourceLabels.set(ResourceType.GOLD, this.goldLabel!);
        this._resourceLabels.set(ResourceType.WOOD, this.woodLabel!);
        this._resourceLabels.set(ResourceType.ORE, this.oreLabel!);
        this._resourceLabels.set(ResourceType.CRYSTAL, this.crystalLabel!);
        this._resourceLabels.set(ResourceType.GEM, this.gemLabel!);
        this._resourceLabels.set(ResourceType.SULFUR, this.sulfurLabel!);
        this._resourceLabels.set(ResourceType.MERCURY, this.mercuryLabel!);
    }

    /**
     * 更新资源显示
     */
    private _updateResources(): void {
        if (!this._playerData) return;

        const playerData = this._playerData;
        this._resourceLabels.forEach((label, type) => {
            if (label) {
                const amount = playerData.getResource(type);
                label.string = this._formatNumber(amount);
            }
        });
    }

    /**
     * 格式化数字
     */
    private _formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * 更新英雄列表
     */
    private _updateHeroList(): void {
        const container = this.heroListContainer;
        if (!this._playerData || !container) return;

        // 归还所有英雄节点到池中
        this._heroNodes.forEach(node => {
            nodePoolManager.return(TownPanel.POOL_HERO_ICON, node);
        });
        this._heroNodes = [];

        const heroes = this._playerData.getAllHeroes();

        heroes.forEach((hero, index) => {
            const config = HeroConfigMap.get(hero.data.configId);
            if (!config) return;

            // 从池中获取英雄头像节点
            let heroNode: Node;
            if (nodePoolManager.getPool(TownPanel.POOL_HERO_ICON)) {
                const pooledNode = nodePoolManager.get(TownPanel.POOL_HERO_ICON, container);
                heroNode = pooledNode ?? (this.heroIconPrefab ? instantiate(this.heroIconPrefab) : new Node(`Hero_${index}`));
                if (pooledNode) {
                    container.addChild(heroNode);
                }
            } else {
                heroNode = this.heroIconPrefab ? instantiate(this.heroIconPrefab) : new Node(`Hero_${index}`);
                container.addChild(heroNode);
            }

            // 设置点击事件
            heroNode.off(Node.EventType.TOUCH_END);
            heroNode.on(Node.EventType.TOUCH_END, () => {
                this._showHeroDetail(hero.data.id);
            });

            this._heroNodes.push(heroNode);
        });
    }

    /**
     * 更新建筑列表
     */
    private _updateBuildingList(): void {
        if (!this._playerData || !this.buildingContent) return;

        // 归还所有建筑节点到池中
        this._buildingNodes.forEach(node => {
            nodePoolManager.return(TownPanel.POOL_BUILDING_ITEM, node);
        });
        this._buildingNodes = [];

        const town = this._playerData.getMainTown();
        if (!town) return;

        // TODO: 从配置中获取建筑列表并显示
        // 这里暂时创建示例建筑
        const buildings = town.data?.buildings || [];

        buildings.forEach((building, index) => {
            this._createBuildingItem(building, index);
        });
    }

    /**
     * 创建建筑项
     */
    private _createBuildingItem(building: any, index: number): void {
        const content = this.buildingContent;
        if (!content) return;

        // 从池中获取建筑项节点
        let itemNode: Node;
        if (nodePoolManager.getPool(TownPanel.POOL_BUILDING_ITEM)) {
            const pooledNode = nodePoolManager.get(TownPanel.POOL_BUILDING_ITEM, content);
            itemNode = pooledNode ?? (this.buildingItemPrefab ? instantiate(this.buildingItemPrefab) : new Node(`Building_${index}`));
            if (pooledNode) {
                content.addChild(itemNode);
            }
        } else {
            itemNode = this.buildingItemPrefab ? instantiate(this.buildingItemPrefab) : new Node(`Building_${index}`);
            content.addChild(itemNode);
        }

        // 设置位置
        const y = -index * 80;
        itemNode.setPosition(new Vec3(0, y, 0));

        // 设置点击事件
        itemNode.off(Node.EventType.TOUCH_END);
        itemNode.on(Node.EventType.TOUCH_END, () => {
            this._onBuildingClick(building);
        });

        this._buildingNodes.push(itemNode);
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        // 招募按钮
        if (this.recruitButton) {
            const btn = this.recruitButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onRecruit.bind(this));
            } else {
                this.recruitButton.on(Node.EventType.TOUCH_END, this._onRecruit, this);
            }
        }

        // 战斗按钮
        if (this.battleButton) {
            const btn = this.battleButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onBattle.bind(this));
            } else {
                this.battleButton.on(Node.EventType.TOUCH_END, this._onBattle, this);
            }
        }

        // 英雄按钮
        if (this.heroButton) {
            const btn = this.heroButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onHero.bind(this));
            } else {
                this.heroButton.on(Node.EventType.TOUCH_END, this._onHero, this);
            }
        }

        // 设置按钮
        if (this.settingsButton) {
            const btn = this.settingsButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onSettings.bind(this));
            } else {
                this.settingsButton.on(Node.EventType.TOUCH_END, this._onSettings, this);
            }
        }

        // 魔法书按钮
        if (this.magicBookButton) {
            const btn = this.magicBookButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onMagicBook.bind(this));
            } else {
                this.magicBookButton.on(Node.EventType.TOUCH_END, this._onMagicBook, this);
            }
        }

        // 市场按钮
        if (this.marketButton) {
            const btn = this.marketButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onMarket.bind(this));
            } else {
                this.marketButton.on(Node.EventType.TOUCH_END, this._onMarket, this);
            }
        }
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(GameEvent.RESOURCE_CHANGED, this._onResourceChanged, this);
        EventCenter.on(GameEvent.BUILDING_COMPLETED, this._onBuildingCompleted, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(GameEvent.RESOURCE_CHANGED, this._onResourceChanged, this);
        EventCenter.off(GameEvent.BUILDING_COMPLETED, this._onBuildingCompleted, this);
    }

    /**
     * 资源变化回调
     */
    private _onResourceChanged(data: { type: ResourceType; amount: number }): void {
        this._updateResources();
    }

    /**
     * 建筑完成回调
     */
    private _onBuildingCompleted(data: any): void {
        this._updateBuildingList();
    }

    /**
     * 招募按钮点击
     */
    private _onRecruit(): void {
        this._uiManager.showUI('shop_panel');
    }

    /**
     * 战斗按钮点击
     */
    private _onBattle(): void {
        this.hide();

        // 进入战斗场景
        // TODO: 实现战斗准备界面
        this._uiManager.showUI('formation_panel');
    }

    /**
     * 英雄按钮点击
     */
    private _onHero(): void {
        this._uiManager.showUI('hero_panel');
    }

    /**
     * 设置按钮点击
     */
    private _onSettings(): void {
        this._uiManager.showUI('settings_panel');
    }

    /**
     * 魔法书按钮点击
     */
    private _onMagicBook(): void {
        this._uiManager.showUI('magic_book_panel');
    }

    /**
     * 市场按钮点击
     */
    private _onMarket(): void {
        this._uiManager.showUI('market_panel');
    }

    /**
     * 建筑点击
     */
    private _onBuildingClick(building: any): void {
        // 显示建筑详情或操作面板
        console.log('Building clicked:', building);
    }

    /**
     * 显示英雄详情
     */
    private _showHeroDetail(heroId: string): void {
        this._uiManager.showUI('hero_panel', { heroId });
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();
        this._unbindEvents();

        // 归还所有节点到池中
        this._heroNodes.forEach(node => {
            nodePoolManager.return(TownPanel.POOL_HERO_ICON, node);
        });
        this._heroNodes = [];

        this._buildingNodes.forEach(node => {
            nodePoolManager.return(TownPanel.POOL_BUILDING_ITEM, node);
        });
        this._buildingNodes = [];
    }
}