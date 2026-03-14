/**
 * 场景Game组件绑定工具
 * 为场景添加Game组件
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const SCENES_DIR = path.join(PROJECT_ROOT, 'assets/scenes');
const SCRIPTS_DIR = path.join(PROJECT_ROOT, 'assets/scripts');

// Game脚本的UUID
let gameScriptUUID = null;

/**
 * 获取Game脚本UUID
 */
function getGameScriptUUID() {
    if (gameScriptUUID) return gameScriptUUID;
    
    const metaPath = path.join(SCRIPTS_DIR, 'Game.ts.meta');
    if (!fs.existsSync(metaPath)) {
        console.error('Game.ts.meta 不存在');
        return null;
    }
    
    const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    gameScriptUUID = meta.uuid;
    return gameScriptUUID;
}

/**
 * 为MainMenu场景添加Game组件
 */
function addGameComponentToMainMenu() {
    const scenePath = path.join(SCENES_DIR, 'MainMenu.scene');
    
    if (!fs.existsSync(scenePath)) {
        console.error('MainMenu.scene 不存在');
        return false;
    }
    
    const uuid = getGameScriptUUID();
    if (!uuid) return false;
    
    console.log(`Game脚本UUID: ${uuid}`);
    
    const sceneContent = fs.readFileSync(scenePath, 'utf-8');
    const sceneData = JSON.parse(sceneContent);
    
    // 查找Canvas节点
    let canvasIndex = -1;
    for (let i = 0; i < sceneData.length; i++) {
        const item = sceneData[i];
        if (typeof item === 'object' && item.__type__ === 'cc.Node' && item._name === 'Canvas') {
            canvasIndex = i;
            break;
        }
    }
    
    if (canvasIndex === -1) {
        console.error('找不到Canvas节点');
        return false;
    }
    
    const canvasNode = sceneData[canvasIndex];
    
    // 检查是否已有Game组件
    if (canvasNode._components) {
        for (const compRef of canvasNode._components) {
            const comp = sceneData[compRef.__id__];
            if (comp && comp.__type__ === uuid) {
                console.log('Game组件已存在');
                return true;
            }
        }
    }
    
    // 创建Game节点（独立节点作为常驻节点）
    const gameNodeIndex = sceneData.length;
    const gameNode = {
        "__type__": "cc.Node",
        "_name": "Game",
        "_objFlags": 0,
        "_parent": { "__id__": 1 }, // scene
        "_children": [],
        "_active": true,
        "_components": [{ "__id__": gameNodeIndex + 1 }],
        "_prefab": null,
        "_lpos": { "__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0 },
        "_lrot": { "__type__": "cc.Quat", "x": 0, "y": 0, "z": 0, "w": 1 },
        "_lscale": { "__type__": "cc.Vec3", "x": 1, "y": 1, "z": 1 },
        "_layer": 1073741824,
        "_euler": { "__type__": "cc.Vec3", "x": 0, "y": 0, "z": 0 },
        "_id": ""
    };
    
    const gameComponent = {
        "__type__": uuid,
        "_name": "",
        "_objFlags": 0,
        "node": { "__id__": gameNodeIndex },
        "_enabled": true,
        "canvas": { "__id__": canvasIndex },
        "__prefab": null,
        "_id": ""
    };
    
    // 添加到场景
    sceneData.push(gameNode);
    sceneData.push(gameComponent);
    
    // 将Game节点添加到场景的子节点
    const scene = sceneData[1];
    if (!scene._children) scene._children = [];
    scene._children.push({ "__id__": gameNodeIndex });
    
    // 写回文件
    fs.writeFileSync(scenePath, JSON.stringify(sceneData, null, 2), 'utf-8');
    console.log('✅ Game组件添加成功');
    
    return true;
}

console.log('========================================');
console.log('场景Game组件绑定工具');
console.log('========================================\n');

addGameComponentToMainMenu();

console.log('\n处理完成');