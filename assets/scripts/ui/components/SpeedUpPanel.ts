/**
 * 加速面板
 * 显示加速选项、道具列表、钻石加速
 */

import { _decorator, Node, Label, Button, Sprite, Color, tween, Vec3, ProgressBar } from 'cc';
import { UIPanel, PanelConfig } from './UIPanel';
import { speedUpManager } from '../../utils/SpeedUpManager';
import {
    SpeedUpType,
    SpeedUpConfig,
    SpeedUpTarget,
    SpeedUpEventType
} from '../../config/SpeedUpTypes';
import { soundManager } from '../../audio';
import { UIManager } from '../UIManager';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/**
 * 加速道具项
 */
interface SpeedUpItemNode {
    config: SpeedUpConfig;
    node: Node;
}

/**
 * 加速面板组件
 */
@ccclass('SpeedUpPanel')
export class SpeedUpPanel extends UIPanel {
    /** 标题标签 */
    @property(Label)
    titleLabel: Label | null = null;

    /** 目标名称标签 */
    @property(Label)
    targetNameLabel: Label | null = null;

    /** 剩余时间标签 */
    @property(Label)
    remainingTimeLabel: Label | null = null;

    /** 进度条 */
    @property(ProgressBar)
    progressBar: ProgressBar | null = null;

    /** 道具容器 */
    @property(Node)
    itemContainer: Node | null = null;

    /** 道具项模板 */
    @property(Node)
    itemTemplate: Node | null = null;

    /** 钻石加速按钮 */
    @property(Button)
    gemsSpeedUpButton: Button | null = null;

    /** 钻石费用标签 */
    @property(Label)
    gemsCostLabel: Label | null = null;

    /** 免费加速按钮 */
    @property(Button)
    freeSpeedUpButton: Button | null = null;

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    /** 目标ID */
    private _targetId: string = '';

    /** 加速目标 */
    private _target: SpeedUpTarget | null = null;

    /** 道具项列表 */
    private _items: SpeedUpItemNode[] = [];

    /**
     * 面板配置
     */
    static getPanelConfig(): PanelConfig {
        return {
            layer: 3, // POPUP层
            animation: 'scale',
            showMask: true,
            closeOnMask: true
        };
    }

    /**
     * 组件加载
     */
    onLoad(): void {
        super.onLoad?.();

        // 绑定按钮事件
        if (this.gemsSpeedUpButton) {
            this.gemsSpeedUpButton.node.on(Button.EventType.CLICK, this._onGemsSpeedUpClick, this);
        }

        if (this.freeSpeedUpButton) {
            this.freeSpeedUpButton.node.on(Button.EventType.CLICK, this._onFreeSpeedUpClick, this);
        }

        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this._onCloseClick, this);
        }
    }

    /**
     * 设置面板数据
     */
    setData(data: { targetId: string }): void {
        if (data?.targetId) {
            this._targetId = data.targetId;
        }
    }

    /**
     * 组件启动
     */
    start(): void {
        this._loadData();
        this._setupEventListeners();
    }

    /**
     * 设置事件监听
     */
    private _setupEventListeners(): void {
        EventCenter.on(SpeedUpEventType.SPEED_UP_COMPLETE, this._onSpeedUpComplete, this);
    }

    /**
     * 移除事件监听
     */
    private _removeEventListeners(): void {
        EventCenter.off(SpeedUpEventType.SPEED_UP_COMPLETE, this._onSpeedUpComplete, this);
    }

    /**
     * 加载数据
     */
    private _loadData(): void {
        this._target = speedUpManager.getTarget(this._targetId) ?? null;

        if (!this._target) {
            console.warn('[SpeedUpPanel] 目标不存在:', this._targetId);
            this._closePanel();
            return;
        }

        this._updateUI();
        this._createSpeedUpItems();
    }

    /**
     * 更新UI
     */
    private _updateUI(): void {
        if (!this._target) return;

        // 更新标题
        if (this.titleLabel) {
            const typeNames: Record<SpeedUpType, string> = {
                [SpeedUpType.BUILDING]: '建造加速',
                [SpeedUpType.RECRUIT]: '招募加速',
                [SpeedUpType.RESEARCH]: '研发加速',
                [SpeedUpType.TRAINING]: '训练加速',
                [SpeedUpType.GENERAL]: '加速'
            };
            this.titleLabel.string = typeNames[this._target.type] || '加速';
        }

        // 更新目标名称
        if (this.targetNameLabel) {
            this.targetNameLabel.string = this._target.extra?.name || this._target.targetId;
        }

        // 更新剩余时间
        if (this.remainingTimeLabel) {
            this.remainingTimeLabel.string = `剩余时间: ${speedUpManager.formatTime(this._target.remainingTime)}`;
        }

        // 更新进度条
        if (this.progressBar && this._target.totalTime > 0) {
            const progress = 1 - (this._target.remainingTime / this._target.totalTime);
            this.progressBar.progress = progress;
        }

        // 更新钻石费用
        const gemsCost = speedUpManager.calculateGemsCost(this._target.remainingTime);
        if (this.gemsCostLabel) {
            if (gemsCost === 0) {
                this.gemsCostLabel.string = '免费';
                this.gemsCostLabel.color = Color.GREEN;
            } else {
                this.gemsCostLabel.string = `${gemsCost} 钻石`;
                this.gemsCostLabel.color = Color.WHITE;
            }
        }

        // 更新免费加速按钮
        if (this.freeSpeedUpButton) {
            const canFreeSpeedUp = this._target.remainingTime <= 60; // 1分钟内可免费
            this.freeSpeedUpButton.node.active = canFreeSpeedUp;
        }
    }

    /**
     * 创建加速道具项
     */
    private _createSpeedUpItems(): void {
        const container = this.itemContainer;
        const template = this.itemTemplate;
        if (!container || !template || !this._target) {
            return;
        }

        // 隐藏模板
        template.active = false;

        // 清除现有项
        container.removeAllChildren();
        this._items = [];

        // 获取可用道具
        const items = speedUpManager.getAvailableSpeedUpItems(this._target.type);

        items.forEach(config => {
            const node = this._createItemNode(config);
            if (node) {
                container.addChild(node);
                this._items.push({ config, node });
            }
        });

        // 如果没有道具，显示提示
        if (items.length === 0) {
            // TODO: 显示无道具提示
        }
    }

    /**
     * 创建单个道具节点
     */
    private _createItemNode(config: SpeedUpConfig): Node | null {
        if (!this.itemTemplate) return null;

        const node = this.itemTemplate.clone();
        node.active = true;
        node.name = `Item_${config.itemId}`;

        // 设置道具信息
        const nameLabel = node.getChildByName('NameLabel')?.getComponent(Label);
        const timeLabel = node.getChildByName('TimeLabel')?.getComponent(Label);
        const countLabel = node.getChildByName('CountLabel')?.getComponent(Label);
        const useBtn = node.getChildByName('UseButton')?.getComponent(Button);

        if (nameLabel) {
            nameLabel.string = config.name;
        }

        if (timeLabel) {
            timeLabel.string = speedUpManager.formatTime(config.time);
        }

        // 获取道具数量
        // const count = inventoryManager.getItemCount(config.itemId);
        // if (countLabel) {
        //     countLabel.string = `x${count}`;
        // }

        // 绑定使用事件
        if (useBtn) {
            useBtn.node.on(Button.EventType.CLICK, () => {
                this._useSpeedUpItem(config.itemId);
            }, this);
        }

        return node;
    }

    /**
     * 使用加速道具
     */
    private _useSpeedUpItem(itemId: string): void {
        soundManager.playUISound('button_click');

        const result = speedUpManager.speedUpWithItem(this._targetId, itemId);

        if (result.success) {
            if (result.completed) {
                UIManager.getInstance().showToast('加速完成！');
                this._closePanel();
            } else {
                UIManager.getInstance().showToast(`加速成功，剩余 ${speedUpManager.formatTime(result.remainingTime!)}`);
                this._target = speedUpManager.getTarget(this._targetId) ?? null;
                this._updateUI();
            }
        } else {
            UIManager.getInstance().showToast(result.error || '加速失败');
        }
    }

    /**
     * 钻石加速点击
     */
    private _onGemsSpeedUpClick(): void {
        soundManager.playUISound('button_click');

        const result = speedUpManager.speedUpWithGems(this._targetId);

        if (result.success) {
            UIManager.getInstance().showToast('加速完成！');
            soundManager.playUISound('success');
            this._closePanel();
        } else {
            UIManager.getInstance().showToast(result.error || '加速失败');
        }
    }

    /**
     * 免费加速点击
     */
    private _onFreeSpeedUpClick(): void {
        soundManager.playUISound('button_click');

        const result = speedUpManager.quickFinish(this._targetId);

        if (result.success) {
            UIManager.getInstance().showToast('免费加速完成！');
            this._closePanel();
        } else {
            UIManager.getInstance().showToast(result.error || '加速失败');
        }
    }

    /**
     * 关闭按钮点击
     */
    private _onCloseClick(): void {
        soundManager.playUISound('close');
        this._closePanel();
    }

    /**
     * 加速完成回调
     */
    private _onSpeedUpComplete(data: { targetId: string }): void {
        if (data.targetId === this._targetId) {
            this._closePanel();
        }
    }

    /**
     * 关闭面板
     */
    private _closePanel(): void {
        this._removeEventListeners();
        UIManager.getInstance().hideUI('speed_up_panel');
    }

    /**
     * 销毁
     */
    onDestroy(): void {
        this._removeEventListeners();
    }
}