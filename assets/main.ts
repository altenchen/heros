/**
 * 英雄无敌Ⅲ：传承
 * 主入口文件
 */

// 导出核心类型
export * from './scripts/config/GameTypes';

// 导出核心模块
export { HexGrid, HexCell, HexUtils, HEX_DIRECTIONS } from './scripts/battle/HexGrid';
export { BattleUnit } from './scripts/battle/BattleUnit';
export { BattleManager, BattleEventType, BattleEvent, BattleResult } from './scripts/battle/BattleManager';
export { SkillManager, Skill } from './scripts/skill/SkillManager';
export { Hero, HeroManager } from './scripts/hero/HeroManager';
export { Town, TownManager, BuildingConfigs, BuildingConfigMap } from './scripts/town/TownManager';

// 导出工具类
export { PlayerDataManager } from './scripts/utils/PlayerDataManager';
export { EventTarget, EventCenter, GameEvent } from './scripts/utils/EventTarget';
export { ResourceManager, resources, ResourceType as ResType } from './scripts/utils/ResourceManager';
export { SoundManager, soundManager } from './scripts/utils/SoundManager';

// 导出UI模块
export { UIManager, uiManager, UILayer, UIBase } from './scripts/ui/UIManager';

// 导出微信适配层
export {
    isWechatPlatform,
    StorageManager,
    UserManager,
    ShareManager,
    RankManager,
    PaymentManager,
    AntiAddictionManager
} from './scripts/network/WechatAdapter';

// 导出配置数据
export { UnitConfigs, UnitConfigMap, UnitsByRace } from './configs/units.json';
export { HeroConfigs, HeroConfigMap, HeroesByRace } from './configs/heroes.json';
export { SkillConfigs, SkillConfigMap, SkillsByMagicSchool } from './configs/skills.json';

// 导出游戏主类
export { Game, GameState, game } from './scripts/Game';

// 初始化游戏
import { Game } from './scripts/Game';
import { SoundManager } from './scripts/utils/SoundManager';

/**
 * 启动游戏
 */
export async function startGame(): Promise<void> {
    console.log('=================================');
    console.log('  英雄无敌Ⅲ：传承');
    console.log('  Heroes of Might and Magic III');
    console.log('  Legacy Edition');
    console.log('=================================');

    // 加载音效设置
    SoundManager.getInstance().loadSettings();

    // 初始化游戏
    const game = Game.getInstance();
    await game.init();

    console.log('游戏启动成功！');
}

// 自动启动（如果在浏览器环境中）
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        startGame().catch(console.error);
    });
}