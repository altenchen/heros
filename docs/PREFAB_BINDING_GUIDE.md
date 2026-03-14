# 预制体绑定指南

本文档说明如何在 Cocos Creator 编辑器中将脚本组件绑定到预制体。

## 一、预制体列表 (38个)

| 预制体 | 脚本组件 | 用途 |
|--------|----------|------|
| MainMenu.prefab | MainMenuPanel | 主菜单 |
| LoadingPanel.prefab | LoadingPanel | 加载界面 |
| AlertDialog.prefab | AlertDialog | 提示对话框 |
| SettingsPanel.prefab | SettingsPanel | 设置面板 |
| TownPanel.prefab | TownPanel | 主城面板 |
| BattlePanel.prefab | BattlePanel | 战斗面板 |
| HeroPanel.prefab | HeroPanel | 英雄面板 |
| Toast.prefab | Toast | 提示消息 |
| FormationPanel.prefab | FormationPanel | 编队面板 |
| BattleResultPanel.prefab | BattleResultPanel | 战斗结果 |
| SaveSelectPanel.prefab | SaveSelectPanel | 存档选择 |
| SavePanel.prefab | SavePanel | 存档管理 |
| OfflineRewardPanel.prefab | OfflineRewardPanel | 离线奖励 |
| AchievementPanel.prefab | AchievementPanel | 成就面板 |
| TaskPanel.prefab | TaskPanel | 任务面板 |
| TutorialOverlay.prefab | TutorialOverlay | 教程遮罩 |
| LevelPanel.prefab | LevelPanel | 关卡面板 |
| SocialPanel.prefab | SocialPanel | 社交面板 |
| SigninPanel.prefab | SigninPanel | 签到面板 |
| ShopPanel.prefab | ShopPanel | 商店面板 |
| SpeedUpPanel.prefab | SpeedUpPanel | 加速面板 |
| SkillTreePanel.prefab | SkillTreePanel | 技能树面板 |
| InventoryPanel.prefab | InventoryPanel | 背包面板 |
| RankPanel.prefab | RankPanel | 排行榜面板 |
| ArenaPanel.prefab | ArenaPanel | 竞技场面板 |
| GachaPanel.prefab | GachaPanel | 招募面板 |
| AnnouncementPanel.prefab | AnnouncementPanel | 公告面板 |
| ArtifactPanel.prefab | ArtifactPanel | 宝物面板 |
| ExpeditionPanel.prefab | ExpeditionPanel | 远征面板 |
| MagicBookPanel.prefab | MagicBookPanel | 魔法书面板 |
| CollectionPanel.prefab | CollectionPanel | 图鉴面板 |
| MailPanel.prefab | MailPanel | 邮件面板 |
| ActivityPanel.prefab | ActivityPanel | 活动面板 |
| VIPPanel.prefab | VIPPanel | VIP面板 |
| MarketPanel.prefab | MarketPanel | 市场面板 |
| OnlineRewardPanel.prefab | OnlineRewardPanel | 在线奖励面板 |
| RandomEventPanel.prefab | RandomEventPanel | 随机事件面板 |
| WarMachinePanel.prefab | WarMachinePanel | 战争机器面板 |

---

## 二、详细绑定说明

### 1. MainMenu.prefab (主菜单)

**脚本组件**: `MainMenuPanel`

**节点结构**:
```
MainMenuPanel (根节点)
├── TitleLabel (Label) - 游戏标题
├── StartButton (Node) - 开始游戏按钮
├── SettingsButton (Node) - 设置按钮
└── ExitButton (Node) - 退出按钮
```

**属性绑定**:
| 属性 | 类型 | 节点路径 |
|------|------|----------|
| titleLabel | Label | TitleLabel |
| startButton | Node | StartButton |
| settingsButton | Node | SettingsButton |
| exitButton | Node | ExitButton |

---

### 2. TownPanel.prefab (主城面板) ⭐ 重要

**脚本组件**: `TownPanel`

**节点结构**:
```
TownPanel (根节点)
├── ResourceBar (资源栏)
│   ├── GoldLabel (Label) - 金币
│   ├── WoodLabel (Label) - 木材
│   ├── OreLabel (Label) - 矿石
│   ├── CrystalLabel (Label) - 水晶
│   ├── GemLabel (Label) - 宝石
│   ├── SulfurLabel (Label) - 硫磺
│   └── MercuryLabel (Label) - 水银
├── BuildingArea (ScrollView) - 建筑列表
│   └── Content (Node) - 内容容器
├── HeroList (Node) - 英雄列表容器
└── ButtonBar (按钮栏)
    ├── BattleButton (Node) - 战斗按钮
    ├── RecruitButton (Node) - 招募按钮
    └── HeroButton (Node) - 英雄按钮
```

**属性绑定**:
| 属性 | 类型 | 说明 |
|------|------|------|
| goldLabel | Label | 金币数量 |
| woodLabel | Label | 木材数量 |
| oreLabel | Label | 矿石数量 |
| crystalLabel | Label | 水晶数量 |
| gemLabel | Label | 宝石数量 |
| sulfurLabel | Label | 硫磺数量 |
| mercuryLabel | Label | 水银数量 |
| heroListContainer | Node | 英雄列表容器 |
| buildingScrollView | ScrollView | 建筑滚动视图 |
| buildingContent | Node | 建筑内容容器 |
| recruitButton | Node | 招募按钮 |
| battleButton | Node | 战斗按钮 |
| heroButton | Node | 英雄按钮 |
| settingsButton | Node | 设置按钮 |
| magicBookButton | Node | 魔法书按钮 |
| marketButton | Node | 市场按钮 |
| heroIconPrefab | Prefab | 英雄头像预制体 |
| buildingItemPrefab | Prefab | 建筑项预制体 |

---

### 3. BattlePanel.prefab (战斗面板) ⭐ 重要

**脚本组件**: `BattlePanel`

**节点结构**:
```
BattlePanel (根节点)
├── BattlefieldContainer (Node) - 战场容器
│   └── HexGridContainer (Node) - 六边形网格容器
├── UnitInfo (Node) - 单位信息
│   ├── UnitNameLabel (Label) - 单位名称
│   ├── UnitHpLabel (Label) - 血量
│   ├── UnitCountLabel (Label) - 数量
│   └── HpBar (Node) - 血量条
├── FocusPoints (Node) - 专注点
│   ├── Container (Node) - 容器
│   └── Label (Label) - 数量标签
├── SkillBar (Node) - 技能栏
│   └── Container (Node) - 技能容器
├── BattleLog (Node) - 战斗日志
│   └── LogLabel (Label) - 日志文本
├── TurnInfo (Node) - 回合信息
│   ├── TurnLabel (Label) - 回合数
│   └── PhaseLabel (Label) - 阶段
└── Buttons (Node) - 按钮区
    ├── AutoBattleButton (Node) - 自动战斗
    ├── PauseButton (Node) - 暂停
    └── ExitButton (Node) - 退出
```

**属性绑定**:
| 属性 | 类型 | 说明 |
|------|------|------|
| battlefieldContainer | Node | 战场容器 |
| hexGridContainer | Node | 六边形网格容器 |
| hexPrefab | Prefab | 六边形格子预制体 |
| currentUnitName | Label | 当前单位名称 |
| currentUnitHp | Label | 当前单位血量 |
| currentUnitCount | Label | 当前单位数量 |
| hpBar | Node | 血量条 |
| focusPointsContainer | Node | 专注点容器 |
| focusPointsLabel | Label | 专注点数量 |
| skillBarContainer | Node | 技能栏容器 |
| skillButtonPrefab | Prefab | 技能按钮预制体 |
| battleLogContainer | Node | 战斗日志容器 |
| battleLogLabel | Label | 日志文本 |
| turnLabel | Label | 回合数 |
| phaseLabel | Label | 阶段 |
| autoBattleButton | Node | 自动战斗按钮 |
| pauseButton | Node | 暂停按钮 |
| exitButton | Node | 退出按钮 |

---

### 4. HeroPanel.prefab (英雄面板)

**脚本组件**: `HeroPanel`

**属性绑定**:
| 属性 | 类型 | 说明 |
|------|------|------|
| heroNameLabel | Label | 英雄名称 |
| heroLevelLabel | Label | 英雄等级 |
| heroAvatarSprite | Sprite | 英雄头像 |
| heroExpBar | Node | 经验条 |
| statLabels | [Label] | 属性标签数组 |
| skillContainer | Node | 技能容器 |
| closeButton | Node | 关闭按钮 |

---

### 5. FormationPanel.prefab (战斗准备/编队面板)

**脚本组件**: `FormationPanel`

**属性绑定**:
| 属性 | 类型 | 说明 |
|------|------|------|
| playerUnitsContainer | Node | 玩家单位容器 |
| enemyPreviewContainer | Node | 敌人预览容器 |
| powerLabel | Label | 战力数值 |
| startBattleButton | Node | 开始战斗按钮 |
| backButton | Node | 返回按钮 |

---

### 6. BattleResultPanel.prefab (战斗结果面板)

**脚本组件**: `BattleResultPanel`

**属性绑定**:
| 属性 | 类型 | 说明 |
|------|------|------|
| victoryNode | Node | 胜利节点 |
| defeatNode | Node | 失败节点 |
| starsContainer | Node | 星星容器 |
| rewardsContainer | Node | 奖励容器 |
| continueButton | Node | 继续按钮 |
| retryButton | Node | 重试按钮 |

---

### 7. SettingsPanel.prefab (设置面板)

**脚本组件**: `SettingsPanel`

**属性绑定**:
| 属性 | 类型 | 说明 |
|------|------|------|
| bgmSlider | Slider | BGM音量滑块 |
| sfxSlider | Slider | 音效音量滑块 |
| bgmToggle | Toggle | BGM开关 |
| sfxToggle | Toggle | 音效开关 |
| languageDropdown | Dropdown | 语言选择 |
| closeButton | Node | 关闭按钮 |

---

### 8. ShopPanel.prefab (商店面板)

**脚本组件**: `ShopPanel`

**属性绑定**:
| 属性 | 类型 | 说明 |
|------|------|------|
| shopTypeTabs | [Node] | 商店类型标签 |
| goodsContainer | Node | 商品容器 |
| goodsItemPrefab | Prefab | 商品项预制体 |
| currencyLabels | [Label] | 货币显示 |
| refreshButton | Node | 刷新按钮 |
| closeButton | Node | 关闭按钮 |

---

### 9. GachaPanel.prefab (招募面板)

**脚本组件**: `GachaPanel`

**属性绑定**:
| 属性 | 类型 | 说明 |
|------|------|------|
| poolTabs | [Node] | 招募池标签 |
| poolPreview | Node | 池预览容器 |
| singlePullButton | Node | 单抽按钮 |
| tenPullButton | Node | 十连按钮 |
| pityCountLabel | Label | 保底计数 |
| resultContainer | Node | 结果容器 |
| closeButton | Node | 关闭按钮 |

---

### 10. VIPPanel.prefab (VIP面板)

**脚本组件**: `VIPPanel`

**属性绑定**:
| 属性 | 类型 | 说明 |
|------|------|------|
| vipLevelLabel | Label | VIP等级 |
| vipExpBar | Node | VIP经验条 |
| privilegeContainer | Node | 特权容器 |
| rechargeContainer | Node | 充值商品容器 |
| monthlyCardContainer | Node | 月卡容器 |
| closeButton | Node | 关闭按钮 |

---

## 三、绑定步骤

### 步骤 1: 打开预制体
1. 在 Cocos Creator 中，展开 `assets/prefabs/ui/` 目录
2. 双击打开要编辑的预制体文件

### 步骤 2: 添加脚本组件
1. 在层级管理器中选择根节点（如 `TownPanel`）
2. 在属性检查器中点击「添加组件」
3. 搜索并添加对应的脚本组件（如 `TownPanel`）

### 步骤 3: 绑定属性
1. 在属性检查器中找到脚本组件的属性列表
2. 将节点拖拽到对应的属性槽中
   - Label 属性：拖拽 Label 节点
   - Node 属性：拖拽任意节点
   - Sprite 属性：拖拽 Sprite 节点
   - Prefab 属性：从资源管理器拖拽预制体文件

### 步骤 4: 设置按钮事件
对于按钮节点：
1. 选择按钮节点
2. 添加 `Button` 组件（如果没有）
3. 在脚本中通过 `node.on(Node.EventType.TOUCH_END, callback)` 处理点击

### 步骤 5: 保存预制体
- 按 `Ctrl+S` (Windows) 或 `Cmd+S` (Mac) 保存

---

## 四、通用面板基类

所有面板都继承自 `UIPanel`，具有以下通用功能：

- **动画类型**: `PanelAnimationType.FADE` (淡入淡出)
- **层级管理**: 自动管理面板层级
- **缓存机制**: 可配置面板缓存
- **生命周期**: `init() → onShow() → onHide() → onDestroy()`

```typescript
// 面板配置示例
this.setPanelConfig({
    layer: 1,
    cache: true,
    animationType: PanelAnimationType.FADE,
    animationDuration: 0.3
});
```

---

## 五、注意事项

1. **命名一致性**: 节点名称应与脚本中的属性名对应
2. **类型匹配**: Label 属性只能绑定 Label 组件
3. **根节点组件**: 脚本组件必须添加到预制体的根节点上
4. **预制体引用**: Prefab 属性需要从资源管理器拖拽，不是层级管理器
5. **按钮交互**: 按钮节点需要添加 `Button` 组件或使用 `UIButton` 组件

---

## 六、资源路径

### UI 资源目录结构

```
assets/resources/ui/
├── textures/           # UI 贴图
│   ├── button.png      # 按钮背景
│   ├── panel_bg.png    # 面板背景
│   ├── gold.png        # 金币图标
│   ├── hex_normal.png  # 六边形（普通）
│   ├── hex_selected.png # 六边形（选中）
│   ├── hero_avatar_placeholder.png # 英雄头像占位
│   ├── skill_icon_placeholder.png  # 技能图标占位
│   └── unit_placeholder.png        # 单位图标占位
└── fonts/              # 字体文件
```

### 其他资源目录

```
assets/textures/
├── atlas/              # 图集
├── effects/            # 特效
├── terrain/            # 地形
└── units/              # 单位贴图

assets/audio/
├── bgm/                # 背景音乐
└── sfx/                # 音效
```

---

## 七、批量绑定建议

建议按以下顺序绑定预制体：

### 第一批：核心面板
1. MainMenu.prefab
2. LoadingPanel.prefab
3. TownPanel.prefab
4. BattlePanel.prefab

### 第二批：战斗相关
5. FormationPanel.prefab
6. BattleResultPanel.prefab
7. HeroPanel.prefab

### 第三批：系统面板
8. SettingsPanel.prefab
9. Toast.prefab
10. AlertDialog.prefab

### 第四批：功能面板
11-38. 其他功能面板（商店、招募、VIP等）

---

**更新时间**: 2026-03-14
**版本**: v1.0