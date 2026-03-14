/**
 * 成就面板
 * 显示成就进度、奖励领取
 */

import { _decorator, Node, Label, Sprite, SpriteFrame, Prefab, instantiate, ScrollView, Vec3, ProgressBar, Color } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { achievementManager, AchievementEventType, AchievementProgress } from '../../achievement';
import { AchievementConfig, AchievementType, AchievementRarity } from '../../config/AchievementTypes';
import { AchievementConfigMap, AllAchievements } from '../../config/achievements.json';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 稀有度颜色 */
const RARITY_COLORS: Record<AchievementRarity, Color> = {
    [AchievementRarity.COMMON]: new Color(255, 255, 255),
    [AchievementRarity.RARE]: new Color(0, 150, 255),
    [AchievementRarity.EPIC]: new Color(180, 0, 255),
    [AchievementRarity.LEGENDARY]: new Color(255, 180, 0)
};

/** 稀有度名称 */
const RARITY_NAMES: Record<AchievementRarity, string> = {
    [AchievementRarity.COMMON]: '普通',
    [AchievementRarity.RARE]: '稀有',
    [AchievementRarity.EPIC]: '史诗',
    [AchievementRarity.LEGENDARY]: '传说'
};

/** 类型名称 */
const TYPE_NAMES: Record<AchievementType, string> = {
    [AchievementType.BATTLE]: '战斗',
    [AchievementType.COLLECTION]: '收集',
    [AchievementType.PROGRESS]: '进度',
    [AchievementType.SOCIAL]: '社交',
    [AchievementType.SPECIAL]: '特殊'
};

/**
 * 成就面板
 */
@ccclass('AchievementPanel')
export class AchievementPanel extends UIPanel {
    // ==================== 顶部信息 ====================

    /** 完成进度标签 */
    @property(Label)
    completionLabel: Label | null = null;

    /** 完成进度条 */
    @property(ProgressBar)
    completionBar: ProgressBar | null = null;

    // ==================== 分类标签 ====================

    /** 分类按钮容器 */
    @property(Node)
    categoryContainer: Node | null = null;

    /** 分类按钮预制体 */
    @property(Prefab)
    categoryButtonPrefab: Prefab | null = null;

    // ==================== 成就列表 ====================

    /** 成就列表滚动视图 */
    @property(ScrollView)
    achievementScrollView: ScrollView | null = null;

    /** 成就列表内容 */
    @property(Node)
    achievementContent: Node | null = null;

    /** 成就项预制体 */
    @property(Prefab)
    achievementItemPrefab: Prefab | null = null;

    // ==================== 详情区域 ====================

    /** 详情面板 */
    @property(Node)
    detailPanel: Node | null = null;

    /** 详情标题 */
    @property(Label)
    detailTitle: Label | null = null;

    /** 详情描述 */
    @property(Label)
    detailDescription: Label | null = null;

    /** 详情进度 */
    @property(Label)
    detailProgress: Label | null = null;

    /** 详情奖励 */
    @property(Label)
    detailReward: Label | null = null;

    /** 领取按钮 */
    @property(Node)
    claimButton: Node | null = null;

    /** 关闭按钮 */
    @property(Node)
    closeButton: Node | null = null;

    // ==================== 状态 ====================

    /** 当前选中的分类 */
    private _currentCategory: AchievementType = AchievementType.BATTLE;

    /** 当前选中的成就ID */
    private _selectedAchievementId: string | null = null;

    /** 成就项节点列表 */
    private _itemNodes: Node[] = [];

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
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);

        this._updateCompletionInfo();
        this._setupCategories();
        this._updateAchievementList();
        this._setupButtons();
        this._bindEvents();
    }

    /**
     * 更新完成信息
     */
    private _updateCompletionInfo(): void {
        const { completed, total, percentage } = achievementManager.getCompletionRate();

        if (this.completionLabel) {
            this.completionLabel.string = `成就进度: ${completed}/${total}`;
        }

        if (this.completionBar) {
            this.completionBar.progress = percentage / 100;
        }
    }

    /**
     * 设置分类按钮
     */
    private _setupCategories(): void {
        const container = this.categoryContainer;
        if (!container) return;

        // 清空现有按钮
        container.removeAllChildren();

        const categories = Object.values(AchievementType);

        categories.forEach(type => {
            const buttonNode = this.categoryButtonPrefab
                ? instantiate(this.categoryButtonPrefab)
                : new Node(`Category_${type}`);

            const label = buttonNode.getComponentInChildren(Label);
            if (label) {
                label.string = TYPE_NAMES[type];
            }

            buttonNode.on(Node.EventType.TOUCH_END, () => {
                this._selectCategory(type);
            });

            container.addChild(buttonNode);
        });
    }

    /**
     * 选择分类
     */
    private _selectCategory(type: AchievementType): void {
        this._currentCategory = type;
        this._updateAchievementList();
    }

    /**
     * 更新成就列表
     */
    private _updateAchievementList(): void {
        if (!this.achievementContent) return;

        // 清空现有项
        this._itemNodes.forEach(node => node.destroy());
        this._itemNodes = [];

        // 获取当前分类的成就
        const achievements = AllAchievements.filter(
            config => config.type === this._currentCategory
        );

        achievements.forEach((config, index) => {
            const itemNode = this._createAchievementItem(config, index);
            this._itemNodes.push(itemNode);
        });
    }

    /**
     * 创建成就项
     */
    private _createAchievementItem(config: AchievementConfig, index: number): Node {
        const itemNode = this.achievementItemPrefab
            ? instantiate(this.achievementItemPrefab)
            : new Node(`Achievement_${config.id}`);

        itemNode.setPosition(new Vec3(0, -index * 80, 0));
        this.achievementContent!.addChild(itemNode);

        // 获取进度
        const progress = achievementManager.getProgress(config.id);

        // 设置名称
        const nameLabel = itemNode.getChildByName('Name')?.getComponent(Label);
        if (nameLabel) {
            nameLabel.string = config.name;
            nameLabel.color = RARITY_COLORS[config.rarity];
        }

        // 设置描述
        const descLabel = itemNode.getChildByName('Description')?.getComponent(Label);
        if (descLabel) {
            descLabel.string = config.description;
        }

        // 设置进度
        const progressLabel = itemNode.getChildByName('Progress')?.getComponent(Label);
        if (progressLabel && progress) {
            const condition = progress.conditions[0];
            const current = condition.current || 0;
            const target = condition.target;
            progressLabel.string = `${current}/${target}`;
        }

        // 设置进度条
        const progressBar = itemNode.getChildByName('ProgressBar')?.getComponent(ProgressBar);
        if (progressBar && progress) {
            const condition = progress.conditions[0];
            const current = condition.current || 0;
            const target = condition.target;
            progressBar.progress = Math.min(current / target, 1);
        }

        // 设置状态
        const statusNode = itemNode.getChildByName('Status');
        if (statusNode && progress) {
            statusNode.active = progress.completed;
            if (progress.claimed) {
                statusNode.active = true;
                // 显示已领取图标
            }
        }

        // 设置稀有度标签
        const rarityLabel = itemNode.getChildByName('Rarity')?.getComponent(Label);
        if (rarityLabel) {
            rarityLabel.string = RARITY_NAMES[config.rarity];
            rarityLabel.color = RARITY_COLORS[config.rarity];
        }

        // 点击事件
        itemNode.on(Node.EventType.TOUCH_END, () => {
            this._selectAchievement(config.id);
        });

        return itemNode;
    }

    /**
     * 选择成就
     */
    private _selectAchievement(achievementId: string): void {
        this._selectedAchievementId = achievementId;

        const config = AchievementConfigMap.get(achievementId);
        const progress = achievementManager.getProgress(achievementId);

        if (!config || !progress) return;

        // 显示详情
        if (this.detailPanel) {
            this.detailPanel.active = true;
        }

        if (this.detailTitle) {
            this.detailTitle.string = config.name;
            this.detailTitle.color = RARITY_COLORS[config.rarity];
        }

        if (this.detailDescription) {
            this.detailDescription.string = config.description;
        }

        if (this.detailProgress) {
            const condition = progress.conditions[0];
            const current = condition.current || 0;
            const target = condition.target;
            this.detailProgress.string = `进度: ${current}/${target}`;
        }

        if (this.detailReward) {
            const rewardParts: string[] = [];
            if (config.reward.gold) rewardParts.push(`金币 x${config.reward.gold}`);
            if (config.reward.gems) rewardParts.push(`钻石 x${config.reward.gems}`);
            this.detailReward.string = `奖励: ${rewardParts.join(', ')}`;
        }

        // 更新领取按钮状态
        if (this.claimButton) {
            const button = this.claimButton.getComponent(UIButton);
            if (button) {
                button.setEnabled(progress.completed && !progress.claimed);
                if (progress.claimed) {
                    button.setLabel('已领取');
                } else if (progress.completed) {
                    button.setLabel('领取奖励');
                } else {
                    button.setLabel('未完成');
                }
            }
        }
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        // 领取按钮
        if (this.claimButton) {
            const btn = this.claimButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onClaim.bind(this));
            } else {
                this.claimButton.on(Node.EventType.TOUCH_END, this._onClaim, this);
            }
        }

        // 关闭按钮
        if (this.closeButton) {
            const btn = this.closeButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(() => this.hide());
            } else {
                this.closeButton.on(Node.EventType.TOUCH_END, () => this.hide(), this);
            }
        }
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(AchievementEventType.COMPLETED, this._onAchievementCompleted, this);
        EventCenter.on(AchievementEventType.CLAIMED, this._onAchievementClaimed, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(AchievementEventType.COMPLETED, this._onAchievementCompleted, this);
        EventCenter.off(AchievementEventType.CLAIMED, this._onAchievementClaimed, this);
    }

    /**
     * 成就完成回调
     */
    private _onAchievementCompleted(data: { achievementId: string }): void {
        this._updateCompletionInfo();
        this._updateAchievementList();

        if (this._selectedAchievementId === data.achievementId) {
            this._selectAchievement(data.achievementId);
        }
    }

    /**
     * 成就领取回调
     */
    private _onAchievementClaimed(data: { achievementId: string }): void {
        this._updateAchievementList();

        if (this._selectedAchievementId === data.achievementId) {
            this._selectAchievement(data.achievementId);
        }
    }

    /**
     * 领取奖励
     */
    private _onClaim(): void {
        if (!this._selectedAchievementId) return;

        const reward = achievementManager.claimReward(this._selectedAchievementId);
        if (reward) {
            // 显示获得奖励的提示
            console.log('[AchievementPanel] Claimed reward:', reward);

            // 更新UI
            this._selectAchievement(this._selectedAchievementId);
        }
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();
        this._unbindEvents();

        // 隐藏详情面板
        if (this.detailPanel) {
            this.detailPanel.active = false;
        }
    }
}