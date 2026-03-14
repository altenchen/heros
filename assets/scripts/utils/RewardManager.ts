/**
 * 奖励管理器
 * 统一处理各种奖励的发放（道具、资源、英雄碎片、兵种等）
 * 遵循阿里巴巴开发者手册规范
 */

import {
    ResourceType,
    HeroData
} from '../config/GameTypes';
import { InventoryManager } from '../inventory/InventoryManager';
import { playerDataManager } from './PlayerDataManager';
import { EventCenter } from './EventTarget';
import { skinManager } from './SkinManager';

/**
 * 奖励类型
 */
export enum RewardType {
    /** 金币 */
    GOLD = 'gold',
    /** 宝石 */
    GEMS = 'gems',
    /** 体力 */
    STAMINA = 'stamina',
    /** 经验 */
    EXP = 'exp',
    /** 资源（木材、矿石等） */
    RESOURCE = 'resource',
    /** 道具 */
    ITEM = 'item',
    /** 英雄碎片 */
    HERO_SHARD = 'hero_shard',
    /** 兵种 */
    UNIT = 'unit',
    /** 皮肤 */
    SKIN = 'skin'
}

/**
 * 奖励配置
 */
export interface RewardConfig {
    /** 奖励类型 */
    type: RewardType | string;
    /** 道具ID（用于道具、碎片、兵种等） */
    itemId?: string;
    /** 数量 */
    amount: number;
    /** 概率（百分比，用于随机奖励） */
    probability?: number;
}

/**
 * 奖励发放结果
 */
export interface RewardResult {
    /** 是否成功 */
    success: boolean;
    /** 奖励类型 */
    type: RewardType | string;
    /** 道具ID */
    itemId?: string;
    /** 实际发放数量 */
    amount: number;
    /** 失败原因 */
    reason?: string;
}

/**
 * 英雄碎片数据
 */
interface HeroShardData {
    /** 英雄配置ID */
    heroId: string;
    /** 碎片数量 */
    count: number;
    /** 解锁所需碎片数 */
    required: number;
}

/**
 * 奖励管理器
 * 单例模式
 */
export class RewardManager {
    private static _instance: RewardManager | null = null;

    /** 英雄碎片数据 */
    private _heroShards: Map<string, HeroShardData> = new Map();

    /** 英雄解锁所需碎片数 */
    private readonly SHARDS_REQUIRED = {
        'hero_catherine': 50,
        'hero_sandro': 50,
        'hero_gem': 60,
        'hero_crag_hack': 60,
        'hero_galthran': 80,
        'hero_nagash': 80
    };

    /** 默认解锁所需碎片 */
    private readonly DEFAULT_SHARDS_REQUIRED = 50;

    /** 存储键 */
    private readonly STORAGE_KEY = 'hmm_legacy_shards';

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): RewardManager {
        if (!RewardManager._instance) {
            RewardManager._instance = new RewardManager();
        }
        return RewardManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this._loadShards();
        console.log('[RewardManager] 初始化完成');
    }

    /**
     * 发放奖励
     * @param rewards 奖励配置列表
     * @returns 发放结果列表
     */
    grantRewards(rewards: RewardConfig[]): RewardResult[] {
        const results: RewardResult[] = [];

        for (const reward of rewards) {
            const result = this._grantReward(reward);
            results.push(result);
        }

        // 触发奖励发放事件
        EventCenter.emit('rewards_granted', { results });

        return results;
    }

    /**
     * 发放单个奖励
     */
    private _grantReward(reward: RewardConfig): RewardResult {
        const { type, itemId, amount } = reward;

        switch (type) {
            case RewardType.GOLD:
            case 'gold':
                playerDataManager.addResource(ResourceType.GOLD, amount);
                return { success: true, type: RewardType.GOLD, amount };

            case RewardType.GEMS:
            case 'gems':
                playerDataManager.addResource('gems' as ResourceType, amount);
                return { success: true, type: RewardType.GEMS, amount };

            case RewardType.STAMINA:
            case 'stamina':
                playerDataManager.addResource('stamina' as ResourceType, amount);
                return { success: true, type: RewardType.STAMINA, amount };

            case RewardType.EXP:
            case 'exp':
                playerDataManager.addExperience(amount);
                return { success: true, type: RewardType.EXP, amount };

            case RewardType.RESOURCE:
            case 'resource':
                if (itemId) {
                    playerDataManager.addResource(itemId as ResourceType, amount);
                    return { success: true, type: RewardType.RESOURCE, itemId, amount };
                }
                return { success: false, type, amount: 0, reason: '缺少资源ID' };

            case RewardType.ITEM:
            case 'item':
                return this._grantItem(itemId, amount);

            case RewardType.HERO_SHARD:
            case 'hero_shard':
                return this._grantHeroShard(itemId, amount);

            case RewardType.UNIT:
            case 'unit':
                return this._grantUnit(itemId, amount);

            case RewardType.SKIN:
            case 'skin':
                return this._grantSkin(itemId);

            default:
                console.warn(`[RewardManager] 未知的奖励类型: ${type}`);
                return { success: false, type, amount: 0, reason: '未知的奖励类型' };
        }
    }

    /**
     * 发放道具
     */
    private _grantItem(itemId?: string, amount: number = 1): RewardResult {
        if (!itemId) {
            return { success: false, type: RewardType.ITEM, amount: 0, reason: '缺少道具ID' };
        }

        const inventory = InventoryManager.getInstance();
        const success = inventory.addItem(itemId, amount);

        if (success) {
            return { success: true, type: RewardType.ITEM, itemId, amount };
        } else {
            return { success: false, type: RewardType.ITEM, itemId, amount: 0, reason: '背包已满' };
        }
    }

    /**
     * 发放英雄碎片
     */
    private _grantHeroShard(itemId?: string, amount: number = 1): RewardResult {
        if (!itemId) {
            return { success: false, type: RewardType.HERO_SHARD, amount: 0, reason: '缺少碎片ID' };
        }

        // 从碎片ID提取英雄ID (shard_catherine -> hero_catherine)
        const heroId = this._getHeroIdFromShardId(itemId);
        if (!heroId) {
            // 如果无法提取，尝试直接作为英雄ID处理
            const directHeroId = itemId.replace('shard_', 'hero_');
            if (this.SHARDS_REQUIRED[directHeroId]) {
                return this._addHeroShard(directHeroId, amount, itemId);
            }
            return { success: false, type: RewardType.HERO_SHARD, itemId, amount: 0, reason: '无效的碎片ID' };
        }

        return this._addHeroShard(heroId, amount, itemId);
    }

    /**
     * 添加英雄碎片
     */
    private _addHeroShard(heroId: string, amount: number, shardId: string): RewardResult {
        let shardData = this._heroShards.get(heroId);

        if (!shardData) {
            shardData = {
                heroId,
                count: 0,
                required: this.SHARDS_REQUIRED[heroId] || this.DEFAULT_SHARDS_REQUIRED
            };
            this._heroShards.set(heroId, shardData);
        }

        shardData.count += amount;
        this._saveShards();

        // 检查是否可以解锁英雄
        if (shardData.count >= shardData.required) {
            this._tryUnlockHero(heroId);
        }

        console.log(`[RewardManager] 发放英雄碎片: ${shardId} x${amount}, 当前: ${shardData.count}/${shardData.required}`);

        return { success: true, type: RewardType.HERO_SHARD, itemId: shardId, amount };
    }

    /**
     * 从碎片ID获取英雄ID
     */
    private _getHeroIdFromShardId(shardId: string): string | null {
        const mapping: Record<string, string> = {
            'shard_catherine': 'hero_catherine',
            'shard_sandro': 'hero_sandro',
            'shard_gem': 'hero_gem',
            'shard_crag_hack': 'hero_crag_hack',
            'shard_galthran': 'hero_galthran',
            'shard_nagash': 'hero_nagash'
        };
        return mapping[shardId] || null;
    }

    /**
     * 尝试解锁英雄
     */
    private _tryUnlockHero(heroId: string): boolean {
        const playerData = playerDataManager.getPlayerData();
        if (!playerData) return false;

        // 检查是否已解锁
        if (playerData.unlockedHeroes.includes(heroId)) {
            console.log(`[RewardManager] 英雄已解锁: ${heroId}`);
            return false;
        }

        // 解锁英雄
        playerData.unlockedHeroes.push(heroId);

        // 触发英雄解锁事件
        EventCenter.emit('hero_unlocked', { heroId });

        console.log(`[RewardManager] 解锁英雄: ${heroId}`);

        return true;
    }

    /**
     * 发放兵种
     */
    private _grantUnit(unitId?: string, amount: number = 1): RewardResult {
        if (!unitId) {
            return { success: false, type: RewardType.UNIT, amount: 0, reason: '缺少兵种ID' };
        }

        // 获取玩家主城
        const town = playerDataManager.getMainTown();
        if (!town) {
            return { success: false, type: RewardType.UNIT, itemId: unitId, amount: 0, reason: '主城不存在' };
        }

        // 直接添加到玩家军队
        const playerData = playerDataManager.getPlayerData();
        if (!playerData) {
            return { success: false, type: RewardType.UNIT, itemId: unitId, amount: 0, reason: '玩家数据不存在' };
        }

        // 查找是否有相同兵种的槽位
        const existingSlot = town.data.garrison.find(slot => slot && slot.unitId === unitId);
        if (existingSlot) {
            existingSlot.count += amount;
        } else {
            // 找空槽位
            const emptyIndex = town.data.garrison.findIndex(slot => !slot);
            if (emptyIndex === -1) {
                return { success: false, type: RewardType.UNIT, itemId: unitId, amount: 0, reason: '军队已满' };
            }
            town.data.garrison[emptyIndex] = {
                unitId,
                configId: unitId,
                count: amount,
                currentHp: 0,
                maxHp: 0,
                position: { q: 0, r: 0 }
            };
        }

        console.log(`[RewardManager] 发放兵种: ${unitId} x${amount}`);

        return { success: true, type: RewardType.UNIT, itemId: unitId, amount };
    }

    /**
     * 发放皮肤
     */
    private _grantSkin(skinId?: string): RewardResult {
        if (!skinId) {
            return { success: false, type: RewardType.SKIN, amount: 0, reason: '缺少皮肤ID' };
        }

        // 使用皮肤管理器解锁皮肤
        const success = skinManager.unlockSkin(skinId);

        if (success) {
            console.log(`[RewardManager] 发放皮肤: ${skinId}`);
            return { success: true, type: RewardType.SKIN, itemId: skinId, amount: 1 };
        } else {
            return { success: false, type: RewardType.SKIN, itemId: skinId, amount: 0, reason: '皮肤解锁失败' };
        }
    }

    /**
     * 获取英雄碎片数量
     */
    getHeroShardCount(heroId: string): number {
        const shardData = this._heroShards.get(heroId);
        return shardData?.count || 0;
    }

    /**
     * 获取英雄解锁所需碎片数
     */
    getHeroShardsRequired(heroId: string): number {
        return this.SHARDS_REQUIRED[heroId] || this.DEFAULT_SHARDS_REQUIRED;
    }

    /**
     * 检查英雄是否可解锁
     */
    canUnlockHero(heroId: string): boolean {
        const shardData = this._heroShards.get(heroId);
        if (!shardData) return false;

        const playerData = playerDataManager.getPlayerData();
        if (!playerData) return false;

        // 已解锁
        if (playerData.unlockedHeroes.includes(heroId)) return false;

        return shardData.count >= shardData.required;
    }

    /**
     * 使用碎片解锁英雄
     */
    unlockHeroWithShards(heroId: string): { success: boolean; reason?: string } {
        const shardData = this._heroShards.get(heroId);
        if (!shardData) {
            return { success: false, reason: '碎片数据不存在' };
        }

        if (shardData.count < shardData.required) {
            return { success: false, reason: '碎片数量不足' };
        }

        const unlocked = this._tryUnlockHero(heroId);
        if (unlocked) {
            shardData.count -= shardData.required;
            this._saveShards();
            return { success: true };
        }

        return { success: false, reason: '解锁失败' };
    }

    /**
     * 保存碎片数据
     */
    private _saveShards(): void {
        try {
            const data: Record<string, HeroShardData> = {};
            this._heroShards.forEach((value, key) => {
                data[key] = value;
            });
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('[RewardManager] 保存碎片数据失败', e);
        }
    }

    /**
     * 加载碎片数据
     */
    private _loadShards(): void {
        try {
            const json = localStorage.getItem(this.STORAGE_KEY);
            if (json) {
                const data = JSON.parse(json) as Record<string, HeroShardData>;
                for (const [key, value] of Object.entries(data)) {
                    this._heroShards.set(key, value);
                }
            }
        } catch (e) {
            console.error('[RewardManager] 加载碎片数据失败', e);
        }
    }

    /**
     * 获取所有碎片数据
     */
    getAllShards(): HeroShardData[] {
        return Array.from(this._heroShards.values());
    }
}

/** 奖励管理器单例 */
export const rewardManager = RewardManager.getInstance();