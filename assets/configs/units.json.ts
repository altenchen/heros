/**
 * 简化版兵种配置 (MVP)
 * 包含3个基础兵种
 */

import { UnitConfig, Race, UnitType, ResourceType, EffectType, StatusEffect } from '../scripts/config/GameTypes';

/**
 * 兵种配置列表
 */
export const UnitConfigs: UnitConfig[] = [
    // 圣堂 - 枪兵 (1阶)
    {
        id: 'unit_pikeman',
        name: '枪兵',
        race: Race.CASTLE,
        tier: 1,
        type: UnitType.DEFENSE,
        attack: 5,
        defense: 8,
        speed: 4,
        hp: 10,
        damage: [1, 3],
        growth: 14,
        cost: {
            [ResourceType.GOLD]: 60
        },
        specialty: {
            id: 'pikeman_defense',
            name: '长矛防御',
            description: '对突击单位有额外伤害',
            type: 'passive',
            trigger: 'on_attack',
            effect: {
                type: EffectType.DAMAGE,
                value: 1.5,
                probability: 1.0
            }
        }
    },
    // 圣堂 - 弓箭手 (1阶)
    {
        id: 'unit_archer',
        name: '弓箭手',
        race: Race.CASTLE,
        tier: 1,
        type: UnitType.SHOOTER,
        attack: 6,
        defense: 3,
        speed: 5,
        hp: 8,
        damage: [2, 3],
        growth: 12,
        cost: {
            [ResourceType.GOLD]: 100
        },
        specialty: {
            id: 'archer_ranged',
            name: '远程射击',
            description: '可以远程攻击',
            type: 'passive',
            effect: {
                type: EffectType.DAMAGE,
                value: 1.0
            }
        }
    },
    // 圣堂 - 狮鹫 (3阶)
    {
        id: 'unit_griffin',
        name: '狮鹫',
        race: Race.CASTLE,
        tier: 3,
        type: UnitType.ASSAULT,
        attack: 8,
        defense: 8,
        speed: 6,
        hp: 25,
        damage: [3, 5],
        growth: 6,
        cost: {
            [ResourceType.GOLD]: 200
        },
        specialty: {
            id: 'griffin_counter',
            name: '无限反击',
            description: '可以无限次反击',
            type: 'passive',
            trigger: 'on_hit',
            effect: {
                type: EffectType.DAMAGE,
                value: 1.0
            }
        }
    }
];

/**
 * 兵种配置映射
 */
export const UnitConfigMap: Map<string, UnitConfig> = new Map(
    UnitConfigs.map(config => [config.id, config])
);

/**
 * 根据ID获取兵种配置
 */
export function getUnitConfig(id: string): UnitConfig | undefined {
    return UnitConfigMap.get(id);
}

/**
 * 获取所有兵种配置
 */
export function getAllUnitConfigs(): UnitConfig[] {
    return [...UnitConfigs];
}