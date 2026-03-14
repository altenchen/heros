/**
 * 招募系统配置数据
 * 遵循阿里巴巴开发者手册规范
 */

import {
    GachaPoolType,
    Rarity,
    GachaResultType,
    GachaPoolConfig,
    GachaPoolItem,
    GachaPityConfig,
    DEFAULT_RARITY_RATES
} from './GachaTypes';

// ==================== 招募池配置 ====================

/** 英雄招募池 */
export const heroPoolConfig: GachaPoolConfig = {
    poolId: 'pool_hero_normal',
    name: '英雄召唤',
    type: GachaPoolType.HERO,
    description: '召唤强力英雄加入你的队伍',
    startTime: 0,
    endTime: 0, // 永久
    enabled: true,
    singleCost: {
        currency: 'gems',
        amount: 150
    },
    tenCost: {
        currency: 'gems',
        amount: 1350,
        discount: 10
    },
    pity: {
        softPity: 70,
        hardPity: 100,
        pityRarity: Rarity.EPIC,
        independentCounter: false
    },
    items: [
        // 传说英雄碎片
        {
            itemId: 'hero_shard_legendary_1',
            resultType: GachaResultType.HERO_SHARD,
            rarity: Rarity.LEGENDARY,
            baseRate: 0.005,
            weight: 50,
            amountRange: [1, 5]
        },
        {
            itemId: 'hero_shard_legendary_2',
            resultType: GachaResultType.HERO_SHARD,
            rarity: Rarity.LEGENDARY,
            baseRate: 0.005,
            weight: 50,
            amountRange: [1, 5]
        },
        {
            itemId: 'hero_shard_legendary_3',
            resultType: GachaResultType.HERO_SHARD,
            rarity: Rarity.LEGENDARY,
            baseRate: 0.005,
            weight: 50,
            amountRange: [1, 5]
        },
        // 史诗英雄碎片
        {
            itemId: 'hero_shard_epic_1',
            resultType: GachaResultType.HERO_SHARD,
            rarity: Rarity.EPIC,
            baseRate: 0.02,
            weight: 100,
            amountRange: [5, 10]
        },
        {
            itemId: 'hero_shard_epic_2',
            resultType: GachaResultType.HERO_SHARD,
            rarity: Rarity.EPIC,
            baseRate: 0.02,
            weight: 100,
            amountRange: [5, 10]
        },
        {
            itemId: 'hero_shard_epic_3',
            resultType: GachaResultType.HERO_SHARD,
            rarity: Rarity.EPIC,
            baseRate: 0.02,
            weight: 100,
            amountRange: [5, 10]
        },
        // 稀有英雄碎片
        {
            itemId: 'hero_shard_rare_1',
            resultType: GachaResultType.HERO_SHARD,
            rarity: Rarity.RARE,
            baseRate: 0.10,
            weight: 200,
            amountRange: [10, 20]
        },
        {
            itemId: 'hero_shard_rare_2',
            resultType: GachaResultType.HERO_SHARD,
            rarity: Rarity.RARE,
            baseRate: 0.10,
            weight: 200,
            amountRange: [10, 20]
        },
        {
            itemId: 'hero_shard_rare_3',
            resultType: GachaResultType.HERO_SHARD,
            rarity: Rarity.RARE,
            baseRate: 0.10,
            weight: 200,
            amountRange: [10, 20]
        },
        // 普通道具
        {
            itemId: 'item_potion_hp',
            resultType: GachaResultType.ITEM,
            rarity: Rarity.COMMON,
            baseRate: 0.20,
            weight: 50,
            amountRange: [10, 50]
        },
        {
            itemId: 'item_potion_mp',
            resultType: GachaResultType.ITEM,
            rarity: Rarity.COMMON,
            baseRate: 0.20,
            weight: 50,
            amountRange: [10, 50]
        },
        {
            itemId: 'gold',
            resultType: GachaResultType.RESOURCE,
            rarity: Rarity.COMMON,
            baseRate: 0.15,
            weight: 50,
            amountRange: [1000, 5000]
        },
        {
            itemId: 'gems',
            resultType: GachaResultType.RESOURCE,
            rarity: Rarity.RARE,
            baseRate: 0.05,
            weight: 100,
            amountRange: [50, 200]
        }
    ],
    bgImage: 'bg_gacha_hero',
    bannerImage: 'banner_gacha_hero'
};

/** 新手招募池 */
export const beginnerPoolConfig: GachaPoolConfig = {
    poolId: 'pool_beginner',
    name: '新手召唤',
    type: GachaPoolType.BEGINNER,
    description: '新手专属，必得史诗英雄',
    startTime: 0,
    endTime: 0,
    enabled: true,
    singleCost: {
        currency: 'gems',
        amount: 100
    },
    tenCost: {
        currency: 'gems',
        amount: 900,
        discount: 10
    },
    pity: {
        softPity: 10,
        hardPity: 20,
        pityRarity: Rarity.EPIC,
        independentCounter: true
    },
    items: heroPoolConfig.items,
    bgImage: 'bg_gacha_beginner',
    bannerImage: 'banner_gacha_beginner'
};

/** 限定招募池 */
export const limitedPoolConfig: GachaPoolConfig = {
    poolId: 'pool_limited_1',
    name: '限定召唤',
    type: GachaPoolType.LIMITED,
    description: '限时UP，传说英雄概率翻倍',
    startTime: Date.now(),
    endTime: Date.now() + 14 * 24 * 60 * 60 * 1000, // 14天
    enabled: true,
    singleCost: {
        currency: 'gems',
        amount: 200
    },
    tenCost: {
        currency: 'gems',
        amount: 1800,
        discount: 10
    },
    pity: {
        softPity: 60,
        hardPity: 80,
        pityRarity: Rarity.LEGENDARY,
        independentCounter: true
    },
    items: heroPoolConfig.items,
    upItems: ['hero_shard_legendary_1'],
    bgImage: 'bg_gacha_limited',
    bannerImage: 'banner_gacha_limited'
};

// ==================== 所有招募池 ====================

/** 所有招募池配置 */
export const gachaPools: GachaPoolConfig[] = [
    heroPoolConfig,
    beginnerPoolConfig,
    limitedPoolConfig
];

// ==================== 辅助函数 ====================

/**
 * 获取招募池配置
 */
export function getGachaPool(poolId: string): GachaPoolConfig | undefined {
    return gachaPools.find(p => p.poolId === poolId);
}

/**
 * 获取开启中的招募池
 */
export function getActivePools(): GachaPoolConfig[] {
    const now = Date.now();
    return gachaPools.filter(p => {
        if (!p.enabled) return false;
        if (p.startTime > 0 && p.startTime > now) return false;
        if (p.endTime > 0 && p.endTime < now) return false;
        return true;
    });
}

/**
 * 获取指定稀有度的物品列表
 */
export function getItemsByRarity(pool: GachaPoolConfig, rarity: Rarity): GachaPoolItem[] {
    return pool.items.filter(item => item.rarity === rarity);
}

/**
 * 获取UP物品列表
 */
export function getUpItems(pool: GachaPoolConfig): GachaPoolItem[] {
    if (!pool.upItems || pool.upItems.length === 0) return [];
    return pool.items.filter(item => pool.upItems!.includes(item.itemId));
}

/**
 * 计算实际概率
 */
export function calculateActualRate(
    baseRate: number,
    pityCount: number,
    pityConfig: GachaPityConfig
): number {
    if (pityCount < pityConfig.softPity) {
        return baseRate;
    }

    // 软保底区间概率提升
    const pityProgress = pityCount - pityConfig.softPity;
    const pityRange = pityConfig.hardPity - pityConfig.softPity;
    const pityBonus = Math.min(1, pityProgress / pityRange);

    return baseRate + pityBonus * 0.5; // 最高提升50%
}

/**
 * 获取稀有度颜色
 */
export function getRarityColor(rarity: Rarity): string {
    switch (rarity) {
        case Rarity.COMMON: return '#FFFFFF';
        case Rarity.RARE: return '#4A90D9';
        case Rarity.EPIC: return '#A335EE';
        case Rarity.LEGENDARY: return '#FF8000';
        default: return '#FFFFFF';
    }
}

/**
 * 获取稀有度名称
 */
export function getRarityName(rarity: Rarity): string {
    switch (rarity) {
        case Rarity.COMMON: return '普通';
        case Rarity.RARE: return '稀有';
        case Rarity.EPIC: return '史诗';
        case Rarity.LEGENDARY: return '传说';
        default: return '未知';
    }
}