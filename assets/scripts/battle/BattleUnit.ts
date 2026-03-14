/**
 * 战斗单位类
 */

import {
    BattleUnit as IBattleUnit,
    UnitConfig,
    HeroData,
    UnitState,
    BuffData,
    StatusEffect,
    Hex,
    UnitType,
    EffectType
} from '../config/GameTypes';
import {
    COUNTER_ATTACK_LIMIT,
    RANGED_DAMAGE_DECAY,
    MELEE_PENALTY
} from '../config/GameTypes';
import { battlePoolManager, PooledBuffData } from '../utils/pool';

/**
 * 战斗单位实现
 */
export class BattleUnit implements IBattleUnit {
    id: string;
    config: UnitConfig;
    hero: HeroData;
    team: 'player' | 'enemy';
    position: Hex;
    count: number;
    currentHp: number;
    maxHp: number;
    state: UnitState;
    buffs: BuffData[];
    canCounter: boolean;
    hasActed: boolean;

    // 临时属性修改
    private attackModifier: number = 0;
    private defenseModifier: number = 0;
    private _speedModifier: number = 0;

    /** 获取速度修正值 */
    get speedModifier(): number {
        return this._speedModifier;
    }

    /** 修改速度修正值 */
    modifySpeed(value: number): void {
        this._speedModifier += value;
    }

    constructor(
        id: string,
        config: UnitConfig,
        hero: HeroData,
        team: 'player' | 'enemy',
        position: Hex,
        count: number
    ) {
        this.id = id;
        this.config = config;
        this.hero = hero;
        this.team = team;
        this.position = position;
        this.count = count;
        this.state = UnitState.IDLE;
        this.buffs = [];
        this.canCounter = true;
        this.hasActed = false;

        // 计算单位生命值
        this.maxHp = this.calculateMaxHp();
        this.currentHp = this.maxHp * count;
    }

    /**
     * 计算最大生命值
     */
    private calculateMaxHp(): number {
        return this.config.hp;
    }

    /**
     * 获取当前攻击力（包含英雄加成和buff）
     */
    get attack(): number {
        let baseAttack = this.config.attack;

        // 英雄攻击加成
        baseAttack *= (1 + this.hero.attack * 0.05);

        // Buff加成
        for (const buff of this.buffs) {
            if (buff.status === StatusEffect.BLOODLUST) {
                baseAttack *= (1 + buff.value);
            } else if (buff.status === StatusEffect.BLESS) {
                // 祝福使伤害最大化
                baseAttack *= 1.2;
            }
        }

        // 攻击修正
        baseAttack += this.attackModifier;

        return Math.floor(baseAttack);
    }

    /**
     * 获取当前防御力（包含英雄加成和buff）
     */
    get defense(): number {
        let baseDefense = this.config.defense;

        // 英雄防御加成
        baseDefense *= (1 + this.hero.defense * 0.05);

        // Buff加成
        for (const buff of this.buffs) {
            if (buff.status === StatusEffect.SHIELD) {
                baseDefense *= (1 + buff.value);
            }
        }

        // 防御修正
        baseDefense += this.defenseModifier;

        // 状态效果
        if (this.hasStatus(StatusEffect.AGING)) {
            baseDefense *= 0.9; // 衰老降低10%防御
        }

        return Math.floor(baseDefense);
    }

    /**
     * 获取当前速度（包含buff）
     */
    get speed(): number {
        let baseSpeed = this.config.speed;

        // Buff修改
        for (const buff of this.buffs) {
            if (buff.status === StatusEffect.HASTE) {
                baseSpeed += buff.value;
            } else if (buff.status === StatusEffect.SLOW) {
                baseSpeed -= buff.value;
            }
        }

        // 速度修正
        baseSpeed += this.speedModifier;

        return Math.max(1, Math.floor(baseSpeed));
    }

    /**
     * 获取攻击类型
     */
    get unitType(): UnitType {
        return this.config.type;
    }

    /**
     * 是否为远程单位
     */
    get isRanged(): boolean {
        return this.config.type === UnitType.SHOOTER;
    }

    /**
     * 是否为飞行单位
     */
    get isFlying(): boolean {
        return this.config.type === UnitType.ASSAULT;
    }

    /**
     * 检查是否存活
     */
    isAlive(): boolean {
        return this.currentHp > 0 && this.count > 0;
    }

    /**
     * 检查是否拥有某状态
     */
    hasStatus(status: StatusEffect): boolean {
        return this.buffs.some(buff => buff.status === status);
    }

    /**
     * 添加Buff
     */
    addBuff(buff: BuffData): void {
        // 检查是否已存在同类buff
        const existingIndex = this.buffs.findIndex(b => b.status === buff.status);

        if (existingIndex >= 0) {
            // 归还旧的buff到池中（如果是池化对象）
            const oldBuff = this.buffs[existingIndex];
            this.returnBuffToPool(oldBuff);

            // 设置新的buff
            this.buffs[existingIndex] = buff;
        } else {
            this.buffs.push(buff);
        }
    }

    /**
     * 添加池化的Buff
     */
    addPooledBuff(
        status: StatusEffect,
        duration: number,
        value: number,
        source: string
    ): PooledBuffData {
        const buff = battlePoolManager.getBuff({
            id: `${this.id}_${status}_${Date.now()}`,
            status,
            duration,
            value,
            source
        });
        this.addBuff(buff);
        return buff;
    }

    /**
     * 归还buff到池中
     */
    private returnBuffToPool(buff: BuffData): void {
        // 检查是否是池化对象
        if ('reset' in buff && typeof (buff as any).reset === 'function') {
            (buff as PooledBuffData).reset();
            battlePoolManager.returnBuff(buff as PooledBuffData);
        }
    }

    /**
     * 移除Buff
     */
    removeBuff(status: StatusEffect): void {
        const removedBuffs = this.buffs.filter(buff => buff.status === status);
        // 归还移除的buff到池中
        removedBuffs.forEach(buff => this.returnBuffToPool(buff));
        // 保留其他buff
        this.buffs = this.buffs.filter(buff => buff.status !== status);
    }

    /**
     * 清除所有Buff
     */
    clearBuffs(): void {
        // 归还所有buff到池中
        this.buffs.forEach(buff => this.returnBuffToPool(buff));
        this.buffs = [];
    }

    /**
     * 更新Buff持续时间
     */
    updateBuffs(): void {
        const expiredBuffs: BuffData[] = [];

        this.buffs = this.buffs.filter(buff => {
            buff.duration--;
            if (buff.duration <= 0) {
                expiredBuffs.push(buff);
                return false;
            }
            return true;
        });

        // 归还过期的buff到池中
        expiredBuffs.forEach(buff => this.returnBuffToPool(buff));
    }

    /**
     * 受到伤害
     */
    takeDamage(damage: number): number {
        const actualDamage = Math.min(damage, this.currentHp);
        this.currentHp -= actualDamage;

        // 更新单位数量
        while (this.currentHp <= 0 && this.count > 0) {
            this.count--;
            if (this.count > 0) {
                this.currentHp += this.maxHp;
            }
        }

        if (this.currentHp <= 0) {
            this.state = UnitState.DEAD;
        }

        return actualDamage;
    }

    /**
     * 治疗
     */
    heal(amount: number): number {
        const maxTotalHp = this.maxHp * this.count;
        const actualHeal = Math.min(amount, maxTotalHp - this.currentHp);
        this.currentHp += actualHeal;
        return actualHeal;
    }

    /**
     * 计算造成的伤害
     */
    calculateDamage(target: BattleUnit, isRanged: boolean = false, distance: number = 0): number {
        // 基础伤害
        const [minDmg, maxDmg] = this.config.damage;
        let damage = minDmg + Math.random() * (maxDmg - minDmg);

        // 攻击力加成
        damage *= (1 + this.attack * 0.05);

        // 防御力减伤
        const defenseReduction = target.defense / (target.defense + 100);
        damage *= (1 - defenseReduction);

        // 远程伤害衰减
        if (isRanged) {
            if (distance > RANGED_DAMAGE_DECAY.CLOSE_RANGE) {
                damage *= RANGED_DAMAGE_DECAY.FAR_DAMAGE;
            } else {
                damage *= RANGED_DAMAGE_DECAY.CLOSE_DAMAGE;
            }
        }

        // 祝福效果
        if (this.hasStatus(StatusEffect.BLESS)) {
            damage = this.config.damage[1]; // 最大伤害
        }

        // 诅咒效果
        if (this.hasStatus(StatusEffect.CURSE)) {
            damage = this.config.damage[0]; // 最小伤害
        }

        // 单位数量加成
        damage *= this.count;

        return Math.floor(damage);
    }

    /**
     * 执行反击
     */
    counterAttack(attacker: BattleUnit): number {
        if (!this.canCounter || this.hasStatus(StatusEffect.STUN) || this.hasStatus(StatusEffect.STONE)) {
            return 0;
        }

        // 狮鹫特殊处理：无限反击
        if (this.config.specialty.id === 'griffin_counter') {
            // 不消耗反击次数
        } else {
            this.canCounter = false;
        }

        return this.calculateDamage(attacker, false, 0);
    }

    /**
     * 重置回合状态
     */
    resetTurn(): void {
        this.canCounter = true;
        this.hasActed = false;
        this.updateBuffs();
    }

    /**
     * 获取攻击范围
     */
    getAttackRange(): number {
        if (this.isRanged) {
            return 10; // 远程攻击范围
        }
        return 1; // 近战攻击范围
    }

    /**
     * 获取移动范围
     */
    getMoveRange(): number {
        return this.speed;
    }

    /**
     * 序列化为普通对象
     */
    toJSON(): IBattleUnit {
        return {
            id: this.id,
            config: this.config,
            hero: this.hero,
            team: this.team,
            position: { ...this.position },
            count: this.count,
            currentHp: this.currentHp,
            maxHp: this.maxHp,
            state: this.state,
            buffs: [...this.buffs],
            canCounter: this.canCounter,
            hasActed: this.hasActed
        };
    }

    /**
     * 修改速度修正值
     * @param value 修正值（可为负数）
     */
    modifySpeedModifier(value: number): void {
        this.speedModifier += value;
    }
}