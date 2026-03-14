/**
 * 在线奖励面板
 * 显示在线时长和可领取奖励
 */

import { _decorator, Node, Label, Button, ProgressBar, Color } from 'cc';
import { UIPanel } from './UIPanel';
import { onlineRewardManager, OnlineRewardManager } from '../../onlinereward/OnlineRewardManager';
import { OnlineRewardEventType, OnlineRewardPreview, OnlineRewardConfig } from '../../config/OnlineRewardTypes';
import { EventCenter } from '../../utils/EventTarget';
import { vipManager } from '../../vip/VIPManager';

const { ccclass, property } = _decorator;

/** 奖励项组件 */
export class OnlineRewardItem extends UIPanel {
    @property(Label)
    timeLabel: Label | null = null;

    @property(Label)
    rewardLabel: Label | null = null;

    @property(ProgressBar)
    progressBar: ProgressBar | null = null;

    @property(Button)
    claimBtn: Button | null = null;

    @property(Node)
    claimedNode: Node | null = null;

    private rewardId: string = '';
    private preview: OnlineRewardPreview | null = null;

    setData(data: { rewardId: string; preview: OnlineRewardPreview }): void {
        this.rewardId = data.rewardId;
        this.preview = data.preview;

        this.updateDisplay();
    }

    updateDisplay(): void {
        if (!this.preview) return;

        const config = this.preview.config;

        // 更新时间标签
        if (this.timeLabel) {
            const minutes = config.requiredMinutes;
            if (minutes >= 60) {
                const hours = Math.floor(minutes / 60);
                const mins = minutes % 60;
                this.timeLabel.string = `${hours}小时${mins > 0 ? mins + '分钟' : ''}`;
            } else {
                this.timeLabel.string = `${minutes}分钟`;
            }
        }

        // 更新奖励标签
        if (this.rewardLabel) {
            const rewardTexts = config.rewards.map(r => {
                switch (r.type) {
                    case 'gold': return `${r.amount}金币`;
                    case 'gems': return `${r.amount}钻石`;
                    case 'exp': return `${r.amount}经验`;
                    case 'item': return `${r.amount}x${r.itemId}`;
                    case 'hero_shard': return `${r.amount}碎片`;
                    default: return '';
                }
            });
            this.rewardLabel.string = rewardTexts.join(' ');
        }

        // 更新进度条
        if (this.progressBar) {
            this.progressBar.progress = this.preview.progress / 100;
        }

        // 更新按钮状态
        if (this.claimBtn) {
            this.claimBtn.node.active = this.preview.available && !this.preview.claimed;
            if (this.preview.available) {
                const claimBtnLabel = this.claimBtn.node.getComponent(Label);
                if (claimBtnLabel) {
                    claimBtnLabel.string = '领取';
                    claimBtnLabel.color = Color.GREEN;
                }
            }
        }

        // 更新已领取状态
        if (this.claimedNode) {
            this.claimedNode.active = this.preview.claimed;
        }
    }

    onClaimClick(): void {
        const vipLevel = vipManager.getVIPLevel();
        const result = onlineRewardManager.claimReward(this.rewardId, vipLevel);

        if (result.success) {
            console.log('[OnlineRewardItem] 领取成功:', result.rewards);
            EventCenter.emit('online_reward_claimed', { rewards: result.rewards });
            this.updateDisplay();
        } else {
            console.warn('[OnlineRewardItem] 领取失败:', result.error);
        }
    }
}

/** 在线奖励面板 */
@ccclass('OnlineRewardPanel')
export class OnlineRewardPanel extends UIPanel {
    @property(Node)
    rewardList: Node | null = null;

    @property(Label)
    onlineTimeLabel: Label | null = null;

    @property(Label)
    nextRewardLabel: Label | null = null;

    @property(ProgressBar)
    totalProgressBar: ProgressBar | null = null;

    @property(Button)
    claimAllBtn: Button | null = null;

    @property(Button)
    closeBtn: Button | null = null;

    private rewardItems: Map<string, OnlineRewardItem> = new Map();

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
        EventCenter.on(OnlineRewardEventType.ONLINE_TIME_UPDATED, this.onOnlineTimeUpdated, this);
        EventCenter.on(OnlineRewardEventType.REWARD_CLAIMED, this.onRewardClaimed, this);
    }

    private cleanupEventListeners(): void {
        EventCenter.off(OnlineRewardEventType.ONLINE_TIME_UPDATED, this.onOnlineTimeUpdated, this);
        EventCenter.off(OnlineRewardEventType.REWARD_CLAIMED, this.onRewardClaimed, this);
    }

    updateDisplay(): void {
        const rewardData = onlineRewardManager.getOnlineRewardData();

        // 更新在线时间
        if (this.onlineTimeLabel) {
            this.onlineTimeLabel.string = `今日在线: ${onlineRewardManager.formatOnlineTime()}`;
        }

        // 更新下一个奖励提示
        if (this.nextRewardLabel) {
            const nextReward = onlineRewardManager.getNextReward();
            if (nextReward) {
                const remaining = nextReward.requiredMinutes - rewardData.todayMinutes;
                this.nextRewardLabel.string = `下个奖励还需: ${remaining.toFixed(0)}分钟`;
            } else {
                this.nextRewardLabel.string = '已领取所有奖励';
            }
        }

        // 更新总进度
        if (this.totalProgressBar) {
            const maxMinutes = 240; // 最大在线时间
            this.totalProgressBar.progress = Math.min(1, rewardData.todayMinutes / maxMinutes);
        }

        // 更新一键领取按钮
        if (this.claimAllBtn) {
            const hasAvailable = onlineRewardManager.hasAvailableRewards();
            this.claimAllBtn.interactable = hasAvailable;
        }

        // 更新奖励列表
        this.updateRewardList();
    }

    private updateRewardList(): void {
        const previews = onlineRewardManager.getRewardPreviews();

        // 实际项目中，这里应该使用列表组件动态创建项
        console.log('[OnlineRewardPanel] 更新奖励列表, 共', previews.length, '项');
    }

    private onOnlineTimeUpdated(data: any): void {
        this.updateDisplay();
    }

    private onRewardClaimed(data: any): void {
        console.log('[OnlineRewardPanel] 奖励已领取:', data.rewardId);
        this.updateDisplay();
    }

    onClaimAllClick(): void {
        const vipLevel = vipManager.getVIPLevel();
        const rewards = onlineRewardManager.claimAllRewards(vipLevel);

        if (rewards.length > 0) {
            console.log('[OnlineRewardPanel] 一键领取成功，共', rewards.length, '项奖励');
            EventCenter.emit('online_reward_claimed', { rewards });
        }

        this.updateDisplay();
    }

    onCloseClick(): void {
        this.hide();
    }
}