/**
 * 图鉴管理器
 * 管理收集进度、奖励领取
 * 遵循阿里巴巴开发者手册规范
 */

import {
    CollectionType,
    CollectionState,
    CollectionRewardState,
    CollectionEntryConfig,
    CollectionEntryData,
    CollectionProgressReward,
    CollectionStats,
    CollectionEventType,
    CollectionEventData
} from '../config/CollectionTypes';
import {
    allCollectionEntries,
    collectionProgressRewards,
    getCollectionEntry,
    getEntriesByType,
    getEntryByTargetId,
    getProgressReward,
    getProgressRewardsByType
} from '../config/collection.json';
import { EventCenter } from '../utils/EventTarget';
import { playerDataManager } from '../utils/PlayerDataManager';
import { rewardManager, RewardConfig } from '../utils/RewardManager';

/**
 * 图鉴管理器
 * 单例模式
 */
export class CollectionManager {
    private static _instance: CollectionManager | null = null;

    /** 玩家图鉴数据 */
    private _entryData: Map<string, CollectionEntryData> = new Map();

    /** 进度奖励数据 */
    private _progressRewards: Map<string, CollectionRewardState> = new Map();

    /** 存储键 */
    private readonly STORAGE_KEY = 'hmm_legacy_collection';

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): CollectionManager {
        if (!CollectionManager._instance) {
            CollectionManager._instance = new CollectionManager();
        }
        return CollectionManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        // 初始化所有条目数据
        this._initEntries();
        console.log('[CollectionManager] 初始化完成');
    }

    /**
     * 初始化条目数据
     */
    private _initEntries(): void {
        allCollectionEntries.forEach(entry => {
            if (!this._entryData.has(entry.entryId)) {
                this._entryData.set(entry.entryId, {
                    entryId: entry.entryId,
                    state: CollectionState.LOCKED,
                    shards: 0
                });
            }
        });

        // 初始化进度奖励状态
        collectionProgressRewards.forEach(reward => {
            if (!this._progressRewards.has(reward.rewardId)) {
                this._progressRewards.set(reward.rewardId, CollectionRewardState.NOT_REACHED);
            }
        });
    }

    /**
     * 获取图鉴条目数据
     */
    getEntryData(entryId: string): CollectionEntryData | undefined {
        return this._entryData.get(entryId);
    }

    /**
     * 获取图鉴条目配置
     */
    getEntryConfig(entryId: string): CollectionEntryConfig | undefined {
        return getCollectionEntry(entryId);
    }

    /**
     * 获取指定类型的所有条目
     */
    getEntriesByType(type: CollectionType): { config: CollectionEntryConfig; data: CollectionEntryData }[] {
        const configs = getEntriesByType(type);
        return configs.map(config => ({
            config,
            data: this._entryData.get(config.entryId) || {
                entryId: config.entryId,
                state: CollectionState.LOCKED,
                shards: 0
            }
        }));
    }

    /**
     * 获取收集统计
     */
    getStats(type?: CollectionType): CollectionStats {
        let entries = type ? getEntriesByType(type) : allCollectionEntries;

        let total = entries.length;
        let collected = 0;
        let unlocked = 0;

        const rarityStats = new Map<string, { total: number; collected: number }>();

        entries.forEach(config => {
            const data = this._entryData.get(config.entryId);

            // 稀有度统计
            if (!rarityStats.has(config.rarity)) {
                rarityStats.set(config.rarity, { total: 0, collected: 0 });
            }
            const rarityStat = rarityStats.get(config.rarity)!;
            rarityStat.total++;

            if (data) {
                if (data.state === CollectionState.COLLECTED || data.state === CollectionState.MAX_LEVEL) {
                    collected++;
                    rarityStat.collected++;
                }
                if (data.state !== CollectionState.LOCKED) {
                    unlocked++;
                }
            }
        });

        return {
            total,
            collected,
            unlocked,
            completionRate: total > 0 ? Math.floor((collected / total) * 100) : 0,
            rarityStats
        };
    }

    /**
     * 获取总收集进度
     */
    getTotalProgress(): { collected: number; total: number } {
        const stats = this.getStats();
        return {
            collected: stats.collected,
            total: stats.total
        };
    }

    /**
     * 添加碎片
     */
    addShards(entryId: string, count: number): boolean {
        const config = getCollectionEntry(entryId);
        if (!config) return false;

        const data = this._entryData.get(entryId);
        if (!data) return false;

        // 已满级则不能再添加
        if (data.state === CollectionState.MAX_LEVEL) return false;

        data.shards += count;

        // 检查是否可以收集
        if (data.shards >= config.shardRequired && data.state !== CollectionState.COLLECTED) {
            this.collect(entryId);
        }

        return true;
    }

    /**
     * 解锁条目
     */
    unlockEntry(entryId: string): boolean {
        const config = getCollectionEntry(entryId);
        if (!config) return false;

        const data = this._entryData.get(entryId);
        if (!data || data.state !== CollectionState.LOCKED) return false;

        data.state = CollectionState.UNLOCKED;
        data.unlockTime = Date.now();

        // 发送事件
        const eventData: CollectionEventData = {
            type: CollectionEventType.ENTRY_UNLOCKED,
            entryId,
            collectionType: config.type
        };
        EventCenter.emit(CollectionEventType.ENTRY_UNLOCKED, eventData);

        console.log(`[CollectionManager] 解锁条目: ${entryId}`);
        return true;
    }

    /**
     * 收集条目
     */
    collect(entryId: string): boolean {
        const config = getCollectionEntry(entryId);
        if (!config) return false;

        const data = this._entryData.get(entryId);
        if (!data) return false;

        if (data.shards < config.shardRequired) return false;
        if (data.state === CollectionState.COLLECTED || data.state === CollectionState.MAX_LEVEL) {
            return false;
        }

        // 扣除碎片
        data.shards -= config.shardRequired;
        data.state = CollectionState.COLLECTED;
        data.collectTime = Date.now();

        // 发放奖励
        this._grantRewards(config.rewards);

        // 发送事件
        const eventData: CollectionEventData = {
            type: CollectionEventType.ENTRY_COLLECTED,
            entryId,
            collectionType: config.type,
            count: 1
        };
        EventCenter.emit(CollectionEventType.ENTRY_COLLECTED, eventData);

        // 检查进度奖励
        this._checkProgressRewards(config.type);

        console.log(`[CollectionManager] 收集条目: ${entryId}`);
        return true;
    }

    /**
     * 通过目标ID添加碎片
     */
    addShardsByTargetId(targetId: string, count: number): boolean {
        const entry = getEntryByTargetId(targetId);
        if (!entry) return false;

        // 先解锁
        const data = this._entryData.get(entry.entryId);
        if (data && data.state === CollectionState.LOCKED) {
            this.unlockEntry(entry.entryId);
        }

        return this.addShards(entry.entryId, count);
    }

    /**
     * 检查进度奖励
     */
    private _checkProgressRewards(type: CollectionType): void {
        const stats = this.getStats(type);
        const rewards = getProgressRewardsByType(type);

        rewards.forEach(reward => {
            const currentState = this._progressRewards.get(reward.rewardId);
            if (currentState === CollectionRewardState.NOT_REACHED &&
                stats.collected >= reward.requiredCount) {
                this._progressRewards.set(reward.rewardId, CollectionRewardState.CLAIMABLE);

                // 发送事件
                const eventData: CollectionEventData = {
                    type: CollectionEventType.PROGRESS_REACHED,
                    collectionType: type,
                    count: reward.requiredCount,
                    rewardId: reward.rewardId
                };
                EventCenter.emit(CollectionEventType.PROGRESS_REACHED, eventData);
            }
        });

        // 检查总进度奖励
        const totalStats = this.getStats();
        const totalRewards = collectionProgressRewards.filter(r => r.type === CollectionType.HERO);
        totalRewards.forEach(reward => {
            const currentState = this._progressRewards.get(reward.rewardId);
            if (currentState === CollectionRewardState.NOT_REACHED &&
                totalStats.collected >= reward.requiredCount) {
                this._progressRewards.set(reward.rewardId, CollectionRewardState.CLAIMABLE);
            }
        });
    }

    /**
     * 领取进度奖励
     */
    claimProgressReward(rewardId: string): { success: boolean; rewards?: RewardConfig[]; error?: string } {
        const reward = getProgressReward(rewardId);
        if (!reward) {
            return { success: false, error: '奖励不存在' };
        }

        const state = this._progressRewards.get(rewardId);
        if (state !== CollectionRewardState.CLAIMABLE) {
            return { success: false, error: '奖励不可领取' };
        }

        // 发放奖励
        const rewards = this._grantRewards(reward.rewards);

        // 更新状态
        this._progressRewards.set(rewardId, CollectionRewardState.CLAIMED);

        // 发送事件
        const eventData: CollectionEventData = {
            type: CollectionEventType.REWARD_CLAIMED,
            rewardId,
            collectionType: reward.type
        };
        EventCenter.emit(CollectionEventType.REWARD_CLAIMED, eventData);

        return { success: true, rewards };
    }

    /**
     * 获取可领取的进度奖励
     */
    getClaimableRewards(): CollectionProgressReward[] {
        const claimable: CollectionProgressReward[] = [];

        collectionProgressRewards.forEach(reward => {
            const state = this._progressRewards.get(reward.rewardId);
            if (state === CollectionRewardState.CLAIMABLE) {
                claimable.push(reward);
            }
        });

        return claimable;
    }

    /**
     * 获取进度奖励状态
     */
    getProgressRewardState(rewardId: string): CollectionRewardState {
        return this._progressRewards.get(rewardId) || CollectionRewardState.NOT_REACHED;
    }

    /**
     * 发放奖励
     */
    private _grantRewards(rewards: { type: string; itemId: string; amount: number }[]): RewardConfig[] {
        const grantedRewards: RewardConfig[] = rewards.map(r => ({
            type: r.type as any,
            itemId: r.itemId,
            amount: r.amount
        }));

        rewardManager.grantRewards(grantedRewards);

        return grantedRewards;
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            entries: Object.fromEntries(this._entryData),
            progressRewards: Object.fromEntries(this._progressRewards)
        };
        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(jsonStr: string): void {
        try {
            const data = JSON.parse(jsonStr);
            if (data.entries) {
                this._entryData = new Map(Object.entries(data.entries));
            }
            if (data.progressRewards) {
                this._progressRewards = new Map(Object.entries(data.progressRewards));
            }
        } catch (e) {
            console.error('[CollectionManager] 反序列化失败', e);
        }
    }
}

/** 导出单例实例 */
export const collectionManager = CollectionManager.getInstance();