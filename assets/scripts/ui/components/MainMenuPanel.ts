/**
 * 主菜单面板组件
 * MVP简化版
 */

import { _decorator, Component, Node, Button, Label, tween, Vec3 } from 'cc';
import { EventCenter, GameEvent } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

@ccclass('MainMenuPanel')
export class MainMenuPanel extends Component {

    @property(Label)
    titleLabel: Label | null = null;

    @property(Button)
    startButton: Button | null = null;

    @property(Button)
    settingsButton: Button | null = null;

    @property(Label)
    versionLabel: Label | null = null;

    onLoad(): void {
        this.initUI();
    }

    start(): void {
        // 播放入场动画
        this.playEnterAnimation();
    }

    /**
     * 初始化UI
     */
    private initUI(): void {
        // 设置标题
        if (this.titleLabel) {
            this.titleLabel.string = '英雄无敌Ⅲ：传承';
        }

        // 设置版本号
        if (this.versionLabel) {
            this.versionLabel.string = 'v1.0.0 MVP';
        }

        // 绑定按钮事件
        if (this.startButton) {
            this.startButton.node.on(Button.EventType.CLICK, this.onStartClick, this);
        }

        if (this.settingsButton) {
            this.settingsButton.node.on(Button.EventType.CLICK, this.onSettingsClick, this);
        }
    }

    /**
     * 播放入场动画
     */
    private playEnterAnimation(): void {
        if (this.titleLabel) {
            this.titleLabel.node.setScale(new Vec3(0.5, 0.5, 1));
            tween(this.titleLabel.node)
                .to(0.5, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
                .start();
        }
    }

    /**
     * 开始按钮点击
     */
    private onStartClick(): void {
        console.log('点击开始游戏');

        // 触发开始游戏事件
        EventCenter.emit(GameEvent.GAME_START);
    }

    /**
     * 设置按钮点击
     */
    private onSettingsClick(): void {
        console.log('点击设置');

        // TODO: 显示设置面板
    }

    /**
     * 显示时调用
     */
    onShow(): void {
        console.log('主菜单显示');
    }

    /**
     * 隐藏时调用
     */
    onHide(): void {
        console.log('主菜单隐藏');
    }

    /**
     * 销毁时清理
     */
    onDestroy(): void {
        if (this.startButton) {
            this.startButton.node.off(Button.EventType.CLICK, this.onStartClick, this);
        }
        if (this.settingsButton) {
            this.settingsButton.node.off(Button.EventType.CLICK, this.onSettingsClick, this);
        }
    }
}