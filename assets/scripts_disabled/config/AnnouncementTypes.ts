/**
 * 公告类型定义
 * 定义公告系统的数据结构
 */

/** 公告类型 */
export enum AnnouncementType {
    SYSTEM = 'system',           // 系统公告
    EVENT = 'event',             // 活动公告
    UPDATE = 'update',           // 更新公告
    MAINTENANCE = 'maintenance', // 维护公告
    NOTICE = 'notice'            // 通知公告
}

/** 公告优先级 */
export enum AnnouncementPriority {
    LOW = 0,
    NORMAL = 1,
    HIGH = 2,
    URGENT = 3
}

/** 公告事件类型 */
export enum AnnouncementEventType {
    ANNOUNCEMENT_ADDED = 'announcement_added',
    ANNOUNCEMENT_READ = 'announcement_read',
    ANNOUNCEMENT_EXPIRED = 'announcement_expired',
    POPUP_SHOWN = 'announcement_popup_shown'
}

/** 公告配置 */
export interface AnnouncementConfig {
    id: string;
    type: AnnouncementType;
    priority: AnnouncementPriority;
    title: string;
    content: string;
    startTime: number;          // 开始时间戳
    endTime: number;            // 结束时间戳
    popup: boolean;             // 是否弹窗显示
    popupInterval?: number;     // 弹窗间隔（秒）
    popupTimes?: number;        // 弹窗次数限制
    image?: string;             // 图片URL
    link?: string;              // 跳转链接
    version?: string;           // 适用版本
    platform?: string[];        // 适用平台
}

/** 公告状态 */
export interface AnnouncementState {
    readIds: string[];          // 已读公告ID
    popupShownIds: { [id: string]: number }; // 已弹窗次数
    lastPopupTime: { [id: string]: number }; // 上次弹窗时间
}

/** 公告预览 */
export interface AnnouncementPreview {
    config: AnnouncementConfig;
    read: boolean;
    isNew: boolean;
    remainingTime: number;      // 剩余时间（秒）
}

/** 公告列表数据 */
export interface AnnouncementListData {
    announcements: AnnouncementPreview[];
    unreadCount: number;
    hasPopup: boolean;          // 是否有需要弹窗的公告
}