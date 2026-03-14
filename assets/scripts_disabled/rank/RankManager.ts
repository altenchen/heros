/**
 * 排行榜管理器
 * 管理各种排行榜数据、排名更新、奖励结算
 * 遵循阿里巴巴开发者手册规范
 */

import { EventCenter } from '../utils/EventTarget';
import {
    RankType,
    RankPeriod,
    RankEntry,
    PlayerRankData,
    RankConfig,
    RankSettlement
} from '../config/RankTypes';
import {
    rankConfigs,
    getRankConfig,
    getRankReward,
    RANK_CONSTANTS
} from '../config/rank.json';

/** 排行榜事件类型 */
export enum RankEventType {
    /** 排名更新 */
    RANK_UPDATED = 'rank_updated',
    /** 排名变化 */
    RANK_CHANGED = 'rank_changed',
    /** 结算完成 */
    SETTLEMENT_COMPLETE = 'settlement_complete',
    /** 进入前三名 */
    ENTER_TOP_THREE = 'enter_top_three'
}

/** 排行榜事件数据 */
interface RankEventData {
    type: RankType;
    period: RankPeriod;
    playerId?: string;
    rank?: number;
    rankChange?: number;
    settlement?: RankSettlement;
}

/** 排行榜数据存储 */
interface RankDataStorage {
    /** 各排行榜数据 */
    rankings: Map<string, RankEntry[]>;
    /** 玩家排行数据 */
    playerRanks: Map<string, PlayerRankData>;
    /** 上次结算时间 */
    lastSettlementTime: Map<string, number>;
    /** 是否已初始化 */
    initialized: boolean;
}

/**
 * 排行榜管理器类
 */
export class RankManager {
    /** 单例实例 */
    private static _instance: RankManager | null = null;

    /** 数据存储 */
    private _data: RankDataStorage;

    /** 更新定时器 */
    private _updateTimer: number | null = null;

    /**
     * 获取单例
     */
    static getInstance(): RankManager {
        if (!RankManager._instance) {
            RankManager._instance = new RankManager();
        }
        return RankManager._instance;
    }

    /**
     * 私有构造函数
     */
    private constructor() {
        this._data = {
            rankings: new Map(),
            playerRanks: new Map(),
            lastSettlementTime: new Map(),
            initialized: false
        };
    }

    /**
     * 初始化
     */
    init(): void {
        console.log('[RankManager] 初始化排行榜系统');

        // 初始化各排行榜
        for (const config of rankConfigs) {
            const key = this._getRankKey(config.type, config.period);
            this._data.rankings.set(key, []);
            this._data.lastSettlementTime.set(key, 0);
        }

        this._data.initialized = true;

        // 启动定时更新
        this._startUpdateTimer();

        // 检查是否需要结算
        this._checkSettlement();
    }

    /**
     * 获取排行榜键
     */
    private _getRankKey(type: RankType, period: RankPeriod): string {
        return `${type}_${period}`;
    }

    // ==================== 排行榜查询 ====================

    /**
     * 获取排行榜数据
     * @param type 排行榜类型
     * @param period 周期
     * @param limit 获取数量
     */
    getRanking(type: RankType, period: RankPeriod = RankPeriod.WEEKLY, limit?: number): RankEntry[] {
        const key = this._getRankKey(type, period);
        const ranking = this._data.rankings.get(key) || [];

        if (limit && limit > 0) {
            return ranking.slice(0, limit);
        }

        return ranking;
    }

    /**
     * 获取玩家排名
     * @param playerId 玩家ID
     * @param type 排行榜类型
     * @param period 周期
     */
    getPlayerRank(playerId: string, type: RankType, period: RankPeriod = RankPeriod.WEEKLY): PlayerRankData | undefined {
        const key = this._getRankKey(type, period);
        return this._data.playerRanks.get(`${playerId}_${key}`);
    }

    /**
     * 获取玩家在排行榜中的条目
     * @param playerId 玩家ID
     * @param type 排行榜类型
     * @param period 周期
     */
    getPlayerEntry(playerId: string, type: RankType, period: RankPeriod = RankPeriod.WEEKLY): RankEntry | undefined {
        const ranking = this.getRanking(type, period);
        return ranking.find(entry => entry.playerId === playerId);
    }

    /**
     * 获取排行榜配置
     */
    getRankConfig(type: RankType, period: RankPeriod = RankPeriod.WEEKLY): RankConfig | undefined {
        return getRankConfig(type, period);
    }

    /**
     * 获取我的排名信息（前后的玩家）
     * @param playerId 玩家ID
     * @param type 排行榜类型
     * @param period 周期
     * @param range 前后范围
     */
    getMyRankRange(playerId: string, type: RankType, period: RankPeriod = RankPeriod.WEEKLY, range: number = 5): {
        myRank: RankEntry | undefined;
        prevRanks: RankEntry[];
        nextRanks: RankEntry[];
    } {
        const ranking = this.getRanking(type, period);
        const myIndex = ranking.findIndex(entry => entry.playerId === playerId);

        if (myIndex === -1) {
            return { myRank: undefined, prevRanks: [], nextRanks: [] };
        }

        const myRank = ranking[myIndex];
        const prevRanks = ranking.slice(Math.max(0, myIndex - range), myIndex);
        const nextRanks = ranking.slice(myIndex + 1, myIndex + 1 + range);

        return { myRank, prevRanks, nextRanks };
    }

    // ==================== 分数更新 ====================

    /**
     * 更新玩家分数
     * @param playerId 玩家ID
     * @param playerName 玩家名称
     * @param score 分数
     * @param type 排行榜类型
     * @param extra 额外数据
     */
    updateScore(
        playerId: string,
        playerName: string,
        score: number,
        type: RankType = RankType.POWER,
        extra?: RankEntry['extra']
    ): void {
        const period = RankPeriod.WEEKLY;
        const key = this._getRankKey(type, period);
        const ranking = this._data.rankings.get(key) || [];

        // 查找现有条目
        const existingIndex = ranking.findIndex(entry => entry.playerId === playerId);
        const oldRank = existingIndex !== -1 ? ranking[existingIndex].rank : 0;

        // 创建或更新条目
        const entry: RankEntry = {
            playerId,
            playerName,
            score,
            rank: 0,
            extra,
            updateTime: Date.now()
        };

        if (existingIndex !== -1) {
            ranking[existingIndex] = entry;
        } else {
            ranking.push(entry);
        }

        // 重新排序
        ranking.sort((a, b) => b.score - a.score);

        // 更新排名
        ranking.forEach((e, index) => {
            e.rank = index + 1;
        });

        // 保存
        this._data.rankings.set(key, ranking);

        // 更新玩家排行数据
        const newRank = ranking.find(e => e.playerId === playerId)?.rank || 0;
        const rankChange = oldRank > 0 ? oldRank - newRank : 0;

        const playerRankData: PlayerRankData = {
            type,
            period,
            score,
            rank: newRank,
            rankChange
        };
        this._data.playerRanks.set(`${playerId}_${key}`, playerRankData);

        // 触发事件
        EventCenter.emit(RankEventType.RANK_UPDATED, {
            type,
            period,
            playerId,
            rank: newRank,
            rankChange
        } as RankEventData);

        // 排名变化事件
        if (rankChange !== 0) {
            EventCenter.emit(RankEventType.RANK_CHANGED, {
                type,
                period,
                playerId,
                rank: newRank,
                rankChange
            } as RankEventData);
        }

        // 进入前三名事件
        if (newRank <= 3 && oldRank > 3) {
            EventCenter.emit(RankEventType.ENTER_TOP_THREE, {
                type,
                period,
                playerId,
                rank: newRank
            } as RankEventData);
        }
    }

    /**
     * 批量更新排行榜数据（用于模拟或服务器同步）
     * @param type 排行榜类型
     * @param period 周期
     * @param entries 排行榜条目
     */
    batchUpdate(type: RankType, period: RankPeriod, entries: RankEntry[]): void {
        const key = this._getRankKey(type, period);

        // 排序并更新排名
        entries.sort((a, b) => b.score - a.score);
        entries.forEach((entry, index) => {
            entry.rank = index + 1;
            entry.updateTime = Date.now();
        });

        this._data.rankings.set(key, entries);
    }

    // ==================== 结算相关 ====================

    /**
     * 检查是否需要结算
     */
    private _checkSettlement(): void {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const hour = now.getHours();

        // 周榜：周日结算
        for (const config of rankConfigs) {
            if (config.period === RankPeriod.WEEKLY && config.resetHour) {
                if (dayOfWeek === 0 && hour >= config.resetHour) {
                    const key = this._getRankKey(config.type, config.period);
                    const lastSettle = this._data.lastSettlementTime.get(key) || 0;

                    // 检查今天是否已结算
                    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
                    if (lastSettle < todayStart) {
                        this._settleRanking(config.type, config.period);
                    }
                }
            }
        }
    }

    /**
     * 结算排行榜
     */
    private _settleRanking(type: RankType, period: RankPeriod): void {
        const config = getRankConfig(type, period);
        if (!config || !config.hasReward) {
            return;
        }

        const ranking = this.getRanking(type, period);
        const key = this._getRankKey(type, period);

        console.log(`[RankManager] 结算排行榜: ${type}, 参与人数: ${ranking.length}`);

        // 发放奖励
        for (const entry of ranking) {
            const rewardConfig = getRankReward(entry.rank, type);
            if (rewardConfig) {
                const settlement: RankSettlement = {
                    type,
                    period,
                    finalRank: entry.rank,
                    rewards: rewardConfig.rewards,
                    settleTime: Date.now()
                };

                // 触发结算事件（由其他系统处理奖励发放）
                EventCenter.emit(RankEventType.SETTLEMENT_COMPLETE, {
                    type,
                    period,
                    playerId: entry.playerId,
                    settlement
                } as RankEventData);
            }
        }

        // 记录结算时间
        this._data.lastSettlementTime.set(key, Date.now());

        // 重置排行榜（周榜清空，保留部分数据）
        if (period === RankPeriod.WEEKLY) {
            this._data.rankings.set(key, []);
        }
    }

    /**
     * 手动触发结算（测试用）
     */
    forceSettle(type: RankType, period: RankPeriod = RankPeriod.WEEKLY): void {
        this._settleRanking(type, period);
    }

    // ==================== 定时更新 ====================

    /**
     * 启动定时器
     */
    private _startUpdateTimer(): void {
        if (this._updateTimer) {
            clearInterval(this._updateTimer);
        }

        this._updateTimer = setInterval(() => {
            this._checkSettlement();
        }, RANK_CONSTANTS.UPDATE_INTERVAL) as unknown as number;
    }

    /**
     * 停止定时器
     */
    stopUpdateTimer(): void {
        if (this._updateTimer) {
            clearInterval(this._updateTimer);
            this._updateTimer = null;
        }
    }

    // ==================== 序列化 ====================

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            rankings: {} as Record<string, RankEntry[]>,
            playerRanks: {} as Record<string, PlayerRankData>,
            lastSettlementTime: {} as Record<string, number>
        };

        this._data.rankings.forEach((value, key) => {
            data.rankings[key] = value;
        });

        this._data.playerRanks.forEach((value, key) => {
            data.playerRanks[key] = value;
        });

        this._data.lastSettlementTime.forEach((value, key) => {
            data.lastSettlementTime[key] = value;
        });

        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(jsonStr: string): void {
        try {
            const data = JSON.parse(jsonStr);

            this._data.rankings.clear();
            this._data.playerRanks.clear();
            this._data.lastSettlementTime.clear();

            if (data.rankings) {
                for (const key in data.rankings) {
                    this._data.rankings.set(key, data.rankings[key]);
                }
            }

            if (data.playerRanks) {
                for (const key in data.playerRanks) {
                    this._data.playerRanks.set(key, data.playerRanks[key]);
                }
            }

            if (data.lastSettlementTime) {
                for (const key in data.lastSettlementTime) {
                    this._data.lastSettlementTime.set(key, data.lastSettlementTime[key]);
                }
            }
        } catch (e) {
            console.error('[RankManager] 反序列化失败:', e);
        }
    }

    /**
     * 销毁
     */
    destroy(): void {
        this.stopUpdateTimer();
        this._data.rankings.clear();
        this._data.playerRanks.clear();
        this._data.lastSettlementTime.clear();
        this._data.initialized = false;
    }
}

/** 导出单例 */
export const rankManager = RankManager.getInstance();