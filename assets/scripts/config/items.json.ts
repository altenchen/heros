/**
 * 道具配置数据
 * 定义所有游戏道具的配置
 * 遵循阿里巴巴开发者手册规范
 */

import {
    ItemConfig,
    ItemType,
    ItemQuality,
    UseTarget,
    ItemEffectType
} from './InventoryTypes';

/**
 * 消耗品类道具
 */
export const consumableItems: ItemConfig[] = [
    // ==================== 经验道具 ====================
    {
        itemId: 'exp_potion_small',
        name: '小型经验药水',
        description: '使用后获得100点经验',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.COMMON,
        icon: 'items/exp_potion_small',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.ADD_EXP, params: {}, value: 100 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 100 }
    },
    {
        itemId: 'exp_potion_medium',
        name: '中型经验药水',
        description: '使用后获得500点经验',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.GOOD,
        icon: 'items/exp_potion_medium',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.ADD_EXP, params: {}, value: 500 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 500 }
    },
    {
        itemId: 'exp_potion_large',
        name: '大型经验药水',
        description: '使用后获得2000点经验',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.RARE,
        icon: 'items/exp_potion_large',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.ADD_EXP, params: {}, value: 2000 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 2000 }
    },
    // ==================== 体力道具 ====================
    {
        itemId: 'stamina_potion_small',
        name: '小型体力药水',
        description: '恢复20点体力',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.COMMON,
        icon: 'items/stamina_potion_small',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.RESTORE_STAMINA, params: {}, value: 20 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 200 }
    },
    {
        itemId: 'stamina_potion_medium',
        name: '中型体力药水',
        description: '恢复50点体力',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.GOOD,
        icon: 'items/stamina_potion_medium',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.RESTORE_STAMINA, params: {}, value: 50 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 500 }
    },
    {
        itemId: 'stamina_potion_large',
        name: '大型体力药水',
        description: '恢复100点体力',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.RARE,
        icon: 'items/stamina_potion_large',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.RESTORE_STAMINA, params: {}, value: 100 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 1000 }
    },
    // ==================== 属性卷轴 ====================
    {
        itemId: 'scroll_attack',
        name: '攻击卷轴',
        description: '临时增加攻击力10%，持续1小时',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.GOOD,
        icon: 'items/scroll_attack',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.ADD_BUFF, params: { buffType: 'attack' }, value: 10, duration: 3600 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 300 }
    },
    {
        itemId: 'scroll_defense',
        name: '防御卷轴',
        description: '临时增加防御力10%，持续1小时',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.GOOD,
        icon: 'items/scroll_defense',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.ADD_BUFF, params: { buffType: 'defense' }, value: 10, duration: 3600 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 300 }
    },
    {
        itemId: 'scroll_speed',
        name: '速度卷轴',
        description: '临时增加速度5，持续1小时',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.GOOD,
        icon: 'items/scroll_speed',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.ADD_BUFF, params: { buffType: 'speed' }, value: 5, duration: 3600 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 400 }
    },
    // ==================== 加速道具 ====================
    {
        itemId: 'speedup_5min',
        name: '5分钟加速',
        description: '立即完成5分钟的建造或研究',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.COMMON,
        icon: 'items/speedup_5min',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.BUILDING_QUEUE,
        effects: [
            { type: ItemEffectType.SPEEDUP_BUILD, params: {}, value: 300 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 50 }
    },
    {
        itemId: 'speedup_1hour',
        name: '1小时加速',
        description: '立即完成1小时的建造或研究',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.GOOD,
        icon: 'items/speedup_1hour',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.BUILDING_QUEUE,
        effects: [
            { type: ItemEffectType.SPEEDUP_BUILD, params: {}, value: 3600 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 500 }
    },
    {
        itemId: 'speedup_24hour',
        name: '24小时加速',
        description: '立即完成24小时的建造或研究',
        type: ItemType.CONSUMABLE,
        quality: ItemQuality.RARE,
        icon: 'items/speedup_24hour',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.BUILDING_QUEUE,
        effects: [
            { type: ItemEffectType.SPEEDUP_BUILD, params: {}, value: 86400 }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 5000 }
    }
];

/**
 * 材料类道具
 */
export const materialItems: ItemConfig[] = [
    {
        itemId: 'material_wood',
        name: '木材',
        description: '基础建造材料',
        type: ItemType.MATERIAL,
        quality: ItemQuality.COMMON,
        icon: 'items/material_wood',
        maxStack: 9999,
        usable: false,
        sellable: true,
        sellPrice: { currency: 'gold', amount: 1 }
    },
    {
        itemId: 'material_ore',
        name: '矿石',
        description: '基础建造材料',
        type: ItemType.MATERIAL,
        quality: ItemQuality.COMMON,
        icon: 'items/material_ore',
        maxStack: 9999,
        usable: false,
        sellable: true,
        sellPrice: { currency: 'gold', amount: 1 }
    },
    {
        itemId: 'material_crystal',
        name: '水晶',
        description: '高级建造材料',
        type: ItemType.MATERIAL,
        quality: ItemQuality.RARE,
        icon: 'items/material_crystal',
        maxStack: 999,
        usable: false,
        sellable: true,
        sellPrice: { currency: 'gold', amount: 10 }
    },
    {
        itemId: 'material_gem',
        name: '宝石',
        description: '稀有建造材料',
        type: ItemType.MATERIAL,
        quality: ItemQuality.EPIC,
        icon: 'items/material_gem',
        maxStack: 999,
        usable: false,
        sellable: true,
        sellPrice: { currency: 'gold', amount: 50 }
    },
    {
        itemId: 'material_sulfur',
        name: '硫磺',
        description: '魔法材料',
        type: ItemType.MATERIAL,
        quality: ItemQuality.RARE,
        icon: 'items/material_sulfur',
        maxStack: 999,
        usable: false,
        sellable: true,
        sellPrice: { currency: 'gold', amount: 10 }
    },
    {
        itemId: 'material_mercury',
        name: '水银',
        description: '魔法材料',
        type: ItemType.MATERIAL,
        quality: ItemQuality.RARE,
        icon: 'items/material_mercury',
        maxStack: 999,
        usable: false,
        sellable: true,
        sellPrice: { currency: 'gold', amount: 10 }
    }
];

/**
 * 碎片类道具
 */
export const shardItems: ItemConfig[] = [
    {
        itemId: 'shard_catherine',
        name: '凯瑟琳碎片',
        description: '收集50个可召唤英雄凯瑟琳',
        type: ItemType.SHARD,
        quality: ItemQuality.RARE,
        icon: 'items/shard_catherine',
        maxStack: 999,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.COMPOSE, params: { targetId: 'hero_catherine', requiredCount: 50 } }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 100 }
    },
    {
        itemId: 'shard_sandro',
        name: '山德鲁碎片',
        description: '收集50个可召唤英雄山德鲁',
        type: ItemType.SHARD,
        quality: ItemQuality.RARE,
        icon: 'items/shard_sandro',
        maxStack: 999,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.COMPOSE, params: { targetId: 'hero_sandro', requiredCount: 50 } }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 100 }
    },
    {
        itemId: 'shard_gem',
        name: '格鲁碎片',
        description: '收集50个可召唤英雄格鲁',
        type: ItemType.SHARD,
        quality: ItemQuality.EPIC,
        icon: 'items/shard_gem',
        maxStack: 999,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.COMPOSE, params: { targetId: 'hero_gem', requiredCount: 50 } }
        ],
        sellable: true,
        sellPrice: { currency: 'gold', amount: 150 }
    }
];

/**
 * 礼包类道具
 */
export const giftItems: ItemConfig[] = [
    {
        itemId: 'gift_newbie',
        name: '新手礼包',
        description: '包含丰富的初始资源',
        type: ItemType.GIFT,
        quality: ItemQuality.GOOD,
        icon: 'items/gift_newbie',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.OPEN_GIFT, params: { giftId: 'gift_newbie' } }
        ],
        giftContents: [
            { type: 'resource', itemId: 'gold', amount: 5000, probability: 100 },
            { type: 'resource', itemId: 'gems', amount: 100, probability: 100 },
            { type: 'resource', itemId: 'stamina', amount: 50, probability: 100 },
            { type: 'item', itemId: 'exp_potion_medium', amount: 3, probability: 100 }
        ],
        sellable: false
    },
    {
        itemId: 'gift_battle',
        name: '战斗礼包',
        description: '包含战斗相关道具',
        type: ItemType.GIFT,
        quality: ItemQuality.RARE,
        icon: 'items/gift_battle',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.OPEN_GIFT, params: { giftId: 'gift_battle' } }
        ],
        giftContents: [
            { type: 'item', itemId: 'scroll_attack', amount: 2, probability: 100 },
            { type: 'item', itemId: 'scroll_defense', amount: 2, probability: 100 },
            { type: 'item', itemId: 'scroll_speed', amount: 1, probability: 100 }
        ],
        sellable: false
    },
    {
        itemId: 'gift_random_hero',
        name: '随机英雄碎片礼包',
        description: '随机获得英雄碎片',
        type: ItemType.GIFT,
        quality: ItemQuality.EPIC,
        icon: 'items/gift_random_hero',
        maxStack: 99,
        usable: true,
        useTarget: UseTarget.SELF,
        effects: [
            { type: ItemEffectType.OPEN_GIFT, params: { giftId: 'gift_random_hero' } }
        ],
        giftContents: [
            { type: 'item', itemId: 'shard_catherine', amount: 5, probability: 20 },
            { type: 'item', itemId: 'shard_sandro', amount: 5, probability: 20 },
            { type: 'item', itemId: 'shard_gem', amount: 5, probability: 15 },
            { type: 'item', itemId: 'shard_catherine', amount: 10, probability: 10 },
            { type: 'item', itemId: 'shard_sandro', amount: 10, probability: 10 },
            { type: 'item', itemId: 'shard_gem', amount: 10, probability: 5 }
        ],
        sellable: false
    }
];

/**
 * 所有道具映射
 */
export const allItems: Map<string, ItemConfig> = new Map([
    ...consumableItems.map(item => [item.itemId, item] as [string, ItemConfig]),
    ...materialItems.map(item => [item.itemId, item] as [string, ItemConfig]),
    ...shardItems.map(item => [item.itemId, item] as [string, ItemConfig]),
    ...giftItems.map(item => [item.itemId, item] as [string, ItemConfig])
]);

/**
 * 根据ID获取道具配置
 */
export function getItemConfig(itemId: string): ItemConfig | undefined {
    return allItems.get(itemId);
}

/**
 * 根据类型获取道具列表
 */
export function getItemsByType(type: ItemType): ItemConfig[] {
    switch (type) {
        case ItemType.CONSUMABLE:
            return consumableItems;
        case ItemType.MATERIAL:
            return materialItems;
        case ItemType.SHARD:
            return shardItems;
        case ItemType.GIFT:
            return giftItems;
        default:
            return [];
    }
}

/**
 * 根据品质获取道具列表
 */
export function getItemsByQuality(quality: ItemQuality): ItemConfig[] {
    return Array.from(allItems.values()).filter(item => item.quality === quality);
}