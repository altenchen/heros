/**
 * 排行榜面板
 * 显示各类排行榜数据、个人排名、奖励领取
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Sprite, SpriteFrame, Prefab, instantiate, ScrollView, Vec3, Color } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { rankManager, RankEventType } from '../../rank';
import { RankType, RankPeriod, RankEntry, RankConfig } from '../../config/RankTypes';
import { rankConfigs, getRankReward } from '../../../configs/rank.json';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 排行榜类型名称 */
const RANK_TYPE_NAMES: Record<RankType, string> = {
    [RankType.POWER]: '战力榜',
    [RankType.PVP]: '竞技榜',
    [RankType.STARS]: '星数榜',
    [RankType.GUILD]: '公会榜',
    [RankType.HERO_POWER]: '英雄榜'
};

/** 排名颜色 */
const RANK_COLORS: { [rank: number]: Color } = {
    1: new Color(255, 215, 0),   // 金色
    2: new Color(192, 192, 192), // 银色
    3: new Color(205, 127, 50)   // 铜色
};

/** 默认颜色 */
const DEFAULT_COLOR = new Color(255, 255, 255);

/**
 * 排行榜面板
 */
@ccclass('RankPanel')
export class RankPanel extends UIPanel {
    // ==================== 顶部信息 ====================

    /** 标题标签 */
    @property(Label)
    titleLabel: Label | null = null;

    /** 周期标签 */
    @property(Label)
    periodLabel: Label | null = null;

    // ==================== 分类标签 ====================

    /** 分类按钮容器 */
    @property(Node)
    categoryContainer: Node | null = null;

    /** 分类按钮预制体 */
    @property(Prefab)
    categoryButtonPrefab: Prefab | null = null;

    // ==================== 排行榜列表 ====================

    /** 排行榜滚动视图 */
    @property(ScrollView)
    rankScrollView: ScrollView | null = null;

    /** 排行榜内容 */
    @property(Node)
    rankContent: Node | null = null;

    /** 排行项预制体 */
    @property(Prefab)
    rankItemPrefab: Prefab | null = null;

    // ==================== 我的排名 ====================

    /** 我的排名容器 */
    @property(Node)
    myRankContainer: Node | null = null;

    /** 我的排名标签 */
    @property(Label)
    myRankLabel: Label | null = null;

    /** 我的分数标签 */
    @property(Label)
    myScoreLabel: Label | null = null;

    /** 排名变化标签 */
    @property(Label)
    myRankChangeLabel: Label | null = null;

    // ==================== 详情区域 ====================

    /** 奖励预览面板 */
    @property(Node)
    rewardPreviewPanel: Node | null = null;

    /** 奖励列表容器 */
    @property(Node)
    rewardListContainer: Node | null = null;

    // ==================== 按钮 ====================

    /** 关闭按钮 */
    @property(Node)
    closeButton: Node | null = null;

    /** 刷新按钮 */
    @property(Node)
    refreshButton: Node | null = null;

    // ==================== 状态 ====================

    /** 当前选中的排行榜类型 */
    private _currentType: RankType = RankType.POWER;

    /** 当前周期 */
    private _currentPeriod: RankPeriod = RankPeriod.WEEKLY;

    /** 排行项节点列表 */
    private _itemNodes: Node[] = [];

    /** 当前玩家ID（模拟） */
    private _playerId: string = 'player_1';

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
     * 显示回调
     */
    protected onShow(data?: { type?: RankType; playerId?: string }): void {
        super.onShow(data);

        if (data?.type) {
            this._currentType = data.type;
        }

        if (data?.playerId) {
            this._playerId = data.playerId;
        }

        this._setupCategories();
        this._updateRankList();
        this._updateMyRank();
        this._setupButtons();
        this._bindEvents();

        // 模拟数据（开发阶段）
        this._loadMockData();
    }

    /**
     * 加载模拟数据
     */
    private _loadMockData(): void {
        // 模拟排行榜数据
        const mockEntries: RankEntry[] = [];
        const names = ['勇者阿尔法', '魔法师贝塔', '战士伽马', '德鲁伊德尔塔', '游侠艾普西龙',
            '圣骑士泽塔', '死灵法师艾塔', '龙骑士西塔', '元素使约塔', '刺客卡帕'];

        for (let i = 0; i < 20; i++) {
            mockEntries.push({
                playerId: `player_${i + 1}`,
                playerName: names[i % names.length] + (i >= 10 ? (i + 1) : ''),
                score: 100000 - i * 4000 + Math.floor(Math.random() * 1000),
                rank: i + 1,
                extra: {
                    power: 100000 - i * 4000,
                    wins: Math.floor(Math.random() * 100)
                },
                updateTime: Date.now()
            });
        }

        rankManager.batchUpdate(this._currentType, this._currentPeriod, mockEntries);

        // 更新显示
        this._updateRankList();
        this._updateMyRank();
    }

    /**
     * 设置分类按钮
     */
    private _setupCategories(): void {
        if (!this.categoryContainer) return;

        // 清空现有按钮
        this.categoryContainer.removeAllChildren();

        const types = Object.values(RankType);

        types.forEach(type => {
            const buttonNode = this.categoryButtonPrefab
                ? instantiate(this.categoryButtonPrefab)
                : new Node(`Category_${type}`);

            const label = buttonNode.getComponentInChildren(Label);
            if (label) {
                label.string = RANK_TYPE_NAMES[type];
                // 高亮当前选中
                if (type === this._currentType) {
                    label.color = new Color(255, 215, 0);
                }
            }

            buttonNode.on(Node.EventType.TOUCH_END, () => {
                this._selectType(type);
            });

            this.categoryContainer.addChild(buttonNode);
        });
    }

    /**
     * 选择排行榜类型
     */
    private _selectType(type: RankType): void {
        if (this._currentType === type) return;

        this._currentType = type;

        // 更新分类按钮高亮
        this._setupCategories();

        // 重新加载模拟数据
        this._loadMockData();
    }

    /**
     * 更新排行榜列表
     */
    private _updateRankList(): void {
        if (!this.rankContent) return;

        // 清空现有项
        this._itemNodes.forEach(node => node.destroy());
        this._itemNodes = [];

        // 获取排行榜数据
        const ranking = rankManager.getRanking(this._currentType, this._currentPeriod, 100);

        if (ranking.length === 0) {
            // 显示空状态
            const emptyNode = new Node('EmptyState');
            const emptyLabel = emptyNode.addComponent(Label);
            emptyLabel.string = '暂无排行数据';
            emptyLabel.fontSize = 24;
            emptyLabel.color = new Color(150, 150, 150);
            emptyNode.setPosition(new Vec3(0, 0, 0));
            this.rankContent.addChild(emptyNode);
            this._itemNodes.push(emptyNode);
            return;
        }

        ranking.forEach((entry, index) => {
            const itemNode = this._createRankItem(entry, index);
            this._itemNodes.push(itemNode);
        });

        // 更新标题
        if (this.titleLabel) {
            this.titleLabel.string = RANK_TYPE_NAMES[this._currentType];
        }

        if (this.periodLabel) {
            this.periodLabel.string = '本周排行';
        }
    }

    /**
     * 创建排行项
     */
    private _createRankItem(entry: RankEntry, index: number): Node {
        const itemNode = this.rankItemPrefab
            ? instantiate(this.rankItemPrefab)
            : new Node(`Rank_${entry.rank}`);

        itemNode.setPosition(new Vec3(0, -index * 60, 0));
        this.rankContent!.addChild(itemNode);

        // 设置排名
        const rankLabel = itemNode.getChildByName('Rank')?.getComponent(Label);
        if (rankLabel) {
            rankLabel.string = entry.rank.toString();
            rankLabel.color = RANK_COLORS[entry.rank] || DEFAULT_COLOR;

            // 前三名特殊图标
            if (entry.rank <= 3) {
                // 可以替换为奖杯图标
            }
        }

        // 设置名称
        const nameLabel = itemNode.getChildByName('Name')?.getComponent(Label);
        if (nameLabel) {
            nameLabel.string = entry.playerName;
        }

        // 设置分数
        const scoreLabel = itemNode.getChildByName('Score')?.getComponent(Label);
        if (scoreLabel) {
            scoreLabel.string = this._formatScore(entry.score);
        }

        // 设置额外信息
        const extraLabel = itemNode.getChildByName('Extra')?.getComponent(Label);
        if (extraLabel && entry.extra) {
            const extraParts: string[] = [];
            if (entry.extra.power) extraParts.push(`战力: ${entry.extra.power}`);
            if (entry.extra.wins) extraParts.push(`胜场: ${entry.extra.wins}`);
            extraLabel.string = extraParts.join(' | ');
        }

        // 高亮自己
        if (entry.playerId === this._playerId) {
            // 设置高亮背景
            const bgNode = itemNode.getChildByName('Background');
            if (bgNode) {
                const sprite = bgNode.getComponent(Sprite);
                if (sprite) {
                    sprite.color = new Color(50, 100, 50, 150);
                }
            }
        }

        // 点击查看详情
        itemNode.on(Node.EventType.TOUCH_END, () => {
            this._showPlayerDetail(entry);
        });

        return itemNode;
    }

    /**
     * 更新我的排名
     */
    private _updateMyRank(): void {
        const playerRank = rankManager.getPlayerRank(this._playerId, this._currentType, this._currentPeriod);
        const entry = rankManager.getPlayerEntry(this._playerId, this._currentType, this._currentPeriod);

        if (!this.myRankContainer) return;

        if (!playerRank || !entry) {
            this.myRankContainer.active = false;
            return;
        }

        this.myRankContainer.active = true;

        if (this.myRankLabel) {
            this.myRankLabel.string = `第 ${playerRank.rank} 名`;
            this.myRankLabel.color = RANK_COLORS[playerRank.rank] || DEFAULT_COLOR;
        }

        if (this.myScoreLabel) {
            this.myScoreLabel.string = this._formatScore(playerRank.score);
        }

        if (this.myRankChangeLabel) {
            if (playerRank.rankChange > 0) {
                this.myRankChangeLabel.string = `↑${playerRank.rankChange}`;
                this.myRankChangeLabel.color = new Color(0, 255, 0);
            } else if (playerRank.rankChange < 0) {
                this.myRankChangeLabel.string = `↓${Math.abs(playerRank.rankChange)}`;
                this.myRankChangeLabel.color = new Color(255, 0, 0);
            } else {
                this.myRankChangeLabel.string = '-';
                this.myRankChangeLabel.color = DEFAULT_COLOR;
            }
        }
    }

    /**
     * 显示玩家详情
     */
    private _showPlayerDetail(entry: RankEntry): void {
        // 显示奖励预览
        if (this.rewardPreviewPanel) {
            this.rewardPreviewPanel.active = true;
        }

        if (this.rewardListContainer) {
            this.rewardListContainer.removeAllChildren();

            const rewardConfig = getRankReward(entry.rank, this._currentType);
            if (rewardConfig) {
                rewardConfig.rewards.forEach(reward => {
                    const rewardNode = new Node(`Reward_${reward.type}`);
                    const label = rewardNode.addComponent(Label);
                    label.string = this._formatReward(reward.type, reward.amount, reward.itemId);
                    label.fontSize = 20;
                    this.rewardListContainer.addChild(rewardNode);
                });
            }
        }
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        // 关闭按钮
        if (this.closeButton) {
            const btn = this.closeButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(() => this.hide());
            } else {
                this.closeButton.on(Node.EventType.TOUCH_END, () => this.hide(), this);
            }
        }

        // 刷新按钮
        if (this.refreshButton) {
            const btn = this.refreshButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(() => {
                    this._loadMockData();
                });
            } else {
                this.refreshButton.on(Node.EventType.TOUCH_END, () => {
                    this._loadMockData();
                }, this);
            }
        }
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(RankEventType.RANK_UPDATED, this._onRankUpdated, this);
        EventCenter.on(RankEventType.RANK_CHANGED, this._onRankChanged, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(RankEventType.RANK_UPDATED, this._onRankUpdated, this);
        EventCenter.off(RankEventType.RANK_CHANGED, this._onRankChanged, this);
    }

    /**
     * 排名更新回调
     */
    private _onRankUpdated(data: { type: RankType }): void {
        if (data.type === this._currentType) {
            this._updateRankList();
            this._updateMyRank();
        }
    }

    /**
     * 排名变化回调
     */
    private _onRankChanged(data: { type: RankType; playerId: string; rankChange: number }): void {
        if (data.type !== this._currentType) return;

        // 显示排名变化提示
        if (data.playerId === this._playerId && data.rankChange !== 0) {
            const direction = data.rankChange > 0 ? '上升' : '下降';
            console.log(`[RankPanel] 排名${direction} ${Math.abs(data.rankChange)} 名`);
        }
    }

    /**
     * 格式化分数
     */
    private _formatScore(score: number): string {
        if (score >= 10000) {
            return `${(score / 10000).toFixed(1)}万`;
        }
        return score.toString();
    }

    /**
     * 格式化奖励
     */
    private _formatReward(type: string, amount: number, itemId?: string): string {
        const typeNames: Record<string, string> = {
            'gems': '钻石',
            'gold': '金币',
            'item': '道具'
        };

        const name = typeNames[type] || type;
        return `${name} x${amount}`;
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();
        this._unbindEvents();

        if (this.rewardPreviewPanel) {
            this.rewardPreviewPanel.active = false;
        }
    }
}