/**
 * 招募系统模块导出
 * 遵循阿里巴巴开发者手册规范
 */

export { GachaManager, gachaManager } from './GachaManager';
export {
    GachaPoolType,
    Rarity,
    GachaResultType,
    GachaEventType,
    GachaPoolConfig,
    GachaPoolItem,
    GachaResult,
    GachaResponse,
    GachaRecord,
    PlayerGachaData,
    GachaEventData
} from '../config/GachaTypes';
export {
    gachaPools,
    getGachaPool,
    getActivePools,
    getItemsByRarity,
    getUpItems,
    getRarityColor,
    getRarityName
} from '../config/gacha.json';