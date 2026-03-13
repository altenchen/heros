# CLAUDE.md - 英雄无敌Ⅲ：传承

> 本文件为 Claude Code 提供项目上下文和开发指南。

## 项目概述

**英雄无敌Ⅲ：传承** 是一款回合制战棋放置微信小游戏，复刻经典游戏《英雄无敌Ⅲ：死亡阴影》的核心玩法。

- **技术栈**: TypeScript + Cocos Creator 3.8
- **平台**: 微信小游戏
- **设计分辨率**: 960×640 (横屏)

## 开发状态

| 模块 | 状态 | 说明 |
|------|------|------|
| 战斗系统 | ✅ 已完成 | 六边形战棋、自动AI、伤害计算 |
| 英雄系统 | ✅ 已完成 | 20位英雄、属性加成、升级 |
| 兵种系统 | ✅ 已完成 | 7种族42种兵种 |
| 技能系统 | ✅ 已完成 | 魔法技能、被动技能 |
| 主城系统 | ✅ 已完成 | 建筑、招募、资源 |
| UI系统 | ✅ 已完成 | 管理器、组件、面板 |
| 预制体 | ✅ 已完成 | 7个UI预制体 |
| 编辑器集成 | 🚧 进行中 | 需绑定组件、替换美术 |

## 项目结构

```
heros/
├── assets/
│   ├── configs/           # 数据配置
│   │   ├── units.json.ts  # 42种兵种
│   │   ├── heroes.json.ts # 20位英雄
│   │   └── skills.json.ts # 技能配置
│   ├── scripts/
│   │   ├── Game.ts        # 游戏主类
│   │   ├── config/        # 类型定义
│   │   ├── battle/        # 战斗系统
│   │   ├── hero/          # 英雄系统
│   │   ├── skill/         # 技能系统
│   │   ├── town/          # 主城系统
│   │   ├── ui/            # UI系统 ⭐
│   │   ├── network/       # 微信适配
│   │   └── utils/         # 工具类
│   ├── scenes/            # 场景文件
│   ├── prefabs/ui/        # UI预制体
│   └── resources/ui/      # UI资源
├── settings/              # 构建设置
└── scripts/               # 工具脚本
```

## 核心系统使用

### UI管理器

```typescript
import { UIManager } from './ui/UIManager';

// 初始化
UIManager.getInstance().init(canvas);

// 显示面板
await uiManager.showUI('town_panel', data);
uiManager.hideUI('town_panel');

// 便捷方法
uiManager.showToast('消息');
uiManager.showConfirm('标题', '内容', onConfirm);
uiManager.showLoading('加载中...');
```

### 六边形网格

```typescript
import { HexGrid, HexUtils } from './battle/HexGrid';

const grid = new HexGrid(4); // 半径4格
grid.getCell(q, r);          // 获取格子
grid.findPath(start, end);   // A*寻路
HexGrid.distance(a, b);      // 计算距离
```

### 战斗系统

```typescript
import { BattleManager } from './battle/BattleManager';

const battle = new BattleManager();
battle.initBattle(playerUnits, enemyUnits, playerHero, enemyHero);
battle.startBattle();
```

## 代码规范

### 命名约定

- **文件**: PascalCase (如 `BattleManager.ts`)
- **类**: PascalCase (如 `class BattleManager`)
- **方法**: camelCase (如 `initBattle()`)
- **常量**: UPPER_SNAKE_CASE (如 `BATTLEFIELD_RADIUS`)
- **私有属性**: `_` 前缀 (如 `_state`)

### 组件开发

```typescript
import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MyComponent')
export class MyComponent extends Component {
    @property(Node)
    targetNode: Node | null = null;

    // 使用UIPanel基类获取动画支持
}
```

### 事件使用

```typescript
import { EventCenter, GameEvent } from './utils/EventTarget';

// 监听事件
EventCenter.on(GameEvent.RESOURCE_CHANGED, this.onResourceChanged, this);

// 触发事件
EventCenter.emit(GameEvent.RESOURCE_CHANGED, { type: 'gold', amount: 100 });
```

## 关键文件索引

| 功能 | 文件路径 |
|------|----------|
| 游戏入口 | `assets/scripts/Game.ts` |
| 类型定义 | `assets/scripts/config/GameTypes.ts` |
| UI管理 | `assets/scripts/ui/UIManager.ts` |
| 面板基类 | `assets/scripts/ui/components/UIPanel.ts` |
| 战斗逻辑 | `assets/scripts/battle/BattleManager.ts` |
| 六边形网格 | `assets/scripts/battle/HexGrid.ts` |
| 玩家数据 | `assets/scripts/utils/PlayerDataManager.ts` |
| 事件系统 | `assets/scripts/utils/EventTarget.ts` |

## 开发命令

```bash
# 打开Cocos Creator
open -a "Cocos Creator" .

# 预览
npm run preview

# 构建微信小游戏
npm run build:wechat

# 构建Web
npm run build:web
```

## 下一步工作

1. **在Cocos Creator中打开项目**
2. **绑定组件**: 将脚本拖到预制体节点
3. **设置属性**: 在属性检查器中绑定引用
4. **替换美术**: 将占位图替换为实际资源
5. **修改appid**: 在 `settings/v2/packages/builder.json` 中设置微信appid

## 注意事项

- 所有UI资源放在 `assets/resources/ui/` 下，支持动态加载
- 使用 `localStorage` 进行本地存储
- 微信API通过 `WechatAdapter` 统一封装
- 战斗AI自动执行，玩家通过技能干预

## 参考资源

- [Cocos Creator 3.8 文档](https://docs.cocos.com/creator/3.8/)
- [微信小游戏开发指南](https://developers.weixin.qq.com/minigame/dev/guide/)
- [六边形网格算法](https://www.redblobgames.com/grids/hexagons/)