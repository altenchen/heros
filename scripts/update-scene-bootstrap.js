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
const SCENES_DIR = path.join(PROJECT_ROOT, 'assets/scenes');

/**
 * 获取脚本的UUID
 */
function getScriptUUID(scriptPath) {
    // 如果路径没有 .ts 扩展名，添加它
    if (!scriptPath.endsWith('.ts')) {
        scriptPath = scriptPath + '.ts';
    }
    const metaPath = scriptPath + '.meta';
    if (!fs.existsSync(metaPath)) {
        console.error(`脚本meta文件不存在: ${metaPath}`);
        return null;
    }

    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    return meta.uuid;
}

/**
 * 更新场景中的Game组件为GameBootstrap
 */
function updateSceneGameComponent() {
    const scenePath = path.join(SCENES_DIR, 'MainMenu.scene');
    
    if (!fs.existsSync(scenePath)) {
        console.error('MainMenu.scene 不存在');
        return false;
    }
    
    // 获取 GameBootstrap 的 UUID
    const bootstrapUUID = getScriptUUID(path.join(PROJECT_ROOT, 'assets/scripts/GameBootstrap.ts'));
    if (!bootstrapUUID) {
        console.error('无法获取 GameBootstrap UUID');
        return false;
    }
    
    console.log(`GameBootstrap UUID: ${bootstrapUUID}`);
    
    const sceneContent = fs.readFileSync(scenePath, 'utf-8');
    const sceneData = JSON.parse(sceneContent);
    
    // 查找 Game 节点并更新组件
    let gameNodeIndex = -1;
    let gameComponentIndex = -1;
    
    for (let i = 0; i < sceneData.length; i++) {
        const item = sceneData[i];
        if (typeof item === 'object' && item.__type__ === 'cc.Node' && item._name === 'Game') {
            gameNodeIndex = i;
            // 更新节点名称
            item._name = 'GameBootstrap';
        }
        // 查找旧的 Game 组件 (通过已知的 UUID 或节点引用)
        if (typeof item === 'object' && item.node && item.node.__id__ === gameNodeIndex) {
            gameComponentIndex = i;
            // 更新组件类型
            item.__type__ = bootstrapUUID;
            // 移除 canvas 属性（GameBootstrap 不需要）
            delete item.canvas;
        }
    }
    
    if (gameNodeIndex === -1) {
        console.log('未找到 Game 节点，创建新的 GameBootstrap 节点');
        // 创建新节点
        createGameBootstrapNode(sceneData, bootstrapUUID);
    } else {
        console.log(`已更新 Game 节点为 GameBootstrap (节点索引: ${gameNodeIndex})`);
    }
    
    // 写回文件
    fs.writeFileSync(scenePath, JSON.stringify(sceneData, null, 2), 'utf-8');
    console.log('✅ 场景更新成功');
    
    return true;
}

/**
 * 创建 GameBootstrap 节点
 */
function createGameBootstrapNode(sceneData, bootstrapUUID) {
    // 找到场景根节点
    const sceneIndex = 1;
    const scene = sceneData[sceneIndex];
    
    // 创建节点
    const nodeIndex = sceneData.length;
    const componentIndex = nodeIndex + 1;
    
    const bootstrapNode = {
        "__type__": "cc.Node",
        "_name": "GameBootstrap",
        "_objFlags": 0,
        "_parent": { "__id__": sceneIndex },
        "_children": [],
        "_active": true,
        "_components": [{ "__id__": componentIndex }],
        "_prefab": null,
        "_lpos": { "__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0 },
        "_lrot": { "__type__": "cc.Quat", "x": 0, "y": 0, "z": 0, "w": 1 },
        "_lscale": { "__type__": "cc.Vec3", "x": 1, "y": 1, "z": 1 },
        "_layer": 1073741824,
        "_euler": { "__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0 },
        "_id": ""
    };
    
    const bootstrapComponent = {
        "__type__": bootstrapUUID,
        "_name": "",
        "_objFlags": 0,
        "node": { "__id__": nodeIndex },
        "_enabled": true,
        "__prefab": null,
        "_id": ""
    };
    
    // 添加到场景数据
    sceneData.push(bootstrapNode);
    sceneData.push(bootstrapComponent);
    
    // 添加到场景子节点
    if (!scene._children) scene._children = [];
    scene._children.push({ "__id__": nodeIndex });
}

console.log('========================================');
console.log('场景组件更新工具');
console.log('========================================\n');

updateSceneGameComponent();

console.log('\n处理完成');