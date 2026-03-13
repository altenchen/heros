/**
 * UI对象池
 * 用于管理UI元素（如列表项、技能图标等）的复用
 */

import { Node, Prefab, instantiate, Vec3, Label, Sprite, UIOpacity } from 'cc';
import { NodePool, NodePoolConfig, nodePoolManager } from './NodePool';

/**
 * UI列表项池配置
 */
export interface UIListItemPoolConfig {
    /** 预制体 */
    prefab: Prefab;
    /** 列表容器 */
    container: Node;
    /** 初始数量 */
    initialSize?: number;
    /** 最大数量 */
    maxSize?: number;
    /** 项间距 */
    spacing?: number;
    /** 是否水平布局 */
    horizontal?: boolean;
}

/**
 * UI列表项池
 * 专门用于列表视图的项管理
 */
export class UIListItemPool {
    readonly name: string;

    protected _pool: NodePool;
    protected _container: Node;
    protected _spacing: number;
    protected _horizontal: boolean;
    protected _items: Node[] = [];

    constructor(name: string, config: UIListItemPoolConfig) {
        this.name = name;
        this._container = config.container;
        this._spacing = config.spacing ?? 5;
        this._horizontal = config.horizontal ?? false;

        // 创建节点池
        this._pool = nodePoolManager.createPool(name, {
            prefab: config.prefab,
            initialSize: config.initialSize ?? 10,
            maxSize: config.maxSize ?? 50,
            onGet: (node) => {
                node.setParent(this._container);
                node.active = true;
            },
            onReturn: (node) => {
                // 重置显示
                const label = node.getComponentInChildren(Label);
                if (label) label.string = '';

                const sprite = node.getComponentInChildren(Sprite);
                if (sprite) sprite.spriteFrame = null;

                const opacity = node.getComponentInChildren(UIOpacity);
                if (opacity) opacity.opacity = 255;
            }
        });

        this._pool.setContainer(config.container);
        this._pool.init();
    }

    /**
     * 获取项
     */
    getItem(): Node {
        const item = this._pool.get(this._container);
        this._items.push(item);
        this._updateLayout();
        return item;
    }

    /**
     * 归还项
     */
    returnItem(item: Node): void {
        const index = this._items.indexOf(item);
        if (index >= 0) {
            this._items.splice(index, 1);
        }
        this._pool.return(item);
        this._updateLayout();
    }

    /**
     * 归还所有项
     */
    returnAll(): void {
        while (this._items.length > 0) {
            const item = this._items.pop();
            if (item) {
                this._pool.return(item);
            }
        }
    }

    /**
     * 更新布局
     */
    protected _updateLayout(): void {
        const size = this._items.length;
        for (let i = 0; i < size; i++) {
            const item = this._items[i];
            if (this._horizontal) {
                item.setPosition(new Vec3(i * this._spacing, 0, 0));
            } else {
                item.setPosition(new Vec3(0, -i * this._spacing, 0));
            }
        }
    }

    /**
     * 获取所有项
     */
    getItems(): Node[] {
        return this._items;
    }

    /**
     * 获取项数量
     */
    getItemCount(): number {
        return this._items.length;
    }

    /**
     * 销毁
     */
    destroy(): void {
        this.returnAll();
        nodePoolManager.destroyPool(this.name);
    }
}

/**
 * UI池管理器
 * 管理UI相关的对象池
 */
export class UIPoolManager {
    private static _instance: UIPoolManager | null = null;

    private _listPools: Map<string, UIListItemPool> = new Map();

    private constructor() {}

    static getInstance(): UIPoolManager {
        if (!UIPoolManager._instance) {
            UIPoolManager._instance = new UIPoolManager();
        }
        return UIPoolManager._instance;
    }

    /**
     * 创建列表项池
     */
    createListPool(name: string, config: UIListItemPoolConfig): UIListItemPool {
        if (this._listPools.has(name)) {
            console.warn(`[UIPoolManager] List pool ${name} already exists`);
            return this._listPools.get(name)!;
        }

        const pool = new UIListItemPool(name, config);
        this._listPools.set(name, pool);
        return pool;
    }

    /**
     * 获取列表项池
     */
    getListPool(name: string): UIListItemPool | null {
        return this._listPools.get(name) || null;
    }

    /**
     * 销毁列表项池
     */
    destroyListPool(name: string): void {
        const pool = this._listPools.get(name);
        if (pool) {
            pool.destroy();
            this._listPools.delete(name);
        }
    }

    /**
     * 清理所有池
     */
    clearAll(): void {
        this._listPools.forEach(pool => {
            pool.destroy();
        });
        this._listPools.clear();
    }
}

// 导出单例
export const uiPoolManager = UIPoolManager.getInstance();