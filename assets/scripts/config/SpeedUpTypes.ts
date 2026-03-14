/**
 * 加速系统类型定义
 * 支持建造加速、招募加速、研发加速等
 */

/**
 * 加速类型
 */
export enum SpeedUpType {
    /** 建造加速 */
    BUILDING = 'building',
    /** 招募加速 */
    RECRUIT = 'recruit',
    /** 研发加速 */
    RESEARCH = 'research',
    /** 训练加速 */
    TRAINING = 'training',
    /** 通用加速 */
    GENERAL = 'general'
}

/**
 * 加速配置
 */
export interface SpeedUpConfig {
    /** 道具ID */
    itemId: string;
    /** 道具名称 */
    name: string;
    /** 加速时间(秒) */
    time: number;
    /** 加速类型 */
    type: SpeedUpType | SpeedUpType[];
    /** 图标 */
    icon?: string;
    /** 描述 */
    description?: string;
}

/**
 * 加速消耗配置
 */
export interface SpeedUpCost {
    /** 消耗类型 */
    type: 'item' | 'gems' | 'gold';
    /** 消耗ID（道具ID或货币类型） */
    id: string;
    /** 消耗数量 */
    amount: number;
    /** 加速时间(秒) */
    time: number;
}

/**
 * 加速目标信息
 */
export interface SpeedUpTarget {
    /** 目标类型 */
    type: SpeedUpType;
    /** 目标ID（建筑ID、招募ID等） */
    targetId: string;
    /** 剩余时间(秒) */
    remainingTime: number;
    /** 总时间(秒) */
    totalTime: number;
    /** 额外信息 */
    extra?: Record<string, any>;
}

/**
 * 加速结果
 */
export interface SpeedUpResult {
    /** 是否成功 */
    success: boolean;
    /** 错误信息 */
    error?: string;
    /** 剩余时间 */
    remainingTime?: number;
    /** 是否完成 */
    completed?: boolean;
    /** 消耗的资源 */
    cost?: SpeedUpCost;
}

/**
 * 加速事件类型
 */
export enum SpeedUpEventType {
    /** 加速开始 */
    SPEED_UP_START = 'speed_up_start',
    /** 加速完成 */
    SPEED_UP_COMPLETE = 'speed_up_complete',
    /** 建造完成 */
    BUILDING_COMPLETE = 'building_complete'
}

/**
 * 默认加速配置
 */
export const DEFAULT_SPEED_UP_ITEMS: SpeedUpConfig[] = [
    {
        itemId: 'item_speedup_5min',
        name: '5分钟加速',
        time: 300,
        type: SpeedUpType.GENERAL,
        icon: 'speedup_5min',
        description: '减少5分钟等待时间'
    },
    {
        itemId: 'item_speedup_15min',
        name: '15分钟加速',
        time: 900,
        type: SpeedUpType.GENERAL,
        icon: 'speedup_15min',
        description: '减少15分钟等待时间'
    },
    {
        itemId: 'item_speedup_1hour',
        name: '1小时加速',
        time: 3600,
        type: SpeedUpType.GENERAL,
        icon: 'speedup_1hour',
        description: '减少1小时等待时间'
    },
    {
        itemId: 'item_speedup_3hour',
        name: '3小时加速',
        time: 10800,
        type: SpeedUpType.GENERAL,
        icon: 'speedup_3hour',
        description: '减少3小时等待时间'
    },
    {
        itemId: 'item_speedup_building',
        name: '建造加速',
        time: 1800,
        type: SpeedUpType.BUILDING,
        icon: 'speedup_building',
        description: '减少30分钟建造时间'
    }
];

/**
 * 钻石加速配置
 * 每分钟需要的钻石数量
 */
export const GEMS_PER_MINUTE = 10;

/**
 * 最大免费加速时间(秒)
 * 小于这个时间可以免费加速
 */
export const FREE_SPEEDUP_THRESHOLD = 60; // 1分钟