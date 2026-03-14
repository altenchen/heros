/**
 * 图鉴系统模块导出
 * 遵循阿里巴巴开发者手册规范
 */

export { CollectionManager, collectionManager } from './CollectionManager';
export {
    CollectionType,
    CollectionState,
    CollectionRewardState,
    CollectionEventType,
    CollectionEntryConfig,
    CollectionEntryData,
    CollectionStats,
    CollectionEventData
} from '../config/CollectionTypes';
export {
    allCollectionEntries,
    heroCollectionEntries,
    unitCollectionEntries,
    itemCollectionEntries,
    collectionProgressRewards,
    getCollectionEntry,
    getEntriesByType,
    getEntryByTargetId,
    getRarityColorHex
} from '../config/collection.json';