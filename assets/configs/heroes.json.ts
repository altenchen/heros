/**
 * 简化版英雄配置 (MVP)
 * 包含1个基础英雄
 */

import { HeroConfig, Race, HeroClass } from '../scripts/config/GameTypes';

/**
 * 英雄配置列表
 */
export const HeroConfigs: HeroConfig[] = [
    // 圣堂 - 骑士
    {
        id: 'hero_knight',
        name: '凯瑟琳',
        race: Race.CASTLE,
        heroClass: HeroClass.KNIGHT,
        specialty: '领导术：增加部队士气',
        attackGrowth: 4,
        defenseGrowth: 3,
        spellPowerGrowth: 1,
        knowledgeGrowth: 2,
        skillTree: ['skill_leadership', 'skill_tactics'],
        initialSkill: 'skill_leadership',
        portrait: 'portrait_knight'
    }
];

/**
 * 英雄配置映射
 */
export const HeroConfigMap: Map<string, HeroConfig> = new Map(
    HeroConfigs.map(config => [config.id, config])
);

/**
 * 根据ID获取英雄配置
 */
export function getHeroConfig(id: string): HeroConfig | undefined {
    return HeroConfigMap.get(id);
}

/**
 * 获取所有英雄配置
 */
export function getAllHeroConfigs(): HeroConfig[] {
    return [...HeroConfigs];
}