/**
 * 战斗结果面板组件
 * MVP简化版
 */

import { _decorator, Component, Node, Label, Button, Color, director } from 'cc';
import { EventCenter, GameEvent } from '../../utils/EventTarget';
import { PlayerDataManager, playerDataManager } from '../../utils/PlayerDataManager';

const { ccclass, property } = _decorator;

@ccclass('BattleResultPanel')
export class BattleResultPanel extends Component {

    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    resultLabel: Label | null = null;

    @property(Label)
    goldLabel: Label | null = null;

    @property(Label)
    expLabel: Label | null = null;

    @property(Button)
    confirmButton: Button | null = null;

    @property(Button)
    retryButton: Button | null = null;

    /** 是否胜利 */
    private isVictory: boolean = false;

    /** 奖励金币 */
    private rewardGold: number = 0;

    /** 奖励经验 */
    private rewardExp: number = 0;

    onLoad(): void {
        this.initUI();
    }

    /**
     * 初始化UI
     */
    private initUI(): void {
        if (this.confirmButton) {
            this.confirmButton.node.on(Button.EventType.CLICK, this.onConfirmClick, this);
        }

        if (this.retryButton) {
            this.retryButton.node.on(Button.EventType.CLICK, this.onRetryClick, this);
        }
    }

    /**
     * 显示时调用
     */
    onShow(data?: any): void {
        console.log('战斗结果显示', data);

        // 解析数据
        this.isVictory = data?.winner === 'player' || data?.isVictory === true;
        this.rewardGold = data?.gold || (this.isVictory ? 1000 : 100);
        this.rewardExp = data?.exp || (this.isVictory ? 100 : 10);

        // 更新UI
        this.updateUI();
    }

    /**
     * 更新UI
     */
    private updateUI(): void {
        // 设置标题
        if (this.titleLabel) {
            this.titleLabel.string = this.isVictory ? '战斗胜利!' : '战斗失败';
            this.titleLabel.color = this.isVictory ?
                new Color(255, 215, 0) : // 金色
                new Color(255, 100, 100); // 红色
        }

        // 设置结果描述
        if (this.resultLabel) {
            if (this.isVictory) {
                this.resultLabel.string = '你击败了敌人！';
            } else {
                this.resultLabel.string = '你的部队被击败了...';
            }
        }

        // 显示奖励
        if (this.goldLabel) {
            this.goldLabel.string = `金币: +${this.rewardGold}`;
        }

        if (this.expLabel) {
            this.expLabel.string = `经验: +${this.rewardExp}`;
        }

        // 显示/隐藏重试按钮
        if (this.retryButton) {
            this.retryButton.node.active = !this.isVictory;
        }

        // 发放奖励
        if (this.isVictory) {
            playerDataManager.addGold(this.rewardGold);
        }
    }

    /**
     * 确认按钮点击
     */
    private onConfirmClick(): void {
        console.log('点击确认');

        // 返回主菜单
        director.loadScene('MainMenu');
    }

    /**
     * 重试按钮点击
     */
    private onRetryClick(): void {
        console.log('点击重试');

        // 重新加载战斗场景
        director.loadScene('Battle');
    }

    /**
     * 隐藏时调用
     */
    onHide(): void {
        console.log('战斗结果面板隐藏');
    }

    /**
     * 销毁时清理
     */
    onDestroy(): void {
        if (this.confirmButton) {
            this.confirmButton.node.off(Button.EventType.CLICK, this.onConfirmClick, this);
        }
        if (this.retryButton) {
            this.retryButton.node.off(Button.EventType.CLICK, this.onRetryClick, this);
        }
    }
}