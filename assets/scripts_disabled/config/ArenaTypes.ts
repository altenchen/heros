/**
 * 竞技场类型定义
 * 遵循阿里巴巴开发者手册规范
 */

// ==================== 枚举定义 ====================

/** 竞技场段位 */
export enum ArenaTier {
    /** 青铜 */
    BRONZE = 'bronze',
    /** 白银 */
    SILVER = 'silver',
    /** 黄金 */
    GOLD = 'gold',
    /** 铂金 */
    PLATINUM = 'platinum',
    /** 钻石 */
    DIAMOND = 'diamond',
    /** 大师 */
    MASTER = 'master',
    /** 王者 */
    KING = 'king'
}

/** 竞技场状态 */
export enum ArenaState {
    /** 空闲 */
    IDLE = 'idle',
    /** 匹配中 */
    MATCHING = 'matching',
    /** 战斗中 */
    BATTLING = 'battling',
    /** 结算中 */
    SETTLING = 'settling'
}

/** 匹配类型 */
export enum MatchType {
    /** 快速匹配 */
    QUICK = 'quick',
    /** 排位匹配 */
    RANKED = 'ranked',
    /** 好友对战 */
    FRIEND = 'friend'
}

/** 战斗结果 */
export enum BattleResult {
    /** 胜利 */
    WIN = 'win',
    /** 失败 */
    LOSE = 'lose',
    /** 平局 */
    DRAW = 'draw'
}

// ==================== 接口定义 ====================

/** 段位配置 */
export interface ArenaTierConfig {
    /** 段位 */
    tier: ArenaTier;
    /** 段位名称 */
    name: string;
    /** 所需最低积分 */
    minScore: number;
    /** 所需最高积分 */
    maxScore: number;
    /** 段位图标 */
    icon: string;
    /** 段位框 */
    frame: string;
    /** 星级数量 */
    stars: number;
    /** 奖励 */
    rewards: ArenaTierReward[];
}

/** 段位奖励 */
export interface ArenaTierReward {
    /** 奖励类型 */
    type: 'resource' | 'item' | 'hero' | 'skin';
    /** 物品ID */
    itemId: string;
    /** 数量 */
    amount: number;
}

/** 玩家竞技场数据 */
export interface ArenaPlayerData {
    /** 玩家ID */
    playerId: string;
    /** 玩家名称 */
    playerName: string;
    /** 玩家头像 */
    avatar: string;
    /** 当前积分 */
    score: number;
    /** 当前段位 */
    tier: ArenaTier;
    /** 当前星级 */
    stars: number;
    /** 胜场数 */
    wins: number;
    /** 败场数 */
    losses: number;
    /** 总场次 */
    totalBattles: number;
    /** 胜率 */
    winRate: number;
    /** 连胜次数 */
    winStreak: number;
    /** 最高连胜 */
    maxWinStreak: number;
    /** 最高段位 */
    highestTier: ArenaTier;
    /** 最高积分 */
    highestScore: number;
    /** 上次战斗时间 */
    lastBattleTime: number;
    /** 赛季重置保护星数 */
    protectedStars: number;
}

/** 赛季数据 */
export interface ArenaSeasonData {
    /** 赛季ID */
    seasonId: string;
    /** 赛季名称 */
    seasonName: string;
    /** 开始时间 */
    startTime: number;
    /** 结束时间 */
    endTime: number;
    /** 赛季状态 */
    status: 'preparing' | 'active' | 'ended';
    /** 奖励配置 */
    rewards: SeasonReward[];
}

/** 赛季奖励 */
export interface SeasonReward {
    /** 排名范围起始 */
    rankStart: number;
    /** 排名范围结束 */
    rankEnd: number;
    /** 奖励内容 */
    rewards: ArenaTierReward[];
}

/** 匹配配置 */
export interface MatchConfig {
    /** 匹配类型 */
    type: MatchType;
    /** 积分范围 */
    scoreRange: number;
    /** 匹配超时时间（秒） */
    timeout: number;
    /** 每日免费次数 */
    dailyFreeCount: number;
    /** 购买次数消耗 */
    buyCost: {
        type: string;
        amount: number;
    };
}

/** 匹配结果 */
export interface MatchResult {
    /** 是否成功 */
    success: boolean;
    /** 对手数据 */
    opponent?: ArenaPlayerData;
    /** 匹配耗时（毫秒） */
    matchTime?: number;
    /** 错误信息 */
    error?: string;
}

/** 战斗记录 */
export interface BattleRecord {
    /** 记录ID */
    recordId: string;
    /** 战斗时间 */
    battleTime: number;
    /** 对手ID */
    opponentId: string;
    /** 对手名称 */
    opponentName: string;
    /** 战斗结果 */
    result: BattleResult;
    /** 积分变化 */
    scoreChange: number;
    /** 战斗回放数据 */
    replayData?: string;
    /** 战斗时长（秒） */
    duration: number;
}

/** 竞技场设置 */
export interface ArenaSettings {
    /** 每日挑战次数上限 */
    dailyChallengeLimit: number;
    /** 购买次数上限 */
    dailyBuyLimit: number;
    /** 购买次数消耗 */
    buyCost: {
        type: string;
        baseAmount: number;
        increment: number;
    };
    /** 胜利积分 */
    winScore: number;
    /** 失败积分 */
    loseScore: number;
    /** 连胜加成 */
    winStreakBonus: number[];
    /** 段位保护次数 */
    tierProtectionCount: number;
    /** 赛季时长（天） */
    seasonDuration: number;
}

/** 竞技场事件类型 */
export enum ArenaEventType {
    /** 匹配开始 */
    MATCH_START = 'arena_match_start',
    /** 匹配成功 */
    MATCH_SUCCESS = 'arena_match_success',
    /** 匹配超时 */
    MATCH_TIMEOUT = 'arena_match_timeout',
    /** 匹配取消 */
    MATCH_CANCEL = 'arena_match_cancel',
    /** 战斗开始 */
    BATTLE_START = 'arena_battle_start',
    /** 战斗结束 */
    BATTLE_END = 'arena_battle_end',
    /** 积分更新 */
    SCORE_UPDATE = 'arena_score_update',
    /** 段位提升 */
    TIER_UP = 'arena_tier_up',
    /** 段位下降 */
    TIER_DOWN = 'arena_tier_down',
    /** 赛季开始 */
    SEASON_START = 'arena_season_start',
    /** 赛季结束 */
    SEASON_END = 'arena_season_end',
    /** 奖励领取 */
    REWARD_CLAIM = 'arena_reward_claim'
}

/** 竞技场事件数据 */
export interface ArenaEventData {
    /** 事件类型 */
    type: ArenaEventType;
    /** 玩家ID */
    playerId?: string;
    /** 对手数据 */
    opponent?: ArenaPlayerData;
    /** 战斗结果 */
    result?: BattleResult;
    /** 积分变化 */
    scoreChange?: number;
    /** 当前积分 */
    currentScore?: number;
    /** 当前段位 */
    currentTier?: ArenaTier;
    /** 赛季数据 */
    season?: ArenaSeasonData;
    /** 错误信息 */
    error?: string;
}

// ==================== 默认值 ====================

/** 默认竞技场设置 */
export const DEFAULT_ARENA_SETTINGS: ArenaSettings = {
    dailyChallengeLimit: 10,
    dailyBuyLimit: 5,
    buyCost: {
        type: 'gems',
        baseAmount: 50,
        increment: 20
    },
    winScore: 25,
    loseScore: 15,
    winStreakBonus: [0, 0, 5, 10, 15, 20],
    tierProtectionCount: 3,
    seasonDuration: 30
};