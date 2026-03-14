/**
 * 公会管理器
 * 管理公会创建、加入、管理等功能
 * 遵循阿里巴巴开发者手册规范
 */

import {
    GuildInfo,
    GuildMember,
    GuildRank,
    GuildApplication,
    GuildApplicationStatus,
    GuildBuilding,
    GuildBuildingType,
    GuildLog,
    GuildLogType
} from '../config/SocialTypes';
import { EventCenter } from '../utils/EventTarget';

/**
 * 公会事件类型
 */
export enum GuildEventType {
    /** 公会信息更新 */
    INFO_UPDATED = 'guild_info_updated',
    /** 成员列表更新 */
    MEMBERS_UPDATED = 'guild_members_updated',
    /** 收到入会申请 */
    APPLICATION_RECEIVED = 'guild_application_received',
    /** 申请处理完成 */
    APPLICATION_HANDLED = 'guild_application_handled',
    /** 公会等级提升 */
    LEVEL_UP = 'guild_level_up',
    /** 建筑升级 */
    BUILDING_UPGRADED = 'guild_building_upgraded',
    /** 退出公会 */
    MEMBER_LEAVE = 'guild_member_leave'
}

/**
 * 公会事件数据
 */
export interface GuildEventData {
    guildId?: string;
    memberId?: string;
    applicationId?: string;
    level?: number;
    buildingType?: GuildBuildingType;
    log?: GuildLog;
}

/**
 * 公会配置
 */
interface GuildConfig {
    /** 创建公会所需金币 */
    createCost: number;
    /** 最大成员数基础值 */
    baseMaxMembers: number;
    /** 每级增加成员数 */
    memberPerLevel: number;
    /** 最大申请列表数 */
    maxApplications: number;
    /** 日志保留天数 */
    logRetentionDays: number;
}

/** 默认配置 */
const DEFAULT_CONFIG: GuildConfig = {
    createCost: 100000,
    baseMaxMembers: 30,
    memberPerLevel: 5,
    maxApplications: 50,
    logRetentionDays: 7
};

/**
 * 公会管理器
 */
export class GuildManager {
    private static _instance: GuildManager | null = null;

    /** 当前公会信息 */
    private _guildInfo: GuildInfo | null = null;

    /** 成员列表 */
    private _members: Map<string, GuildMember> = new Map();

    /** 申请列表 */
    private _applications: Map<string, GuildApplication> = new Map();

    /** 建筑列表 */
    private _buildings: Map<GuildBuildingType, GuildBuilding> = new Map();

    /** 公会日志 */
    private _logs: GuildLog[] = [];

    /** 我的成员信息 */
    private _myMemberInfo: GuildMember | null = null;

    /** 配置 */
    private _config: GuildConfig = DEFAULT_CONFIG;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): GuildManager {
        if (!GuildManager._instance) {
            GuildManager._instance = new GuildManager();
        }
        return GuildManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        console.log('[GuildManager] 初始化完成');
    }

    /**
     * 是否在公会中
     */
    isInGuild(): boolean {
        return this._guildInfo !== null;
    }

    /**
     * 获取公会信息
     */
    getGuildInfo(): GuildInfo | null {
        return this._guildInfo;
    }

    /**
     * 获取成员列表
     */
    getMembers(): GuildMember[] {
        return Array.from(this._members.values());
    }

    /**
     * 获取成员数量
     */
    getMemberCount(): number {
        return this._members.size;
    }

    /**
     * 获取成员信息
     */
    getMember(playerId: string): GuildMember | null {
        return this._members.get(playerId) || null;
    }

    /**
     * 获取我的成员信息
     */
    getMyMemberInfo(): GuildMember | null {
        return this._myMemberInfo;
    }

    /**
     * 获取我的职位
     */
    getMyRank(): GuildRank | null {
        return this._myMemberInfo?.rank || null;
    }

    /**
     * 是否为管理层
     */
    isManager(): boolean {
        const rank = this.getMyRank();
        return rank === GuildRank.LEADER || rank === GuildRank.VICE_LEADER;
    }

    /**
     * 是否为会长
     */
    isLeader(): boolean {
        return this.getMyRank() === GuildRank.LEADER;
    }

    /**
     * 创建公会
     */
    createGuild(name: string, description: string, icon?: string): boolean {
        if (this.isInGuild()) {
            console.warn('[GuildManager] 已在公会中');
            return false;
        }

        const guildId = `guild_${Date.now()}`;
        const playerId = 'current_player'; // TODO: 获取当前玩家ID

        // 创建公会信息
        this._guildInfo = {
            guildId,
            name,
            description,
            announcement: '',
            icon,
            leaderId: playerId,
            viceLeaders: [],
            memberCount: 1,
            maxMembers: this._config.baseMaxMembers,
            level: 1,
            experience: 0,
            funds: 0,
            joinLevel: 1,
            joinPower: 0,
            needApproval: true,
            createTime: Date.now()
        };

        // 创建成员信息
        this._myMemberInfo = {
            playerId,
            playerName: 'Player', // TODO: 获取当前玩家名称
            level: 1,
            rank: GuildRank.LEADER,
            contribution: 0,
            weeklyContribution: 0,
            joinTime: Date.now(),
            lastActiveTime: Date.now()
        };
        this._members.set(playerId, this._myMemberInfo);

        // 初始化建筑
        this._initBuildings();

        // 添加日志
        this._addLog(GuildLogType.MEMBER_JOIN, '创建公会', playerId, 'Player');

        EventCenter.emit(GuildEventType.INFO_UPDATED, { guildId });

        console.log('[GuildManager] 创建公会:', name);
        return true;
    }

    /**
     * 初始化建筑
     */
    private _initBuildings(): void {
        Object.values(GuildBuildingType).forEach(type => {
            this._buildings.set(type, {
                type,
                level: 1,
                experience: 0
            });
        });
    }

    /**
     * 加入公会
     */
    joinGuild(guildInfo: GuildInfo, memberInfo: GuildMember): boolean {
        if (this.isInGuild()) {
            console.warn('[GuildManager] 已在公会中');
            return false;
        }

        this._guildInfo = guildInfo;
        this._myMemberInfo = memberInfo;
        this._members.set(memberInfo.playerId, memberInfo);

        EventCenter.emit(GuildEventType.INFO_UPDATED, { guildId: guildInfo.guildId });

        console.log('[GuildManager] 加入公会:', guildInfo.name);
        return true;
    }

    /**
     * 退出公会
     */
    leaveGuild(): boolean {
        if (!this.isInGuild()) {
            return false;
        }

        const guildName = this._guildInfo?.name;

        this._guildInfo = null;
        this._myMemberInfo = null;
        this._members.clear();
        this._applications.clear();
        this._buildings.clear();
        this._logs = [];

        console.log('[GuildManager] 退出公会:', guildName);
        return true;
    }

    /**
     * 设置公会公告
     */
    setAnnouncement(announcement: string): boolean {
        if (!this._guildInfo || !this.isManager()) {
            return false;
        }

        this._guildInfo.announcement = announcement;

        EventCenter.emit(GuildEventType.INFO_UPDATED, {
            guildId: this._guildInfo.guildId
        });

        return true;
    }

    /**
     * 设置入会条件
     */
    setJoinConditions(
        level: number,
        power: number,
        needApproval: boolean
    ): boolean {
        if (!this._guildInfo || !this.isManager()) {
            return false;
        }

        this._guildInfo.joinLevel = level;
        this._guildInfo.joinPower = power;
        this._guildInfo.needApproval = needApproval;

        return true;
    }

    /**
     * 获取申请列表
     */
    getApplications(): GuildApplication[] {
        return Array.from(this._applications.values())
            .filter(a => a.status === GuildApplicationStatus.PENDING);
    }

    /**
     * 收到入会申请
     */
    receiveApplication(application: GuildApplication): void {
        if (this._applications.size >= this._config.maxApplications) {
            // 移除最早的申请
            const oldest = Array.from(this._applications.values())
                .sort((a, b) => a.applyTime - b.applyTime)[0];
            if (oldest) {
                this._applications.delete(oldest.applicationId);
            }
        }

        this._applications.set(application.applicationId, application);

        EventCenter.emit(GuildEventType.APPLICATION_RECEIVED, {
            applicationId: application.applicationId
        });

        console.log('[GuildManager] 收到入会申请:', application.playerName);
    }

    /**
     * 同意入会申请
     */
    approveApplication(applicationId: string): boolean {
        if (!this._guildInfo || !this.isManager()) {
            return false;
        }

        const application = this._applications.get(applicationId);
        if (!application || application.status !== GuildApplicationStatus.PENDING) {
            return false;
        }

        if (this._members.size >= this._guildInfo.maxMembers) {
            console.warn('[GuildManager] 公会成员已满');
            return false;
        }

        // 更新申请状态
        application.status = GuildApplicationStatus.APPROVED;

        // 添加成员
        const newMember: GuildMember = {
            playerId: application.playerId,
            playerName: application.playerName,
            level: application.playerLevel,
            rank: GuildRank.MEMBER,
            contribution: 0,
            weeklyContribution: 0,
            joinTime: Date.now(),
            lastActiveTime: Date.now()
        };
        this._members.set(application.playerId, newMember);

        // 更新成员数
        this._guildInfo.memberCount = this._members.size;

        // 添加日志
        this._addLog(GuildLogType.MEMBER_JOIN, '加入公会',
            application.playerId, application.playerName);

        EventCenter.emit(GuildEventType.APPLICATION_HANDLED, {
            applicationId,
            approved: true
        });

        console.log('[GuildManager] 同意入会申请:', application.playerName);
        return true;
    }

    /**
     * 拒绝入会申请
     */
    rejectApplication(applicationId: string): boolean {
        if (!this.isManager()) {
            return false;
        }

        const application = this._applications.get(applicationId);
        if (!application || application.status !== GuildApplicationStatus.PENDING) {
            return false;
        }

        application.status = GuildApplicationStatus.REJECTED;

        EventCenter.emit(GuildEventType.APPLICATION_HANDLED, {
            applicationId,
            approved: false
        });

        console.log('[GuildManager] 拒绝入会申请:', application.playerName);
        return true;
    }

    /**
     * 踢出成员
     */
    kickMember(playerId: string): boolean {
        if (!this._guildInfo || !this.isManager()) {
            return false;
        }

        const member = this._members.get(playerId);
        if (!member || member.rank === GuildRank.LEADER) {
            return false;
        }

        this._members.delete(playerId);
        this._guildInfo.memberCount = this._members.size;

        // 添加日志
        this._addLog(GuildLogType.MEMBER_LEAVE, '被踢出公会',
            playerId, member.playerName);

        EventCenter.emit(GuildEventType.MEMBER_LEAVE, { memberId: playerId });

        console.log('[GuildManager] 踢出成员:', member.playerName);
        return true;
    }

    /**
     * 设置成员职位
     */
    setMemberRank(playerId: string, rank: GuildRank): boolean {
        if (!this._guildInfo || !this.isLeader()) {
            return false;
        }

        const member = this._members.get(playerId);
        if (!member || member.rank === GuildRank.LEADER) {
            return false;
        }

        const oldRank = member.rank;
        member.rank = rank;

        // 更新副会长列表
        if (rank === GuildRank.VICE_LEADER) {
            if (!this._guildInfo.viceLeaders.includes(playerId)) {
                this._guildInfo.viceLeaders.push(playerId);
            }
        } else if (oldRank === GuildRank.VICE_LEADER) {
            this._guildInfo.viceLeaders = this._guildInfo.viceLeaders
                .filter(id => id !== playerId);
        }

        // 添加日志
        this._addLog(GuildLogType.RANK_CHANGE,
            `职位变更为 ${this._getRankName(rank)}`,
            playerId, member.playerName);

        EventCenter.emit(GuildEventType.MEMBERS_UPDATED, { memberId: playerId });

        console.log('[GuildManager] 设置成员职位:', member.playerName, rank);
        return true;
    }

    /**
     * 捐献公会资金
     */
    donateFunds(amount: number): boolean {
        if (!this._guildInfo || !this._myMemberInfo) {
            return false;
        }

        this._guildInfo.funds += amount;
        this._myMemberInfo.contribution += amount;
        this._myMemberInfo.weeklyContribution += amount;

        // 检查公会升级
        this._checkLevelUp();

        // 添加日志
        this._addLog(GuildLogType.FUNDS_CHANGE, `捐献 ${amount} 金币`,
            this._myMemberInfo.playerId, this._myMemberInfo.playerName);

        EventCenter.emit(GuildEventType.INFO_UPDATED, {
            guildId: this._guildInfo.guildId
        });

        return true;
    }

    /**
     * 检查公会升级
     */
    private _checkLevelUp(): void {
        if (!this._guildInfo) {
            return;
        }

        const expNeeded = this._getExpForLevel(this._guildInfo.level + 1);

        if (this._guildInfo.experience >= expNeeded) {
            this._guildInfo.level++;
            this._guildInfo.maxMembers = this._config.baseMaxMembers +
                this._guildInfo.level * this._config.memberPerLevel;

            // 添加日志
            this._addLog(GuildLogType.BUILDING_UPGRADE,
                `公会升级至 ${this._guildInfo.level} 级`);

            EventCenter.emit(GuildEventType.LEVEL_UP, {
                level: this._guildInfo.level
            });

            console.log('[GuildManager] 公会升级至:', this._guildInfo.level);
        }
    }

    /**
     * 获取升级所需经验
     */
    private _getExpForLevel(level: number): number {
        return level * level * 1000;
    }

    /**
     * 获取建筑信息
     */
    getBuilding(type: GuildBuildingType): GuildBuilding | null {
        return this._buildings.get(type) || null;
    }

    /**
     * 升级建筑
     */
    upgradeBuilding(type: GuildBuildingType): boolean {
        if (!this._guildInfo || !this.isManager()) {
            return false;
        }

        const building = this._buildings.get(type);
        if (!building) {
            return false;
        }

        const cost = this._getBuildingUpgradeCost(building.level);

        if (this._guildInfo.funds < cost) {
            console.warn('[GuildManager] 公会资金不足');
            return false;
        }

        this._guildInfo.funds -= cost;
        building.level++;

        // 添加日志
        this._addLog(GuildLogType.BUILDING_UPGRADE,
            `${this._getBuildingName(type)} 升级至 ${building.level} 级`);

        EventCenter.emit(GuildEventType.BUILDING_UPGRADED, { buildingType: type });

        console.log('[GuildManager] 建筑升级:', type, building.level);
        return true;
    }

    /**
     * 获取建筑升级费用
     */
    private _getBuildingUpgradeCost(level: number): number {
        return level * 10000;
    }

    /**
     * 添加日志
     */
    private _addLog(
        type: GuildLogType,
        content: string,
        playerId?: string,
        playerName?: string
    ): void {
        const log: GuildLog = {
            type,
            time: Date.now(),
            content,
            playerId,
            playerName
        };

        this._logs.push(log);

        // 清理过期日志
        const retentionTime = Date.now() - this._config.logRetentionDays * 24 * 60 * 60 * 1000;
        this._logs = this._logs.filter(l => l.time >= retentionTime);
    }

    /**
     * 获取公会日志
     */
    getLogs(): GuildLog[] {
        return [...this._logs];
    }

    /**
     * 获取职位名称
     */
    private _getRankName(rank: GuildRank): string {
        const names: Record<GuildRank, string> = {
            [GuildRank.LEADER]: '会长',
            [GuildRank.VICE_LEADER]: '副会长',
            [GuildRank.ELDER]: '长老',
            [GuildRank.MEMBER]: '成员'
        };
        return names[rank];
    }

    /**
     * 获取建筑名称
     */
    private _getBuildingName(type: GuildBuildingType): string {
        const names: Record<GuildBuildingType, string> = {
            [GuildBuildingType.MAIN_HALL]: '主殿',
            [GuildBuildingType.SHOP]: '商店',
            [GuildBuildingType.TRAINING]: '训练场',
            [GuildBuildingType.ALTAR]: '祭坛'
        };
        return names[type];
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            guildInfo: this._guildInfo,
            members: Array.from(this._members.entries()),
            applications: Array.from(this._applications.entries()),
            buildings: Array.from(this._buildings.entries()),
            logs: this._logs,
            myMemberInfo: this._myMemberInfo
        };

        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);

            if (parsed.guildInfo) {
                this._guildInfo = parsed.guildInfo;
            }

            if (parsed.members) {
                this._members = new Map(parsed.members);
            }

            if (parsed.applications) {
                this._applications = new Map(parsed.applications);
            }

            if (parsed.buildings) {
                this._buildings = new Map(parsed.buildings);
            }

            if (parsed.logs) {
                this._logs = parsed.logs;
            }

            if (parsed.myMemberInfo) {
                this._myMemberInfo = parsed.myMemberInfo;
            }

            console.log('[GuildManager] 数据加载完成');
        } catch (e) {
            console.error('[GuildManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._guildInfo = null;
        this._myMemberInfo = null;
        this._members.clear();
        this._applications.clear();
        this._buildings.clear();
        this._logs = [];
    }
}

// 导出单例
export const guildManager = GuildManager.getInstance();