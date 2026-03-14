/**
 * 竞技场管理器
 * 管理 PVP 竞技场匹配、战斗、积分、段位
 * 遵循阿里巴巴开发者手册规范
 */

import {
    ArenaPlayerData,
    ArenaTier,
    ArenaState,
    MatchType,
    BattleResult,
    BattleRecord,
    ArenaSettings,
    ArenaEventType,
    ArenaEventData,
    MatchResult,
    DEFAULT_ARENA_SETTINGS
} from '../config/ArenaTypes';
import { ResourceType } from '../config/GameTypes';
import {
    arenaTierConfigs,
    matchConfigs,
    currentSeason,
    getTierByScore,
    getTierConfig,
    getMatchConfig,
    getNextTier,
    getPrevTier
} from '../config/arena.json';
import { EventCenter } from '../utils/EventTarget';
import { playerDataManager } from '../utils/PlayerDataManager';
import { rewardManager, RewardConfig } from '../utils/RewardManager';

/**
 * 竞技场管理器
 * 单例模式
 */
export class ArenaManager {
    private static _instance: ArenaManager | null = null;

    /** 玩家竞技场数据 */
    private _playerData: ArenaPlayerData | null = null;

    /** 当前状态 */
    private _state: ArenaState = ArenaState.IDLE;

    /** 战斗记录 */
    private _battleRecords: BattleRecord[] = [];

    /** 今日挑战次数 */
    private _dailyChallengeCount: number = 0;

    /** 今日购买次数 */
    private _dailyBuyCount: number = 0;

    /** 上次重置日期 */
    private _lastResetDate: string = '';

    /** 匹配定时器 */
    private _matchTimer: number | null = null;

    /** 匹配开始时间 */
    private _matchStartTime: number = 0;

    /** 当前匹配类型 */
    private _currentMatchType: MatchType | null = null;

    /** 当前对手 */
    private _currentOpponent: ArenaPlayerData | null = null;

    /** 设置 */
    private _settings: ArenaSettings = { ...DEFAULT_ARENA_SETTINGS };

    /** 存储键 */
    private readonly STORAGE_KEY = 'hmm_legacy_arena';

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): ArenaManager {
        if (!ArenaManager._instance) {
            ArenaManager._instance = new ArenaManager();
        }
        return ArenaManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this._checkDailyReset();
        console.log('[ArenaManager] 初始化完成');
    }

    /**
     * 检查每日重置
     */
    private _checkDailyReset(): void {
        const today = new Date().toDateString();
        if (this._lastResetDate !== today) {
            this._dailyChallengeCount = 0;
            this._dailyBuyCount = 0;
            this._lastResetDate = today;
        }
    }

    /**
     * 获取玩家竞技场数据
     */
    getPlayerData(): ArenaPlayerData {
        if (!this._playerData) {
            this._initPlayerData();
        }
        return this._playerData!;
    }

    /**
     * 初始化玩家数据
     */
    private _initPlayerData(): void {
        const playerInfo = playerDataManager.getPlayerInfo();
        if (!playerInfo) {
            // 如果没有玩家信息，使用默认值
            this._playerData = {
                playerId: 'default',
                playerName: 'Player',
                avatar: 'default',
                score: 1000,
                tier: ArenaTier.SILVER,
                stars: 0,
                wins: 0,
                losses: 0,
                totalBattles: 0,
                winRate: 0,
                winStreak: 0,
                maxWinStreak: 0,
                highestTier: ArenaTier.SILVER,
                highestScore: 1000,
                lastBattleTime: 0,
                protectedStars: 0
            };
            return;
        }
        this._playerData = {
            playerId: playerInfo.id,
            playerName: playerInfo.name,
            avatar: 'default',
            score: 1000,
            tier: ArenaTier.SILVER,
            stars: 0,
            wins: 0,
            losses: 0,
            totalBattles: 0,
            winRate: 0,
            winStreak: 0,
            maxWinStreak: 0,
            highestTier: ArenaTier.SILVER,
            highestScore: 1000,
            lastBattleTime: 0,
            protectedStars: 0
        };
    }

    /**
     * 获取当前状态
     */
    getState(): ArenaState {
        return this._state;
    }

    /**
     * 获取剩余挑战次数
     */
    getRemainingChallenges(): number {
        this._checkDailyReset();
        const matchConfig = getMatchConfig(MatchType.RANKED);
        const limit = matchConfig?.dailyFreeCount || this._settings.dailyChallengeLimit;
        return Math.max(0, limit - this._dailyChallengeCount);
    }

    /**
     * 获取今日已使用次数
     */
    getDailyUsedCount(): number {
        this._checkDailyReset();
        return this._dailyChallengeCount;
    }

    /**
     * 获取购买次数消耗
     */
    getBuyCost(): number {
        const baseAmount = this._settings.buyCost.baseAmount;
        const increment = this._settings.buyCost.increment;
        return baseAmount + this._dailyBuyCount * increment;
    }

    /**
     * 购买挑战次数
     */
    buyChallengeCount(): { success: boolean; error?: string } {
        if (this._dailyBuyCount >= this._settings.dailyBuyLimit) {
            return { success: false, error: '已达到今日购买上限' };
        }

        const cost = this.getBuyCost();
        const gems = playerDataManager.getResource(ResourceType.GEMS);

        if (gems < cost) {
            return { success: false, error: '钻石不足' };
        }

        playerDataManager.addResource(ResourceType.GEMS, -cost);
        this._dailyBuyCount++;
        this._dailyChallengeCount--; // 增加一次挑战机会

        console.log(`[ArenaManager] 购买挑战次数，消耗 ${cost} 钻石`);
        return { success: true };
    }

    /**
     * 开始匹配
     */
    startMatch(type: MatchType): MatchResult {
        // 检查状态
        if (this._state !== ArenaState.IDLE) {
            return { success: false, error: '当前状态无法匹配' };
        }

        // 检查挑战次数
        if (type === MatchType.RANKED && this.getRemainingChallenges() <= 0) {
            return { success: false, error: '今日挑战次数已用完' };
        }

        // 更新状态
        this._state = ArenaState.MATCHING;
        this._currentMatchType = type;
        this._matchStartTime = Date.now();

        // 发送匹配开始事件
        const eventData: ArenaEventData = {
            type: ArenaEventType.MATCH_START,
            playerId: this._playerData?.playerId
        };
        EventCenter.emit(ArenaEventType.MATCH_START, eventData);

        // 模拟匹配（实际项目中应连接服务器）
        const matchConfig = getMatchConfig(type);
        if (!matchConfig) {
            this._state = ArenaState.IDLE;
            return { success: false, error: '无效的匹配类型' };
        }

        // 设置匹配超时
        this._matchTimer = window.setTimeout(() => {
            this._onMatchTimeout();
        }, matchConfig.timeout * 1000);

        // 模拟匹配延迟后找到对手
        setTimeout(() => {
            if (this._state === ArenaState.MATCHING) {
                this._onMatchSuccess();
            }
        }, 1000 + Math.random() * 2000);

        return { success: true };
    }

    /**
     * 匹配超时处理
     */
    private _onMatchTimeout(): void {
        if (this._state !== ArenaState.MATCHING) return;

        this._state = ArenaState.IDLE;
        this._currentMatchType = null;
        this._matchTimer = null;

        const eventData: ArenaEventData = {
            type: ArenaEventType.MATCH_TIMEOUT,
            playerId: this._playerData?.playerId,
            error: '匹配超时'
        };
        EventCenter.emit(ArenaEventType.MATCH_TIMEOUT, eventData);

        console.log('[ArenaManager] 匹配超时');
    }

    /**
     * 匹配成功处理
     */
    private _onMatchSuccess(): void {
        if (this._state !== ArenaState.MATCHING) return;

        // 清除超时定时器
        if (this._matchTimer) {
            clearTimeout(this._matchTimer);
            this._matchTimer = null;
        }

        // 生成模拟对手
        this._currentOpponent = this._generateOpponent();

        const matchTime = Date.now() - this._matchStartTime;

        // 发送匹配成功事件
        const eventData: ArenaEventData = {
            type: ArenaEventType.MATCH_SUCCESS,
            playerId: this._playerData?.playerId,
            opponent: this._currentOpponent,
            scoreChange: matchTime
        };
        EventCenter.emit(ArenaEventType.MATCH_SUCCESS, eventData);

        console.log(`[ArenaManager] 匹配成功，对手: ${this._currentOpponent.playerName}`);
    }

    /**
     * 生成模拟对手
     */
    private _generateOpponent(): ArenaPlayerData {
        const playerData = this.getPlayerData();
        const matchConfig = this._currentMatchType ? getMatchConfig(this._currentMatchType) : null;
        const scoreRange = matchConfig?.scoreRange || 200;

        // 在积分范围内随机生成对手积分
        const scoreOffset = Math.floor(Math.random() * scoreRange) - scoreRange / 2;
        const opponentScore = Math.max(0, playerData.score + scoreOffset);

        const tierConfig = getTierByScore(opponentScore);

        // 随机生成对手信息
        const names = ['暗夜骑士', '火焰法师', '冰霜女王', '雷霆战神', '暗影刺客', '光明圣骑'];
        const avatars = ['avatar_1', 'avatar_2', 'avatar_3', 'avatar_4', 'avatar_5', 'avatar_6'];

        return {
            playerId: `opponent_${Date.now()}`,
            playerName: names[Math.floor(Math.random() * names.length)],
            avatar: avatars[Math.floor(Math.random() * avatars.length)],
            score: opponentScore,
            tier: tierConfig.tier,
            stars: Math.floor(Math.random() * tierConfig.stars),
            wins: Math.floor(Math.random() * 100),
            losses: Math.floor(Math.random() * 50),
            totalBattles: 0,
            winRate: 0,
            winStreak: 0,
            maxWinStreak: 0,
            highestTier: tierConfig.tier,
            highestScore: opponentScore,
            lastBattleTime: Date.now(),
            protectedStars: 0
        };
    }

    /**
     * 取消匹配
     */
    cancelMatch(): boolean {
        if (this._state !== ArenaState.MATCHING) return false;

        if (this._matchTimer) {
            clearTimeout(this._matchTimer);
            this._matchTimer = null;
        }

        this._state = ArenaState.IDLE;
        this._currentMatchType = null;
        this._currentOpponent = null;

        const eventData: ArenaEventData = {
            type: ArenaEventType.MATCH_CANCEL,
            playerId: this._playerData?.playerId
        };
        EventCenter.emit(ArenaEventType.MATCH_CANCEL, eventData);

        console.log('[ArenaManager] 取消匹配');
        return true;
    }

    /**
     * 获取当前对手
     */
    getCurrentOpponent(): ArenaPlayerData | null {
        return this._currentOpponent;
    }

    /**
     * 开始战斗
     */
    startBattle(): { success: boolean; error?: string } {
        if (this._state !== ArenaState.MATCHING) {
            return { success: false, error: '当前状态无法开始战斗' };
        }

        if (!this._currentOpponent) {
            return { success: false, error: '没有对手' };
        }

        this._state = ArenaState.BATTLING;

        // 扣除挑战次数
        if (this._currentMatchType === MatchType.RANKED) {
            this._dailyChallengeCount++;
        }

        const eventData: ArenaEventData = {
            type: ArenaEventType.BATTLE_START,
            playerId: this._playerData?.playerId,
            opponent: this._currentOpponent
        };
        EventCenter.emit(ArenaEventType.BATTLE_START, eventData);

        console.log('[ArenaManager] 开始战斗');
        return { success: true };
    }

    /**
     * 结束战斗
     */
    endBattle(result: BattleResult, replayData?: string): void {
        if (this._state !== ArenaState.BATTLING) return;

        this._state = ArenaState.SETTLING;

        const playerData = this.getPlayerData();
        const opponent = this._currentOpponent!;

        // 计算积分变化
        const scoreChange = this._calculateScoreChange(result, playerData.score, opponent.score);

        // 更新玩家数据
        this._updatePlayerData(result, scoreChange);

        // 记录战斗
        this._recordBattle(opponent, result, scoreChange, replayData);

        // 发送事件
        const eventData: ArenaEventData = {
            type: ArenaEventType.BATTLE_END,
            playerId: playerData.playerId,
            opponent,
            result,
            scoreChange,
            currentScore: playerData.score,
            currentTier: playerData.tier
        };
        EventCenter.emit(ArenaEventType.BATTLE_END, eventData);

        // 清理状态
        this._state = ArenaState.IDLE;
        this._currentOpponent = null;
        this._currentMatchType = null;

        console.log(`[ArenaManager] 战斗结束，结果: ${result}，积分变化: ${scoreChange}`);
    }

    /**
     * 计算积分变化
     */
    private _calculateScoreChange(result: BattleResult, playerScore: number, opponentScore: number): number {
        if (result === BattleResult.DRAW) return 0;

        // 基础积分
        const baseScore = result === BattleResult.WIN ? this._settings.winScore : -this._settings.loseScore;

        // 根据积分差距调整
        const scoreDiff = opponentScore - playerScore;
        const adjustment = Math.floor(scoreDiff / 100);

        // 连胜加成
        let streakBonus = 0;
        if (result === BattleResult.WIN && this._playerData) {
            const streakIndex = Math.min(this._playerData.winStreak, this._settings.winStreakBonus.length - 1);
            streakBonus = this._settings.winStreakBonus[streakIndex];
        }

        return baseScore + adjustment + streakBonus;
    }

    /**
     * 更新玩家数据
     */
    private _updatePlayerData(result: BattleResult, scoreChange: number): void {
        const data = this._playerData!;
        const oldTier = data.tier;
        const oldStars = data.stars;

        // 更新积分
        data.score = Math.max(0, data.score + scoreChange);
        data.lastBattleTime = Date.now();

        // 更新战斗统计
        data.totalBattles++;
        if (result === BattleResult.WIN) {
            data.wins++;
            data.winStreak++;
            data.maxWinStreak = Math.max(data.maxWinStreak, data.winStreak);
        } else if (result === BattleResult.LOSE) {
            data.losses++;
            data.winStreak = 0;
        }

        // 计算胜率
        data.winRate = Math.floor((data.wins / data.totalBattles) * 100);

        // 更新段位
        const tierConfig = getTierByScore(data.score);
        data.tier = tierConfig.tier;

        // 计算星级
        if (tierConfig.stars > 0) {
            const scoreInTier = data.score - tierConfig.minScore;
            const tierRange = tierConfig.maxScore - tierConfig.minScore;
            data.stars = Math.floor((scoreInTier / tierRange) * tierConfig.stars);
        } else {
            data.stars = 0;
        }

        // 更新最高记录
        if (data.score > data.highestScore) {
            data.highestScore = data.score;
        }
        const tierIndex = Object.values(ArenaTier).indexOf(data.tier);
        const highestTierIndex = Object.values(ArenaTier).indexOf(data.highestTier);
        if (tierIndex > highestTierIndex) {
            data.highestTier = data.tier;
            // 段位提升事件
            EventCenter.emit(ArenaEventType.TIER_UP, {
                type: ArenaEventType.TIER_UP,
                currentTier: data.tier
            });
        }

        // 段位变化事件
        if (oldTier !== data.tier) {
            const oldTierIndex = Object.values(ArenaTier).indexOf(oldTier);
            if (tierIndex < oldTierIndex) {
                EventCenter.emit(ArenaEventType.TIER_DOWN, {
                    type: ArenaEventType.TIER_DOWN,
                    currentTier: data.tier
                });
            }
        }

        // 发送积分更新事件
        EventCenter.emit(ArenaEventType.SCORE_UPDATE, {
            type: ArenaEventType.SCORE_UPDATE,
            scoreChange,
            currentScore: data.score
        });
    }

    /**
     * 记录战斗
     */
    private _recordBattle(opponent: ArenaPlayerData, result: BattleResult, scoreChange: number, replayData?: string): void {
        const record: BattleRecord = {
            recordId: `record_${Date.now()}`,
            battleTime: Date.now(),
            opponentId: opponent.playerId,
            opponentName: opponent.playerName,
            result,
            scoreChange,
            replayData,
            duration: 0 // 由战斗系统填充
        };

        this._battleRecords.unshift(record);

        // 只保留最近 50 条记录
        if (this._battleRecords.length > 50) {
            this._battleRecords.pop();
        }
    }

    /**
     * 获取战斗记录
     */
    getBattleRecords(count: number = 20): BattleRecord[] {
        return this._battleRecords.slice(0, count);
    }

    /**
     * 获取段位配置
     */
    getTierConfig(tier: ArenaTier) {
        return getTierConfig(tier);
    }

    /**
     * 获取当前赛季
     */
    getCurrentSeason() {
        return currentSeason;
    }

    /**
     * 领取段位奖励
     */
    claimTierReward(tier: ArenaTier): { success: boolean; rewards?: RewardConfig[]; error?: string } {
        const playerData = this.getPlayerData();

        // 检查是否达到该段位
        const tierIndex = Object.values(ArenaTier).indexOf(tier);
        const playerTierIndex = Object.values(ArenaTier).indexOf(playerData.highestTier);

        if (playerTierIndex < tierIndex) {
            return { success: false, error: '尚未达到该段位' };
        }

        const tierConfig = getTierConfig(tier);
        if (!tierConfig) {
            return { success: false, error: '段位配置不存在' };
        }

        // 发放奖励
        const rewards: RewardConfig[] = tierConfig.rewards.map(r => ({
            type: r.type as any,
            itemId: r.itemId,
            amount: r.amount
        }));

        rewardManager.grantRewards(rewards);

        EventCenter.emit(ArenaEventType.REWARD_CLAIM, {
            type: ArenaEventType.REWARD_CLAIM,
            playerId: playerData.playerId
        });

        return { success: true, rewards };
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            playerData: this._playerData,
            battleRecords: this._battleRecords,
            dailyChallengeCount: this._dailyChallengeCount,
            dailyBuyCount: this._dailyBuyCount,
            lastResetDate: this._lastResetDate
        };
        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(jsonStr: string): void {
        try {
            const data = JSON.parse(jsonStr);
            if (data.playerData) {
                this._playerData = data.playerData;
            }
            if (data.battleRecords) {
                this._battleRecords = data.battleRecords;
            }
            if (data.dailyChallengeCount !== undefined) {
                this._dailyChallengeCount = data.dailyChallengeCount;
            }
            if (data.dailyBuyCount !== undefined) {
                this._dailyBuyCount = data.dailyBuyCount;
            }
            if (data.lastResetDate) {
                this._lastResetDate = data.lastResetDate;
            }
            this._checkDailyReset();
        } catch (e) {
            console.error('[ArenaManager] 反序列化失败', e);
        }
    }

    /**
     * 销毁
     */
    destroy(): void {
        if (this._matchTimer) {
            clearTimeout(this._matchTimer);
            this._matchTimer = null;
        }
    }
}

/** 导出单例实例 */
export const arenaManager = ArenaManager.getInstance();