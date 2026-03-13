/**
 * 设置面板
 * 游戏设置界面，包括音效、音乐、推送等设置
 */

import { _decorator, Node, Label, Toggle, Slider, Vec3 } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { Game } from '../../Game';
import { UIManager } from '../UIManager';
import { SoundManager } from '../../utils/SoundManager';

const { ccclass, property } = _decorator;

/**
 * 设置数据
 */
interface SettingsData {
    musicEnabled: boolean;
    musicVolume: number;
    soundEnabled: boolean;
    soundVolume: number;
    vibrationEnabled: boolean;
    notificationEnabled: boolean;
    language: string;
}

/**
 * 默认设置
 */
const DEFAULT_SETTINGS: SettingsData = {
    musicEnabled: true,
    musicVolume: 0.7,
    soundEnabled: true,
    soundVolume: 1.0,
    vibrationEnabled: true,
    notificationEnabled: true,
    language: 'zh_CN'
};

/**
 * 设置面板
 */
@ccclass('SettingsPanel')
export class SettingsPanel extends UIPanel {
    // ==================== 音效设置 ====================

    /** 音乐开关 */
    @property(Toggle)
    musicToggle: Toggle | null = null;

    /** 音乐音量滑块 */
    @property(Slider)
    musicVolumeSlider: Slider | null = null;

    /** 音效开关 */
    @property(Toggle)
    soundToggle: Toggle | null = null;

    /** 音效音量滑块 */
    @property(Slider)
    soundVolumeSlider: Slider | null = null;

    /** 震动开关 */
    @property(Toggle)
    vibrationToggle: Toggle | null = null;

    // ==================== 推送设置 ====================

    /** 推送通知开关 */
    @property(Toggle)
    notificationToggle: Toggle | null = null;

    // ==================== 账号设置 ====================

    /** 账号绑定按钮 */
    @property(Node)
    bindAccountButton: Node | null = null;

    /** 账号状态标签 */
    @property(Label)
    accountStatusLabel: Label | null = null;

    // ==================== 其他按钮 ====================

    /** 清除缓存按钮 */
    @property(Node)
    clearCacheButton: Node | null = null;

    /** 恢复默认按钮 */
    @property(Node)
    resetButton: Node | null = null;

    /** 关闭按钮 */
    @property(Node)
    closeButton: Node | null = null;

    /** 版本标签 */
    @property(Label)
    versionLabel: Label | null = null;

    // ==================== 状态 ====================

    /** UI管理器 */
    private _uiManager: UIManager = UIManager.getInstance();

    /** 音效管理器 */
    private _soundManager: SoundManager | null = null;

    /** 设置数据 */
    private _settings: SettingsData = { ...DEFAULT_SETTINGS };

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 3, // UILayer.POPUP
            cache: true,
            animationType: PanelAnimationType.SCALE,
            animationDuration: 0.25
        });

        // 尝试获取音效管理器
        try {
            this._soundManager = SoundManager.getInstance();
        } catch (e) {
            console.warn('SoundManager not initialized');
        }
    }

    /**
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);
        this._loadSettings();
        this._setupToggles();
        this._setupButtons();
        this._updateVersionLabel();
    }

    /**
     * 加载设置
     */
    private _loadSettings(): void {
        const savedSettings = localStorage.getItem('hmm_legacy_settings');
        if (savedSettings) {
            try {
                this._settings = JSON.parse(savedSettings);
            } catch (e) {
                this._settings = { ...DEFAULT_SETTINGS };
            }
        }
    }

    /**
     * 保存设置
     */
    private _saveSettings(): void {
        localStorage.setItem('hmm_legacy_settings', JSON.stringify(this._settings));
    }

    /**
     * 设置开关
     */
    private _setupToggles(): void {
        // 音乐开关
        if (this.musicToggle) {
            this.musicToggle.isChecked = this._settings.musicEnabled;
            this.musicToggle.node.on(Toggle.EventType.TOGGLE, this._onMusicToggle, this);
        }

        // 音乐音量
        if (this.musicVolumeSlider) {
            this.musicVolumeSlider.progress = this._settings.musicVolume;
            this.musicVolumeSlider.node.on(Slider.EventType.SLIDE, this._onMusicVolumeChange, this);
        }

        // 音效开关
        if (this.soundToggle) {
            this.soundToggle.isChecked = this._settings.soundEnabled;
            this.soundToggle.node.on(Toggle.EventType.TOGGLE, this._onSoundToggle, this);
        }

        // 音效音量
        if (this.soundVolumeSlider) {
            this.soundVolumeSlider.progress = this._settings.soundVolume;
            this.soundVolumeSlider.node.on(Slider.EventType.SLIDE, this._onSoundVolumeChange, this);
        }

        // 震动开关
        if (this.vibrationToggle) {
            this.vibrationToggle.isChecked = this._settings.vibrationEnabled;
            this.vibrationToggle.node.on(Toggle.EventType.TOGGLE, this._onVibrationToggle, this);
        }

        // 推送开关
        if (this.notificationToggle) {
            this.notificationToggle.isChecked = this._settings.notificationEnabled;
            this.notificationToggle.node.on(Toggle.EventType.TOGGLE, this._onNotificationToggle, this);
        }
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        // 账号绑定
        if (this.bindAccountButton) {
            const btn = this.bindAccountButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onBindAccount.bind(this));
            } else {
                this.bindAccountButton.on(Node.EventType.TOUCH_END, this._onBindAccount, this);
            }
        }

        // 清除缓存
        if (this.clearCacheButton) {
            const btn = this.clearCacheButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onClearCache.bind(this));
            } else {
                this.clearCacheButton.on(Node.EventType.TOUCH_END, this._onClearCache, this);
            }
        }

        // 恢复默认
        if (this.resetButton) {
            const btn = this.resetButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onResetSettings.bind(this));
            } else {
                this.resetButton.on(Node.EventType.TOUCH_END, this._onResetSettings, this);
            }
        }

        // 关闭按钮
        if (this.closeButton) {
            const btn = this.closeButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this.close.bind(this));
            } else {
                this.closeButton.on(Node.EventType.TOUCH_END, this.close, this);
            }
        }
    }

    /**
     * 更新版本标签
     */
    private _updateVersionLabel(): void {
        if (this.versionLabel) {
            this.versionLabel.string = '版本: 1.0.0';
        }
    }

    /**
     * 音乐开关变化
     */
    private _onMusicToggle(toggle: Toggle): void {
        this._settings.musicEnabled = toggle.isChecked;
        this._saveSettings();

        if (this._soundManager) {
            this._soundManager.setMusicEnabled(toggle.isChecked);
        }
    }

    /**
     * 音乐音量变化
     */
    private _onMusicVolumeChange(slider: Slider): void {
        this._settings.musicVolume = slider.progress;
        this._saveSettings();

        if (this._soundManager) {
            this._soundManager.setMusicVolume(slider.progress);
        }
    }

    /**
     * 音效开关变化
     */
    private _onSoundToggle(toggle: Toggle): void {
        this._settings.soundEnabled = toggle.isChecked;
        this._saveSettings();

        if (this._soundManager) {
            this._soundManager.setSoundEnabled(toggle.isChecked);
        }
    }

    /**
     * 音效音量变化
     */
    private _onSoundVolumeChange(slider: Slider): void {
        this._settings.soundVolume = slider.progress;
        this._saveSettings();

        if (this._soundManager) {
            this._soundManager.setSoundVolume(slider.progress);
        }
    }

    /**
     * 震动开关变化
     */
    private _onVibrationToggle(toggle: Toggle): void {
        this._settings.vibrationEnabled = toggle.isChecked;
        this._saveSettings();
    }

    /**
     * 推送开关变化
     */
    private _onNotificationToggle(toggle: Toggle): void {
        this._settings.notificationEnabled = toggle.isChecked;
        this._saveSettings();

        // 微信小游戏推送设置
        if (typeof wx !== 'undefined') {
            // TODO: 调用微信推送API
        }
    }

    /**
     * 绑定账号
     */
    private _onBindAccount(): void {
        this._uiManager.showConfirm(
            '绑定账号',
            '是否绑定微信账号以同步游戏数据？',
            () => {
                // 微信登录
                if (typeof wx !== 'undefined') {
                    wx.login({
                        success: (res) => {
                            console.log('微信登录成功:', res.code);
                            this._updateAccountStatus(true);
                        },
                        fail: (err) => {
                            console.error('微信登录失败:', err);
                            this._uiManager.showToast('登录失败，请重试');
                        }
                    });
                } else {
                    this._uiManager.showToast('请在微信环境中使用此功能');
                }
            }
        );
    }

    /**
     * 更新账号状态显示
     */
    private _updateAccountStatus(isBound: boolean): void {
        if (this.accountStatusLabel) {
            this.accountStatusLabel.string = isBound ? '已绑定' : '未绑定';
        }
    }

    /**
     * 清除缓存
     */
    private _onClearCache(): void {
        this._uiManager.showConfirm(
            '清除缓存',
            '确定要清除游戏缓存吗？这不会影响您的游戏进度。',
            () => {
                // 清除资源缓存
                // ResourceManager.getInstance().releaseAll();

                this._uiManager.showToast('缓存已清除');
            }
        );
    }

    /**
     * 恢复默认设置
     */
    private _onResetSettings(): void {
        this._uiManager.showConfirm(
            '恢复默认',
            '确定要恢复默认设置吗？',
            () => {
                this._settings = { ...DEFAULT_SETTINGS };
                this._saveSettings();
                this._setupToggles();
                this._uiManager.showToast('设置已恢复默认');
            }
        );
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();

        // 移除事件监听
        if (this.musicToggle) {
            this.musicToggle.node.off(Toggle.EventType.TOGGLE, this._onMusicToggle, this);
        }
        if (this.musicVolumeSlider) {
            this.musicVolumeSlider.node.off(Slider.EventType.SLIDE, this._onMusicVolumeChange, this);
        }
        if (this.soundToggle) {
            this.soundToggle.node.off(Toggle.EventType.TOGGLE, this._onSoundToggle, this);
        }
        if (this.soundVolumeSlider) {
            this.soundVolumeSlider.node.off(Slider.EventType.SLIDE, this._onSoundVolumeChange, this);
        }
        if (this.vibrationToggle) {
            this.vibrationToggle.node.off(Toggle.EventType.TOGGLE, this._onVibrationToggle, this);
        }
        if (this.notificationToggle) {
            this.notificationToggle.node.off(Toggle.EventType.TOGGLE, this._onNotificationToggle, this);
        }
    }
}