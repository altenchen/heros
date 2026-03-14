/**
 * 音效管理器
 * 管理游戏中的所有音频播放
 * 遵循阿里巴巴开发者手册规范
 */

import {
    AudioType,
    SoundCategory,
    BGMScene,
    AudioSettings,
    AudioState,
    AudioInstance,
    PlayOptions,
    AudioEventType,
    AudioEventData,
    DEFAULT_AUDIO_SETTINGS
} from '../config/AudioTypes';
import {
    bgmConfigs,
    uiSoundConfigs,
    battleSoundConfigs,
    skillSoundConfigs,
    buildingSoundConfigs,
    systemSoundConfigs,
    getAudioConfig,
    getBGMByScene,
    getSoundByType
} from '../config/audio.json';
import { EventCenter } from '../utils/EventTarget';

/**
 * 音效管理器
 * 单例模式
 */
export class SoundManager {
    private static _instance: SoundManager | null = null;

    /** 音频设置 */
    private _settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };

    /** 当前BGM实例 */
    private _currentBGM: AudioInstance | null = null;

    /** 当前BGM配置ID */
    private _currentBGMId: string = '';

    /** 音效实例池 */
    private _sfxPool: Map<string, AudioInstance[]> = new Map();

    /** 音频资源缓存 */
    private _audioCache: Map<string, any> = new Map();

    /** 音量设置键 */
    private readonly SETTINGS_KEY = 'hmm_legacy_audio_settings';

    /** 最大音效实例数 */
    private readonly MAX_SFX_INSTANCES = 10;

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): SoundManager {
        if (!SoundManager._instance) {
            SoundManager._instance = new SoundManager();
        }
        return SoundManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this._loadSettings();
        console.log('[SoundManager] 初始化完成');
    }

    /**
     * 加载设置
     */
    private _loadSettings(): void {
        try {
            const saved = localStorage.getItem(this.SETTINGS_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                this._settings = { ...DEFAULT_AUDIO_SETTINGS, ...parsed };
            }
        } catch (e) {
            console.error('[SoundManager] 加载设置失败:', e);
        }
    }

    /**
     * 保存设置
     */
    private _saveSettings(): void {
        try {
            localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(this._settings));
        } catch (e) {
            console.error('[SoundManager] 保存设置失败:', e);
        }
    }

    /**
     * 获取当前设置
     */
    getSettings(): AudioSettings {
        return { ...this._settings };
    }

    /**
     * 更新设置
     */
    updateSettings(settings: Partial<AudioSettings>): void {
        this._settings = { ...this._settings, ...settings };
        this._saveSettings();

        // 应用音量变化
        if (settings.masterVolume !== undefined ||
            settings.bgmVolume !== undefined ||
            settings.sfxVolume !== undefined) {
            this._applyVolumeChanges();
        }

        // 发送设置变化事件
        const eventData: AudioEventData = {
            settings: this._settings
        };
        EventCenter.emit(AudioEventType.SETTINGS_CHANGE, eventData);
    }

    /**
     * 设置BGM开关
     */
    setMusicEnabled(enabled: boolean): void {
        this.updateSettings({ bgmEnabled: enabled });
    }

    /**
     * 设置音效开关
     */
    setSoundEnabled(enabled: boolean): void {
        this.updateSettings({ sfxEnabled: enabled });
    }

    /**
     * 设置BGM音量
     */
    setMusicVolume(volume: number): void {
        this.updateSettings({ bgmVolume: volume });
    }

    /**
     * 设置音效音量
     */
    setSoundVolume(volume: number): void {
        this.updateSettings({ sfxVolume: volume });
    }

    /**
     * 应用音量变化
     */
    private _applyVolumeChanges(): void {
        // 更新BGM音量
        if (this._currentBGM) {
            const volume = this._calculateBGMVolume();
            this._setAudioVolume(this._currentBGM, volume);
        }
    }

    /**
     * 计算BGM实际音量
     */
    private _calculateBGMVolume(configVolume: number = 1.0): number {
        if (!this._settings.bgmEnabled) {
            return 0;
        }
        return this._settings.masterVolume * this._settings.bgmVolume * configVolume;
    }

    /**
     * 计算SFX实际音量
     */
    private _calculateSFXVolume(configVolume: number = 1.0): number {
        if (!this._settings.sfxEnabled) {
            return 0;
        }
        return this._settings.masterVolume * this._settings.sfxVolume * configVolume;
    }

    /**
     * 播放BGM
     * @param audioId 音频ID或场景类型
     * @param options 播放选项
     */
    playBGM(audioId: string, options?: PlayOptions): void;
    playBGM(scene: BGMScene, race?: string, options?: PlayOptions): void;
    playBGM(audioIdOrScene: string | BGMScene, raceOrOptions?: string | PlayOptions, options?: PlayOptions): void {
        let config: any;

        if (typeof audioIdOrScene === 'string') {
            // 按ID播放
            config = getAudioConfig(audioIdOrScene);
            if (!config || config.type !== AudioType.BGM) {
                console.warn(`[SoundManager] 未找到BGM配置: ${audioIdOrScene}`);
                return;
            }
            options = raceOrOptions as PlayOptions;
        } else {
            // 按场景播放
            config = getBGMByScene(audioIdOrScene, raceOrOptions as string);
            if (!config) {
                console.warn(`[SoundManager] 未找到场景BGM: ${audioIdOrScene}`);
                return;
            }
        }

        // 如果是同一首BGM，不重复播放
        if (this._currentBGMId === config.audioId && this._currentBGM?.state === AudioState.PLAYING) {
            return;
        }

        // 停止当前BGM
        if (this._currentBGM) {
            this._stopBGM(config.fadeIn || 0);
        }

        // 播放新BGM
        this._playBGMInternal(config, options);
    }

    /**
     * 内部播放BGM
     */
    private async _playBGMInternal(config: any, options?: PlayOptions): Promise<void> {
        try {
            // 加载音频资源
            const audioClip = await this._loadAudio(config.path);
            if (!audioClip) {
                console.warn(`[SoundManager] 加载BGM失败: ${config.path}`);
                return;
            }

            const volume = this._calculateBGMVolume(options?.volume ?? config.volume ?? 1.0);
            const fadeIn = options?.fadeIn ?? config.fadeIn ?? 0;

            // 创建音频实例
            const instance = this._createAudioInstance(config.audioId, audioClip);

            // 设置初始音量（淡入效果）
            if (fadeIn > 0) {
                this._setAudioVolume(instance, 0);
                instance.state = AudioState.FADING_IN;
            }

            // 开始播放
            this._startAudio(instance, {
                volume,
                loop: options?.loop ?? config.loop ?? true,
                fadeIn
            });

            this._currentBGM = instance;
            this._currentBGMId = config.audioId;

            // 发送事件
            const eventData: AudioEventData = {
                audioId: config.audioId,
                type: AudioType.BGM
            };
            EventCenter.emit(AudioEventType.BGM_START, eventData);

            console.log(`[SoundManager] 播放BGM: ${config.name}`);
        } catch (e) {
            console.error('[SoundManager] 播放BGM失败:', e);
        }
    }

    /**
     * 停止BGM
     */
    stopBGM(fadeOut: number = 1.0): void {
        if (this._currentBGM) {
            this._stopBGM(fadeOut);
        }
    }

    /**
     * 停止BGM内部实现
     */
    private _stopBGM(fadeOut: number = 1.0): void {
        if (!this._currentBGM) {
            return;
        }

        const instance = this._currentBGM;

        if (fadeOut > 0) {
            // 淡出
            instance.state = AudioState.FADING_OUT;
            this._fadeAudio(instance, 0, fadeOut, () => {
                this._stopAudio(instance);
                this._releaseAudioInstance(instance);
            });
        } else {
            // 立即停止
            this._stopAudio(instance);
            this._releaseAudioInstance(instance);
        }

        // 发送事件
        const eventData: AudioEventData = {
            audioId: this._currentBGMId,
            type: AudioType.BGM
        };
        EventCenter.emit(AudioEventType.BGM_STOP, eventData);

        this._currentBGM = null;
        this._currentBGMId = '';
    }

    /**
     * 暂停BGM
     */
    pauseBGM(): void {
        if (this._currentBGM && this._currentBGM.state === AudioState.PLAYING) {
            this._pauseAudio(this._currentBGM);
        }
    }

    /**
     * 恢复BGM
     */
    resumeBGM(): void {
        if (this._currentBGM && this._currentBGM.state === AudioState.PAUSED) {
            this._resumeAudio(this._currentBGM);
        }
    }

    /**
     * 播放音效
     * @param audioId 音频ID
     * @param options 播放选项
     */
    playSFX(audioId: string, options?: PlayOptions): void;
    /**
     * 播放音效
     * @param category 音效分类
     * @param soundType 音效类型
     * @param options 播放选项
     */
    playSFX(category: SoundCategory, soundType: string, options?: PlayOptions): void;
    playSFX(audioIdOrCategory: string | SoundCategory, soundTypeOrOptions?: string | PlayOptions, options?: PlayOptions): void {
        let config: any;

        if (typeof audioIdOrCategory === 'string') {
            // 按ID播放
            config = getAudioConfig(audioIdOrCategory);
            if (!config || config.type !== AudioType.SFX) {
                console.warn(`[SoundManager] 未找到音效配置: ${audioIdOrCategory}`);
                return;
            }
            options = soundTypeOrOptions as PlayOptions;
        } else {
            // 按类型播放
            config = getSoundByType(audioIdOrCategory, soundTypeOrOptions as string);
            if (!config) {
                console.warn(`[SoundManager] 未找到音效: ${audioIdOrCategory}/${soundTypeOrOptions}`);
                return;
            }
        }

        this._playSFXInternal(config, options);
    }

    /**
     * 内部播放音效
     */
    private async _playSFXInternal(config: any, options?: PlayOptions): Promise<void> {
        // 检查是否启用音效
        if (!this._settings.sfxEnabled) {
            return;
        }

        // 检查冷却时间
        if (config.cooldown || config.minInterval) {
            const lastPlayTime = this._getLastPlayTime(config.audioId);
            const now = Date.now();
            const cooldown = config.cooldown || config.minInterval || 0;
            if (now - lastPlayTime < cooldown) {
                return;
            }
        }

        try {
            // 加载音频资源
            const audioClip = await this._loadAudio(config.path);
            if (!audioClip) {
                console.warn(`[SoundManager] 加载音效失败: ${config.path}`);
                return;
            }

            // 检查最大实例数
            this._cleanupSFXPool(config.audioId, config.maxInstances);

            const volume = this._calculateSFXVolume(options?.volume ?? config.volume ?? 1.0);

            // 创建音频实例
            const instance = this._createAudioInstance(config.audioId, audioClip);

            // 音高变化
            let pitch = options?.pitch ?? 1.0;
            if (config.pitchVariation) {
                const variation = config.pitchVariation;
                pitch = 1.0 + (Math.random() * 2 - 1) * variation;
            }

            // 播放
            this._startAudio(instance, {
                volume,
                pitch,
                speed: options?.speed
            });

            // 添加到池中
            this._addToSFXPool(config.audioId, instance);

            // 发送事件
            const eventData: AudioEventData = {
                audioId: config.audioId,
                type: AudioType.SFX
            };
            EventCenter.emit(AudioEventType.SFX_PLAY, eventData);

            // 播放完成后自动清理
            if (options?.onComplete) {
                options.onComplete();
            }
        } catch (e) {
            console.error('[SoundManager] 播放音效失败:', e);
        }
    }

    /**
     * 播放UI音效
     */
    playUISound(soundType: string, options?: PlayOptions): void {
        this.playSFX(SoundCategory.UI, soundType, options);
    }

    /**
     * 播放战斗音效
     */
    playBattleSound(soundType: string, options?: PlayOptions): void {
        this.playSFX(SoundCategory.BATTLE, soundType, options);
    }

    /**
     * 播放技能音效
     */
    playSkillSound(soundType: string, options?: PlayOptions): void {
        this.playSFX(SoundCategory.SKILL, soundType, options);
    }

    /**
     * 播放建筑音效
     */
    playBuildingSound(soundType: string, options?: PlayOptions): void {
        this.playSFX(SoundCategory.BUILDING, soundType, options);
    }

    /**
     * 播放系统音效
     */
    playSystemSound(soundType: string, options?: PlayOptions): void {
        this.playSFX(SoundCategory.SYSTEM, soundType, options);
    }

    /**
     * 停止所有音效
     */
    stopAllSFX(): void {
        this._sfxPool.forEach((instances, audioId) => {
            instances.forEach(instance => {
                this._stopAudio(instance);
                this._releaseAudioInstance(instance);
            });
        });
        this._sfxPool.clear();
    }

    /**
     * 停止指定音效
     */
    stopSFX(audioId: string): void {
        const instances = this._sfxPool.get(audioId);
        if (instances) {
            instances.forEach(instance => {
                this._stopAudio(instance);
                this._releaseAudioInstance(instance);
            });
            this._sfxPool.delete(audioId);
        }
    }

    /**
     * 预加载音频
     */
    async preloadAudio(paths: string[]): Promise<void> {
        const promises = paths.map(path => this._loadAudio(path));
        await Promise.all(promises);
        console.log(`[SoundManager] 预加载完成: ${paths.length} 个音频`);
    }

    /**
     * 预加载场景音频
     */
    async preloadSceneAudio(scene: BGMScene): Promise<void> {
        const bgmConfig = getBGMByScene(scene);
        if (bgmConfig) {
            await this._loadAudio(bgmConfig.path);
        }
    }

    /**
     * 释放音频资源
     */
    releaseAudio(path: string): void {
        const audio = this._audioCache.get(path);
        if (audio) {
            // Cocos Creator中释放资源
            // resources.release(path);
            this._audioCache.delete(path);
        }
    }

    /**
     * 释放所有音频资源
     */
    releaseAll(): void {
        this.stopAllSFX();
        this.stopBGM(0);
        this._audioCache.clear();
    }

    // ==================== 内部方法 ====================

    /**
     * 加载音频资源
     */
    private async _loadAudio(path: string): Promise<any> {
        // 检查缓存
        if (this._audioCache.has(path)) {
            return this._audioCache.get(path);
        }

        // 在Cocos Creator中加载
        // return new Promise((resolve, reject) => {
        //     resources.load(path, AudioClip, (err, clip) => {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             this._audioCache.set(path, clip);
        //             resolve(clip);
        //         }
        //     });
        // });

        // 模拟返回
        const mockClip = { path, duration: 1 };
        this._audioCache.set(path, mockClip);
        return mockClip;
    }

    /**
     * 创建音频实例
     */
    private _createAudioInstance(audioId: string, audioClip: any): AudioInstance {
        return {
            instanceId: `${audioId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            audioId,
            state: AudioState.STOPPED,
            volume: 1.0,
            playTime: 0,
            source: audioClip
        };
    }

    /**
     * 释放音频实例
     */
    private _releaseAudioInstance(instance: AudioInstance): void {
        instance.source = null;
        instance.state = AudioState.STOPPED;
    }

    /**
     * 开始播放音频
     */
    private _startAudio(instance: AudioInstance, options: {
        volume?: number;
        loop?: boolean;
        pitch?: number;
        speed?: number;
        fadeIn?: number;
    } = {}): void {
        const { volume = 1.0, loop = false, pitch = 1.0, speed = 1.0, fadeIn = 0 } = options;

        // 在Cocos Creator中播放
        // const source = instance.source.getComponent(AudioSource);
        // source.volume = fadeIn > 0 ? 0 : volume;
        // source.loop = loop;
        // source.play();

        instance.state = AudioState.PLAYING;
        instance.volume = volume;

        // 淡入效果
        if (fadeIn > 0) {
            instance.state = AudioState.FADING_IN;
            this._fadeAudio(instance, volume, fadeIn, () => {
                instance.state = AudioState.PLAYING;
            });
        }
    }

    /**
     * 停止音频
     */
    private _stopAudio(instance: AudioInstance): void {
        // 在Cocos Creator中停止
        // const source = instance.source.getComponent(AudioSource);
        // source.stop();

        instance.state = AudioState.STOPPED;
    }

    /**
     * 暂停音频
     */
    private _pauseAudio(instance: AudioInstance): void {
        // const source = instance.source.getComponent(AudioSource);
        // source.pause();

        instance.state = AudioState.PAUSED;
    }

    /**
     * 恢复音频
     */
    private _resumeAudio(instance: AudioInstance): void {
        // const source = instance.source.getComponent(AudioSource);
        // source.play();

        instance.state = AudioState.PLAYING;
    }

    /**
     * 设置音频音量
     */
    private _setAudioVolume(instance: AudioInstance, volume: number): void {
        // const source = instance.source.getComponent(AudioSource);
        // source.volume = volume;

        instance.volume = volume;
    }

    /**
     * 音频淡入淡出
     */
    private _fadeAudio(instance: AudioInstance, targetVolume: number, duration: number, callback?: () => void): void {
        const startVolume = instance.volume;
        const startTime = Date.now();
        const durationMs = duration * 1000;

        const updateFade = () => {
            if (instance.state !== AudioState.FADING_IN && instance.state !== AudioState.FADING_OUT) {
                return;
            }

            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / durationMs, 1);

            const currentVolume = startVolume + (targetVolume - startVolume) * progress;
            this._setAudioVolume(instance, currentVolume);

            if (progress < 1) {
                requestAnimationFrame(updateFade);
            } else {
                if (callback) {
                    callback();
                }
            }
        };

        requestAnimationFrame(updateFade);
    }

    /**
     * 获取上次播放时间
     */
    private _lastPlayTimes: Map<string, number> = new Map();

    private _getLastPlayTime(audioId: string): number {
        return this._lastPlayTimes.get(audioId) || 0;
    }

    /**
     * 添加到音效池
     */
    private _addToSFXPool(audioId: string, instance: AudioInstance): void {
        if (!this._sfxPool.has(audioId)) {
            this._sfxPool.set(audioId, []);
        }
        this._sfxPool.get(audioId)!.push(instance);
        this._lastPlayTimes.set(audioId, Date.now());

        // 自动清理已结束的实例
        instance.source = instance.source; // 触发播放完成检测
    }

    /**
     * 清理音效池
     */
    private _cleanupSFXPool(audioId: string, maxInstances?: number): void {
        const instances = this._sfxPool.get(audioId);
        if (!instances) {
            return;
        }

        const max = maxInstances || this.MAX_SFX_INSTANCES;

        // 清理已停止的实例
        const activeInstances = instances.filter(i => i.state !== AudioState.STOPPED);

        // 如果超过最大数量，停止最旧的
        while (activeInstances.length >= max) {
            const oldest = activeInstances.shift();
            if (oldest) {
                this._stopAudio(oldest);
                this._releaseAudioInstance(oldest);
            }
        }

        this._sfxPool.set(audioId, activeInstances);
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        return JSON.stringify({
            settings: this._settings
        });
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);
            if (parsed.settings) {
                this._settings = { ...DEFAULT_AUDIO_SETTINGS, ...parsed.settings };
            }
            console.log('[SoundManager] 数据加载完成');
        } catch (e) {
            console.error('[SoundManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this.stopAllSFX();
        this.stopBGM(0);
        this._audioCache.clear();
        this._lastPlayTimes.clear();
    }
}

// 导出单例
export const soundManager = SoundManager.getInstance();