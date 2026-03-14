const fs = require('fs');
const path = require('path');

const scenePath = path.join(__dirname, '../assets/scenes/MainMenu.scene');
const sceneContent = fs.readFileSync(scenePath, 'utf-8');
const sceneData = JSON.parse(sceneContent);

// Find Label node (index 3) and check for UITransform
const labelNodeIndex = 3;
const labelNode = sceneData[labelNodeIndex];

console.log('Label节点:', labelNode._name);
console.log('当前组件:', labelNode._components);

// Check if UITransform exists
let hasUITransform = false;
for (const compRef of labelNode._components) {
    const comp = sceneData[compRef.__id__];
    if (comp.__type__ === 'cc.UITransform') {
        hasUITransform = true;
        console.log('已有 UITransform');
        break;
    }
}

if (!hasUITransform) {
    // Create UITransform component
    const uitransform = {
        "__type__": "cc.UITransform",
        "_name": "",
        "_objFlags": 0,
        "node": { "__id__": labelNodeIndex },
        "_enabled": true,
        "_contentSize": {
            "__type__": "cc.Size",
            "width": 400,
            "height": 100
        },
        "_anchorPoint": {
            "__type__": "cc.Vec2",
            "x": 0.5,
            "y": 0.5
        }
    };

    // Add to scene data
    const newIndex = sceneData.length;
    sceneData.push(uitransform);

    // Update node's components
    labelNode._components.push({ "__id__": newIndex });

    console.log('已添加 UITransform，索引:', newIndex);

    // Write back
    fs.writeFileSync(scenePath, JSON.stringify(sceneData, null, 2), 'utf-8');
    console.log('场景文件已更新');
} else {
    console.log('无需修改');
}