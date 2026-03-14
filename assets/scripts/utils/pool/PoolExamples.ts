/**
 * 对象池使用示例
 * 展示如何在项目中使用对象池系统
 */

import { Node, Prefab, resources, director } from 'cc';
import { poolManager, PoolConfig } from './ObjectPool';
import { nodePoolManager, NodePoolConfig } from './NodePool';
import { battlePoolManager, PooledBattleUnit, PooledBuffData } from './BattleUnitPool';
import { uiPoolManager, UIListItemPoolConfig } from './UIPool';

/**
 * 对象池初始化器
 * 在游戏启动时调用
 */
export class PoolInitializer {
    /**
     * 初始化所有对象池
     */
    static init(): void {
        // 初始化战斗对象池
        battlePoolManager.init();

        console.log('[PoolInitializer] All pools initialized');
    }

    /**
     * 清理所有对象池
     */
    static cleanup(): void {
        battlePoolManager.clear();
        nodePoolManager.clearAll();
        uiPoolManager.clearAll();

        console.log('[PoolInitializer] All pools cleaned up');
    }
}

/**
 * 示例：使用战斗单位池
 */
export class BattlePoolExample {
    /**
     * 创建战斗单位
     */
    static createUnit(data: Partial<any>): PooledBattleUnit {
        return battlePoolManager.getUnit(data);
    }

    /**
     * 释放战斗单位
     */
    static releaseUnit(unit: PooledBattleUnit): void {
        battlePoolManager.returnUnit(unit);
    }

    /**
     * 创建Buff
     */
    static createBuff(data: Partial<any>): PooledBuffData {
        return battlePoolManager.getBuff(data);
    }

    /**
     * 释放Buff
     */
    static releaseBuff(buff: PooledBuffData): void {
        battlePoolManager.returnBuff(buff);
    }
}

/**
 * 示例：使用节点池
 */
export class NodePoolExample {
    /**
     * 创建技能图标池
     */
    static createSkillIconPool(prefab: Prefab): void {
        nodePoolManager.createPool('skill_icon', {
            prefab,
            initialSize: 10,
            maxSize: 30,
            onGet: (node) => {
                // 获取时的初始化
                node.active = true;
            },
            onReturn: (node) => {
                // 归还时的清理
                node.active = false;
            }
        });

        // 初始化池
        const pool = nodePoolManager.getPool('skill_icon');
        if (pool) {
            pool.init();
        }
    }

    /**
     * 获取技能图标
     */
    static getSkillIcon(parent: Node): Node | null {
        return nodePoolManager.get('skill_icon', parent);
    }

    /**
     * 归还技能图标
     */
    static returnSkillIcon(node: Node): void {
        nodePoolManager.return('skill_icon', node);
    }
}

/**
 * 示例：使用UI列表池
 */
export class UIListPoolExample {
    private static _listPoolName = 'unit_list_item';

    /**
     * 创建单位列表项池
     */
    static createUnitListPool(prefab: Prefab, container: Node): void {
        uiPoolManager.createListPool(this._listPoolName, {
            prefab,
            container,
            initialSize: 7,
            maxSize: 14,
            spacing: 80, // 每项高度80
            horizontal: false
        });
    }

    /**
     * 刷新列表
     */
    static refreshList(items: Array<{ name: string; count: number }>): void {
        const pool = uiPoolManager.getListPool(this._listPoolName);
        if (!pool) return;

        // 归还所有现有项
        pool.returnAll();

        // 创建新项
        items.forEach((item, index) => {
            const node = pool.getItem();
            // 设置数据...
        });
    }
}

/**
 * 性能监控
 */
export class PoolPerformanceMonitor {
    /**
     * 获取所有池的内存使用情况
     */
    static getMemoryUsage(): {
        battlePools: ReturnType<typeof battlePoolManager.getStats>;
        nodePools: ReturnType<typeof nodePoolManager.getAllStats>;
    } {
        return {
            battlePools: battlePoolManager.getStats(),
            nodePools: nodePoolManager.getAllStats()
        };
    }

    /**
     * 打印性能报告
     */
    static printReport(): void {
        console.log('=== Pool Performance Report ===\n');

        // 战斗池
        const battleStats = battlePoolManager.getStats();
        console.log('Battle Pools:');
        console.log(`  Unit Pool: ${battleStats.unitPool.available}/${battleStats.unitPool.maxSize} available, ${battleStats.unitPool.used} in use`);
        console.log(`  Buff Pool: ${battleStats.buffPool.available}/${battleStats.buffPool.maxSize} available, ${battleStats.buffPool.used} in use`);
        console.log(`  Damage Pool: ${battleStats.damagePool.available}/${battleStats.damagePool.maxSize} available, ${battleStats.damagePool.used} in use`);

        // 节点池
        const nodeStats = nodePoolManager.getAllStats();
        if (nodeStats.length > 0) {
            console.log('\nNode Pools:');
            nodeStats.forEach(stat => {
                console.log(`  ${stat.name}: ${stat.available}/${stat.maxSize} available, ${stat.used} in use`);
            });
        }

        console.log('\n================================');
    }
}