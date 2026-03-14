/**
 * 宝物配置数据
 * 英雄无敌3经典宝物
 */

import { ArtifactConfig, ArtifactType, ArtifactSlot, ArtifactRarity, ArtifactStatType } from './ArtifactTypes';

export const ARTIFACT_CONFIGS: ArtifactConfig[] = [
    // ==================== 普通宝物 (Treasure) ====================
    {
        id: 'artifact_sword_1',
        name: '短剑',
        description: '一把普通的短剑，提供少量攻击力加成。',
        icon: 'sword_1',
        type: ArtifactType.WEAPON,
        slot: ArtifactSlot.MAIN_HAND,
        rarity: ArtifactRarity.COMMON,
        sellPrice: 500,
        stats: [
            { type: ArtifactStatType.ATTACK, value: 1 }
        ]
    },
    {
        id: 'artifact_shield_1',
        name: '木盾',
        description: '一面普通的木盾，提供少量防御力加成。',
        icon: 'shield_1',
        type: ArtifactType.SHIELD,
        slot: ArtifactSlot.OFF_HAND,
        rarity: ArtifactRarity.COMMON,
        sellPrice: 500,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 1 }
        ]
    },
    {
        id: 'artifact_helmet_1',
        name: '皮盔',
        description: '一顶轻便的皮盔，提供微量防御力。',
        icon: 'helmet_1',
        type: ArtifactType.HELMET,
        slot: ArtifactSlot.HELMET,
        rarity: ArtifactRarity.COMMON,
        sellPrice: 400,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 1 }
        ]
    },
    {
        id: 'artifact_armor_1',
        name: '皮甲',
        description: '一套轻便的皮甲，提供基础防护。',
        icon: 'armor_1',
        type: ArtifactType.ARMOR,
        slot: ArtifactSlot.ARMOR,
        rarity: ArtifactRarity.COMMON,
        sellPrice: 600,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 1 },
            { type: ArtifactStatType.HP, value: 5 }
        ]
    },
    {
        id: 'artifact_boots_1',
        name: '皮靴',
        description: '一双舒适的皮靴，略微提升移动速度。',
        icon: 'boots_1',
        type: ArtifactType.BOOTS,
        slot: ArtifactSlot.BOOTS,
        rarity: ArtifactRarity.COMMON,
        sellPrice: 400,
        stats: [
            { type: ArtifactStatType.SPEED, value: 1 }
        ]
    },
    {
        id: 'artifact_ring_1',
        name: '铜戒指',
        description: '一枚普通的铜戒指，带有微弱的魔力。',
        icon: 'ring_1',
        type: ArtifactType.RING,
        slot: ArtifactSlot.RING_1,
        rarity: ArtifactRarity.COMMON,
        sellPrice: 300,
        stats: [
            { type: ArtifactStatType.MANA, value: 5 }
        ]
    },
    {
        id: 'artifact_necklace_1',
        name: '铜项链',
        description: '一条普通的铜项链。',
        icon: 'necklace_1',
        type: ArtifactType.NECKLACE,
        slot: ArtifactSlot.NECKLACE,
        rarity: ArtifactRarity.COMMON,
        sellPrice: 350,
        stats: [
            { type: ArtifactStatType.KNOWLEDGE, value: 1 }
        ]
    },
    {
        id: 'artifact_cloak_1',
        name: '旅行斗篷',
        description: '一件普通的旅行斗篷。',
        icon: 'cloak_1',
        type: ArtifactType.CLOAK,
        slot: ArtifactSlot.CLOAK,
        rarity: ArtifactRarity.COMMON,
        sellPrice: 400,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 1 }
        ]
    },

    // ==================== 稀有宝物 (Minor) ====================
    {
        id: 'artifact_sword_2',
        name: '精钢剑',
        description: '一把锻造精良的钢剑，提供可观的攻击力加成。',
        icon: 'sword_2',
        type: ArtifactType.WEAPON,
        slot: ArtifactSlot.MAIN_HAND,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 1500,
        buyPrice: 3000,
        stats: [
            { type: ArtifactStatType.ATTACK, value: 2 }
        ]
    },
    {
        id: 'artifact_shield_2',
        name: '铁盾',
        description: '一面坚固的铁盾，提供可观的防御力加成。',
        icon: 'shield_2',
        type: ArtifactType.SHIELD,
        slot: ArtifactSlot.OFF_HAND,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 1500,
        buyPrice: 3000,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 2 }
        ]
    },
    {
        id: 'artifact_helmet_2',
        name: '铁盔',
        description: '一顶坚固的铁盔，提供不错的防护。',
        icon: 'helmet_2',
        type: ArtifactType.HELMET,
        slot: ArtifactSlot.HELMET,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 1200,
        buyPrice: 2400,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 2 }
        ]
    },
    {
        id: 'artifact_armor_2',
        name: '锁子甲',
        description: '一套轻便的锁子甲，提供良好的防护。',
        icon: 'armor_2',
        type: ArtifactType.ARMOR,
        slot: ArtifactSlot.ARMOR,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 2000,
        buyPrice: 4000,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 2 },
            { type: ArtifactStatType.HP, value: 10 }
        ]
    },
    {
        id: 'artifact_ring_2',
        name: '银戒指',
        description: '一枚精致的银戒指，蕴含着魔力。',
        icon: 'ring_2',
        type: ArtifactType.RING,
        slot: ArtifactSlot.RING_1,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 1000,
        buyPrice: 2000,
        stats: [
            { type: ArtifactStatType.MANA, value: 10 }
        ]
    },
    {
        id: 'artifact_necklace_2',
        name: '银项链',
        description: '一条精致的银项链，增强魔法能力。',
        icon: 'necklace_2',
        type: ArtifactType.NECKLACE,
        slot: ArtifactSlot.NECKLACE,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 1200,
        buyPrice: 2400,
        stats: [
            { type: ArtifactStatType.KNOWLEDGE, value: 2 }
        ]
    },
    {
        id: 'artifact_cloak_2',
        name: '魔法斗篷',
        description: '一件蕴含魔力的斗篷，增强力量。',
        icon: 'cloak_2',
        type: ArtifactType.CLOAK,
        slot: ArtifactSlot.CLOAK,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 1500,
        buyPrice: 3000,
        stats: [
            { type: ArtifactStatType.POWER, value: 2 }
        ]
    },
    {
        id: 'artifact_boots_2',
        name: '疾风靴',
        description: '一双附魔的靴子，提升移动速度。',
        icon: 'boots_2',
        type: ArtifactType.BOOTS,
        slot: ArtifactSlot.BOOTS,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 1500,
        buyPrice: 3000,
        stats: [
            { type: ArtifactStatType.SPEED, value: 2 }
        ]
    },

    // ==================== 史诗宝物 (Major) ====================
    {
        id: 'artifact_sword_3',
        name: '狮鹫之剑',
        description: '传说中狮鹫骑士使用的宝剑，锋利无比。',
        icon: 'sword_3',
        type: ArtifactType.WEAPON,
        slot: ArtifactSlot.MAIN_HAND,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 5000,
        buyPrice: 10000,
        stats: [
            { type: ArtifactStatType.ATTACK, value: 4 }
        ]
    },
    {
        id: 'artifact_shield_3',
        name: '龙鳞盾',
        description: '用龙鳞打造的盾牌，防御力惊人。',
        icon: 'shield_3',
        type: ArtifactType.SHIELD,
        slot: ArtifactSlot.OFF_HAND,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 5000,
        buyPrice: 10000,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 4 }
        ]
    },
    {
        id: 'artifact_helmet_3',
        name: '狮鹫头盔',
        description: '传说中狮鹫骑士的头盔，威严庄重。',
        icon: 'helmet_3',
        type: ArtifactType.HELMET,
        slot: ArtifactSlot.HELMET,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 4000,
        buyPrice: 8000,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 3 },
            { type: ArtifactStatType.ATTACK, value: 1 }
        ]
    },
    {
        id: 'artifact_armor_3',
        name: '龙鳞甲',
        description: '用龙鳞打造的盔甲，防御力惊人。',
        icon: 'armor_3',
        type: ArtifactType.ARMOR,
        slot: ArtifactSlot.ARMOR,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 8000,
        buyPrice: 16000,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 4 },
            { type: ArtifactStatType.HP, value: 25 }
        ]
    },
    {
        id: 'artifact_ring_3',
        name: '魔法戒指',
        description: '蕴含强大魔力的戒指，大幅增强魔法值。',
        icon: 'ring_3',
        type: ArtifactType.RING,
        slot: ArtifactSlot.RING_1,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 4000,
        buyPrice: 8000,
        stats: [
            { type: ArtifactStatType.MANA, value: 25 }
        ]
    },
    {
        id: 'artifact_necklace_3',
        name: '智慧项链',
        description: '蕴含智慧的项链，大幅增强知识。',
        icon: 'necklace_3',
        type: ArtifactType.NECKLACE,
        slot: ArtifactSlot.NECKLACE,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 5000,
        buyPrice: 10000,
        stats: [
            { type: ArtifactStatType.KNOWLEDGE, value: 4 }
        ]
    },
    {
        id: 'artifact_cloak_3',
        name: '大法师斗篷',
        description: '大法师使用的斗篷，蕴含强大的魔力。',
        icon: 'cloak_3',
        type: ArtifactType.CLOAK,
        slot: ArtifactSlot.CLOAK,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 5000,
        buyPrice: 10000,
        stats: [
            { type: ArtifactStatType.POWER, value: 4 }
        ]
    },
    {
        id: 'artifact_boots_3',
        name: '飞行靴',
        description: '附有飞行魔法的靴子，极大提升移动速度。',
        icon: 'boots_3',
        type: ArtifactType.BOOTS,
        slot: ArtifactSlot.BOOTS,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 5000,
        buyPrice: 10000,
        stats: [
            { type: ArtifactStatType.SPEED, value: 3 },
            { type: ArtifactStatType.DEFENSE, value: 1 }
        ]
    },

    // ==================== 传说宝物 (Relic) ====================
    {
        id: 'artifact_sword_4',
        name: '泰坦之剑',
        description: '传说中泰坦使用的神器之剑，攻击力无与伦比。',
        icon: 'sword_4',
        type: ArtifactType.WEAPON,
        slot: ArtifactSlot.MAIN_HAND,
        rarity: ArtifactRarity.RELIC,
        sellPrice: 20000,
        buyPrice: 50000,
        stats: [
            { type: ArtifactStatType.ATTACK, value: 8 }
        ],
        specialEffects: [
            { id: 'titan_sword_1', type: 'damage_bonus', value: 10, description: '近战伤害+10%' }
        ]
    },
    {
        id: 'artifact_shield_4',
        name: '永恒之盾',
        description: '传说中的不朽之盾，防御力惊人。',
        icon: 'shield_4',
        type: ArtifactType.SHIELD,
        slot: ArtifactSlot.OFF_HAND,
        rarity: ArtifactRarity.RELIC,
        sellPrice: 20000,
        buyPrice: 50000,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 8 }
        ],
        specialEffects: [
            { id: 'eternal_shield_1', type: 'damage_reduction', value: 5, description: '受到伤害-5%' }
        ]
    },
    {
        id: 'artifact_helmet_4',
        name: '智慧王冠',
        description: '传说中国王使用的王冠，蕴含无穷智慧。',
        icon: 'helmet_4',
        type: ArtifactType.HELMET,
        slot: ArtifactSlot.HELMET,
        rarity: ArtifactRarity.RELIC,
        sellPrice: 15000,
        buyPrice: 40000,
        stats: [
            { type: ArtifactStatType.KNOWLEDGE, value: 4 },
            { type: ArtifactStatType.POWER, value: 4 }
        ]
    },
    {
        id: 'artifact_armor_4',
        name: '泰坦甲',
        description: '传说中泰坦使用的神器盔甲，防御力无与伦比。',
        icon: 'armor_4',
        type: ArtifactType.ARMOR,
        slot: ArtifactSlot.ARMOR,
        rarity: ArtifactRarity.RELIC,
        sellPrice: 30000,
        buyPrice: 75000,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 8 },
            { type: ArtifactStatType.HP, value: 50 }
        ],
        specialEffects: [
            { id: 'titan_armor_1', type: 'hp_regen', value: 5, description: '每回合恢复5点生命' }
        ]
    },
    {
        id: 'artifact_ring_4',
        name: '魔法大师戒指',
        description: '魔法大师的传世之戒，蕴含无穷魔力。',
        icon: 'ring_4',
        type: ArtifactType.RING,
        slot: ArtifactSlot.RING_1,
        rarity: ArtifactRarity.RELIC,
        sellPrice: 15000,
        buyPrice: 40000,
        stats: [
            { type: ArtifactStatType.MANA, value: 50 },
            { type: ArtifactStatType.POWER, value: 3 }
        ]
    },
    {
        id: 'artifact_necklace_4',
        name: '真理项链',
        description: '蕴含真理力量的项链，智慧与力量并存。',
        icon: 'necklace_4',
        type: ArtifactType.NECKLACE,
        slot: ArtifactSlot.NECKLACE,
        rarity: ArtifactRarity.RELIC,
        sellPrice: 20000,
        buyPrice: 50000,
        stats: [
            { type: ArtifactStatType.KNOWLEDGE, value: 6 },
            { type: ArtifactStatType.POWER, value: 2 }
        ]
    },

    // ==================== 神器 (Artifact) ====================
    {
        id: 'artifact_sword_5',
        name: '末日之刃',
        description: '传说中的神器，拥有毁灭世界的力量。攻击力+12，近战伤害+20%。',
        icon: 'sword_5',
        type: ArtifactType.WEAPON,
        slot: ArtifactSlot.MAIN_HAND,
        rarity: ArtifactRarity.ARTIFACT,
        sellPrice: 100000,
        stats: [
            { type: ArtifactStatType.ATTACK, value: 12 }
        ],
        specialEffects: [
            { id: 'armageddon_blade_1', type: 'damage_bonus', value: 20, description: '近战伤害+20%' },
            { id: 'armageddon_blade_2', type: 'fire_damage', value: 50, description: '攻击附带50点火焰伤害' }
        ]
    },
    {
        id: 'artifact_armor_5',
        name: '永恒之甲',
        description: '传说中的神器，拥有不朽之力。防御力+12，生命值+100。',
        icon: 'armor_5',
        type: ArtifactType.ARMOR,
        slot: ArtifactSlot.ARMOR,
        rarity: ArtifactRarity.ARTIFACT,
        sellPrice: 100000,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 12 },
            { type: ArtifactStatType.HP, value: 100 }
        ],
        specialEffects: [
            { id: 'eternal_armor_1', type: 'damage_reduction', value: 15, description: '受到伤害-15%' },
            { id: 'eternal_armor_2', type: 'hp_regen', value: 10, description: '每回合恢复10点生命' }
        ]
    },
    {
        id: 'artifact_cloak_5',
        name: '天使之翼',
        description: '传说中的神器，天使的翅膀。力量+6，速度+5。',
        icon: 'cloak_5',
        type: ArtifactType.CLOAK,
        slot: ArtifactSlot.CLOAK,
        rarity: ArtifactRarity.ARTIFACT,
        sellPrice: 80000,
        stats: [
            { type: ArtifactStatType.POWER, value: 6 },
            { type: ArtifactStatType.SPEED, value: 5 }
        ],
        specialEffects: [
            { id: 'angel_wings_1', type: 'flight', value: 1, description: '可以飞行' }
        ]
    },

    // ==================== 特殊宝物 ====================
    {
        id: 'artifact_luck_clover',
        name: '幸运四叶草',
        description: '一片传说中的四叶草，带来好运。幸运+3。',
        icon: 'clover',
        type: ArtifactType.MISC,
        slot: ArtifactSlot.MISC_1,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 2000,
        buyPrice: 4000,
        stats: [
            { type: ArtifactStatType.LUCK, value: 3 }
        ]
    },
    {
        id: 'artifact_morale_banner',
        name: '军旗',
        description: '一面军旗，提升士气。士气+2。',
        icon: 'banner',
        type: ArtifactType.MISC,
        slot: ArtifactSlot.MISC_1,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 2500,
        buyPrice: 5000,
        stats: [
            { type: ArtifactStatType.MORALE, value: 2 }
        ]
    },
    {
        id: 'artifact_gold_purse',
        name: '黄金钱袋',
        description: '一个神奇的钱袋，增加金币收入。金币收入+10%。',
        icon: 'purse',
        type: ArtifactType.MISC,
        slot: ArtifactSlot.MISC_2,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 6000,
        buyPrice: 12000,
        stats: [
            { type: ArtifactStatType.GOLD_BONUS, value: 10, isPercent: true }
        ]
    },
    {
        id: 'artifact_exp_tome',
        name: '经验之书',
        description: '一本蕴含智慧的书，增加经验获取。经验获取+15%。',
        icon: 'tome',
        type: ArtifactType.MISC,
        slot: ArtifactSlot.MISC_2,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 8000,
        buyPrice: 16000,
        stats: [
            { type: ArtifactStatType.EXP_BONUS, value: 15, isPercent: true }
        ]
    },
    {
        id: 'artifact_ammo_bag',
        name: '无限弹药袋',
        description: '一个神奇的弹药袋，远程部队弹药无限。',
        icon: 'ammo_bag',
        type: ArtifactType.AMMO_BAG,
        slot: ArtifactSlot.AMMO_BAG,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 5000,
        buyPrice: 10000,
        stats: [],
        specialEffects: [
            { id: 'infinite_ammo', type: 'infinite_ammo', value: 1, description: '远程部队弹药无限' }
        ]
    },

    // ==================== 战争机器 ====================
    {
        id: 'artifact_ballista',
        name: '弩车',
        description: '战争机器，在战斗中提供远程火力支援。',
        icon: 'ballista',
        type: ArtifactType.WAR_MACHINE,
        slot: ArtifactSlot.WAR_MACHINE_BALLISTA,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 4000,
        buyPrice: 8000,
        stats: [],
        specialEffects: [
            { id: 'ballista_damage', type: 'war_machine_damage', value: 50, description: '弩车伤害50-75' }
        ]
    },
    {
        id: 'artifact_ammo_cart',
        name: '弹药车',
        description: '战争机器，为远程部队补充弹药。',
        icon: 'ammo_cart',
        type: ArtifactType.WAR_MACHINE,
        slot: ArtifactSlot.WAR_MACHINE_AMMO_CART,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 2000,
        buyPrice: 4000,
        stats: [],
        specialEffects: [
            { id: 'ammo_supply', type: 'ammo_supply', value: 1, description: '远程部队弹药+50%' }
        ]
    },
    {
        id: 'artifact_first_aid_tent',
        name: '医疗帐篷',
        description: '战争机器，在战斗中治疗受伤部队。',
        icon: 'first_aid_tent',
        type: ArtifactType.WAR_MACHINE,
        slot: ArtifactSlot.WAR_MACHINE_FIRST_AID_TENT,
        rarity: ArtifactRarity.MINOR,
        sellPrice: 1500,
        buyPrice: 3000,
        stats: [],
        specialEffects: [
            { id: 'heal', type: 'heal', value: 30, description: '每回合治疗30点生命' }
        ]
    },

    // ==================== 组合宝物 ====================
    {
        id: 'artifact_titan_set_sword',
        name: '泰坦剑组件',
        description: '泰坦之剑的组件之一。',
        icon: 'titan_component_1',
        type: ArtifactType.COMBINED_COMPONENT,
        slot: ArtifactSlot.MISC_1,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 3000,
        stats: [
            { type: ArtifactStatType.ATTACK, value: 2 }
        ],
        combinedArtifactId: 'artifact_sword_4'
    },
    {
        id: 'artifact_titan_set_helm',
        name: '泰坦盔组件',
        description: '泰坦盔甲的组件之一。',
        icon: 'titan_component_2',
        type: ArtifactType.COMBINED_COMPONENT,
        slot: ArtifactSlot.MISC_1,
        rarity: ArtifactRarity.MAJOR,
        sellPrice: 3000,
        stats: [
            { type: ArtifactStatType.DEFENSE, value: 2 }
        ],
        combinedArtifactId: 'artifact_armor_4'
    }
];

/** 获取宝物配置 */
export function getArtifactConfig(id: string): ArtifactConfig | undefined {
    return ARTIFACT_CONFIGS.find(config => config.id === id);
}

/** 获取指定稀有度的宝物列表 */
export function getArtifactsByRarity(rarity: ArtifactRarity): ArtifactConfig[] {
    return ARTIFACT_CONFIGS.filter(config => config.rarity === rarity);
}

/** 获取指定类型的宝物列表 */
export function getArtifactsByType(type: ArtifactType): ArtifactConfig[] {
    return ARTIFACT_CONFIGS.filter(config => config.type === type);
}

/** 获取指定槽位的宝物列表 */
export function getArtifactsBySlot(slot: ArtifactSlot): ArtifactConfig[] {
    return ARTIFACT_CONFIGS.filter(config => config.slot === slot);
}