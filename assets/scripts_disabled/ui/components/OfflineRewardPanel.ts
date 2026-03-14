/**
 * 离线奖励面板
 * 显示玩家离线期间获得的奖励
 */

import { _decorator, Node, Label, Button, tween, Vec3, UIOpacity } from 'cc';
import { UIPanel } from './UIPanel';
import { EventCenter } from '../../utils/EventTarget';
import { GameEvent } from '../../utils/EventTarget';
import { ResourceType } from '../../config/GameTypes';
import { playerDataManager } from '../../utils/PlayerDataManager';

const { ccclass, property } = _decorator;

/**
 * 离线奖励数据
 */
interface OfflineRewardData {
    gold: number;
    resources: Partial<Record<ResourceType, number>>;
    offlineHours: number;
}

@ccclass('OfflineRewardPanel')
export class OfflineRewardPanel extends UIPanel {
    @property(Label)
    titleLabel: Label | null = null;

    @property(Label)
    timeLabel: Label | null = null;

    @property(Label)
    goldLabel: Label | null = null;

    @property(Node)
    resourceContent: Node | null = null;

    @property(Button)
    claimButton: Button | null = null;

    @property(Button)
    doubleButton: Button | null = null;

    /** 离线奖励数据 */
    private rewardData: OfflineRewardData | null = null;

    /** 资源项节点池 */
    private resourceItems: Node[] = [];

    /**
     * 面板名称
     */
    getPanelName(): string {
        return 'offline_reward_panel';
    }

    /**
     * 初始化
     */
    protected onInit(): void {
        // 绑定按钮事件
        if (this.claimButton) {
            this.claimButton.node.on(Button.EventType.CLICK, this.onClaimClick, this);
        }

        if (this.doubleButton) {
            this.doubleButton.node.on(Button.EventType.CLICK, this.onDoubleClick, this);
        }
    }

    /**
     * 显示面板
     */
    protected onShow(data?: any): void {
        if (data) {
            this.rewardData = data as OfflineRewardData;
            this.updateUI();
        }

        // 播放入场动画
        this.playEnterAnimation();
    }

    /**
     * 隐藏面板
     */
    protected onHide(): void {
        this.rewardData = null;
    }

    /**
     * 更新UI显示
     */
    private updateUI(): void {
        if (!this.rewardData) return;

        // 更新时间显示
        if (this.timeLabel) {
            const hours = Math.floor(this.rewardData.offlineHours);
            const minutes = Math.floor((this.rewardData.offlineHours - hours) * 60);
            if (hours > 0) {
                this.timeLabel.string = `离线时间: ${hours}小时${minutes}分钟`;
            } else {
                this.timeLabel.string = `离线时间: ${minutes}分钟`;
            }
        }

        // 更新金币显示
        if (this.goldLabel) {
            this.goldLabel.string = this.formatNumber(this.rewardData.gold);
        }

        // 更新资源列表
        this.updateResourceList();
    }

    /**
     * 更新资源列表
     */
    private updateResourceList(): void {
        if (!this.resourceContent || !this.rewardData) return;

        // 清理旧节点
        this.resourceItems.forEach(node => {
            if (node.parent) {
                node.removeFromParent();
                node.active = false;
            }
        });
        this.resourceItems = [];

        // 创建资源项
        const resources = this.rewardData.resources;
        for (const [resource, amount] of Object.entries(resources)) {
            if (amount && amount > 0) {
                const item = this.createResourceItem(resource as ResourceType, amount);
                if (item) {
                    this.resourceItems.push(item);
                }
            }
        }
    }

    /**
     * 创建资源项
     */
    private createResourceItem(resource: ResourceType, amount: number): Node | null {
        // 简化实现：创建一个临时节点显示资源
        // 实际项目中应该使用预制体或对象池
        const node = new Node(`${resource}_item`);
        node.parent = this.resourceContent;

        // 添加标签组件
        const label = node.addComponent(Label);
        label.string = `${this.getResourceName(resource)}: ${this.formatNumber(amount)}`;
        label.fontSize = 20;
        label.lineHeight = 24;

        return node;
    }

    /**
     * 获取资源名称
     */
    private getResourceName(resource: ResourceType): string {
        const names: Partial<Record<ResourceType, string>> = {
            [ResourceType.GOLD]: '金币',
            [ResourceType.WOOD]: '木材',
            [ResourceType.ORE]: '矿石',
            [ResourceType.CRYSTAL]: '水晶',
            [ResourceType.GEM]: '宝石',
            [ResourceType.SULFUR]: '硫磺',
            [ResourceType.MERCURY]: '水银'
        };
        return names[resource] || resource;
    }

    /**
     * 格式化数字
     */
    private formatNumber(num: number): string {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    /**
     * 领取奖励
     */
    private onClaimClick(): void {
        if (!this.rewardData) return;

        // 领取奖励
        const success = playerDataManager.claimOfflineRewards();
        if (success) {
            // 播放音效
            // soundManager.playSFX('sfx_reward_claim');

            // 显示提示
            this.showToast('奖励已领取');

            // 关闭面板
            this.hide();
        }
    }

    /**
     * 双倍奖励(看广告)
     */
    private onDoubleClick(): void {
        // TODO: 调用微信广告API
        console.log('[OfflineRewardPanel] 观看广告获取双倍奖励');

        // 模拟广告完成
        setTimeout(() => {
            if (this.rewardData) {
                // 双倍奖励
                this.rewardData.gold *= 2;
                for (const key of Object.keys(this.rewardData.resources)) {
                    const resource = key as ResourceType;
                    if (this.rewardData.resources[resource]) {
                        this.rewardData.resources[resource]! *= 2;
                    }
                }
                this.updateUI();
                this.showToast('奖励已翻倍');
            }
        }, 100);
    }

    /**
     * 播放入场动画
     */
    private playEnterAnimation(): void {
        if (!this.node) return;

        // 从小到大缩放动画
        this.node.setScale(new Vec3(0.5, 0.5, 1));

        tween(this.node)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();

        // 淡入动画
        const opacity = this.node.getComponent(UIOpacity) || this.node.addComponent(UIOpacity);
        opacity.opacity = 0;

        tween(opacity)
            .to(0.3, { opacity: 255 })
            .start();
    }

    /**
     * 显示提示
     */
    private showToast(message: string): void {
        // 通过UI管理器显示提示
        const game = (window as any).game;
        if (game && game.getUIManager) {
            game.getUIManager().showToast(message);
        }
    }
}