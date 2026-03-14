/**
 * 存档面板
 * 显示存档槽位、存档管理、存档导入导出
 */

import { _decorator, Node, Label, Button, Sprite, Color, tween, Vec3, UIOpacity, SpriteFrame } from 'cc';
import { UIPanel, PanelConfig } from './UIPanel';
import { saveManager, autoSaveManager } from '../../save';
import {
    SaveSlot,
    SaveEventType,
    DEFAULT_SAVE_CONFIG
} from '../../config/SaveTypes';
import { soundManager } from '../../audio';
import { UIManager } from '../UIManager';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/**
 * 存档槽位项配置
 */
interface SlotItemConfig {
    slotId: number;
    slot: SaveSlot | null;
    node?: Node;
}

/**
 * 存档面板组件
 */
@ccclass('SavePanel')
export class SavePanel extends UIPanel {
    /** 存档槽位容器 */
    @property(Node)
    slotContainer: Node | null = null;

    /** 槽位项模板 */
    @property(Node)
    slotItemTemplate: Node | null = null;

    /** 新建存档按钮 */
    @property(Button)
    newSaveButton: Button | null = null;

    /** 加载存档按钮 */
    @property(Button)
    loadButton: Button | null = null;

    /** 删除存档按钮 */
    @property(Button)
    deleteButton: Button | null = null;

    /** 导出存档按钮 */
    @property(Button)
    exportButton: Button | null = null;

    /** 导入存档按钮 */
    @property(Button)
    importButton: Button | null = null;

    /** 云同步按钮 */
    @property(Button)
    cloudSyncButton: Button | null = null;

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    /** 自动存档开关 */
    @property(Button)
    autoSaveToggle: Button | null = null;

    /** 上次存档时间标签 */
    @property(Label)
    lastSaveTimeLabel: Label | null = null;

    /** 游戏时长标签 */
    @property(Label)
    playTimeLabel: Label | null = null;

    /** 云存档状态标签 */
    @property(Label)
    cloudStatusLabel: Label | null = null;

    /** 确认对话框（引用） */
    @property(Node)
    confirmDialog: Node | null = null;

    /** 存档槽位列表 */
    private _slotItems: SlotItemConfig[] = [];

    /** 当前选中的槽位ID */
    private _selectedSlotId: number = -1;

    /** 当前操作模式 */
    private _mode: 'save' | 'load' = 'save';

    /** 待确认的操作 */
    private _pendingAction: 'delete' | 'overwrite' | null = null;

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
        if (this.newSaveButton) {
            this.newSaveButton.node.on(Button.EventType.CLICK, this._onNewSaveClick, this);
        }

        if (this.loadButton) {
            this.loadButton.node.on(Button.EventType.CLICK, this._onLoadClick, this);
        }

        if (this.deleteButton) {
            this.deleteButton.node.on(Button.EventType.CLICK, this._onDeleteClick, this);
        }

        if (this.exportButton) {
            this.exportButton.node.on(Button.EventType.CLICK, this._onExportClick, this);
        }

        if (this.importButton) {
            this.importButton.node.on(Button.EventType.CLICK, this._onImportClick, this);
        }

        if (this.cloudSyncButton) {
            this.cloudSyncButton.node.on(Button.EventType.CLICK, this._onCloudSyncClick, this);
        }

        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this._onCloseClick, this);
        }

        if (this.autoSaveToggle) {
            this.autoSaveToggle.node.on(Button.EventType.CLICK, this._onAutoSaveToggle, this);
        }
    }

    /**
     * 组件启动
     */
    start(): void {
        this._loadSlotData();
        this._setupEventListeners();
        this._updateAutoSaveStatus();
    }

    /**
     * 设置面板数据
     */
    setData(data: { mode?: 'save' | 'load' }): void {
        if (data?.mode) {
            this._mode = data.mode;
        }
    }

    /**
     * 设置事件监听
     */
    private _setupEventListeners(): void {
        EventCenter.on(SaveEventType.SAVE_COMPLETE, this._onSaveComplete, this);
        EventCenter.on(SaveEventType.LOAD_COMPLETE, this._onLoadComplete, this);
        EventCenter.on(SaveEventType.SAVE_DELETED, this._onSaveDeleted, this);
        EventCenter.on(SaveEventType.SLOT_CHANGED, this._onSlotChanged, this);
    }

    /**
     * 移除事件监听
     */
    private _removeEventListeners(): void {
        EventCenter.off(SaveEventType.SAVE_COMPLETE, this._onSaveComplete, this);
        EventCenter.off(SaveEventType.LOAD_COMPLETE, this._onLoadComplete, this);
        EventCenter.off(SaveEventType.SAVE_DELETED, this._onSaveDeleted, this);
        EventCenter.off(SaveEventType.SLOT_CHANGED, this._onSlotChanged, this);
    }

    /**
     * 加载存档槽位数据
     */
    private _loadSlotData(): void {
        const slots = saveManager.getSlots();

        this._slotItems = slots.map((slot, index) => ({
            slotId: index,
            slot: slot
        }));

        // 选中当前激活的存档槽位
        this._selectedSlotId = saveManager.getCurrentSlotId();

        this._createSlotItems();
        this._updateUI();
    }

    /**
     * 创建存档槽位项
     */
    private _createSlotItems(): void {
        if (!this.slotContainer || !this.slotItemTemplate) {
            return;
        }

        // 隐藏模板
        this.slotItemTemplate.active = false;

        // 清除现有项
        this.slotContainer.removeAllChildren();

        // 创建槽位项
        this._slotItems.forEach((item, index) => {
            const slotNode = this._createSlotNode(item);
            if (slotNode) {
                this.slotContainer!.addChild(slotNode);
                item.node = slotNode;
            }
        });
    }

    /**
     * 创建单个槽位节点
     */
    private _createSlotNode(item: SlotItemConfig): Node | null {
        if (!this.slotItemTemplate) {
            return null;
        }

        const node = this.slotItemTemplate.clone();
        node.active = true;
        node.name = `Slot_${item.slotId}`;

        // 设置槽位信息
        const nameLabel = node.getChildByName('NameLabel')?.getComponent(Label);
        const timeLabel = node.getChildByName('TimeLabel')?.getComponent(Label);
        const playTimeLabel = node.getChildByName('PlayTimeLabel')?.getComponent(Label);
        const infoLabel = node.getChildByName('InfoLabel')?.getComponent(Label);
        const emptyLabel = node.getChildByName('EmptyLabel')?.getComponent(Label);
        const selectBtn = node.getChildByName('SelectButton')?.getComponent(Button);

        if (item.slot && !item.slot.isEmpty) {
            // 有存档
            if (nameLabel) {
                nameLabel.string = item.slot.name;
            }
            if (timeLabel) {
                const date = new Date(item.slot.lastSaveTime);
                timeLabel.string = this._formatDateTime(date);
            }
            if (playTimeLabel) {
                playTimeLabel.string = `游戏时长: ${saveManager.formatPlayTime(item.slot.playTime)}`;
            }
            if (infoLabel) {
                infoLabel.string = `Lv.${item.slot.playerLevel} ${item.slot.playerName}`;
            }
            if (emptyLabel) {
                emptyLabel.node.active = false;
            }
        } else {
            // 空槽位
            if (nameLabel) {
                nameLabel.string = `空存档 ${item.slotId + 1}`;
            }
            if (timeLabel) {
                timeLabel.node.active = false;
            }
            if (playTimeLabel) {
                playTimeLabel.node.active = false;
            }
            if (infoLabel) {
                infoLabel.node.active = false;
            }
            if (emptyLabel) {
                emptyLabel.string = '- 点击新建存档 -';
            }
        }

        // 绑定选择事件
        if (selectBtn) {
            selectBtn.node.on(Button.EventType.CLICK, () => {
                this._selectSlot(item.slotId);
            }, this);
        }

        // 设置选中状态
        this._updateSlotSelection(node, item.slotId === this._selectedSlotId);

        return node;
    }

    /**
     * 格式化日期时间
     */
    private _formatDateTime(date: Date): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hour = String(date.getHours()).padStart(2, '0');
        const minute = String(date.getMinutes()).padStart(2, '0');
        return `${year}/${month}/${day} ${hour}:${minute}`;
    }

    /**
     * 选择存档槽位
     */
    private _selectSlot(slotId: number): void {
        soundManager.playUISound('button_click');

        // 更新选中状态
        const previousSlotId = this._selectedSlotId;
        this._selectedSlotId = slotId;

        // 更新UI显示
        this._slotItems.forEach(item => {
            if (item.node) {
                this._updateSlotSelection(item.node, item.slotId === slotId);
            }
        });

        this._updateButtonStates();
    }

    /**
     * 更新槽位选中状态显示
     */
    private _updateSlotSelection(node: Node, selected: boolean): void {
        const selectFrame = node.getChildByName('SelectFrame');
        if (selectFrame) {
            selectFrame.active = selected;
        }

        // 缩放动画
        if (selected) {
            tween(node)
                .to(0.1, { scale: new Vec3(1.02, 1.02, 1) })
                .start();
        } else {
            tween(node)
                .to(0.1, { scale: new Vec3(1, 1, 1) })
                .start();
        }
    }

    /**
     * 更新UI
     */
    private _updateUI(): void {
        // 更新上次存档时间
        if (this.lastSaveTimeLabel) {
            const lastSaveTime = autoSaveManager.getLastSaveTime();
            if (lastSaveTime > 0) {
                const date = new Date(lastSaveTime);
                this.lastSaveTimeLabel.string = `上次存档: ${this._formatDateTime(date)}`;
            } else {
                this.lastSaveTimeLabel.string = '上次存档: 无';
            }
        }

        // 更新游戏时长
        if (this.playTimeLabel) {
            const playTime = saveManager.getCurrentPlayTime();
            this.playTimeLabel.string = `游戏时长: ${saveManager.formatPlayTime(playTime)}`;
        }

        // 更新云存档状态
        this._updateCloudStatus();

        // 更新按钮状态
        this._updateButtonStates();
    }

    /**
     * 更新自动存档状态
     */
    private _updateAutoSaveStatus(): void {
        const config = autoSaveManager.getConfig();
        // 更新开关状态显示
        if (this.autoSaveToggle) {
            // 可以根据状态切换图片
        }
    }

    /**
     * 更新云存档状态
     */
    private _updateCloudStatus(): void {
        if (this.cloudStatusLabel) {
            const status = saveManager.getCloudStatus();
            if (status.isLoggedIn) {
                if (status.syncStatus === 'synced') {
                    this.cloudStatusLabel.string = '云存档: 已同步';
                    this.cloudStatusLabel.color = Color.GREEN;
                } else if (status.syncStatus === 'pending') {
                    this.cloudStatusLabel.string = '云存档: 待同步';
                    this.cloudStatusLabel.color = Color.YELLOW;
                } else {
                    this.cloudStatusLabel.string = '云存档: 同步失败';
                    this.cloudStatusLabel.color = Color.RED;
                }
            } else {
                this.cloudStatusLabel.string = '云存档: 未登录';
                this.cloudStatusLabel.color = Color.GRAY;
            }
        }
    }

    /**
     * 更新按钮状态
     */
    private _updateButtonStates(): void {
        const selectedSlot = this._selectedSlotId >= 0 ? saveManager.getSlot(this._selectedSlotId) : null;
        const hasSelectedSlot = selectedSlot && !selectedSlot.isEmpty;

        // 加载按钮（需要有存档）
        if (this.loadButton) {
            this.loadButton.interactable = hasSelectedSlot || false;
        }

        // 删除按钮（需要有存档）
        if (this.deleteButton) {
            this.deleteButton.interactable = hasSelectedSlot || false;
        }

        // 导出按钮（需要有存档）
        if (this.exportButton) {
            this.exportButton.interactable = hasSelectedSlot || false;
        }
    }

    /**
     * 新建存档点击
     */
    private _onNewSaveClick(): void {
        soundManager.playUISound('button_click');

        if (this._selectedSlotId < 0) {
            UIManager.getInstance().showToast('请选择存档槽位');
            return;
        }

        const slot = saveManager.getSlot(this._selectedSlotId);
        if (slot && !slot.isEmpty) {
            // 已有存档，需要确认覆盖
            this._pendingAction = 'overwrite';
            this._showConfirmDialog(
                '覆盖存档',
                `确定要覆盖存档 "${slot.name}" 吗？此操作不可撤销。`,
                this._doNewSave.bind(this)
            );
        } else {
            // 空槽位，直接创建
            this._doNewSave();
        }
    }

    /**
     * 执行新建存档
     */
    private _doNewSave(): void {
        // TODO: 显示创建角色界面或使用默认设置
        const playerName = '玩家'; // 临时使用默认名称
        const faction = 'light'; // 临时使用默认阵营

        const result = saveManager.createSave(this._selectedSlotId, playerName, faction);

        if (result.success) {
            UIManager.getInstance().showToast('存档创建成功');
            soundManager.playUISound('success');
            this._loadSlotData();
        } else {
            UIManager.getInstance().showToast(result.error || '创建失败');
        }
    }

    /**
     * 加载存档点击
     */
    private _onLoadClick(): void {
        soundManager.playUISound('button_click');

        if (this._selectedSlotId < 0) {
            UIManager.getInstance().showToast('请选择存档槽位');
            return;
        }

        const result = saveManager.loadFromSlot(this._selectedSlotId);

        if (result.success && result.data) {
            // TODO: 调用游戏加载回调
            UIManager.getInstance().showToast('存档加载成功');
            soundManager.playUISound('success');
            this._closePanel();
        } else {
            UIManager.getInstance().showToast(result.error || '加载失败');
        }
    }

    /**
     * 删除存档点击
     */
    private _onDeleteClick(): void {
        soundManager.playUISound('button_click');

        if (this._selectedSlotId < 0) {
            UIManager.getInstance().showToast('请选择存档槽位');
            return;
        }

        const slot = saveManager.getSlot(this._selectedSlotId);
        if (!slot || slot.isEmpty) {
            UIManager.getInstance().showToast('该槽位没有存档');
            return;
        }

        this._pendingAction = 'delete';
        this._showConfirmDialog(
            '删除存档',
            `确定要删除存档 "${slot.name}" 吗？此操作不可撤销。`,
            this._doDelete.bind(this)
        );
    }

    /**
     * 执行删除
     */
    private _doDelete(): void {
        const result = saveManager.deleteSave(this._selectedSlotId);

        if (result.success) {
            UIManager.getInstance().showToast('存档已删除');
            this._selectedSlotId = -1;
            this._loadSlotData();
        } else {
            UIManager.getInstance().showToast(result.error || '删除失败');
        }
    }

    /**
     * 导出存档点击
     */
    private _onExportClick(): void {
        soundManager.playUISound('button_click');

        if (this._selectedSlotId < 0) {
            UIManager.getInstance().showToast('请选择存档槽位');
            return;
        }

        const exportData = saveManager.exportSave(this._selectedSlotId);

        if (exportData) {
            // TODO: 实现导出到剪贴板或文件
            UIManager.getInstance().showToast('存档已导出到剪贴板');
            console.log('[SavePanel] 导出数据:', exportData.substring(0, 100) + '...');
        } else {
            UIManager.getInstance().showToast('导出失败');
        }
    }

    /**
     * 导入存档点击
     */
    private _onImportClick(): void {
        soundManager.playUISound('button_click');

        if (this._selectedSlotId < 0) {
            UIManager.getInstance().showToast('请选择存档槽位');
            return;
        }

        // TODO: 显示导入对话框
        UIManager.getInstance().showToast('请粘贴存档数据');
    }

    /**
     * 云同步点击
     */
    private async _onCloudSyncClick(): Promise<void> {
        soundManager.playUISound('button_click');

        UIManager.getInstance().showToast('正在同步...');
        const success = await saveManager.syncToCloud();

        if (success) {
            UIManager.getInstance().showToast('云存档同步成功');
            this._updateCloudStatus();
        } else {
            UIManager.getInstance().showToast('云存档同步失败');
        }
    }

    /**
     * 自动存档开关
     */
    private _onAutoSaveToggle(): void {
        const config = autoSaveManager.getConfig();
        autoSaveManager.updateConfig({ enabled: !config.enabled });

        soundManager.playUISound(config.enabled ? 'toggle_off' : 'toggle_on');
        UIManager.getInstance().showToast(config.enabled ? '自动存档已关闭' : '自动存档已开启');
    }

    /**
     * 关闭按钮点击
     */
    private _onCloseClick(): void {
        soundManager.playUISound('close');
        this._closePanel();
    }

    /**
     * 显示确认对话框
     */
    private _showConfirmDialog(title: string, content: string, onConfirm: () => void): void {
        if (this.confirmDialog) {
            this.confirmDialog.active = true;

            const titleLabel = this.confirmDialog.getChildByName('TitleLabel')?.getComponent(Label);
            const contentLabel = this.confirmDialog.getChildByName('ContentLabel')?.getComponent(Label);
            const confirmBtn = this.confirmDialog.getChildByName('ConfirmButton')?.getComponent(Button);
            const cancelBtn = this.confirmDialog.getChildByName('CancelButton')?.getComponent(Button);

            if (titleLabel) titleLabel.string = title;
            if (contentLabel) contentLabel.string = content;

            if (confirmBtn) {
                confirmBtn.node.off(Button.EventType.CLICK);
                confirmBtn.node.on(Button.EventType.CLICK, () => {
                    this._hideConfirmDialog();
                    onConfirm();
                }, this);
            }

            if (cancelBtn) {
                cancelBtn.node.off(Button.EventType.CLICK);
                cancelBtn.node.on(Button.EventType.CLICK, () => {
                    this._hideConfirmDialog();
                }, this);
            }
        } else {
            // 使用UIManager的确认对话框
            UIManager.getInstance().showConfirm(title, content, onConfirm);
        }
    }

    /**
     * 隐藏确认对话框
     */
    private _hideConfirmDialog(): void {
        if (this.confirmDialog) {
            this.confirmDialog.active = false;
        }
    }

    /**
     * 存档完成回调
     */
    private _onSaveComplete(data: { slotId: number }): void {
        console.log('[SavePanel] 存档完成:', data.slotId);
        this._loadSlotData();
    }

    /**
     * 加载完成回调
     */
    private _onLoadComplete(data: { slotId: number }): void {
        console.log('[SavePanel] 加载完成:', data.slotId);
    }

    /**
     * 存档删除回调
     */
    private _onSaveDeleted(data: { slotId: number }): void {
        console.log('[SavePanel] 存档删除:', data.slotId);
        this._loadSlotData();
    }

    /**
     * 槽位切换回调
     */
    private _onSlotChanged(data: { slotId: number }): void {
        console.log('[SavePanel] 槽位切换:', data.slotId);
        this._selectedSlotId = data.slotId;
        this._updateUI();
    }

    /**
     * 关闭面板
     */
    private _closePanel(): void {
        this._removeEventListeners();
        UIManager.getInstance().hideUI('save_panel');
    }

    /**
     * 销毁
     */
    onDestroy(): void {
        this._removeEventListeners();
    }
}