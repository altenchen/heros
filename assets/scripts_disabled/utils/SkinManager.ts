/**
 * 皮肤管理器
 * 管理皮肤的解锁、装备和数据持久化
 * 遵循阿里巴巴开发者手册规范
 */

import {
    SkinConfig,
    SkinType,
    SkinQuality,
    SkinState,
    SkinEventType,
    SkinEventData,
    PlayerSkinData,
    SkinUnlockType,
    DEFAULT_SKINS,
    createSkinConfigMap
} from '../config/SkinTypes';
import { EventCenter } from './EventTarget';
import { playerDataManager } from './PlayerDataManager';

/**
 * 皮肤管理器
 * 单例模式
 */
export class SkinManager {
    private static _instance: SkinManager | null = null;

    /** 所有皮肤配置 */
    private _skinConfigs: Map<string, SkinConfig> = new Map();

    /** 玩家拥有的皮肤 */
    private _ownedSkins: Map<string, PlayerSkinData> = new Map();

    /** 当前装备的皮肤（按目标ID索引） */
    private _equippedSkins: Map<string, string> = new Map();

    /** 存储键 */
    private readonly STORAGE_KEY = 'hmm_legacy_skins';

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): SkinManager {
        if (!SkinManager._instance) {
            SkinManager._instance = new SkinManager();
        }
        return SkinManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        // 加载皮肤配置
        this._loadSkinConfigs();

        // 加载玩家皮肤数据
        this._loadSkinData();

        // 检查限时皮肤是否过期
        this._checkExpiredSkins();

        console.log('[SkinManager] 初始化完成，共', this._skinConfigs.size, '个皮肤配置');
    }

    /**
     * 加载皮肤配置
     */
    private _loadSkinConfigs(): void {
        this._skinConfigs = createSkinConfigMap(DEFAULT_SKINS);
    }

    /**
     * 加载玩家皮肤数据
     */
    private _loadSkinData(): void {
        try {
            const json = localStorage.getItem(this.STORAGE_KEY);
            if (json) {
                const data = JSON.parse(json);

                // 加载拥有的皮肤
                if (data.ownedSkins) {
                    data.ownedSkins.forEach((skin: PlayerSkinData) => {
                        this._ownedSkins.set(skin.skinId, skin);
                    });
                }

                // 加载装备的皮肤
                if (data.equippedSkins) {
                    data.equippedSkins.forEach((item: { targetId: string; skinId: string }) => {
                        this._equippedSkins.set(item.targetId, item.skinId);
                    });
                }
            }

            // 为默认皮肤解锁
            this._unlockDefaultSkins();
        } catch (e) {
            console.error('[SkinManager] 加载皮肤数据失败', e);
        }
    }

    /**
     * 解锁默认皮肤
     */
    private _unlockDefaultSkins(): void {
        this._skinConfigs.forEach((config, skinId) => {
            if (config.isDefault && !this._ownedSkins.has(skinId)) {
                this._ownedSkins.set(skinId, {
                    skinId,
                    acquireTime: Date.now(),
                    isEquipped: true
                });
                this._equippedSkins.set(config.targetId, skinId);
            }
        });
    }

    /**
     * 检查过期的皮肤
     */
    private _checkExpiredSkins(): void {
        const now = Date.now();
        const expiredSkins: string[] = [];

        this._ownedSkins.forEach((skinData, skinId) => {
            if (skinData.expireTime && skinData.expireTime <= now) {
                expiredSkins.push(skinId);
            }
        });

        expiredSkins.forEach(skinId => {
            this._handleSkinExpired(skinId);
        });
    }

    /**
     * 处理皮肤过期
     */
    private _handleSkinExpired(skinId: string): void {
        const skinData = this._ownedSkins.get(skinId);
        const config = this._skinConfigs.get(skinId);

        if (!skinData || !config) return;

        // 如果当前装备了这个皮肤，切换回默认皮肤
        if (skinData.isEquipped) {
            const defaultSkin = this._getDefaultSkin(config.targetId);
            if (defaultSkin) {
                this._equippedSkins.set(config.targetId, defaultSkin.skinId);
            }
        }

        // 移除过期皮肤
        this._ownedSkins.delete(skinId);

        // 发送事件
        EventCenter.emit(SkinEventType.SKIN_EXPIRED, {
            skinId,
            type: config.type,
            targetId: config.targetId
        } as SkinEventData);

        console.log('[SkinManager] 皮肤已过期:', skinId);
    }

    /**
     * 获取目标的默认皮肤
     */
    private _getDefaultSkin(targetId: string): SkinConfig | null {
        for (const [, config] of this._skinConfigs) {
            if (config.targetId === targetId && config.isDefault) {
                return config;
            }
        }
        return null;
    }

    /**
     * 保存皮肤数据
     */
    private _saveSkinData(): void {
        try {
            const data = {
                ownedSkins: Array.from(this._ownedSkins.values()),
                equippedSkins: Array.from(this._equippedSkins.entries()).map(
                    ([targetId, skinId]) => ({ targetId, skinId })
                )
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        } catch (e) {
            console.error('[SkinManager] 保存皮肤数据失败', e);
        }
    }

    /**
     * 解锁皮肤
     * @param skinId 皮肤ID
     * @param expireTime 过期时间（可选，限时皮肤）
     * @returns 是否成功解锁
     */
    unlockSkin(skinId: string, expireTime?: number): boolean {
        const config = this._skinConfigs.get(skinId);
        if (!config) {
            console.warn('[SkinManager] 皮肤配置不存在:', skinId);
            return false;
        }

        // 检查是否已拥有
        if (this._ownedSkins.has(skinId)) {
            console.log('[SkinManager] 已拥有皮肤:', skinId);
            return true;
        }

        // 添加皮肤
        const skinData: PlayerSkinData = {
            skinId,
            acquireTime: Date.now(),
            isEquipped: false
        };

        if (expireTime) {
            skinData.expireTime = expireTime;
        }

        this._ownedSkins.set(skinId, skinData);
        this._saveSkinData();

        // 发送解锁事件
        EventCenter.emit(SkinEventType.SKIN_UNLOCKED, {
            skinId,
            type: config.type,
            targetId: config.targetId
        } as SkinEventData);

        console.log('[SkinManager] 解锁皮肤:', config.name);

        return true;
    }

    /**
     * 批量解锁皮肤
     */
    unlockSkins(skinIds: string[], expireTime?: number): { success: number; failed: number } {
        let success = 0;
        let failed = 0;

        for (const skinId of skinIds) {
            if (this.unlockSkin(skinId, expireTime)) {
                success++;
            } else {
                failed++;
            }
        }

        return { success, failed };
    }

    /**
     * 装备皮肤
     * @param skinId 皮肤ID
     * @returns 是否成功装备
     */
    equipSkin(skinId: string): boolean {
        const config = this._skinConfigs.get(skinId);
        const skinData = this._ownedSkins.get(skinId);

        if (!config) {
            console.warn('[SkinManager] 皮肤配置不存在:', skinId);
            return false;
        }

        if (!skinData) {
            console.warn('[SkinManager] 未拥有皮肤:', skinId);
            return false;
        }

        // 检查是否过期
        if (skinData.expireTime && skinData.expireTime <= Date.now()) {
            console.warn('[SkinManager] 皮肤已过期:', skinId);
            return false;
        }

        // 获取当前装备的皮肤
        const currentEquippedSkinId = this._equippedSkins.get(config.targetId);

        // 卸下当前装备的皮肤
        if (currentEquippedSkinId && currentEquippedSkinId !== skinId) {
            const currentSkinData = this._ownedSkins.get(currentEquippedSkinId);
            if (currentSkinData) {
                currentSkinData.isEquipped = false;
            }

            const oldConfig = this._skinConfigs.get(currentEquippedSkinId);
            if (oldConfig) {
                EventCenter.emit(SkinEventType.SKIN_UNEQUIPPED, {
                    skinId: currentEquippedSkinId,
                    type: oldConfig.type,
                    targetId: oldConfig.targetId
                } as SkinEventData);
            }
        }

        // 装备新皮肤
        skinData.isEquipped = true;
        this._equippedSkins.set(config.targetId, skinId);
        this._saveSkinData();

        // 发送装备事件
        EventCenter.emit(SkinEventType.SKIN_EQUIPPED, {
            skinId,
            type: config.type,
            targetId: config.targetId
        } as SkinEventData);

        console.log('[SkinManager] 装备皮肤:', config.name);

        return true;
    }

    /**
     * 卸下皮肤
     * @param targetId 目标ID
     * @returns 是否成功卸下
     */
    unequipSkin(targetId: string): boolean {
        const currentSkinId = this._equippedSkins.get(targetId);
        if (!currentSkinId) {
            return false;
        }

        const skinData = this._ownedSkins.get(currentSkinId);
        const config = this._skinConfigs.get(currentSkinId);

        if (skinData) {
            skinData.isEquipped = false;
        }

        // 切换到默认皮肤
        const defaultSkin = this._getDefaultSkin(targetId);
        if (defaultSkin) {
            this._equippedSkins.set(targetId, defaultSkin.skinId);
            const defaultSkinData = this._ownedSkins.get(defaultSkin.skinId);
            if (defaultSkinData) {
                defaultSkinData.isEquipped = true;
            }
        } else {
            this._equippedSkins.delete(targetId);
        }

        this._saveSkinData();

        if (config) {
            EventCenter.emit(SkinEventType.SKIN_UNEQUIPPED, {
                skinId: currentSkinId,
                type: config.type,
                targetId
            } as SkinEventData);
        }

        console.log('[SkinManager] 卸下皮肤:', targetId);

        return true;
    }

    /**
     * 检查是否拥有皮肤
     */
    hasSkin(skinId: string): boolean {
        return this._ownedSkins.has(skinId);
    }

    /**
     * 获取皮肤状态
     */
    getSkinState(skinId: string): SkinState {
        const config = this._skinConfigs.get(skinId);
        if (!config) {
            return SkinState.LOCKED;
        }

        const skinData = this._ownedSkins.get(skinId);
        if (!skinData) {
            return SkinState.LOCKED;
        }

        // 检查是否过期
        if (skinData.expireTime && skinData.expireTime <= Date.now()) {
            return SkinState.EXPIRED;
        }

        // 检查是否装备
        if (skinData.isEquipped) {
            return SkinState.EQUIPPED;
        }

        return SkinState.UNLOCKED;
    }

    /**
     * 获取皮肤配置
     */
    getSkinConfig(skinId: string): SkinConfig | null {
        return this._skinConfigs.get(skinId) || null;
    }

    /**
     * 获取目标当前装备的皮肤
     */
    getEquippedSkin(targetId: string): SkinConfig | null {
        const skinId = this._equippedSkins.get(targetId);
        if (!skinId) {
            return this._getDefaultSkin(targetId);
        }
        return this._skinConfigs.get(skinId) || null;
    }

    /**
     * 获取目标当前装备的皮肤ID
     */
    getEquippedSkinId(targetId: string): string | null {
        return this._equippedSkins.get(targetId) || null;
    }

    /**
     * 获取目标可用的皮肤列表
     */
    getAvailableSkins(targetId: string): SkinConfig[] {
        const skins: SkinConfig[] = [];

        this._skinConfigs.forEach(config => {
            if (config.targetId === targetId) {
                skins.push(config);
            }
        });

        // 按排序权重排序
        skins.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

        return skins;
    }

    /**
     * 获取玩家拥有的所有皮肤
     */
    getOwnedSkins(type?: SkinType): SkinConfig[] {
        const skins: SkinConfig[] = [];

        this._ownedSkins.forEach((skinData, skinId) => {
            const config = this._skinConfigs.get(skinId);
            if (config) {
                if (!type || config.type === type) {
                    skins.push(config);
                }
            }
        });

        return skins;
    }

    /**
     * 获取所有皮肤配置
     */
    getAllSkinConfigs(): SkinConfig[] {
        return Array.from(this._skinConfigs.values());
    }

    /**
     * 检查解锁条件
     */
    checkUnlockCondition(skinId: string): boolean {
        const config = this._skinConfigs.get(skinId);
        if (!config || !config.unlockCondition) {
            return true;
        }

        const condition = config.unlockCondition;
        const playerData = playerDataManager.getPlayerData();

        switch (condition.type) {
            case SkinUnlockType.DEFAULT:
                return true;

            case SkinUnlockType.VIP:
                // TODO: 实现 VIP 等级检查
                return false;

            case SkinUnlockType.PLAYER_LEVEL:
                return playerData ? playerData.level >= (condition.playerLevel || 0) : false;

            case SkinUnlockType.HERO_MASTERY:
                // TODO: 实现英雄熟练度检查
                return false;

            case SkinUnlockType.ACHIEVEMENT:
                // TODO: 实现成就检查
                return false;

            default:
                // 购买、活动、赛季类型需要外部解锁
                return false;
        }
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            ownedSkins: Array.from(this._ownedSkins.values()),
            equippedSkins: Array.from(this._equippedSkins.entries()).map(
                ([targetId, skinId]) => ({ targetId, skinId })
            )
        };
        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);

            this._ownedSkins.clear();
            this._equippedSkins.clear();

            if (parsed.ownedSkins) {
                parsed.ownedSkins.forEach((skin: PlayerSkinData) => {
                    this._ownedSkins.set(skin.skinId, skin);
                });
            }

            if (parsed.equippedSkins) {
                parsed.equippedSkins.forEach((item: { targetId: string; skinId: string }) => {
                    this._equippedSkins.set(item.targetId, item.skinId);
                });
            }

            console.log('[SkinManager] 数据加载完成');
        } catch (e) {
            console.error('[SkinManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._ownedSkins.clear();
        this._equippedSkins.clear();
        this._unlockDefaultSkins();
        this._saveSkinData();
    }
}

/** 皮肤管理器单例 */
export const skinManager = SkinManager.getInstance();