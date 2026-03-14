/**
 * 随机事件系统类型定义
 * 游戏中随机发生的事件，增加游戏趣味性和策略性
 */

/**
 * 事件类型
 */
export enum RandomEventType {
    /** 发现宝物 */
    TREASURE_FOUND = 'treasure_found',
    /** 发现资源 */
    RESOURCE_FOUND = 'resource_found',
    /** 遭遇敌人 */
    ENEMY_ENCOUNTER = 'enemy_encounter',
    /** 神秘商人 */
    MYSTERIOUS_MERCHANT = 'mysterious_merchant',
    /** 幸运事件 */
    LUCKY_EVENT = 'lucky_event',
    /** 不幸事件 */
    UNLUCKY_EVENT = 'unlucky_event',
    /** 英雄事件 */
    HERO_EVENT = 'hero_event',
    /** 建筑事件 */
    BUILDING_EVENT = 'building_event',
    /** 特殊事件 */
    SPECIAL_EVENT = 'special_event'
}

/**
 * 事件稀有度
 */
export enum EventRarity {
    /** 普通 */
    COMMON = 'common',
    /** 稀有 */
    RARE = 'rare',
    /** 史诗 */
    EPIC = 'epic',
    /** 传说 */
    LEGENDARY = 'legendary'
}

/**
 * 事件触发场景
 */
export enum EventTriggerScene {
    /** 主城 */
    TOWN = 'town',
    /** 战斗前 */
    BEFORE_BATTLE = 'before_battle',
    /** 战斗后 */
    AFTER_BATTLE = 'after_battle',
    /** 探索 */
    EXPLORE = 'explore',
    /** 任意场景 */
    ANY = 'any'
}

/**
 * 事件选项
 */
export interface EventOption {
    /** 选项ID */
    id: string;
    /** 选项文本 */
    text: string;
    /** 选项描述 */
    description?: string;
    /** 选择所需条件 */
    requirements?: EventRequirement[];
    /** 选择后的效果 */
    effects: EventEffect[];
    /** 是否显示 */
    showCondition?: ConditionFormula;
}

/**
 * 事件需求
 */
export interface EventRequirement {
    /** 需求类型 */
    type: 'resource' | 'item' | 'level' | 'vip' | 'hero' | 'building';
    /** 需求ID */
    id: string;
    /** 需求数量 */
    amount: number;
}

/**
 * 事件效果
 */
export interface EventEffect {
    /** 效果类型 */
    type: 'add_resource' | 'remove_resource' | 'add_item' | 'remove_item' |
          'add_exp' | 'add_hero_exp' | 'buff' | 'debuff' |
          'unlock' | 'trigger_battle' | 'trigger_event' | 'nothing';
    /** 目标ID（资源类型/物品ID/英雄ID等） */
    targetId?: string;
    /** 数量 */
    amount?: number;
    /** 额外数据 */
    extra?: Record<string, any>;
}

/**
 * 条件公式
 */
export interface ConditionFormula {
    /** 条件类型 */
    type: 'and' | 'or' | 'compare' | 'random';
    /** 条件参数 */
    params?: any;
    /** 子条件 */
    conditions?: ConditionFormula[];
}

/**
 * 事件配置
 */
export interface RandomEventConfig {
    /** 事件ID */
    id: string;
    /** 事件名称 */
    name: string;
    /** 事件描述 */
    description: string;
    /** 事件类型 */
    type: RandomEventType;
    /** 稀有度 */
    rarity: EventRarity;
    /** 触发场景 */
    triggerScene: EventTriggerScene;
    /** 触发权重 */
    weight: number;
    /** 冷却时间（秒） */
    cooldown: number;
    /** 最大触发次数（0表示无限） */
    maxTriggers: number;
    /** 触发条件 */
    triggerConditions?: ConditionFormula[];
    /** 事件图标 */
    icon?: string;
    /** 事件背景图 */
    backgroundImage?: string;
    /** 事件选项 */
    options: EventOption[];
    /** 是否可跳过 */
    skippable: boolean;
    /** 自动关闭时间（秒，0表示不自动关闭） */
    autoCloseTime: number;
}

/**
 * 已触发事件记录
 */
export interface TriggeredEventRecord {
    /** 事件ID */
    eventId: string;
    /** 触发时间 */
    triggerTime: number;
    /** 选择的选项 */
    selectedOption?: string;
    /** 效果结果 */
    effectResults?: EventEffect[];
}

/**
 * 事件历史
 */
export interface EventHistory {
    /** 已触发事件记录 */
    triggeredEvents: TriggeredEventRecord[];
    /** 事件冷却结束时间映射 */
    cooldowns: Record<string, number>;
    /** 事件触发次数映射 */
    triggerCounts: Record<string, number>;
    /** 最后触发时间 */
    lastTriggerTime: number;
}

/**
 * 事件系统事件类型
 */
export enum RandomEventEventType {
    /** 事件触发 */
    EVENT_TRIGGERED = 'random_event_triggered',
    /** 事件完成 */
    EVENT_COMPLETED = 'random_event_completed',
    /** 选项选择 */
    OPTION_SELECTED = 'random_event_option_selected',
    /** 效果应用 */
    EFFECT_APPLIED = 'random_event_effect_applied',
    /** 冷却更新 */
    COOLDOWN_UPDATED = 'random_event_cooldown_updated'
}