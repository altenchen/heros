/**
 * 竞技场系统模块导出
 * 遵循阿里巴巴开发者手册规范
 */

export { ArenaManager, arenaManager } from './ArenaManager';
export {
    ArenaTier,
    ArenaState,
    MatchType,
    BattleResult,
    ArenaEventType,
    ArenaPlayerData,
    BattleRecord,
    ArenaSettings,
    ArenaEventData,
    MatchResult
} from '../config/ArenaTypes';
export {
    arenaTierConfigs,
    matchConfigs,
    currentSeason,
    getTierByScore,
    getTierConfig,
    getMatchConfig,
    getNextTier,
    getPrevTier
} from '../config/arena.json';