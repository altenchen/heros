/**
 * 存档管理器
 * 支持多存档槽位、存档导入导出、云存档同步
 */

import { EventCenter } from '../utils/EventTarget';
import {
    SaveSlot,
    SaveData,
    SaveResult,
    LoadResult,
    SaveMetadata,
    SaveConfig,
    SaveEventType,
    DEFAULT_SAVE_CONFIG,
    CloudSaveStatus
} from '../config/SaveTypes';

/**
 * 存档管理器类
 */
export class SaveManager {
    private static instance: SaveManager | null = null;

    /** 配置 */
    private config: SaveConfig;

    /** 当前激活的存档槽位 */
    private currentSlotId: number = -1;

    /** 存档槽位列表 */
    private slots: Map<number, SaveSlot> = new Map();

    /** 游戏开始时间(用于计算游戏时长) */
    private sessionStartTime: number = 0;

    /** 累计游戏时长 */
    private accumulatedPlayTime: number = 0;

    /** 云存档状态 */
    private cloudStatus: CloudSaveStatus = {
        isLoggedIn: false,
        lastSyncTime: 0,
        syncStatus: 'pending'
    };

    /** 获取存档数据的回调 */
    private getSaveDataCallback: (() => SaveData) | null = null;

    /** 加载存档数据的回调 */
    private loadSaveDataCallback: ((data: SaveData) => void) | null = null;

    private constructor() {
        this.config = { ...DEFAULT_SAVE_CONFIG };
    }

    /**
     * 获取单例
     */
    static getInstance(): SaveManager {
        if (!SaveManager.instance) {
            SaveManager.instance = new SaveManager();
        }
        return SaveManager.instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this.loadSlotsMetadata();
        this.sessionStartTime = Date.now();
        console.log('[SaveManager] 初始化完成，已发现', this.slots.size, '个存档');
    }

    /**
     * 设置存档数据回调
     */
    setSaveDataCallback(callback: () => SaveData): void {
        this.getSaveDataCallback = callback;
    }

    /**
     * 设置加载存档回调
     */
    setLoadDataCallback(callback: (data: SaveData) => void): void {
        this.loadSaveDataCallback = callback;
    }

    /**
     * 加载存档槽位元数据
     */
    private loadSlotsMetadata(): void {
        try {
            const metaData = localStorage.getItem(this.config.metaKey);
            if (metaData) {
                const slots = JSON.parse(metaData) as SaveSlot[];
                slots.forEach(slot => {
                    this.slots.set(slot.id, slot);
                });
            }
        } catch (e) {
            console.error('[SaveManager] 加载存档元数据失败:', e);
        }

        // 初始化空槽位
        for (let i = 0; i < this.config.maxSlots; i++) {
            if (!this.slots.has(i)) {
                this.slots.set(i, {
                    id: i,
                    name: `存档 ${i + 1}`,
                    createTime: 0,
                    lastSaveTime: 0,
                    playTime: 0,
                    playerName: '',
                    playerLevel: 0,
                    faction: '',
                    townLevel: 0,
                    heroCount: 0,
                    completedLevels: 0,
                    isEmpty: true
                });
            }
        }
    }

    /**
     * 保存存档槽位元数据
     */
    private saveSlotsMetadata(): void {
        const slots = Array.from(this.slots.values());
        localStorage.setItem(this.config.metaKey, JSON.stringify(slots));
    }

    /**
     * 获取所有存档槽位
     */
    getSlots(): SaveSlot[] {
        return Array.from(this.slots.values());
    }

    /**
     * 获取指定槽位
     */
    getSlot(slotId: number): SaveSlot | undefined {
        return this.slots.get(slotId);
    }

    /**
     * 获取当前激活的槽位ID
     */
    getCurrentSlotId(): number {
        return this.currentSlotId;
    }

    /**
     * 设置当前槽位
     */
    setCurrentSlot(slotId: number): void {
        this.currentSlotId = slotId;
        EventCenter.emit(SaveEventType.SLOT_CHANGED, { slotId });
    }

    /**
     * 创建新存档
     */
    createSave(slotId: number, playerName: string, faction: string): SaveResult {
        if (slotId < 0 || slotId >= this.config.maxSlots) {
            return { success: false, error: '无效的存档槽位' };
        }

        const slot: SaveSlot = {
            id: slotId,
            name: `存档 ${slotId + 1}`,
            createTime: Date.now(),
            lastSaveTime: Date.now(),
            playTime: 0,
            playerName,
            playerLevel: 1,
            faction,
            townLevel: 1,
            heroCount: 1,
            completedLevels: 0,
            isEmpty: false
        };

        this.slots.set(slotId, slot);
        this.currentSlotId = slotId;
        this.accumulatedPlayTime = 0;
        this.saveSlotsMetadata();

        console.log(`[SaveManager] 创建新存档: 槽位${slotId}, 玩家${playerName}`);

        return { success: true, slot };
    }

    /**
     * 保存游戏到指定槽位
     */
    saveToSlot(slotId: number, saveData: SaveData): SaveResult {
        if (slotId < 0 || slotId >= this.config.maxSlots) {
            return { success: false, error: '无效的存档槽位' };
        }

        const slot = this.slots.get(slotId);
        if (!slot || slot.isEmpty) {
            return { success: false, error: '存档槽位为空，请先创建存档' };
        }

        try {
            // 更新存档数据
            saveData.timestamp = Date.now();
            localStorage.setItem(this.getSlotKey(slotId), JSON.stringify(saveData));

            // 更新槽位信息
            const currentPlayTime = this.getCurrentPlayTime();
            slot.lastSaveTime = Date.now();
            slot.playTime = currentPlayTime;
            this.slots.set(slotId, slot);
            this.saveSlotsMetadata();

            console.log(`[SaveManager] 存档保存成功: 槽位${slotId}, 游戏时长${Math.floor(currentPlayTime / 60)}分钟`);

            EventCenter.emit(SaveEventType.SAVE_COMPLETE, { slotId, slot });

            return { success: true, slot };
        } catch (e) {
            console.error('[SaveManager] 保存存档失败:', e);
            return { success: false, error: '保存存档失败' };
        }
    }

    /**
     * 保存当前存档
     */
    save(saveData: SaveData): SaveResult {
        if (this.currentSlotId < 0) {
            return { success: false, error: '没有激活的存档槽位' };
        }
        return this.saveToSlot(this.currentSlotId, saveData);
    }

    /**
     * 从指定槽位加载存档
     */
    loadFromSlot(slotId: number): LoadResult {
        if (slotId < 0 || slotId >= this.config.maxSlots) {
            return { success: false, error: '无效的存档槽位' };
        }

        const slot = this.slots.get(slotId);
        if (!slot || slot.isEmpty) {
            return { success: false, error: '存档槽位为空' };
        }

        try {
            const saveDataStr = localStorage.getItem(this.getSlotKey(slotId));
            if (!saveDataStr) {
                return { success: false, error: '存档数据不存在' };
            }

            const saveData = JSON.parse(saveDataStr) as SaveData;

            // 验证存档版本
            if (saveData.version !== this.config.version) {
                console.warn(`[SaveManager] 存档版本不匹配: ${saveData.version} vs ${this.config.version}`);
                // 可以在这里添加版本迁移逻辑
            }

            this.currentSlotId = slotId;
            this.accumulatedPlayTime = slot.playTime;
            this.sessionStartTime = Date.now();

            console.log(`[SaveManager] 存档加载成功: 槽位${slotId}, 玩家${slot.playerName}`);

            EventCenter.emit(SaveEventType.LOAD_COMPLETE, { slotId, slot });

            return { success: true, data: saveData };
        } catch (e) {
            console.error('[SaveManager] 加载存档失败:', e);
            return { success: false, error: '加载存档失败' };
        }
    }

    /**
     * 删除存档
     */
    deleteSave(slotId: number): SaveResult {
        if (slotId < 0 || slotId >= this.config.maxSlots) {
            return { success: false, error: '无效的存档槽位' };
        }

        const slot = this.slots.get(slotId);
        if (!slot || slot.isEmpty) {
            return { success: false, error: '存档槽位已经为空' };
        }

        try {
            // 删除存档数据
            localStorage.removeItem(this.getSlotKey(slotId));

            // 重置槽位信息
            const emptySlot: SaveSlot = {
                id: slotId,
                name: `存档 ${slotId + 1}`,
                createTime: 0,
                lastSaveTime: 0,
                playTime: 0,
                playerName: '',
                playerLevel: 0,
                faction: '',
                townLevel: 0,
                heroCount: 0,
                completedLevels: 0,
                isEmpty: true
            };
            this.slots.set(slotId, emptySlot);
            this.saveSlotsMetadata();

            // 如果删除的是当前存档，重置状态
            if (this.currentSlotId === slotId) {
                this.currentSlotId = -1;
            }

            console.log(`[SaveManager] 存档已删除: 槽位${slotId}`);

            EventCenter.emit(SaveEventType.SAVE_DELETED, { slotId });

            return { success: true, slot: emptySlot };
        } catch (e) {
            console.error('[SaveManager] 删除存档失败:', e);
            return { success: false, error: '删除存档失败' };
        }
    }

    /**
     * 更新当前存档槽位信息
     */
    updateSlotInfo(info: Partial<SaveSlot>): void {
        if (this.currentSlotId < 0) return;

        const slot = this.slots.get(this.currentSlotId);
        if (slot && !slot.isEmpty) {
            Object.assign(slot, info);
            this.slots.set(this.currentSlotId, slot);
            this.saveSlotsMetadata();
        }
    }

    /**
     * 获取当前游戏时长(秒)
     */
    getCurrentPlayTime(): number {
        const sessionTime = (Date.now() - this.sessionStartTime) / 1000;
        return this.accumulatedPlayTime + sessionTime;
    }

    /**
     * 格式化游戏时长显示
     */
    formatPlayTime(seconds: number): string {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        if (hours > 0) {
            return `${hours}小时${minutes}分钟`;
        }
        return `${minutes}分钟`;
    }

    /**
     * 获取存档存储键
     */
    private getSlotKey(slotId: number): string {
        return `${this.config.keyPrefix}${slotId}`;
    }

    /**
     * 检查是否有存档
     */
    hasAnySave(): boolean {
        for (const slot of this.slots.values()) {
            if (!slot.isEmpty) {
                return true;
            }
        }
        return false;
    }

    /**
     * 获取第一个非空存档槽位
     */
    getFirstUsedSlot(): SaveSlot | null {
        for (const slot of this.slots.values()) {
            if (!slot.isEmpty) {
                return slot;
            }
        }
        return null;
    }

    /**
     * 导出存档(用于云同步或备份)
     */
    exportSave(slotId: number): string | null {
        const result = this.loadFromSlot(slotId);
        if (!result.success || !result.data) {
            return null;
        }

        const exportData = {
            slot: this.slots.get(slotId),
            data: result.data
        };

        EventCenter.emit(SaveEventType.EXPORT_COMPLETE, { slotId });

        return JSON.stringify(exportData);
    }

    /**
     * 导入存档
     */
    importSave(slotId: number, importStr: string): SaveResult {
        try {
            const importData = JSON.parse(importStr);
            const slot = importData.slot as SaveSlot;
            const saveData = importData.data as SaveData;

            // 更新槽位ID
            slot.id = slotId;
            slot.isEmpty = false;
            slot.lastSaveTime = Date.now();

            // 保存数据
            localStorage.setItem(this.getSlotKey(slotId), JSON.stringify(saveData));
            this.slots.set(slotId, slot);
            this.saveSlotsMetadata();

            console.log(`[SaveManager] 存档导入成功: 槽位${slotId}`);

            EventCenter.emit(SaveEventType.IMPORT_COMPLETE, { slotId, slot });

            return { success: true, slot };
        } catch (e) {
            console.error('[SaveManager] 导入存档失败:', e);
            return { success: false, error: '导入存档失败，数据格式错误' };
        }
    }

    /**
     * 获取云存档状态
     */
    getCloudStatus(): CloudSaveStatus {
        return { ...this.cloudStatus };
    }

    /**
     * 同步云存档(微信小游戏)
     */
    async syncToCloud(): Promise<boolean> {
        // TODO: 实现微信云存档同步
        console.log('[SaveManager] 云存档同步待实现');
        return false;
    }

    /**
     * 从云端加载存档
     */
    async loadFromCloud(): Promise<LoadResult> {
        // TODO: 实现微信云存档加载
        console.log('[SaveManager] 云存档加载待实现');
        return { success: false, error: '云存档功能未实现' };
    }

    /**
     * 序列化(用于持久化当前状态)
     */
    serialize(): string {
        return JSON.stringify({
            currentSlotId: this.currentSlotId,
            accumulatedPlayTime: this.getCurrentPlayTime()
        });
    }

    /**
     * 反序列化
     */
    deserialize(json: string): void {
        try {
            const data = JSON.parse(json);
            this.currentSlotId = data.currentSlotId || -1;
            this.accumulatedPlayTime = data.accumulatedPlayTime || 0;
        } catch (e) {
            console.error('[SaveManager] 反序列化失败:', e);
        }
    }

    /**
     * 清理
     */
    cleanup(): void {
        this.slots.clear();
        this.currentSlotId = -1;
        SaveManager.instance = null;
    }
}

/** 存档管理器单例 */
export const saveManager = SaveManager.getInstance();