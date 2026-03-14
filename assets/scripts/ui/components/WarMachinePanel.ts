/**
 * 战争机器面板
 * 显示英雄装备的战争机器和管理战争机器
 */

import { _decorator, Node, Label, Button, ScrollView, Color, Sprite, ProgressBar } from 'cc';
import { UIPanel } from './UIPanel';
import { warMachineManager } from '../warmachine/WarMachineManager';
import {
    WarMachineType,
    WarMachineRarity,
    WarMachineConfig,
    WarMachineInstance,
    WarMachineEventType
} from '../config/WarMachineTypes';
import { WarMachineConfigMap } from '../../configs/war_machine.json';
import { EventCenter } from '../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 稀有度颜色 */
const RARITY_COLORS: Record<WarMachineRarity, Color> = {
    [WarMachineRarity.NORMAL]: Color.WHITE,
    [WarMachineRarity.RARE]: new Color(0x1E, 0x90, 0xFF), // 蓝色
    [WarMachineRarity.EPIC]: new Color(0x99, 0x32, 0xCC), // 紫色
    [WarMachineRarity.LEGENDARY]: new Color(0xFF, 0xA5, 0x00) // 橙色
};

/** 战争机器类型名称 */
const TYPE_NAMES: Record<WarMachineType, string> = {
    [WarMachineType.BALLISTA]: '弩车',
    [WarMachineType.FIRST_AID_TENT]: '医疗帐篷',
    [WarMachineType.AMMO_CART]: '弹药车',
    [WarMachineType.CATAPULT]: '投石车'
};

/** 战争机器类型描述 */
const TYPE_DESCRIPTIONS: Record<WarMachineType, string> = {
    [WarMachineType.BALLISTA]: '远程攻击单位，对敌方单位造成伤害',
    [WarMachineType.FIRST_AID_TENT]: '治疗友方单位，恢复生命值',
    [WarMachineType.AMMO_CART]: '为远程单位提供额外弹药',
    [WarMachineType.CATAPULT]: '攻城单位，对城墙造成额外伤害'
};

/** 战争机器槽位组件 */
@ccclass('WarMachineSlot')
export class WarMachineSlot extends UIPanel {
    @property(Label)
    nameLabel: Label | null = null;

    @property(Label)
    levelLabel: Label | null = null;

    @property(Label)
    statsLabel: Label | null = null;

    @property(Node)
    iconNode: Node | null = null;

    @property(Node)
    emptySlot: Node | null = null;

    @property(ProgressBar)
    hpBar: ProgressBar | null = null;

    private machineType: WarMachineType | null = null;
    private heroId: string = '';
    private instanceId: string = '';

    setData(data: { type: WarMachineType | null; heroId: string; instanceId?: string }): void {
        this.machineType = data.type;
        this.heroId = data.heroId;
        this.instanceId = data.instanceId || '';
        this.updateDisplay();
    }

    updateDisplay(): void {
        if (this.instanceId) {
            const instance = warMachineManager.getMachine(this.instanceId);
            if (instance) {
                const config = WarMachineConfigMap.get(instance.configId);
                if (config) {
                    // 显示名称
                    if (this.nameLabel) {
                        this.nameLabel.string = config.name;
                        this.nameLabel.color = RARITY_COLORS[config.rarity];
                    }

                    // 显示等级
                    if (this.levelLabel) {
                        this.levelLabel.string = `Lv.${instance.level}`;
                    }

                    // 显示属性
                    if (this.statsLabel) {
                        this.statsLabel.string = this.getStatsText(config, instance);
                    }

                    // 显示血量条
                    if (this.hpBar) {
                        this.hpBar.progress = instance.currentHp / instance.maxHp;
                    }

                    if (this.iconNode) this.iconNode.active = true;
                    if (this.emptySlot) this.emptySlot.active = false;
                }
            }
        } else if (this.machineType) {
            // 空槽位
            if (this.nameLabel) {
                this.nameLabel.string = TYPE_NAMES[this.machineType];
                this.nameLabel.color = Color.GRAY;
            }
            if (this.levelLabel) {
                this.levelLabel.string = '';
            }
            if (this.statsLabel) {
                this.statsLabel.string = '未装备';
            }
            if (this.hpBar) {
                this.hpBar.progress = 0;
            }
            if (this.iconNode) this.iconNode.active = false;
            if (this.emptySlot) this.emptySlot.active = true;
        }
    }

    private getStatsText(config: WarMachineConfig, instance: WarMachineInstance): string {
        const stats: string[] = [];
        const level = instance.level;

        if (config.stats.attack) {
            const value = config.stats.attack + (config.growth.attack || 0) * (level - 1);
            stats.push(`攻击:${value}`);
        }
        if (config.stats.healAmount) {
            const value = config.stats.healAmount + (config.growth.healAmount || 0) * (level - 1);
            stats.push(`治疗:${value}`);
        }
        if (config.stats.ammoBonus) {
            const value = config.stats.ammoBonus + (config.growth.ammoBonus || 0) * (level - 1);
            stats.push(`弹药+${value}`);
        }

        return stats.join(' ');
    }

    onSlotClick(): void {
        if (this.instanceId) {
            // 显示详情
            EventCenter.emit('war_machine_detail_request', {
                instanceId: this.instanceId,
                heroId: this.heroId
            });
        } else if (this.machineType) {
            // 显示可装备列表
            EventCenter.emit('war_machine_list_request', {
                type: this.machineType,
                heroId: this.heroId
            });
        }
    }
}

/** 战争机器列表项组件 */
@ccclass('WarMachineItem')
export class WarMachineItem extends UIPanel {
    @property(Label)
    nameLabel: Label | null = null;

    @property(Label)
    levelLabel: Label | null = null;

    @property(Label)
    typeLabel: Label | null = null;

    @property(Node)
    iconNode: Node | null = null;

    @property(Button)
    equipBtn: Button | null = null;

    @property(Button)
    upgradeBtn: Button | null = null;

    private instanceId: string = '';
    private configId: string = '';

    setData(data: { instanceId: string }): void {
        this.instanceId = data.instanceId;
        this.updateDisplay();
    }

    updateDisplay(): void {
        const instance = warMachineManager.getMachine(this.instanceId);
        if (!instance) return;

        const config = WarMachineConfigMap.get(instance.configId);
        if (!config) return;

        this.configId = instance.configId;

        if (this.nameLabel) {
            this.nameLabel.string = config.name;
            this.nameLabel.color = RARITY_COLORS[config.rarity];
        }

        if (this.levelLabel) {
            this.levelLabel.string = `Lv.${instance.level}`;
        }

        if (this.typeLabel) {
            this.typeLabel.string = TYPE_NAMES[config.type];
        }
    }

    onEquipClick(): void {
        EventCenter.emit('war_machine_equip_request', {
            instanceId: this.instanceId
        });
    }

    onUpgradeClick(): void {
        EventCenter.emit('war_machine_upgrade_request', {
            instanceId: this.instanceId
        });
    }
}

/** 战争机器详情面板组件 */
@ccclass('WarMachineDetailPanel')
export class WarMachineDetailPanel extends UIPanel {
    @property(Label)
    nameLabel: Label | null = null;

    @property(Label)
    levelLabel: Label | null = null;

    @property(Label)
    typeLabel: Label | null = null;

    @property(Label)
    descLabel: Label | null = null;

    @property(Label)
    statsLabel: Label | null = null;

    @property(ProgressBar)
    hpBar: ProgressBar | null = null;

    @property(Label)
    hpLabel: Label | null = null;

    @property(Button)
    upgradeBtn: Button | null = null;

    @property(Button)
    unequipBtn: Button | null = null;

    @property(Button)
    sellBtn: Button | null = null;

    private instanceId: string = '';
    private heroId: string = '';

    setData(data: { instanceId: string; heroId: string }): void {
        this.instanceId = data.instanceId;
        this.heroId = data.heroId;
        this.updateDisplay();
    }

    updateDisplay(): void {
        const instance = warMachineManager.getMachine(this.instanceId);
        if (!instance) return;

        const config = WarMachineConfigMap.get(instance.configId);
        if (!config) return;

        if (this.nameLabel) {
            this.nameLabel.string = config.name;
            this.nameLabel.color = RARITY_COLORS[config.rarity];
        }

        if (this.levelLabel) {
            this.levelLabel.string = `等级 ${instance.level}`;
        }

        if (this.typeLabel) {
            this.typeLabel.string = TYPE_NAMES[config.type];
        }

        if (this.descLabel) {
            this.descLabel.string = config.description || TYPE_DESCRIPTIONS[config.type];
        }

        if (this.statsLabel) {
            this.statsLabel.string = this.getDetailedStats(config, instance);
        }

        if (this.hpBar) {
            this.hpBar.progress = instance.currentHp / instance.maxHp;
        }

        if (this.hpLabel) {
            this.hpLabel.string = `${instance.currentHp} / ${instance.maxHp}`;
        }

        // 更新按钮状态
        if (this.unequipBtn) {
            this.unequipBtn.node.active = instance.equipped;
        }
    }

    private getDetailedStats(config: WarMachineConfig, instance: WarMachineInstance): string {
        const lines: string[] = [];
        const level = instance.level;

        if (config.stats.attack !== undefined) {
            const base = config.stats.attack;
            const growth = config.growth.attack || 0;
            const total = base + growth * (level - 1);
            lines.push(`攻击力: ${total} (基础${base} + 成长${growth * (level - 1)})`);
        }

        if (config.stats.defense !== undefined) {
            const base = config.stats.defense;
            const growth = config.growth.defense || 0;
            const total = base + growth * (level - 1);
            lines.push(`防御力: ${total}`);
        }

        if (config.stats.hp !== undefined) {
            const base = config.stats.hp;
            const growth = config.growth.hp || 0;
            const total = base + growth * (level - 1);
            lines.push(`生命值: ${total}`);
        }

        if (config.stats.healAmount !== undefined) {
            const base = config.stats.healAmount;
            const growth = config.growth.healAmount || 0;
            const total = base + growth * (level - 1);
            lines.push(`治疗量: ${total}`);
        }

        if (config.stats.ammoBonus !== undefined) {
            const base = config.stats.ammoBonus;
            const growth = config.growth.ammoBonus || 0;
            const total = base + growth * (level - 1);
            lines.push(`弹药加成: +${total}`);
        }

        if (config.stats.shots !== undefined) {
            lines.push(`攻击次数: ${config.stats.shots}`);
        }

        return lines.join('\n');
    }

    onUpgradeClick(): void {
        const result = warMachineManager.upgradeMachine(this.instanceId);
        if (result.success) {
            this.updateDisplay();
        }
    }

    onUnequipClick(): void {
        const result = warMachineManager.unequipMachine(this.instanceId);
        if (result) {
            this.node.active = false;
        }
    }

    onSellClick(): void {
        const result = warMachineManager.sellMachine(this.instanceId);
        if (result.success && result.gold) {
            this.node.active = false;
        }
    }

    onCloseClick(): void {
        this.node.active = false;
    }
}

/** 战争机器主面板 */
@ccclass('WarMachinePanel')
export class WarMachinePanel extends UIPanel {
    @property(WarMachineSlot)
    ballistaSlot: WarMachineSlot | null = null;

    @property(WarMachineSlot)
    firstAidSlot: WarMachineSlot | null = null;

    @property(WarMachineSlot)
    ammoCartSlot: WarMachineSlot | null = null;

    @property(WarMachineSlot)
    catapultSlot: WarMachineSlot | null = null;

    @property(ScrollView)
    machineListScrollView: ScrollView | null = null;

    @property(Node)
    machineListContent: Node | null = null;

    @property(WarMachineDetailPanel)
    detailPanel: WarMachineDetailPanel | null = null;

    @property(Button)
    closeButton: Button | null = null;

    private heroId: string = '';

    /**
     * 面板显示时调用
     */
    onShow(data?: { heroId: string }): void {
        super.onShow(data);

        if (data?.heroId) {
            this.heroId = data.heroId;
        }

        this.updateSlots();
        this.updateMachineList();
        this.bindEvents();
    }

    /**
     * 面板隐藏时调用
     */
    onHide(): void {
        super.onHide();
        this.unbindEvents();
    }

    /**
     * 更新槽位显示
     */
    private updateSlots(): void {
        const equipment = warMachineManager.getHeroEquipment(this.heroId);

        // 弩车槽
        if (this.ballistaSlot) {
            const ballistaId = equipment.find(id => {
                const instance = warMachineManager.getMachine(id);
                const config = instance ? WarMachineConfigMap.get(instance.configId) : null;
                return config?.type === WarMachineType.BALLISTA;
            });
            this.ballistaSlot.setData({
                type: WarMachineType.BALLISTA,
                heroId: this.heroId,
                instanceId: ballistaId
            });
        }

        // 医疗帐篷槽
        if (this.firstAidSlot) {
            const tentId = equipment.find(id => {
                const instance = warMachineManager.getMachine(id);
                const config = instance ? WarMachineConfigMap.get(instance.configId) : null;
                return config?.type === WarMachineType.FIRST_AID_TENT;
            });
            this.firstAidSlot.setData({
                type: WarMachineType.FIRST_AID_TENT,
                heroId: this.heroId,
                instanceId: tentId
            });
        }

        // 弹药车槽
        if (this.ammoCartSlot) {
            const cartId = equipment.find(id => {
                const instance = warMachineManager.getMachine(id);
                const config = instance ? WarMachineConfigMap.get(instance.configId) : null;
                return config?.type === WarMachineType.AMMO_CART;
            });
            this.ammoCartSlot.setData({
                type: WarMachineType.AMMO_CART,
                heroId: this.heroId,
                instanceId: cartId
            });
        }

        // 投石车槽
        if (this.catapultSlot) {
            const catapultId = equipment.find(id => {
                const instance = warMachineManager.getMachine(id);
                const config = instance ? WarMachineConfigMap.get(instance.configId) : null;
                return config?.type === WarMachineType.CATAPULT;
            });
            this.catapultSlot.setData({
                type: WarMachineType.CATAPULT,
                heroId: this.heroId,
                instanceId: catapultId
            });
        }
    }

    /**
     * 更新战争机器列表
     */
    private updateMachineList(): void {
        if (!this.machineListContent) return;

        // 清空现有列表
        this.machineListContent.removeAllChildren();

        // 获取所有战争机器
        const machines = warMachineManager.getAllMachines();

        // TODO: 创建列表项节点并添加到content
        // 这里需要在Cocos Creator中创建预制体
    }

    /**
     * 绑定事件
     */
    private bindEvents(): void {
        EventCenter.on('war_machine_detail_request', this.showDetail, this);
        EventCenter.on('war_machine_equip_request', this.handleEquipRequest, this);
        EventCenter.on('war_machine_upgrade_request', this.handleUpgradeRequest, this);
        EventCenter.on(WarMachineEventType.EQUIPPED, this.updateSlots, this);
        EventCenter.on(WarMachineEventType.UNEQUIPPED, this.updateSlots, this);
        EventCenter.on(WarMachineEventType.UPGRADED, this.updateSlots, this);
    }

    /**
     * 解绑事件
     */
    private unbindEvents(): void {
        EventCenter.off('war_machine_detail_request', this.showDetail, this);
        EventCenter.off('war_machine_equip_request', this.handleEquipRequest, this);
        EventCenter.off('war_machine_upgrade_request', this.handleUpgradeRequest, this);
        EventCenter.off(WarMachineEventType.EQUIPPED, this.updateSlots, this);
        EventCenter.off(WarMachineEventType.UNEQUIPPED, this.updateSlots, this);
        EventCenter.off(WarMachineEventType.UPGRADED, this.updateSlots, this);
    }

    /**
     * 显示详情
     */
    private showDetail(data: { instanceId: string; heroId: string }): void {
        if (this.detailPanel) {
            this.detailPanel.setData(data);
            this.detailPanel.node.active = true;
        }
    }

    /**
     * 处理装备请求
     */
    private handleEquipRequest(data: { instanceId: string }): void {
        const result = warMachineManager.equipMachine(data.instanceId, this.heroId);
        if (result) {
            this.updateSlots();
        }
    }

    /**
     * 处理升级请求
     */
    private handleUpgradeRequest(data: { instanceId: string }): void {
        const result = warMachineManager.upgradeMachine(data.instanceId);
        if (result.success) {
            this.updateMachineList();
        }
    }

    /**
     * 关闭按钮点击
     */
    onCloseClick(): void {
        this.hide();
    }
}