/**
 * 活动管理器
 * 管理活动的开启、进度、奖励领取
 * 遵循阿里巴巴开发者手册规范
 */

import {
    ActivityConfig,
    ActivityProgress,
    ActivityTaskProgress,
    ActivityState,
    ActivityType,
    ActivityEventType,
    ActivityEventData,
    ActivityListResult,
    ActivityDetailResult,
    ClaimActivityResult,
    ActivityTaskReward,
    ActivityInfo,
    ActivityTask
} from '../config/ActivityTypes';
import {
    activityConfigs,
    getActivityById,
    getActivitiesByType
} from '../config/activity.json';
import { EventCenter } from '../utils/EventTarget';
import { playerDataManager } from '../utils/PlayerDataManager';
import { rewardManager, RewardConfig } from '../utils/RewardManager';

/**
 * 活动管理器
 * 单例模式
 */
export class ActivityManager {
    private static _instance: ActivityManager | null = null;

    /** 活动进度 */
    private _progress: Map<string, ActivityProgress> = new Map();

    /** 活动状态缓存 */
    private _stateCache: Map<string, ActivityState> = new Map();

    /** 存储键 */
    private readonly SETTINGS_KEY = 'hmm_legacy_activity';

    /** 状态检查定时器 */
    private _checkTimer: any = null;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): ActivityManager {
        if (!ActivityManager._instance) {
            ActivityManager._instance = new ActivityManager();
        }
        return ActivityManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this._checkActivityStates();
        this._startStateCheckTimer();
        console.log('[ActivityManager] 初始化完成');
    }

    /**
     * 销毁
     */
    destroy(): void {
        if (this._checkTimer) {
            clearInterval(this._checkTimer);
            this._checkTimer = null;
        }
    }

    /**
     * 启动状态检查定时器
     */
    private _startStateCheckTimer(): void {
        // 每分钟检查一次活动状态
        this._checkTimer = setInterval(() => {
            this._checkActivityStates();
        }, 60 * 1000);
    }

    /**
     * 检查活动状态
     */
    private _checkActivityStates(): void {
        const now = Date.now();

        activityConfigs.forEach(activity => {
            const oldState = this._stateCache.get(activity.activityId);
            const newState = this._calculateActivityState(activity);

            this._stateCache.set(activity.activityId, newState);

            // 状态变化检测
            if (oldState && oldState !== newState) {
                if (oldState === ActivityState.NOT_STARTED && newState === ActivityState.ACTIVE) {
                    // 活动开始
                    this._onActivityStart(activity);
                } else if (oldState === ActivityState.ACTIVE && newState === ActivityState.ENDED) {
                    // 活动结束
                    this._onActivityEnd(activity);
                }
            }

            // 预告检测
            if (newState === ActivityState.NOT_STARTED && activity.previewTime > 0) {
                const previewStartTime = activity.startTime - activity.previewTime * 1000;
                if (now >= previewStartTime && now < activity.startTime) {
                    // 进入预告期
                    const eventData: ActivityEventData = { activityId: activity.activityId, activity };
                    EventCenter.emit(ActivityEventType.ACTIVITY_PREVIEW, eventData);
                }
            }
        });
    }

    /**
     * 计算活动状态
     */
    private _calculateActivityState(activity: ActivityConfig): ActivityState {
        const now = Date.now();

        if (activity.startTime > now) {
            return ActivityState.NOT_STARTED;
        }

        if (activity.endTime > 0 && activity.endTime <= now) {
            return ActivityState.ENDED;
        }

        return ActivityState.ACTIVE;
    }

    /**
     * 活动开始处理
     */
    private _onActivityStart(activity: ActivityConfig): void {
        console.log(`[ActivityManager] 活动开始：${activity.name}`);

        // 初始化活动进度
        this._getOrCreateProgress(activity.activityId);

        // 发送活动开始事件
        const eventData: ActivityEventData = { activityId: activity.activityId, activity };
        EventCenter.emit(ActivityEventType.ACTIVITY_START, eventData);

        // 发送活动开始邮件
        // this._sendActivityStartMail(activity);
    }

    /**
     * 活动结束处理
     */
    private _onActivityEnd(activity: ActivityConfig): void {
        console.log(`[ActivityManager] 活动结束：${activity.name}`);

        // 发送活动结束事件
        const eventData: ActivityEventData = { activityId: activity.activityId, activity };
        EventCenter.emit(ActivityEventType.ACTIVITY_END, eventData);

        // 发送未领取奖励到邮件
        this._sendUnclaimedRewardsToMail(activity);
    }

    /**
     * 发送未领取奖励到邮件
     */
    private _sendUnclaimedRewardsToMail(activity: ActivityConfig): void {
        const progress = this._progress.get(activity.activityId);
        if (!progress) {
            return;
        }

        // 检查未领取的奖励
        const unclaimedRewards: ActivityTaskReward[] = [];

        activity.tasks.forEach(task => {
            const taskProgress = progress.taskProgress.get(task.taskId);
            if (taskProgress && taskProgress.completed && !taskProgress.claimed) {
                unclaimedRewards.push(...task.rewards);
            }
        });

        if (unclaimedRewards.length > 0) {
            // TODO: 发送邮件
            console.log(`[ActivityManager] 活动结束，未领取奖励已发送到邮件: ${unclaimedRewards.length}个`);
        }
    }

    /**
     * 获取或创建活动进度
     */
    private _getOrCreateProgress(activityId: string): ActivityProgress {
        if (!this._progress.has(activityId)) {
            this._progress.set(activityId, {
                activityId,
                taskProgress: new Map(),
                totalProgress: 0,
                joinTime: Date.now(),
                updateTime: Date.now()
            });
        }
        return this._progress.get(activityId)!;
    }

    /**
     * 获取活动列表
     */
    getActivityList(type?: ActivityType): ActivityListResult {
        let activities = [...activityConfigs];

        // 过滤类型
        if (type) {
            activities = activities.filter(a => a.type === type);
        }

        // 过滤已关闭的活动
        activities = activities.filter(a => this._stateCache.get(a.activityId) !== ActivityState.DISABLED);

        // 计算数量
        const activeCount = activities.filter(
            a => this._stateCache.get(a.activityId) === ActivityState.ACTIVE
        ).length;
        const previewCount = activities.filter(a => {
            const state = this._stateCache.get(a.activityId);
            if (state !== ActivityState.NOT_STARTED) return false;
            const previewStartTime = a.startTime - a.previewTime * 1000;
            return Date.now() >= previewStartTime;
        }).length;

        // 排序：进行中 > 预告中 > 已结束
        activities.sort((a, b) => {
            const stateA = this._stateCache.get(a.activityId) || ActivityState.NOT_STARTED;
            const stateB = this._stateCache.get(b.activityId) || ActivityState.NOT_STARTED;

            const orderA = stateA === ActivityState.ACTIVE ? 0 : stateA === ActivityState.NOT_STARTED ? 1 : 2;
            const orderB = stateB === ActivityState.ACTIVE ? 0 : stateB === ActivityState.NOT_STARTED ? 1 : 2;

            if (orderA !== orderB) {
                return orderA - orderB;
            }

            return a.startTime - b.startTime;
        });

        return { activities, activeCount, previewCount };
    }

    /**
     * 获取活动详情
     */
    getActivityDetail(activityId: string): ActivityDetailResult | null {
        const activity = getActivityById(activityId);
        if (!activity) {
            return null;
        }

        const progress = this._getOrCreateProgress(activityId);
        const state = this._stateCache.get(activityId) || this._calculateActivityState(activity);

        // 构建 ActivityInfo
        const info: ActivityInfo = {
            id: activity.activityId,
            type: activity.type,
            name: activity.name,
            description: activity.description,
            icon: activity.icon,
            startTime: activity.startTime,
            endTime: activity.endTime
        };

        // 构建 ActivityTask 列表
        const tasks: ActivityTask[] = activity.tasks.map(task => {
            const taskProgress = progress.taskProgress.get(task.taskId);
            return {
                id: task.taskId,
                name: task.name,
                currentProgress: taskProgress?.current || 0,
                targetProgress: task.condition.target,
                claimed: taskProgress?.claimed || false,
                rewards: task.rewards
            };
        });

        return { info, tasks, progress, state };
    }

    /**
     * 获取活动状态
     */
    getActivityState(activityId: string): ActivityState {
        return this._stateCache.get(activityId) || ActivityState.NOT_STARTED;
    }

    /**
     * 检查活动是否开启
     */
    isActivityActive(activityId: string): boolean {
        return this.getActivityState(activityId) === ActivityState.ACTIVE;
    }

    /**
     * 更新任务进度
     */
    updateProgress(conditionType: string, value: number, params?: Record<string, any>): void {
        // 遍历所有进行中的活动
        activityConfigs.forEach(activity => {
            if (!this.isActivityActive(activity.activityId)) {
                return;
            }

            // 检查等级限制
            if (activity.levelRequired && playerDataManager.getPlayerLevel() < activity.levelRequired) {
                return;
            }

            // 检查VIP限制
            // if (activity.vipRequired && playerDataManager.getVipLevel() < activity.vipRequired) {
            //     return;
            // }

            const progress = this._getOrCreateProgress(activity.activityId);

            // 更新任务进度
            activity.tasks.forEach(task => {
                if (task.condition.type !== conditionType) {
                    return;
                }

                // 检查参数匹配
                if (task.condition.params && params) {
                    const keys = Object.keys(task.condition.params);
                    for (const key of keys) {
                        if (task.condition.params[key] !== params[key]) {
                            return;
                        }
                    }
                }

                let taskProgress = progress.taskProgress.get(task.taskId);
                if (!taskProgress) {
                    taskProgress = {
                        taskId: task.taskId,
                        current: 0,
                        target: task.condition.target,
                        completed: false,
                        claimed: false
                    };
                    progress.taskProgress.set(task.taskId, taskProgress);
                }

                // 已完成或已领取不再更新
                if (taskProgress.completed) {
                    return;
                }

                // 更新进度
                switch (task.progressType) {
                    case 'accumulated':
                        taskProgress.current += value;
                        break;
                    case 'single':
                        taskProgress.current = value;
                        break;
                    case 'continuous':
                        taskProgress.current = value;
                        break;
                }

                // 检查是否完成
                if (taskProgress.current >= taskProgress.target) {
                    taskProgress.current = taskProgress.target;
                    taskProgress.completed = true;
                    taskProgress.completeTime = Date.now();

                    // 发送任务完成事件
                    const eventData: ActivityEventData = {
                        activityId: activity.activityId,
                        taskId: task.taskId,
                        taskProgress
                    };
                    EventCenter.emit(ActivityEventType.TASK_COMPLETE, eventData);

                    console.log(`[ActivityManager] 任务完成：${activity.name} - ${task.name}`);
                }

                // 发送进度更新事件
                const eventData: ActivityEventData = {
                    activityId: activity.activityId,
                    taskId: task.taskId,
                    taskProgress,
                    progressIncrement: value
                };
                EventCenter.emit(ActivityEventType.TASK_PROGRESS_UPDATE, eventData);
            });

            progress.updateTime = Date.now();
        });

        // 发送数据更新事件
        EventCenter.emit(ActivityEventType.ACTIVITY_DATA_UPDATE, {});
    }

    /**
     * 设置任务进度（用于一次性任务或特定场景）
     */
    setProgress(conditionType: string, value: number, params?: Record<string, any>): void {
        this.updateProgress(conditionType, value, params);
    }

    /**
     * 领取任务奖励
     */
    claimReward(activityId: string, taskId: string): ClaimActivityResult {
        const activity = getActivityById(activityId);
        if (!activity) {
            return {
                success: false,
                activityId,
                taskId,
                rewards: [],
                error: '活动不存在'
            };
        }

        if (!this.isActivityActive(activityId)) {
            return {
                success: false,
                activityId,
                taskId,
                rewards: [],
                error: '活动未开启'
            };
        }

        const progress = this._progress.get(activityId);
        if (!progress) {
            return {
                success: false,
                activityId,
                taskId,
                rewards: [],
                error: '活动进度不存在'
            };
        }

        const taskProgress = progress.taskProgress.get(taskId);
        if (!taskProgress) {
            return {
                success: false,
                activityId,
                taskId,
                rewards: [],
                error: '任务进度不存在'
            };
        }

        if (!taskProgress.completed) {
            return {
                success: false,
                activityId,
                taskId,
                rewards: [],
                error: '任务未完成'
            };
        }

        if (taskProgress.claimed) {
            return {
                success: false,
                activityId,
                taskId,
                rewards: [],
                error: '奖励已领取'
            };
        }

        // 找到任务配置
        const task = activity.tasks.find(t => t.taskId === taskId);
        if (!task) {
            return {
                success: false,
                activityId,
                taskId,
                rewards: [],
                error: '任务配置不存在'
            };
        }

        // 发放奖励
        const rewards = task.rewards;
        this._grantRewards(rewards);

        // 更新状态
        taskProgress.claimed = true;
        progress.updateTime = Date.now();

        // 发送奖励领取事件
        const eventData: ActivityEventData = {
            activityId,
            taskId,
            rewards
        };
        EventCenter.emit(ActivityEventType.REWARD_CLAIMED, eventData);

        console.log(`[ActivityManager] 领取奖励：${activity.name} - ${task.name}`);

        return {
            success: true,
            activityId,
            taskId,
            rewards
        };
    }

    /**
     * 一键领取所有奖励
     */
    claimAllRewards(activityId: string): ClaimActivityResult[] {
        const activity = getActivityById(activityId);
        if (!activity || !this.isActivityActive(activityId)) {
            return [];
        }

        const results: ClaimActivityResult[] = [];

        activity.tasks.forEach(task => {
            const progress = this._progress.get(activityId);
            const taskProgress = progress?.taskProgress.get(task.taskId);

            if (taskProgress && taskProgress.completed && !taskProgress.claimed) {
                const result = this.claimReward(activityId, task.taskId);
                if (result.success) {
                    results.push(result);
                }
            }
        });

        return results;
    }

    /**
     * 发放奖励
     */
    private _grantRewards(rewards: ActivityTaskReward[]): void {
        rewards.forEach(reward => {
            const rewardConfig: RewardConfig = {
                type: reward.type as any,
                itemId: reward.itemId,
                amount: reward.amount
            };

            const result = rewardManager.grantRewards([rewardConfig]);
            if (!result[0]?.success) {
                console.warn(`[ActivityManager] 发放奖励失败: ${reward.type} ${reward.itemId}`);
            }
        });
    }

    /**
     * 获取活动进度
     */
    getProgress(activityId: string): ActivityProgress | undefined {
        return this._progress.get(activityId);
    }

    /**
     * 获取任务进度
     */
    getTaskProgress(activityId: string, taskId: string): ActivityTaskProgress | undefined {
        const progress = this._progress.get(activityId);
        return progress?.taskProgress.get(taskId);
    }

    /**
     * 检查活动是否有可领取奖励
     */
    hasClaimableRewards(activityId: string): boolean {
        const progress = this._progress.get(activityId);
        if (!progress) {
            return false;
        }

        for (const taskProgress of progress.taskProgress.values()) {
            if (taskProgress.completed && !taskProgress.claimed) {
                return true;
            }
        }

        return false;
    }

    /**
     * 获取所有有可领取奖励的活动ID列表
     */
    getActivitiesWithClaimableRewards(): string[] {
        const result: string[] = [];

        this._progress.forEach((progress, activityId) => {
            if (this.isActivityActive(activityId) && this.hasClaimableRewards(activityId)) {
                result.push(activityId);
            }
        });

        return result;
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            progress: Array.from(this._progress.entries()).map(([id, progress]) => ({
                activityId: id,
                taskProgress: Array.from(progress.taskProgress.entries()),
                totalProgress: progress.totalProgress,
                joinTime: progress.joinTime,
                updateTime: progress.updateTime
            }))
        };
        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);
            if (parsed.progress) {
                this._progress.clear();
                parsed.progress.forEach((p: any) => {
                    this._progress.set(p.activityId, {
                        activityId: p.activityId,
                        taskProgress: new Map(p.taskProgress),
                        totalProgress: p.totalProgress,
                        joinTime: p.joinTime,
                        updateTime: p.updateTime
                    });
                });
            }
            // 检查活动状态
            this._checkActivityStates();
            console.log('[ActivityManager] 数据加载完成');
        } catch (e) {
            console.error('[ActivityManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._progress.clear();
        this._stateCache.clear();
    }
}

// 导出单例
export const activityManager = ActivityManager.getInstance();