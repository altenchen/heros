/**
 * 战斗特效管理器
 * 管理战斗中的各种视觉效果
 */

import { _decorator, Node, Label, Color, Vec3, tween, UIOpacity, Graphics, UITransform, instantiate, Prefab } from 'cc';
import {
    EffectType,
    EffectConfig,
    DamageNumberConfig,
    SkillEffectConfig,
    BuffIconConfig,
    EffectPresets,
    ColorPresets,
    SkillEffectType
} from '../config/EffectTypes';
import { audioManager } from './AudioManager';
import { battlePoolManager } from './pool';

const { ccclass, property } = _decorator;

/**
 * 飘字节点数据
 */
interface FloatingTextData {
    node: Node;
    label: Label;
    createTime: number;
}

/**
 * 特效管理器
 */
@ccclass('EffectManager')
export class EffectManager {
    private static _instance: EffectManager | null = null;

    /** 特效容器节点 */
    private _container: Node | null = null;

    /** 飘字对象池 */
    private _floatingTextPool: Node[] = [];

    /** 活跃的飘字 */
    private _activeFloatingTexts: FloatingTextData[] = [];

    /** Buff 图标对象池 */
    private _buffIconPool: Node[] = [];

    /** 活跃的 Buff 图标 */
    private _activeBuffIcons: Map<string, Node> = new Map();

    /** 特效ID计数器 */
    private _effectIdCounter: number = 0;

    /** 是否初始化 */
    private _initialized: boolean = false;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): EffectManager {
        if (!EffectManager._instance) {
            EffectManager._instance = new EffectManager();
        }
        return EffectManager._instance;
    }

    /**
     * 初始化特效管理器
     */
    init(container: Node): void {
        if (this._initialized) return;

        this._container = container;
        this._initialized = true;

        // 预热对象池
        this._warmUpPool();

        console.log('[EffectManager] 初始化完成');
    }

    /**
     * 预热对象池
     */
    private _warmUpPool(): void {
        // 预创建10个飘字节点
        for (let i = 0; i < 10; i++) {
            const node = this._createFloatingTextNode();
            node.active = false;
            this._floatingTextPool.push(node);
        }

        console.log('[EffectManager] 对象池预热完成');
    }

    /**
     * 创建飘字节点
     */
    private _createFloatingTextNode(): Node {
        const node = new Node('FloatingText');
        const label = node.addComponent(Label);
        label.fontSize = 24;
        label.lineHeight = 24;
        label.color = Color.WHITE;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;

        // 添加描边效果
        label.enableOutline = true;
        label.outlineColor = new Color(0, 0, 0, 200);
        label.outlineWidth = 2;

        // 添加 UIOpacity 用于淡出动画
        node.addComponent(UIOpacity);

        return node;
    }

    /**
     * 显示伤害飘字
     */
    showDamageNumber(config: DamageNumberConfig, position: Vec3): void {
        if (!this._container) {
            console.warn('[EffectManager] 未初始化容器');
            return;
        }

        // 从池中获取或创建节点
        let node = this._floatingTextPool.pop();
        if (!node) {
            node = this._createFloatingTextNode();
        }

        // 设置节点属性
        node.active = true;
        node.setParent(this._container);
        node.setPosition(position);

        const label = node.getComponent(Label);
        if (!label) return;

        // 设置文本内容
        if (config.isDodge) {
            label.string = '闪避';
            label.color = new Color().fromHEX(ColorPresets.DODGE);
            label.fontSize = config.fontSize || 20;
        } else if (config.isHeal) {
            label.string = `+${Math.floor(config.value)}`;
            label.color = new Color().fromHEX(ColorPresets.HEAL);
            label.fontSize = config.fontSize || 22;
        } else {
            label.string = `-${Math.floor(config.value)}`;
            if (config.isCritical) {
                label.color = new Color().fromHEX(ColorPresets.DAMAGE_CRITICAL);
                label.fontSize = config.fontSize || 32;
                label.string = `暴击! ${label.string}`;
            } else {
                label.color = new Color().fromHEX(ColorPresets.DAMAGE_NORMAL);
                label.fontSize = config.fontSize || 24;
            }
        }

        // 重置透明度
        const opacity = node.getComponent(UIOpacity);
        if (opacity) {
            opacity.opacity = 255;
        }

        // 播放动画
        this._playFloatingTextAnimation(node, config);

        // 记录活跃飘字
        this._activeFloatingTexts.push({
            node,
            label,
            createTime: Date.now()
        });

        // 播放音效
        if (config.isCritical) {
            audioManager.playSFX('sfx_critical_hit');
        }
    }

    /**
     * 播放飘字动画
     */
    private _playFloatingTextAnimation(node: Node, config: DamageNumberConfig): void {
        const duration = config.duration || 1.0;
        const floatHeight = config.floatHeight || 50;
        const startPos = node.position.clone();

        // 随机水平偏移
        const randomOffset = (Math.random() - 0.5) * 30;

        // 使用 tween 动画
        tween(node)
            .to(duration, {
                position: new Vec3(
                    startPos.x + randomOffset,
                    startPos.y + floatHeight,
                    startPos.z
                )
            })
            .start();

        // 淡出动画
        const opacity = node.getComponent(UIOpacity);
        if (opacity) {
            tween(opacity)
                .delay(duration * 0.5)
                .to(duration * 0.5, { opacity: 0 })
                .call(() => {
                    this._recycleFloatingText(node);
                })
                .start();
        }
    }

    /**
     * 回收飘字节点
     */
    private _recycleFloatingText(node: Node): void {
        // 从活跃列表移除
        const index = this._activeFloatingTexts.findIndex(data => data.node === node);
        if (index >= 0) {
            this._activeFloatingTexts.splice(index, 1);
        }

        // 归还到池中
        node.active = false;
        node.removeFromParent();
        this._floatingTextPool.push(node);
    }

    /**
     * 播放技能特效
     */
    playSkillEffect(config: SkillEffectConfig, onComplete?: () => void): void {
        if (!this._container) {
            console.warn('[EffectManager] 未初始化容器');
            return;
        }

        const duration = config.duration || 0.8;

        switch (config.skillType) {
            case SkillEffectType.SINGLE_TARGET:
                this._playSingleTargetEffect(config);
                break;
            case SkillEffectType.AOE:
                this._playAoeEffect(config);
                break;
            case SkillEffectType.PROJECTILE:
                this._playProjectileEffect(config);
                break;
            case SkillEffectType.BUFF:
            case SkillEffectType.DEBUFF:
                this._playBuffEffect(config);
                break;
            default:
                this._playDefaultEffect(config);
        }

        // 播放完成后回调
        if (onComplete) {
            setTimeout(onComplete, duration * 1000);
        }
    }

    /**
     * 播放单体目标特效
     */
    private _playSingleTargetEffect(config: SkillEffectConfig): void {
        if (!config.targets.length) return;

        const target = config.targets[0];
        this._createParticleEffect(
            new Vec3(target.x, target.y, 0),
            EffectType.SKILL,
            config.duration || 0.5
        );
    }

    /**
     * 播放范围特效
     */
    private _playAoeEffect(config: SkillEffectConfig): void {
        config.targets.forEach((target, index) => {
            // 延迟显示每个目标的效果
            setTimeout(() => {
                this._createParticleEffect(
                    new Vec3(target.x, target.y, 0),
                    EffectType.SKILL,
                    config.duration || 0.5
                );
            }, index * 100);
        });
    }

    /**
     * 播放投射物特效
     */
    private _playProjectileEffect(config: SkillEffectConfig): void {
        if (!config.caster || !config.targets.length) return;

        const target = config.targets[0];
        const startPos = new Vec3(config.caster.x, config.caster.y, 0);
        const endPos = new Vec3(target.x, target.y, 0);

        // 创建投射物节点
        const projectile = this._createProjectileNode();
        projectile.setParent(this._container);
        projectile.setPosition(startPos);

        // 飞行动画
        tween(projectile)
            .to(0.3, { position: endPos })
            .call(() => {
                // 到达目标后播放命中效果
                this._createParticleEffect(endPos, EffectType.SKILL, 0.3);
                this._recycleProjectile(projectile);
            })
            .start();
    }

    /**
     * 创建投射物节点
     */
    private _createProjectileNode(): Node {
        const node = new Node('Projectile');
        const graphics = node.addComponent(Graphics);

        // 绘制简单的圆形投射物
        graphics.circle(0, 0, 10);
        graphics.fillColor = new Color(255, 200, 100, 255);
        graphics.fill();

        return node;
    }

    /**
     * 回收投射物节点
     */
    private _recycleProjectile(node: Node): void {
        node.removeFromParent();
        node.destroy();
    }

    /**
     * 播放 Buff/Debuff 特效
     */
    private _playBuffEffect(config: SkillEffectConfig): void {
        config.targets.forEach(target => {
            this._createParticleEffect(
                new Vec3(target.x, target.y, 0),
                config.skillType === SkillEffectType.BUFF ? EffectType.BUFF : EffectType.DEBUFF,
                config.duration || 0.8
            );
        });
    }

    /**
     * 播放默认特效
     */
    private _playDefaultEffect(config: SkillEffectConfig): void {
        config.targets.forEach(target => {
            this._createParticleEffect(
                new Vec3(target.x, target.y, 0),
                EffectType.SKILL,
                config.duration || 0.5
            );
        });
    }

    /**
     * 创建粒子特效
     */
    private _createParticleEffect(position: Vec3, type: EffectType, duration: number): Node {
        const node = new Node(`Effect_${type}`);
        node.setParent(this._container);
        node.setPosition(position);

        const graphics = node.addComponent(Graphics);

        // 根据类型设置颜色
        let color: Color;
        switch (type) {
            case EffectType.BUFF:
                color = new Color(100, 150, 255, 200);
                break;
            case EffectType.DEBUFF:
                color = new Color(200, 100, 150, 200);
                break;
            case EffectType.HEAL_NUMBER:
                color = new Color(100, 255, 100, 200);
                break;
            default:
                color = new Color(255, 200, 100, 200);
        }

        // 绘制扩散圆圈
        graphics.circle(0, 0, 30);
        graphics.fillColor = color;
        graphics.fill();

        // 扩散动画
        tween(node)
            .to(duration * 0.3, { scale: new Vec3(1.5, 1.5, 1) })
            .to(duration * 0.7, { scale: new Vec3(0, 0, 1) })
            .call(() => {
                node.removeFromParent();
                node.destroy();
            })
            .start();

        return node;
    }

    /**
     * 播放攻击特效
     */
    playAttackEffect(from: Vec3, to: Vec3, isRanged: boolean = false): void {
        if (isRanged) {
            // 远程攻击：创建投射物
            this._playProjectileEffect({
                skillId: 'attack_ranged',
                skillType: SkillEffectType.PROJECTILE,
                targets: [{ x: to.x, y: to.y }],
                caster: { x: from.x, y: from.y },
                duration: 0.3
            });
        } else {
            // 近战攻击：在目标位置显示斩击效果
            this._createParticleEffect(to, EffectType.ATTACK, 0.3);
        }

        // 播放攻击音效
        audioManager.playBattleSound('attack');
    }

    /**
     * 播放死亡特效
     */
    playDeathEffect(position: Vec3): void {
        this._createParticleEffect(position, EffectType.DEATH, 1.0);
        audioManager.playBattleSound('death');
    }

    /**
     * 播放暴击特效
     */
    playCriticalEffect(position: Vec3): void {
        // 显示 "暴击!" 文字
        this.showDamageNumber({
            value: 0,
            isCritical: true
        }, position);

        // 播放视觉特效
        this._createParticleEffect(position, EffectType.CRITICAL, 0.5);
    }

    /**
     * 创建 Buff 图标
     */
    createBuffIcon(config: BuffIconConfig, parent: Node): Node | null {
        if (!parent) return null;

        // 从池中获取或创建
        let iconNode = this._buffIconPool.pop();
        if (!iconNode) {
            iconNode = this._createBuffIconNode();
        }

        iconNode.active = true;
        iconNode.setParent(parent);

        // 设置图标
        this._updateBuffIcon(iconNode, config);

        // 存储引用
        this._activeBuffIcons.set(config.id, iconNode);

        return iconNode;
    }

    /**
     * 创建 Buff 图标节点
     */
    private _createBuffIconNode(): Node {
        const node = new Node('BuffIcon');

        // 添加背景
        const bg = new Node('Background');
        bg.setParent(node);
        const bgGraphics = bg.addComponent(Graphics);
        bgGraphics.rect(-15, -15, 30, 30);
        bgGraphics.fillColor = new Color(50, 50, 50, 200);
        bgGraphics.fill();
        bgGraphics.strokeColor = new Color(100, 100, 100, 255);
        bgGraphics.stroke();

        // 添加图标（用颜色方块代替）
        const icon = new Node('Icon');
        icon.setParent(node);
        const iconGraphics = icon.addComponent(Graphics);
        iconGraphics.rect(-12, -12, 24, 24);
        iconGraphics.fillColor = new Color(100, 150, 255, 255);
        iconGraphics.fill();

        // 添加持续回合标签
        const label = new Node('Duration');
        label.setParent(node);
        label.setPosition(new Vec3(0, -20, 0));
        const durationLabel = label.addComponent(Label);
        durationLabel.fontSize = 12;
        durationLabel.lineHeight = 12;
        durationLabel.color = Color.WHITE;
        durationLabel.string = '1';

        return node;
    }

    /**
     * 更新 Buff 图标
     */
    private _updateBuffIcon(node: Node, config: BuffIconConfig): void {
        // 更新图标颜色
        const icon = node.getChildByName('Icon');
        if (icon) {
            const graphics = icon.getComponent(Graphics);
            if (graphics) {
                const color = config.isDebuff
                    ? new Color().fromHEX(ColorPresets.DEBUFF)
                    : new Color().fromHEX(ColorPresets.BUFF);
                graphics.clear();
                graphics.rect(-12, -12, 24, 24);
                graphics.fillColor = color;
                graphics.fill();
            }
        }

        // 更新持续回合
        const label = node.getChildByName('Duration');
        if (label) {
            const durationLabel = label.getComponent(Label);
            if (durationLabel) {
                durationLabel.string = config.duration.toString();
            }
        }

        // 更新叠加层数显示
        if (config.stacks && config.stacks > 1) {
            const stackLabel = node.getChildByName('Stacks');
            if (!stackLabel) {
                const newStackLabel = new Node('Stacks');
                newStackLabel.setParent(node);
                newStackLabel.setPosition(new Vec3(10, 10, 0));
                const stackLabelText = newStackLabel.addComponent(Label);
                stackLabelText.fontSize = 10;
                stackLabelText.lineHeight = 10;
                stackLabelText.color = Color.YELLOW;
                stackLabelText.string = `x${config.stacks}`;
            }
        }
    }

    /**
     * 更新 Buff 图标持续回合
     */
    updateBuffDuration(buffId: string, duration: number): void {
        const iconNode = this._activeBuffIcons.get(buffId);
        if (!iconNode) return;

        const label = iconNode.getChildByName('Duration');
        if (label) {
            const durationLabel = label.getComponent(Label);
            if (durationLabel) {
                durationLabel.string = duration.toString();
            }
        }
    }

    /**
     * 移除 Buff 图标
     */
    removeBuffIcon(buffId: string): void {
        const iconNode = this._activeBuffIcons.get(buffId);
        if (!iconNode) return;

        this._activeBuffIcons.delete(buffId);

        // 归还到池中
        iconNode.active = false;
        iconNode.removeFromParent();
        this._buffIconPool.push(iconNode);
    }

    /**
     * 清除所有 Buff 图标
     */
    clearAllBuffIcons(): void {
        this._activeBuffIcons.forEach((node, id) => {
            node.active = false;
            node.removeFromParent();
            this._buffIconPool.push(node);
        });
        this._activeBuffIcons.clear();
    }

    /**
     * 播放预设特效
     */
    playPresetEffect(presetId: string, position: Vec3, scale: number = 1.0): void {
        const preset = EffectPresets[presetId];
        if (!preset) {
            console.warn(`[EffectManager] 未找到特效预设: ${presetId}`);
            return;
        }

        // 创建特效节点
        const effectNode = this._createParticleEffect(
            position,
            preset.type,
            preset.duration
        );

        // 应用缩放
        if (scale !== 1.0) {
            effectNode.scale = new Vec3(scale, scale, 1);
        }

        // 播放音效
        if (preset.soundId) {
            audioManager.playSFX(preset.soundId);
        }
    }

    /**
     * 清理所有特效
     */
    clear(): void {
        // 回收所有活跃的飘字
        this._activeFloatingTexts.forEach(data => {
            data.node.active = false;
            data.node.removeFromParent();
            this._floatingTextPool.push(data.node);
        });
        this._activeFloatingTexts = [];

        // 清除所有 Buff 图标
        this.clearAllBuffIcons();

        console.log('[EffectManager] 清理完成');
    }

    /**
     * 销毁管理器
     */
    destroy(): void {
        this.clear();

        // 销毁对象池
        this._floatingTextPool.forEach(node => node.destroy());
        this._floatingTextPool = [];

        this._buffIconPool.forEach(node => node.destroy());
        this._buffIconPool = [];

        this._initialized = false;
    }
}

// 导出单例
export const effectManager = EffectManager.getInstance();