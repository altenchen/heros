/**
 * 英雄无敌Ⅲ：传承
 * 主入口文件
 * Cocos Creator 项目入口 - Game 组件会在场景中自动初始化
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
export { SoundManager, soundManager } from './scripts/audio/SoundManager';

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

// 注意：Cocos Creator 项目由场景中的 Game 组件自动初始化
// 不需要在此手动调用 startGame()