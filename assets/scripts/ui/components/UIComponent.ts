/**
 * UI组件基类
 * 所有UI组件的基础类，提供通用的生命周期管理
 */

import { _decorator, Component, Node, UITransform, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

/**
 * UI组件状态
 */
export enum UIComponentState {
    NONE = 'none',
    LOADING = 'loading',
    READY = 'ready',
    HIDDEN = 'hidden',
    DESTROYED = 'destroyed'
}

/**
 * UI组件基类
 * 提供通用的UI生命周期管理
 */
@ccclass('UIComponent')
export class UIComponent extends Component {
    /** 组件状态 */
    protected _state: UIComponentState = UIComponentState.NONE;

    /** 组件数据 */
    protected _data: any = null;

    /** 是否已初始化 */
    protected _initialized: boolean = false;

    /** 禁用时的回调 */
    protected _onDisableCallback: (() => void) | null = null;

    /** 启用时的回调 */
    protected _onEnableCallback: (() => void) | null = null;

    /**
     * 获取组件状态
     */
    get state(): UIComponentState {
        return this._state;
    }

    /**
     * 获取组件数据
     */
    get data(): any {
        return this._data;
    }

    /**
     * 组件加载时调用
     */
    onLoad(): void {
        this._state = UIComponentState.LOADING;
        this._init();
    }

    /**
     * 组件启动时调用
     */
    start(): void {
        this._state = UIComponentState.READY;
        this._onReady();
    }

    /**
     * 组件启用时调用
     */
    onEnable(): void {
        if (this._onEnableCallback) {
            this._onEnableCallback();
        }
    }

    /**
     * 组件禁用时调用
     */
    onDisable(): void {
        if (this._onDisableCallback) {
            this._onDisableCallback();
        }
    }

    /**
     * 组件销毁时调用
     */
    onDestroy(): void {
        this._state = UIComponentState.DESTROYED;
        this._onDestroy();
    }

    /**
     * 初始化组件
     */
    protected _init(): void {
        if (this._initialized) {
            return;
        }
        this._initialized = true;
        this.init();
    }

    /**
     * 子类重写：初始化逻辑
     */
    protected init(): void {
        // 子类实现
    }

    /**
     * 子类重写：准备完成
     */
    protected _onReady(): void {
        this.onReady();
    }

    /**
     * 子类重写：准备完成回调
     */
    protected onReady(): void {
        // 子类实现
    }

    /**
     * 子类重写：销毁逻辑
     */
    protected _onDestroy(): void {
        // 子类实现
    }

    /**
     * 设置数据
     */
    setData(data: any): void {
        this._data = data;
        this.onDataChanged(data);
    }

    /**
     * 数据变化回调
     */
    protected onDataChanged(data: any): void {
        // 子类实现
    }

    /**
     * 显示组件
     */
    show(data?: any): void {
        if (data) {
            this._data = data;
        }
        this.node.active = true;
        this._state = UIComponentState.READY;
        this.onShow(this._data);
    }

    /**
     * 隐藏组件
     */
    hide(): void {
        this.node.active = false;
        this._state = UIComponentState.HIDDEN;
        this.onHide();
    }

    /**
     * 子类重写：显示回调
     */
    protected onShow(data?: any): void {
        // 子类实现
    }

    /**
     * 子类重写：隐藏回调
     */
    protected onHide(): void {
        // 子类实现
    }

    /**
     * 设置禁用回调
     */
    setOnDisableCallback(callback: () => void): void {
        this._onDisableCallback = callback;
    }

    /**
     * 设置启用回调
     */
    setOnEnableCallback(callback: () => void): void {
        this._onEnableCallback = callback;
    }

    /**
     * 获取UI变换组件
     */
    getUITransform(): UITransform | null {
        return this.node.getComponent(UITransform);
    }

    /**
     * 设置位置
     */
    setPosition(x: number, y: number, z: number = 0): void {
        this.node.setPosition(new Vec3(x, y, z));
    }

    /**
     * 设置大小
     */
    setSize(width: number, height: number): void {
        const transform = this.getUITransform();
        if (transform) {
            transform.setContentSize(width, height);
        }
    }

    /**
     * 查找子节点
     */
    findChild(path: string): Node | null {
        return this.node.getChildByPath(path);
    }

    /**
     * 获取子节点组件
     */
    getChildComponent<T extends Component>(path: string, type: new (...args: any[]) => T): T | null {
        const child = this.findChild(path);
        if (child) {
            return child.getComponent(type);
        }
        return null;
    }
}