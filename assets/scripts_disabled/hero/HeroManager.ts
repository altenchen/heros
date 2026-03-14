/**
 * 英雄管理器
 * 管理英雄的创建、升级和属性计算
 */

import {
    HeroConfig,
    HeroData,
    SkillInstance,
    ArmySlot,
    Race,
    HeroClass,
    ResourceType
} from '../config/GameTypes';
import { HeroConfigs, HeroConfigMap } from '../../configs/heroes.json';

/**
 * 英雄类
 */
export class Hero {
    data: HeroData;
    config: HeroConfig;

    /** 获取英雄实例ID */
    get id(): string {
        return this.data.id;
    }

    /** 获取英雄配置ID */
    get configId(): string {
        return this.data.configId;
    }

    constructor(configId: string) {
        const config = HeroConfigMap.get(configId);
        if (!config) {
            throw new Error(`Hero config not found: ${configId}`);
        }

        this.config = config;
        this.data = this.createInitialData(configId);
    }

    /**
     * 创建初始英雄数据
     */
    private createInitialData(configId: string): HeroData {
        return {
            id: `hero_${Date.now()}`,
            configId,
            level: 1,
            experience: 0,
            attack: 0,
            defense: 0,
            spellPower: 0,
            knowledge: 0,
            mana: 10,
            maxMana: 10,
            skills: [],
            army: []
        };
    }

    /**
     * 获取升级所需经验
     */
    static getExpForLevel(level: number): number {
        // 经验公式：每级需要更多经验
        return Math.floor(100 * Math.pow(1.2, level - 1));
    }

    /**
     * 增加经验值
     */
    addExperience(amount: number): boolean {
        this.data.experience += amount;

        // 检查是否升级
        let leveledUp = false;
        while (this.data.experience >= Hero.getExpForLevel(this.data.level)) {
            this.data.experience -= Hero.getExpForLevel(this.data.level);
            this.levelUp();
            leveledUp = true;
        }

        return leveledUp;
    }

    /**
     * 升级
     */
    private levelUp(): void {
        this.data.level++;

        // 随机增加属性（基于成长值）
        const attackRoll = Math.random() * 100 < this.config.attackGrowth * 20 ? 1 : 0;
        const defenseRoll = Math.random() * 100 < this.config.defenseGrowth * 20 ? 1 : 0;
        const spellPowerRoll = Math.random() * 100 < this.config.spellPowerGrowth * 20 ? 1 : 0;
        const knowledgeRoll = Math.random() * 100 < this.config.knowledgeGrowth * 20 ? 1 : 0;

        this.data.attack += attackRoll;
        this.data.defense += defenseRoll;
        this.data.spellPower += spellPowerRoll;
        this.data.knowledge += knowledgeRoll;

        // 更新魔法值上限
        this.data.maxMana = this.data.knowledge * 10;
        this.data.mana = this.data.maxMana;
    }

    /**
     * 获取单位攻击加成
     */
    getAttackBonus(): number {
        return this.data.attack * 0.05;
    }

    /**
     * 获取单位防御加成
     */
    getDefenseBonus(): number {
        return this.data.defense * 0.05;
    }

    /**
     * 获取魔法伤害加成
     */
    getSpellDamageBonus(): number {
        return this.data.spellPower * 0.1;
    }

    /**
     * 添加技能
     */
    addSkill(skillId: string, level: number = 1): void {
        const existingSkill = this.data.skills.find(s => s.configId === skillId);
        if (existingSkill) {
            existingSkill.level = Math.min(5, existingSkill.level + level);
        } else {
            this.data.skills.push({
                configId: skillId,
                level,
                currentCooldown: 0
            });
        }
    }

    /**
     * 设置军队
     */
    setArmy(army: ArmySlot[]): void {
        this.data.army = army.slice(0, 7); // 最多7支队伍
    }

    /**
     * 添加单位到军队
     */
    addUnitToArmy(slot: ArmySlot): boolean {
        if (this.data.army.length >= 7) {
            return false;
        }

        // 检查是否已有同类型单位
        const existingSlot = this.data.army.find(s => s.configId === slot.configId);
        if (existingSlot) {
            existingSlot.count += slot.count;
        } else {
            this.data.army.push(slot);
        }

        return true;
    }

    /**
     * 移除军队单位
     */
    removeUnitFromArmy(configId: string, count: number): boolean {
        const slotIndex = this.data.army.findIndex(s => s.configId === configId);
        if (slotIndex < 0) {
            return false;
        }

        const slot = this.data.army[slotIndex];
        if (slot.count <= count) {
            this.data.army.splice(slotIndex, 1);
        } else {
            slot.count -= count;
        }

        return true;
    }

    /**
     * 恢复魔法值
     */
    restoreMana(amount: number): void {
        this.data.mana = Math.min(this.data.maxMana, this.data.mana + amount);
    }

    /**
     * 消耗魔法值
     */
    useMana(amount: number): boolean {
        if (this.data.mana < amount) {
            return false;
        }
        this.data.mana -= amount;
        return true;
    }

    /**
     * 序列化为普通对象
     */
    toJSON(): HeroData {
        return { ...this.data };
    }

    /**
     * 从数据创建英雄
     */
    static fromData(data: HeroData): Hero {
        const config = HeroConfigMap.get(data.configId);
        if (!config) {
            throw new Error(`Hero config not found: ${data.configId}`);
        }

        const hero = new Hero(data.configId);
        hero.data = { ...data };
        return hero;
    }
}

/**
 * 英雄管理器
 */
export class HeroManager {
    private heroes: Map<string, Hero> = new Map();

    /**
     * 创建新英雄
     */
    createHero(configId: string): Hero {
        const hero = new Hero(configId);
        this.heroes.set(hero.data.id, hero);
        return hero;
    }

    /**
     * 获取英雄
     */
    getHero(id: string): Hero | undefined {
        return this.heroes.get(id);
    }

    /**
     * 删除英雄
     */
    deleteHero(id: string): boolean {
        return this.heroes.delete(id);
    }

    /**
     * 获取所有英雄
     */
    getAllHeroes(): Hero[] {
        return Array.from(this.heroes.values());
    }

    /**
     * 获取指定种族的英雄配置
     */
    getHeroesByRace(race: Race): HeroConfig[] {
        return HeroConfigs.filter(h => h.race === race);
    }

    /**
     * 获取所有英雄配置
     */
    getAllHeroConfigs(): HeroConfig[] {
        return HeroConfigs;
    }

    /**
     * 序列化所有英雄
     */
    serialize(): HeroData[] {
        return Array.from(this.heroes.values()).map(h => h.toJSON());
    }

    /**
     * 从数据恢复英雄
     */
    deserialize(data: HeroData[]): void {
        this.heroes.clear();
        data.forEach(d => {
            const hero = Hero.fromData(d);
            this.heroes.set(hero.data.id, hero);
        });
    }
}