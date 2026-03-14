/**
 * 自动存档管理器
 * 定期自动保存游戏进度
 */

import { EventCenter } from '../utils/EventTarget';
import { GameEvent } from '../utils/EventTarget';
import { saveManager, SaveManager } from './SaveManager';
import {
    AutoSaveConfig,
    SaveEventType,
    DEFAULT_SAVE_CONFIG
} from '../config/SaveTypes';

/**
 * 自动存档管理器类
 */
export class AutoSaveManager {
    private static instance: AutoSaveManager | null = null;

    /** 配置 */
    private config: AutoSaveConfig;

    /** 自动存档定时器 */
    private autoSaveTimer: number | null = null;

    /** 上次存档时间 */
    private lastSaveTime: number = 0;

    /** 是否已初始化 */
    private initialized: boolean = false;

    /** 获取存档数据的回调 */
    private getSaveDataCallback: (() => any) | null = null;

    private constructor() {
        this.config = { ...DEFAULT_SAVE_CONFIG.autoSave };
    }

    /**
     * 获取单例
     */
    static getInstance(): AutoSaveManager {
        if (!AutoSaveManager.instance) {
            AutoSaveManager.instance = new AutoSaveManager();
        }
        return AutoSaveManager.instance;
    }

    /**
     * 初始化
     */
    init(config?: Partial<AutoSaveConfig>): void {
        if (this.initialized) return;

        if (config) {
            this.config = { ...this.config, ...config };
        }

        // 监听战斗结束事件
        EventCenter.on(GameEvent.BATTLE_END, this.onBattleEnd, this);

        this.initialized = true;
        console.log('[AutoSaveManager] 初始化完成，自动存档间隔:', this.config.interval / 1000, '秒');
    }

    /**
     * 设置存档数据回调
     */
    setSaveDataCallback(callback: () => any): void {
        this.getSaveDataCallback = callback;
    }

    /**
     * 开始自动存档
     */
    start(): void {
        if (!this.config.enabled) {
            console.log('[AutoSaveManager] 自动存档已禁用');
            return;
        }

        if (this.autoSaveTimer !== null) {
            console.log('[AutoSaveManager] 自动存档已在运行');
            return;
        }

        this.autoSaveTimer = window.setInterval(() => {
            this.doAutoSave();
        }, this.config.interval);

        console.log('[AutoSaveManager] 自动存档已启动');
    }

    /**
     * 停止自动存档
     */
    stop(): void {
        if (this.autoSaveTimer !== null) {
            clearInterval(this.autoSaveTimer);
            this.autoSaveTimer = null;
            console.log('[AutoSaveManager] 自动存档已停止');
        }
    }

    /**
     * 执行自动存档
     */
    private doAutoSave(): void {
        // 检查最小存档间隔
        const now = Date.now();
        if (now - this.lastSaveTime < this.config.minInterval) {
            return;
        }

        // 检查是否有激活的存档
        const currentSlotId = saveManager.getCurrentSlotId();
        if (currentSlotId < 0) {
            return;
        }

        // 获取存档数据
        if (!this.getSaveDataCallback) {
            console.warn('[AutoSaveManager] 未设置存档数据回调');
            return;
        }

        const saveData = this.getSaveDataCallback();

        console.log('[AutoSaveManager] 执行自动存档...');

        EventCenter.emit(SaveEventType.AUTO_SAVE_TRIGGERED, { slotId: currentSlotId });

        const result = saveManager.save(saveData);
        if (result.success) {
            this.lastSaveTime = now;
            console.log('[AutoSaveManager] 自动存档成功');
        } else {
            console.error('[AutoSaveManager] 自动存档失败:', result.error);
        }
    }

    /**
     * 战斗结束处理
     */
    private onBattleEnd(data: any): void {
        if (!this.config.saveOnBattleEnd) return;

        // 延迟一点时间存档，避免战斗结算过程中的数据竞争
        setTimeout(() => {
            this.doAutoSave();
        }, 1000);
    }

    /**
     * 退出时存档
     */
    saveOnExit(): void {
        if (!this.config.saveOnExit) return;

        const currentSlotId = saveManager.getCurrentSlotId();
        if (currentSlotId < 0) return;

        if (!this.getSaveDataCallback) return;

        const saveData = this.getSaveDataCallback();
        const result = saveManager.save(saveData);

        if (result.success) {
            console.log('[AutoSaveManager] 退出存档成功');
        }
    }

    /**
     * 手动触发存档
     */
    manualSave(): boolean {
        const now = Date.now();
        if (now - this.lastSaveTime < this.config.minInterval) {
            console.log('[AutoSaveManager] 存档间隔太短，请稍后再试');
            return false;
        }

        this.doAutoSave();
        return true;
    }

    /**
     * 获取配置
     */
    getConfig(): AutoSaveConfig {
        return { ...this.config };
    }

    /**
     * 更新配置
     */
    updateConfig(config: Partial<AutoSaveConfig>): void {
        this.config = { ...this.config, ...config };

        // 如果改变了间隔或启用了自动存档，重启定时器
        if (this.autoSaveTimer !== null) {
            this.stop();
            this.start();
        } else if (this.config.enabled && this.autoSaveTimer === null) {
            this.start();
        }
    }

    /**
     * 获取上次存档时间
     */
    getLastSaveTime(): number {
        return this.lastSaveTime;
    }

    /**
     * 获取距离下次自动存档的时间(毫秒)
     */
    getTimeToNextSave(): number {
        if (this.autoSaveTimer === null) return -1;

        const elapsed = Date.now() - this.lastSaveTime;
        const remaining = this.config.interval - elapsed;
        return Math.max(0, remaining);
    }

    /**
     * 序列化
     */
    serialize(): string {
        return JSON.stringify({
            lastSaveTime: this.lastSaveTime,
            config: this.config
        });
    }

    /**
     * 反序列化
     */
    deserialize(json: string): void {
        try {
            const data = JSON.parse(json);
            this.lastSaveTime = data.lastSaveTime || 0;
            if (data.config) {
                this.config = { ...this.config, ...data.config };
            }
        } catch (e) {
            console.error('[AutoSaveManager] 反序列化失败:', e);
        }
    }

    /**
     * 清理
     */
    cleanup(): void {
        this.stop();
        EventCenter.off(GameEvent.BATTLE_END, this.onBattleEnd, this);
        this.initialized = false;
        AutoSaveManager.instance = null;
    }
}

/** 自动存档管理器单例 */
export const autoSaveManager = AutoSaveManager.getInstance();