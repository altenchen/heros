/**
 * 背包管理器
 * 管理玩家道具的存储、使用、出售
 * 遵循阿里巴巴开发者手册规范
 */

import {
    InventoryItem,
    InventorySlot,
    InventoryType,
    InventorySettings,
    InventoryEventType,
    InventoryEventData,
    ItemConfig,
    ItemType,
    UseItemResult,
    SellItemResult,
    DEFAULT_INVENTORY_SETTINGS
} from '../config/InventoryTypes';
import { getItemConfig, giftItems } from '../config/items.json';
import { EventCenter } from '../utils/EventTarget';
import { playerDataManager } from '../utils/PlayerDataManager';

/**
 * 背包管理器
 * 单例模式
 */
export class InventoryManager {
    private static _instance: InventoryManager | null = null;

    /** 背包格子 */
    private _slots: Map<InventoryType, InventorySlot[]> = new Map();

    /** 背包容量 */
    private _capacity: Map<InventoryType, number> = new Map();

    /** 背包设置 */
    private _settings: InventorySettings = { ...DEFAULT_INVENTORY_SETTINGS };

    /** 存储键 */
    private readonly SETTINGS_KEY = 'hmm_legacy_inventory';

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): InventoryManager {
        if (!InventoryManager._instance) {
            InventoryManager._instance = new InventoryManager();
        }
        return InventoryManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this._initInventory(InventoryType.MAIN);
        this._checkExpiredItems();
        console.log('[InventoryManager] 初始化完成');
    }

    /**
     * 初始化背包
     */
    private _initInventory(type: InventoryType): void {
        if (!this._slots.has(type)) {
            const capacity = this._settings.initialCapacity;
            const slots: InventorySlot[] = [];

            for (let i = 0; i < capacity; i++) {
                slots.push({
                    index: i,
                    item: null,
                    unlocked: true
                });
            }

            this._slots.set(type, slots);
            this._capacity.set(type, capacity);
        }
    }

    /**
     * 检查过期道具
     */
    private _checkExpiredItems(): void {
        const now = Date.now();

        this._slots.forEach((slots, type) => {
            slots.forEach(slot => {
                if (slot.item && slot.item.expireAt > 0 && slot.item.expireAt < now) {
                    // 道具已过期
                    this._removeItem(slot.item.instanceId, slot.item.count, type);

                    // 发送过期事件
                    const eventData: InventoryEventData = {
                        itemId: slot.item.itemId,
                        instanceId: slot.item.instanceId,
                        count: slot.item.count,
                        inventoryType: type
                    };
                    EventCenter.emit(InventoryEventType.ITEM_EXPIRE, eventData);

                    console.log(`[InventoryManager] 道具过期: ${slot.item.itemId}`);
                }
            });
        });
    }

    /**
     * 生成唯一ID
     */
    private _generateInstanceId(): string {
        return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 添加道具
     */
    addItem(itemId: string, count: number = 1): boolean {
        const config = getItemConfig(itemId);
        if (!config) {
            console.warn(`[InventoryManager] 道具配置不存在: ${itemId}`);
            return false;
        }

        const type = this._getInventoryType(config.type);
        this._initInventory(type);

        const slots = this._slots.get(type)!;
        let remainingCount = count;

        // 先尝试堆叠到现有道具
        if (config.maxStack > 1) {
            for (const slot of slots) {
                if (slot.item && slot.item.itemId === itemId && slot.item.count < config.maxStack) {
                    const canAdd = Math.min(remainingCount, config.maxStack - slot.item.count);
                    slot.item.count += canAdd;
                    remainingCount -= canAdd;

                    if (remainingCount <= 0) {
                        break;
                    }
                }
            }
        }

        // 如果还有剩余，找空格子放入
        while (remainingCount > 0) {
            const emptySlot = slots.find(s => !s.item);
            if (!emptySlot) {
                console.warn(`[InventoryManager] 背包已满: ${type}`);
                return false;
            }

            const addCount = Math.min(remainingCount, config.maxStack);
            const now = Date.now();

            emptySlot.item = {
                instanceId: this._generateInstanceId(),
                itemId,
                count: addCount,
                obtainTime: now,
                expireAt: config.expireTime ? now + config.expireTime * 1000 : 0,
                remainingUses: config.useCount
            };

            remainingCount -= addCount;
        }

        // 发送添加事件
        const eventData: InventoryEventData = {
            itemId,
            count,
            inventoryType: type
        };
        EventCenter.emit(InventoryEventType.ITEM_ADD, eventData);

        console.log(`[InventoryManager] 添加道具: ${itemId} x${count}`);

        return true;
    }

    /**
     * 移除道具
     */
    removeItem(itemId: string, count: number = 1): boolean {
        const config = getItemConfig(itemId);
        if (!config) {
            return false;
        }

        const type = this._getInventoryType(config.type);
        return this._removeItem(itemId, count, type);
    }

    /**
     * 移除道具内部实现
     */
    private _removeItem(itemIdOrInstanceId: string, count: number, type: InventoryType): boolean {
        const slots = this._slots.get(type);
        if (!slots) {
            return false;
        }

        let remainingCount = count;

        // 从后往前遍历，先消耗新获得的道具
        for (let i = slots.length - 1; i >= 0 && remainingCount > 0; i--) {
            const slot = slots[i];
            if (slot.item && (slot.item.itemId === itemIdOrInstanceId || slot.item.instanceId === itemIdOrInstanceId)) {
                if (slot.item.count <= remainingCount) {
                    remainingCount -= slot.item.count;
                    slot.item = null;
                } else {
                    slot.item.count -= remainingCount;
                    remainingCount = 0;
                }
            }
        }

        return remainingCount === 0;
    }

    /**
     * 使用道具
     */
    useItem(instanceId: string, count: number = 1, target?: any): UseItemResult {
        // 查找道具
        let item: InventoryItem | null = null;
        let itemType: InventoryType | null = null;

        this._slots.forEach((slots, type) => {
            for (const slot of slots) {
                if (slot.item && slot.item.instanceId === instanceId) {
                    item = slot.item;
                    itemType = type;
                    break;
                }
            }
        });

        if (!item || !itemType) {
            return {
                success: false,
                error: '道具不存在'
            };
        }

        const config = getItemConfig(item.itemId);
        if (!config) {
            return {
                success: false,
                error: '道具配置不存在'
            };
        }

        // 检查是否可使用
        if (!config.usable) {
            return {
                success: false,
                itemId: item.itemId,
                error: '该道具无法使用'
            };
        }

        // 检查数量
        if (item.count < count) {
            return {
                success: false,
                itemId: item.itemId,
                error: '道具数量不足'
            };
        }

        // 检查冷却时间
        if (config.cooldown && item.lastUseTime) {
            const elapsed = (Date.now() - item.lastUseTime) / 1000;
            if (elapsed < config.cooldown) {
                return {
                    success: false,
                    itemId: item.itemId,
                    error: `冷却中，还需${Math.ceil(config.cooldown - elapsed)}秒`
                };
            }
        }

        // 检查等级要求
        if (config.levelRequired) {
            const playerLevel = playerDataManager.getPlayerLevel();
            if (playerLevel < config.levelRequired) {
                return {
                    success: false,
                    itemId: item.itemId,
                    error: `需要等级${config.levelRequired}`
                };
            }
        }

        // 执行效果
        const effects = this._executeEffects(config.effects || [], target);

        // 更新道具状态
        item.lastUseTime = Date.now();
        if (item.remainingUses !== undefined) {
            item.remainingUses -= count;
        }

        // 扣除数量
        this._removeItem(instanceId, count, itemType);

        // 发送使用事件
        const eventData: InventoryEventData = {
            itemId: item.itemId,
            instanceId,
            count,
            inventoryType: itemType,
            effects
        };
        EventCenter.emit(InventoryEventType.ITEM_USE, eventData);

        console.log(`[InventoryManager] 使用道具: ${item.itemId} x${count}`);

        // 获取剩余数量
        const remainingCount = this.getItemCount(item.itemId);

        return {
            success: true,
            itemId: item.itemId,
            count,
            effects,
            remainingCount
        };
    }

    /**
     * 执行道具效果
     */
    private _executeEffects(effects: any[], target?: any): any[] {
        const results: any[] = [];

        effects.forEach(effect => {
            switch (effect.type) {
                case 'add_exp':
                    playerDataManager.addExperience(effect.value);
                    results.push(effect);
                    break;

                case 'restore_stamina':
                    playerDataManager.addResource('stamina', effect.value);
                    results.push(effect);
                    break;

                case 'add_resource':
                    const resourceId = effect.params?.resourceId || 'gold';
                    playerDataManager.addResource(resourceId, effect.value);
                    results.push(effect);
                    break;

                case 'open_gift':
                    const giftContents = this._openGift(effect.params?.giftId);
                    results.push({ ...effect, giftContents });
                    break;

                case 'add_buff':
                    // TODO: 实现Buff系统
                    console.log(`[InventoryManager] 添加Buff: ${effect.params?.buffType}`);
                    results.push(effect);
                    break;

                case 'speedup_build':
                    // TODO: 实现加速系统
                    console.log(`[InventoryManager] 加速: ${effect.value}秒`);
                    results.push(effect);
                    break;

                default:
                    console.log(`[InventoryManager] 未知效果类型: ${effect.type}`);
            }
        });

        return results;
    }

    /**
     * 开启礼包
     */
    private _openGift(giftId: string): any[] {
        const giftConfig = giftItems.find(g => g.itemId === giftId);
        if (!giftConfig || !giftConfig.giftContents) {
            return [];
        }

        const contents: any[] = [];

        giftConfig.giftContents.forEach(content => {
            // 检查概率
            const roll = Math.random() * 100;
            if (roll <= (content.probability || 100)) {
                // 发放奖励
                if (content.type === 'resource') {
                    playerDataManager.addResource(content.itemId || 'gold', content.amount);
                } else if (content.type === 'item') {
                    this.addItem(content.itemId || '', content.amount);
                }

                contents.push(content);
            }
        });

        return contents;
    }

    /**
     * 出售道具
     */
    sellItem(instanceId: string, count: number = 1): SellItemResult {
        // 查找道具
        let item: InventoryItem | null = null;
        let itemType: InventoryType | null = null;

        this._slots.forEach((slots, type) => {
            for (const slot of slots) {
                if (slot.item && slot.item.instanceId === instanceId) {
                    item = slot.item;
                    itemType = type;
                    break;
                }
            }
        });

        if (!item || !itemType) {
            return {
                success: false,
                error: '道具不存在'
            };
        }

        const config = getItemConfig(item.itemId);
        if (!config) {
            return {
                success: false,
                error: '道具配置不存在'
            };
        }

        // 检查是否可出售
        if (!config.sellable) {
            return {
                success: false,
                error: '该道具无法出售'
            };
        }

        // 检查数量
        if (item.count < count) {
            return {
                success: false,
                error: '道具数量不足'
            };
        }

        // 计算出售价格
        const sellPrice = config.sellPrice;
        if (!sellPrice) {
            return {
                success: false,
                error: '该道具没有出售价格'
            };
        }

        const totalAmount = sellPrice.amount * count;

        // 扣除道具
        this._removeItem(instanceId, count, itemType);

        // 发放货币
        playerDataManager.addResource(sellPrice.currency, totalAmount);

        console.log(`[InventoryManager] 出售道具: ${item.itemId} x${count}, 获得${totalAmount}${sellPrice.currency}`);

        return {
            success: true,
            currency: sellPrice.currency,
            amount: totalAmount
        };
    }

    /**
     * 获取道具数量
     */
    getItemCount(itemId: string): number {
        let count = 0;

        this._slots.forEach(slots => {
            slots.forEach(slot => {
                if (slot.item && slot.item.itemId === itemId) {
                    count += slot.item.count;
                }
            });
        });

        return count;
    }

    /**
     * 检查是否有足够道具
     */
    hasItem(itemId: string, count: number = 1): boolean {
        return this.getItemCount(itemId) >= count;
    }

    /**
     * 获取背包所有道具
     */
    getAllItems(type?: InventoryType): InventoryItem[] {
        const items: InventoryItem[] = [];

        if (type) {
            const slots = this._slots.get(type);
            if (slots) {
                slots.forEach(slot => {
                    if (slot.item) {
                        items.push(slot.item);
                    }
                });
            }
        } else {
            this._slots.forEach(slots => {
                slots.forEach(slot => {
                    if (slot.item) {
                        items.push(slot.item);
                    }
                });
            });
        }

        return items;
    }

    /**
     * 获取背包容量
     */
    getCapacity(type: InventoryType): number {
        return this._capacity.get(type) || this._settings.initialCapacity;
    }

    /**
     * 获取背包使用量
     */
    getUsedSlots(type: InventoryType): number {
        const slots = this._slots.get(type);
        if (!slots) {
            return 0;
        }
        return slots.filter(s => s.item !== null).length;
    }

    /**
     * 扩容背包
     */
    expandInventory(type: InventoryType): boolean {
        const currentCapacity = this.getCapacity(type);
        if (currentCapacity >= this._settings.maxCapacity) {
            console.warn('[InventoryManager] 已达最大容量');
            return false;
        }

        // 计算扩容费用
        const expandCount = this._capacity.get(type) ? 1 : 0;
        const cost = Math.floor(
            this._settings.expandCost.baseAmount *
            Math.pow(this._settings.expandCost.multiplier, expandCount)
        );

        // 检查货币
        const currency = this._settings.expandCost.currency;
        const currentAmount = playerDataManager.getResource(currency);
        if (currentAmount < cost) {
            console.warn('[InventoryManager] 资源不足');
            return false;
        }

        // 扣除货币
        playerDataManager.addResource(currency, -cost);

        // 扩容
        const newCapacity = Math.min(
            currentCapacity + this._settings.expandStep,
            this._settings.maxCapacity
        );

        const slots = this._slots.get(type) || [];
        for (let i = slots.length; i < newCapacity; i++) {
            slots.push({
                index: i,
                item: null,
                unlocked: true
            });
        }

        this._slots.set(type, slots);
        this._capacity.set(type, newCapacity);

        // 发送扩容事件
        const eventData: InventoryEventData = {
            inventoryType: type
        };
        EventCenter.emit(InventoryEventType.INVENTORY_EXPAND, eventData);

        console.log(`[InventoryManager] 背包扩容: ${type} -> ${newCapacity}`);

        return true;
    }

    /**
     * 获取道具类型对应的背包类型
     */
    private _getInventoryType(itemType: ItemType): InventoryType {
        switch (itemType) {
            case ItemType.EQUIPMENT:
                return InventoryType.EQUIPMENT;
            case ItemType.MATERIAL:
                return InventoryType.MATERIAL;
            case ItemType.SHARD:
                return InventoryType.SHARD;
            default:
                return InventoryType.MAIN;
        }
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            capacity: Array.from(this._capacity.entries()),
            slots: Array.from(this._slots.entries()).map(([type, slots]) => ({
                type,
                slots: slots.filter(s => s.item).map(s => ({
                    index: s.index,
                    item: s.item
                }))
            }))
        };
        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);

            if (parsed.capacity) {
                this._capacity = new Map(parsed.capacity);
            }

            if (parsed.slots) {
                parsed.slots.forEach((slotData: any) => {
                    const type = slotData.type as InventoryType;
                    const capacity = this._capacity.get(type) || this._settings.initialCapacity;
                    const slots: InventorySlot[] = [];

                    for (let i = 0; i < capacity; i++) {
                        slots.push({
                            index: i,
                            item: null,
                            unlocked: true
                        });
                    }

                    slotData.slots.forEach((s: any) => {
                        if (s.index < slots.length) {
                            slots[s.index].item = s.item;
                        }
                    });

                    this._slots.set(type, slots);
                });
            }

            this._checkExpiredItems();
            console.log('[InventoryManager] 数据加载完成');
        } catch (e) {
            console.error('[InventoryManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._slots.clear();
        this._capacity.clear();
    }
}

// 导出单例
export const inventoryManager = InventoryManager.getInstance();