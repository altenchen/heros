/**
 * 市场面板
 * 显示资源交易、汇率信息、资源交换
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Button, Sprite, Color, Prefab, instantiate, ScrollView, EditBox } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { marketManager } from '../../market/MarketManager';
import { TradeType, MarketEventType, RatePreview, TradeRecord, ResourceExchange } from '../../config/MarketTypes';
import { ResourceType } from '../../config/GameTypes';
import { EventCenter } from '../../utils/EventTarget';
import { playerDataManager } from '../../utils/PlayerDataManager';

const { ccclass, property } = _decorator;

/** 资源名称 */
const RESOURCE_NAMES: Record<ResourceType, string> = {
    [ResourceType.GOLD]: '金币',
    [ResourceType.GEMS]: '钻石',
    [ResourceType.WOOD]: '木材',
    [ResourceType.ORE]: '矿石',
    [ResourceType.CRYSTAL]: '水晶',
    [ResourceType.GEM]: '宝石',
    [ResourceType.SULFUR]: '硫磺',
    [ResourceType.MERCURY]: '水银',
    [ResourceType.STAMINA]: '体力',
};

/** 资源颜色 */
const RESOURCE_COLORS: Record<ResourceType, Color> = {
    [ResourceType.GOLD]: new Color(255, 215, 0),
    [ResourceType.GEMS]: new Color(0, 255, 255),
    [ResourceType.WOOD]: new Color(139, 90, 43),
    [ResourceType.ORE]: new Color(128, 128, 128),
    [ResourceType.CRYSTAL]: new Color(0, 191, 255),
    [ResourceType.GEM]: new Color(255, 0, 127),
    [ResourceType.SULFUR]: new Color(255, 165, 0),
    [ResourceType.MERCURY]: new Color(192, 192, 192),
    [ResourceType.STAMINA]: new Color(0, 255, 0),
};

@ccclass('MarketPanel')
export class MarketPanel extends UIPanel {
    // ==================== 标题和信息 ====================

    /** 标题标签 */
    @property(Label)
    titleLabel: Label | null = null;

    /** 市场等级标签 */
    @property(Label)
    levelLabel: Label | null = null;

    /** 剩余交易次数 */
    @property(Label)
    tradeCountLabel: Label | null = null;

    /** 汇率优惠标签 */
    @property(Label)
    rateBonusLabel: Label | null = null;

    // ==================== 资源显示 ====================

    /** 金币数量 */
    @property(Label)
    goldLabel: Label | null = null;

    /** 资源容器 */
    @property(Node)
    resourceContainer: Node | null = null;

    // ==================== 交易面板 ====================

    /** 交易面板 */
    @property(Node)
    tradePanel: Node | null = null;

    /** 资源选择按钮 */
    @property(Button)
    resourceSelectButton: Button | null = null;

    /** 选中的资源标签 */
    @property(Label)
    selectedResourceLabel: Label | null = null;

    /** 买入单价标签 */
    @property(Label)
    buyPriceLabel: Label | null = null;

    /** 卖出单价标签 */
    @property(Label)
    sellPriceLabel: Label | null = null;

    /** 数量输入框 */
    @property(EditBox)
    amountInput: EditBox | null = null;

    /** 数量快捷按钮容器 */
    @property(Node)
    quickAmountContainer: Node | null = null;

    /** 买入按钮 */
    @property(Button)
    buyButton: Button | null = null;

    /** 卖出按钮 */
    @property(Button)
    sellButton: Button | null = null;

    /** 预计金币标签 */
    @property(Label)
    estimatedGoldLabel: Label | null = null;

    // ==================== 汇率面板 ====================

    /** 汇率列表容器 */
    @property(Node)
    rateListContainer: Node | null = null;

    /** 汇率项预制体 */
    @property(Prefab)
    rateItemPrefab: Prefab | null = null;

    // ==================== 资源交换面板 ====================

    /** 交换面板 */
    @property(Node)
    exchangePanel: Node | null = null;

    /** 交换列表容器 */
    @property(Node)
    exchangeListContainer: Node | null = null;

    /** 交换项预制体 */
    @property(Prefab)
    exchangeItemPrefab: Prefab | null = null;

    // ==================== 交易记录 ====================

    /** 记录面板 */
    @property(Node)
    recordPanel: Node | null = null;

    /** 记录列表容器 */
    @property(Node)
    recordListContainer: Node | null = null;

    /** 记录项预制体 */
    @property(Prefab)
    recordItemPrefab: Prefab | null = null;

    // ==================== 按钮 ====================

    /** 交易标签按钮 */
    @property(Button)
    tradeTabButton: Button | null = null;

    /** 交换标签按钮 */
    @property(Button)
    exchangeTabButton: Button | null = null;

    /** 记录标签按钮 */
    @property(Button)
    recordTabButton: Button | null = null;

    /** 升级按钮 */
    @property(Button)
    upgradeButton: Button | null = null;

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    // ==================== 状态 ====================

    /** 当前选中的资源 */
    private _selectedResource: ResourceType = ResourceType.WOOD;

    /** 当前标签页 */
    private _currentTab: 'trade' | 'exchange' | 'record' = 'trade';

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
        this._initUI();
        this._updateAll();
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
        EventCenter.on(MarketEventType.TRADE_COMPLETE, this._onTradeComplete, this);
        EventCenter.on(MarketEventType.MARKET_UPGRADED, this._onMarketUpgraded, this);
        EventCenter.on(MarketEventType.DAILY_RESET, this._onDailyReset, this);

        this.tradeTabButton?.node.on(Button.EventType.CLICK, () => this._switchTab('trade'), this);
        this.exchangeTabButton?.node.on(Button.EventType.CLICK, () => this._switchTab('exchange'), this);
        this.recordTabButton?.node.on(Button.EventType.CLICK, () => this._switchTab('record'), this);

        this.resourceSelectButton?.node.on(Button.EventType.CLICK, this._onResourceSelectClick, this);
        this.buyButton?.node.on(Button.EventType.CLICK, this._onBuyClick, this);
        this.sellButton?.node.on(Button.EventType.CLICK, this._onSellClick, this);
        this.upgradeButton?.node.on(Button.EventType.CLICK, this._onUpgradeClick, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this.hide, this);

        this.amountInput?.node.on(EditBox.EventType.TEXT_CHANGED, this._onAmountChanged, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(MarketEventType.TRADE_COMPLETE, this._onTradeComplete, this);
        EventCenter.off(MarketEventType.MARKET_UPGRADED, this._onMarketUpgraded, this);
        EventCenter.off(MarketEventType.DAILY_RESET, this._onDailyReset, this);
    }

    /**
     * 初始化UI
     */
    private _initUI(): void {
        if (!marketManager.isInitialized()) {
            marketManager.init();
        }
    }

    /**
     * 更新所有数据
     */
    private _updateAll(): void {
        this._updateHeader();
        this._updateResources();
        this._updateTradePanel();
        this._updateRateList();
        this._updateExchangeList();
        this._updateRecordList();
        this._switchTab(this._currentTab);
    }

    /**
     * 更新头部信息
     */
    private _updateHeader(): void {
        const levelConfig = marketManager.getLevelConfig();
        const remainingTrades = marketManager.getRemainingTrades();

        if (this.levelLabel) {
            this.levelLabel.string = `Lv.${marketManager.getMarketLevel()} ${levelConfig?.name || '市场'}`;
        }

        if (this.tradeCountLabel) {
            this.tradeCountLabel.string = `今日交易: ${remainingTrades}/${levelConfig?.dailyTradeLimit || 0}`;
        }

        if (this.rateBonusLabel) {
            this.rateBonusLabel.string = `汇率优惠: ${levelConfig?.rateBonus || 0}%`;
        }
    }

    /**
     * 更新资源显示
     */
    private _updateResources(): void {
        const playerData = playerDataManager.getPlayerData();
        if (!playerData) return;

        if (this.goldLabel) {
            this.goldLabel.string = playerData.resources[ResourceType.GOLD]?.toLocaleString() || '0';
        }

        // 更新其他资源显示（如果有资源容器）
        // 可以在这里动态创建资源显示节点
    }

    /**
     * 更新交易面板
     */
    private _updateTradePanel(): void {
        const isAvailable = marketManager.isResourceAvailable(this._selectedResource);

        if (this.selectedResourceLabel) {
            this.selectedResourceLabel.string = RESOURCE_NAMES[this._selectedResource];
            this.selectedResourceLabel.color = RESOURCE_COLORS[this._selectedResource];
        }

        const buyPrice = marketManager.getCurrentRate(this._selectedResource, TradeType.BUY);
        const sellPrice = marketManager.getCurrentRate(this._selectedResource, TradeType.SELL);

        if (this.buyPriceLabel) {
            this.buyPriceLabel.string = `买入: ${buyPrice} 金币/单位`;
        }

        if (this.sellPriceLabel) {
            this.sellPriceLabel.string = `卖出: ${sellPrice} 金币/单位`;
        }

        // 更新按钮状态
        if (this.buyButton) {
            this.buyButton.interactable = isAvailable && marketManager.getRemainingTrades() > 0;
        }

        if (this.sellButton) {
            this.sellButton.interactable = isAvailable && marketManager.getRemainingTrades() > 0;
        }

        this._updateEstimatedGold();
    }

    /**
     * 更新预计金币
     */
    private _updateEstimatedGold(): void {
        const amount = parseInt(this.amountInput?.string || '0') || 0;
        const buyPrice = marketManager.getCurrentRate(this._selectedResource, TradeType.BUY);
        const sellPrice = marketManager.getCurrentRate(this._selectedResource, TradeType.SELL);

        if (this.estimatedGoldLabel) {
            this.estimatedGoldLabel.string = `买入需: ${(buyPrice * amount).toLocaleString()} 金币 | 卖出得: ${(sellPrice * amount).toLocaleString()} 金币`;
        }
    }

    /**
     * 更新汇率列表
     */
    private _updateRateList(): void {
        const container = this.rateListContainer;
        if (!container) return;

        // 清空列表
        container.removeAllChildren();

        const previews = marketManager.getRatePreviews();

        previews.forEach(preview => {
            if (!preview.available) return;

            // 如果有预制体，使用预制体创建
            if (this.rateItemPrefab) {
                const item = instantiate(this.rateItemPrefab);
                this._setupRateItem(item, preview);
                container.addChild(item);
            }
        });
    }

    /**
     * 设置汇率项
     */
    private _setupRateItem(node: Node, preview: RatePreview): void {
        const labels = node.getComponentsInChildren(Label);
        if (labels.length >= 3) {
            labels[0].string = RESOURCE_NAMES[preview.resourceType];
            labels[1].string = `${preview.buyPrice}`;
            labels[2].string = `${preview.sellPrice}`;
        }
    }

    /**
     * 更新资源交换列表
     */
    private _updateExchangeList(): void {
        const container = this.exchangeListContainer;
        if (!container) return;

        container.removeAllChildren();

        const exchanges = marketManager.getResourceExchanges();

        exchanges.forEach(exchange => {
            if (this.exchangeItemPrefab) {
                const item = instantiate(this.exchangeItemPrefab);
                this._setupExchangeItem(item, exchange);
                container.addChild(item);
            }
        });
    }

    /**
     * 设置交换项
     */
    private _setupExchangeItem(node: Node, exchange: ResourceExchange): void {
        const labels = node.getComponentsInChildren(Label);
        if (labels.length >= 2) {
            labels[0].string = `${RESOURCE_NAMES[exchange.fromResource]} → ${RESOURCE_NAMES[exchange.toResource]}`;
            labels[1].string = `比例 ${exchange.ratio}:1 | 剩余 ${exchange.dailyLimit - exchange.usedCount}/${exchange.dailyLimit}`;
        }

        const button = node.getComponentInChildren(Button);
        if (button) {
            button.node.on(Button.EventType.CLICK, () => {
                this._onExchangeClick(exchange);
            }, this);
        }
    }

    /**
     * 更新交易记录列表
     */
    private _updateRecordList(): void {
        const container = this.recordListContainer;
        if (!container) return;

        container.removeAllChildren();

        const records = marketManager.getTradeRecords(20);

        records.forEach(record => {
            if (this.recordItemPrefab) {
                const item = instantiate(this.recordItemPrefab);
                this._setupRecordItem(item, record);
                container.addChild(item);
            }
        });
    }

    /**
     * 设置记录项
     */
    private _setupRecordItem(node: Node, record: TradeRecord): void {
        const labels = node.getComponentsInChildren(Label);
        if (labels.length >= 4) {
            const time = new Date(record.timestamp).toLocaleTimeString();
            const typeStr = record.tradeType === TradeType.BUY ? '买入' : '卖出';

            labels[0].string = time;
            labels[1].string = typeStr;
            labels[2].string = RESOURCE_NAMES[record.resourceType];
            labels[3].string = `${record.amount} x ${record.unitPrice} = ${record.totalPrice}`;
        }
    }

    /**
     * 切换标签页
     */
    private _switchTab(tab: 'trade' | 'exchange' | 'record'): void {
        this._currentTab = tab;

        // 隐藏所有面板
        this.tradePanel && (this.tradePanel.active = false);
        this.exchangePanel && (this.exchangePanel.active = false);
        this.recordPanel && (this.recordPanel.active = false);

        // 显示当前面板
        switch (tab) {
            case 'trade':
                this.tradePanel && (this.tradePanel.active = true);
                break;
            case 'exchange':
                this.exchangePanel && (this.exchangePanel.active = true);
                break;
            case 'record':
                this.recordPanel && (this.recordPanel.active = true);
                break;
        }
    }

    // ==================== 事件处理 ====================

    /**
     * 资源选择点击
     */
    private _onResourceSelectClick(): void {
        // 显示资源选择弹窗
        // 这里可以显示一个下拉菜单或弹窗让用户选择资源
        const availableResources = marketManager.getRatePreviews()
            .filter(p => p.available)
            .map(p => p.resourceType);

        // 简单实现：循环切换资源
        const currentIndex = availableResources.indexOf(this._selectedResource);
        const nextIndex = (currentIndex + 1) % availableResources.length;
        this._selectedResource = availableResources[nextIndex];
        this._updateTradePanel();
    }

    /**
     * 数量变化
     */
    private _onAmountChanged(): void {
        this._updateEstimatedGold();
    }

    /**
     * 买入点击
     */
    private _onBuyClick(): void {
        const amount = parseInt(this.amountInput?.string || '0') || 0;
        if (amount <= 0) {
            this._showToast('请输入有效的数量');
            return;
        }

        const result = marketManager.executeTrade(
            {
                tradeType: TradeType.BUY,
                resourceType: this._selectedResource,
                amount,
            },
            {
                getResource: (type) => playerDataManager.getResource(type),
                addResource: (type, amount) => playerDataManager.addResource(type, amount),
                useResource: (type, amount) => playerDataManager.useResource(type, amount),
            }
        );

        if (result.success) {
            this._showToast(`成功买入 ${result.trade?.amount} ${RESOURCE_NAMES[this._selectedResource]}`);
            this._updateAll();
        } else {
            this._showToast(result.error || '交易失败');
        }
    }

    /**
     * 卖出点击
     */
    private _onSellClick(): void {
        const amount = parseInt(this.amountInput?.string || '0') || 0;
        if (amount <= 0) {
            this._showToast('请输入有效的数量');
            return;
        }

        const result = marketManager.executeTrade(
            {
                tradeType: TradeType.SELL,
                resourceType: this._selectedResource,
                amount,
            },
            {
                getResource: (type) => playerDataManager.getResource(type),
                addResource: (type, amount) => playerDataManager.addResource(type, amount),
                useResource: (type, amount) => playerDataManager.useResource(type, amount),
            }
        );

        if (result.success) {
            this._showToast(`成功卖出 ${result.trade?.amount} ${RESOURCE_NAMES[this._selectedResource]}`);
            this._updateAll();
        } else {
            this._showToast(result.error || '交易失败');
        }
    }

    /**
     * 交换点击
     */
    private _onExchangeClick(exchange: ResourceExchange): void {
        // 简单实现：固定交换10单位
        const fromAmount = 10 * exchange.ratio;

        const result = marketManager.executeExchange(
            {
                exchangeId: exchange.id,
                fromAmount,
            },
            {
                getResource: (type) => playerDataManager.getResource(type),
                addResource: (type, amount) => playerDataManager.addResource(type, amount),
                useResource: (type, amount) => playerDataManager.useResource(type, amount),
            }
        );

        if (result.success) {
            this._showToast(`成功交换获得 ${result.toAmount} ${RESOURCE_NAMES[result.toResource!]}`);
            this._updateAll();
        } else {
            this._showToast(result.error || '交换失败');
        }
    }

    /**
     * 升级点击
     */
    private _onUpgradeClick(): void {
        const result = marketManager.upgradeMarket({
            hasEnoughResources: (cost) => playerDataManager.hasEnoughResources(cost),
            useResources: (cost) => playerDataManager.useResources(cost),
        });

        if (result.success) {
            this._showToast(`市场升级成功！当前等级: ${result.newLevel}`);
            this._updateAll();
        } else {
            this._showToast(result.error || '升级失败');
        }
    }

    /**
     * 交易完成事件
     */
    private _onTradeComplete(): void {
        this._updateAll();
    }

    /**
     * 市场升级事件
     */
    private _onMarketUpgraded(): void {
        this._updateAll();
    }

    /**
     * 每日重置事件
     */
    private _onDailyReset(): void {
        this._updateAll();
    }

    /**
     * 显示提示
     */
    private _showToast(message: string): void {
        // 使用 UIManager 显示 Toast
        console.log(`[Market] ${message}`);
    }
}