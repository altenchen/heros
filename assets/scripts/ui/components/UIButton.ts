/**
 * UI按钮组件扩展
 * 提供按钮的高级功能：点击效果、音效、冷却等
 */

import { _decorator, Component, Node, Button, Color, Sprite, Label, UIOpacity, tween, Vec3 } from 'cc';
import { UIComponent } from './UIComponent';
import { SoundManager } from '../../audio/SoundManager';

const { ccclass, property } = _decorator;

/**
 * 按钮状态
 */
export enum UIButtonState {
    NORMAL = 'normal',
    PRESSED = 'pressed',
    HOVER = 'hover',
    DISABLED = 'disabled'
}

/**
 * 按钮配置
 */
export interface UIButtonConfig {
    /** 点击缩放 */
    scaleEffect: boolean;
    /** 缩放值 */
    scaleValue: number;
    /** 动画时长 */
    duration: number;
    /** 播放音效 */
    playSound: boolean;
    /** 音效名 */
    soundName: string;
    /** 冷却时间（秒） */
    cooldown: number;
    /** 点击回调 */
    onClick: ((data?: any) => void) | null;
    /** 点击数据 */
    clickData: any;
}

/**
 * 默认按钮配置
 */
const DEFAULT_BUTTON_CONFIG: UIButtonConfig = {
    scaleEffect: true,
    scaleValue: 0.95,
    duration: 0.1,
    playSound: true,
    soundName: 'button_click',
    cooldown: 0,
    onClick: null,
    clickData: null
};

/**
 * UI按钮组件
 */
@ccclass('UIButton')
export class UIButton extends UIComponent {
    /** 按钮组件 */
    @property(Button)
    button: Button | null = null;

    /** 标签组件 */
    @property(Label)
    label: Label | null = null;

    /** 图标组件 */
    @property(Sprite)
    icon: Sprite | null = null;

    /** 配置 */
    protected _buttonConfig: UIButtonConfig = { ...DEFAULT_BUTTON_CONFIG };

    /** 当前状态 */
    protected _buttonState: UIButtonState = UIButtonState.NORMAL;

    /** 是否在冷却中 */
    protected _isCoolingDown: boolean = false;

    /** 冷却剩余时间 */
    protected _cooldownRemaining: number = 0;

    /** 原始缩放 */
    protected _originalScale: Vec3 = new Vec3(1, 1, 1);

    /** 禁用时的颜色 */
    protected _disabledColor: Color = new Color(128, 128, 128, 255);

    /** 正常时的颜色 */
    protected _normalColor: Color = new Color(255, 255, 255, 255);

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        // 获取或添加Button组件
        if (!this.button) {
            this.button = this.node.getComponent(Button);
        }

        if (this.button) {
            this._originalScale = this.node.scale.clone();
            this._setupButtonEvents();
        }
    }

    /**
     * 设置按钮事件
     */
    protected _setupButtonEvents(): void {
        this.node.on(Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
    }

    /**
     * 设置按钮配置
     */
    setConfig(config: Partial<UIButtonConfig>): void {
        this._buttonConfig = { ...this._buttonConfig, ...config };
    }

    /**
     * 设置点击回调
     */
    setOnClick(callback: (data?: any) => void, data?: any): void {
        this._buttonConfig.onClick = callback;
        if (data !== undefined) {
            this._buttonConfig.clickData = data;
        }
    }

    /**
     * 设置按钮文本
     */
    setText(text: string): void {
        if (this.label) {
            this.label.string = text;
        }
    }

    /**
     * 设置图标
     */
    setIcon(spriteFrame: any): void {
        if (this.icon) {
            this.icon.spriteFrame = spriteFrame;
        }
    }

    /**
     * 设置启用状态
     */
    setEnabled(enabled: boolean): void {
        if (this.button) {
            this.button.interactable = enabled;
        }

        this._buttonState = enabled ? UIButtonState.NORMAL : UIButtonState.DISABLED;

        // 更新外观
        if (this.icon) {
            this.icon.color = enabled ? this._normalColor : this._disabledColor;
        }
        if (this.label) {
            this.label.color = enabled ? this._normalColor : this._disabledColor;
        }
    }

    /**
     * 检查是否启用
     */
    isEnabled(): boolean {
        return this.button ? this.button.interactable : false;
    }

    /**
     * 触摸开始
     */
    protected _onTouchStart(): void {
        if (!this.isEnabled() || this._isCoolingDown) {
            return;
        }

        this._buttonState = UIButtonState.PRESSED;

        // 缩放效果
        if (this._buttonConfig.scaleEffect) {
            tween(this.node)
                .to(this._buttonConfig.duration, {
                    scale: new Vec3(
                        this._originalScale.x * this._buttonConfig.scaleValue,
                        this._originalScale.y * this._buttonConfig.scaleValue,
                        this._originalScale.z
                    )
                })
                .start();
        }
    }

    /**
     * 触摸结束
     */
    protected _onTouchEnd(): void {
        if (!this.isEnabled() || this._isCoolingDown) {
            return;
        }

        this._buttonState = UIButtonState.NORMAL;

        // 恢复缩放
        if (this._buttonConfig.scaleEffect) {
            tween(this.node)
                .to(this._buttonConfig.duration, {
                    scale: this._originalScale
                })
                .start();
        }

        // 触发点击
        this._triggerClick();
    }

    /**
     * 触摸取消
     */
    protected _onTouchCancel(): void {
        if (!this.isEnabled()) {
            return;
        }

        this._buttonState = UIButtonState.NORMAL;

        // 恢复缩放
        if (this._buttonConfig.scaleEffect) {
            tween(this.node)
                .to(this._buttonConfig.duration, {
                    scale: this._originalScale
                })
                .start();
        }
    }

    /**
     * 触发点击
     */
    protected _triggerClick(): void {
        // 播放音效
        if (this._buttonConfig.playSound) {
            const soundName = this._buttonConfig.soundName || 'click';
            SoundManager.getInstance().playUISound(soundName);
        }

        // 冷却处理
        if (this._buttonConfig.cooldown > 0) {
            this._startCooldown();
        }

        // 回调
        if (this._buttonConfig.onClick) {
            this._buttonConfig.onClick(this._buttonConfig.clickData);
        }
    }

    /**
     * 开始冷却
     */
    protected _startCooldown(): void {
        this._isCoolingDown = true;
        this._cooldownRemaining = this._buttonConfig.cooldown;
        this.setEnabled(false);

        // 使用update进行冷却
        this.schedule(this._updateCooldown, 0.1);
    }

    /**
     * 更新冷却
     */
    protected _updateCooldown(dt: number): void {
        this._cooldownRemaining -= dt;
        if (this._cooldownRemaining <= 0) {
            this._isCoolingDown = false;
            this._cooldownRemaining = 0;
            this.setEnabled(true);
            this.unschedule(this._updateCooldown);
        }
    }

    /**
     * 模拟点击（程序触发）
     */
    simulateClick(): void {
        if (this.isEnabled() && !this._isCoolingDown) {
            this._triggerClick();
        }
    }

    /**
     * 获取按钮状态
     */
    getState(): UIButtonState {
        return this._buttonState;
    }

    /**
     * 是否在冷却中
     */
    isCoolingDown(): boolean {
        return this._isCoolingDown;
    }

    /**
     * 获取冷却剩余时间
     */
    getCooldownRemaining(): number {
        return this._cooldownRemaining;
    }

    /**
     * 销毁
     */
    protected onDestroy(): void {
        this.node.off(Node.EventType.TOUCH_START, this._onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_END, this._onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this._onTouchCancel, this);
        this.unschedule(this._updateCooldown);
    }
}