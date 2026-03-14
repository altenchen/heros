/**
 * 聊天管理器
 * 管理各频道聊天、私聊等功能
 * 遵循阿里巴巴开发者手册规范
 */

import {
    ChatMessage,
    ChatChannelType,
    MessageType,
    PrivateConversation
} from '../config/SocialTypes';
import { EventCenter } from '../utils/EventTarget';

/**
 * 聊天事件类型
 */
export enum ChatEventType {
    /** 收到新消息 */
    MESSAGE_RECEIVED = 'chat_message_received',
    /** 频道更新 */
    CHANNEL_UPDATED = 'chat_channel_updated',
    /** 未读消息变化 */
    UNREAD_CHANGED = 'chat_unread_changed',
    /** 私聊会话更新 */
    CONVERSATION_UPDATED = 'chat_conversation_updated'
}

/**
 * 聊天事件数据
 */
export interface ChatEventData {
    message?: ChatMessage;
    channel?: ChatChannelType;
    unreadCount?: number;
    targetId?: string;
}

/**
 * 聊天配置
 */
interface ChatConfig {
    /** 世界频道历史消息数 */
    worldHistoryLimit: number;
    /** 公会频道历史消息数 */
    guildHistoryLimit: number;
    /** 私聊历史消息数 */
    privateHistoryLimit: number;
    /** 消息最大长度 */
    maxMessageLength: number;
    /** 发送间隔(毫秒) */
    sendInterval: number;
}

/** 默认配置 */
const DEFAULT_CONFIG: ChatConfig = {
    worldHistoryLimit: 100,
    guildHistoryLimit: 50,
    privateHistoryLimit: 100,
    maxMessageLength: 200,
    sendInterval: 3000
};

/**
 * 聊天管理器
 */
export class ChatManager {
    private static _instance: ChatManager | null = null;

    /** 世界频道消息 */
    private _worldMessages: ChatMessage[] = [];

    /** 公会频道消息 */
    private _guildMessages: ChatMessage[] = [];

    /** 私聊消息 */
    private _privateMessages: Map<string, ChatMessage[]> = new Map();

    /** 私聊会话列表 */
    private _conversations: Map<string, PrivateConversation> = new Map();

    /** 未读消息计数 */
    private _unreadCounts: Map<ChatChannelType, number> = new Map();

    /** 上次发送时间 */
    private _lastSendTime: number = 0;

    /** 配置 */
    private _config: ChatConfig = DEFAULT_CONFIG;

    private constructor() {
        // 初始化未读计数
        this._unreadCounts.set(ChatChannelType.WORLD, 0);
        this._unreadCounts.set(ChatChannelType.GUILD, 0);
        this._unreadCounts.set(ChatChannelType.PRIVATE, 0);
    }

    /**
     * 获取单例实例
     */
    static getInstance(): ChatManager {
        if (!ChatManager._instance) {
            ChatManager._instance = new ChatManager();
        }
        return ChatManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        console.log('[ChatManager] 初始化完成');
    }

    /**
     * 发送世界频道消息
     */
    sendWorldMessage(
        senderId: string,
        senderName: string,
        content: string,
        senderLevel?: number,
        senderAvatar?: string
    ): boolean {
        // 检查发送间隔
        if (!this._checkSendInterval()) {
            console.warn('[ChatManager] 发送间隔过短');
            return false;
        }

        // 检查消息长度
        if (content.length > this._config.maxMessageLength) {
            console.warn('[ChatManager] 消息长度超限');
            return false;
        }

        const message: ChatMessage = {
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId,
            senderName,
            senderAvatar,
            senderLevel: senderLevel || 1,
            channel: ChatChannelType.WORLD,
            type: MessageType.TEXT,
            content,
            sendTime: Date.now()
        };

        this._worldMessages.push(message);

        // 限制历史消息数
        if (this._worldMessages.length > this._config.worldHistoryLimit) {
            this._worldMessages.shift();
        }

        this._lastSendTime = Date.now();

        EventCenter.emit(ChatEventType.MESSAGE_RECEIVED, { message });

        console.log('[ChatManager] 世界频道消息发送成功');
        return true;
    }

    /**
     * 发送公会频道消息
     */
    sendGuildMessage(
        senderId: string,
        senderName: string,
        content: string,
        guildId: string,
        senderLevel?: number,
        senderAvatar?: string
    ): boolean {
        if (!this._checkSendInterval()) {
            return false;
        }

        if (content.length > this._config.maxMessageLength) {
            return false;
        }

        const message: ChatMessage = {
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId,
            senderName,
            senderAvatar,
            senderLevel: senderLevel || 1,
            channel: ChatChannelType.GUILD,
            type: MessageType.TEXT,
            content,
            sendTime: Date.now(),
            guildId
        };

        this._guildMessages.push(message);

        if (this._guildMessages.length > this._config.guildHistoryLimit) {
            this._guildMessages.shift();
        }

        this._lastSendTime = Date.now();

        EventCenter.emit(ChatEventType.MESSAGE_RECEIVED, { message });

        return true;
    }

    /**
     * 发送私聊消息
     */
    sendPrivateMessage(
        senderId: string,
        senderName: string,
        receiverId: string,
        receiverName: string,
        content: string,
        senderLevel?: number,
        senderAvatar?: string,
        receiverAvatar?: string
    ): boolean {
        if (!this._checkSendInterval()) {
            return false;
        }

        if (content.length > this._config.maxMessageLength) {
            return false;
        }

        const message: ChatMessage = {
            messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            senderId,
            senderName,
            senderAvatar,
            senderLevel: senderLevel || 1,
            channel: ChatChannelType.PRIVATE,
            type: MessageType.TEXT,
            content,
            sendTime: Date.now(),
            receiverId
        };

        // 存储消息
        const messages = this._privateMessages.get(receiverId) || [];
        messages.push(message);

        if (messages.length > this._config.privateHistoryLimit) {
            messages.shift();
        }

        this._privateMessages.set(receiverId, messages);

        // 更新会话
        this._updateConversation(receiverId, receiverName, receiverAvatar, message);

        this._lastSendTime = Date.now();

        EventCenter.emit(ChatEventType.MESSAGE_RECEIVED, {
            message,
            targetId: receiverId
        });

        return true;
    }

    /**
     * 接收消息
     */
    receiveMessage(message: ChatMessage): void {
        switch (message.channel) {
            case ChatChannelType.WORLD:
                this._worldMessages.push(message);
                if (this._worldMessages.length > this._config.worldHistoryLimit) {
                    this._worldMessages.shift();
                }
                this._incrementUnread(ChatChannelType.WORLD);
                break;

            case ChatChannelType.GUILD:
                this._guildMessages.push(message);
                if (this._guildMessages.length > this._config.guildHistoryLimit) {
                    this._guildMessages.shift();
                }
                this._incrementUnread(ChatChannelType.GUILD);
                break;

            case ChatChannelType.PRIVATE:
                const conversationId = message.senderId;
                const messages = this._privateMessages.get(conversationId) || [];
                messages.push(message);

                if (messages.length > this._config.privateHistoryLimit) {
                    messages.shift();
                }

                this._privateMessages.set(conversationId, messages);
                this._incrementUnread(ChatChannelType.PRIVATE);

                // 更新会话
                this._updateConversation(
                    message.senderId,
                    message.senderName,
                    message.senderAvatar,
                    message
                );
                break;
        }

        EventCenter.emit(ChatEventType.MESSAGE_RECEIVED, { message });
    }

    /**
     * 发送系统消息
     */
    sendSystemMessage(content: string, channel: ChatChannelType = ChatChannelType.WORLD): void {
        const message: ChatMessage = {
            messageId: `sys_${Date.now()}`,
            senderId: 'system',
            senderName: '系统',
            senderLevel: 0,
            channel,
            type: MessageType.SYSTEM,
            content,
            sendTime: Date.now()
        };

        this.receiveMessage(message);
    }

    /**
     * 获取世界频道消息
     */
    getWorldMessages(): ChatMessage[] {
        return [...this._worldMessages];
    }

    /**
     * 获取公会频道消息
     */
    getGuildMessages(): ChatMessage[] {
        return [...this._guildMessages];
    }

    /**
     * 获取私聊消息
     */
    getPrivateMessages(targetId: string): ChatMessage[] {
        return [...(this._privateMessages.get(targetId) || [])];
    }

    /**
     * 获取私聊会话列表
     */
    getConversations(): PrivateConversation[] {
        return Array.from(this._conversations.values())
            .sort((a, b) => (b.lastMessage?.sendTime || 0) - (a.lastMessage?.sendTime || 0));
    }

    /**
     * 更新会话
     */
    private _updateConversation(
        targetId: string,
        targetName: string,
        targetAvatar: string | undefined,
        message: ChatMessage
    ): void {
        const conversation = this._conversations.get(targetId);

        if (conversation) {
            conversation.lastMessage = message;
        } else {
            this._conversations.set(targetId, {
                targetId,
                targetName,
                targetAvatar,
                unreadCount: 0,
                lastMessage: message
            });
        }

        EventCenter.emit(ChatEventType.CONVERSATION_UPDATED, { targetId });
    }

    /**
     * 增加未读计数
     */
    private _incrementUnread(channel: ChatChannelType): void {
        const current = this._unreadCounts.get(channel) || 0;
        this._unreadCounts.set(channel, current + 1);

        EventCenter.emit(ChatEventType.UNREAD_CHANGED, {
            channel,
            unreadCount: current + 1
        });
    }

    /**
     * 清除未读计数
     */
    clearUnread(channel: ChatChannelType): void {
        this._unreadCounts.set(channel, 0);

        EventCenter.emit(ChatEventType.UNREAD_CHANGED, {
            channel,
            unreadCount: 0
        });
    }

    /**
     * 获取未读计数
     */
    getUnreadCount(channel: ChatChannelType): number {
        return this._unreadCounts.get(channel) || 0;
    }

    /**
     * 获取总未读数
     */
    getTotalUnread(): number {
        let total = 0;
        this._unreadCounts.forEach(count => {
            total += count;
        });

        // 加上私聊会话未读
        this._conversations.forEach(conv => {
            total += conv.unreadCount;
        });

        return total;
    }

    /**
     * 检查发送间隔
     */
    private _checkSendInterval(): boolean {
        const now = Date.now();
        return now - this._lastSendTime >= this._config.sendInterval;
    }

    /**
     * 清除频道消息
     */
    clearChannelMessages(channel: ChatChannelType): void {
        switch (channel) {
            case ChatChannelType.WORLD:
                this._worldMessages = [];
                break;
            case ChatChannelType.GUILD:
                this._guildMessages = [];
                break;
        }
    }

    /**
     * 删除私聊会话
     */
    deleteConversation(targetId: string): void {
        this._conversations.delete(targetId);
        this._privateMessages.delete(targetId);

        EventCenter.emit(ChatEventType.CONVERSATION_UPDATED, { targetId });
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            worldMessages: this._worldMessages.slice(-20), // 只保存最近20条
            guildMessages: this._guildMessages.slice(-20),
            privateMessages: Array.from(this._privateMessages.entries())
                .map(([id, msgs]) => [id, msgs.slice(-20)]),
            conversations: Array.from(this._conversations.entries()),
            unreadCounts: Array.from(this._unreadCounts.entries()),
            lastSendTime: this._lastSendTime
        };

        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);

            if (parsed.worldMessages) {
                this._worldMessages = parsed.worldMessages;
            }

            if (parsed.guildMessages) {
                this._guildMessages = parsed.guildMessages;
            }

            if (parsed.privateMessages) {
                this._privateMessages = new Map(parsed.privateMessages);
            }

            if (parsed.conversations) {
                this._conversations = new Map(parsed.conversations);
            }

            if (parsed.unreadCounts) {
                this._unreadCounts = new Map(parsed.unreadCounts);
            }

            if (parsed.lastSendTime) {
                this._lastSendTime = parsed.lastSendTime;
            }

            console.log('[ChatManager] 数据加载完成');
        } catch (e) {
            console.error('[ChatManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._worldMessages = [];
        this._guildMessages = [];
        this._privateMessages.clear();
        this._conversations.clear();
        this._unreadCounts.set(ChatChannelType.WORLD, 0);
        this._unreadCounts.set(ChatChannelType.GUILD, 0);
        this._unreadCounts.set(ChatChannelType.PRIVATE, 0);
        this._lastSendTime = 0;
    }
}

// 导出单例
export const chatManager = ChatManager.getInstance();