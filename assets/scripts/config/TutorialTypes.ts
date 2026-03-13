/**
 * 新手引导系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

/**
 * 教程类型
 */
export enum TutorialType {
    /** 强制引导 - 必须完成才能继续 */
    MANDATORY = 'mandatory',
    /** 可选引导 - 可跳过 */
    OPTIONAL = 'optional',
    /** 情境提示 - 特定场景触发 */
    CONTEXTUAL = 'contextual'
}

/**
 * 引导步骤类型
 */
export enum StepType {
    /** 高亮UI元素 */
    HIGHLIGHT = 'highlight',
    /** 显示对话框 */
    DIALOG = 'dialog',
    /** 等待点击 */
    WAIT_TAP = 'wait_tap',
    /** 等待操作完成 */
    WAIT_ACTION = 'wait_action',
    /** 播放动画 */
    ANIMATION = 'animation',
    /** 延迟等待 */
    DELAY = 'delay',
    /** 触发事件 */
    TRIGGER_EVENT = 'trigger_event',
    /** 跳转场景 */
    GOTO_SCENE = 'goto_scene'
}

/**
 * 高亮形状
 */
export enum HighlightShape {
    /** 矩形 */
    RECTANGLE = 'rectangle',
    /** 圆形 */
    CIRCLE = 'circle',
    /** 自定义 */
    CUSTOM = 'custom'
}

/**
 * 对话框位置
 */
export enum DialogPosition {
    /** 顶部 */
    TOP = 'top',
    /** 底部 */
    BOTTOM = 'bottom',
    /** 左侧 */
    LEFT = 'left',
    /** 右侧 */
    RIGHT = 'right',
    /** 居中 */
    CENTER = 'center',
    /** 自动（根据高亮位置） */
    AUTO = 'auto'
}

/**
 * 引导步骤配置
 */
export interface TutorialStepConfig {
    /** 步骤ID */
    stepId: string;
    /** 步骤类型 */
    type: StepType;
    /** 步骤描述 */
    description?: string;
    /** 目标节点路径（用于高亮） */
    targetPath?: string;
    /** 高亮形状 */
    highlightShape?: HighlightShape;
    /** 高亮内边距 */
    highlightPadding?: number;
    /** 对话框配置 */
    dialog?: DialogConfig;
    /** 等待操作类型 */
    waitAction?: WaitActionConfig;
    /** 动画配置 */
    animation?: AnimationConfig;
    /** 延迟时间（毫秒） */
    delay?: number;
    /** 触发事件名 */
    eventName?: string;
    /** 跳转场景名 */
    sceneName?: string;
    /** 是否可跳过 */
    skippable?: boolean;
    /** 触发条件 */
    condition?: ConditionConfig;
    /** 完成后的回调 */
    onComplete?: string;
}

/**
 * 对话框配置
 */
export interface DialogConfig {
    /** 对话框位置 */
    position: DialogPosition;
    /** 讲述者名称 */
    speaker?: string;
    /** 对话内容 */
    content: string;
    /** 头像路径 */
    avatar?: string;
    /** 按钮文本 */
    buttonText?: string;
    /** 是否显示遮罩 */
    showMask?: boolean;
    /** 是否显示箭头指向 */
    showArrow?: boolean;
}

/**
 * 等待操作配置
 */
export interface WaitActionConfig {
    /** 操作类型 */
    actionType: WaitActionType;
    /** 目标节点路径 */
    targetPath?: string;
    /** 预期值 */
    expectedValue?: any;
    /** 超时时间（毫秒），0表示无超时 */
    timeout?: number;
}

/**
 * 等待操作类型
 */
export enum WaitActionType {
    /** 点击按钮 */
    TAP_BUTTON = 'tap_button',
    /** 拖拽操作 */
    DRAG = 'drag',
    /** 输入文本 */
    INPUT = 'input',
    /** 选择选项 */
    SELECT = 'select',
    /** 购买物品 */
    PURCHASE = 'purchase',
    /** 升级建筑 */
    UPGRADE_BUILDING = 'upgrade_building',
    /** 招募兵种 */
    RECRUIT_UNIT = 'recruit_unit',
    /** 开始战斗 */
    START_BATTLE = 'start_battle',
    /** 完成战斗 */
    FINISH_BATTLE = 'finish_battle',
    /** 使用技能 */
    USE_SKILL = 'use_skill'
}

/**
 * 动画配置
 */
export interface AnimationConfig {
    /** 动画类型 */
    type: AnimationType;
    /** 目标节点路径 */
    targetPath?: string;
    /** 动画时长 */
    duration: number;
    /** 动画参数 */
    params?: Record<string, any>;
}

/**
 * 动画类型
 */
export enum AnimationType {
    /** 淡入 */
    FADE_IN = 'fade_in',
    /** 淡出 */
    FADE_OUT = 'fade_out',
    /** 移动 */
    MOVE = 'move',
    /** 缩放 */
    SCALE = 'scale',
    /** 旋转 */
    ROTATE = 'rotate',
    /** 手指动画 */
    FINGER_POINT = 'finger_point'
}

/**
 * 条件配置
 */
export interface ConditionConfig {
    /** 条件类型 */
    type: ConditionType;
    /** 条件参数 */
    params?: Record<string, any>;
}

/**
 * 条件类型
 */
export enum ConditionType {
    /** 玩家等级 */
    PLAYER_LEVEL = 'player_level',
    /** 资源数量 */
    RESOURCE = 'resource',
    /** 建筑等级 */
    BUILDING_LEVEL = 'building_level',
    /** 英雄数量 */
    HERO_COUNT = 'hero_count',
    /** 完成关卡 */
    LEVEL_COMPLETED = 'level_completed',
    /** 完成教程 */
    TUTORIAL_COMPLETED = 'tutorial_completed',
    /** 自定义函数 */
    CUSTOM = 'custom'
}

/**
 * 教程配置
 */
export interface TutorialConfig {
    /** 教程ID */
    tutorialId: string;
    /** 教程名称 */
    name: string;
    /** 教程描述 */
    description?: string;
    /** 教程类型 */
    type: TutorialType;
    /** 触发条件 */
    trigger: TutorialTrigger;
    /** 步骤列表 */
    steps: TutorialStepConfig[];
    /** 完成奖励 */
    reward?: TutorialReward;
    /** 前置教程ID */
    prerequisiteIds?: string[];
    /** 优先级（数字越小优先级越高） */
    priority?: number;
    /** 最大触发次数 */
    maxTriggerCount?: number;
    /** 是否可重置 */
    resettable?: boolean;
}

/**
 * 教程触发条件
 */
export interface TutorialTrigger {
    /** 触发类型 */
    type: TriggerType;
    /** 触发延迟（毫秒） */
    delay?: number;
    /** 触发条件 */
    condition?: ConditionConfig;
    /** 场景限制 */
    sceneRestriction?: string[];
}

/**
 * 触发类型
 */
export enum TriggerType {
    /** 游戏启动 */
    GAME_START = 'game_start',
    /** 进入场景 */
    ENTER_SCENE = 'enter_scene',
    /** 完成教程 */
    TUTORIAL_COMPLETE = 'tutorial_complete',
    /** 达到等级 */
    LEVEL_REACH = 'level_reach',
    /** 解锁功能 */
    FEATURE_UNLOCK = 'feature_unlock',
    /** 首次进入 */
    FIRST_ENTER = 'first_enter',
    /** 手动触发 */
    MANUAL = 'manual'
}

/**
 * 教程奖励
 */
export interface TutorialReward {
    /** 金币 */
    gold?: number;
    /** 钻石 */
    gems?: number;
    /** 体力 */
    stamina?: number;
    /** 物品 */
    items?: RewardItem[];
    /** 经验 */
    exp?: number;
}

/**
 * 奖励物品
 */
export interface RewardItem {
    /** 物品ID */
    itemId: string;
    /** 数量 */
    count: number;
}

/**
 * 教程进度
 */
export interface TutorialProgress {
    /** 教程ID */
    tutorialId: string;
    /** 当前步骤索引 */
    currentStepIndex: number;
    /** 是否已完成 */
    completed: boolean;
    /** 是否跳过 */
    skipped: boolean;
    /** 触发次数 */
    triggerCount: number;
    /** 开始时间 */
    startTime?: number;
    /** 完成时间 */
    completeTime?: number;
    /** 最后更新时间 */
    updateTime: number;
}

/**
 * 教程状态
 */
export enum TutorialState {
    /** 未激活 */
    INACTIVE = 'inactive',
    /** 等待触发 */
    PENDING = 'pending',
    /** 进行中 */
    ACTIVE = 'active',
    /** 已完成 */
    COMPLETED = 'completed',
    /** 已跳过 */
    SKIPPED = 'skipped',
    /** 已暂停 */
    PAUSED = 'paused'
}

/**
 * 教程事件类型
 */
export enum TutorialEventType {
    /** 教程开始 */
    TUTORIAL_START = 'tutorial_start',
    /** 教程完成 */
    TUTORIAL_COMPLETE = 'tutorial_complete',
    /** 教程跳过 */
    TUTORIAL_SKIP = 'tutorial_skip',
    /** 步骤开始 */
    STEP_START = 'step_start',
    /** 步骤完成 */
    STEP_COMPLETE = 'step_complete',
    /** 步骤跳过 */
    STEP_SKIP = 'step_skip',
    /** 教程暂停 */
    TUTORIAL_PAUSE = 'tutorial_pause',
    /** 教程恢复 */
    TUTORIAL_RESUME = 'tutorial_resume',
    /** 教程重置 */
    TUTORIAL_RESET = 'tutorial_reset'
}

/**
 * 教程事件数据
 */
export interface TutorialEventData {
    /** 教程ID */
    tutorialId: string;
    /** 步骤索引 */
    stepIndex?: number;
    /** 步骤配置 */
    step?: TutorialStepConfig;
    /** 教程配置 */
    tutorial?: TutorialConfig;
    /** 奖励 */
    reward?: TutorialReward;
}