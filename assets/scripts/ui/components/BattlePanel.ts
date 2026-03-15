/**
 * 战斗面板组件
 * MVP简化版
 */

import { _decorator, Component, Node, Label, Button, director } from 'cc';
import { BattleManager, BattleEventType } from '../../battle/BattleManager';
import { SimpleHeroData } from '../../battle/BattleUnit';
import { heroManager } from '../../hero/HeroManager';
import { getUnitConfig, getAllUnitConfigs, UnitConfigs } from '../../../configs/units.json';
import { Hex, UnitConfig } from '../../config/GameTypes';
import { uiManager } from '../UIManager';

const { ccclass, property } = _decorator;

@ccclass('BattlePanel')
export class BattlePanel extends Component {

    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    stateLabel: Label | null = null;

    @property(Label)
    turnLabel: Label | null = null;

    @property(Button)
    autoButton: Button | null = null;

    @property(Button)
    pauseButton: Button | null = null;

    @property(Node)
    unitsContainer: Node | null = null;

    /** 战斗管理器 */
    private battleManager: BattleManager | null = null;

    /** 当前回合数 */
    private currentTurn: number = 0;

    /** 是否自动战斗 */
    private isAuto: boolean = true;

    onLoad(): void {
        this.initUI();
        this.initBattle();
    }

    /**
     * 初始化UI
     */
    private initUI(): void {
        if (this.titleLabel) {
            this.titleLabel.string = '战斗';
        }

        if (this.stateLabel) {
            this.stateLabel.string = '准备中...';
        }

        if (this.turnLabel) {
            this.turnLabel.string = '回合: 0';
        }

        if (this.autoButton) {
            this.autoButton.node.on(Button.EventType.CLICK, this.onAutoClick, this);
        }

        if (this.pauseButton) {
            this.pauseButton.node.on(Button.EventType.CLICK, this.onPauseClick, this);
        }
    }

    /**
     * 初始化战斗
     */
    private initBattle(): void {
        // 创建战斗管理器
        this.battleManager = new BattleManager();

        // 监听战斗事件 - 使用箭头函数绑定this
        this.battleManager.on(BattleEventType.BATTLE_START, (event: any) => this.onBattleStart(event));
        this.battleManager.on(BattleEventType.TURN_START, (event: any) => this.onTurnStart(event));
        this.battleManager.on(BattleEventType.UNIT_ATTACK, (event: any) => this.onUnitAction(event));
        this.battleManager.on(BattleEventType.UNIT_DIE, (event: any) => this.onUnitDie(event));
        this.battleManager.on(BattleEventType.BATTLE_END, (event: any) => this.onBattleEnd(event));

        // 创建英雄数据
        const playerHero: SimpleHeroData = {
            id: 'player_hero',
            name: '凯瑟琳',
            attack: 6,
            defense: 4,
            spellPower: 1
        };

        const enemyHero: SimpleHeroData = {
            id: 'enemy_hero',
            name: '敌方英雄',
            attack: 3,
            defense: 3,
            spellPower: 1
        };

        // 创建玩家单位
        const playerUnits = this.createPlayerUnits();

        // 创建敌方单位
        const enemyUnits = this.createEnemyUnits();

        // 初始化战斗
        this.battleManager.initBattle(playerUnits, enemyUnits, playerHero, enemyHero);

        // 开始战斗
        this.battleManager.startBattle();
    }

    /**
     * 创建玩家单位数据
     */
    private createPlayerUnits(): { config: UnitConfig; count: number; position: Hex }[] {
        const units: { config: UnitConfig; count: number; position: Hex }[] = [];
        const allConfigs = getAllUnitConfigs();

        if (allConfigs.length >= 3) {
            // 枪兵 - 后排左
            units.push({
                config: allConfigs[0],
                count: 20,
                position: { q: -3, r: -1 }
            });

            // 弓箭手 - 后排中
            units.push({
                config: allConfigs[1],
                count: 15,
                position: { q: -3, r: 0 }
            });

            // 狮鹫 - 前排
            units.push({
                config: allConfigs[2],
                count: 8,
                position: { q: -2, r: 0 }
            });
        }

        return units;
    }

    /**
     * 创建敌方单位数据
     */
    private createEnemyUnits(): { config: UnitConfig; count: number; position: Hex }[] {
        const units: { config: UnitConfig; count: number; position: Hex }[] = [];
        const allConfigs = getAllUnitConfigs();

        if (allConfigs.length >= 3) {
            // 敌方枪兵
            units.push({
                config: allConfigs[0],
                count: 15,
                position: { q: 3, r: -1 }
            });

            // 敌方弓箭手
            units.push({
                config: allConfigs[1],
                count: 10,
                position: { q: 3, r: 0 }
            });

            // 敌方狮鹫
            units.push({
                config: allConfigs[2],
                count: 5,
                position: { q: 2, r: 0 }
            });
        }

        return units;
    }

    /**
     * 战斗开始回调
     */
    private onBattleStart(event: any): void {
        console.log('战斗开始');

        if (this.stateLabel) {
            this.stateLabel.string = '战斗中';
        }
    }

    /**
     * 回合开始回调
     */
    private onTurnStart(event: any): void {
        const turn = event.data?.turn || (this.currentTurn + 1);
        this.currentTurn = turn;
        console.log(`回合 ${this.currentTurn} 开始`);

        if (this.turnLabel) {
            this.turnLabel.string = `回合: ${this.currentTurn}`;
        }
    }

    /**
     * 单位行动回调
     */
    private onUnitAction(event: any): void {
        console.log('单位行动:', event.data);
    }

    /**
     * 单位死亡回调
     */
    private onUnitDie(event: any): void {
        console.log('单位死亡:', event.data?.unitId);
    }

    /**
     * 战斗结束回调
     */
    private onBattleEnd(event: any): void {
        const winner = event.data?.result?.winner;
        console.log('战斗结束:', winner);

        if (this.stateLabel) {
            this.stateLabel.string = winner === 'player' ? '胜利!' : '失败...';
        }

        // 延迟显示结果面板
        this.scheduleOnce(() => {
            this.showBattleResult(event.data?.result);
        }, 1.0);
    }

    /**
     * 显示战斗结果
     */
    private showBattleResult(result: any): void {
        // 使用UI管理器显示战斗结果面板
        uiManager.showUI('battle_result_panel', result).then(() => {
            console.log('战斗结果面板显示成功');
        }).catch((err) => {
            console.error('战斗结果面板显示失败:', err);
            // 失败时返回主菜单
            director.loadScene('MainMenu');
        });
    }

    /**
     * 自动按钮点击
     */
    private onAutoClick(): void {
        this.isAuto = !this.isAuto;
        console.log('自动战斗:', this.isAuto ? '开启' : '关闭');
    }

    /**
     * 暂停按钮点击
     */
    private onPauseClick(): void {
        console.log('暂停游戏');
    }

    /**
     * 显示时调用
     */
    onShow(data?: any): void {
        console.log('战斗面板显示', data);
    }

    /**
     * 隐藏时调用
     */
    onHide(): void {
        console.log('战斗面板隐藏');
    }

    /**
     * 销毁时清理
     */
    onDestroy(): void {
        if (this.autoButton) {
            this.autoButton.node.off(Button.EventType.CLICK, this.onAutoClick, this);
        }
        if (this.pauseButton) {
            this.pauseButton.node.off(Button.EventType.CLICK, this.onPauseClick, this);
        }

        if (this.battleManager) {
            this.battleManager.cleanup();
        }
    }
}