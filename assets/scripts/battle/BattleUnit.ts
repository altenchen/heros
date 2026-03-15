/**
 * MVP 简化版战斗单位类
 */

import {
    UnitConfig,
    UnitState,
    BuffData,
    StatusEffect,
    Hex,
    UnitType
} from '../config/GameTypes';

/**
 * 简化版英雄数据
 */
export interface SimpleHeroData {
    id: string;
    name: string;
    attack: number;
    defense: number;
    spellPower: number;
}

/**
 * 战斗单位实现
 */
export class BattleUnit {
    id: string;
    config: UnitConfig;
    hero: SimpleHeroData;
    team: 'player' | 'enemy';
    position: Hex;
    count: number;
    currentHp: number;
    maxHp: number;
    state: UnitState;
    buffs: BuffData[];
    canCounter: boolean;
    hasActed: boolean;

    constructor(
        id: string,
        config: UnitConfig,
        hero: SimpleHeroData,
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

        this.maxHp = config.hp;
        this.currentHp = this.maxHp * count;
    }

    /**
     * 获取当前攻击力
     */
    get attack(): number {
        let baseAttack = this.config.attack;
        baseAttack *= (1 + this.hero.attack * 0.05);
        return Math.floor(baseAttack);
    }

    /**
     * 获取当前防御力
     */
    get defense(): number {
        let baseDefense = this.config.defense;
        baseDefense *= (1 + this.hero.defense * 0.05);
        return Math.floor(baseDefense);
    }

    /**
     * 获取当前速度
     */
    get speed(): number {
        return this.config.speed;
    }

    /**
     * 是否为远程单位
     */
    get isRanged(): boolean {
        return this.config.type === UnitType.SHOOTER;
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
     * 受到伤害
     */
    takeDamage(damage: number): number {
        const actualDamage = Math.min(damage, this.currentHp);
        this.currentHp -= actualDamage;

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
        const [minDmg, maxDmg] = this.config.damage;
        let damage = minDmg + Math.random() * (maxDmg - minDmg);

        damage *= (1 + this.attack * 0.05);

        const defenseReduction = target.defense / (target.defense + 100);
        damage *= (1 - defenseReduction);

        // 远程伤害衰减
        if (isRanged && distance > 4) {
            damage *= 0.5;
        }

        damage *= this.count;

        return Math.floor(damage);
    }

    /**
     * 执行反击
     */
    counterAttack(attacker: BattleUnit): number {
        if (!this.canCounter) {
            return 0;
        }
        this.canCounter = false;
        return this.calculateDamage(attacker, false, 0);
    }

    /**
     * 重置回合状态
     */
    resetTurn(): void {
        this.canCounter = true;
        this.hasActed = false;

        // 更新Buff持续时间
        this.buffs = this.buffs.filter(buff => {
            buff.duration--;
            return buff.duration > 0;
        });
    }

    /**
     * 获取攻击范围
     */
    getAttackRange(): number {
        return this.isRanged ? 10 : 1;
    }

    /**
     * 获取移动范围
     */
    getMoveRange(): number {
        return this.speed;
    }
}