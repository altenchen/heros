/**
 * 战斗场景脚本
 * MVP简化版 - 负责初始化战斗场景和加载战斗面板
 */

import { _decorator, Component, Node, find } from 'cc';
import { UIManager, uiManager } from './ui/UIManager';

const { ccclass, property } = _decorator;

@ccclass('BattleScene')
export class BattleScene extends Component {

    onLoad(): void {
        console.log('战斗场景加载');

        // 初始化UI管理器
        const canvas = find('Canvas');
        if (canvas) {
            uiManager.init(canvas);
        }

        // 显示战斗面板
        this.showBattlePanel();
    }

    /**
     * 显示战斗面板
     */
    private showBattlePanel(): void {
        uiManager.showUI('battle_panel').then(() => {
            console.log('战斗面板显示成功');
        }).catch((err) => {
            console.error('战斗面板显示失败:', err);
        });
    }

    /**
     * 场景退出
     */
    onDestroy(): void {
        console.log('战斗场景销毁');
    }
}