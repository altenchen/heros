/**
 * 宝物管理器
 * 管理宝物获取、装备、卸下、出售等功能
 */

import { EventCenter } from '../utils/EventTarget';
import {
    ArtifactConfig,
    ArtifactData,
    ArtifactSlot,
    ArtifactRarity,
    ArtifactType,
    ArtifactStatType,
    ArtifactStat,
    ArtifactEventType,
    ArtifactSource,
    ArtifactFilter,
    ArtifactSortType,
    EquipResult,
    HeroEquipment
} from '../config/ArtifactTypes';
import { ARTIFACT_CONFIGS, getArtifactConfig } from '../config/artifact.json';

/** 宝物管理器实例 */
let artifactManagerInstance: ArtifactManager | null = null;

export class ArtifactManager {
    /** 背包中的宝物 */
    private artifacts: Map<string, ArtifactData> = new Map();

    /** 英雄装备 */
    private heroEquipments: Map<string, HeroEquipment> = new Map();

    /** 实例ID计数器 */
    private instanceIdCounter: number = 0;

    /** 是否已初始化 */
    private initialized: boolean = false;

    private constructor() {}

    /** 获取单例实例 */
    static getInstance(): ArtifactManager {
        if (!artifactManagerInstance) {
            artifactManagerInstance = new ArtifactManager();
        }
        return artifactManagerInstance;
    }

    /** 初始化 */
    init(): void {
        if (this.initialized) return;

        console.log('[ArtifactManager] 初始化宝物管理器');
        this.initialized = true;
    }

    /** 生成实例ID */
    private generateInstanceId(): string {
        return `artifact_${Date.now()}_${++this.instanceIdCounter}`;
    }

    // ==================== 宝物获取 ====================

    /**
     * 添加宝物到背包
     * @param artifactId 宝物ID
     * @param count 数量
     * @param source 来源
     * @returns 宝物实例数据
     */
    addArtifact(artifactId: string, count: number = 1, source: ArtifactSource = ArtifactSource.OTHER): ArtifactData | null {
        const config = getArtifactConfig(artifactId);
        if (!config) {
            console.warn(`[ArtifactManager] 宝物配置不存在: ${artifactId}`);
            return null;
        }

        // 检查是否可堆叠
        if (config.stackable) {
            // 查找已存在的同类型宝物
            for (const [instanceId, data] of this.artifacts) {
                if (data.artifactId === artifactId) {
                    const maxStack = config.maxStack || 99;
                    const newCount = Math.min(data.count + count, maxStack);
                    data.count = newCount;
                    this.artifacts.set(instanceId, data);

                    EventCenter.emit(ArtifactEventType.ARTIFACT_OBTAINED, {
                        instanceId,
                        artifactId,
                        count: newCount - data.count,
                        source
                    });

                    return data;
                }
            }
        }

        // 创建新实例
        const instanceId = this.generateInstanceId();
        const artifactData: ArtifactData = {
            instanceId,
            artifactId,
            count,
            obtainedTime: Date.now()
        };

        this.artifacts.set(instanceId, artifactData);

        EventCenter.emit(ArtifactEventType.ARTIFACT_OBTAINED, {
            instanceId,
            artifactId,
            count,
            source
        });

        console.log(`[ArtifactManager] 获得宝物: ${config.name} x${count}`);
        return artifactData;
    }

    /**
     * 移除宝物
     * @param instanceId 实例ID
     * @param count 数量
     * @returns 是否成功
     */
    removeArtifact(instanceId: string, count: number = 1): boolean {
        const artifact = this.artifacts.get(instanceId);
        if (!artifact) {
            console.warn(`[ArtifactManager] 宝物实例不存在: ${instanceId}`);
            return false;
        }

        if (artifact.count <= count) {
            this.artifacts.delete(instanceId);
        } else {
            artifact.count -= count;
            this.artifacts.set(instanceId, artifact);
        }

        return true;
    }

    // ==================== 装备管理 ====================

    /**
     * 初始化英雄装备槽
     * @param heroId 英雄ID
     */
    initHeroEquipment(heroId: string): void {
        if (this.heroEquipments.has(heroId)) return;

        const equipment: HeroEquipment = {
            heroId,
            slots: new Map(),
            statsCache: new Map()
        };

        // 初始化所有槽位
        const allSlots = this.getAllSlots();
        for (const slot of allSlots) {
            equipment.slots.set(slot, null);
        }

        this.heroEquipments.set(heroId, equipment);
    }

    /**
     * 装备宝物
     * @param heroId 英雄ID
     * @param instanceId 宝物实例ID
     * @returns 装备结果
     */
    equipArtifact(heroId: string, instanceId: string): EquipResult {
        // 确保英雄装备槽已初始化
        this.initHeroEquipment(heroId);

        const artifact = this.artifacts.get(instanceId);
        if (!artifact) {
            return { success: false, error: '宝物不存在' };
        }

        const config = getArtifactConfig(artifact.artifactId);
        if (!config) {
            return { success: false, error: '宝物配置不存在' };
        }

        const equipment = this.heroEquipments.get(heroId)!;
        let slot = config.slot;

        // 检查槽位是否已有装备
        const currentEquip = equipment.slots.get(slot);
        if (currentEquip) {
            // 卸下当前装备
            this.unequipArtifactInternal(heroId, slot);
        }

        // 检查是否为戒指（有两个槽位）
        if (config.type === ArtifactType.RING) {
            // 优先使用空槽位
            if (equipment.slots.get(ArtifactSlot.RING_1)) {
                // 槽位1已有装备，尝试槽位2
                if (equipment.slots.get(ArtifactSlot.RING_2)) {
                    // 两个槽位都有装备，卸下槽位1
                    this.unequipArtifactInternal(heroId, ArtifactSlot.RING_1);
                    slot = ArtifactSlot.RING_1;
                } else {
                    slot = ArtifactSlot.RING_2;
                }
            }
        }

        // 检查是否为杂项（有两个槽位）
        if (config.type === ArtifactType.MISC) {
            if (equipment.slots.get(ArtifactSlot.MISC_1)) {
                if (equipment.slots.get(ArtifactSlot.MISC_2)) {
                    this.unequipArtifactInternal(heroId, ArtifactSlot.MISC_1);
                    slot = ArtifactSlot.MISC_1;
                } else {
                    slot = ArtifactSlot.MISC_2;
                }
            }
        }

        // 装备宝物
        equipment.slots.set(slot, artifact);
        this.artifacts.delete(instanceId);

        // 更新属性缓存
        this.updateStatsCache(heroId);

        EventCenter.emit(ArtifactEventType.ARTIFACT_EQUIPPED, {
            heroId,
            instanceId,
            artifactId: artifact.artifactId,
            slot
        });

        console.log(`[ArtifactManager] 英雄 ${heroId} 装备了 ${config.name}`);

        return {
            success: true,
            unequippedArtifact: currentEquip || undefined
        };
    }

    /**
     * 卸下宝物
     * @param heroId 英雄ID
     * @param slot 槽位
     * @returns 是否成功
     */
    unequipArtifact(heroId: string, slot: ArtifactSlot): boolean {
        const result = this.unequipArtifactInternal(heroId, slot);

        if (result) {
            EventCenter.emit(ArtifactEventType.ARTIFACT_UNEQUIPPED, {
                heroId,
                slot
            });
        }

        return result;
    }

    /**
     * 内部卸下宝物方法
     */
    private unequipArtifactInternal(heroId: string, slot: ArtifactSlot): boolean {
        const equipment = this.heroEquipments.get(heroId);
        if (!equipment) {
            console.warn(`[ArtifactManager] 英雄装备数据不存在: ${heroId}`);
            return false;
        }

        const artifact = equipment.slots.get(slot);
        if (!artifact) {
            return false;
        }

        // 放回背包
        artifact.instanceId = this.generateInstanceId();
        this.artifacts.set(artifact.instanceId, artifact);

        // 清空槽位
        equipment.slots.set(slot, null);

        // 更新属性缓存
        this.updateStatsCache(heroId);

        return true;
    }

    /**
     * 一键卸下所有装备
     * @param heroId 英雄ID
     */
    unequipAll(heroId: string): void {
        const equipment = this.heroEquipments.get(heroId);
        if (!equipment) return;

        for (const slot of equipment.slots.keys()) {
            if (equipment.slots.get(slot)) {
                this.unequipArtifactInternal(heroId, slot);
            }
        }
    }

    // ==================== 属性计算 ====================

    /**
     * 更新英雄属性缓存
     */
    private updateStatsCache(heroId: string): void {
        const equipment = this.heroEquipments.get(heroId);
        if (!equipment) return;

        const statsCache = new Map<ArtifactStatType, number>();

        for (const artifact of equipment.slots.values()) {
            if (!artifact) continue;

            const config = getArtifactConfig(artifact.artifactId);
            if (!config) continue;

            // 添加基础属性
            for (const stat of config.stats) {
                const currentValue = statsCache.get(stat.type) || 0;
                statsCache.set(stat.type, currentValue + stat.value);
            }

            // 添加强化属性
            if (artifact.enhanceLevel && artifact.enhanceLevel > 0) {
                const enhanceBonus = artifact.enhanceLevel * 0.1; // 每级+10%
                for (const stat of config.stats) {
                    const currentValue = statsCache.get(stat.type) || 0;
                    statsCache.set(stat.type, currentValue + Math.floor(stat.value * enhanceBonus));
                }
            }

            // 添加额外属性
            if (artifact.extraStats) {
                for (const stat of artifact.extraStats) {
                    const currentValue = statsCache.get(stat.type) || 0;
                    statsCache.set(stat.type, currentValue + stat.value);
                }
            }
        }

        equipment.statsCache = statsCache;

        EventCenter.emit(ArtifactEventType.EQUIPMENT_STATS_CHANGED, {
            heroId,
            stats: Object.fromEntries(statsCache)
        });
    }

    /**
     * 获取英雄装备属性
     * @param heroId 英雄ID
     * @param statType 属性类型
     * @returns 属性值
     */
    getHeroStat(heroId: string, statType: ArtifactStatType): number {
        const equipment = this.heroEquipments.get(heroId);
        if (!equipment) return 0;

        return equipment.statsCache.get(statType) || 0;
    }

    /**
     * 获取英雄所有装备属性
     * @param heroId 英雄ID
     * @returns 属性映射
     */
    getHeroAllStats(heroId: string): Map<ArtifactStatType, number> {
        const equipment = this.heroEquipments.get(heroId);
        if (!equipment) return new Map();

        return new Map(equipment.statsCache);
    }

    // ==================== 宝物查询 ====================

    /**
     * 获取背包中所有宝物
     * @param filter 筛选条件
     * @returns 宝物列表
     */
    getArtifacts(filter?: ArtifactFilter): ArtifactData[] {
        let result = Array.from(this.artifacts.values());

        if (filter) {
            if (filter.type) {
                result = result.filter(a => {
                    const config = getArtifactConfig(a.artifactId);
                    return config?.type === filter.type;
                });
            }

            if (filter.rarity) {
                result = result.filter(a => {
                    const config = getArtifactConfig(a.artifactId);
                    return config?.rarity === filter.rarity;
                });
            }

            if (filter.slot) {
                result = result.filter(a => {
                    const config = getArtifactConfig(a.artifactId);
                    return config?.slot === filter.slot;
                });
            }

            if (filter.minLevel !== undefined) {
                result = result.filter(a => {
                    const config = getArtifactConfig(a.artifactId);
                    return (config?.requiredLevel || 0) >= filter.minLevel!;
                });
            }

            if (filter.maxLevel !== undefined) {
                result = result.filter(a => {
                    const config = getArtifactConfig(a.artifactId);
                    return (config?.requiredLevel || 0) <= filter.maxLevel!;
                });
            }
        }

        return result;
    }

    /**
     * 获取宝物详情
     * @param instanceId 实例ID
     * @returns 宝物数据和配置
     */
    getArtifactDetail(instanceId: string): { data: ArtifactData; config: ArtifactConfig } | null {
        const data = this.artifacts.get(instanceId);
        if (!data) return null;

        const config = getArtifactConfig(data.artifactId);
        if (!config) return null;

        return { data, config };
    }

    /**
     * 获取英雄装备
     * @param heroId 英雄ID
     * @returns 装备数据
     */
    getHeroEquipment(heroId: string): HeroEquipment | undefined {
        return this.heroEquipments.get(heroId);
    }

    /**
     * 获取英雄指定槽位的装备
     * @param heroId 英雄ID
     * @param slot 槽位
     * @returns 装备数据
     */
    getSlotArtifact(heroId: string, slot: ArtifactSlot): ArtifactData | null {
        const equipment = this.heroEquipments.get(heroId);
        if (!equipment) return null;

        return equipment.slots.get(slot) || null;
    }

    /**
     * 获取所有槽位
     */
    private getAllSlots(): ArtifactSlot[] {
        return [
            ArtifactSlot.MAIN_HAND,
            ArtifactSlot.OFF_HAND,
            ArtifactSlot.HELMET,
            ArtifactSlot.ARMOR,
            ArtifactSlot.CLOAK,
            ArtifactSlot.BOOTS,
            ArtifactSlot.NECKLACE,
            ArtifactSlot.RING_1,
            ArtifactSlot.RING_2,
            ArtifactSlot.AMMO_BAG,
            ArtifactSlot.MISC_1,
            ArtifactSlot.MISC_2,
            ArtifactSlot.WAR_MACHINE_BALLISTA,
            ArtifactSlot.WAR_MACHINE_AMMO_CART,
            ArtifactSlot.WAR_MACHINE_FIRST_AID_TENT,
            ArtifactSlot.COMMANDER
        ];
    }

    // ==================== 宝物出售 ====================

    /**
     * 出售宝物
     * @param instanceId 实例ID
     * @returns 出售价格
     */
    sellArtifact(instanceId: string): number {
        const artifact = this.artifacts.get(instanceId);
        if (!artifact) {
            console.warn(`[ArtifactManager] 宝物实例不存在: ${instanceId}`);
            return 0;
        }

        const config = getArtifactConfig(artifact.artifactId);
        if (!config) return 0;

        const totalPrice = config.sellPrice * artifact.count;
        this.artifacts.delete(instanceId);

        EventCenter.emit(ArtifactEventType.ARTIFACT_SOLD, {
            instanceId,
            artifactId: artifact.artifactId,
            count: artifact.count,
            gold: totalPrice
        });

        console.log(`[ArtifactManager] 出售宝物: ${config.name} x${artifact.count}, 获得 ${totalPrice} 金币`);

        return totalPrice;
    }

    // ==================== 宝物强化 ====================

    /**
     * 强化宝物
     * @param instanceId 实例ID
     * @param cost 消耗资源
     * @returns 是否成功
     */
    enhanceArtifact(instanceId: string, cost: { gold: number; gems: number }): boolean {
        const artifact = this.artifacts.get(instanceId);
        if (!artifact) {
            console.warn(`[ArtifactManager] 宝物实例不存在: ${instanceId}`);
            return false;
        }

        const config = getArtifactConfig(artifact.artifactId);
        if (!config) return false;

        // 限制强化等级
        const maxEnhanceLevel = config.rarity === ArtifactRarity.ARTIFACT ? 10 :
                               config.rarity === ArtifactRarity.RELIC ? 8 :
                               config.rarity === ArtifactRarity.MAJOR ? 6 :
                               config.rarity === ArtifactRarity.MINOR ? 4 : 2;

        if ((artifact.enhanceLevel || 0) >= maxEnhanceLevel) {
            console.warn(`[ArtifactManager] 宝物已达到最大强化等级: ${maxEnhanceLevel}`);
            return false;
        }

        artifact.enhanceLevel = (artifact.enhanceLevel || 0) + 1;

        EventCenter.emit(ArtifactEventType.ARTIFACT_ENHANCED, {
            instanceId,
            artifactId: artifact.artifactId,
            level: artifact.enhanceLevel
        });

        console.log(`[ArtifactManager] 宝物强化成功: ${config.name} +${artifact.enhanceLevel}`);

        return true;
    }

    // ==================== 组合宝物 ====================

    /**
     * 检查是否可以合成组合宝物
     * @param combinedArtifactId 组合宝物ID
     * @returns 是否可以合成
     */
    canCombineArtifact(combinedArtifactId: string): boolean {
        const config = getArtifactConfig(combinedArtifactId);
        if (!config || !config.componentIds) return false;

        // 检查所有组件
        for (const componentId of config.componentIds) {
            let found = false;
            for (const artifact of this.artifacts.values()) {
                if (artifact.artifactId === componentId) {
                    found = true;
                    break;
                }
            }
            if (!found) return false;
        }

        return true;
    }

    /**
     * 合成组合宝物
     * @param combinedArtifactId 组合宝物ID
     * @returns 合成结果
     */
    combineArtifact(combinedArtifactId: string): ArtifactData | null {
        const config = getArtifactConfig(combinedArtifactId);
        if (!config || !config.componentIds) {
            console.warn(`[ArtifactManager] 组合宝物配置不存在: ${combinedArtifactId}`);
            return null;
        }

        if (!this.canCombineArtifact(combinedArtifactId)) {
            console.warn(`[ArtifactManager] 缺少组合组件`);
            return null;
        }

        // 移除组件
        for (const componentId of config.componentIds) {
            for (const [instanceId, artifact] of this.artifacts) {
                if (artifact.artifactId === componentId) {
                    this.artifacts.delete(instanceId);
                    break;
                }
            }
        }

        // 添加组合宝物
        const result = this.addArtifact(combinedArtifactId, 1, ArtifactSource.CRAFTING);

        if (result) {
            EventCenter.emit(ArtifactEventType.ARTIFACT_COMBINED, {
                artifactId: combinedArtifactId,
                components: config.componentIds
            });

            console.log(`[ArtifactManager] 合成组合宝物: ${config.name}`);
        }

        return result;
    }

    // ==================== 存档相关 ====================

    /**
     * 获取存档数据
     */
    getSaveData(): { artifacts: ArtifactData[]; heroEquipments: any[] } {
        const artifacts = Array.from(this.artifacts.values());

        const heroEquipments = Array.from(this.heroEquipments.entries()).map(([heroId, equipment]) => ({
            heroId,
            slots: Object.fromEntries(
                Array.from(equipment.slots.entries()).map(([slot, artifact]) => [
                    slot,
                    artifact
                ])
            )
        }));

        return { artifacts, heroEquipments };
    }

    /**
     * 加载存档数据
     */
    loadSaveData(data: { artifacts: ArtifactData[]; heroEquipments: any[] }): void {
        this.artifacts.clear();
        this.heroEquipments.clear();

        for (const artifact of data.artifacts) {
            this.artifacts.set(artifact.instanceId, artifact);
        }

        for (const equipmentData of data.heroEquipments) {
            const equipment: HeroEquipment = {
                heroId: equipmentData.heroId,
                slots: new Map(),
                statsCache: new Map()
            };

            for (const [slot, artifact] of Object.entries(equipmentData.slots)) {
                equipment.slots.set(slot as ArtifactSlot, artifact as ArtifactData | null);
            }

            this.heroEquipments.set(equipmentData.heroId, equipment);
            this.updateStatsCache(equipmentData.heroId);
        }

        console.log(`[ArtifactManager] 加载存档数据完成, 宝物: ${this.artifacts.size}, 英雄装备: ${this.heroEquipments.size}`);
    }
}

/** 导出单例实例 */
export const artifactManager = ArtifactManager.getInstance();