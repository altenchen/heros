/**
 * 战斗单位对象池
 * 用于管理战斗中的单位数据对象
 */

import { ObjectPool, PoolConfig, IPoolable } from './ObjectPool';
import { PoolManager, poolManager } from './ObjectPool';
import { BattleUnit, UnitConfig, HeroData, Hex, UnitState, StatusEffect, BuffData } from '../../config/GameTypes';

/**
 * 可池化的战斗单位数据
 */
export class PooledBattleUnit implements IPoolable, BattleUnit {
    id: string = '';
    config: UnitConfig = null as any;
    hero: HeroData = null as any;
    team: 'player' | 'enemy' = 'player';
    position: Hex = { q: 0, r: 0 };
    count: number = 0;
    currentHp: number = 0;
    maxHp: number = 0;
    state: UnitState = UnitState.IDLE;
    buffs: BuffData[] = [];
    canCounter: boolean = true;
    hasActed: boolean = false;
    available: boolean = true;

    /**
     * 初始化单位数据
     */
    init(data: Partial<BattleUnit>): void {
        Object.assign(this, data);
        this.available = false;
    }

    /**
     * 重置（从池中取出时调用）
     */
    reset(): void {
        this.available = false;
        this.state = UnitState.IDLE;
        this.canCounter = true;
        this.hasActed = false;
    }

    /**
     * 清理（放回池中时调用）
     */
    clear(): void {
        this.id = '';
        this.config = null as any;
        this.hero = null as any;
        this.team = 'player';
        this.position = { q: 0, r: 0 };
        this.count = 0;
        this.currentHp = 0;
        this.maxHp = 0;
        this.state = UnitState.IDLE;
        this.buffs = [];
        this.canCounter = true;
        this.hasActed = false;
        this.available = true;
    }

    /**
     * 深拷贝
     */
    clone(): PooledBattleUnit {
        const cloned = new PooledBattleUnit();
        Object.assign(cloned, this);
        cloned.position = { ...this.position };
        cloned.buffs = this.buffs.map(b => ({ ...b }));
        return cloned;
    }
}

/**
 * 战斗单位池配置
 */
export interface BattleUnitPoolConfig {
    initialSize?: number;
    maxSize?: number;
}

/**
 * 战斗单位对象池
 */
export class BattleUnitPool extends ObjectPool<PooledBattleUnit> {
    constructor(config: BattleUnitPoolConfig = {}) {
        super('BattleUnitPool', {
            initialSize: config.initialSize ?? 20,
            maxSize: config.maxSize ?? 100,
            factory: () => new PooledBattleUnit()
        });
    }

    /**
     * 获取并初始化单位
     */
    getUnit(data: Partial<BattleUnit>): PooledBattleUnit {
        const unit = this.get();
        unit.init(data);
        return unit;
    }
}

/**
 * 可池化的Buff数据
 */
export class PooledBuffData implements IPoolable, BuffData {
    id: string = '';
    status: StatusEffect = StatusEffect.BLESS;
    duration: number = 0;
    value: number = 0;
    source: string = '';
    available: boolean = true;

    reset(): void {
        this.available = false;
    }

    clear(): void {
        this.id = '';
        this.status = StatusEffect.BLESS;
        this.duration = 0;
        this.value = 0;
        this.source = '';
        this.available = true;
    }
}

/**
 * Buff数据池
 */
export class BuffDataPool extends ObjectPool<PooledBuffData> {
    constructor(config: { initialSize?: number; maxSize?: number } = {}) {
        super('BuffDataPool', {
            initialSize: config.initialSize ?? 50,
            maxSize: config.maxSize ?? 200,
            factory: () => new PooledBuffData()
        });
    }
}

/**
 * 伤害数据
 */
export class PooledDamageData implements IPoolable {
    attackerId: string = '';
    targetId: string = '';
    baseDamage: number = 0;
    finalDamage: number = 0;
    isCritical: boolean = false;
    isMiss: boolean = false;
    available: boolean = true;

    reset(): void {
        this.available = false;
    }

    clear(): void {
        this.attackerId = '';
        this.targetId = '';
        this.baseDamage = 0;
        this.finalDamage = 0;
        this.isCritical = false;
        this.isMiss = false;
        this.available = true;
    }
}

/**
 * 伤害数据池
 */
export class DamageDataPool extends ObjectPool<PooledDamageData> {
    constructor(config: { initialSize?: number; maxSize?: number } = {}) {
        super('DamageDataPool', {
            initialSize: config.initialSize ?? 30,
            maxSize: config.maxSize ?? 100,
            factory: () => new PooledDamageData()
        });
    }
}

/**
 * 战斗池管理器
 * 管理战斗相关的所有对象池
 */
export class BattlePoolManager {
    private static _instance: BattlePoolManager | null = null;

    private _unitPool: BattleUnitPool;
    private _buffPool: BuffDataPool;
    private _damagePool: DamageDataPool;

    private constructor() {
        this._unitPool = new BattleUnitPool({ initialSize: 20, maxSize: 100 });
        this._buffPool = new BuffDataPool({ initialSize: 50, maxSize: 200 });
        this._damagePool = new DamageDataPool({ initialSize: 30, maxSize: 100 });
    }

    static getInstance(): BattlePoolManager {
        if (!BattlePoolManager._instance) {
            BattlePoolManager._instance = new BattlePoolManager();
        }
        return BattlePoolManager._instance;
    }

    /**
     * 初始化所有池
     */
    init(): void {
        this._unitPool.init();
        this._buffPool.init();
        this._damagePool.init();
        console.log('[BattlePoolManager] All pools initialized');
    }

    /**
     * 获取战斗单位
     */
    getUnit(data: Partial<BattleUnit>): PooledBattleUnit {
        return this._unitPool.getUnit(data);
    }

    /**
     * 归还战斗单位
     */
    returnUnit(unit: PooledBattleUnit): void {
        // 归还所有buff
        unit.buffs.forEach(buff => {
            if (buff instanceof PooledBuffData) {
                this._buffPool.return(buff);
            }
        });
        this._unitPool.return(unit);
    }

    /**
     * 获取Buff数据
     */
    getBuff(data: Partial<BuffData>): PooledBuffData {
        const buff = this._buffPool.get();
        Object.assign(buff, data);
        return buff;
    }

    /**
     * 归还Buff数据
     */
    returnBuff(buff: PooledBuffData): void {
        this._buffPool.return(buff);
    }

    /**
     * 获取伤害数据
     */
    getDamage(): PooledDamageData {
        return this._damagePool.get();
    }

    /**
     * 归还伤害数据
     */
    returnDamage(data: PooledDamageData): void {
        this._damagePool.return(data);
    }

    /**
     * 清理所有池
     */
    clear(): void {
        this._unitPool.clear();
        this._buffPool.clear();
        this._damagePool.clear();
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            unitPool: this._unitPool.getStats(),
            buffPool: this._buffPool.getStats(),
            damagePool: this._damagePool.getStats()
        };
    }
}

// 导出单例
export const battlePoolManager = BattlePoolManager.getInstance();