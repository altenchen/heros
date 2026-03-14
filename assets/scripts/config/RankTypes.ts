/**
 * 排行榜类型定义
 * 遵循阿里巴巴开发者手册规范
 */

/**
 * 排行榜类型
 */
export enum RankType {
    /** 关卡战力排行 */
    POWER = 'power',
    /** PVP竞技排行 */
    PVP = 'pvp',
    /** 关卡星数排行 */
    STARS = 'stars',
    /** 公会排行 */
    GUILD = 'guild',
    /** 英雄战力排行 */
    HERO_POWER = 'hero_power'
}

/**
 * 排行榜周期
 */
export enum RankPeriod {
    /** 日榜 */
    DAILY = 'daily',
    /** 周榜 */
    WEEKLY = 'weekly',
    /** 月榜 */
    MONTHLY = 'monthly',
    /** 总榜 */
    ALL_TIME = 'all_time'
}

/**
 * 排行榜条目
 */
export interface RankEntry {
    /** 玩家ID */
    playerId: string;
    /** 玩家名称 */
    playerName: string;
    /** 头像 */
    avatar?: string;
    /** 分数 */
    score: number;
    /** 排名 */
    rank: number;
    /** 额外数据 */
    extra?: {
        /** 战力 */
        power?: number;
        /** 星数 */
        stars?: number;
        /** 胜场 */
        wins?: number;
        /** 公会名称 */
        guildName?: string;
        /** 英雄ID (英雄排行用) */
        heroId?: string;
    };
    /** 更新时间 */
    updateTime: number;
}

/**
 * 玩家排行数据
 */
export interface PlayerRankData {
    /** 排行榜类型 */
    type: RankType;
    /** 周期 */
    period: RankPeriod;
    /** 分数 */
    score: number;
    /** 排名 */
    rank: number;
    /** 上次排名变化 */
    rankChange: number;
}

/**
 * 排行榜奖励配置
 */
export interface RankRewardConfig {
    /** 起始排名 */
    startRank: number;
    /** 结束排名 */
    endRank: number;
    /** 奖励 */
    rewards: {
        type: string;
        itemId?: string;
        amount: number;
    }[];
}

/**
 * 排行榜配置
 */
export interface RankConfig {
    /** 排行榜类型 */
    type: RankType;
    /** 周期 */
    period: RankPeriod;
    /** 最大显示数量 */
    maxDisplay: number;
    /** 是否有奖励 */
    hasReward: boolean;
    /** 奖励配置 */
    rewards?: RankRewardConfig[];
    /** 重置时间 (小时) */
    resetHour?: number;
}

/**
 * 排行榜结算结果
 */
export interface RankSettlement {
    /** 排行榜类型 */
    type: RankType;
    /** 周期 */
    period: RankPeriod;
    /** 最终排名 */
    finalRank: number;
    /** 获得奖励 */
    rewards: {
        type: string;
        itemId?: string;
        amount: number;
    }[];
    /** 结算时间 */
    settleTime: number;
}