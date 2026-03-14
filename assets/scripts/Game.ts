/**
 * 游戏主入口
 * 初始化游戏系统，管理场景和UI
 */

import { _decorator, Component, Node, director, resources, AssetManager } from 'cc';
import { PlayerDataManager } from './utils/PlayerDataManager';
import { BattleManager } from './battle/BattleManager';
import { UIManager } from './ui/UIManager';
import { EventCenter, GameEvent } from './utils/EventTarget';
import { Hex, Race, Faction } from './config/GameTypes';
import { UnitConfigMap } from '../configs/units.json';
import { HeroConfigMap } from '../configs/heroes.json';
import { PoolInitializer } from './utils/pool/PoolExamples';
import { achievementManager, taskManager } from './achievement';
import { AchievementConditionType } from './config/AchievementTypes';
import { levelManager } from './level';
import { friendManager, guildManager, chatManager } from './social';
import { tutorialManager } from './tutorial';
import { TriggerType } from './config/TutorialTypes';
import { soundManager } from './audio';
import { BGMScene } from './config/AudioTypes';
import { dailySigninManager } from './signin';
import { shopManager } from './shop';
import { inventoryManager } from './inventory';
import { vipManager } from './vip';
import { levelBattleBridge, LevelBattleEventType } from './level/LevelBattleBridge';
import { rewardManager } from './utils/RewardManager';
import { skinManager } from './utils/SkinManager';

const { ccclass, property } = _decorator;

/**
 * 游戏状态
 */
export enum GameState {
    LOADING = 'loading',
    MAIN_MENU = 'main_menu',
    TOWN = 'town',
    BATTLE = 'battle',
    PAUSED = 'paused'
}

/**
 * 游戏主类
 */
@ccclass('Game')
export class Game extends Component {
    /** 游戏单例 */
    private static instance: Game | null = null;

    /** 当前游戏状态 */
    private _state: GameState = GameState.LOADING;

    /** 玩家数据管理器 */
    private playerDataManager: PlayerDataManager;

    /** 战斗管理器 */
    private battleManager: BattleManager | null = null;

    /** UI管理器 */
    private uiManager: UIManager;

    /** Canvas节点 */
    @property(Node)
    canvas: Node | null = null;

    /**
     * 获取游戏单例
     */
    static getInstance(): Game {
        return Game.instance!;
    }

    /**
     * 组件加载
     */
    onLoad(): void {
        if (Game.instance) {
            this.node.destroy();
            return;
        }

        Game.instance = this;
        director.addPersistRootNode(this.node);

        this.playerDataManager = new PlayerDataManager();
        this.uiManager = UIManager.getInstance();
    }

    /**
     * 组件启动
     */
    start(): void {
        this.init();
    }

    /**
     * 初始化游戏
     */
    async init(): Promise<void> {
        console.log('=== 英雄无敌Ⅲ：传承 ===');
        console.log('正在初始化游戏...');

        // 初始化对象池
        PoolInitializer.init();

        // 初始化成就系统
        achievementManager.init();

        // 初始化任务系统
        taskManager.init();

        // 初始化关卡系统
        levelManager.init();

        // 初始化关卡战斗桥接器
        levelBattleBridge.init();

        // 初始化社交系统
        friendManager.init();
        guildManager.init();
        chatManager.init();

        // 初始化教程系统
        tutorialManager.init();

        // 初始化音效系统
        soundManager.init();

        // 初始化签到系统
        dailySigninManager.init();

        // 初始化商店系统
        shopManager.init();

        // 初始化背包系统
        inventoryManager.init();

        // 初始化VIP系统
        vipManager.init();

        // 初始化奖励系统
        rewardManager.init();

        // 初始化皮肤系统
        skinManager.init();

        // 初始化UI管理器
        if (this.canvas) {
            this.uiManager.init(this.canvas);
        }

        // 显示加载界面
        this.uiManager.showLoading('正在加载游戏资源...');

        // 加载玩家数据
        await this.loadPlayerData();

        // 更新游戏天数
        achievementManager.updatePlayDay();

        // 隐藏加载界面
        this.uiManager.hideLoading();

        // 设置状态并显示主菜单
        this._state = GameState.MAIN_MENU;
        this.uiManager.showUI('main_menu');

        // 播放主菜单BGM
        soundManager.playBGM(BGMScene.MAIN_MENU);

        console.log('游戏初始化完成');

        // 触发教程检查 - 游戏启动
        tutorialManager.checkAndTrigger(TriggerType.GAME_START);

        // 触发事件
        EventCenter.emit(GameEvent.GAME_LOADED);
    }

    /**
     * 加载玩家数据
     */
    private async loadPlayerData(): Promise<void> {
        const savedData = localStorage.getItem('hmm_legacy_player');
        if (savedData) {
            this.playerDataManager.deserialize(savedData);
            console.log('已加载存档');
        } else {
            console.log('未找到存档，创建新玩家');
        }

        // 加载成就数据
        const achievementData = localStorage.getItem('hmm_legacy_achievements');
        if (achievementData) {
            achievementManager.deserialize(achievementData);
        }

        // 加载任务数据
        const taskData = localStorage.getItem('hmm_legacy_tasks');
        if (taskData) {
            taskManager.deserialize(taskData);
        }

        // 加载关卡数据
        const levelData = localStorage.getItem('hmm_legacy_levels');
        if (levelData) {
            levelManager.deserialize(levelData);
        }

        // 加载好友数据
        const friendData = localStorage.getItem('hmm_legacy_friends');
        if (friendData) {
            friendManager.deserialize(friendData);
        }

        // 加载公会数据
        const guildData = localStorage.getItem('hmm_legacy_guild');
        if (guildData) {
            guildManager.deserialize(guildData);
        }

        // 加载聊天数据
        const chatData = localStorage.getItem('hmm_legacy_chat');
        if (chatData) {
            chatManager.deserialize(chatData);
        }

        // 加载教程数据
        const tutorialData = localStorage.getItem('hmm_legacy_tutorial');
        if (tutorialData) {
            tutorialManager.deserialize(tutorialData);
        }

        // 加载音频设置
        const audioData = localStorage.getItem('hmm_legacy_audio');
        if (audioData) {
            soundManager.deserialize(audioData);
        }

        // 加载签到数据
        const signinData = localStorage.getItem('hmm_legacy_signin');
        if (signinData) {
            dailySigninManager.deserialize(signinData);
        }

        // 加载商店数据
        const shopData = localStorage.getItem('hmm_legacy_shop');
        if (shopData) {
            shopManager.deserialize(shopData);
        }

        // 加载背包数据
        const inventoryData = localStorage.getItem('hmm_legacy_inventory');
        if (inventoryData) {
            inventoryManager.deserialize(inventoryData);
        }

        // 加载VIP数据
        const vipData = localStorage.getItem('hmm_legacy_vip');
        if (vipData) {
            vipManager.deserialize(vipData);
        }

        // 加载皮肤数据
        const skinData = localStorage.getItem('hmm_legacy_skins');
        if (skinData) {
            skinManager.deserialize(skinData);
        }
    }

    /**
     * 创建新游戏
     */
    createNewGame(playerName: string, faction: Faction): void {
        const playerId = `player_${Date.now()}`;
        this.playerDataManager.createNewPlayer(playerId, playerName, faction);
        this.saveGame();
        console.log(`创建新游戏: ${playerName}, 阵营: ${faction}`);
    }

    /**
     * 保存游戏
     */
    saveGame(): void {
        const data = this.playerDataManager.serialize();
        localStorage.setItem('hmm_legacy_player', data);

        // 保存成就数据
        localStorage.setItem('hmm_legacy_achievements', achievementManager.serialize());

        // 保存任务数据
        localStorage.setItem('hmm_legacy_tasks', taskManager.serialize());

        // 保存关卡数据
        localStorage.setItem('hmm_legacy_levels', levelManager.serialize());

        // 保存好友数据
        localStorage.setItem('hmm_legacy_friends', friendManager.serialize());

        // 保存公会数据
        localStorage.setItem('hmm_legacy_guild', guildManager.serialize());

        // 保存聊天数据
        localStorage.setItem('hmm_legacy_chat', chatManager.serialize());

        // 保存教程数据
        localStorage.setItem('hmm_legacy_tutorial', tutorialManager.serialize());

        // 保存音频设置
        localStorage.setItem('hmm_legacy_audio', soundManager.serialize());

        // 保存签到数据
        localStorage.setItem('hmm_legacy_signin', dailySigninManager.serialize());

        // 保存商店数据
        localStorage.setItem('hmm_legacy_shop', shopManager.serialize());

        // 保存背包数据
        localStorage.setItem('hmm_legacy_inventory', inventoryManager.serialize());

        // 保存VIP数据
        localStorage.setItem('hmm_legacy_vip', vipManager.serialize());

        // 保存皮肤数据
        localStorage.setItem('hmm_legacy_skins', skinManager.serialize());

        console.log('游戏已保存');
        EventCenter.emit(GameEvent.GAME_SAVED);
    }

    /**
     * 获取游戏状态
     */
    getState(): GameState {
        return this._state;
    }

    /**
     * 获取玩家数据管理器
     */
    getPlayerDataManager(): PlayerDataManager {
        return this.playerDataManager;
    }

    /**
     * 获取UI管理器
     */
    getUIManager(): UIManager {
        return this.uiManager;
    }

    /**
     * 获取成就管理器
     */
    getAchievementManager(): typeof achievementManager {
        return achievementManager;
    }

    /**
     * 获取任务管理器
     */
    getTaskManager(): typeof taskManager {
        return taskManager;
    }

    /**
     * 获取关卡管理器
     */
    getLevelManager(): typeof levelManager {
        return levelManager;
    }

    /**
     * 获取好友管理器
     */
    getFriendManager(): typeof friendManager {
        return friendManager;
    }

    /**
     * 获取公会管理器
     */
    getGuildManager(): typeof guildManager {
        return guildManager;
    }

    /**
     * 获取聊天管理器
     */
    getChatManager(): typeof chatManager {
        return chatManager;
    }

    /**
     * 获取教程管理器
     */
    getTutorialManager(): typeof tutorialManager {
        return tutorialManager;
    }

    /**
     * 获取音效管理器
     */
    getSoundManager(): typeof soundManager {
        return soundManager;
    }

    /**
     * 获取签到管理器
     */
    getSigninManager(): typeof dailySigninManager {
        return dailySigninManager;
    }

    /**
     * 获取商店管理器
     */
    getShopManager(): typeof shopManager {
        return shopManager;
    }

    /**
     * 获取背包管理器
     */
    getInventoryManager(): typeof inventoryManager {
        return inventoryManager;
    }

    /**
     * 获取VIP管理器
     */
    getVIPManager(): typeof vipManager {
        return vipManager;
    }

    /**
     * 获取皮肤管理器
     */
    getSkinManager(): typeof skinManager {
        return skinManager;
    }

    /**
     * 切换到主菜单
     */
    goToMainMenu(): void {
        this._state = GameState.MAIN_MENU;
        director.loadScene('MainMenu', () => {
            this.uiManager.showUI('main_menu');
        });
    }

    /**
     * 进入主城
     */
    enterTown(): void {
        this._state = GameState.TOWN;
        director.loadScene('Town', () => {
            this.uiManager.showUI('town_panel');
            // 播放主城BGM
            soundManager.playBGM(BGMScene.TOWN, this.playerDataManager.getPlayerFaction());
            // 触发教程检查 - 进入主城场景
            tutorialManager.checkAndTrigger(TriggerType.ENTER_SCENE, { sceneName: 'Town' });
        });
    }

    /**
     * 开始战斗
     */
    startBattle(
        playerUnits: { configId: string; count: number; position: Hex }[],
        enemyUnits: { configId: string; count: number; position: Hex }[],
        enemyHeroId: string
    ): void {
        this._state = GameState.BATTLE;
        this.battleManager = new BattleManager();

        // 获取玩家英雄
        const heroes = this.playerDataManager.getAllHeroes();
        const playerHero = heroes[0];

        // 获取敌人英雄配置
        const enemyHeroConfig = HeroConfigMap.get(enemyHeroId);

        // 准备战斗单位
        const playerBattleUnits = playerUnits.map(u => ({
            config: UnitConfigMap.get(u.configId)!,
            count: u.count,
            position: u.position
        }));

        const enemyBattleUnits = enemyUnits.map(u => ({
            config: UnitConfigMap.get(u.configId)!,
            count: u.count,
            position: u.position
        }));

        // 初始化战斗
        this.battleManager.initBattle(
            playerBattleUnits,
            enemyBattleUnits,
            playerHero?.toJSON() || null,
            enemyHeroConfig ? {
                id: 'enemy_hero',
                configId: enemyHeroId,
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
            } : null
        );

        // 加载战斗场景
        director.loadScene('Battle', () => {
            this.battleManager!.startBattle();
            this.uiManager.showUI('battle_panel');
            // 播放战斗BGM
            soundManager.playBGM(BGMScene.BATTLE);
            // 触发教程检查 - 进入战斗场景
            tutorialManager.checkAndTrigger(TriggerType.FIRST_ENTER, { sceneName: 'Battle' });
            EventCenter.emit(GameEvent.BATTLE_START);
        });
    }

    /**
     * 开始关卡战斗
     * 使用关卡战斗桥接器进行完整的关卡挑战流程
     * @param levelId 关卡 ID
     * @returns 是否成功开始战斗
     */
    startLevelBattle(levelId: string): boolean {
        console.log('[Game] 开始关卡战斗:', levelId);

        // 准备战斗
        if (!levelBattleBridge.prepareBattle(levelId)) {
            console.warn('[Game] 无法准备关卡战斗');
            return false;
        }

        // 设置战斗结束回调
        levelBattleBridge.setOnBattleEndCallback((result) => {
            console.log('[Game] 关卡战斗结束:', result.victory ? '胜利' : '失败');
            this._onLevelBattleEnd(result);
        });

        // 监听关卡战斗事件
        EventCenter.on(LevelBattleEventType.BATTLE_VICTORY, this._onLevelBattleVictory, this);
        EventCenter.on(LevelBattleEventType.BATTLE_DEFEAT, this._onLevelBattleDefeat, this);

        // 更新状态
        this._state = GameState.BATTLE;
        this.battleManager = levelBattleBridge.getBattleManager();

        // 加载战斗场景
        director.loadScene('Battle', () => {
            // 开始战斗
            levelBattleBridge.startBattle();

            // 显示战斗面板
            this.uiManager.showUI('battle_panel');

            // 播放战斗BGM
            soundManager.playBGM(BGMScene.BATTLE);

            // 触发教程检查
            tutorialManager.checkAndTrigger(TriggerType.FIRST_ENTER, { sceneName: 'Battle' });

            EventCenter.emit(GameEvent.BATTLE_START);
        });

        return true;
    }

    /**
     * 关卡战斗结束处理
     */
    private _onLevelBattleEnd(result: any): void {
        // 清理事件监听
        EventCenter.off(LevelBattleEventType.BATTLE_VICTORY, this._onLevelBattleVictory, this);
        EventCenter.off(LevelBattleEventType.BATTLE_DEFEAT, this._onLevelBattleDefeat, this);

        // 更新状态
        this._state = GameState.TOWN;

        // 保存游戏
        this.saveGame();
    }

    /**
     * 关卡战斗胜利处理
     */
    private _onLevelBattleVictory(data: any): void {
        console.log('[Game] 关卡战斗胜利:', data);

        // 播放胜利音乐
        soundManager.playBGM(BGMScene.VICTORY);

        // 触发成就事件
        achievementManager.triggerEvent({
            type: AchievementConditionType.WIN_BATTLES,
            value: 1
        });

        // 触发任务事件
        taskManager.triggerEvent({
            type: AchievementConditionType.WIN_BATTLES,
            value: 1
        });

        // 触发关卡完成事件
        achievementManager.triggerEvent({
            type: AchievementConditionType.CLEAR_LEVELS,
            value: 1
        });
    }

    /**
     * 关卡战斗失败处理
     */
    private _onLevelBattleDefeat(data: any): void {
        console.log('[Game] 关卡战斗失败:', data);

        // 播放失败音乐
        soundManager.playBGM(BGMScene.DEFEAT);

        // 重置连胜
        achievementManager.resetStreak();
    }

    /**
     * 获取战斗管理器
     */
    getBattleManager(): BattleManager | null {
        return this.battleManager;
    }

    /**
     * 结束战斗
     */
    endBattle(): void {
        if (this.battleManager) {
            const state = this.battleManager.getState();
            EventCenter.emit(GameEvent.BATTLE_END, { winner: state.winner });

            if (state.winner === 'player') {
                // 播放胜利音乐
                soundManager.playBGM(BGMScene.VICTORY);

                // 奖励
                this.playerDataManager.addResource('gold', 1000);
                this.playerDataManager.addExperience(500);

                // 触发成就事件 - 赢得战斗
                achievementManager.triggerEvent({
                    type: AchievementConditionType.WIN_BATTLES,
                    value: 1
                });

                // 触发任务事件
                taskManager.triggerEvent({
                    type: AchievementConditionType.WIN_BATTLES,
                    value: 1
                });
            } else {
                // 播放失败音乐
                soundManager.playBGM(BGMScene.DEFEAT);

                // 战斗失败，重置连胜
                achievementManager.resetStreak();
            }

            // 清理战斗对象池
            this.battleManager.cleanup();
        }

        this.battleManager = null;
        this._state = GameState.TOWN;
        this.saveGame();
    }

    /**
     * 暂停游戏
     */
    pauseGame(): void {
        this._state = GameState.PAUSED;
        EventCenter.emit(GameEvent.GAME_PAUSED);
    }

    /**
     * 恢复游戏
     */
    resumeGame(): void {
        if (this.battleManager) {
            this._state = GameState.BATTLE;
        } else {
            this._state = GameState.TOWN;
        }
        EventCenter.emit(GameEvent.GAME_RESUMED);
    }

    /**
     * 更新游戏（每帧调用）
     */
    update(deltaTime: number): void {
        switch (this._state) {
            case GameState.BATTLE:
                if (this.battleManager) {
                    // 战斗更新
                }
                break;
            case GameState.TOWN:
                // 主城更新（离线收益等）
                break;
        }
    }

    /**
     * 销毁
     */
    onDestroy(): void {
        // 清理对象池
        PoolInitializer.cleanup();

        Game.instance = null;
    }
}

// 导出便捷访问
export const game = () => Game.getInstance();