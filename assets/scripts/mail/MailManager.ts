/**
 * 邮件管理器
 * 管理邮件的接收、阅读、领取、删除
 * 遵循阿里巴巴开发者手册规范
 */

import {
    MailData,
    MailConfig,
    MailType,
    MailState,
    MailAttachment,
    AttachmentState,
    MailSettings,
    MailEventType,
    MailEventData,
    MailListResult,
    ClaimAttachmentResult,
    DEFAULT_MAIL_SETTINGS
} from '../config/MailTypes';
import {
    createWelcomeMail,
    createDailyRewardMail
} from '../config/mail.json';
import { EventCenter } from '../utils/EventTarget';
import { playerDataManager } from '../utils/PlayerDataManager';
import { rewardManager, RewardConfig } from '../utils/RewardManager';

/**
 * 邮件管理器
 * 单例模式
 */
export class MailManager {
    private static _instance: MailManager | null = null;

    /** 邮件列表 */
    private _mails: Map<string, MailData> = new Map();

    /** 邮件设置 */
    private _settings: MailSettings = { ...DEFAULT_MAIL_SETTINGS };

    /** 存储键 */
    private readonly SETTINGS_KEY = 'hmm_legacy_mail';

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): MailManager {
        if (!MailManager._instance) {
            MailManager._instance = new MailManager();
        }
        return MailManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this._checkExpiredMails();
        console.log('[MailManager] 初始化完成');
    }

    /**
     * 检查过期邮件
     */
    private _checkExpiredMails(): void {
        const now = Date.now();
        const expiredMailIds: string[] = [];

        this._mails.forEach((mail, mailId) => {
            if (mail.expireTime > 0 && mail.expireTime < now) {
                expiredMailIds.push(mailId);
            }
        });

        // 删除过期邮件
        expiredMailIds.forEach(mailId => {
            const mail = this._mails.get(mailId);
            this._mails.delete(mailId);

            // 发送过期事件
            const eventData: MailEventData = { mailId, mail };
            EventCenter.emit(MailEventType.MAIL_EXPIRED, eventData);

            console.log(`[MailManager] 邮件过期：${mailId}`);
        });

        if (expiredMailIds.length > 0) {
            this._notifyMailListUpdate();
        }
    }

    /**
     * 生成唯一邮件ID
     */
    private _generateMailId(): string {
        return `mail_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 发送邮件
     */
    sendMail(config: MailConfig): MailData | null {
        // 检查邮件数量限制
        if (this._mails.size >= this._settings.maxMailCount) {
            console.warn('[MailManager] 邮件数量已达上限');
            // 删除最旧的已读邮件
            this._deleteOldestReadMail();
        }

        const now = Date.now();
        const expireDuration = config.expireDuration || this._settings.defaultExpireDuration;

        const mail: MailData = {
            mailId: this._generateMailId(),
            type: config.type,
            sender: config.sender,
            title: config.title,
            content: config.content,
            sendTime: now,
            expireTime: expireDuration > 0 ? now + expireDuration * 1000 : 0,
            attachments: (config.attachments || []).map(a => ({
                ...a,
                state: AttachmentState.UNCLAIMED
            })),
            state: MailState.UNREAD,
            hasAttachment: (config.attachments?.length || 0) > 0,
            params: config.params
        };

        this._mails.set(mail.mailId, mail);

        // 发送收到邮件事件
        const eventData: MailEventData = { mailId: mail.mailId, mail };
        EventCenter.emit(MailEventType.MAIL_RECEIVED, eventData);

        console.log(`[MailManager] 收到新邮件：${mail.title}`);

        this._notifyMailListUpdate();

        return mail;
    }

    /**
     * 批量发送邮件
     */
    sendMails(configs: MailConfig[]): MailData[] {
        const mails: MailData[] = [];
        configs.forEach(config => {
            const mail = this.sendMail(config);
            if (mail) {
                mails.push(mail);
            }
        });
        return mails;
    }

    /**
     * 删除最旧的已读邮件
     */
    private _deleteOldestReadMail(): void {
        let oldestMail: MailData | null = null;

        this._mails.forEach(mail => {
            if (mail.state === MailState.READ || mail.state === MailState.CLAIMED) {
                if (!oldestMail || mail.sendTime < oldestMail.sendTime) {
                    oldestMail = mail;
                }
            }
        });

        if (oldestMail) {
            this._mails.delete(oldestMail.mailId);
            console.log(`[MailManager] 删除最旧已读邮件：${oldestMail.title}`);
        }
    }

    /**
     * 发送欢迎邮件
     */
    sendWelcomeMail(): MailData | null {
        const config = createWelcomeMail();
        return this.sendMail(config);
    }

    /**
     * 发送每日登录奖励邮件
     */
    sendDailyRewardMail(day: number): MailData | null {
        const config = createDailyRewardMail(day);
        return this.sendMail(config);
    }

    /**
     * 获取邮件列表
     */
    getMailList(type?: MailType, offset: number = 0, limit: number = 20): MailListResult {
        let mails = Array.from(this._mails.values());

        // 过滤类型
        if (type) {
            mails = mails.filter(m => m.type === type);
        }

        // 过滤已删除
        mails = mails.filter(m => m.state !== MailState.DELETED);

        // 排序：未读优先，然后按时间倒序
        mails.sort((a, b) => {
            if (a.state === MailState.UNREAD && b.state !== MailState.UNREAD) {
                return -1;
            }
            if (a.state !== MailState.UNREAD && b.state === MailState.UNREAD) {
                return 1;
            }
            return b.sendTime - a.sendTime;
        });

        const total = mails.length;
        const unreadCount = mails.filter(m => m.state === MailState.UNREAD).length;

        // 分页
        mails = mails.slice(offset, offset + limit);

        return {
            mails,
            total,
            unreadCount,
            hasMore: offset + mails.length < total
        };
    }

    /**
     * 获取邮件详情
     */
    getMail(mailId: string): MailData | undefined {
        return this._mails.get(mailId);
    }

    /**
     * 标记邮件已读
     */
    markAsRead(mailId: string): boolean {
        const mail = this._mails.get(mailId);
        if (!mail) {
            return false;
        }

        if (mail.state === MailState.UNREAD) {
            mail.state = MailState.READ;

            // 发送已读事件
            const eventData: MailEventData = { mailId, mail };
            EventCenter.emit(MailEventType.MAIL_READ, eventData);

            console.log(`[MailManager] 邮件已读：${mail.title}`);
            this._notifyMailListUpdate();
        }

        return true;
    }

    /**
     * 批量标记已读
     */
    markAllAsRead(type?: MailType): number {
        let count = 0;

        this._mails.forEach(mail => {
            if (mail.state === MailState.UNREAD) {
                if (!type || mail.type === type) {
                    mail.state = MailState.READ;
                    count++;
                }
            }
        });

        if (count > 0) {
            console.log(`[MailManager] 批量标记已读：${count}封`);
            this._notifyMailListUpdate();
        }

        return count;
    }

    /**
     * 领取附件
     */
    claimAttachment(mailId: string): ClaimAttachmentResult {
        const mail = this._mails.get(mailId);

        if (!mail) {
            return {
                success: false,
                mailId,
                claimedAttachments: [],
                error: '邮件不存在'
            };
        }

        if (!mail.hasAttachment) {
            return {
                success: false,
                mailId,
                claimedAttachments: [],
                error: '邮件没有附件'
            };
        }

        // 获取未领取的附件
        const unclaimedAttachments = mail.attachments.filter(
            a => a.state === AttachmentState.UNCLAIMED
        );

        if (unclaimedAttachments.length === 0) {
            return {
                success: false,
                mailId,
                claimedAttachments: [],
                error: '没有可领取的附件'
            };
        }

        // 发放奖励
        const claimedAttachments: MailAttachment[] = [];

        unclaimedAttachments.forEach(attachment => {
            // 构建奖励配置
            const reward: RewardConfig = {
                type: attachment.type as any,
                itemId: attachment.itemId,
                amount: attachment.amount
            };

            const result = rewardManager.grantRewards([reward]);

            if (result[0]?.success) {
                attachment.state = AttachmentState.CLAIMED;
                claimedAttachments.push(attachment);
            } else {
                console.warn(`[MailManager] 发放附件失败：${attachment.type} ${attachment.itemId}`);
            }
        });

        // 检查是否所有附件都已领取
        const allClaimed = mail.attachments.every(
            a => a.state === AttachmentState.CLAIMED
        );

        if (allClaimed) {
            mail.state = MailState.CLAIMED;

            // 自动删除已领取的奖励邮件
            if (this._settings.autoDeleteClaimed && mail.type === MailType.REWARD) {
                setTimeout(() => {
                    this.deleteMail(mailId);
                }, 1000);
            }
        }

        // 发送领取事件
        const eventData: MailEventData = {
            mailId,
            attachments: claimedAttachments
        };
        EventCenter.emit(MailEventType.ATTACHMENT_CLAIMED, eventData);

        console.log(`[MailManager] 领取附件：${mail.title}，获得${claimedAttachments.length}个奖励`);

        this._notifyMailListUpdate();

        return {
            success: true,
            mailId,
            claimedAttachments
        };
    }

    /**
     * 一键领取所有附件
     */
    claimAllAttachments(): ClaimAttachmentResult[] {
        const results: ClaimAttachmentResult[] = [];

        this._mails.forEach(mail => {
            if (mail.hasAttachment && mail.state !== MailState.CLAIMED) {
                const hasUnclaimed = mail.attachments.some(
                    a => a.state === AttachmentState.UNCLAIMED
                );
                if (hasUnclaimed) {
                    const result = this.claimAttachment(mail.mailId);
                    if (result.success) {
                        results.push(result);
                    }
                }
            }
        });

        return results;
    }

    /**
     * 删除邮件
     */
    deleteMail(mailId: string): boolean {
        const mail = this._mails.get(mailId);
        if (!mail) {
            return false;
        }

        // 未读邮件和有未领取附件的邮件不能删除
        if (mail.state === MailState.UNREAD) {
            console.warn('[MailManager] 未读邮件不能删除');
            return false;
        }

        const hasUnclaimedAttachment = mail.attachments.some(
            a => a.state === AttachmentState.UNCLAIMED
        );
        if (hasUnclaimedAttachment) {
            console.warn('[MailManager] 有未领取附件的邮件不能删除');
            return false;
        }

        this._mails.delete(mailId);

        // 发送删除事件
        const eventData: MailEventData = { mailId, mail };
        EventCenter.emit(MailEventType.MAIL_DELETED, eventData);

        console.log(`[MailManager] 删除邮件：${mail.title}`);
        this._notifyMailListUpdate();

        return true;
    }

    /**
     * 批量删除已读邮件
     */
    deleteReadMails(): number {
        let count = 0;
        const mailIds: string[] = [];

        this._mails.forEach((mail, mailId) => {
            if (mail.state === MailState.READ || mail.state === MailState.CLAIMED) {
                const hasUnclaimedAttachment = mail.attachments.some(
                    a => a.state === AttachmentState.UNCLAIMED
                );
                if (!hasUnclaimedAttachment) {
                    mailIds.push(mailId);
                }
            }
        });

        mailIds.forEach(mailId => {
            if (this.deleteMail(mailId)) {
                count++;
            }
        });

        return count;
    }

    /**
     * 获取未读邮件数量
     */
    getUnreadCount(type?: MailType): number {
        let count = 0;

        this._mails.forEach(mail => {
            if (mail.state === MailState.UNREAD) {
                if (!type || mail.type === type) {
                    count++;
                }
            }
        });

        return count;
    }

    /**
     * 检查是否有未领取附件
     */
    hasUnclaimedAttachments(): boolean {
        for (const mail of this._mails.values()) {
            if (mail.attachments.some(a => a.state === AttachmentState.UNCLAIMED)) {
                return true;
            }
        }
        return false;
    }

    /**
     * 通知邮件列表更新
     */
    private _notifyMailListUpdate(): void {
        const result = this.getMailList();
        const eventData: MailEventData = {
            mails: result.mails,
            unreadCount: result.unreadCount
        };
        EventCenter.emit(MailEventType.MAIL_LIST_UPDATE, eventData);
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            mails: Array.from(this._mails.values())
        };
        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);
            if (parsed.mails) {
                this._mails.clear();
                parsed.mails.forEach((mail: MailData) => {
                    this._mails.set(mail.mailId, mail);
                });
            }
            // 检查过期邮件
            this._checkExpiredMails();
            console.log('[MailManager] 数据加载完成');
        } catch (e) {
            console.error('[MailManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._mails.clear();
    }
}

// 导出单例
export const mailManager = MailManager.getInstance();