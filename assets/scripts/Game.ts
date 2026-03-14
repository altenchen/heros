/**
 * 游戏主入口 - 最小化版本
 */

import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

/**
 * 游戏主类
 */
@ccclass('Game')
export class Game extends Component {
    private static _instance: Game | null = null;

    public static getInstance(): Game {
        return Game._instance!;
    }

    onLoad(): void {
        if (Game._instance) {
            this.destroy();
            return;
        }
        Game._instance = this;
        console.log('=== 英雄无敌Ⅲ：传承 ===');
        console.log('游戏初始化...');
    }

    start(): void {
        console.log('游戏启动成功！');
    }

    public async init(): Promise<void> {
        console.log('游戏系统初始化完成');
    }
}