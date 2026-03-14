/**
 * UI数据绑定系统
 * 实现数据与UI的响应式绑定
 */

import { _decorator, Node, Label, Sprite, ProgressBar, Slider, Toggle } from 'cc';
import { EventCenter, GameEvent } from '../utils/EventTarget';

const { ccclass, property } = _decorator;

/**
 * 绑定类型
 */
export enum BindingType {
    TEXT = 'text',           // 文本绑定
    NUMBER = 'number',       // 数字绑定
    BOOLEAN = 'boolean',     // 布尔绑定
    PROGRESS = 'progress',   // 进度绑定
    IMAGE = 'image',         // 图片绑定
    COLOR = 'color'          // 颜色绑定
}

/**
 * 绑定配置
 */
export interface BindingConfig {
    /** 绑定路径 */
    path: string;
    /** 绑定类型 */
    type: BindingType;
    /** 目标节点 */
    target: Node;
    /** 目标属性名 */
    property?: string;
    /** 格式化函数 */
    formatter?: (value: any) => string | number;
    /** 更新回调 */
    onUpdate?: (value: any, target: Node) => void;
}

/**
 * 绑定实例
 */
interface BindingInstance {
    config: BindingConfig;
    lastValue: any;
}

/**
 * 数据源接口
 */
export interface IBindable {
    /** 添加属性变化监听 */
    onPropertyChange(property: string, callback: (value: any) => void): void;
    /** 移除属性变化监听 */
    offPropertyChange(property: string, callback: (value: any) => void): void;
    /** 获取属性值 */
    getProperty(property: string): any;
}

/**
 * 可绑定数据基类
 */
export class BindableData implements IBindable {
    /** 数据 */
    protected _data: Map<string, any> = new Map();

    /** 属性变化监听 */
    protected _listeners: Map<string, ((value: any) => void)[]> = new Map();

    /**
     * 设置属性值
     */
    set(property: string, value: any): void {
        const oldValue = this._data.get(property);
        if (oldValue !== value) {
            this._data.set(property, value);
            this._notifyChange(property, value);
        }
    }

    /**
     * 获取属性值
     */
    get(property: string): any {
        return this._data.get(property);
    }

    /**
     * 获取属性值（接口方法）
     */
    getProperty(property: string): any {
        return this.get(property);
    }

    /**
     * 添加属性变化监听
     */
    onPropertyChange(property: string, callback: (value: any) => void): void {
        if (!this._listeners.has(property)) {
            this._listeners.set(property, []);
        }
        this._listeners.get(property)!.push(callback);
    }

    /**
     * 移除属性变化监听
     */
    offPropertyChange(property: string, callback: (value: any) => void): void {
        const listeners = this._listeners.get(property);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index >= 0) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * 通知属性变化
     */
    protected _notifyChange(property: string, value: any): void {
        const listeners = this._listeners.get(property);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(value);
                } catch (e) {
                    console.error(`Error in property change callback for ${property}:`, e);
                }
            });
        }
    }

    /**
     * 批量设置数据
     */
    setData(data: Record<string, any>): void {
        Object.entries(data).forEach(([key, value]) => {
            this.set(key, value);
        });
    }

    /**
     * 清除所有数据
     */
    clear(): void {
        this._data.clear();
        this._listeners.clear();
    }
}

/**
 * 数据绑定管理器
 */
export class UIDataBinding {
    /** 绑定实例映射 */
    private bindings: Map<string, BindingInstance> = new Map();

    /** 数据源 */
    private dataSource: IBindable | null = null;

    /** 绑定ID计数器 */
    private bindingIdCounter: number = 0;

    /**
     * 设置数据源
     */
    setDataSource(source: IBindable): void {
        this.dataSource = source;
    }

    /**
     * 创建绑定
     */
    bind(config: BindingConfig): string {
        const id = `binding_${++this.bindingIdCounter}`;

        const instance: BindingInstance = {
            config,
            lastValue: undefined
        };

        this.bindings.set(id, instance);

        // 如果有数据源，注册监听
        if (this.dataSource) {
            this.dataSource.onPropertyChange(config.path, (value) => {
                this._updateBinding(instance, value);
            });
        }

        return id;
    }

    /**
     * 批量绑定
     */
    bindMultiple(configs: BindingConfig[]): string[] {
        return configs.map(config => this.bind(config));
    }

    /**
     * 解除绑定
     */
    unbind(id: string): void {
        const instance = this.bindings.get(id);
        if (instance && this.dataSource) {
            this.dataSource.offPropertyChange(instance.config.path, () => {});
        }
        this.bindings.delete(id);
    }

    /**
     * 解除所有绑定
     */
    unbindAll(): void {
        this.bindings.forEach((instance, id) => {
            this.unbind(id);
        });
    }

    /**
     * 手动更新绑定
     */
    updateBinding(path: string, value: any): void {
        this.bindings.forEach(instance => {
            if (instance.config.path === path) {
                this._updateBinding(instance, value);
            }
        });
    }

    /**
     * 更新所有绑定
     */
    updateAll(): void {
        if (!this.dataSource) return;

        this.bindings.forEach(instance => {
            const value = this.dataSource!.getProperty(instance.config.path);
            this._updateBinding(instance, value);
        });
    }

    /**
     * 更新绑定实例
     */
    private _updateBinding(instance: BindingInstance, value: any): void {
        if (instance.lastValue === value) return;
        instance.lastValue = value;

        const { config } = instance;
        const { target, type, formatter, onUpdate } = config;

        // 应用格式化
        const displayValue = formatter ? formatter(value) : value;

        // 根据类型更新UI
        switch (type) {
            case BindingType.TEXT:
                this._updateText(target, displayValue);
                break;

            case BindingType.NUMBER:
                this._updateNumber(target, displayValue);
                break;

            case BindingType.BOOLEAN:
                this._updateBoolean(target, displayValue);
                break;

            case BindingType.PROGRESS:
                this._updateProgress(target, displayValue);
                break;

            case BindingType.IMAGE:
                this._updateImage(target, displayValue);
                break;

            case BindingType.COLOR:
                this._updateColor(target, displayValue);
                break;
        }

        // 调用自定义更新回调
        if (onUpdate) {
            onUpdate(value, target);
        }
    }

    /**
     * 更新文本
     */
    private _updateText(node: Node, value: any): void {
        const label = node.getComponent(Label);
        if (label) {
            label.string = String(value);
        }
    }

    /**
     * 更新数字
     */
    private _updateNumber(node: Node, value: any): void {
        const label = node.getComponent(Label);
        if (label && typeof value === 'number') {
            label.string = this._formatNumber(value);
        }
    }

    /**
     * 格式化数字
     */
    private _formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * 更新布尔值
     */
    private _updateBoolean(node: Node, value: any): void {
        const toggle = node.getComponent(Toggle);
        if (toggle) {
            toggle.isChecked = Boolean(value);
        }

        // 也可以控制节点显示
        node.active = Boolean(value);
    }

    /**
     * 更新进度
     */
    private _updateProgress(node: Node, value: any): void {
        const progressBar = node.getComponent(ProgressBar);
        if (progressBar && typeof value === 'number') {
            progressBar.progress = Math.max(0, Math.min(1, value));
        }

        const slider = node.getComponent(Slider);
        if (slider && typeof value === 'number') {
            slider.progress = Math.max(0, Math.min(1, value));
        }
    }

    /**
     * 更新图片
     */
    private _updateImage(node: Node, value: any): void {
        const sprite = node.getComponent(Sprite);
        if (sprite && value) {
            // value应该是SpriteFrame
            // sprite.spriteFrame = value;
        }
    }

    /**
     * 更新颜色
     */
    private _updateColor(node: Node, value: any): void {
        // value应该是Color对象
        const sprite = node.getComponent(Sprite);
        if (sprite && value) {
            sprite.color = value;
        }

        const label = node.getComponent(Label);
        if (label && value) {
            label.color = value;
        }
    }

    /**
     * 销毁
     */
    destroy(): void {
        this.unbindAll();
        this.dataSource = null;
    }
}

/**
 * 响应式数据装饰器
 */
export function reactive(target: any, propertyKey: string): void {
    const privateKey = `_${propertyKey}`;
    const callbacksKey = `_${propertyKey}_callbacks`;

    Object.defineProperty(target, propertyKey, {
        get() {
            return this[privateKey];
        },
        set(value) {
            const oldValue = this[privateKey];
            if (oldValue !== value) {
                this[privateKey] = value;

                // 触发回调
                const callbacks = this[callbacksKey] || [];
                callbacks.forEach((callback: (value: any) => void) => {
                    callback(value);
                });

                // 触发事件
                EventCenter.emit(`${propertyKey}_changed`, value);
            }
        },
        enumerable: true,
        configurable: true
    });
}

/**
 * 创建响应式对象
 */
export function createReactive<T extends object>(obj: T): T & IBindable {
    const listeners: Map<string, ((value: any) => void)[]> = new Map();

    const proxy = new Proxy(obj as any, {
        get(target, prop: string) {
            if (prop === 'onPropertyChange') {
                return (property: string, callback: (value: any) => void) => {
                    if (!listeners.has(property)) {
                        listeners.set(property, []);
                    }
                    listeners.get(property)!.push(callback);
                };
            }

            if (prop === 'offPropertyChange') {
                return (property: string, callback: (value: any) => void) => {
                    const callbacks = listeners.get(property);
                    if (callbacks) {
                        const index = callbacks.indexOf(callback);
                        if (index >= 0) {
                            callbacks.splice(index, 1);
                        }
                    }
                };
            }

            if (prop === 'getProperty') {
                return (property: string) => {
                    return (target as any)[property];
                };
            }

            return (target as any)[prop];
        },

        set(target, prop: string, value: any) {
            const oldValue = (target as any)[prop];
            if (oldValue !== value) {
                (target as any)[prop] = value;

                // 触发监听
                const callbacks = listeners.get(prop);
                if (callbacks) {
                    callbacks.forEach(callback => {
                        try {
                            callback(value);
                        } catch (e) {
                            console.error(`Error in reactive callback for ${prop}:`, e);
                        }
                    });
                }

                // 触发事件
                EventCenter.emit(`${prop}_changed`, value);
            }
            return true;
        }
    }) as T & IBindable;

    return proxy;
}