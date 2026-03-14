/**
 * 市场配置
 * 包含市场等级、资源汇率等配置
 */

import { ResourceType } from './GameTypes';
import {
    MarketLevelConfig,
    ResourceRateConfig,
    ResourceExchange,
} from './MarketTypes';

/**
 * 市场等级配置
 */
export const MARKET_LEVELS: MarketLevelConfig[] = [
    {
        level: 1,
        name: '初级市场',
        buildCost: {
            [ResourceType.GOLD]: 500,
            [ResourceType.WOOD]: 10,
            [ResourceType.ORE]: 5,
            [ResourceType.CRYSTAL]: 0,
            [ResourceType.GEM]: 0,
            [ResourceType.SULFUR]: 0,
            [ResourceType.MERCURY]: 0,
        },
        rateBonus: 0,
        dailyTradeLimit: 10,
        unlockedResources: [
            ResourceType.WOOD,
            ResourceType.ORE,
        ],
        description: '基础的资源交易市场，可以进行木材和矿石的买卖',
    },
    {
        level: 2,
        name: '中级市场',
        buildCost: {
            [ResourceType.GOLD]: 1500,
            [ResourceType.WOOD]: 20,
            [ResourceType.ORE]: 10,
            [ResourceType.CRYSTAL]: 2,
            [ResourceType.GEM]: 0,
            [ResourceType.SULFUR]: 0,
            [ResourceType.MERCURY]: 0,
        },
        rateBonus: 10,
        dailyTradeLimit: 20,
        unlockedResources: [
            ResourceType.WOOD,
            ResourceType.ORE,
            ResourceType.CRYSTAL,
            ResourceType.GEM,
        ],
        description: '升级后的市场，提供更好的汇率，解锁更多资源交易',
    },
    {
        level: 3,
        name: '高级市场',
        buildCost: {
            [ResourceType.GOLD]: 5000,
            [ResourceType.WOOD]: 30,
            [ResourceType.ORE]: 20,
            [ResourceType.CRYSTAL]: 5,
            [ResourceType.GEM]: 5,
            [ResourceType.SULFUR]: 3,
            [ResourceType.MERCURY]: 3,
        },
        rateBonus: 20,
        dailyTradeLimit: 30,
        unlockedResources: [
            ResourceType.WOOD,
            ResourceType.ORE,
            ResourceType.CRYSTAL,
            ResourceType.GEM,
            ResourceType.SULFUR,
            ResourceType.MERCURY,
        ],
        description: '高级市场，最优汇率，可交易所有稀有资源',
    },
    {
        level: 4,
        name: '大师级市场',
        buildCost: {
            [ResourceType.GOLD]: 15000,
            [ResourceType.WOOD]: 50,
            [ResourceType.ORE]: 30,
            [ResourceType.CRYSTAL]: 10,
            [ResourceType.GEM]: 10,
            [ResourceType.SULFUR]: 5,
            [ResourceType.MERCURY]: 5,
        },
        rateBonus: 30,
        dailyTradeLimit: 50,
        unlockedResources: [
            ResourceType.WOOD,
            ResourceType.ORE,
            ResourceType.CRYSTAL,
            ResourceType.GEM,
            ResourceType.SULFUR,
            ResourceType.MERCURY,
        ],
        description: '大师级市场，最佳汇率，最大交易限额',
    },
];

/**
 * 资源汇率配置
 * 价格以金币为基准
 */
export const RESOURCE_RATES: ResourceRateConfig[] = [
    {
        resourceType: ResourceType.WOOD,
        baseBuyPrice: 100,
        baseSellPrice: 80,
        minAmount: 10,
        maxAmount: 1000,
        available: true,
    },
    {
        resourceType: ResourceType.ORE,
        baseBuyPrice: 100,
        baseSellPrice: 80,
        minAmount: 10,
        maxAmount: 1000,
        available: true,
    },
    {
        resourceType: ResourceType.CRYSTAL,
        baseBuyPrice: 500,
        baseSellPrice: 400,
        minAmount: 1,
        maxAmount: 100,
        available: true,
    },
    {
        resourceType: ResourceType.GEM,
        baseBuyPrice: 500,
        baseSellPrice: 400,
        minAmount: 1,
        maxAmount: 100,
        available: true,
    },
    {
        resourceType: ResourceType.SULFUR,
        baseBuyPrice: 500,
        baseSellPrice: 400,
        minAmount: 1,
        maxAmount: 100,
        available: true,
    },
    {
        resourceType: ResourceType.MERCURY,
        baseBuyPrice: 500,
        baseSellPrice: 400,
        minAmount: 1,
        maxAmount: 100,
        available: true,
    },
];

/**
 * 资源交换配置
 * 允许资源直接交换（不经过金币）
 */
export const RESOURCE_EXCHANGES: ResourceExchange[] = [
    {
        id: 'wood_to_ore',
        fromResource: ResourceType.WOOD,
        toResource: ResourceType.ORE,
        ratio: 1,
        dailyLimit: 5,
        usedCount: 0,
    },
    {
        id: 'ore_to_wood',
        fromResource: ResourceType.ORE,
        toResource: ResourceType.WOOD,
        ratio: 1,
        dailyLimit: 5,
        usedCount: 0,
    },
    {
        id: 'crystal_to_gem',
        fromResource: ResourceType.CRYSTAL,
        toResource: ResourceType.GEM,
        ratio: 1,
        dailyLimit: 3,
        usedCount: 0,
    },
    {
        id: 'gem_to_crystal',
        fromResource: ResourceType.GEM,
        toResource: ResourceType.CRYSTAL,
        ratio: 1,
        dailyLimit: 3,
        usedCount: 0,
    },
    {
        id: 'sulfur_to_mercury',
        fromResource: ResourceType.SULFUR,
        toResource: ResourceType.MERCURY,
        ratio: 1,
        dailyLimit: 3,
        usedCount: 0,
    },
    {
        id: 'mercury_to_sulfur',
        fromResource: ResourceType.MERCURY,
        toResource: ResourceType.SULFUR,
        ratio: 1,
        dailyLimit: 3,
        usedCount: 0,
    },
    // 稀有资源交换（需要更多数量）
    {
        id: 'wood_to_crystal',
        fromResource: ResourceType.WOOD,
        toResource: ResourceType.CRYSTAL,
        ratio: 5, // 5木材换1水晶
        dailyLimit: 2,
        usedCount: 0,
    },
    {
        id: 'ore_to_gem',
        fromResource: ResourceType.ORE,
        toResource: ResourceType.GEM,
        ratio: 5,
        dailyLimit: 2,
        usedCount: 0,
    },
];

/**
 * 获取市场等级配置
 */
export function getMarketLevelConfig(level: number): MarketLevelConfig | undefined {
    return MARKET_LEVELS.find(config => config.level === level);
}

/**
 * 获取资源汇率配置
 */
export function getResourceRateConfig(resourceType: ResourceType): ResourceRateConfig | undefined {
    return RESOURCE_RATES.find(config => config.resourceType === resourceType);
}

/**
 * 获取资源交换配置
 */
export function getResourceExchangeConfig(exchangeId: string): ResourceExchange | undefined {
    return RESOURCE_EXCHANGES.find(config => config.id === exchangeId);
}

/**
 * 获取默认市场数据
 */
export function getDefaultMarketData(): import('./MarketTypes').MarketData {
    return {
        level: 1,
        todayTradeCount: 0,
        lastResetTime: Date.now(),
        tradeRecords: [],
    };
}