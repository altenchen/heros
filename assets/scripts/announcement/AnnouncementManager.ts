/**
 * 公告管理器
 * 管理游戏公告，处理公告展示和状态
 */

import { EventCenter } from '../utils/EventTarget';
import {
    AnnouncementType,
    AnnouncementPriority,
    AnnouncementEventType,
    AnnouncementConfig,
    AnnouncementState,
    AnnouncementPreview,
    AnnouncementListData
} from '../config/AnnouncementTypes';
import { announcementConfigMap, announcementConfigs, getActiveAnnouncements, getPopupAnnouncements } from '../config/announcement.json';

/** 公告管理器 */
export class AnnouncementManager {
    private static instance: AnnouncementManager | null = null;

    /** 公告状态 */
    private state: AnnouncementState = {
        readIds: [],
        popupShownIds: {},
        lastPopupTime: {}
    };

    /** 是否已初始化 */
    private initialized: boolean = false;

    private constructor() {}

    /**
     * 获取单例
     */
    static getInstance(): AnnouncementManager {
        if (!AnnouncementManager.instance) {
            AnnouncementManager.instance = new AnnouncementManager();
        }
        return AnnouncementManager.instance;
    }

    /**
     * 初始化
     */
    init(): void {
        if (this.initialized) return;

        this.initialized = true;
        console.log('[AnnouncementManager] 初始化完成');
    }

    /**
     * 获取公告列表数据
     */
    getAnnouncementList(): AnnouncementListData {
        const announcements = this._getAnnouncementPreviews();
        const unreadCount = announcements.filter(a => !a.read).length;
        const hasPopup = this._hasPopupAnnouncement();

        return {
            announcements,
            unreadCount,
            hasPopup
        };
    }

    /**
     * 获取公告预览列表
     */
    private _getAnnouncementPreviews(): AnnouncementPreview[] {
        const activeConfigs = getActiveAnnouncements();

        // 按优先级和开始时间排序
        activeConfigs.sort((a, b) => {
            if (a.priority !== b.priority) {
                return b.priority - a.priority; // 优先级高的在前
            }
            return b.startTime - a.startTime; // 时间新的在前
        });

        return activeConfigs.map(config => {
            const read = this.state.readIds.includes(config.id);
            const isNew = !read && (Date.now() - config.startTime) < 86400000; // 24小时内为新公告
            const remainingTime = Math.max(0, config.endTime - Date.now());

            return {
                config,
                read,
                isNew,
                remainingTime
            };
        });
    }

    /**
     * 获取公告详情
     */
    getAnnouncementDetail(announcementId: string): AnnouncementPreview | null {
        const config = announcementConfigMap.get(announcementId);
        if (!config) return null;

        const read = this.state.readIds.includes(announcementId);
        const isNew = !read && (Date.now() - config.startTime) < 86400000;
        const remainingTime = Math.max(0, config.endTime - Date.now());

        return {
            config,
            read,
            isNew,
            remainingTime
        };
    }

    /**
     * 标记公告已读
     */
    markAsRead(announcementId: string): void {
        if (!this.state.readIds.includes(announcementId)) {
            this.state.readIds.push(announcementId);

            EventCenter.emit(AnnouncementEventType.ANNOUNCEMENT_READ, {
                announcementId
            });
        }
    }

    /**
     * 标记所有公告已读
     */
    markAllAsRead(): void {
        const activeConfigs = getActiveAnnouncements();
        activeConfigs.forEach(config => {
            if (!this.state.readIds.includes(config.id)) {
                this.state.readIds.push(config.id);
            }
        });
    }

    /**
     * 获取弹窗公告
     */
    getPopupAnnouncement(): AnnouncementConfig | null {
        const popupConfigs = getPopupAnnouncements();
        const now = Date.now();

        for (const config of popupConfigs) {
            // 检查是否需要弹窗
            if (this._shouldShowPopup(config, now)) {
                return config;
            }
        }

        return null;
    }

    /**
     * 检查是否应该显示弹窗
     */
    private _shouldShowPopup(config: AnnouncementConfig, now: number): boolean {
        const shownCount = this.state.popupShownIds[config.id] || 0;
        const lastShown = this.state.lastPopupTime[config.id] || 0;

        // 检查弹窗次数限制
        if (config.popupTimes && shownCount >= config.popupTimes) {
            return false;
        }

        // 检查弹窗间隔
        if (config.popupInterval && lastShown > 0) {
            const elapsed = (now - lastShown) / 1000;
            if (elapsed < config.popupInterval) {
                return false;
            }
        }

        return true;
    }

    /**
     * 记录弹窗已显示
     */
    recordPopupShown(announcementId: string): void {
        const now = Date.now();

        this.state.popupShownIds[announcementId] = (this.state.popupShownIds[announcementId] || 0) + 1;
        this.state.lastPopupTime[announcementId] = now;

        // 自动标记已读
        this.markAsRead(announcementId);

        EventCenter.emit(AnnouncementEventType.POPUP_SHOWN, {
            announcementId
        });
    }

    /**
     * 检查是否有弹窗公告
     */
    private _hasPopupAnnouncement(): boolean {
        return this.getPopupAnnouncement() !== null;
    }

    /**
     * 获取未读公告数量
     */
    getUnreadCount(): number {
        const activeConfigs = getActiveAnnouncements();
        return activeConfigs.filter(config => !this.state.readIds.includes(config.id)).length;
    }

    /**
     * 获取指定类型的公告
     */
    getAnnouncementsByType(type: AnnouncementType): AnnouncementPreview[] {
        const previews = this._getAnnouncementPreviews();
        return previews.filter(preview => preview.config.type === type);
    }

    /**
     * 获取紧急公告
     */
    getUrgentAnnouncements(): AnnouncementPreview[] {
        const previews = this._getAnnouncementPreviews();
        return previews.filter(preview =>
            preview.config.priority === AnnouncementPriority.URGENT ||
            preview.config.priority === AnnouncementPriority.HIGH
        );
    }

    /**
     * 添加自定义公告（用于动态公告）
     */
    addAnnouncement(config: AnnouncementConfig): void {
        // 添加到配置列表
        announcementConfigs.push(config);
        announcementConfigMap.set(config.id, config);

        EventCenter.emit(AnnouncementEventType.ANNOUNCEMENT_ADDED, {
            announcementId: config.id
        });
    }

    /**
     * 移除公告
     */
    removeAnnouncement(announcementId: string): void {
        const index = announcementConfigs.findIndex(c => c.id === announcementId);
        if (index !== -1) {
            announcementConfigs.splice(index, 1);
            announcementConfigMap.delete(announcementId);

            EventCenter.emit(AnnouncementEventType.ANNOUNCEMENT_EXPIRED, {
                announcementId
            });
        }
    }

    /**
     * 格式化剩余时间
     */
    formatRemainingTime(seconds: number): string {
        if (seconds <= 0) return '已结束';

        const days = Math.floor(seconds / 86400);
        const hours = Math.floor((seconds % 86400) / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);

        if (days > 0) {
            return `${days}天${hours}小时`;
        }
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        }
        return `${minutes}分钟`;
    }

    /**
     * 序列化数据
     */
    serialize(): any {
        return { ...this.state };
    }

    /**
     * 反序列化数据
     */
    deserialize(data: any): void {
        if (!data) return;

        this.state = {
            readIds: data.readIds || [],
            popupShownIds: data.popupShownIds || {},
            lastPopupTime: data.lastPopupTime || {}
        };
    }

    /**
     * 清除所有已读状态
     */
    clearReadStatus(): void {
        this.state.readIds = [];
    }
}

/** 导出单例 */
export const announcementManager = AnnouncementManager.getInstance();