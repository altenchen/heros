/**
 * 战斗结果结算面板
 * 显示战斗结果、奖励、星级评价和统计数据
 */

import { _decorator, Node, Label, Sprite, SpriteFrame, Prefab, instantiate, Graphics, Color, Vec3, tween, UIOpacity } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { Game } from '../../Game';
import { UIManager } from '../UIManager';
import { EventCenter, GameEvent } from '../../utils/EventTarget';
import { StarRating, LevelChallengeResult, LevelRewardItems } from '../../config/LevelTypes';
import { LevelBattleEventType, LevelBattleEventData } from '../../level/LevelBattleBridge';

const { ccclass, property } = _decorator;

/**
 * 战斗结果数据
 */
export interface BattleResultData {
    /** 是否胜利 */
    victory: boolean;
    /** 关卡ID */
    levelId?: string;
    /** 关卡名称 */
    levelName?: string;
    /** 获得星级 */
    stars: StarRating;
    /** 是否首次通关 */
    firstClear: boolean;
    /** 获得奖励 */
    rewards: LevelRewardItems;
    /** 战斗统计 */
    statistics: {
        turns: number;
        totalDamage: number;
        totalHeal: number;
        deathCount: number;
        skillCount: number;
    };
}

/**
 * 战斗结果结算面板
 */
@ccclass('BattleResultPanel')
export class BattleResultPanel extends UIPanel {
    // ==================== 标题区域 ====================

    /** 结果标题标签 */
    @property(Label)
    resultTitleLabel: Label | null = null;

    /** 关卡名称标签 */
    @property(Label)
    levelNameLabel: Label | null = null;

    // ==================== 星级区域 ====================

    /** 星级容器 */
    @property(Node)
    starsContainer: Node | null = null;

    /** 星星预制体 */
    @property(Prefab)
    starPrefab: Prefab | null = null;

    // ==================== 奖励区域 ====================

    /** 奖励容器 */
    @property(Node)
    rewardsContainer: Node | null = null;

    /** 金币奖励标签 */
    @property(Label)
    goldRewardLabel: Label | null = null;

    /** 经验奖励标签 */
    @property(Label)
    expRewardLabel: Label | null = null;

    /** 宝石奖励标签 */
    @property(Label)
    gemsRewardLabel: Label | null = null;

    /** 物品奖励容器 */
    @property(Node)
    itemsRewardContainer: Node | null = null;

    // ==================== 统计区域 ====================

    /** 回合数标签 */
    @property(Label)
    turnsLabel: Label | null = null;

    /** 总伤害标签 */
    @property(Label)
    totalDamageLabel: Label | null = null;

    /** 总治疗标签 */
    @property(Label)
    totalHealLabel: Label | null = null;

    /** 阵亡数标签 */
    @property(Label)
    deathCountLabel: Label | null = null;

    // ==================== 操作按钮 ====================

    /** 继续按钮 */
    @property(Node)
    continueButton: Node | null = null;

    /** 重试按钮 */
    @property(Node)
    retryButton: Node | null = null;

    // ==================== 特效区域 ====================

    /** 胜利特效容器 */
    @property(Node)
    victoryEffectContainer: Node | null = null;

    /** 失败特效容器 */
    @property(Node)
    defeatEffectContainer: Node | null = null;

    // ==================== 状态 ====================

    /** 游戏实例 */
    private _game: Game = Game.getInstance();

    /** UI管理器 */
    private _uiManager: UIManager = UIManager.getInstance();

    /** 当前结果数据 */
    private _resultData: BattleResultData | null = null;

    /** 星星节点列表 */
    private _starNodes: Node[] = [];

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 3,
            cache: false,
            animationType: PanelAnimationType.SCALE,
            animationDuration: 0.4
        });
    }

    /**
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);

        if (data) {
            this._resultData = data as BattleResultData;
            this._updateUI();
        }

        this._setupButtons();
        this._bindEvents();
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();
        this._unbindEvents();
        this._resultData = null;
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        // 监听关卡战斗事件
        EventCenter.on(LevelBattleEventType.BATTLE_VICTORY, this._onBattleVictory, this);
        EventCenter.on(LevelBattleEventType.BATTLE_DEFEAT, this._onBattleDefeat, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(LevelBattleEventType.BATTLE_VICTORY, this._onBattleVictory, this);
        EventCenter.off(LevelBattleEventType.BATTLE_DEFEAT, this._onBattleDefeat, this);
    }

    /**
     * 战斗胜利事件回调
     */
    private _onBattleVictory(data: LevelBattleEventData): void {
        if (data.challengeResult) {
            this._resultData = {
                victory: true,
                levelId: data.levelId,
                stars: data.challengeResult.stars,
                firstClear: data.challengeResult.firstClear,
                rewards: data.challengeResult.rewards,
                statistics: {
                    turns: data.challengeResult.turns,
                    totalDamage: data.challengeResult.statistics.totalDamage,
                    totalHeal: data.challengeResult.statistics.totalHeal,
                    deathCount: data.challengeResult.statistics.deathCount,
                    skillCount: data.challengeResult.statistics.skillCount
                }
            };
            this._updateUI();
        }
    }

    /**
     * 战斗失败事件回调
     */
    private _onBattleDefeat(data: LevelBattleEventData): void {
        if (data.challengeResult) {
            this._resultData = {
                victory: false,
                levelId: data.levelId,
                stars: StarRating.NONE,
                firstClear: false,
                rewards: {},
                statistics: {
                    turns: data.challengeResult.turns,
                    totalDamage: data.challengeResult.statistics.totalDamage,
                    totalHeal: data.challengeResult.statistics.totalHeal,
                    deathCount: data.challengeResult.statistics.deathCount,
                    skillCount: data.challengeResult.statistics.skillCount
                }
            };
            this._updateUI();
        }
    }

    /**
     * 更新UI
     */
    private _updateUI(): void {
        if (!this._resultData) return;

        this._updateResultTitle();
        this._updateStars();
        this._updateRewards();
        this._updateStatistics();
        this._updateEffects();
        this._updateButtons();
    }

    /**
     * 更新结果标题
     */
    private _updateResultTitle(): void {
        if (this.resultTitleLabel) {
            this.resultTitleLabel.string = this._resultData!.victory ? '战斗胜利' : '战斗失败';
            this.resultTitleLabel.color = this._resultData!.victory
                ? new Color(255, 215, 0, 255)  // 金色
                : new Color(255, 100, 100, 255); // 红色
        }

        if (this.levelNameLabel && this._resultData!.levelName) {
            this.levelNameLabel.string = this._resultData!.levelName;
        }
    }

    /**
     * 更新星级显示
     */
    private _updateStars(): void {
        if (!this.starsContainer) return;

        // 清空现有星星
        this.starsContainer.removeAllChildren();
        this._starNodes = [];

        const stars = this._resultData!.stars;

        // 创建3颗星星
        for (let i = 0; i < 3; i++) {
            const starNode = this._createStarNode(i < stars);
            starNode.setParent(this.starsContainer);
            starNode.setPosition(new Vec3((i - 1) * 60, 0, 0));
            this._starNodes.push(starNode);

            // 延迟动画
            if (i < stars) {
                starNode.setScale(new Vec3(0, 0, 1));
                this.scheduleOnce(() => {
                    this._playStarAnimation(starNode);
                }, 0.3 + i * 0.2);
            }
        }
    }

    /**
     * 创建星星节点
     */
    private _createStarNode(active: boolean): Node {
        const starNode = this.starPrefab ? instantiate(this.starPrefab) : new Node('Star');

        // 绘制星星
        const graphics = starNode.getComponent(Graphics) || starNode.addComponent(Graphics);

        graphics.clear();
        graphics.fillColor = active
            ? new Color(255, 215, 0, 255)   // 金色
            : new Color(100, 100, 100, 150); // 灰色
        graphics.strokeColor = active
            ? new Color(255, 180, 0, 255)
            : new Color(80, 80, 80, 150);

        // 绘制五角星
        this._drawStar(graphics, 25, 5);

        return starNode;
    }

    /**
     * 绘制五角星
     */
    private _drawStar(graphics: Graphics, radius: number, points: number): void {
        const innerRadius = radius * 0.4;
        const angleStep = Math.PI / points;

        graphics.moveTo(0, radius);

        for (let i = 0; i < points * 2; i++) {
            const r = i % 2 === 0 ? radius : innerRadius;
            const angle = -Math.PI / 2 + i * angleStep;
            const x = r * Math.cos(angle);
            const y = r * Math.sin(angle);
            graphics.lineTo(x, y);
        }

        graphics.close();
        graphics.fill();
        graphics.stroke();
    }

    /**
     * 播放星星动画
     */
    private _playStarAnimation(starNode: Node): void {
        tween(starNode)
            .to(0.1, { scale: new Vec3(1.3, 1.3, 1) })
            .to(0.1, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }

    /**
     * 更新奖励显示
     */
    private _updateRewards(): void {
        const rewards = this._resultData!.rewards;

        // 金币
        if (this.goldRewardLabel) {
            const gold = rewards.gold || 0;
            this.goldRewardLabel.string = `金币: ${gold}`;
            this.goldRewardLabel.node.active = gold > 0;
        }

        // 经验
        if (this.expRewardLabel) {
            const exp = rewards.experience || 0;
            this.expRewardLabel.string = `经验: ${exp}`;
            this.expRewardLabel.node.active = exp > 0;
        }

        // 宝石
        if (this.gemsRewardLabel) {
            const gems = rewards.gems || 0;
            this.gemsRewardLabel.string = `宝石: ${gems}`;
            this.gemsRewardLabel.node.active = gems > 0;
        }

        // 物品
        if (this.itemsRewardContainer && rewards.items && rewards.items.length > 0) {
            this.itemsRewardContainer.removeAllChildren();

            rewards.items.forEach((item, index) => {
                const itemNode = this._createRewardItemNode(item.id, item.count);
                itemNode.setParent(this.itemsRewardContainer);
                itemNode.setPosition(new Vec3(index * 80, 0, 0));
            });
        }

        // 首次通关提示
        if (this._resultData!.firstClear) {
            this._showFirstClearBonus();
        }
    }

    /**
     * 创建奖励物品节点
     */
    private _createRewardItemNode(itemId: string, count: number): Node {
        const node = new Node(`Item_${itemId}`);

        // 背景
        const bgGraphics = node.addComponent(Graphics);
        bgGraphics.rect(-30, -30, 60, 60);
        bgGraphics.fillColor = new Color(100, 150, 200, 200);
        bgGraphics.strokeColor = new Color(150, 200, 255, 255);
        bgGraphics.lineWidth = 2;
        bgGraphics.fill();
        bgGraphics.stroke();

        // 数量标签
        const countNode = new Node('Count');
        countNode.setParent(node);
        countNode.setPosition(new Vec3(0, -15, 0));
        const countLabel = countNode.addComponent(Label);
        countLabel.fontSize = 12;
        countLabel.color = Color.WHITE;
        countLabel.string = `x${count}`;

        return node;
    }

    /**
     * 显示首次通关奖励
     */
    private _showFirstClearBonus(): void {
        // 创建首次通关提示
        const tipNode = new Node('FirstClearTip');
        tipNode.setParent(this.node);
        tipNode.setPosition(new Vec3(0, 200, 0));

        const tipLabel = tipNode.addComponent(Label);
        tipLabel.fontSize = 20;
        tipLabel.color = new Color(255, 215, 0, 255);
        tipLabel.string = '首次通关奖励已发放！';

        // 动画效果
        const opacity = tipNode.addComponent(UIOpacity);
        tween(opacity)
            .delay(2)
            .to(0.5, { opacity: 0 })
            .call(() => tipNode.destroy())
            .start();
    }

    /**
     * 更新统计数据
     */
    private _updateStatistics(): void {
        const stats = this._resultData!.statistics;

        if (this.turnsLabel) {
            this.turnsLabel.string = `回合数: ${stats.turns}`;
        }

        if (this.totalDamageLabel) {
            this.totalDamageLabel.string = `总伤害: ${this._formatNumber(stats.totalDamage)}`;
        }

        if (this.totalHealLabel) {
            this.totalHealLabel.string = `总治疗: ${this._formatNumber(stats.totalHeal)}`;
        }

        if (this.deathCountLabel) {
            this.deathCountLabel.string = `阵亡数: ${stats.deathCount}`;
            this.deathCountLabel.color = stats.deathCount > 0
                ? new Color(255, 100, 100, 255)
                : new Color(100, 255, 100, 255);
        }
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
     * 更新特效
     */
    private _updateEffects(): void {
        if (this.victoryEffectContainer) {
            this.victoryEffectContainer.active = this._resultData!.victory;
        }

        if (this.defeatEffectContainer) {
            this.defeatEffectContainer.active = !this._resultData!.victory;
        }

        // 胜利时播放粒子效果
        if (this._resultData!.victory && this.victoryEffectContainer) {
            this._playVictoryEffect();
        }
    }

    /**
     * 播放胜利特效
     */
    private _playVictoryEffect(): void {
        // 创建简单的胜利特效
        if (!this.victoryEffectContainer) return;

        // 创建多个光点
        for (let i = 0; i < 10; i++) {
            const sparkNode = new Node(`Spark_${i}`);
            sparkNode.setParent(this.victoryEffectContainer);

            // 随机位置
            const x = (Math.random() - 0.5) * 400;
            const y = (Math.random() - 0.5) * 200;
            sparkNode.setPosition(new Vec3(x, y, 0));

            // 绘制光点
            const graphics = sparkNode.addComponent(Graphics);
            graphics.circle(0, 0, 5);
            graphics.fillColor = new Color(255, 215, 0, 200);
            graphics.fill();

            // 动画
            const opacity = sparkNode.addComponent(UIOpacity);
            tween(sparkNode)
                .delay(Math.random() * 0.5)
                .to(0.5, { position: new Vec3(x, y + 50, 0) })
                .to(0.3, { scale: new Vec3(0, 0, 1) })
                .call(() => sparkNode.destroy())
                .start();
        }
    }

    /**
     * 更新按钮
     */
    private _updateButtons(): void {
        // 胜利时显示继续按钮，失败时显示重试按钮
        if (this.continueButton) {
            this.continueButton.active = this._resultData!.victory;
        }

        if (this.retryButton) {
            this.retryButton.active = !this._resultData!.victory;
        }
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        if (this.continueButton) {
            const btn = this.continueButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onContinue.bind(this));
            }
        }

        if (this.retryButton) {
            const btn = this.retryButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onRetry.bind(this));
            }
        }
    }

    /**
     * 继续按钮点击
     */
    private _onContinue(): void {
        this.hide();

        // 返回关卡选择或主城
        if (this._resultData?.levelId) {
            this._uiManager.showUI('level_panel');
        } else {
            this._uiManager.showUI('town_panel');
        }
    }

    /**
     * 重试按钮点击
     */
    private _onRetry(): void {
        this.hide();

        // 重新打开战斗准备界面
        if (this._resultData?.levelId) {
            this._uiManager.showUI('formation_panel', { levelId: this._resultData.levelId });
        } else {
            this._uiManager.showUI('town_panel');
        }
    }

    /**
     * 设置结果数据（外部调用）
     */
    setResultData(data: BattleResultData): void {
        this._resultData = data;
        this._updateUI();
    }
}