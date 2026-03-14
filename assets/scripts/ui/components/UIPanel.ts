/**
 * UI面板基类
 * 所有UI面板的基础类，提供面板级别的管理功能
 */

import { _decorator, Node, Prefab, instantiate, Vec3, UITransform, Widget, tween, UIOpacity } from 'cc';
import { UIComponent, UIComponentState } from './UIComponent';
import { UILayer } from '../UIManager';
import { EventCenter, GameEvent } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/**
 * 面板动画类型
 */
export enum PanelAnimationType {
    NONE = 'none',           // 无动画
    FADE = 'fade',           // 淡入淡出
    SCALE = 'scale',         // 缩放
    SLIDE_LEFT = 'slide_left',   // 左滑
    SLIDE_RIGHT = 'slide_right', // 右滑
    SLIDE_UP = 'slide_up',       // 上滑
    SLIDE_DOWN = 'slide_down'    // 下滑
}

/**
 * 面板配置
 */
export interface PanelConfig {
    layer: UILayer;
    cache: boolean;
    animationType: PanelAnimationType;
    animationDuration: number;
    closeOnBackKey: boolean;
    blockInput: boolean;
}

/**
 * 默认面板配置
 */
const DEFAULT_PANEL_CONFIG: PanelConfig = {
    layer: UILayer.PANEL,
    cache: true,
    animationType: PanelAnimationType.FADE,
    animationDuration: 0.3,
    closeOnBackKey: true,
    blockInput: false
};

/**
 * UI面板基类
 */
@ccclass('UIPanel')
export class UIPanel extends UIComponent {
    /** 面板配置 */
    protected _panelConfig: PanelConfig = { ...DEFAULT_PANEL_CONFIG };

    /** 背景遮罩节点 */
    protected _maskNode: Node | null = null;

    /** 内容节点 */
    protected _contentNode: Node | null = null;

    /** 是否正在播放动画 */
    protected _isAnimating: boolean = false;

    /** 面板层级 */
    protected _layer: UILayer = UILayer.PANEL;

    /** 是否缓存 */
    protected _cache: boolean = true;

    /**
     * 获取面板配置
     */
    get panelConfig(): PanelConfig {
        return this._panelConfig;
    }

    /**
     * 获取面板层级
     */
    get layer(): UILayer {
        return this._layer;
    }

    /**
     * 是否缓存
     */
    get isCache(): boolean {
        return this._cache;
    }

    /**
     * 初始化
     */
    protected init(): void {
        super.init();
        this._setupPanel();
    }

    /**
     * 设置面板
     */
    protected _setupPanel(): void {
        // 添加Widget组件实现自适应
        let widget = this.node.getComponent(Widget);
        if (!widget) {
            widget = this.node.addComponent(Widget);
        }

        // 设置为全屏适配
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;
        widget.top = 0;
        widget.bottom = 0;
        widget.left = 0;
        widget.right = 0;

        // 添加UITransform
        let transform = this.node.getComponent(UITransform);
        if (!transform) {
            transform = this.node.addComponent(UITransform);
        }

        // 添加UIOpacity用于动画
        let opacity = this.node.getComponent(UIOpacity);
        if (!opacity) {
            opacity = this.node.addComponent(UIOpacity);
        }
    }

    /**
     * 设置面板配置
     */
    setPanelConfig(config: Partial<PanelConfig>): void {
        this._panelConfig = { ...this._panelConfig, ...config };
        this._layer = this._panelConfig.layer;
        this._cache = this._panelConfig.cache;
    }

    /**
     * 显示面板
     */
    show(data?: any): void {
        super.show(data);

        // 播放显示动画
        if (this._panelConfig.animationType !== PanelAnimationType.NONE) {
            this._playShowAnimation();
        }
    }

    /**
     * 隐藏面板
     */
    hide(): void {
        if (this._isAnimating) {
            return;
        }

        // 播放隐藏动画
        if (this._panelConfig.animationType !== PanelAnimationType.NONE) {
            this._playHideAnimation(() => {
                super.hide();
            });
        } else {
            super.hide();
        }
    }

    /**
     * 播放显示动画
     */
    protected _playShowAnimation(): void {
        this._isAnimating = true;
        const duration = this._panelConfig.animationDuration;
        const opacity = this.node.getComponent(UIOpacity);

        switch (this._panelConfig.animationType) {
            case PanelAnimationType.FADE:
                if (opacity) {
                    opacity.opacity = 0;
                    tween(opacity)
                        .to(duration, { opacity: 255 })
                        .call(() => { this._isAnimating = false; })
                        .start();
                }
                break;

            case PanelAnimationType.SCALE:
                this.node.setScale(new Vec3(0.8, 0.8, 1));
                tween(this.node)
                    .to(duration, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                    .call(() => { this._isAnimating = false; })
                    .start();
                break;

            case PanelAnimationType.SLIDE_LEFT:
                if (opacity) opacity.opacity = 255;
                this.node.setPosition(new Vec3(960, 0, 0));
                tween(this.node)
                    .to(duration, { position: new Vec3(0, 0, 0) }, { easing: 'sineOut' })
                    .call(() => { this._isAnimating = false; })
                    .start();
                break;

            case PanelAnimationType.SLIDE_RIGHT:
                if (opacity) opacity.opacity = 255;
                this.node.setPosition(new Vec3(-960, 0, 0));
                tween(this.node)
                    .to(duration, { position: new Vec3(0, 0, 0) }, { easing: 'sineOut' })
                    .call(() => { this._isAnimating = false; })
                    .start();
                break;

            default:
                this._isAnimating = false;
                break;
        }
    }

    /**
     * 播放隐藏动画
     */
    protected _playHideAnimation(callback: () => void): void {
        const duration = this._panelConfig.animationDuration;
        const opacity = this.node.getComponent(UIOpacity);

        switch (this._panelConfig.animationType) {
            case PanelAnimationType.FADE:
                if (opacity) {
                    tween(opacity)
                        .to(duration, { opacity: 0 })
                        .call(() => {
                            this._isAnimating = false;
                            callback();
                        })
                        .start();
                }
                break;

            case PanelAnimationType.SCALE:
                tween(this.node)
                    .to(duration, { scale: new Vec3(0.8, 0.8, 1) }, { easing: 'backIn' })
                    .call(() => {
                        this._isAnimating = false;
                        callback();
                    })
                    .start();
                break;

            case PanelAnimationType.SLIDE_LEFT:
                tween(this.node)
                    .to(duration, { position: new Vec3(-960, 0, 0) }, { easing: 'sineIn' })
                    .call(() => {
                        this._isAnimating = false;
                        callback();
                    })
                    .start();
                break;

            case PanelAnimationType.SLIDE_RIGHT:
                tween(this.node)
                    .to(duration, { position: new Vec3(960, 0, 0) }, { easing: 'sineIn' })
                    .call(() => {
                        this._isAnimating = false;
                        callback();
                    })
                    .start();
                break;

            default:
                this._isAnimating = false;
                callback();
                break;
        }
    }

    /**
     * 创建背景遮罩
     */
    protected _createMask(opacity: number = 150): Node {
        if (this._maskNode) {
            return this._maskNode;
        }

        this._maskNode = new Node('Mask');
        this._maskNode.setParent(this.node);
        this._maskNode.setSiblingIndex(0);

        const transform = this._maskNode.addComponent(UITransform);
        transform.setContentSize(960, 640);

        const widget = this._maskNode.addComponent(Widget);
        widget.isAlignTop = true;
        widget.isAlignBottom = true;
        widget.isAlignLeft = true;
        widget.isAlignRight = true;

        const uiOpacity = this._maskNode.addComponent(UIOpacity);
        uiOpacity.opacity = opacity;

        // 添加点击阻止事件
        this._maskNode.on(Node.EventType.TOUCH_START, () => {
            if (this._panelConfig.blockInput) {
                // 阻止事件穿透
            }
        });

        return this._maskNode;
    }

    /**
     * 子类重写：显示回调
     */
    protected onShow(data?: any): void {
        // 触发UI显示事件
        EventCenter.emit(GameEvent.UI_SHOW, { panelName: this.node.name, data });
    }

    /**
     * 子类重写：隐藏回调
     */
    protected onHide(): void {
        // 触发UI隐藏事件
        EventCenter.emit(GameEvent.UI_HIDE, { panelName: this.node.name });
    }

    /**
     * 关闭面板（从UIManager移除）
     */
    close(): void {
        // 子类可重写此方法实现自定义关闭逻辑
        this.hide();
    }

    /**
     * 销毁面板
     */
    onDestroy(): void {
        this._maskNode = null;
        this._contentNode = null;
    }
}