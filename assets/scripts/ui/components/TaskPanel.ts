/**
 * 任务面板
 * 显示每日任务、每周任务和主线任务
 */

import { _decorator, Node, Label, Sprite, SpriteFrame, Prefab, instantiate, ScrollView, Vec3, ProgressBar, Color } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { taskManager, TaskEventType, TaskProgress } from '../../achievement/AchievementManager';
import { TaskConfig, TaskType, TaskStatus } from '../../config/AchievementTypes';
import { TaskConfigMap, DailyTaskTemplates, WeeklyTaskTemplates, MainTasks } from '../../config/achievements.json';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 任务类型名称 */
const TASK_TYPE_NAMES: Record<TaskType, string> = {
    [TaskType.DAILY]: '每日任务',
    [TaskType.WEEKLY]: '每周任务',
    [TaskType.MAIN]: '主线任务',
    [TaskType.SIDE]: '支线任务'
};

/** 状态颜色 */
const STATUS_COLORS: Record<TaskStatus, Color> = {
    [TaskStatus.LOCKED]: new Color(150, 150, 150),
    [TaskStatus.AVAILABLE]: new Color(255, 255, 100),
    [TaskStatus.IN_PROGRESS]: new Color(100, 200, 255),
    [TaskStatus.COMPLETED]: new Color(100, 255, 100),
    [TaskStatus.CLAIMED]: new Color(150, 150, 150)
};

/**
 * 任务面板
 */
@ccclass('TaskPanel')
export class TaskPanel extends UIPanel {
    // ==================== 标签页 ====================

    /** 每日任务标签 */
    @property(Node)
    dailyTab: Node | null = null;

    /** 每周任务标签 */
    @property(Node)
    weeklyTab: Node | null = null;

    /** 主线任务标签 */
    @property(Node)
    mainTab: Node | null = null;

    // ==================== 任务列表 ====================

    /** 任务列表滚动视图 */
    @property(ScrollView)
    taskScrollView: ScrollView | null = null;

    /** 任务列表内容 */
    @property(Node)
    taskContent: Node | null = null;

    /** 任务项预制体 */
    @property(Prefab)
    taskItemPrefab: Prefab | null = null;

    // ==================== 底部信息 ====================

    /** 任务完成统计 */
    @property(Label)
    statsLabel: Label | null = null;

    /** 一键领取按钮 */
    @property(Node)
    claimAllButton: Node | null = null;

    /** 关闭按钮 */
    @property(Node)
    closeButton: Node | null = null;

    // ==================== 状态 ====================

    /** 当前选中的标签 */
    private _currentTab: TaskType = TaskType.DAILY;

    /** 任务项节点列表 */
    private _itemNodes: Node[] = [];

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 2,
            cache: true,
            animationType: PanelAnimationType.SLIDE_UP,
            animationDuration: 0.3
        });
    }

    /**
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);

        this._setupTabs();
        this._updateTaskList();
        this._updateStats();
        this._setupButtons();
        this._bindEvents();
    }

    /**
     * 设置标签页
     */
    private _setupTabs(): void {
        const tabs = [
            { node: this.dailyTab, type: TaskType.DAILY },
            { node: this.weeklyTab, type: TaskType.WEEKLY },
            { node: this.mainTab, type: TaskType.MAIN }
        ];

        tabs.forEach(({ node, type }) => {
            if (node) {
                node.off(Node.EventType.TOUCH_END);
                node.on(Node.EventType.TOUCH_END, () => {
                    this._selectTab(type);
                });

                // 高亮当前标签
                const label = node.getComponentInChildren(Label);
                if (label) {
                    label.color = this._currentTab === type
                        ? new Color(255, 255, 100)
                        : new Color(255, 255, 255);
                }
            }
        });
    }

    /**
     * 选择标签页
     */
    private _selectTab(type: TaskType): void {
        this._currentTab = type;
        this._setupTabs();
        this._updateTaskList();
    }

    /**
     * 更新任务列表
     */
    private _updateTaskList(): void {
        if (!this.taskContent) return;

        // 清空现有项
        this._itemNodes.forEach(node => node.destroy());
        this._itemNodes = [];

        // 获取当前类型的任务
        let tasks: TaskProgress[];
        switch (this._currentTab) {
            case TaskType.DAILY:
                tasks = taskManager.getDailyTasks();
                break;
            case TaskType.WEEKLY:
                tasks = taskManager.getWeeklyTasks();
                break;
            case TaskType.MAIN:
                tasks = taskManager.getMainTasks();
                break;
            default:
                tasks = [];
        }

        tasks.forEach((progress, index) => {
            const config = TaskConfigMap.get(progress.taskId);
            if (!config) return;

            const itemNode = this._createTaskItem(config, progress, index);
            this._itemNodes.push(itemNode);
        });
    }

    /**
     * 创建任务项
     */
    private _createTaskItem(config: TaskConfig, progress: TaskProgress, index: number): Node {
        const itemNode = this.taskItemPrefab
            ? instantiate(this.taskItemPrefab)
            : new Node(`Task_${config.id}`);

        itemNode.setPosition(new Vec3(0, -index * 100, 0));
        this.taskContent!.addChild(itemNode);

        // 设置名称
        const nameLabel = itemNode.getChildByName('Name')?.getComponent(Label);
        if (nameLabel) {
            nameLabel.string = config.name;
            nameLabel.color = STATUS_COLORS[progress.status];
        }

        // 设置描述
        const descLabel = itemNode.getChildByName('Description')?.getComponent(Label);
        if (descLabel) {
            descLabel.string = config.description;
        }

        // 设置进度
        const progressLabel = itemNode.getChildByName('Progress')?.getComponent(Label);
        if (progressLabel) {
            const condition = progress.conditions[0];
            const current = condition.current || 0;
            const target = condition.target;
            progressLabel.string = `${current}/${target}`;
        }

        // 设置进度条
        const progressBar = itemNode.getChildByName('ProgressBar')?.getComponent(ProgressBar);
        if (progressBar) {
            const condition = progress.conditions[0];
            const current = condition.current || 0;
            const target = condition.target;
            progressBar.progress = Math.min(current / target, 1);
        }

        // 设置奖励显示
        const rewardLabel = itemNode.getChildByName('Reward')?.getComponent(Label);
        if (rewardLabel) {
            const rewardParts: string[] = [];
            if (config.reward.gold) rewardParts.push(`金币x${config.reward.gold}`);
            if (config.reward.gems) rewardParts.push(`钻石x${config.reward.gems}`);
            if (config.reward.playerExp) rewardParts.push(`经验x${config.reward.playerExp}`);
            rewardLabel.string = rewardParts.join(' ');
        }

        // 设置状态按钮
        const statusButton = itemNode.getChildByName('StatusButton');
        if (statusButton) {
            const button = statusButton.getComponent(UIButton);
            const label = statusButton.getComponentInChildren(Label);

            switch (progress.status) {
                case TaskStatus.LOCKED:
                    if (label) label.string = '未解锁';
                    if (button) button.setEnabled(false);
                    break;
                case TaskStatus.AVAILABLE:
                    if (label) label.string = '接取';
                    if (button) button.setEnabled(true);
                    break;
                case TaskStatus.IN_PROGRESS:
                    if (label) label.string = '进行中';
                    if (button) button.setEnabled(false);
                    break;
                case TaskStatus.COMPLETED:
                    if (label) label.string = '领取';
                    if (button) {
                        button.setEnabled(true);
                        // 设置高亮效果
                    }
                    break;
                case TaskStatus.CLAIMED:
                    if (label) label.string = '已完成';
                    if (button) button.setEnabled(false);
                    break;
            }

            // 点击事件
            statusButton.off(Node.EventType.TOUCH_END);
            statusButton.on(Node.EventType.TOUCH_END, () => {
                this._onTaskAction(config.id, progress.status);
            });
        }

        return itemNode;
    }

    /**
     * 任务操作
     */
    private _onTaskAction(taskId: string, status: TaskStatus): void {
        switch (status) {
            case TaskStatus.AVAILABLE:
                taskManager.acceptTask(taskId);
                this._updateTaskList();
                break;
            case TaskStatus.COMPLETED:
                taskManager.claimReward(taskId);
                this._updateTaskList();
                this._updateStats();
                break;
        }
    }

    /**
     * 更新统计
     */
    private _updateStats(): void {
        if (this.statsLabel) {
            const total = taskManager.getTotalCompletedTasks();
            this.statsLabel.string = `累计完成任务: ${total}`;
        }

        // 更新一键领取按钮
        if (this.claimAllButton) {
            const claimable = taskManager.getClaimableTasks();
            const button = this.claimAllButton.getComponent(UIButton);
            if (button) {
                button.setEnabled(claimable.length > 0);
                const label = this.claimAllButton.getComponentInChildren(Label);
                if (label) {
                    label.string = claimable.length > 0
                        ? `一键领取(${claimable.length})`
                        : '无可领取';
                }
            }
        }
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        // 一键领取
        if (this.claimAllButton) {
            const btn = this.claimAllButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onClaimAll.bind(this));
            } else {
                this.claimAllButton.on(Node.EventType.TOUCH_END, this._onClaimAll, this);
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
        EventCenter.on(TaskEventType.COMPLETED, this._onTaskCompleted, this);
        EventCenter.on(TaskEventType.CLAIMED, this._onTaskClaimed, this);
        EventCenter.on(TaskEventType.REFRESHED, this._onTaskRefreshed, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(TaskEventType.COMPLETED, this._onTaskCompleted, this);
        EventCenter.off(TaskEventType.CLAIMED, this._onTaskClaimed, this);
        EventCenter.off(TaskEventType.REFRESHED, this._onTaskRefreshed, this);
    }

    /**
     * 任务完成回调
     */
    private _onTaskCompleted(data: { taskId: string }): void {
        this._updateTaskList();
        this._updateStats();
    }

    /**
     * 任务领取回调
     */
    private _onTaskClaimed(data: { taskId: string }): void {
        this._updateTaskList();
        this._updateStats();
    }

    /**
     * 任务刷新回调
     */
    private _onTaskRefreshed(data: { taskIds: string[] }): void {
        if (this._currentTab === TaskType.DAILY || this._currentTab === TaskType.WEEKLY) {
            this._updateTaskList();
        }
    }

    /**
     * 一键领取
     */
    private _onClaimAll(): void {
        const claimable = taskManager.getClaimableTasks();

        claimable.forEach(progress => {
            taskManager.claimReward(progress.taskId);
        });

        this._updateTaskList();
        this._updateStats();
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();
        this._unbindEvents();
    }
}