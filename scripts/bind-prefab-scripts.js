/**
 * 预制体脚本绑定工具
 * 自动将脚本组件绑定到预制体的根节点
 */

const fs = require('fs');
const path = require('path');

// 项目根目录
const PROJECT_ROOT = path.join(__dirname, '..');
const PREFABS_DIR = path.join(PROJECT_ROOT, 'assets/prefabs/ui');
const SCRIPTS_DIR = path.join(PROJECT_ROOT, 'assets/scripts/ui/components');

// 预制体到脚本的映射
const PREFAB_SCRIPT_MAP = {
    'MainMenu': 'MainMenuPanel',
    'LoadingPanel': 'LoadingPanel',
    'AlertDialog': 'AlertDialog',
    'SettingsPanel': 'SettingsPanel',
    'TownPanel': 'TownPanel',
    'BattlePanel': 'BattlePanel',
    'HeroPanel': 'HeroPanel',
    'Toast': 'Toast',
    'FormationPanel': 'FormationPanel',
    'BattleResultPanel': 'BattleResultPanel',
    'SaveSelectPanel': 'SaveSelectPanel',
    'SavePanel': 'SavePanel',
    'OfflineRewardPanel': 'OfflineRewardPanel',
    'AchievementPanel': 'AchievementPanel',
    'TaskPanel': 'TaskPanel',
    'TutorialOverlay': 'TutorialOverlay',
    'LevelPanel': 'LevelPanel',
    'SocialPanel': 'SocialPanel',
    'SigninPanel': 'SigninPanel',
    'ShopPanel': 'ShopPanel',
    'SpeedUpPanel': 'SpeedUpPanel',
    'SkillTreePanel': 'SkillTreePanel',
    'InventoryPanel': 'InventoryPanel',
    'RankPanel': 'RankPanel',
    'ArenaPanel': 'ArenaPanel',
    'GachaPanel': 'GachaPanel',
    'AnnouncementPanel': 'AnnouncementPanel',
    'ArtifactPanel': 'ArtifactPanel',
    'ExpeditionPanel': 'ExpeditionPanel',
    'MagicBookPanel': 'MagicBookPanel',
    'CollectionPanel': 'CollectionPanel',
    'MailPanel': 'MailPanel',
    'ActivityPanel': 'ActivityPanel',
    'VIPPanel': 'VIPPanel',
    'MarketPanel': 'MarketPanel',
    'OnlineRewardPanel': 'OnlineRewardPanel',
    'RandomEventPanel': 'RandomEventPanel',
    'WarMachinePanel': 'WarMachinePanel'
};

/**
 * 获取脚本的UUID
 */
function getScriptUUID(scriptName) {
    const metaPath = path.join(SCRIPTS_DIR, `${scriptName}.ts.meta`);
    if (!fs.existsSync(metaPath)) {
        console.error(`脚本meta文件不存在: ${metaPath}`);
        return null;
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    return meta.uuid;
}

/**
 * 检查预制体是否已绑定脚本
 */
function hasScriptComponent(prefabData, scriptUUID) {
    for (const item of prefabData) {
        if (typeof item === 'object' && item.__type__ === scriptUUID) {
            return true;
        }
    }
    return false;
}

/**
 * 为预制体添加脚本组件
 */
function addScriptToPrefab(prefabData, scriptUUID) {
    // 找到根节点（通常是第二个元素，第一个是Prefab定义）
    let rootNodeIndex = -1;
    for (let i = 0; i < prefabData.length; i++) {
        const item = prefabData[i];
        if (typeof item === 'object' && item.__type__ === 'cc.Node') {
            // 检查是否是根节点（没有parent引用或parent指向scene）
            if (!item._parent || (item._parent && item._parent.__id__ === 1)) {
                rootNodeIndex = i;
                break;
            }
        }
    }

    // 如果没找到，尝试找第一个有_components的Node
    if (rootNodeIndex === -1) {
        for (let i = 0; i < prefabData.length; i++) {
            const item = prefabData[i];
            if (typeof item === 'object' && item.__type__ === 'cc.Node' && item._components) {
                rootNodeIndex = i;
                break;
            }
        }
    }

    if (rootNodeIndex === -1) {
        console.error('无法找到根节点');
        return false;
    }

    const rootNode = prefabData[rootNodeIndex];

    // 确保有_components数组
    if (!rootNode._components) {
        rootNode._components = [];
    }

    // 检查是否已经有该组件
    for (const compRef of rootNode._components) {
        const comp = prefabData[compRef.__id__];
        if (comp && comp.__type__ === scriptUUID) {
            console.log('  组件已存在，跳过');
            return true;
        }
    }

    // 创建新的组件对象
    const newComponent = {
        "__type__": scriptUUID,
        "_name": "",
        "_objFlags": 0,
        "node": { "__id__": rootNodeIndex },
        "_enabled": true,
        "__prefab": null
    };

    // 为组件添加常用属性（根据脚本类型）
    addComponentProperties(newComponent, scriptUUID);

    // 将组件添加到预制体数据中
    const newComponentIndex = prefabData.length;
    prefabData.push(newComponent);

    // 更新根节点的_components引用
    rootNode._components.push({ "__id__": newComponentIndex });

    return true;
}

/**
 * 为组件添加属性
 */
function addComponentProperties(component, scriptUUID) {
    // 基础UIPanel属性
    const baseProperties = {
        '_id': ''
    };

    // 合并属性
    Object.assign(component, baseProperties);
}

/**
 * 处理单个预制体
 */
function processPrefab(prefabName, scriptName) {
    const prefabPath = path.join(PREFABS_DIR, `${prefabName}.prefab`);

    if (!fs.existsSync(prefabPath)) {
        console.log(`预制体不存在: ${prefabName}`);
        return false;
    }

    const scriptUUID = getScriptUUID(scriptName);
    if (!scriptUUID) {
        console.log(`脚本UUID获取失败: ${scriptName}`);
        return false;
    }

    console.log(`处理 ${prefabName} -> ${scriptName} (${scriptUUID})`);

    // 读取预制体
    const prefabContent = fs.readFileSync(prefabPath, 'utf-8');
    const prefabData = JSON.parse(prefabContent);

    // 检查是否已有组件
    if (hasScriptComponent(prefabData, scriptUUID)) {
        console.log('  组件已存在，跳过');
        return true;
    }

    // 添加脚本组件
    if (addScriptToPrefab(prefabData, scriptUUID)) {
        // 写回文件
        fs.writeFileSync(prefabPath, JSON.stringify(prefabData, null, 2), 'utf-8');
        console.log('  ✅ 绑定成功');
        return true;
    }

    return false;
}

/**
 * 主函数
 */
function main() {
    console.log('========================================');
    console.log('预制体脚本绑定工具');
    console.log('========================================\n');

    let successCount = 0;
    let failCount = 0;

    for (const [prefabName, scriptName] of Object.entries(PREFAB_SCRIPT_MAP)) {
        if (processPrefab(prefabName, scriptName)) {
            successCount++;
        } else {
            failCount++;
        }
    }

    console.log('\n========================================');
    console.log(`处理完成: 成功 ${successCount}, 失败 ${failCount}`);
    console.log('========================================');
}

main();