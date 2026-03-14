/**
 * 节点对象池
 * 专门用于管理Cocos Creator节点的对象池
 */

import { Node, Prefab, instantiate, Vec3, Quat, UIOpacity, tween } from 'cc';
import { ObjectPool, PoolConfig, IPoolable } from './ObjectPool';
import { PoolManager } from './ObjectPool';

/**
 * 池化节点数据
 */
interface PooledNode {
    node: Node;
    originalParent: Node | null;
    originalPosition: Vec3;
    originalScale: Vec3;
    originalRotation: Quat;
}

/**
 * 节点池配置
 */
export interface NodePoolConfig {
    /** 预制体 */
    prefab: Prefab;
    /** 初始数量 */
    initialSize?: number;
    /** 最大数量 */
    maxSize?: number;
    /** 是否自动隐藏 */
    autoHide?: boolean;
    /** 获取时的回调 */
    onGet?: (node: Node) => void;
    /** 归还时的回调 */
    onReturn?: (node: Node) => void;
}

/**
 * 节点池
 * 管理Cocos Creator节点的创建、获取、归还
 */
export class NodePool {
    /** 池名称 */
    readonly name: string;

    /** 预制体 */
    protected _prefab: Prefab;

    /** 节点容器 */
    protected _container: Node | null = null;

    /** 可用节点 */
    protected _available: Node[] = [];

    /** 使用中的节点 */
    protected _used: Set<Node> = new Set();

    /** 配置 */
    protected _config: Required<Omit<NodePoolConfig, 'prefab'>>;

    constructor(name: string, config: NodePoolConfig) {
        this.name = name;
        this._prefab = config.prefab;
        this._config = {
            initialSize: config.initialSize ?? 5,
            maxSize: config.maxSize ?? 50,
            autoHide: config.autoHide ?? true,
            onGet: config.onGet ?? (() => {}),
            onReturn: config.onReturn ?? (() => {})
        };
    }

    /**
     * 设置节点容器
     */
    setContainer(container: Node): void {
        this._container = container;
    }

    /**
     * 初始化池
     */
    init(): void {
        for (let i = 0; i < this._config.initialSize; i++) {
            const node = this._createNode();
            this._available.push(node);
        }
        console.log(`[NodePool] ${this.name} initialized with ${this._config.initialSize} nodes`);
    }

    /**
     * 创建节点
     */
    protected _createNode(): Node {
        const node = instantiate(this._prefab);

        // 设置父节点
        if (this._container) {
            node.setParent(this._container);
        }

        // 默认隐藏
        if (this._config.autoHide) {
            node.active = false;
        }

        // 存储原始数据
        (node as any)._poolData = {
            originalPosition: node.position.clone(),
            originalScale: node.scale.clone(),
            originalRotation: node.rotation.clone()
        };

        return node;
    }

    /**
     * 获取节点
     */
    get(parent?: Node): Node {
        let node: Node;

        if (this._available.length > 0) {
            node = this._available.pop()!;
        } else if (this._used.size < this._config.maxSize) {
            node = this._createNode();
        } else {
            console.warn(`[NodePool] ${this.name} reached max size`);
            node = this._createNode();
        }

        // 设置父节点
        if (parent) {
            node.setParent(parent);
        }

        // 显示节点
        node.active = true;

        // 重置变换
        const poolData = (node as any)._poolData;
        if (poolData) {
            node.setPosition(poolData.originalPosition);
            node.setScale(poolData.originalScale);
            node.setRotation(poolData.originalRotation);
        }

        // 记录使用
        this._used.add(node);

        // 回调
        this._config.onGet(node);

        return node;
    }

    /**
     * 归还节点
     */
    return(node: Node): void {
        if (!node || !this._used.has(node)) {
            return;
        }

        // 回调
        this._config.onReturn(node);

        // 移除所有子节点
        node.removeAllChildren();

        // 停止所有动画
        tween(node).stop();

        // 重置透明度
        const opacity = node.getComponent(UIOpacity);
        if (opacity) {
            opacity.opacity = 255;
        }

        // 移回容器
        if (this._container) {
            node.setParent(this._container);
        }

        // 隐藏
        if (this._config.autoHide) {
            node.active = false;
        }

        // 从使用中移除
        this._used.delete(node);

        // 放回可用列表
        this._available.push(node);
    }

    /**
     * 归还所有节点
     */
    returnAll(): void {
        const usedNodes = Array.from(this._used);
        usedNodes.forEach(node => {
            this.return(node);
        });
    }

    /**
     * 清理池
     */
    clear(): void {
        // 销毁所有可用节点
        while (this._available.length > 0) {
            const node = this._available.pop();
            if (node) {
                node.destroy();
            }
        }

        // 销毁所有使用中的节点
        this._used.forEach(node => {
            node.destroy();
        });
        this._used.clear();

        console.log(`[NodePool] ${this.name} cleared`);
    }

    /**
     * 销毁池
     */
    destroy(): void {
        this.clear();
    }

    /**
     * 获取统计信息
     */
    getStats() {
        return {
            name: this.name,
            available: this._available.length,
            used: this._used.size,
            total: this._available.length + this._used.size,
            maxSize: this._config.maxSize
        };
    }
}

/**
 * 节点池管理器
 */
export class NodePoolManager {
    private static _instance: NodePoolManager | null = null;

    private _pools: Map<string, NodePool> = new Map();

    private constructor() {}

    static getInstance(): NodePoolManager {
        if (!NodePoolManager._instance) {
            NodePoolManager._instance = new NodePoolManager();
        }
        return NodePoolManager._instance;
    }

    /**
     * 创建节点池
     */
    createPool(name: string, config: NodePoolConfig): NodePool {
        if (this._pools.has(name)) {
            console.warn(`[NodePoolManager] Pool ${name} already exists`);
            return this._pools.get(name)!;
        }

        const pool = new NodePool(name, config);
        this._pools.set(name, pool);
        return pool;
    }

    /**
     * 获取节点池
     */
    getPool(name: string): NodePool | null {
        return this._pools.get(name) || null;
    }

    /**
     * 从池中获取节点
     */
    get(poolName: string, parent?: Node): Node | null {
        const pool = this._pools.get(poolName);
        if (!pool) {
            console.warn(`[NodePoolManager] Pool ${poolName} not found`);
            return null;
        }
        return pool.get(parent);
    }

    /**
     * 归还节点
     */
    return(poolName: string, node: Node): void {
        const pool = this._pools.get(poolName);
        if (!pool) {
            console.warn(`[NodePoolManager] Pool ${poolName} not found`);
            return;
        }
        pool.return(node);
    }

    /**
     * 初始化所有池
     */
    initAll(): void {
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
     * 获取所有池状态
     */
    getAllStats(): ReturnType<NodePool['getStats']>[] {
        const stats: ReturnType<NodePool['getStats']>[] = [];
        this._pools.forEach(pool => {
            stats.push(pool.getStats());
        });
        return stats;
    }
}

// 导出单例
export const nodePoolManager = NodePoolManager.getInstance();