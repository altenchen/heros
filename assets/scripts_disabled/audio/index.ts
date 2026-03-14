/**
 * 音效模块
 * 导出音效系统相关类和配置
 */

export * from '../config/AudioTypes';
export { SoundManager, soundManager } from './SoundManager';
export {
    bgmConfigs,
    uiSoundConfigs,
    battleSoundConfigs,
    skillSoundConfigs,
    buildingSoundConfigs,
    systemSoundConfigs,
    audioConfigMap,
    getAudioConfig,
    getBGMByScene,
    getSoundByType,
    getUISounds,
    getBattleSounds,
    getSkillSounds
} from '../config/audio.json';