/**
 * 活动面板
 * 显示活动列表、任务进度、奖励领取
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Button, Sprite, Color, Prefab, instantiate, ScrollView, ProgressBar } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { activityManager } from '../activity';
import { ActivityType, ActivityState, ActivityEventType, ActivityInfo, ActivityTask, ActivityReward } from '../config/ActivityTypes';
import { EventCenter } from '../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 活动类型名称 */
const ACTIVITY_TYPE_NAMES: Record<ActivityType, string> = {
    [ActivityType.DAILY]: '日常活动',
    [ActivityType.WEEKLY]: '周常活动',
    [ActivityType.LIMITED]: '限时活动',
    [ActivityType.FESTIVAL]: '节日活动',
    [ActivityType.NEW_PLAYER]: '新手活动',
    [ActivityType.SPECIAL]: '特殊活动'
};

/** 活动状态颜色 */
const ACTIVITY_STATE_COLORS: Record<ActivityState, Color> = {
    [ActivityState.PREVIEW]: new Color(150, 150, 150),      // 灰色
    [ActivityState.ACTIVE]: new Color(50, 205, 50),         // 绿色
    [ActivityState.ENDED]: new Color(100, 100, 100)         // 深灰
};

@ccclass('ActivityPanel')
export class ActivityPanel extends UIPanel {
    // ==================== 活动列表 ====================

    /** 活动滚动视图 */
    @property(ScrollView)
    activityScrollView: ScrollView | null = null;

    /** 活动容器 */
    @property(Node)
    activityContainer: Node | null = null;

    /** 活动项预制体 */
    @property(Prefab)
    activityItemPrefab: Prefab | null = null;

    // ==================== 活动详情 ====================

    /** 详情面板 */
    @property(Node)
    detailPanel: Node | null = null;

    /** 活动名称 */
    @property(Label)
    activityNameLabel: Label | null = null;

    /** 活动描述 */
    @property(Label)
    activityDescLabel: Label | null = null;

    /** 活动时间 */
    @property(Label)
    activityTimeLabel: Label | null = null;

    /** 任务列表容器 */
    @property(Node)
    taskContainer: Node | null = null;

    /** 任务项预制体 */
    @property(Prefab)
    taskItemPrefab: Prefab | null = null;

    /** 一键领取按钮 */
    @property(Button)
    claimAllButton: Button | null = null;

    // ==================== 按钮 ====================

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    /** 返回按钮 */
    @property(Button)
    backButton: Button | null = null;

    // ==================== 状态 ====================

    /** 当前选中的活动ID */
    private _currentActivityId: string = '';

    /** 当前活动详情 */
    private _currentDetail: any = null;

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
        this._updateActivityList();
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
        EventCenter.on(ActivityEventType.ACTIVITY_START, this._onActivityStart, this);
        EventCenter.on(ActivityEventType.ACTIVITY_END, this._onActivityEnd, this);
        EventCenter.on(ActivityEventType.TASK_COMPLETE, this._onTaskComplete, this);
        EventCenter.on(ActivityEventType.PROGRESS_UPDATE, this._onProgressUpdate, this);

        this.claimAllButton?.node.on(Button.EventType.CLICK, this._onClaimAllClick, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this._onCloseClick, this);
        this.backButton?.node.on(Button.EventType.CLICK, this._onBackClick, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(ActivityEventType.ACTIVITY_START, this._onActivityStart, this);
        EventCenter.off(ActivityEventType.ACTIVITY_END, this._onActivityEnd, this);
        EventCenter.off(ActivityEventType.TASK_COMPLETE, this._onTaskComplete, this);
        EventCenter.off(ActivityEventType.PROGRESS_UPDATE, this._onProgressUpdate, this);
    }

    /**
     * 更新活动列表
     */
    private _updateActivityList(): void {
        if (!this.activityContainer) return;

        this.activityContainer.removeAllChildren();

        const list = activityManager.getActivityList();

        // 先显示进行中的活动
        const activeActivities = list.activities.filter(a => activityManager.isActivityActive(a.id));
        const previewActivities = list.activities.filter(a => !activityManager.isActivityActive(a.id));

        // 添加进行中的活动
        if (activeActivities.length > 0) {
            this._addSectionHeader('进行中', true);
            activeActivities.forEach(activity => {
                this._createActivityItem(activity);
            });
        }

        // 添加预告中的活动
        if (previewActivities.length > 0) {
            this._addSectionHeader('即将开启', false);
            previewActivities.forEach(activity => {
                this._createActivityItem(activity);
            });
        }

        // 空状态
        if (list.activities.length === 0) {
            this._showEmptyState();
        }
    }

    /**
     * 添加分隔标题
     */
    private _addSectionHeader(title: string, isActive: boolean): void {
        if (!this.activityContainer) return;

        const headerNode = new Node(`Header_${title}`);
        const label = headerNode.addComponent(Label);
        label.string = title;
        label.fontSize = 24;
        label.color = isActive ? new Color(50, 205, 50) : new Color(150, 150, 150);
        headerNode.setPosition(0, 0, 0);
        this.activityContainer.addChild(headerNode);
    }

    /**
     * 创建活动项
     */
    private _createActivityItem(activity: ActivityInfo): void {
        if (!this.activityContainer) return;

        const itemNode = this.activityItemPrefab
            ? instantiate(this.activityItemPrefab)
            : new Node(`Activity_${activity.id}`);

        // 设置活动名称
        const nameLabel = itemNode.getChildByName('Name')?.getComponent(Label);
        if (nameLabel) {
            nameLabel.string = activity.name;
        }

        // 设置活动类型
        const typeLabel = itemNode.getChildByName('Type')?.getComponent(Label);
        if (typeLabel) {
            typeLabel.string = ACTIVITY_TYPE_NAMES[activity.type] || '';
        }

        // 设置活动状态
        const stateLabel = itemNode.getChildByName('State')?.getComponent(Label);
        if (stateLabel) {
            const isActive = activityManager.isActivityActive(activity.id);
            stateLabel.string = isActive ? '进行中' : '即将开启';
            stateLabel.color = isActive ? new Color(50, 205, 50) : new Color(150, 150, 150);
        }

        // 设置剩余时间
        const timeLabel = itemNode.getChildByName('Time')?.getComponent(Label);
        if (timeLabel) {
            const remaining = activity.endTime - Date.now();
            if (remaining > 0) {
                timeLabel.string = this._formatRemainingTime(remaining);
            } else {
                const waiting = activity.startTime - Date.now();
                timeLabel.string = waiting > 0 ? `${this._formatRemainingTime(waiting)}后开启` : '';
            }
        }

        // 可领取标记
        const claimableMark = itemNode.getChildByName('ClaimableMark');
        if (claimableMark) {
            claimableMark.active = activityManager.hasClaimableRewards(activity.id);
        }

        // 点击查看详情
        itemNode.on(Node.EventType.TOUCH_END, () => {
            this._showActivityDetail(activity.id);
        });

        this.activityContainer.addChild(itemNode);
    }

    /**
     * 显示空状态
     */
    private _showEmptyState(): void {
        if (!this.activityContainer) return;

        const emptyNode = new Node('EmptyState');
        const emptyLabel = emptyNode.addComponent(Label);
        emptyLabel.string = '暂无活动';
        emptyLabel.fontSize = 24;
        emptyLabel.color = new Color(150, 150, 150);
        this.activityContainer.addChild(emptyNode);
    }

    /**
     * 显示活动详情
     */
    private _showActivityDetail(activityId: string): void {
        if (!this.detailPanel) return;

        const detail = activityManager.getActivityDetail(activityId);
        if (!detail) return;

        this._currentActivityId = activityId;
        this._currentDetail = detail;
        this.detailPanel.active = true;

        if (this.activityNameLabel) {
            this.activityNameLabel.string = detail.info.name;
        }

        if (this.activityDescLabel) {
            this.activityDescLabel.string = detail.info.description;
        }

        if (this.activityTimeLabel) {
            this.activityTimeLabel.string = this._formatActivityTime(detail.info);
        }

        this._updateTaskList(detail);

        if (this.claimAllButton) {
            this.claimAllButton.interactable = activityManager.hasClaimableRewards(activityId);
        }
    }

    /**
     * 更新任务列表
     */
    private _updateTaskList(detail: any): void {
        if (!this.taskContainer) return;

        this.taskContainer.removeAllChildren();

        if (!detail.tasks || detail.tasks.length === 0) {
            const emptyNode = new Node('NoTasks');
            const label = emptyNode.addComponent(Label);
            label.string = '暂无任务';
            label.fontSize = 20;
            this.taskContainer.addChild(emptyNode);
            return;
        }

        detail.tasks.forEach((task: ActivityTask, index: number) => {
            const taskNode = this.taskItemPrefab
                ? instantiate(this.taskItemPrefab)
                : new Node(`Task_${task.id}`);

            taskNode.setPosition(0, -index * 60, 0);

            // 任务名称
            const nameLabel = taskNode.getChildByName('Name')?.getComponent(Label);
            if (nameLabel) {
                nameLabel.string = task.name;
            }

            // 任务进度
            const progressLabel = taskNode.getChildByName('Progress')?.getComponent(Label);
            if (progressLabel) {
                progressLabel.string = `${task.currentProgress}/${task.targetProgress}`;
            }

            // 进度条
            const progressBar = taskNode.getChildByName('ProgressBar')?.getComponent(ProgressBar);
            if (progressBar) {
                progressBar.progress = task.currentProgress / task.targetProgress;
            }

            // 奖励
            const rewardLabel = taskNode.getChildByName('Reward')?.getComponent(Label);
            if (rewardLabel) {
                rewardLabel.string = this._formatRewards(task.rewards);
            }

            // 领取按钮
            const claimBtn = taskNode.getChildByName('ClaimBtn')?.getComponent(Button);
            if (claimBtn) {
                const isComplete = task.currentProgress >= task.targetProgress;
                const isClaimed = task.claimed;
                claimBtn.interactable = isComplete && !isClaimed;

                const btnLabel = claimBtn.node.getComponentInChildren(Label);
                if (btnLabel) {
                    btnLabel.string = isClaimed ? '已领取' : isComplete ? '领取' : '进行中';
                }

                claimBtn.node.on(Button.EventType.CLICK, () => {
                    this._claimTaskReward(task.id);
                });
            }

            this.taskContainer.addChild(taskNode);
        });
    }

    /**
     * 隐藏详情面板
     */
    private _hideDetailPanel(): void {
        if (this.detailPanel) {
            this.detailPanel.active = false;
        }
        this._currentActivityId = '';
        this._currentDetail = null;
    }

    /**
     * 领取任务奖励
     */
    private _claimTaskReward(taskId: string): void {
        if (!this._currentActivityId) return;

        const result = activityManager.claimReward(this._currentActivityId, taskId);
        if (result.success) {
            this._showToast('领取成功！');
            // 刷新详情
            const detail = activityManager.getActivityDetail(this._currentActivityId);
            if (detail) {
                this._updateTaskList(detail);
            }
        } else {
            this._showToast(result.error || '领取失败');
        }
    }

    /**
     * 一键领取点击
     */
    private _onClaimAllClick(): void {
        if (!this._currentActivityId) return;

        const result = activityManager.claimAllRewards(this._currentActivityId);
        if (result.success && result.results) {
            const count = result.results.filter(r => r.success).length;
            this._showToast(`领取成功！共${count}个奖励`);
            // 刷新详情
            const detail = activityManager.getActivityDetail(this._currentActivityId);
            if (detail) {
                this._updateTaskList(detail);
            }
        } else {
            this._showToast('没有可领取的奖励');
        }
    }

    /**
     * 关闭点击
     */
    private _onCloseClick(): void {
        this.hide();
    }

    /**
     * 返回点击
     */
    private _onBackClick(): void {
        this._hideDetailPanel();
    }

    /**
     * 活动开始回调
     */
    private _onActivityStart(data: { activity: ActivityInfo }): void {
        this._updateActivityList();
        this._showToast(`活动【${data.activity.name}】已开启！`);
    }

    /**
     * 活动结束回调
     */
    private _onActivityEnd(data: { activity: ActivityInfo }): void {
        this._updateActivityList();
        if (this._currentActivityId === data.activity.id) {
            this._hideDetailPanel();
        }
    }

    /**
     * 任务完成回调
     */
    private _onTaskComplete(data: { activityId: string; taskId: string }): void {
        if (data.activityId === this._currentActivityId) {
            const detail = activityManager.getActivityDetail(this._currentActivityId);
            if (detail) {
                this._updateTaskList(detail);
            }
        }
    }

    /**
     * 进度更新回调
     */
    private _onProgressUpdate(data: { activityId: string; taskId: string; progress: number }): void {
        if (data.activityId === this._currentActivityId) {
            const detail = activityManager.getActivityDetail(this._currentActivityId);
            if (detail) {
                this._updateTaskList(detail);
            }
        }
    }

    /**
     * 格式化剩余时间
     */
    private _formatRemainingTime(ms: number): string {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
            return `${days}天${hours % 24}小时`;
        } else if (hours > 0) {
            return `${hours}小时${minutes % 60}分钟`;
        } else if (minutes > 0) {
            return `${minutes}分钟`;
        } else {
            return `${seconds}秒`;
        }
    }

    /**
     * 格式化活动时间
     */
    private _formatActivityTime(info: ActivityInfo): string {
        const start = new Date(info.startTime);
        const end = new Date(info.endTime);

        const formatDate = (date: Date) => {
            return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        };

        return `${formatDate(start)} - ${formatDate(end)}`;
    }

    /**
     * 格式化奖励
     */
    private _formatRewards(rewards: ActivityReward[]): string {
        return rewards.map(r => `${r.type} x${r.amount}`).join(', ');
    }

    /**
     * 显示提示
     */
    private _showToast(message: string): void {
        console.log(`[ActivityPanel] ${message}`);
    }
}