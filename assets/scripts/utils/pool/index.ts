/**
 * 对象池模块
 * 导出所有对象池相关类
 */

export { ObjectPool, PoolStats, PoolManager, poolManager } from './ObjectPool';
export type { PoolConfig, IPoolable } from './ObjectPool';
export { NodePool, NodePoolManager, nodePoolManager } from './NodePool';
export type { NodePoolConfig } from './NodePool';
export {
    PooledBattleUnit,
    BattleUnitPool,
    PooledBuffData,
    BuffDataPool,
    PooledDamageData,
    DamageDataPool,
    BattlePoolManager,
    battlePoolManager
} from './BattleUnitPool';
export { UIListItemPool, UIPoolManager, uiPoolManager } from './UIPool';
export type { UIListItemPoolConfig } from './UIPool';