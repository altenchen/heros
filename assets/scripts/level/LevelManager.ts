/**
 * 关卡管理器
 * 管理关卡进度、解锁、挑战等功能
 * 遵循阿里巴巴开发者手册规范
 */

import {
    LevelConfig,
    ChapterConfig,
    LevelProgress,
    ChapterProgress,
    LevelStatus,
    StarRating,
    LevelChallengeResult,
    LevelRewardItems,
    StarConditionType
} from '../config/LevelTypes';
import {
    LevelConfigMap,
    ChapterConfigMap,
    AllLevels,
    Chapters
} from '../configs/levels.json';
import { EventCenter } from '../utils/EventTarget';

/**
 * 关卡事件类型
 */
export enum LevelEventType {
    /** 关卡解锁 */
    LEVEL_UNLOCKED = 'level_unlocked',
    /** 关卡通关 */
    LEVEL_CLEARED = 'level_cleared',
    /** 星级更新 */
    STARS_UPDATED = 'stars_updated',
    /** 章节解锁 */
    CHAPTER_UNLOCKED = 'chapter_unlocked',
    /** 章节完成 */
    CHAPTER_COMPLETED = 'chapter_completed',
    /** 奖励领取 */
    REWARD_CLAIMED = 'reward_claimed'
}

/**
 * 关卡事件数据
 */
export interface LevelEventData {
    levelId?: string;
    chapterId?: string;
    stars?: StarRating;
    reward?: LevelRewardItems;
}

/**
 * 关卡管理器
 */
export class LevelManager {
    private static _instance: LevelManager | null = null;

    /** 章节进度 */
    private _chapterProgress: Map<string, ChapterProgress> = new Map();

    /** 当前选择的关卡ID */
    private _currentLevelId: string | null = null;

    /** 玩家体力 */
    private _stamina: number = 100;

    /** 最大体力 */
    private _maxStamina: number = 100;

    /** 体力恢复时间戳 */
    private _staminaRecoverTime: number = 0;

    /** 上次每日重置日期 */
    private _lastDailyReset: string = '';

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): LevelManager {
        if (!LevelManager._instance) {
            LevelManager._instance = new LevelManager();
        }
        return LevelManager._instance;
    }

    /**
     * 初始化关卡系统
     */
    init(): void {
        // 初始化章节进度
        Chapters.forEach(chapter => {
            if (!this._chapterProgress.has(chapter.id)) {
                this._initChapterProgress(chapter);
            }
        });

        // 检查每日重置
        this._checkDailyReset();

        // 检查章节解锁
        this._checkChapterUnlock();

        console.log('[LevelManager] 初始化完成，共', AllLevels.length, '个关卡');
    }

    /**
     * 初始化章节进度
     */
    private _initChapterProgress(chapter: ChapterConfig): void {
        const levelProgress = new Map<string, LevelProgress>();

        chapter.levels.forEach((levelId, index) => {
            const status = index === 0 && this._isChapterUnlocked(chapter)
                ? LevelStatus.AVAILABLE
                : LevelStatus.LOCKED;

            levelProgress.set(levelId, {
                levelId,
                status,
                stars: StarRating.NONE,
                challengeCount: 0,
                dailyChallengeCount: 0
            });
        });

        this._chapterProgress.set(chapter.id, {
            chapterId: chapter.id,
            unlocked: this._isChapterUnlocked(chapter),
            levelProgress,
            rewardClaimed: false
        });
    }

    /**
     * 检查章节是否解锁
     */
    private _isChapterUnlocked(chapter: ChapterConfig): boolean {
        // 检查等级要求
        // TODO: 获取玩家等级进行比较

        // 检查前置章节
        if (chapter.prerequisite) {
            const prereqProgress = this._chapterProgress.get(chapter.prerequisite);
            if (!prereqProgress || !this._isChapterCompleted(chapter.prerequisite)) {
                return false;
            }
        }

        return true;
    }

    /**
     * 检查章节是否完成
     */
    private _isChapterCompleted(chapterId: string): boolean {
        const chapter = ChapterConfigMap.get(chapterId);
        const progress = this._chapterProgress.get(chapterId);

        if (!chapter || !progress) {
            return false;
        }

        return chapter.levels.every(levelId => {
            const levelProgress = progress.levelProgress.get(levelId);
            return levelProgress && levelProgress.status !== LevelStatus.LOCKED;
        });
    }

    /**
     * 检查每日重置
     */
    private _checkDailyReset(): void {
        const today = new Date().toDateString();

        if (this._lastDailyReset !== today) {
            // 重置每日挑战次数
            this._chapterProgress.forEach(chapterProgress => {
                chapterProgress.levelProgress.forEach(levelProgress => {
                    levelProgress.dailyChallengeCount = 0;
                });
            });

            this._lastDailyReset = today;
            console.log('[LevelManager] 每日重置完成');
        }
    }

    /**
     * 检查章节解锁
     */
    private _checkChapterUnlock(): void {
        Chapters.forEach(chapter => {
            const progress = this._chapterProgress.get(chapter.id);
            if (!progress) {
                return;
            }

            if (!progress.unlocked && this._isChapterUnlocked(chapter)) {
                progress.unlocked = true;
                this._unlockFirstLevel(chapter);

                EventCenter.emit(LevelEventType.CHAPTER_UNLOCKED, {
                    chapterId: chapter.id
                });

                console.log('[LevelManager] 章节解锁:', chapter.name);
            }
        });
    }

    /**
     * 解锁章节第一个关卡
     */
    private _unlockFirstLevel(chapter: ChapterConfig): void {
        const progress = this._chapterProgress.get(chapter.id);
        if (!progress || chapter.levels.length === 0) {
            return;
        }

        const firstLevelId = chapter.levels[0];
        const levelProgress = progress.levelProgress.get(firstLevelId);

        if (levelProgress && levelProgress.status === LevelStatus.LOCKED) {
            levelProgress.status = LevelStatus.AVAILABLE;

            EventCenter.emit(LevelEventType.LEVEL_UNLOCKED, {
                levelId: firstLevelId
            });
        }
    }

    /**
     * 获取章节列表
     */
    getChapters(): ChapterConfig[] {
        return Chapters;
    }

    /**
     * 获取章节配置
     */
    getChapter(chapterId: string): ChapterConfig | null {
        return ChapterConfigMap.get(chapterId) || null;
    }

    /**
     * 获取章节进度
     */
    getChapterProgress(chapterId: string): ChapterProgress | null {
        return this._chapterProgress.get(chapterId) || null;
    }

    /**
     * 获取关卡配置
     */
    getLevel(levelId: string): LevelConfig | null {
        return LevelConfigMap.get(levelId) || null;
    }

    /**
     * 获取关卡进度
     */
    getLevelProgress(levelId: string): LevelProgress | null {
        const config = LevelConfigMap.get(levelId);
        if (!config) {
            return null;
        }

        const chapterProgress = this._chapterProgress.get(config.chapterId);
        if (!chapterProgress) {
            return null;
        }

        return chapterProgress.levelProgress.get(levelId) || null;
    }

    /**
     * 获取章节所有关卡
     */
    getChapterLevels(chapterId: string): LevelConfig[] {
        const chapter = ChapterConfigMap.get(chapterId);
        if (!chapter) {
            return [];
        }

        return chapter.levels
            .map(id => LevelConfigMap.get(id))
            .filter((config): config is LevelConfig => config !== undefined);
    }

    /**
     * 检查关卡是否可挑战
     */
    canChallenge(levelId: string): boolean {
        const config = LevelConfigMap.get(levelId);
        const progress = this.getLevelProgress(levelId);

        if (!config || !progress) {
            return false;
        }

        // 检查状态
        if (progress.status === LevelStatus.LOCKED) {
            return false;
        }

        // 检查体力
        if (this._stamina < config.staminaCost) {
            return false;
        }

        // 检查每日次数限制
        if (config.dailyLimit > 0 && progress.dailyChallengeCount >= config.dailyLimit) {
            return false;
        }

        return true;
    }

    /**
     * 开始挑战关卡
     */
    startChallenge(levelId: string): boolean {
        if (!this.canChallenge(levelId)) {
            console.warn('[LevelManager] 无法挑战关卡:', levelId);
            return false;
        }

        const config = LevelConfigMap.get(levelId);
        if (!config) {
            return false;
        }

        // 扣除体力
        this._stamina -= config.staminaCost;

        // 记录当前关卡
        this._currentLevelId = levelId;

        console.log('[LevelManager] 开始挑战关卡:', config.name);
        return true;
    }

    /**
     * 完成挑战
     */
    finishChallenge(result: LevelChallengeResult): LevelRewardItems {
        if (!this._currentLevelId) {
            console.warn('[LevelManager] 没有进行中的挑战');
            return {};
        }

        const levelId = this._currentLevelId;
        const config = LevelConfigMap.get(levelId);
        const progress = this.getLevelProgress(levelId);

        if (!config || !progress) {
            this._currentLevelId = null;
            return {};
        }

        // 更新挑战次数
        progress.challengeCount++;
        progress.dailyChallengeCount++;
        progress.lastChallengeTime = Date.now();

        // 计算奖励
        const rewards: LevelRewardItems = {};

        if (result.victory) {
            // 首次通关奖励
            if (result.firstClear && config.rewards.firstClear) {
                this._mergeRewards(rewards, config.rewards.firstClear);
                progress.firstClearTime = Date.now();
            }

            // 普通关关奖励
            if (config.rewards.normal) {
                this._mergeRewards(rewards, config.rewards.normal);
            }

            // 更新状态
            const wasNotCleared = progress.status !== LevelStatus.CLEARED
                && progress.status !== LevelStatus.PERFECT;

            if (wasNotCleared) {
                progress.status = LevelStatus.CLEARED;

                EventCenter.emit(LevelEventType.LEVEL_CLEARED, {
                    levelId,
                    stars: result.stars
                });
            }

            // 更新星级
            if (result.stars > progress.stars) {
                progress.stars = result.stars;

                // 三星奖励
                if (result.stars === StarRating.THREE && config.rewards.threeStar) {
                    this._mergeRewards(rewards, config.rewards.threeStar);
                }

                // 更新状态为完美
                if (result.stars === StarRating.THREE) {
                    progress.status = LevelStatus.PERFECT;
                }

                EventCenter.emit(LevelEventType.STARS_UPDATED, {
                    levelId,
                    stars: result.stars
                });
            }

            // 更新最佳回合数
            if (!progress.bestTurns || result.turns < progress.bestTurns) {
                progress.bestTurns = result.turns;
            }

            // 解锁下一关
            this._unlockNextLevel(levelId);

            // 检查章节完成
            this._checkChapterCompletion(config.chapterId);
        }

        this._currentLevelId = null;

        EventCenter.emit(LevelEventType.REWARD_CLAIMED, {
            levelId,
            reward: rewards
        });

        console.log('[LevelManager] 挑战结束，获得奖励:', rewards);
        return rewards;
    }

    /**
     * 解锁下一关
     */
    private _unlockNextLevel(currentLevelId: string): void {
        const config = LevelConfigMap.get(currentLevelId);
        if (!config) {
            return;
        }

        const chapter = ChapterConfigMap.get(config.chapterId);
        if (!chapter) {
            return;
        }

        const currentIndex = chapter.levels.indexOf(currentLevelId);
        if (currentIndex < 0 || currentIndex >= chapter.levels.length - 1) {
            return;
        }

        const nextLevelId = chapter.levels[currentIndex + 1];
        const chapterProgress = this._chapterProgress.get(config.chapterId);
        const nextProgress = chapterProgress?.levelProgress.get(nextLevelId);

        if (nextProgress && nextProgress.status === LevelStatus.LOCKED) {
            nextProgress.status = LevelStatus.AVAILABLE;

            EventCenter.emit(LevelEventType.LEVEL_UNLOCKED, {
                levelId: nextLevelId
            });

            console.log('[LevelManager] 解锁下一关:', nextLevelId);
        }
    }

    /**
     * 检查章节完成
     */
    private _checkChapterCompletion(chapterId: string): void {
        const chapter = ChapterConfigMap.get(chapterId);
        const progress = this._chapterProgress.get(chapterId);

        if (!chapter || !progress) {
            return;
        }

        // 检查是否所有关卡都通关
        const allCleared = chapter.levels.every(levelId => {
            const levelProgress = progress.levelProgress.get(levelId);
            return levelProgress && levelProgress.status !== LevelStatus.LOCKED;
        });

        if (allCleared && !progress.rewardClaimed && chapter.completionReward) {
            EventCenter.emit(LevelEventType.CHAPTER_COMPLETED, {
                chapterId,
                reward: chapter.completionReward
            });

            console.log('[LevelManager] 章节完成:', chapter.name);
        }
    }

    /**
     * 领取章节奖励
     */
    claimChapterReward(chapterId: string): LevelRewardItems | null {
        const chapter = ChapterConfigMap.get(chapterId);
        const progress = this._chapterProgress.get(chapterId);

        if (!chapter || !progress) {
            return null;
        }

        if (progress.rewardClaimed) {
            console.warn('[LevelManager] 章节奖励已领取');
            return null;
        }

        // 检查是否完成
        if (!this._isChapterCompleted(chapterId)) {
            console.warn('[LevelManager] 章节未完成');
            return null;
        }

        progress.rewardClaimed = true;

        console.log('[LevelManager] 领取章节奖励:', chapter.name);
        return chapter.completionReward || null;
    }

    /**
     * 合并奖励
     */
    private _mergeRewards(target: LevelRewardItems, source: LevelRewardItems): void {
        if (source.gold) {
            target.gold = (target.gold || 0) + source.gold;
        }
        if (source.gems) {
            target.gems = (target.gems || 0) + source.gems;
        }
        if (source.experience) {
            target.experience = (target.experience || 0) + source.experience;
        }
        if (source.items) {
            target.items = [...(target.items || []), ...source.items];
        }
        if (source.heroFragments) {
            target.heroFragments = [...(target.heroFragments || []), ...source.heroFragments];
        }
    }

    /**
     * 获取体力
     */
    getStamina(): { current: number; max: number } {
        return {
            current: this._stamina,
            max: this._maxStamina
        };
    }

    /**
     * 恢复体力
     */
    recoverStamina(amount: number): void {
        this._stamina = Math.min(this._stamina + amount, this._maxStamina);
    }

    /**
     * 获取当前挑战的关卡ID
     */
    getCurrentLevelId(): string | null {
        return this._currentLevelId;
    }

    /**
     * 计算星级
     */
    calculateStars(
        levelId: string,
        turns: number,
        deathCount: number,
        totalHp: number,
        currentHp: number
    ): StarRating {
        const config = LevelConfigMap.get(levelId);
        if (!config) {
            return StarRating.NONE;
        }

        let stars = 0;

        config.starConditions.forEach(condition => {
            let achieved = false;

            switch (condition.type) {
                case StarConditionType.TURN_LIMIT:
                    achieved = turns <= condition.target;
                    break;
                case StarConditionType.NO_DEATH:
                    achieved = deathCount === 0;
                    break;
                case StarConditionType.HP_PERCENT:
                    const hpPercent = (currentHp / totalHp) * 100;
                    achieved = hpPercent >= condition.target;
                    break;
            }

            if (achieved) {
                stars++;
            }
        });

        return stars as StarRating;
    }

    /**
     * 获取总进度
     */
    getTotalProgress(): { cleared: number; total: number; stars: number } {
        let cleared = 0;
        let total = 0;
        let stars = 0;

        this._chapterProgress.forEach(chapterProgress => {
            chapterProgress.levelProgress.forEach(levelProgress => {
                total++;
                if (levelProgress.status !== LevelStatus.LOCKED) {
                    cleared++;
                }
                stars += levelProgress.stars;
            });
        });

        return { cleared, total, stars };
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            chapterProgress: Array.from(this._chapterProgress.entries()).map(([id, progress]) => ({
                chapterId: id,
                unlocked: progress.unlocked,
                rewardClaimed: progress.rewardClaimed,
                levelProgress: Array.from(progress.levelProgress.entries()).map(([lid, lp]) => ({
                    ...lp
                }))
            })),
            stamina: this._stamina,
            staminaRecoverTime: this._staminaRecoverTime,
            lastDailyReset: this._lastDailyReset
        };

        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);

            if (parsed.chapterProgress) {
                parsed.chapterProgress.forEach((cp: any) => {
                    const levelProgress = new Map<string, LevelProgress>();

                    cp.levelProgress.forEach((lp: any) => {
                        levelProgress.set(lp.levelId, lp);
                    });

                    this._chapterProgress.set(cp.chapterId, {
                        chapterId: cp.chapterId,
                        unlocked: cp.unlocked,
                        rewardClaimed: cp.rewardClaimed,
                        levelProgress
                    });
                });
            }

            if (parsed.stamina !== undefined) {
                this._stamina = parsed.stamina;
            }

            if (parsed.lastDailyReset) {
                this._lastDailyReset = parsed.lastDailyReset;
            }

            // 检查每日重置
            this._checkDailyReset();

            console.log('[LevelManager] 数据加载完成');
        } catch (e) {
            console.error('[LevelManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._chapterProgress.clear();
        this._currentLevelId = null;
        this._stamina = this._maxStamina;
        this._lastDailyReset = '';

        this.init();
    }
}

// 导出单例
export const levelManager = LevelManager.getInstance();