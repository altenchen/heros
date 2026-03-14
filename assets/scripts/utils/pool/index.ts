/**
 * 对象池模块
 * 导出所有对象池相关类
 */

// 值导出（类、常量）
export { ObjectPool } from './ObjectPool';
export { PoolManager, poolManager } from './ObjectPool';

// 类型导出（接口、类型）
export type { IPoolable, ObjectFactory, PoolConfig, PoolStats } from './ObjectPool';

// NodePool
export { NodePool, NodePoolManager, nodePoolManager } from './NodePool';
export type { NodePoolConfig } from './NodePool';

// BattleUnitPool
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

// UIPool
export { UIListItemPool, UIPoolManager, uiPoolManager } from './UIPool';
export type { UIListItemPoolConfig } from './UIPool';