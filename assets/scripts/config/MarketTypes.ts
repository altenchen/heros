/**
 * 市场系统类型定义
 * 用于资源交换和贸易
 */

import { ResourceType } from './GameTypes';

/**
 * 交易类型
 */
export enum TradeType {
    /** 买入资源 */
    BUY = 'buy',
    /** 卖出资源 */
    SELL = 'sell',
}

/**
 * 汇率类型
 */
export enum ExchangeRateType {
    /** 固定汇率 */
    FIXED = 'fixed',
    /** 动态汇率（根据市场供需） */
    DYNAMIC = 'dynamic',
}

/**
 * 市场等级配置
 */
export interface MarketLevelConfig {
    /** 等级 */
    level: number;
    /** 市场名称 */
    name: string;
    /** 建造费用 */
    buildCost: Partial<Record<ResourceType, number>>;
    /** 汇率优惠百分比 */
    rateBonus?: number;
    /** 每日交易次数上限 */
    dailyTradeLimit: number;
    /** 解锁的资源类型 */
    unlockedResources: ResourceType[];
    /** 描述 */
    description: string;
}

/**
 * 资源汇率配置
 */
export interface ResourceRateConfig {
    /** 资源类型 */
    resourceType: ResourceType;
    /** 基础买入价格（金币） */
    baseBuyPrice: number;
    /** 基础卖出价格（金币） */
    baseSellPrice: number;
    /** 最小交易数量 */
    minAmount: number;
    /** 最大交易数量 */
    maxAmount: number;
    /** 是否可用 */
    available: boolean;
}

/**
 * 交易记录
 */
export interface TradeRecord {
    /** 记录ID */
    id: string;
    /** 交易时间 */
    timestamp: number;
    /** 交易类型 */
    tradeType: TradeType;
    /** 交易资源类型 */
    resourceType: ResourceType;
    /** 交易数量 */
    amount: number;
    /** 总价格（金币） */
    totalPrice: number;
    /** 单价 */
    unitPrice: number;
}

/**
 * 市场数据
 */
export interface MarketData {
    /** 市场等级 */
    level: number;
    /** 今日已交易次数 */
    todayTradeCount: number;
    /** 上次重置时间 */
    lastResetTime: number;
    /** 交易记录 */
    tradeRecords: TradeRecord[];
}

/**
 * 交易请求
 */
export interface TradeRequest {
    /** 交易类型 */
    tradeType: TradeType;
    /** 资源类型 */
    resourceType: ResourceType;
    /** 数量 */
    amount: number;
}

/**
 * 交易结果
 */
export interface TradeResult {
    /** 是否成功 */
    success: boolean;
    /** 错误信息 */
    error?: string;
    /** 交易详情 */
    trade?: {
        /** 资源类型 */
        resourceType: ResourceType;
        /** 数量 */
        amount: number;
        /** 花费/获得金币 */
        gold: number;
        /** 单价 */
        unitPrice: number;
    };
    /** 剩余今日交易次数 */
    remainingTrades: number;
}

/**
 * 汇率预览
 */
export interface RatePreview {
    /** 资源类型 */
    resourceType: ResourceType;
    /** 当前买入单价 */
    buyPrice: number;
    /** 当前卖出单价 */
    sellPrice: number;
    /** 汇率优惠百分比 */
    rateBonus?: number;
    /** 是否可用 */
    available: boolean;
}

/**
 * 市场事件类型
 */
export enum MarketEventType {
    /** 交易完成 */
    TRADE_COMPLETE = 'market_trade_complete',
    /** 市场升级 */
    MARKET_UPGRADED = 'market_upgraded',
    /** 每日重置 */
    DAILY_RESET = 'market_daily_reset',
    /** 交易次数不足 */
    TRADE_LIMIT_REACHED = 'market_trade_limit_reached',
}

/**
 * 市场事件数据
 */
export interface MarketEventData {
    /** 事件类型 */
    type: MarketEventType;
    /** 交易数据 */
    trade?: TradeRecord;
    /** 新等级 */
    newLevel?: number;
    /** 旧等级 */
    oldLevel?: number;
}

/**
 * 资源交换对（资源换资源）
 */
export interface ResourceExchange {
    /** 交换ID */
    id: string;
    /** 源资源类型 */
    fromResource: ResourceType;
    /** 目标资源类型 */
    toResource: ResourceType;
    /** 交换比例 (from:to) */
    ratio: number;
    /** 每日限制 */
    dailyLimit: number;
    /** 已使用次数 */
    usedCount: number;
}

/**
 * 资源交换请求
 */
export interface ExchangeRequest {
    /** 交换配置ID */
    exchangeId: string;
    /** 源资源数量 */
    fromAmount: number;
}

/**
 * 资源交换结果
 */
export interface ExchangeResult {
    /** 是否成功 */
    success: boolean;
    /** 错误信息 */
    error?: string;
    /** 获得的资源类型 */
    toResource?: ResourceType;
    /** 获得的资源数量 */
    toAmount?: number;
    /** 剩余使用次数 */
    remainingCount?: number;
}