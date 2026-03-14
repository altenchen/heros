/**
 * 英雄技能树类型定义
 * 支持多分支技能树、技能解锁、技能升级
 */

import { MagicSchool } from './GameTypes';

/**
 * 技能树分支
 */
export enum SkillTreeBranch {
    /** 火系 */
    FIRE = 'fire',
    /** 水系 */
    WATER = 'water',
    /** 土系 */
    EARTH = 'earth',
    /** 气系 */
    AIR = 'air',
    /** 战斗 */
    COMBAT = 'combat',
    /** 领导 */
    LEADERSHIP = 'leadership'
}

/**
 * 技能树节点配置
 */
export interface SkillTreeNodeConfig {
    /** 节点ID */
    id: string;
    /** 技能ID（对应的技能配置） */
    skillId: string;
    /** 节点名称 */
    name: string;
    /** 描述 */
    description: string;
    /** 所属分支 */
    branch: SkillTreeBranch;
    /** 层级（从1开始） */
    tier: number;
    /** 位置（同一层级的位置） */
    position: number;
    /** 前置技能ID列表 */
    prerequisites: string[];
    /** 解锁条件 */
    unlockConditions?: SkillUnlockCondition[];
    /** 最大等级 */
    maxLevel: number;
    /** 每级效果加成 */
    levelScaling?: {
        /** 每级伤害加成 */
        damageBonus?: number;
        /** 每级持续时间加成 */
        durationBonus?: number;
        /** 每级冷却减少 */
        cooldownReduction?: number;
    };
    /** 图标 */
    icon?: string;
}

/**
 * 技能解锁条件
 */
export interface SkillUnlockCondition {
    /** 条件类型 */
    type: 'hero_level' | 'skill_points' | 'previous_skills' | 'quest';
    /** 所需值 */
    value: number | string;
}

/**
 * 英雄技能节点状态
 */
export interface HeroSkillNodeState {
    /** 节点ID */
    nodeId: string;
    /** 当前等级 */
    level: number;
    /** 是否已解锁 */
    unlocked: boolean;
}

/**
 * 英雄技能树数据
 */
export interface HeroSkillTreeData {
    /** 英雄ID */
    heroId: string;
    /** 技能点 */
    skillPoints: number;
    /** 已解锁的技能节点 */
    nodes: HeroSkillNodeState[];
}

/**
 * 技能树事件类型
 */
export enum SkillTreeEventType {
    /** 技能解锁 */
    SKILL_UNLOCKED = 'skill_unlocked',
    /** 技能升级 */
    SKILL_UPGRADED = 'skill_upgraded',
    /** 技能点变化 */
    SKILL_POINTS_CHANGED = 'skill_points_changed',
    /** 分支完成 */
    BRANCH_COMPLETED = 'branch_completed'
}

/**
 * 默认技能树配置
 */
export const DEFAULT_SKILL_TREE_CONFIG: SkillTreeNodeConfig[] = [
    // ==================== 火系分支 ====================
    {
        id: 'fire_1_1',
        skillId: 'skill_fireball',
        name: '火球术',
        description: '发射火球造成范围伤害',
        branch: SkillTreeBranch.FIRE,
        tier: 1,
        position: 1,
        prerequisites: [],
        maxLevel: 5,
        levelScaling: {
            damageBonus: 10
        },
        icon: 'icon_fireball'
    },
    {
        id: 'fire_1_2',
        skillId: 'skill_bloodlust',
        name: '嗜血术',
        description: '增加友军攻击力',
        branch: SkillTreeBranch.FIRE,
        tier: 1,
        position: 2,
        prerequisites: [],
        maxLevel: 3,
        levelScaling: {
            durationBonus: 1
        },
        icon: 'icon_bloodlust'
    },
    {
        id: 'fire_2_1',
        skillId: 'skill_fire_wall',
        name: '火墙术',
        description: '创建持续燃烧的火墙',
        branch: SkillTreeBranch.FIRE,
        tier: 2,
        position: 1,
        prerequisites: ['fire_1_1'],
        maxLevel: 3,
        icon: 'icon_fire_wall'
    },
    {
        id: 'fire_3_1',
        skillId: 'skill_armageddon',
        name: '末日审判',
        description: '对所有敌人造成毁灭性伤害',
        branch: SkillTreeBranch.FIRE,
        tier: 3,
        position: 1,
        prerequisites: ['fire_2_1'],
        unlockConditions: [{ type: 'hero_level', value: 20 }],
        maxLevel: 1,
        icon: 'icon_armageddon'
    },

    // ==================== 水系分支 ====================
    {
        id: 'water_1_1',
        skillId: 'skill_bless',
        name: '祝福术',
        description: '使友军伤害最大化',
        branch: SkillTreeBranch.WATER,
        tier: 1,
        position: 1,
        prerequisites: [],
        maxLevel: 3,
        icon: 'icon_bless'
    },
    {
        id: 'water_1_2',
        skillId: 'skill_cure',
        name: '治疗术',
        description: '治疗友军并驱散负面效果',
        branch: SkillTreeBranch.WATER,
        tier: 1,
        position: 2,
        prerequisites: [],
        maxLevel: 5,
        levelScaling: {
            damageBonus: 5
        },
        icon: 'icon_cure'
    },
    {
        id: 'water_2_1',
        skillId: 'skill_frost_ring',
        name: '霜环术',
        description: '创建霜环造成伤害',
        branch: SkillTreeBranch.WATER,
        tier: 2,
        position: 1,
        prerequisites: ['water_1_1', 'water_1_2'],
        maxLevel: 3,
        icon: 'icon_frost_ring'
    },

    // ==================== 战斗分支 ====================
    {
        id: 'combat_1_1',
        skillId: 'skill_tactics',
        name: '战术',
        description: '提高部队初始部署范围',
        branch: SkillTreeBranch.COMBAT,
        tier: 1,
        position: 1,
        prerequisites: [],
        maxLevel: 3,
        icon: 'icon_tactics'
    },
    {
        id: 'combat_1_2',
        skillId: 'skill_archery',
        name: '箭术',
        description: '提高远程单位伤害',
        branch: SkillTreeBranch.COMBAT,
        tier: 1,
        position: 2,
        prerequisites: [],
        maxLevel: 3,
        levelScaling: {
            damageBonus: 5
        },
        icon: 'icon_archery'
    },
    {
        id: 'combat_2_1',
        skillId: 'skill_leadership',
        name: '领导力',
        description: '提高部队士气',
        branch: SkillTreeBranch.COMBAT,
        tier: 2,
        position: 1,
        prerequisites: ['combat_1_1', 'combat_1_2'],
        maxLevel: 3,
        icon: 'icon_leadership'
    }
];