/**
 * 成就管理器
 * 管理成就的解锁、进度追踪和奖励发放
 */

import {
    AchievementConfig,
    AchievementProgress,
    AchievementType,
    AchievementRarity,
    AchievementConditionType,
    AchievementCondition,
    AchievementEvent,
    AchievementReward,
    AchievementChainConfig
} from '../config/AchievementTypes';
import {
    AchievementConfigMap,
    AchievementChainMap,
    AllAchievements
} from '../configs/achievements.json';
import { EventCenter } from '../utils/EventTarget';

/** 成就事件类型 */
export enum AchievementEventType {
    PROGRESS_UPDATED = 'achievement_progress_updated',
    COMPLETED = 'achievement_completed',
    CLAIMED = 'achievement_claimed',
    CHAIN_COMPLETED = 'achievement_chain_completed'
}

/** 成就事件数据 */
export interface AchievementEventData {
    achievementId?: string;
    chainId?: string;
    progress?: AchievementProgress;
    reward?: AchievementReward;
}

/**
 * 成就管理器
 */
export class AchievementManager {
    private static _instance: AchievementManager | null = null;

    /** 成就进度记录 */
    private _progress: Map<string, AchievementProgress> = new Map();

    /** 已领取的成就 */
    private _claimedAchievements: Set<string> = new Set();

    /** 已完成的成就链 */
    private _completedChains: Set<string> = new Set();

    /** 统计数据缓存 */
    private _stats: Map<AchievementConditionType, number> = new Map();

    /** 连胜记录 */
    private _currentStreak: number = 0;
    private _maxStreak: number = 0;

    /** 累计游戏天数 */
    private _totalPlayDays: number = 0;
    private _lastPlayDate: string = '';

    private constructor() {}

    static getInstance(): AchievementManager {
        if (!AchievementManager._instance) {
            AchievementManager._instance = new AchievementManager();
        }
        return AchievementManager._instance;
    }

    /**
     * 初始化成就系统
     */
    init(): void {
        // 初始化所有成就的进度
        AllAchievements.forEach(config => {
            if (!this._progress.has(config.id)) {
                this._progress.set(config.id, {
                    achievementId: config.id,
                    conditions: config.conditions.map(c => ({ ...c, current: 0 })),
                    completed: false,
                    claimed: false
                });
            }
        });

        // 初始化统计数据
        Object.values(AchievementConditionType).forEach(type => {
            if (!this._stats.has(type)) {
                this._stats.set(type, 0);
            }
        });

        console.log('[AchievementManager] Initialized with', this._progress.size, 'achievements');
    }

    /**
     * 触发成就事件
     */
    triggerEvent(event: AchievementEvent): void {
        const { type, value, params } = event;

        // 更新统计
        const currentStat = this._stats.get(type) || 0;
        this._stats.set(type, currentStat + value);

        // 处理连胜
        if (type === AchievementConditionType.WIN_BATTLES) {
            this._currentStreak++;
            this._maxStreak = Math.max(this._maxStreak, this._currentStreak);
            // 更新连胜统计
            this._stats.set(AchievementConditionType.WIN_STREAK, this._currentStreak);
        }

        // 处理战斗失败（重置连胜）
        // 这需要在外部调用 resetStreak()

        // 检查所有成就进度
        this._checkAllProgress(type, value, params);

        // 检查成就链
        this._checkChains();
    }

    /**
     * 重置连胜
     */
    resetStreak(): void {
        this._currentStreak = 0;
        this._stats.set(AchievementConditionType.WIN_STREAK, 0);
    }

    /**
     * 更新游戏天数
     */
    updatePlayDay(): void {
        const today = new Date().toDateString();

        if (this._lastPlayDate !== today) {
            this._lastPlayDate = today;
            this._totalPlayDays++;
            this._stats.set(AchievementConditionType.PLAY_DAYS, this._totalPlayDays);

            // 检查相关成就
            this._checkAllProgress(AchievementConditionType.PLAY_DAYS, 1, {});
        }
    }

    /**
     * 检查所有成就进度
     */
    private _checkAllProgress(
        eventType: AchievementConditionType,
        value: number,
        params?: Record<string, any>
    ): void {
        AllAchievements.forEach(config => {
            const progress = this._progress.get(config.id);
            if (!progress || progress.completed) return;

            let updated = false;

            progress.conditions.forEach(condition => {
                if (condition.type === eventType) {
                    // 检查参数匹配（如种族）
                    if (params && condition.params) {
                        const paramsMatch = Object.keys(condition.params).every(
                            key => condition.params![key] === params[key]
                        );
                        if (!paramsMatch) return;
                    }

                    // 更新进度
                    condition.current = (condition.current || 0) + value;
                    updated = true;
                }
            });

            if (updated) {
                // 检查是否完成
                const completed = progress.conditions.every(
                    c => (c.current || 0) >= c.target
                );

                if (completed && !progress.completed) {
                    progress.completed = true;
                    progress.completedAt = Date.now();

                    EventCenter.emit(AchievementEventType.COMPLETED, {
                        achievementId: config.id,
                        progress
                    });

                    console.log(`[AchievementManager] Achievement completed: ${config.name}`);
                } else {
                    EventCenter.emit(AchievementEventType.PROGRESS_UPDATED, {
                        achievementId: config.id,
                        progress
                    });
                }
            }
        });
    }

    /**
     * 检查成就链
     */
    private _checkChains(): void {
        AchievementChainMap.forEach((chain, chainId) => {
            if (this._completedChains.has(chainId)) return;

            // 检查链中所有成就是否都已完成
            const allCompleted = chain.achievements.every(achievementId => {
                const progress = this._progress.get(achievementId);
                return progress && progress.completed && progress.claimed;
            });

            if (allCompleted) {
                this._completedChains.add(chainId);

                EventCenter.emit(AchievementEventType.CHAIN_COMPLETED, {
                    chainId,
                    reward: chain.finalReward
                });

                console.log(`[AchievementManager] Chain completed: ${chain.name}`);
            }
        });
    }

    /**
     * 获取成就进度
     */
    getProgress(achievementId: string): AchievementProgress | null {
        return this._progress.get(achievementId) || null;
    }

    /**
     * 获取所有成就进度
     */
    getAllProgress(): AchievementProgress[] {
        return Array.from(this._progress.values());
    }

    /**
     * 获取指定类型的成就
     */
    getAchievementsByType(type: AchievementType): AchievementConfig[] {
        return AllAchievements.filter(config => config.type === type);
    }

    /**
     * 获取已完成的成就
     */
    getCompletedAchievements(): AchievementProgress[] {
        return Array.from(this._progress.values()).filter(p => p.completed);
    }

    /**
     * 获取未领取的已完成成就
     */
    getUnclaimedAchievements(): AchievementProgress[] {
        return Array.from(this._progress.values()).filter(p => p.completed && !p.claimed);
    }

    /**
     * 领取成就奖励
     */
    claimReward(achievementId: string): AchievementReward | null {
        const config = AchievementConfigMap.get(achievementId);
        const progress = this._progress.get(achievementId);

        if (!config || !progress) {
            console.warn(`[AchievementManager] Achievement not found: ${achievementId}`);
            return null;
        }

        if (!progress.completed) {
            console.warn(`[AchievementManager] Achievement not completed: ${config.name}`);
            return null;
        }

        if (progress.claimed) {
            console.warn(`[AchievementManager] Achievement already claimed: ${config.name}`);
            return null;
        }

        progress.claimed = true;
        progress.claimedAt = Date.now();
        this._claimedAchievements.add(achievementId);

        EventCenter.emit(AchievementEventType.CLAIMED, {
            achievementId,
            reward: config.reward
        });

        console.log(`[AchievementManager] Reward claimed: ${config.name}`);

        // 检查成就链
        this._checkChains();

        return config.reward;
    }

    /**
     * 获取统计数据
     */
    getStats(): Map<AchievementConditionType, number> {
        return new Map(this._stats);
    }

    /**
     * 获取连胜记录
     */
    getStreak(): { current: number; max: number } {
        return {
            current: this._currentStreak,
            max: this._maxStreak
        };
    }

    /**
     * 获取成就完成进度
     */
    getCompletionRate(): { completed: number; total: number; percentage: number } {
        const total = AllAchievements.length;
        const completed = this.getCompletedAchievements().length;
        const percentage = Math.floor((completed / total) * 100);

        return { completed, total, percentage };
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            progress: Array.from(this._progress.entries()),
            claimed: Array.from(this._claimedAchievements),
            completedChains: Array.from(this._completedChains),
            stats: Array.from(this._stats.entries()),
            streak: {
                current: this._currentStreak,
                max: this._maxStreak
            },
            playDays: {
                total: this._totalPlayDays,
                lastDate: this._lastPlayDate
            }
        };

        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);

            // 恢复进度
            if (parsed.progress) {
                this._progress = new Map(parsed.progress);
            }

            // 恢复已领取
            if (parsed.claimed) {
                this._claimedAchievements = new Set(parsed.claimed);
            }

            // 恢复完成的链
            if (parsed.completedChains) {
                this._completedChains = new Set(parsed.completedChains);
            }

            // 恢复统计
            if (parsed.stats) {
                this._stats = new Map(parsed.stats);
            }

            // 恢复连胜
            if (parsed.streak) {
                this._currentStreak = parsed.streak.current || 0;
                this._maxStreak = parsed.streak.max || 0;
            }

            // 恢复游戏天数
            if (parsed.playDays) {
                this._totalPlayDays = parsed.playDays.total || 0;
                this._lastPlayDate = parsed.playDays.lastDate || '';
            }

            console.log('[AchievementManager] Data loaded');
        } catch (e) {
            console.error('[AchievementManager] Failed to deserialize:', e);
        }
    }

    /**
     * 清除所有数据
     */
    clear(): void {
        this._progress.clear();
        this._claimedAchievements.clear();
        this._completedChains.clear();
        this._stats.clear();
        this._currentStreak = 0;
        this._maxStreak = 0;
        this._totalPlayDays = 0;
        this._lastPlayDate = '';

        // 重新初始化
        this.init();
    }
}

// 导出单例
export const achievementManager = AchievementManager.getInstance();