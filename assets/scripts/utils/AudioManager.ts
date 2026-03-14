/**
 * 音频管理器
 * 管理游戏所有音频播放，支持 BGM、音效、语音、环境音
 * 遵循阿里巴巴开发者手册规范
 */

import {
    AudioType,
    SoundCategory,
    BGMScene,
    AudioConfig,
    BGMConfig,
    SFXConfig,
    PlayOptions,
    AudioState,
    AudioInstance,
    AudioSettings,
    AudioEventType,
    AudioEventData,
    DEFAULT_AUDIO_SETTINGS
} from '../config/AudioTypes';
import {
    audioConfigMap,
    getBGMByScene,
    getSoundByType,
    bgmConfigs,
    uiSoundConfigs,
    battleSoundConfigs,
    skillSoundConfigs
} from '../config/audio.json';
import { EventCenter } from './EventTarget';

/**
 * 音频池项
 */
interface PooledAudio {
    id: string;
    lastPlayTime: number;
    playCount: number;
}

/**
 * 音频管理器
 * 统一管理 BGM、SFX、语音、环境音
 */
export class AudioManager {
    private static _instance: AudioManager | null = null;

    /** 音频设置 */
    private _settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };

    /** 当前 BGM 实例 */
    private _currentBGM: AudioInstance | null = null;

    /** 当前 BGM 配置 ID */
    private _currentBGMId: string = '';

    /** 音效实例池 */
    private _sfxPool: Map<string, AudioInstance> = new Map();

    /** 音效冷却池 */
    private _sfxCooldown: Map<string, PooledAudio> = new Map();

    /** 音效并发计数 */
    private _sfxPlayCount: Map<string, number> = new Map();

    /** 环境音实例 */
    private _ambientInstances: Map<string, AudioInstance> = new Map();

    /** 音频上下文 */
    private _audioContext: AudioContext | null = null;

    /** 是否初始化 */
    private _initialized: boolean = false;

    /** 存储键 */
    private readonly STORAGE_KEY = 'heros_audio_settings';

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): AudioManager {
        if (!AudioManager._instance) {
            AudioManager._instance = new AudioManager();
        }
        return AudioManager._instance;
    }

    /**
     * 初始化音频系统
     */
    init(): void {
        if (this._initialized) return;

        // 加载设置
        this._loadSettings();

        // 创建音频上下文（使用兼容的方式）
        try {
            const AudioContextClass = typeof AudioContext !== 'undefined' ? AudioContext :
                (typeof window !== 'undefined' ? (window as any).AudioContext || (window as any).webkitAudioContext : null);
            if (AudioContextClass) {
                this._audioContext = new AudioContextClass();
            }
        } catch (e) {
            console.warn('[AudioManager] Web Audio API 不可用');
        }

        this._initialized = true;
        console.log('[AudioManager] 初始化完成');
    }

    /**
     * 播放 BGM
     * @param audioId 音频ID 或 BGM场景
     * @param options 播放选项
     */
    async playBGM(audioId: string, options?: PlayOptions): Promise<boolean> {
        if (!this._settings.bgmEnabled) {
            console.log('[AudioManager] BGM 已禁用');
            return false;
        }

        // 检查是否是场景类型
        const sceneKeys = Object.values(BGMScene);
        let config: BGMConfig | undefined;

        if (sceneKeys.includes(audioId as BGMScene)) {
            config = getBGMByScene(audioId as BGMScene);
        } else {
            config = audioConfigMap.get(audioId) as BGMConfig | undefined;
        }

        if (!config) {
            console.warn(`[AudioManager] BGM 配置不存在: ${audioId}`);
            return false;
        }

        // 相同 BGM 不重复播放
        if (this._currentBGMId === config.audioId && this._currentBGM?.state === AudioState.PLAYING) {
            return true;
        }

        // 停止当前 BGM（带淡出）
        if (this._currentBGM) {
            await this._fadeOutBGM(config.fadeOut ?? 1.0);
        }

        // 创建新的 BGM 实例
        const instance: AudioInstance = {
            instanceId: `bgm_${Date.now()}`,
            audioId: config.audioId,
            state: AudioState.FADING_IN,
            volume: 0,
            playTime: 0
        };

        this._currentBGM = instance;
        this._currentBGMId = config.audioId;

        // 计算实际音量
        const targetVolume = this._getActualVolume(AudioType.BGM, config.volume ?? 0.8, options?.volume);

        // 淡入播放
        const fadeIn = options?.fadeIn ?? config.fadeIn ?? 0;
        if (fadeIn > 0) {
            await this._fadeInBGM(targetVolume, fadeIn);
        } else {
            instance.volume = targetVolume;
            instance.state = AudioState.PLAYING;
        }

        // 触发事件
        this._emit(AudioEventType.BGM_START, {
            audioId: config.audioId,
            type: AudioType.BGM
        });

        console.log(`[AudioManager] 播放 BGM: ${config.name}`);
        return true;
    }

    /**
     * 停止 BGM
     * @param fadeOut 淡出时间
     */
    async stopBGM(fadeOut: number = 1.0): Promise<void> {
        if (!this._currentBGM) return;

        await this._fadeOutBGM(fadeOut);

        this._currentBGM = null;
        this._currentBGMId = '';

        this._emit(AudioEventType.BGM_STOP, { type: AudioType.BGM });
    }

    /**
     * 暂停 BGM
     */
    pauseBGM(): void {
        if (this._currentBGM && this._currentBGM.state === AudioState.PLAYING) {
            this._currentBGM.state = AudioState.PAUSED;
            console.log('[AudioManager] 暂停 BGM');
        }
    }

    /**
     * 恢复 BGM
     */
    resumeBGM(): void {
        if (this._currentBGM && this._currentBGM.state === AudioState.PAUSED) {
            this._currentBGM.state = AudioState.PLAYING;
            console.log('[AudioManager] 恢复 BGM');
        }
    }

    /**
     * 播放音效
     * @param audioId 音效ID 或 (分类, 音效类型)
     * @param options 播放选项
     */
    playSFX(audioId: string, options?: PlayOptions): boolean;
    playSFX(category: SoundCategory, soundType: string, options?: PlayOptions): boolean;
    playSFX(audioIdOrCategory: string, soundTypeOrOptions?: string | PlayOptions, options?: PlayOptions): boolean {
        if (!this._settings.sfxEnabled) {
            return false;
        }

        let config: SFXConfig | undefined;
        let audioId: string;

        // 重载处理
        if (typeof soundTypeOrOptions === 'string') {
            // playSFX(category, soundType, options)
            config = getSoundByType(audioIdOrCategory as SoundCategory, soundTypeOrOptions);
            audioId = config?.audioId ?? '';
            options = options;
        } else {
            // playSFX(audioId, options)
            audioId = audioIdOrCategory;
            config = audioConfigMap.get(audioId) as SFXConfig | undefined;
            options = soundTypeOrOptions;
        }

        if (!config) {
            console.warn(`[AudioManager] 音效配置不存在: ${audioId}`);
            return false;
        }

        // 检查冷却
        if (config.cooldown && !this._checkCooldown(config.audioId, config.cooldown)) {
            return false;
        }

        // 检查最小间隔
        if (config.minInterval && !this._checkMinInterval(config.audioId, config.minInterval)) {
            return false;
        }

        // 检查并发数
        const maxInstances = config.maxInstances ?? 5;
        if (!this._checkMaxInstances(config.audioId, maxInstances)) {
            return false;
        }

        // 计算实际音量
        let volume = this._getActualVolume(AudioType.SFX, config.volume ?? 1.0, options?.volume);

        // 音高变化
        let pitch = 1.0;
        if (config.pitchVariation) {
            pitch = 1.0 + (Math.random() * 2 - 1) * config.pitchVariation;
        }

        // 创建实例
        const instanceId = `sfx_${config.audioId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const instance: AudioInstance = {
            instanceId,
            audioId: config.audioId,
            state: AudioState.PLAYING,
            volume,
            playTime: Date.now()
        };

        this._sfxPool.set(instanceId, instance);
        this._updatePlayCount(config.audioId, 1);

        // 模拟播放完成
        setTimeout(() => {
            this._sfxPool.delete(instanceId);
            this._updatePlayCount(config!.audioId, -1);
        }, 1000); // 假设音效时长为1秒

        // 触发事件
        this._emit(AudioEventType.SFX_PLAY, {
            audioId: config.audioId,
            type: AudioType.SFX
        });

        return true;
    }

    /**
     * 播放 UI 音效
     */
    playUISound(soundType: string, options?: PlayOptions): boolean {
        return this.playSFX(SoundCategory.UI, soundType, options);
    }

    /**
     * 播放战斗音效
     */
    playBattleSound(soundType: string, options?: PlayOptions): boolean {
        return this.playSFX(SoundCategory.BATTLE, soundType, options);
    }

    /**
     * 播放技能音效
     */
    playSkillSound(soundType: string, options?: PlayOptions): boolean {
        return this.playSFX(SoundCategory.SKILL, soundType, options);
    }

    /**
     * 停止指定音效
     */
    stopSFX(audioId: string): void {
        const keysToRemove: string[] = [];
        this._sfxPool.forEach((instance, key) => {
            if (instance.audioId === audioId) {
                instance.state = AudioState.STOPPED;
                keysToRemove.push(key);
            }
        });
        keysToRemove.forEach(key => this._sfxPool.delete(key));
    }

    /**
     * 停止所有音效
     */
    stopAllSFX(): void {
        this._sfxPool.clear();
        this._sfxPlayCount.clear();
    }

    /**
     * 设置主音量
     */
    setMasterVolume(volume: number): void {
        this._settings.masterVolume = Math.max(0, Math.min(1, volume));
        this._onSettingsChange();
    }

    /**
     * 设置 BGM 音量
     */
    setBGMVolume(volume: number): void {
        this._settings.bgmVolume = Math.max(0, Math.min(1, volume));
        this._onSettingsChange();

        // 更新当前 BGM 音量
        if (this._currentBGM) {
            const config = audioConfigMap.get(this._currentBGM.audioId) as BGMConfig;
            if (config) {
                this._currentBGM.volume = this._getActualVolume(AudioType.BGM, config.volume ?? 0.8);
            }
        }
    }

    /**
     * 设置音效音量
     */
    setSFXVolume(volume: number): void {
        this._settings.sfxVolume = Math.max(0, Math.min(1, volume));
        this._onSettingsChange();
    }

    /**
     * 设置语音音量
     */
    setVoiceVolume(volume: number): void {
        this._settings.voiceVolume = Math.max(0, Math.min(1, volume));
        this._onSettingsChange();
    }

    /**
     * 设置环境音音量
     */
    setAmbientVolume(volume: number): void {
        this._settings.ambientVolume = Math.max(0, Math.min(1, volume));
        this._onSettingsChange();
    }

    /**
     * 开关 BGM
     */
    toggleBGM(): boolean {
        this._settings.bgmEnabled = !this._settings.bgmEnabled;
        this._onSettingsChange();

        if (!this._settings.bgmEnabled) {
            this.pauseBGM();
        } else {
            this.resumeBGM();
        }

        return this._settings.bgmEnabled;
    }

    /**
     * 开关音效
     */
    toggleSFX(): boolean {
        this._settings.sfxEnabled = !this._settings.sfxEnabled;
        this._onSettingsChange();
        return this._settings.sfxEnabled;
    }

    /**
     * 开关语音
     */
    toggleVoice(): boolean {
        this._settings.voiceEnabled = !this._settings.voiceEnabled;
        this._onSettingsChange();
        return this._settings.voiceEnabled;
    }

    /**
     * 开关环境音
     */
    toggleAmbient(): boolean {
        this._settings.ambientEnabled = !this._settings.ambientEnabled;
        this._onSettingsChange();
        return this._settings.ambientEnabled;
    }

    /**
     * 开关震动
     */
    toggleVibration(): boolean {
        this._settings.vibrationEnabled = !this._settings.vibrationEnabled;
        this._onSettingsChange();
        return this._settings.vibrationEnabled;
    }

    /**
     * 获取设置
     */
    getSettings(): AudioSettings {
        return { ...this._settings };
    }

    /**
     * 批量设置
     */
    applySettings(settings: Partial<AudioSettings>): void {
        Object.assign(this._settings, settings);
        this._onSettingsChange();
    }

    /**
     * 获取当前 BGM ID
     */
    getCurrentBGM(): string {
        return this._currentBGMId;
    }

    /**
     * 是否正在播放 BGM
     */
    isBGMPlaying(): boolean {
        return this._currentBGM?.state === AudioState.PLAYING;
    }

    /**
     * 停止所有音频
     */
    stopAll(): void {
        this.stopBGM(0);
        this.stopAllSFX();
        this._ambientInstances.clear();
    }

    /**
     * 暂停所有音频
     */
    pauseAll(): void {
        this.pauseBGM();
        this._sfxPool.forEach(instance => {
            if (instance.state === AudioState.PLAYING) {
                instance.state = AudioState.PAUSED;
            }
        });
    }

    /**
     * 恢复所有音频
     */
    resumeAll(): void {
        this.resumeBGM();
        this._sfxPool.forEach(instance => {
            if (instance.state === AudioState.PAUSED) {
                instance.state = AudioState.PLAYING;
            }
        });
    }

    /**
     * 计算实际音量
     */
    private _getActualVolume(type: AudioType, baseVolume: number, overrideVolume?: number): number {
        const masterVolume = this._settings.masterVolume;
        let typeVolume = 1.0;

        switch (type) {
            case AudioType.BGM:
                typeVolume = this._settings.bgmVolume;
                break;
            case AudioType.SFX:
                typeVolume = this._settings.sfxVolume;
                break;
            case AudioType.VOICE:
                typeVolume = this._settings.voiceVolume;
                break;
            case AudioType.AMBIENT:
                typeVolume = this._settings.ambientVolume;
                break;
        }

        const vol = overrideVolume ?? baseVolume;
        return vol * typeVolume * masterVolume;
    }

    /**
     * BGM 淡入
     */
    private async _fadeInBGM(targetVolume: number, duration: number): Promise<void> {
        if (!this._currentBGM) return;

        this._currentBGM.state = AudioState.FADING_IN;
        const startTime = Date.now();
        const startVolume = 0;

        return new Promise(resolve => {
            const animate = () => {
                if (!this._currentBGM) {
                    resolve();
                    return;
                }

                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);

                this._currentBGM!.volume = startVolume + (targetVolume - startVolume) * progress;

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this._currentBGM!.state = AudioState.PLAYING;
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    /**
     * BGM 淡出
     */
    private async _fadeOutBGM(duration: number): Promise<void> {
        if (!this._currentBGM) return;

        this._currentBGM.state = AudioState.FADING_OUT;
        const startTime = Date.now();
        const startVolume = this._currentBGM.volume;

        return new Promise(resolve => {
            const animate = () => {
                if (!this._currentBGM) {
                    resolve();
                    return;
                }

                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / duration, 1);

                this._currentBGM!.volume = startVolume * (1 - progress);

                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this._currentBGM!.state = AudioState.STOPPED;
                    resolve();
                }
            };

            requestAnimationFrame(animate);
        });
    }

    /**
     * 检查冷却
     */
    private _checkCooldown(audioId: string, cooldown: number): boolean {
        const pooled = this._sfxCooldown.get(audioId);
        const now = Date.now();

        if (pooled && now - pooled.lastPlayTime < cooldown) {
            return false;
        }

        this._sfxCooldown.set(audioId, {
            id: audioId,
            lastPlayTime: now,
            playCount: 1
        });

        return true;
    }

    /**
     * 检查最小间隔
     */
    private _checkMinInterval(audioId: string, minInterval: number): boolean {
        const pooled = this._sfxCooldown.get(audioId);
        const now = Date.now();

        if (pooled && now - pooled.lastPlayTime < minInterval) {
            return false;
        }

        this._sfxCooldown.set(audioId, {
            id: audioId,
            lastPlayTime: now,
            playCount: 1
        });

        return true;
    }

    /**
     * 检查最大并发数
     */
    private _checkMaxInstances(audioId: string, maxInstances: number): boolean {
        const count = this._sfxPlayCount.get(audioId) ?? 0;
        return count < maxInstances;
    }

    /**
     * 更新播放计数
     */
    private _updatePlayCount(audioId: string, delta: number): void {
        const count = this._sfxPlayCount.get(audioId) ?? 0;
        const newCount = count + delta;
        if (newCount <= 0) {
            this._sfxPlayCount.delete(audioId);
        } else {
            this._sfxPlayCount.set(audioId, newCount);
        }
    }

    /**
     * 设置变化回调
     */
    private _onSettingsChange(): void {
        this._saveSettings();
        this._emit(AudioEventType.SETTINGS_CHANGE, {
            settings: this._settings
        });
    }

    /**
     * 加载设置
     */
    private _loadSettings(): void {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                const settings = JSON.parse(saved) as Partial<AudioSettings>;
                Object.assign(this._settings, settings);
                console.log('[AudioManager] 加载设置成功');
            }
        } catch (e) {
            console.warn('[AudioManager] 加载设置失败', e);
        }
    }

    /**
     * 保存设置
     */
    private _saveSettings(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this._settings));
        } catch (e) {
            console.warn('[AudioManager] 保存设置失败', e);
        }
    }

    /**
     * 发送事件
     */
    private _emit(type: AudioEventType, data: AudioEventData): void {
        EventCenter.emit(type, data);
    }

    /**
     * 清理资源
     */
    destroy(): void {
        this.stopAll();
        this._sfxPool.clear();
        this._sfxCooldown.clear();
        this._sfxPlayCount.clear();
        this._ambientInstances.clear();

        if (this._audioContext) {
            this._audioContext.close();
            this._audioContext = null;
        }

        this._initialized = false;
        AudioManager._instance = null;
    }
}

// 导出单例
export const audioManager = AudioManager.getInstance();