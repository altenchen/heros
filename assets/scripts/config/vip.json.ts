/**
 * VIP与充值配置数据
 * 遵循阿里巴巴开发者手册规范
 */

import {
    VIPLevelConfig,
    VIPPrivilegeType,
    PaymentProductConfig,
    PaymentType,
    MonthlyCardConfig,
    GrowthFundConfig
} from './VIPTypes';

/**
 * VIP等级配置
 */
export const vipLevelConfigs: VIPLevelConfig[] = [
    {
        level: 0,
        requiredExp: 0,
        name: '普通玩家',
        icon: 'vip/vip_0',
        privileges: []
    },
    {
        level: 1,
        requiredExp: 100,
        name: 'VIP 1',
        icon: 'vip/vip_1',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+5%', description: '金币产出增加5%', value: 5 },
            { type: VIPPrivilegeType.FREE_STAMINA, name: '每日免费体力', description: '每日领取20体力', value: 20, params: { dailyStamina: 20 } }
        ],
        levelReward: { gold: 10000, gems: 50 }
    },
    {
        level: 2,
        requiredExp: 500,
        name: 'VIP 2',
        icon: 'vip/vip_2',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+10%', description: '金币产出增加10%', value: 10 },
            { type: VIPPrivilegeType.FREE_STAMINA, name: '每日免费体力', description: '每日领取40体力', value: 40, params: { dailyStamina: 40 } },
            { type: VIPPrivilegeType.EXTRA_PURCHASE, name: '商店额外购买', description: '商店限购+1', value: 1 }
        ],
        levelReward: { gold: 20000, gems: 100 }
    },
    {
        level: 3,
        requiredExp: 1500,
        name: 'VIP 3',
        icon: 'vip/vip_3',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+15%', description: '金币产出增加15%', value: 15 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+10%', description: '经验获取增加10%', value: 10 },
            { type: VIPPrivilegeType.FREE_STAMINA, name: '每日免费体力', description: '每日领取60体力', value: 60, params: { dailyStamina: 60 } }
        ],
        levelReward: { gold: 50000, gems: 200 }
    },
    {
        level: 4,
        requiredExp: 4000,
        name: 'VIP 4',
        icon: 'vip/vip_4',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+20%', description: '金币产出增加20%', value: 20 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+15%', description: '经验获取增加15%', value: 15 },
            { type: VIPPrivilegeType.BUILD_SPEEDUP, name: '建造加速5%', description: '建造时间减少5%', value: 5 },
            { type: VIPPrivilegeType.FREE_STAMINA, name: '每日免费体力', description: '每日领取80体力', value: 80, params: { dailyStamina: 80 } }
        ],
        levelReward: { gold: 100000, gems: 500 }
    },
    {
        level: 5,
        requiredExp: 10000,
        name: 'VIP 5',
        icon: 'vip/vip_5',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+25%', description: '金币产出增加25%', value: 25 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+20%', description: '经验获取增加20%', value: 20 },
            { type: VIPPrivilegeType.BUILD_SPEEDUP, name: '建造加速10%', description: '建造时间减少10%', value: 10 },
            { type: VIPPrivilegeType.SIGNIN_BONUS, name: '签到额外奖励', description: '签到奖励+20%', value: 20 },
            { type: VIPPrivilegeType.FREE_GACHA, name: '免费抽卡', description: '每周免费抽卡1次', value: 1, params: { weeklyGacha: 1 } }
        ],
        levelReward: { gold: 200000, gems: 1000, items: [{ itemId: 'shard_catherine', count: 10 }] }
    },
    {
        level: 6,
        requiredExp: 25000,
        name: 'VIP 6',
        icon: 'vip/vip_6',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+30%', description: '金币产出增加30%', value: 30 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+25%', description: '经验获取增加25%', value: 25 },
            { type: VIPPrivilegeType.BUILD_SPEEDUP, name: '建造加速15%', description: '建造时间减少15%', value: 15 },
            { type: VIPPrivilegeType.UNLOCK_FEATURE, name: '解锁VIP商店', description: '可购买VIP专属商品', value: 1 }
        ],
        levelReward: { gold: 500000, gems: 2000 }
    },
    {
        level: 7,
        requiredExp: 50000,
        name: 'VIP 7',
        icon: 'vip/vip_7',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+35%', description: '金币产出增加35%', value: 35 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+30%', description: '经验获取增加30%', value: 30 },
            { type: VIPPrivilegeType.BUILD_SPEEDUP, name: '建造加速20%', description: '建造时间减少20%', value: 20 }
        ],
        levelReward: { gems: 5000 }
    },
    {
        level: 8,
        requiredExp: 100000,
        name: 'VIP 8',
        icon: 'vip/vip_8',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+40%', description: '金币产出增加40%', value: 40 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+35%', description: '经验获取增加35%', value: 35 },
            { type: VIPPrivilegeType.BUILD_SPEEDUP, name: '建造加速25%', description: '建造时间减少25%', value: 25 },
            { type: VIPPrivilegeType.EXCLUSIVE_SKIN, name: '专属皮肤', description: '解锁VIP专属皮肤', value: 1, params: { skinId: 'vip_skin_8' } }
        ],
        levelReward: { gems: 10000 }
    },
    {
        level: 9,
        requiredExp: 200000,
        name: 'VIP 9',
        icon: 'vip/vip_9',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+50%', description: '金币产出增加50%', value: 50 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+40%', description: '经验获取增加40%', value: 40 },
            { type: VIPPrivilegeType.BUILD_SPEEDUP, name: '建造加速30%', description: '建造时间减少30%', value: 30 }
        ],
        levelReward: { gems: 20000 }
    },
    {
        level: 10,
        requiredExp: 500000,
        name: 'VIP 10',
        icon: 'vip/vip_10',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+60%', description: '金币产出增加60%', value: 60 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+50%', description: '经验获取增加50%', value: 50 },
            { type: VIPPrivilegeType.BUILD_SPEEDUP, name: '建造加速35%', description: '建造时间减少35%', value: 35 }
        ],
        levelReward: { gems: 50000 }
    },
    {
        level: 11,
        requiredExp: 1000000,
        name: 'VIP 11',
        icon: 'vip/vip_11',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+70%', description: '金币产出增加70%', value: 70 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+60%', description: '经验获取增加60%', value: 60 }
        ],
        levelReward: { gems: 100000 }
    },
    {
        level: 12,
        requiredExp: 2000000,
        name: 'VIP 12',
        icon: 'vip/vip_12',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+80%', description: '金币产出增加80%', value: 80 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+70%', description: '经验获取增加70%', value: 70 }
        ],
        levelReward: { gems: 200000 }
    },
    {
        level: 13,
        requiredExp: 5000000,
        name: 'VIP 13',
        icon: 'vip/vip_13',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+90%', description: '金币产出增加90%', value: 90 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+80%', description: '经验获取增加80%', value: 80 }
        ],
        levelReward: { gems: 500000 }
    },
    {
        level: 14,
        requiredExp: 10000000,
        name: 'VIP 14',
        icon: 'vip/vip_14',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+100%', description: '金币产出翻倍', value: 100 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+90%', description: '经验获取增加90%', value: 90 }
        ],
        levelReward: { gems: 1000000 }
    },
    {
        level: 15,
        requiredExp: 20000000,
        name: 'VIP 15',
        icon: 'vip/vip_15',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, name: '资源产出+120%', description: '金币产出增加120%', value: 120 },
            { type: VIPPrivilegeType.EXP_BONUS, name: '经验加成+100%', description: '经验翻倍', value: 100 }
        ],
        levelReward: { gems: 2000000 }
    }
];

/**
 * 充值档位配置
 */
export const paymentProducts: PaymentProductConfig[] = [
    {
        productId: 'gems_60',
        name: '60钻石',
        type: PaymentType.SMALL,
        gems: 60,
        price: 600, // 6元
        firstDouble: true,
        sortOrder: 1
    },
    {
        productId: 'gems_300',
        name: '300钻石',
        type: PaymentType.SMALL,
        gems: 300,
        bonusGems: 30,
        price: 3000, // 30元
        firstDouble: true,
        isHot: true,
        sortOrder: 2
    },
    {
        productId: 'gems_680',
        name: '680钻石',
        type: PaymentType.MEDIUM,
        gems: 680,
        bonusGems: 68,
        price: 6800, // 68元
        firstDouble: true,
        isRecommended: true,
        sortOrder: 3
    },
    {
        productId: 'gems_1280',
        name: '1280钻石',
        type: PaymentType.MEDIUM,
        gems: 1280,
        bonusGems: 200,
        price: 12800, // 128元
        firstDouble: true,
        sortOrder: 4
    },
    {
        productId: 'gems_3280',
        name: '3280钻石',
        type: PaymentType.LARGE,
        gems: 3280,
        bonusGems: 600,
        price: 32800, // 328元
        firstDouble: true,
        isHot: true,
        sortOrder: 5
    },
    {
        productId: 'gems_6480',
        name: '6480钻石',
        type: PaymentType.LARGE,
        gems: 6480,
        bonusGems: 1500,
        price: 64800, // 648元
        firstDouble: true,
        isRecommended: true,
        sortOrder: 6
    },
    {
        productId: 'gems_19800',
        name: '19800钻石',
        type: PaymentType.LARGE,
        gems: 19800,
        bonusGems: 5000,
        price: 198000, // 1980元
        firstDouble: false,
        vipRequired: 5,
        sortOrder: 7
    },
    {
        productId: 'gems_32800',
        name: '32800钻石',
        type: PaymentType.LARGE,
        gems: 32800,
        bonusGems: 10000,
        price: 328000, // 3280元
        firstDouble: false,
        vipRequired: 8,
        sortOrder: 8
    }
];

/**
 * 月卡配置
 */
export const monthlyCardConfigs: MonthlyCardConfig[] = [
    {
        cardId: 'monthly_card_basic',
        name: '普通月卡',
        description: '30天内每日领取奖励',
        price: 3000, // 30元
        duration: 30,
        instantReward: {
            gems: 300
        },
        dailyReward: {
            gems: 60,
            gold: 5000,
            stamina: 20
        },
        vipExp: 300,
        icon: 'items/monthly_card_basic'
    },
    {
        cardId: 'monthly_card_premium',
        name: '至尊月卡',
        description: '30天内每日领取丰厚奖励',
        price: 6800, // 68元
        duration: 30,
        instantReward: {
            gems: 680,
            gold: 50000,
            items: [{ itemId: 'shard_catherine', count: 10 }]
        },
        dailyReward: {
            gems: 150,
            gold: 10000,
            stamina: 50
        },
        vipExp: 680,
        icon: 'items/monthly_card_premium'
    }
];

/**
 * 成长基金配置
 */
export const growthFundConfigs: GrowthFundConfig[] = [
    {
        fundId: 'growth_fund_1',
        name: '成长基金',
        description: '购买后可领取丰厚等级奖励，最高返还10倍钻石',
        price: 9800, // 98元
        totalReturn: 98000,
        returnRate: 10,
        levelRewards: [
            { level: 10, reward: { gems: 500 } },
            { level: 15, reward: { gems: 800 } },
            { level: 20, reward: { gems: 1200 } },
            { level: 25, reward: { gems: 1500 } },
            { level: 30, reward: { gems: 2000 } },
            { level: 35, reward: { gems: 2500 } },
            { level: 40, reward: { gems: 3000 } },
            { level: 45, reward: { gems: 3500 } },
            { level: 50, reward: { gems: 5000 } },
            { level: 55, reward: { gems: 8000 } },
            { level: 60, reward: { gems: 10000 } },
            { level: 65, reward: { gems: 15000 } },
            { level: 70, reward: { gems: 20000 } },
            { level: 80, reward: { gems: 22000 } }
        ]
    }
];

/**
 * 获取VIP等级配置
 */
export function getVIPLevelConfig(level: number): VIPLevelConfig | undefined {
    return vipLevelConfigs.find(c => c.level === level);
}

/**
 * 获取充值产品配置
 */
export function getPaymentProduct(productId: string): PaymentProductConfig | undefined {
    return paymentProducts.find(p => p.productId === productId);
}

/**
 * 获取月卡配置
 */
export function getMonthlyCardConfig(cardId: string): MonthlyCardConfig | undefined {
    return monthlyCardConfigs.find(c => c.cardId === cardId);
}

/**
 * 获取成长基金配置
 */
export function getGrowthFundConfig(fundId: string): GrowthFundConfig | undefined {
    return growthFundConfigs.find(c => c.fundId === fundId);
}