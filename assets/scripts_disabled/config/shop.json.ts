/**
 * 商店配置数据
 * 定义所有商店商品、货币兑换等配置
 * 遵循阿里巴巴开发者手册规范
 */

import {
    ShopItemConfig,
    ShopType,
    ShopItemType,
    CurrencyType,
    DiscountType,
    CurrencyExchangeConfig
} from './ShopTypes';

/**
 * 普通商店商品
 */
export const normalShopItems: ShopItemConfig[] = [
    // ==================== 资源包 ====================
    {
        itemId: 'normal_gold_small',
        name: '金币礼包(小)',
        description: '包含1000金币',
        type: ShopItemType.RESOURCE,
        shopType: ShopType.NORMAL,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'gold', amount: 1000 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 50, currentPrice: 50 }
        ],
        dailyLimit: 10,
        sortOrder: 1
    },
    {
        itemId: 'normal_gold_medium',
        name: '金币礼包(中)',
        description: '包含5000金币',
        type: ShopItemType.RESOURCE,
        shopType: ShopType.NORMAL,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'gold', amount: 5000 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 200, currentPrice: 180, discountType: DiscountType.PERCENT, discountValue: 10 }
        ],
        dailyLimit: 5,
        isHot: true,
        sortOrder: 2
    },
    {
        itemId: 'normal_gold_large',
        name: '金币礼包(大)',
        description: '包含20000金币',
        type: ShopItemType.RESOURCE,
        shopType: ShopType.NORMAL,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'gold', amount: 20000 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 600, currentPrice: 500, discountType: DiscountType.PERCENT, discountValue: 17 }
        ],
        dailyLimit: 3,
        isRecommended: true,
        sortOrder: 3
    },
    {
        itemId: 'normal_stamina_small',
        name: '体力药剂(小)',
        description: '恢复30体力',
        type: ShopItemType.RESOURCE,
        shopType: ShopType.NORMAL,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'stamina', amount: 30 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 30, currentPrice: 30 }
        ],
        dailyLimit: 5,
        sortOrder: 4
    },
    {
        itemId: 'normal_stamina_medium',
        name: '体力药剂(中)',
        description: '恢复100体力',
        type: ShopItemType.RESOURCE,
        shopType: ShopType.NORMAL,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'stamina', amount: 100 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 100, currentPrice: 80, discountType: DiscountType.PERCENT, discountValue: 20 }
        ],
        dailyLimit: 3,
        isHot: true,
        sortOrder: 5
    },
    // ==================== 道具 ====================
    {
        itemId: 'normal_exp_potion',
        name: '经验药水',
        description: '获得500经验',
        type: ShopItemType.ITEM,
        shopType: ShopType.NORMAL,
        contents: [
            { type: ShopItemType.ITEM, itemId: 'exp_potion', amount: 1 }
        ],
        prices: [
            { currency: CurrencyType.GOLD, originalPrice: 5000, currentPrice: 5000 }
        ],
        dailyLimit: 10,
        sortOrder: 10
    },
    {
        itemId: 'normal_scroll_attack',
        name: '攻击卷轴',
        description: '临时增加攻击力',
        type: ShopItemType.ITEM,
        shopType: ShopType.NORMAL,
        contents: [
            { type: ShopItemType.ITEM, itemId: 'scroll_attack', amount: 1 }
        ],
        prices: [
            { currency: CurrencyType.GOLD, originalPrice: 3000, currentPrice: 3000 }
        ],
        dailyLimit: 5,
        sortOrder: 11
    },
    {
        itemId: 'normal_scroll_defense',
        name: '防御卷轴',
        description: '临时增加防御力',
        type: ShopItemType.ITEM,
        shopType: ShopType.NORMAL,
        contents: [
            { type: ShopItemType.ITEM, itemId: 'scroll_defense', amount: 1 }
        ],
        prices: [
            { currency: CurrencyType.GOLD, originalPrice: 3000, currentPrice: 3000 }
        ],
        dailyLimit: 5,
        sortOrder: 12
    }
];

/**
 * 钻石商店商品
 */
export const gemsShopItems: ShopItemConfig[] = [
    // ==================== 英雄碎片 ====================
    {
        itemId: 'gems_hero_catherine',
        name: '凯瑟琳碎片',
        description: '圣堂英雄凯瑟琳的碎片',
        type: ShopItemType.HERO_SHARD,
        shopType: ShopType.GEMS,
        contents: [
            { type: ShopItemType.HERO_SHARD, itemId: 'hero_catherine_shard', amount: 5 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 100, currentPrice: 100 }
        ],
        buyLimit: 100,
        levelRequired: 10,
        sortOrder: 1
    },
    {
        itemId: 'gems_hero_sandro',
        name: '山德鲁碎片',
        description: '墓园英雄山德鲁的碎片',
        type: ShopItemType.HERO_SHARD,
        shopType: ShopType.GEMS,
        contents: [
            { type: ShopItemType.HERO_SHARD, itemId: 'hero_sandro_shard', amount: 5 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 100, currentPrice: 100 }
        ],
        buyLimit: 100,
        levelRequired: 10,
        sortOrder: 2
    },
    {
        itemId: 'gems_hero_gem',
        name: '格鲁碎片',
        description: '壁垒英雄格鲁的碎片',
        type: ShopItemType.HERO_SHARD,
        shopType: ShopType.GEMS,
        contents: [
            { type: ShopItemType.HERO_SHARD, itemId: 'hero_gem_shard', amount: 5 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 100, currentPrice: 100 }
        ],
        buyLimit: 100,
        levelRequired: 15,
        sortOrder: 3
    },
    // ==================== 礼包 ====================
    {
        itemId: 'gems_bundle_starter',
        name: '新手礼包',
        description: '包含金币、钻石、体力',
        type: ShopItemType.BUNDLE,
        shopType: ShopType.GEMS,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'gold', amount: 5000 },
            { type: ShopItemType.RESOURCE, itemId: 'gems', amount: 100 },
            { type: ShopItemType.RESOURCE, itemId: 'stamina', amount: 50 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 200, currentPrice: 100, discountType: DiscountType.PERCENT, discountValue: 50 }
        ],
        buyLimit: 1,
        levelRequired: 5,
        isNew: true,
        sortOrder: 10
    },
    {
        itemId: 'gems_bundle_weekly',
        name: '周礼包',
        description: '每周限购超值礼包',
        type: ShopItemType.BUNDLE,
        shopType: ShopType.GEMS,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'gold', amount: 20000 },
            { type: ShopItemType.RESOURCE, itemId: 'gems', amount: 200 },
            { type: ShopItemType.RESOURCE, itemId: 'stamina', amount: 100 },
            { type: ShopItemType.ITEM, itemId: 'exp_potion', amount: 5 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 500, currentPrice: 300, discountType: DiscountType.PERCENT, discountValue: 40 }
        ],
        weeklyLimit: 1,
        isHot: true,
        sortOrder: 11
    },
    {
        itemId: 'gems_bundle_monthly',
        name: '月度礼包',
        description: '每月限购豪华礼包',
        type: ShopItemType.BUNDLE,
        shopType: ShopType.GEMS,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'gold', amount: 100000 },
            { type: ShopItemType.RESOURCE, itemId: 'gems', amount: 500 },
            { type: ShopItemType.RESOURCE, itemId: 'stamina', amount: 300 },
            { type: ShopItemType.HERO_SHARD, itemId: 'random_hero_shard', amount: 10 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 1500, currentPrice: 800, discountType: DiscountType.PERCENT, discountValue: 47 }
        ],
        buyLimit: 1,
        isRecommended: true,
        sortOrder: 12
    }
];

/**
 * 公会商店商品
 */
export const guildShopItems: ShopItemConfig[] = [
    {
        itemId: 'guild_gold_pack',
        name: '公会金币包',
        description: '使用公会币购买金币',
        type: ShopItemType.RESOURCE,
        shopType: ShopType.GUILD,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'gold', amount: 5000 }
        ],
        prices: [
            { currency: CurrencyType.GUILD_COIN, originalPrice: 100, currentPrice: 100 }
        ],
        dailyLimit: 3,
        sortOrder: 1
    },
    {
        itemId: 'guild_hero_shard',
        name: '随机英雄碎片',
        description: '随机获得英雄碎片',
        type: ShopItemType.HERO_SHARD,
        shopType: ShopType.GUILD,
        contents: [
            { type: ShopItemType.HERO_SHARD, itemId: 'random_hero_shard', amount: 3 }
        ],
        prices: [
            { currency: CurrencyType.GUILD_COIN, originalPrice: 200, currentPrice: 200 }
        ],
        weeklyLimit: 5,
        sortOrder: 2
    },
    {
        itemId: 'guild_scroll_pack',
        name: '卷轴礼包',
        description: '包含多种卷轴',
        type: ShopItemType.BUNDLE,
        shopType: ShopType.GUILD,
        contents: [
            { type: ShopItemType.ITEM, itemId: 'scroll_attack', amount: 2 },
            { type: ShopItemType.ITEM, itemId: 'scroll_defense', amount: 2 }
        ],
        prices: [
            { currency: CurrencyType.GUILD_COIN, originalPrice: 150, currentPrice: 150 }
        ],
        dailyLimit: 2,
        sortOrder: 3
    }
];

/**
 * 竞技商店商品
 */
export const arenaShopItems: ShopItemConfig[] = [
    {
        itemId: 'arena_hero_shard',
        name: '竞技英雄碎片',
        description: '稀有英雄碎片',
        type: ShopItemType.HERO_SHARD,
        shopType: ShopType.ARENA,
        contents: [
            { type: ShopItemType.HERO_SHARD, itemId: 'arena_hero_shard', amount: 5 }
        ],
        prices: [
            { currency: CurrencyType.ARENA_COIN, originalPrice: 300, currentPrice: 300 }
        ],
        weeklyLimit: 10,
        sortOrder: 1
    },
    {
        itemId: 'arena_gems_pack',
        name: '竞技钻石包',
        description: '使用竞技币购买钻石',
        type: ShopItemType.RESOURCE,
        shopType: ShopType.ARENA,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'gems', amount: 50 }
        ],
        prices: [
            { currency: CurrencyType.ARENA_COIN, originalPrice: 100, currentPrice: 100 }
        ],
        dailyLimit: 5,
        sortOrder: 2
    },
    {
        itemId: 'arena_skin_1',
        name: '英雄皮肤',
        description: '稀有英雄皮肤',
        type: ShopItemType.SKIN,
        shopType: ShopType.ARENA,
        contents: [
            { type: ShopItemType.SKIN, itemId: 'skin_arena_1', amount: 1 }
        ],
        prices: [
            { currency: CurrencyType.ARENA_COIN, originalPrice: 1000, currentPrice: 800, discountType: DiscountType.PERCENT, discountValue: 20 }
        ],
        buyLimit: 1,
        isRecommended: true,
        sortOrder: 3
    }
];

/**
 * 限时商店商品
 */
export const limitedShopItems: ShopItemConfig[] = [
    {
        itemId: 'limited_daily_deal',
        name: '每日特惠',
        description: '限时特惠礼包',
        type: ShopItemType.BUNDLE,
        shopType: ShopType.LIMITED,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'gold', amount: 10000 },
            { type: ShopItemType.RESOURCE, itemId: 'gems', amount: 100 },
            { type: ShopItemType.RESOURCE, itemId: 'stamina', amount: 50 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 300, currentPrice: 99, discountType: DiscountType.PERCENT, discountValue: 67 }
        ],
        buyLimit: 1,
        isHot: true,
        sortOrder: 1
    },
    {
        itemId: 'limited_weekend_pack',
        name: '周末特惠',
        description: '周末限时礼包',
        type: ShopItemType.BUNDLE,
        shopType: ShopType.LIMITED,
        contents: [
            { type: ShopItemType.RESOURCE, itemId: 'gold', amount: 50000 },
            { type: ShopItemType.RESOURCE, itemId: 'gems', amount: 300 },
            { type: ShopItemType.HERO_SHARD, itemId: 'random_hero_shard', amount: 20 }
        ],
        prices: [
            { currency: CurrencyType.GEMS, originalPrice: 1000, currentPrice: 399, discountType: DiscountType.PERCENT, discountValue: 60 }
        ],
        buyLimit: 2,
        isRecommended: true,
        sortOrder: 2
    }
];

/**
 * 所有商店商品映射
 */
export const allShopItems: Map<string, ShopItemConfig> = new Map([
    ...normalShopItems.map(item => [item.itemId, item] as [string, ShopItemConfig]),
    ...gemsShopItems.map(item => [item.itemId, item] as [string, ShopItemConfig]),
    ...guildShopItems.map(item => [item.itemId, item] as [string, ShopItemConfig]),
    ...arenaShopItems.map(item => [item.itemId, item] as [string, ShopItemConfig]),
    ...limitedShopItems.map(item => [item.itemId, item] as [string, ShopItemConfig])
]);

/**
 * 按商店类型获取商品
 */
export function getShopItemsByType(shopType: ShopType): ShopItemConfig[] {
    switch (shopType) {
        case ShopType.NORMAL:
            return normalShopItems;
        case ShopType.GEMS:
            return gemsShopItems;
        case ShopType.GUILD:
            return guildShopItems;
        case ShopType.ARENA:
            return arenaShopItems;
        case ShopType.LIMITED:
            return limitedShopItems;
        default:
            return [];
    }
}

/**
 * 获取商品配置
 */
export function getShopItemById(itemId: string): ShopItemConfig | undefined {
    return allShopItems.get(itemId);
}

/**
 * 货币兑换配置
 */
export const currencyExchangeConfigs: CurrencyExchangeConfig[] = [
    {
        exchangeId: 'gems_to_gold_1',
        fromCurrency: CurrencyType.GEMS,
        fromAmount: 10,
        toCurrency: CurrencyType.GOLD,
        toAmount: 500,
        dailyLimit: 10,
        rate: 50
    },
    {
        exchangeId: 'gems_to_gold_2',
        fromCurrency: CurrencyType.GEMS,
        fromAmount: 50,
        toCurrency: CurrencyType.GOLD,
        toAmount: 3000,
        dailyLimit: 5,
        rate: 60
    },
    {
        exchangeId: 'gems_to_gold_3',
        fromCurrency: CurrencyType.GEMS,
        fromAmount: 100,
        toCurrency: CurrencyType.GOLD,
        toAmount: 7000,
        dailyLimit: 3,
        rate: 70
    },
    {
        exchangeId: 'gems_to_stamina',
        fromCurrency: CurrencyType.GEMS,
        fromAmount: 20,
        toCurrency: CurrencyType.STAMINA,
        toAmount: 20,
        dailyLimit: 5,
        rate: 1
    },
    {
        exchangeId: 'guild_to_gold',
        fromCurrency: CurrencyType.GUILD_COIN,
        fromAmount: 50,
        toCurrency: CurrencyType.GOLD,
        toAmount: 2500,
        dailyLimit: 5,
        rate: 50
    },
    {
        exchangeId: 'arena_to_gems',
        fromCurrency: CurrencyType.ARENA_COIN,
        fromAmount: 100,
        toCurrency: CurrencyType.GEMS,
        toAmount: 30,
        dailyLimit: 3,
        rate: 0.3
    }
];

/**
 * 获取货币兑换配置
 */
export function getExchangeConfig(exchangeId: string): CurrencyExchangeConfig | undefined {
    return currencyExchangeConfigs.find(c => c.exchangeId === exchangeId);
}