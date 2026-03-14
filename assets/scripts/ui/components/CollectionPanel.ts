/**
 * 图鉴面板
 * 显示英雄、兵种等收集进度和奖励领取
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Button, Sprite, Color, Prefab, instantiate, ScrollView, ProgressBar } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { collectionManager } from '../../collection';
import { CollectionType, CollectionState, CollectionEventType, CollectionEntryConfig, CollectionEntryData, CollectionProgressReward } from '../../config/CollectionTypes';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 收集条目（包含配置和数据） */
type CollectionEntryItem = { config: CollectionEntryConfig; data: CollectionEntryData };

/** 图鉴类型名称 */
const COLLECTION_TYPE_NAMES: Record<CollectionType, string> = {
    [CollectionType.HERO]: '英雄',
    [CollectionType.UNIT]: '兵种',
    [CollectionType.ITEM]: '物品',
    [CollectionType.SKILL]: '技能',
    [CollectionType.ACHIEVEMENT]: '成就',
    [CollectionType.SKIN]: '皮肤',
    [CollectionType.TITLE]: '称号'
};

/** 收集状态颜色 */
const STATE_COLORS: Record<CollectionState, Color> = {
    [CollectionState.LOCKED]: new Color(100, 100, 100),       // 灰色
    [CollectionState.UNLOCKED]: new Color(200, 200, 200),     // 浅灰
    [CollectionState.COLLECTED]: new Color(50, 205, 50),      // 绿色
    [CollectionState.MAX_LEVEL]: new Color(255, 215, 0)       // 金色
};

@ccclass('CollectionPanel')
export class CollectionPanel extends UIPanel {
    // ==================== 分类标签 ====================

    /** 分类容器 */
    @property(Node)
    categoryContainer: Node | null = null;

    /** 分类按钮预制体 */
    @property(Prefab)
    categoryButtonPrefab: Prefab | null = null;

    // ==================== 统计信息 ====================

    /** 总进度条 */
    @property(ProgressBar)
    totalProgressBar: ProgressBar | null = null;

    /** 总进度标签 */
    @property(Label)
    totalProgressLabel: Label | null = null;

    /** 已收集数量 */
    @property(Label)
    collectedCountLabel: Label | null = null;

    // ==================== 条目列表 ====================

    /** 条目滚动视图 */
    @property(ScrollView)
    entryScrollView: ScrollView | null = null;

    /** 条目容器 */
    @property(Node)
    entryContainer: Node | null = null;

    /** 条目预制体 */
    @property(Prefab)
    entryPrefab: Prefab | null = null;

    // ==================== 进度奖励 ====================

    /** 进度奖励容器 */
    @property(Node)
    progressRewardContainer: Node | null = null;

    /** 进度奖励预制体 */
    @property(Prefab)
    progressRewardPrefab: Prefab | null = null;

    // ==================== 详情面板 ====================

    /** 详情面板 */
    @property(Node)
    detailPanel: Node | null = null;

    /** 详情图标 */
    @property(Sprite)
    detailIcon: Sprite | null = null;

    /** 详情名称 */
    @property(Label)
    detailNameLabel: Label | null = null;

    /** 详情描述 */
    @property(Label)
    detailDescLabel: Label | null = null;

    /** 碎片进度条 */
    @property(ProgressBar)
    shardProgressBar: ProgressBar | null = null;

    /** 碎片数量 */
    @property(Label)
    shardCountLabel: Label | null = null;

    /** 收集按钮 */
    @property(Button)
    collectButton: Button | null = null;

    // ==================== 按钮 ====================

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    // ==================== 状态 ====================

    /** 当前选中的类型 */
    private _currentType: CollectionType = CollectionType.HERO;

    /** 当前选中的条目 */
    private _currentEntryId: string = '';

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
        EventCenter.on(CollectionEventType.ENTRY_COLLECTED, this._onEntryCollected, this);
        EventCenter.on(CollectionEventType.PROGRESS_REACHED, this._onProgressReached, this);
        EventCenter.on(CollectionEventType.SHARD_ADDED, this._onShardAdded, this);

        this.collectButton?.node.on(Button.EventType.CLICK, this._onCollectClick, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this._onCloseClick, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(CollectionEventType.ENTRY_COLLECTED, this._onEntryCollected, this);
        EventCenter.off(CollectionEventType.PROGRESS_REACHED, this._onProgressReached, this);
        EventCenter.off(CollectionEventType.SHARD_ADDED, this._onShardAdded, this);
    }

    /**
     * 初始化分类
     */
    private _initCategories(): void {
        if (!this.categoryContainer) return;

        this.categoryContainer.removeAllChildren();

        const types = [CollectionType.HERO, CollectionType.UNIT];

        types.forEach(type => {
            const btnNode = this.categoryButtonPrefab
                ? instantiate(this.categoryButtonPrefab)
                : new Node(`Category_${type}`);

            const label = btnNode.getComponentInChildren(Label);
            if (label) {
                label.string = COLLECTION_TYPE_NAMES[type];
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
     * 选择类型
     */
    private _selectType(type: CollectionType): void {
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
        this._updateStats();
        this._updateEntries();
        this._updateProgressRewards();
    }

    /**
     * 更新统计信息
     */
    private _updateStats(): void {
        const stats = collectionManager.getStats(this._currentType);

        if (this.totalProgressBar) {
            this.totalProgressBar.progress = stats.completionRate / 100;
        }

        if (this.totalProgressLabel) {
            this.totalProgressLabel.string = `${stats.completionRate.toFixed(1)}%`;
        }

        if (this.collectedCountLabel) {
            this.collectedCountLabel.string = `${stats.collected}/${stats.total}`;
        }
    }

    /**
     * 更新条目列表
     */
    private _updateEntries(): void {
        if (!this.entryContainer) return;

        this.entryContainer.removeAllChildren();

        const entries = collectionManager.getEntriesByType(this._currentType);

        entries.forEach((entry, index) => {
            const entryNode = this.entryPrefab
                ? instantiate(this.entryPrefab)
                : new Node(`Entry_${entry.config.id}`);

            entryNode.setPosition(0, -index * 80, 0);

            // 设置名称
            const nameLabel = entryNode.getChildByName('Name')?.getComponent(Label);
            if (nameLabel) {
                nameLabel.string = entry.config.name;
                nameLabel.color = STATE_COLORS[entry.data.state];
            }

            // 设置状态
            const stateLabel = entryNode.getChildByName('State')?.getComponent(Label);
            if (stateLabel) {
                stateLabel.string = this._getStateText(entry.data.state);
                stateLabel.color = STATE_COLORS[entry.data.state];
            }

            // 设置碎片进度
            const shardLabel = entryNode.getChildByName('Shards')?.getComponent(Label);
            if (shardLabel) {
                if (entry.data.state === CollectionState.COLLECTED) {
                    shardLabel.string = '已收集';
                } else {
                    shardLabel.string = `${entry.data.shards}/${entry.config.shardRequired}`;
                }
            }

            // 点击显示详情
            entryNode.on(Node.EventType.TOUCH_END, () => {
                this._showEntryDetail(entry);
            });

            this.entryContainer.addChild(entryNode);
        });
    }

    /**
     * 获取状态文本
     */
    private _getStateText(state: CollectionState): string {
        const texts: Record<CollectionState, string> = {
            [CollectionState.LOCKED]: '未解锁',
            [CollectionState.UNLOCKED]: '碎片收集中',
            [CollectionState.COLLECTED]: '已收集',
            [CollectionState.MAX_LEVEL]: '已满级'
        };
        return texts[state];
    }

    /**
     * 更新进度奖励
     */
    private _updateProgressRewards(): void {
        if (!this.progressRewardContainer) return;

        this.progressRewardContainer.removeAllChildren();

        const claimableRewards = collectionManager.getClaimableRewards();

        // 获取当前类型的进度奖励配置
        const progressConfigs = this._getProgressRewardConfigs();

        progressConfigs.forEach(config => {
            const rewardNode = this.progressRewardPrefab
                ? instantiate(this.progressRewardPrefab)
                : new Node(`Progress_${config.count}`);

            const countLabel = rewardNode.getChildByName('Count')?.getComponent(Label);
            if (countLabel) {
                countLabel.string = `${config.count}个`;
            }

            const rewardLabel = rewardNode.getChildByName('Reward')?.getComponent(Label);
            if (rewardLabel) {
                rewardLabel.string = this._formatReward(config.rewards);
            }

            const claimBtn = rewardNode.getChildByName('ClaimBtn')?.getComponent(Button);
            if (claimBtn) {
                const isClaimable = claimableRewards.some(r => r.rewardId === config.rewardId);
                claimBtn.interactable = isClaimable;
                claimBtn.node.on(Button.EventType.CLICK, () => {
                    this._claimProgressReward(config.rewardId);
                });
            }

            this.progressRewardContainer.addChild(rewardNode);
        });
    }

    /**
     * 获取进度奖励配置
     */
    private _getProgressRewardConfigs(): CollectionProgressReward[] {
        // 从配置中获取
        return [
            { rewardId: 'progress_1', id: 'progress_1', type: this._currentType, requiredCount: 5, count: 5, rewards: [{ type: 'gems', itemId: 'gems', amount: 100 }] },
            { rewardId: 'progress_2', id: 'progress_2', type: this._currentType, requiredCount: 10, count: 10, rewards: [{ type: 'gems', itemId: 'gems', amount: 200 }] },
            { rewardId: 'progress_3', id: 'progress_3', type: this._currentType, requiredCount: 20, count: 20, rewards: [{ type: 'gems', itemId: 'gems', amount: 500 }] }
        ];
    }

    /**
     * 格式化奖励
     */
    private _formatReward(rewards: { type: string; amount: number }[]): string {
        return rewards.map(r => `${r.type} x${r.amount}`).join(', ');
    }

    /**
     * 显示条目详情
     */
    private _showEntryDetail(entry: { config: CollectionEntryConfig; data: CollectionEntryData }): void {
        if (!this.detailPanel) return;

        this._currentEntryId = entry.config.entryId;
        this.detailPanel.active = true;

        if (this.detailNameLabel) {
            this.detailNameLabel.string = entry.config.name;
        }

        if (this.detailDescLabel) {
            this.detailDescLabel.string = entry.config.description;
        }

        if (this.shardProgressBar) {
            const progress = entry.data.shards / entry.config.shardRequired;
            this.shardProgressBar.progress = progress;
        }

        if (this.shardCountLabel) {
            this.shardCountLabel.string = `${entry.data.shards}/${entry.config.shardRequired}`;
        }

        if (this.collectButton) {
            this.collectButton.interactable = entry.data.state === CollectionState.UNLOCKED &&
                entry.data.shards >= entry.config.shardRequired;
        }
    }

    /**
     * 隐藏详情面板
     */
    private _hideDetailPanel(): void {
        if (this.detailPanel) {
            this.detailPanel.active = false;
        }
        this._currentEntryId = '';
    }

    /**
     * 收集点击
     */
    private _onCollectClick(): void {
        if (!this._currentEntryId) return;

        const success = collectionManager.collect(this._currentEntryId);
        if (success) {
            this._showToast('收集成功！');
            this._updateUI();
            this._hideDetailPanel();
        } else {
            this._showToast('收集失败');
        }
    }

    /**
     * 关闭点击
     */
    private _onCloseClick(): void {
        this.hide();
    }

    /**
     * 领取进度奖励
     */
    private _claimProgressReward(rewardId: string): void {
        const result = collectionManager.claimProgressReward(rewardId);
        if (result.success) {
            this._showToast('领取成功！');
            this._updateProgressRewards();
        } else {
            this._showToast(result.error || '领取失败');
        }
    }

    /**
     * 条目收集回调
     */
    private _onEntryCollected(data: { entryId: string }): void {
        this._updateUI();
    }

    /**
     * 进度达成回调
     */
    private _onProgressReached(data: { type: CollectionType; count: number }): void {
        if (data.type === this._currentType) {
            this._updateProgressRewards();
        }
        this._showToast(`达成收集进度：${data.count}个！`);
    }

    /**
     * 碎片添加回调
     */
    private _onShardAdded(data: { entryId: string; shards: number }): void {
        if (data.entryId === this._currentEntryId) {
            this._updateEntries();
        }
    }

    /**
     * 显示提示
     */
    private _showToast(message: string): void {
        console.log(`[CollectionPanel] ${message}`);
    }
}