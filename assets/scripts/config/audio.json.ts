/**
 * 音效配置数据
 * 定义所有音频资源的配置信息
 * 遵循阿里巴巴开发者手册规范
 */

import {
    AudioConfig,
    BGMConfig,
    SFXConfig,
    AudioType,
    SoundCategory,
    BGMScene,
    UISoundType,
    BattleSoundType,
    SkillSoundType
} from './AudioTypes';

/**
 * BGM配置列表
 */
export const bgmConfigs: BGMConfig[] = [
    // ==================== 主菜单 ====================
    {
        audioId: 'bgm_main_menu',
        name: '主菜单音乐',
        type: AudioType.BGM,
        path: 'audio/bgm/main_menu',
        volume: 0.8,
        loop: true,
        fadeIn: 1.0,
        fadeOut: 1.0,
        scene: BGMScene.MAIN_MENU,
        isDefault: true
    },

    // ==================== 主城 ====================
    {
        audioId: 'bgm_town_castle',
        name: '圣堂主城',
        type: AudioType.BGM,
        path: 'audio/bgm/town_castle',
        volume: 0.8,
        loop: true,
        fadeIn: 1.0,
        fadeOut: 1.0,
        scene: BGMScene.TOWN,
        race: 'castle'
    },
    {
        audioId: 'bgm_town_rampart',
        name: '壁垒主城',
        type: AudioType.BGM,
        path: 'audio/bgm/town_rampart',
        volume: 0.8,
        loop: true,
        fadeIn: 1.0,
        fadeOut: 1.0,
        scene: BGMScene.TOWN,
        race: 'rampart'
    },
    {
        audioId: 'bgm_town_necropolis',
        name: '墓园主城',
        type: AudioType.BGM,
        path: 'audio/bgm/town_necropolis',
        volume: 0.8,
        loop: true,
        fadeIn: 1.0,
        fadeOut: 1.0,
        scene: BGMScene.TOWN,
        race: 'necropolis'
    },
    {
        audioId: 'bgm_town_dungeon',
        name: '地下城主城',
        type: AudioType.BGM,
        path: 'audio/bgm/town_dungeon',
        volume: 0.8,
        loop: true,
        fadeIn: 1.0,
        fadeOut: 1.0,
        scene: BGMScene.TOWN,
        race: 'dungeon'
    },
    {
        audioId: 'bgm_town_tower',
        name: '塔楼主城',
        type: AudioType.BGM,
        path: 'audio/bgm/town_tower',
        volume: 0.8,
        loop: true,
        fadeIn: 1.0,
        fadeOut: 1.0,
        scene: BGMScene.TOWN,
        race: 'tower'
    },
    {
        audioId: 'bgm_town_stronghold',
        name: '据点主城',
        type: AudioType.BGM,
        path: 'audio/bgm/town_stronghold',
        volume: 0.8,
        loop: true,
        fadeIn: 1.0,
        fadeOut: 1.0,
        scene: BGMScene.TOWN,
        race: 'stronghold'
    },
    {
        audioId: 'bgm_town_inferno',
        name: '地狱主城',
        type: AudioType.BGM,
        path: 'audio/bgm/town_inferno',
        volume: 0.8,
        loop: true,
        fadeIn: 1.0,
        fadeOut: 1.0,
        scene: BGMScene.TOWN,
        race: 'inferno'
    },

    // ==================== 战斗 ====================
    {
        audioId: 'bgm_battle_01',
        name: '战斗音乐1',
        type: AudioType.BGM,
        path: 'audio/bgm/battle_01',
        volume: 0.7,
        loop: true,
        fadeIn: 0.5,
        fadeOut: 0.5,
        scene: BGMScene.BATTLE,
        isDefault: true
    },
    {
        audioId: 'bgm_battle_02',
        name: '战斗音乐2',
        type: AudioType.BGM,
        path: 'audio/bgm/battle_02',
        volume: 0.7,
        loop: true,
        fadeIn: 0.5,
        fadeOut: 0.5,
        scene: BGMScene.BATTLE
    },
    {
        audioId: 'bgm_battle_boss',
        name: 'Boss战斗音乐',
        type: AudioType.BGM,
        path: 'audio/bgm/battle_boss',
        volume: 0.8,
        loop: true,
        fadeIn: 0.5,
        fadeOut: 0.5,
        scene: BGMScene.BATTLE,
        priority: 10
    },

    // ==================== 结果 ====================
    {
        audioId: 'bgm_victory',
        name: '胜利音乐',
        type: AudioType.BGM,
        path: 'audio/bgm/victory',
        volume: 0.9,
        loop: false,
        fadeIn: 0.3,
        fadeOut: 0.5,
        scene: BGMScene.VICTORY
    },
    {
        audioId: 'bgm_defeat',
        name: '失败音乐',
        type: AudioType.BGM,
        path: 'audio/bgm/defeat',
        volume: 0.8,
        loop: false,
        fadeIn: 0.3,
        fadeOut: 0.5,
        scene: BGMScene.DEFEAT
    }
];

/**
 * UI音效配置列表
 */
export const uiSoundConfigs: SFXConfig[] = [
    // ==================== 按钮交互 ====================
    {
        audioId: 'sfx_ui_button_click',
        name: '按钮点击',
        type: AudioType.SFX,
        category: SoundCategory.UI,
        soundType: UISoundType.BUTTON_CLICK,
        path: 'audio/sfx/ui/button_click',
        volume: 1.0,
        cooldown: 50,
        pitchVariation: 0.05
    },
    {
        audioId: 'sfx_ui_panel_open',
        name: '面板打开',
        type: AudioType.SFX,
        category: SoundCategory.UI,
        soundType: UISoundType.PANEL_OPEN,
        path: 'audio/sfx/ui/panel_open',
        volume: 0.8
    },
    {
        audioId: 'sfx_ui_panel_close',
        name: '面板关闭',
        type: AudioType.SFX,
        category: SoundCategory.UI,
        soundType: UISoundType.PANEL_CLOSE,
        path: 'audio/sfx/ui/panel_close',
        volume: 0.8
    },
    {
        audioId: 'sfx_ui_confirm',
        name: '确认',
        type: AudioType.SFX,
        category: SoundCategory.UI,
        soundType: UISoundType.CONFIRM,
        path: 'audio/sfx/ui/confirm',
        volume: 1.0
    },
    {
        audioId: 'sfx_ui_cancel',
        name: '取消',
        type: AudioType.SFX,
        category: SoundCategory.UI,
        soundType: UISoundType.CANCEL,
        path: 'audio/sfx/ui/cancel',
        volume: 1.0
    },

    // ==================== 提示音 ====================
    {
        audioId: 'sfx_ui_error',
        name: '错误提示',
        type: AudioType.SFX,
        category: SoundCategory.UI,
        soundType: UISoundType.ERROR,
        path: 'audio/sfx/ui/error',
        volume: 0.8
    },
    {
        audioId: 'sfx_ui_success',
        name: '成功提示',
        type: AudioType.SFX,
        category: SoundCategory.UI,
        soundType: UISoundType.SUCCESS,
        path: 'audio/sfx/ui/success',
        volume: 0.9
    },
    {
        audioId: 'sfx_ui_tab_switch',
        name: '标签切换',
        type: AudioType.SFX,
        category: SoundCategory.UI,
        soundType: UISoundType.TAB_SWITCH,
        path: 'audio/sfx/ui/tab_switch',
        volume: 0.6,
        cooldown: 100
    },

    // ==================== 奖励音 ====================
    {
        audioId: 'sfx_ui_reward',
        name: '奖励获得',
        type: AudioType.SFX,
        category: SoundCategory.UI,
        soundType: UISoundType.REWARD,
        path: 'audio/sfx/ui/reward',
        volume: 1.0
    },
    {
        audioId: 'sfx_ui_gold',
        name: '金币',
        type: AudioType.SFX,
        category: SoundCategory.UI,
        soundType: UISoundType.GOLD,
        path: 'audio/sfx/ui/gold',
        volume: 0.7,
        minInterval: 100
    },
    {
        audioId: 'sfx_ui_level_up',
        name: '等级提升',
        type: AudioType.SFX,
        category: SoundCategory.UI,
        soundType: UISoundType.LEVEL_UP,
        path: 'audio/sfx/ui/level_up',
        volume: 1.0
    }
];

/**
 * 战斗音效配置列表
 */
export const battleSoundConfigs: SFXConfig[] = [
    // ==================== 战斗流程 ====================
    {
        audioId: 'sfx_battle_start',
        name: '战斗开始',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.BATTLE_START,
        path: 'audio/sfx/battle/battle_start',
        volume: 1.0
    },
    {
        audioId: 'sfx_battle_victory',
        name: '战斗胜利',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.VICTORY,
        path: 'audio/sfx/battle/victory',
        volume: 1.0
    },
    {
        audioId: 'sfx_battle_defeat',
        name: '战斗失败',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.DEFEAT,
        path: 'audio/sfx/battle/defeat',
        volume: 0.8
    },
    {
        audioId: 'sfx_battle_turn_start',
        name: '回合开始',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.TURN_START,
        path: 'audio/sfx/battle/turn_start',
        volume: 0.6
    },
    {
        audioId: 'sfx_battle_warning',
        name: '警告',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.WARNING,
        path: 'audio/sfx/battle/warning',
        volume: 0.9
    },

    // ==================== 攻击音效 ====================
    {
        audioId: 'sfx_battle_attack_melee',
        name: '近战攻击',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.ATTACK,
        path: 'audio/sfx/battle/attack_melee',
        volume: 0.8,
        pitchVariation: 0.1
    },
    {
        audioId: 'sfx_battle_attack_ranged',
        name: '远程攻击',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.SHOOT,
        path: 'audio/sfx/battle/attack_ranged',
        volume: 0.8,
        pitchVariation: 0.05
    },
    {
        audioId: 'sfx_battle_hit',
        name: '命中',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.HIT,
        path: 'audio/sfx/battle/hit',
        volume: 0.7,
        pitchVariation: 0.1
    },
    {
        audioId: 'sfx_battle_critical',
        name: '暴击',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.CRITICAL,
        path: 'audio/sfx/battle/critical',
        volume: 1.0
    },
    {
        audioId: 'sfx_battle_dodge',
        name: '闪避',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.DODGE,
        path: 'audio/sfx/battle/dodge',
        volume: 0.6
    },
    {
        audioId: 'sfx_battle_counter',
        name: '反击',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.COUNTER,
        path: 'audio/sfx/battle/counter',
        volume: 0.8
    },

    // ==================== 单位音效 ====================
    {
        audioId: 'sfx_battle_move',
        name: '移动',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.MOVE,
        path: 'audio/sfx/battle/move',
        volume: 0.5,
        cooldown: 200
    },
    {
        audioId: 'sfx_battle_death',
        name: '死亡',
        type: AudioType.SFX,
        category: SoundCategory.BATTLE,
        soundType: BattleSoundType.DEATH,
        path: 'audio/sfx/battle/death',
        volume: 0.7,
        pitchVariation: 0.1
    }
];

/**
 * 技能音效配置列表
 */
export const skillSoundConfigs: SFXConfig[] = [
    {
        audioId: 'sfx_skill_fireball',
        name: '火球术',
        type: AudioType.SFX,
        category: SoundCategory.SKILL,
        soundType: SkillSoundType.FIREBALL,
        path: 'audio/sfx/skill/fireball',
        volume: 0.9
    },
    {
        audioId: 'sfx_skill_lightning',
        name: '闪电箭',
        type: AudioType.SFX,
        category: SoundCategory.SKILL,
        soundType: SkillSoundType.LIGHTNING,
        path: 'audio/sfx/skill/lightning',
        volume: 1.0
    },
    {
        audioId: 'sfx_skill_heal',
        name: '治疗术',
        type: AudioType.SFX,
        category: SoundCategory.SKILL,
        soundType: SkillSoundType.HEAL,
        path: 'audio/sfx/skill/heal',
        volume: 0.8
    },
    {
        audioId: 'sfx_skill_revive',
        name: '复活术',
        type: AudioType.SFX,
        category: SoundCategory.SKILL,
        soundType: SkillSoundType.REVIVE,
        path: 'audio/sfx/skill/revive',
        volume: 0.9
    },
    {
        audioId: 'sfx_skill_bloodlust',
        name: '嗜血术',
        type: AudioType.SFX,
        category: SoundCategory.SKILL,
        soundType: SkillSoundType.BLOODLUST,
        path: 'audio/sfx/skill/bloodlust',
        volume: 0.8
    },
    {
        audioId: 'sfx_skill_haste',
        name: '加速术',
        type: AudioType.SFX,
        category: SoundCategory.SKILL,
        soundType: SkillSoundType.HASTE,
        path: 'audio/sfx/skill/haste',
        volume: 0.7
    },
    {
        audioId: 'sfx_skill_slow',
        name: '迟缓术',
        type: AudioType.SFX,
        category: SoundCategory.SKILL,
        soundType: SkillSoundType.SLOW,
        path: 'audio/sfx/skill/slow',
        volume: 0.7
    },
    {
        audioId: 'sfx_skill_stoneskin',
        name: '石肤术',
        type: AudioType.SFX,
        category: SoundCategory.SKILL,
        soundType: SkillSoundType.STONESKIN,
        path: 'audio/sfx/skill/stoneskin',
        volume: 0.7
    },
    {
        audioId: 'sfx_skill_bless',
        name: '祝福术',
        type: AudioType.SFX,
        category: SoundCategory.SKILL,
        soundType: SkillSoundType.BLESS,
        path: 'audio/sfx/skill/bless',
        volume: 0.8
    },
    {
        audioId: 'sfx_skill_curse',
        name: '诅咒术',
        type: AudioType.SFX,
        category: SoundCategory.SKILL,
        soundType: SkillSoundType.CURSE,
        path: 'audio/sfx/skill/curse',
        volume: 0.8
    }
];

/**
 * 建筑音效配置列表
 */
export const buildingSoundConfigs: SFXConfig[] = [
    {
        audioId: 'sfx_building_construct',
        name: '建造',
        type: AudioType.SFX,
        category: SoundCategory.BUILDING,
        path: 'audio/sfx/building/construct',
        volume: 0.8
    },
    {
        audioId: 'sfx_building_upgrade',
        name: '升级',
        type: AudioType.SFX,
        category: SoundCategory.BUILDING,
        path: 'audio/sfx/building/upgrade',
        volume: 0.9
    },
    {
        audioId: 'sfx_building_complete',
        name: '建造完成',
        type: AudioType.SFX,
        category: SoundCategory.BUILDING,
        path: 'audio/sfx/building/complete',
        volume: 1.0
    }
];

/**
 * 系统音效配置列表
 */
export const systemSoundConfigs: SFXConfig[] = [
    {
        audioId: 'sfx_system_notification',
        name: '通知',
        type: AudioType.SFX,
        category: SoundCategory.SYSTEM,
        path: 'audio/sfx/system/notification',
        volume: 0.9
    },
    {
        audioId: 'sfx_system_achievement',
        name: '成就解锁',
        type: AudioType.SFX,
        category: SoundCategory.SYSTEM,
        path: 'audio/sfx/system/achievement',
        volume: 1.0
    },
    {
        audioId: 'sfx_system_quest_complete',
        name: '任务完成',
        type: AudioType.SFX,
        category: SoundCategory.SYSTEM,
        path: 'audio/sfx/system/quest_complete',
        volume: 1.0
    },
    {
        audioId: 'sfx_system_countdown',
        name: '倒计时',
        type: AudioType.SFX,
        category: SoundCategory.SYSTEM,
        path: 'audio/sfx/system/countdown',
        volume: 0.7
    }
];

/**
 * 所有音效配置映射表
 */
export const audioConfigMap: Map<string, AudioConfig> = new Map([
    ...bgmConfigs.map(c => [c.audioId, c] as [string, AudioConfig]),
    ...uiSoundConfigs.map(c => [c.audioId, c] as [string, AudioConfig]),
    ...battleSoundConfigs.map(c => [c.audioId, c] as [string, AudioConfig]),
    ...skillSoundConfigs.map(c => [c.audioId, c] as [string, AudioConfig]),
    ...buildingSoundConfigs.map(c => [c.audioId, c] as [string, AudioConfig]),
    ...systemSoundConfigs.map(c => [c.audioId, c] as [string, AudioConfig])
]);

/**
 * 根据ID获取音频配置
 */
export function getAudioConfig(audioId: string): AudioConfig | undefined {
    return audioConfigMap.get(audioId);
}

/**
 * 根据场景获取BGM配置
 */
export function getBGMByScene(scene: BGMScene, race?: string): BGMConfig | undefined {
    const configs = bgmConfigs.filter(c => c.scene === scene);

    if (race) {
        const raceConfig = configs.find(c => c.race === race);
        if (raceConfig) {
            return raceConfig;
        }
    }

    return configs.find(c => c.isDefault) || configs[0];
}

/**
 * 根据音效类型获取配置
 */
export function getSoundByType(category: SoundCategory, soundType: string): SFXConfig | undefined {
    let configs: SFXConfig[];

    switch (category) {
        case SoundCategory.UI:
            configs = uiSoundConfigs;
            break;
        case SoundCategory.BATTLE:
            configs = battleSoundConfigs;
            break;
        case SoundCategory.SKILL:
            configs = skillSoundConfigs;
            break;
        case SoundCategory.BUILDING:
            configs = buildingSoundConfigs;
            break;
        case SoundCategory.SYSTEM:
            configs = systemSoundConfigs;
            break;
        default:
            return undefined;
    }

    return configs.find(c => c.soundType === soundType);
}

/**
 * 获取所有UI音效
 */
export function getUISounds(): SFXConfig[] {
    return uiSoundConfigs;
}

/**
 * 获取所有战斗音效
 */
export function getBattleSounds(): SFXConfig[] {
    return battleSoundConfigs;
}

/**
 * 获取所有技能音效
 */
export function getSkillSounds(): SFXConfig[] {
    return skillSoundConfigs;
}