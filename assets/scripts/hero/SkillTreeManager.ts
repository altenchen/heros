/**
 * 英雄技能树管理器
 * 管理技能树解锁、升级、重置等功能
 */

import { EventCenter } from '../utils/EventTarget';
import {
    SkillTreeBranch,
    SkillTreeNodeConfig,
    HeroSkillNodeState,
    HeroSkillTreeData,
    SkillTreeEventType,
    DEFAULT_SKILL_TREE_CONFIG
} from '../config/SkillTreeTypes';

/**
 * 英雄技能树管理器类
 */
export class SkillTreeManager {
    private static instance: SkillTreeManager | null = null;

    /** 技能树节点配置 */
    private nodeConfigs: Map<string, SkillTreeNodeConfig> = new Map();

    /** 英雄技能树数据 */
    private heroSkillTrees: Map<string, HeroSkillTreeData> = new Map();

    /** 是否已初始化 */
    private initialized: boolean = false;

    private constructor() {}

    /**
     * 获取单例
     */
    static getInstance(): SkillTreeManager {
        if (!SkillTreeManager.instance) {
            SkillTreeManager.instance = new SkillTreeManager();
        }
        return SkillTreeManager.instance;
    }

    /**
     * 初始化
     */
    init(): void {
        if (this.initialized) return;

        // 加载技能树配置
        this._loadSkillTreeConfig();

        this.initialized = true;
        console.log('[SkillTreeManager] 初始化完成');
    }

    /**
     * 加载技能树配置
     */
    private _loadSkillTreeConfig(): void {
        DEFAULT_SKILL_TREE_CONFIG.forEach(config => {
            this.nodeConfigs.set(config.id, config);
        });
    }

    /**
     * 获取节点配置
     */
    getNodeConfig(nodeId: string): SkillTreeNodeConfig | undefined {
        return this.nodeConfigs.get(nodeId);
    }

    /**
     * 获取所有节点配置
     */
    getAllNodeConfigs(): SkillTreeNodeConfig[] {
        return Array.from(this.nodeConfigs.values());
    }

    /**
     * 获取分支节点
     */
    getBranchNodes(branch: SkillTreeBranch): SkillTreeNodeConfig[] {
        return Array.from(this.nodeConfigs.values())
            .filter(config => config.branch === branch)
            .sort((a, b) => a.tier - b.tier || a.position - b.position);
    }

    /**
     * 初始化英雄技能树
     */
    initHeroSkillTree(heroId: string): HeroSkillTreeData {
        let data = this.heroSkillTrees.get(heroId);
        if (data) return data;

        // 创建新的技能树数据
        data = {
            heroId,
            skillPoints: 0,
            nodes: Array.from(this.nodeConfigs.values()).map(config => ({
                nodeId: config.id,
                level: 0,
                unlocked: false
            }))
        };

        // 解锁第一层的技能（自动解锁）
        this._unlockFirstTier(data);

        this.heroSkillTrees.set(heroId, data);
        return data;
    }

    /**
     * 自动解锁第一层技能
     */
    private _unlockFirstTier(data: HeroSkillTreeData): void {
        data.nodes.forEach(node => {
            const config = this.nodeConfigs.get(node.nodeId);
            if (config && config.tier === 1 && config.prerequisites.length === 0) {
                node.unlocked = true;
            }
        });
    }

    /**
     * 获取英雄技能树数据
     */
    getHeroSkillTree(heroId: string): HeroSkillTreeData | undefined {
        return this.heroSkillTrees.get(heroId);
    }

    /**
     * 获取技能点
     */
    getSkillPoints(heroId: string): number {
        const data = this.heroSkillTrees.get(heroId);
        return data?.skillPoints || 0;
    }

    /**
     * 添加技能点
     */
    addSkillPoints(heroId: string, amount: number): void {
        const data = this.heroSkillTrees.get(heroId);
        if (data) {
            data.skillPoints += amount;
            EventCenter.emit(SkillTreeEventType.SKILL_POINTS_CHANGED, {
                heroId,
                skillPoints: data.skillPoints
            });
        }
    }

    /**
     * 检查是否可以解锁技能
     */
    canUnlockSkill(heroId: string, nodeId: string): { canUnlock: boolean; reason?: string } {
        const data = this.heroSkillTrees.get(heroId);
        if (!data) {
            return { canUnlock: false, reason: '英雄技能树未初始化' };
        }

        const nodeState = data.nodes.find(n => n.nodeId === nodeId);
        if (!nodeState) {
            return { canUnlock: false, reason: '技能节点不存在' };
        }

        if (nodeState.unlocked) {
            return { canUnlock: false, reason: '技能已解锁' };
        }

        const config = this.nodeConfigs.get(nodeId);
        if (!config) {
            return { canUnlock: false, reason: '技能配置不存在' };
        }

        // 检查前置技能
        for (const prereqId of config.prerequisites) {
            const prereqNode = data.nodes.find(n => n.nodeId === prereqId);
            if (!prereqNode || !prereqNode.unlocked) {
                return { canUnlock: false, reason: '前置技能未解锁' };
            }
        }

        // 检查解锁条件
        if (config.unlockConditions) {
            for (const condition of config.unlockConditions) {
                const checkResult = this._checkUnlockCondition(heroId, condition);
                if (!checkResult.passed) {
                    return { canUnlock: false, reason: checkResult.reason };
                }
            }
        }

        return { canUnlock: true };
    }

    /**
     * 检查解锁条件
     */
    private _checkUnlockCondition(
        heroId: string,
        condition: { type: string; value: number | string }
    ): { passed: boolean; reason?: string } {
        switch (condition.type) {
            case 'hero_level':
                // TODO: 获取英雄等级
                // const heroLevel = heroManager.getHeroLevel(heroId);
                // if (heroLevel < condition.value) {
                //     return { passed: false, reason: `需要英雄等级 ${condition.value}` };
                // }
                return { passed: true };

            case 'skill_points':
                const data = this.heroSkillTrees.get(heroId);
                if (!data || data.skillPoints < (condition.value as number)) {
                    return { passed: false, reason: `需要 ${condition.value} 技能点` };
                }
                return { passed: true };

            default:
                return { passed: true };
        }
    }

    /**
     * 解锁技能
     */
    unlockSkill(heroId: string, nodeId: string): boolean {
        const checkResult = this.canUnlockSkill(heroId, nodeId);
        if (!checkResult.canUnlock) {
            console.warn(`[SkillTreeManager] 无法解锁技能: ${checkResult.reason}`);
            return false;
        }

        const data = this.heroSkillTrees.get(heroId);
        if (!data) return false;

        const nodeState = data.nodes.find(n => n.nodeId === nodeId);
        if (!nodeState) return false;

        nodeState.unlocked = true;
        nodeState.level = 1;

        EventCenter.emit(SkillTreeEventType.SKILL_UNLOCKED, {
            heroId,
            nodeId,
            level: 1
        });

        console.log(`[SkillTreeManager] 技能解锁: ${nodeId}`);
        return true;
    }

    /**
     * 检查是否可以升级技能
     */
    canUpgradeSkill(heroId: string, nodeId: string): { canUpgrade: boolean; reason?: string } {
        const data = this.heroSkillTrees.get(heroId);
        if (!data) {
            return { canUpgrade: false, reason: '英雄技能树未初始化' };
        }

        const nodeState = data.nodes.find(n => n.nodeId === nodeId);
        if (!nodeState) {
            return { canUpgrade: false, reason: '技能节点不存在' };
        }

        if (!nodeState.unlocked) {
            return { canUpgrade: false, reason: '技能未解锁' };
        }

        const config = this.nodeConfigs.get(nodeId);
        if (!config) {
            return { canUpgrade: false, reason: '技能配置不存在' };
        }

        if (nodeState.level >= config.maxLevel) {
            return { canUpgrade: false, reason: '已达最高等级' };
        }

        if (data.skillPoints <= 0) {
            return { canUpgrade: false, reason: '技能点不足' };
        }

        return { canUpgrade: true };
    }

    /**
     * 升级技能
     */
    upgradeSkill(heroId: string, nodeId: string): boolean {
        const checkResult = this.canUpgradeSkill(heroId, nodeId);
        if (!checkResult.canUpgrade) {
            console.warn(`[SkillTreeManager] 无法升级技能: ${checkResult.reason}`);
            return false;
        }

        const data = this.heroSkillTrees.get(heroId);
        if (!data) return false;

        const nodeState = data.nodes.find(n => n.nodeId === nodeId);
        if (!nodeState) return false;

        nodeState.level++;
        data.skillPoints--;

        EventCenter.emit(SkillTreeEventType.SKILL_UPGRADED, {
            heroId,
            nodeId,
            level: nodeState.level,
            skillPoints: data.skillPoints
        });

        console.log(`[SkillTreeManager] 技能升级: ${nodeId} -> Lv.${nodeState.level}`);
        return true;
    }

    /**
     * 获取技能等级
     */
    getSkillLevel(heroId: string, nodeId: string): number {
        const data = this.heroSkillTrees.get(heroId);
        if (!data) return 0;

        const nodeState = data.nodes.find(n => n.nodeId === nodeId);
        return nodeState?.level || 0;
    }

    /**
     * 检查技能是否已解锁
     */
    isSkillUnlocked(heroId: string, nodeId: string): boolean {
        const data = this.heroSkillTrees.get(heroId);
        if (!data) return false;

        const nodeState = data.nodes.find(n => n.nodeId === nodeId);
        return nodeState?.unlocked || false;
    }

    /**
     * 获取英雄已解锁的技能ID列表
     */
    getUnlockedSkillIds(heroId: string): string[] {
        const data = this.heroSkillTrees.get(heroId);
        if (!data) return [];

        return data.nodes
            .filter(node => node.unlocked && node.level > 0)
            .map(node => {
                const config = this.nodeConfigs.get(node.nodeId);
                return config?.skillId || '';
            })
            .filter(id => id !== '');
    }

    /**
     * 重置技能树
     */
    resetSkillTree(heroId: string): number {
        const data = this.heroSkillTrees.get(heroId);
        if (!data) return 0;

        let refundedPoints = 0;

        // 计算返还的技能点
        data.nodes.forEach(node => {
            refundedPoints += node.level;
            node.level = 0;
            node.unlocked = false;
        });

        // 重新解锁第一层
        this._unlockFirstTier(data);

        // 返还技能点
        data.skillPoints += refundedPoints;

        console.log(`[SkillTreeManager] 技能树重置: 返还 ${refundedPoints} 技能点`);
        return refundedPoints;
    }

    /**
     * 获取分支完成进度
     */
    getBranchProgress(heroId: string, branch: SkillTreeBranch): {
        total: number;
        unlocked: number;
        completed: boolean;
    } {
        const data = this.heroSkillTrees.get(heroId);
        const branchNodes = this.getBranchNodes(branch);

        let unlocked = 0;
        branchNodes.forEach(config => {
            const nodeState = data?.nodes.find(n => n.nodeId === config.id);
            if (nodeState?.unlocked && nodeState.level >= config.maxLevel) {
                unlocked++;
            }
        });

        return {
            total: branchNodes.length,
            unlocked,
            completed: unlocked === branchNodes.length
        };
    }

    /**
     * 序列化
     */
    serialize(heroId: string): string {
        const data = this.heroSkillTrees.get(heroId);
        return JSON.stringify(data);
    }

    /**
     * 反序列化
     */
    deserialize(heroId: string, json: string): void {
        try {
            const data = JSON.parse(json) as HeroSkillTreeData;
            this.heroSkillTrees.set(heroId, data);
        } catch (e) {
            console.error('[SkillTreeManager] 反序列化失败:', e);
        }
    }

    /**
     * 获取所有技能树数据（用于存档）
     */
    getSaveData(): Record<string, HeroSkillTreeData> {
        const result: Record<string, HeroSkillTreeData> = {};
        this.heroSkillTrees.forEach((data, heroId) => {
            result[heroId] = data;
        });
        return result;
    }

    /**
     * 加载所有技能树数据（用于读档）
     */
    loadSaveData(data: Record<string, HeroSkillTreeData>): void {
        this.heroSkillTrees.clear();
        if (data) {
            Object.entries(data).forEach(([heroId, heroData]) => {
                this.heroSkillTrees.set(heroId, heroData);
            });
        }
    }

    /**
     * 清理
     */
    cleanup(): void {
        this.heroSkillTrees.clear();
        this.initialized = false;
        SkillTreeManager.instance = null;
    }
}

/** 技能树管理器单例 */
export const skillTreeManager = SkillTreeManager.getInstance();