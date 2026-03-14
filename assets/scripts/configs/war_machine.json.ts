/**
 * 战争机器配置数据
 * 英雄无敌III经典系统：弩车、医疗帐篷、弹药车、投石车
 */

import { WarMachineConfig, WarMachineType, WarMachineRarity } from '../config/WarMachineTypes';

/**
 * 战争机器配置列表
 */
export const WarMachineConfigs: WarMachineConfig[] = [
    // ==================== 弩车 ====================
    {
        id: 'war_machine_ballista_1',
        name: '普通弩车',
        type: WarMachineType.BALLISTA,
        rarity: WarMachineRarity.NORMAL,
        cost: 1000,
        stats: {
            attack: 10,
            defense: 5,
            hp: 100,
            shots: 3
        },
        growth: {
            attack: 2,
            defense: 1,
            hp: 20
        },
        icon: 'ballista_1',
        description: '基础远程攻击单位，每回合可进行多次射击'
    },
    {
        id: 'war_machine_ballista_2',
        name: '精锐弩车',
        type: WarMachineType.BALLISTA,
        rarity: WarMachineRarity.RARE,
        cost: 3000,
        stats: {
            attack: 15,
            defense: 8,
            hp: 150,
            shots: 4
        },
        growth: {
            attack: 3,
            defense: 2,
            hp: 30
        },
        icon: 'ballista_2',
        description: '经过改进的弩车，攻击力和耐久度都有提升'
    },
    {
        id: 'war_machine_ballista_3',
        name: '重型弩车',
        type: WarMachineType.BALLISTA,
        rarity: WarMachineRarity.EPIC,
        cost: 8000,
        stats: {
            attack: 25,
            defense: 12,
            hp: 250,
            shots: 5
        },
        growth: {
            attack: 5,
            defense: 3,
            hp: 50
        },
        icon: 'ballista_3',
        description: '重型弩车，能够造成巨大的伤害'
    },
    {
        id: 'war_machine_ballista_4',
        name: '泰坦之弩',
        type: WarMachineType.BALLISTA,
        rarity: WarMachineRarity.LEGENDARY,
        cost: 20000,
        stats: {
            attack: 40,
            defense: 20,
            hp: 400,
            shots: 6
        },
        growth: {
            attack: 8,
            defense: 5,
            hp: 80
        },
        icon: 'ballista_4',
        description: '传说中的泰坦弩车，威力惊人'
    },

    // ==================== 医疗帐篷 ====================
    {
        id: 'war_machine_first_aid_tent_1',
        name: '普通医疗帐篷',
        type: WarMachineType.FIRST_AID_TENT,
        rarity: WarMachineRarity.NORMAL,
        cost: 800,
        stats: {
            defense: 3,
            hp: 80,
            healAmount: 20
        },
        growth: {
            defense: 1,
            hp: 15,
            healAmount: 5
        },
        icon: 'tent_1',
        description: '基础医疗帐篷，可以为友方单位治疗'
    },
    {
        id: 'war_machine_first_aid_tent_2',
        name: '精锐医疗帐篷',
        type: WarMachineType.FIRST_AID_TENT,
        rarity: WarMachineRarity.RARE,
        cost: 2500,
        stats: {
            defense: 6,
            hp: 120,
            healAmount: 35
        },
        growth: {
            defense: 2,
            hp: 25,
            healAmount: 8
        },
        icon: 'tent_2',
        description: '改进的医疗帐篷，治疗效果更好'
    },
    {
        id: 'war_machine_first_aid_tent_3',
        name: '圣光帐篷',
        type: WarMachineType.FIRST_AID_TENT,
        rarity: WarMachineRarity.EPIC,
        cost: 6000,
        stats: {
            defense: 10,
            hp: 200,
            healAmount: 60
        },
        growth: {
            defense: 3,
            hp: 40,
            healAmount: 12
        },
        icon: 'tent_3',
        description: '蕴含神圣力量的医疗帐篷'
    },
    {
        id: 'war_machine_first_aid_tent_4',
        name: '生命之泉帐篷',
        type: WarMachineType.FIRST_AID_TENT,
        rarity: WarMachineRarity.LEGENDARY,
        cost: 15000,
        stats: {
            defense: 15,
            hp: 300,
            healAmount: 100
        },
        growth: {
            defense: 5,
            hp: 60,
            healAmount: 20
        },
        icon: 'tent_4',
        description: '传说中的生命之泉，拥有强大的治愈能力'
    },

    // ==================== 弹药车 ====================
    {
        id: 'war_machine_ammo_cart_1',
        name: '普通弹药车',
        type: WarMachineType.AMMO_CART,
        rarity: WarMachineRarity.NORMAL,
        cost: 500,
        stats: {
            defense: 2,
            hp: 60,
            ammoBonus: 5
        },
        growth: {
            defense: 1,
            hp: 10,
            ammoBonus: 2
        },
        icon: 'ammo_cart_1',
        description: '为基础远程单位提供额外弹药'
    },
    {
        id: 'war_machine_ammo_cart_2',
        name: '精锐弹药车',
        type: WarMachineType.AMMO_CART,
        rarity: WarMachineRarity.RARE,
        cost: 1500,
        stats: {
            defense: 4,
            hp: 100,
            ammoBonus: 10
        },
        growth: {
            defense: 2,
            hp: 20,
            ammoBonus: 3
        },
        icon: 'ammo_cart_2',
        description: '经过改进的弹药车，提供更多弹药'
    },
    {
        id: 'war_machine_ammo_cart_3',
        name: '无限弹药车',
        type: WarMachineType.AMMO_CART,
        rarity: WarMachineRarity.EPIC,
        cost: 4000,
        stats: {
            defense: 8,
            hp: 180,
            ammoBonus: 20
        },
        growth: {
            defense: 3,
            hp: 35,
            ammoBonus: 5
        },
        icon: 'ammo_cart_3',
        description: '强大的弹药补给车，大幅增加远程单位持续作战能力'
    },
    {
        id: 'war_machine_ammo_cart_4',
        name: '神射手弹药车',
        type: WarMachineType.AMMO_CART,
        rarity: WarMachineRarity.LEGENDARY,
        cost: 10000,
        stats: {
            defense: 12,
            hp: 250,
            ammoBonus: 35
        },
        growth: {
            defense: 4,
            hp: 50,
            ammoBonus: 8
        },
        icon: 'ammo_cart_4',
        description: '传说中的弹药车，让远程单位几乎不用担心弹药问题'
    },

    // ==================== 投石车 ====================
    {
        id: 'war_machine_catapult_1',
        name: '普通投石车',
        type: WarMachineType.CATAPULT,
        rarity: WarMachineRarity.NORMAL,
        cost: 1200,
        stats: {
            attack: 15,
            defense: 4,
            hp: 120,
            shots: 1
        },
        growth: {
            attack: 3,
            defense: 1,
            hp: 25
        },
        icon: 'catapult_1',
        description: '基础攻城单位，对城墙造成额外伤害'
    },
    {
        id: 'war_machine_catapult_2',
        name: '精锐投石车',
        type: WarMachineType.CATAPULT,
        rarity: WarMachineRarity.RARE,
        cost: 3500,
        stats: {
            attack: 25,
            defense: 8,
            hp: 200,
            shots: 1
        },
        growth: {
            attack: 5,
            defense: 2,
            hp: 40
        },
        icon: 'catapult_2',
        description: '改进的投石车，攻击力更强'
    },
    {
        id: 'war_machine_catapult_3',
        name: '火焰投石车',
        type: WarMachineType.CATAPULT,
        rarity: WarMachineRarity.EPIC,
        cost: 9000,
        stats: {
            attack: 40,
            defense: 12,
            hp: 300,
            shots: 2
        },
        growth: {
            attack: 8,
            defense: 3,
            hp: 60
        },
        icon: 'catapult_3',
        description: '投掷火焰弹的投石车，造成范围伤害'
    },
    {
        id: 'war_machine_catapult_4',
        name: '毁灭者投石车',
        type: WarMachineType.CATAPULT,
        rarity: WarMachineRarity.LEGENDARY,
        cost: 22000,
        stats: {
            attack: 60,
            defense: 18,
            hp: 450,
            shots: 2
        },
        growth: {
            attack: 12,
            defense: 5,
            hp: 90
        },
        icon: 'catapult_4',
        description: '传说中的攻城神器，能够摧毁一切防御工事'
    }
];

/**
 * 战争机器配置映射表
 */
export const WarMachineConfigMap: Map<string, WarMachineConfig> = new Map(
    WarMachineConfigs.map(config => [config.id, config])
);

/**
 * 根据类型获取战争机器配置列表
 */
export function getWarMachinesByType(type: WarMachineType): WarMachineConfig[] {
    return WarMachineConfigs.filter(config => config.type === type);
}

/**
 * 根据稀有度获取战争机器配置列表
 */
export function getWarMachinesByRarity(rarity: WarMachineRarity): WarMachineConfig[] {
    return WarMachineConfigs.filter(config => config.rarity === rarity);
}

/**
 * 获取初始战争机器（普通品质）
 */
export function getStarterWarMachines(): WarMachineConfig[] {
    return WarMachineConfigs.filter(config => config.rarity === WarMachineRarity.NORMAL);
}