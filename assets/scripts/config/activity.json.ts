/**
 * 活动配置数据
 * 包含各类活动配置
 * 遵循阿里巴巴开发者手册规范
 */

import {
    ActivityConfig,
    ActivityType,
    ActivityPeriodType,
    TaskProgressType
} from './ActivityTypes';

/**
 * 获取当前时间戳（用于活动时间计算）
 */
function getTimestamp(days: number = 0, hours: number = 0): number {
    const now = Date.now();
    return now + days * 24 * 60 * 60 * 1000 + hours * 60 * 60 * 1000;
}

/**
 * 示例活动配置
 * 注意：实际项目中应该从服务器获取活动时间
 */
export const activityConfigs: ActivityConfig[] = [
    // 每日签到活动
    {
        activityId: 'daily_signin',
        type: ActivityType.ACCUMULATED_SIGNIN,
        name: '每日签到',
        description: '每日登录游戏签到，累计签到可获得丰厚奖励！',
        icon: 'activity_signin',
        startTime: getTimestamp(-30), // 30天前开始
        endTime: getTimestamp(365), // 365天后结束
        previewTime: 0,
        tasks: [
            {
                taskId: 'signin_1',
                name: '签到1天',
                description: '累计签到1天',
                condition: { type: 'signin_count', target: 1 },
                rewards: [
                    { type: 'resource', itemId: 'gold', amount: 1000 },
                    { type: 'resource', itemId: 'stamina', amount: 20 }
                ],
                weight: 1,
                progressType: TaskProgressType.ACCUMULATED
            },
            {
                taskId: 'signin_3',
                name: '签到3天',
                description: '累计签到3天',
                condition: { type: 'signin_count', target: 3 },
                rewards: [
                    { type: 'resource', itemId: 'gold', amount: 3000 },
                    { type: 'resource', itemId: 'gems', amount: 30 }
                ],
                weight: 2,
                progressType: TaskProgressType.ACCUMULATED
            },
            {
                taskId: 'signin_7',
                name: '签到7天',
                description: '累计签到7天',
                condition: { type: 'signin_count', target: 7 },
                rewards: [
                    { type: 'resource', itemId: 'gold', amount: 7000 },
                    { type: 'resource', itemId: 'gems', amount: 100 },
                    { type: 'item', itemId: 'hero_shard_random', amount: 5 }
                ],
                weight: 3,
                progressType: TaskProgressType.ACCUMULATED
            }
        ],
        maxProgress: 7,
        periodType: ActivityPeriodType.WEEKLY,
        repeatable: true,
        resetTime: '0 0 * * 1' // 每周一重置
    },

    // 限时战斗活动
    {
        activityId: 'limited_battle',
        type: ActivityType.LIMITED_DUNGEON,
        name: '限时战斗',
        description: '挑战特殊副本，获得稀有奖励！',
        icon: 'activity_battle',
        startTime: getTimestamp(-1), // 1天前开始
        endTime: getTimestamp(6), // 6天后结束
        previewTime: 24 * 60 * 60, // 提前24小时预告
        tasks: [
            {
                taskId: 'battle_3',
                name: '完成3次挑战',
                description: '在限时副本中完成3次挑战',
                condition: { type: 'limited_battle_count', target: 3 },
                rewards: [
                    { type: 'resource', itemId: 'gold', amount: 5000 }
                ],
                weight: 1,
                progressType: TaskProgressType.ACCUMULATED
            },
            {
                taskId: 'battle_10',
                name: '完成10次挑战',
                description: '在限时副本中完成10次挑战',
                condition: { type: 'limited_battle_count', target: 10 },
                rewards: [
                    { type: 'resource', itemId: 'gold', amount: 15000 },
                    { type: 'resource', itemId: 'gems', amount: 50 }
                ],
                weight: 2,
                progressType: TaskProgressType.ACCUMULATED
            },
            {
                taskId: 'battle_boss',
                name: '击败BOSS',
                description: '在限时副本中击败BOSS',
                condition: { type: 'limited_battle_boss', target: 1 },
                rewards: [
                    { type: 'item', itemId: 'hero_shard_epic', amount: 10 }
                ],
                weight: 3,
                progressType: TaskProgressType.SINGLE
            }
        ],
        maxProgress: 10,
        levelRequired: 10
    },

    // 充值活动
    {
        activityId: 'recharge_bonus',
        type: ActivityType.RECHARGE,
        name: '充值返利',
        description: '充值即可获得额外奖励！',
        icon: 'activity_recharge',
        startTime: getTimestamp(-2),
        endTime: getTimestamp(5),
        previewTime: 12 * 60 * 60, // 提前12小时预告
        tasks: [
            {
                taskId: 'recharge_6',
                name: '充值6元',
                description: '单笔充值6元',
                condition: { type: 'single_recharge', target: 6 },
                rewards: [
                    { type: 'resource', itemId: 'gems', amount: 60 },
                    { type: 'item', itemId: 'hero_shard_rare', amount: 5 }
                ],
                weight: 1,
                progressType: TaskProgressType.SINGLE
            },
            {
                taskId: 'recharge_30',
                name: '充值30元',
                description: '单笔充值30元',
                condition: { type: 'single_recharge', target: 30 },
                rewards: [
                    { type: 'resource', itemId: 'gems', amount: 300 },
                    { type: 'item', itemId: 'hero_shard_epic', amount: 10 }
                ],
                weight: 2,
                progressType: TaskProgressType.SINGLE
            },
            {
                taskId: 'recharge_total_100',
                name: '累计充值100元',
                description: '活动期间累计充值100元',
                condition: { type: 'total_recharge', target: 100 },
                rewards: [
                    { type: 'resource', itemId: 'gems', amount: 1000 },
                    { type: 'item', itemId: 'hero_shard_legend', amount: 5 }
                ],
                weight: 3,
                progressType: TaskProgressType.ACCUMULATED
            }
        ],
        vipRequired: 1
    },

    // 消费活动
    {
        activityId: 'consume_bonus',
        type: ActivityType.CONSUME,
        name: '消费返利',
        description: '消费钻石即可获得额外奖励！',
        icon: 'activity_consume',
        startTime: getTimestamp(-2),
        endTime: getTimestamp(5),
        previewTime: 12 * 60 * 60,
        tasks: [
            {
                taskId: 'consume_100',
                name: '消费100钻石',
                description: '累计消费100钻石',
                condition: { type: 'total_consume', target: 100 },
                rewards: [
                    { type: 'resource', itemId: 'gold', amount: 10000 }
                ],
                weight: 1,
                progressType: TaskProgressType.ACCUMULATED
            },
            {
                taskId: 'consume_500',
                name: '消费500钻石',
                description: '累计消费500钻石',
                condition: { type: 'total_consume', target: 500 },
                rewards: [
                    { type: 'resource', itemId: 'gold', amount: 50000 },
                    { type: 'item', itemId: 'hero_shard_rare', amount: 10 }
                ],
                weight: 2,
                progressType: TaskProgressType.ACCUMULATED
            },
            {
                taskId: 'consume_1000',
                name: '消费1000钻石',
                description: '累计消费1000钻石',
                condition: { type: 'total_consume', target: 1000 },
                rewards: [
                    { type: 'resource', itemId: 'gold', amount: 100000 },
                    { type: 'item', itemId: 'hero_shard_epic', amount: 10 }
                ],
                weight: 3,
                progressType: TaskProgressType.ACCUMULATED
            }
        ]
    },

    // 节日活动 - 春节
    {
        activityId: 'spring_festival',
        type: ActivityType.FESTIVAL,
        name: '春节庆典',
        description: '新春佳节，豪礼相送！',
        icon: 'activity_spring_festival',
        startTime: getTimestamp(0), // 根据实际春节日期调整
        endTime: getTimestamp(7),
        previewTime: 3 * 24 * 60 * 60, // 提前3天预告
        tasks: [
            {
                taskId: 'spring_signin',
                name: '春节签到',
                description: '春节期间每日签到',
                condition: { type: 'spring_signin_count', target: 7 },
                rewards: [
                    { type: 'resource', itemId: 'gems', amount: 777 }
                ],
                weight: 1,
                progressType: TaskProgressType.ACCUMULATED
            },
            {
                taskId: 'spring_share',
                name: '分享祝福',
                description: '分享游戏给好友',
                condition: { type: 'spring_share', target: 1 },
                rewards: [
                    { type: 'resource', itemId: 'gems', amount: 100 }
                ],
                weight: 2,
                progressType: TaskProgressType.SINGLE
            }
        ]
    }
];

/**
 * 根据活动ID获取活动配置
 */
export function getActivityById(activityId: string): ActivityConfig | undefined {
    return activityConfigs.find(a => a.activityId === activityId);
}

/**
 * 获取指定类型的活动列表
 */
export function getActivitiesByType(type: ActivityType): ActivityConfig[] {
    return activityConfigs.filter(a => a.type === type);
}

/**
 * 获取所有活动配置
 */
export function getAllActivities(): ActivityConfig[] {
    return activityConfigs;
}