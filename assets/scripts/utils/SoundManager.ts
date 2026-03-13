/**
 * 音效管理器
 * 管理游戏背景音乐和音效
 */

/**
 * 音效配置
 */
interface SoundConfig {
    id: string;
    path: string;
    volume: number;
    loop: boolean;
}

/**
 * 音效管理器
 */
export class SoundManager {
    private static instance: SoundManager | null = null;

    private sounds: Map<string, SoundConfig> = new Map();
    private audioElements: Map<string, HTMLAudioElement> = new Map();
    private bgmPlayer: HTMLAudioElement | null = null;
    private currentBgm: string = '';

    private musicVolume: number = 0.5;
    private sfxVolume: number = 0.8;
    private musicMuted: boolean = false;
    private sfxMuted: boolean = false;

    private constructor() {
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
        if (this.musicMuted) return;

        const config = this.sounds.get(soundId);
        if (!config) {
            console.error(`Sound not found: ${soundId}`);
            return;
        }

        // 停止当前BGM
        this.stopBGM();

        try {
            // 创建音频元素
            const audio = new Audio(config.path);
            audio.volume = config.volume * this.musicVolume;
            audio.loop = config.loop;

            this.bgmPlayer = audio;
            this.currentBgm = soundId;

            await audio.play();
        } catch (e) {
            console.error(`Failed to play BGM: ${soundId}`, e);
        }
    }

    /**
     * 停止背景音乐
     */
    stopBGM(): void {
        if (this.bgmPlayer) {
            this.bgmPlayer.pause();
            this.bgmPlayer.currentTime = 0;
            this.bgmPlayer = null;
            this.currentBgm = '';
        }
    }

    /**
     * 暂停背景音乐
     */
    pauseBGM(): void {
        if (this.bgmPlayer) {
            this.bgmPlayer.pause();
        }
    }

    /**
     * 恢复背景音乐
     */
    resumeBGM(): void {
        if (this.bgmPlayer && !this.musicMuted) {
            this.bgmPlayer.play();
        }
    }

    /**
     * 播放音效
     */
    async playSFX(soundId: string, volume?: number): Promise<void> {
        if (this.sfxMuted) return;

        const config = this.sounds.get(soundId);
        if (!config) {
            console.error(`Sound not found: ${soundId}`);
            return;
        }

        try {
            // 检查是否有缓存的音频元素
            let audio = this.audioElements.get(soundId);

            if (!audio) {
                audio = new Audio(config.path);
                if (config.loop) {
                    this.audioElements.set(soundId, audio);
                }
            } else {
                audio.currentTime = 0;
            }

            audio.volume = (volume ?? config.volume) * this.sfxVolume;
            await audio.play();

            // 非循环音效播放后移除
            if (!config.loop) {
                audio.onended = () => {
                    this.audioElements.delete(soundId);
                };
            }
        } catch (e) {
            console.error(`Failed to play SFX: ${soundId}`, e);
        }
    }

    /**
     * 停止音效
     */
    stopSFX(soundId: string): void {
        const audio = this.audioElements.get(soundId);
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
            this.audioElements.delete(soundId);
        }
    }

    /**
     * 设置音乐音量
     */
    setMusicVolume(volume: number): void {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        if (this.bgmPlayer) {
            this.bgmPlayer.volume = this.musicVolume * 0.5;
        }
    }

    /**
     * 设置音效音量
     */
    setSFXVolume(volume: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * 静音音乐
     */
    muteMusic(): void {
        this.musicMuted = true;
        this.pauseBGM();
    }

    /**
     * 取消静音音乐
     */
    unmuteMusic(): void {
        this.musicMuted = false;
        this.resumeBGM();
    }

    /**
     * 静音音效
     */
    muteSFX(): void {
        this.sfxMuted = true;
    }

    /**
     * 取消静音音效
     */
    unmuteSFX(): void {
        this.sfxMuted = false;
    }

    /**
     * 切换音乐静音状态
     */
    toggleMusicMute(): boolean {
        if (this.musicMuted) {
            this.unmuteMusic();
        } else {
            this.muteMusic();
        }
        return this.musicMuted;
    }

    /**
     * 切换音效静音状态
     */
    toggleSFXMute(): boolean {
        if (this.sfxMuted) {
            this.unmuteSFX();
        } else {
            this.muteSFX();
        }
        return this.sfxMuted;
    }

    /**
     * 获取音乐音量
     */
    getMusicVolume(): number {
        return this.musicVolume;
    }

    /**
     * 获取音效音量
     */
    getSFXVolume(): number {
        return this.sfxVolume;
    }

    /**
     * 音乐是否静音
     */
    isMusicMuted(): boolean {
        return this.musicMuted;
    }

    /**
     * 音效是否静音
     */
    isSFXMuted(): boolean {
        return this.sfxMuted;
    }

    /**
     * 保存音量设置
     */
    saveSettings(): void {
        const settings = {
            musicVolume: this.musicVolume,
            sfxVolume: this.sfxVolume,
            musicMuted: this.musicMuted,
            sfxMuted: this.sfxMuted
        };
        localStorage.setItem('hmm_sound_settings', JSON.stringify(settings));
    }

    /**
     * 加载音量设置
     */
    loadSettings(): void {
        const saved = localStorage.getItem('hmm_sound_settings');
        if (saved) {
            try {
                const settings = JSON.parse(saved);
                this.musicVolume = settings.musicVolume ?? 0.5;
                this.sfxVolume = settings.sfxVolume ?? 0.8;
                this.musicMuted = settings.musicMuted ?? false;
                this.sfxMuted = settings.sfxMuted ?? false;
            } catch (e) {
                console.error('Failed to load sound settings', e);
            }
        }
    }

    /**
     * 停止所有音效
     */
    stopAll(): void {
        this.stopBGM();
        this.audioElements.forEach((audio, id) => {
            audio.pause();
            audio.currentTime = 0;
        });
        this.audioElements.clear();
    }
}

// 导出音效管理器实例
export const soundManager = SoundManager.getInstance();