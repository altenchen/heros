/**
 * 商店面板
 * 显示商品列表、购买、货币兑换
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Button, Sprite, Color, Prefab, instantiate, ScrollView } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { shopManager } from '../../shop';
import { ShopType, ShopEventType, CurrencyType, ShopItem, ExchangeConfig } from '../../config/ShopTypes';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 商店类型名称 */
const SHOP_TYPE_NAMES: Record<ShopType, string> = {
    [ShopType.NORMAL]: '普通商店',
    [ShopType.GEMS]: '钻石商店',
    [ShopType.VIP]: 'VIP商店',
    [ShopType.ARENA]: '竞技场商店',
    [ShopType.GUILD]: '公会商店',
    [ShopType.EVENT]: '活动商店',
    [ShopType.LIMITED]: '限时商店'
};

/** 货币名称 */
const CURRENCY_NAMES: Record<CurrencyType, string> = {
    [CurrencyType.GOLD]: '金币',
    [CurrencyType.GEMS]: '钻石',
    [CurrencyType.STAMINA]: '体力',
    [CurrencyType.ARENA_COIN]: '竞技币',
    [CurrencyType.GUILD_COIN]: '公会币',
    [CurrencyType.EVENT_COIN]: '活动币'
};

@ccclass('ShopPanel')
export class ShopPanel extends UIPanel {
    // ==================== 分类标签 ====================

    /** 分类容器 */
    @property(Node)
    categoryContainer: Node | null = null;

    /** 分类按钮预制体 */
    @property(Prefab)
    categoryButtonPrefab: Prefab | null = null;

    // ==================== 货币显示 ====================

    /** 金币标签 */
    @property(Label)
    goldLabel: Label | null = null;

    /** 钻石标签 */
    @property(Label)
    gemsLabel: Label | null = null;

    /** 竞技币标签 */
    @property(Label)
    arenaCoinLabel: Label | null = null;

    // ==================== 商品列表 ====================

    /** 商品滚动视图 */
    @property(ScrollView)
    shopScrollView: ScrollView | null = null;

    /** 商品容器 */
    @property(Node)
    shopContainer: Node | null = null;

    /** 商品预制体 */
    @property(Prefab)
    shopItemPrefab: Prefab | null = null;

    // ==================== 货币兑换 ====================

    /** 兑换面板 */
    @property(Node)
    exchangePanel: Node | null = null;

    /** 兑换列表容器 */
    @property(Node)
    exchangeContainer: Node | null = null;

    /** 兑换项预制体 */
    @property(Prefab)
    exchangeItemPrefab: Prefab | null = null;

    // ==================== 按钮 ====================

    /** 刷新按钮 */
    @property(Button)
    refreshButton: Button | null = null;

    /** 兑换按钮 */
    @property(Button)
    exchangeButton: Button | null = null;

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    /** 返回按钮 */
    @property(Button)
    backButton: Button | null = null;

    // ==================== 状态 ====================

    /** 当前商店类型 */
    private _currentShopType: ShopType = ShopType.NORMAL;

    /** 当前是否在兑换界面 */
    private _isExchangeMode: boolean = false;

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 2,
            cache: true,
            animationType: PanelAnimationType.SLIDE_RIGHT,
            animationDuration: 0.3
        });
    }

    /**
     * 面板打开
     */
    protected onOpen(): void {
        this._bindEvents();
        this._initCategories();
        this._updateCurrency();
        this._updateShopItems();
    }

    /**
     * 面板关闭
     */
    protected onClose(): void {
        this._unbindEvents();
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(ShopEventType.PURCHASE_SUCCESS, this._onPurchaseSuccess, this);
        EventCenter.on(ShopEventType.SHOP_REFRESH, this._onShopRefresh, this);

        this.refreshButton?.node.on(Button.EventType.CLICK, this._onRefreshClick, this);
        this.exchangeButton?.node.on(Button.EventType.CLICK, this._onExchangeClick, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this._onCloseClick, this);
        this.backButton?.node.on(Button.EventType.CLICK, this._onBackClick, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(ShopEventType.PURCHASE_SUCCESS, this._onPurchaseSuccess, this);
        EventCenter.off(ShopEventType.SHOP_REFRESH, this._onShopRefresh, this);
    }

    /**
     * 初始化分类
     */
    private _initCategories(): void {
        const container = this.categoryContainer;
        if (!container) return;

        container.removeAllChildren();

        const types = [ShopType.NORMAL, ShopType.VIP, ShopType.ARENA, ShopType.GUILD];

        types.forEach(type => {
            const btnNode = this.categoryButtonPrefab
                ? instantiate(this.categoryButtonPrefab)
                : new Node(`Category_${type}`);

            const label = btnNode.getComponentInChildren(Label);
            if (label) {
                label.string = SHOP_TYPE_NAMES[type];
                label.color = type === this._currentShopType
                    ? new Color(255, 215, 0)
                    : new Color(255, 255, 255);
            }

            btnNode.on(Node.EventType.TOUCH_END, () => {
                this._selectShopType(type);
            });

            container.addChild(btnNode);
        });
    }

    /**
     * 选择商店类型
     */
    private _selectShopType(type: ShopType): void {
        if (this._currentShopType === type) return;

        this._currentShopType = type;
        this._initCategories();
        this._updateShopItems();
    }

    /**
     * 更新货币显示
     */
    private _updateCurrency(): void {
        // 从玩家数据管理器获取货币数量
        // 简化实现
        if (this.goldLabel) {
            this.goldLabel.string = '10000';
        }
        if (this.gemsLabel) {
            this.gemsLabel.string = '1000';
        }
        if (this.arenaCoinLabel) {
            this.arenaCoinLabel.string = '500';
        }
    }

    /**
     * 更新商品列表
     */
    private _updateShopItems(): void {
        const container = this.shopContainer;
        if (!container) return;

        container.removeAllChildren();

        const items = shopManager.getShopItems(this._currentShopType);

        if (items.length === 0) {
            this._showEmptyState();
            return;
        }

        items.forEach((item, index) => {
            const itemNode = this.shopItemPrefab
                ? instantiate(this.shopItemPrefab)
                : new Node(`Item_${item.id}`);

            itemNode.setPosition(0, -index * 100, 0);

            // 商品名称
            const nameLabel = itemNode.getChildByName('Name')?.getComponent(Label);
            if (nameLabel) {
                nameLabel.string = item.name;
            }

            // 商品描述
            const descLabel = itemNode.getChildByName('Desc')?.getComponent(Label);
            if (descLabel) {
                descLabel.string = item.description;
            }

            // 商品价格
            const priceLabel = itemNode.getChildByName('Price')?.getComponent(Label);
            if (priceLabel) {
                const currencyName = CURRENCY_NAMES[item.price.currency] || item.price.currency;
                priceLabel.string = `${item.price.amount} ${currencyName}`;
            }

            // 原价（如果有折扣）
            const originalLabel = itemNode.getChildByName('OriginalPrice')?.getComponent(Label);
            if (originalLabel && item.originalPrice) {
                originalLabel.string = `${item.originalPrice.amount}`;
                originalLabel.color = new Color(150, 150, 150);
            }

            // 剩余购买次数
            const remainingLabel = itemNode.getChildByName('Remaining')?.getComponent(Label);
            if (remainingLabel) {
                const remaining = shopManager.getRemainingPurchaseCount(item.id);
                if (item.limit > 0) {
                    remainingLabel.string = `剩余 ${remaining}/${item.limit}`;
                } else {
                    remainingLabel.string = '';
                }
            }

            // 购买按钮
            const buyBtn = itemNode.getChildByName('BuyBtn')?.getComponent(Button);
            if (buyBtn) {
                const canBuy = shopManager.getRemainingPurchaseCount(item.id) > 0;
                buyBtn.interactable = canBuy;

                buyBtn.node.on(Button.EventType.CLICK, () => {
                    this._purchaseItem(item);
                });
            }

            container.addChild(itemNode);
        });
    }

    /**
     * 显示空状态
     */
    private _showEmptyState(): void {
        if (!this.shopContainer) return;

        const emptyNode = new Node('EmptyState');
        const emptyLabel = emptyNode.addComponent(Label);
        emptyLabel.string = '商店暂无商品';
        emptyLabel.fontSize = 24;
        emptyLabel.color = new Color(150, 150, 150);
        this.shopContainer.addChild(emptyNode);
    }

    /**
     * 更新兑换列表
     */
    private _updateExchangeList(): void {
        const container = this.exchangeContainer;
        if (!container) return;

        container.removeAllChildren();

        const exchanges = shopManager.getExchangeConfigs();

        exchanges.forEach((exchange, index) => {
            const exchangeNode = this.exchangeItemPrefab
                ? instantiate(this.exchangeItemPrefab)
                : new Node(`Exchange_${exchange.id}`);

            exchangeNode.setPosition(0, -index * 80, 0);

            // 兑换信息
            const infoLabel = exchangeNode.getChildByName('Info')?.getComponent(Label);
            if (infoLabel) {
                const fromName = CURRENCY_NAMES[exchange.from.currency] || exchange.from.currency;
                const toName = CURRENCY_NAMES[exchange.to.currency] || exchange.to.currency;
                infoLabel.string = `${exchange.from.amount} ${fromName} -> ${exchange.to.amount} ${toName}`;
            }

            // 兑换按钮
            const exchangeBtn = exchangeNode.getChildByName('ExchangeBtn')?.getComponent(Button);
            if (exchangeBtn) {
                exchangeBtn.node.on(Button.EventType.CLICK, () => {
                    this._doExchange(exchange);
                });
            }

            container.addChild(exchangeNode);
        });
    }

    /**
     * 购买商品
     */
    private _purchaseItem(item: ShopItem): void {
        const result = shopManager.purchase(item.id, 1);
        if (result.success) {
            this._showToast('购买成功！');
            this._updateCurrency();
            this._updateShopItems();
        } else {
            this._showToast(result.error || '购买失败');
        }
    }

    /**
     * 执行兑换
     */
    private _doExchange(exchange: ExchangeConfig): void {
        const result = shopManager.exchange(exchange.id);
        if (result.success) {
            this._showToast('兑换成功！');
            this._updateCurrency();
        } else {
            this._showToast(result.error || '兑换失败');
        }
    }

    /**
     * 刷新点击
     */
    private _onRefreshClick(): void {
        const result = shopManager.refreshShop(this._currentShopType);
        if (result.success) {
            this._showToast('商店已刷新！');
            this._updateShopItems();
        } else {
            this._showToast(result.error || '刷新失败');
        }
    }

    /**
     * 兑换点击
     */
    private _onExchangeClick(): void {
        this._isExchangeMode = true;
        if (this.exchangePanel) {
            this.exchangePanel.active = true;
        }
        this._updateExchangeList();
    }

    /**
     * 关闭点击
     */
    private _onCloseClick(): void {
        this.hide();
    }

    /**
     * 返回点击
     */
    private _onBackClick(): void {
        if (this._isExchangeMode) {
            this._isExchangeMode = false;
            if (this.exchangePanel) {
                this.exchangePanel.active = false;
            }
        }
    }

    /**
     * 购买成功回调
     */
    private _onPurchaseSuccess(data: { itemId: string; quantity: number }): void {
        this._updateCurrency();
    }

    /**
     * 商店刷新回调
     */
    private _onShopRefresh(data: { shopType: ShopType }): void {
        if (data.shopType === this._currentShopType) {
            this._updateShopItems();
        }
    }

    /**
     * 显示提示
     */
    private _showToast(message: string): void {
        console.log(`[ShopPanel] ${message}`);
    }
}