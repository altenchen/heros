/**
 * 公告配置数据
 */

import { AnnouncementConfig, AnnouncementType, AnnouncementPriority } from './AnnouncementTypes';

/** 公告配置列表（示例数据） */
export const announcementConfigs: AnnouncementConfig[] = [
    {
        id: 'announcement_welcome',
        type: AnnouncementType.SYSTEM,
        priority: AnnouncementPriority.HIGH,
        title: '欢迎来到英雄无敌Ⅲ：传承',
        content: '亲爱的玩家，欢迎来到英雄无敌Ⅲ：传承的世界！在这里，您将体验到经典战棋游戏的魅力，组建您的英雄军队，征服这片神奇的大陆。',
        startTime: Date.now() - 86400000 * 30, // 30天前
        endTime: Date.now() + 86400000 * 365, // 1年后
        popup: true,
        popupTimes: 1,
        image: 'announcement_welcome'
    },
    {
        id: 'announcement_update_1_1',
        type: AnnouncementType.UPDATE,
        priority: AnnouncementPriority.NORMAL,
        title: '版本更新公告 V1.1.0',
        content: `【新增内容】
1. 新增远征系统，派遣英雄探险获取丰厚奖励
2. 新增在线奖励系统，在线时长越多奖励越丰富
3. 新增公告系统，及时了解游戏最新动态

【优化内容】
1. 优化战斗系统性能
2. 优化UI界面显示效果
3. 修复已知BUG`,
        startTime: Date.now() - 86400000, // 1天前
        endTime: Date.now() + 86400000 * 30, // 30天后
        popup: false,
        version: '1.1.0'
    },
    {
        id: 'announcement_event_daily',
        type: AnnouncementType.EVENT,
        priority: AnnouncementPriority.NORMAL,
        title: '每日登录活动',
        content: '活动期间，每日登录游戏即可领取丰厚奖励！累计登录7天更有神秘大奖等你来拿！',
        startTime: Date.now() - 86400000 * 7, // 7天前
        endTime: Date.now() + 86400000 * 7, // 7天后
        popup: true,
        popupInterval: 86400, // 每天弹一次
        image: 'event_daily_login'
    },
    {
        id: 'announcement_event_weekend',
        type: AnnouncementType.EVENT,
        priority: AnnouncementPriority.HIGH,
        title: '周末狂欢活动',
        content: '周末狂欢！活动期间充值双倍钻石，副本掉落率提升50%！不要错过这个绝佳机会！',
        startTime: Date.now(),
        endTime: Date.now() + 86400000 * 2, // 2天后
        popup: true,
        popupTimes: 3,
        image: 'event_weekend'
    }
];

/** 公告配置映射 */
export const announcementConfigMap: Map<string, AnnouncementConfig> = new Map(
    announcementConfigs.map(config => [config.id, config])
);

/** 获取有效公告列表 */
export function getActiveAnnouncements(): AnnouncementConfig[] {
    const now = Date.now();
    return announcementConfigs.filter(config =>
        config.startTime <= now && config.endTime >= now
    );
}

/** 获取需要弹窗的公告列表 */
export function getPopupAnnouncements(): AnnouncementConfig[] {
    const now = Date.now();
    return announcementConfigs.filter(config =>
        config.popup &&
        config.startTime <= now &&
        config.endTime >= now
    );
}

/** 获取指定类型的公告 */
export function getAnnouncementsByType(type: AnnouncementType): AnnouncementConfig[] {
    return announcementConfigs.filter(config => config.type === type);
}