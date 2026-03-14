/**
 * 背包模块
 * 导出背包系统相关类和配置
 */

export * from '../config/InventoryTypes';
export { InventoryManager, inventoryManager } from './InventoryManager';
export {
    consumableItems,
    materialItems,
    shardItems,
    giftItems,
    allItems,
    getItemConfig,
    getItemsByType,
    getItemsByQuality
} from '../config/items.json';