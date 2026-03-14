/**
 * LoadingPanel - 加载界面组件
 * 用于显示加载进度和加载状态
 */

import { _decorator, Node, Label, ProgressBar, Sprite, tween, Vec3 } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';

const { ccclass, property } = _decorator;

/**
 * 加载状态
 */
export enum LoadingState {
    LOADING = 'loading',
    SUCCESS = 'success',
    FAILED = 'failed'
}

/**
 * 加载配置
 */
export interface LoadingConfig {
    text?: string;
    showProgress?: boolean;
    progress?: number;
    timeout?: number;
}

/**
 * LoadingPanel组件
 */
@ccclass('LoadingPanel')
export class LoadingPanel extends UIPanel {
    @property(Label)
    textLabel: Label | null = null;

    @property(ProgressBar)
    progressBar: ProgressBar | null = null;

    @property(Sprite)
    loadingIcon: Sprite | null = null;

    /** 加载状态 */
    private _loadingState: LoadingState = LoadingState.LOADING;

    /** 加载文本 */
    private _text: string = '加载中...';

    /** 当前进度 */
    private _progress: number = 0;

    /** 目标进度 */
    private _targetProgress: number = 0;

    /** 超时时间 */
    private _timeout: number = 30000;

    /** 超时计时器 */
    private _timeoutTimer: number = 0;

    /** 旋转计时器 */
    private _rotateTimer: number = 0;

    /**
     * 初始化
     */
    protected init(): void {
        super.init();
        this.setPanelConfig({
            layer: 4, // UILayer.TOP
            cache: true,
            animationType: PanelAnimationType.FADE,
            animationDuration: 0.2,
            closeOnBackKey: false,
            blockInput: true
        });
    }

    /**
     * 显示加载界面
     */
    show(data?: any): void {
        if (data) {
            const config = data as LoadingConfig;
            this._text = config.text || '加载中...';
            this._progress = config.progress || 0;
            this._timeout = config.timeout || 30000;

            if (this.textLabel) {
                this.textLabel.string = this._text;
            }

            if (this.progressBar) {
                this.progressBar.node.active = config.showProgress ?? true;
                this.progressBar.progress = this._progress;
            }
        }

        this._loadingState = LoadingState.LOADING;
        super.show(data);

        // 开始超时计时
        this._startTimeout();
    }

    /**
     * 更新进度
     */
    updateProgress(progress: number, text?: string): void {
        this._targetProgress = Math.min(1, Math.max(0, progress));

        if (text && this.textLabel) {
            this.textLabel.string = text;
        }

        // 平滑过渡进度
        if (this.progressBar) {
            tween({ progress: this._progress })
                .to(0.3, { progress: this._targetProgress }, {
                    onUpdate: (target: any) => {
                        if (this.progressBar) {
                            this.progressBar.progress = target.progress;
                        }
                    }
                })
                .start();
        }

        this._progress = this._targetProgress;
    }

    /**
     * 设置加载文本
     */
    setText(text: string): void {
        this._text = text;
        if (this.textLabel) {
            this.textLabel.string = text;
        }
    }

    /**
     * 设置状态
     */
    setState(state: LoadingState, text?: string): void {
        this._loadingState = state;

        switch (state) {
            case LoadingState.SUCCESS:
                this.setText(text || '加载完成');
                // 延迟隐藏
                this.scheduleOnce(() => {
                    this.hide();
                }, 0.5);
                break;

            case LoadingState.FAILED:
                this.setText(text || '加载失败');
                break;

            default:
                if (text) {
                    this.setText(text);
                }
                break;
        }
    }

    /**
     * 开始超时计时
     */
    private _startTimeout(): void {
        this._stopTimeout();
        this._timeoutTimer = setTimeout(() => {
            this.setState(LoadingState.FAILED, '加载超时');
        }, this._timeout) as unknown as number;
    }

    /**
     * 停止超时计时
     */
    private _stopTimeout(): void {
        if (this._timeoutTimer) {
            clearTimeout(this._timeoutTimer);
            this._timeoutTimer = 0;
        }
    }

    /**
     * 每帧更新
     */
    update(dt: number): void {
        // 旋转加载图标
        if (this.loadingIcon && this._loadingState === LoadingState.LOADING) {
            this.loadingIcon.node.angle += dt * 180;
        }
    }

    /**
     * 隐藏
     */
    hide(): void {
        this._stopTimeout();
        super.hide();
    }

    /**
     * 显示加载界面（静态方法）
     */
    static show(text?: string, showProgress: boolean = true): void {
        uiManager.showUI('LoadingPanel', {
            text: text || '加载中...',
            showProgress
        });
    }

    /**
     * 隐藏加载界面（静态方法）
     */
    static hide(): void {
        uiManager.hideUI('LoadingPanel');
    }

    /**
     * 更新进度（静态方法）
     */
    static setProgress(progress: number, text?: string): void {
        const node = uiManager.getUI('LoadingPanel');
        if (node) {
            const panel = node.getComponent(LoadingPanel);
            if (panel) {
                panel.updateProgress(progress, text);
            }
        }
    }
}

// 导入uiManager
import { uiManager } from '../UIManager';