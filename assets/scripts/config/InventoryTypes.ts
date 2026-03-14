/**
 * 背包与道具系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

/**
 * 道具类型
 */
export enum ItemType {
    /** 消耗品 */
    CONSUMABLE = 'consumable',
    /** 装备 */
    EQUIPMENT = 'equipment',
    /** 材料 */
    MATERIAL = 'material',
    /** 碎片 */
    SHARD = 'shard',
    /** 礼包 */
    GIFT = 'gift',
    /** 任务道具 */
    QUEST = 'quest',
    /** 时效道具 */
    TIMED = 'timed'
}

/**
 * 道具品质
 */
export enum ItemQuality {
    /** 普通 */
    COMMON = 1,
    /** 优秀 */
    GOOD = 2,
    /** 稀有 */
    RARE = 3,
    /** 史诗 */
    EPIC = 4,
    /** 传说 */
    LEGENDARY = 5
}

/**
 * 道具稀有度（别名，与 ItemQuality 兼容）
 */
export enum ItemRarity {
    /** 普通 */
    COMMON = 1,
    /** 稀有 */
    RARE = 3,
    /** 史诗 */
    EPIC = 4,
    /** 传说 */
    LEGENDARY = 5
}

/**
 * 道具使用目标
 */
export enum UseTarget {
    /** 无目标 */
    NONE = 'none',
    /** 自身 */
    SELF = 'self',
    /** 英雄 */
    HERO = 'hero',
    /** 单位 */
    UNIT = 'unit',
    /** 建筑队列 */
    BUILDING_QUEUE = 'building_queue'
}

/**
 * 道具效果类型
 */
export enum ItemEffectType {
    /** 增加资源 */
    ADD_RESOURCE = 'add_resource',
    /** 增加经验 */
    ADD_EXP = 'add_exp',
    /** 恢复体力 */
    RESTORE_STAMINA = 'restore_stamina',
    /** 增加属性 */
    ADD_ATTRIBUTE = 'add_attribute',
    /** 召唤单位 */
    SUMMON_UNIT = 'summon_unit',
    /** 加速建造 */
    SPEEDUP_BUILD = 'speedup_build',
    /** 开启礼包 */
    OPEN_GIFT = 'open_gift',
    /** 合成道具 */
    COMPOSE = 'compose',
    /** 增加Buff */
    ADD_BUFF = 'add_buff'
}

/**
 * 道具效果
 */
export interface ItemEffect {
    /** 效果类型 */
    type: ItemEffectType;
    /** 效果参数 */
    params: Record<string, any>;
    /** 效果值 */
    value?: number;
    /** 持续时间（秒） */
    duration?: number;
}

/**
 * 道具配置
 */
export interface ItemConfig {
    /** 道具ID */
    itemId: string;
    /** 道具名称 */
    name: string;
    /** 道具描述 */
    description: string;
    /** 道具类型 */
    type: ItemType;
    /** 道具品质 */
    quality: ItemQuality;
    /** 道具稀有度（别名，与 quality 兼容） */
    rarity?: ItemRarity;
    /** 图标路径 */
    icon: string;
    /** 最大堆叠数 */
    maxStack: number;
    /** 是否可使用 */
    usable: boolean;
    /** 使用目标 */
    useTarget?: UseTarget;
    /** 使用效果 */
    effects?: ItemEffect[];
    /** 使用次数 */
    useCount?: number;
    /** 冷却时间（秒） */
    cooldown?: number;
    /** 等级要求 */
    levelRequired?: number;
    /** VIP要求 */
    vipRequired?: number;
    /** 过期时间（秒，0表示永不过期） */
    expireTime?: number;
    /** 出售价格 */
    sellPrice?: {
        currency: string;
        amount: number;
    };
    /** 是否可出售 */
    sellable?: boolean;
    /** 合成配方 */
    compose?: {
        materials: { itemId: string; count: number }[];
        result: { itemId: string; count: number };
    };
    /** 礼包内容 */
    giftContents?: {
        type: string;
        itemId?: string;
        amount: number;
        probability?: number;
    }[];
}

/**
 * 背包物品实例
 */
export interface InventoryItem {
    /** 唯一ID */
    instanceId: string;
    /** 道具ID */
    itemId: string;
    /** 数量 */
    count: number;
    /** 获得时间 */
    obtainTime: number;
    /** 过期时间（0表示永不过期） */
    expireAt: number;
    /** 上次使用时间 */
    lastUseTime?: number;
    /** 剩余使用次数 */
    remainingUses?: number;
    /** 扩展属性 */
    extra?: Record<string, any>;
    /** 道具配置（运行时填充） */
    config?: ItemConfig;
}

/**
 * 背包格子
 */
export interface InventorySlot {
    /** 格子索引 */
    index: number;
    /** 格子中的物品 */
    item: InventoryItem | null;
    /** 是否解锁 */
    unlocked: boolean;
}

/**
 * 背包类型
 */
export enum InventoryType {
    /** 主背包 */
    MAIN = 'main',
    /** 装备背包 */
    EQUIPMENT = 'equipment',
    /** 材料背包 */
    MATERIAL = 'material',
    /** 碎片背包 */
    SHARD = 'shard',
    /** 英雄背包 */
    HERO = 'hero',
    /** 皮肤背包 */
    SKIN = 'skin'
}

/**
 * 使用道具结果
 */
export interface UseItemResult {
    /** 是否成功 */
    success: boolean;
    /** 道具ID */
    itemId?: string;
    /** 使用数量 */
    count?: number;
    /** 效果结果 */
    effects?: ItemEffect[];
    /** 剩余数量 */
    remainingCount?: number;
    /** 错误信息 */
    error?: string;
}

/**
 * 出售道具结果
 */
export interface SellItemResult {
    /** 是否成功 */
    success: boolean;
    /** 获得的货币 */
    currency?: string;
    /** 获得的金额 */
    amount?: number;
    /** 错误信息 */
    error?: string;
}

/**
 * 背包事件类型
 */
export enum InventoryEventType {
    /** 物品添加 */
    ITEM_ADD = 'inventory_item_add',
    /** 物品移除 */
    ITEM_REMOVE = 'inventory_item_remove',
    /** 物品更新 */
    ITEM_UPDATE = 'inventory_item_update',
    /** 物品使用 */
    ITEM_USE = 'inventory_item_use',
    /** 物品过期 */
    ITEM_EXPIRE = 'inventory_item_expire',
    /** 背包扩容 */
    INVENTORY_EXPAND = 'inventory_expand'
}

/**
 * 背包事件数据
 */
export interface InventoryEventData {
    /** 道具ID */
    itemId?: string;
    /** 实例ID */
    instanceId?: string;
    /** 数量 */
    count?: number;
    /** 背包类型 */
    inventoryType?: InventoryType;
    /** 效果 */
    effects?: ItemEffect[];
}

/**
 * 背包设置
 */
export interface InventorySettings {
    /** 初始容量 */
    initialCapacity: number;
    /** 最大容量 */
    maxCapacity: number;
    /** 扩容步长 */
    expandStep: number;
    /** 扩容消耗 */
    expandCost: {
        currency: string;
        baseAmount: number;
        multiplier: number;
    };
}

/**
 * 默认背包设置
 */
export const DEFAULT_INVENTORY_SETTINGS: InventorySettings = {
    initialCapacity: 50,
    maxCapacity: 200,
    expandStep: 10,
    expandCost: {
        currency: 'gems',
        baseAmount: 50,
        multiplier: 1.5
    }
};