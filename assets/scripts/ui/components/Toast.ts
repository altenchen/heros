/**
 * Toast 提示组件
 * 显示简短的消息提示，自动消失
 */

import { _decorator, Node, Label, tween, Vec3, UIOpacity } from 'cc';
import { UIComponent } from './UIComponent';

const { ccclass, property } = _decorator;

/**
 * Toast 配置
 */
export interface ToastData {
    /** 消息内容 */
    message: string;
    /** 显示时长（毫秒） */
    duration?: number;
}

/**
 * Toast 提示组件
 */
@ccclass('Toast')
export class Toast extends UIComponent {
    /** 消息标签 */
    @property(Label)
    messageLabel: Label | null = null;

    /** 默认显示时长 */
    private defaultDuration: number = 2000;

    /** 当前动画 */
    private currentTween: any = null;

    /**
     * 显示回调
     */
    protected onShow(data?: ToastData): void {
        super.onShow(data);

        if (!data || !data.message) {
            this.hide();
            return;
        }

        // 设置消息
        if (this.messageLabel) {
            this.messageLabel.string = data.message;
        }

        // 获取显示时长
        const duration = data.duration || this.defaultDuration;

        // 显示动画
        this._showAnimation(duration);
    }

    /**
     * 显示动画
     */
    private _showAnimation(duration: number): void {
        // 停止之前的动画
        if (this.currentTween) {
            this.currentTween.stop();
        }

        // 初始状态
        this.node.setScale(new Vec3(0.8, 0.8, 1));

        // 获取或添加透明度组件
        let opacity = this.node.getComponent(UIOpacity);
        if (!opacity) {
            opacity = this.node.addComponent(UIOpacity);
        }
        opacity.opacity = 0;

        // 动画序列
        this.currentTween = tween(this.node)
            .to(0.2, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .call(() => {
                // 修改透明度
                opacity!.opacity = 255;
            })
            .delay(duration / 1000)
            .to(0.3, {}, {
                onUpdate: (target, ratio) => {
                    opacity!.opacity = 255 * (1 - ratio);
                }
            })
            .call(() => {
                this.hide();
            })
            .start();
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();

        // 停止动画
        if (this.currentTween) {
            this.currentTween.stop();
            this.currentTween = null;
        }
    }

    /**
     * 销毁回调
     */
    onDestroy(): void {
        if (this.currentTween) {
            this.currentTween.stop();
            this.currentTween = null;
        }
    }
}