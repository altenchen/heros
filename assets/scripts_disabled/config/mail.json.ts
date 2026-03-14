/**
 * 邮件配置数据
 * 包含邮件模板、系统邮件配置
 * 遵循阿里巴巴开发者手册规范
 */

import {
    MailTemplate,
    MailType,
    MailConfig,
    MailAttachment,
    AttachmentState
} from './MailTypes';

/**
 * 邮件模板列表
 */
export const mailTemplates: MailTemplate[] = [
    {
        templateId: 'welcome',
        type: MailType.SYSTEM,
        sender: '系统',
        titleTemplate: '欢迎来到英雄无敌Ⅲ：传承',
        contentTemplate: '亲爱的玩家，欢迎来到英雄无敌Ⅲ：传承的世界！这是一封欢迎邮件，祝您游戏愉快！',
        defaultExpireDuration: 30 * 24 * 60 * 60, // 30天
        hasAttachment: true
    },
    {
        templateId: 'daily_reward',
        type: MailType.REWARD,
        sender: '系统',
        titleTemplate: '每日奖励',
        contentTemplate: '恭喜您获得每日登录奖励，请查收！',
        defaultExpireDuration: 3 * 24 * 60 * 60, // 3天
        hasAttachment: true
    },
    {
        templateId: 'level_reward',
        type: MailType.REWARD,
        sender: '系统',
        titleTemplate: '关卡奖励',
        contentTemplate: '恭喜您通关关卡【{levelName}】，获得以下奖励：',
        defaultExpireDuration: 7 * 24 * 60 * 60, // 7天
        hasAttachment: true
    },
    {
        templateId: 'achievement_reward',
        type: MailType.REWARD,
        sender: '系统',
        titleTemplate: '成就奖励',
        contentTemplate: '恭喜您完成成就【{achievementName}】，获得以下奖励：',
        defaultExpireDuration: 7 * 24 * 60 * 60, // 7天
        hasAttachment: true
    },
    {
        templateId: 'vip_reward',
        type: MailType.REWARD,
        sender: '系统',
        titleTemplate: 'VIP等级奖励',
        contentTemplate: '恭喜您的VIP等级提升到{vipLevel}级，获得以下奖励：',
        defaultExpireDuration: 7 * 24 * 60 * 60, // 7天
        hasAttachment: true
    },
    {
        templateId: 'rank_reward',
        type: MailType.REWARD,
        sender: '系统',
        titleTemplate: '排行榜奖励',
        contentTemplate: '恭喜您在{rankType}排行榜中获得第{rank}名，获得以下奖励：',
        defaultExpireDuration: 7 * 24 * 60 * 60, // 7天
        hasAttachment: true
    },
    {
        templateId: 'guild_invite',
        type: MailType.GUILD,
        sender: '公会系统',
        titleTemplate: '公会邀请',
        contentTemplate: '玩家{inviterName}邀请您加入公会【{guildName}】',
        defaultExpireDuration: 3 * 24 * 60 * 60, // 3天
        hasAttachment: false
    },
    {
        templateId: 'battle_report',
        type: MailType.BATTLE_REPORT,
        sender: '战斗报告',
        titleTemplate: '战斗报告',
        contentTemplate: '您在{battleType}中{result}，详情请查看战斗回放。',
        defaultExpireDuration: 3 * 24 * 60 * 60, // 3天
        hasAttachment: false
    },
    {
        templateId: 'event_start',
        type: MailType.ANNOUNCEMENT,
        sender: '活动公告',
        titleTemplate: '活动开启：{eventName}',
        contentTemplate: '{eventDescription}\n\n活动时间：{startTime} 至 {endTime}',
        defaultExpireDuration: 7 * 24 * 60 * 60, // 7天
        hasAttachment: false
    },
    {
        templateId: 'maintenance',
        type: MailType.ANNOUNCEMENT,
        sender: '系统公告',
        titleTemplate: '维护公告',
        contentTemplate: '尊敬的玩家，游戏将于{maintenanceTime}进行维护，预计时长{duration}小时，请您提前做好准备。',
        defaultExpireDuration: 3 * 24 * 60 * 60, // 3天
        hasAttachment: false
    }
];

/**
 * 根据模板ID获取邮件模板
 */
export function getMailTemplate(templateId: string): MailTemplate | undefined {
    return mailTemplates.find(t => t.templateId === templateId);
}

/**
 * 创建欢迎邮件配置
 */
export function createWelcomeMail(): MailConfig {
    return {
        type: MailType.SYSTEM,
        sender: '系统',
        title: '欢迎来到英雄无敌Ⅲ：传承',
        content: '亲爱的玩家，欢迎来到英雄无敌Ⅲ：传承的世界！这是一封欢迎邮件，祝您游戏愉快！',
        expireDuration: 30 * 24 * 60 * 60,
        attachments: [
            { type: 'resource', itemId: 'gold', amount: 10000 },
            { type: 'resource', itemId: 'gems', amount: 100 },
            { type: 'resource', itemId: 'stamina', amount: 50 }
        ]
    };
}

/**
 * 创建每日奖励邮件配置
 */
export function createDailyRewardMail(day: number): MailConfig {
    const goldReward = 1000 * day;
    const staminaReward = 20 + day * 5;

    return {
        type: MailType.REWARD,
        sender: '系统',
        title: `每日登录奖励 - 第${day}天`,
        content: `恭喜您连续登录第${day}天，获得以下奖励：`,
        expireDuration: 3 * 24 * 60 * 60,
        attachments: [
            { type: 'resource', itemId: 'gold', amount: goldReward },
            { type: 'resource', itemId: 'stamina', amount: staminaReward }
        ]
    };
}

/**
 * 创建关卡奖励邮件配置
 */
export function createLevelRewardMail(
    levelId: string,
    levelName: string,
    starCount: number,
    rewards: Omit<MailAttachment, 'state'>[]
): MailConfig {
    return {
        type: MailType.REWARD,
        sender: '系统',
        title: `关卡奖励 - ${levelName}`,
        content: `恭喜您通关关卡【${levelName}】，获得${starCount}星评价！`,
        expireDuration: 7 * 24 * 60 * 60,
        attachments: rewards,
        params: { levelId, starCount }
    };
}

/**
 * 创建成就奖励邮件配置
 */
export function createAchievementRewardMail(
    achievementId: string,
    achievementName: string,
    rewards: Omit<MailAttachment, 'state'>[]
): MailConfig {
    return {
        type: MailType.REWARD,
        sender: '系统',
        title: `成就奖励 - ${achievementName}`,
        content: `恭喜您完成成就【${achievementName}】，获得以下奖励：`,
        expireDuration: 7 * 24 * 60 * 60,
        attachments: rewards,
        params: { achievementId }
    };
}

/**
 * 创建排行榜奖励邮件配置
 */
export function createRankRewardMail(
    rankType: string,
    rankTypeName: string,
    rank: number,
    rewards: Omit<MailAttachment, 'state'>[]
): MailConfig {
    return {
        type: MailType.REWARD,
        sender: '系统',
        title: `${rankTypeName}排行榜奖励`,
        content: `恭喜您在${rankTypeName}排行榜中获得第${rank}名，获得以下奖励：`,
        expireDuration: 7 * 24 * 60 * 60,
        attachments: rewards,
        params: { rankType, rank }
    };
}

/**
 * 创建活动公告邮件配置
 */
export function createEventAnnouncementMail(
    eventName: string,
    eventDescription: string,
    startTime: string,
    endTime: string
): MailConfig {
    return {
        type: MailType.ANNOUNCEMENT,
        sender: '活动公告',
        title: `活动开启：${eventName}`,
        content: `${eventDescription}\n\n活动时间：${startTime} 至 ${endTime}`,
        expireDuration: 7 * 24 * 60 * 60,
        params: { eventName, startTime, endTime }
    };
}

/**
 * 创建维护公告邮件配置
 */
export function createMaintenanceMail(
    maintenanceTime: string,
    duration: number
): MailConfig {
    return {
        type: MailType.ANNOUNCEMENT,
        sender: '系统公告',
        title: '维护公告',
        content: `尊敬的玩家，游戏将于${maintenanceTime}进行维护，预计时长${duration}小时，请您提前做好准备。`,
        expireDuration: 3 * 24 * 60 * 60,
        params: { maintenanceTime, duration }
    };
}

/**
 * 创建战斗报告邮件配置
 */
export function createBattleReportMail(
    battleType: string,
    result: '胜利' | '失败',
    details: Record<string, any>
): MailConfig {
    return {
        type: MailType.BATTLE_REPORT,
        sender: '战斗报告',
        title: `战斗报告 - ${battleType}`,
        content: `您在${battleType}中${result}，详情请查看战斗回放。`,
        expireDuration: 3 * 24 * 60 * 60,
        params: { battleType, result, ...details }
    };
}

/**
 * 创建VIP等级奖励邮件配置
 */
export function createVIPRewardMail(
    vipLevel: number,
    rewards: Omit<MailAttachment, 'state'>[]
): MailConfig {
    return {
        type: MailType.REWARD,
        sender: '系统',
        title: `VIP${vipLevel}等级奖励`,
        content: `恭喜您的VIP等级提升到${vipLevel}级，获得以下奖励：`,
        expireDuration: 7 * 24 * 60 * 60,
        attachments: rewards,
        params: { vipLevel }
    };
}