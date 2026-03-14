/**
 * 存档选择面板
 * 显示存档槽位列表，支持创建、加载、删除存档
 */

import { _decorator, Node, Label, Button, Color, Sprite, UIOpacity } from 'cc';
import { UIPanel } from './UIPanel';
import { saveManager } from '../../save/SaveManager';
import { SaveSlot, SaveEventType } from '../../config/SaveTypes';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/**
 * 存档槽位点击回调
 */
interface SlotClickCallback {
    (slotId: number): void;
}

@ccclass('SaveSelectPanel')
export class SaveSelectPanel extends UIPanel {
    @property(Label)
    titleLabel: Label | null = null;

    @property([Node])
    slotNodes: Node[] = [];

    @property(Button)
    backButton: Button | null = null;

    /** 是否为加载模式(否则为创建模式) */
    private isLoadMode: boolean = true;

    /** 选择的阵营 */
    private selectedFaction: string = 'light';

    /** 输入的玩家名 */
    private playerName: string = '';

    /**
     * 面板名称
     */
    getPanelName(): string {
        return 'save_select_panel';
    }

    /**
     * 初始化
     */
    protected onInit(): void {
        if (this.backButton) {
            this.backButton.node.on(Button.EventType.CLICK, this.onBackClick, this);
        }

        // 初始化槽位按钮
        this.slotNodes.forEach((node, index) => {
            node.on(Button.EventType.CLICK, () => this.onSlotClick(index), this);
        });
    }

    /**
     * 显示面板
     */
    protected onShow(data?: any): void {
        if (data) {
            this.isLoadMode = data.mode === 'load';
            if (data.playerName) {
                this.playerName = data.playerName;
            }
            if (data.faction) {
                this.selectedFaction = data.faction;
            }
        }

        this.updateTitle();
        this.updateSlotUI();
    }

    /**
     * 更新标题
     */
    private updateTitle(): void {
        if (this.titleLabel) {
            this.titleLabel.string = this.isLoadMode ? '选择存档' : '创建存档';
        }
    }

    /**
     * 更新槽位UI
     */
    private updateSlotUI(): void {
        const slots = saveManager.getSlots();

        slots.forEach((slot, index) => {
            if (index < this.slotNodes.length) {
                this.updateSlotNode(this.slotNodes[index], slot);
            }
        });
    }

    /**
     * 更新单个槽位节点
     */
    private updateSlotNode(node: Node, slot: SaveSlot): void {
        // 查找子节点
        const nameLabel = node.getChildByName('NameLabel')?.getComponent(Label);
        const levelLabel = node.getChildByName('LevelLabel')?.getComponent(Label);
        const timeLabel = node.getChildByName('TimeLabel')?.getComponent(Label);
        const playTimeLabel = node.getChildByName('PlayTimeLabel')?.getComponent(Label);
        const emptyLabel = node.getChildByName('EmptyLabel')?.getComponent(Label);

        if (slot.isEmpty) {
            // 空槽位
            if (nameLabel) nameLabel.node.active = false;
            if (levelLabel) levelLabel.node.active = false;
            if (timeLabel) timeLabel.node.active = false;
            if (playTimeLabel) playTimeLabel.node.active = false;
            if (emptyLabel) {
                emptyLabel.node.active = true;
                emptyLabel.string = this.isLoadMode ? '空存档' : '点击创建';
            }
        } else {
            // 有存档
            if (nameLabel) {
                nameLabel.node.active = true;
                nameLabel.string = slot.playerName;
            }
            if (levelLabel) {
                levelLabel.node.active = true;
                levelLabel.string = `Lv.${slot.playerLevel} | ${this.getFactionName(slot.faction)}`;
            }
            if (timeLabel) {
                timeLabel.node.active = true;
                timeLabel.string = this.formatTime(slot.lastSaveTime);
            }
            if (playTimeLabel) {
                playTimeLabel.node.active = true;
                playTimeLabel.string = `游戏时长: ${saveManager.formatPlayTime(slot.playTime)}`;
            }
            if (emptyLabel) emptyLabel.node.active = false;
        }
    }

    /**
     * 槽位点击
     */
    private onSlotClick(slotId: number): void {
        const slot = saveManager.getSlot(slotId);
        if (!slot) return;

        if (this.isLoadMode) {
            if (slot.isEmpty) {
                this.showToast('该槽位没有存档');
            } else {
                this.loadSave(slotId);
            }
        } else {
            if (slot.isEmpty) {
                this.createSave(slotId);
            } else {
                // 显示确认对话框
                this.showConfirm(
                    '覆盖存档',
                    '该槽位已有存档，是否覆盖？',
                    () => this.createSave(slotId)
                );
            }
        }
    }

    /**
     * 加载存档
     */
    private loadSave(slotId: number): void {
        const result = saveManager.loadFromSlot(slotId);
        if (result.success && result.data) {
            this.showToast('存档加载成功');

            // 通知游戏加载存档数据
            EventCenter.emit(SaveEventType.LOAD_COMPLETE, {
                slotId,
                data: result.data
            });

            this.hide();
        } else {
            this.showToast(result.error || '加载失败');
        }
    }

    /**
     * 创建存档
     */
    private createSave(slotId: number): void {
        if (!this.playerName) {
            this.playerName = '玩家' + Math.floor(Math.random() * 10000);
        }

        const result = saveManager.createSave(slotId, this.playerName, this.selectedFaction);
        if (result.success) {
            this.showToast('存档创建成功');

            // 通知游戏初始化新存档
            EventCenter.emit('new_game_created', {
                slotId,
                playerName: this.playerName,
                faction: this.selectedFaction
            });

            this.hide();
        } else {
            this.showToast(result.error || '创建失败');
        }
    }

    /**
     * 返回按钮
     */
    private onBackClick(): void {
        this.hide();
    }

    /**
     * 获取阵营名称
     */
    private getFactionName(faction: string): string {
        const names: Record<string, string> = {
            'light': '光明',
            'dark': '黑暗'
        };
        return names[faction] || faction;
    }

    /**
     * 格式化时间
     */
    private formatTime(timestamp: number): string {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = now.getTime() - timestamp;

        if (diff < 60000) return '刚刚';
        if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
        if (diff < 86400000) return Math.floor(diff / 3600000) + '小时前';
        if (diff < 604800000) return Math.floor(diff / 86400000) + '天前';

        return `${date.getMonth() + 1}月${date.getDate()}日`;
    }

    /**
     * 显示提示
     */
    private showToast(message: string): void {
        const game = (window as any).game;
        if (game && game.getUIManager) {
            game.getUIManager().showToast(message);
        }
    }

    /**
     * 显示确认对话框
     */
    private showConfirm(title: string, content: string, onConfirm: () => void): void {
        const game = (window as any).game;
        if (game && game.getUIManager) {
            game.getUIManager().showConfirm(title, content, onConfirm);
        }
    }
}