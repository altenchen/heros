/**
 * 主菜单组件
 * MVP简化版
 */

import { _decorator, Component, Node, Button, Label, director } from 'cc';
import { EventCenter, GameEvent } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

@ccclass('MainMenu')
export class MainMenu extends Component {

    @property(Button)
    startButton: Button | null = null;

    @property(Button)
    continueButton: Button | null = null;

    @property(Button)
    settingsButton: Button | null = null;

    @property(Button)
    exitButton: Button | null = null;

    @property(Label)
    versionLabel: Label | null = null;

    onLoad(): void {
        this.initUI();
    }

    /**
     * 初始化UI
     */
    private initUI(): void {
        // 设置版本号
        if (this.versionLabel) {
            this.versionLabel.string = 'v1.0.0-MVP';
        }

        // 绑定按钮事件
        if (this.startButton) {
            this.startButton.node.on(Button.EventType.CLICK, this.onStartClick, this);
        }

        if (this.continueButton) {
            this.continueButton.node.on(Button.EventType.CLICK, this.onContinueClick, this);
        }

        if (this.settingsButton) {
            this.settingsButton.node.on(Button.EventType.CLICK, this.onSettingsClick, this);
        }

        if (this.exitButton) {
            this.exitButton.node.on(Button.EventType.CLICK, this.onExitClick, this);
        }
    }

    /**
     * 开始按钮点击
     */
    private onStartClick(): void {
        console.log('点击开始游戏');
        // 直接加载战斗场景
        director.loadScene('Battle');
    }

    /**
     * 继续按钮点击
     */
    private onContinueClick(): void {
        console.log('点击继续游戏');
        // TODO: 显示存档选择面板
    }

    /**
     * 设置按钮点击
     */
    private onSettingsClick(): void {
        console.log('点击设置');
        // TODO: 显示设置面板
    }

    /**
     * 退出按钮点击
     */
    private onExitClick(): void {
        console.log('点击退出');
        // 微信小游戏无法退出，提示用户
        console.log('请在微信中手动关闭小游戏');
    }

    /**
     * 显示时调用
     */
    onShow(data?: any): void {
        console.log('主菜单显示', data);
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
        if (this.continueButton) {
            this.continueButton.node.off(Button.EventType.CLICK, this.onContinueClick, this);
        }
        if (this.settingsButton) {
            this.settingsButton.node.off(Button.EventType.CLICK, this.onSettingsClick, this);
        }
        if (this.exitButton) {
            this.exitButton.node.off(Button.EventType.CLICK, this.onExitClick, this);
        }
    }
}