/**
 * 战争机器类型定义
 * 英雄无敌III经典系统：弩车、医疗帐篷、弹药车、投石车
 */

/**
 * 战争机器类型
 */
export enum WarMachineType {
    /** 弩车 - 远程攻击 */
    BALLISTA = 'ballista',
    /** 医疗帐篷 - 治疗友军 */
    FIRST_AID_TENT = 'first_aid_tent',
    /** 弹药车 - 增加远程单位弹药 */
    AMMO_CART = 'ammo_cart',
    /** 投石车 - 攻城 */
    CATAPULT = 'catapult'
}

/**
 * 战争机器稀有度
 */
export enum WarMachineRarity {
    NORMAL = 'normal',
    RARE = 'rare',
    EPIC = 'epic',
    LEGENDARY = 'legendary'
}

/**
 * 战争机器配置
 */
export interface WarMachineConfig {
    /** 战争机器ID */
    id: string;
    /** 名称 */
    name: string;
    /** 类型 */
    type: WarMachineType;
    /** 稀有度 */
    rarity: WarMachineRarity;
    /** 购买价格 */
    cost: number;
    /** 基础属性 */
    stats: {
        /** 攻击力（弩车/投石车） */
        attack?: number;
        /** 防御力 */
        defense?: number;
        /** 生命值 */
        hp?: number;
        /** 治疗量（医疗帐篷） */
        healAmount?: number;
        /** 弹药加成（弹药车） */
        ammoBonus?: number;
        /** 攻击次数 */
        shots?: number;
    };
    /** 成长属性（每级增加） */
    growth: {
        attack?: number;
        defense?: number;
        hp?: number;
        healAmount?: number;
        ammoBonus?: number;
    };
    /** 图标 */
    icon: string;
    /** 描述 */
    description: string;
}

/**
 * 战争机器实例
 */
export interface WarMachineInstance {
    /** 实例ID */
    instanceId: string;
    /** 配置ID */
    configId: string;
    /** 等级 */
    level: number;
    /** 当前生命值 */
    currentHp: number;
    /** 最大生命值 */
    maxHp: number;
    /** 是否已装备 */
    equipped: boolean;
    /** 装备的英雄ID */
    heroId?: string;
}

/**
 * 战争机器战斗状态
 */
export interface WarMachineBattleState {
    /** 实例ID */
    instanceId: string;
    /** 配置ID */
    configId: string;
    /** 类型 */
    type: WarMachineType;
    /** 当前生命值 */
    currentHp: number;
    /** 最大生命值 */
    maxHp: number;
    /** 攻击力 */
    attack: number;
    /** 防御力 */
    defense: number;
    /** 剩余弹药/次数 */
    shotsRemaining: number;
    /** 是否已行动 */
    hasActed: boolean;
    /** 位置（战场位置） */
    position?: { x: number; y: number };
}

/**
 * 战争机器事件类型
 */
export enum WarMachineEventType {
    /** 获得战争机器 */
    OBTAINED = 'war_machine_obtained',
    /** 升级 */
    UPGRADED = 'war_machine_upgraded',
    /** 装备 */
    EQUIPPED = 'war_machine_equipped',
    /** 卸下 */
    UNEQUIPPED = 'war_machine_unequipped',
    /** 战斗中行动 */
    BATTLE_ACTION = 'war_machine_battle_action',
    /** 战斗中受损 */
    BATTLE_DAMAGED = 'war_machine_battle_damaged',
    /** 战斗中修复 */
    BATTLE_REPAIRED = 'war_machine_battle_repaired',
    /** 出售 */
    SOLD = 'war_machine_sold'
}

/**
 * 战争机器行动结果
 */
export interface WarMachineActionResult {
    /** 是否成功 */
    success: boolean;
    /** 行动类型 */
    actionType: 'attack' | 'heal' | 'support';
    /** 目标ID列表 */
    targetIds?: string[];
    /** 造成的伤害 */
    damage?: number;
    /** 治疗量 */
    healAmount?: number;
    /** 消耗的弹药 */
    shotsUsed?: number;
}

/**
 * 战争机器存档数据
 */
export interface WarMachineSaveData {
    /** 拥有的战争机器 */
    machines: WarMachineInstance[];
    /** 英雄装备映射 */
    heroEquipments: Record<string, string[]>; // heroId -> instanceId[]
}