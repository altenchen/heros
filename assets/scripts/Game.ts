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
import { levelBattleBridge, LevelBattleEventType } from './level/LevelBattleBridge';
import { rewardManager } from './utils/RewardManager';
import { skinManager } from './utils/SkinManager';
import { vipManager } from './vip';
import { rankManager } from './rank';
import { mailManager } from './mail';
import { activityManager } from './activity';
import { arenaManager } from './arena';
import { gachaManager } from './gacha';
import { collectionManager } from './collection';
import { saveManager, autoSaveManager } from './save';
import { SaveData, SaveEventType } from './config/SaveTypes';
import { speedUpManager } from './utils/SpeedUpManager';
import { expeditionManager } from './expedition';
import { onlineRewardManager } from './onlinereward';
import { announcementManager } from './announcement';
import { artifactManager } from './artifact';
import { warMachineManager } from './warmachine';

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

        // 初始化奖励系统
        rewardManager.init();

        // 初始化皮肤系统
        skinManager.init();

        // 初始化VIP系统
        vipManager.init();

        // 初始化排行榜系统
        rankManager.init();

        // 初始化邮件系统
        mailManager.init();

        // 初始化活动系统
        activityManager.init();

        // 初始化竞技场系统
        arenaManager.init();

        // 初始化招募系统
        gachaManager.init();

        // 初始化图鉴系统
        collectionManager.init();

        // 初始化存档系统
        saveManager.init();
        autoSaveManager.init();

        // 初始化加速系统
        speedUpManager.init();

        // 初始化远征系统
        expeditionManager.init();

        // 初始化在线奖励系统
        onlineRewardManager.init();

        // 初始化公告系统
        announcementManager.init();

        // 初始化宝物系统
        artifactManager.init();

        // 初始化战争机器系统
        warMachineManager.init();

        // 设置自动存档回调
        autoSaveManager.setSaveDataCallback(() => this.collectSaveData());

        // 初始化UI管理器
        if (this.canvas) {
            this.uiManager.init(this.canvas);
        }

        // 显示加载界面
        this.uiManager.showLoading('正在加载游戏资源...');

        // 隐藏加载界面
        this.uiManager.hideLoading();

        // 检查是否有存档
        if (saveManager.hasAnySave()) {
            // 有存档，显示存档选择界面
            this._state = GameState.MAIN_MENU;
            this.uiManager.showUI('save_select_panel', { mode: 'load' });

            // 监听存档加载完成
            EventCenter.once(SaveEventType.LOAD_COMPLETE, this.onSaveLoaded, this);
        } else {
            // 没有存档，显示创建存档界面
            this._state = GameState.MAIN_MENU;
            this.uiManager.showUI('save_select_panel', { mode: 'create' });

            // 监听新存档创建
            EventCenter.once('new_game_created', this.onNewGameCreated, this);
        }

        // 播放主菜单BGM
        soundManager.playBGM(BGMScene.MAIN_MENU);

        console.log('游戏初始化完成，等待用户选择存档...');
    }

    /**
     * 收集存档数据
     */
    private collectSaveData(): SaveData {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            player: this.playerDataManager.serialize(),
            achievements: achievementManager.serialize(),
            tasks: taskManager.serialize(),
            levels: levelManager.serialize(),
            friends: friendManager.serialize(),
            guild: guildManager.serialize(),
            chat: chatManager.serialize(),
            tutorial: tutorialManager.serialize(),
            audio: soundManager.serialize(),
            signin: dailySigninManager.serialize(),
            shop: shopManager.serialize(),
            inventory: inventoryManager.serialize(),
            skins: skinManager.serialize(),
            vip: vipManager.serialize(),
            rank: rankManager.serialize(),
            mail: mailManager.serialize(),
            activity: activityManager.serialize(),
            arena: arenaManager.serialize(),
            gacha: gachaManager.serialize(),
            collection: collectionManager.serialize(),
            expedition: expeditionManager.serialize(),
            onlineReward: onlineRewardManager.serialize(),
            announcement: announcementManager.serialize(),
            artifacts: artifactManager.getSaveData(),
            warMachines: warMachineManager.serialize()
        };
    }

    /**
     * 存档加载完成处理
     */
    private onSaveLoaded(data: { slotId: number; data: SaveData }): void {
        console.log('[Game] 存档加载完成，槽位:', data.slotId);

        // 加载各系统数据
        const saveData = data.data;
        if (saveData) {
            this.playerDataManager.deserialize(saveData.player);
            achievementManager.deserialize(saveData.achievements);
            taskManager.deserialize(saveData.tasks);
            levelManager.deserialize(saveData.levels);
            friendManager.deserialize(saveData.friends);
            guildManager.deserialize(saveData.guild);
            chatManager.deserialize(saveData.chat);
            tutorialManager.deserialize(saveData.tutorial);
            soundManager.deserialize(saveData.audio);
            dailySigninManager.deserialize(saveData.signin);
            shopManager.deserialize(saveData.shop);
            inventoryManager.deserialize(saveData.inventory);
            skinManager.deserialize(saveData.skins);
            vipManager.deserialize(saveData.vip);
            rankManager.deserialize(saveData.rank);
            mailManager.deserialize(saveData.mail);
            activityManager.deserialize(saveData.activity);
            arenaManager.deserialize(saveData.arena);
            gachaManager.deserialize(saveData.gacha);
            collectionManager.deserialize(saveData.collection);
            expeditionManager.deserialize(saveData.expedition);
            onlineRewardManager.deserialize(saveData.onlineReward);
            announcementManager.deserialize(saveData.announcement);
            if (saveData.artifacts) {
                artifactManager.loadSaveData(saveData.artifacts);
            }
            if (saveData.warMachines) {
                warMachineManager.deserialize(saveData.warMachines);
            }
        }

        // 显示主菜单
        this.uiManager.showUI('main_menu');

        // 检查离线奖励
        this.checkOfflineRewards();

        // 启动自动存档
        autoSaveManager.start();

        // 更新游戏天数
        achievementManager.updatePlayDay();

        console.log('游戏初始化完成');

        // 触发教程检查 - 游戏启动
        tutorialManager.checkAndTrigger(TriggerType.GAME_START);

        // 触发事件
        EventCenter.emit(GameEvent.GAME_LOADED);
    }

    /**
     * 新存档创建处理
     */
    private onNewGameCreated(data: { slotId: number; playerName: string; faction: string }): void {
        console.log('[Game] 新存档创建，槽位:', data.slotId);

        // 创建新玩家数据
        this.createNewGame(data.playerName, data.faction as Faction);

        // 启动自动存档
        autoSaveManager.start();

        // 显示主菜单
        this.uiManager.showUI('main_menu');

        console.log('游戏初始化完成');

        // 触发教程检查 - 游戏启动
        tutorialManager.checkAndTrigger(TriggerType.GAME_START);

        // 触发事件
        EventCenter.emit(GameEvent.GAME_LOADED);
    }

    /**
     * 检查离线奖励
     */
    private checkOfflineRewards(): void {
        const playerData = this.playerDataManager.getPlayerData();
        if (!playerData) return;

        const offlineRewards = playerData.offlineRewards;
        if (offlineRewards && offlineRewards.gold > 0) {
            // 显示离线奖励面板
            this.uiManager.showUI('offline_reward_panel', {
                gold: offlineRewards.gold,
                resources: offlineRewards.resources,
                offlineHours: offlineRewards.calculateTime
            });
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
        const saveData = this.collectSaveData();

        // 使用存档管理器保存
        const result = saveManager.save(saveData);
        if (result.success) {
            console.log('游戏已保存');
            EventCenter.emit(GameEvent.GAME_SAVED);
        } else {
            console.error('保存失败:', result.error);
        }
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
     * 获取皮肤管理器
     */
    getSkinManager(): typeof skinManager {
        return skinManager;
    }

    /**
     * 获取VIP管理器
     */
    getVIPManager(): typeof vipManager {
        return vipManager;
    }

    /**
     * 获取排行榜管理器
     */
    getRankManager(): typeof rankManager {
        return rankManager;
    }

    /**
     * 获取邮件管理器
     */
    getMailManager(): typeof mailManager {
        return mailManager;
    }

    /**
     * 获取活动管理器
     */
    getActivityManager(): typeof activityManager {
        return activityManager;
    }

    /**
     * 获取竞技场管理器
     */
    getArenaManager(): typeof arenaManager {
        return arenaManager;
    }

    /**
     * 获取招募管理器
     */
    getGachaManager(): typeof gachaManager {
        return gachaManager;
    }

    /**
     * 获取图鉴管理器
     */
    getCollectionManager(): typeof collectionManager {
        return collectionManager;
    }

    /**
     * 获取加速管理器
     */
    getSpeedUpManager(): typeof speedUpManager {
        return speedUpManager;
    }

    /**
     * 获取宝物管理器
     */
    getArtifactManager(): typeof artifactManager {
        return artifactManager;
    }

    /**
     * 获取战争机器管理器
     */
    getWarMachineManager(): typeof warMachineManager {
        return warMachineManager;
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
        // 退出时自动存档
        autoSaveManager.saveOnExit();

        // 清理自动存档管理器
        autoSaveManager.cleanup();

        // 清理对象池
        PoolInitializer.cleanup();

        Game.instance = null;
    }
}

// 导出便捷访问
export const game = () => Game.getInstance();