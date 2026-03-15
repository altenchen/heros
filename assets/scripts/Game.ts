/**
 * 游戏主入口
 * MVP简化版
 */

import { _decorator, Component, Node, director, find } from 'cc';
import { UIManager, uiManager } from './ui/UIManager';
import { PlayerDataManager, playerDataManager } from './utils/PlayerDataManager';
import { HeroManager, heroManager } from './hero/HeroManager';
import { EventCenter, GameEvent } from './utils/EventTarget';

const { ccclass, property } = _decorator;

/**
 * 游戏主类
 */
@ccclass('Game')
export class Game extends Component {

    start(): void {
        console.log('=================================');
        console.log('  英雄无敌Ⅲ：传承');
        console.log('  Heroes of Might and Magic III');
        console.log('  Legacy Edition - MVP');
        console.log('=================================');

        this.initGame();
    }

    /**
     * 初始化游戏
     */
    private initGame(): void {
        // 初始化UI管理器
        const canvas = find('Canvas');
        if (canvas) {
            uiManager.init(canvas);
        }

        // 加载玩家数据
        const playerData = playerDataManager.getPlayerData();
        if (!playerData) {
            // 创建新玩家
            playerDataManager.createNewPlayer('player_001', '勇士');
            console.log('创建新玩家数据');
        } else {
            console.log('加载玩家数据:', playerData.name);
        }

        // 监听游戏事件
        this.setupEventListeners();

        // 显示主菜单
        this.showMainMenu();
    }

    /**
     * 设置事件监听
     */
    private setupEventListeners(): void {
        // 监听开始游戏事件
        EventCenter.on(GameEvent.GAME_START, this.onStartGame, this);

        // 监听返回主菜单事件
        EventCenter.on(GameEvent.BACK_TO_MENU, this.onBackToMenu, this);
    }

    /**
     * 显示主菜单
     */
    private showMainMenu(): void {
        uiManager.showUI('main_menu').then(() => {
            console.log('主菜单显示成功');
        }).catch((err) => {
            console.error('主菜单显示失败:', err);
        });
    }

    /**
     * 开始游戏
     */
    private onStartGame(): void {
        console.log('开始游戏');

        // 隐藏主菜单
        uiManager.hideUI('main_menu');

        // 加载战斗场景
        director.loadScene('Battle', (err) => {
            if (err) {
                console.error('加载战斗场景失败:', err);
                return;
            }
            console.log('战斗场景加载成功');
        });
    }

    /**
     * 返回主菜单
     */
    private onBackToMenu(): void {
        console.log('返回主菜单');

        // 加载主菜单场景
        director.loadScene('MainMenu', (err) => {
            if (err) {
                console.error('加载主菜单场景失败:', err);
                return;
            }
            console.log('主菜单场景加载成功');
        });
    }

    /**
     * 游戏暂停
     */
    onPause(): void {
        console.log('游戏暂停');
    }

    /**
     * 游戏恢复
     */
    onResume(): void {
        console.log('游戏恢复');
    }

    /**
     * 游戏退出
     */
    onDestroy(): void {
        // 保存玩家数据
        const playerData = playerDataManager.getPlayerData();
        if (playerData) {
            console.log('游戏退出，保存数据');
        }

        // 清理事件监听
        EventCenter.off(GameEvent.GAME_START, this.onStartGame, this);
        EventCenter.off(GameEvent.BACK_TO_MENU, this.onBackToMenu, this);
    }
}