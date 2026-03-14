/**
 * 关卡战斗桥接器
 * 连接关卡系统与战斗系统，处理关卡挑战的完整流程
 * 遵循阿里巴巴开发者手册规范
 */

import { BattleManager } from '../battle/BattleManager';
import { BattleEventType, BattleResult } from '../battle/BattleManager';
import { BattleUnit } from '../battle/BattleUnit';
import { levelManager, LevelEventType } from './LevelManager';
import { LevelConfigMap, ChapterConfigMap } from '../config/levels.json';
import { LevelChallengeResult, StarRating } from '../config/LevelTypes';
import { UnitConfigMap } from '../../configs/units.json';
import { HeroConfigMap } from '../../configs/heroes.json';
import { Hex, BattleUnit as IBattleUnit, Faction } from '../config/GameTypes';
import { EventCenter } from '../utils/EventTarget';
import { playerDataManager } from '../utils/PlayerDataManager';
import { inventoryManager } from '../inventory';
import { ItemEffectType } from '../config/InventoryTypes';
import { rewardManager, RewardConfig } from '../utils/RewardManager';
import { UIManager } from '../ui/UIManager';

/**
 * 关卡战斗事件类型
 */
export enum LevelBattleEventType {
    /** 战斗准备开始 */
    BATTLE_PREPARE = 'level_battle_prepare',
    /** 战斗开始 */
    BATTLE_STARTED = 'level_battle_started',
    /** 战斗胜利 */
    BATTLE_VICTORY = 'level_battle_victory',
    /** 战斗失败 */
    BATTLE_DEFEAT = 'level_battle_defeat',
    /** 奖励发放 */
    REWARD_DISTRIBUTED = 'level_reward_distributed'
}

/**
 * 关卡战斗事件数据
 */
export interface LevelBattleEventData {
    levelId: string;
    battleResult?: BattleResult;
    challengeResult?: LevelChallengeResult;
    rewards?: any;
}

/**
 * 玩家战斗单位配置
 */
export interface PlayerBattleUnit {
    configId: string;
    count: number;
    position: Hex;
}

/**
 * 关卡战斗桥接器
 *
 * 使用示例:
 * ```typescript
 * // 1. 玩家点击关卡挑战按钮
 * const bridge = LevelBattleBridge.getInstance();
 *
 * // 2. 准备战斗（检查体力、创建战斗）
 * const canStart = bridge.prepareBattle('level_1_1');
 * if (canStart) {
 *     // 3. 开始战斗（加载战斗场景）
 *     bridge.startBattle();
 * }
 *
 * // 4. 战斗结束后调用
 * bridge.finishBattle(winner);
 * ```
 */
export class LevelBattleBridge {
    private static _instance: LevelBattleBridge | null = null;

    /** 当前战斗管理器 */
    private _battleManager: BattleManager | null = null;

    /** 当前挑战的关卡 ID */
    private _currentLevelId: string | null = null;

    /** 玩家单位 */
    private _playerUnits: PlayerBattleUnit[] = [];

    /** 初始玩家单位状态（用于计算伤亡） */
    private _initialPlayerUnits: Map<string, { count: number; totalHP: number }> = new Map();

    /** 是否使用自动战斗 */
    private _useAutoBattle: boolean = true;

    /** 战斗回调 */
    private _onBattleEndCallback: ((result: LevelChallengeResult) => void) | null = null;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): LevelBattleBridge {
        if (!LevelBattleBridge._instance) {
            LevelBattleBridge._instance = new LevelBattleBridge();
        }
        return LevelBattleBridge._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        console.log('[LevelBattleBridge] 初始化完成');
    }

    /**
     * 准备战斗
     * @param levelId 关卡 ID
     * @param playerUnits 玩家单位配置（可选，不传则使用玩家当前部队）
     * @returns 是否成功准备
     */
    prepareBattle(levelId: string, playerUnits?: PlayerBattleUnit[]): boolean {
        const levelConfig = LevelConfigMap.get(levelId);
        if (!levelConfig) {
            console.warn('[LevelBattleBridge] 关卡配置不存在:', levelId);
            return false;
        }

        // 检查关卡是否可挑战
        if (!levelManager.canChallenge(levelId)) {
            console.warn('[LevelBattleBridge] 关卡不可挑战:', levelId);
            return false;
        }

        // 开始关卡挑战（扣除体力）
        if (!levelManager.startChallenge(levelId)) {
            console.warn('[LevelBattleBridge] 无法开始挑战:', levelId);
            return false;
        }

        this._currentLevelId = levelId;

        // 获取玩家单位
        this._playerUnits = playerUnits || this._getDefaultPlayerUnits();

        // 创建战斗管理器
        this._battleManager = new BattleManager();

        // 准备敌方单位
        const enemyUnits = this._createEnemyUnits(levelConfig);

        // 获取玩家英雄
        const playerHero = this._getPlayerHero();

        // 获取敌方英雄
        const enemyHero = levelConfig.enemyHero
            ? this._getEnemyHero(levelConfig.enemyHero.heroId, levelConfig.enemyHero.level)
            : null;

        // 初始化战斗
        const playerBattleUnits = this._playerUnits.map(u => ({
            config: UnitConfigMap.get(u.configId)!,
            count: u.count,
            position: u.position
        }));

        // 记录玩家初始单位状态（用于计算伤亡）
        this._initialPlayerUnits.clear();
        playerBattleUnits.forEach((u, index) => {
            if (u.config) {
                const totalHP = u.config.hp * u.count;
                this._initialPlayerUnits.set(`player_unit_${index}`, {
                    count: u.count,
                    totalHP
                });
            }
        });

        const enemyBattleUnits = enemyUnits.map(u => ({
            config: UnitConfigMap.get(u.configId)!,
            count: u.count,
            position: u.position
        }));

        this._battleManager.initBattle(
            playerBattleUnits,
            enemyBattleUnits,
            playerHero,
            enemyHero
        );

        // 发送准备事件
        EventCenter.emit(LevelBattleEventType.BATTLE_PREPARE, {
            levelId,
            levelName: levelConfig.name
        } as LevelBattleEventData);

        console.log('[LevelBattleBridge] 战斗准备完成:', levelConfig.name);
        return true;
    }

    /**
     * 开始战斗
     * 调用此方法会立即执行战斗（自动战斗模式）
     */
    startBattle(): void {
        if (!this._battleManager) {
            console.warn('[LevelBattleBridge] 战斗未准备');
            return;
        }

        // 监听战斗结束事件
        this._battleManager.on(BattleEventType.BATTLE_END, this._onBattleEnd.bind(this));

        // 开始战斗
        this._battleManager.startBattle();

        // 发送战斗开始事件
        if (this._currentLevelId) {
            EventCenter.emit(LevelBattleEventType.BATTLE_STARTED, {
                levelId: this._currentLevelId
            } as LevelBattleEventData);
        }

        console.log('[LevelBattleBridge] 战斗开始');
    }

    /**
     * 手动结束战斗（用于手动战斗模式）
     * @param winner 胜利者
     */
    finishBattle(winner: 'player' | 'enemy' | null): void {
        if (!this._battleManager) {
            return;
        }

        const battleState = this._battleManager.getState();
        battleState.winner = winner;

        // 手动触发结束处理
        this._onBattleEnd({
            type: BattleEventType.BATTLE_END,
            data: {
                result: {
                    winner,
                    turns: battleState.turn,
                    survivedUnits: battleState.units
                        .filter(u => u instanceof BattleUnit && u.isAlive())
                        .map(u => (u as BattleUnit).toJSON()),
                    rewards: {
                        gold: winner === 'player' ? 1000 : 0,
                        experience: winner === 'player' ? 500 : 0
                    },
                    events: this._battleManager!.getEvents()
                }
            },
            timestamp: Date.now()
        });
    }

    /**
     * 战斗结束处理
     */
    private _onBattleEnd(event: any): void {
        if (!this._currentLevelId || !this._battleManager) {
            return;
        }

        const result = event.data.result as BattleResult;
        const levelConfig = LevelConfigMap.get(this._currentLevelId)!;

        // 计算星级
        const stars = this._calculateStars(result);

        // 创建挑战结果
        const deathCount = this._calculateDeathCount(result);
        const remainingHP = this._calculateRemainingHP(result, 'player');
        const totalHP = this._calculateTotalHP('player');

        const challengeResult: LevelChallengeResult = {
            victory: result.winner === 'player',
            firstClear: this._isFirstClear(this._currentLevelId),
            stars,
            turns: result.turns,
            rewards: {
                gold: 0,
                experience: 0,
                items: []
            },
            statistics: {
                totalDamage: 0,
                totalHeal: 0,
                skillCount: 0,
                deathCount
            }
        };

        // 完成关卡挑战，获取奖励
        const rewards = levelManager.finishChallenge(challengeResult);

        if (challengeResult.victory) {
            // 发放奖励
            this._distributeRewards(rewards);

            // 发送胜利事件
            EventCenter.emit(LevelBattleEventType.BATTLE_VICTORY, {
                levelId: this._currentLevelId,
                battleResult: result,
                challengeResult,
                rewards
            } as LevelBattleEventData);

            console.log('[LevelBattleBridge] 战斗胜利！关卡:', levelConfig.name);
        } else {
            // 发送失败事件
            EventCenter.emit(LevelBattleEventType.BATTLE_DEFEAT, {
                levelId: this._currentLevelId,
                battleResult: result,
                challengeResult
            } as LevelBattleEventData);

            console.log('[LevelBattleBridge] 战斗失败！关卡:', levelConfig.name);
        }

        // 调用回调
        if (this._onBattleEndCallback) {
            this._onBattleEndCallback(challengeResult);
        }

        // 显示战斗结果界面
        this._showBattleResultPanel(challengeResult, rewards);

        // 清理
        this._battleManager.cleanup();
        this._battleManager = null;
        this._currentLevelId = null;
    }

    /**
     * 设置战斗结束回调
     */
    setOnBattleEndCallback(callback: (result: LevelChallengeResult) => void): void {
        this._onBattleEndCallback = callback;
    }

    /**
     * 创建敌方单位
     */
    private _createEnemyUnits(levelConfig: any): { configId: string; count: number; position: Hex }[] {
        return levelConfig.enemies.map((enemy: any) => ({
            configId: enemy.unitId,
            count: enemy.count,
            position: enemy.position
        }));
    }

    /**
     * 获取默认玩家单位（从玩家数据中获取）
     */
    private _getDefaultPlayerUnits(): PlayerBattleUnit[] {
        // 从玩家英雄数据中获取部队
        const heroes = playerDataManager.getAllHeroes();
        if (heroes.length === 0) {
            console.warn('[LevelBattleBridge] 玩家没有英雄，使用默认部队');
            return this._getFallbackPlayerUnits();
        }

        // 获取第一个英雄的军队
        const hero = heroes[0];
        const army = hero.data.army;

        if (!army || army.length === 0) {
            console.warn('[LevelBattleBridge] 英雄没有军队，使用默认部队');
            return this._getFallbackPlayerUnits();
        }

        // 预设玩家起始位置（左侧区域）
        const playerStartPositions: Hex[] = [
            { q: -3, r: -1 },
            { q: -3, r: 0 },
            { q: -3, r: 1 },
            { q: -2, r: -1 },
            { q: -2, r: 0 },
            { q: -2, r: 1 },
            { q: -1, r: 0 }
        ];

        // 将军队转换为战斗单位配置
        const units: PlayerBattleUnit[] = army.map((slot, index) => ({
            configId: slot.configId,
            count: slot.count,
            position: playerStartPositions[index] || { q: -2, r: 0 }
        }));

        console.log('[LevelBattleBridge] 获取玩家部队:', units.length, '支');
        return units;
    }

    /**
     * 获取后备玩家单位（默认部队）
     */
    private _getFallbackPlayerUnits(): PlayerBattleUnit[] {
        return [
            { configId: 'castle_tier1_pikeman', count: 10, position: { q: -2, r: 0 } },
            { configId: 'castle_tier2_archer', count: 6, position: { q: -2, r: 1 } },
            { configId: 'castle_tier3_griffin', count: 3, position: { q: -3, r: 0 } }
        ];
    }

    /**
     * 获取玩家英雄
     */
    private _getPlayerHero(): any {
        const heroes = playerDataManager.getAllHeroes();
        if (heroes.length > 0) {
            return heroes[0].toJSON();
        }

        // 返回默认英雄
        return {
            id: 'player_hero',
            configId: 'hero_catherine',
            level: 1,
            experience: 0,
            attack: 5,
            defense: 5,
            spellPower: 5,
            knowledge: 5,
            mana: 50,
            maxMana: 50,
            skills: [],
            army: []
        };
    }

    /**
     * 获取敌方英雄
     */
    private _getEnemyHero(heroId: string, level: number): any {
        const heroConfig = HeroConfigMap.get(heroId);
        if (!heroConfig) {
            return null;
        }

        return {
            id: 'enemy_hero',
            configId: heroId,
            level,
            experience: 0,
            attack: heroConfig.attackGrowth * level,
            defense: heroConfig.defenseGrowth * level,
            spellPower: heroConfig.spellPowerGrowth * level,
            knowledge: heroConfig.knowledgeGrowth * level,
            mana: 50 + (heroConfig.knowledgeGrowth * level) * 10,
            maxMana: 50 + (heroConfig.knowledgeGrowth * level) * 10,
            skills: [],
            army: []
        };
    }

    /**
     * 计算星级
     */
    private _calculateStars(battleResult: BattleResult): StarRating {
        if (!this._currentLevelId || !this._battleManager) {
            return StarRating.NONE;
        }

        const deathCount = this._calculateDeathCount(battleResult);
        const remainingHP = this._calculateRemainingHP(battleResult, 'player');
        const totalHP = this._calculateTotalHP('player');

        return levelManager.calculateStars(
            this._currentLevelId,
            battleResult.turns,
            deathCount,
            totalHP,
            remainingHP
        );
    }

    /**
     * 计算死亡数量
     */
    private _calculateDeathCount(battleResult: BattleResult): number {
        let deathCount = 0;

        // 计算初始总数
        let initialCount = 0;
        this._initialPlayerUnits.forEach(unit => {
            initialCount += unit.count;
        });

        // 计算存活总数
        let survivedCount = 0;
        battleResult.survivedUnits.forEach(unit => {
            if (unit.team === 'player') {
                // 使用类型断言获取 count 属性
                survivedCount += (unit as any).count || 1;
            }
        });

        deathCount = initialCount - survivedCount;
        return Math.max(0, deathCount);
    }

    /**
     * 计算剩余 HP
     */
    private _calculateRemainingHP(battleResult: BattleResult, team: string): number {
        let remainingHP = 0;
        battleResult.survivedUnits.forEach(unit => {
            if (unit.team === team) {
                remainingHP += unit.currentHp || 0;
            }
        });
        return remainingHP;
    }

    /**
     * 计算总 HP
     */
    private _calculateTotalHP(team: string): number {
        if (team === 'player') {
            let totalHP = 0;
            this._initialPlayerUnits.forEach(unit => {
                totalHP += unit.totalHP;
            });
            return totalHP;
        }
        return 0;
    }

    /**
     * 检查是否首次通关
     */
    private _isFirstClear(levelId: string): boolean {
        const progress = levelManager.getLevelProgress(levelId);
        return !progress || progress.status === 'locked' || progress.status === 'available';
    }

    /**
     * 发放奖励
     */
    private _distributeRewards(rewards: any): void {
        if (!rewards) {
            return;
        }

        const rewardConfigs: RewardConfig[] = [];

        // 金币
        if (rewards.gold) {
            rewardConfigs.push({ type: 'gold', amount: rewards.gold });
        }

        // 宝石
        if (rewards.gems) {
            rewardConfigs.push({ type: 'gems', amount: rewards.gems });
        }

        // 体力
        if (rewards.stamina) {
            rewardConfigs.push({ type: 'stamina', amount: rewards.stamina });
        }

        // 经验
        if (rewards.experience) {
            rewardConfigs.push({ type: 'exp', amount: rewards.experience });
        }

        // 物品
        if (rewards.items && Array.isArray(rewards.items)) {
            rewards.items.forEach((item: any) => {
                if (item.id && item.count) {
                    rewardConfigs.push({ type: 'item', itemId: item.id, amount: item.count });
                }
            });
        }

        // 英雄碎片
        if (rewards.heroFragments && Array.isArray(rewards.heroFragments)) {
            rewards.heroFragments.forEach((fragment: any) => {
                if (fragment.id && fragment.count) {
                    rewardConfigs.push({ type: 'hero_shard', itemId: fragment.id, amount: fragment.count });
                }
            });
        }

        // 兵种
        if (rewards.units && Array.isArray(rewards.units)) {
            rewards.units.forEach((unit: any) => {
                if (unit.id && unit.count) {
                    rewardConfigs.push({ type: 'unit', itemId: unit.id, amount: unit.count });
                }
            });
        }

        // 使用统一奖励发放
        if (rewardConfigs.length > 0) {
            const results = rewardManager.grantRewards(rewardConfigs);
            results.forEach(result => {
                if (!result.success) {
                    console.warn('[LevelBattleBridge] 发放奖励失败:', result);
                }
            });
        }

        // 发送奖励发放事件
        EventCenter.emit(LevelBattleEventType.REWARD_DISTRIBUTED, {
            levelId: this._currentLevelId,
            rewards
        } as LevelBattleEventData);

        console.log('[LevelBattleBridge] 奖励发放完成:', rewards);
    }

    /**
     * 显示战斗结果面板
     */
    private _showBattleResultPanel(challengeResult: LevelChallengeResult, rewards: any): void {
        const uiManager = UIManager.getInstance();

        const resultData = {
            victory: challengeResult.victory,
            levelId: this._currentLevelId || undefined,
            levelName: this._currentLevelId ? LevelConfigMap.get(this._currentLevelId)?.name : undefined,
            stars: challengeResult.stars,
            firstClear: challengeResult.firstClear,
            rewards: challengeResult.rewards,
            statistics: {
                turns: challengeResult.turns,
                totalDamage: challengeResult.statistics.totalDamage,
                totalHeal: challengeResult.statistics.totalHeal,
                deathCount: challengeResult.statistics.deathCount,
                skillCount: challengeResult.statistics.skillCount
            }
        };

        uiManager.showUI('battle_result_panel', resultData);
    }

    /**
     * 获取当前战斗管理器
     */
    getBattleManager(): BattleManager | null {
        return this._battleManager;
    }

    /**
     * 获取当前关卡 ID
     */
    getCurrentLevelId(): string | null {
        return this._currentLevelId;
    }

    /**
     * 清理
     */
    cleanup(): void {
        if (this._battleManager) {
            this._battleManager.cleanup();
            this._battleManager = null;
        }
        this._currentLevelId = null;
        this._playerUnits = [];
        this._initialPlayerUnits.clear();
        this._onBattleEndCallback = null;
    }
}

// 导出单例
export const levelBattleBridge = LevelBattleBridge.getInstance();
