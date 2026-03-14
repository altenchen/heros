/**
 * 事件系统
 * 提供全局事件监听和触发功能
 */

/**
 * 事件目标类
 */
export class EventTarget {
    private listeners: Map<string, Function[]> = new Map();

    /**
     * 添加事件监听
     */
    on(eventName: string, callback: Function): void {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName)!.push(callback);
    }

    /**
     * 移除事件监听
     */
    off(eventName: string, callback: Function): void {
        const callbacks = this.listeners.get(eventName);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index >= 0) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * 触发事件
     */
    emit(eventName: string, ...args: any[]): void {
        const callbacks = this.listeners.get(eventName);
        if (callbacks) {
            callbacks.forEach(callback => {
                try {
                    callback(...args);
                } catch (e) {
                    console.error(`Error in event handler for ${eventName}:`, e);
                }
            });
        }
    }

    /**
     * 只监听一次
     */
    once(eventName: string, callback: Function, context?: any): void {
        const wrapper = (...args: any[]) => {
            this.off(eventName, wrapper);
            if (context) {
                callback.call(context, ...args);
            } else {
                callback(...args);
            }
        };
        this.on(eventName, wrapper);
    }

    /**
     * 清除所有监听
     */
    clear(): void {
        this.listeners.clear();
    }

    /**
     * 清除指定事件的所有监听
     */
    clearEvent(eventName: string): void {
        this.listeners.delete(eventName);
    }
}

/**
 * 全局事件中心
 */
export class EventCenter {
    private static instance: EventCenter | null = null;
    private eventTarget: EventTarget = new EventTarget();

    private constructor() {}

    static getInstance(): EventCenter {
        if (!EventCenter.instance) {
            EventCenter.instance = new EventCenter();
        }
        return EventCenter.instance;
    }

    /**
     * 添加事件监听
     */
    static on(eventName: string, callback: Function): void {
        EventCenter.getInstance().eventTarget.on(eventName, callback);
    }

    /**
     * 移除事件监听
     */
    static off(eventName: string, callback: Function): void {
        EventCenter.getInstance().eventTarget.off(eventName, callback);
    }

    /**
     * 触发事件
     */
    static emit(eventName: string, ...args: any[]): void {
        EventCenter.getInstance().eventTarget.emit(eventName, ...args);
    }

    /**
     * 只监听一次
     */
    static once(eventName: string, callback: Function, context?: any): void {
        EventCenter.getInstance().eventTarget.once(eventName, callback, context);
    }
}

/**
 * 游戏事件类型
 */
export enum GameEvent {
    // 玩家事件
    PLAYER_LOGIN = 'player_login',
    PLAYER_LOGOUT = 'player_logout',
    PLAYER_LEVEL_UP = 'player_level_up',

    // 资源事件
    RESOURCE_CHANGED = 'resource_changed',

    // 英雄事件
    HERO_CREATED = 'hero_created',
    HERO_LEVEL_UP = 'hero_level_up',
    HERO_ADDED_TO_ARMY = 'hero_added_to_army',

    // 单位事件
    UNIT_RECRUITED = 'unit_recruited',
    UNIT_UPGRADED = 'unit_upgraded',
    UNIT_DAMAGED = 'unit_damaged',
    UNIT_HEALED = 'unit_healed',

    // 建筑事件
    BUILDING_STARTED = 'building_started',
    BUILDING_COMPLETED = 'building_completed',

    // 战斗事件
    BATTLE_START = 'battle_start',
    BATTLE_END = 'battle_end',
    BATTLE_TURN = 'battle_turn',
    UNIT_DIED = 'unit_died',
    UNIT_MOVED = 'unit_moved',
    SKILL_USED = 'skill_used',
    BUFF_APPLIED = 'buff_applied',
    BUFF_REMOVED = 'buff_removed',
    CRITICAL_HIT = 'critical_hit',

    // UI事件
    UI_SHOW = 'ui_show',
    UI_HIDE = 'ui_hide',

    // 系统事件
    GAME_PAUSED = 'game_paused',
    GAME_RESUMED = 'game_resumed',
    GAME_SAVED = 'game_saved',
    GAME_LOADED = 'game_loaded'
}

/**
 * 事件数据接口
 */
export interface EventData {
    [key: string]: any;
}