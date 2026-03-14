/**
 * 远征面板
 * 显示远征列表、英雄分配、奖励领取
 */

import { _decorator, Node, Label, Button, ProgressBar, Color } from 'cc';
import { UIPanel } from './UIPanel';
import { expeditionManager, ExpeditionManager } from '../../expedition/ExpeditionManager';
import {
    ExpeditionState,
    ExpeditionDifficulty,
    ExpeditionEventType,
    ExpeditionData,
    ExpeditionDetail
} from '../../config/ExpeditionTypes';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 远征项组件 */
export class ExpeditionItem extends UIPanel {
    @property(Label)
    nameLabel: Label | null = null;

    @property(Label)
    descLabel: Label | null = null;

    @property(Label)
    timeLabel: Label | null = null;

    @property(Label)
    stateLabel: Label | null = null;

    @property(ProgressBar)
    progressBar: ProgressBar | null = null;

    @property(Button)
    startBtn: Button | null = null;

    @property(Button)
    claimBtn: Button | null = null;

    private expeditionId: string = '';
    private detail: ExpeditionDetail | null = null;

    setData(data: { expeditionId: string; detail: ExpeditionDetail }): void {
        this.expeditionId = data.expeditionId;
        this.detail = data.detail;

        this.updateDisplay();
    }

    updateDisplay(): void {
        if (!this.detail) return;

        const config = this.detail.config;
        const data = this.detail.data;

        // 更新名称和描述
        if (this.nameLabel) {
            this.nameLabel.string = config.name;
        }

        if (this.descLabel) {
            this.descLabel.string = config.description;
        }

        // 更新时间显示
        if (this.timeLabel) {
            if (data.state === ExpeditionState.IN_PROGRESS) {
                this.timeLabel.string = this.formatTime(this.detail.remainingTime);
            } else {
                this.timeLabel.string = this.formatTime(config.duration * 1000);
            }
        }

        // 更新进度条
        if (this.progressBar) {
            this.progressBar.progress = data.progress / 100;
        }

        // 更新状态和按钮
        this.updateState();
    }

    updateState(): void {
        if (!this.detail) return;

        const data = this.detail.data;

        if (this.stateLabel) {
            switch (data.state) {
                case ExpeditionState.LOCKED:
                    this.stateLabel.string = '未解锁';
                    this.stateLabel.color = Color.GRAY;
                    break;
                case ExpeditionState.AVAILABLE:
                    this.stateLabel.string = '可开始';
                    this.stateLabel.color = Color.GREEN;
                    break;
                case ExpeditionState.IN_PROGRESS:
                    this.stateLabel.string = '进行中';
                    this.stateLabel.color = Color.YELLOW;
                    break;
                case ExpeditionState.COMPLETED:
                    this.stateLabel.string = '已完成';
                    this.stateLabel.color = Color.CYAN;
                    break;
                case ExpeditionState.CLAIMED:
                    this.stateLabel.string = '已领取';
                    this.stateLabel.color = Color.GRAY;
                    break;
            }
        }

        // 更新按钮显示
        if (this.startBtn) {
            this.startBtn.node.active = data.state === ExpeditionState.AVAILABLE;
        }

        if (this.claimBtn) {
            this.claimBtn.node.active = data.state === ExpeditionState.COMPLETED;
        }
    }

    private formatTime(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}时${minutes}分`;
        }
        if (minutes > 0) {
            return `${minutes}分${secs}秒`;
        }
        return `${secs}秒`;
    }

    onStartClick(): void {
        // 触发开始远征事件
        EventCenter.emit('expedition_start_request', { expeditionId: this.expeditionId });
    }

    onClaimClick(): void {
        // 触发领取奖励事件
        EventCenter.emit('expedition_claim_request', { expeditionId: this.expeditionId });
    }

    onItemClick(): void {
        // 显示详情
        EventCenter.emit('expedition_detail_request', { expeditionId: this.expeditionId });
    }
}

/** 远征面板 */
@ccclass('ExpeditionPanel')
export class ExpeditionPanel extends UIPanel {
    @property(Node)
    expeditionList: Node | null = null;

    @property(Label)
    remainingCountLabel: Label | null = null;

    @property(Label)
    refreshTimeLabel: Label | null = null;

    @property(Button)
    closeBtn: Button | null = null;

    private expeditionItems: Map<string, ExpeditionItem> = new Map();

    onShow(data?: any): void {
        super.onShow(data);

        // 初始化UI
        this.updateDisplay();

        // 监听事件
        this.setupEventListeners();
    }

    onHide(): void {
        // 清理事件监听
        this.cleanupEventListeners();
        super.onHide();
    }

    private setupEventListeners(): void {
        EventCenter.on(ExpeditionEventType.EXPEDITION_START, this.onExpeditionStart, this);
        EventCenter.on(ExpeditionEventType.EXPEDITION_COMPLETE, this.onExpeditionComplete, this);
        EventCenter.on(ExpeditionEventType.EXPEDITION_CLAIM, this.onExpeditionClaim, this);
    }

    private cleanupEventListeners(): void {
        EventCenter.off(ExpeditionEventType.EXPEDITION_START, this.onExpeditionStart, this);
        EventCenter.off(ExpeditionEventType.EXPEDITION_COMPLETE, this.onExpeditionComplete, this);
        EventCenter.off(ExpeditionEventType.EXPEDITION_CLAIM, this.onExpeditionClaim, this);
    }

    updateDisplay(): void {
        // 更新剩余次数
        if (this.remainingCountLabel) {
            this.remainingCountLabel.string = `剩余次数: ${expeditionManager.getRemainingCount()}`;
        }

        // 更新刷新时间
        if (this.refreshTimeLabel) {
            const listData = expeditionManager.getExpeditionList();
            const remaining = listData.refreshTime - Date.now();
            this.refreshTimeLabel.string = `刷新时间: ${this.formatTime(remaining)}`;
        }

        // 更新远征列表
        this.updateExpeditionList();
    }

    private updateExpeditionList(): void {
        // 实际项目中，这里应该使用列表组件动态创建项
        console.log('[ExpeditionPanel] 更新远征列表');
    }

    private onExpeditionStart(data: any): void {
        console.log('[ExpeditionPanel] 远征开始:', data.expeditionId);
        this.updateDisplay();
    }

    private onExpeditionComplete(data: any): void {
        console.log('[ExpeditionPanel] 远征完成:', data.expeditionId);
        this.updateDisplay();
    }

    private onExpeditionClaim(data: any): void {
        console.log('[ExpeditionPanel] 领取奖励:', data.expeditionId);
        this.updateDisplay();
    }

    private formatTime(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        return `${hours}小时${minutes}分钟`;
    }

    onCloseClick(): void {
        this.hide();
    }
}