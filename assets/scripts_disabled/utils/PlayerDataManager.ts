/**
 * 玩家数据管理器
 * 管理玩家的所有游戏数据
 */

import {
    PlayerData,
    Faction,
    Race,
    ResourceType,
    HeroData,
    TownData,
    OfflineRewards,
    ArmySlot
} from '../config/GameTypes';
import { Hero, HeroManager } from '../hero/HeroManager';
import { Town, TownManager } from '../town/TownManager';

/**
 * 初始资源
 */
const INITIAL_RESOURCES: Partial<Record<ResourceType, number>> = {
    [ResourceType.GOLD]: 10000,
    [ResourceType.WOOD]: 20,
    [ResourceType.ORE]: 20,
    [ResourceType.CRYSTAL]: 5,
    [ResourceType.GEM]: 5,
    [ResourceType.SULFUR]: 5,
    [ResourceType.MERCURY]: 5
};

/**
 * 离线奖励计算参数
 */
const OFFLINE_REWARD_RATE = {
    GOLD_PER_HOUR: 1000,
    RESOURCE_PER_HOUR: 2
};

/**
 * 玩家数据管理器
 */
export class PlayerDataManager {
    private playerData: PlayerData | null = null;
    private heroManager: HeroManager = new HeroManager();
    private townManager: TownManager = new TownManager();

    /**
     * 创建新玩家
     */
    createNewPlayer(id: string, name: string, faction: Faction): PlayerData {
        // 根据阵营选择初始种族
        const initialRace = faction === Faction.LIGHT ? Race.CASTLE : Race.NECROPOLIS;

        // 创建初始英雄
        const initialHeroConfigId = faction === Faction.LIGHT ? 'hero_catherine' : 'hero_sandro';
        const hero = this.heroManager.createHero(initialHeroConfigId);

        // 创建初始主城
        const town = this.townManager.createTown('main', initialRace);
        // 建造初始兵营
        const dwellingId = faction === Faction.LIGHT ? 'castle_dwelling_1' : 'necropolis_dwelling_1';
        town.startBuilding(dwellingId, {});

        this.playerData = {
            id,
            name,
            faction,
            level: 1,
            experience: 0,
            resources: { ...INITIAL_RESOURCES },
            heroes: [hero.toJSON()],
            mainTown: town.toJSON(),
            unlockedUnits: [],
            unlockedHeroes: [initialHeroConfigId],
            achievements: [],
            lastLoginTime: Date.now(),
            offlineRewards: {
                gold: 0,
                resources: {},
                calculateTime: 0
            }
        };

        return this.playerData;
    }

    /**
     * 加载玩家数据
     */
    loadPlayerData(data: PlayerData): void {
        this.playerData = data;

        // 恢复英雄数据
        this.heroManager.deserialize(data.heroes);

        // 恢复主城数据
        this.townManager.deserialize({ main: data.mainTown });

        // 计算离线奖励
        this.calculateOfflineRewards();
    }

    /**
     * 获取玩家数据
     */
    getPlayerData(): PlayerData | null {
        return this.playerData;
    }

    /**
     * 获取玩家阵营
     */
    getPlayerFaction(): Faction {
        return this.playerData?.faction || Faction.LIGHT;
    }

    /**
     * 获取玩家等级
     */
    getPlayerLevel(): number {
        return this.playerData?.level || 1;
    }

    /**
     * 获取玩家基本信息
     */
    getPlayerInfo(): { id: string; name: string; level: number; faction: Faction } | null {
        if (!this.playerData) return null;
        return {
            id: this.playerData.id,
            name: this.playerData.name,
            level: this.playerData.level,
            faction: this.playerData.faction
        };
    }

    /**
     * 计算离线奖励
     */
    private calculateOfflineRewards(): void {
        if (!this.playerData) return;

        const now = Date.now();
        const offlineTime = now - this.playerData.lastLoginTime;
        const offlineHours = Math.min(offlineTime / (1000 * 60 * 60), 24); // 最多24小时

        // 基于主城等级计算收益
        const townLevel = this.playerData.mainTown.level;

        const goldReward = Math.floor(OFFLINE_REWARD_RATE.GOLD_PER_HOUR * offlineHours * townLevel);
        const resourceReward = Math.floor(OFFLINE_REWARD_RATE.RESOURCE_PER_HOUR * offlineHours * townLevel);

        this.playerData.offlineRewards = {
            gold: goldReward,
            resources: {
                [ResourceType.WOOD]: resourceReward,
                [ResourceType.ORE]: resourceReward
            },
            calculateTime: offlineHours
        };
    }

    /**
     * 领取离线奖励
     */
    claimOfflineRewards(): boolean {
        if (!this.playerData) return false;

        const rewards = this.playerData.offlineRewards;

        // 添加金币
        this.addResource(ResourceType.GOLD, rewards.gold);

        // 添加资源
        for (const [resource, amount] of Object.entries(rewards.resources)) {
            this.addResource(resource as ResourceType, amount);
        }

        // 清空离线奖励
        this.playerData.offlineRewards = {
            gold: 0,
            resources: {},
            calculateTime: 0
        };

        // 更新登录时间
        this.playerData.lastLoginTime = Date.now();

        return true;
    }

    /**
     * 获取资源数量
     */
    getResource(resource: ResourceType): number {
        return this.playerData?.resources[resource] || 0;
    }

    /**
     * 添加资源
     */
    addResource(resource: ResourceType, amount: number): void {
        if (!this.playerData) return;

        this.playerData.resources[resource] = (this.playerData.resources[resource] || 0) + amount;
    }

    /**
     * 消耗资源
     */
    useResource(resource: ResourceType, amount: number): boolean {
        if (!this.playerData) return false;

        const available = this.playerData.resources[resource] || 0;
        if (available < amount) {
            return false;
        }

        this.playerData.resources[resource] = available - amount;
        return true;
    }

    /**
     * 检查资源是否足够
     */
    hasEnoughResources(cost: Partial<Record<ResourceType, number>>): boolean {
        if (!this.playerData) return false;

        for (const [resource, amount] of Object.entries(cost)) {
            const available = this.playerData.resources[resource as ResourceType] || 0;
            if (available < amount) {
                return false;
            }
        }

        return true;
    }

    /**
     * 消耗多种资源
     */
    useResources(cost: Partial<Record<ResourceType, number>>): boolean {
        if (!this.hasEnoughResources(cost)) {
            return false;
        }

        for (const [resource, amount] of Object.entries(cost)) {
            this.useResource(resource as ResourceType, amount);
        }

        return true;
    }

    /**
     * 获取英雄
     */
    getHero(id: string): Hero | undefined {
        return this.heroManager.getHero(id);
    }

    /**
     * 获取所有英雄
     */
    getAllHeroes(): Hero[] {
        return this.heroManager.getAllHeroes();
    }

    /**
     * 添加英雄
     */
    addHero(configId: string): Hero | null {
        if (!this.playerData) return null;

        // 检查是否已解锁该英雄
        if (!this.playerData.unlockedHeroes.includes(configId)) {
            return null;
        }

        const hero = this.heroManager.createHero(configId);
        this.playerData.heroes.push(hero.toJSON());

        return hero;
    }

    /**
     * 获取主城
     */
    getMainTown(): Town | undefined {
        return this.townManager.getTown('main');
    }

    /**
     * 建造建筑
     */
    buildBuilding(configId: string): { success: boolean; reason?: string } {
        const town = this.getMainTown();
        if (!town) {
            return { success: false, reason: '主城不存在' };
        }

        const result = town.canBuild(configId, this.playerData?.resources || {});
        if (!result.canBuild) {
            return { success: false, reason: result.reason };
        }

        const buildResult = town.startBuilding(configId, this.playerData?.resources || {});
        if (buildResult.success) {
            this.useResources(buildResult.cost);
            this.saveTownData();
            return { success: true };
        }

        return { success: false, reason: '建造失败' };
    }

    /**
     * 招募单位
     */
    recruitUnit(unitId: string, count: number): { success: boolean; reason?: string; armySlot?: ArmySlot } {
        const town = this.getMainTown();
        if (!town) {
            return { success: false, reason: '主城不存在' };
        }

        const result = town.recruitUnit(unitId, count, this.playerData?.resources || {});
        if (!result.success) {
            return { success: false, reason: '招募失败' };
        }

        // 扣除资源
        this.useResources(result.cost);

        return { success: true, armySlot: result.armySlot };
    }

    /**
     * 保存主城数据
     */
    private saveTownData(): void {
        if (!this.playerData) return;

        const town = this.townManager.getTown('main');
        if (town) {
            this.playerData.mainTown = town.toJSON();
        }
    }

    /**
     * 保存英雄数据
     */
    saveHeroData(): void {
        if (!this.playerData) return;

        this.playerData.heroes = this.heroManager.serialize();
    }

    /**
     * 增加经验值
     */
    addExperience(amount: number): void {
        if (!this.playerData) return;

        this.playerData.experience += amount;

        // 检查升级
        const expNeeded = this.getExpForLevel(this.playerData.level);
        while (this.playerData.experience >= expNeeded) {
            this.playerData.experience -= expNeeded;
            this.playerData.level++;
        }
    }

    /**
     * 获取升级所需经验
     */
    private getExpForLevel(level: number): number {
        return 1000 * level;
    }

    /**
     * 序列化玩家数据
     */
    serialize(): string {
        return JSON.stringify(this.playerData);
    }

    /**
     * 反序列化玩家数据
     */
    deserialize(json: string): void {
        try {
            const data = JSON.parse(json) as PlayerData;
            this.loadPlayerData(data);
        } catch (e) {
            console.error('Failed to deserialize player data', e);
        }
    }
}

/** 玩家数据管理器单例 */
export const playerDataManager = new PlayerDataManager();