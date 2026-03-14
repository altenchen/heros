/**
 * 社交模块
 * 导出社交系统相关类
 */

export * from '../config/SocialTypes';
export { FriendManager, friendManager, FriendEventType } from './FriendManager';
export { GuildManager, guildManager, GuildEventType } from './GuildManager';
export { ChatManager, chatManager, ChatEventType } from './ChatManager';