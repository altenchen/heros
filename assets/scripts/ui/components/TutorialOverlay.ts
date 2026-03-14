/**
 * 新手引导UI覆盖层
 * 显示高亮、遮罩、对话框等引导元素
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Graphics, Color, Vec3, UITransform, Label, Sprite, SpriteFrame, Button, tween, Vec2, UIOpacity } from 'cc';
import { UIComponent } from './UIComponent';
import {
    TutorialStepConfig,
    StepType,
    HighlightShape,
    DialogPosition,
    TutorialEventType,
    TutorialEventData
} from '../../config/TutorialTypes';
import { tutorialManager } from '../../tutorial/TutorialManager';
import { EventCenter } from '../../utils/EventTarget';

const { ccclass, property } = _decorator;

/** 遮罩颜色 */
const MASK_COLOR = new Color(0, 0, 0, 180);

/** 高亮边框颜色 */
const HIGHLIGHT_BORDER_COLOR = new Color(255, 215, 0);

/** 对话框背景颜色 */
const DIALOG_BG_COLOR = new Color(40, 40, 50, 240);

/** 手指动画颜色 */
const FINGER_COLOR = new Color(255, 255, 255, 230);

/**
 * 教程覆盖层组件
 */
@ccclass('TutorialOverlay')
export class TutorialOverlay extends UIComponent {
    // ==================== 节点引用 ====================

    /** 遮罩层 */
    @property(Graphics)
    maskGraphics: Graphics | null = null;

    /** 高亮容器 */
    @property(Node)
    highlightContainer: Node | null = null;

    /** 对话框容器 */
    @property(Node)
    dialogContainer: Node | null = null;

    /** 对话框背景 */
    @property(Graphics)
    dialogBg: Graphics | null = null;

    /** 讲述者名称 */
    @property(Label)
    speakerLabel: Label | null = null;

    /** 对话内容 */
    @property(Label)
    contentLabel: Label | null = null;

    /** 继续按钮 */
    @property(Node)
    continueButton: Node | null = null;

    /** 按钮文本 */
    @property(Label)
    buttonLabel: Label | null = null;

    /** 指示箭头 */
    @property(Node)
    arrowNode: Node | null = null;

    /** 手指动画节点 */
    @property(Node)
    fingerNode: Node | null = null;

    /** 跳过按钮 */
    @property(Node)
    skipButton: Node | null = null;

    // ==================== 状态 ====================

    /** 当前步骤配置 */
    private _currentStep: TutorialStepConfig | null = null;

    /** 高亮目标节点 */
    private _highlightTarget: Node | null = null;

    /** 是否正在显示 */
    private _isShowing: boolean = false;

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        // 设置层级最高（通过设置兄弟索引）
        this.node.setSiblingIndex(9999);
    }

    /**
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);

        this._bindEvents();
        this.node.active = false;
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(TutorialEventType.STEP_START, this._onStepStart, this);
        EventCenter.on(TutorialEventType.STEP_COMPLETE, this._onStepComplete, this);
        EventCenter.on(TutorialEventType.TUTORIAL_COMPLETE, this._onTutorialComplete, this);

        // 继续按钮
        if (this.continueButton) {
            this.continueButton.on(Node.EventType.TOUCH_END, this._onContinueClick, this);
        }

        // 跳过按钮
        if (this.skipButton) {
            this.skipButton.on(Node.EventType.TOUCH_END, this._onSkipClick, this);
        }
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(TutorialEventType.STEP_START, this._onStepStart, this);
        EventCenter.off(TutorialEventType.STEP_COMPLETE, this._onStepComplete, this);
        EventCenter.off(TutorialEventType.TUTORIAL_COMPLETE, this._onTutorialComplete, this);
    }

    /**
     * 步骤开始回调
     */
    private _onStepStart(eventData: TutorialEventData): void {
        this._currentStep = eventData.step || null;

        if (this._currentStep) {
            this._showStep(this._currentStep);
        }
    }

    /**
     * 步骤完成回调
     */
    private _onStepComplete(eventData: TutorialEventData): void {
        this._hideStep();
    }

    /**
     * 教程完成回调
     */
    private _onTutorialComplete(eventData: TutorialEventData): void {
        this._hideAll();
    }

    /**
     * 显示步骤
     */
    private _showStep(step: TutorialStepConfig): void {
        this.node.active = true;
        this._isShowing = true;

        switch (step.type) {
            case StepType.DIALOG:
                this._showDialog(step);
                break;

            case StepType.HIGHLIGHT:
                this._showHighlight(step);
                break;

            case StepType.WAIT_TAP:
                this._showWaitTap(step);
                break;

            case StepType.WAIT_ACTION:
                this._showWaitAction(step);
                break;

            case StepType.ANIMATION:
                this._showAnimation(step);
                break;

            default:
                // 其他类型直接完成
                tutorialManager.stepComplete();
                break;
        }
    }

    /**
     * 显示对话框
     */
    private _showDialog(step: TutorialStepConfig): void {
        if (!step.dialog) {
            tutorialManager.stepComplete();
            return;
        }

        const dialog = step.dialog;

        // 设置遮罩
        if (this.maskGraphics && dialog.showMask !== false) {
            this._drawFullMask();
        }

        // 设置讲述者
        if (this.speakerLabel) {
            this.speakerLabel.string = dialog.speaker || '';
            this.speakerLabel.node.active = !!dialog.speaker;
        }

        // 设置内容
        if (this.contentLabel) {
            this.contentLabel.string = dialog.content || '';
        }

        // 设置按钮文本
        if (this.buttonLabel) {
            this.buttonLabel.string = dialog.buttonText || '继续';
        }

        // 显示对话框
        if (this.dialogContainer) {
            this.dialogContainer.active = true;
            this._positionDialog(dialog.position);
        }

        // 显示跳过按钮
        if (this.skipButton) {
            const tutorial = tutorialManager.getActiveTutorial();
            this.skipButton.active = tutorial?.type !== 'mandatory';
        }

        // 绘制对话框背景
        this._drawDialogBg();
    }

    /**
     * 显示高亮
     */
    private _showHighlight(step: TutorialStepConfig): void {
        // 查找目标节点
        this._highlightTarget = this._findNodeByPath(step.targetPath || '');

        if (!this._highlightTarget) {
            console.warn('[TutorialOverlay] 未找到高亮目标:', step.targetPath);
            tutorialManager.stepComplete();
            return;
        }

        // 绘制带洞的遮罩
        this._drawMaskWithHole(this._highlightTarget, step.highlightShape, step.highlightPadding);

        // 显示对话框
        if (step.dialog) {
            if (this.dialogContainer) {
                this.dialogContainer.active = true;
            }

            if (this.speakerLabel) {
                this.speakerLabel.string = step.dialog.speaker || '';
                this.speakerLabel.node.active = !!step.dialog.speaker;
            }

            if (this.contentLabel) {
                this.contentLabel.string = step.dialog.content || '';
            }

            if (this.buttonLabel) {
                this.buttonLabel.string = step.dialog.buttonText || '知道了';
            }

            // 定位对话框
            this._positionDialogRelativeToTarget(this._highlightTarget, step.dialog.position);

            // 绘制对话框背景
            this._drawDialogBg();
        }

        // 显示箭头
        if (this.arrowNode && step.dialog?.showArrow) {
            this.arrowNode.active = true;
            this._positionArrow(this._highlightTarget);
        } else if (this.arrowNode) {
            this.arrowNode.active = false;
        }
    }

    /**
     * 显示等待点击
     */
    private _showWaitTap(step: TutorialStepConfig): void {
        if (step.targetPath) {
            this._highlightTarget = this._findNodeByPath(step.targetPath);
            if (this._highlightTarget) {
                this._drawMaskWithHole(this._highlightTarget);
                this._showFingerAnimation(this._highlightTarget);
            }
        } else {
            if (this.maskGraphics) {
                this._drawFullMask();
            }
        }

        // 禁用其他交互
        this._setOtherNodesInteractable(false);
    }

    /**
     * 显示等待操作
     */
    private _showWaitAction(step: TutorialStepConfig): void {
        // 显示提示
        if (step.dialog) {
            this._showDialog(step);
        }

        // 高亮目标
        if (step.waitAction?.targetPath) {
            this._highlightTarget = this._findNodeByPath(step.waitAction.targetPath);
            if (this._highlightTarget) {
                this._drawMaskWithHole(this._highlightTarget);
            }
        }
    }

    /**
     * 显示动画
     */
    private _showAnimation(step: TutorialStepConfig): void {
        if (step.animation?.type === 'finger_point' && step.animation.targetPath) {
            const target = this._findNodeByPath(step.animation.targetPath);
            if (target) {
                this._drawMaskWithHole(target);
                this._showFingerAnimation(target);
            }
        }
    }

    /**
     * 绘制全屏遮罩
     */
    private _drawFullMask(): void {
        if (!this.maskGraphics) {
            return;
        }

        const transform = this.node.getComponent(UITransform);
        if (!transform) {
            return;
        }

        const size = transform.contentSize;
        const width = size.width;
        const height = size.height;

        this.maskGraphics.clear();
        this.maskGraphics.fillColor = MASK_COLOR;
        this.maskGraphics.rect(-width / 2, -height / 2, width, height);
        this.maskGraphics.fill();
    }

    /**
     * 绘制带洞的遮罩
     */
    private _drawMaskWithHole(
        target: Node,
        shape: HighlightShape = HighlightShape.RECTANGLE,
        padding: number = 10
    ): void {
        if (!this.maskGraphics) {
            return;
        }

        const transform = this.node.getComponent(UITransform);
        if (!transform) {
            return;
        }

        const size = transform.contentSize;
        const width = size.width;
        const height = size.height;

        // 获取目标节点在世界坐标系中的位置
        const worldPos = target.getWorldPosition();
        const localPos = new Vec3();
        this.node.inverseTransformPoint(localPos, worldPos);

        const targetTransform = target.getComponent(UITransform);
        const targetSize = targetTransform?.contentSize;
        const targetWidth = (targetSize?.width || 100) + padding * 2;
        const targetHeight = (targetSize?.height || 50) + padding * 2;

        this.maskGraphics.clear();
        this.maskGraphics.fillColor = MASK_COLOR;

        // 使用奇偶填充规则创建洞
        this.maskGraphics.rect(-width / 2, -height / 2, width, height);

        switch (shape) {
            case HighlightShape.CIRCLE:
                this.maskGraphics.circle(localPos.x, localPos.y, Math.max(targetWidth, targetHeight) / 2);
                break;

            case HighlightShape.RECTANGLE:
            default:
                this.maskGraphics.rect(
                    localPos.x - targetWidth / 2,
                    localPos.y - targetHeight / 2,
                    targetWidth,
                    targetHeight
                );
                break;
        }

        this.maskGraphics.fill();

        // 绘制高亮边框
        this.maskGraphics.strokeColor = HIGHLIGHT_BORDER_COLOR;
        this.maskGraphics.lineWidth = 3;

        switch (shape) {
            case HighlightShape.CIRCLE:
                this.maskGraphics.circle(localPos.x, localPos.y, Math.max(targetWidth, targetHeight) / 2);
                break;

            case HighlightShape.RECTANGLE:
            default:
                this.maskGraphics.rect(
                    localPos.x - targetWidth / 2,
                    localPos.y - targetHeight / 2,
                    targetWidth,
                    targetHeight
                );
                break;
        }

        this.maskGraphics.stroke();
    }

    /**
     * 绘制对话框背景
     */
    private _drawDialogBg(): void {
        if (!this.dialogBg || !this.dialogContainer) {
            return;
        }

        const transform = this.dialogContainer.getComponent(UITransform);
        if (!transform) {
            return;
        }

        const size = transform.contentSize;
        const width = size.width;
        const height = size.height;
        const radius = 10;

        this.dialogBg.clear();
        this.dialogBg.fillColor = DIALOG_BG_COLOR;
        this.dialogBg.roundRect(-width / 2, -height / 2, width, height, radius);
        this.dialogBg.fill();
    }

    /**
     * 定位对话框
     */
    private _positionDialog(position: DialogPosition): void {
        if (!this.dialogContainer) {
            return;
        }

        const transform = this.node.getComponent(UITransform);
        if (!transform) {
            return;
        }

        const size = transform.contentSize;
        const width = size.width;
        const height = size.height;

        let x = 0;
        let y = 0;

        switch (position) {
            case DialogPosition.TOP:
                y = height / 4;
                break;
            case DialogPosition.BOTTOM:
                y = -height / 4;
                break;
            case DialogPosition.LEFT:
                x = -width / 4;
                break;
            case DialogPosition.RIGHT:
                x = width / 4;
                break;
            case DialogPosition.CENTER:
            default:
                // 居中
                break;
        }

        this.dialogContainer.setPosition(new Vec3(x, y, 0));
    }

    /**
     * 相对于目标定位对话框
     */
    private _positionDialogRelativeToTarget(target: Node, position: DialogPosition): void {
        if (!this.dialogContainer) {
            return;
        }

        const worldPos = target.getWorldPosition();
        const localPos = new Vec3();
        this.node.inverseTransformPoint(localPos, worldPos);

        const targetTransform = target.getComponent(UITransform);
        const targetHeight = targetTransform?.contentSize.height || 50;

        const dialogTransform = this.dialogContainer.getComponent(UITransform);
        const dialogHeight = dialogTransform?.contentSize.height || 150;

        let x = localPos.x;
        let y = localPos.y;

        if (position === DialogPosition.AUTO || position === DialogPosition.BOTTOM) {
            y = localPos.y - targetHeight / 2 - dialogHeight / 2 - 20;
        } else if (position === DialogPosition.TOP) {
            y = localPos.y + targetHeight / 2 + dialogHeight / 2 + 20;
        }

        this.dialogContainer.setPosition(new Vec3(x, y, 0));
    }

    /**
     * 定位箭头
     */
    private _positionArrow(target: Node): void {
        if (!this.arrowNode) {
            return;
        }

        const worldPos = target.getWorldPosition();
        const localPos = new Vec3();
        this.node.inverseTransformPoint(localPos, worldPos);

        const targetTransform = target.getComponent(UITransform);
        const targetHeight = targetTransform?.contentSize.height || 50;

        this.arrowNode.setPosition(new Vec3(localPos.x, localPos.y + targetHeight / 2 + 10, 0));
    }

    /**
     * 显示手指动画
     */
    private _showFingerAnimation(target: Node): void {
        if (!this.fingerNode) {
            return;
        }

        const worldPos = target.getWorldPosition();
        const localPos = new Vec3();
        this.node.inverseTransformPoint(localPos, worldPos);

        this.fingerNode.setPosition(localPos);
        this.fingerNode.active = true;

        // 手指点击动画
        tween(this.fingerNode)
            .to(0.3, { scale: new Vec3(0.8, 0.8, 1) })
            .to(0.3, { scale: new Vec3(1, 1, 1) })
            .union()
            .repeatForever()
            .start();
    }

    /**
     * 隐藏手指动画
     */
    private _hideFingerAnimation(): void {
        if (this.fingerNode) {
            tween(this.fingerNode).stop();
            this.fingerNode.active = false;
        }
    }

    /**
     * 根据路径查找节点
     */
    private _findNodeByPath(path: string): Node | null {
        if (!path) {
            return null;
        }

        // 从Canvas开始查找
        const canvas = this.node.parent;
        if (!canvas) {
            return null;
        }

        const parts = path.split('/');
        let current: Node | null = canvas;

        for (const part of parts) {
            if (!current) {
                break;
            }
            current = current.getChildByName(part);
        }

        return current;
    }

    /**
     * 设置其他节点是否可交互
     */
    private _setOtherNodesInteractable(interactable: boolean): void {
        // TODO: 实现节点交互控制
    }

    /**
     * 隐藏步骤
     */
    private _hideStep(): void {
        this._isShowing = false;

        if (this.maskGraphics) {
            this.maskGraphics.clear();
        }

        if (this.dialogContainer) {
            this.dialogContainer.active = false;
        }

        if (this.arrowNode) {
            this.arrowNode.active = false;
        }

        this._hideFingerAnimation();
        this._setOtherNodesInteractable(true);
    }

    /**
     * 隐藏所有
     */
    private _hideAll(): void {
        this._hideStep();
        this.node.active = false;
    }

    /**
     * 继续按钮点击
     */
    private _onContinueClick(): void {
        tutorialManager.stepComplete();
    }

    /**
     * 跳过按钮点击
     */
    private _onSkipClick(): void {
        tutorialManager.skipTutorial();
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();
        this._unbindEvents();
    }
}