/**
 * UI预制体索引
 *
 * 本文件列出了所有UI面板组件及其对应的预制体文件路径
 * 用于在Cocos Creator中创建预制体时参考
 *
 * 使用说明:
 * 1. 在Cocos Creator中打开项目
 * 2. 在 assets/prefabs/ui/ 目录下创建对应的 .prefab 文件
 * 3. 将对应的组件脚本拖拽到预制体根节点上
 * 4. 设置预制体的属性和子节点
 */

/**
 * 预制体配置接口
 */
interface PrefabConfig {
    /** 预制体名称 */
    name: string;
    /** 预制体路径 (相对于assets目录) */
    path: string;
    /** 对应的组件脚本路径 */
    component: string;
    /** UI层级 */
    layer: 'BACKGROUND' | 'SCENE' | 'PANEL' | 'POPUP' | 'TIPS' | 'LOADING';
    /** 是否缓存 */
    cache: boolean;
    /** 是否预加载 */
    preload: boolean;
    /** 描述 */
    description: string;
}

/**
 * 所有UI预制体配置
 */
export const UI_PREFABS: PrefabConfig[] = [
    // ==================== 基础UI ====================
    {
        name: 'MainMenu',
        path: 'prefabs/ui/MainMenu',
        component: 'scripts/ui/components/MainMenuPanel',
        layer: 'SCENE',
        cache: true,
        preload: true,
        description: '主菜单界面'
    },
    {
        name: 'LoadingPanel',
        path: 'prefabs/ui/LoadingPanel',
        component: 'scripts/ui/components/UIPanel',
        layer: 'LOADING',
        cache: true,
        preload: true,
        description: '加载界面'
    },
    {
        name: 'AlertDialog',
        path: 'prefabs/ui/AlertDialog',
        component: 'scripts/ui/components/UIPanel',
        layer: 'POPUP',
        cache: true,
        preload: false,
        description: '提示对话框'
    },
    {
        name: 'Toast',
        path: 'prefabs/ui/Toast',
        component: 'scripts/ui/components/UIComponent',
        layer: 'TIPS',
        cache: true,
        preload: false,
        description: 'Toast提示'
    },
    {
        name: 'SettingsPanel',
        path: 'prefabs/ui/SettingsPanel',
        component: 'scripts/ui/components/SettingsPanel',
        layer: 'POPUP',
        cache: true,
        preload: true,
        description: '设置面板'
    },

    // ==================== 主要场景 ====================
    {
        name: 'TownPanel',
        path: 'prefabs/ui/TownPanel',
        component: 'scripts/ui/components/TownPanel',
        layer: 'SCENE',
        cache: true,
        preload: true,
        description: '主城面板'
    },
    {
        name: 'BattlePanel',
        path: 'prefabs/ui/BattlePanel',
        component: 'scripts/ui/components/BattlePanel',
        layer: 'SCENE',
        cache: true,
        preload: true,
        description: '战斗面板'
    },
    {
        name: 'FormationPanel',
        path: 'prefabs/ui/FormationPanel',
        component: 'scripts/ui/components/FormationPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '战斗准备/编队面板'
    },
    {
        name: 'BattleResultPanel',
        path: 'prefabs/ui/BattleResultPanel',
        component: 'scripts/ui/components/BattleResultPanel',
        layer: 'POPUP',
        cache: false,
        preload: false,
        description: '战斗结果面板'
    },
    {
        name: 'HeroPanel',
        path: 'prefabs/ui/HeroPanel',
        component: 'scripts/ui/components/HeroPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '英雄面板'
    },

    // ==================== 存档系统 ====================
    {
        name: 'SaveSelectPanel',
        path: 'prefabs/ui/SaveSelectPanel',
        component: 'scripts/ui/components/SaveSelectPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '存档选择面板'
    },
    {
        name: 'SavePanel',
        path: 'prefabs/ui/SavePanel',
        component: 'scripts/ui/components/SavePanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '存档管理面板'
    },
    {
        name: 'OfflineRewardPanel',
        path: 'prefabs/ui/OfflineRewardPanel',
        component: 'scripts/ui/components/OfflineRewardPanel',
        layer: 'POPUP',
        cache: false,
        preload: false,
        description: '离线奖励面板'
    },

    // ==================== 成就任务 ====================
    {
        name: 'AchievementPanel',
        path: 'prefabs/ui/AchievementPanel',
        component: 'scripts/ui/components/AchievementPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '成就面板'
    },
    {
        name: 'TaskPanel',
        path: 'prefabs/ui/TaskPanel',
        component: 'scripts/ui/components/TaskPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '任务面板'
    },

    // ==================== 关卡系统 ====================
    {
        name: 'LevelPanel',
        path: 'prefabs/ui/LevelPanel',
        component: 'scripts/ui/components/LevelPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '关卡面板'
    },

    // ==================== 社交系统 ====================
    {
        name: 'SocialPanel',
        path: 'prefabs/ui/SocialPanel',
        component: 'scripts/ui/components/SocialPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '社交面板(好友/公会/聊天)'
    },

    // ==================== 新手引导 ====================
    {
        name: 'TutorialOverlay',
        path: 'prefabs/ui/TutorialOverlay',
        component: 'scripts/ui/components/TutorialOverlay',
        layer: 'TIPS',
        cache: true,
        preload: false,
        description: '教程遮罩层'
    },

    // ==================== 签到系统 ====================
    {
        name: 'SigninPanel',
        path: 'prefabs/ui/SigninPanel',
        component: 'scripts/ui/components/SigninPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '每日签到面板'
    },

    // ==================== 商店系统 ====================
    {
        name: 'ShopPanel',
        path: 'prefabs/ui/ShopPanel',
        component: 'scripts/ui/components/ShopPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '商店面板'
    },

    // ==================== 背包系统 ====================
    {
        name: 'InventoryPanel',
        path: 'prefabs/ui/InventoryPanel',
        component: 'scripts/ui/components/InventoryPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '背包面板'
    },

    // ==================== 排行榜系统 ====================
    {
        name: 'RankPanel',
        path: 'prefabs/ui/RankPanel',
        component: 'scripts/ui/components/RankPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '排行榜面板'
    },

    // ==================== 竞技场系统 ====================
    {
        name: 'ArenaPanel',
        path: 'prefabs/ui/ArenaPanel',
        component: 'scripts/ui/components/ArenaPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '竞技场面板'
    },

    // ==================== 招募系统 ====================
    {
        name: 'GachaPanel',
        path: 'prefabs/ui/GachaPanel',
        component: 'scripts/ui/components/GachaPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '招募/抽卡面板'
    },

    // ==================== 图鉴系统 ====================
    {
        name: 'CollectionPanel',
        path: 'prefabs/ui/CollectionPanel',
        component: 'scripts/ui/components/CollectionPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '图鉴面板'
    },

    // ==================== 邮件系统 ====================
    {
        name: 'MailPanel',
        path: 'prefabs/ui/MailPanel',
        component: 'scripts/ui/components/MailPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '邮件面板'
    },

    // ==================== 活动系统 ====================
    {
        name: 'ActivityPanel',
        path: 'prefabs/ui/ActivityPanel',
        component: 'scripts/ui/components/ActivityPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '活动面板'
    },

    // ==================== VIP系统 ====================
    {
        name: 'VIPPanel',
        path: 'prefabs/ui/VIPPanel',
        component: 'scripts/ui/components/VIPPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: 'VIP面板'
    },

    // ==================== 加速系统 ====================
    {
        name: 'SpeedUpPanel',
        path: 'prefabs/ui/SpeedUpPanel',
        component: 'scripts/ui/components/SpeedUpPanel',
        layer: 'POPUP',
        cache: true,
        preload: false,
        description: '加速面板'
    },

    // ==================== 技能树系统 ====================
    {
        name: 'SkillTreePanel',
        path: 'prefabs/ui/SkillTreePanel',
        component: 'scripts/ui/components/SkillTreePanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '技能树面板'
    },

    // ==================== 公告系统 ====================
    {
        name: 'AnnouncementPanel',
        path: 'prefabs/ui/AnnouncementPanel',
        component: 'scripts/ui/components/AnnouncementPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '公告面板'
    },

    // ==================== 远征系统 ====================
    {
        name: 'ExpeditionPanel',
        path: 'prefabs/ui/ExpeditionPanel',
        component: 'scripts/ui/components/ExpeditionPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '远征面板'
    },

    // ==================== 在线奖励系统 ====================
    {
        name: 'OnlineRewardPanel',
        path: 'prefabs/ui/OnlineRewardPanel',
        component: 'scripts/ui/components/OnlineRewardPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '在线奖励面板'
    },

    // ==================== 宝物系统 ====================
    {
        name: 'ArtifactPanel',
        path: 'prefabs/ui/ArtifactPanel',
        component: 'scripts/ui/components/ArtifactPanel',
        layer: 'PANEL',
        cache: true,
        preload: false,
        description: '宝物/神器面板'
    }
];

/**
 * 获取所有预制体名称
 */
export function getPrefabNames(): string[] {
    return UI_PREFABS.map(p => p.name);
}

/**
 * 获取所有预制体路径
 */
export function getPrefabPaths(): string[] {
    return UI_PREFABS.map(p => p.path);
}

/**
 * 根据名称获取预制体配置
 */
export function getPrefabConfig(name: string): PrefabConfig | undefined {
    return UI_PREFABS.find(p => p.name === name);
}

/**
 * 获取需要预加载的预制体
 */
export function getPreloadPrefabs(): PrefabConfig[] {
    return UI_PREFABS.filter(p => p.preload);
}

/**
 * 打印预制体创建指南
 */
export function printPrefabGuide(): void {
    console.log('=== UI预制体创建指南 ===\n');

    console.log('已创建的预制体 (在 assets/prefabs/ui/ 目录):');
    console.log('- MainMenu.prefab');
    console.log('- LoadingPanel.prefab');
    console.log('- AlertDialog.prefab');
    console.log('- SettingsPanel.prefab');
    console.log('- TownPanel.prefab');
    console.log('- BattlePanel.prefab');
    console.log('- HeroPanel.prefab\n');

    console.log('需要创建的预制体:');
    const existingPrefabs = [
        'MainMenu', 'LoadingPanel', 'AlertDialog', 'SettingsPanel',
        'TownPanel', 'BattlePanel', 'HeroPanel'
    ];

    UI_PREFABS.forEach(prefab => {
        if (!existingPrefabs.includes(prefab.name)) {
            console.log(`- ${prefab.name}.prefab`);
            console.log(`  组件: ${prefab.component}`);
            console.log(`  层级: ${prefab.layer}`);
            console.log(`  描述: ${prefab.description}\n`);
        }
    });

    console.log('=== 创建步骤 ===');
    console.log('1. 在Cocos Creator中，右键点击 assets/prefabs/ui/ 目录');
    console.log('2. 选择 "创建" -> "Node" 创建空节点');
    console.log('3. 将节点重命名为预制体名称 (如 "SaveSelectPanel")');
    console.log('4. 将对应的组件脚本拖拽到节点上');
    console.log('5. 设置组件属性和添加子节点');
    console.log('6. 将节点拖拽到 assets/prefabs/ui/ 目录下生成预制体');
}