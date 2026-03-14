/**
 * VIP面板
 * 显示VIP等级、特权、充值、月卡、成长基金
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Button, Sprite, Color, Prefab, instantiate, ScrollView, ProgressBar } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { vipManager } from '../vip';
import { VIPPrivilegeType, VIPEventType, VIPLevelConfig, VIPPurchaseItem } from '../config/VIPTypes';
import { EventCenter } from '../utils/EventTarget';

const { ccclass, property } = _decorator;

@ccclass('VIPPanel')
export class VIPPanel extends UIPanel {
    // ==================== VIP信息 ====================

    /** VIP等级标签 */
    @property(Label)
    vipLevelLabel: Label | null = null;

    /** VIP经验条 */
    @property(ProgressBar)
    vipExpProgressBar: ProgressBar | null = null;

    /** VIP经验标签 */
    @property(Label)
    vipExpLabel: Label | null = null;

    /** VIP图标 */
    @property(Sprite)
    vipIcon: Sprite | null = null;

    // ==================== 特权列表 ====================

    /** 特权容器 */
    @property(Node)
    privilegeContainer: Node | null = null;

    /** 特权预制体 */
    @property(Prefab)
    privilegePrefab: Prefab | null = null;

    // ==================== 等级预览 ====================

    /** 等级预览滚动视图 */
    @property(ScrollView)
    levelScrollView: ScrollView | null = null;

    /** 等级容器 */
    @property(Node)
    levelContainer: Node | null = null;

    /** 等级项预制体 */
    @property(Prefab)
    levelItemPrefab: Prefab | null = null;

    // ==================== 充值商品 ====================

    /** 充值商品容器 */
    @property(Node)
    purchaseContainer: Node | null = null;

    /** 商品预制体 */
    @property(Prefab)
    purchaseItemPrefab: Prefab | null = null;

    // ==================== 月卡 ====================

    /** 月卡容器 */
    @property(Node)
    monthlyCardContainer: Node | null = null;

    /** 月卡状态标签 */
    @property(Label)
    monthlyCardStatusLabel: Label | null = null;

    /** 月卡剩余天数 */
    @property(Label)
    monthlyCardDaysLabel: Label | null = null;

    /** 领取月卡奖励按钮 */
    @property(Button)
    claimMonthlyCardButton: Button | null = null;

    // ==================== 成长基金 ====================

    /** 成长基金容器 */
    @property(Node)
    growthFundContainer: Node | null = null;

    /** 成长基金状态标签 */
    @property(Label)
    growthFundStatusLabel: Label | null = null;

    // ==================== 按钮 ====================

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    // ==================== 状态 ====================

    /** 当前选中的标签页 */
    private _currentTab: 'privilege' | 'recharge' | 'card' = 'privilege';

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 2,
            cache: true,
            animationType: PanelAnimationType.SCALE,
            animationDuration: 0.3
        });
    }

    /**
     * 面板打开
     */
    protected onOpen(): void {
        this._bindEvents();
        this._updateVIPInfo();
        this._updatePrivileges();
        this._updatePurchaseItems();
        this._updateMonthlyCard();
        this._updateGrowthFund();
    }

    /**
     * 面板关闭
     */
    protected onClose(): void {
        this._unbindEvents();
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(VIPEventType.VIP_LEVEL_UP, this._onVIPLevelUp, this);
        EventCenter.on(VIPEventType.PURCHASE_SUCCESS, this._onPurchaseSuccess, this);
        EventCenter.on(VIPEventType.MONTHLY_CARD_CLAIMED, this._onMonthlyCardClaimed, this);

        this.claimMonthlyCardButton?.node.on(Button.EventType.CLICK, this._onClaimMonthlyCardClick, this);
        this.closeButton?.node.on(Button.EventType.CLICK, this._onCloseClick, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(VIPEventType.VIP_LEVEL_UP, this._onVIPLevelUp, this);
        EventCenter.off(VIPEventType.PURCHASE_SUCCESS, this._onPurchaseSuccess, this);
        EventCenter.off(VIPEventType.MONTHLY_CARD_CLAIMED, this._onMonthlyCardClaimed, this);
    }

    /**
     * 更新VIP信息
     */
    private _updateVIPInfo(): void {
        const level = vipManager.getVIPLevel();
        const progress = vipManager.getVIPProgress();

        if (this.vipLevelLabel) {
            this.vipLevelLabel.string = `VIP ${level}`;
            this.vipLevelLabel.color = this._getVIPColor(level);
        }

        if (this.vipExpProgressBar) {
            this.vipExpProgressBar.progress = progress.current / progress.required;
        }

        if (this.vipExpLabel) {
            this.vipExpLabel.string = `${progress.current}/${progress.required}`;
        }
    }

    /**
     * 获取VIP等级颜色
     */
    private _getVIPColor(level: number): Color {
        if (level >= 15) return new Color(255, 50, 50);      // 红色
        if (level >= 10) return new Color(255, 165, 0);      // 橙色
        if (level >= 5) return new Color(148, 0, 211);       // 紫色
        if (level >= 1) return new Color(30, 144, 255);      // 蓝色
        return new Color(150, 150, 150);                      // 灰色
    }

    /**
     * 更新特权列表
     */
    private _updatePrivileges(): void {
        if (!this.privilegeContainer) return;

        this.privilegeContainer.removeAllChildren();

        const currentLevel = vipManager.getVIPLevel();
        const levelConfig = vipManager.getVIPLevelConfig(currentLevel);

        if (!levelConfig) return;

        // 显示当前等级的所有特权
        const privilegeTypes = [
            VIPPrivilegeType.RESOURCE_BONUS,
            VIPPrivilegeType.EXP_BONUS,
            VIPPrivilegeType.ATTACK_BONUS,
            VIPPrivilegeType.DEFENSE_BONUS,
            VIPPrivilegeType.EXTRA_CHALLENGE,
            VIPPrivilegeType.AUTO_SKIP,
            VIPPrivilegeType.BATTLE_SPEED,
            VIPPrivilegeType.DAILY_REWARD
        ];

        privilegeTypes.forEach(type => {
            const hasPrivilege = vipManager.hasPrivilege(type);
            const value = vipManager.getPrivilegeValue(type);
            const config = vipManager.getPrivilegeConfig(type);

            const privilegeNode = this.privilegePrefab
                ? instantiate(this.privilegePrefab)
                : new Node(`Privilege_${type}`);

            const nameLabel = privilegeNode.getChildByName('Name')?.getComponent(Label);
            if (nameLabel) {
                nameLabel.string = config?.name || '';
            }

            const descLabel = privilegeNode.getChildByName('Desc')?.getComponent(Label);
            if (descLabel) {
                descLabel.string = config?.description || '';
            }

            const valueLabel = privilegeNode.getChildByName('Value')?.getComponent(Label);
            if (valueLabel) {
                if (hasPrivilege && value > 0) {
                    valueLabel.string = `+${value}%`;
                    valueLabel.color = new Color(50, 205, 50);
                } else {
                    valueLabel.string = '未解锁';
                    valueLabel.color = new Color(150, 150, 150);
                }
            }

            this.privilegeContainer.addChild(privilegeNode);
        });
    }

    /**
     * 更新充值商品
     */
    private _updatePurchaseItems(): void {
        if (!this.purchaseContainer) return;

        this.purchaseContainer.removeAllChildren();

        const purchaseItems = vipManager.getPurchaseItems();

        purchaseItems.forEach(item => {
            const itemNode = this.purchaseItemPrefab
                ? instantiate(this.purchaseItemPrefab)
                : new Node(`Purchase_${item.id}`);

            const nameLabel = itemNode.getChildByName('Name')?.getComponent(Label);
            if (nameLabel) {
                nameLabel.string = item.name;
            }

            const gemsLabel = itemNode.getChildByName('Gems')?.getComponent(Label);
            if (gemsLabel) {
                gemsLabel.string = `${item.gems} 钻石`;
            }

            const priceLabel = itemNode.getChildByName('Price')?.getComponent(Label);
            if (priceLabel) {
                priceLabel.string = `¥${item.price}`;
            }

            const bonusLabel = itemNode.getChildByName('Bonus')?.getComponent(Label);
            if (bonusLabel && item.bonusGems > 0) {
                bonusLabel.string = `赠送 ${item.bonusGems}`;
                bonusLabel.color = new Color(255, 165, 0);
            }

            const buyBtn = itemNode.getChildByName('BuyBtn')?.getComponent(Button);
            if (buyBtn) {
                buyBtn.node.on(Button.EventType.CLICK, () => {
                    this._purchaseItem(item);
                });
            }

            this.purchaseContainer.addChild(itemNode);
        });
    }

    /**
     * 更新月卡
     */
    private _updateMonthlyCard(): void {
        const cardStatus = vipManager.getMonthlyCardStatus('monthly_card_basic');

        if (this.monthlyCardStatusLabel) {
            this.monthlyCardStatusLabel.string = cardStatus.active ? '已激活' : '未激活';
            this.monthlyCardStatusLabel.color = cardStatus.active
                ? new Color(50, 205, 50)
                : new Color(150, 150, 150);
        }

        if (this.monthlyCardDaysLabel) {
            this.monthlyCardDaysLabel.string = cardStatus.active
                ? `剩余 ${cardStatus.remainingDays} 天`
                : '';
        }

        if (this.claimMonthlyCardButton) {
            this.claimMonthlyCardButton.interactable = cardStatus.active && !cardStatus.claimedToday;
            const label = this.claimMonthlyCardButton.node.getComponentInChildren(Label);
            if (label) {
                label.string = cardStatus.claimedToday ? '今日已领取' : '领取每日奖励';
            }
        }
    }

    /**
     * 更新成长基金
     */
    private _updateGrowthFund(): void {
        const fundStatus = vipManager.getGrowthFundStatus('growth_fund_1');

        if (this.growthFundStatusLabel) {
            if (!fundStatus.purchased) {
                this.growthFundStatusLabel.string = '未购买';
            } else {
                const claimedCount = fundStatus.claimedLevels.length;
                this.growthFundStatusLabel.string = `已领取 ${claimedCount} 档`;
            }
        }
    }

    /**
     * 购买商品
     */
    private _purchaseItem(item: VIPPurchaseItem): void {
        const result = vipManager.purchase(item.id);
        if (result.success) {
            this._showToast(`购买成功！获得 ${result.gems} 钻石`);
            this._updateVIPInfo();
        } else {
            this._showToast(result.error || '购买失败');
        }
    }

    /**
     * 领取月卡奖励点击
     */
    private _onClaimMonthlyCardClick(): void {
        const result = vipManager.claimMonthlyCardDailyReward('monthly_card_basic');
        if (result.success) {
            this._showToast('领取成功！');
            this._updateMonthlyCard();
        } else {
            this._showToast(result.error || '领取失败');
        }
    }

    /**
     * 关闭点击
     */
    private _onCloseClick(): void {
        this.hide();
    }

    /**
     * VIP升级回调
     */
    private _onVIPLevelUp(data: { oldLevel: number; newLevel: number }): void {
        this._showToast(`恭喜升级到 VIP ${data.newLevel}！`);
        this._updateVIPInfo();
        this._updatePrivileges();
    }

    /**
     * 购买成功回调
     */
    private _onPurchaseSuccess(data: { itemId: string; gems: number; vipExp: number }): void {
        this._updateVIPInfo();
        this._updatePurchaseItems();
    }

    /**
     * 月卡领取回调
     */
    private _onMonthlyCardClaimed(data: { cardId: string }): void {
        this._updateMonthlyCard();
    }

    /**
     * 显示提示
     */
    private _showToast(message: string): void {
        console.log(`[VIPPanel] ${message}`);
    }
}