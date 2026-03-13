/**
 * 签到面板
 * 显示每日签到界面、奖励预览、补签功能
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Component, Node, Label, Sprite, Button, Color, tween, Vec3, UIOpacity } from 'cc';
import { UIPanel, PanelConfig } from './UIPanel';
import { dailySigninManager, getActiveSigninCycle } from '../signin';
import {
    SigninState,
    SigninPreview,
    SigninRewardConfig,
    RewardType,
    SigninEventType,
    SigninEventData
} from '../config/DailySigninTypes';
import { soundManager } from '../audio';
import { UISoundType } from '../config/AudioTypes';

const { ccclass, property } = _decorator;

/**
 * 签到项配置
 */
interface SigninItemConfig {
    day: number;
    rewards: SigninRewardConfig['rewards'];
    state: SigninState;
    isSpecial: boolean;
    node?: Node;
}

/**
 * 签到面板组件
 */
@ccclass('SigninPanel')
export class SigninPanel extends UIPanel {
    /** 奖励项容器 */
    @property(Node)
    rewardContainer: Node | null = null;

    /** 奖励项模板 */
    @property(Node)
    rewardItemTemplate: Node | null = null;

    /** 签到按钮 */
    @property(Button)
    signinButton: Button | null = null;

    /** 补签按钮 */
    @property(Button)
    makeupButton: Button | null = null;

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    /** 连续签到天数标签 */
    @property(Label)
    continuousLabel: Label | null = null;

    /** 已签到天数标签 */
    @property(Label)
    signedDaysLabel: Label | null = null;

    /** 补签剩余次数标签 */
    @property(Label)
    makeupCountLabel: Label | null = null;

    /** 补签费用标签 */
    @property(Label)
    makeupCostLabel: Label | null = null;

    /** 周期标题 */
    @property(Label)
    cycleTitleLabel: Label | null = null;

    /** 签到预览数据 */
    private _preview: SigninPreview | null = null;

    /** 签到项列表 */
    private _signinItems: SigninItemConfig[] = [];

    /**
     * 面板配置
     */
    static getPanelConfig(): PanelConfig {
        return {
            layer: 3, // POPUP层
            animation: 'scale',
            showMask: true,
            closeOnMask: true
        };
    }

    /**
     * 组件加载
     */
    onLoad(): void {
        super.onLoad?.();

        // 绑定按钮事件
        if (this.signinButton) {
            this.signinButton.node.on(Button.EventType.CLICK, this._onSigninClick, this);
        }

        if (this.makeupButton) {
            this.makeupButton.node.on(Button.EventType.CLICK, this._onMakeupClick, this);
        }

        if (this.closeButton) {
            this.closeButton.node.on(Button.EventType.CLICK, this._onCloseClick, this);
        }
    }

    /**
     * 组件启动
     */
    start(): void {
        this._loadSigninData();
        this._setupEventListeners();
    }

    /**
     * 设置事件监听
     */
    private _setupEventListeners(): void {
        // 监听签到成功事件
        // EventCenter.on(SigninEventType.SIGNIN_SUCCESS, this._onSigninSuccess, this);
        // EventCenter.on(SigninEventType.MAKEUP_SUCCESS, this._onMakeupSuccess, this);
    }

    /**
     * 加载签到数据
     */
    private _loadSigninData(): void {
        this._preview = dailySigninManager.getSigninPreview();

        if (!this._preview) {
            console.warn('[SigninPanel] 无签到活动');
            this._closePanel();
            return;
        }

        this._updateUI();
        this._createRewardItems();
    }

    /**
     * 更新UI显示
     */
    private _updateUI(): void {
        if (!this._preview) {
            return;
        }

        const { cycle, progress, todayState } = this._preview;

        // 更新周期标题
        if (this.cycleTitleLabel) {
            this.cycleTitleLabel.string = cycle.name;
        }

        // 更新连续签到天数
        if (this.continuousLabel) {
            this.continuousLabel.string = `连续签到: ${progress.continuousDays}天`;
        }

        // 更新已签到天数
        if (this.signedDaysLabel) {
            this.signedDaysLabel.string = `${progress.signedDays}/${cycle.totalDays}`;
        }

        // 更新补签次数
        const remainingMakeup = dailySigninManager.getRemainingMakeupCount();
        if (this.makeupCountLabel) {
            this.makeupCountLabel.string = `补签次数: ${remainingMakeup}`;
        }

        // 更新按钮状态
        this._updateButtonStates(todayState);
    }

    /**
     * 更新按钮状态
     */
    private _updateButtonStates(state: SigninState): void {
        if (this.signinButton) {
            const canSignin = state === SigninState.NOT_SIGNED;
            this.signinButton.interactable = canSignin;

            // 更新按钮文字
            const label = this.signinButton.node.getComponentInChildren(Label);
            if (label) {
                label.string = state === SigninState.SIGNED ? '已签到' : '签到';
            }
        }

        if (this.makeupButton) {
            const canMakeup = state === SigninState.CAN_MAKEUP;
            this.makeupButton.interactable = canMakeup;
            this.makeupButton.node.active = canMakeup;

            if (canMakeup && this._preview) {
                // 计算补签费用
                const progress = this._preview.progress;
                const cost = {
                    gold: 500 * (1 + progress.makeupUsedCount * 0.5),
                    gems: 50 * (1 + progress.makeupUsedCount * 0.5)
                };

                if (this.makeupCostLabel) {
                    this.makeupCostLabel.string = `${Math.floor(cost.gold)}金币 ${Math.floor(cost.gems)}钻石`;
                }
            }
        }
    }

    /**
     * 创建奖励项
     */
    private _createRewardItems(): void {
        if (!this._preview || !this.rewardContainer || !this.rewardItemTemplate) {
            return;
        }

        // 清除现有项
        this._clearRewardItems();

        const { cycle, progress } = this._preview;
        this._signinItems = [];

        cycle.rewards.forEach((rewardConfig, index) => {
            const itemNode = this._createRewardItem(rewardConfig, index, progress.claimedDays.includes(rewardConfig.day));
            this._signinItems.push({
                day: rewardConfig.day,
                rewards: rewardConfig.rewards,
                state: progress.claimedDays.includes(rewardConfig.day) ? SigninState.SIGNED : SigninState.NOT_SIGNED,
                isSpecial: rewardConfig.isSpecial || false,
                node: itemNode
            });
        });
    }

    /**
     * 创建单个奖励项
     */
    private _createRewardItem(config: SigninRewardConfig, index: number, claimed: boolean): Node {
        const itemNode = this.rewardItemTemplate!.clone();
        itemNode.active = true;
        itemNode.parent = this.rewardContainer;

        // 设置天数
        const dayLabel = itemNode.getChildByName('DayLabel')?.getComponent(Label);
        if (dayLabel) {
            dayLabel.string = `第${config.day}天`;
        }

        // 设置奖励图标和数量
        this._setRewardDisplay(itemNode, config.rewards);

        // 设置特殊标记
        if (config.isSpecial) {
            const specialMark = itemNode.getChildByName('SpecialMark');
            if (specialMark) {
                specialMark.active = true;
            }
        }

        // 设置已领取状态
        if (claimed) {
            this._setItemClaimed(itemNode);
        }

        // 当前天高亮
        if (config.day === (this._preview?.progress.signedDays || 0) + 1 && !claimed) {
            this._setItemCurrent(itemNode);
        }

        return itemNode;
    }

    /**
     * 设置奖励显示
     */
    private _setRewardDisplay(itemNode: Node, rewards: SigninRewardConfig['rewards']): void {
        rewards.forEach((reward, index) => {
            const rewardSlot = itemNode.getChildByName(`Reward${index + 1}`);
            if (!rewardSlot) {
                return;
            }

            // 设置图标
            const iconSprite = rewardSlot.getChildByName('Icon')?.getComponent(Sprite);
            if (iconSprite) {
                // 根据奖励类型加载图标
                // this._loadRewardIcon(iconSprite, reward.type);
            }

            // 设置数量
            const amountLabel = rewardSlot.getChildByName('Amount')?.getComponent(Label);
            if (amountLabel) {
                amountLabel.string = this._formatRewardAmount(reward);
            }
        });
    }

    /**
     * 格式化奖励数量
     */
    private _formatRewardAmount(reward: { type: RewardType; amount: number }): string {
        if (reward.amount >= 10000) {
            return `${(reward.amount / 10000).toFixed(1)}万`;
        }
        return reward.amount.toString();
    }

    /**
     * 设置项为已领取状态
     */
    private _setItemClaimed(itemNode: Node): void {
        const opacity = itemNode.getComponent(UIOpacity) || itemNode.addComponent(UIOpacity);
        opacity.opacity = 150;

        // 添加已领取标记
        const claimedMark = itemNode.getChildByName('ClaimedMark');
        if (claimedMark) {
            claimedMark.active = true;
        }
    }

    /**
     * 设置项为当前可签到
     */
    private _setItemCurrent(itemNode: Node): void {
        // 添加高亮效果
        const bg = itemNode.getChildByName('Background');
        if (bg) {
            const sprite = bg.getComponent(Sprite);
            if (sprite) {
                sprite.color = new Color(255, 220, 100);
            }
        }
    }

    /**
     * 清除奖励项
     */
    private _clearRewardItems(): void {
        if (!this.rewardContainer) {
            return;
        }

        this.rewardContainer.children.forEach(child => {
            if (child !== this.rewardItemTemplate) {
                child.destroy();
            }
        });

        this._signinItems = [];
    }

    /**
     * 签到按钮点击
     */
    private _onSigninClick(): void {
        soundManager.playUISound(UISoundType.BUTTON_CLICK);

        const result = dailySigninManager.signin();

        if (result.success) {
            this._onSigninSuccess(result);
        } else {
            this._showError(result.error || '签到失败');
        }
    }

    /**
     * 补签按钮点击
     */
    private _onMakeupClick(): void {
        soundManager.playUISound(UISoundType.BUTTON_CLICK);

        if (!this._preview) {
            return;
        }

        // 补签上一天
        const yesterday = this._preview.progress.signedDays;
        const result = dailySigninManager.makeup(yesterday);

        if (result.success) {
            this._onMakeupSuccess(result);
        } else {
            this._showError(result.error || '补签失败');
        }
    }

    /**
     * 关闭按钮点击
     */
    private _onCloseClick(): void {
        soundManager.playUISound(UISoundType.BUTTON_CLICK);
        this._closePanel();
    }

    /**
     * 签到成功处理
     */
    private _onSigninSuccess(result: any): void {
        // 播放音效
        soundManager.playUISound(UISoundType.REWARD);

        // 显示奖励
        this._showRewardPopup(result.rewards, result.continuousBonus);

        // 刷新UI
        this._loadSigninData();
    }

    /**
     * 补签成功处理
     */
    private _onMakeupSuccess(result: any): void {
        // 播放音效
        soundManager.playUISound(UISoundType.SUCCESS);

        // 显示奖励
        this._showRewardPopup(result.rewards);

        // 刷新UI
        this._loadSigninData();
    }

    /**
     * 显示奖励弹窗
     */
    private _showRewardPopup(rewards: any[], bonus?: any): void {
        // TODO: 实现奖励弹窗显示
        console.log('[SigninPanel] 获得奖励:', rewards, bonus);
    }

    /**
     * 显示错误提示
     */
    private _showError(message: string): void {
        // TODO: 实现错误提示
        console.warn('[SigninPanel]', message);
    }

    /**
     * 关闭面板
     */
    private _closePanel(): void {
        // 通过UIManager关闭
        // UIManager.getInstance().hideUI('signin_panel');
        this.node.active = false;
    }

    /**
     * 组件销毁
     */
    onDestroy(): void {
        this._clearRewardItems();

        // 移除事件监听
        // EventCenter.off(SigninEventType.SIGNIN_SUCCESS, this._onSigninSuccess, this);
        // EventCenter.off(SigninEventType.MAKEUP_SUCCESS, this._onMakeupSuccess, this);
    }
}