/**
 * 邮件系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

/**
 * 邮件类型
 */
export enum MailType {
    /** 系统邮件 */
    SYSTEM = 'system',
    /** 奖励邮件 */
    REWARD = 'reward',
    /** 公告邮件 */
    ANNOUNCEMENT = 'announcement',
    /** 好友邮件 */
    FRIEND = 'friend',
    /** 公会邮件 */
    GUILD = 'guild',
    /** 战斗报告 */
    BATTLE_REPORT = 'battle_report',
    /** 战斗邮件（别名） */
    BATTLE = 'battle'
}

/**
 * 邮件状态
 */
export enum MailState {
    /** 未读 */
    UNREAD = 'unread',
    /** 已读 */
    READ = 'read',
    /** 已领取（奖励邮件） */
    CLAIMED = 'claimed',
    /** 已删除 */
    DELETED = 'deleted'
}

/**
 * 附件状态
 */
export enum AttachmentState {
    /** 未领取 */
    UNCLAIMED = 'unclaimed',
    /** 已领取 */
    CLAIMED = 'claimed',
    /** 已过期 */
    EXPIRED = 'expired'
}

/**
 * 附件配置
 */
export interface MailAttachment {
    /** 奖励类型 */
    type: string;
    /** 物品ID */
    itemId?: string;
    /** 数量 */
    amount: number;
    /** 状态 */
    state: AttachmentState;
}

/**
 * 邮件数据
 */
export interface MailData {
    /** 邮件ID */
    mailId: string;
    /** ID（别名） */
    id?: string;
    /** 邮件类型 */
    type: MailType;
    /** 发送者 */
    sender: string;
    /** 标题 */
    title: string;
    /** 内容 */
    content: string;
    /** 发送时间 */
    sendTime: number;
    /** 过期时间 (0表示永不过期) */
    expireTime: number;
    /** 附件列表 */
    attachments: MailAttachment[];
    /** 附件是否已领取 */
    attachmentsClaimed?: boolean;
    /** 邮件状态 */
    state: MailState;
    /** 是否有附件 */
    hasAttachment: boolean;
    /** 额外参数 */
    params?: Record<string, any>;
}

/**
 * 邮件配置（用于创建邮件）
 */
export interface MailConfig {
    /** 邮件类型 */
    type: MailType;
    /** 发送者 */
    sender: string;
    /** 标题 */
    title: string;
    /** 内容 */
    content: string;
    /** 过期时间（秒，0表示使用默认过期时间） */
    expireDuration?: number;
    /** 附件 */
    attachments?: Omit<MailAttachment, 'state'>[];
    /** 额外参数 */
    params?: Record<string, any>;
}

/**
 * 系统邮件模板配置
 */
export interface MailTemplate {
    /** 模板ID */
    templateId: string;
    /** 邮件类型 */
    type: MailType;
    /** 发送者 */
    sender: string;
    /** 标题模板 */
    titleTemplate: string;
    /** 内容模板 */
    contentTemplate: string;
    /** 默认过期时间（秒） */
    defaultExpireDuration: number;
    /** 是否有附件 */
    hasAttachment: boolean;
}

/**
 * 邮件设置
 */
export interface MailSettings {
    /** 最大邮件数量 */
    maxMailCount: number;
    /** 默认过期时间（秒） */
    defaultExpireDuration: number;
    /** 未读邮件保留时间（秒） */
    unreadKeepDuration: number;
    /** 已读邮件保留时间（秒） */
    readKeepDuration: number;
    /** 是否自动删除已领取的奖励邮件 */
    autoDeleteClaimed: boolean;
}

/**
 * 邮件事件类型
 */
export enum MailEventType {
    /** 收到新邮件 */
    MAIL_RECEIVED = 'mail_received',
    /** 邮件已读 */
    MAIL_READ = 'mail_read',
    /** 附件已领取 */
    ATTACHMENT_CLAIMED = 'attachment_claimed',
    /** 邮件已删除 */
    MAIL_DELETED = 'mail_deleted',
    /** 邮件过期 */
    MAIL_EXPIRED = 'mail_expired',
    /** 邮件列表更新 */
    MAIL_LIST_UPDATE = 'mail_list_update'
}

/**
 * 邮件事件数据
 */
export interface MailEventData {
    /** 邮件ID */
    mailId?: string;
    /** 邮件数据 */
    mail?: MailData;
    /** 邮件列表 */
    mails?: MailData[];
    /** 附件 */
    attachments?: MailAttachment[];
    /** 未读数量 */
    unreadCount?: number;
}

/**
 * 邮件列表结果
 */
export interface MailListResult {
    /** 邮件列表 */
    mails: MailData[];
    /** 总数 */
    total: number;
    /** 未读数量 */
    unreadCount: number;
    /** 是否有更多 */
    hasMore: boolean;
}

/**
 * 领取附件结果
 */
export interface ClaimAttachmentResult {
    /** 是否成功 */
    success: boolean;
    /** 邮件ID */
    mailId: string;
    /** 已领取的附件 */
    claimedAttachments: MailAttachment[];
    /** 错误信息 */
    error?: string;
}

/**
 * 一键领取所有附件结果
 */
export interface ClaimAllAttachmentsResult {
    /** 是否成功 */
    success: boolean;
    /** 总物品数 */
    totalItems: number;
    /** 错误信息 */
    error?: string;
}

/**
 * 默认邮件设置
 */
export const DEFAULT_MAIL_SETTINGS: MailSettings = {
    maxMailCount: 100,
    defaultExpireDuration: 7 * 24 * 60 * 60, // 7天
    unreadKeepDuration: 30 * 24 * 60 * 60, // 30天
    readKeepDuration: 7 * 24 * 60 * 60, // 7天
    autoDeleteClaimed: true
};