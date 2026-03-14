/**
 * 战争机器配置数据
 * 英雄无敌III经典战争机器
 */

import {
    WarMachineConfig,
    WarMachineType,
    WarMachineRarity
} from '../scripts/config/WarMachineTypes';

/**
 * 战争机器配置列表
 */
export const WarMachineConfigs: WarMachineConfig[] = [
    // ==================== 弩车 ====================
    {
        id: 'war_machine_ballista_1',
        name: '弩车',
        type: WarMachineType.BALLISTA,
        rarity: WarMachineRarity.NORMAL,
        cost: 2500,
        stats: {
            attack: 10,
            defense: 5,
            hp: 250,
            shots: 24
        },
        growth: {
            attack: 2,
            defense: 1,
            hp: 25
        },
        icon: 'icon_ballista',
        description: '强力的远程攻击武器，每回合可以发射弩箭攻击敌人'
    },
    {
        id: 'war_machine_ballista_2',
        name: '精良弩车',
        type: WarMachineType.BALLISTA,
        rarity: WarMachineRarity.RARE,
        cost: 5000,
        stats: {
            attack: 15,
            defense: 8,
            hp: 350,
            shots: 32
        },
        growth: {
            attack: 3,
            defense: 2,
            hp: 35
        },
        icon: 'icon_ballista_rare',
        description: '经过改良的弩车，攻击力和精准度更高'
    },
    {
        id: 'war_machine_ballista_3',
        name: '神射手弩车',
        type: WarMachineType.BALLISTA,
        rarity: WarMachineRarity.EPIC,
        cost: 10000,
        stats: {
            attack: 25,
            defense: 12,
            hp: 500,
            shots: 48
        },
        growth: {
            attack: 5,
            defense: 3,
            hp: 50
        },
        icon: 'icon_ballista_epic',
        description: '传说中的神射手弩车，箭无虚发'
    },

    // ==================== 医疗帐篷 ====================
    {
        id: 'war_machine_first_aid_tent_1',
        name: '医疗帐篷',
        type: WarMachineType.FIRST_AID_TENT,
        rarity: WarMachineRarity.NORMAL,
        cost: 500,
        stats: {
            defense: 5,
            hp: 100,
            healAmount: 25
        },
        growth: {
            defense: 1,
            hp: 10,
            healAmount: 5
        },
        icon: 'icon_first_aid_tent',
        description: '战地医疗设施，可以在战斗中治疗受伤的单位'
    },
    {
        id: 'war_machine_first_aid_tent_2',
        name: '高级医疗帐篷',
        type: WarMachineType.FIRST_AID_TENT,
        rarity: WarMachineRarity.RARE,
        cost: 1500,
        stats: {
            defense: 8,
            hp: 150,
            healAmount: 50
        },
        growth: {
            defense: 2,
            hp: 15,
            healAmount: 10
        },
        icon: 'icon_first_aid_tent_rare',
        description: '配备更先进的医疗设备，治疗效果更佳'
    },
    {
        id: 'war_machine_first_aid_tent_3',
        name: '神圣医疗帐篷',
        type: WarMachineType.FIRST_AID_TENT,
        rarity: WarMachineRarity.EPIC,
        cost: 5000,
        stats: {
            defense: 15,
            hp: 250,
            healAmount: 100
        },
        growth: {
            defense: 3,
            hp: 25,
            healAmount: 20
        },
        icon: 'icon_first_aid_tent_epic',
        description: '神圣力量加持的医疗帐篷，能快速治愈重伤'
    },

    // ==================== 弹药车 ====================
    {
        id: 'war_machine_ammo_cart_1',
        name: '弹药车',
        type: WarMachineType.AMMO_CART,
        rarity: WarMachineRarity.NORMAL,
        cost: 1000,
        stats: {
            defense: 5,
            hp: 150,
            ammoBonus: 50
        },
        growth: {
            defense: 1,
            hp: 15,
            ammoBonus: 10
        },
        icon: 'icon_ammo_cart',
        description: '为远程单位提供额外弹药，确保持续输出能力'
    },
    {
        id: 'war_machine_ammo_cart_2',
        name: '大型弹药车',
        type: WarMachineType.AMMO_CART,
        rarity: WarMachineRarity.RARE,
        cost: 2500,
        stats: {
            defense: 8,
            hp: 200,
            ammoBonus: 100
        },
        growth: {
            defense: 2,
            hp: 20,
            ammoBonus: 20
        },
        icon: 'icon_ammo_cart_rare',
        description: '装载更多弹药的运输车，大幅提升远程单位续航'
    },
    {
        id: 'war_machine_ammo_cart_3',
        name: '无尽弹药车',
        type: WarMachineType.AMMO_CART,
        rarity: WarMachineRarity.EPIC,
        cost: 8000,
        stats: {
            defense: 12,
            hp: 300,
            ammoBonus: 200
        },
        growth: {
            defense: 3,
            hp: 30,
            ammoBonus: 40
        },
        icon: 'icon_ammo_cart_epic',
        description: '传说中的无尽弹药车，几乎永不断粮'
    },

    // ==================== 投石车 ====================
    {
        id: 'war_machine_catapult_1',
        name: '投石车',
        type: WarMachineType.CATAPULT,
        rarity: WarMachineRarity.NORMAL,
        cost: 1500,
        stats: {
            attack: 15,
            defense: 5,
            hp: 300,
            shots: 12
        },
        growth: {
            attack: 3,
            defense: 1,
            hp: 30
        },
        icon: 'icon_catapult',
        description: '攻城利器，可以对城墙和城门造成巨大伤害'
    },
    {
        id: 'war_machine_catapult_2',
        name: '重型投石车',
        type: WarMachineType.CATAPULT,
        rarity: WarMachineRarity.RARE,
        cost: 4000,
        stats: {
            attack: 25,
            defense: 8,
            hp: 450,
            shots: 16
        },
        growth: {
            attack: 5,
            defense: 2,
            hp: 45
        },
        icon: 'icon_catapult_rare',
        description: '威力更强的投石车，能投掷更重的石块'
    },
    {
        id: 'war_machine_catapult_3',
        name: '地狱火投石车',
        type: WarMachineType.CATAPULT,
        rarity: WarMachineRarity.LEGENDARY,
        cost: 15000,
        stats: {
            attack: 50,
            defense: 15,
            hp: 800,
            shots: 24
        },
        growth: {
            attack: 10,
            defense: 4,
            hp: 80
        },
        icon: 'icon_catapult_legendary',
        description: '传说中能投掷地狱火球的投石车，所到之处化为灰烬'
    }
];

/**
 * 战争机器配置映射表
 */
export const WarMachineConfigMap: Map<string, WarMachineConfig> = new Map(
    WarMachineConfigs.map(config => [config.id, config])
);

/**
 * 按类型分组的战争机器
 */
export const WarMachinesByType: Map<WarMachineType, WarMachineConfig[]> = new Map([
    [WarMachineType.BALLISTA, WarMachineConfigs.filter(m => m.type === WarMachineType.BALLISTA)],
    [WarMachineType.FIRST_AID_TENT, WarMachineConfigs.filter(m => m.type === WarMachineType.FIRST_AID_TENT)],
    [WarMachineType.AMMO_CART, WarMachineConfigs.filter(m => m.type === WarMachineType.AMMO_CART)],
    [WarMachineType.CATAPULT, WarMachineConfigs.filter(m => m.type === WarMachineType.CATAPULT)]
]);

/**
 * 按稀有度分组的战争机器
 */
export const WarMachinesByRarity: Map<WarMachineRarity, WarMachineConfig[]> = new Map([
    [WarMachineRarity.NORMAL, WarMachineConfigs.filter(m => m.rarity === WarMachineRarity.NORMAL)],
    [WarMachineRarity.RARE, WarMachineConfigs.filter(m => m.rarity === WarMachineRarity.RARE)],
    [WarMachineRarity.EPIC, WarMachineConfigs.filter(m => m.rarity === WarMachineRarity.EPIC)],
    [WarMachineRarity.LEGENDARY, WarMachineConfigs.filter(m => m.rarity === WarMachineRarity.LEGENDARY)]
]);

/**
 * 获取默认战争机器配置
 */
export function getDefaultWarMachine(type: WarMachineType): WarMachineConfig | undefined {
    const machines = WarMachinesByType.get(type);
    return machines?.[0];
}

/**
 * 获取下一级战争机器
 */
export function getNextLevelWarMachine(currentId: string): WarMachineConfig | undefined {
    const current = WarMachineConfigMap.get(currentId);
    if (!current) return undefined;

    const sameType = WarMachinesByType.get(current.type) || [];
    const currentIndex = sameType.findIndex(m => m.id === currentId);

    if (currentIndex >= 0 && currentIndex < sameType.length - 1) {
        return sameType[currentIndex + 1];
    }

    return undefined;
}