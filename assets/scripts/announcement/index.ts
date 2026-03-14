/**
 * 公告模块
 * 导出公告系统相关类
 */

export * from './config/AnnouncementTypes';
export { AnnouncementManager, announcementManager, AnnouncementEventType } from './announcement/AnnouncementManager';
export { announcementConfigs, announcementConfigMap, getActiveAnnouncements, getPopupAnnouncements, getAnnouncementsByType } from './config/announcement.json';