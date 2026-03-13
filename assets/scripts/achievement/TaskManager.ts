/**
 * 任务管理器
 * 管理每日任务、每周任务和主线任务
 */

import {
    TaskConfig,
    TaskProgress,
    TaskStatus,
    TaskType,
    TaskConditionType,
    TaskReward,
    TaskEvent
} from '../config/AchievementTypes';
import {
    DailyTaskTemplates,
    WeeklyTaskTemplates,
    MainTasks,
    TaskConfigMap
} from '../configs/achievements.json';
import { EventCenter } from '../utils/EventTarget';

/** 任务事件类型 */
export enum TaskEventType {
    ACCEPTED = 'task_accepted',
    PROGRESS_UPDATED = 'task_progress_updated',
    COMPLETED = 'task_completed',
    CLAIMED = 'task_claimed',
    REFRESHED = 'task_refreshed'
}

/** 任务事件数据 */
export interface TaskEventData {
    taskId?: string;
    taskIds?: string[];
    progress?: TaskProgress;
    reward?: TaskReward;
}

/**
 * 任务管理器
 */
export class TaskManager {
    private static _instance: TaskManager | null = null;

    /** 任务进度记录 */
    private _progress: Map<string, TaskProgress> = new Map();

    /** 当前激活的每日任务 */
    private _activeDailyTasks: string[] = [];

    /** 当前激活的每周任务 */
    private _activeWeeklyTasks: string[] = [];

    /** 上次每日刷新时间 */
    private _lastDailyRefresh: string = '';

    /** 上次每周刷新时间 */
    private _lastWeeklyRefresh: string = '';

    /** 每日任务完成数（用于成就） */
    private _totalCompletedTasks: number = 0;

    private constructor() {}

    static getInstance(): TaskManager {
        if (!TaskManager._instance) {
            TaskManager._instance = new TaskManager();
        }
        return TaskManager._instance;
    }

    /**
     * 初始化任务系统
     */
    init(): void {
        // 检查是否需要刷新任务
        this._checkTaskRefresh();

        // 初始化主线任务
        this._initMainTasks();

        console.log('[TaskManager] Initialized');
    }

    /**
     * 初始化主线任务
     */
    private _initMainTasks(): void {
        MainTasks.forEach(config => {
            if (!this._progress.has(config.id)) {
                const status = config.prerequisite
                    ? TaskStatus.LOCKED
                    : (config.autoAccept ? TaskStatus.IN_PROGRESS : TaskStatus.AVAILABLE);

                this._progress.set(config.id, {
                    taskId: config.id,
                    conditions: config.conditions.map(c => ({ ...c, current: 0 })),
                    status,
                    acceptedAt: config.autoAccept && !config.prerequisite ? Date.now() : undefined
                });
            }
        });
    }

    /**
     * 检查任务刷新
     */
    private _checkTaskRefresh(): void {
        const now = new Date();
        const today = now.toDateString();
        const weekStart = this._getWeekStart(now);

        // 检查每日刷新
        if (this._lastDailyRefresh !== today) {
            this._refreshDailyTasks();
            this._lastDailyRefresh = today;
        }

        // 检查每周刷新
        if (this._lastWeeklyRefresh !== weekStart) {
            this._refreshWeeklyTasks();
            this._lastWeeklyRefresh = weekStart;
        }
    }

    /**
     * 获取周开始日期字符串
     */
    private _getWeekStart(date: Date): string {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        return d.toDateString();
    }

    /**
     * 刷新每日任务
     */
    private _refreshDailyTasks(): void {
        // 归还旧任务
        this._activeDailyTasks.forEach(taskId => {
            const progress = this._progress.get(taskId);
            if (progress && progress.status !== TaskStatus.CLAIMED) {
                this._progress.delete(taskId);
            }
        });

        // 选择3-5个随机每日任务
        const shuffled = [...DailyTaskTemplates].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.floor(Math.random() * 3) + 3);

        this._activeDailyTasks = selected.map(config => {
            this._progress.set(config.id, {
                taskId: config.id,
                conditions: config.conditions.map(c => ({ ...c, current: 0 })),
                status: TaskStatus.IN_PROGRESS,
                acceptedAt: Date.now()
            });
            return config.id;
        });

        EventCenter.emit(TaskEventType.REFRESHED, {
            taskIds: this._activeDailyTasks
        });

        console.log('[TaskManager] Daily tasks refreshed:', this._activeDailyTasks.length);
    }

    /**
     * 刷新每周任务
     */
    private _refreshWeeklyTasks(): void {
        // 归还旧任务
        this._activeWeeklyTasks.forEach(taskId => {
            const progress = this._progress.get(taskId);
            if (progress && progress.status !== TaskStatus.CLAIMED) {
                this._progress.delete(taskId);
            }
        });

        // 选择2-3个随机每周任务
        const shuffled = [...WeeklyTaskTemplates].sort(() => Math.random() - 0.5);
        const selected = shuffled.slice(0, Math.floor(Math.random() * 2) + 2);

        this._activeWeeklyTasks = selected.map(config => {
            this._progress.set(config.id, {
                taskId: config.id,
                conditions: config.conditions.map(c => ({ ...c, current: 0 })),
                status: TaskStatus.IN_PROGRESS,
                acceptedAt: Date.now()
            });
            return config.id;
        });

        EventCenter.emit(TaskEventType.REFRESHED, {
            taskIds: this._activeWeeklyTasks
        });

        console.log('[TaskManager] Weekly tasks refreshed:', this._activeWeeklyTasks.length);
    }

    /**
     * 触发任务事件
     */
    triggerEvent(event: TaskEvent): void {
        const { type, value, params } = event;

        // 检查所有进行中的任务
        this._progress.forEach((progress, taskId) => {
            if (progress.status !== TaskStatus.IN_PROGRESS) return;

            const config = TaskConfigMap.get(taskId);
            if (!config) return;

            let updated = false;

            progress.conditions.forEach(condition => {
                if (condition.type === type) {
                    // 检查参数匹配
                    if (params && condition.params) {
                        const paramsMatch = Object.keys(condition.params).every(
                            key => condition.params![key] === params[key]
                        );
                        if (!paramsMatch) return;
                    }

                    condition.current = (condition.current || 0) + value;
                    updated = true;
                }
            });

            if (updated) {
                // 检查是否完成
                const completed = progress.conditions.every(
                    c => (c.current || 0) >= c.target
                );

                if (completed) {
                    progress.status = TaskStatus.COMPLETED;
                    progress.completedAt = Date.now();

                    this._totalCompletedTasks++;

                    EventCenter.emit(TaskEventType.COMPLETED, {
                        taskId,
                        progress
                    });

                    console.log(`[TaskManager] Task completed: ${config.name}`);
                } else {
                    EventCenter.emit(TaskEventType.PROGRESS_UPDATED, {
                        taskId,
                        progress
                    });
                }
            }
        });
    }

    /**
     * 接取任务
     */
    acceptTask(taskId: string): boolean {
        const config = TaskConfigMap.get(taskId);
        const progress = this._progress.get(taskId);

        if (!config) {
            console.warn(`[TaskManager] Task not found: ${taskId}`);
            return false;
        }

        if (progress && progress.status !== TaskStatus.AVAILABLE) {
            console.warn(`[TaskManager] Task not available: ${config.name}`);
            return false;
        }

        // 检查前置任务
        if (config.prerequisite) {
            const prereq = this._progress.get(config.prerequisite);
            if (!prereq || prereq.status !== TaskStatus.CLAIMED) {
                console.warn(`[TaskManager] Prerequisite not completed: ${config.prerequisite}`);
                return false;
            }
        }

        // 检查解锁等级
        if (config.unlockLevel) {
            // TODO: 检查玩家等级
        }

        this._progress.set(taskId, {
            taskId,
            conditions: config.conditions.map(c => ({ ...c, current: 0 })),
            status: TaskStatus.IN_PROGRESS,
            acceptedAt: Date.now()
        });

        EventCenter.emit(TaskEventType.ACCEPTED, { taskId });

        console.log(`[TaskManager] Task accepted: ${config.name}`);
        return true;
    }

    /**
     * 领取任务奖励
     */
    claimReward(taskId: string): TaskReward | null {
        const config = TaskConfigMap.get(taskId);
        const progress = this._progress.get(taskId);

        if (!config || !progress) {
            console.warn(`[TaskManager] Task not found: ${taskId}`);
            return null;
        }

        if (progress.status !== TaskStatus.COMPLETED) {
            console.warn(`[TaskManager] Task not completed: ${config.name}`);
            return null;
        }

        progress.status = TaskStatus.CLAIMED;
        progress.claimedAt = Date.now();

        // 解锁后续主线任务
        this._unlockNextMainTask(taskId);

        EventCenter.emit(TaskEventType.CLAIMED, {
            taskId,
            reward: config.reward
        });

        console.log(`[TaskManager] Reward claimed: ${config.name}`);

        return config.reward;
    }

    /**
     * 解锁下一个主线任务
     */
    private _unlockNextMainTask(completedTaskId: string): void {
        MainTasks.forEach(config => {
            if (config.prerequisite === completedTaskId) {
                const progress = this._progress.get(config.id);
                if (progress && progress.status === TaskStatus.LOCKED) {
                    progress.status = config.autoAccept ? TaskStatus.IN_PROGRESS : TaskStatus.AVAILABLE;
                    if (config.autoAccept) {
                        progress.acceptedAt = Date.now();
                    }
                    console.log(`[TaskManager] Unlocked next task: ${config.name}`);
                }
            }
        });
    }

    /**
     * 刷新单个任务（消耗钻石）
     */
    refreshTask(taskId: string): boolean {
        const progress = this._progress.get(taskId);
        const config = TaskConfigMap.get(taskId);

        if (!progress || !config || !config.refreshable) {
            return false;
        }

        // 重置任务进度
        progress.conditions = config.conditions.map(c => ({ ...c, current: 0 }));
        progress.status = TaskStatus.IN_PROGRESS;
        progress.acceptedAt = Date.now();

        EventCenter.emit(TaskEventType.REFRESHED, { taskIds: [taskId] });

        return true;
    }

    /**
     * 获取任务进度
     */
    getProgress(taskId: string): TaskProgress | null {
        return this._progress.get(taskId) || null;
    }

    /**
     * 获取当前每日任务
     */
    getDailyTasks(): TaskProgress[] {
        return this._activeDailyTasks
            .map(id => this._progress.get(id))
            .filter((p): p is TaskProgress => p !== undefined);
    }

    /**
     * 获取当前每周任务
     */
    getWeeklyTasks(): TaskProgress[] {
        return this._activeWeeklyTasks
            .map(id => this._progress.get(id))
            .filter((p): p is TaskProgress => p !== undefined);
    }

    /**
     * 获取主线任务
     */
    getMainTasks(): TaskProgress[] {
        return MainTasks
            .map(config => this._progress.get(config.id))
            .filter((p): p is TaskProgress => p !== undefined);
    }

    /**
     * 获取可领取的任务
     */
    getClaimableTasks(): TaskProgress[] {
        return Array.from(this._progress.values())
            .filter(p => p.status === TaskStatus.COMPLETED);
    }

    /**
     * 获取任务完成总数
     */
    getTotalCompletedTasks(): number {
        return this._totalCompletedTasks;
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            progress: Array.from(this._progress.entries()),
            activeDailyTasks: this._activeDailyTasks,
            activeWeeklyTasks: this._activeWeeklyTasks,
            lastDailyRefresh: this._lastDailyRefresh,
            lastWeeklyRefresh: this._lastWeeklyRefresh,
            totalCompletedTasks: this._totalCompletedTasks
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
                this._progress = new Map(parsed.progress);
            }

            if (parsed.activeDailyTasks) {
                this._activeDailyTasks = parsed.activeDailyTasks;
            }

            if (parsed.activeWeeklyTasks) {
                this._activeWeeklyTasks = parsed.activeWeeklyTasks;
            }

            if (parsed.lastDailyRefresh) {
                this._lastDailyRefresh = parsed.lastDailyRefresh;
            }

            if (parsed.lastWeeklyRefresh) {
                this._lastWeeklyRefresh = parsed.lastWeeklyRefresh;
            }

            if (parsed.totalCompletedTasks !== undefined) {
                this._totalCompletedTasks = parsed.totalCompletedTasks;
            }

            // 检查刷新
            this._checkTaskRefresh();

            console.log('[TaskManager] Data loaded');
        } catch (e) {
            console.error('[TaskManager] Failed to deserialize:', e);
        }
    }

    /**
     * 清除所有数据
     */
    clear(): void {
        this._progress.clear();
        this._activeDailyTasks = [];
        this._activeWeeklyTasks = [];
        this._lastDailyRefresh = '';
        this._lastWeeklyRefresh = '';
        this._totalCompletedTasks = 0;

        this.init();
    }
}

// 导出单例
export const taskManager = TaskManager.getInstance();