/**
 * 招募面板
 * 显示抽卡招募功能、保底进度、招募记录
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Button, ProgressBar, Sprite, Color, Prefab, instantiate, ScrollView } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { gachaManager } from '../../gacha';
import { GachaPoolType, Rarity, GachaEventType, GachaPoolConfig, GachaResult } from '../../config/GachaTypes';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 稀有度颜色 */
const RARITY_COLORS: Record<Rarity, Color> = {
    [Rarity.COMMON]: new Color(150, 150, 150),      // 普通 - 灰色
    [Rarity.RARE]: new Color(30, 144, 255),         // 稀有 - 蓝色
    [Rarity.EPIC]: new Color(148, 0, 211),          // 史诗 - 紫色
    [Rarity.LEGENDARY]: new Color(255, 165, 0)      // 传说 - 橙色
};

/** 稀有度名称 */
const RARITY_NAMES: Record<Rarity, string> = {
    [Rarity.COMMON]: '普通',
    [Rarity.RARE]: '稀有',
    [Rarity.EPIC]: '史诗',
    [Rarity.LEGENDARY]: '传说'
};

@ccclass('GachaPanel')
export class GachaPanel extends UIPanel {
    // ==================== 招募池选择 ====================

    /** 招募池容器 */
    @property(Node)
    poolContainer: Node | null = null;

    /** 招募池按钮预制体 */
    @property(Prefab)
    poolButtonPrefab: Prefab | null = null;

    // ==================== 当前招募池信息 ====================

    /** 招募池名称 */
    @property(Label)
    poolNameLabel: Label | null = null;

    /** 招募池描述 */
    @property(Label)
    poolDescLabel: Label | null = null;

    /** 招募池图标 */
    @property(Sprite)
    poolIcon: Sprite | null = null;

    // ==================== 保底信息 ====================

    /** 保底进度条 */
    @property(ProgressBar)
    pityProgressBar: ProgressBar | null = null;

    /** 保底计数 */
    @property(Label)
    pityCountLabel: Label | null = null;

    /** 保底提示 */
    @property(Label)
    pityTipLabel: Label | null = null;

    // ==================== 消耗信息 ====================

    /** 单抽消耗 */
    @property(Label)
    singleCostLabel: Label | null = null;

    /** 十连消耗 */
    @property(Label)
    tenCostLabel: Label | null = null;

    // ==================== 按钮 ====================

    /** 单抽按钮 */
    @property(Button)
    singlePullButton: Button | null = null;

    /** 十连按钮 */
    @property(Button)
    tenPullButton: Button | null = null;

    /** 查看记录按钮 */
    @property(Button)
    recordButton: Button | null = null;

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    // ==================== 结果展示 ====================

    /** 结果面板 */
    @property(Node)
    resultPanel: Node | null = null;

    /** 结果容器 */
    @property(Node)
    resultContainer: Node | null = null;

    /** 结果项预制体 */
    @property(Prefab)
    resultItemPrefab: Prefab | null = null;

    /** 确认按钮 */
    @property(Button)
    confirmButton: Button | null = null;

    // ==================== 状态 ====================

    /** 当前选中的招募池ID */
    private _currentPoolId: string = '';

    /** 当前招募池配置 */
    private _currentPoolConfig: GachaPoolConfig | null = null;

    /** 上次抽卡结果 */
    private _lastResults: GachaResult[] = [];

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 2,
            cache: true,
            animationType: PanelAnimationType.SCALE,
            animationDuration: 0.3
        });
    }

    /**
     * 面板打开
     */
    protected onOpen(): void {
        this._bindEvents();
        this._initPools();
        this._updateUI();
    }

    /**
     * 面板关闭
     */
    protected onClose(): void {
        this._unbindEvents();
        this._hideResultPanel();
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(GachaEventType.PITY_TRIGGERED, this._onPityTriggered, this);
        EventCenter.on(GachaEventType.GET_RARE, this._onGetRare, this);

        this.singlePullButton?.node.on(Button.EventType.CLICK, this._onSinglePullClick, this);
        this.tenPullButton?.node.on(Button.EventType.CLICK, this._onTenPullClick, this);
        this.recordButton?.node.on(Button.EventType.CLICK, this._onRecordClick, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this._onCloseClick, this);
        this.confirmButton?.node.on(Button.EventType.CLICK, this._onConfirmClick, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(GachaEventType.PITY_TRIGGERED, this._onPityTriggered, this);
        EventCenter.off(GachaEventType.GET_RARE, this._onGetRare, this);
    }

    /**
     * 初始化招募池列表
     */
    private _initPools(): void {
        if (!this.poolContainer) return;

        this.poolContainer.removeAllChildren();

        const pools = gachaManager.getActivePools();
        if (pools.length === 0) {
            console.warn('[GachaPanel] 没有可用的招募池');
            return;
        }

        // 默认选中第一个池
        if (!this._currentPoolId && pools.length > 0) {
            this._currentPoolId = pools[0].poolId;
        }

        pools.forEach(pool => {
            const btnNode = this.poolButtonPrefab
                ? instantiate(this.poolButtonPrefab)
                : new Node(`Pool_${pool.poolId}`);

            const label = btnNode.getComponentInChildren(Label);
            if (label) {
                label.string = pool.name;
                label.color = pool.poolId === this._currentPoolId
                    ? new Color(255, 215, 0)
                    : new Color(255, 255, 255);
            }

            btnNode.on(Node.EventType.TOUCH_END, () => {
                this._selectPool(pool.poolId);
            });

            this.poolContainer.addChild(btnNode);
        });

        this._loadPoolConfig();
    }

    /**
     * 选择招募池
     */
    private _selectPool(poolId: string): void {
        if (this._currentPoolId === poolId) return;

        this._currentPoolId = poolId;
        this._initPools();
        this._updateUI();
    }

    /**
     * 加载招募池配置
     */
    private _loadPoolConfig(): void {
        const pools = gachaManager.getActivePools();
        this._currentPoolConfig = pools.find(p => p.poolId === this._currentPoolId) || null;
    }

    /**
     * 更新UI
     */
    private _updateUI(): void {
        if (!this._currentPoolConfig) return;

        // 更新招募池信息
        if (this.poolNameLabel) {
            this.poolNameLabel.string = this._currentPoolConfig.name;
        }

        if (this.poolDescLabel) {
            this.poolDescLabel.string = this._currentPoolConfig.description;
        }

        // 更新保底信息
        const pityCount = gachaManager.getPityCount(this._currentPoolId);
        const pityRemaining = gachaManager.getPityRemaining(this._currentPoolId);

        if (this.pityCountLabel) {
            this.pityCountLabel.string = `${pityCount}/${this._currentPoolConfig.pity.hardPity}`;
        }

        if (this.pityProgressBar) {
            this.pityProgressBar.progress = pityCount / this._currentPoolConfig.pity.hardPity;
        }

        if (this.pityTipLabel) {
            this.pityTipLabel.string = pityRemaining <= 10
                ? `距离保底还剩 ${pityRemaining} 抽！`
                : '';
            this.pityTipLabel.color = pityRemaining <= 10
                ? new Color(255, 165, 0)
                : new Color(255, 255, 255);
        }

        // 更新消耗
        const singleCost = gachaManager.getPullCost(this._currentPoolId, 1);
        const tenCost = gachaManager.getPullCost(this._currentPoolId, 10);

        if (this.singleCostLabel && singleCost) {
            this.singleCostLabel.string = `${singleCost.amount} ${this._getCurrencyName(singleCost.currency)}`;
        }

        if (this.tenCostLabel && tenCost) {
            this.tenCostLabel.string = `${tenCost.amount} ${this._getCurrencyName(tenCost.currency)}`;
        }
    }

    /**
     * 获取货币名称
     */
    private _getCurrencyName(currency: string): string {
        const names: Record<string, string> = {
            'gems': '钻石',
            'gold': '金币',
            'ticket_gacha': '招募券'
        };
        return names[currency] || currency;
    }

    /**
     * 单抽点击
     */
    private _onSinglePullClick(): void {
        const result = gachaManager.singlePull(this._currentPoolId);
        if (result.success) {
            this._lastResults = result.results;
            this._showResults(result.results);
            this._updateUI();
        } else {
            this._showToast(result.error || '招募失败');
        }
    }

    /**
     * 十连点击
     */
    private _onTenPullClick(): void {
        const result = gachaManager.tenPull(this._currentPoolId);
        if (result.success) {
            this._lastResults = result.results;
            this._showResults(result.results);
            this._updateUI();
        } else {
            this._showToast(result.error || '招募失败');
        }
    }

    /**
     * 查看记录点击
     */
    private _onRecordClick(): void {
        const records = gachaManager.getRecords(20);
        // 显示记录面板（简化实现）
        console.log('[GachaPanel] 招募记录:', records);
        this._showToast('招募记录功能开发中');
    }

    /**
     * 关闭点击
     */
    private _onCloseClick(): void {
        this.hide();
    }

    /**
     * 确认点击
     */
    private _onConfirmClick(): void {
        this._hideResultPanel();
    }

    /**
     * 显示抽卡结果
     */
    private _showResults(results: GachaResult[]): void {
        if (!this.resultPanel || !this.resultContainer) return;

        this.resultPanel.active = true;
        this.resultContainer.removeAllChildren();

        results.forEach((result, index) => {
            const itemNode = this.resultItemPrefab
                ? instantiate(this.resultItemPrefab)
                : new Node(`Result_${index}`);

            const nameLabel = itemNode.getChildByName('Name')?.getComponent(Label);
            if (nameLabel) {
                nameLabel.string = result.itemId;
                nameLabel.color = RARITY_COLORS[result.rarity];
            }

            const rarityLabel = itemNode.getChildByName('Rarity')?.getComponent(Label);
            if (rarityLabel) {
                rarityLabel.string = RARITY_NAMES[result.rarity];
                rarityLabel.color = RARITY_COLORS[result.rarity];
            }

            const countLabel = itemNode.getChildByName('Count')?.getComponent(Label);
            if (countLabel && result.amount > 1) {
                countLabel.string = `x${result.amount}`;
            }

            this.resultContainer.addChild(itemNode);
        });
    }

    /**
     * 隐藏结果面板
     */
    private _hideResultPanel(): void {
        if (this.resultPanel) {
            this.resultPanel.active = false;
        }
    }

    /**
     * 保底触发回调
     */
    private _onPityTriggered(data: any): void {
        this._showToast('触发保底！必得稀有物品！');
    }

    /**
     * 获得稀有物品回调
     */
    private _onGetRare(data: { rarity: Rarity; itemId: string }): void {
        this._showToast(`获得${RARITY_NAMES[data.rarity]}物品！`);
    }

    /**
     * 显示提示
     */
    private _showToast(message: string): void {
        console.log(`[GachaPanel] ${message}`);
    }
}