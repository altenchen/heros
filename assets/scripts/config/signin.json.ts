/**
 * 签到配置数据
 * 定义每月签到奖励、连续签到奖励等
 * 遵循阿里巴巴开发者手册规范
 */

import {
    SigninCycleConfig,
    SigninRewardConfig,
    RewardType,
    RewardConfig,
    SigninCycleType
} from './DailySigninTypes';

/**
 * 每月签到奖励配置
 */
export const monthlySigninRewards: SigninRewardConfig[] = [
    // 第1天
    {
        day: 1,
        rewards: [
            { type: RewardType.GOLD, amount: 1000 }
        ],
        description: '欢迎回来！'
    },
    // 第2天
    {
        day: 2,
        rewards: [
            { type: RewardType.STAMINA, amount: 20 }
        ]
    },
    // 第3天
    {
        day: 3,
        rewards: [
            { type: RewardType.GOLD, amount: 2000 }
        ]
    },
    // 第4天
    {
        day: 4,
        rewards: [
            { type: RewardType.GEMS, amount: 20 }
        ]
    },
    // 第5天
    {
        day: 5,
        rewards: [
            { type: RewardType.STAMINA, amount: 30 }
        ],
        description: '连续5天！'
    },
    // 第6天
    {
        day: 6,
        rewards: [
            { type: RewardType.GOLD, amount: 3000 }
        ]
    },
    // 第7天 - 小奖励日
    {
        day: 7,
        rewards: [
            { type: RewardType.GOLD, amount: 2000 },
            { type: RewardType.GEMS, amount: 50 }
        ],
        isSpecial: true,
        description: '周签到奖励！'
    },
    // 第8天
    {
        day: 8,
        rewards: [
            { type: RewardType.STAMINA, amount: 20 }
        ]
    },
    // 第9天
    {
        day: 9,
        rewards: [
            { type: RewardType.GOLD, amount: 2500 }
        ]
    },
    // 第10天
    {
        day: 10,
        rewards: [
            { type: RewardType.GEMS, amount: 30 }
        ]
    },
    // 第11天
    {
        day: 11,
        rewards: [
            { type: RewardType.STAMINA, amount: 30 }
        ]
    },
    // 第12天
    {
        day: 12,
        rewards: [
            { type: RewardType.GOLD, amount: 3500 }
        ]
    },
    // 第13天
    {
        day: 13,
        rewards: [
            { type: RewardType.GEMS, amount: 25 }
        ]
    },
    // 第14天 - 中奖励日
    {
        day: 14,
        rewards: [
            { type: RewardType.GOLD, amount: 3000 },
            { type: RewardType.GEMS, amount: 80 }
        ],
        isSpecial: true,
        description: '双周签到奖励！'
    },
    // 第15天
    {
        day: 15,
        rewards: [
            { type: RewardType.STAMINA, amount: 50 },
            { type: RewardType.EXP, amount: 500 }
        ],
        description: '半月达成！'
    },
    // 第16天
    {
        day: 16,
        rewards: [
            { type: RewardType.GOLD, amount: 4000 }
        ]
    },
    // 第17天
    {
        day: 17,
        rewards: [
            { type: RewardType.GEMS, amount: 35 }
        ]
    },
    // 第18天
    {
        day: 18,
        rewards: [
            { type: RewardType.STAMINA, amount: 30 }
        ]
    },
    // 第19天
    {
        day: 19,
        rewards: [
            { type: RewardType.GOLD, amount: 4500 }
        ]
    },
    // 第20天
    {
        day: 20,
        rewards: [
            { type: RewardType.GEMS, amount: 40 }
        ]
    },
    // 第21天 - 三周奖励
    {
        day: 21,
        rewards: [
            { type: RewardType.GOLD, amount: 4000 },
            { type: RewardType.GEMS, amount: 100 }
        ],
        isSpecial: true,
        description: '三周签到奖励！'
    },
    // 第22天
    {
        day: 22,
        rewards: [
            { type: RewardType.STAMINA, amount: 40 }
        ]
    },
    // 第23天
    {
        day: 23,
        rewards: [
            { type: RewardType.GOLD, amount: 5000 }
        ]
    },
    // 第24天
    {
        day: 24,
        rewards: [
            { type: RewardType.GEMS, amount: 45 }
        ]
    },
    // 第25天
    {
        day: 25,
        rewards: [
            { type: RewardType.STAMINA, amount: 50 }
        ]
    },
    // 第26天
    {
        day: 26,
        rewards: [
            { type: RewardType.GOLD, amount: 5500 }
        ]
    },
    // 第27天
    {
        day: 27,
        rewards: [
            { type: RewardType.GEMS, amount: 50 }
        ]
    },
    // 第28天 - 四周奖励
    {
        day: 28,
        rewards: [
            { type: RewardType.GOLD, amount: 5000 },
            { type: RewardType.GEMS, amount: 120 }
        ],
        isSpecial: true,
        description: '四周签到奖励！'
    },
    // 第29天
    {
        day: 29,
        rewards: [
            { type: RewardType.STAMINA, amount: 60 },
            { type: RewardType.EXP, amount: 1000 }
        ]
    },
    // 第30天 - 大奖日
    {
        day: 30,
        rewards: [
            { type: RewardType.GOLD, amount: 10000 },
            { type: RewardType.GEMS, amount: 200 },
            { type: RewardType.EXP, amount: 2000 }
        ],
        isSpecial: true,
        description: '月度全勤大奖！'
    }
];

/**
 * 连续签到额外奖励
 */
export const continuousSigninBonus: { days: number; reward: RewardConfig }[] = [
    {
        days: 3,
        reward: { type: RewardType.GOLD, amount: 500 }
    },
    {
        days: 7,
        reward: { type: RewardType.GEMS, amount: 30 }
    },
    {
        days: 14,
        reward: { type: RewardType.GEMS, amount: 80 }
    },
    {
        days: 21,
        reward: { type: RewardType.GEMS, amount: 150 }
    },
    {
        days: 30,
        reward: { type: RewardType.GEMS, amount: 300 }
    }
];

/**
 * 默认月签到周期配置
 */
export const defaultMonthlySignin: SigninCycleConfig = {
    cycleId: 'monthly_default',
    name: '月度签到',
    type: SigninCycleType.MONTHLY,
    totalDays: 30,
    rewards: monthlySigninRewards,
    continuousBonus: continuousSigninBonus,
    maxMakeupCount: 5,
    makeupCost: {
        gold: 500,
        gems: 50
    },
    isActive: true
};

/**
 * 所有签到周期配置
 */
export const signinCycles: SigninCycleConfig[] = [
    defaultMonthlySignin
];

/**
 * 根据ID获取签到周期配置
 */
export function getSigninCycleById(cycleId: string): SigninCycleConfig | undefined {
    return signinCycles.find(c => c.cycleId === cycleId);
}

/**
 * 获取激活的签到周期
 */
export function getActiveSigninCycle(): SigninCycleConfig | undefined {
    return signinCycles.find(c => c.isActive);
}

/**
 * 获取指定天数的奖励
 */
export function getRewardByDay(cycleId: string, day: number): SigninRewardConfig | undefined {
    const cycle = getSigninCycleById(cycleId);
    if (!cycle) {
        return undefined;
    }
    return cycle.rewards.find(r => r.day === day);
}

/**
 * 获取连续签到奖励
 */
export function getContinuousBonus(cycleId: string, days: number): RewardConfig | undefined {
    const cycle = getSigninCycleById(cycleId);
    if (!cycle || !cycle.continuousBonus) {
        return undefined;
    }
    const bonus = cycle.continuousBonus.find(b => b.days === days);
    return bonus?.reward;
}

/**
 * 计算补签费用
 */
export function calculateMakeupCost(cycle: SigninCycleConfig, makeupCount: number): { gold: number; gems: number } {
    const baseCost = cycle.makeupCost || { gold: 500, gems: 50 };
    const gold = baseCost.gold ?? 500;
    const gems = baseCost.gems ?? 50;

    // 补签次数越多，费用越高
    const multiplier = 1 + (makeupCount * 0.5);

    return {
        gold: Math.floor(gold * multiplier),
        gems: Math.floor(gems * multiplier)
    };
}