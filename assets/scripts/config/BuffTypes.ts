/**
 * Buff系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

/**
 * Buff类型分类
 */
export enum BuffCategory {
    /** 增益效果 */
    BUFF = 'buff',
    /** 减益效果 */
    DEBUFF = 'debuff',
    /** 控制效果 */
    CONTROL = 'control',
    /** 持续伤害 */
    DOT = 'dot',
    /** 持续治疗 */
    HOT = 'hot'
}

/**
 * Buff效果类型
 */
export enum BuffEffectType {
    /** 属性修改 */
    ATTRIBUTE = 'attribute',
    /** 状态控制 */
    STATUS = 'status',
    /** 持续伤害 */
    DAMAGE_OVER_TIME = 'damage_over_time',
    /** 持续治疗 */
    HEAL_OVER_TIME = 'heal_over_time',
    /** 护盾 */
    SHIELD = 'shield',
    /** 特殊效果 */
    SPECIAL = 'special'
}

/**
 * 属性修改类型
 */
export enum AttributeType {
    ATTACK = 'attack',
    DEFENSE = 'defense',
    SPEED = 'speed',
    DAMAGE = 'damage',
    HP = 'hp',
    MANA = 'mana'
}

/**
 * Buff叠加规则
 */
export enum BuffStackRule {
    /** 不可叠加，新buff覆盖旧buff */
    REPLACE = 'replace',
    /** 刷新持续时间 */
    REFRESH = 'refresh',
    /** 可叠加效果值 */
    STACK_VALUE = 'stack_value',
    /** 可叠加持续时间 */
    STACK_DURATION = 'stack_duration',
    /** 独立存在 */
    INDEPENDENT = 'independent'
}

/**
 * Buff配置接口
 */
export interface BuffConfig {
    /** Buff唯一ID */
    id: string;
    /** Buff名称 */
    name: string;
    /** Buff描述 */
    description: string;
    /** Buff图标 */
    icon: string;
    /** Buff分类 */
    category: BuffCategory;
    /** 效果类型 */
    effectType: BuffEffectType;
    /** 关联的状态效果 */
    statusEffect?: string;
    /** 基础持续时间（回合数），-1表示永久 */
    duration: number;
    /** 是否可驱散 */
    dispellable: boolean;
    /** 叠加规则 */
    stackRule: BuffStackRule;
    /** 最大叠加层数 */
    maxStacks: number;
    /** 效果配置 */
    effects: BuffEffectConfig[];
    /** 视觉效果 */
    visualEffect?: BuffVisualConfig;
    /** 音效 */
    soundEffect?: string;
}

/**
 * Buff效果配置
 */
export interface BuffEffectConfig {
    /** 效果类型 */
    type: BuffEffectType;
    /** 目标属性（属性修改类） */
    attribute?: AttributeType;
    /** 修改方式 */
    modifyType?: 'percent' | 'flat';
    /** 基础值 */
    baseValue: number;
    /** 每层叠加值 */
    stackValue?: number;
    /** 触发时机 */
    trigger?: 'on_apply' | 'on_remove' | 'on_turn_start' | 'on_turn_end' | 'on_attack' | 'on_hit' | 'on_kill';
    /** 触发概率 */
    probability?: number;
    /** 额外参数 */
    params?: Record<string, any>;
}

/**
 * Buff视觉效果配置
 */
export interface BuffVisualConfig {
    /** 单位着色 */
    tint?: { r: number; g: number; b: number; a: number };
    /** 粒子效果 */
    particle?: string;
    /** 光环效果 */
    aura?: string;
    /** 动画 */
    animation?: string;
}

/**
 * Buff实例数据
 */
export interface BuffInstance {
    /** 实例唯一ID */
    instanceId: string;
    /** 配置ID */
    configId: string;
    /** 来源ID（施法者） */
    sourceId: string;
    /** 目标ID */
    targetId: string;
    /** 剩余持续时间 */
    remainingDuration: number;
    /** 当前叠加层数 */
    stacks: number;
    /** 当前效果值 */
    currentValue: number;
    /** 创建时间戳 */
    createdAt: number;
    /** 自定义数据 */
    customData?: Record<string, any>;
}

/**
 * Buff事件类型
 */
export enum BuffEventType {
    /** Buff应用 */
    BUFF_APPLIED = 'buff_applied',
    /** Buff移除 */
    BUFF_REMOVED = 'buff_removed',
    /** Buff刷新 */
    BUFF_REFRESHED = 'buff_refreshed',
    /** Buff叠加 */
    BUFF_STACKED = 'buff_stacked',
    /** Buff触发 */
    BUFF_TRIGGERED = 'buff_triggered',
    /** Buff持续时间更新 */
    BUFF_DURATION_UPDATED = 'buff_duration_updated'
}

/**
 * Buff事件数据
 */
export interface BuffEventData {
    /** 事件类型 */
    type: BuffEventType;
    /** Buff实例 */
    buff: BuffInstance;
    /** 目标ID */
    targetId: string;
    /** 来源ID */
    sourceId: string;
    /** 事件时间戳 */
    timestamp: number;
    /** 额外数据 */
    data?: any;
}

/**
 * Buff应用结果
 */
export interface BuffApplyResult {
    /** 是否成功 */
    success: boolean;
    /** Buff实例 */
    buff?: BuffInstance;
    /** 被替换的Buff */
    replaced?: BuffInstance;
    /** 错误信息 */
    error?: string;
}

/**
 * Buff查询选项
 */
export interface BuffQueryOptions {
    /** 按配置ID筛选 */
    configId?: string;
    /** 按分类筛选 */
    category?: BuffCategory;
    /** 按效果类型筛选 */
    effectType?: BuffEffectType;
    /** 按来源筛选 */
    sourceId?: string;
    /** 是否只查询增益 */
    buffOnly?: boolean;
    /** 是否只查询减益 */
    debuffOnly?: boolean;
    /** 是否只查询可驱散的 */
    dispellableOnly?: boolean;
}