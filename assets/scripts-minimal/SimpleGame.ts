/**
 * 最小化游戏启动脚本
 * 用于独立启动，不依赖其他复杂模块
 */

import { _decorator, Component, Node, Label, tween, Vec3 } from 'cc';

const { ccclass, property } = _decorator;

@ccclass('SimpleGame')
export class SimpleGame extends Component {
    
    @property(Label)
    titleLabel: Label | null = null;

    start(): void {
        console.log('=================================');
        console.log('  英雄无敌Ⅲ：传承');
        console.log('  Heroes of Might and Magic III');
        console.log('  Legacy Edition');
        console.log('=================================');
        
        // 标题动画
        if (this.titleLabel) {
            this.titleLabel.string = '英雄无敌Ⅲ：传承';
            tween(this.titleLabel.node)
                .by(2, { scale: new Vec3(0.1, 0.1, 0) })
                .by(2, { scale: new Vec3(-0.1, -0.1, 0) })
                .repeatForever()
                .start();
        }
    }
}