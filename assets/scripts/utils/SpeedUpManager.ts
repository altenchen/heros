/**
 * 加速管理器
 * 管理建造加速、招募加速等功能
 */

import { EventCenter } from '../utils/EventTarget';
import { inventoryManager } from '../inventory';
import {
    SpeedUpType,
    SpeedUpConfig,
    SpeedUpCost,
    SpeedUpTarget,
    SpeedUpResult,
    SpeedUpEventType,
    DEFAULT_SPEED_UP_ITEMS,
    GEMS_PER_MINUTE,
    FREE_SPEEDUP_THRESHOLD
} from '../config/SpeedUpTypes';
import { ResourceType } from './GameTypes';

/**
 * 加速管理器类
 */
export class SpeedUpManager {
    private static instance: SpeedUpManager | null = null;

    /** 加速道具配置 */
    private speedUpItems: Map<string, SpeedUpConfig> = new Map();

    /** 加速目标列表 */
    private targets: Map<string, SpeedUpTarget> = new Map();

    /** 是否已初始化 */
    private initialized: boolean = false;

    private constructor() {}

    /**
     * 获取单例
     */
    static getInstance(): SpeedUpManager {
        if (!SpeedUpManager.instance) {
            SpeedUpManager.instance = new SpeedUpManager();
        }
        return SpeedUpManager.instance;
    }

    /**
     * 初始化
     */
    init(): void {
        if (this.initialized) return;

        // 加载加速道具配置
        this._loadSpeedUpItems();

        this.initialized = true;
        console.log('[SpeedUpManager] 初始化完成');
    }

    /**
     * 加载加速道具配置
     */
    private _loadSpeedUpItems(): void {
        DEFAULT_SPEED_UP_ITEMS.forEach(item => {
            this.speedUpItems.set(item.itemId, item);
        });
    }

    /**
     * 注册加速目标
     */
    registerTarget(target: SpeedUpTarget): void {
        this.targets.set(target.targetId, target);
        console.log(`[SpeedUpManager] 注册加速目标: ${target.targetId}, 剩余时间: ${target.remainingTime}秒`);
    }

    /**
     * 取消注册加速目标
     */
    unregisterTarget(targetId: string): void {
        this.targets.delete(targetId);
    }

    /**
     * 获取加速目标
     */
    getTarget(targetId: string): SpeedUpTarget | undefined {
        return this.targets.get(targetId);
    }

    /**
     * 更新加速目标时间
     */
    updateTargetTime(targetId: string, remainingTime: number): void {
        const target = this.targets.get(targetId);
        if (target) {
            target.remainingTime = remainingTime;
        }
    }

    /**
     * 获取可用的加速道具列表
     */
    getAvailableSpeedUpItems(type?: SpeedUpType): SpeedUpConfig[] {
        const items: SpeedUpConfig[] = [];

        this.speedUpItems.forEach((config, itemId) => {
            // 检查类型是否匹配
            if (type) {
                const configTypes = Array.isArray(config.type) ? config.type : [config.type];
                if (!configTypes.includes(type) && !configTypes.includes(SpeedUpType.GENERAL)) {
                    return;
                }
            }

            // 检查是否有该道具
            const count = inventoryManager.getItemCount(itemId);
            if (count > 0) {
                items.push(config);
            }
        });

        return items;
    }

    /**
     * 获取所有加速道具配置
     */
    getAllSpeedUpItems(): SpeedUpConfig[] {
        return Array.from(this.speedUpItems.values());
    }

    /**
     * 计算钻石加速费用
     */
    calculateGemsCost(remainingTime: number): number {
        if (remainingTime <= 0) return 0;

        // 小于阈值可以免费加速
        if (remainingTime <= FREE_SPEEDUP_THRESHOLD) {
            return 0;
        }

        const minutes = Math.ceil(remainingTime / 60);
        return minutes * GEMS_PER_MINUTE;
    }

    /**
     * 获取加速建议
     */
    getSpeedUpSuggestion(targetId: string): {
        items: SpeedUpConfig[];
        gemsCost: number;
        canFreeSpeedUp: boolean;
    } {
        const target = this.targets.get(targetId);
        if (!target) {
            return { items: [], gemsCost: 0, canFreeSpeedUp: false };
        }

        const items = this.getAvailableSpeedUpItems(target.type);
        const gemsCost = this.calculateGemsCost(target.remainingTime);
        const canFreeSpeedUp = target.remainingTime <= FREE_SPEEDUP_THRESHOLD;

        return { items, gemsCost, canFreeSpeedUp };
    }

    /**
     * 使用道具加速
     */
    speedUpWithItem(targetId: string, itemId: string): SpeedUpResult {
        const target = this.targets.get(targetId);
        if (!target) {
            return { success: false, error: '目标不存在' };
        }

        const config = this.speedUpItems.get(itemId);
        if (!config) {
            return { success: false, error: '道具配置不存在' };
        }

        // 检查类型是否匹配
        const configTypes = Array.isArray(config.type) ? config.type : [config.type];
        if (!configTypes.includes(target.type) && !configTypes.includes(SpeedUpType.GENERAL)) {
            return { success: false, error: '道具类型不匹配' };
        }

        // 检查道具数量
        const count = inventoryManager.getItemCount(itemId);
        if (count <= 0) {
            return { success: false, error: '道具数量不足' };
        }

        // 使用道具
        const useResult = inventoryManager.useItem(
            inventoryManager.findItemInstanceId(itemId)!,
            1
        );

        if (!useResult.success) {
            return { success: false, error: '使用道具失败' };
        }

        // 减少时间
        const newTime = Math.max(0, target.remainingTime - config.time);
        target.remainingTime = newTime;

        // 触发事件
        EventCenter.emit(SpeedUpEventType.SPEED_UP_START, {
            targetId,
            itemId,
            time: config.time
        });

        // 检查是否完成
        const completed = newTime <= 0;
        if (completed) {
            EventCenter.emit(SpeedUpEventType.SPEED_UP_COMPLETE, { targetId });
            this.unregisterTarget(targetId);
        }

        console.log(`[SpeedUpManager] 使用道具加速: ${itemId}, 减少时间: ${config.time}秒, 剩余: ${newTime}秒`);

        return {
            success: true,
            remainingTime: newTime,
            completed,
            cost: { type: 'item', id: itemId, amount: 1, time: config.time }
        };
    }

    /**
     * 使用钻石加速
     */
    speedUpWithGems(targetId: string): SpeedUpResult {
        const target = this.targets.get(targetId);
        if (!target) {
            return { success: false, error: '目标不存在' };
        }

        const gemsCost = this.calculateGemsCost(target.remainingTime);

        // 检查是否可以免费加速
        if (gemsCost === 0) {
            // 免费完成
            target.remainingTime = 0;
            EventCenter.emit(SpeedUpEventType.SPEED_UP_COMPLETE, { targetId, free: true });
            this.unregisterTarget(targetId);

            return {
                success: true,
                remainingTime: 0,
                completed: true,
                cost: { type: 'gems', id: 'gems', amount: 0, time: target.remainingTime }
            };
        }

        // TODO: 检查玩家钻石数量
        // const playerGems = playerDataManager.getResource(ResourceType.GEMS);
        // if (playerGems < gemsCost) {
        //     return { success: false, error: '钻石不足' };
        // }

        // 扣除钻石
        // playerDataManager.addResource(ResourceType.GEMS, -gemsCost);

        console.log(`[SpeedUpManager] 使用钻石加速: 消耗${gemsCost}钻石`);

        // 完成加速
        const originalTime = target.remainingTime;
        target.remainingTime = 0;

        EventCenter.emit(SpeedUpEventType.SPEED_UP_COMPLETE, { targetId });
        this.unregisterTarget(targetId);

        return {
            success: true,
            remainingTime: 0,
            completed: true,
            cost: { type: 'gems', id: 'gems', amount: gemsCost, time: originalTime }
        };
    }

    /**
     * 快速完成（如果剩余时间小于阈值则免费完成）
     */
    quickFinish(targetId: string): SpeedUpResult {
        const target = this.targets.get(targetId);
        if (!target) {
            return { success: false, error: '目标不存在' };
        }

        if (target.remainingTime > FREE_SPEEDUP_THRESHOLD) {
            return { success: false, error: '剩余时间过长，无法免费完成' };
        }

        // 免费完成
        target.remainingTime = 0;

        EventCenter.emit(SpeedUpEventType.SPEED_UP_COMPLETE, { targetId, free: true });
        this.unregisterTarget(targetId);

        return {
            success: true,
            remainingTime: 0,
            completed: true,
            cost: { type: 'gold', id: 'free', amount: 0, time: 0 }
        };
    }

    /**
     * 格式化时间显示
     */
    formatTime(seconds: number): string {
        if (seconds <= 0) return '已完成';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}小时${minutes}分${secs}秒`;
        } else if (minutes > 0) {
            return `${minutes}分${secs}秒`;
        } else {
            return `${secs}秒`;
        }
    }

    /**
     * 清理
     */
    cleanup(): void {
        this.targets.clear();
        this.initialized = false;
        SpeedUpManager.instance = null;
    }
}

/** 加速管理器单例 */
export const speedUpManager = SpeedUpManager.getInstance();