/**
 * 市场管理器
 * 处理资源交易、汇率计算、市场升级等功能
 */

import { ResourceType } from '../config/GameTypes';
import { EventCenter } from '../utils/EventTarget';
import {
    MarketData,
    TradeType,
    TradeRequest,
    TradeResult,
    TradeRecord,
    RatePreview,
    MarketEventType,
    MarketEventData,
    ExchangeRequest,
    ExchangeResult,
    ResourceExchange,
} from '../config/MarketTypes';
import {
    MARKET_LEVELS,
    RESOURCE_RATES,
    RESOURCE_EXCHANGES,
    getMarketLevelConfig,
    getResourceRateConfig,
    getDefaultMarketData,
} from '../config/market.json';

/**
 * 市场管理器实例
 */
let marketManagerInstance: MarketManager | null = null;

/**
 * 市场管理器
 */
export class MarketManager {
    private data: MarketData;
    private exchanges: ResourceExchange[];
    private initialized: boolean = false;

    private constructor() {
        this.data = getDefaultMarketData();
        this.exchanges = JSON.parse(JSON.stringify(RESOURCE_EXCHANGES));
    }

    /**
     * 获取单例实例
     */
    static getInstance(): MarketManager {
        if (!marketManagerInstance) {
            marketManagerInstance = new MarketManager();
        }
        return marketManagerInstance;
    }

    /**
     * 初始化市场
     */
    init(data?: MarketData): void {
        if (data) {
            this.data = data;
        } else {
            this.data = getDefaultMarketData();
        }

        // 检查每日重置
        this.checkDailyReset();

        this.initialized = true;
        console.log('MarketManager initialized');
    }

    /**
     * 检查是否初始化
     */
    isInitialized(): boolean {
        return this.initialized;
    }

    /**
     * 检查每日重置
     */
    private checkDailyReset(): void {
        const now = Date.now();
        const lastReset = new Date(this.data.lastResetTime);
        const today = new Date(now);

        // 如果是不同的天，重置交易次数
        if (lastReset.getDate() !== today.getDate() ||
            lastReset.getMonth() !== today.getMonth() ||
            lastReset.getFullYear() !== today.getFullYear()) {

            this.data.todayTradeCount = 0;
            this.data.lastResetTime = now;

            // 重置资源交换使用次数
            this.exchanges.forEach(exchange => {
                exchange.usedCount = 0;
            });

            this.emitEvent(MarketEventType.DAILY_RESET);
        }
    }

    /**
     * 获取市场数据
     */
    getMarketData(): MarketData {
        this.checkDailyReset();
        return { ...this.data };
    }

    /**
     * 获取市场等级
     */
    getMarketLevel(): number {
        return this.data.level;
    }

    /**
     * 获取市场等级配置
     */
    getLevelConfig() {
        return getMarketLevelConfig(this.data.level);
    }

    /**
     * 获取剩余交易次数
     */
    getRemainingTrades(): number {
        this.checkDailyReset();
        const config = this.getLevelConfig();
        return config ? config.dailyTradeLimit - this.data.todayTradeCount : 0;
    }

    /**
     * 检查资源是否可用
     */
    isResourceAvailable(resourceType: ResourceType): boolean {
        const config = this.getLevelConfig();
        if (!config) return false;
        return config.unlockedResources.includes(resourceType);
    }

    /**
     * 获取当前汇率（考虑等级加成）
     */
    getCurrentRate(resourceType: ResourceType, tradeType: TradeType): number {
        const rateConfig = getResourceRateConfig(resourceType);
        if (!rateConfig) return 0;

        const levelConfig = this.getLevelConfig();
        const bonus = (levelConfig?.rateBonus ?? 0) / 100;

        if (tradeType === TradeType.BUY) {
            // 买入价格：等级越高越便宜
            return Math.floor(rateConfig.baseBuyPrice * (1 - bonus));
        } else {
            // 卖出价格：等级越高越高
            return Math.floor(rateConfig.baseSellPrice * (1 + bonus));
        }
    }

    /**
     * 获取汇率预览
     */
    getRatePreviews(): RatePreview[] {
        const previews: RatePreview[] = [];
        const levelConfig = this.getLevelConfig();

        RESOURCE_RATES.forEach(rate => {
            const available = this.isResourceAvailable(rate.resourceType);
            const bonus = levelConfig?.rateBonus ?? 0;

            previews.push({
                resourceType: rate.resourceType,
                buyPrice: this.getCurrentRate(rate.resourceType, TradeType.BUY),
                sellPrice: this.getCurrentRate(rate.resourceType, TradeType.SELL),
                rateBonus: bonus,
                available,
            });
        });

        return previews;
    }

    /**
     * 计算交易价格
     */
    calculateTradePrice(request: TradeRequest): { price: number; unitPrice: number } | null {
        const rateConfig = getResourceRateConfig(request.resourceType);
        if (!rateConfig) return null;

        // 检查数量范围
        if (request.amount < rateConfig.minAmount || request.amount > rateConfig.maxAmount) {
            return null;
        }

        const unitPrice = this.getCurrentRate(request.resourceType, request.tradeType);
        const price = unitPrice * request.amount;

        return { price, unitPrice };
    }

    /**
     * 执行交易
     */
    executeTrade(request: TradeRequest, playerResources: {
        getResource: (type: ResourceType) => number;
        addResource: (type: ResourceType, amount: number) => void;
        useResource: (type: ResourceType, amount: number) => boolean;
    }): TradeResult {
        // 检查每日重置
        this.checkDailyReset();

        // 检查交易次数
        const remainingTrades = this.getRemainingTrades();
        if (remainingTrades <= 0) {
            return {
                success: false,
                error: '今日交易次数已用完',
                remainingTrades: 0,
            };
        }

        // 检查资源是否可用
        if (!this.isResourceAvailable(request.resourceType)) {
            return {
                success: false,
                error: '该资源尚未解锁交易',
                remainingTrades,
            };
        }

        // 计算价格
        const priceInfo = this.calculateTradePrice(request);
        if (!priceInfo) {
            return {
                success: false,
                error: '交易数量无效',
                remainingTrades,
            };
        }

        const { price, unitPrice } = priceInfo;

        if (request.tradeType === TradeType.BUY) {
            // 买入：消耗金币，获得资源
            if (playerResources.getResource(ResourceType.GOLD) < price) {
                return {
                    success: false,
                    error: '金币不足',
                    remainingTrades,
                };
            }

            // 执行交易
            playerResources.useResource(ResourceType.GOLD, price);
            playerResources.addResource(request.resourceType, request.amount);
        } else {
            // 卖出：消耗资源，获得金币
            if (playerResources.getResource(request.resourceType) < request.amount) {
                return {
                    success: false,
                    error: '资源不足',
                    remainingTrades,
                };
            }

            // 执行交易
            playerResources.useResource(request.resourceType, request.amount);
            playerResources.addResource(ResourceType.GOLD, price);
        }

        // 记录交易
        const record: TradeRecord = {
            id: `trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            tradeType: request.tradeType,
            resourceType: request.resourceType,
            amount: request.amount,
            totalPrice: price,
            unitPrice,
        };

        this.data.tradeRecords.push(record);
        this.data.todayTradeCount++;

        // 限制记录数量
        if (this.data.tradeRecords.length > 100) {
            this.data.tradeRecords = this.data.tradeRecords.slice(-50);
        }

        // 发送事件
        this.emitEvent(MarketEventType.TRADE_COMPLETE, { trade: record });

        return {
            success: true,
            trade: {
                resourceType: request.resourceType,
                amount: request.amount,
                gold: price,
                unitPrice,
            },
            remainingTrades: this.getRemainingTrades(),
        };
    }

    /**
     * 获取资源交换列表
     */
    getResourceExchanges(): ResourceExchange[] {
        this.checkDailyReset();
        return this.exchanges.map(e => ({ ...e }));
    }

    /**
     * 执行资源交换
     */
    executeExchange(
        request: ExchangeRequest,
        playerResources: {
            getResource: (type: ResourceType) => number;
            addResource: (type: ResourceType, amount: number) => void;
            useResource: (type: ResourceType, amount: number) => boolean;
        }
    ): ExchangeResult {
        // 检查每日重置
        this.checkDailyReset();

        const exchange = this.exchanges.find(e => e.id === request.exchangeId);
        if (!exchange) {
            return {
                success: false,
                error: '交换配置不存在',
            };
        }

        // 检查每日限制
        if (exchange.usedCount >= exchange.dailyLimit) {
            return {
                success: false,
                error: '今日交换次数已用完',
                remainingCount: 0,
            };
        }

        // 计算需要的源资源数量
        const fromAmount = request.fromAmount;
        const toAmount = Math.floor(fromAmount / exchange.ratio);

        if (toAmount <= 0) {
            return {
                success: false,
                error: '交换数量不足',
            };
        }

        // 检查源资源是否足够
        if (playerResources.getResource(exchange.fromResource) < fromAmount) {
            return {
                success: false,
                error: '资源不足',
            };
        }

        // 执行交换
        playerResources.useResource(exchange.fromResource, fromAmount);
        playerResources.addResource(exchange.toResource, toAmount);

        // 更新使用次数
        exchange.usedCount++;

        return {
            success: true,
            toResource: exchange.toResource,
            toAmount,
            remainingCount: exchange.dailyLimit - exchange.usedCount,
        };
    }

    /**
     * 升级市场
     */
    upgradeMarket(playerResources: {
        hasEnoughResources: (cost: Partial<Record<ResourceType, number>>) => boolean;
        useResources: (cost: Partial<Record<ResourceType, number>>) => boolean;
    }): { success: boolean; error?: string; newLevel?: number } {
        const nextLevel = this.data.level + 1;
        const nextConfig = getMarketLevelConfig(nextLevel);

        if (!nextConfig) {
            return {
                success: false,
                error: '市场已达最高等级',
            };
        }

        // 检查资源
        if (!playerResources.hasEnoughResources(nextConfig.buildCost)) {
            return {
                success: false,
                error: '资源不足，无法升级',
            };
        }

        // 扣除资源
        const oldLevel = this.data.level;
        playerResources.useResources(nextConfig.buildCost);
        this.data.level = nextLevel;

        // 发送事件
        this.emitEvent(MarketEventType.MARKET_UPGRADED, {
            newLevel: nextLevel,
            oldLevel,
        });

        return {
            success: true,
            newLevel: nextLevel,
        };
    }

    /**
     * 获取交易记录
     */
    getTradeRecords(limit: number = 20): TradeRecord[] {
        return this.data.tradeRecords.slice(-limit);
    }

    /**
     * 获取存档数据
     */
    getSaveData(): MarketData {
        return {
            ...this.data,
            exchanges: this.exchanges.map(e => ({ ...e })),
        };
    }

    /**
     * 加载存档数据
     */
    loadSaveData(data: MarketData): void {
        this.data = { ...data };
        if (data.exchanges) {
            this.exchanges = data.exchanges.map(e => ({ ...e }));
        }
        this.checkDailyReset();
    }

    /**
     * 发送事件
     */
    private emitEvent(type: MarketEventType, data?: Partial<MarketEventData>): void {
        const eventData: MarketEventData = {
            type,
            ...data,
        };
        EventCenter.emit(type, eventData);
    }
}

/**
 * 导出市场管理器实例
 */
export const marketManager = MarketManager.getInstance();