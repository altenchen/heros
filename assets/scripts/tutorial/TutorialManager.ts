/**
 * 新手引导管理器
 * 管理教程的触发、执行、进度保存
 * 遵循阿里巴巴开发者手册规范
 */

import {
    TutorialConfig,
    TutorialProgress,
    TutorialState,
    TutorialStepConfig,
    TutorialEventType,
    TutorialEventData,
    TutorialType,
    TriggerType,
    StepType,
    ConditionType
} from '../config/TutorialTypes';
import { tutorials, getTutorialById } from '../config/tutorials.json';
import { EventCenter } from '../utils/EventTarget';
import { playerDataManager } from '../utils/PlayerDataManager';

/**
 * 教程管理器
 */
export class TutorialManager {
    private static _instance: TutorialManager | null = null;

    /** 教程进度记录 */
    private _progress: Map<string, TutorialProgress> = new Map();

    /** 当前活动的教程 */
    private _activeTutorial: TutorialConfig | null = null;

    /** 当前步骤索引 */
    private _currentStepIndex: number = 0;

    /** 教程状态 */
    private _state: TutorialState = TutorialState.INACTIVE;

    /** 暂停的教程 */
    private _pausedTutorial: TutorialConfig | null = null;

    /** 暂停时的步骤索引 */
    private _pausedStepIndex: number = 0;

    /** 待触发的教程队列 */
    private _pendingQueue: TutorialConfig[] = [];

    /** 步骤完成回调 */
    private _stepCompleteCallback: (() => void) | null = null;

    /** 等待操作超时计时器 */
    private _waitTimeout: any = null;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): TutorialManager {
        if (!TutorialManager._instance) {
            TutorialManager._instance = new TutorialManager();
        }
        return TutorialManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        console.log('[TutorialManager] 初始化完成');
    }

    /**
     * 检查并触发教程
     * @param triggerType 触发类型
     * @param params 触发参数
     */
    checkAndTrigger(triggerType: TriggerType, params?: any): void {
        // 如果有活动的教程，不触发新教程
        if (this._state === TutorialState.ACTIVE) {
            // 加入待触发队列
            const matched = this._findMatchingTutorials(triggerType, params);
            this._pendingQueue.push(...matched);
            return;
        }

        const matched = this._findMatchingTutorials(triggerType, params);

        if (matched.length > 0) {
            // 按优先级排序
            matched.sort((a, b) => (a.priority || 100) - (b.priority || 100));

            // 触发最高优先级的教程
            this._startTutorial(matched[0]);
        }
    }

    /**
     * 查找匹配的教程
     */
    private _findMatchingTutorials(triggerType: TriggerType, params?: any): TutorialConfig[] {
        return tutorials.filter(tutorial => {
            // 检查触发类型
            if (tutorial.trigger.type !== triggerType) {
                return false;
            }

            // 检查是否已完成（强制教程只能触发一次）
            const progress = this._progress.get(tutorial.tutorialId);
            if (progress && progress.completed) {
                if (tutorial.type === TutorialType.MANDATORY || !tutorial.resettable) {
                    return false;
                }
            }

            // 检查触发次数限制
            if (tutorial.maxTriggerCount && progress && progress.triggerCount >= tutorial.maxTriggerCount) {
                return false;
            }

            // 检查前置教程
            if (tutorial.prerequisiteIds && tutorial.prerequisiteIds.length > 0) {
                for (const prereqId of tutorial.prerequisiteIds) {
                    const prereqProgress = this._progress.get(prereqId);
                    if (!prereqProgress || !prereqProgress.completed) {
                        return false;
                    }
                }
            }

            // 检查触发条件
            if (tutorial.trigger.condition) {
                if (!this._checkCondition(tutorial.trigger.condition, params)) {
                    return false;
                }
            }

            // 检查场景限制
            if (tutorial.trigger.sceneRestriction && params?.sceneName) {
                if (!tutorial.trigger.sceneRestriction.includes(params.sceneName)) {
                    return false;
                }
            }

            return true;
        });
    }

    /**
     * 检查条件
     */
    private _checkCondition(condition: any, params?: any): boolean {
        switch (condition.type) {
            case ConditionType.PLAYER_LEVEL:
                const playerLevel = playerDataManager.getPlayerLevel();
                return playerLevel >= (condition.params?.level || 0);

            case ConditionType.RESOURCE:
                const resourceAmount = playerDataManager.getResource(condition.params.resourceId);
                return resourceAmount >= (condition.params.minValue || 0) &&
                       resourceAmount <= (condition.params.maxValue || Infinity);

            case ConditionType.TUTORIAL_COMPLETED:
                const tutorialProgress = this._progress.get(condition.params.tutorialId);
                return tutorialProgress?.completed || false;

            case ConditionType.LEVEL_COMPLETED:
                // 检查关卡完成情况
                return true; // TODO: 实现关卡检查

            default:
                return true;
        }
    }

    /**
     * 开始教程
     */
    private _startTutorial(tutorial: TutorialConfig): void {
        // 检查延迟触发
        if (tutorial.trigger.delay && tutorial.trigger.delay > 0) {
            setTimeout(() => {
                this._doStartTutorial(tutorial);
            }, tutorial.trigger.delay);
        } else {
            this._doStartTutorial(tutorial);
        }
    }

    /**
     * 实际开始教程
     */
    private _doStartTutorial(tutorial: TutorialConfig): void {
        // 获取或创建进度
        let progress = this._progress.get(tutorial.tutorialId);
        if (!progress) {
            progress = {
                tutorialId: tutorial.tutorialId,
                currentStepIndex: 0,
                completed: false,
                skipped: false,
                triggerCount: 0,
                updateTime: Date.now()
            };
            this._progress.set(tutorial.tutorialId, progress);
        }

        // 更新触发次数
        progress.triggerCount++;
        progress.startTime = Date.now();
        progress.currentStepIndex = 0;
        progress.updateTime = Date.now();

        this._activeTutorial = tutorial;
        this._currentStepIndex = 0;
        this._state = TutorialState.ACTIVE;

        // 发送事件
        const eventData: TutorialEventData = {
            tutorialId: tutorial.tutorialId,
            tutorial
        };
        EventCenter.emit(TutorialEventType.TUTORIAL_START, eventData);

        console.log(`[TutorialManager] 开始教程: ${tutorial.name}`);

        // 执行第一步
        this._executeStep(0);
    }

    /**
     * 执行步骤
     */
    private _executeStep(stepIndex: number): void {
        if (!this._activeTutorial) {
            return;
        }

        const steps = this._activeTutorial.steps;
        if (stepIndex < 0 || stepIndex >= steps.length) {
            return;
        }

        const step = steps[stepIndex];
        this._currentStepIndex = stepIndex;

        // 发送步骤开始事件
        const eventData: TutorialEventData = {
            tutorialId: this._activeTutorial.tutorialId,
            stepIndex,
            step
        };
        EventCenter.emit(TutorialEventType.STEP_START, eventData);

        console.log(`[TutorialManager] 执行步骤 ${stepIndex + 1}/${steps.length}: ${step.description || step.stepId}`);

        // 根据步骤类型执行
        switch (step.type) {
            case StepType.DIALOG:
                this._executeDialogStep(step);
                break;

            case StepType.HIGHLIGHT:
                this._executeHighlightStep(step);
                break;

            case StepType.WAIT_TAP:
                this._executeWaitTapStep(step);
                break;

            case StepType.WAIT_ACTION:
                this._executeWaitActionStep(step);
                break;

            case StepType.DELAY:
                this._executeDelayStep(step);
                break;

            case StepType.TRIGGER_EVENT:
                this._executeTriggerEventStep(step);
                break;

            case StepType.GOTO_SCENE:
                this._executeGotoSceneStep(step);
                break;

            case StepType.ANIMATION:
                this._executeAnimationStep(step);
                break;

            default:
                // 未知类型，直接完成
                this._completeStep();
                break;
        }
    }

    /**
     * 执行对话框步骤
     */
    private _executeDialogStep(step: TutorialStepConfig): void {
        // UI层会监听STEP_START事件并显示对话框
        // 用户点击按钮后会调用stepComplete
    }

    /**
     * 执行高亮步骤
     */
    private _executeHighlightStep(step: TutorialStepConfig): void {
        // UI层会监听STEP_START事件并显示高亮
    }

    /**
     * 执行等待点击步骤
     */
    private _executeWaitTapStep(step: TutorialStepConfig): void {
        // UI层处理
    }

    /**
     * 执行等待操作步骤
     */
    private _executeWaitActionStep(step: TutorialStepConfig): void {
        if (step.waitAction?.timeout && step.waitAction.timeout > 0) {
            this._waitTimeout = setTimeout(() => {
                console.warn('[TutorialManager] 等待操作超时');
                this._completeStep();
            }, step.waitAction.timeout);
        }
    }

    /**
     * 执行延迟步骤
     */
    private _executeDelayStep(step: TutorialStepConfig): void {
        const delay = step.delay || 1000;
        setTimeout(() => {
            this._completeStep();
        }, delay);
    }

    /**
     * 执行触发事件步骤
     */
    private _executeTriggerEventStep(step: TutorialStepConfig): void {
        if (step.eventName) {
            EventCenter.emit(step.eventName);
        }
        this._completeStep();
    }

    /**
     * 执行跳转场景步骤
     */
    private _executeGotoSceneStep(step: TutorialStepConfig): void {
        if (step.sceneName) {
            // 发送场景切换事件
            EventCenter.emit('change_scene', { sceneName: step.sceneName });
        }
        this._completeStep();
    }

    /**
     * 执行动画步骤
     */
    private _executeAnimationStep(step: TutorialStepConfig): void {
        // UI层处理动画
        const duration = step.animation?.duration || 1000;
        setTimeout(() => {
            this._completeStep();
        }, duration);
    }

    /**
     * 步骤完成回调（由UI层调用）
     */
    stepComplete(): void {
        if (this._waitTimeout) {
            clearTimeout(this._waitTimeout);
            this._waitTimeout = null;
        }

        this._completeStep();
    }

    /**
     * 完成当前步骤
     */
    private _completeStep(): void {
        if (!this._activeTutorial) {
            return;
        }

        const step = this._activeTutorial.steps[this._currentStepIndex];

        // 发送步骤完成事件
        const eventData: TutorialEventData = {
            tutorialId: this._activeTutorial.tutorialId,
            stepIndex: this._currentStepIndex,
            step
        };
        EventCenter.emit(TutorialEventType.STEP_COMPLETE, eventData);

        // 更新进度
        const progress = this._progress.get(this._activeTutorial.tutorialId);
        if (progress) {
            progress.currentStepIndex = this._currentStepIndex + 1;
            progress.updateTime = Date.now();
        }

        // 检查是否完成所有步骤
        if (this._currentStepIndex + 1 >= this._activeTutorial.steps.length) {
            this._completeTutorial();
        } else {
            // 执行下一步
            this._executeStep(this._currentStepIndex + 1);
        }
    }

    /**
     * 完成教程
     */
    private _completeTutorial(): void {
        if (!this._activeTutorial) {
            return;
        }

        const tutorial = this._activeTutorial;

        // 更新进度
        const progress = this._progress.get(tutorial.tutorialId);
        if (progress) {
            progress.completed = true;
            progress.completeTime = Date.now();
            progress.updateTime = Date.now();
        }

        // 发放奖励
        if (tutorial.reward) {
            this._grantReward(tutorial.reward);
        }

        // 发送完成事件
        const eventData: TutorialEventData = {
            tutorialId: tutorial.tutorialId,
            tutorial,
            reward: tutorial.reward
        };
        EventCenter.emit(TutorialEventType.TUTORIAL_COMPLETE, eventData);

        console.log(`[TutorialManager] 完成教程: ${tutorial.name}`);

        // 重置状态
        this._activeTutorial = null;
        this._currentStepIndex = 0;
        this._state = TutorialState.INACTIVE;

        // 触发后续教程
        this.checkAndTrigger(TriggerType.TUTORIAL_COMPLETE, { tutorialId: tutorial.tutorialId });

        // 检查待触发队列
        if (this._pendingQueue.length > 0) {
            const next = this._pendingQueue.shift();
            if (next) {
                this._startTutorial(next);
            }
        }
    }

    /**
     * 发放奖励
     */
    private _grantReward(reward: any): void {
        if (reward.gold) {
            playerDataManager.addResource('gold', reward.gold);
        }
        if (reward.gems) {
            playerDataManager.addResource('gems', reward.gems);
        }
        if (reward.stamina) {
            playerDataManager.addResource('stamina', reward.stamina);
        }
        if (reward.exp) {
            playerDataManager.addExperience(reward.exp);
        }
        // TODO: 处理物品奖励

        console.log('[TutorialManager] 发放奖励:', reward);
    }

    /**
     * 跳过当前教程
     */
    skipTutorial(): void {
        if (!this._activeTutorial) {
            return;
        }

        const tutorial = this._activeTutorial;

        // 检查是否可跳过
        const step = tutorial.steps[this._currentStepIndex];
        if (step && step.skippable === false) {
            console.warn('[TutorialManager] 当前步骤不可跳过');
            return;
        }

        // 强制教程不能跳过
        if (tutorial.type === TutorialType.MANDATORY) {
            console.warn('[TutorialManager] 强制教程不能跳过');
            return;
        }

        // 更新进度
        const progress = this._progress.get(tutorial.tutorialId);
        if (progress) {
            progress.skipped = true;
            progress.updateTime = Date.now();
        }

        // 发送跳过事件
        const eventData: TutorialEventData = {
            tutorialId: tutorial.tutorialId,
            tutorial
        };
        EventCenter.emit(TutorialEventType.TUTORIAL_SKIP, eventData);

        console.log(`[TutorialManager] 跳过教程: ${tutorial.name}`);

        // 重置状态
        this._activeTutorial = null;
        this._currentStepIndex = 0;
        this._state = TutorialState.INACTIVE;
    }

    /**
     * 暂停教程
     */
    pauseTutorial(): void {
        if (this._state !== TutorialState.ACTIVE || !this._activeTutorial) {
            return;
        }

        this._pausedTutorial = this._activeTutorial;
        this._pausedStepIndex = this._currentStepIndex;
        this._state = TutorialState.PAUSED;
        this._activeTutorial = null;

        // 发送暂停事件
        EventCenter.emit(TutorialEventType.TUTORIAL_PAUSE, {
            tutorialId: this._pausedTutorial.tutorialId
        });

        console.log(`[TutorialManager] 暂停教程: ${this._pausedTutorial.name}`);
    }

    /**
     * 恢复教程
     */
    resumeTutorial(): void {
        if (this._state !== TutorialState.PAUSED || !this._pausedTutorial) {
            return;
        }

        this._activeTutorial = this._pausedTutorial;
        this._currentStepIndex = this._pausedStepIndex;
        this._state = TutorialState.ACTIVE;
        this._pausedTutorial = null;

        // 发送恢复事件
        EventCenter.emit(TutorialEventType.TUTORIAL_RESUME, {
            tutorialId: this._activeTutorial.tutorialId
        });

        console.log(`[TutorialManager] 恢复教程: ${this._activeTutorial.name}`);

        // 继续执行
        this._executeStep(this._currentStepIndex);
    }

    /**
     * 重置教程
     */
    resetTutorial(tutorialId: string): void {
        const tutorial = getTutorialById(tutorialId);
        if (!tutorial) {
            return;
        }

        if (!tutorial.resettable && tutorial.type === TutorialType.MANDATORY) {
            console.warn('[TutorialManager] 强制教程不可重置');
            return;
        }

        this._progress.delete(tutorialId);

        EventCenter.emit(TutorialEventType.TUTORIAL_RESET, { tutorialId });

        console.log(`[TutorialManager] 重置教程: ${tutorialId}`);
    }

    /**
     * 获取当前教程
     */
    getActiveTutorial(): TutorialConfig | null {
        return this._activeTutorial;
    }

    /**
     * 获取当前步骤
     */
    getCurrentStep(): TutorialStepConfig | null {
        if (!this._activeTutorial) {
            return null;
        }
        return this._activeTutorial.steps[this._currentStepIndex] || null;
    }

    /**
     * 获取当前步骤索引
     */
    getCurrentStepIndex(): number {
        return this._currentStepIndex;
    }

    /**
     * 获取教程状态
     */
    getState(): TutorialState {
        return this._state;
    }

    /**
     * 获取教程进度
     */
    getProgress(tutorialId: string): TutorialProgress | undefined {
        return this._progress.get(tutorialId);
    }

    /**
     * 检查教程是否完成
     */
    isTutorialCompleted(tutorialId: string): boolean {
        const progress = this._progress.get(tutorialId);
        return progress?.completed || false;
    }

    /**
     * 获取所有已完成的教程ID
     */
    getCompletedTutorialIds(): string[] {
        const completed: string[] = [];
        this._progress.forEach((progress, id) => {
            if (progress.completed) {
                completed.push(id);
            }
        });
        return completed;
    }

    /**
     * 设置步骤完成回调
     */
    setStepCompleteCallback(callback: () => void): void {
        this._stepCompleteCallback = callback;
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            progress: Array.from(this._progress.entries())
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
            console.log('[TutorialManager] 数据加载完成');
        } catch (e) {
            console.error('[TutorialManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._progress.clear();
        this._activeTutorial = null;
        this._currentStepIndex = 0;
        this._state = TutorialState.INACTIVE;
        this._pausedTutorial = null;
        this._pausedStepIndex = 0;
        this._pendingQueue = [];

        if (this._waitTimeout) {
            clearTimeout(this._waitTimeout);
            this._waitTimeout = null;
        }
    }
}

// 导出单例
export const tutorialManager = TutorialManager.getInstance();