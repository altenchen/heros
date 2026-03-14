/**
 * 社交面板
 * 显示好友、公会、聊天等功能
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Sprite, SpriteFrame, Prefab, instantiate, ScrollView, Vec3, Color, EditBox, Button } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { friendManager, FriendEventType } from '../../social/FriendManager';
import { guildManager, GuildEventType } from '../../social/GuildManager';
import { chatManager, ChatEventType } from '../../social/ChatManager';
import { FriendInfo, FriendStatus, GuildRank, ChatChannelType } from '../../config/SocialTypes';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 好友状态颜色 */
const STATUS_COLORS: Record<FriendStatus, Color> = {
    [FriendStatus.ONLINE]: new Color(100, 255, 100),
    [FriendStatus.OFFLINE]: new Color(150, 150, 150),
    [FriendStatus.BUSY]: new Color(255, 150, 50),
    [FriendStatus.AWAY]: new Color(255, 255, 100)
};

/** 职位颜色 */
const RANK_COLORS: Record<GuildRank, Color> = {
    [GuildRank.LEADER]: new Color(255, 215, 0),
    [GuildRank.VICE_LEADER]: new Color(255, 150, 50),
    [GuildRank.ELDER]: new Color(100, 200, 255),
    [GuildRank.MEMBER]: new Color(255, 255, 255)
};

/**
 * 社交面板标签页
 */
enum SocialTab {
    FRIEND = 'friend',
    GUILD = 'guild',
    CHAT = 'chat'
}

/**
 * 社交面板
 */
@ccclass('SocialPanel')
export class SocialPanel extends UIPanel {
    // ==================== 标签页 ====================

    /** 好友标签 */
    @property(Node)
    friendTab: Node | null = null;

    /** 公会标签 */
    @property(Node)
    guildTab: Node | null = null;

    /** 聊天标签 */
    @property(Node)
    chatTab: Node | null = null;

    // ==================== 好友区域 ====================

    /** 好友列表容器 */
    @property(Node)
    friendContainer: Node | null = null;

    /** 好友项预制体 */
    @property(Prefab)
    friendItemPrefab: Prefab | null = null;

    /** 好友数量标签 */
    @property(Label)
    friendCountLabel: Label | null = null;

    /** 添加好友按钮 */
    @property(Node)
    addFriendButton: Node | null = null;

    // ==================== 公会区域 ====================

    /** 公会信息容器 */
    @property(Node)
    guildInfoContainer: Node | null = null;

    /** 公会名称标签 */
    @property(Label)
    guildNameLabel: Label | null = null;

    /** 公会成员列表 */
    @property(Node)
    guildMemberContainer: Node | null = null;

    /** 公会成员项预制体 */
    @property(Prefab)
    guildMemberPrefab: Prefab | null = null;

    /** 创建公会按钮 */
    @property(Node)
    createGuildButton: Node | null = null;

    // ==================== 聊天区域 ====================

    /** 聊天消息列表 */
    @property(ScrollView)
    chatScrollView: ScrollView | null = null;

    /** 聊天内容容器 */
    @property(Node)
    chatContent: Node | null = null;

    /** 聊天消息预制体 */
    @property(Prefab)
    chatMessagePrefab: Prefab | null = null;

    /** 聊天输入框 */
    @property(EditBox)
    chatInput: EditBox | null = null;

    /** 发送按钮 */
    @property(Node)
    sendButton: Node | null = null;

    /** 频道选择按钮组 */
    @property(Node)
    channelButtons: Node | null = null;

    // ==================== 底部 ====================

    /** 关闭按钮 */
    @property(Node)
    closeButton: Node | null = null;

    // ==================== 状态 ====================

    /** 当前标签页 */
    private _currentTab: SocialTab = SocialTab.FRIEND;

    /** 当前聊天频道 */
    private _currentChannel: ChatChannelType = ChatChannelType.WORLD;

    /** 好友项节点列表 */
    private _friendNodes: Node[] = [];

    /** 成员项节点列表 */
    private _memberNodes: Node[] = [];

    /** 消息节点列表 */
    private _messageNodes: Node[] = [];

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 2,
            cache: true,
            animationType: PanelAnimationType.SLIDE_LEFT,
            animationDuration: 0.3
        });
    }

    /**
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);

        this._setupTabs();
        this._selectTab(SocialTab.FRIEND);
        this._setupButtons();
        this._bindEvents();
    }

    /**
     * 设置标签页
     */
    private _setupTabs(): void {
        const tabs = [
            { node: this.friendTab, tab: SocialTab.FRIEND },
            { node: this.guildTab, tab: SocialTab.GUILD },
            { node: this.chatTab, tab: SocialTab.CHAT }
        ];

        tabs.forEach(({ node, tab }) => {
            if (node) {
                node.off(Node.EventType.TOUCH_END);
                node.on(Node.EventType.TOUCH_END, () => {
                    this._selectTab(tab);
                });
            }
        });
    }

    /**
     * 选择标签页
     */
    private _selectTab(tab: SocialTab): void {
        this._currentTab = tab;

        // 更新标签高亮
        this._updateTabHighlight();

        // 显示对应内容
        if (this.friendContainer) {
            this.friendContainer.active = tab === SocialTab.FRIEND;
        }
        if (this.guildInfoContainer) {
            this.guildInfoContainer.active = tab === SocialTab.GUILD;
        }
        if (this.chatScrollView) {
            this.chatScrollView.node.active = tab === SocialTab.CHAT;
        }
        if (this.chatInput) {
            this.chatInput.node.active = tab === SocialTab.CHAT;
        }
        if (this.sendButton) {
            this.sendButton.active = tab === SocialTab.CHAT;
        }

        // 刷新内容
        switch (tab) {
            case SocialTab.FRIEND:
                this._updateFriendList();
                break;
            case SocialTab.GUILD:
                this._updateGuildInfo();
                break;
            case SocialTab.CHAT:
                this._updateChatMessages();
                break;
        }
    }

    /**
     * 更新标签高亮
     */
    private _updateTabHighlight(): void {
        const tabs = [
            { node: this.friendTab, tab: SocialTab.FRIEND },
            { node: this.guildTab, tab: SocialTab.GUILD },
            { node: this.chatTab, tab: SocialTab.CHAT }
        ];

        tabs.forEach(({ node, tab }) => {
            if (node) {
                const label = node.getComponentInChildren(Label);
                if (label) {
                    label.color = this._currentTab === tab
                        ? new Color(255, 255, 100)
                        : new Color(255, 255, 255);
                }
            }
        });
    }

    /**
     * 更新好友列表
     */
    private _updateFriendList(): void {
        if (!this.friendContainer) {
            return;
        }

        // 清空现有项
        this._friendNodes.forEach(node => node.destroy());
        this._friendNodes = [];

        const friends = friendManager.getFriends();

        // 更新数量
        if (this.friendCountLabel) {
            this.friendCountLabel.string = `好友 (${friends.length}/50)`;
        }

        // 排序：在线优先
        friends.sort((a, b) => {
            if (a.status !== b.status) {
                return a.status === FriendStatus.ONLINE ? -1 : 1;
            }
            return a.playerName.localeCompare(b.playerName);
        });

        friends.forEach((friend, index) => {
            const node = this._createFriendItem(friend, index);
            this._friendNodes.push(node);
        });
    }

    /**
     * 创建好友项
     */
    private _createFriendItem(friend: FriendInfo, index: number): Node {
        const node = this.friendItemPrefab
            ? instantiate(this.friendItemPrefab)
            : new Node(`Friend_${friend.playerId}`);

        node.setPosition(new Vec3(0, -index * 60, 0));
        this.friendContainer!.addChild(node);

        // 设置名称
        const nameLabel = node.getChildByName('Name')?.getComponent(Label);
        if (nameLabel) {
            nameLabel.string = friend.remark || friend.playerName;
        }

        // 设置等级
        const levelLabel = node.getChildByName('Level')?.getComponent(Label);
        if (levelLabel) {
            levelLabel.string = `Lv.${friend.level}`;
        }

        // 设置状态
        const statusLabel = node.getChildByName('Status')?.getComponent(Label);
        if (statusLabel) {
            const statusTexts: Record<FriendStatus, string> = {
                [FriendStatus.ONLINE]: '在线',
                [FriendStatus.OFFLINE]: '离线',
                [FriendStatus.BUSY]: '忙碌',
                [FriendStatus.AWAY]: '离开'
            };
            statusLabel.string = statusTexts[friend.status];
            statusLabel.color = STATUS_COLORS[friend.status];
        }

        // 设置亲密度
        const intimacyLabel = node.getChildByName('Intimacy')?.getComponent(Label);
        if (intimacyLabel) {
            intimacyLabel.string = `亲密度: ${friend.intimacy}`;
        }

        // 设置操作按钮
        const giftButton = node.getChildByName('GiftButton');
        if (giftButton) {
            giftButton.off(Node.EventType.TOUCH_END);
            giftButton.on(Node.EventType.TOUCH_END, () => {
                this._onGiftStamina(friend.playerId);
            });
        }

        const chatButton = node.getChildByName('ChatButton');
        if (chatButton) {
            chatButton.off(Node.EventType.TOUCH_END);
            chatButton.on(Node.EventType.TOUCH_END, () => {
                this._onStartPrivateChat(friend.playerId);
            });
        }

        return node;
    }

    /**
     * 更新公会信息
     */
    private _updateGuildInfo(): void {
        const guildInfo = guildManager.getGuildInfo();

        if (!guildInfo) {
            // 未加入公会
            if (this.guildNameLabel) {
                this.guildNameLabel.string = '未加入公会';
            }
            if (this.createGuildButton) {
                this.createGuildButton.active = true;
            }
            return;
        }

        // 显示公会信息
        if (this.guildNameLabel) {
            this.guildNameLabel.string = `${guildInfo.name} (Lv.${guildInfo.level})`;
        }

        if (this.createGuildButton) {
            this.createGuildButton.active = false;
        }

        // 更新成员列表
        this._updateGuildMembers();
    }

    /**
     * 更新公会成员列表
     */
    private _updateGuildMembers(): void {
        if (!this.guildMemberContainer) {
            return;
        }

        this._memberNodes.forEach(node => node.destroy());
        this._memberNodes = [];

        const members = guildManager.getMembers();

        // 按职位排序
        const rankOrder = [GuildRank.LEADER, GuildRank.VICE_LEADER, GuildRank.ELDER, GuildRank.MEMBER];
        members.sort((a, b) => {
            return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
        });

        members.forEach((member, index) => {
            const node = this._createMemberItem(member, index);
            this._memberNodes.push(node);
        });
    }

    /**
     * 创建成员项
     */
    private _createMemberItem(member: any, index: number): Node {
        const node = this.guildMemberPrefab
            ? instantiate(this.guildMemberPrefab)
            : new Node(`Member_${member.playerId}`);

        node.setPosition(new Vec3(0, -index * 50, 0));
        this.guildMemberContainer!.addChild(node);

        // 设置名称
        const nameLabel = node.getChildByName('Name')?.getComponent(Label);
        if (nameLabel) {
            nameLabel.string = member.playerName;
            nameLabel.color = RANK_COLORS[member.rank];
        }

        // 设置职位
        const rankLabel = node.getChildByName('Rank')?.getComponent(Label);
        if (rankLabel) {
            const rankNames: Record<GuildRank, string> = {
                [GuildRank.LEADER]: '会长',
                [GuildRank.VICE_LEADER]: '副会长',
                [GuildRank.ELDER]: '长老',
                [GuildRank.MEMBER]: '成员'
            };
            rankLabel.string = rankNames[member.rank];
        }

        // 设置贡献
        const contributionLabel = node.getChildByName('Contribution')?.getComponent(Label);
        if (contributionLabel) {
            contributionLabel.string = `贡献: ${member.contribution}`;
        }

        return node;
    }

    /**
     * 更新聊天消息
     */
    private _updateChatMessages(): void {
        if (!this.chatContent) {
            return;
        }

        this._messageNodes.forEach(node => node.destroy());
        this._messageNodes = [];

        let messages: any[] = [];

        switch (this._currentChannel) {
            case ChatChannelType.WORLD:
                messages = chatManager.getWorldMessages();
                break;
            case ChatChannelType.GUILD:
                messages = chatManager.getGuildMessages();
                break;
        }

        messages.slice(-50).forEach((message, index) => {
            const node = this._createMessageItem(message, index);
            this._messageNodes.push(node);
        });

        // 滚动到底部
        if (this.chatScrollView) {
            this.chatScrollView.scrollToBottom(0.1);
        }
    }

    /**
     * 创建消息项
     */
    private _createMessageItem(message: any, index: number): Node {
        const node = this.chatMessagePrefab
            ? instantiate(this.chatMessagePrefab)
            : new Node(`Message_${index}`);

        node.setPosition(new Vec3(0, -index * 40, 0));
        this.chatContent!.addChild(node);

        // 设置发送者名称
        const senderLabel = node.getChildByName('Sender')?.getComponent(Label);
        if (senderLabel) {
            senderLabel.string = message.senderName;
        }

        // 设置消息内容
        const contentLabel = node.getChildByName('Content')?.getComponent(Label);
        if (contentLabel) {
            contentLabel.string = message.content;
        }

        // 设置时间
        const timeLabel = node.getChildByName('Time')?.getComponent(Label);
        if (timeLabel) {
            const date = new Date(message.sendTime);
            timeLabel.string = `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
        }

        return node;
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        // 添加好友按钮
        if (this.addFriendButton) {
            this.addFriendButton.on(Node.EventType.TOUCH_END, this._onAddFriend, this);
        }

        // 创建公会按钮
        if (this.createGuildButton) {
            this.createGuildButton.on(Node.EventType.TOUCH_END, this._onCreateGuild, this);
        }

        // 发送消息按钮
        if (this.sendButton) {
            this.sendButton.on(Node.EventType.TOUCH_END, this._onSendMessage, this);
        }

        // 关闭按钮
        if (this.closeButton) {
            this.closeButton.on(Node.EventType.TOUCH_END, () => this.hide(), this);
        }
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(FriendEventType.LIST_UPDATED, this._onFriendListUpdated, this);
        EventCenter.on(GuildEventType.INFO_UPDATED, this._onGuildInfoUpdated, this);
        EventCenter.on(ChatEventType.MESSAGE_RECEIVED, this._onMessageReceived, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(FriendEventType.LIST_UPDATED, this._onFriendListUpdated, this);
        EventCenter.off(GuildEventType.INFO_UPDATED, this._onGuildInfoUpdated, this);
        EventCenter.off(ChatEventType.MESSAGE_RECEIVED, this._onMessageReceived, this);
    }

    // ==================== 回调方法 ====================

    /**
     * 好友列表更新回调
     */
    private _onFriendListUpdated(): void {
        if (this._currentTab === SocialTab.FRIEND) {
            this._updateFriendList();
        }
    }

    /**
     * 公会信息更新回调
     */
    private _onGuildInfoUpdated(): void {
        if (this._currentTab === SocialTab.GUILD) {
            this._updateGuildInfo();
        }
    }

    /**
     * 消息接收回调
     */
    private _onMessageReceived(): void {
        if (this._currentTab === SocialTab.CHAT) {
            this._updateChatMessages();
        }
    }

    /**
     * 赠送体力
     */
    private _onGiftStamina(friendId: string): void {
        if (friendManager.giftStamina(friendId)) {
            console.log('[SocialPanel] 赠送体力成功');
        }
    }

    /**
     * 开始私聊
     */
    private _onStartPrivateChat(friendId: string): void {
        this._currentChannel = ChatChannelType.PRIVATE;
        this._selectTab(SocialTab.CHAT);
    }

    /**
     * 添加好友
     */
    private _onAddFriend(): void {
        // TODO: 显示添加好友对话框
        console.log('[SocialPanel] 添加好友');
    }

    /**
     * 创建公会
     */
    private _onCreateGuild(): void {
        // TODO: 显示创建公会对话框
        console.log('[SocialPanel] 创建公会');
    }

    /**
     * 发送消息
     */
    private _onSendMessage(): void {
        if (!this.chatInput || !this.chatInput.string) {
            return;
        }

        const content = this.chatInput.string.trim();
        if (!content) {
            return;
        }

        // 发送消息
        // TODO: 获取当前玩家信息
        const senderId = 'current_player';
        const senderName = 'Player';

        switch (this._currentChannel) {
            case ChatChannelType.WORLD:
                chatManager.sendWorldMessage(senderId, senderName, content);
                break;
            case ChatChannelType.GUILD:
                const guildInfo = guildManager.getGuildInfo();
                if (guildInfo) {
                    chatManager.sendGuildMessage(senderId, senderName, content, guildInfo.guildId);
                }
                break;
        }

        // 清空输入框
        this.chatInput.string = '';
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();
        this._unbindEvents();
    }
}