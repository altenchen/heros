/**
 * MVP 简化版英雄管理器
 */

import {
    HeroConfig,
    HeroData,
    Race,
    HeroClass
} from '../config/GameTypes';
import { getHeroConfig, getAllHeroConfigs } from '../../configs/heroes.json';

/**
 * 简化版英雄数据
 */
export interface SimpleHero {
    id: string;
    configId: string;
    name: string;
    level: number;
    attack: number;
    defense: number;
    spellPower: number;
}

/**
 * 英雄管理器
 */
export class HeroManager {
    private static instance: HeroManager | null = null;
    private heroes: Map<string, SimpleHero> = new Map();

    private constructor() {}

    static getInstance(): HeroManager {
        if (!HeroManager.instance) {
            HeroManager.instance = new HeroManager();
        }
        return HeroManager.instance;
    }

    /**
     * 创建英雄
     */
    createHero(configId: string): SimpleHero | null {
        const config = getHeroConfig(configId);
        if (!config) {
            console.error(`Hero config not found: ${configId}`);
            return null;
        }

        const hero: SimpleHero = {
            id: `hero_${Date.now()}`,
            configId,
            name: config.name,
            level: 1,
            attack: 2 + config.attackGrowth,
            defense: 1 + config.defenseGrowth,
            spellPower: config.spellPowerGrowth
        };

        this.heroes.set(hero.id, hero);
        return hero;
    }

    /**
     * 获取英雄
     */
    getHero(id: string): SimpleHero | undefined {
        return this.heroes.get(id);
    }

    /**
     * 获取所有英雄
     */
    getAllHeroes(): SimpleHero[] {
        return Array.from(this.heroes.values());
    }

    /**
     * 获取英雄配置
     */
    getHeroConfig(configId: string): HeroConfig | undefined {
        return getHeroConfig(configId);
    }

    /**
     * 获取所有英雄配置
     */
    getAllHeroConfigs(): HeroConfig[] {
        return getAllHeroConfigs();
    }
}

/** 英雄管理器单例 */
export const heroManager = HeroManager.getInstance();