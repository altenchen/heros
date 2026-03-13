/**
 * 音效管理器（兼容层）
 * 兼容旧版 API，内部使用 AudioManager 实现
 * 遵循阿里巴巴开发者手册规范
 */

import { AudioManager, audioManager } from './AudioManager';
import { BGMScene, SoundCategory } from '../config/AudioTypes';

/**
 * 音效配置（兼容旧版）
 */
interface SoundConfig {
    id: string;
    path: string;
    volume: number;
    loop: boolean;
}

/**
 * 音效管理器（兼容层）
 * @deprecated 请使用 AudioManager 替代
 */
export class SoundManager {
    private static instance: SoundManager | null = null;

    private sounds: Map<string, SoundConfig> = new Map();
    private audioManager: AudioManager;

    private constructor() {
        this.audioManager = AudioManager.getInstance();
        this.registerDefaultSounds();
    }

    static getInstance(): SoundManager {
        if (!SoundManager.instance) {
            SoundManager.instance = new SoundManager();
        }
        return SoundManager.instance;
    }

    /**
     * 注册默认音效
     */
    private registerDefaultSounds(): void {
        // 背景音乐
        this.registerSound({
            id: 'bgm_main',
            path: 'audio/bgm/main_theme.mp3',
            volume: 0.5,
            loop: true
        });

        this.registerSound({
            id: 'bgm_battle',
            path: 'audio/bgm/battle_theme.mp3',
            volume: 0.5,
            loop: true
        });

        this.registerSound({
            id: 'bgm_town',
            path: 'audio/bgm/town_theme.mp3',
            volume: 0.5,
            loop: true
        });

        // UI音效
        this.registerSound({
            id: 'sfx_click',
            path: 'audio/sfx/ui_click.mp3',
            volume: 0.8,
            loop: false
        });

        this.registerSound({
            id: 'sfx_close',
            path: 'audio/sfx/ui_close.mp3',
            volume: 0.8,
            loop: false
        });

        // 战斗音效
        this.registerSound({
            id: 'sfx_attack',
            path: 'audio/sfx/attack.mp3',
            volume: 0.8,
            loop: false
        });

        this.registerSound({
            id: 'sfx_hit',
            path: 'audio/sfx/hit.mp3',
            volume: 0.8,
            loop: false
        });

        this.registerSound({
            id: 'sfx_spell',
            path: 'audio/sfx/spell.mp3',
            volume: 0.8,
            loop: false
        });

        this.registerSound({
            id: 'sfx_victory',
            path: 'audio/sfx/victory.mp3',
            volume: 0.8,
            loop: false
        });

        this.registerSound({
            id: 'sfx_defeat',
            path: 'audio/sfx/defeat.mp3',
            volume: 0.8,
            loop: false
        });
    }

    /**
     * 注册音效
     */
    registerSound(config: SoundConfig): void {
        this.sounds.set(config.id, config);
    }

    /**
     * 播放背景音乐
     */
    async playBGM(soundId: string): Promise<void> {
        // 尝试使用新版 AudioManager
        const bgmId = this._convertToNewId(soundId);
        await this.audioManager.playBGM(bgmId);
    }

    /**
     * 停止背景音乐
     */
    stopBGM(): void {
        this.audioManager.stopBGM(0);
    }

    /**
     * 暂停背景音乐
     */
    pauseBGM(): void {
        this.audioManager.pauseBGM();
    }

    /**
     * 恢复背景音乐
     */
    resumeBGM(): void {
        this.audioManager.resumeBGM();
    }

    /**
     * 播放音效
     */
    async playSFX(soundId: string, volume?: number): Promise<void> {
        const sfxId = this._convertToNewId(soundId);
        this.audioManager.playSFX(sfxId, { volume });
    }

    /**
     * 停止音效
     */
    stopSFX(soundId: string): void {
        const sfxId = this._convertToNewId(soundId);
        this.audioManager.stopSFX(sfxId);
    }

    /**
     * 设置音乐音量
     */
    setMusicVolume(volume: number): void {
        this.audioManager.setBGMVolume(volume);
    }

    /**
     * 设置音效音量
     */
    setSFXVolume(volume: number): void {
        this.audioManager.setSFXVolume(volume);
    }

    /**
     * 静音音乐
     */
    muteMusic(): void {
        const settings = this.audioManager.getSettings();
        if (settings.bgmEnabled) {
            this.audioManager.toggleBGM();
        }
    }

    /**
     * 取消静音音乐
     */
    unmuteMusic(): void {
        const settings = this.audioManager.getSettings();
        if (!settings.bgmEnabled) {
            this.audioManager.toggleBGM();
        }
    }

    /**
     * 静音音效
     */
    muteSFX(): void {
        const settings = this.audioManager.getSettings();
        if (settings.sfxEnabled) {
            this.audioManager.toggleSFX();
        }
    }

    /**
     * 取消静音音效
     */
    unmuteSFX(): void {
        const settings = this.audioManager.getSettings();
        if (!settings.sfxEnabled) {
            this.audioManager.toggleSFX();
        }
    }

    /**
     * 切换音乐静音状态
     */
    toggleMusicMute(): boolean {
        return !this.audioManager.toggleBGM();
    }

    /**
     * 切换音效静音状态
     */
    toggleSFXMute(): boolean {
        return !this.audioManager.toggleSFX();
    }

    /**
     * 获取音乐音量
     */
    getMusicVolume(): number {
        return this.audioManager.getSettings().bgmVolume;
    }

    /**
     * 获取音效音量
     */
    getSFXVolume(): number {
        return this.audioManager.getSettings().sfxVolume;
    }

    /**
     * 音乐是否静音
     */
    isMusicMuted(): boolean {
        return !this.audioManager.getSettings().bgmEnabled;
    }

    /**
     * 音效是否静音
     */
    isSFXMuted(): boolean {
        return !this.audioManager.getSettings().sfxEnabled;
    }

    /**
     * 保存音量设置
     */
    saveSettings(): void {
        // AudioManager 自动保存
    }

    /**
     * 加载音量设置
     */
    loadSettings(): void {
        // AudioManager 自动加载
    }

    /**
     * 停止所有音效
     */
    stopAll(): void {
        this.audioManager.stopAll();
    }

    /**
     * 转换旧版 ID 到新版 ID
     */
    private _convertToNewId(oldId: string): string {
        const mapping: Record<string, string> = {
            'bgm_main': BGMScene.MAIN_MENU,
            'bgm_battle': BGMScene.BATTLE,
            'bgm_town': BGMScene.TOWN,
            'sfx_click': 'sfx_ui_button_click',
            'sfx_close': 'sfx_ui_panel_close',
            'sfx_attack': 'sfx_battle_attack_melee',
            'sfx_hit': 'sfx_battle_hit',
            'sfx_spell': 'sfx_skill_fireball',
            'sfx_victory': 'sfx_battle_victory',
            'sfx_defeat': 'sfx_battle_defeat'
        };
        return mapping[oldId] || oldId;
    }
}

// 导出音效管理器实例
export const soundManager = SoundManager.getInstance();