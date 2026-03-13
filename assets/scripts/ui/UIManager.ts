/**
 * UI管理器
 * 管理所有UI面板的显示、隐藏和资源加载
 */

import { _decorator, Node, Prefab, instantiate, resources, director, assert, Vec3 } from 'cc';
import { EventTarget, EventCenter, GameEvent } from '../utils/EventTarget';

const { ccclass, property } = _decorator;

/**
 * UI层级
 */
export enum UILayer {
    BACKGROUND = 0,
    SCENE = 1,
    PANEL = 2,
    POPUP = 3,
    TIPS = 4,
    LOADING = 5
}

/**
 * UI配置
 */
interface UIConfig {
    prefab: string;
    layer: UILayer;
    cache: boolean;
    preload?: boolean;
}

/**
 * UI实例信息
 */
interface UIInstance {
    node: Node;
    config: UIConfig;
    isLoading: boolean;
}

/**
 * UI管理器
 */
@ccclass('UIManager')
export class UIManager {
    private static instance: UIManager | null = null;

    /** UI配置映射 */
    private uiConfigs: Map<string, UIConfig> = new Map();

    /** UI实例映射 */
    private uiInstances: Map<string, UIInstance> = new Map();

    /** 预制体缓存 */
    private prefabCache: Map<string, Prefab> = new Map();

    /** 层级容器 */
    private layerContainers: Map<UILayer, Node> = new Map();

    /** 事件目标 */
    private eventTarget: EventTarget = new EventTarget();

    /** Canvas节点 */
    private canvas: Node | null = null;

    /** 是否已初始化 */
    private initialized: boolean = false;

    /** 正在加载的UI数量 */
    private loadingCount: number = 0;

    private constructor() {
        this.registerDefaultUIs();
    }

    /**
     * 获取单例
     */
    static getInstance(): UIManager {
        if (!UIManager.instance) {
            UIManager.instance = new UIManager();
        }
        return UIManager.instance;
    }

    /**
     * 初始化UI管理器
     */
    init(canvas: Node): void {
        if (this.initialized) return;

        this.canvas = canvas;
        this._createLayerContainers();
        this._preloadUIs();
        this.initialized = true;

        console.log('UIManager initialized');
    }

    /**
     * 创建层级容器
     */
    private _createLayerContainers(): void {
        if (!this.canvas) return;

        const layerNames = ['Background', 'Scene', 'Panel', 'Popup', 'Tips', 'Loading'];

        layerNames.forEach((name, index) => {
            const layer = index as UILayer;
            const container = new Node(name);
            container.setParent(this.canvas);
            container.setSiblingIndex(index);

            // 设置为全屏
            // container.addComponent(UITransform);
            // container.addComponent(Widget);

            this.layerContainers.set(layer, container);
        });
    }

    /**
     * 预加载UI
     */
    private _preloadUIs(): void {
        this.uiConfigs.forEach((config, name) => {
            if (config.preload) {
                this._loadPrefab(config.prefab);
            }
        });
    }

    /**
     * 注册默认UI配置
     */
    private registerDefaultUIs(): void {
        // 主菜单
        this.registerUI('main_menu', {
            prefab: 'prefabs/ui/MainMenu',
            layer: UILayer.SCENE,
            cache: true,
            preload: true
        });

        // 主城面板
        this.registerUI('town_panel', {
            prefab: 'prefabs/ui/TownPanel',
            layer: UILayer.SCENE,
            cache: true,
            preload: true
        });

        // 战斗面板
        this.registerUI('battle_panel', {
            prefab: 'prefabs/ui/BattlePanel',
            layer: UILayer.SCENE,
            cache: true,
            preload: true
        });

        // 编队面板
        this.registerUI('formation_panel', {
            prefab: 'prefabs/ui/FormationPanel',
            layer: UILayer.PANEL,
            cache: true
        });

        // 战斗结果面板
        this.registerUI('battle_result_panel', {
            prefab: 'prefabs/ui/BattleResultPanel',
            layer: UILayer.POPUP,
            cache: false
        });

        // 关卡面板
        this.registerUI('level_panel', {
            prefab: 'prefabs/ui/LevelPanel',
            layer: UILayer.PANEL,
            cache: true
        });

        // 商店面板
        this.registerUI('shop_panel', {
            prefab: 'prefabs/ui/ShopPanel',
            layer: UILayer.PANEL,
            cache: true
        });

        // 英雄面板
        this.registerUI('hero_panel', {
            prefab: 'prefabs/ui/HeroPanel',
            layer: UILayer.PANEL,
            cache: true
        });

        // 设置面板
        this.registerUI('settings_panel', {
            prefab: 'prefabs/ui/SettingsPanel',
            layer: UILayer.POPUP,
            cache: true,
            preload: true
        });

        // 提示对话框
        this.registerUI('alert_dialog', {
            prefab: 'prefabs/ui/AlertDialog',
            layer: UILayer.POPUP,
            cache: true
        });

        // 加载面板
        this.registerUI('loading_panel', {
            prefab: 'prefabs/ui/LoadingPanel',
            layer: UILayer.LOADING,
            cache: true,
            preload: true
        });

        // Toast提示
        this.registerUI('toast', {
            prefab: 'prefabs/ui/Toast',
            layer: UILayer.TIPS,
            cache: true
        });
    }

    /**
     * 注册UI
     */
    registerUI(name: string, config: UIConfig): void {
        this.uiConfigs.set(name, config);
    }

    /**
     * 加载预制体
     */
    private _loadPrefab(path: string): Promise<Prefab> {
        return new Promise((resolve, reject) => {
            // 检查缓存
            const cached = this.prefabCache.get(path);
            if (cached) {
                resolve(cached);
                return;
            }

            // 使用Cocos Creator的resources.load加载
            resources.load(path, Prefab, (err, prefab) => {
                if (err) {
                    console.error(`Failed to load prefab: ${path}`, err);
                    reject(err);
                    return;
                }

                this.prefabCache.set(path, prefab);
                resolve(prefab);
            });
        });
    }

    /**
     * 显示UI
     */
    async showUI(name: string, data?: any): Promise<Node | null> {
        const config = this.uiConfigs.get(name);
        if (!config) {
            console.error(`UI config not found: ${name}`);
            return null;
        }

        // 检查是否已有实例
        let instance = this.uiInstances.get(name);

        if (instance && instance.node) {
            // 已有实例，直接显示
            instance.node.active = true;
            this._callOnShow(instance.node, data);
            this.eventTarget.emit(`ui_show_${name}`, instance.node);
            return instance.node;
        }

        // 需要加载预制体
        this.loadingCount++;

        try {
            const prefab = await this._loadPrefab(config.prefab);
            const node = instantiate(prefab);

            // 添加到对应层级
            const container = this.layerContainers.get(config.layer);
            if (container) {
                node.setParent(container);
            } else if (this.canvas) {
                node.setParent(this.canvas);
            }

            // 存储实例
            instance = {
                node,
                config,
                isLoading: false
            };

            if (config.cache) {
                this.uiInstances.set(name, instance);
            }

            // 调用显示回调
            this._callOnShow(node, data);
            this.eventTarget.emit(`ui_show_${name}`, node);

            // 触发事件
            EventCenter.emit(GameEvent.UI_SHOW, { name, data });

            return node;

        } catch (err) {
            console.error(`Failed to show UI: ${name}`, err);
            return null;
        } finally {
            this.loadingCount--;
        }
    }

    /**
     * 隐藏UI
     */
    hideUI(name: string): void {
        const instance = this.uiInstances.get(name);
        if (instance && instance.node) {
            instance.node.active = false;
            this._callOnHide(instance.node);
            this.eventTarget.emit(`ui_hide_${name}`, instance.node);
            EventCenter.emit(GameEvent.UI_HIDE, { name });
        }
    }

    /**
     * 切换UI显示状态
     */
    toggleUI(name: string, data?: any): Promise<Node | null> {
        if (this.isUIShowing(name)) {
            this.hideUI(name);
            return Promise.resolve(null);
        } else {
            return this.showUI(name, data);
        }
    }

    /**
     * 销毁UI
     */
    destroyUI(name: string): void {
        const instance = this.uiInstances.get(name);
        if (instance && instance.node) {
            this._callOnDestroy(instance.node);
            instance.node.destroy();
            this.uiInstances.delete(name);
        }
    }

    /**
     * 获取UI实例
     */
    getUI<T extends Node = Node>(name: string): T | null {
        const instance = this.uiInstances.get(name);
        return instance ? instance.node as T : null;
    }

    /**
     * 检查UI是否显示中
     */
    isUIShowing(name: string): boolean {
        const instance = this.uiInstances.get(name);
        return instance ? instance.node.active : false;
    }

    /**
     * 隐藏指定层级的所有UI
     */
    hideLayer(layer: UILayer): void {
        this.uiInstances.forEach((instance, name) => {
            if (instance.config.layer === layer) {
                this.hideUI(name);
            }
        });
    }

    /**
     * 隐藏所有UI
     */
    hideAllUI(): void {
        this.uiInstances.forEach((instance, name) => {
            this.hideUI(name);
        });
    }

    /**
     * 显示Toast提示
     */
    showToast(message: string, duration: number = 2000): void {
        // 尝试显示Toast UI
        this.showUI('toast', { message, duration }).catch(() => {
            // 如果Toast UI不存在，使用控制台输出
            console.log(`[Toast] ${message}`);
        });
    }

    /**
     * 显示确认对话框
     */
    showConfirm(
        title: string,
        content: string,
        onConfirm: () => void,
        onCancel?: () => void
    ): void {
        this.showUI('alert_dialog', {
            title,
            content,
            type: 'confirm',
            onConfirm,
            onCancel
        }).catch(() => {
            // 如果对话框不存在，使用浏览器默认
            if (confirm(`${title}\n${content}`)) {
                onConfirm();
            } else if (onCancel) {
                onCancel();
            }
        });
    }

    /**
     * 显示加载中
     */
    showLoading(message: string = '加载中...'): void {
        this.showUI('loading_panel', { message });
    }

    /**
     * 隐藏加载中
     */
    hideLoading(): void {
        this.hideUI('loading_panel');
    }

    /**
     * 调用节点的onShow方法
     */
    private _callOnShow(node: Node, data?: any): void {
        // 获取所有组件
        const components = node.components;
        for (const comp of components) {
            if (comp && typeof (comp as any).onShow === 'function') {
                (comp as any).onShow(data);
            }
        }
    }

    /**
     * 调用节点的onHide方法
     */
    private _callOnHide(node: Node): void {
        const components = node.components;
        for (const comp of components) {
            if (comp && typeof (comp as any).onHide === 'function') {
                (comp as any).onHide();
            }
        }
    }

    /**
     * 调用节点的onDestroy方法
     */
    private _callOnDestroy(node: Node): void {
        const components = node.components;
        for (const comp of components) {
            if (comp && typeof (comp as any).onDestroy === 'function') {
                (comp as any).onDestroy();
            }
        }
    }

    /**
     * 监听UI事件
     */
    on(eventName: string, callback: Function): void {
        this.eventTarget.on(eventName, callback);
    }

    /**
     * 取消监听UI事件
     */
    off(eventName: string, callback: Function): void {
        this.eventTarget.off(eventName, callback);
    }

    /**
     * 清除预制体缓存
     */
    clearPrefabCache(): void {
        this.prefabCache.clear();
    }

    /**
     * 获取正在加载的数量
     */
    getLoadingCount(): number {
        return this.loadingCount;
    }

    /**
     * 销毁管理器
     */
    destroy(): void {
        this.uiInstances.forEach((instance, name) => {
            this.destroyUI(name);
        });
        this.uiInstances.clear();
        this.prefabCache.clear();
        this.layerContainers.clear();
        this.initialized = false;
        UIManager.instance = null;
    }
}

/**
 * UI基类
 * 所有UI面板组件的基类
 */
export abstract class UIBase {
    protected node: Node | null = null;
    protected data: any = null;

    /**
     * 初始化
     */
    init(node: Node): void {
        this.node = node;
    }

    /**
     * 显示时调用
     */
    onShow(data?: any): void {
        this.data = data;
    }

    /**
     * 隐藏时调用
     */
    onHide(): void {
        this.data = null;
    }

    /**
     * 销毁时调用
     */
    onDestroy(): void {
        this.node = null;
        this.data = null;
    }
}

// 导出UI管理器实例
export const uiManager = UIManager.getInstance();