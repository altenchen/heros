/**
 * 音效系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

/**
 * 音频类型
 */
export enum AudioType {
    /** 背景音乐 */
    BGM = 'bgm',
    /** 音效 */
    SFX = 'sfx',
    /** 语音 */
    VOICE = 'voice',
    /** 环境音 */
    AMBIENT = 'ambient'
}

/**
 * 音效分类
 */
export enum SoundCategory {
    /** UI音效 */
    UI = 'ui',
    /** 战斗音效 */
    BATTLE = 'battle',
    /** 技能音效 */
    SKILL = 'skill',
    /** 英雄音效 */
    HERO = 'hero',
    /** 建筑音效 */
    BUILDING = 'building',
    /** 系统音效 */
    SYSTEM = 'system'
}

/**
 * BGM场景类型
 */
export enum BGMScene {
    /** 主菜单 */
    MAIN_MENU = 'main_menu',
    /** 主城 */
    TOWN = 'town',
    /** 战斗 */
    BATTLE = 'battle',
    /** 胜利 */
    VICTORY = 'victory',
    /** 失败 */
    DEFEAT = 'defeat',
    /** 墓园 */
    NECROPOLIS = 'necropolis',
    /** 地下城 */
    DUNGEON = 'dungeon',
    /** 塔楼 */
    TOWER = 'tower'
}

/**
 * UI音效类型
 */
export enum UISoundType {
    /** 按钮点击 */
    BUTTON_CLICK = 'button_click',
    /** 面板打开 */
    PANEL_OPEN = 'panel_open',
    /** 面板关闭 */
    PANEL_CLOSE = 'panel_close',
    /** 确认 */
    CONFIRM = 'confirm',
    /** 取消 */
    CANCEL = 'cancel',
    /** 错误提示 */
    ERROR = 'error',
    /** 成功提示 */
    SUCCESS = 'success',
    /** 切换标签 */
    TAB_SWITCH = 'tab_switch',
    /** 滚动 */
    SCROLL = 'scroll',
    /** 奖励获得 */
    REWARD = 'reward',
    /** 金币 */
    GOLD = 'gold',
    /** 等级提升 */
    LEVEL_UP = 'level_up'
}

/**
 * 战斗音效类型
 */
export enum BattleSoundType {
    /** 战斗开始 */
    BATTLE_START = 'battle_start',
    /** 攻击 */
    ATTACK = 'attack',
    /** 受击 */
    HIT = 'hit',
    /** 暴击 */
    CRITICAL = 'critical',
    /** 闪避 */
    DODGE = 'dodge',
    /** 死亡 */
    DEATH = 'death',
    /** 移动 */
    MOVE = 'move',
    /** 远程攻击 */
    SHOOT = 'shoot',
    /** 魔法攻击 */
    MAGIC = 'magic',
    /** 反击 */
    COUNTER = 'counter',
    /** 胜利 */
    VICTORY = 'victory',
    /** 失败 */
    DEFEAT = 'defeat',
    /** 回合开始 */
    TURN_START = 'turn_start',
    /** 警告 */
    WARNING = 'warning'
}

/**
 * 技能音效类型
 */
export enum SkillSoundType {
    /** 火球术 */
    FIREBALL = 'fireball',
    /** 闪电箭 */
    LIGHTNING = 'lightning',
    /** 治疗术 */
    HEAL = 'heal',
    /** 复活术 */
    REVIVE = 'revive',
    /** 嗜血术 */
    BLOODLUST = 'bloodlust',
    /** 加速术 */
    HASTE = 'haste',
    /** 迟缓术 */
    SLOW = 'slow',
    /** 石肤术 */
    STONESKIN = 'stoneskin',
    /** 祝福术 */
    BLESS = 'bless',
    /** 诅咒术 */
    CURSE = 'curse'
}

/**
 * 音频配置
 */
export interface AudioConfig {
    /** 音频ID */
    audioId: string;
    /** 音频名称 */
    name: string;
    /** 音频类型 */
    type: AudioType;
    /** 音效分类 */
    category?: SoundCategory;
    /** 资源路径 */
    path: string;
    /** 音量 (0-1) */
    volume?: number;
    /** 是否循环 */
    loop?: boolean;
    /** 淡入时间（秒） */
    fadeIn?: number;
    /** 淡出时间（秒） */
    fadeOut?: number;
    /** 优先级 */
    priority?: number;
    /** 最大同时播放数 */
    maxInstances?: number;
    /** 随机音高偏移范围 */
    pitchVariation?: number;
}

/**
 * BGM配置
 */
export interface BGMConfig extends AudioConfig {
    /** 关联场景 */
    scene?: BGMScene;
    /** 关联种族 */
    race?: string;
    /** 是否为默认BGM */
    isDefault?: boolean;
}

/**
 * 音效配置
 */
export interface SFXConfig extends AudioConfig {
    /** 音效类型标识 */
    soundType?: string;
    /** 冷却时间（毫秒） */
    cooldown?: number;
    /** 最小间隔（毫秒） */
    minInterval?: number;
}

/**
 * 音频播放选项
 */
export interface PlayOptions {
    /** 音量 (0-1)，覆盖默认值 */
    volume?: number;
    /** 是否循环，覆盖默认值 */
    loop?: boolean;
    /** 播放速度 */
    speed?: number;
    /** 音高 */
    pitch?: number;
    /** 是否淡入 */
    fadeIn?: number;
    /** 完成回调 */
    onComplete?: () => void;
}

/**
 * 音频状态
 */
export enum AudioState {
    /** 停止 */
    STOPPED = 'stopped',
    /** 播放中 */
    PLAYING = 'playing',
    /** 暂停 */
    PAUSED = 'paused',
    /** 淡入中 */
    FADING_IN = 'fading_in',
    /** 淡出中 */
    FADING_OUT = 'fading_out'
}

/**
 * 音频实例信息
 */
export interface AudioInstance {
    /** 实例ID */
    instanceId: string;
    /** 音频ID */
    audioId: string;
    /** 状态 */
    state: AudioState;
    /** 当前音量 */
    volume: number;
    /** 播放时间 */
    playTime: number;
    /** 音频源引用 */
    source?: any;
}

/**
 * 音频设置
 */
export interface AudioSettings {
    /** 主音量 (0-1) */
    masterVolume: number;
    /** BGM音量 (0-1) */
    bgmVolume: number;
    /** 音效音量 (0-1) */
    sfxVolume: number;
    /** 语音音量 (0-1) */
    voiceVolume: number;
    /** 环境音音量 (0-1) */
    ambientVolume: number;
    /** BGM是否开启 */
    bgmEnabled: boolean;
    /** 音效是否开启 */
    sfxEnabled: boolean;
    /** 语音是否开启 */
    voiceEnabled: boolean;
    /** 环境音是否开启 */
    ambientEnabled: boolean;
    /** 震动是否开启 */
    vibrationEnabled: boolean;
}

/**
 * 音频事件类型
 */
export enum AudioEventType {
    /** BGM开始播放 */
    BGM_START = 'audio_bgm_start',
    /** BGM停止 */
    BGM_STOP = 'audio_bgm_stop',
    /** BGM切换 */
    BGM_CHANGE = 'audio_bgm_change',
    /** 音效播放 */
    SFX_PLAY = 'audio_sfx_play',
    /** 音量变化 */
    VOLUME_CHANGE = 'audio_volume_change',
    /** 设置变化 */
    SETTINGS_CHANGE = 'audio_settings_change'
}

/**
 * 音频事件数据
 */
export interface AudioEventData {
    /** 音频ID */
    audioId?: string;
    /** 音频类型 */
    type?: AudioType;
    /** 设置 */
    settings?: Partial<AudioSettings>;
    /** 音量 */
    volume?: number;
}

/**
 * 默认音频设置
 */
export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
    masterVolume: 1.0,
    bgmVolume: 0.8,
    sfxVolume: 1.0,
    voiceVolume: 1.0,
    ambientVolume: 0.6,
    bgmEnabled: true,
    sfxEnabled: true,
    voiceEnabled: true,
    ambientEnabled: true,
    vibrationEnabled: true
};