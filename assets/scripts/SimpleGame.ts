import { _decorator, Component, Label } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SimpleGame')
export class SimpleGame extends Component {
    @property(Label)
    titleLabel: Label | null = null;

    start(): void {
        console.log('游戏启动成功');
        if (this.titleLabel) {
            this.titleLabel.string = '英雄无敌Ⅲ：传承';
        }
    }
}
