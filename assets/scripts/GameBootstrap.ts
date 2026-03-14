/**
 * 游戏启动引导脚本
 * 挂载在场景中，负责初始化游戏
 */

import { _decorator, Component, Node, director, game as ccGame } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 游戏启动引导
 * 简化版，只负责场景跳转
 */
@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
    /**
     * 组件启动
     */
    start(): void {
        console.log('=== 英雄无敌Ⅲ：传承 ===');
        console.log('游戏启动中...');
        
        // 延迟初始化，确保引擎完全加载
        this.scheduleOnce(() => {
            this.initGame();
        }, 0.1);
    }

    /**
     * 初始化游戏
     */
    private async initGame(): Promise<void> {
        try {
            // 动态导入游戏主模块
            const { Game } = await import('./Game');
            const game = Game.getInstance();
            if (game) {
                await game.init();
                console.log('游戏初始化完成');
            }
        } catch (error) {
            console.error('游戏初始化失败:', error);
            // 即使失败也继续，不影响基本场景
        }
    }
}