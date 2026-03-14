/**
 * 对象池系统
 * 提供通用的对象复用机制，减少频繁创建和销毁带来的性能开销
 */

/**
 * 池化对象接口
 */
export interface IPoolable {
    /** 重置对象状态（从池中取出时调用） */
    reset(): void;
    /** 清理对象（放回池中时调用） */
    clear(): void;
    /** 是否可用 */
    available?: boolean;
}

/**
 * 对象工厂函数
 */
export type ObjectFactory<T> = () => T;

/**
 * 对象池配置
 */
export interface PoolConfig<T> {
    /** 初始容量 */
    initialSize: number;
    /** 最大容量 */
    maxSize: number;
    /** 对象工厂 */
    factory: ObjectFactory<T>;
    /** 预热回调 */
    onWarm?: (obj: T) => void;
    /** 获取回调 */
    onGet?: (obj: T) => void;
    /** 归还回调 */
    onReturn?: (obj: T) => void;
    /** 销毁回调 */
    onDestroy?: (obj: T) => void;
}

/**
 * 默认对象池配置
 */
const DEFAULT_POOL_CONFIG: Partial<PoolConfig<any>> = {
    initialSize: 10,
    maxSize: 100
};

/**
 * 通用对象池
 * 用于管理可复用对象的创建、获取、归还和销毁
 */
export class ObjectPool<T> {
    /** 池名称 */
    readonly name: string;

    /** 配置 */
    protected _config: PoolConfig<T>;

    /** 可用对象列表 */
    protected _available: T[] = [];

    /** 正在使用的对象数量 */
    protected _usedCount: number = 0;

    /** 总创建数量 */
    protected _totalCreated: number = 0;

    /** 是否已初始化 */
    protected _initialized: boolean = false;

    constructor(name: string, config: PoolConfig<T>) {
        this.name = name;
        this._config = { ...DEFAULT_POOL_CONFIG, ...config } as PoolConfig<T>;
    }

    /**
     * 初始化池（预热）
     */
    init(): void {
        if (this._initialized) return;

        const size = Math.min(this._config.initialSize, this._config.maxSize);
        for (let i = 0; i < size; i++) {
            const obj = this._createObject();
            this._available.push(obj);
        }

        this._initialized = true;
        console.log(`[ObjectPool] ${this.name} initialized with ${size} objects`);
    }

    /**
     * 创建新对象
     */
    protected _createObject(): T {
        const obj = this._config.factory();
        this._totalCreated++;

        if (this._config.onWarm) {
            this._config.onWarm(obj);
        }

        // 标记为可用
        if ((obj as any).available !== undefined) {
            (obj as any).available = true;
        }

        return obj;
    }

    /**
     * 获取对象
     */
    get(): T {
        // 预热
        if (!this._initialized) {
            this.init();
        }

        let obj: T;

        if (this._available.length > 0) {
            obj = this._available.pop()!;
        } else if (this._totalCreated < this._config.maxSize) {
            obj = this._createObject();
        } else {
            console.warn(`[ObjectPool] ${this.name} reached max size, creating new object anyway`);
            obj = this._createObject();
        }

        // 标记为使用中
        if ((obj as any).available !== undefined) {
            (obj as any).available = false;
        }

        this._usedCount++;

        // 调用重置方法
        if ((obj as IPoolable).reset) {
            (obj as IPoolable).reset();
        }

        // 回调
        if (this._config.onGet) {
            this._config.onGet(obj);
        }

        return obj;
    }

    /**
     * 归还对象
     */
    return(obj: T): void {
        if (!obj) return;

        // 调用清理方法
        const poolable = obj as unknown as IPoolable;
        if (poolable.clear) {
            poolable.clear();
        }

        // 标记为可用
        if ((obj as any).available !== undefined) {
            (obj as any).available = true;
        }

        // 回调
        if (this._config.onReturn) {
            this._config.onReturn(obj);
        }

        // 放回池中
        if (this._available.length < this._config.maxSize) {
            this._available.push(obj);
        }

        this._usedCount = Math.max(0, this._usedCount - 1);
    }

    /**
     * 预热指定数量的对象
     */
    warm(count: number): void {
        const actualCount = Math.min(count, this._config.maxSize - this._available.length);
        for (let i = 0; i < actualCount; i++) {
            const obj = this._createObject();
            this._available.push(obj);
        }
        console.log(`[ObjectPool] ${this.name} warmed ${actualCount} objects`);
    }

    /**
     * 清理池中所有可用对象
     */
    clear(): void {
        while (this._available.length > 0) {
            const obj = this._available.pop();
            if (obj && this._config.onDestroy) {
                this._config.onDestroy(obj);
            }
        }
        this._usedCount = 0;
        console.log(`[ObjectPool] ${this.name} cleared`);
    }

    /**
     * 销毁池
     */
    destroy(): void {
        this.clear();
        this._initialized = false;
        this._totalCreated = 0;
    }

    /**
     * 获取池状态
     */
    getStats(): PoolStats {
        return {
            name: this.name,
            available: this._available.length,
            used: this._usedCount,
            total: this._totalCreated,
            maxSize: this._config.maxSize
        };
    }
}

/**
 * 池状态
 */
export interface PoolStats {
    name: string;
    available: number;
    used: number;
    total: number;
    maxSize: number;
}

/**
 * 对象池管理器
 * 管理多个对象池
 */
export class PoolManager {
    private static _instance: PoolManager | null = null;

    /** 所有对象池 */
    private _pools: Map<string, ObjectPool<any>> = new Map();

    private constructor() {}

    /**
     * 获取单例
     */
    static getInstance(): PoolManager {
        if (!PoolManager._instance) {
            PoolManager._instance = new PoolManager();
        }
        return PoolManager._instance;
    }

    /**
     * 创建对象池
     */
    createPool<T>(name: string, config: PoolConfig<T>): ObjectPool<T> {
        if (this._pools.has(name)) {
            console.warn(`[PoolManager] Pool ${name} already exists, returning existing pool`);
            return this._pools.get(name) as ObjectPool<T>;
        }

        const pool = new ObjectPool<T>(name, config);
        this._pools.set(name, pool);
        return pool;
    }

    /**
     * 获取对象池
     */
    getPool<T>(name: string): ObjectPool<T> | null {
        return this._pools.get(name) as ObjectPool<T> || null;
    }

    /**
     * 从指定池获取对象
     */
    get<T>(poolName: string): T | null {
        const pool = this._pools.get(poolName);
        if (!pool) {
            console.warn(`[PoolManager] Pool ${poolName} not found`);
            return null;
        }
        return pool.get() as T;
    }

    /**
     * 归还对象到指定池
     */
    return<T>(poolName: string, obj: T): void {
        const pool = this._pools.get(poolName);
        if (!pool) {
            console.warn(`[PoolManager] Pool ${poolName} not found`);
            return;
        }
        pool.return(obj);
    }

    /**
     * 预热所有池
     */
    warmAll(): void {
        this._pools.forEach(pool => {
            pool.init();
        });
    }

    /**
     * 清理所有池
     */
    clearAll(): void {
        this._pools.forEach(pool => {
            pool.clear();
        });
    }

    /**
     * 销毁指定池
     */
    destroyPool(name: string): void {
        const pool = this._pools.get(name);
        if (pool) {
            pool.destroy();
            this._pools.delete(name);
        }
    }

    /**
     * 销毁所有池
     */
    destroyAll(): void {
        this._pools.forEach(pool => {
            pool.destroy();
        });
        this._pools.clear();
    }

    /**
     * 获取所有池的状态
     */
    getAllStats(): PoolStats[] {
        const stats: PoolStats[] = [];
        this._pools.forEach(pool => {
            stats.push(pool.getStats());
        });
        return stats;
    }

    /**
     * 打印所有池的状态
     */
    printStats(): void {
        console.log('=== Object Pool Stats ===');
        this._pools.forEach(pool => {
            const stats = pool.getStats();
            console.log(`${stats.name}: available=${stats.available}, used=${stats.used}, total=${stats.total}/${stats.maxSize}`);
        });
    }
}

// 导出单例
export const poolManager = PoolManager.getInstance();