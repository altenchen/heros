/**
 * 战斗面板
 * 显示战场、单位、技能等战斗相关UI
 */

import { _decorator, Node, Label, Sprite, SpriteFrame, Prefab, instantiate, Graphics, Color, Vec3, Vec2, UITransform } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { Game, GameState } from '../../Game';
import { UIManager } from '../UIManager';
import { EventCenter, GameEvent } from '../../utils/EventTarget';
import { BattleManager } from '../../battle/BattleManager';
import { Hex, BattleUnit, BattleState, UnitState, StatusEffect, SkillInstance } from '../../config/GameTypes';
import { BATTLEFIELD_RADIUS, MAX_FOCUS_POINTS } from '../../config/GameTypes';

const { ccclass, property } = _decorator;

/**
 * 六边形网格配置
 */
interface HexCellConfig {
    q: number;
    r: number;
    x: number;
    y: number;
    node: Node | null;
    unit: BattleUnit | null;
}

/**
 * 战斗面板
 */
@ccclass('BattlePanel')
export class BattlePanel extends UIPanel {
    // ==================== 战场区域 ====================

    /** 战场容器 */
    @property(Node)
    battlefieldContainer: Node | null = null;

    /** 六边形网格容器 */
    @property(Node)
    hexGridContainer: Node | null = null;

    /** 六边形预制体 */
    @property(Prefab)
    hexPrefab: Prefab | null = null;

    // ==================== 单位信息区域 ====================

    /** 当前单位名称 */
    @property(Label)
    currentUnitName: Label | null = null;

    /** 当前单位血量 */
    @property(Label)
    currentUnitHp: Label | null = null;

    /** 当前单位数量 */
    @property(Label)
    currentUnitCount: Label | null = null;

    /** 血量条 */
    @property(Node)
    hpBar: Node | null = null;

    // ==================== 专注点区域 ====================

    /** 专注点容器 */
    @property(Node)
    focusPointsContainer: Node | null = null;

    /** 专注点标签 */
    @property(Label)
    focusPointsLabel: Label | null = null;

    // ==================== 技能区域 ====================

    /** 技能栏容器 */
    @property(Node)
    skillBarContainer: Node | null = null;

    /** 技能按钮预制体 */
    @property(Prefab)
    skillButtonPrefab: Prefab | null = null;

    // ==================== 战斗日志区域 ====================

    /** 战斗日志容器 */
    @property(Node)
    battleLogContainer: Node | null = null;

    /** 战斗日志标签 */
    @property(Label)
    battleLogLabel: Label | null = null;

    // ==================== 回合信息 ====================

    /** 回合标签 */
    @property(Label)
    turnLabel: Label | null = null;

    /** 阶段标签 */
    @property(Label)
    phaseLabel: Label | null = null;

    // ==================== 操作按钮 ====================

    /** 自动战斗按钮 */
    @property(Node)
    autoBattleButton: Node | null = null;

    /** 暂停按钮 */
    @property(Node)
    pauseButton: Node | null = null;

    /** 退出按钮 */
    @property(Node)
    exitButton: Node | null = null;

    // ==================== 状态 ====================

    /** 游戏实例 */
    private _game: Game = Game.getInstance();

    /** UI管理器 */
    private _uiManager: UIManager = UIManager.getInstance();

    /** 战斗管理器 */
    private _battleManager: BattleManager | null = null;

    /** 六边形网格 */
    private _hexGrid: Map<string, HexCellConfig> = new Map();

    /** 当前选中的格子 */
    private _selectedHex: Hex | null = null;

    /** 当前选中的技能 */
    private _selectedSkill: SkillInstance | null = null;

    /** 六边形大小 */
    private readonly HEX_SIZE = 40;

    /** 六边形颜色 */
    private readonly HEX_COLOR_NORMAL = new Color(100, 100, 100, 100);
    private readonly HEX_COLOR_HOVER = new Color(150, 150, 150, 150);
    private readonly HEX_COLOR_SELECTED = new Color(200, 200, 100, 200);
    private readonly HEX_COLOR_MOVABLE = new Color(100, 200, 100, 150);
    private readonly HEX_COLOR_ATTACKABLE = new Color(200, 100, 100, 150);

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 1,
            cache: true,
            animationType: PanelAnimationType.FADE,
            animationDuration: 0.3
        });
    }

    /**
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);

        this._battleManager = this._game.getBattleManager();
        this._setupBattlefield();
        this._setupButtons();
        this._bindEvents();
        this._updateBattleState();
    }

    /**
     * 设置战场
     */
    private _setupBattlefield(): void {
        if (!this.hexGridContainer) return;

        // 清空现有网格
        this.hexGridContainer.removeAllChildren();
        this._hexGrid.clear();

        // 创建六边形网格
        for (let q = -BATTLEFIELD_RADIUS; q <= BATTLEFIELD_RADIUS; q++) {
            for (let r = -BATTLEFIELD_RADIUS; r <= BATTLEFIELD_RADIUS; r++) {
                if (Math.abs(q + r) <= BATTLEFIELD_RADIUS) {
                    this._createHexCell(q, r);
                }
            }
        }

        // 更新单位显示
        this._updateUnitsOnField();
    }

    /**
     * 创建六边形格子
     */
    private _createHexCell(q: number, r: number): void {
        const key = `${q},${r}`;

        // 计算像素坐标
        const x = this.HEX_SIZE * (3/2 * q);
        const y = this.HEX_SIZE * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);

        // 创建节点
        const hexNode = this.hexPrefab ? instantiate(this.hexPrefab) : new Node(`Hex_${q}_${r}`);
        hexNode.setParent(this.hexGridContainer);
        hexNode.setPosition(new Vec3(x, y, 0));

        // 添加Graphics组件绘制六边形
        let graphics = hexNode.getComponent(Graphics);
        if (!graphics) {
            graphics = hexNode.addComponent(Graphics);
        }

        // 绘制六边形
        this._drawHexagon(graphics, this.HEX_SIZE);

        // 添加交互
        hexNode.on(Node.EventType.TOUCH_START, () => {
            this._onHexClick(q, r);
        });

        hexNode.on(Node.EventType.MOUSE_ENTER, () => {
            this._onHexHover(q, r);
        });

        hexNode.on(Node.EventType.MOUSE_LEAVE, () => {
            this._onHexLeave(q, r);
        });

        // 存储格子信息
        this._hexGrid.set(key, {
            q, r, x, y,
            node: hexNode,
            unit: null
        });
    }

    /**
     * 绘制六边形
     */
    private _drawHexagon(graphics: Graphics, size: number, color: Color = this.HEX_COLOR_NORMAL): void {
        graphics.clear();
        graphics.fillColor = color;
        graphics.strokeColor = new Color(50, 50, 50, 200);
        graphics.lineWidth = 2;

        // 六边形顶点
        const points: Vec2[] = [];
        for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const px = size * Math.cos(angle);
            const py = size * Math.sin(angle);
            points.push(new Vec2(px, py));
        }

        // 绘制路径
        graphics.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            graphics.lineTo(points[i].x, points[i].y);
        }
        graphics.close();

        graphics.fill();
        graphics.stroke();
    }

    /**
     * 更新战场上的单位
     */
    private _updateUnitsOnField(): void {
        if (!this._battleManager) return;

        const state = this._battleManager.getState();

        // 清除所有单位的显示
        this._hexGrid.forEach(cell => {
            cell.unit = null;
        });

        // 放置单位
        state.units.forEach(unit => {
            const key = `${unit.position.q},${unit.position.r}`;
            const cell = this._hexGrid.get(key);
            if (cell) {
                cell.unit = unit;
                this._updateUnitDisplay(cell, unit);
            }
        });
    }

    /**
     * 更新单位显示
     */
    private _updateUnitDisplay(cell: HexCellConfig, unit: BattleUnit): void {
        if (!cell.node) return;

        // 根据阵营设置背景色
        const color = unit.team === 'player'
            ? new Color(100, 150, 255, 200)
            : new Color(255, 100, 100, 200);

        const graphics = cell.node.getComponent(Graphics);
        if (graphics) {
            this._drawHexagon(graphics, this.HEX_SIZE * 0.8, color);
        }

        // 显示单位数量
        let countLabel = cell.node.getChildByName('UnitCount')?.getComponent(Label);
        if (!countLabel) {
            const countNode = new Node('UnitCount');
            countNode.setParent(cell.node);
            countNode.setPosition(new Vec3(0, -20, 0));
            countLabel = countNode.addComponent(Label);
            countLabel.fontSize = 14;
            countLabel.lineHeight = 14;
            countLabel.color = Color.WHITE;
        }
        countLabel.string = `x${unit.count}`;

        // 显示血量条
        this._createOrUpdateHpBar(cell.node, unit);

        // 显示单位图标（通过背景颜色区分）
        const iconNode = cell.node.getChildByName('UnitIcon');
        if (!iconNode) {
            const newIconNode = new Node('UnitIcon');
            newIconNode.setParent(cell.node);
            newIconNode.setPosition(new Vec3(0, 0, 0));
            const iconGraphics = newIconNode.addComponent(Graphics);
            // 绘制一个小圆圈代表单位
            iconGraphics.circle(0, 0, 15);
            iconGraphics.fill();
        }
    }

    /**
     * 创建或更新血量条
     */
    private _createOrUpdateHpBar(parentNode: Node, unit: BattleUnit): void {
        let hpBarNode = parentNode.getChildByName('HpBar');

        if (!hpBarNode) {
            hpBarNode = new Node('HpBar');
            hpBarNode.setParent(parentNode);
            hpBarNode.setPosition(new Vec3(0, 25, 0));
        }

        // 绘制血量条背景
        let bgGraphics = hpBarNode.getChildByName('Bg')?.getComponent(Graphics);
        if (!bgGraphics) {
            const bgNode = new Node('Bg');
            bgNode.setParent(hpBarNode);
            bgGraphics = bgNode.addComponent(Graphics);
        }
        bgGraphics.clear();
        bgGraphics.rect(-20, -2, 40, 4);
        bgGraphics.fillColor = new Color(50, 50, 50, 200);
        bgGraphics.fill();

        // 绘制血量条前景
        let fgGraphics = hpBarNode.getChildByName('Fg')?.getComponent(Graphics);
        if (!fgGraphics) {
            const fgNode = new Node('Fg');
            fgNode.setParent(hpBarNode);
            fgGraphics = fgNode.addComponent(Graphics);
        }
        fgGraphics.clear();
        const hpPercent = Math.max(0, unit.currentHp / unit.maxHp);
        const hpWidth = 40 * hpPercent;
        fgGraphics.rect(-20, -2, hpWidth, 4);
        // 根据血量百分比设置颜色
        if (hpPercent > 0.6) {
            fgGraphics.fillColor = new Color(100, 200, 100, 255);
        } else if (hpPercent > 0.3) {
            fgGraphics.fillColor = new Color(200, 200, 100, 255);
        } else {
            fgGraphics.fillColor = new Color(200, 100, 100, 255);
        }
        fgGraphics.fill();
    }

    /**
     * 六边形点击
     */
    private _onHexClick(q: number, r: number): void {
        const key = `${q},${r}`;
        const cell = this._hexGrid.get(key);

        if (!cell) return;

        // 如果有选中的技能
        if (this._selectedSkill) {
            this._useSkillOnTarget(q, r);
            return;
        }

        // 如果点击了单位
        if (cell.unit) {
            this._selectUnit(cell.unit);
        } else if (this._selectedHex) {
            // 移动到目标位置
            this._moveUnit(this._selectedHex, { q, r });
        }

        this._selectedHex = { q, r };
        this._highlightSelectedHex(q, r);
    }

    /**
     * 六边形悬停
     */
    private _onHexHover(q: number, r: number): void {
        const key = `${q},${r}`;
        const cell = this._hexGrid.get(key);

        if (cell && cell.node) {
            const graphics = cell.node.getComponent(Graphics);
            if (graphics && !cell.unit) {
                this._drawHexagon(graphics, this.HEX_SIZE, this.HEX_COLOR_HOVER);
            }
        }
    }

    /**
     * 六边形离开
     */
    private _onHexLeave(q: number, r: number): void {
        const key = `${q},${r}`;
        const cell = this._hexGrid.get(key);

        if (cell && cell.node && !cell.unit) {
            const graphics = cell.node.getComponent(Graphics);
            if (graphics) {
                this._drawHexagon(graphics, this.HEX_SIZE, this.HEX_COLOR_NORMAL);
            }
        }
    }

    /**
     * 高亮选中的格子
     */
    private _highlightSelectedHex(q: number, r: number): void {
        // 重置所有格子颜色
        this._hexGrid.forEach((cell, key) => {
            if (cell.node && !cell.unit) {
                const graphics = cell.node.getComponent(Graphics);
                if (graphics) {
                    this._drawHexagon(graphics, this.HEX_SIZE, this.HEX_COLOR_NORMAL);
                }
            }
        });

        // 高亮选中的格子
        const key = `${q},${r}`;
        const cell = this._hexGrid.get(key);
        if (cell && cell.node) {
            const graphics = cell.node.getComponent(Graphics);
            if (graphics) {
                this._drawHexagon(graphics, this.HEX_SIZE, this.HEX_COLOR_SELECTED);
            }
        }
    }

    /**
     * 选择单位
     */
    private _selectUnit(unit: BattleUnit): void {
        // 更新单位信息显示
        if (this.currentUnitName) {
            this.currentUnitName.string = unit.config.name;
        }
        if (this.currentUnitHp) {
            this.currentUnitHp.string = `${unit.currentHp}/${unit.maxHp}`;
        }
        if (this.currentUnitCount) {
            this.currentUnitCount.string = `x${unit.count}`;
        }

        // 更新血量条
        if (this.hpBar) {
            const hpPercent = Math.max(0, unit.currentHp / unit.maxHp);

            // 尝试获取 ProgressBar 组件
            const progressBar = this.hpBar.getComponent('cc.ProgressBar') as any;
            if (progressBar && 'progress' in progressBar) {
                progressBar.progress = hpPercent;
            }

            // 尝试更新血量条 Graphics
            const fgGraphics = this.hpBar.getChildByName('Fg')?.getComponent(Graphics);
            if (fgGraphics) {
                fgGraphics.clear();
                const hpWidth = 100 * hpPercent; // 假设宽度100
                fgGraphics.rect(-50, -3, hpWidth, 6);
                if (hpPercent > 0.6) {
                    fgGraphics.fillColor = new Color(100, 200, 100, 255);
                } else if (hpPercent > 0.3) {
                    fgGraphics.fillColor = new Color(200, 200, 100, 255);
                } else {
                    fgGraphics.fillColor = new Color(200, 100, 100, 255);
                }
                fgGraphics.fill();
            }
        }
    }

    /**
     * 移动单位
     */
    private _moveUnit(from: Hex, to: Hex): void {
        if (!this._battleManager) return;

        const state = this._battleManager.getState();
        const grid = this._battleManager.getGrid();

        // 获取当前选中的单位（玩家单位）
        const currentUnit = state.currentUnit;
        if (!currentUnit || currentUnit.team !== 'player') {
            console.log('[BattlePanel] 当前没有可控制的玩家单位');
            return;
        }

        // 检查是否可以移动到目标位置
        const distance = grid.getDistance(from, to);
        const moveRange = (currentUnit as any).getMoveRange?.() || currentUnit.config.speed;

        if (distance > moveRange) {
            this._addBattleLog(`目标位置超出移动范围 (${distance} > ${moveRange})`);
            return;
        }

        // 检查路径是否可达
        const path = grid.findPath(from, to);
        if (path.length === 0) {
            this._addBattleLog('无法到达目标位置');
            return;
        }

        // 执行移动（通过修改单位位置）
        const oldPosition = { ...currentUnit.position };
        grid.moveUnit(currentUnit.position, to);
        currentUnit.position = to;

        // 更新显示
        this._updateUnitsOnField();
        this._addBattleLog(`${currentUnit.config.name} 移动到 (${to.q}, ${to.r})`);

        // 发送事件
        EventCenter.emit(GameEvent.UNIT_MOVED, {
            unitId: currentUnit.id,
            from: oldPosition,
            to: to
        });

        console.log(`[BattlePanel] Move unit from (${from.q},${from.r}) to (${to.q},${to.r})`);
    }

    /**
     * 在目标位置使用技能
     */
    private _useSkillOnTarget(q: number, r: number): void {
        if (!this._selectedSkill || !this._battleManager) return;

        const target: Hex = { q, r };

        // 检查是否有目标单位
        const state = this._battleManager.getState();
        const grid = this._battleManager.getGrid();

        // 尝试施放技能
        const skillId = this._selectedSkill.configId;
        const success = this._battleManager.castSkill(skillId, target);

        if (success) {
            this._addBattleLog(`使用了技能 ${skillId}`);
            this._updateBattleState();

            // 发送事件
            EventCenter.emit(GameEvent.SKILL_USED, {
                skillId,
                target
            });
        } else {
            this._addBattleLog(`技能 ${skillId} 使用失败`);
        }

        console.log(`[BattlePanel] Use skill ${this._selectedSkill.configId} on (${q},${r})`);

        this._selectedSkill = null;
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        if (this.autoBattleButton) {
            const btn = this.autoBattleButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onAutoBattle.bind(this));
            }
        }

        if (this.pauseButton) {
            const btn = this.pauseButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onPause.bind(this));
            }
        }

        if (this.exitButton) {
            const btn = this.exitButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onExitBattle.bind(this));
            }
        }
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(GameEvent.BATTLE_TURN, this._onBattleTurn, this);
        EventCenter.on(GameEvent.UNIT_DIED, this._onUnitDied, this);
        EventCenter.on(GameEvent.BATTLE_END, this._onBattleEnd, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(GameEvent.BATTLE_TURN, this._onBattleTurn, this);
        EventCenter.off(GameEvent.UNIT_DIED, this._onUnitDied, this);
        EventCenter.off(GameEvent.BATTLE_END, this._onBattleEnd, this);
    }

    /**
     * 更新战斗状态
     */
    private _updateBattleState(): void {
        if (!this._battleManager) return;

        const state = this._battleManager.getState();

        // 更新回合信息
        if (this.turnLabel) {
            this.turnLabel.string = `回合 ${state.turn}`;
        }

        // 更新专注点
        if (this.focusPointsLabel) {
            this.focusPointsLabel.string = `${state.focusPoints}/${state.maxFocusPoints}`;
        }

        // 更新单位显示
        this._updateUnitsOnField();
    }

    /**
     * 战斗回合回调
     */
    private _onBattleTurn(data: any): void {
        this._updateBattleState();
    }

    /**
     * 单位死亡回调
     */
    private _onUnitDied(data: { unit: BattleUnit }): void {
        this._updateUnitsOnField();

        // 添加日志
        this._addBattleLog(`${data.unit.config.name} 被击败了！`);
    }

    /**
     * 战斗结束回调
     */
    private _onBattleEnd(data: { winner: 'player' | 'enemy' }): void {
        // 显示战斗结果
        const message = data.winner === 'player' ? '战斗胜利！' : '战斗失败...';
        this._addBattleLog(message);

        // 延迟返回主城
        this.scheduleOnce(() => {
            this._game.endBattle();
            this.hide();
            this._uiManager.showUI('town_panel');
        }, 2);
    }

    /**
     * 添加战斗日志
     */
    private _addBattleLog(message: string): void {
        if (this.battleLogLabel) {
            const currentLog = this.battleLogLabel.string;
            this.battleLogLabel.string = currentLog + '\n' + message;

            // 限制日志长度
            const lines = this.battleLogLabel.string.split('\n');
            if (lines.length > 10) {
                this.battleLogLabel.string = lines.slice(-10).join('\n');
            }
        }
    }

    /**
     * 自动战斗
     */
    private _onAutoBattle(): void {
        if (!this._battleManager) {
            this._uiManager.showToast('战斗尚未开始');
            return;
        }

        const state = this._battleManager.getState();

        // 切换自动战斗模式
        if (state.phase === 'battle') {
            // 开始自动战斗
            this._addBattleLog('开始自动战斗...');
            this._battleManager.startBattle();
        } else if (state.phase === 'preparation') {
            // 如果还在准备阶段，开始战斗
            this._battleManager.startBattle();
        }
    }

    /**
     * 暂停
     */
    private _onPause(): void {
        this._uiManager.showUI('settings_panel');
    }

    /**
     * 退出战斗
     */
    private _onExitBattle(): void {
        this._uiManager.showConfirm(
            '退出战斗',
            '确定要退出战斗吗？这将视为战斗失败。',
            () => {
                this._game.endBattle();
                this.hide();
                this._uiManager.showUI('town_panel');
            }
        );
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();
        this._unbindEvents();
        this._selectedHex = null;
        this._selectedSkill = null;
    }
}