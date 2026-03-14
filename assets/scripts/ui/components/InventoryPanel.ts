/**
 * 背包面板
 * 显示道具列表、使用、出售、扩容
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Button, Sprite, Color, Prefab, instantiate, ScrollView } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { inventoryManager } from '../../inventory';
import { InventoryType, InventoryEventType, InventoryItem, ItemRarity } from '../../config/InventoryTypes';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 稀有度颜色 */
const RARITY_COLORS: Record<ItemRarity, Color> = {
    [ItemRarity.COMMON]: new Color(200, 200, 200),
    [ItemRarity.RARE]: new Color(30, 144, 255),
    [ItemRarity.EPIC]: new Color(148, 0, 211),
    [ItemRarity.LEGENDARY]: new Color(255, 165, 0)
};

/** 稀有度名称 */
const RARITY_NAMES: Record<ItemRarity, string> = {
    [ItemRarity.COMMON]: '普通',
    [ItemRarity.RARE]: '稀有',
    [ItemRarity.EPIC]: '史诗',
    [ItemRarity.LEGENDARY]: '传说'
};

@ccclass('InventoryPanel')
export class InventoryPanel extends UIPanel {
    // ==================== 分类标签 ====================

    /** 分类容器 */
    @property(Node)
    categoryContainer: Node | null = null;

    /** 分类按钮预制体 */
    @property(Prefab)
    categoryButtonPrefab: Prefab | null = null;

    // ==================== 背包信息 ====================

    /** 容量标签 */
    @property(Label)
    capacityLabel: Label | null = null;

    /** 扩容按钮 */
    @property(Button)
    expandButton: Button | null = null;

    // ==================== 道具列表 ====================

    /** 道具滚动视图 */
    @property(ScrollView)
    itemScrollView: ScrollView | null = null;

    /** 道具容器 */
    @property(Node)
    itemContainer: Node | null = null;

    /** 道具预制体 */
    @property(Prefab)
    itemPrefab: Prefab | null = null;

    // ==================== 道具详情 ====================

    /** 详情面板 */
    @property(Node)
    detailPanel: Node | null = null;

    /** 道具图标 */
    @property(Sprite)
    itemIcon: Sprite | null = null;

    /** 道具名称 */
    @property(Label)
    itemNameLabel: Label | null = null;

    /** 道具稀有度 */
    @property(Label)
    itemRarityLabel: Label | null = null;

    /** 道具描述 */
    @property(Label)
    itemDescLabel: Label | null = null;

    /** 道具数量 */
    @property(Label)
    itemCountLabel: Label | null = null;

    /** 使用按钮 */
    @property(Button)
    useButton: Button | null = null;

    /** 出售按钮 */
    @property(Button)
    sellButton: Button | null = null;

    /** 出售价格 */
    @property(Label)
    sellPriceLabel: Label | null = null;

    // ==================== 按钮 ====================

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    // ==================== 状态 ====================

    /** 当前背包类型 */
    private _currentType: InventoryType = InventoryType.MAIN;

    /** 当前选中的道具实例ID */
    private _currentInstanceId: string = '';

    /** 当前选中的道具数据 */
    private _currentItem: InventoryItem | null = null;

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
        this._updateUI();
        this._hideDetailPanel();
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
        EventCenter.on(InventoryEventType.ITEM_ADD, this._onItemAdd, this);
        EventCenter.on(InventoryEventType.ITEM_REMOVE, this._onItemRemove, this);
        EventCenter.on(InventoryEventType.ITEM_UPDATE, this._onItemUpdate, this);

        this.expandButton?.node.on(Button.EventType.CLICK, this._onExpandClick, this);
        this.useButton?.node.on(Button.EventType.CLICK, this._onUseClick, this);
        this.sellButton?.node.on(Button.EventType.CLICK, this._onSellClick, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this._onCloseClick, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(InventoryEventType.ITEM_ADD, this._onItemAdd, this);
        EventCenter.off(InventoryEventType.ITEM_REMOVE, this._onItemRemove, this);
        EventCenter.off(InventoryEventType.ITEM_UPDATE, this._onItemUpdate, this);
    }

    /**
     * 初始化分类
     */
    private _initCategories(): void {
        if (!this.categoryContainer) return;

        this.categoryContainer.removeAllChildren();

        const types = [InventoryType.MAIN, InventoryType.EQUIPMENT, InventoryType.MATERIAL];

        types.forEach(type => {
            const btnNode = this.categoryButtonPrefab
                ? instantiate(this.categoryButtonPrefab)
                : new Node(`Category_${type}`);

            const label = btnNode.getComponentInChildren(Label);
            if (label) {
                label.string = this._getTypeName(type);
                label.color = type === this._currentType
                    ? new Color(255, 215, 0)
                    : new Color(255, 255, 255);
            }

            btnNode.on(Node.EventType.TOUCH_END, () => {
                this._selectType(type);
            });

            this.categoryContainer.addChild(btnNode);
        });
    }

    /**
     * 获取背包类型名称
     */
    private _getTypeName(type: InventoryType): string {
        const names: Record<InventoryType, string> = {
            [InventoryType.MAIN]: '全部',
            [InventoryType.EQUIPMENT]: '装备',
            [InventoryType.MATERIAL]: '材料',
            [InventoryType.HERO]: '英雄',
            [InventoryType.SKIN]: '皮肤'
        };
        return names[type] || '';
    }

    /**
     * 选择类型
     */
    private _selectType(type: InventoryType): void {
        if (this._currentType === type) return;

        this._currentType = type;
        this._initCategories();
        this._updateUI();
        this._hideDetailPanel();
    }

    /**
     * 更新UI
     */
    private _updateUI(): void {
        this._updateCapacity();
        this._updateItemList();
    }

    /**
     * 更新容量信息
     */
    private _updateCapacity(): void {
        const capacity = inventoryManager.getCapacity(this._currentType);
        const used = inventoryManager.getUsedSlots(this._currentType);

        if (this.capacityLabel) {
            this.capacityLabel.string = `${used}/${capacity}`;
            this.capacityLabel.color = used >= capacity
                ? new Color(255, 50, 50)
                : new Color(255, 255, 255);
        }

        if (this.expandButton) {
            this.expandButton.interactable = used >= capacity * 0.9;
        }
    }

    /**
     * 更新道具列表
     */
    private _updateItemList(): void {
        if (!this.itemContainer) return;

        this.itemContainer.removeAllChildren();

        const items = inventoryManager.getAllItems(this._currentType);

        if (items.length === 0) {
            this._showEmptyState();
            return;
        }

        items.forEach((item, index) => {
            const itemNode = this.itemPrefab
                ? instantiate(this.itemPrefab)
                : new Node(`Item_${item.instanceId}`);

            itemNode.setPosition(0, -index * 60, 0);

            // 道具名称
            const nameLabel = itemNode.getChildByName('Name')?.getComponent(Label);
            if (nameLabel && item.config) {
                nameLabel.string = item.config.name;
                const rarity = item.config.rarity || ItemRarity.COMMON;
                nameLabel.color = RARITY_COLORS[rarity];
            }

            // 道具数量
            const countLabel = itemNode.getChildByName('Count')?.getComponent(Label);
            if (countLabel) {
                countLabel.string = item.count > 1 ? `x${item.count}` : '';
            }

            // 道具图标（预留）
            const iconSprite = itemNode.getChildByName('Icon')?.getComponent(Sprite);

            // 点击查看详情
            itemNode.on(Node.EventType.TOUCH_END, () => {
                this._showItemDetail(item);
            });

            this.itemContainer.addChild(itemNode);
        });
    }

    /**
     * 显示空状态
     */
    private _showEmptyState(): void {
        if (!this.itemContainer) return;

        const emptyNode = new Node('EmptyState');
        const emptyLabel = emptyNode.addComponent(Label);
        emptyLabel.string = '背包空空如也';
        emptyLabel.fontSize = 24;
        emptyLabel.color = new Color(150, 150, 150);
        this.itemContainer.addChild(emptyNode);
    }

    /**
     * 显示道具详情
     */
    private _showItemDetail(item: InventoryItem): void {
        if (!this.detailPanel || !item.config) return;

        this._currentInstanceId = item.instanceId;
        this._currentItem = item;
        this.detailPanel.active = true;

        const rarity = item.config.rarity || ItemRarity.COMMON;

        if (this.itemNameLabel) {
            this.itemNameLabel.string = item.config.name;
            this.itemNameLabel.color = RARITY_COLORS[rarity];
        }

        if (this.itemRarityLabel) {
            this.itemRarityLabel.string = RARITY_NAMES[rarity];
            this.itemRarityLabel.color = RARITY_COLORS[rarity];
        }

        if (this.itemDescLabel) {
            this.itemDescLabel.string = item.config.description;
        }

        if (this.itemCountLabel) {
            this.itemCountLabel.string = `数量: ${item.count}`;
        }

        // 使用按钮
        if (this.useButton) {
            this.useButton.interactable = item.config.usable;
            this.useButton.node.active = item.config.usable;
        }

        // 出售按钮
        if (this.sellButton) {
            this.sellButton.interactable = item.config.sellable ?? false;
            this.sellButton.node.active = item.config.sellable ?? false;
        }

        if (this.sellPriceLabel && item.config.sellPrice) {
            this.sellPriceLabel.string = `${item.config.sellPrice.amount} ${item.config.sellPrice.currency}`;
        }
    }

    /**
     * 隐藏详情面板
     */
    private _hideDetailPanel(): void {
        if (this.detailPanel) {
            this.detailPanel.active = false;
        }
        this._currentInstanceId = '';
        this._currentItem = null;
    }

    /**
     * 扩容点击
     */
    private _onExpandClick(): void {
        const result = inventoryManager.expandInventory(this._currentType);
        if (result.success) {
            this._showToast(`扩容成功！容量+${result.addedSlots}`);
            this._updateCapacity();
        } else {
            this._showToast(result.error || '扩容失败');
        }
    }

    /**
     * 使用点击
     */
    private _onUseClick(): void {
        if (!this._currentInstanceId || !this._currentItem) return;

        const result = inventoryManager.useItem(this._currentInstanceId, 1);
        if (result.success) {
            this._showToast('使用成功！');

            // 更新详情
            if (result.remainingCount <= 0) {
                this._hideDetailPanel();
            } else if (this._currentItem) {
                this._currentItem.count = result.remainingCount;
                if (this.itemCountLabel) {
                    this.itemCountLabel.string = `数量: ${result.remainingCount}`;
                }
            }

            this._updateItemList();
        } else {
            this._showToast(result.error || '使用失败');
        }
    }

    /**
     * 出售点击
     */
    private _onSellClick(): void {
        if (!this._currentInstanceId || !this._currentItem) return;

        const result = inventoryManager.sellItem(this._currentInstanceId, 1);
        if (result.success) {
            this._showToast(`出售成功！获得 ${result.amount} ${result.currency}`);
            this._hideDetailPanel();
            this._updateUI();
        } else {
            this._showToast(result.error || '出售失败');
        }
    }

    /**
     * 关闭点击
     */
    private _onCloseClick(): void {
        this.hide();
    }

    /**
     * 道具添加回调
     */
    private _onItemAdd(data: { itemId: string; count: number }): void {
        this._updateUI();
    }

    /**
     * 道具移除回调
     */
    private _onItemRemove(data: { instanceId: string }): void {
        if (data.instanceId === this._currentInstanceId) {
            this._hideDetailPanel();
        }
        this._updateUI();
    }

    /**
     * 道具更新回调
     */
    private _onItemUpdate(data: { instanceId: string; count: number }): void {
        this._updateUI();

        if (data.instanceId === this._currentInstanceId && this._currentItem) {
            this._currentItem.count = data.count;
            if (this.itemCountLabel) {
                this.itemCountLabel.string = `数量: ${data.count}`;
            }
        }
    }

    /**
     * 显示提示
     */
    private _showToast(message: string): void {
        console.log(`[InventoryPanel] ${message}`);
    }
}