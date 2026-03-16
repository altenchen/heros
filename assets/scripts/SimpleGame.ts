/**
 * 最小化游戏启动脚本
 */

import { _decorator, Component } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SimpleGame')
export class SimpleGame extends Component {

    start(): void {
        console.log('SimpleGame started');
    }
}