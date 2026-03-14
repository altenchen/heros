/**
 * 宝物类型定义
 * 英雄无敌3宝物系统
 */

/** 宝物槽位 */
export enum ArtifactSlot {
    /** 主武器 */
    MAIN_HAND = 'main_hand',
    /** 副武器 */
    OFF_HAND = 'off_hand',
    /** 头盔 */
    HELMET = 'helmet',
    /** 盔甲 */
    ARMOR = 'armor',
    /** 斗篷 */
    CLOAK = 'cloak',
    /** 靴子 */
    BOOTS = 'boots',
    /** 项链 */
    NECKLACE = 'necklace',
    /** 戒指1 */
    RING_1 = 'ring_1',
    /** 戒指2 */
    RING_2 = 'ring_2',
    /** 弹药袋 */
    AMMO_BAG = 'ammo_bag',
    /** 杂项1 */
    MISC_1 = 'misc_1',
    /** 杂项2 */
    MISC_2 = 'misc_2',
    /** 战争机器 - 弩车 */
    WAR_MACHINE_BALLISTA = 'war_machine_ballista',
    /** 战争机器 - 弹药车 */
    WAR_MACHINE_AMMO_CART = 'war_machine_ammo_cart',
    /** 战争机器 - 医疗帐篷 */
    WAR_MACHINE_FIRST_AID_TENT = 'war_machine_first_aid_tent',
    /** 指挥官装备 */
    COMMANDER = 'commander'
}

/** 宝物稀有度 */
export enum ArtifactRarity {
    /** 普通 (Treasure) */
    COMMON = 'common',
    /** 稀有 (Minor) */
    MINOR = 'minor',
    /** 史诗 (Major) */
    MAJOR = 'major',
    /** 传说 (Relic) */
    RELIC = 'relic',
    /** 神器 (Artifact) */
    ARTIFACT = 'artifact',
    /** 组合宝物 */
    COMBINED = 'combined'
}

/** 宝物类型 */
export enum ArtifactType {
    /** 武器 */
    WEAPON = 'weapon',
    /** 盾牌 */
    SHIELD = 'shield',
    /** 头盔 */
    HELMET = 'helmet',
    /** 盔甲 */
    ARMOR = 'armor',
    /** 斗篷 */
    CLOAK = 'cloak',
    /** 靴子 */
    BOOTS = 'boots',
    /** 项链 */
    NECKLACE = 'necklace',
    /** 戒指 */
    RING = 'ring',
    /** 弹药袋 */
    AMMO_BAG = 'ammo_bag',
    /** 杂项 */
    MISC = 'misc',
    /** 战争机器 */
    WAR_MACHINE = 'war_machine',
    /** 指挥官装备 */
    COMMANDER = 'commander',
    /** 组合宝物组件 */
    COMBINED_COMPONENT = 'combined_component'
}

/** 属性类型 */
export enum ArtifactStatType {
    /** 攻击力 */
    ATTACK = 'attack',
    /** 防御力 */
    DEFENSE = 'defense',
    /** 力量 */
    POWER = 'power',
    /** 知识 */
    KNOWLEDGE = 'knowledge',
    /** 生命值 */
    HP = 'hp',
    /** 速度 */
    SPEED = 'speed',
    /** 幸运 */
    LUCK = 'luck',
    /** 士气 */
    MORALE = 'morale',
    /** 魔法值 */
    MANA = 'mana',
    /** 经验加成 */
    EXP_BONUS = 'exp_bonus',
    /** 金币加成 */
    GOLD_BONUS = 'gold_bonus',
    /** 施法次数 */
    SPELL_CASTS = 'spell_casts',
    /** 远程伤害 */
    RANGED_DAMAGE = 'ranged_damage',
    /** 近战伤害 */
    MELEE_DAMAGE = 'melee_damage',
    /** 魔法抗性 */
    MAGIC_RESISTANCE = 'magic_resistance'
}

/** 宝物属性效果 */
export interface ArtifactStat {
    type: ArtifactStatType;
    value: number;
    /** 是否为百分比加成 */
    isPercent?: boolean;
}

/** 宝物特殊效果 */
export interface ArtifactSpecialEffect {
    /** 效果ID */
    id: string;
    /** 效果类型 */
    type: string;
    /** 效果值 */
    value: number;
    /** 效果描述 */
    description: string;
}

/** 宝物配置 */
export interface ArtifactConfig {
    /** 宝物ID */
    id: string;
    /** 宝物名称 */
    name: string;
    /** 宝物描述 */
    description: string;
    /** 宝物图标 */
    icon: string;
    /** 宝物类型 */
    type: ArtifactType;
    /** 宝物槽位 */
    slot: ArtifactSlot;
    /** 稀有度 */
    rarity: ArtifactRarity;
    /** 需要等级 */
    requiredLevel?: number;
    /** 出售价格 */
    sellPrice: number;
    /** 购买价格 */
    buyPrice?: number;
    /** 属性加成 */
    stats: ArtifactStat[];
    /** 特殊效果 */
    specialEffects?: ArtifactSpecialEffect[];
    /** 组合宝物ID（如果是组件） */
    combinedArtifactId?: string;
    /** 组件宝物ID列表（如果是组合宝物） */
    componentIds?: string[];
    /** 种族限制 */
    factionRestriction?: string;
    /** 英雄限制 */
    heroRestriction?: string[];
    /** 是否可堆叠 */
    stackable?: boolean;
    /** 最大堆叠数量 */
    maxStack?: number;
}

/** 宝物实例数据 */
export interface ArtifactData {
    /** 实例ID */
    instanceId: string;
    /** 宝物ID */
    artifactId: string;
    /** 数量 */
    count: number;
    /** 获取时间 */
    obtainedTime: number;
    /** 强化等级 */
    enhanceLevel?: number;
    /** 附加属性 */
    extraStats?: ArtifactStat[];
}

/** 英雄装备数据 */
export interface HeroEquipment {
    /** 英雄ID */
    heroId: string;
    /** 装备槽位映射 */
    slots: Map<ArtifactSlot, ArtifactData | null>;
    /** 装备属性缓存 */
    statsCache: Map<ArtifactStatType, number>;
}

/** 宝物事件类型 */
export enum ArtifactEventType {
    /** 获得宝物 */
    ARTIFACT_OBTAINED = 'artifact_obtained',
    /** 装备宝物 */
    ARTIFACT_EQUIPPED = 'artifact_equipped',
    /** 卸下宝物 */
    ARTIFACT_UNEQUIPPED = 'artifact_unequipped',
    /** 出售宝物 */
    ARTIFACT_SOLD = 'artifact_sold',
    /** 强化宝物 */
    ARTIFACT_ENHANCED = 'artifact_enhanced',
    /** 组合宝物完成 */
    ARTIFACT_COMBINED = 'artifact_combined',
    /** 装备属性变化 */
    EQUIPMENT_STATS_CHANGED = 'equipment_stats_changed'
}

/** 宝物获取来源 */
export enum ArtifactSource {
    /** 战斗掉落 */
    BATTLE_DROP = 'battle_drop',
    /** 关卡奖励 */
    LEVEL_REWARD = 'level_reward',
    /** 商店购买 */
    SHOP_PURCHASE = 'shop_purchase',
    /** 活动奖励 */
    ACTIVITY_REWARD = 'activity_reward',
    /** 任务奖励 */
    TASK_REWARD = 'task_reward',
    /** 合成 */
    CRAFTING = 'crafting',
    /** 其他 */
    OTHER = 'other'
}

/** 装备结果 */
export interface EquipResult {
    success: boolean;
    error?: string;
    unequippedArtifact?: ArtifactData;
}

/** 宝物筛选条件 */
export interface ArtifactFilter {
    /** 宝物类型 */
    type?: ArtifactType;
    /** 稀有度 */
    rarity?: ArtifactRarity;
    /** 槽位 */
    slot?: ArtifactSlot;
    /** 最小等级 */
    minLevel?: number;
    /** 最大等级 */
    maxLevel?: number;
    /** 是否已装备 */
    equipped?: boolean;
}

/** 宝物排序方式 */
export enum ArtifactSortType {
    /** 按稀有度 */
    RARITY = 'rarity',
    /** 按名称 */
    NAME = 'name',
    /** 按获取时间 */
    OBTAINED_TIME = 'obtained_time',
    /** 按价格 */
    PRICE = 'price'
}