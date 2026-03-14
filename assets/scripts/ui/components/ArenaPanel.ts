/**
 * 竞技场面板
 * 显示竞技场信息、匹配、战斗记录
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Button, ProgressBar, Sprite, Color } from 'cc';
import { UIPanel } from './UIPanel';
import { arenaManager, ArenaTier, ArenaState, MatchType, BattleResult, BattleRecord } from '../../arena';
import { EventCenter } from '../../utils/EventTarget';
import { ArenaEventType } from '../../config/ArenaTypes';

const { ccclass, property } = _decorator;

@ccclass('ArenaPanel')
export class ArenaPanel extends UIPanel {
    /** 段位图标 */
    @property(Sprite)
    tierIcon: Sprite | null = null;

    /** 段位名称 */
    @property(Label)
    tierName: Label | null = null;

    /** 积分显示 */
    @property(Label)
    scoreLabel: Label | null = null;

    /** 星级容器 */
    @property(Node)
    starsContainer: Node | null = null;

    /** 胜场显示 */
    @property(Label)
    winsLabel: Label | null = null;

    /** 败场显示 */
    @property(Label)
    lossesLabel: Label | null = null;

    /** 胜率显示 */
    @property(Label)
    winRateLabel: Label | null = null;

    /** 连胜显示 */
    @property(Label)
    winStreakLabel: Label | null = null;

    /** 剩余挑战次数 */
    @property(Label)
    remainingChallengesLabel: Label | null = null;

    /** 匹配按钮 */
    @property(Button)
    matchButton: Button | null = null;

    /** 快速匹配按钮 */
    @property(Button)
    quickMatchButton: Button | null = null;

    /** 取消匹配按钮 */
    @property(Button)
    cancelButton: Button | null = null;

    /** 匹配进度条 */
    @property(ProgressBar)
    matchProgressBar: ProgressBar | null = null;

    /** 匹配状态标签 */
    @property(Label)
    matchStatusLabel: Label | null = null;

    /** 对手信息节点 */
    @property(Node)
    opponentInfoNode: Node | null = null;

    /** 对手名称 */
    @property(Label)
    opponentNameLabel: Label | null = null;

    /** 对手段位 */
    @property(Label)
    opponentTierLabel: Label | null = null;

    /** 对手积分 */
    @property(Label)
    opponentScoreLabel: Label | null = null;

    /** 战斗记录容器 */
    @property(Node)
    recordsContainer: Node | null = null;

    /** 购买次数按钮 */
    @property(Button)
    buyButton: Button | null = null;

    /** 购买消耗标签 */
    @property(Label)
    buyCostLabel: Label | null = null;

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    /** 匹配动画定时器 */
    private _matchAnimTimer: number | null = null;

    /**
     * 面板打开
     */
    protected onOpen(): void {
        this._bindEvents();
        this._refreshUI();
        this._updateButtons(ArenaState.IDLE);
    }

    /**
     * 面板关闭
     */
    protected onClose(): void {
        this._unbindEvents();
        this._stopMatchAnimation();
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(ArenaEventType.MATCH_SUCCESS, this._onMatchSuccess, this);
        EventCenter.on(ArenaEventType.MATCH_TIMEOUT, this._onMatchTimeout, this);
        EventCenter.on(ArenaEventType.BATTLE_END, this._onBattleEnd, this);
        EventCenter.on(ArenaEventType.SCORE_UPDATE, this._onScoreUpdate, this);
        EventCenter.on(ArenaEventType.TIER_UP, this._onTierUp, this);
        EventCenter.on(ArenaEventType.TIER_DOWN, this._onTierDown, this);

        // 按钮事件
        this.matchButton?.node.on(Button.EventType.CLICK, this._onMatchButtonClick, this);
        this.quickMatchButton?.node.on(Button.EventType.CLICK, this._onQuickMatchButtonClick, this);
        this.cancelButton?.node.on(Button.EventType.CLICK, this._onCancelButtonClick, this);
        this.buyButton?.node.on(Button.EventType.CLICK, this._onBuyButtonClick, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this._onCloseButtonClick, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(ArenaEventType.MATCH_SUCCESS, this._onMatchSuccess, this);
        EventCenter.off(ArenaEventType.MATCH_TIMEOUT, this._onMatchTimeout, this);
        EventCenter.off(ArenaEventType.BATTLE_END, this._onBattleEnd, this);
        EventCenter.off(ArenaEventType.SCORE_UPDATE, this._onScoreUpdate, this);
        EventCenter.off(ArenaEventType.TIER_UP, this._onTierUp, this);
        EventCenter.off(ArenaEventType.TIER_DOWN, this._onTierDown, this);
    }

    /**
     * 刷新UI
     */
    private _refreshUI(): void {
        const playerData = arenaManager.getPlayerData();

        // 更新段位信息
        const tierConfig = arenaManager.getTierConfig(playerData.tier);
        if (tierConfig) {
            if (this.tierName) {
                this.tierName.string = tierConfig.name;
            }
            // 段位图标需要异步加载
        }

        // 更新积分
        if (this.scoreLabel) {
            this.scoreLabel.string = `${playerData.score}`;
        }

        // 更新战绩
        if (this.winsLabel) {
            this.winsLabel.string = `${playerData.wins}`;
        }
        if (this.lossesLabel) {
            this.lossesLabel.string = `${playerData.losses}`;
        }
        if (this.winRateLabel) {
            this.winRateLabel.string = `${playerData.winRate}%`;
        }
        if (this.winStreakLabel) {
            this.winStreakLabel.string = playerData.winStreak > 0 ? `${playerData.winStreak}连胜` : '';
        }

        // 更新剩余次数
        if (this.remainingChallengesLabel) {
            this.remainingChallengesLabel.string = `剩余挑战次数: ${arenaManager.getRemainingChallenges()}`;
        }

        // 更新购买消耗
        if (this.buyCostLabel) {
            this.buyCostLabel.string = `${arenaManager.getBuyCost()} 钻石`;
        }

        // 更新战斗记录
        this._refreshBattleRecords();
    }

    /**
     * 刷新战斗记录
     */
    private _refreshBattleRecords(): void {
        if (!this.recordsContainer) return;

        const records = arenaManager.getBattleRecords(10);

        // 清空现有记录
        this.recordsContainer.removeAllChildren();

        // 创建记录项（简化实现）
        records.forEach(record => {
            const recordNode = new Node('record');
            const label = recordNode.addComponent(Label);
            const resultText = record.result === BattleResult.WIN ? '胜利' :
                              record.result === BattleResult.LOSE ? '失败' : '平局';
            const scoreText = record.scoreChange >= 0 ? `+${record.scoreChange}` : `${record.scoreChange}`;

            label.string = `${record.opponentName} - ${resultText} (${scoreText})`;
            label.color = record.result === BattleResult.WIN ? Color.GREEN :
                          record.result === BattleResult.LOSE ? Color.RED : Color.WHITE;

            recordNode.parent = this.recordsContainer;
        });
    }

    /**
     * 更新按钮状态
     */
    private _updateButtons(state: ArenaState): void {
        const isIdle = state === ArenaState.IDLE;
        const isMatching = state === ArenaState.MATCHING;
        const isBattling = state === ArenaState.BATTLING;

        if (this.matchButton) {
            this.matchButton.node.active = isIdle;
            this.matchButton.interactable = arenaManager.getRemainingChallenges() > 0;
        }

        if (this.quickMatchButton) {
            this.quickMatchButton.node.active = isIdle;
        }

        if (this.cancelButton) {
            this.cancelButton.node.active = isMatching;
        }

        if (this.matchProgressBar) {
            this.matchProgressBar.node.active = isMatching;
        }

        if (this.matchStatusLabel) {
            this.matchStatusLabel.node.active = isMatching;
            this.matchStatusLabel.string = isMatching ? '正在匹配...' : '';
        }

        if (this.opponentInfoNode) {
            this.opponentInfoNode.active = false;
        }
    }

    /**
     * 开始匹配动画
     */
    private _startMatchAnimation(): void {
        let progress = 0;
        this._matchAnimTimer = setInterval(() => {
            progress += 0.02;
            if (progress > 1) progress = 0;
            if (this.matchProgressBar) {
                this.matchProgressBar.progress = progress;
            }
        }, 50);
    }

    /**
     * 停止匹配动画
     */
    private _stopMatchAnimation(): void {
        if (this._matchAnimTimer) {
            clearInterval(this._matchAnimTimer);
            this._matchAnimTimer = null;
        }
    }

    // ==================== 事件处理 ====================

    /**
     * 排位匹配按钮点击
     */
    private _onMatchButtonClick(): void {
        const result = arenaManager.startMatch(MatchType.RANKED);
        if (result.success) {
            this._updateButtons(ArenaState.MATCHING);
            this._startMatchAnimation();
        } else {
            this._showToast(result.error || '匹配失败');
        }
    }

    /**
     * 快速匹配按钮点击
     */
    private _onQuickMatchButtonClick(): void {
        const result = arenaManager.startMatch(MatchType.QUICK);
        if (result.success) {
            this._updateButtons(ArenaState.MATCHING);
            this._startMatchAnimation();
        } else {
            this._showToast(result.error || '匹配失败');
        }
    }

    /**
     * 取消匹配按钮点击
     */
    private _onCancelButtonClick(): void {
        arenaManager.cancelMatch();
        this._stopMatchAnimation();
        this._updateButtons(ArenaState.IDLE);
    }

    /**
     * 购买次数按钮点击
     */
    private _onBuyButtonClick(): void {
        const result = arenaManager.buyChallengeCount();
        if (result.success) {
            this._refreshUI();
            this._showToast('购买成功');
        } else {
            this._showToast(result.error || '购买失败');
        }
    }

    /**
     * 关闭按钮点击
     */
    private _onCloseButtonClick(): void {
        this.hide();
    }

    /**
     * 匹配成功
     */
    private _onMatchSuccess(data: any): void {
        this._stopMatchAnimation();

        const opponent = arenaManager.getCurrentOpponent();
        if (opponent) {
            if (this.opponentInfoNode) {
                this.opponentInfoNode.active = true;
            }
            if (this.opponentNameLabel) {
                this.opponentNameLabel.string = opponent.playerName;
            }
            if (this.opponentScoreLabel) {
                this.opponentScoreLabel.string = `${opponent.score}`;
            }

            const tierConfig = arenaManager.getTierConfig(opponent.tier);
            if (this.opponentTierLabel && tierConfig) {
                this.opponentTierLabel.string = tierConfig.name;
            }
        }

        // 自动开始战斗
        setTimeout(() => {
            arenaManager.startBattle();
            // 切换到战斗场景
            // this._game.startArenaBattle();
        }, 1500);
    }

    /**
     * 匹配超时
     */
    private _onMatchTimeout(data: any): void {
        this._stopMatchAnimation();
        this._updateButtons(ArenaState.IDLE);
        this._showToast('匹配超时，请重试');
    }

    /**
     * 战斗结束
     */
    private _onBattleEnd(data: any): void {
        this._refreshUI();
        this._updateButtons(ArenaState.IDLE);

        const resultText = data.result === BattleResult.WIN ? '胜利' :
                          data.result === BattleResult.LOSE ? '失败' : '平局';
        this._showToast(`战斗${resultText}！积分 ${data.scoreChange >= 0 ? '+' : ''}${data.scoreChange}`);
    }

    /**
     * 积分更新
     */
    private _onScoreUpdate(data: any): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = `${data.currentScore}`;
        }
    }

    /**
     * 段位提升
     */
    private _onTierUp(data: any): void {
        const tierConfig = arenaManager.getTierConfig(data.currentTier);
        if (tierConfig) {
            this._showToast(`恭喜晋升 ${tierConfig.name}！`);
        }
        this._refreshUI();
    }

    /**
     * 段位下降
     */
    private _onTierDown(data: any): void {
        const tierConfig = arenaManager.getTierConfig(data.currentTier);
        if (tierConfig) {
            this._showToast(`降级到 ${tierConfig.name}`);
        }
        this._refreshUI();
    }

    /**
     * 显示提示
     */
    private _showToast(message: string): void {
        // 通过 UIManager 显示提示
        console.log(`[Arena] ${message}`);
    }
}