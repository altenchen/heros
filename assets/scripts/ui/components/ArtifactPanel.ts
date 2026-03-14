/**
 * 宝物面板
 * 显示英雄装备槽和背包宝物列表
 */

import { _decorator, Node, Label, Button, ScrollView, Color, Sprite } from 'cc';
import { UIPanel } from './UIPanel';
import { artifactManager } from '../artifact/ArtifactManager';
import {
    ArtifactSlot,
    ArtifactRarity,
    ArtifactType,
    ArtifactStatType,
    ArtifactEventType,
    ArtifactData,
    ArtifactConfig,
    ArtifactStat
} from '../config/ArtifactTypes';
import { getArtifactConfig } from '../config/artifact.json';
import { EventCenter } from '../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 稀有度颜色 */
const RARITY_COLORS: Record<ArtifactRarity, Color> = {
    [ArtifactRarity.COMMON]: Color.WHITE,
    [ArtifactRarity.MINOR]: new Color(0x1E, 0x90, 0xFF), // 蓝色
    [ArtifactRarity.MAJOR]: new Color(0x99, 0x32, 0xCC), // 紫色
    [ArtifactRarity.RELIC]: new Color(0xFF, 0xA5, 0x00), // 橙色
    [ArtifactRarity.ARTIFACT]: new Color(0xFF, 0xD7, 0x00), // 金色
    [ArtifactRarity.COMBINED]: new Color(0xFF, 0x00, 0xFF) // 紫红色
};

/** 槽位名称 */
const SLOT_NAMES: Record<ArtifactSlot, string> = {
    [ArtifactSlot.MAIN_HAND]: '主武器',
    [ArtifactSlot.OFF_HAND]: '副武器',
    [ArtifactSlot.HELMET]: '头盔',
    [ArtifactSlot.ARMOR]: '盔甲',
    [ArtifactSlot.CLOAK]: '斗篷',
    [ArtifactSlot.BOOTS]: '靴子',
    [ArtifactSlot.NECKLACE]: '项链',
    [ArtifactSlot.RING_1]: '戒指1',
    [ArtifactSlot.RING_2]: '戒指2',
    [ArtifactSlot.AMMO_BAG]: '弹药袋',
    [ArtifactSlot.MISC_1]: '杂项1',
    [ArtifactSlot.MISC_2]: '杂项2',
    [ArtifactSlot.WAR_MACHINE_BALLISTA]: '弩车',
    [ArtifactSlot.WAR_MACHINE_AMMO_CART]: '弹药车',
    [ArtifactSlot.WAR_MACHINE_FIRST_AID_TENT]: '医疗帐篷',
    [ArtifactSlot.COMMANDER]: '指挥官'
};

/** 属性名称 */
const STAT_NAMES: Record<ArtifactStatType, string> = {
    [ArtifactStatType.ATTACK]: '攻击力',
    [ArtifactStatType.DEFENSE]: '防御力',
    [ArtifactStatType.POWER]: '力量',
    [ArtifactStatType.KNOWLEDGE]: '知识',
    [ArtifactStatType.HP]: '生命值',
    [ArtifactStatType.SPEED]: '速度',
    [ArtifactStatType.LUCK]: '幸运',
    [ArtifactStatType.MORALE]: '士气',
    [ArtifactStatType.MANA]: '魔法值',
    [ArtifactStatType.EXP_BONUS]: '经验加成',
    [ArtifactStatType.GOLD_BONUS]: '金币加成',
    [ArtifactStatType.SPELL_CASTS]: '施法次数',
    [ArtifactStatType.RANGED_DAMAGE]: '远程伤害',
    [ArtifactStatType.MELEE_DAMAGE]: '近战伤害',
    [ArtifactStatType.MAGIC_RESISTANCE]: '魔法抗性'
};

/** 装备槽组件 */
@ccclass('EquipmentSlot')
export class EquipmentSlot extends UIPanel {
    @property(Label)
    slotNameLabel: Label | null = null;

    @property(Label)
    itemNameLabel: Label | null = null;

    @property(Node)
    itemIcon: Node | null = null;

    @property(Node)
    emptySlot: Node | null = null;

    private slot: ArtifactSlot = ArtifactSlot.MAIN_HAND;
    private heroId: string = '';
    private currentArtifact: ArtifactData | null = null;

    setData(data: { slot: ArtifactSlot; heroId: string }): void {
        this.slot = data.slot;
        this.heroId = data.heroId;
        this.updateDisplay();
    }

    updateDisplay(): void {
        // 更新槽位名称
        if (this.slotNameLabel) {
            this.slotNameLabel.string = SLOT_NAMES[this.slot] || this.slot;
        }

        // 获取装备数据
        this.currentArtifact = artifactManager.getSlotArtifact(this.heroId, this.slot);

        if (this.currentArtifact) {
            const config = getArtifactConfig(this.currentArtifact.artifactId);
            if (config) {
                if (this.itemNameLabel) {
                    this.itemNameLabel.string = config.name;
                    this.itemNameLabel.color = RARITY_COLORS[config.rarity];
                }
                if (this.itemIcon) this.itemIcon.active = true;
                if (this.emptySlot) this.emptySlot.active = false;
            }
        } else {
            if (this.itemNameLabel) {
                this.itemNameLabel.string = '空';
                this.itemNameLabel.color = Color.GRAY;
            }
            if (this.itemIcon) this.itemIcon.active = false;
            if (this.emptySlot) this.emptySlot.active = true;
        }
    }

    onSlotClick(): void {
        if (this.currentArtifact) {
            // 显示装备详情
            EventCenter.emit('artifact_detail_request', {
                instanceId: this.currentArtifact.instanceId,
                heroId: this.heroId,
                slot: this.slot
            });
        } else {
            // 显示可装备列表
            EventCenter.emit('artifact_list_request', {
                heroId: this.heroId,
                slot: this.slot
            });
        }
    }
}

/** 背包宝物项组件 */
@ccclass('ArtifactItem')
export class ArtifactItem extends UIPanel {
    @property(Label)
    nameLabel: Label | null = null;

    @property(Label)
    rarityLabel: Label | null = null;

    @property(Label)
    countLabel: Label | null = null;

    @property(Label)
    statsLabel: Label | null = null;

    @property(Node)
    iconNode: Node | null = null;

    private instanceId: string = '';
    private artifactData: ArtifactData | null = null;
    private config: ArtifactConfig | null = null;

    setData(data: { instanceId: string }): void {
        this.instanceId = data.instanceId;
        this.artifactData = artifactManager.getArtifactDetail(data.instanceId)?.data || null;
        this.config = artifactManager.getArtifactDetail(data.instanceId)?.config || null;
        this.updateDisplay();
    }

    updateDisplay(): void {
        if (!this.artifactData || !this.config) return;

        // 更新名称
        if (this.nameLabel) {
            this.nameLabel.string = this.config.name;
            this.nameLabel.color = RARITY_COLORS[this.config.rarity];
        }

        // 更新稀有度
        if (this.rarityLabel) {
            const rarityNames: Record<ArtifactRarity, string> = {
                [ArtifactRarity.COMMON]: '普通',
                [ArtifactRarity.MINOR]: '稀有',
                [ArtifactRarity.MAJOR]: '史诗',
                [ArtifactRarity.RELIC]: '传说',
                [ArtifactRarity.ARTIFACT]: '神器',
                [ArtifactRarity.COMBINED]: '组合'
            };
            this.rarityLabel.string = rarityNames[this.config.rarity];
            this.rarityLabel.color = RARITY_COLORS[this.config.rarity];
        }

        // 更新数量
        if (this.countLabel) {
            this.countLabel.string = this.artifactData.count > 1 ? `x${this.artifactData.count}` : '';
        }

        // 更新属性
        if (this.statsLabel && this.config.stats.length > 0) {
            const statTexts = this.config.stats.map(stat => {
                const name = STAT_NAMES[stat.type] || stat.type;
                const value = stat.isPercent ? `${stat.value}%` : `+${stat.value}`;
                return `${name}${value}`;
            });
            this.statsLabel.string = statTexts.join(' ');
        }
    }

    onItemClick(): void {
        EventCenter.emit('artifact_detail_request', {
            instanceId: this.instanceId
        });
    }

    onEquipClick(): void {
        EventCenter.emit('artifact_equip_request', {
            instanceId: this.instanceId
        });
    }

    onSellClick(): void {
        EventCenter.emit('artifact_sell_request', {
            instanceId: this.instanceId
        });
    }
}

/** 宝物详情面板 */
@ccclass('ArtifactDetailPanel')
export class ArtifactDetailPanel extends UIPanel {
    @property(Label)
    nameLabel: Label | null = null;

    @property(Label)
    rarityLabel: Label | null = null;

    @property(Label)
    typeLabel: Label | null = null;

    @property(Label)
    descLabel: Label | null = null;

    @property(Label)
    statsLabel: Label | null = null;

    @property(Label)
    effectsLabel: Label | null = null;

    @property(Label)
    priceLabel: Label | null = null;

    @property(Button)
    equipBtn: Button | null = null;

    @property(Button)
    unequipBtn: Button | null = null;

    @property(Button)
    sellBtn: Button | null = null;

    @property(Button)
    enhanceBtn: Button | null = null;

    @property(Button)
    closeBtn: Button | null = null;

    private instanceId: string = '';
    private heroId: string = '';
    private slot: ArtifactSlot | null = null;
    private config: ArtifactConfig | null = null;

    setData(data: { instanceId: string; heroId?: string; slot?: ArtifactSlot }): void {
        this.instanceId = data.instanceId;
        this.heroId = data.heroId || '';
        this.slot = data.slot || null;

        const detail = artifactManager.getArtifactDetail(data.instanceId);
        this.config = detail?.config || null;

        this.updateDisplay();
    }

    updateDisplay(): void {
        if (!this.config) return;

        // 更新名称
        if (this.nameLabel) {
            this.nameLabel.string = this.config.name;
            this.nameLabel.color = RARITY_COLORS[this.config.rarity];
        }

        // 更新稀有度
        if (this.rarityLabel) {
            const rarityNames: Record<ArtifactRarity, string> = {
                [ArtifactRarity.COMMON]: '普通',
                [ArtifactRarity.MINOR]: '稀有',
                [ArtifactRarity.MAJOR]: '史诗',
                [ArtifactRarity.RELIC]: '传说',
                [ArtifactRarity.ARTIFACT]: '神器',
                [ArtifactRarity.COMBINED]: '组合'
            };
            this.rarityLabel.string = rarityNames[this.config.rarity];
            this.rarityLabel.color = RARITY_COLORS[this.config.rarity];
        }

        // 更新类型
        if (this.typeLabel) {
            this.typeLabel.string = `槽位: ${SLOT_NAMES[this.config.slot]}`;
        }

        // 更新描述
        if (this.descLabel) {
            this.descLabel.string = this.config.description;
        }

        // 更新属性
        if (this.statsLabel) {
            if (this.config.stats.length > 0) {
                const statTexts = this.config.stats.map(stat => {
                    const name = STAT_NAMES[stat.type] || stat.type;
                    const value = stat.isPercent ? `${stat.value}%` : `+${stat.value}`;
                    return `${name}${value}`;
                });
                this.statsLabel.string = statTexts.join('\n');
            } else {
                this.statsLabel.string = '无属性加成';
            }
        }

        // 更新特殊效果
        if (this.effectsLabel) {
            if (this.config.specialEffects && this.config.specialEffects.length > 0) {
                const effectTexts = this.config.specialEffects.map(effect => effect.description);
                this.effectsLabel.string = effectTexts.join('\n');
            } else {
                this.effectsLabel.string = '';
            }
        }

        // 更新价格
        if (this.priceLabel) {
            this.priceLabel.string = `出售价格: ${this.config.sellPrice} 金币`;
        }

        // 更新按钮状态
        if (this.equipBtn) {
            this.equipBtn.node.active = !!this.heroId && !this.slot;
        }
        if (this.unequipBtn) {
            this.unequipBtn.node.active = !!this.heroId && !!this.slot;
        }
        if (this.sellBtn) {
            this.sellBtn.node.active = !this.slot;
        }
    }

    onEquipClick(): void {
        if (this.heroId && this.instanceId) {
            const result = artifactManager.equipArtifact(this.heroId, this.instanceId);
            if (result.success) {
                console.log('[ArtifactDetailPanel] 装备成功');
                this.hide();
            }
        }
    }

    onUnequipClick(): void {
        if (this.heroId && this.slot) {
            artifactManager.unequipArtifact(this.heroId, this.slot);
            console.log('[ArtifactDetailPanel] 卸下装备成功');
            this.hide();
        }
    }

    onSellClick(): void {
        const gold = artifactManager.sellArtifact(this.instanceId);
        if (gold > 0) {
            console.log(`[ArtifactDetailPanel] 出售成功, 获得 ${gold} 金币`);
            this.hide();
        }
    }

    onEnhanceClick(): void {
        console.log('[ArtifactDetailPanel] 强化宝物');
        // 实际项目中，这里应该显示强化确认界面
    }

    onCloseClick(): void {
        this.hide();
    }
}

/** 主宝物面板 */
@ccclass('ArtifactPanel')
export class ArtifactPanel extends UIPanel {
    @property(Node)
    equipmentRoot: Node | null = null;

    @property(ScrollView)
    inventoryScrollView: ScrollView | null = null;

    @property(Node)
    inventoryContent: Node | null = null;

    @property(Label)
    statsSummaryLabel: Label | null = null;

    @property(Label)
    goldLabel: Label | null = null;

    @property(Button)
    closeBtn: Button | null = null;

    @property(Button)
    sortBtn: Button | null = null;

    @property(Button)
    filterBtn: Button | null = null;

    private heroId: string = '';
    private equipmentSlots: Map<ArtifactSlot, EquipmentSlot> = new Map();
    private artifactItems: Map<string, ArtifactItem> = new Map();

    onShow(data?: any): void {
        super.onShow(data);

        this.heroId = data?.heroId || 'hero_1';

        // 初始化英雄装备槽
        artifactManager.initHeroEquipment(this.heroId);

        // 更新显示
        this.updateDisplay();

        // 监听事件
        this.setupEventListeners();
    }

    onHide(): void {
        this.cleanupEventListeners();
        super.onHide();
    }

    private setupEventListeners(): void {
        EventCenter.on(ArtifactEventType.ARTIFACT_EQUIPPED, this.onArtifactEquipped, this);
        EventCenter.on(ArtifactEventType.ARTIFACT_UNEQUIPPED, this.onArtifactUnequipped, this);
        EventCenter.on(ArtifactEventType.ARTIFACT_SOLD, this.onArtifactSold, this);
        EventCenter.on('artifact_detail_request', this.onShowArtifactDetail, this);
        EventCenter.on('artifact_equip_request', this.onEquipRequest, this);
        EventCenter.on('artifact_sell_request', this.onSellRequest, this);
    }

    private cleanupEventListeners(): void {
        EventCenter.off(ArtifactEventType.ARTIFACT_EQUIPPED, this.onArtifactEquipped, this);
        EventCenter.off(ArtifactEventType.ARTIFACT_UNEQUIPPED, this.onArtifactUnequipped, this);
        EventCenter.off(ArtifactEventType.ARTIFACT_SOLD, this.onArtifactSold, this);
        EventCenter.off('artifact_detail_request', this.onShowArtifactDetail, this);
        EventCenter.off('artifact_equip_request', this.onEquipRequest, this);
        EventCenter.off('artifact_sell_request', this.onSellRequest, this);
    }

    updateDisplay(): void {
        this.updateEquipmentSlots();
        this.updateInventoryList();
        this.updateStatsSummary();
    }

    private updateEquipmentSlots(): void {
        // 实际项目中，这里应该遍历装备槽节点并更新
        console.log('[ArtifactPanel] 更新装备槽');
    }

    private updateInventoryList(): void {
        const artifacts = artifactManager.getArtifacts();
        console.log(`[ArtifactPanel] 更新背包列表, 共 ${artifacts.length} 件宝物`);
    }

    private updateStatsSummary(): void {
        const stats = artifactManager.getHeroAllStats(this.heroId);

        if (this.statsSummaryLabel) {
            const statTexts: string[] = [];
            stats.forEach((value, type) => {
                const name = STAT_NAMES[type] || type;
                statTexts.push(`${name} +${value}`);
            });
            this.statsSummaryLabel.string = statTexts.join('  ');
        }
    }

    private onArtifactEquipped(data: any): void {
        if (data.heroId === this.heroId) {
            this.updateDisplay();
        }
    }

    private onArtifactUnequipped(data: any): void {
        if (data.heroId === this.heroId) {
            this.updateDisplay();
        }
    }

    private onArtifactSold(data: any): void {
        this.updateDisplay();
    }

    private onShowArtifactDetail(data: any): void {
        console.log('[ArtifactPanel] 显示宝物详情:', data.instanceId);
        // 实际项目中，这里应该显示详情面板
    }

    private onEquipRequest(data: any): void {
        const result = artifactManager.equipArtifact(this.heroId, data.instanceId);
        if (result.success) {
            this.updateDisplay();
        }
    }

    private onSellRequest(data: any): void {
        const gold = artifactManager.sellArtifact(data.instanceId);
        if (gold > 0) {
            console.log(`[ArtifactPanel] 出售宝物获得 ${gold} 金币`);
            this.updateDisplay();
        }
    }

    onSortClick(): void {
        console.log('[ArtifactPanel] 排序');
    }

    onFilterClick(): void {
        console.log('[ArtifactPanel] 筛选');
    }

    onCloseClick(): void {
        this.hide();
    }
}