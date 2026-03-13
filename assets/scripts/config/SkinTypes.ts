/**
 * 皮肤系统类型定义
 * 遵循阿里巴巴开发者手册规范
 */

/**
 * 皮肤类型
 */
export enum SkinType {
    /** 英雄皮肤 */
    HERO = 'hero',
    /** 兵种皮肤 */
    UNIT = 'unit',
    /** 城镇皮肤 */
    TOWN = 'town',
    /** 战场皮肤 */
    BATTLEFIELD = 'battlefield',
    /** 头像框 */
    AVATAR_FRAME = 'avatar_frame',
    /** 聊天气泡 */
    CHAT_BUBBLE = 'chat_bubble'
}

/**
 * 皮肤品质
 */
export enum SkinQuality {
    /** 普通 */
    NORMAL = 'normal',
    /** 稀有 */
    RARE = 'rare',
    /** 史诗 */
    EPIC = 'epic',
    /** 传说 */
    LEGENDARY = 'legendary'
}

/**
 * 皮肤特效类型
 */
export enum SkinEffectType {
    /** 无特效 */
    NONE = 'none',
    /** 粒子特效 */
    PARTICLE = 'particle',
    /** 光效 */
    GLOW = 'glow',
    /** 动画 */
    ANIMATION = 'animation',
    /** 音效 */
    SOUND = 'sound'
}

/**
 * 皮肤特效配置
 */
export interface SkinEffect {
    /** 特效类型 */
    type: SkinEffectType;
    /** 特效参数 */
    params?: Record<string, any>;
    /** 特效资源路径 */
    assetPath?: string;
}

/**
 * 皮肤配置
 */
export interface SkinConfig {
    /** 皮肤ID */
    skinId: string;
    /** 皮肤名称 */
    name: string;
    /** 皮肤描述 */
    description?: string;
    /** 皮肤类型 */
    type: SkinType;
    /** 皮肤品质 */
    quality: SkinQuality;
    /** 关联对象ID（英雄ID、兵种ID等） */
    targetId: string;
    /** 图标资源路径 */
    iconPath: string;
    /** 模型/图片资源路径 */
    modelPath?: string;
    /** 特效列表 */
    effects?: SkinEffect[];
    /** 解锁条件 */
    unlockCondition?: SkinUnlockCondition;
    /** 是否默认皮肤 */
    isDefault?: boolean;
    /** 是否限时皮肤 */
    isLimited?: boolean;
    /** 过期时间（限时皮肤） */
    expireTime?: number;
    /** 排序权重 */
    sortOrder?: number;
}

/**
 * 皮肤解锁条件
 */
export interface SkinUnlockCondition {
    /** 解锁类型 */
    type: SkinUnlockType;
    /** 目标ID */
    targetId?: string;
    /** 所需数量/等级 */
    value?: number;
    /** VIP等级要求 */
    vipLevel?: number;
    /** 玩家等级要求 */
    playerLevel?: number;
}

/**
 * 皮肤解锁类型
 */
export enum SkinUnlockType {
    /** 默认解锁 */
    DEFAULT = 'default',
    /** 购买解锁 */
    PURCHASE = 'purchase',
    /** 成就解锁 */
    ACHIEVEMENT = 'achievement',
    /** 活动解锁 */
    EVENT = 'event',
    /** 赛季奖励 */
    SEASON = 'season',
    /** 英雄熟练度 */
    HERO_MASTERY = 'hero_mastery',
    /** VIP等级 */
    VIP = 'vip'
}

/**
 * 玩家皮肤数据
 */
export interface PlayerSkinData {
    /** 皮肤ID */
    skinId: string;
    /** 获得时间 */
    acquireTime: number;
    /** 过期时间（限时皮肤） */
    expireTime?: number;
    /** 是否已装备 */
    isEquipped?: boolean;
}

/**
 * 皮肤状态
 */
export enum SkinState {
    /** 未解锁 */
    LOCKED = 'locked',
    /** 已解锁 */
    UNLOCKED = 'unlocked',
    /** 已装备 */
    EQUIPPED = 'equipped',
    /** 已过期 */
    EXPIRED = 'expired'
}

/**
 * 皮肤事件类型
 */
export enum SkinEventType {
    /** 皮肤解锁 */
    SKIN_UNLOCKED = 'skin_unlocked',
    /** 皮肤装备 */
    SKIN_EQUIPPED = 'skin_equipped',
    /** 皮肤卸下 */
    SKIN_UNEQUIPPED = 'skin_unequipped',
    /** 皮肤过期 */
    SKIN_EXPIRED = 'skin_expired'
}

/**
 * 皮肤事件数据
 */
export interface SkinEventData {
    /** 皮肤ID */
    skinId: string;
    /** 皮肤类型 */
    type: SkinType;
    /** 目标ID */
    targetId?: string;
}

/**
 * 默认皮肤配置
 */
export const DEFAULT_SKINS: SkinConfig[] = [
    // 凯瑟琳英雄皮肤
    {
        skinId: 'skin_hero_catherine_default',
        name: '凯瑟琳',
        type: SkinType.HERO,
        quality: SkinQuality.NORMAL,
        targetId: 'hero_catherine',
        iconPath: 'textures/skins/hero/catherine_default',
        isDefault: true,
        sortOrder: 0
    },
    {
        skinId: 'skin_hero_catherine_golden',
        name: '黄金凯瑟琳',
        description: '凯瑟琳的黄金战甲皮肤',
        type: SkinType.HERO,
        quality: SkinQuality.LEGENDARY,
        targetId: 'hero_catherine',
        iconPath: 'textures/skins/hero/catherine_golden',
        modelPath: 'models/hero/catherine_golden',
        effects: [
            { type: SkinEffectType.GLOW, params: { color: '#FFD700', intensity: 0.8 } }
        ],
        unlockCondition: {
            type: SkinUnlockType.PURCHASE
        },
        sortOrder: 1
    },
    // 桑德罗英雄皮肤
    {
        skinId: 'skin_hero_sandro_default',
        name: '桑德罗',
        type: SkinType.HERO,
        quality: SkinQuality.NORMAL,
        targetId: 'hero_sandro',
        iconPath: 'textures/skins/hero/sandro_default',
        isDefault: true,
        sortOrder: 0
    },
    {
        skinId: 'skin_hero_sandro_dark',
        name: '暗影桑德罗',
        description: '桑德罗的暗影形态',
        type: SkinType.HERO,
        quality: SkinQuality.EPIC,
        targetId: 'hero_sandro',
        iconPath: 'textures/skins/hero/sandro_dark',
        modelPath: 'models/hero/sandro_dark',
        effects: [
            { type: SkinEffectType.PARTICLE, params: { type: 'dark_mist' } }
        ],
        unlockCondition: {
            type: SkinUnlockType.ACHIEVEMENT,
            targetId: 'necromancer_master',
            value: 1
        },
        sortOrder: 1
    },
    // 圣堂兵种皮肤
    {
        skinId: 'skin_unit_pikeman_elite',
        name: '精英枪兵',
        description: '枪兵的精英装甲',
        type: SkinType.UNIT,
        quality: SkinQuality.RARE,
        targetId: 'castle_tier1_pikeman',
        iconPath: 'textures/skins/unit/pikeman_elite',
        unlockCondition: {
            type: SkinUnlockType.PURCHASE
        },
        sortOrder: 1
    },
    {
        skinId: 'skin_unit_archer_ranger',
        name: '游侠弓箭手',
        description: '弓箭手的游侠造型',
        type: SkinType.UNIT,
        quality: SkinQuality.RARE,
        targetId: 'castle_tier2_archer',
        iconPath: 'textures/skins/unit/archer_ranger',
        unlockCondition: {
            type: SkinUnlockType.HERO_MASTERY,
            targetId: 'hero_catherine',
            value: 10
        },
        sortOrder: 1
    },
    // 主城皮肤
    {
        skinId: 'skin_town_castle_winter',
        name: '雪域城堡',
        description: '冬日主题的城堡外观',
        type: SkinType.TOWN,
        quality: SkinQuality.EPIC,
        targetId: 'town_castle',
        iconPath: 'textures/skins/town/castle_winter',
        modelPath: 'models/town/castle_winter',
        effects: [
            { type: SkinEffectType.PARTICLE, params: { type: 'snow' } }
        ],
        unlockCondition: {
            type: SkinUnlockType.EVENT,
            targetId: 'winter_festival'
        },
        sortOrder: 1
    },
    // 头像框
    {
        skinId: 'skin_frame_golden',
        name: '黄金头像框',
        type: SkinType.AVATAR_FRAME,
        quality: SkinQuality.RARE,
        targetId: 'avatar_frame',
        iconPath: 'textures/skins/frame/golden',
        effects: [
            { type: SkinEffectType.GLOW, params: { color: '#FFD700' } }
        ],
        unlockCondition: {
            type: SkinUnlockType.VIP,
            vipLevel: 5
        },
        sortOrder: 1
    },
    {
        skinId: 'skin_frame_legend',
        name: '传说头像框',
        type: SkinType.AVATAR_FRAME,
        quality: SkinQuality.LEGENDARY,
        targetId: 'avatar_frame',
        iconPath: 'textures/skins/frame/legend',
        effects: [
            { type: SkinEffectType.ANIMATION, params: { type: 'rotate', speed: 1 } },
            { type: SkinEffectType.PARTICLE, params: { type: 'star' } }
        ],
        unlockCondition: {
            type: SkinUnlockType.SEASON,
            targetId: 'season_1'
        },
        sortOrder: 2
    }
];

/**
 * 创建皮肤配置映射
 */
export function createSkinConfigMap(skins: SkinConfig[]): Map<string, SkinConfig> {
    const map = new Map<string, SkinConfig>();
    skins.forEach(skin => map.set(skin.skinId, skin));
    return map;
}