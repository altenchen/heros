/**
 * 公告面板
 * 显示游戏公告列表和详情
 */

import { _decorator, Node, Label, Button, ScrollView, Color } from 'cc';
import { UIPanel } from './UIPanel';
import { announcementManager, AnnouncementManager } from '../../announcement/AnnouncementManager';
import {
    AnnouncementType,
    AnnouncementPriority,
    AnnouncementEventType,
    AnnouncementPreview,
    AnnouncementConfig
} from '../../config/AnnouncementTypes';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 公告项组件 */
export class AnnouncementItem extends UIPanel {
    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    typeLabel: Label | null = null;

    @property(Label)
    timeLabel: Label | null = null;

    @property(Node)
    newTag: Node | null = null;

    @property(Node)
    unreadDot: Node | null = null;

    private announcementId: string = '';
    private preview: AnnouncementPreview | null = null;

    setData(data: { announcementId: string; preview: AnnouncementPreview }): void {
        this.announcementId = data.announcementId;
        this.preview = data.preview;

        this.updateDisplay();
    }

    updateDisplay(): void {
        if (!this.preview) return;

        const config = this.preview.config;

        // 更新标题
        if (this.titleLabel) {
            this.titleLabel.string = config.title;
        }

        // 更新类型标签
        if (this.typeLabel) {
            this.typeLabel.string = this.getTypeText(config.type);
            this.typeLabel.color = this.getTypeColor(config.type);
        }

        // 更新时间
        if (this.timeLabel) {
            const date = new Date(config.startTime);
            this.timeLabel.string = `${date.getMonth() + 1}/${date.getDate()}`;
        }

        // 更新新标签
        if (this.newTag) {
            this.newTag.active = this.preview.isNew;
        }

        // 更新未读点
        if (this.unreadDot) {
            this.unreadDot.active = !this.preview.read;
        }
    }

    private getTypeText(type: AnnouncementType): string {
        switch (type) {
            case AnnouncementType.SYSTEM: return '系统';
            case AnnouncementType.EVENT: return '活动';
            case AnnouncementType.UPDATE: return '更新';
            case AnnouncementType.MAINTENANCE: return '维护';
            case AnnouncementType.NOTICE: return '通知';
            default: return '公告';
        }
    }

    private getTypeColor(type: AnnouncementType): Color {
        switch (type) {
            case AnnouncementType.SYSTEM: return Color.CYAN;
            case AnnouncementType.EVENT: return Color.GREEN;
            case AnnouncementType.UPDATE: return Color.YELLOW;
            case AnnouncementType.MAINTENANCE: return Color.RED;
            case AnnouncementType.NOTICE: return Color.WHITE;
            default: return Color.WHITE;
        }
    }

    onItemClick(): void {
        // 显示详情
        EventCenter.emit('announcement_detail_request', { announcementId: this.announcementId });
    }
}

/** 公告详情面板组件 */
export class AnnouncementDetailContent extends UIPanel {
    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    contentLabel: Label | null = null;

    @property(Label)
    timeLabel: Label | null = null;

    @property(Button)
    linkBtn: Button | null = null;

    private config: AnnouncementConfig | null = null;

    setData(data: { config: AnnouncementConfig }): void {
        this.config = data.config;
        this.updateDisplay();
    }

    updateDisplay(): void {
        if (!this.config) return;

        // 更新标题
        if (this.titleLabel) {
            this.titleLabel.string = this.config.title;
        }

        // 更新内容
        if (this.contentLabel) {
            this.contentLabel.string = this.config.content;
        }

        // 更新时间
        if (this.timeLabel) {
            const startDate = new Date(this.config.startTime);
            const endDate = new Date(this.config.endTime);
            this.timeLabel.string = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
        }

        // 更新链接按钮
        if (this.linkBtn) {
            this.linkBtn.node.active = !!this.config.link;
        }
    }

    onLinkClick(): void {
        if (this.config?.link) {
            console.log('[AnnouncementDetailContent] 打开链接:', this.config.link);
            // 实际项目中，这里应该打开链接
        }
    }
}

/** 公告面板 */
@ccclass('AnnouncementPanel')
export class AnnouncementPanel extends UIPanel {
    @property(Node)
    announcementList: Node | null = null;

    @property(ScrollView)
    detailScrollView: ScrollView | null = null;

    @property(Node)
    detailContent: Node | null = null;

    @property(Label)
    unreadCountLabel: Label | null = null;

    @property(Button)
    closeBtn: Button | null = null;

    @property(Button)
    readAllBtn: Button | null = null;

    private announcementItems: Map<string, AnnouncementItem> = new Map();
    private currentAnnouncementId: string = '';

    onShow(data?: any): void {
        super.onShow(data);

        // 初始化UI
        this.updateDisplay();

        // 监听事件
        this.setupEventListeners();

        // 检查是否有弹窗公告
        this.checkPopupAnnouncement();
    }

    onHide(): void {
        // 清理事件监听
        this.cleanupEventListeners();
        super.onHide();
    }

    private setupEventListeners(): void {
        EventCenter.on(AnnouncementEventType.ANNOUNCEMENT_READ, this.onAnnouncementRead, this);
    }

    private cleanupEventListeners(): void {
        EventCenter.off(AnnouncementEventType.ANNOUNCEMENT_READ, this.onAnnouncementRead, this);
    }

    updateDisplay(): void {
        // 更新未读数量
        const unreadCount = announcementManager.getUnreadCount();
        if (this.unreadCountLabel) {
            this.unreadCountLabel.string = unreadCount > 0 ? `(${unreadCount})` : '';
        }

        // 更新全部已读按钮
        if (this.readAllBtn) {
            this.readAllBtn.interactable = unreadCount > 0;
        }

        // 更新公告列表
        this.updateAnnouncementList();
    }

    private updateAnnouncementList(): void {
        const listData = announcementManager.getAnnouncementList();

        // 实际项目中，这里应该使用列表组件动态创建项
        console.log('[AnnouncementPanel] 更新公告列表, 共', listData.announcements.length, '项');

        // 默认选中第一个
        if (listData.announcements.length > 0 && !this.currentAnnouncementId) {
            this.showAnnouncementDetail(listData.announcements[0].config.id);
        }
    }

    private showAnnouncementDetail(announcementId: string): void {
        this.currentAnnouncementId = announcementId;

        const preview = announcementManager.getAnnouncementDetail(announcementId);
        if (preview) {
            // 更新详情内容
            // 实际项目中，这里应该更新详情面板的内容

            // 标记已读
            announcementManager.markAsRead(announcementId);
        }
    }

    private checkPopupAnnouncement(): void {
        const popupConfig = announcementManager.getPopupAnnouncement();
        if (popupConfig) {
            // 显示弹窗公告
            this.showPopupAnnouncement(popupConfig);
        }
    }

    private showPopupAnnouncement(config: AnnouncementConfig): void {
        console.log('[AnnouncementPanel] 显示弹窗公告:', config.title);

        // 标记弹窗已显示
        announcementManager.recordPopupShown(config.id);

        // 实际项目中，这里应该显示一个弹窗
    }

    private onAnnouncementRead(data: any): void {
        this.updateDisplay();
    }

    onReadAllClick(): void {
        announcementManager.markAllAsRead();
        this.updateDisplay();
    }

    onCloseClick(): void {
        this.hide();
    }
}