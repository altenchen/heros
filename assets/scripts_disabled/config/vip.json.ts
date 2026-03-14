/**
 * VIP配置数据
 * 定义VIP等级、充值档位、月卡、成长基金等配置
 * 遵循阿里巴巴开发者手册规范
 */

import {
    VIPLevelConfig,
    PaymentProductConfig,
    MonthlyCardConfig,
    GrowthFundConfig,
    VIPPrivilegeType,
    PaymentType
} from './VIPTypes';

/**
 * VIP等级配置 (16级)
 */
export const vipLevels: VIPLevelConfig[] = [
    {
        level: 1,
        requiredExp: 100,
        name: 'VIP 1',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 5, description: '资源产出+5%' },
            { type: VIPPrivilegeType.FREE_STAMINA, value: 20, description: '每日领取20体力' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 10000 },
            { type: 'resource', itemId: 'gems', amount: 50 }
        ]
    },
    {
        level: 2,
        requiredExp: 500,
        name: 'VIP 2',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 10, description: '资源产出+10%' },
            { type: VIPPrivilegeType.EXTRA_PURCHASE, value: 1, description: '商店限购+1' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 20000 },
            { type: 'resource', itemId: 'gems', amount: 100 }
        ]
    },
    {
        level: 3,
        requiredExp: 1500,
        name: 'VIP 3',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 15, description: '资源产出+15%' },
            { type: VIPPrivilegeType.EXP_BONUS, value: 10, description: '经验+10%' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 30000 },
            { type: 'resource', itemId: 'gems', amount: 150 }
        ]
    },
    {
        level: 4,
        requiredExp: 4000,
        name: 'VIP 4',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 20, description: '资源产出+20%' },
            { type: VIPPrivilegeType.BUILD_SPEEDUP, value: 10, description: '建造加速10%' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 50000 },
            { type: 'resource', itemId: 'gems', amount: 200 }
        ]
    },
    {
        level: 5,
        requiredExp: 10000,
        name: 'VIP 5',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 25, description: '资源产出+25%' },
            { type: VIPPrivilegeType.SIGNIN_BONUS, value: 20, description: '签到奖励+20%' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 80000 },
            { type: 'resource', itemId: 'gems', amount: 300 }
        ]
    },
    {
        level: 6,
        requiredExp: 25000,
        name: 'VIP 6',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 30, description: '资源产出+30%' },
            { type: VIPPrivilegeType.VIP_SHOP, value: 1, description: '解锁VIP商店' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 100000 },
            { type: 'resource', itemId: 'gems', amount: 500 }
        ]
    },
    {
        level: 7,
        requiredExp: 50000,
        name: 'VIP 7',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 35, description: '资源产出+35%' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 150000 },
            { type: 'resource', itemId: 'gems', amount: 700 }
        ]
    },
    {
        level: 8,
        requiredExp: 100000,
        name: 'VIP 8',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 40, description: '资源产出+40%' },
            { type: VIPPrivilegeType.EXCLUSIVE_SKIN, value: 1, description: '专属皮肤' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 200000 },
            { type: 'resource', itemId: 'gems', amount: 1000 }
        ]
    },
    {
        level: 9,
        requiredExp: 200000,
        name: 'VIP 9',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 50, description: '资源产出+50%' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 300000 },
            { type: 'resource', itemId: 'gems', amount: 1500 }
        ]
    },
    {
        level: 10,
        requiredExp: 500000,
        name: 'VIP 10',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 60, description: '资源产出+60%' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 500000 },
            { type: 'resource', itemId: 'gems', amount: 2000 }
        ]
    },
    {
        level: 11,
        requiredExp: 1000000,
        name: 'VIP 11',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 70, description: '资源产出+70%' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 800000 },
            { type: 'resource', itemId: 'gems', amount: 3000 }
        ]
    },
    {
        level: 12,
        requiredExp: 2000000,
        name: 'VIP 12',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 80, description: '资源产出+80%' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 1000000 },
            { type: 'resource', itemId: 'gems', amount: 5000 }
        ]
    },
    {
        level: 13,
        requiredExp: 5000000,
        name: 'VIP 13',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 90, description: '资源产出+90%' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 2000000 },
            { type: 'resource', itemId: 'gems', amount: 8000 }
        ]
    },
    {
        level: 14,
        requiredExp: 10000000,
        name: 'VIP 14',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 100, description: '资源产出+100%' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 3000000 },
            { type: 'resource', itemId: 'gems', amount: 10000 }
        ]
    },
    {
        level: 15,
        requiredExp: 20000000,
        name: 'VIP 15',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 120, description: '资源产出+120%' },
            { type: VIPPrivilegeType.EXP_BONUS, value: 100, description: '经验+100%' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 5000000 },
            { type: 'resource', itemId: 'gems', amount: 15000 }
        ]
    },
    {
        level: 16,
        requiredExp: 50000000,
        name: 'VIP 16',
        privileges: [
            { type: VIPPrivilegeType.RESOURCE_BONUS, value: 150, description: '资源产出+150%' },
            { type: VIPPrivilegeType.EXP_BONUS, value: 150, description: '经验+150%' },
            { type: VIPPrivilegeType.FREE_GACHA, value: 1, description: '每日免费抽卡' }
        ],
        rewards: [
            { type: 'resource', itemId: 'gold', amount: 10000000 },
            { type: 'resource', itemId: 'gems', amount: 20000 }
        ]
    }
];

/**
 * 充值产品配置 (8个档位)
 */
export const paymentProducts: PaymentProductConfig[] = [
    {
        productId: 'gems_60',
        name: '60钻石',
        gems: 60,
        bonusGems: 0,
        price: 6,
        type: PaymentType.DIAMONDS,
        firstDouble: true,
        icon: 'payment/gems_60'
    },
    {
        productId: 'gems_300',
        name: '300钻石',
        gems: 300,
        bonusGems: 30,
        price: 30,
        type: PaymentType.DIAMONDS,
        firstDouble: true,
        icon: 'payment/gems_300'
    },
    {
        productId: 'gems_680',
        name: '680钻石',
        gems: 680,
        bonusGems: 68,
        price: 68,
        type: PaymentType.DIAMONDS,
        firstDouble: true,
        isHot: true,
        icon: 'payment/gems_680'
    },
    {
        productId: 'gems_1280',
        name: '1280钻石',
        gems: 1280,
        bonusGems: 200,
        price: 128,
        type: PaymentType.DIAMONDS,
        firstDouble: true,
        icon: 'payment/gems_1280'
    },
    {
        productId: 'gems_3280',
        name: '3280钻石',
        gems: 3280,
        bonusGems: 600,
        price: 328,
        type: PaymentType.DIAMONDS,
        firstDouble: true,
        icon: 'payment/gems_3280'
    },
    {
        productId: 'gems_6480',
        name: '6480钻石',
        gems: 6480,
        bonusGems: 1500,
        price: 648,
        type: PaymentType.DIAMONDS,
        firstDouble: true,
        icon: 'payment/gems_6480'
    },
    {
        productId: 'gems_19800',
        name: '19800钻石',
        gems: 19800,
        bonusGems: 5000,
        price: 1980,
        type: PaymentType.DIAMONDS,
        firstDouble: false,
        requiredVIP: 5,
        icon: 'payment/gems_19800'
    },
    {
        productId: 'gems_32800',
        name: '32800钻石',
        gems: 32800,
        bonusGems: 10000,
        price: 3280,
        type: PaymentType.DIAMONDS,
        firstDouble: false,
        requiredVIP: 8,
        icon: 'payment/gems_32800'
    }
];

/**
 * 月卡配置 (2种)
 */
export const monthlyCards: MonthlyCardConfig[] = [
    {
        cardId: 'monthly_card_basic',
        name: '普通月卡',
        price: 30,
        duration: 30,
        instantReward: [
            { type: 'resource', itemId: 'gems', amount: 300 }
        ],
        dailyReward: [
            { type: 'resource', itemId: 'gems', amount: 60 },
            { type: 'resource', itemId: 'gold', amount: 5000 },
            { type: 'resource', itemId: 'stamina', amount: 20 }
        ],
        icon: 'payment/monthly_card_basic'
    },
    {
        cardId: 'monthly_card_premium',
        name: '至尊月卡',
        price: 68,
        duration: 30,
        instantReward: [
            { type: 'resource', itemId: 'gems', amount: 680 },
            { type: 'item', itemId: 'shard_catherine', amount: 5 }
        ],
        dailyReward: [
            { type: 'resource', itemId: 'gems', amount: 150 },
            { type: 'resource', itemId: 'gold', amount: 10000 },
            { type: 'resource', itemId: 'stamina', amount: 50 }
        ],
        icon: 'payment/monthly_card_premium'
    }
];

/**
 * 成长基金配置 (1种)
 */
export const growthFunds: GrowthFundConfig[] = [
    {
        fundId: 'growth_fund_1',
        name: '成长基金',
        price: 98,
        totalGems: 98000,
        levelRewards: [
            { level: 10, gems: 1000 },
            { level: 20, gems: 2000 },
            { level: 30, gems: 3000 },
            { level: 40, gems: 5000 },
            { level: 50, gems: 8000 },
            { level: 60, gems: 10000 },
            { level: 70, gems: 12000 },
            { level: 80, gems: 15000 },
            { level: 90, gems: 18000 },
            { level: 100, gems: 24000 }
        ],
        icon: 'payment/growth_fund'
    }
];

/**
 * 根据等级获取VIP配置
 */
export function getVIPLevelConfig(level: number): VIPLevelConfig | undefined {
    return vipLevels.find(config => config.level === level);
}

/**
 * 根据产品ID获取充值配置
 */
export function getPaymentProductConfig(productId: string): PaymentProductConfig | undefined {
    return paymentProducts.find(config => config.productId === productId);
}

/**
 * 根据月卡ID获取配置
 */
export function getMonthlyCardConfig(cardId: string): MonthlyCardConfig | undefined {
    return monthlyCards.find(config => config.cardId === cardId);
}

/**
 * 根据基金ID获取配置
 */
export function getGrowthFundConfig(fundId: string): GrowthFundConfig | undefined {
    return growthFunds.find(config => config.fundId === fundId);
}