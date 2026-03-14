/**
 * 邮件系统模块导出
 * 遵循阿里巴巴开发者手册规范
 */

export { MailManager, mailManager } from './MailManager';
export {
    MailType,
    MailState,
    MailData,
    MailConfig,
    MailAttachment,
    AttachmentState,
    MailEventType,
    MailEventData,
    MailListResult,
    ClaimAttachmentResult,
    DEFAULT_MAIL_SETTINGS
} from '../config/MailTypes';
export {
    mailTemplates,
    getMailTemplate,
    createWelcomeMail,
    createDailyRewardMail,
    createLevelRewardMail,
    createAchievementRewardMail,
    createRankRewardMail,
    createEventAnnouncementMail,
    createMaintenanceMail,
    createBattleReportMail,
    createVIPRewardMail
} from '../config/mail.json';