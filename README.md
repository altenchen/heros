# 英雄无敌Ⅲ：传承

一款回合制战棋放置微信小游戏，复刻《英雄无敌Ⅲ：死亡阴影》经典玩法。

## 项目概述

- **游戏类型**: 回合制战棋 + 放置挂机
- **平台**: 微信小游戏
- **引擎**: Cocos Creator 3.8
- **开发语言**: TypeScript
- **设计分辨率**: 960×640 (横屏)

## 核心特性

- ✅ 7大种族，42种兵种
- ✅ 20位经典英雄
- ✅ 六边形战棋系统
- ✅ 自动战斗AI
- ✅ 技能与魔法系统
- ✅ 主城建造系统
- ✅ 离线挂机收益
- ✅ 微信社交功能
- ✅ UI系统框架
- ✅ 成就与任务系统
- ✅ 关卡副本系统
- ✅ 好友与公会系统
- ✅ 新手引导系统
- ✅ Buff状态系统
- ✅ 地形效果系统
- ✅ 战斗准备界面
- ✅ 战斗结果结算界面
- ✅ 音频系统
- ✅ 战斗特效系统
- ✅ VIP系统
- ✅ 排行榜系统
- ✅ 每日签到系统
- ✅ 背包系统
- ✅ 商店系统
- ✅ 新手引导系统
- ✅ 邮件系统
- ✅ 活动系统
- ✅ PVP竞技场系统
- ✅ 招募系统
- ✅ 图鉴系统
- ✅ 存档系统
- ✅ 加速系统
- ✅ 离线奖励系统
- ✅ 技能树系统
- ✅ 存档面板
- ✅ 公告系统
- ✅ 远征系统
- ✅ 在线奖励系统
- ✅ 宝物系统
- ✅ 战争机器系统
- ✅ 市场系统
- ✅ 魔法书系统
- ✅ 战斗魔法集成
- ✅ 战争机器战斗集成
- ✅ 随机事件系统

## 项目结构

```
heros/
├── package.json              # 项目配置
├── project.json              # Cocos Creator项目配置
├── tsconfig.json             # TypeScript配置
├── settings/                 # 构建设置
│   └── v2/packages/
├── scripts/                  # 工具脚本
│   └── generate-placeholders.ts
├── assets/
│   ├── main.ts               # 主入口
│   ├── configs/              # 数据配置
│   │   ├── units.json.ts     # 兵种配置 (42种)
│   │   ├── heroes.json.ts    # 英雄配置 (20位)
│   │   └── skills.json.ts    # 技能配置
│   ├── scripts/
│   │   ├── Game.ts           # 游戏主类
│   │   ├── config/
│   │   │   └── GameTypes.ts  # 核心类型定义
│   │   ├── battle/           # 战斗系统
│   │   │   ├── HexGrid.ts    # 六边形网格
│   │   │   ├── BattleUnit.ts # 战斗单位
│   │   │   └── BattleManager.ts # 战斗管理器
│   │   ├── hero/             # 英雄系统
│   │   │   └── HeroManager.ts
│   │   ├── skill/            # 技能系统
│   │   │   └── SkillManager.ts
│   │   ├── town/             # 主城系统
│   │   │   └── TownManager.ts
│   │   ├── ui/               # UI系统
│   │   │   ├── UIManager.ts  # UI管理器
│   │   │   ├── UIDataBinding.ts # 数据绑定
│   │   │   └── components/   # UI组件
│   │   │       ├── UIComponent.ts
│   │   │       ├── UIPanel.ts
│   │   │       ├── UIButton.ts
│   │   │       ├── MainMenuPanel.ts
│   │   │       ├── TownPanel.ts
│   │   │       ├── BattlePanel.ts
│   │   │       ├── HeroPanel.ts
│   │   │       └── SettingsPanel.ts
│   │   ├── network/          # 网络层
│   │   │   └── WechatAdapter.ts # 微信适配
│   │   ├── achievement/      # 成就系统
│   │   │   ├── AchievementManager.ts # 成就管理
│   │   │   ├── TaskManager.ts # 任务管理
│   │   │   └── index.ts      # 模块导出
│   │   ├── level/           # 关卡系统
│   │   │   ├── LevelManager.ts # 关卡管理
│   │   │   └── index.ts      # 模块导出
│   │   ├── social/          # 社交系统
│   │   │   ├── FriendManager.ts # 好友管理
│   │   │   ├── GuildManager.ts # 公会管理
│   │   │   ├── ChatManager.ts # 聊天管理
│   │   │   └── index.ts      # 模块导出
│   │   ├── tutorial/        # 新手引导系统
│   │   │   ├── TutorialManager.ts # 引导管理
│   │   │   └── index.ts      # 模块导出
│   │   └── utils/            # 工具类
│   │       ├── PlayerDataManager.ts
│   │       ├── EventTarget.ts
│   │       ├── ResourceManager.ts
│   │       └── SoundManager.ts
│   ├── scenes/               # 场景
│   │   ├── MainMenu.scene
│   │   ├── Town.scene
│   │   └── Battle.scene
│   ├── prefabs/              # 预制体
│   │   └── ui/
│   │       ├── MainMenu.prefab
│   │       ├── TownPanel.prefab
│   │       ├── BattlePanel.prefab
│   │       ├── HeroPanel.prefab
│   │       ├── SettingsPanel.prefab
│   │       ├── LoadingPanel.prefab
│   │       └── AlertDialog.prefab
│   ├── resources/            # 动态资源
│   │   └── ui/
│   │       ├── textures/     # UI贴图
│   │       └── fonts/        # 字体
│   ├── textures/             # 静态贴图
│   ├── animations/           # 动画
│   └── audio/                # 音效
└── index.html                # 测试页面
```

## 快速开始

### 1. 在Cocos Creator中打开项目

```bash
# 使用 Cocos Creator 3.8 打开项目目录
# 项目路径: /Users/altenchen/project/heros
```

### 2. 绑定UI组件

打开预制体文件，将脚本组件拖拽到对应的节点上：

- `MainMenu.prefab` → 绑定 `MainMenuPanel` 组件
- `TownPanel.prefab` → 绑定 `TownPanel` 组件
- `BattlePanel.prefab` → 绑定 `BattlePanel` 组件
- `HeroPanel.prefab` → 绑定 `HeroPanel` 组件
- `SettingsPanel.prefab` → 绑定 `SettingsPanel` 组件

### 3. 添加美术资源

将美术资源放入对应目录：

- UI贴图: `assets/resources/ui/textures/`
- 字体: `assets/resources/ui/fonts/`
- 战斗单位贴图: `assets/textures/units/`
- 音效: `assets/audio/`

### 4. 运行预览

```bash
# 在 Cocos Creator 中点击预览按钮
# 或使用命令行
npm run preview
```

### 5. 构建微信小游戏

```bash
# 1. 修改 settings/v2/packages/builder.json 中的 appid
# 2. 构建
npm run build:wechat

# 输出目录: build/wechatgame/
```

## 核心系统说明

### 1. UI系统

```typescript
import { UIManager } from './ui/UIManager';

// 初始化
UIManager.getInstance().init(canvas);

// 显示面板
await uiManager.showUI('town_panel', { data });

// 显示提示
uiManager.showToast('消息内容');
uiManager.showConfirm('标题', '内容', onConfirm, onCancel);
```

### 2. 六边形战棋系统

```typescript
import { HexGrid, HexUtils } from './battle/HexGrid';

// 创建网格
const grid = new HexGrid(4); // 半径4格

// 获取格子
const cell = grid.getCell(0, 0);

// 计算距离
const distance = HexGrid.distance({q: 0, r: 0}, {q: 3, r: -1});

// 寻路
const path = grid.findPath(start, end);
```

### 3. 战斗系统

```typescript
import { BattleManager } from './battle/BattleManager';

const battle = new BattleManager();
battle.initBattle(playerUnits, enemyUnits, playerHero, enemyHero);
battle.startBattle();
```

### 4. 主城系统

```typescript
import { Town } from './town/TownManager';

const town = new Town(Race.CASTLE);
town.startBuilding('castle_dwelling_1', resources);
town.recruitUnit('castle_tier1_pikeman', 10, resources);
```

## 兵种列表

| 种族 | 1阶 | 2阶 | 3阶 | 4阶 | 5阶 | 6阶 |
|------|-----|-----|-----|-----|-----|------|
| 圣堂 | 枪兵 | 弓箭手 | 狮鹫 | 剑士 | 僧侣 | 大天使 |
| 壁垒 | 半人马 | 矮人 | 木精灵 | 飞马 | 树妖 | 金龙 |
| 墓园 | 骷髅兵 | 僵尸 | 幽灵 | 吸血鬼 | 尸巫 | 鬼龙 |
| 地下城 | 穴居人 | 鹰身女妖 | 邪眼 | 美杜莎 | 牛头怪 | 黑龙 |
| 塔楼 | 大妖精 | 石像鬼 | 铁人 | 法师 | 神怪 | 泰坦巨人 |
| 据点 | 大耳怪 | 狼骑士 | 半兽人 | 食人魔 | 雷鸟 | 比蒙巨兽 |
| 地狱 | 小恶魔 | 歌革 | 地狱犬 | 长角恶魔 | 邪神王 | 大恶魔 |

## 开发进度

### Phase 1: 核心玩法 ✅
- [x] 六边形战棋系统
- [x] 自动战斗AI
- [x] 兵种系统
- [x] 英雄系统

### Phase 2: IP内容 ✅
- [x] 42种兵种数据
- [x] 20位英雄数据
- [x] 技能系统
- [x] 主城系统

### Phase 3: UI系统 ✅
- [x] UI管理器
- [x] UI组件基类
- [x] 核心UI面板
- [x] 数据绑定系统
- [x] 场景文件
- [x] 预制体文件

### Phase 3.5: 成就与任务系统 ✅
- [x] 成就类型定义与配置
- [x] 成就管理器
- [x] 每日/每周/主线任务
- [x] 任务管理器
- [x] 成就与任务UI面板
- [x] 奖励发放系统

### Phase 3.6: 关卡系统 ✅
- [x] 关卡类型定义
- [x] 章节与关卡配置
- [x] 关卡管理器
- [x] 关卡选择UI
- [x] 星级评价系统
- [x] 体力系统

### Phase 3.7: 社交系统 ✅
- [x] 社交类型定义
- [x] 好友管理器
- [x] 公会管理器
- [x] 聊天管理器
- [x] 社交UI面板
- [x] 体力赠送/领取

### Phase 3.8: 新手引导系统 ✅
- [x] 引导类型定义
- [x] 引导步骤配置
- [x] 引导管理器
- [x] UI覆盖层组件
- [x] 触发条件系统
- [x] 奖励发放

### Phase 3.9: 奖励发放系统 ✅
- [x] 统一奖励管理器
- [x] 道具发放
- [x] 英雄碎片系统
- [x] 兵种发放
- [x] 资源发放

### Phase 3.10: 皮肤系统 ✅
- [x] 皮肤类型定义
- [x] 皮肤品质与特效
- [x] 皮肤管理器
- [x] 皮肤解锁与装备
- [x] 与奖励系统集成

### Phase 3.11: Buff系统 ✅
- [x] Buff类型定义
- [x] Buff管理器
- [x] Buff叠加与驱散规则
- [x] 战斗系统集成
- [x] 技能系统集成

### Phase 3.12: 地形效果系统 ✅
- [x] 地形效果类型定义
- [x] 地形效果配置（雪地、沙漠、沼泽、熔岩等）
- [x] 地形效果管理器
- [x] 移动消耗与属性修正
- [x] 特殊地形效果（燃烧、减速、隐蔽等）
- [x] 战斗系统集成

### Phase 3.13: 战斗准备界面 ✅
- [x] FormationPanel 组件
- [x] 玩家部队配置显示
- [x] 敌人预览
- [x] 战力计算
- [x] 开始战斗流程
- [x] BattlePanel 移动与技能交互

### Phase 3.14: 战斗结果结算界面 ✅
- [x] BattleResultPanel 组件
- [x] 胜利/失败结果显示
- [x] 星级评价展示
- [x] 奖励显示（金币、经验、物品）
- [x] 战斗统计数据
- [x] 继续与重试按钮
- [x] 胜利特效与动画

### Phase 3.15: 音频系统 ✅
- [x] 音频类型定义 (AudioTypes)
- [x] 音频配置 (audio.json.ts)
- [x] AudioManager 音频管理器
- [x] BGM 淡入淡出切换
- [x] 音效池与冷却机制
- [x] 音量控制与设置持久化
- [x] UI/战斗/技能音效分类
- [x] SoundManager 兼容层

### Phase 3.16: 战斗特效系统 ✅
- [x] 特效类型定义 (EffectTypes)
- [x] EffectManager 特效管理器
- [x] 伤害飘字效果（普通/暴击/治疗/闪避）
- [x] 技能特效系统（单体/范围/投射物）
- [x] Buff图标显示与管理
- [x] 战斗事件桥接 (BattleEffectBridge)
- [x] 特效对象池
- [x] 战斗面板集成

### Phase 3.17: VIP系统 ✅
- [x] VIP类型定义 (VIPTypes)
- [x] VIP等级配置（16级）
- [x] 充值产品配置（8档）
- [x] 月卡配置（2种）
- [x] 成长基金配置
- [x] VIPManager 管理器
- [x] VIP特权系统
- [x] 首充双倍机制

### Phase 3.18: 排行榜系统 ✅
- [x] 排行榜类型定义 (RankTypes)
- [x] 排行榜配置（战力、竞技、星数、公会、英雄）
- [x] RankManager 排行榜管理器
- [x] 排名更新与排序
- [x] 排行榜奖励结算
- [x] RankPanel 排行榜面板
- [x] 个人排名显示

### Phase 3.19: 随机事件系统 ✅
- [x] 随机事件类型定义 (RandomEventTypes)
- [x] 随机事件配置（宝箱、商人、奇遇等）
- [x] RandomEventManager 事件管理器
- [x] 触发场景与概率系统
- [x] 选项选择与效果应用
- [x] RandomEventPanel 事件面板
- [x] 事件冷却与历史记录

### Phase 4: 编辑器集成 🚧
- [ ] 绑定组件到预制体
- [ ] 添加美术资源
- [ ] 动画效果
- [ ] 音效集成

### Phase 5: 测试与上线 📋
- [ ] 单元测试
- [ ] 微信真机测试
- [ ] 性能优化
- [ ] 上线审核

## 许可证

MIT License

## 致谢

本项目致敬经典游戏《英雄无敌Ⅲ：死亡阴影》。

---

**版本**: v1.42.0
**最后更新**: 2026-03-14
**系统模块**: 42个
**UI预制体**: 38个