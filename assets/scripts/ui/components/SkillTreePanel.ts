/**
 * 技能树面板
 * 显示英雄技能树、技能解锁升级
 */

import { _decorator, Node, Label, Button, Sprite, Color, tween, Vec3, ScrollView } from 'cc';
import { UIPanel, PanelConfig } from './UIPanel';
import { skillTreeManager } from '../../hero/SkillTreeManager';
import {
    SkillTreeBranch,
    SkillTreeNodeConfig,
    HeroSkillNodeState,
    SkillTreeEventType
} from '../../config/SkillTreeTypes';
import { soundManager } from '../../audio';
import { UIManager } from '../UIManager';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/**
 * 技能节点UI项
 */
interface SkillNodeUI {
    config: SkillTreeNodeConfig;
    state: HeroSkillNodeState;
    node: Node;
}

/**
 * 技能树面板组件
 */
@ccclass('SkillTreePanel')
export class SkillTreePanel extends UIPanel {
    /** 英雄ID标签 */
    @property(Label)
    heroIdLabel: Label | null = null;

    /** 技能点标签 */
    @property(Label)
    skillPointsLabel: Label | null = null;

    /** 分支按钮容器 */
    @property(Node)
    branchContainer: Node | null = null;

    /** 技能树容器 */
    @property(Node)
    skillTreeContainer: Node | null = null;

    /** 技能节点模板 */
    @property(Node)
    skillNodeTemplate: Node | null = null;

    /** 技能详情面板 */
    @property(Node)
    detailPanel: Node | null = null;

    /** 详情技能名称 */
    @property(Label)
    detailNameLabel: Label | null = null;

    /** 详情技能描述 */
    @property(Label)
    detailDescLabel: Label | null = null;

    /** 详情技能等级 */
    @property(Label)
    detailLevelLabel: Label | null = null;

    /** 解锁按钮 */
    @property(Button)
    unlockButton: Button | null = null;

    /** 升级按钮 */
    @property(Button)
    upgradeButton: Button | null = null;

    /** 重置按钮 */
    @property(Button)
    resetButton: Button | null = null;

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    /** 当前英雄ID */
    private _heroId: string = '';

    /** 当前选择的分支 */
    private _currentBranch: SkillTreeBranch = SkillTreeBranch.FIRE;

    /** 技能节点UI列表 */
    private _skillNodes: SkillNodeUI[] = [];

    /** 当前选中的节点ID */
    private _selectedNodeId: string = '';

    /**
     * 面板配置
     */
    static getPanelConfig(): PanelConfig {
        return {
            layer: 2, // NORMAL层
            animation: 'fade',
            showMask: false,
            closeOnMask: false
        };
    }

    /**
     * 组件加载
     */
    onLoad(): void {
        super.onLoad?.();

        // 绑定按钮事件
        if (this.unlockButton) {
            this.unlockButton.node.on(Button.EventType.CLICK, this._onUnlockClick, this);
        }

        if (this.upgradeButton) {
            this.upgradeButton.node.on(Button.EventType.CLICK, this._onUpgradeClick, this);
        }

        if (this.resetButton) {
            this.resetButton.node.on(Button.EventType.CLICK, this._onResetClick, this);
        }

        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this._onCloseClick, this);
        }
    }

    /**
     * 设置面板数据
     */
    setData(data: { heroId: string }): void {
        if (data?.heroId) {
            this._heroId = data.heroId;
        }
    }

    /**
     * 组件启动
     */
    start(): void {
        this._initSkillTree();
        this._setupEventListeners();
        this._createBranchButtons();
        this._loadBranch(this._currentBranch);
    }

    /**
     * 设置事件监听
     */
    private _setupEventListeners(): void {
        EventCenter.on(SkillTreeEventType.SKILL_UNLOCKED, this._onSkillUnlocked, this);
        EventCenter.on(SkillTreeEventType.SKILL_UPGRADED, this._onSkillUpgraded, this);
        EventCenter.on(SkillTreeEventType.SKILL_POINTS_CHANGED, this._onSkillPointsChanged, this);
    }

    /**
     * 移除事件监听
     */
    private _removeEventListeners(): void {
        EventCenter.off(SkillTreeEventType.SKILL_UNLOCKED, this._onSkillUnlocked, this);
        EventCenter.off(SkillTreeEventType.SKILL_UPGRADED, this._onSkillUpgraded, this);
        EventCenter.off(SkillTreeEventType.SKILL_POINTS_CHANGED, this._onSkillPointsChanged, this);
    }

    /**
     * 初始化技能树
     */
    private _initSkillTree(): void {
        skillTreeManager.initHeroSkillTree(this._heroId);
        this._updateSkillPointsUI();
    }

    /**
     * 创建分支按钮
     */
    private _createBranchButtons(): void {
        if (!this.branchContainer) return;

        const branches = [
            { branch: SkillTreeBranch.FIRE, name: '火系', color: Color.RED },
            { branch: SkillTreeBranch.WATER, name: '水系', color: Color.BLUE },
            { branch: SkillTreeBranch.EARTH, name: '土系', color: Color.YELLOW },
            { branch: SkillTreeBranch.AIR, name: '气系', color: Color.CYAN },
            { branch: SkillTreeBranch.COMBAT, name: '战斗', color: Color.ORANGE },
            { branch: SkillTreeBranch.LEADERSHIP, name: '领导', color: Color.MAGENTA }
        ];

        // 清除现有按钮
        this.branchContainer.removeAllChildren();

        branches.forEach(item => {
            const btn = new Node(`Branch_${item.branch}`);
            btn.addComponent(Button);

            const label = btn.addComponent(Label);
            label.string = item.name;
            label.color = this._currentBranch === item.branch ? Color.WHITE : item.color;
            label.fontSize = 20;

            btn.on(Button.EventType.CLICK, () => {
                this._loadBranch(item.branch);
            }, this);

            this.branchContainer!.addChild(btn);
        });
    }

    /**
     * 加载分支技能树
     */
    private _loadBranch(branch: SkillTreeBranch): void {
        this._currentBranch = branch;
        this._createSkillNodes();
        this._createBranchButtons(); // 更新选中状态
    }

    /**
     * 创建技能节点
     */
    private _createSkillNodes(): void {
        if (!this.skillTreeContainer || !this.skillNodeTemplate) return;

        // 隐藏模板
        this.skillNodeTemplate.active = false;

        // 清除现有节点
        this.skillTreeContainer.removeAllChildren();
        this._skillNodes = [];

        // 获取分支节点配置
        const branchNodes = skillTreeManager.getBranchNodes(this._currentBranch);
        const skillTreeData = skillTreeManager.getHeroSkillTree(this._heroId);

        // 按层级分组
        const tierGroups = new Map<number, SkillTreeNodeConfig[]>();
        branchNodes.forEach(config => {
            if (!tierGroups.has(config.tier)) {
                tierGroups.set(config.tier, []);
            }
            tierGroups.get(config.tier)!.push(config);
        });

        // 创建节点
        tierGroups.forEach((configs, tier) => {
            configs.forEach((config, position) => {
                const state = skillTreeData?.nodes.find(n => n.nodeId === config.id) || {
                    nodeId: config.id,
                    level: 0,
                    unlocked: false
                };

                const node = this._createSkillNode(config, state);
                if (node) {
                    this.skillTreeContainer!.addChild(node);
                    this._skillNodes.push({ config, state, node });
                }
            });
        });
    }

    /**
     * 创建单个技能节点
     */
    private _createSkillNode(
        config: SkillTreeNodeConfig,
        state: HeroSkillNodeState
    ): Node | null {
        if (!this.skillNodeTemplate) return null;

        const node = this.skillNodeTemplate.clone();
        node.active = true;
        node.name = `SkillNode_${config.id}`;

        // 设置节点名称
        const nameLabel = node.getChildByName('NameLabel')?.getComponent(Label);
        if (nameLabel) {
            nameLabel.string = config.name;
        }

        // 设置等级
        const levelLabel = node.getChildByName('LevelLabel')?.getComponent(Label);
        if (levelLabel) {
            levelLabel.string = state.unlocked ? `Lv.${state.level}/${config.maxLevel}` : '未解锁';
        }

        // 设置颜色
        const bgSprite = node.getChildByName('Background')?.getComponent(Sprite);
        if (bgSprite) {
            if (!state.unlocked) {
                bgSprite.color = Color.GRAY;
            } else if (state.level >= config.maxLevel) {
                bgSprite.color = Color.GOLD;
            } else {
                bgSprite.color = Color.WHITE;
            }
        }

        // 绑定点击事件
        const btn = node.getComponent(Button) || node.addComponent(Button);
        btn.node.on(Button.EventType.CLICK, () => {
            this._selectSkillNode(config.id);
        }, this);

        return node;
    }

    /**
     * 选择技能节点
     */
    private _selectSkillNode(nodeId: string): void {
        soundManager.playUISound('button_click');
        this._selectedNodeId = nodeId;
        this._updateDetailPanel();
        this._highlightSelectedNode();
    }

    /**
     * 高亮选中的节点
     */
    private _highlightSelectedNode(): void {
        this._skillNodes.forEach(item => {
            const isSelected = item.config.id === this._selectedNodeId;
            // 更新选中效果
            const selectFrame = item.node.getChildByName('SelectFrame');
            if (selectFrame) {
                selectFrame.active = isSelected;
            }
        });
    }

    /**
     * 更新详情面板
     */
    private _updateDetailPanel(): void {
        if (!this._selectedNodeId) return;

        const config = skillTreeManager.getNodeConfig(this._selectedNodeId);
        if (!config) return;

        const level = skillTreeManager.getSkillLevel(this._heroId, this._selectedNodeId);
        const isUnlocked = skillTreeManager.isSkillUnlocked(this._heroId, this._selectedNodeId);

        // 更新详情信息
        if (this.detailNameLabel) {
            this.detailNameLabel.string = config.name;
        }

        if (this.detailDescLabel) {
            this.detailDescLabel.string = config.description;
        }

        if (this.detailLevelLabel) {
            this.detailLevelLabel.string = `等级: ${level}/${config.maxLevel}`;
        }

        // 更新按钮状态
        if (this.unlockButton) {
            this.unlockButton.node.active = !isUnlocked;
            const checkResult = skillTreeManager.canUnlockSkill(this._heroId, this._selectedNodeId);
            this.unlockButton.interactable = checkResult.canUnlock;
        }

        if (this.upgradeButton) {
            this.upgradeButton.node.active = isUnlocked;
            const checkResult = skillTreeManager.canUpgradeSkill(this._heroId, this._selectedNodeId);
            this.upgradeButton.interactable = checkResult.canUpgrade;
        }
    }

    /**
     * 更新技能点UI
     */
    private _updateSkillPointsUI(): void {
        const skillPoints = skillTreeManager.getSkillPoints(this._heroId);
        if (this.skillPointsLabel) {
            this.skillPointsLabel.string = `技能点: ${skillPoints}`;
        }
    }

    /**
     * 解锁按钮点击
     */
    private _onUnlockClick(): void {
        soundManager.playUISound('button_click');

        if (!this._selectedNodeId) return;

        const success = skillTreeManager.unlockSkill(this._heroId, this._selectedNodeId);
        if (success) {
            UIManager.getInstance().showToast('技能解锁成功！');
            soundManager.playUISound('success');
        }
    }

    /**
     * 升级按钮点击
     */
    private _onUpgradeClick(): void {
        soundManager.playUISound('button_click');

        if (!this._selectedNodeId) return;

        const success = skillTreeManager.upgradeSkill(this._heroId, this._selectedNodeId);
        if (success) {
            UIManager.getInstance().showToast('技能升级成功！');
        }
    }

    /**
     * 重置按钮点击
     */
    private _onResetClick(): void {
        soundManager.playUISound('button_click');

        // 显示确认对话框
        UIManager.getInstance().showConfirm(
            '重置技能树',
            '确定要重置所有技能吗？将返还所有已使用的技能点。',
            () => {
                const refundedPoints = skillTreeManager.resetSkillTree(this._heroId);
                UIManager.getInstance().showToast(`重置成功，返还 ${refundedPoints} 技能点`);
                this._loadBranch(this._currentBranch);
            }
        );
    }

    /**
     * 关闭按钮点击
     */
    private _onCloseClick(): void {
        soundManager.playUISound('close');
        this._closePanel();
    }

    /**
     * 技能解锁回调
     */
    private _onSkillUnlocked(data: { heroId: string; nodeId: string }): void {
        if (data.heroId === this._heroId) {
            this._refreshNodeUI(data.nodeId);
            this._updateDetailPanel();
        }
    }

    /**
     * 技能升级回调
     */
    private _onSkillUpgraded(data: { heroId: string; nodeId: string }): void {
        if (data.heroId === this._heroId) {
            this._refreshNodeUI(data.nodeId);
            this._updateSkillPointsUI();
            this._updateDetailPanel();
        }
    }

    /**
     * 技能点变化回调
     */
    private _onSkillPointsChanged(data: { heroId: string; skillPoints: number }): void {
        if (data.heroId === this._heroId) {
            this._updateSkillPointsUI();
        }
    }

    /**
     * 刷新节点UI
     */
    private _refreshNodeUI(nodeId: string): void {
        const item = this._skillNodes.find(i => i.config.id === nodeId);
        if (!item) return;

        const skillTreeData = skillTreeManager.getHeroSkillTree(this._heroId);
        const state = skillTreeData?.nodes.find(n => n.nodeId === nodeId);
        if (state) {
            item.state = state;
            // 更新等级标签
            const levelLabel = item.node.getChildByName('LevelLabel')?.getComponent(Label);
            if (levelLabel) {
                levelLabel.string = state.unlocked ? `Lv.${state.level}/${item.config.maxLevel}` : '未解锁';
            }
            // 更新背景颜色
            const bgSprite = item.node.getChildByName('Background')?.getComponent(Sprite);
            if (bgSprite) {
                if (state.level >= item.config.maxLevel) {
                    bgSprite.color = Color.GOLD;
                }
            }
        }
    }

    /**
     * 关闭面板
     */
    private _closePanel(): void {
        this._removeEventListeners();
        UIManager.getInstance().hideUI('skill_tree_panel');
    }

    /**
     * 销毁
     */
    onDestroy(): void {
        this._removeEventListeners();
    }
}