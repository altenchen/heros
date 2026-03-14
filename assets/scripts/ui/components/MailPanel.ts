/**
 * 邮件面板
 * 显示邮件列表、邮件详情、附件领取
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Button, Sprite, Color, Prefab, instantiate, ScrollView } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { mailManager } from '../../mail';
import { MailType, MailState, MailEventType, MailData, MailAttachment } from '../../config/MailTypes';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 邮件类型图标 */
const MAIL_TYPE_ICONS: Record<MailType, string> = {
    [MailType.SYSTEM]: 'mail_system',
    [MailType.REWARD]: 'mail_reward',
    [MailType.FRIEND]: 'mail_friend',
    [MailType.GUILD]: 'mail_guild',
    [MailType.BATTLE]: 'mail_battle',
    [MailType.ANNOUNCEMENT]: 'mail_announcement',
    [MailType.BATTLE_REPORT]: 'mail_battle_report'
};

/** 邮件类型名称 */
const MAIL_TYPE_NAMES: Record<MailType, string> = {
    [MailType.SYSTEM]: '系统邮件',
    [MailType.REWARD]: '奖励邮件',
    [MailType.FRIEND]: '好友邮件',
    [MailType.GUILD]: '公会邮件',
    [MailType.BATTLE]: '战报邮件',
    [MailType.ANNOUNCEMENT]: '公告邮件',
    [MailType.BATTLE_REPORT]: '战斗报告'
};

@ccclass('MailPanel')
export class MailPanel extends UIPanel {
    // ==================== 顶部信息 ====================

    /** 未读数量标签 */
    @property(Label)
    unreadCountLabel: Label | null = null;

    /** 一键领取按钮 */
    @property(Button)
    claimAllButton: Button | null = null;

    /** 一键已读按钮 */
    @property(Button)
    readAllButton: Button | null = null;

    // ==================== 邮件列表 ====================

    /** 邮件滚动视图 */
    @property(ScrollView)
    mailScrollView: ScrollView | null = null;

    /** 邮件容器 */
    @property(Node)
    mailContainer: Node | null = null;

    /** 邮件项预制体 */
    @property(Prefab)
    mailItemPrefab: Prefab | null = null;

    // ==================== 邮件详情 ====================

    /** 详情面板 */
    @property(Node)
    detailPanel: Node | null = null;

    /** 发件人 */
    @property(Label)
    senderLabel: Label | null = null;

    /** 标题 */
    @property(Label)
    titleLabel: Label | null = null;

    /** 时间 */
    @property(Label)
    timeLabel: Label | null = null;

    /** 内容 */
    @property(Label)
    contentLabel: Label | null = null;

    /** 附件容器 */
    @property(Node)
    attachmentContainer: Node | null = null;

    /** 附件预制体 */
    @property(Prefab)
    attachmentPrefab: Prefab | null = null;

    /** 领取附件按钮 */
    @property(Button)
    claimAttachmentButton: Button | null = null;

    /** 删除邮件按钮 */
    @property(Button)
    deleteButton: Button | null = null;

    // ==================== 按钮 ====================

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    // ==================== 状态 ====================

    /** 当前选中的邮件ID */
    private _currentMailId: string = '';

    /** 当前选中的邮件数据 */
    private _currentMail: MailData | null = null;

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 2,
            cache: true,
            animationType: PanelAnimationType.SLIDE_RIGHT,
            animationDuration: 0.3
        });
    }

    /**
     * 面板打开
     */
    protected onOpen(): void {
        this._bindEvents();
        this._updateUI();
        this._hideDetailPanel();
    }

    /**
     * 面板关闭
     */
    protected onClose(): void {
        this._unbindEvents();
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(MailEventType.MAIL_RECEIVED, this._onMailReceived, this);
        EventCenter.on(MailEventType.MAIL_READ, this._onMailRead, this);
        EventCenter.on(MailEventType.ATTACHMENT_CLAIMED, this._onAttachmentClaimed, this);

        this.claimAllButton?.node.on(Button.EventType.CLICK, this._onClaimAllClick, this);
        this.readAllButton?.node.on(Button.EventType.CLICK, this._onReadAllClick, this);
        this.claimAttachmentButton?.node.on(Button.EventType.CLICK, this._onClaimAttachmentClick, this);
        this.deleteButton?.node.on(Button.EventType.CLICK, this._onDeleteClick, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this._onCloseClick, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(MailEventType.MAIL_RECEIVED, this._onMailReceived, this);
        EventCenter.off(MailEventType.MAIL_READ, this._onMailRead, this);
        EventCenter.off(MailEventType.ATTACHMENT_CLAIMED, this._onAttachmentClaimed, this);
    }

    /**
     * 更新UI
     */
    private _updateUI(): void {
        this._updateUnreadCount();
        this._updateMailList();
    }

    /**
     * 更新未读数量
     */
    private _updateUnreadCount(): void {
        const unreadCount = mailManager.getUnreadCount();

        if (this.unreadCountLabel) {
            this.unreadCountLabel.string = unreadCount > 0 ? `(${unreadCount})` : '';
        }

        if (this.claimAllButton) {
            this.claimAllButton.interactable = this._hasClaimableAttachments();
        }
    }

    /**
     * 检查是否有可领取附件
     */
    private _hasClaimableAttachments(): boolean {
        const result = mailManager.getMailList();
        return result.mails.some(mail =>
            mail.attachments && mail.attachments.length > 0 && !mail.attachmentsClaimed
        );
    }

    /**
     * 更新邮件列表
     */
    private _updateMailList(): void {
        const container = this.mailContainer;
        if (!container) return;

        container.removeAllChildren();

        const result = mailManager.getMailList();

        if (result.mails.length === 0) {
            this._showEmptyState();
            return;
        }

        result.mails.forEach((mail, index) => {
            const mailNode = this.mailItemPrefab
                ? instantiate(this.mailItemPrefab)
                : new Node(`Mail_${mail.mailId}`);

            mailNode.setPosition(0, -index * 80, 0);

            // 设置发件人
            const senderLabel = mailNode.getChildByName('Sender')?.getComponent(Label);
            if (senderLabel) {
                senderLabel.string = mail.sender;
            }

            // 设置标题
            const titleLabel = mailNode.getChildByName('Title')?.getComponent(Label);
            if (titleLabel) {
                titleLabel.string = mail.title;
                // 未读邮件加粗
                if (mail.state === MailState.UNREAD) {
                    titleLabel.color = new Color(255, 215, 0);
                }
            }

            // 设置时间
            const timeLabel = mailNode.getChildByName('Time')?.getComponent(Label);
            if (timeLabel) {
                timeLabel.string = this._formatTime(mail.sendTime);
            }

            // 附件图标
            const attachmentIcon = mailNode.getChildByName('AttachmentIcon');
            if (attachmentIcon) {
                attachmentIcon.active = mail.attachments && mail.attachments.length > 0 && !mail.attachmentsClaimed;
            }

            // 未读标记
            const unreadMark = mailNode.getChildByName('UnreadMark');
            if (unreadMark) {
                unreadMark.active = mail.state === MailState.UNREAD;
            }

            // 点击查看详情
            mailNode.on(Node.EventType.TOUCH_END, () => {
                this._showMailDetail(mail);
            });

            container.addChild(mailNode);
        });
    }

    /**
     * 显示空状态
     */
    private _showEmptyState(): void {
        const container = this.mailContainer;
        if (!container) return;

        const emptyNode = new Node('EmptyState');
        const emptyLabel = emptyNode.addComponent(Label);
        emptyLabel.string = '暂无邮件';
        emptyLabel.fontSize = 24;
        emptyLabel.color = new Color(150, 150, 150);
        container.addChild(emptyNode);
    }

    /**
     * 显示邮件详情
     */
    private _showMailDetail(mail: MailData): void {
        if (!this.detailPanel) return;

        this._currentMailId = mail.mailId;
        this._currentMail = mail;
        this.detailPanel.active = true;

        // 标记已读
        if (mail.state === MailState.UNREAD) {
            mailManager.markAsRead(mail.mailId);
        }

        if (this.senderLabel) {
            this.senderLabel.string = mail.sender;
        }

        if (this.titleLabel) {
            this.titleLabel.string = mail.title;
        }

        if (this.timeLabel) {
            this.timeLabel.string = this._formatTime(mail.sendTime);
        }

        if (this.contentLabel) {
            this.contentLabel.string = mail.content;
        }

        // 更新附件
        this._updateAttachments(mail);

        // 更新按钮状态
        if (this.claimAttachmentButton) {
            const hasAttachments = mail.attachments && mail.attachments.length > 0;
            const notClaimed = !mail.attachmentsClaimed;
            this.claimAttachmentButton.interactable = hasAttachments && notClaimed;
            this.claimAttachmentButton.node.active = hasAttachments;
        }

        if (this.deleteButton) {
            // 有附件未领取时不能删除
            this.deleteButton.interactable = !mail.attachments ||
                mail.attachments.length === 0 ||
                mail.attachmentsClaimed;
        }
    }

    /**
     * 更新附件列表
     */
    private _updateAttachments(mail: MailData): void {
        if (!this.attachmentContainer) return;

        this.attachmentContainer.removeAllChildren();

        if (!mail.attachments || mail.attachments.length === 0) {
            this.attachmentContainer.active = false;
            return;
        }

        this.attachmentContainer.active = true;

        mail.attachments.forEach((attachment, index) => {
            const attachNode = this.attachmentPrefab
                ? instantiate(this.attachmentPrefab)
                : new Node(`Attachment_${index}`);

            const nameLabel = attachNode.getChildByName('Name')?.getComponent(Label);
            if (nameLabel) {
                nameLabel.string = this._formatAttachmentName(attachment);
            }

            const countLabel = attachNode.getChildByName('Count')?.getComponent(Label);
            if (countLabel) {
                countLabel.string = `x${attachment.amount}`;
            }

            // 已领取显示灰色
            if (mail.attachmentsClaimed) {
                if (nameLabel) nameLabel.color = new Color(150, 150, 150);
                if (countLabel) countLabel.color = new Color(150, 150, 150);
            }

            this.attachmentContainer.addChild(attachNode);
        });
    }

    /**
     * 格式化附件名称
     */
    private _formatAttachmentName(attachment: MailAttachment): string {
        const typeNames: Record<string, string> = {
            'resource': '资源',
            'item': '道具',
            'hero': '英雄',
            'skin': '皮肤'
        };

        const name = typeNames[attachment.type] || attachment.type;
        return `${name}: ${attachment.itemId}`;
    }

    /**
     * 隐藏详情面板
     */
    private _hideDetailPanel(): void {
        if (this.detailPanel) {
            this.detailPanel.active = false;
        }
        this._currentMailId = '';
        this._currentMail = null;
    }

    /**
     * 一键领取点击
     */
    private _onClaimAllClick(): void {
        const result = mailManager.claimAllAttachments();
        if (result.success) {
            this._showToast(`领取成功！共${result.totalItems}个物品`);
            this._updateUI();
            this._hideDetailPanel();
        } else {
            this._showToast(result.error || '领取失败');
        }
    }

    /**
     * 一键已读点击
     */
    private _onReadAllClick(): void {
        mailManager.markAllAsRead();
        this._updateUI();
        this._showToast('全部标记已读');
    }

    /**
     * 领取附件点击
     */
    private _onClaimAttachmentClick(): void {
        if (!this._currentMailId) return;

        const result = mailManager.claimAttachment(this._currentMailId);
        if (result.success) {
            this._showToast('领取成功！');
            this._updateUI();
            // 刷新详情
            if (this._currentMail) {
                this._currentMail.attachmentsClaimed = true;
                this._updateAttachments(this._currentMail);
                if (this.claimAttachmentButton) {
                    this.claimAttachmentButton.interactable = false;
                }
                if (this.deleteButton) {
                    this.deleteButton.interactable = true;
                }
            }
        } else {
            this._showToast(result.error || '领取失败');
        }
    }

    /**
     * 删除点击
     */
    private _onDeleteClick(): void {
        if (!this._currentMailId) return;

        mailManager.deleteMail(this._currentMailId);
        this._hideDetailPanel();
        this._updateUI();
        this._showToast('邮件已删除');
    }

    /**
     * 关闭点击
     */
    private _onCloseClick(): void {
        this.hide();
    }

    /**
     * 新邮件回调
     */
    private _onMailReceived(data: { mail: MailData }): void {
        this._updateUI();
        this._showToast('收到新邮件');
    }

    /**
     * 邮件已读回调
     */
    private _onMailRead(data: { mailId: string }): void {
        this._updateUnreadCount();
    }

    /**
     * 附件领取回调
     */
    private _onAttachmentClaimed(data: { mailId: string }): void {
        this._updateUnreadCount();
    }

    /**
     * 格式化时间
     */
    private _formatTime(timestamp: number): string {
        const now = Date.now();
        const diff = now - timestamp;

        if (diff < 60000) {
            return '刚刚';
        } else if (diff < 3600000) {
            return `${Math.floor(diff / 60000)}分钟前`;
        } else if (diff < 86400000) {
            return `${Math.floor(diff / 3600000)}小时前`;
        } else {
            const date = new Date(timestamp);
            return `${date.getMonth() + 1}/${date.getDate()}`;
        }
    }

    /**
     * 显示提示
     */
    private _showToast(message: string): void {
        console.log(`[MailPanel] ${message}`);
    }
}