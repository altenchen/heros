/**
 * 随机事件管理器
 * 管理游戏中的随机事件触发和处理
 */

import { EventCenter } from '../utils/EventTarget';
import {
    RandomEventType,
    EventRarity,
    EventTriggerScene,
    RandomEventConfig,
    EventOption,
    EventEffect,
    TriggeredEventRecord,
    EventHistory,
    RandomEventEventType
} from '../config/RandomEventTypes';
import {
    RANDOM_EVENT_CONFIGS,
    getRandomEventConfig,
    getRandomEventsByScene
} from '../configs/random_events.json';

/**
 * 事件触发结果
 */
interface TriggerResult {
    success: boolean;
    event?: RandomEventConfig;
    reason?: string;
}

/**
 * 选项选择结果
 */
interface SelectResult {
    success: boolean;
    effects?: EventEffect[];
    reason?: string;
}

/**
 * 随机事件管理器类
 */
export class RandomEventManager {
    private static instance: RandomEventManager | null = null;

    /** 事件配置 */
    private eventConfigs: Map<string, RandomEventConfig> = new Map();

    /** 事件历史 */
    private eventHistory: EventHistory;

    /** 当前活动事件 */
    private activeEvent: RandomEventConfig | null = null;

    /** 是否已初始化 */
    private initialized: boolean = false;

    /** 随机种子 */
    private randomSeed: number = 0;

    private constructor() {
        this.eventHistory = {
            triggeredEvents: [],
            cooldowns: {},
            triggerCounts: {},
            lastTriggerTime: 0
        };
    }

    /**
     * 获取单例
     */
    static getInstance(): RandomEventManager {
        if (!RandomEventManager.instance) {
            RandomEventManager.instance = new RandomEventManager();
        }
        return RandomEventManager.instance;
    }

    /**
     * 初始化
     */
    init(): void {
        if (this.initialized) return;

        // 加载事件配置
        RANDOM_EVENT_CONFIGS.forEach(config => {
            this.eventConfigs.set(config.id, config);
        });

        // 初始化随机种子
        this.randomSeed = Date.now();

        this.initialized = true;
        console.log('[RandomEventManager] 初始化完成，加载事件配置:', this.eventConfigs.size);
    }

    /**
     * 生成随机数
     */
    private random(): number {
        this.randomSeed = (this.randomSeed * 9301 + 49297) % 233280;
        return this.randomSeed / 233280;
    }

    /**
     * 尝试触发随机事件
     * @param scene 触发场景
     * @param context 上下文数据
     */
    tryTriggerEvent(scene: EventTriggerScene, context?: Record<string, any>): TriggerResult {
        const now = Date.now();

        // 获取场景可用事件
        const availableEvents = getRandomEventsByScene(scene).filter(event => {
            // 检查冷却
            const cooldownEnd = this.eventHistory.cooldowns[event.id] || 0;
            if (now < cooldownEnd) {
                return false;
            }

            // 检查最大触发次数
            if (event.maxTriggers > 0) {
                const count = this.eventHistory.triggerCounts[event.id] || 0;
                if (count >= event.maxTriggers) {
                    return false;
                }
            }

            return true;
        });

        if (availableEvents.length === 0) {
            return { success: false, reason: '没有可用事件' };
        }

        // 计算总权重
        const totalWeight = availableEvents.reduce((sum, e) => sum + e.weight, 0);

        // 随机选择事件
        let randomValue = this.random() * totalWeight;
        let selectedEvent: RandomEventConfig | null = null;

        for (const event of availableEvents) {
            randomValue -= event.weight;
            if (randomValue <= 0) {
                selectedEvent = event;
                break;
            }
        }

        if (!selectedEvent) {
            selectedEvent = availableEvents[availableEvents.length - 1];
        }

        // 触发事件
        this.activeEvent = selectedEvent;

        // 记录触发
        this.eventHistory.triggerCounts[selectedEvent.id] =
            (this.eventHistory.triggerCounts[selectedEvent.id] || 0) + 1;
        this.eventHistory.cooldowns[selectedEvent.id] = now + selectedEvent.cooldown * 1000;
        this.eventHistory.lastTriggerTime = now;

        // 触发事件
        EventCenter.emit(RandomEventEventType.EVENT_TRIGGERED, {
            event: selectedEvent,
            context
        });

        console.log(`[RandomEventManager] 触发事件: ${selectedEvent.name}`);

        return { success: true, event: selectedEvent };
    }

    /**
     * 获取当前活动事件
     */
    getActiveEvent(): RandomEventConfig | null {
        return this.activeEvent;
    }

    /**
     * 选择事件选项
     * @param optionId 选项ID
     * @param context 上下文（包含检查条件的函数）
     */
    selectOption(
        optionId: string,
        context: {
            checkRequirement?: (type: string, id: string, amount: number) => boolean;
            getResources?: () => Record<string, number>;
        }
    ): SelectResult {
        if (!this.activeEvent) {
            return { success: false, reason: '没有活动事件' };
        }

        const option = this.activeEvent.options.find(o => o.id === optionId);
        if (!option) {
            return { success: false, reason: '选项不存在' };
        }

        // 检查需求
        if (option.requirements && context.checkRequirement) {
            for (const req of option.requirements) {
                if (!context.checkRequirement(req.type, req.id, req.amount)) {
                    return { success: false, reason: `需求不满足: ${req.type} ${req.id} ${req.amount}` };
                }
            }
        }

        // 记录选择
        const record: TriggeredEventRecord = {
            eventId: this.activeEvent.id,
            triggerTime: Date.now(),
            selectedOption: optionId,
            effectResults: option.effects
        };
        this.eventHistory.triggeredEvents.push(record);

        // 触发选择事件
        EventCenter.emit(RandomEventEventType.OPTION_SELECTED, {
            eventId: this.activeEvent.id,
            optionId,
            effects: option.effects
        });

        // 清除活动事件
        this.activeEvent = null;

        return { success: true, effects: option.effects };
    }

    /**
     * 应用事件效果
     */
    applyEffects(
        effects: EventEffect[],
        context: {
            addResource?: (id: string, amount: number) => boolean;
            removeResource?: (id: string, amount: number) => boolean;
            addItem?: (id: string, amount: number) => boolean;
            removeItem?: (id: string, amount: number) => boolean;
            addExp?: (amount: number) => void;
            triggerBattle?: (battleId: string) => void;
            applyBuff?: (buffId: string, duration: number) => void;
        }
    ): void {
        effects.forEach(effect => {
            switch (effect.type) {
                case 'add_resource':
                    if (effect.targetId && effect.amount && context.addResource) {
                        context.addResource(effect.targetId, effect.amount);
                    }
                    break;

                case 'remove_resource':
                    if (effect.targetId && effect.amount && context.removeResource) {
                        context.removeResource(effect.targetId, effect.amount);
                    }
                    break;

                case 'add_item':
                    if (effect.targetId && effect.amount && context.addItem) {
                        context.addItem(effect.targetId, effect.amount);
                    }
                    break;

                case 'remove_item':
                    if (effect.targetId && effect.amount && context.removeItem) {
                        context.removeItem(effect.targetId, effect.amount);
                    }
                    break;

                case 'add_exp':
                    if (effect.amount && context.addExp) {
                        context.addExp(effect.amount);
                    }
                    break;

                case 'trigger_battle':
                    if (effect.targetId && context.triggerBattle) {
                        context.triggerBattle(effect.targetId);
                    }
                    break;

                case 'buff':
                    if (effect.targetId && effect.extra?.duration && context.applyBuff) {
                        context.applyBuff(effect.targetId, effect.extra.duration);
                    }
                    break;

                case 'nothing':
                    // 无效果
                    break;
            }

            // 触发效果应用事件
            EventCenter.emit(RandomEventEventType.EFFECT_APPLIED, {
                effect
            });
        });
    }

    /**
     * 跳过当前事件
     */
    skipEvent(): boolean {
        if (!this.activeEvent) {
            return false;
        }

        if (!this.activeEvent.skippable) {
            return false;
        }

        this.activeEvent = null;
        return true;
    }

    /**
     * 获取事件历史
     */
    getEventHistory(): EventHistory {
        return this.eventHistory;
    }

    /**
     * 获取事件触发次数
     */
    getTriggerCount(eventId: string): number {
        return this.eventHistory.triggerCounts[eventId] || 0;
    }

    /**
     * 获取事件冷却剩余时间
     */
    getCooldownRemaining(eventId: string): number {
        const cooldownEnd = this.eventHistory.cooldowns[eventId] || 0;
        const remaining = cooldownEnd - Date.now();
        return Math.max(0, Math.ceil(remaining / 1000));
    }

    /**
     * 检查事件是否可用
     */
    isEventAvailable(eventId: string): boolean {
        const config = this.eventConfigs.get(eventId);
        if (!config) return false;

        const now = Date.now();
        const cooldownEnd = this.eventHistory.cooldowns[eventId] || 0;

        if (now < cooldownEnd) return false;

        if (config.maxTriggers > 0) {
            const count = this.eventHistory.triggerCounts[eventId] || 0;
            if (count >= config.maxTriggers) return false;
        }

        return true;
    }

    /**
     * 强制触发指定事件
     */
    forceTriggerEvent(eventId: string): TriggerResult {
        const config = this.eventConfigs.get(eventId);
        if (!config) {
            return { success: false, reason: '事件不存在' };
        }

        this.activeEvent = config;

        EventCenter.emit(RandomEventEventType.EVENT_TRIGGERED, {
            event: config,
            forced: true
        });

        console.log(`[RandomEventManager] 强制触发事件: ${config.name}`);

        return { success: true, event: config };
    }

    /**
     * 重置事件冷却
     */
    resetCooldown(eventId?: string): void {
        if (eventId) {
            delete this.eventHistory.cooldowns[eventId];
        } else {
            this.eventHistory.cooldowns = {};
        }
    }

    /**
     * 清除事件历史
     */
    clearHistory(): void {
        this.eventHistory = {
            triggeredEvents: [],
            cooldowns: {},
            triggerCounts: {},
            lastTriggerTime: 0
        };
    }

    /**
     * 获取存档数据
     */
    getSaveData(): EventHistory {
        return { ...this.eventHistory };
    }

    /**
     * 加载存档数据
     */
    loadSaveData(data: EventHistory): void {
        if (data) {
            this.eventHistory = { ...data };
        }
    }

    /**
     * 序列化
     */
    serialize(): string {
        return JSON.stringify(this.eventHistory);
    }

    /**
     * 反序列化
     */
    deserialize(json: string): void {
        try {
            const data = JSON.parse(json) as EventHistory;
            this.eventHistory = data;
        } catch (e) {
            console.error('[RandomEventManager] 反序列化失败:', e);
        }
    }

    /**
     * 清理
     */
    cleanup(): void {
        this.eventConfigs.clear();
        this.clearHistory();
        this.activeEvent = null;
        this.initialized = false;
        RandomEventManager.instance = null;
    }
}

/** 随机事件管理器单例 */
export const randomEventManager = RandomEventManager.getInstance();