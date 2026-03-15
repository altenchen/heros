# CLAUDE.md - 英雄无敌Ⅲ：传承

> 本文件为 Claude Code 提供项目上下文和开发指南。

## 项目概述

**英雄无敌Ⅲ：传承** 是一款回合制战棋放置微信小游戏。

- **技术栈**: TypeScript + Cocos Creator 3.8
- **平台**: 微信小游戏
- **设计分辨率**: 750×1334 (竖屏)

---

## Cocos Creator 3.8 开发规范

### 组件开发规范

```typescript
import { _decorator, Component, Node, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MyComponent')
export class MyComponent extends Component {
    // 属性声明 - 编辑器可见
    @property({ type: Node, tooltip: '目标节点' })
    targetNode: Node | null = null;

    @property({ type: CCInteger, tooltip: '数值配置' })
    value: number = 0;

    // 生命周期
    protected onLoad(): void {
        // 初始化，仅执行一次
    }

    protected start(): void {
        // 首次激活时执行，在 onLoad 之后
    }

    protected update(dt: number): void {
        // 每帧更新
    }

    protected onDestroy(): void {
        // 销毁时清理
    }
}
```

### 装饰器使用

| 装饰器 | 用途 |
|--------|------|
| `@ccclass('ClassName')` | 注册组件类，名称必须唯一 |
| `@property` | 声明编辑器属性 |
| `@property({ type: Node })` | 节点引用 |
| `@property({ type: CCInteger })` | 整数 |
| `@property({ type: CCFloat })` | 浮点数 |
| `@property({ type: CCString })` | 字符串 |
| `@property({ type: CCBoolean })` | 布尔值 |
| `@property({ type: [Node] })` | 数组 |

### UUID 管理规范

**重要**: 每个组件的 `.meta` 文件必须包含唯一的 UUID。

```json
// 正确的 .meta 文件格式
{
  "ver": "4.0.24",
  "importer": "typescript",
  "imported": true,
  "uuid": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",  // 必须唯一
  "files": [],
  "subMetas": {},
  "userData": {}
}
```

**UUID 冲突排查**:
1. 检查所有 `.meta` 文件的 UUID 是否唯一
2. 场景文件中的 `__type__` 必须与组件 UUID 匹配
3. 修改 UUID 后必须删除 `temp/` 和 `library/` 目录

### 场景文件结构

```json
[
  { "__type__": "cc.SceneAsset", "scene": { "__id__": 1 } },
  { "__type__": "cc.Scene", "_children": [{ "__id__": 2 }] },
  {
    "__type__": "cc.Node",
    "_name": "Canvas",
    "_components": [{ "__id__": 3 }, { "__id__": 4 }]
  },
  { "__type__": "cc.UITransform", "node": { "__id__": 2 } },
  { "__type__": "cc.Canvas", "node": { "__id__": 2 } },
  // 组件引用使用 UUID
  { "__type__": "组件UUID", "node": { "__id__": 2 } }
]
```

### 资源加载

```typescript
import { resources, Prefab, instantiate, Node } from 'cc';

// 动态加载预制体
resources.load('prefabs/MyPrefab', Prefab, (err, prefab) => {
    if (err) { console.error(err); return; }
    const node = instantiate(prefab);
    this.node.addChild(node);
});

// 加载配置文件
resources.load('configs/units', (err, jsonAsset) => {
    if (err) { console.error(err); return; }
    const data = jsonAsset.json;
});
```

### 节点操作

```typescript
// 查找节点
const child = this.node.getChildByName('ChildName');
const node = find('Canvas/Panel');  // 全局查找

// 创建节点
const newNode = new Node('NewNode');
this.node.addChild(newNode);

// 实例化预制体
const instance = instantiate(prefab);

// 节点池
import { NodePool } from 'cc';
const pool = new NodePool();
pool.put(node);
const node = pool.get();
```

### UI 组件

```typescript
import { Button, Label, Sprite, ProgressBar } from 'cc';

// 按钮
@property(Button)
button: Button | null = null;

this.button?.node.on(Button.EventType.CLICK, this.onClick, this);

// 标签
@property(Label)
label: Label | null = null;
this.label.string = '文本内容';

// 精灵
@property(Sprite)
sprite: Sprite | null = null;
resources.load('textures/icon', SpriteFrame, (err, sf) => {
    this.sprite.spriteFrame = sf;
});
```

### 事件系统

```typescript
// 节点事件
this.node.on(Node.EventType.TOUCH_START, this.onTouch, this);
this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);

// 自定义事件
this.node.emit('custom-event', { data: 123 });
this.node.on('custom-event', this.onCustomEvent, this);

// 全局事件
import { EventTarget } from 'cc';
const eventTarget = new EventTarget();
eventTarget.on('event-name', this.handler, this);
eventTarget.emit('event-name', data);
```

### 动画系统

```typescript
import { tween, Vec3 } from 'cc';

// Tween 动画
tween(this.node)
    .to(0.5, { position: new Vec3(100, 0, 0) })
    .to(0.3, { scale: new Vec3(1.5, 1.5, 1) })
    .call(() => { console.log('动画完成'); })
    .start();

// 延迟执行
this.scheduleOnce(() => {
    console.log('延迟1秒执行');
}, 1);

// 定时器
this.schedule(() => {
    console.log('每秒执行');
}, 1);
```

### 常见问题排查

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| Script is missing or invalid | UUID 冲突或不存在 | 检查 .meta 文件 UUID 唯一性 |
| 组件属性不显示 | 未使用 @property | 添加 @property 装饰器 |
| 预制体加载失败 | 路径错误或未放入 resources | 检查路径，放入 resources 目录 |
| 场景切换黑屏 | Canvas 或 Camera 缺失 | 确保场景有 Canvas 和 Camera |
| 修改代码不生效 | 缓存问题 | 删除 temp/ 和 library/ 目录 |

---

## 项目结构

```
heros/
├── assets/
│   ├── configs/           # 数据配置
│   ├── scripts/
│   │   ├── Game.ts        # 游戏主类
│   │   ├── Bootstrap.ts   # 启动引导
│   │   ├── config/        # 类型定义
│   │   ├── battle/        # 战斗系统
│   │   ├── hero/          # 英雄系统
│   │   ├── ui/            # UI系统
│   │   └── utils/         # 工具类
│   ├── scenes/            # 场景文件
│   ├── prefabs/ui/        # UI预制体
│   └── resources/         # 动态资源
├── settings/              # 构建设置
└── profiles/              # 编辑器配置
```

---

## 核心系统

### UI管理器

```typescript
import { UIManager } from './ui/UIManager';
const ui = UIManager.getInstance();

// 显示/隐藏面板
await ui.showUI('battle_panel', data);
ui.hideUI('battle_panel');
ui.showToast('消息');
```

### 战斗系统

```typescript
import { BattleManager } from './battle/BattleManager';
const battle = new BattleManager();
battle.initBattle(playerUnits, enemyUnits);
battle.startBattle();
```

### 六边形网格

```typescript
import { HexGrid } from './battle/HexGrid';
const grid = new HexGrid(4);  // 半径4格
grid.getCell(q, r);
grid.findPath(start, end);
```

---

## 开发命令

```bash
# TypeScript 编译检查
npx tsc --noEmit

# 预览
npm run preview

# 构建微信小游戏
npm run build:wechat

# 清理缓存（解决UUID问题后）
rm -rf temp/ library/
```

---

## Git 规范

### Commit 类型

| 类型 | 说明 |
|------|------|
| feat | 新功能 |
| fix | 修复bug |
| docs | 文档更新 |
| refactor | 重构 |
| chore | 构建/配置 |

### 分支命名

- 功能: `feature/功能名称`
- 修复: `fix/问题描述`
- 重构: `refactor/重构内容`

---

## 注意事项

1. **UUID 唯一性**: 每个组件的 UUID 必须唯一
2. **资源路径**: 动态加载资源必须放在 `resources/` 目录
3. **缓存清理**: 修改 UUID 或配置后删除 `temp/` 和 `library/`
4. **微信适配**: 使用 `WechatAdapter` 封装微信 API
5. **存储**: 使用 `localStorage` 进行本地存储

---

## 参考资源

- [Cocos Creator 3.8 文档](https://docs.cocos.com/creator/3.8/)
- [微信小游戏开发指南](https://developers.weixin.qq.com/minigame/dev/guide/)
- [六边形网格算法](https://www.redblobgames.com/grids/hexagons/)