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
| UI面板扩展 | ✅ 已完成 | 竞技场、招募、图鉴、邮件、活动、VIP、背包、商店面板 |
| 对象池 | ✅ 已完成 | 通用池、节点池、战斗池 |
| 成就任务 | ✅ 已完成 | 33个成就、12个任务 |
| 关卡系统 | ✅ 已完成 | 2章节9关卡、精英副本 |
| 社交系统 | ✅ 已完成 | 好友、公会、聊天 |
| 奖励系统 | ✅ 已完成 | 统一发放、英雄碎片、皮肤 |
| 皮肤系统 | ✅ 已完成 | 英雄皮肤、兵种皮肤、头像框 |
| Buff系统 | ✅ 已完成 | 状态效果、属性修改、持续伤害 |
| 地形系统 | ✅ 已完成 | 地形效果、移动消耗、特殊效果 |
| 战斗准备界面 | ✅ 已完成 | 部队配置、敌人预览、战力计算 |
| 战斗结果界面 | ✅ 已完成 | 胜利结算、星级评价、奖励显示 |
| 音频系统 | ✅ 已完成 | BGM切换、音效池、音量控制 |
| 战斗特效系统 | ✅ 已完成 | 伤害飘字、技能特效、Buff图标 |
| VIP系统 | ✅ 已完成 | VIP等级、充值、月卡、成长基金 |
| 排行榜系统 | ✅ 已完成 | 战力榜、竞技榜、公会榜、奖励结算 |
| 每日签到系统 | ✅ 已完成 | 签到、补签、连续签到奖励 |
| 背包系统 | ✅ 已完成 | 道具存储、使用、出售、扩容 |
| 商店系统 | ✅ 已完成 | 商品购买、货币兑换、商店刷新 |
| 新手引导系统 | ✅ 已完成 | 教程触发、步骤执行、进度保存 |
| 邮件系统 | ✅ 已完成 | 系统邮件、奖励附件、批量领取 |
| 活动系统 | ✅ 已完成 | 限时活动、节日活动、任务进度 |
| PVP竞技场系统 | ✅ 已完成 | 玩家匹配、段位、赛季奖励 |
| 招募系统 | ✅ 已完成 | 抽卡、保底机制、概率配置 |
| 图鉴系统 | ✅ 已完成 | 英雄图鉴、兵种图鉴、收集奖励 |
| 存档系统 | ✅ 已完成 | 多存档槽位、自动存档、存档导入导出 |
| 加速系统 | ✅ 已完成 | 建造加速、道具加速、钻石加速 |
| 离线奖励系统 | ✅ 已完成 | 离线收益计算、离线奖励领取、双倍奖励 |
| 技能树系统 | ✅ 已完成 | 英雄技能树、技能解锁升级、分支系统 |
| 存档面板 | ✅ 已完成 | 存档管理UI、槽位选择、导入导出 |
| 公告系统 | ✅ 已完成 | 游戏公告、弹窗公告、已读状态 |
| 远征系统 | ✅ 已完成 | 英雄派遣、远征奖励、星级评价 |
| 在线奖励系统 | ✅ 已完成 | 在线时长奖励、VIP加成、每日重置 |
| 宝物系统 | ✅ 已完成 | 神器收集、装备强化、属性加成 |
| 战争机器系统 | ✅ 已完成 | 弩车、医疗帐篷、弹药车、投石车 |
| 市场系统 | ✅ 已完成 | 资源交易、汇率优惠、资源交换 |
| 魔法书系统 | ✅ 已完成 | 魔法学习、派系熟练度、施法系统 |
| 战斗魔法集成 | ✅ 已完成 | 魔法书与战斗系统集成 |
| 战争机器战斗集成 | ✅ 已完成 | 战争机器与战斗系统集成 |
| 随机事件系统 | ✅ 已完成 | 随机事件触发、选项选择、效果应用 |
| 预制体注册 | ✅ 已完成 | UIManager已注册所有UI面板 |
| 编辑器集成 | 🚧 进行中 | 需创建预制体文件、绑定组件 |

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
│   │   ├── save/          # 存档系统 ⭐
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

### Buff系统

```typescript
import { BuffManager } from './battle/BuffManager';
import { StatusEffect } from './config/GameTypes';

const buffManager = BuffManager.getInstance();

// 应用Buff
buffManager.applyStatusBuff(targetId, StatusEffect.HASTE, sourceId, 3, 2);

// 检查状态
buffManager.hasStatus(targetId, StatusEffect.STUN);

// 驱散Buff
buffManager.dispelBuffs(targetId, 2, true);
```

### 地形系统

```typescript
import { TerrainEffectManager } from './battle/TerrainEffectManager';
import { TerrainType } from './config/GameTypes';

const terrainManager = TerrainEffectManager.getInstance();

// 初始化地形
terrainManager.init(grid);
terrainManager.initBattlefieldTerrain({
    '0,1': TerrainType.SWAMP,
    '1,2': TerrainType.LAVA
});

// 生成随机地形
terrainManager.generateRandomTerrain(5, 3);

// 获取地形修正
const attackMod = terrainManager.getAttackModifier(unitId);
const speedMod = terrainManager.getSpeedModifier(unitId);
```

### 音频系统

```typescript
import { AudioManager, audioManager } from './utils/AudioManager';
import { BGMScene, SoundCategory } from './config/AudioTypes';

// 初始化
audioManager.init();

// 播放 BGM（支持场景类型或音频ID）
await audioManager.playBGM(BGMScene.BATTLE);
await audioManager.playBGM('bgm_town_castle');

// 停止 BGM（带淡出）
await audioManager.stopBGM(1.0);

// 播放音效
audioManager.playSFX('sfx_ui_button_click');
audioManager.playBattleSound('attack');
audioManager.playSkillSound('fireball');

// 音量控制
audioManager.setMasterVolume(1.0);
audioManager.setBGMVolume(0.8);
audioManager.setSFXVolume(1.0);

// 开关
audioManager.toggleBGM();
audioManager.toggleSFX();

// 获取设置
const settings = audioManager.getSettings();
```

### 战斗特效系统

```typescript
import { EffectManager, effectManager } from './utils/EffectManager';
import { BattleEffectBridge, battleEffectBridge } from './utils/BattleEffectBridge';
import { DamageNumberConfig, SkillEffectConfig, SkillEffectType } from './config/EffectTypes';

// 初始化特效管理器
effectManager.init(containerNode);

// 显示伤害飘字
effectManager.showDamageNumber({
    value: 100,
    isCritical: true
}, position);

// 播放技能特效
const config: SkillEffectConfig = {
    skillId: 'fireball',
    skillType: SkillEffectType.PROJECTILE,
    targets: [{ x: 100, y: 200 }],
    caster: { x: 0, y: 0 }
};
effectManager.playSkillEffect(config);

// 绑定到战斗管理器（自动处理战斗事件）
battleEffectBridge.bindToBattle(battleManager);

// 显示 Buff 特效
effectManager.playPresetEffect('skill_bless', position);

// 创建 Buff 图标
const iconNode = effectManager.createBuffIcon({
    id: 'buff_1',
    status: 1,
    duration: 3
}, parentNode);
```

### VIP系统

```typescript
import { VIPManager, vipManager } from './vip/VIPManager';
import { VIPPrivilegeType } from './config/VIPTypes';

// 初始化
vipManager.init();

// 获取VIP等级
const level = vipManager.getVIPLevel();
const progress = vipManager.getVIPProgress();

// 检查特权
const hasPrivilege = vipManager.hasPrivilege(VIPPrivilegeType.RESOURCE_BONUS);
const bonus = vipManager.getPrivilegeValue(VIPPrivilegeType.RESOURCE_BONUS);

// 充值
const result = vipManager.purchase('gems_680');
if (result.success) {
    console.log(`获得 ${result.gems} 钻石, VIP经验 +${result.vipExp}`);
}

// 购买月卡
vipManager.purchaseMonthlyCard('monthly_card_basic');

// 领取月卡每日奖励
vipManager.claimMonthlyCardDailyReward('monthly_card_basic');

// 成长基金
vipManager.purchaseGrowthFund('growth_fund_1');
vipManager.claimGrowthFundReward('growth_fund_1', 10);
```

### 排行榜系统

```typescript
import { RankManager, rankManager, RankEventType } from './rank/RankManager';
import { RankType, RankPeriod } from './config/RankTypes';

// 初始化
rankManager.init();

// 更新玩家分数
rankManager.updateScore('player_1', '玩家名称', 100000, RankType.POWER);

// 获取排行榜数据
const ranking = rankManager.getRanking(RankType.POWER, RankPeriod.WEEKLY, 50);

// 获取玩家排名
const playerRank = rankManager.getPlayerRank('player_1', RankType.POWER);
const entry = rankManager.getPlayerEntry('player_1', RankType.POWER);

// 获取排名范围（前后玩家）
const range = rankManager.getMyRankRange('player_1', RankType.POWER);

// 监听事件
EventCenter.on(RankEventType.RANK_CHANGED, (data) => {
    console.log(`排名变化: ${data.rankChange}`);
});
```

### 每日签到系统

```typescript
import { DailySigninManager, dailySigninManager } from './signin/DailySigninManager';
import { SigninEventType } from './config/DailySigninTypes';

// 初始化
dailySigninManager.init();

// 获取签到预览
const preview = dailySigninManager.getSigninPreview();
console.log(`今日状态: ${preview.todayState}, 已签到: ${preview.progress.signedDays}天`);

// 签到
const result = dailySigninManager.signin();
if (result.success) {
    console.log(`签到成功: 第${result.day}天`);
    console.log(`获得奖励:`, result.rewards);
}

// 补签
const makeupResult = dailySigninManager.makeup(3); // 补签第3天

// 检查今日是否已签到
const isSigned = dailySigninManager.isTodaySigned();

// 获取连续签到天数
const continuousDays = dailySigninManager.getContinuousDays();

// 获取剩余补签次数
const remainingMakeup = dailySigninManager.getRemainingMakeupCount();
```

### 背包系统

```typescript
import { InventoryManager, inventoryManager } from './inventory/InventoryManager';
import { InventoryType, InventoryEventType } from './config/InventoryTypes';

// 初始化
inventoryManager.init();

// 添加道具
inventoryManager.addItem('item_potion_hp', 10);

// 使用道具
const useResult = inventoryManager.useItem(instanceId, 1);
if (useResult.success) {
    console.log(`使用成功，剩余: ${useResult.remainingCount}`);
}

// 出售道具
const sellResult = inventoryManager.sellItem(instanceId, 5);
if (sellResult.success) {
    console.log(`出售获得: ${sellResult.amount} ${sellResult.currency}`);
}

// 获取道具数量
const count = inventoryManager.getItemCount('item_potion_hp');

// 检查是否有道具
const hasItem = inventoryManager.hasItem('item_key_gold', 3);

// 获取背包所有道具
const items = inventoryManager.getAllItems(InventoryType.MAIN);

// 扩容背包
inventoryManager.expandInventory(InventoryType.MAIN);

// 监听事件
EventCenter.on(InventoryEventType.ITEM_ADD, (data) => {
    console.log(`获得道具: ${data.itemId} x${data.count}`);
});
```

### 商店系统

```typescript
import { ShopManager, shopManager } from './shop/ShopManager';
import { ShopType, ShopEventType, CurrencyType } from './config/ShopTypes';

// 初始化
shopManager.init();

// 获取商店商品
const items = shopManager.getShopItems(ShopType.NORMAL);

// 购买商品
const result = shopManager.purchase('item_potion_mp_10', 1);
if (result.success) {
    console.log(`购买成功，剩余购买次数: ${result.remainingCount}`);
}

// 获取商品状态
const state = shopManager.getItemState('item_potion_mp_10');

// 获取剩余购买次数
const remaining = shopManager.getRemainingPurchaseCount('item_potion_mp_10');

// 货币兑换
const exchangeResult = shopManager.exchange('gems_to_gold_100');

// 监听购买事件
EventCenter.on(ShopEventType.PURCHASE_SUCCESS, (data) => {
    console.log(`购买成功: ${data.itemId} x${data.quantity}`);
});
```

### 新手引导系统

```typescript
import { TutorialManager, tutorialManager } from './tutorial/TutorialManager';
import { TutorialEventType, TriggerType, TutorialState } from './config/TutorialTypes';

// 初始化
tutorialManager.init();

// 检查并触发教程
tutorialManager.checkAndTrigger(TriggerType.GAME_START);
tutorialManager.checkAndTrigger(TriggerType.FIRST_BATTLE, { levelId: 'level_1_1' });

// 获取当前教程
const activeTutorial = tutorialManager.getActiveTutorial();
const currentStep = tutorialManager.getCurrentStep();

// 步骤完成（由UI层调用）
tutorialManager.stepComplete();

// 跳过教程
tutorialManager.skipTutorial();

// 暂停/恢复教程
tutorialManager.pauseTutorial();
tutorialManager.resumeTutorial();

// 检查教程是否完成
const isCompleted = tutorialManager.isTutorialCompleted('tutorial_battle_basic');

// 获取已完成的教程ID列表
const completedIds = tutorialManager.getCompletedTutorialIds();

// 监听教程事件
EventCenter.on(TutorialEventType.TUTORIAL_START, (data) => {
    console.log(`开始教程: ${data.tutorialId}`);
});
EventCenter.on(TutorialEventType.TUTORIAL_COMPLETE, (data) => {
    console.log(`完成教程: ${data.tutorialId}`);
});
```

### 邮件系统

```typescript
import { MailManager, mailManager } from './mail/MailManager';
import { MailType, MailEventType } from './config/MailTypes';

// 初始化
mailManager.init();

// 发送邮件
mailManager.sendMail({
    type: MailType.REWARD,
    sender: '系统',
    title: '每日奖励',
    content: '恭喜您获得每日登录奖励！',
    attachments: [
        { type: 'resource', itemId: 'gold', amount: 1000 },
        { type: 'resource', itemId: 'gems', amount: 100 }
    ]
});

// 发送欢迎邮件
mailManager.sendWelcomeMail();

// 获取邮件列表
const result = mailManager.getMailList();
console.log(`未读邮件: ${result.unreadCount}封`);

// 标记已读
mailManager.markAsRead('mail_xxx');

// 批量标记已读
mailManager.markAllAsRead();

// 领取附件
const claimResult = mailManager.claimAttachment('mail_xxx');

// 一键领取所有附件
mailManager.claimAllAttachments();

// 删除邮件
mailManager.deleteMail('mail_xxx');

// 获取未读数量
const unreadCount = mailManager.getUnreadCount();

// 监听邮件事件
EventCenter.on(MailEventType.MAIL_RECEIVED, (data) => {
    console.log(`收到新邮件: ${data.mail?.title}`);
});
```

### 活动系统

```typescript
import { ActivityManager, activityManager } from './activity/ActivityManager';
import { ActivityType, ActivityEventType } from './config/ActivityTypes';

// 初始化
activityManager.init();

// 获取活动列表
const list = activityManager.getActivityList();
console.log(`进行中: ${list.activeCount}, 预告中: ${list.previewCount}`);

// 获取活动详情
const detail = activityManager.getActivityDetail('daily_signin');

// 检查活动是否开启
const isActive = activityManager.isActivityActive('limited_battle');

// 更新任务进度
activityManager.updateProgress('signin_count', 1);
activityManager.updateProgress('limited_battle_count', 1);

// 领取任务奖励
const result = activityManager.claimReward('daily_signin', 'signin_1');

// 一键领取所有奖励
activityManager.claimAllRewards('daily_signin');

// 检查是否有可领取奖励
const hasClaimable = activityManager.hasClaimableRewards('daily_signin');

// 获取所有有可领取奖励的活动
const activities = activityManager.getActivitiesWithClaimableRewards();

// 监听活动事件
EventCenter.on(ActivityEventType.ACTIVITY_START, (data) => {
    console.log(`活动开始: ${data.activity?.name}`);
});
EventCenter.on(ActivityEventType.TASK_COMPLETE, (data) => {
    console.log(`任务完成: ${data.taskId}`);
});
```

### PVP竞技场系统

```typescript
import { ArenaManager, arenaManager } from './arena/ArenaManager';
import { ArenaTier, MatchType, BattleResult, ArenaEventType } from './config/ArenaTypes';

// 初始化
arenaManager.init();

// 获取玩家竞技场数据
const playerData = arenaManager.getPlayerData();
console.log(`当前段位: ${playerData.tier}, 积分: ${playerData.score}`);

// 获取剩余挑战次数
const remaining = arenaManager.getRemainingChallenges();

// 开始排位匹配
const matchResult = arenaManager.startMatch(MatchType.RANKED);
if (matchResult.success) {
    console.log('开始匹配...');
}

// 购买挑战次数
const buyResult = arenaManager.buyChallengeCount();

// 获取当前对手
const opponent = arenaManager.getCurrentOpponent();

// 开始战斗
arenaManager.startBattle();

// 结束战斗
arenaManager.endBattle(BattleResult.WIN);

// 获取段位配置
const tierConfig = arenaManager.getTierConfig(ArenaTier.DIAMOND);

// 领取段位奖励
const rewardResult = arenaManager.claimTierReward(ArenaTier.GOLD);

// 监听竞技场事件
EventCenter.on(ArenaEventType.MATCH_SUCCESS, (data) => {
    console.log(`匹配成功，对手: ${data.opponent?.playerName}`);
});
EventCenter.on(ArenaEventType.TIER_UP, (data) => {
    console.log(`恭喜晋升段位: ${data.currentTier}`);
});
```

### 招募系统

```typescript
import { GachaManager, gachaManager } from './gacha/GachaManager';
import { GachaPoolType, Rarity, GachaEventType } from './config/GachaTypes';

// 初始化
gachaManager.init();

// 获取开启中的招募池
const pools = gachaManager.getActivePools();

// 获取保底计数
const pityCount = gachaManager.getPityCount('pool_hero_normal');
const pityRemaining = gachaManager.getPityRemaining('pool_hero_normal');

// 单抽
const singleResult = gachaManager.singlePull('pool_hero_normal');
if (singleResult.success) {
    singleResult.results.forEach(result => {
        console.log(`获得: ${result.itemId}, 稀有度: ${result.rarity}, 数量: ${result.amount}`);
    });
}

// 十连
const tenResult = gachaManager.tenPull('pool_hero_normal');

// 获取抽卡消耗
const cost = gachaManager.getPullCost('pool_hero_normal', 10);

// 获取抽卡记录
const records = gachaManager.getRecords(20);

// 监听招募事件
EventCenter.on(GachaEventType.GET_RARE, (data) => {
    console.log(`获得稀有物品! 稀有度: ${data.rarity}`);
});
EventCenter.on(GachaEventType.PITY_TRIGGERED, (data) => {
    console.log('触发保底!');
});
```

### 图鉴系统

```typescript
import { CollectionManager, collectionManager } from './collection/CollectionManager';
import { CollectionType, CollectionState, CollectionEventType } from './config/CollectionTypes';

// 初始化
collectionManager.init();

// 获取收集统计
const stats = collectionManager.getStats(CollectionType.HERO);
console.log(`收集进度: ${stats.collected}/${stats.total}, 完成率: ${stats.completionRate}%`);

// 获取指定类型的图鉴条目
const entries = collectionManager.getEntriesByType(CollectionType.HERO);
entries.forEach(entry => {
    console.log(`${entry.config.name}: ${entry.data.state}, 碎片: ${entry.data.shards}/${entry.config.shardRequired}`);
});

// 添加碎片（通过目标ID）
collectionManager.addShardsByTargetId('hero_castle_knight', 5);

// 收集条目
const collectResult = collectionManager.collect('collection_hero_castle_1');

// 获取可领取的进度奖励
const claimableRewards = collectionManager.getClaimableRewards();

// 领取进度奖励
const claimResult = collectionManager.claimProgressReward('progress_hero_5');

// 监听图鉴事件
EventCenter.on(CollectionEventType.ENTRY_COLLECTED, (data) => {
    console.log(`收集新条目: ${data.entryId}`);
});
EventCenter.on(CollectionEventType.PROGRESS_REACHED, (data) => {
    console.log(`达成收集进度: ${data.count}`);
});
```

### 存档系统

```typescript
import { SaveManager, saveManager } from './save/SaveManager';
import { AutoSaveManager, autoSaveManager } from './save/AutoSaveManager';
import { SaveEventType } from './config/SaveTypes';

// 初始化
saveManager.init();
autoSaveManager.init();

// 获取存档槽位列表
const slots = saveManager.getSlots();

// 创建新存档
const createResult = saveManager.createSave(0, '玩家名', 'light');
if (createResult.success) {
    console.log('存档创建成功');
}

// 保存当前存档
const saveData = collectSaveData(); // 收集所有系统数据
const saveResult = saveManager.save(saveData);

// 加载存档
const loadResult = saveManager.loadFromSlot(0);
if (loadResult.success) {
    // 使用 loadResult.data 恢复游戏状态
}

// 删除存档
const deleteResult = saveManager.deleteSave(0);

// 导出存档（用于备份）
const exportData = saveManager.exportSave(0);

// 导入存档
const importResult = saveManager.importSave(0, exportData);

// 自动存档配置
autoSaveManager.updateConfig({
    enabled: true,
    interval: 5 * 60 * 1000, // 5分钟
    saveOnExit: true,
    saveOnBattleEnd: true
});

// 启动自动存档
autoSaveManager.start();

// 手动触发存档
autoSaveManager.manualSave();

// 监听存档事件
EventCenter.on(SaveEventType.SAVE_COMPLETE, (data) => {
    console.log(`存档保存完成: 槽位${data.slotId}`);
});
EventCenter.on(SaveEventType.LOAD_COMPLETE, (data) => {
    console.log(`存档加载完成: 槽位${data.slotId}`);
});
```

### 加速系统

```typescript
import { SpeedUpManager, speedUpManager } from './utils/SpeedUpManager';
import { SpeedUpType, SpeedUpEventType } from './config/SpeedUpTypes';

// 初始化
speedUpManager.init();

// 注册加速目标（如建造中的建筑）
speedUpManager.registerTarget({
    type: SpeedUpType.BUILDING,
    targetId: 'building_barracks_1',
    remainingTime: 3600, // 1小时
    totalTime: 7200,
    extra: { name: '兵营' }
});

// 获取加速建议
const suggestion = speedUpManager.getSpeedUpSuggestion('building_barracks_1');
console.log(`钻石费用: ${suggestion.gemsCost}, 可免费加速: ${suggestion.canFreeSpeedUp}`);

// 使用道具加速
const itemResult = speedUpManager.speedUpWithItem('building_barracks_1', 'item_speedup_1hour');

// 使用钻石加速
const gemsResult = speedUpManager.speedUpWithGems('building_barracks_1');

// 快速完成（剩余时间小于1分钟时免费）
const quickResult = speedUpManager.quickFinish('building_barracks_1');

// 格式化时间
const timeStr = speedUpManager.formatTime(3661); // "1小时1分1秒"

// 监听加速事件
EventCenter.on(SpeedUpEventType.SPEED_UP_COMPLETE, (data) => {
    console.log(`加速完成: ${data.targetId}`);
});
```

### 离线奖励系统

```typescript
import { PlayerDataManager, playerDataManager } from './utils/PlayerDataManager';

// 离线奖励在玩家登录时自动计算
// 通过 PlayerDataManager.loadPlayerData() 加载数据时会自动计算离线奖励

// 获取离线奖励数据
const playerData = playerDataManager.getPlayerData();
if (playerData?.offlineRewards && playerData.offlineRewards.gold > 0) {
    console.log(`离线奖励: ${playerData.offlineRewards.gold}金币`);
    console.log(`离线时间: ${playerData.offlineRewards.calculateTime}小时`);
}

// 领取离线奖励
const success = playerDataManager.claimOfflineRewards();

// 显示离线奖励面板
uiManager.showUI('offline_reward_panel', {
    gold: offlineRewards.gold,
    resources: offlineRewards.resources,
    offlineHours: offlineRewards.calculateTime
});
```

### 技能树系统

```typescript
import { SkillTreeManager, skillTreeManager } from './hero/SkillTreeManager';
import { SkillTreeBranch, SkillTreeEventType } from './config/SkillTreeTypes';

// 初始化
skillTreeManager.init();

// 初始化英雄技能树
skillTreeManager.initHeroSkillTree('hero_1');

// 获取技能点
const skillPoints = skillTreeManager.getSkillPoints('hero_1');

// 添加技能点
skillTreeManager.addSkillPoints('hero_1', 5);

// 获取分支节点
const fireNodes = skillTreeManager.getBranchNodes(SkillTreeBranch.FIRE);

// 检查是否可以解锁技能
const checkResult = skillTreeManager.canUnlockSkill('hero_1', 'fire_1_1');

// 解锁技能
const unlockResult = skillTreeManager.unlockSkill('hero_1', 'fire_1_1');

// 检查是否可以升级技能
const upgradeCheck = skillTreeManager.canUpgradeSkill('hero_1', 'fire_1_1');

// 升级技能
const upgradeResult = skillTreeManager.upgradeSkill('hero_1', 'fire_1_1');

// 获取技能等级
const level = skillTreeManager.getSkillLevel('hero_1', 'fire_1_1');

// 检查技能是否已解锁
const isUnlocked = skillTreeManager.isSkillUnlocked('hero_1', 'fire_1_1');

// 获取英雄已解锁的技能ID列表
const skillIds = skillTreeManager.getUnlockedSkillIds('hero_1');

// 获取分支进度
const progress = skillTreeManager.getBranchProgress('hero_1', SkillTreeBranch.FIRE);
console.log(`进度: ${progress.unlocked}/${progress.total}, 完成: ${progress.completed}`);

// 重置技能树
const refundedPoints = skillTreeManager.resetSkillTree('hero_1');

// 监听技能树事件
EventCenter.on(SkillTreeEventType.SKILL_UNLOCKED, (data) => {
    console.log(`技能解锁: ${data.nodeId}`);
});
EventCenter.on(SkillTreeEventType.SKILL_UPGRADED, (data) => {
    console.log(`技能升级: ${data.nodeId} -> Lv.${data.level}`);
});
```

### 公告系统

```typescript
import { AnnouncementManager, announcementManager } from './announcement/AnnouncementManager';
import { AnnouncementType, AnnouncementPriority, AnnouncementEventType } from './config/AnnouncementTypes';

// 初始化
announcementManager.init();

// 获取公告列表
const listData = announcementManager.getAnnouncementList();
console.log(`未读公告: ${listData.unreadCount}封, 有弹窗: ${listData.hasPopup}`);

// 获取公告详情
const detail = announcementManager.getAnnouncementDetail('announcement_1');

// 标记已读
announcementManager.markAsRead('announcement_1');

// 标记所有已读
announcementManager.markAllAsRead();

// 获取弹窗公告（登录时调用）
const popup = announcementManager.getPopupAnnouncement();
if (popup) {
    // 显示弹窗
    announcementManager.recordPopupShown(popup.id);
}

// 获取指定类型公告
const eventAnnouncements = announcementManager.getAnnouncementsByType(AnnouncementType.EVENT);

// 获取紧急公告
const urgentAnnouncements = announcementManager.getUrgentAnnouncements();

// 添加动态公告
announcementManager.addAnnouncement({
    id: 'announcement_dynamic_1',
    type: AnnouncementType.EVENT,
    priority: AnnouncementPriority.HIGH,
    title: '紧急维护公告',
    content: '服务器将于今晚22:00进行维护',
    startTime: Date.now(),
    endTime: Date.now() + 86400000
});

// 监听公告事件
EventCenter.on(AnnouncementEventType.ANNOUNCEMENT_READ, (data) => {
    console.log(`公告已读: ${data.announcementId}`);
});
```

### 远征系统

```typescript
import { ExpeditionManager, expeditionManager } from './expedition/ExpeditionManager';
import { ExpeditionState, ExpeditionDifficulty, ExpeditionEventType } from './config/ExpeditionTypes';

// 初始化
expeditionManager.init();

// 获取远征列表
const list = expeditionManager.getExpeditionList();
console.log(`今日剩余次数: ${list.maxDailyCompletions - list.dailyCompletions}`);

// 获取远征详情
const detail = expeditionManager.getExpeditionDetail('expedition_1', playerLevel, playerPower);
if (detail?.canStart) {
    console.log('可以开始远征');
}

// 分配英雄
expeditionManager.assignHero('expedition_1', 'hero_1');

// 召回英雄
expeditionManager.recallHero('expedition_1', 'hero_1');

// 开始远征
const startResult = expeditionManager.startExpedition('expedition_1', playerPower);
if (startResult.success) {
    console.log('远征开始');
}

// 加速远征
expeditionManager.speedUpExpedition('expedition_1', 30); // 加速30分钟

// 立即完成（使用钻石）
expeditionManager.instantComplete('expedition_1');

// 领取奖励
const claimResult = expeditionManager.claimReward('expedition_1');
if (claimResult?.success) {
    console.log(`获得奖励:`, claimResult.rewards);
    console.log(`星级: ${claimResult.starRating}星`);
}

// 获取可领取奖励数量
const claimableCount = expeditionManager.getClaimableCount();

// 每帧更新（需要游戏主循环调用）
expeditionManager.update(deltaTime);

// 监听远征事件
EventCenter.on(ExpeditionEventType.EXPEDITION_COMPLETE, (data) => {
    console.log(`远征完成: ${data.expeditionId}, 星级: ${data.starRating}`);
});
```

### 在线奖励系统

```typescript
import { OnlineRewardManager, onlineRewardManager } from './onlinereward/OnlineRewardManager';
import { OnlineRewardEventType } from './config/OnlineRewardTypes';

// 初始化
onlineRewardManager.init();

// 获取在线奖励数据
const data = onlineRewardManager.getOnlineRewardData();
console.log(`今日在线: ${onlineRewardManager.formatOnlineTime()}`);
console.log(`可领取: ${data.availableCount}个奖励`);

// 获取奖励预览列表
const previews = onlineRewardManager.getRewardPreviews();
previews.forEach(preview => {
    console.log(`${preview.config.title}: ${preview.claimed ? '已领取' : preview.available ? '可领取' : '未达成'}`);
});

// 领取奖励
const result = onlineRewardManager.claimReward('online_reward_1', vipLevel);
if (result.success) {
    console.log('领取成功:', result.rewards);
}

// 一键领取所有奖励
const allRewards = onlineRewardManager.claimAllRewards(vipLevel);

// 检查是否有可领取奖励
const hasRewards = onlineRewardManager.hasAvailableRewards();

// 获取下一个奖励
const nextReward = onlineRewardManager.getNextReward();
if (nextReward) {
    console.log(`下一个奖励需要在线: ${nextReward.requiredMinutes}分钟`);
}

// 每帧更新（需要游戏主循环调用）
onlineRewardManager.update(deltaTime);

// 监听在线奖励事件
EventCenter.on(OnlineRewardEventType.REWARD_AVAILABLE, (data) => {
    console.log(`有${data.count}个奖励可领取`);
});
EventCenter.on(OnlineRewardEventType.REWARD_CLAIMED, (data) => {
    console.log(`领取奖励: ${data.rewardId}`);
});
```

### 宝物系统

```typescript
import { ArtifactManager, artifactManager } from './artifact/ArtifactManager';
import { ArtifactSlot, ArtifactRarity, ArtifactEventType, ArtifactStatType } from './config/ArtifactTypes';

// 初始化
artifactManager.init();

// 初始化英雄装备槽
artifactManager.initHeroEquipment('hero_1');

// 获取宝物
const artifact = artifactManager.addArtifact('artifact_sword_3', 1);

// 装备宝物
const equipResult = artifactManager.equipArtifact('hero_1', artifact!.instanceId);
if (equipResult.success) {
    console.log('装备成功');
}

// 卸下宝物
artifactManager.unequipArtifact('hero_1', ArtifactSlot.MAIN_HAND);

// 获取英雄装备属性
const attack = artifactManager.getHeroStat('hero_1', ArtifactStatType.ATTACK);
const allStats = artifactManager.getHeroAllStats('hero_1');

// 获取背包宝物列表
const artifacts = artifactManager.getArtifacts({ rarity: ArtifactRarity.MAJOR });

// 获取英雄装备
const equipment = artifactManager.getHeroEquipment('hero_1');
const mainHand = artifactManager.getSlotArtifact('hero_1', ArtifactSlot.MAIN_HAND);

// 出售宝物
const gold = artifactManager.sellArtifact(artifact!.instanceId);

// 强化宝物
artifactManager.enhanceArtifact(artifact!.instanceId, { gold: 1000, gems: 10 });

// 组合宝物合成
if (artifactManager.canCombineArtifact('artifact_sword_4')) {
    const combined = artifactManager.combineArtifact('artifact_sword_4');
}

// 存档
const saveData = artifactManager.getSaveData();
artifactManager.loadSaveData(saveData);

// 监听宝物事件
EventCenter.on(ArtifactEventType.ARTIFACT_OBTAINED, (data) => {
    console.log(`获得宝物: ${data.artifactId}`);
});
EventCenter.on(ArtifactEventType.ARTIFACT_EQUIPPED, (data) => {
    console.log(`装备宝物: ${data.artifactId}`);
});
```

### 战争机器系统

```typescript
import { WarMachineManager, warMachineManager } from './warmachine/WarMachineManager';
import { WarMachineType, WarMachineEventType } from './config/WarMachineTypes';

// 初始化
warMachineManager.init();

// 获得战争机器
const ballista = warMachineManager.addMachine('war_machine_ballista_1', 1);
const tent = warMachineManager.addMachine('war_machine_first_aid_tent_1', 1);

// 装备到英雄
warMachineManager.equipMachine(ballista!.instanceId, 'hero_1');
warMachineManager.equipMachine(tent!.instanceId, 'hero_1');

// 获取英雄装备的战争机器
const heroMachines = warMachineManager.getHeroMachines('hero_1');

// 获取弹药车加成
const ammoBonus = warMachineManager.getAmmoCartBonus('hero_1');

// 升级战争机器
const upgradeResult = warMachineManager.upgradeMachine(ballista!.instanceId);

// 出售战争机器
const sellResult = warMachineManager.sellMachine(ballista!.instanceId);

// 战斗中初始化状态
const battleStates = warMachineManager.initBattleState('hero_1');

// 执行弩车攻击
const attackResult = warMachineManager.executeBallistaAttack(
    ballista!.instanceId,
    'enemy_unit_1',
    10 // 英雄攻击力
);

// 执行医疗帐篷治疗
const healResult = warMachineManager.executeFirstAidHeal(
    tent!.instanceId,
    'ally_unit_1',
    5 // 英雄魔法强度
);

// 战争机器受损
warMachineManager.damageMachine(ballista!.instanceId, 50);

// 修复战争机器
warMachineManager.repairMachine(ballista!.instanceId, 30);

// 存档
const saveData = warMachineManager.getSaveData();
warMachineManager.loadSaveData(saveData);

// 监听战争机器事件
EventCenter.on(WarMachineEventType.OBTAINED, (data) => {
    console.log(`获得战争机器: ${data.configId}`);
});
EventCenter.on(WarMachineEventType.BATTLE_ACTION, (data) => {
    console.log(`战争机器行动: ${data.actionType}`);
});
```

### 市场系统

```typescript
import { MarketManager, marketManager } from './market/MarketManager';
import { TradeType, MarketEventType } from './config/MarketTypes';

// 初始化
marketManager.init();

// 获取市场等级
const level = marketManager.getMarketLevel();
const levelConfig = marketManager.getLevelConfig();
console.log(`市场等级: ${level}, 汇率优惠: ${levelConfig?.rateBonus}%`);

// 获取剩余交易次数
const remaining = marketManager.getRemainingTrades();

// 获取汇率预览
const previews = marketManager.getRatePreviews();
previews.forEach(preview => {
    console.log(`${preview.resourceType}: 买入 ${preview.buyPrice}, 卖出 ${preview.sellPrice}`);
});

// 买入资源
const buyResult = marketManager.executeTrade(
    {
        tradeType: TradeType.BUY,
        resourceType: ResourceType.WOOD,
        amount: 100
    },
    {
        getResource: (type) => playerDataManager.getResource(type),
        addResource: (type, amount) => playerDataManager.addResource(type, amount),
        useResource: (type, amount) => playerDataManager.useResource(type, amount)
    }
);

// 卖出资源
const sellResult = marketManager.executeTrade(
    {
        tradeType: TradeType.SELL,
        resourceType: ResourceType.ORE,
        amount: 50
    },
    playerDataManager
);

// 获取资源交换列表
const exchanges = marketManager.getResourceExchanges();

// 执行资源交换（如木材换矿石）
const exchangeResult = marketManager.executeExchange(
    {
        exchangeId: 'wood_to_ore',
        fromAmount: 10
    },
    playerDataManager
);

// 升级市场
const upgradeResult = marketManager.upgradeMarket({
    hasEnoughResources: (cost) => playerDataManager.hasEnoughResources(cost),
    useResources: (cost) => playerDataManager.useResources(cost)
});

// 获取交易记录
const records = marketManager.getTradeRecords(20);

// 存档
const saveData = marketManager.getSaveData();
marketManager.loadSaveData(saveData);

// 监听市场事件
EventCenter.on(MarketEventType.TRADE_COMPLETE, (data) => {
    console.log(`交易完成: ${data.trade?.resourceType} ${data.trade?.amount}`);
});
EventCenter.on(MarketEventType.MARKET_UPGRADED, (data) => {
    console.log(`市场升级: ${data.oldLevel} -> ${data.newLevel}`);
});
```

### 魔法书系统

```typescript
import { MagicBookManager, magicBookManager } from './magicbook/MagicBookManager';
import { MagicBookEventType, SpellLevel, MagicMastery } from './config/MagicBookTypes';
import { MagicSchool } from './config/GameTypes';

// 初始化
magicBookManager.init();

// 初始化英雄魔法书
magicBookManager.initHeroMagicBook('hero_1', 20, 1, 1);

// 学习魔法
const learnResult = magicBookManager.learnSpell('hero_1', 'spell_fireball');
if (learnResult.success) {
    console.log(`学习成功，费用: ${learnResult.cost.gold}金币`);
}

// 升级魔法
const upgradeResult = magicBookManager.upgradeSpell('hero_1', 'spell_fireball');
if (upgradeResult.success) {
    console.log(`魔法升级到 Lv.${upgradeResult.newLevel}`);
}

// 获取派系熟练度
const fireMastery = magicBookManager.getSchoolMastery('hero_1', MagicSchool.FIRE);
console.log(`火系熟练度: ${fireMastery?.level}`);

// 升级派系熟练度
const masteryResult = magicBookManager.upgradeSchoolMastery('hero_1', MagicSchool.FIRE);

// 获取魔法值
const currentMana = magicBookManager.getCurrentMana('hero_1');
const maxMana = magicBookManager.getMaxMana('hero_1');

// 消耗/恢复魔法值
magicBookManager.consumeMana('hero_1', 15);
magicBookManager.restoreMana('hero_1', 10);
magicBookManager.regenerateMana('hero_1');

// 检查是否可以施放魔法
const canCast = magicBookManager.canCastSpell('hero_1', 'spell_fireball');

// 获取英雄已学魔法
const spells = magicBookManager.getHeroSpells('hero_1');
spells.forEach(({ config, heroSpell }) => {
    console.log(`${config.name}: Lv.${heroSpell.level}`);
});

// 获取所有魔法配置
const allSpells = magicBookManager.getAllSpells();
const fireSpells = magicBookManager.getSpellsBySchool(MagicSchool.FIRE);

// 获取魔法预览
const preview = magicBookManager.getSpellPreview('hero_1', 'spell_fireball');
if (preview) {
    console.log(`魔法: ${preview.spell.name}`);
    console.log(`消耗: ${preview.manaCost} 魔法值`);
    console.log(`可施放: ${preview.canCast}`);
}

// 设置快捷栏
magicBookManager.setQuickSlot(0, 'spell_fireball', 'hero_1');

// 存档
const saveData = magicBookManager.getSaveData();
magicBookManager.loadSaveData(saveData);

// 监听魔法书事件
EventCenter.on(MagicBookEventType.SPELL_LEARNED, (data) => {
    console.log(`学习魔法: ${data.spellName}`);
});
EventCenter.on(MagicBookEventType.MANA_CHANGED, (data) => {
    console.log(`魔法值变化: ${data.currentMana}/${data.maxMana}`);
});
EventCenter.on(MagicBookEventType.MASTERY_UPGRADED, (data) => {
    console.log(`派系熟练度提升: ${data.school}`);
});
```

### 随机事件系统

```typescript
import { RandomEventManager, randomEventManager } from './randomevent/RandomEventManager';
import { EventTriggerScene, RandomEventEventType } from './config/RandomEventTypes';

// 初始化
randomEventManager.init();

// 尝试触发随机事件
const result = randomEventManager.tryTriggerEvent(EventTriggerScene.TOWN);
if (result.success) {
    console.log(`触发事件: ${result.event?.name}`);
    // 显示事件面板
    uiManager.showUI('RandomEventPanel', { event: result.event });
}

// 获取当前活动事件
const activeEvent = randomEventManager.getActiveEvent();

// 选择选项
const selectResult = randomEventManager.selectOption('option_1', {
    checkRequirement: (type, id, amount) => {
        // 检查需求条件
        return playerDataManager.hasResource(id, amount);
    }
});

// 应用效果
randomEventManager.applyEffects(selectResult.effects!, {
    addResource: (id, amount) => playerDataManager.addResource(id, amount),
    removeResource: (id, amount) => playerDataManager.useResource(id, amount),
    addItem: (id, amount) => inventoryManager.addItem(id, amount),
    addExp: (amount) => heroManager.addExp(amount)
});

// 跳过事件
randomEventManager.skipEvent();

// 检查事件是否可用
const isAvailable = randomEventManager.isEventAvailable('event_treasure_1');

// 获取事件冷却剩余时间
const cooldown = randomEventManager.getCooldownRemaining('event_treasure_1');

// 强制触发指定事件
randomEventManager.forceTriggerEvent('event_special_1');

// 获取事件历史
const history = randomEventManager.getEventHistory();

// 存档
const saveData = randomEventManager.getSaveData();
randomEventManager.loadSaveData(saveData);

// 监听事件
EventCenter.on(RandomEventEventType.EVENT_TRIGGERED, (data) => {
    console.log(`事件触发: ${data.event?.name}`);
});
EventCenter.on(RandomEventEventType.OPTION_SELECTED, (data) => {
    console.log(`选择选项: ${data.optionId}`);
});
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
| 皮肤类型 | `assets/scripts/config/SkinTypes.ts` |
| Buff类型 | `assets/scripts/config/BuffTypes.ts` |
| 地形类型 | `assets/scripts/config/TerrainTypes.ts` |
| 特效类型 | `assets/scripts/config/EffectTypes.ts` |
| UI管理 | `assets/scripts/ui/UIManager.ts` |
| 预制体索引 | `assets/scripts/ui/UIPrefabIndex.ts` |
| 面板基类 | `assets/scripts/ui/components/UIPanel.ts` |
| 战斗准备 | `assets/scripts/ui/components/FormationPanel.ts` |
| 战斗面板 | `assets/scripts/ui/components/BattlePanel.ts` |
| 战斗结果 | `assets/scripts/ui/components/BattleResultPanel.ts` |
| 排行榜面板 | `assets/scripts/ui/components/RankPanel.ts` |
| 竞技场面板 | `assets/scripts/ui/components/ArenaPanel.ts` |
| 招募面板 | `assets/scripts/ui/components/GachaPanel.ts` |
| 图鉴面板 | `assets/scripts/ui/components/CollectionPanel.ts` |
| 邮件面板 | `assets/scripts/ui/components/MailPanel.ts` |
| 活动面板 | `assets/scripts/ui/components/ActivityPanel.ts` |
| VIP面板 | `assets/scripts/ui/components/VIPPanel.ts` |
| 背包面板 | `assets/scripts/ui/components/InventoryPanel.ts` |
| 商店面板 | `assets/scripts/ui/components/ShopPanel.ts` |
| 战斗逻辑 | `assets/scripts/battle/BattleManager.ts` |
| Buff管理 | `assets/scripts/battle/BuffManager.ts` |
| 地形效果 | `assets/scripts/battle/TerrainEffectManager.ts` |
| 六边形网格 | `assets/scripts/battle/HexGrid.ts` |
| 玩家数据 | `assets/scripts/utils/PlayerDataManager.ts` |
| 奖励管理 | `assets/scripts/utils/RewardManager.ts` |
| 皮肤管理 | `assets/scripts/utils/SkinManager.ts` |
| 事件系统 | `assets/scripts/utils/EventTarget.ts` |
| 音频管理 | `assets/scripts/utils/AudioManager.ts` |
| 音频类型 | `assets/scripts/config/AudioTypes.ts` |
| 音频配置 | `assets/scripts/config/audio.json.ts` |
| 特效管理 | `assets/scripts/utils/EffectManager.ts` |
| 特效桥接 | `assets/scripts/utils/BattleEffectBridge.ts` |
| VIP管理 | `assets/scripts/vip/VIPManager.ts` |
| VIP类型 | `assets/scripts/config/VIPTypes.ts` |
| VIP配置 | `assets/scripts/config/vip.json.ts` |
| 排行榜管理 | `assets/scripts/rank/RankManager.ts` |
| 排行榜类型 | `assets/scripts/config/RankTypes.ts` |
| 排行榜配置 | `assets/scripts/config/rank.json.ts` |
| 每日签到管理 | `assets/scripts/signin/DailySigninManager.ts` |
| 签到类型 | `assets/scripts/config/DailySigninTypes.ts` |
| 签到配置 | `assets/scripts/config/signin.json.ts` |
| 背包管理 | `assets/scripts/inventory/InventoryManager.ts` |
| 背包类型 | `assets/scripts/config/InventoryTypes.ts` |
| 物品配置 | `assets/scripts/config/items.json.ts` |
| 商店管理 | `assets/scripts/shop/ShopManager.ts` |
| 商店类型 | `assets/scripts/config/ShopTypes.ts` |
| 商店配置 | `assets/scripts/config/shop.json.ts` |
| 新手引导管理 | `assets/scripts/tutorial/TutorialManager.ts` |
| 新手引导类型 | `assets/scripts/config/TutorialTypes.ts` |
| 新手引导配置 | `assets/scripts/config/tutorials.json.ts` |
| 邮件管理 | `assets/scripts/mail/MailManager.ts` |
| 邮件类型 | `assets/scripts/config/MailTypes.ts` |
| 邮件配置 | `assets/scripts/config/mail.json.ts` |
| 活动管理 | `assets/scripts/activity/ActivityManager.ts` |
| 活动类型 | `assets/scripts/config/ActivityTypes.ts` |
| 活动配置 | `assets/scripts/config/activity.json.ts` |
| 竞技场管理 | `assets/scripts/arena/ArenaManager.ts` |
| 竞技场类型 | `assets/scripts/config/ArenaTypes.ts` |
| 竞技场配置 | `assets/scripts/config/arena.json.ts` |
| 招募管理 | `assets/scripts/gacha/GachaManager.ts` |
| 招募类型 | `assets/scripts/config/GachaTypes.ts` |
| 招募配置 | `assets/scripts/config/gacha.json.ts` |
| 图鉴管理 | `assets/scripts/collection/CollectionManager.ts` |
| 图鉴类型 | `assets/scripts/config/CollectionTypes.ts` |
| 图鉴配置 | `assets/scripts/config/collection.json.ts` |
| 存档管理 | `assets/scripts/save/SaveManager.ts` |
| 自动存档 | `assets/scripts/save/AutoSaveManager.ts` |
| 存档类型 | `assets/scripts/config/SaveTypes.ts` |
| 存档选择面板 | `assets/scripts/ui/components/SaveSelectPanel.ts` |
| 离线奖励面板 | `assets/scripts/ui/components/OfflineRewardPanel.ts` |
| 加速管理 | `assets/scripts/utils/SpeedUpManager.ts` |
| 加速类型 | `assets/scripts/config/SpeedUpTypes.ts` |
| 加速面板 | `assets/scripts/ui/components/SpeedUpPanel.ts` |
| 存档面板 | `assets/scripts/ui/components/SavePanel.ts` |
| 技能树管理 | `assets/scripts/hero/SkillTreeManager.ts` |
| 技能树类型 | `assets/scripts/config/SkillTreeTypes.ts` |
| 技能树面板 | `assets/scripts/ui/components/SkillTreePanel.ts` |
| 公告管理 | `assets/scripts/announcement/AnnouncementManager.ts` |
| 公告类型 | `assets/scripts/config/AnnouncementTypes.ts` |
| 公告配置 | `assets/scripts/config/announcement.json.ts` |
| 公告面板 | `assets/scripts/ui/components/AnnouncementPanel.ts` |
| 远征管理 | `assets/scripts/expedition/ExpeditionManager.ts` |
| 远征类型 | `assets/scripts/config/ExpeditionTypes.ts` |
| 远征配置 | `assets/scripts/config/expedition.json.ts` |
| 远征面板 | `assets/scripts/ui/components/ExpeditionPanel.ts` |
| 在线奖励管理 | `assets/scripts/onlinereward/OnlineRewardManager.ts` |
| 在线奖励类型 | `assets/scripts/config/OnlineRewardTypes.ts` |
| 在线奖励配置 | `assets/scripts/config/online_reward.json.ts` |
| 在线奖励面板 | `assets/scripts/ui/components/OnlineRewardPanel.ts` |
| 宝物管理 | `assets/scripts/artifact/ArtifactManager.ts` |
| 宝物类型 | `assets/scripts/config/ArtifactTypes.ts` |
| 宝物配置 | `assets/scripts/config/artifact.json.ts` |
| 宝物面板 | `assets/scripts/ui/components/ArtifactPanel.ts` |
| 战争机器管理 | `assets/scripts/warmachine/WarMachineManager.ts` |
| 战争机器类型 | `assets/scripts/config/WarMachineTypes.ts` |
| 战争机器配置 | `assets/scripts/configs/war_machine.json.ts` |
| 战争机器面板 | `assets/scripts/ui/components/WarMachinePanel.ts` |
| 市场管理 | `assets/scripts/market/MarketManager.ts` |
| 市场类型 | `assets/scripts/config/MarketTypes.ts` |
| 市场配置 | `assets/scripts/config/market.json.ts` |
| 市场面板 | `assets/scripts/ui/components/MarketPanel.ts` |
| 魔法书管理 | `assets/scripts/magicbook/MagicBookManager.ts` |
| 魔法书类型 | `assets/scripts/config/MagicBookTypes.ts` |
| 魔法书配置 | `assets/configs/magic_book.json.ts` |
| 魔法书面板 | `assets/scripts/ui/components/MagicBookPanel.ts` |
| 随机事件管理 | `assets/scripts/randomevent/RandomEventManager.ts` |
| 随机事件类型 | `assets/scripts/config/RandomEventTypes.ts` |
| 随机事件配置 | `assets/scripts/configs/random_events.json.ts` |
| 随机事件面板 | `assets/scripts/ui/components/RandomEventPanel.ts` |
| Toast提示 | `assets/scripts/ui/components/Toast.ts` |

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

## Git 开发流程规范

### 分支管理

```
master (主分支)
  │
  ├── feature/xxx  (功能分支)
  ├── fix/xxx       (修复分支)
  └── refactor/xxx  (重构分支)
```

### 开发流程

1. **创建分支**: 从 `master` 拉取新分支
   ```bash
   git checkout master
   git pull origin master
   git checkout -b feature/功能名称
   ```

2. **开发阶段**: 在功能分支上进行开发
   ```bash
   git add .
   git commit -m "feat: 功能描述"
   ```

3. **验证阶段**: 确保功能正常，无报错

4. **合并分支**: 验证通过后合并到 `master`
   ```bash
   git checkout master
   git merge feature/功能名称
   git push origin master
   ```

5. **更新文档**: 合并后更新相关文档
   - `CLAUDE.md` - 项目上下文
   - `README.md` - 项目说明
   - 项目记忆文件

6. **删除分支**: 合并完成后删除功能分支
   ```bash
   git branch -d feature/功能名称
   git push origin --delete feature/功能名称
   ```

### Commit 规范 (遵循阿里规范)

| 类型 | 说明 | 示例 |
|------|------|------|
| feat | 新功能 | `feat: 添加音效系统` |
| fix | 修复bug | `fix: 修复战斗单位死亡后未移除的问题` |
| docs | 文档更新 | `docs: 更新README` |
| style | 代码格式 | `style: 格式化代码` |
| refactor | 重构 | `refactor: 优化对象池性能` |
| test | 测试 | `test: 添加战斗系统单元测试` |
| chore | 构建/工具 | `chore: 更新构建配置` |

### 分支命名规范

- **功能分支**: `feature/功能名称` (如 `feature/audio-system`)
- **修复分支**: `fix/问题描述` (如 `fix/battle-unit-dead`)
- **重构分支**: `refactor/重构内容` (如 `refactor/pool-optimization`)

## 下一步工作

### 1. 创建UI预制体 (在Cocos Creator中)

**已有预制体** (7个):
- `MainMenu.prefab` - 主菜单
- `LoadingPanel.prefab` - 加载界面
- `AlertDialog.prefab` - 提示对话框
- `SettingsPanel.prefab` - 设置面板
- `TownPanel.prefab` - 主城面板
- `BattlePanel.prefab` - 战斗面板
- `HeroPanel.prefab` - 英雄面板

**需要创建的预制体** (32个):

| 预制体名称 | 组件脚本 | 层级 | 描述 |
|-----------|---------|------|------|
| SaveSelectPanel | SaveSelectPanel.ts | PANEL | 存档选择面板 |
| SavePanel | SavePanel.ts | PANEL | 存档管理面板 |
| OfflineRewardPanel | OfflineRewardPanel.ts | POPUP | 离线奖励面板 |
| AchievementPanel | AchievementPanel.ts | PANEL | 成就面板 |
| TaskPanel | TaskPanel.ts | PANEL | 任务面板 |
| LevelPanel | LevelPanel.ts | PANEL | 关卡面板 |
| FormationPanel | FormationPanel.ts | PANEL | 编队面板 |
| BattleResultPanel | BattleResultPanel.ts | POPUP | 战斗结果面板 |
| SocialPanel | SocialPanel.ts | PANEL | 社交面板 |
| SigninPanel | SigninPanel.ts | PANEL | 签到面板 |
| ShopPanel | ShopPanel.ts | PANEL | 商店面板 |
| InventoryPanel | InventoryPanel.ts | PANEL | 背包面板 |
| RankPanel | RankPanel.ts | PANEL | 排行榜面板 |
| ArenaPanel | ArenaPanel.ts | PANEL | 竞技场面板 |
| GachaPanel | GachaPanel.ts | PANEL | 招募面板 |
| CollectionPanel | CollectionPanel.ts | PANEL | 图鉴面板 |
| MailPanel | MailPanel.ts | PANEL | 邮件面板 |
| ActivityPanel | ActivityPanel.ts | PANEL | 活动面板 |
| VIPPanel | VIPPanel.ts | PANEL | VIP面板 |
| SpeedUpPanel | SpeedUpPanel.ts | POPUP | 加速面板 |
| SkillTreePanel | SkillTreePanel.ts | PANEL | 技能树面板 |
| AnnouncementPanel | AnnouncementPanel.ts | PANEL | 公告面板 |
| ExpeditionPanel | ExpeditionPanel.ts | PANEL | 远征面板 |
| OnlineRewardPanel | OnlineRewardPanel.ts | PANEL | 在线奖励面板 |
| ArtifactPanel | ArtifactPanel.ts | PANEL | 宝物面板 |
| WarMachinePanel | WarMachinePanel.ts | PANEL | 战争机器面板 |
| MagicBookPanel | MagicBookPanel.ts | PANEL | 魔法书面板 |
| MarketPanel | MarketPanel.ts | PANEL | 市场面板 |
| RandomEventPanel | RandomEventPanel.ts | POPUP | 随机事件面板 |
| TutorialOverlay | TutorialOverlay.ts | TIPS | 教程遮罩 |
| Toast | Toast.ts | TIPS | Toast提示 |

**预制体创建步骤**:
1. 在Cocos Creator中，右键点击 `assets/prefabs/ui/` 目录
2. 选择 "创建" -> "Node" 创建空节点
3. 将节点重命名为预制体名称
4. 将对应的组件脚本拖拽到节点上
5. 设置组件属性和添加子节点
6. 将节点拖拽到 `assets/prefabs/ui/` 目录下生成预制体

### 2. 绑定组件属性

在Cocos Creator的属性检查器中，设置预制体的属性引用：
- 绑定按钮点击事件
- 设置标签引用
- 配置滚动视图

### 3. 替换美术资源

将占位图替换为实际资源：
- UI背景图放在 `assets/resources/ui/backgrounds/`
- 图标资源放在 `assets/resources/ui/icons/`
- 按钮资源放在 `assets/resources/ui/buttons/`

### 4. 配置微信小游戏

修改 `settings/v2/packages/builder.json` 设置微信appid

## 注意事项

- 所有UI资源放在 `assets/resources/ui/` 下，支持动态加载
- 使用 `localStorage` 进行本地存储
- 微信API通过 `WechatAdapter` 统一封装
- 战斗AI自动执行，玩家通过技能干预

## 参考资源

- [Cocos Creator 3.8 文档](https://docs.cocos.com/creator/3.8/)
- [微信小游戏开发指南](https://developers.weixin.qq.com/minigame/dev/guide/)
- [六边形网格算法](https://www.redblobgames.com/grids/hexagons/)