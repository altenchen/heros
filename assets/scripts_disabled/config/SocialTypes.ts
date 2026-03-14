/**
 * 社交系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

// ==================== 枚举定义 ====================

/**
 * 好友状态
 */
export enum FriendStatus {
    /** 在线 */
    ONLINE = 'online',
    /** 离线 */
    OFFLINE = 'offline',
    /** 忙碌 */
    BUSY = 'busy',
    /** 离开 */
    AWAY = 'away'
}

/**
 * 好友申请状态
 */
export enum FriendRequestStatus {
    /** 待处理 */
    PENDING = 'pending',
    /** 已接受 */
    ACCEPTED = 'accepted',
    /** 已拒绝 */
    REJECTED = 'rejected'
}

/**
 * 公会职位
 */
export enum GuildRank {
    /** 会长 */
    LEADER = 'leader',
    /** 副会长 */
    VICE_LEADER = 'vice_leader',
    /** 长老 */
    ELDER = 'elder',
    /** 成员 */
    MEMBER = 'member'
}

/**
 * 公会申请状态
 */
export enum GuildApplicationStatus {
    /** 待审核 */
    PENDING = 'pending',
    /** 已通过 */
    APPROVED = 'approved',
    /** 已拒绝 */
    REJECTED = 'rejected'
}

/**
 * 聊天频道类型
 */
export enum ChatChannelType {
    /** 世界频道 */
    WORLD = 'world',
    /** 公会频道 */
    GUILD = 'guild',
    /** 私聊 */
    PRIVATE = 'private',
    /** 系统消息 */
    SYSTEM = 'system'
}

/**
 * 消息类型
 */
export enum MessageType {
    /** 普通文本 */
    TEXT = 'text',
    /** 表情 */
    EMOJI = 'emoji',
    /** 系统消息 */
    SYSTEM = 'system',
    /** 战斗分享 */
    BATTLE_SHARE = 'battle_share',
    /** 英雄分享 */
    HERO_SHARE = 'hero_share'
}

// ==================== 好友系统接口 ====================

/**
 * 好友信息
 */
export interface FriendInfo {
    /** 玩家ID */
    playerId: string;
    /** 玩家名称 */
    playerName: string;
    /** 头像 */
    avatar?: string;
    /** 等级 */
    level: number;
    /** 状态 */
    status: FriendStatus;
    /** 最后在线时间 */
    lastOnlineTime: number;
    /** 亲密度 */
    intimacy: number;
    /** 添加时间 */
    addTime: number;
    /** 备注 */
    remark?: string;
}

/**
 * 好友申请
 */
export interface FriendRequest {
    /** 申请ID */
    requestId: string;
    /** 申请者ID */
    fromPlayerId: string;
    /** 申请者名称 */
    fromPlayerName: string;
    /** 申请者头像 */
    fromAvatar?: string;
    /** 申请者等级 */
    fromLevel: number;
    /** 申请消息 */
    message?: string;
    /** 申请时间 */
    requestTime: number;
    /** 状态 */
    status: FriendRequestStatus;
}

/**
 * 好友互动类型
 */
export enum FriendInteractionType {
    /** 赠送体力 */
    GIFT_STAMINA = 'gift_stamina',
    /** 助战 */
    ASSIST = 'assist',
    /** 切磋 */
    SPAR = 'spar'
}

/**
 * 好友互动记录
 */
export interface FriendInteraction {
    /** 互动类型 */
    type: FriendInteractionType;
    /** 好友ID */
    friendId: string;
    /** 互动时间 */
    time: number;
    /** 是否已领取 */
    claimed?: boolean;
}

// ==================== 公会系统接口 ====================

/**
 * 公会信息
 */
export interface GuildInfo {
    /** 公会ID */
    guildId: string;
    /** 公会名称 */
    name: string;
    /** 公会公告 */
    announcement: string;
    /** 公会简介 */
    description: string;
    /** 公会图标 */
    icon?: string;
    /** 会长ID */
    leaderId: string;
    /** 副会长列表 */
    viceLeaders: string[];
    /** 成员数量 */
    memberCount: number;
    /** 最大成员数 */
    maxMembers: number;
    /** 公会等级 */
    level: number;
    /** 公会经验 */
    experience: number;
    /** 公会资金 */
    funds: number;
    /** 入会条件：等级 */
    joinLevel: number;
    /** 入会条件：战力 */
    joinPower: number;
    /** 是否需要审核 */
    needApproval: boolean;
    /** 创建时间 */
    createTime: number;
}

/**
 * 公会成员
 */
export interface GuildMember {
    /** 玩家ID */
    playerId: string;
    /** 玩家名称 */
    playerName: string;
    /** 头像 */
    avatar?: string;
    /** 等级 */
    level: number;
    /** 职位 */
    rank: GuildRank;
    /** 贡献值 */
    contribution: number;
    /** 周贡献 */
    weeklyContribution: number;
    /** 加入时间 */
    joinTime: number;
    /** 最后活跃时间 */
    lastActiveTime: number;
}

/**
 * 公会申请
 */
export interface GuildApplication {
    /** 申请ID */
    applicationId: string;
    /** 申请者ID */
    playerId: string;
    /** 申请者名称 */
    playerName: string;
    /** 申请者等级 */
    playerLevel: number;
    /** 申请者战力 */
    playerPower: number;
    /** 申请消息 */
    message?: string;
    /** 申请时间 */
    applyTime: number;
    /** 状态 */
    status: GuildApplicationStatus;
}

/**
 * 公会建筑类型
 */
export enum GuildBuildingType {
    /** 主殿 */
    MAIN_HALL = 'main_hall',
    /** 商店 */
    SHOP = 'shop',
    /** 训练场 */
    TRAINING = 'training',
    /** 祭坛 */
    ALTAR = 'altar'
}

/**
 * 公会建筑
 */
export interface GuildBuilding {
    /** 建筑类型 */
    type: GuildBuildingType;
    /** 等级 */
    level: number;
    /** 经验 */
    experience: number;
}

/**
 * 公会日志类型
 */
export enum GuildLogType {
    /** 成员加入 */
    MEMBER_JOIN = 'member_join',
    /** 成员退出 */
    MEMBER_LEAVE = 'member_leave',
    /** 职位变更 */
    RANK_CHANGE = 'rank_change',
    /** 建筑升级 */
    BUILDING_UPGRADE = 'building_upgrade',
    /** 资金变动 */
    FUNDS_CHANGE = 'funds_change'
}

/**
 * 公会日志
 */
export interface GuildLog {
    /** 日志类型 */
    type: GuildLogType;
    /** 时间 */
    time: number;
    /** 内容 */
    content: string;
    /** 相关玩家ID */
    playerId?: string;
    /** 相关玩家名称 */
    playerName?: string;
}

// ==================== 聊天系统接口 ====================

/**
 * 聊天消息
 */
export interface ChatMessage {
    /** 消息ID */
    messageId: string;
    /** 发送者ID */
    senderId: string;
    /** 发送者名称 */
    senderName: string;
    /** 发送者头像 */
    senderAvatar?: string;
    /** 发送者等级 */
    senderLevel: number;
    /** 频道类型 */
    channel: ChatChannelType;
    /** 消息类型 */
    type: MessageType;
    /** 消息内容 */
    content: string;
    /** 发送时间 */
    sendTime: number;
    /** 公会ID（公会频道） */
    guildId?: string;
    /** 接收者ID（私聊） */
    receiverId?: string;
}

/**
 * 聊天频道
 */
export interface ChatChannel {
    /** 频道类型 */
    type: ChatChannelType;
    /** 频道名称 */
    name: string;
    /** 未读消息数 */
    unreadCount: number;
    /** 最后一条消息 */
    lastMessage?: ChatMessage;
}

/**
 * 私聊会话
 */
export interface PrivateConversation {
    /** 对方ID */
    targetId: string;
    /** 对方名称 */
    targetName: string;
    /** 对方头像 */
    targetAvatar?: string;
    /** 未读消息数 */
    unreadCount: number;
    /** 最后一条消息 */
    lastMessage?: ChatMessage;
}

// ==================== 排行榜接口 ====================

/**
 * 排行榜类型
 */
export enum RankingType {
    /** 战力榜 */
    POWER = 'power',
    /** 等级榜 */
    LEVEL = 'level',
    /** 竞技榜 */
    ARENA = 'arena',
    /** 公会榜 */
    GUILD = 'guild'
}

/**
 * 排行榜项
 */
export interface RankingItem {
    /** 排名 */
    rank: number;
    /** 玩家ID */
    playerId: string;
    /** 玩家名称 */
    playerName: string;
    /** 头像 */
    avatar?: string;
    /** 数值 */
    value: number;
    /** 额外信息 */
    extra?: Record<string, any>;
}

// ==================== 社交设置接口 ====================

/**
 * 社交设置
 */
export interface SocialSettings {
    /** 允许添加好友 */
    allowFriendRequest: boolean;
    /** 允许私聊 */
    allowPrivateChat: boolean;
    /** 允许查看资料 */
    allowViewProfile: boolean;
    /** 世界频道免打扰 */
    muteWorldChannel: boolean;
    /** 公会频道免打扰 */
    muteGuildChannel: boolean;
}