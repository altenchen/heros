/**
 * 游戏启动引导脚本（简化版）
 * 仅显示游戏标题
 */

import { _decorator, Component, Node } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('GameBootstrap')
export class GameBootstrap extends Component {
    
    start(): void {
        console.log('=== 英雄无敌Ⅲ：传承 ===');
        console.log('游戏启动成功！');
    }
}