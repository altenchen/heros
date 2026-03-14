/**
 * 存档系统类型定义
 * 支持多存档槽位、自动存档、存档预览
 */

/**
 * 存档槽位数据
 */
export interface SaveSlot {
    /** 槽位ID (0-2) */
    id: number;
    /** 存档名称 */
    name: string;
    /** 创建时间戳 */
    createTime: number;
    /** 最后保存时间戳 */
    lastSaveTime: number;
    /** 游戏时长(秒) */
    playTime: number;
    /** 玩家名称 */
    playerName: string;
    /** 玩家等级 */
    playerLevel: number;
    /** 玩家阵营 */
    faction: string;
    /** 主城等级 */
    townLevel: number;
    /** 英雄数量 */
    heroCount: number;
    /** 已完成关卡数 */
    completedLevels: number;
    /** 存档预览图(Base64) */
    screenshot?: string;
    /** 是否为空槽位 */
    isEmpty: boolean;
}

/**
 * 存档数据
 */
export interface SaveData {
    /** 存档版本 */
    version: string;
    /** 存档时间戳 */
    timestamp: number;
    /** 玩家数据 */
    player: string;
    /** 成就数据 */
    achievements: string;
    /** 任务数据 */
    tasks: string;
    /** 关卡数据 */
    levels: string;
    /** 好友数据 */
    friends: string;
    /** 公会数据 */
    guild: string;
    /** 聊天数据 */
    chat: string;
    /** 教程数据 */
    tutorial: string;
    /** 音频设置 */
    audio: string;
    /** 签到数据 */
    signin: string;
    /** 商店数据 */
    shop: string;
    /** 背包数据 */
    inventory: string;
    /** 皮肤数据 */
    skins: string;
    /** VIP数据 */
    vip: string;
    /** 排行榜数据 */
    rank: string;
    /** 邮件数据 */
    mail: string;
    /** 活动数据 */
    activity: string;
    /** 竞技场数据 */
    arena: string;
    /** 招募数据 */
    gacha: string;
    /** 图鉴数据 */
    collection: string;
    /** 远征数据 */
    expedition: string;
    /** 在线奖励数据 */
    onlineReward: string;
    /** 公告数据 */
    announcement: string;
}

/**
 * 存档元数据(用于存档列表显示)
 */
export interface SaveMetadata {
    /** 槽位ID */
    slotId: number;
    /** 存档名称 */
    name: string;
    /** 最后保存时间 */
    lastSaveTime: number;
    /** 游戏时长 */
    playTime: number;
    /** 玩家信息 */
    playerInfo: {
        name: string;
        level: number;
        faction: string;
    };
}

/**
 * 存档操作结果
 */
export interface SaveResult {
    /** 是否成功 */
    success: boolean;
    /** 错误信息 */
    error?: string;
    /** 存档槽位 */
    slot?: SaveSlot;
}

/**
 * 加载结果
 */
export interface LoadResult {
    /** 是否成功 */
    success: boolean;
    /** 错误信息 */
    error?: string;
    /** 存档数据 */
    data?: SaveData;
}

/**
 * 自动存档配置
 */
export interface AutoSaveConfig {
    /** 是否启用自动存档 */
    enabled: boolean;
    /** 自动存档间隔(毫秒) */
    interval: number;
    /** 退出时自动存档 */
    saveOnExit: boolean;
    /** 战斗结束自动存档 */
    saveOnBattleEnd: boolean;
    /** 最小存档间隔(防止频繁存档) */
    minInterval: number;
}

/**
 * 存档事件类型
 */
export enum SaveEventType {
    /** 存档保存完成 */
    SAVE_COMPLETE = 'save_complete',
    /** 存档加载完成 */
    LOAD_COMPLETE = 'load_load_complete',
    /** 自动存档触发 */
    AUTO_SAVE_TRIGGERED = 'auto_save_triggered',
    /** 存档删除 */
    SAVE_DELETED = 'save_deleted',
    /** 存档槽位切换 */
    SLOT_CHANGED = 'slot_changed',
    /** 存档导入完成 */
    IMPORT_COMPLETE = 'import_complete',
    /** 存档导出完成 */
    EXPORT_COMPLETE = 'export_complete'
}

/**
 * 存档配置
 */
export interface SaveConfig {
    /** 最大存档槽位数 */
    maxSlots: number;
    /** 存档版本 */
    version: string;
    /** 存档键前缀 */
    keyPrefix: string;
    /** 元数据键 */
    metaKey: string;
    /** 自动存档配置 */
    autoSave: AutoSaveConfig;
}

/**
 * 默认存档配置
 */
export const DEFAULT_SAVE_CONFIG: SaveConfig = {
    maxSlots: 3,
    version: '1.0.0',
    keyPrefix: 'hmm_legacy_save_',
    metaKey: 'hmm_legacy_saves_meta',
    autoSave: {
        enabled: true,
        interval: 5 * 60 * 1000, // 5分钟
        saveOnExit: true,
        saveOnBattleEnd: true,
        minInterval: 60 * 1000 // 1分钟
    }
};

/**
 * 云存档状态
 */
export interface CloudSaveStatus {
    /** 是否已登录 */
    isLoggedIn: boolean;
    /** 最后同步时间 */
    lastSyncTime: number;
    /** 同步状态 */
    syncStatus: 'synced' | 'pending' | 'error';
    /** 错误信息 */
    error?: string;
}