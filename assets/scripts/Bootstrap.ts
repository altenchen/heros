/**
 * 游戏启动脚本
 * 挂载在场景中负责初始化游戏
 */

import { _decorator, Component, Node } from 'cc';
import { Game } from './Game';

const { ccclass, property } = _decorator;

@ccclass('Bootstrap')
export class Bootstrap extends Component {
    
    start() {
        console.log('=================================');
        console.log('  英雄无敌Ⅲ：传承');
        console.log('  Heroes of Might and Magic III');
        console.log('  Legacy Edition');
        console.log('=================================');
        
        // 初始化游戏
        this.initGame();
    }
    
    private async initGame(): Promise<void> {
        try {
            const game = Game.getInstance();
            await game.init();
            console.log('游戏启动成功！');
        } catch (error) {
            console.error('游戏启动失败:', error);
        }
    }
}