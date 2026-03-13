/**
 * 关卡选择面板
 * 显示章节和关卡列表
 * 遵循阿里巴巴开发者手册规范
 */

import { _decorator, Node, Label, Sprite, SpriteFrame, Prefab, instantiate, ScrollView, Vec3, ProgressBar, Color, Button } from 'cc';
import { UIPanel, PanelAnimationType } from './UIPanel';
import { UIButton } from './UIButton';
import { levelManager, LevelEventType } from '../../level/LevelManager';
import { LevelConfig, ChapterConfig, LevelStatus, StarRating, LevelDifficulty } from '../../config/LevelTypes';
import { ChapterConfigMap, LevelConfigMap } from '../../config/levels.json';
import { EventCenter } from '../../utils/EventTarget';
import { Game } from '../../Game';

const { ccclass, property } = _decorator;

/** 难度颜色 */
const DIFFICULTY_COLORS: Record<LevelDifficulty, Color> = {
    [LevelDifficulty.EASY]: new Color(100, 255, 100),
    [LevelDifficulty.NORMAL]: new Color(255, 255, 100),
    [LevelDifficulty.HARD]: new Color(255, 150, 50),
    [LevelDifficulty.NIGHTMARE]: new Color(255, 50, 50),
    [LevelDifficulty.HELL]: new Color(200, 0, 200)
};

/** 状态颜色 */
const STATUS_COLORS: Record<LevelStatus, Color> = {
    [LevelStatus.LOCKED]: new Color(100, 100, 100),
    [LevelStatus.AVAILABLE]: new Color(100, 200, 255),
    [LevelStatus.CLEARED]: new Color(100, 255, 100),
    [LevelStatus.PERFECT]: new Color(255, 215, 0)
};

/**
 * 关卡选择面板
 */
@ccclass('LevelPanel')
export class LevelPanel extends UIPanel {
    // ==================== 章节区域 ====================

    /** 章节列表容器 */
    @property(Node)
    chapterContainer: Node | null = null;

    /** 章节按钮预制体 */
    @property(Prefab)
    chapterButtonPrefab: Prefab | null = null;

    // ==================== 关卡区域 ====================

    /** 关卡列表滚动视图 */
    @property(ScrollView)
    levelScrollView: ScrollView | null = null;

    /** 关卡列表内容 */
    @property(Node)
    levelContent: Node | null = null;

    /** 关卡项预制体 */
    @property(Prefab)
    levelItemPrefab: Prefab | null = null;

    // ==================== 信息区域 ====================

    /** 当前章节名称 */
    @property(Label)
    chapterNameLabel: Label | null = null;

    /** 章节进度 */
    @property(Label)
    chapterProgressLabel: Label | null = null;

    /** 体力显示 */
    @property(Label)
    staminaLabel: Label | null = null;

    /** 总星数显示 */
    @property(Label)
    totalStarsLabel: Label | null = null;

    // ==================== 底部按钮 ====================

    /** 开始战斗按钮 */
    @property(Node)
    startBattleButton: Node | null = null;

    /** 关闭按钮 */
    @property(Node)
    closeButton: Node | null = null;

    // ==================== 状态 ====================

    /** 当前选中的章节ID */
    private _currentChapterId: string = 'chapter_1';

    /** 当前选中的关卡ID */
    private _selectedLevelId: string | null = null;

    /** 章节按钮节点列表 */
    private _chapterNodes: Node[] = [];

    /** 关卡项节点列表 */
    private _levelNodes: Node[] = [];

    /**
     * 初始化
     */
    protected init(): void {
        super.init();

        this.setPanelConfig({
            layer: 2,
            cache: true,
            animationType: PanelAnimationType.SLIDE_RIGHT,
            animationDuration: 0.3
        });
    }

    /**
     * 显示回调
     */
    protected onShow(data?: any): void {
        super.onShow(data);

        this._updateChapterList();
        this._selectChapter(this._currentChapterId);
        this._updateStamina();
        this._updateTotalStars();
        this._setupButtons();
        this._bindEvents();
    }

    /**
     * 更新章节列表
     */
    private _updateChapterList(): void {
        if (!this.chapterContainer) {
            return;
        }

        // 清空现有项
        this._chapterNodes.forEach(node => node.destroy());
        this._chapterNodes = [];

        const chapters = levelManager.getChapters();

        chapters.forEach((chapter, index) => {
            const progress = levelManager.getChapterProgress(chapter.id);
            if (!progress || !progress.unlocked) {
                return;
            }

            const node = this._createChapterButton(chapter, index);
            this._chapterNodes.push(node);
        });
    }

    /**
     * 创建章节按钮
     */
    private _createChapterButton(chapter: ChapterConfig, index: number): Node {
        const node = this.chapterButtonPrefab
            ? instantiate(this.chapterButtonPrefab)
            : new Node(`Chapter_${chapter.id}`);

        node.setPosition(new Vec3(index * 120, 0, 0));
        this.chapterContainer!.addChild(node);

        // 设置名称
        const nameLabel = node.getChildByName('Name')?.getComponent(Label);
        if (nameLabel) {
            nameLabel.string = chapter.name;
        }

        // 设置进度
        const progress = levelManager.getChapterProgress(chapter.id);
        const progressLabel = node.getChildByName('Progress')?.getComponent(Label);
        if (progressLabel && progress) {
            const cleared = Array.from(progress.levelProgress.values())
                .filter(lp => lp.status !== LevelStatus.LOCKED).length;
            progressLabel.string = `${cleared}/${chapter.levels.length}`;
        }

        // 点击事件
        node.off(Node.EventType.TOUCH_END);
        node.on(Node.EventType.TOUCH_END, () => {
            this._selectChapter(chapter.id);
        });

        return node;
    }

    /**
     * 选择章节
     */
    private _selectChapter(chapterId: string): void {
        this._currentChapterId = chapterId;

        const chapter = ChapterConfigMap.get(chapterId);
        if (!chapter) {
            return;
        }

        // 更新章节信息
        if (this.chapterNameLabel) {
            this.chapterNameLabel.string = chapter.name;
        }

        // 更新章节进度
        const progress = levelManager.getChapterProgress(chapterId);
        if (this.chapterProgressLabel && progress) {
            const cleared = Array.from(progress.levelProgress.values())
                .filter(lp => lp.status !== LevelStatus.LOCKED).length;
            this.chapterProgressLabel.string = `进度: ${cleared}/${chapter.levels.length}`;
        }

        // 更新关卡列表
        this._updateLevelList(chapterId);

        // 更新章节按钮高亮
        this._highlightChapter(chapterId);
    }

    /**
     * 高亮选中章节
     */
    private _highlightChapter(chapterId: string): void {
        this._chapterNodes.forEach(node => {
            const label = node.getComponentInChildren(Label);
            if (label) {
                // 根据是否选中设置颜色
            }
        });
    }

    /**
     * 更新关卡列表
     */
    private _updateLevelList(chapterId: string): void {
        if (!this.levelContent) {
            return;
        }

        // 清空现有项
        this._levelNodes.forEach(node => node.destroy());
        this._levelNodes = [];

        const levels = levelManager.getChapterLevels(chapterId);

        levels.forEach((config, index) => {
            const node = this._createLevelItem(config, index);
            this._levelNodes.push(node);
        });
    }

    /**
     * 创建关卡项
     */
    private _createLevelItem(config: LevelConfig, index: number): Node {
        const node = this.levelItemPrefab
            ? instantiate(this.levelItemPrefab)
            : new Node(`Level_${config.id}`);

        node.setPosition(new Vec3(0, -index * 100, 0));
        this.levelContent!.addChild(node);

        const progress = levelManager.getLevelProgress(config.id);

        // 设置名称
        const nameLabel = node.getChildByName('Name')?.getComponent(Label);
        if (nameLabel) {
            nameLabel.string = config.name;
            nameLabel.color = STATUS_COLORS[progress?.status || LevelStatus.LOCKED];
        }

        // 设置难度
        const diffLabel = node.getChildByName('Difficulty')?.getComponent(Label);
        if (diffLabel) {
            diffLabel.string = this._getDifficultyText(config.difficulty);
            diffLabel.color = DIFFICULTY_COLORS[config.difficulty];
        }

        // 设置星级
        const starsNode = node.getChildByName('Stars');
        if (starsNode && progress) {
            this._updateStarsDisplay(starsNode, progress.stars);
        }

        // 设置状态
        const statusNode = node.getChildByName('Status');
        if (statusNode && progress) {
            this._updateStatusDisplay(statusNode, progress.status);
        }

        // 设置体力消耗
        const staminaLabel = node.getChildByName('Stamina')?.getComponent(Label);
        if (staminaLabel) {
            staminaLabel.string = `${config.staminaCost}体`;
        }

        // 设置解锁状态
        const lockNode = node.getChildByName('Lock');
        if (lockNode) {
            lockNode.active = progress?.status === LevelStatus.LOCKED;
        }

        // 点击事件
        node.off(Node.EventType.TOUCH_END);
        node.on(Node.EventType.TOUCH_END, () => {
            if (progress?.status !== LevelStatus.LOCKED) {
                this._selectLevel(config.id);
            }
        });

        return node;
    }

    /**
     * 更新星级显示
     */
    private _updateStarsDisplay(starsNode: Node, stars: StarRating): void {
        for (let i = 1; i <= 3; i++) {
            const starNode = starsNode.getChildByName(`Star${i}`);
            if (starNode) {
                const sprite = starNode.getComponent(Sprite);
                if (sprite) {
                    // 设置亮/暗状态
                    sprite.color = i <= stars ? new Color(255, 215, 0) : new Color(100, 100, 100);
                }
            }
        }
    }

    /**
     * 更新状态显示
     */
    private _updateStatusDisplay(statusNode: Node, status: LevelStatus): void {
        const label = statusNode.getComponent(Label);
        if (!label) {
            return;
        }

        switch (status) {
            case LevelStatus.LOCKED:
                label.string = '未解锁';
                label.color = STATUS_COLORS[status];
                break;
            case LevelStatus.AVAILABLE:
                label.string = '可挑战';
                label.color = STATUS_COLORS[status];
                break;
            case LevelStatus.CLEARED:
                label.string = '已通关';
                label.color = STATUS_COLORS[status];
                break;
            case LevelStatus.PERFECT:
                label.string = '完美通关';
                label.color = STATUS_COLORS[status];
                break;
        }
    }

    /**
     * 选择关卡
     */
    private _selectLevel(levelId: string): void {
        this._selectedLevelId = levelId;

        const config = LevelConfigMap.get(levelId);
        if (!config) {
            return;
        }

        // 高亮选中的关卡
        this._levelNodes.forEach(node => {
            // 重置所有关卡项的高亮状态
        });

        // 更新战斗按钮状态
        if (this.startBattleButton) {
            const canChallenge = levelManager.canChallenge(levelId);
            const button = this.startBattleButton.getComponent(UIButton);
            if (button) {
                button.setEnabled(canChallenge);
                button.setLabel(canChallenge ? '开始战斗' : '体力不足');
            }
        }
    }

    /**
     * 更新体力显示
     */
    private _updateStamina(): void {
        if (this.staminaLabel) {
            const stamina = levelManager.getStamina();
            this.staminaLabel.string = `体力: ${stamina.current}/${stamina.max}`;
        }
    }

    /**
     * 更新总星数
     */
    private _updateTotalStars(): void {
        if (this.totalStarsLabel) {
            const progress = levelManager.getTotalProgress();
            this.totalStarsLabel.string = `总星数: ${progress.stars}/${progress.total * 3}`;
        }
    }

    /**
     * 获取难度文本
     */
    private _getDifficultyText(difficulty: LevelDifficulty): string {
        const texts: Record<LevelDifficulty, string> = {
            [LevelDifficulty.EASY]: '简单',
            [LevelDifficulty.NORMAL]: '普通',
            [LevelDifficulty.HARD]: '困难',
            [LevelDifficulty.NIGHTMARE]: '噩梦',
            [LevelDifficulty.HELL]: '地狱'
        };
        return texts[difficulty];
    }

    /**
     * 设置按钮
     */
    private _setupButtons(): void {
        // 开始战斗按钮
        if (this.startBattleButton) {
            const btn = this.startBattleButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(this._onStartBattle.bind(this));
            } else {
                this.startBattleButton.on(Node.EventType.TOUCH_END, this._onStartBattle, this);
            }
        }

        // 关闭按钮
        if (this.closeButton) {
            const btn = this.closeButton.getComponent(UIButton);
            if (btn) {
                btn.setOnClick(() => this.hide());
            } else {
                this.closeButton.on(Node.EventType.TOUCH_END, () => this.hide(), this);
            }
        }
    }

    /**
     * 绑定事件
     */
    private _bindEvents(): void {
        EventCenter.on(LevelEventType.LEVEL_CLEARED, this._onLevelCleared, this);
        EventCenter.on(LevelEventType.LEVEL_UNLOCKED, this._onLevelUnlocked, this);
    }

    /**
     * 解绑事件
     */
    private _unbindEvents(): void {
        EventCenter.off(LevelEventType.LEVEL_CLEARED, this._onLevelCleared, this);
        EventCenter.off(LevelEventType.LEVEL_UNLOCKED, this._onLevelUnlocked, this);
    }

    /**
     * 关卡通关回调
     */
    private _onLevelCleared(data: { levelId: string }): void {
        this._updateLevelList(this._currentChapterId);
        this._updateTotalStars();
        this._updateStamina();
    }

    /**
     * 关卡解锁回调
     */
    private _onLevelUnlocked(data: { levelId: string }): void {
        this._updateLevelList(this._currentChapterId);
    }

    /**
     * 开始战斗
     */
    private _onStartBattle(): void {
        if (!this._selectedLevelId) {
            console.warn('[LevelPanel] 未选择关卡');
            return;
        }

        if (!levelManager.canChallenge(this._selectedLevelId)) {
            console.warn('[LevelPanel] 无法挑战该关卡');
            return;
        }

        // 开始挑战
        if (levelManager.startChallenge(this._selectedLevelId)) {
            // 隐藏面板
            this.hide();

            // 触发战斗
            const config = LevelConfigMap.get(this._selectedLevelId);
            if (config) {
                // TODO: 跳转到战斗场景
                console.log('[LevelPanel] 开始战斗:', config.name);

                // 调用游戏实例开始战斗
                const game = Game.getInstance();
                // game.startLevelBattle(config);
            }
        }
    }

    /**
     * 隐藏回调
     */
    protected onHide(): void {
        super.onHide();
        this._unbindEvents();
    }
}