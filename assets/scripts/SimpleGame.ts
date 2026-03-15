/**
 * 最小化游戏启动脚本
 */

import { _decorator, Component, Node, Label, director } from 'cc';

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

        if (this.titleLabel) {
            this.titleLabel.string = '英雄无敌Ⅲ：传承';
        }

        // 加载主菜单场景
        this.scheduleOnce(() => {
            director.loadScene('MainMenu');
        }, 0.5);
    }
}