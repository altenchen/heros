/**
 * 好友管理器
 * 管理好友列表、申请、互动等功能
 * 遵循阿里巴巴开发者手册规范
 */

import {
    FriendInfo,
    FriendRequest,
    FriendStatus,
    FriendRequestStatus,
    FriendInteraction,
    FriendInteractionType
} from '../config/SocialTypes';
import { EventCenter } from '../utils/EventTarget';

/**
 * 好友事件类型
 */
export enum FriendEventType {
    /** 好友列表更新 */
    LIST_UPDATED = 'friend_list_updated',
    /** 收到好友申请 */
    REQUEST_RECEIVED = 'friend_request_received',
    /** 好友申请处理 */
    REQUEST_HANDLED = 'friend_request_handled',
    /** 好友状态变更 */
    STATUS_CHANGED = 'friend_status_changed',
    /** 互动完成 */
    INTERACTION_DONE = 'friend_interaction_done',
    /** 体力赠送 */
    STAMINA_GIFTED = 'friend_stamina_gifted'
}

/**
 * 好友事件数据
 */
export interface FriendEventData {
    friendId?: string;
    requestId?: string;
    status?: FriendStatus;
    interaction?: FriendInteraction;
    count?: number;
}

/**
 * 好友配置
 */
interface FriendConfig {
    /** 最大好友数 */
    maxFriends: number;
    /** 每日赠送体力上限 */
    dailyGiftLimit: number;
    /** 每日领取体力上限 */
    dailyReceiveLimit: number;
    /** 赠送体力数量 */
    giftStaminaAmount: number;
    /** 初始亲密度 */
    initialIntimacy: number;
}

/** 默认配置 */
const DEFAULT_CONFIG: FriendConfig = {
    maxFriends: 50,
    dailyGiftLimit: 20,
    dailyReceiveLimit: 20,
    giftStaminaAmount: 10,
    initialIntimacy: 0
};

/**
 * 好友管理器
 */
export class FriendManager {
    private static _instance: FriendManager | null = null;

    /** 好友列表 */
    private _friends: Map<string, FriendInfo> = new Map();

    /** 好友申请列表 */
    private _requests: Map<string, FriendRequest> = new Map();

    /** 互动记录 */
    private _interactions: Map<string, FriendInteraction[]> = new Map();

    /** 今日已赠送次数 */
    private _dailyGiftCount: number = 0;

    /** 今日已领取次数 */
    private _dailyReceiveCount: number = 0;

    /** 上次重置日期 */
    private _lastResetDate: string = '';

    /** 配置 */
    private _config: FriendConfig = DEFAULT_CONFIG;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): FriendManager {
        if (!FriendManager._instance) {
            FriendManager._instance = new FriendManager();
        }
        return FriendManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this._checkDailyReset();
        console.log('[FriendManager] 初始化完成');
    }

    /**
     * 检查每日重置
     */
    private _checkDailyReset(): void {
        const today = new Date().toDateString();

        if (this._lastResetDate !== today) {
            this._dailyGiftCount = 0;
            this._dailyReceiveCount = 0;

            // 清理过期的互动记录
            this._interactions.clear();

            this._lastResetDate = today;
            console.log('[FriendManager] 每日重置完成');
        }
    }

    /**
     * 获取好友列表
     */
    getFriends(): FriendInfo[] {
        return Array.from(this._friends.values());
    }

    /**
     * 获取好友数量
     */
    getFriendCount(): number {
        return this._friends.size;
    }

    /**
     * 获取好友信息
     */
    getFriend(friendId: string): FriendInfo | null {
        return this._friends.get(friendId) || null;
    }

    /**
     * 是否为好友
     */
    isFriend(playerId: string): boolean {
        return this._friends.has(playerId);
    }

    /**
     * 添加好友
     */
    addFriend(info: FriendInfo): boolean {
        if (this._friends.size >= this._config.maxFriends) {
            console.warn('[FriendManager] 好友数量已达上限');
            return false;
        }

        if (this._friends.has(info.playerId)) {
            console.warn('[FriendManager] 该玩家已是好友');
            return false;
        }

        this._friends.set(info.playerId, {
            ...info,
            addTime: Date.now(),
            intimacy: this._config.initialIntimacy
        });

        EventCenter.emit(FriendEventType.LIST_UPDATED, {
            count: this._friends.size
        });

        console.log('[FriendManager] 添加好友:', info.playerName);
        return true;
    }

    /**
     * 删除好友
     */
    removeFriend(friendId: string): boolean {
        if (!this._friends.has(friendId)) {
            return false;
        }

        this._friends.delete(friendId);
        this._interactions.delete(friendId);

        EventCenter.emit(FriendEventType.LIST_UPDATED, {
            count: this._friends.size
        });

        console.log('[FriendManager] 删除好友:', friendId);
        return true;
    }

    /**
     * 更新好友状态
     */
    updateFriendStatus(friendId: string, status: FriendStatus): void {
        const friend = this._friends.get(friendId);
        if (!friend) {
            return;
        }

        friend.status = status;
        if (status !== FriendStatus.ONLINE) {
            friend.lastOnlineTime = Date.now();
        }

        EventCenter.emit(FriendEventType.STATUS_CHANGED, {
            friendId,
            status
        });
    }

    /**
     * 获取好友申请列表
     */
    getRequests(): FriendRequest[] {
        return Array.from(this._requests.values())
            .filter(r => r.status === FriendRequestStatus.PENDING);
    }

    /**
     * 收到好友申请
     */
    receiveRequest(request: FriendRequest): void {
        this._requests.set(request.requestId, request);

        EventCenter.emit(FriendEventType.REQUEST_RECEIVED, {
            requestId: request.requestId
        });

        console.log('[FriendManager] 收到好友申请:', request.fromPlayerName);
    }

    /**
     * 接受好友申请
     */
    acceptRequest(requestId: string): boolean {
        const request = this._requests.get(requestId);
        if (!request || request.status !== FriendRequestStatus.PENDING) {
            return false;
        }

        if (this._friends.size >= this._config.maxFriends) {
            console.warn('[FriendManager] 好友数量已达上限');
            return false;
        }

        // 更新申请状态
        request.status = FriendRequestStatus.ACCEPTED;

        // 添加好友
        this.addFriend({
            playerId: request.fromPlayerId,
            playerName: request.fromPlayerName,
            avatar: request.fromAvatar,
            level: request.fromLevel,
            status: FriendStatus.ONLINE,
            lastOnlineTime: Date.now(),
            intimacy: 0,
            addTime: Date.now()
        });

        EventCenter.emit(FriendEventType.REQUEST_HANDLED, {
            requestId,
            accepted: true
        });

        console.log('[FriendManager] 接受好友申请:', request.fromPlayerName);
        return true;
    }

    /**
     * 拒绝好友申请
     */
    rejectRequest(requestId: string): boolean {
        const request = this._requests.get(requestId);
        if (!request || request.status !== FriendRequestStatus.PENDING) {
            return false;
        }

        request.status = FriendRequestStatus.REJECTED;

        EventCenter.emit(FriendEventType.REQUEST_HANDLED, {
            requestId,
            accepted: false
        });

        console.log('[FriendManager] 拒绝好友申请:', request.fromPlayerName);
        return true;
    }

    /**
     * 赠送体力
     */
    giftStamina(friendId: string): boolean {
        // 检查是否为好友
        if (!this._friends.has(friendId)) {
            console.warn('[FriendManager] 不是好友关系');
            return false;
        }

        // 检查今日赠送次数
        if (this._dailyGiftCount >= this._config.dailyGiftLimit) {
            console.warn('[FriendManager] 今日赠送次数已用完');
            return false;
        }

        // 检查今日是否已赠送
        const interactions = this._interactions.get(friendId) || [];
        const todayGifted = interactions.some(
            i => i.type === FriendInteractionType.GIFT_STAMINA &&
                this._isToday(i.time)
        );

        if (todayGifted) {
            console.warn('[FriendManager] 今日已赠送该好友体力');
            return false;
        }

        // 记录互动
        const interaction: FriendInteraction = {
            type: FriendInteractionType.GIFT_STAMINA,
            friendId,
            time: Date.now()
        };
        interactions.push(interaction);
        this._interactions.set(friendId, interactions);

        this._dailyGiftCount++;

        EventCenter.emit(FriendEventType.STAMINA_GIFTED, {
            friendId,
            interaction
        });

        console.log('[FriendManager] 赠送体力给好友:', friendId);
        return true;
    }

    /**
     * 领取体力
     */
    receiveStamina(friendId: string): boolean {
        // 检查今日领取次数
        if (this._dailyReceiveCount >= this._config.dailyReceiveLimit) {
            console.warn('[FriendManager] 今日领取次数已用完');
            return false;
        }

        // 检查好友是否赠送
        const interactions = this._interactions.get(friendId) || [];
        const pendingGift = interactions.find(
            i => i.type === FriendInteractionType.GIFT_STAMINA &&
                !i.claimed &&
                this._isToday(i.time)
        );

        if (!pendingGift) {
            console.warn('[FriendManager] 没有可领取的体力');
            return false;
        }

        // 标记已领取
        pendingGift.claimed = true;
        this._dailyReceiveCount++;

        EventCenter.emit(FriendEventType.INTERACTION_DONE, {
            interaction: pendingGift
        });

        console.log('[FriendManager] 领取好友赠送的体力:', friendId);
        return true;
    }

    /**
     * 获取可领取的体力列表
     */
    getPendingStaminaGifts(): FriendInteraction[] {
        const result: FriendInteraction[] = [];

        this._interactions.forEach((interactions, friendId) => {
            interactions.forEach(i => {
                if (i.type === FriendInteractionType.GIFT_STAMINA &&
                    !i.claimed &&
                    this._isToday(i.time)) {
                    result.push(i);
                }
            });
        });

        return result;
    }

    /**
     * 设置好友备注
     */
    setRemark(friendId: string, remark: string): boolean {
        const friend = this._friends.get(friendId);
        if (!friend) {
            return false;
        }

        friend.remark = remark;
        return true;
    }

    /**
     * 增加亲密度
     */
    addIntimacy(friendId: string, amount: number): void {
        const friend = this._friends.get(friendId);
        if (!friend) {
            return;
        }

        friend.intimacy += amount;
    }

    /**
     * 判断是否为今天
     */
    private _isToday(timestamp: number): boolean {
        const today = new Date().toDateString();
        const date = new Date(timestamp).toDateString();
        return today === date;
    }

    /**
     * 获取在线好友
     */
    getOnlineFriends(): FriendInfo[] {
        return Array.from(this._friends.values())
            .filter(f => f.status === FriendStatus.ONLINE);
    }

    /**
     * 获取今日赠送次数
     */
    getDailyGiftCount(): { used: number; limit: number } {
        return {
            used: this._dailyGiftCount,
            limit: this._config.dailyGiftLimit
        };
    }

    /**
     * 获取今日领取次数
     */
    getDailyReceiveCount(): { used: number; limit: number } {
        return {
            used: this._dailyReceiveCount,
            limit: this._config.dailyReceiveLimit
        };
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            friends: Array.from(this._friends.entries()),
            requests: Array.from(this._requests.entries()),
            interactions: Array.from(this._interactions.entries()),
            dailyGiftCount: this._dailyGiftCount,
            dailyReceiveCount: this._dailyReceiveCount,
            lastResetDate: this._lastResetDate
        };

        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);

            if (parsed.friends) {
                this._friends = new Map(parsed.friends);
            }

            if (parsed.requests) {
                this._requests = new Map(parsed.requests);
            }

            if (parsed.interactions) {
                this._interactions = new Map(parsed.interactions);
            }

            if (parsed.dailyGiftCount !== undefined) {
                this._dailyGiftCount = parsed.dailyGiftCount;
            }

            if (parsed.dailyReceiveCount !== undefined) {
                this._dailyReceiveCount = parsed.dailyReceiveCount;
            }

            if (parsed.lastResetDate) {
                this._lastResetDate = parsed.lastResetDate;
            }

            // 检查每日重置
            this._checkDailyReset();

            console.log('[FriendManager] 数据加载完成');
        } catch (e) {
            console.error('[FriendManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._friends.clear();
        this._requests.clear();
        this._interactions.clear();
        this._dailyGiftCount = 0;
        this._dailyReceiveCount = 0;
        this._lastResetDate = '';
    }
}

// 导出单例
export const friendManager = FriendManager.getInstance();