/**
 * 主菜单面板
 * 游戏主界面，包含开始游戏、设置等按钮
 */

import { _decorator, Node, Label, Sprite, SpriteFrame, Vec3, tween } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { Game, GameState } from '../../Game';
import { UIManager } from '../UIManager';
import { EventCenter, GameEvent } from '../../utils/EventTarget';
import { Faction } from '../../config/GameTypes';

const { ccclass, property } = _decorator;

/**
 * 主菜单面板
 */
@ccclass('MainMenuPanel')
export class MainMenuPanel extends UIPanel {
    /** 开始游戏按钮 */
    @property(Node)
    startButton: Node | null = null;

    /** 继续游戏按钮 */
    @property(Node)
    continueButton: Node | null = null;

    /** 设置按钮 */
    @property(Node)
    settingsButton: Node | null = null;

    /** 关于按钮 */
    @property(Node)
    aboutButton: Node | null = null;

    /** 退出按钮 */
    @property(Node)
    exitButton: Node | null = null;

    /** 游戏标题节点 */
    @property(Node)
    titleNode: Node | null = null;

    /** 版本号标签 */
    @property(Label)
    versionLabel: Label | null = null;

    /** 游戏实例 */
    private _game: Game = Game.getInstance();

    /** UI管理器 */
    private _uiManager: UIManager = UIManager.getInstance();

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        // 设置面板配置
        this.setPanelConfig({
            layer: 1, // UILayer.SCENE
            cache: true,
            animationType: PanelAnimationType.FADE,
            animationDuration: 0.5
        });
    }

    /**
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);
        this._setupButtons();
        this._updateVersionLabel();
        this._playTitleAnimation();
        this._checkContinueGame();
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        // 开始游戏按钮
        if (this.startButton) {
            const btn = this.startButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onStartGame.bind(this));
            } else {
                this.startButton.on(Node.EventType.TOUCH_END, this._onStartGame, this);
            }
        }

        // 继续游戏按钮
        if (this.continueButton) {
            const btn = this.continueButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onContinueGame.bind(this));
            } else {
                this.continueButton.on(Node.EventType.TOUCH_END, this._onContinueGame, this);
            }
        }

        // 设置按钮
        if (this.settingsButton) {
            const btn = this.settingsButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onSettings.bind(this));
            } else {
                this.settingsButton.on(Node.EventType.TOUCH_END, this._onSettings, this);
            }
        }

        // 关于按钮
        if (this.aboutButton) {
            const btn = this.aboutButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onAbout.bind(this));
            } else {
                this.aboutButton.on(Node.EventType.TOUCH_END, this._onAbout, this);
            }
        }

        // 退出按钮
        if (this.exitButton) {
            const btn = this.exitButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onExit.bind(this));
            } else {
                this.exitButton.on(Node.EventType.TOUCH_END, this._onExit, this);
            }
        }
    }

    /**
     * 更新版本号
     */
    private _updateVersionLabel(): void {
        if (this.versionLabel) {
            this.versionLabel.string = 'v1.0.0';
        }
    }

    /**
     * 播放标题动画
     */
    private _playTitleAnimation(): void {
        if (this.titleNode) {
            // 呼吸效果
            tween(this.titleNode)
                .to(1.5, { scale: new Vec3(1.05, 1.05, 1) })
                .to(1.5, { scale: new Vec3(1, 1, 1) })
                .union()
                .repeatForever()
                .start();
        }
    }

    /**
     * 检查是否有存档可以继续
     */
    private _checkContinueGame(): void {
        const hasSave = localStorage.getItem('hmm_legacy_player');
        if (this.continueButton) {
            this.continueButton.active = !!hasSave;
        }
    }

    /**
     * 开始游戏
     */
    private _onStartGame(): void {
        // 显示阵营选择
        this._uiManager.showConfirm(
            '选择阵营',
            '请选择您的阵营',
            () => this._selectFaction(Faction.LIGHT),
            () => this._selectFaction(Faction.DARK)
        );
    }

    /**
     * 选择阵营
     */
    private _selectFaction(faction: Faction): void {
        // 创建新游戏
        this._game.createNewGame('玩家', faction);

        // 进入主城
        this._enterTown();
    }

    /**
     * 继续游戏
     */
    private _onContinueGame(): void {
        // 加载存档
        this._game.init().then(() => {
            this._enterTown();
        });
    }

    /**
     * 进入主城
     */
    private _enterTown(): void {
        this.hide();
        this._game.enterTown();

        // 显示主城面板
        this._uiManager.showUI('town_panel');
    }

    /**
     * 打开设置
     */
    private _onSettings(): void {
        this._uiManager.showUI('settings_panel');
    }

    /**
     * 打开关于
     */
    private _onAbout(): void {
        this._uiManager.showConfirm(
            '关于游戏',
            '英雄无敌Ⅲ：传承\n\n回合制战棋放置微信小游戏\n\n版本: 1.0.0\n开发: HMM Legacy Team',
            () => {}
        );
    }

    /**
     * 退出游戏
     */
    private _onExit(): void {
        this._uiManager.showConfirm(
            '退出游戏',
            '确定要退出游戏吗？',
            () => {
                // 保存游戏
                this._game.saveGame();

                // 微信小游戏环境下无法真正退出
                // 可以返回主菜单
                console.log('游戏已退出');
            }
        );
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();

        // 停止标题动画
        if (this.titleNode) {
            tween(this.titleNode).stop();
        }
    }
}