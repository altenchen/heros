/**
 * 战斗管理器对象池扩展
 * 为BattleManager提供对象池支持
 */

import { BattleUnit } from './BattleUnit';
import { Hex, HeroData, UnitConfig, BuffData, StatusEffect } from '../config/GameTypes';
import { battlePoolManager, PooledBattleUnit, PooledBuffData } from '../utils/pool/BattleUnitPool';

/**
 * 对象池优化的战斗单位
 * 支持从池中创建和归还
 */
export class PooledBattleUnitExt extends BattleUnit {
    private _pooledData: PooledBattleUnit | null = null;

    /**
     * 从对象池创建战斗单位
     */
    static createFromPool(
        id: string,
        config: UnitConfig,
        hero: HeroData,
        team: 'player' | 'enemy',
        position: Hex,
        count: number
    ): PooledBattleUnitExt {
        const unit = new PooledBattleUnitExt(id, config, hero, team, position, count);

        // 预热池
        battlePoolManager.init();

        return unit;
    }

    /**
     * 获取池化数据
     */
    getPooledData(): PooledBattleUnit | null {
        return this._pooledData;
    }

    /**
     * 归还到池
     */
    returnToPool(): void {
        // 清理buff
        this.buffs.forEach(buff => {
            // buff清理逻辑
        });
    }
}

/**
 * 战斗对象池助手
 * 提供战斗过程中对象池的使用方法
 */
export class BattlePoolHelper {
    private static _instance: BattlePoolHelper | null = null;

    private constructor() {}

    static getInstance(): BattlePoolHelper {
        if (!BattlePoolHelper._instance) {
            BattlePoolHelper._instance = new BattlePoolHelper();
        }
        return BattlePoolHelper._instance;
    }

    /**
     * 初始化战斗对象池
     */
    initBattlePools(): void {
        battlePoolManager.init();
    }

    /**
     * 创建Buff数据
     */
    createBuff(
        id: string,
        status: StatusEffect,
        duration: number,
        value: number,
        source: string
    ): PooledBuffData {
        return battlePoolManager.getBuff({
            id,
            status,
            duration,
            value,
            source
        });
    }

    /**
     * 释放Buff数据
     */
    releaseBuff(buff: PooledBuffData): void {
        battlePoolManager.returnBuff(buff);
    }

    /**
     * 清理战斗池
     */
    clearBattlePools(): void {
        battlePoolManager.clear();
    }

    /**
     * 获取池状态
     */
    getPoolStats(): ReturnType<typeof battlePoolManager.getStats> {
        return battlePoolManager.getStats();
    }
}

// 导出单例
export const battlePoolHelper = BattlePoolHelper.getInstance();