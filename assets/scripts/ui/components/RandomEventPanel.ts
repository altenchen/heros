/**
 * 随机事件面板
 * 显示随机事件内容和选项
 */

import { _decorator, Node, Label, Button, Sprite, Color, tween, Vec3 } from 'cc';
import { UIPanel } from './UIPanel';
import { RandomEventConfig, EventOption, EventEffect } from '../../config/RandomEventTypes';
import { randomEventManager } from '../../randomevent/RandomEventManager';

const { ccclass, property } = _decorator;

/**
 * 选项按钮数据
 */
interface OptionButtonData {
    option: EventOption;
    button: Node;
    canSelect: boolean;
}

@ccclass('RandomEventPanel')
export class RandomEventPanel extends UIPanel {
    /** 事件标题 */
    @property(Label)
    titleLabel: Label | null = null;

    /** 事件描述 */
    @property(Label)
    descriptionLabel: Label | null = null;

    /** 事件图标 */
    @property(Sprite)
    iconSprite: Sprite | null = null;

    /** 稀有度标签 */
    @property(Label)
    rarityLabel: Label | null = null;

    /** 选项容器 */
    @property(Node)
    optionsContainer: Node | null = null;

    /** 选项按钮预制体 */
    @property(Node)
    optionButtonTemplate: Node | null = null;

    /** 关闭按钮 */
    @property(Button)
    closeButton: Button | null = null;

    /** 跳过按钮 */
    @property(Button)
    skipButton: Button | null = null;

    /** 当前事件 */
    private currentEvent: RandomEventConfig | null = null;

    /** 选项按钮列表 */
    private optionButtons: OptionButtonData[] = [];

    /** 回调函数 */
    private callbacks: {
        checkRequirement?: (type: string, id: string, amount: number) => boolean;
        onEffectApplied?: (effects: EventEffect[]) => void;
    } = {};

    /**
     * 面板打开
     */
    onOpen(data: {
        event: RandomEventConfig;
        callbacks?: {
            checkRequirement?: (type: string, id: string, amount: number) => boolean;
            onEffectApplied?: (effects: EventEffect[]) => void;
        };
    }): void {
        this.currentEvent = data.event;
        this.callbacks = data.callbacks || {};

        this.updateUI();
        this.playEnterAnimation();
    }

    /**
     * 更新UI
     */
    private updateUI(): void {
        if (!this.currentEvent) return;

        // 设置标题
        if (this.titleLabel) {
            this.titleLabel.string = this.currentEvent.name;
        }

        // 设置描述
        if (this.descriptionLabel) {
            this.descriptionLabel.string = this.currentEvent.description;
        }

        // 设置稀有度
        if (this.rarityLabel) {
            this.rarityLabel.string = this.getRarityText(this.currentEvent.rarity);
            this.rarityLabel.color = this.getRarityColor(this.currentEvent.rarity);
        }

        // 设置跳过按钮
        if (this.skipButton) {
            this.skipButton.node.active = this.currentEvent.skippable;
        }

        // 创建选项按钮
        this.createOptionButtons();
    }

    /**
     * 创建选项按钮
     */
    private createOptionButtons(): void {
        // 清理旧按钮
        this.optionButtons.forEach(data => {
            if (data.button && data.button.isValid) {
                data.button.destroy();
            }
        });
        this.optionButtons = [];

        if (!this.currentEvent || !this.optionsContainer || !this.optionButtonTemplate) return;

        this.currentEvent.options.forEach((option, index) => {
            // 检查是否可以选择
            const canSelect = this.checkOptionRequirements(option);

            // 克隆按钮模板
            const buttonNode = this.optionButtonTemplate.clone();
            buttonNode.active = true;
            buttonNode.name = `Option_${option.id}`;

            // 设置按钮位置
            buttonNode.setPosition(new Vec3(0, -index * 80, 0));

            // 设置按钮文本
            const label = buttonNode.getComponentInChildren(Label);
            if (label) {
                label.string = option.text;
                if (!canSelect) {
                    label.color = new Color(128, 128, 128);
                }
            }

            // 设置描述
            const descLabel = buttonNode.getChildByName('Description')?.getComponent(Label);
            if (descLabel && option.description) {
                descLabel.string = option.description;
            }

            // 设置按钮点击事件
            const button = buttonNode.getComponent(Button);
            if (button) {
                button.interactable = canSelect;
                button.node.on(Button.EventType.CLICK, () => this.onOptionClick(option), this);
            }

            // 添加到容器
            this.optionsContainer.addChild(buttonNode);

            this.optionButtons.push({
                option,
                button: buttonNode,
                canSelect
            });
        });
    }

    /**
     * 检查选项需求
     */
    private checkOptionRequirements(option: EventOption): boolean {
        if (!option.requirements || option.requirements.length === 0) {
            return true;
        }

        if (!this.callbacks.checkRequirement) {
            return true;
        }

        return option.requirements.every(req =>
            this.callbacks.checkRequirement!(req.type, req.id, req.amount)
        );
    }

    /**
     * 选项点击
     */
    private onOptionClick(option: EventOption): void {
        console.log(`[RandomEventPanel] 选择选项: ${option.text}`);

        // 选择选项
        const result = randomEventManager.selectOption(option.id, {
            checkRequirement: this.callbacks.checkRequirement
        });

        if (result.success && result.effects) {
            // 回调
            if (this.callbacks.onEffectApplied) {
                this.callbacks.onEffectApplied(result.effects);
            }

            // 关闭面板
            this.playExitAnimation(() => {
                this.hide();
            });
        }
    }

    /**
     * 关闭按钮点击
     */
    onCloseClick(): void {
        // 尝试跳过
        if (randomEventManager.skipEvent()) {
            this.playExitAnimation(() => {
                this.hide();
            });
        }
    }

    /**
     * 跳过按钮点击
     */
    onSkipClick(): void {
        if (randomEventManager.skipEvent()) {
            this.playExitAnimation(() => {
                this.hide();
            });
        }
    }

    /**
     * 获取稀有度文本
     */
    private getRarityText(rarity: string): string {
        const texts: Record<string, string> = {
            common: '普通',
            rare: '稀有',
            epic: '史诗',
            legendary: '传说'
        };
        return texts[rarity] || rarity;
    }

    /**
     * 获取稀有度颜色
     */
    private getRarityColor(rarity: string): Color {
        const colors: Record<string, Color> = {
            common: new Color(255, 255, 255),
            rare: new Color(30, 144, 255),
            epic: new Color(148, 0, 211),
            legendary: new Color(255, 215, 0)
        };
        return colors[rarity] || new Color(255, 255, 255);
    }

    /**
     * 播放进入动画
     */
    private playEnterAnimation(): void {
        if (!this.node) return;

        this.node.scale = new Vec3(0.5, 0.5, 1);
        tween(this.node)
            .to(0.3, { scale: new Vec3(1, 1, 1) }, { easing: 'backOut' })
            .start();
    }

    /**
     * 播放退出动画
     */
    private playExitAnimation(callback: () => void): void {
        if (!this.node) {
            callback();
            return;
        }

        tween(this.node)
            .to(0.2, { scale: new Vec3(0.5, 0.5, 1) }, { easing: 'backIn' })
            .call(callback)
            .start();
    }

    /**
     * 面板关闭
     */
    onClose(): void {
        this.currentEvent = null;
        this.callbacks = {};

        // 清理按钮
        this.optionButtons.forEach(data => {
            if (data.button && data.button.isValid) {
                data.button.destroy();
            }
        });
        this.optionButtons = [];
    }
}