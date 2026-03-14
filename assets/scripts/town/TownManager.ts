/**
 * 主城系统
 * 管理建筑建造、兵种招募、资源生产
 */

import {
    BuildingConfig,
    BuildingInstance,
    TownData,
    ArmySlot,
    Race,
    ResourceType,
    UnitConfig
} from '../config/GameTypes';
import { UnitConfigs, UnitConfigMap, UnitsByRace } from '../../configs/units.json';

/**
 * 建筑配置数据
 */
export const BuildingConfigs: BuildingConfig[] = [
    // 圣堂建筑
    {
        id: 'castle_hall_1',
        name: '城镇大厅',
        race: Race.CASTLE,
        type: 'production',
        level: 1,
        cost: { [ResourceType.GOLD]: 500, [ResourceType.WOOD]: 5 },
        buildTime: 1,
        requirements: [],
        production: { resource: ResourceType.GOLD, amount: 500 }
    },
    {
        id: 'castle_dwelling_1',
        name: '枪兵营',
        race: Race.CASTLE,
        type: 'dwelling',
        level: 1,
        cost: { [ResourceType.GOLD]: 200, [ResourceType.WOOD]: 5 },
        buildTime: 1,
        requirements: [],
        unitProduction: { unitId: 'castle_tier1_pikeman', amount: 14 }
    },
    {
        id: 'castle_dwelling_2',
        name: '箭术靶场',
        race: Race.CASTLE,
        type: 'dwelling',
        level: 2,
        cost: { [ResourceType.GOLD]: 500, [ResourceType.WOOD]: 5 },
        buildTime: 2,
        requirements: ['castle_dwelling_1'],
        unitProduction: { unitId: 'castle_tier2_archer', amount: 9 }
    },
    {
        id: 'castle_dwelling_3',
        name: '狮鹫塔',
        race: Race.CASTLE,
        type: 'dwelling',
        level: 3,
        cost: { [ResourceType.GOLD]: 1000, [ResourceType.WOOD]: 5, [ResourceType.ORE]: 5 },
        buildTime: 3,
        requirements: ['castle_dwelling_2'],
        unitProduction: { unitId: 'castle_tier3_griffin', amount: 7 }
    },
    {
        id: 'castle_dwelling_4',
        name: '剑士殿堂',
        race: Race.CASTLE,
        type: 'dwelling',
        level: 4,
        cost: { [ResourceType.GOLD]: 2000, [ResourceType.ORE]: 10 },
        buildTime: 4,
        requirements: ['castle_dwelling_3'],
        unitProduction: { unitId: 'castle_tier4_swordsman', amount: 4 }
    },
    {
        id: 'castle_dwelling_5',
        name: '僧侣修道院',
        race: Race.CASTLE,
        type: 'dwelling',
        level: 5,
        cost: { [ResourceType.GOLD]: 3000, [ResourceType.WOOD]: 5, [ResourceType.ORE]: 5 },
        buildTime: 5,
        requirements: ['castle_dwelling_4'],
        unitProduction: { unitId: 'castle_tier5_monk', amount: 3 }
    },
    {
        id: 'castle_dwelling_6',
        name: '天使祭坛',
        race: Race.CASTLE,
        type: 'dwelling',
        level: 6,
        cost: { [ResourceType.GOLD]: 10000, [ResourceType.GEM]: 20 },
        buildTime: 7,
        requirements: ['castle_dwelling_5'],
        unitProduction: { unitId: 'castle_tier6_angel', amount: 1 }
    },

    // 墓园建筑
    {
        id: 'necropolis_hall_1',
        name: '城镇大厅',
        race: Race.NECROPOLIS,
        type: 'production',
        level: 1,
        cost: { [ResourceType.GOLD]: 500, [ResourceType.WOOD]: 5 },
        buildTime: 1,
        requirements: [],
        production: { resource: ResourceType.GOLD, amount: 500 }
    },
    {
        id: 'necropolis_dwelling_1',
        name: '骷髅冢',
        race: Race.NECROPOLIS,
        type: 'dwelling',
        level: 1,
        cost: { [ResourceType.GOLD]: 200, [ResourceType.ORE]: 5 },
        buildTime: 1,
        requirements: [],
        unitProduction: { unitId: 'necropolis_tier1_skeleton', amount: 20 }
    },
    {
        id: 'necropolis_dwelling_4',
        name: '陵墓',
        race: Race.NECROPOLIS,
        type: 'dwelling',
        level: 4,
        cost: { [ResourceType.GOLD]: 2000, [ResourceType.ORE]: 10 },
        buildTime: 4,
        requirements: ['necropolis_dwelling_1'],
        unitProduction: { unitId: 'necropolis_tier4_vampire', amount: 4 }
    },
    {
        id: 'necropolis_dwelling_6',
        name: '龙墓',
        race: Race.NECROPOLIS,
        type: 'dwelling',
        level: 6,
        cost: { [ResourceType.GOLD]: 8000, [ResourceType.MERCURY]: 10 },
        buildTime: 7,
        requirements: ['necropolis_dwelling_4'],
        unitProduction: { unitId: 'necropolis_tier6_ghost_dragon', amount: 1 }
    }
];

export const BuildingConfigMap: Map<string, BuildingConfig> = new Map(
    BuildingConfigs.map(config => [config.id, config])
);

/**
 * 主城类
 */
export class Town {
    data: TownData;

    constructor(race: Race) {
        this.data = this.createInitialTown(race);
    }

    /**
     * 创建初始主城数据
     */
    private createInitialTown(race: Race): TownData {
        return {
            race,
            level: 1,
            buildings: [],
            garrison: []
        };
    }

    /**
     * 获取建筑
     */
    getBuilding(configId: string): BuildingInstance | undefined {
        return this.data.buildings.find(b => b.configId === configId);
    }

    /**
     * 检查建筑是否已建造
     */
    hasBuilding(configId: string): boolean {
        return this.data.buildings.some(b => b.configId === configId && b.buildingTime === 0);
    }

    /**
     * 检查是否可以建造
     */
    canBuild(configId: string, resources: Partial<Record<ResourceType, number>>): { canBuild: boolean; reason?: string } {
        const config = BuildingConfigMap.get(configId);
        if (!config) {
            return { canBuild: false, reason: '建筑配置不存在' };
        }

        // 检查种族
        if (config.race !== this.data.race) {
            return { canBuild: false, reason: '种族不匹配' };
        }

        // 检查是否已建造
        if (this.hasBuilding(configId)) {
            return { canBuild: false, reason: '建筑已存在' };
        }

        // 检查前置建筑
        for (const reqId of config.requirements) {
            if (!this.hasBuilding(reqId)) {
                return { canBuild: false, reason: '缺少前置建筑' };
            }
        }

        // 检查资源
        for (const [resource, amount] of Object.entries(config.cost)) {
            const available = resources[resource as ResourceType] || 0;
            if (available < amount) {
                return { canBuild: false, reason: '资源不足' };
            }
        }

        return { canBuild: true };
    }

    /**
     * 开始建造
     */
    startBuilding(configId: string, resources: Partial<Record<ResourceType, number>>): { success: boolean; cost: Partial<Record<ResourceType, number>> } {
        const checkResult = this.canBuild(configId, resources);
        if (!checkResult.canBuild) {
            return { success: false, cost: {} };
        }

        const config = BuildingConfigMap.get(configId)!;

        // 添加建造中的建筑
        this.data.buildings.push({
            configId,
            level: config.level,
            buildingTime: config.buildTime
        });

        return { success: true, cost: config.cost };
    }

    /**
     * 更新建筑进度
     */
    updateBuildings(): void {
        for (const building of this.data.buildings) {
            if (building.buildingTime > 0) {
                building.buildingTime--;
            }
        }
    }

    /**
     * 获取可招募的兵种
     */
    getRecruitableUnits(): { config: UnitConfig; available: number }[] {
        const units: { config: UnitConfig; available: number }[] = [];

        for (const building of this.data.buildings) {
            if (building.buildingTime > 0) continue;

            const config = BuildingConfigMap.get(building.configId);
            if (!config || !config.unitProduction) continue;

            const unitConfig = UnitConfigMap.get(config.unitProduction.unitId);
            if (!unitConfig) continue;

            units.push({
                config: unitConfig,
                available: config.unitProduction.amount
            });
        }

        return units;
    }

    /**
     * 招募单位
     */
    recruitUnit(unitId: string, count: number, resources: Partial<Record<ResourceType, number>>): { success: boolean; armySlot?: ArmySlot; cost: Partial<Record<ResourceType, number>> } {
        const recruitable = this.getRecruitableUnits().find(u => u.config.id === unitId);
        if (!recruitable) {
            return { success: false, cost: {} };
        }

        const actualCount = Math.min(count, recruitable.available);
        const unitConfig = recruitable.config;

        // 计算费用
        const cost: Partial<Record<ResourceType, number>> = {};
        for (const [resource, amount] of Object.entries(unitConfig.cost)) {
            cost[resource as ResourceType] = amount * actualCount;
        }

        // 检查资源是否足够
        for (const [resource, amount] of Object.entries(cost)) {
            const available = resources[resource as ResourceType] || 0;
            if (available < amount) {
                return { success: false, cost: {} };
            }
        }

        // 创建军队槽位
        const armySlot: ArmySlot = {
            unitId: `unit_${Date.now()}`,
            configId: unitId,
            count: actualCount,
            currentHp: unitConfig.hp * actualCount,
            maxHp: unitConfig.hp,
            position: { q: 0, r: 0 }
        };

        return { success: true, armySlot, cost };
    }

    /**
     * 获取每回合资源产出
     */
    getResourceProduction(): Partial<Record<ResourceType, number>> {
        const production: Partial<Record<ResourceType, number>> = {};

        for (const building of this.data.buildings) {
            if (building.buildingTime > 0) continue;

            const config = BuildingConfigMap.get(building.configId);
            if (!config || !config.production) continue;

            const resource = config.production.resource;
            production[resource] = (production[resource] || 0) + config.production.amount;
        }

        return production;
    }

    /**
     * 序列化
     */
    toJSON(): TownData {
        return { ...this.data };
    }

    /**
     * 从数据创建
     */
    static fromData(data: TownData): Town {
        const town = new Town(data.race);
        town.data = { ...data };
        return town;
    }
}

/**
 * 主城管理器
 */
export class TownManager {
    private towns: Map<string, Town> = new Map();

    /**
     * 创建主城
     */
    createTown(id: string, race: Race): Town {
        const town = new Town(race);
        this.towns.set(id, town);
        return town;
    }

    /**
     * 获取主城
     */
    getTown(id: string): Town | undefined {
        return this.towns.get(id);
    }

    /**
     * 删除主城
     */
    deleteTown(id: string): boolean {
        return this.towns.delete(id);
    }

    /**
     * 更新所有主城
     */
    updateAllTowns(): void {
        for (const town of this.towns.values()) {
            town.updateBuildings();
        }
    }

    /**
     * 序列化
     */
    serialize(): Record<string, TownData> {
        const result: Record<string, TownData> = {};
        for (const [id, town] of this.towns) {
            result[id] = town.toJSON();
        }
        return result;
    }

    /**
     * 反序列化
     */
    deserialize(data: Record<string, TownData>): void {
        this.towns.clear();
        for (const [id, townData] of Object.entries(data)) {
            this.towns.set(id, Town.fromData(townData));
        }
    }
}

/** 主城管理器单例 */
export const townManager = new TownManager();