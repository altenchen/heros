/**
 * AlertDialog - 提示对话框组件
 * 用于显示确认/警告/错误等类型的对话框
 */

import { _decorator, Node, Label, Button, Color } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { uiManager } from '../UIManager';

const { ccclass, property } = _decorator;

/**
 * 对话框类型
 */
export enum AlertDialogType {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CONFIRM = 'confirm'
}

/**
 * 对话框配置
 */
export interface AlertDialogConfig {
    type?: AlertDialogType;
    title?: string;
    content?: string;
    confirmText?: string;
    cancelText?: string;
    showCancel?: boolean;
    onConfirm?: () => void;
    onCancel?: () => void;
}

/**
 * AlertDialog组件
 */
@ccclass('AlertDialog')
export class AlertDialog extends UIPanel {
    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    contentLabel: Label | null = null;

    @property(Button)
    confirmBtn: Button | null = null;

    @property(Button)
    cancelBtn: Button | null = null;

    @property(Label)
    confirmLabel: Label | null = null;

    @property(Label)
    cancelLabel: Label | null = null;

    /** 对话框配置 */
    private _config: AlertDialogConfig | null = null;

    /**
     * 初始化
     */
    protected init(): void {
        super.init();
        this.setPanelConfig({
            layer: 3, // UILayer.DIALOG
            cache: false,
            animationType: PanelAnimationType.SCALE,
            animationDuration: 0.2,
            closeOnBackKey: true,
            blockInput: true
        });
    }

    /**
     * 显示对话框
     */
    show(data?: any): void {
        if (data) {
            this._config = data as AlertDialogConfig;
            this._setupDialog();
        }
        super.show(data);
    }

    /**
     * 设置对话框内容
     */
    private _setupDialog(): void {
        if (!this._config) return;

        // 设置标题
        if (this.titleLabel) {
            this.titleLabel.string = this._config.title || '提示';
        }

        // 设置内容
        if (this.contentLabel) {
            this.contentLabel.string = this._config.content || '';
        }

        // 设置确认按钮
        if (this.confirmLabel) {
            this.confirmLabel.string = this._config.confirmText || '确定';
        }

        // 设置取消按钮
        if (this.cancelBtn) {
            this.cancelBtn.node.active = this._config.showCancel ?? false;
        }
        if (this.cancelLabel && this._config.cancelText) {
            this.cancelLabel.string = this._config.cancelText;
        }

        // 根据类型设置颜色
        this._setupStyle();
    }

    /**
     * 根据类型设置样式
     */
    private _setupStyle(): void {
        if (!this._config) return;

        let titleColor = Color.WHITE;
        switch (this._config.type) {
            case AlertDialogType.WARNING:
                titleColor = new Color(255, 200, 0);
                break;
            case AlertDialogType.ERROR:
                titleColor = new Color(255, 80, 80);
                break;
            case AlertDialogType.CONFIRM:
                titleColor = new Color(100, 200, 255);
                break;
            default:
                titleColor = Color.WHITE;
                break;
        }

        if (this.titleLabel) {
            this.titleLabel.color = titleColor;
        }
    }

    /**
     * 确认按钮点击
     */
    onConfirmClick(): void {
        if (this._config?.onConfirm) {
            this._config.onConfirm();
        }
        this.hide();
    }

    /**
     * 取消按钮点击
     */
    onCancelClick(): void {
        if (this._config?.onCancel) {
            this._config.onCancel();
        }
        this.hide();
    }

    /**
     * 显示信息对话框
     */
    static showInfo(title: string, content: string, onConfirm?: () => void): void {
        uiManager.showUI('AlertDialog', {
            type: AlertDialogType.INFO,
            title,
            content,
            onConfirm
        });
    }

    /**
     * 显示警告对话框
     */
    static showWarning(title: string, content: string, onConfirm?: () => void): void {
        uiManager.showUI('AlertDialog', {
            type: AlertDialogType.WARNING,
            title,
            content,
            onConfirm
        });
    }

    /**
     * 显示错误对话框
     */
    static showError(title: string, content: string, onConfirm?: () => void): void {
        uiManager.showUI('AlertDialog', {
            type: AlertDialogType.ERROR,
            title,
            content,
            onConfirm
        });
    }

    /**
     * 显示确认对话框
     */
    static showConfirm(
        title: string,
        content: string,
        onConfirm?: () => void,
        onCancel?: () => void
    ): void {
        uiManager.showUI('AlertDialog', {
            type: AlertDialogType.CONFIRM,
            title,
            content,
            showCancel: true,
            onConfirm,
            onCancel
        });
    }
}