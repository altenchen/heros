/**
 * 商店管理器
 * 管理商品购买、货币兑换、商店刷新
 * 遵循阿里巴巴开发者手册规范
 */

import {
    ShopType,
    ShopItemState,
    ShopItemConfig,
    ShopPurchaseResult,
    ShopPurchaseRecord,
    ShopProgress,
    ShopEventType,
    ShopEventData,
    ShopItemContent,
    CurrencyType,
    CurrencyExchangeConfig
} from '../config/ShopTypes';
import {
    allShopItems,
    getShopItemsByType,
    getShopItemById,
    currencyExchangeConfigs,
    getExchangeConfig
} from '../config/shop.json';
import { EventCenter } from '../utils/EventTarget';
import { playerDataManager } from '../utils/PlayerDataManager';
import { rewardManager, RewardType, RewardConfig } from '../utils/RewardManager';
import { ResourceType } from '../config/GameTypes';

/**
 * 商店管理器
 * 单例模式
 */
export class ShopManager {
    private static _instance: ShopManager | null = null;

    /** 商店进度 */
    private _progress: Map<ShopType, ShopProgress> = new Map();

    /** 存储键 */
    private readonly SETTINGS_KEY = 'hmm_legacy_shop';

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): ShopManager {
        if (!ShopManager._instance) {
            ShopManager._instance = new ShopManager();
        }
        return ShopManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this._checkDailyRefresh();
        console.log('[ShopManager] 初始化完成');
    }

    /**
     * 检查每日刷新
     */
    private _checkDailyRefresh(): void {
        const now = Date.now();

        this._progress.forEach((progress, shopType) => {
            if (!this._isSameDay(progress.lastRefreshTime, now)) {
                // 重置每日购买计数
                progress.dailyPurchaseCount = new Map();
                progress.manualRefreshCount = 0;
                progress.lastRefreshTime = now;
            }
        });
    }

    /**
     * 检查是否同一天
     */
    private _isSameDay(time1: number, time2: number): boolean {
        const date1 = new Date(time1);
        const date2 = new Date(time2);
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    /**
     * 获取商店商品列表
     */
    getShopItems(shopType: ShopType): ShopItemConfig[] {
        const items = getShopItemsByType(shopType);

        // 过滤已过期和未解锁的商品
        return items.filter(item => {
            const state = this._getItemState(item);
            return state !== ShopItemState.EXPIRED && state !== ShopItemState.LOCKED;
        });
    }

    /**
     * 获取商品状态
     */
    getItemState(itemId: string): ShopItemState {
        const item = getShopItemById(itemId);
        if (!item) {
            return ShopItemState.LOCKED;
        }
        return this._getItemState(item);
    }

    /**
     * 获取商品状态内部实现
     */
    private _getItemState(item: ShopItemConfig): ShopItemState {
        const now = Date.now();

        // 检查限时商品是否过期
        if (item.endTime && now > item.endTime) {
            return ShopItemState.EXPIRED;
        }

        // 检查限时商品是否开始
        if (item.startTime && now < item.startTime) {
            return ShopItemState.LOCKED;
        }

        // 检查等级要求
        const playerLevel = playerDataManager.getPlayerLevel();
        if (item.levelRequired && playerLevel < item.levelRequired) {
            return ShopItemState.LOCKED;
        }

        // 检查VIP要求
        // const vipLevel = playerDataManager.getVipLevel();
        // if (item.vipRequired && vipLevel < item.vipRequired) {
        //     return ShopItemState.LOCKED;
        // }

        // 检查购买限制
        const progress = this._getOrCreateProgress(item.shopType);
        const purchaseCount = this._getPurchaseCount(item, progress);

        if (item.buyLimit && purchaseCount >= item.buyLimit) {
            return ShopItemState.SOLD_OUT;
        }
        if (item.dailyLimit !== undefined && (progress.dailyPurchaseCount.get(item.itemId) ?? 0) >= item.dailyLimit) {
            return ShopItemState.SOLD_OUT;
        }
        if (item.weeklyLimit !== undefined) {
            const weeklyCount = progress.weeklyPurchaseCount.get(item.itemId) || 0;
            if (weeklyCount >= item.weeklyLimit) {
                return ShopItemState.SOLD_OUT;
            }
        }

        return ShopItemState.AVAILABLE;
    }

    /**
     * 获取购买次数
     */
    private _getPurchaseCount(item: ShopItemConfig, progress: ShopProgress): number {
        return progress.totalPurchaseCount.get(item.itemId) || 0;
    }

    /**
     * 获取或创建商店进度
     */
    private _getOrCreateProgress(shopType: ShopType): ShopProgress {
        if (!this._progress.has(shopType)) {
            this._progress.set(shopType, {
                shopType,
                purchases: [],
                dailyPurchaseCount: new Map(),
                weeklyPurchaseCount: new Map(),
                totalPurchaseCount: new Map(),
                lastRefreshTime: Date.now(),
                manualRefreshCount: 0
            });
        }
        return this._progress.get(shopType)!;
    }

    /**
     * 购买商品
     */
    purchase(itemId: string, quantity: number = 1): ShopPurchaseResult {
        const item = getShopItemById(itemId);

        if (!item) {
            return {
                success: false,
                error: '商品不存在'
            };
        }

        // 检查商品状态
        const state = this._getItemState(item);
        if (state !== ShopItemState.AVAILABLE) {
            return {
                success: false,
                itemId,
                error: this._getStateError(state)
            };
        }

        // 检查购买限制
        const progress = this._getOrCreateProgress(item.shopType);
        if (!this._checkPurchaseLimit(item, progress, quantity)) {
            return {
                success: false,
                itemId,
                error: '超出购买限制'
            };
        }

        // 检查资源是否足够
        const price = item.prices[0];
        const totalCost = price.currentPrice * quantity;
        const currentAmount = this._getCurrencyAmount(price.currency);

        if (currentAmount < totalCost) {
            return {
                success: false,
                itemId,
                error: '资源不足'
            };
        }

        // 扣除货币
        this._deductCurrency(price.currency, totalCost);

        // 发放商品内容
        const contents = this._grantContents(item.contents, quantity);

        // 记录购买
        this._recordPurchase(item, quantity, price.currency, totalCost, progress);

        // 发送事件
        const eventData: ShopEventData = {
            shopType: item.shopType,
            itemId: item.itemId,
            quantity,
            contents
        };
        EventCenter.emit(ShopEventType.PURCHASE_SUCCESS, eventData);

        console.log(`[ShopManager] 购买成功: ${item.name} x${quantity}`);

        // 计算剩余购买次数
        const remainingCount = this._calculateRemainingCount(item, progress);

        return {
            success: true,
            itemId: item.itemId,
            quantity,
            contents,
            remainingCount
        };
    }

    /**
     * 获取状态错误信息
     */
    private _getStateError(state: ShopItemState): string {
        switch (state) {
            case ShopItemState.SOLD_OUT:
                return '商品已售罄';
            case ShopItemState.LOCKED:
                return '商品未解锁';
            case ShopItemState.EXPIRED:
                return '商品已过期';
            default:
                return '无法购买';
        }
    }

    /**
     * 检查购买限制
     */
    private _checkPurchaseLimit(item: ShopItemConfig, progress: ShopProgress, quantity: number): boolean {
        // 检查总购买限制
        if (item.buyLimit) {
            const totalCount = progress.totalPurchaseCount.get(item.itemId) || 0;
            if (totalCount + quantity > item.buyLimit) {
                return false;
            }
        }

        // 检查每日限制
        if (item.dailyLimit) {
            const dailyCount = progress.dailyPurchaseCount.get(item.itemId) || 0;
            if (dailyCount + quantity > item.dailyLimit) {
                return false;
            }
        }

        // 检查每周限制
        if (item.weeklyLimit) {
            const weeklyCount = progress.weeklyPurchaseCount.get(item.itemId) || 0;
            if (weeklyCount + quantity > item.weeklyLimit) {
                return false;
            }
        }

        return true;
    }

    /**
     * 获取货币数量
     */
    private _getCurrencyAmount(currency: CurrencyType): number {
        switch (currency) {
            case CurrencyType.GOLD:
                return playerDataManager.getResource(ResourceType.GOLD);
            case CurrencyType.GEMS:
                return playerDataManager.getResource(ResourceType.GEMS);
            case CurrencyType.STAMINA:
                return playerDataManager.getResource(ResourceType.STAMINA);
            case CurrencyType.GUILD_COIN:
                // return playerDataManager.getResource('guild_coin');
                return 0;
            case CurrencyType.ARENA_COIN:
                // return playerDataManager.getResource('arena_coin');
                return 0;
            default:
                return 0;
        }
    }

    /**
     * 扣除货币
     */
    private _deductCurrency(currency: CurrencyType, amount: number): void {
        switch (currency) {
            case CurrencyType.GOLD:
                playerDataManager.addResource(ResourceType.GOLD, -amount);
                break;
            case CurrencyType.GEMS:
                playerDataManager.addResource(ResourceType.GEMS, -amount);
                break;
            case CurrencyType.STAMINA:
                playerDataManager.addResource(ResourceType.STAMINA, -amount);
                break;
            case CurrencyType.GUILD_COIN:
                // playerDataManager.addResource('guild_coin', -amount);
                break;
            case CurrencyType.ARENA_COIN:
                // playerDataManager.addResource('arena_coin', -amount);
                break;
        }
    }

    /**
     * 发放商品内容
     */
    private _grantContents(contents: ShopItemContent[], quantity: number): ShopItemContent[] {
        const granted: ShopItemContent[] = [];

        contents.forEach(content => {
            const totalAmount = content.amount * quantity;

            // 构建奖励配置
            const reward: RewardConfig = {
                type: content.type,
                itemId: content.itemId,
                amount: totalAmount
            };

            // 使用统一奖励发放
            const results = rewardManager.grantRewards([reward]);

            if (results[0]?.success) {
                granted.push({ ...content, amount: totalAmount });
            } else {
                console.warn(`[ShopManager] 发放奖励失败: ${content.type} ${content.itemId}`);
            }
        });

        return granted;
    }

    /**
     * 记录购买
     */
    private _recordPurchase(
        item: ShopItemConfig,
        quantity: number,
        currency: CurrencyType,
        cost: number,
        progress: ShopProgress
    ): void {
        // 添加购买记录
        const record: ShopPurchaseRecord = {
            itemId: item.itemId,
            purchaseTime: Date.now(),
            quantity,
            cost: { currency, amount: cost }
        };
        progress.purchases.push(record);

        // 更新购买计数
        progress.totalPurchaseCount.set(
            item.itemId,
            (progress.totalPurchaseCount.get(item.itemId) || 0) + quantity
        );
        progress.dailyPurchaseCount.set(
            item.itemId,
            (progress.dailyPurchaseCount.get(item.itemId) || 0) + quantity
        );
        progress.weeklyPurchaseCount.set(
            item.itemId,
            (progress.weeklyPurchaseCount.get(item.itemId) || 0) + quantity
        );
    }

    /**
     * 计算剩余购买次数
     */
    private _calculateRemainingCount(item: ShopItemConfig, progress: ShopProgress): number {
        if (item.buyLimit) {
            const totalCount = progress.totalPurchaseCount.get(item.itemId) || 0;
            return item.buyLimit - totalCount;
        }
        if (item.dailyLimit) {
            const dailyCount = progress.dailyPurchaseCount.get(item.itemId) || 0;
            return item.dailyLimit - dailyCount;
        }
        if (item.weeklyLimit) {
            const weeklyCount = progress.weeklyPurchaseCount.get(item.itemId) || 0;
            return item.weeklyLimit - weeklyCount;
        }
        return Infinity;
    }

    /**
     * 货币兑换
     */
    exchange(exchangeId: string): ShopPurchaseResult {
        const config = getExchangeConfig(exchangeId);

        if (!config) {
            return {
                success: false,
                error: '兑换配置不存在'
            };
        }

        // 检查每日兑换限制
        // TODO: 实现兑换次数限制

        // 检查源货币是否足够
        const fromAmount = this._getCurrencyAmount(config.fromCurrency);
        if (fromAmount < config.fromAmount) {
            return {
                success: false,
                error: '资源不足'
            };
        }

        // 执行兑换
        this._deductCurrency(config.fromCurrency, config.fromAmount);

        // 发放目标货币
        const contents: ShopItemContent[] = [];
        if (config.toCurrency === CurrencyType.GOLD) {
            playerDataManager.addResource(ResourceType.GOLD, config.toAmount);
            contents.push({ type: 'resource' as any, itemId: 'gold', amount: config.toAmount });
        } else if (config.toCurrency === CurrencyType.GEMS) {
            playerDataManager.addResource(ResourceType.GEMS, config.toAmount);
            contents.push({ type: 'resource' as any, itemId: 'gems', amount: config.toAmount });
        } else if (config.toCurrency === CurrencyType.STAMINA) {
            playerDataManager.addResource(ResourceType.STAMINA, config.toAmount);
            contents.push({ type: 'resource' as any, itemId: 'stamina', amount: config.toAmount });
        }

        console.log(`[ShopManager] 兑换成功: ${config.fromAmount}${config.fromCurrency} -> ${config.toAmount}${config.toCurrency}`);

        return {
            success: true,
            quantity: 1,
            contents
        };
    }

    /**
     * 获取购买记录
     */
    getPurchaseRecords(shopType?: ShopType): ShopPurchaseRecord[] {
        if (shopType) {
            const progress = this._progress.get(shopType);
            return progress?.purchases || [];
        }

        const allRecords: ShopPurchaseRecord[] = [];
        this._progress.forEach(progress => {
            allRecords.push(...progress.purchases);
        });
        return allRecords.sort((a, b) => b.purchaseTime - a.purchaseTime);
    }

    /**
     * 获取商品剩余购买次数
     */
    getRemainingPurchaseCount(itemId: string): number {
        const item = getShopItemById(itemId);
        if (!item) {
            return 0;
        }

        const progress = this._getOrCreateProgress(item.shopType);
        return this._calculateRemainingCount(item, progress);
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            progress: Array.from(this._progress.entries()).map(([type, progress]) => ({
                shopType: type,
                purchases: progress.purchases,
                dailyPurchaseCount: Array.from(progress.dailyPurchaseCount.entries()),
                weeklyPurchaseCount: Array.from(progress.weeklyPurchaseCount.entries()),
                totalPurchaseCount: Array.from(progress.totalPurchaseCount.entries()),
                lastRefreshTime: progress.lastRefreshTime,
                manualRefreshCount: progress.manualRefreshCount
            }))
        };
        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);
            if (parsed.progress) {
                parsed.progress.forEach((p: any) => {
                    this._progress.set(p.shopType, {
                        shopType: p.shopType,
                        purchases: p.purchases || [],
                        dailyPurchaseCount: new Map(p.dailyPurchaseCount || []),
                        weeklyPurchaseCount: new Map(p.weeklyPurchaseCount || []),
                        totalPurchaseCount: new Map(p.totalPurchaseCount || []),
                        lastRefreshTime: p.lastRefreshTime || Date.now(),
                        manualRefreshCount: p.manualRefreshCount || 0
                    });
                });
            }
            this._checkDailyRefresh();
            console.log('[ShopManager] 数据加载完成');
        } catch (e) {
            console.error('[ShopManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._progress.clear();
    }
}

// 导出单例
export const shopManager = ShopManager.getInstance();