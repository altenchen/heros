/**
 * 随机事件配置
 */

import {
    RandomEventType,
    EventRarity,
    EventTriggerScene,
    RandomEventConfig
} from '../config/RandomEventTypes';

/**
 * 随机事件配置列表
 */
export const RANDOM_EVENT_CONFIGS: RandomEventConfig[] = [
    // ==================== 发现宝物事件 ====================
    {
        id: 'event_treasure_chest',
        name: '神秘宝箱',
        description: '你在路边发现了一个神秘的宝箱，看起来里面藏着珍贵的东西。',
        type: RandomEventType.TREASURE_FOUND,
        rarity: EventRarity.COMMON,
        triggerScene: EventTriggerScene.TOWN,
        weight: 100,
        cooldown: 3600, // 1小时
        maxTriggers: 0,
        icon: 'icon_chest',
        options: [
            {
                id: 'open',
                text: '打开宝箱',
                effects: [
                    { type: 'add_resource', targetId: 'gold', amount: 500 }
                ]
            },
            {
                id: 'careful_open',
                text: '小心打开',
                description: '检查是否有陷阱',
                effects: [
                    { type: 'add_resource', targetId: 'gold', amount: 300 },
                    { type: 'add_item', targetId: 'item_treasure_map', amount: 1 }
                ]
            },
            {
                id: 'ignore',
                text: '忽略',
                effects: [
                    { type: 'nothing' }
                ]
            }
        ],
        skippable: true,
        autoCloseTime: 0
    },
    {
        id: 'event_gold_mine',
        name: '废弃金矿',
        description: '你发现了一座废弃的金矿，似乎还有一些金子可以开采。',
        type: RandomEventType.RESOURCE_FOUND,
        rarity: EventRarity.RARE,
        triggerScene: EventTriggerScene.TOWN,
        weight: 50,
        cooldown: 7200, // 2小时
        maxTriggers: 0,
        icon: 'icon_gold_mine',
        options: [
            {
                id: 'mine',
                text: '开采金矿',
                effects: [
                    { type: 'add_resource', targetId: 'gold', amount: 2000 }
                ]
            },
            {
                id: 'search',
                text: '仔细搜索',
                description: '花费更多时间寻找宝藏',
                effects: [
                    { type: 'add_resource', targetId: 'gold', amount: 1500 },
                    { type: 'add_item', targetId: 'item_gem', amount: 1 }
                ]
            },
            {
                id: 'leave',
                text: '离开',
                effects: [
                    { type: 'nothing' }
                ]
            }
        ],
        skippable: true,
        autoCloseTime: 0
    },
    {
        id: 'event_gems_deposit',
        name: '宝石矿脉',
        description: '你发现了一处闪闪发光的宝石矿脉！',
        type: RandomEventType.RESOURCE_FOUND,
        rarity: EventRarity.EPIC,
        triggerScene: EventTriggerScene.TOWN,
        weight: 30,
        cooldown: 14400, // 4小时
        maxTriggers: 0,
        icon: 'icon_gems',
        options: [
            {
                id: 'collect',
                text: '收集宝石',
                effects: [
                    { type: 'add_resource', targetId: 'gems', amount: 50 }
                ]
            },
            {
                id: 'trade',
                text: '与商人交易',
                description: '用宝石换取其他资源',
                effects: [
                    { type: 'add_resource', targetId: 'gold', amount: 5000 },
                    { type: 'add_resource', targetId: 'gems', amount: 20 }
                ]
            }
        ],
        skippable: true,
        autoCloseTime: 0
    },

    // ==================== 遭遇敌人事件 ====================
    {
        id: 'event_bandit_ambush',
        name: '强盗伏击',
        description: '一群强盗突然出现，挡住了你的去路！',
        type: RandomEventType.ENEMY_ENCOUNTER,
        rarity: EventRarity.COMMON,
        triggerScene: EventTriggerScene.EXPLORE,
        weight: 80,
        cooldown: 1800, // 30分钟
        maxTriggers: 0,
        icon: 'icon_bandit',
        options: [
            {
                id: 'fight',
                text: '迎战',
                effects: [
                    { type: 'trigger_battle', targetId: 'battle_bandit' }
                ]
            },
            {
                id: 'pay',
                text: '交出财物',
                description: '损失500金币',
                requirements: [
                    { type: 'resource', id: 'gold', amount: 500 }
                ],
                effects: [
                    { type: 'remove_resource', targetId: 'gold', amount: 500 }
                ]
            },
            {
                id: 'flee',
                text: '逃跑',
                effects: [
                    { type: 'nothing' }
                ]
            }
        ],
        skippable: false,
        autoCloseTime: 0
    },
    {
        id: 'event_mysterious_wanderer',
        name: '神秘流浪者',
        description: '一位神秘的流浪者向你走来，他似乎想要与你交易。',
        type: RandomEventType.MYSTERIOUS_MERCHANT,
        rarity: EventRarity.RARE,
        triggerScene: EventTriggerScene.TOWN,
        weight: 40,
        cooldown: 5400, // 1.5小时
        maxTriggers: 0,
        icon: 'icon_merchant',
        options: [
            {
                id: 'buy_potion',
                text: '购买药水',
                description: '花费100金币',
                requirements: [
                    { type: 'resource', id: 'gold', amount: 100 }
                ],
                effects: [
                    { type: 'remove_resource', targetId: 'gold', amount: 100 },
                    { type: 'add_item', targetId: 'item_potion_hp', amount: 3 }
                ]
            },
            {
                id: 'buy_artifact',
                text: '购买神秘物品',
                description: '花费500金币，可能获得稀有物品',
                requirements: [
                    { type: 'resource', id: 'gold', amount: 500 }
                ],
                effects: [
                    { type: 'remove_resource', targetId: 'gold', amount: 500 },
                    { type: 'add_item', targetId: 'item_artifact_random', amount: 1 }
                ]
            },
            {
                id: 'ignore',
                text: '无视',
                effects: [
                    { type: 'nothing' }
                ]
            }
        ],
        skippable: true,
        autoCloseTime: 0
    },

    // ==================== 幸运事件 ====================
    {
        id: 'event_lucky_day',
        name: '幸运日',
        description: '今天你的运气特别好，所有事情都顺风顺水！',
        type: RandomEventType.LUCKY_EVENT,
        rarity: EventRarity.RARE,
        triggerScene: EventTriggerScene.ANY,
        weight: 30,
        cooldown: 10800, // 3小时
        maxTriggers: 0,
        icon: 'icon_lucky',
        options: [
            {
                id: 'accept',
                text: '接受祝福',
                effects: [
                    { type: 'add_resource', targetId: 'gold', amount: 1000 },
                    { type: 'add_resource', targetId: 'gems', amount: 10 },
                    { type: 'buff', targetId: 'buff_lucky', extra: { duration: 3600 } }
                ]
            }
        ],
        skippable: true,
        autoCloseTime: 30
    },
    {
        id: 'event_fountain_of_fortune',
        name: '幸运之泉',
        description: '你发现了一眼闪闪发光的泉水，传说喝下它能带来好运。',
        type: RandomEventType.LUCKY_EVENT,
        rarity: EventRarity.EPIC,
        triggerScene: EventTriggerScene.EXPLORE,
        weight: 20,
        cooldown: 21600, // 6小时
        maxTriggers: 0,
        icon: 'icon_fountain',
        options: [
            {
                id: 'drink',
                text: '喝下泉水',
                effects: [
                    { type: 'buff', targetId: 'buff_luck_24h', extra: { duration: 86400 } },
                    { type: 'add_resource', targetId: 'gems', amount: 30 }
                ]
            },
            {
                id: 'collect',
                text: '收集泉水',
                effects: [
                    { type: 'add_item', targetId: 'item_fortune_water', amount: 1 }
                ]
            },
            {
                id: 'leave',
                text: '离开',
                effects: [
                    { type: 'nothing' }
                ]
            }
        ],
        skippable: true,
        autoCloseTime: 0
    },

    // ==================== 不幸事件 ====================
    {
        id: 'event_storm',
        name: '暴风雨',
        description: '一场突如其来的暴风雨袭击了你的领地！',
        type: RandomEventType.UNLUCKY_EVENT,
        rarity: EventRarity.COMMON,
        triggerScene: EventTriggerScene.TOWN,
        weight: 60,
        cooldown: 3600, // 1小时
        maxTriggers: 0,
        icon: 'icon_storm',
        options: [
            {
                id: 'endure',
                text: '忍受风暴',
                effects: [
                    { type: 'remove_resource', targetId: 'gold', amount: 200 }
                ]
            },
            {
                id: 'protect',
                text: '保护财产',
                description: '花费钻石避免损失',
                requirements: [
                    { type: 'resource', id: 'gems', amount: 20 }
                ],
                effects: [
                    { type: 'remove_resource', targetId: 'gems', amount: 20 }
                ]
            }
        ],
        skippable: false,
        autoCloseTime: 0
    },
    {
        id: 'event_thief',
        name: '小偷光顾',
        description: '一个小偷偷走了你的一些资源！',
        type: RandomEventType.UNLUCKY_EVENT,
        rarity: EventRarity.COMMON,
        triggerScene: EventTriggerScene.TOWN,
        weight: 70,
        cooldown: 2700, // 45分钟
        maxTriggers: 0,
        icon: 'icon_thief',
        options: [
            {
                id: 'chase',
                text: '追赶小偷',
                effects: [
                    { type: 'remove_resource', targetId: 'gold', amount: 100 },
                    { type: 'add_item', targetId: 'item_thief_bag', amount: 1 }
                ]
            },
            {
                id: 'accept',
                text: '认倒霉',
                effects: [
                    { type: 'remove_resource', targetId: 'gold', amount: 300 }
                ]
            }
        ],
        skippable: false,
        autoCloseTime: 0
    },

    // ==================== 英雄事件 ====================
    {
        id: 'event_hero_visit',
        name: '英雄来访',
        description: '一位英雄听闻你的名声，前来投奔！',
        type: RandomEventType.HERO_EVENT,
        rarity: EventRarity.EPIC,
        triggerScene: EventTriggerScene.TOWN,
        weight: 15,
        cooldown: 86400, // 24小时
        maxTriggers: 0,
        icon: 'icon_hero',
        options: [
            {
                id: 'accept',
                text: '欢迎加入',
                effects: [
                    { type: 'add_item', targetId: 'hero_shard_random', amount: 10 }
                ]
            },
            {
                id: 'generous',
                text: '慷慨接待',
                description: '花费500金币获得更多好感',
                requirements: [
                    { type: 'resource', id: 'gold', amount: 500 }
                ],
                effects: [
                    { type: 'remove_resource', targetId: 'gold', amount: 500 },
                    { type: 'add_item', targetId: 'hero_shard_random', amount: 20 }
                ]
            },
            {
                id: 'decline',
                text: '婉拒',
                effects: [
                    { type: 'add_resource', targetId: 'gold', amount: 200 }
                ]
            }
        ],
        skippable: true,
        autoCloseTime: 0
    },

    // ==================== 建筑事件 ====================
    {
        id: 'event_building_boost',
        name: '建筑灵感',
        description: '你的建筑师们获得了新的灵感，所有建造速度提升！',
        type: RandomEventType.BUILDING_EVENT,
        rarity: EventRarity.RARE,
        triggerScene: EventTriggerScene.TOWN,
        weight: 35,
        cooldown: 7200, // 2小时
        maxTriggers: 0,
        icon: 'icon_building',
        options: [
            {
                id: 'accept',
                text: '开始建造',
                effects: [
                    { type: 'buff', targetId: 'buff_build_speed', extra: { duration: 7200, value: 0.5 } }
                ]
            }
        ],
        skippable: true,
        autoCloseTime: 30
    },

    // ==================== 特殊事件 ====================
    {
        id: 'event_dragon_treasure',
        name: '巨龙的宝藏',
        description: '传说中巨龙的宝藏出现了！这是一个千载难逢的机会。',
        type: RandomEventType.SPECIAL_EVENT,
        rarity: EventRarity.LEGENDARY,
        triggerScene: EventTriggerScene.TOWN,
        weight: 5,
        cooldown: 172800, // 48小时
        maxTriggers: 0,
        icon: 'icon_dragon',
        options: [
            {
                id: 'explore',
                text: '探索宝藏',
                effects: [
                    { type: 'add_resource', targetId: 'gold', amount: 10000 },
                    { type: 'add_resource', targetId: 'gems', amount: 100 },
                    { type: 'add_item', targetId: 'artifact_legendary_random', amount: 1 }
                ]
            },
            {
                id: 'cautious',
                text: '谨慎行动',
                description: '减少风险，但也减少收益',
                effects: [
                    { type: 'add_resource', targetId: 'gold', amount: 5000 },
                    { type: 'add_resource', targetId: 'gems', amount: 50 },
                    { type: 'add_item', targetId: 'artifact_epic_random', amount: 1 }
                ]
            }
        ],
        skippable: true,
        autoCloseTime: 0
    },
    {
        id: 'event_ancient_temple',
        name: '远古神殿',
        description: '你发现了一座远古神殿，里面可能藏着强大的神器。',
        type: RandomEventType.SPECIAL_EVENT,
        rarity: EventRarity.LEGENDARY,
        triggerScene: EventTriggerScene.EXPLORE,
        weight: 5,
        cooldown: 172800, // 48小时
        maxTriggers: 0,
        icon: 'icon_temple',
        options: [
            {
                id: 'enter',
                text: '进入神殿',
                effects: [
                    { type: 'trigger_battle', targetId: 'battle_temple_guardian' }
                ]
            },
            {
                id: 'ritual',
                text: '举行仪式',
                description: '献祭资源获得祝福',
                requirements: [
                    { type: 'resource', id: 'gems', amount: 50 }
                ],
                effects: [
                    { type: 'remove_resource', targetId: 'gems', amount: 50 },
                    { type: 'buff', targetId: 'buff_divine_blessing', extra: { duration: 86400 } }
                ]
            },
            {
                id: 'leave',
                text: '离开',
                effects: [
                    { type: 'nothing' }
                ]
            }
        ],
        skippable: true,
        autoCloseTime: 0
    }
];

/**
 * 获取事件配置
 */
export function getRandomEventConfig(id: string): RandomEventConfig | undefined {
    return RANDOM_EVENT_CONFIGS.find(e => e.id === id);
}

/**
 * 按类型获取事件配置
 */
export function getRandomEventsByType(type: RandomEventType): RandomEventConfig[] {
    return RANDOM_EVENT_CONFIGS.filter(e => e.type === type);
}

/**
 * 按稀有度获取事件配置
 */
export function getRandomEventsByRarity(rarity: EventRarity): RandomEventConfig[] {
    return RANDOM_EVENT_CONFIGS.filter(e => e.rarity === rarity);
}

/**
 * 按触发场景获取事件配置
 */
export function getRandomEventsByScene(scene: EventTriggerScene): RandomEventConfig[] {
    return RANDOM_EVENT_CONFIGS.filter(e =>
        e.triggerScene === scene || e.triggerScene === EventTriggerScene.ANY
    );
}