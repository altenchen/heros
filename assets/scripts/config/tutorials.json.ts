/**
 * 新手引导配置数据
 * 定义所有教程步骤和触发条件
 * 遵循阿里巴巴开发者手册规范
 */

import {
    TutorialConfig,
    TutorialType,
    TriggerType,
    StepType,
    HighlightShape,
    DialogPosition,
    WaitActionType
} from './TutorialTypes';

/**
 * 教程配置列表
 */
export const tutorials: TutorialConfig[] = [
    // ==================== 新手引导 ====================
    {
        tutorialId: 'tutorial_welcome',
        name: '欢迎来到英雄无敌Ⅲ：传承',
        description: '初次进入游戏的基础引导',
        type: TutorialType.MANDATORY,
        trigger: {
            type: TriggerType.GAME_START,
            delay: 1000
        },
        steps: [
            {
                stepId: 'welcome_1',
                type: StepType.DIALOG,
                description: '欢迎语',
                dialog: {
                    position: DialogPosition.CENTER,
                    speaker: '凯瑟琳女王',
                    content: '欢迎来到恩洛斯大陆！我是圣堂阵营的凯瑟琳女王。让我们一起开始这段冒险之旅吧！',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '开始冒险',
                    showMask: true
                }
            },
            {
                stepId: 'welcome_2',
                type: StepType.DIALOG,
                description: '阵营介绍',
                dialog: {
                    position: DialogPosition.CENTER,
                    speaker: '凯瑟琳女王',
                    content: '在这个世界中，有七大阵营：圣堂、壁垒、墓园、地下城、塔楼、据点和地狱。每个阵营都有独特的兵种和英雄。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '继续',
                    showMask: true
                }
            },
            {
                stepId: 'welcome_3',
                type: StepType.DIALOG,
                description: '游戏玩法介绍',
                dialog: {
                    position: DialogPosition.CENTER,
                    speaker: '凯瑟琳女王',
                    content: '你需要建设主城、招募兵种、培养英雄，然后在六边形战场上与敌人展开策略对决！',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '我准备好了！',
                    showMask: true
                }
            }
        ],
        reward: {
            gold: 1000,
            gems: 50
        },
        priority: 1,
        maxTriggerCount: 1
    },

    // ==================== 主城引导 ====================
    {
        tutorialId: 'tutorial_town',
        name: '主城建设',
        description: '学习如何建设主城',
        type: TutorialType.MANDATORY,
        trigger: {
            type: TriggerType.ENTER_SCENE,
            sceneRestriction: ['Town']
        },
        prerequisiteIds: ['tutorial_welcome'],
        steps: [
            {
                stepId: 'town_1',
                type: StepType.DIALOG,
                description: '主城介绍',
                dialog: {
                    position: DialogPosition.TOP,
                    speaker: '凯瑟琳女王',
                    content: '这是你的主城。主城是你的基地，可以生产资源、招募兵种。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '了解',
                    showArrow: true
                }
            },
            {
                stepId: 'town_2',
                type: StepType.HIGHLIGHT,
                description: '高亮资源栏',
                targetPath: 'Canvas/TownPanel/ResourceBar',
                highlightShape: HighlightShape.RECTANGLE,
                highlightPadding: 10,
                dialog: {
                    position: DialogPosition.BOTTOM,
                    speaker: '凯瑟琳女王',
                    content: '这里显示你当前拥有的资源：金币、木材、矿石、水晶、宝石、硫磺、水银。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '知道了',
                    showArrow: true
                }
            },
            {
                stepId: 'town_3',
                type: StepType.HIGHLIGHT,
                description: '高亮建筑区域',
                targetPath: 'Canvas/TownPanel/BuildingArea',
                highlightShape: HighlightShape.RECTANGLE,
                highlightPadding: 15,
                dialog: {
                    position: DialogPosition.BOTTOM,
                    speaker: '凯瑟琳女王',
                    content: '点击建筑可以升级或查看详情。升级建筑需要消耗资源，但会提供更好的产出。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '明白了',
                    showArrow: true
                }
            },
            {
                stepId: 'town_4',
                type: StepType.WAIT_ACTION,
                description: '等待升级建筑',
                waitAction: {
                    actionType: WaitActionType.UPGRADE_BUILDING,
                    timeout: 60000
                }
            },
            {
                stepId: 'town_5',
                type: StepType.DIALOG,
                description: '升级完成',
                dialog: {
                    position: DialogPosition.CENTER,
                    speaker: '凯瑟琳女王',
                    content: '太棒了！建筑升级成功！升级后的建筑会提供更好的效果。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '继续'
                }
            }
        ],
        reward: {
            gold: 500,
            exp: 100
        },
        priority: 2,
        maxTriggerCount: 1
    },

    // ==================== 招募引导 ====================
    {
        tutorialId: 'tutorial_recruit',
        name: '招募兵种',
        description: '学习如何招募兵种',
        type: TutorialType.MANDATORY,
        trigger: {
            type: TriggerType.TUTORIAL_COMPLETE,
            condition: {
                type: 6, // ConditionType.TUTORIAL_COMPLETED
                params: { tutorialId: 'tutorial_town' }
            }
        },
        prerequisiteIds: ['tutorial_town'],
        steps: [
            {
                stepId: 'recruit_1',
                type: StepType.HIGHLIGHT,
                description: '高亮招募按钮',
                targetPath: 'Canvas/TownPanel/RecruitButton',
                highlightShape: HighlightShape.RECTANGLE,
                highlightPadding: 5,
                dialog: {
                    position: DialogPosition.BOTTOM,
                    speaker: '凯瑟琳女王',
                    content: '点击这里打开招募面板，招募你心仪的兵种！',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '去看看',
                    showArrow: true
                }
            },
            {
                stepId: 'recruit_2',
                type: StepType.WAIT_ACTION,
                description: '等待打开招募面板',
                waitAction: {
                    actionType: WaitActionType.TAP_BUTTON,
                    targetPath: 'Canvas/TownPanel/RecruitButton',
                    timeout: 30000
                }
            },
            {
                stepId: 'recruit_3',
                type: StepType.DIALOG,
                description: '招募面板介绍',
                dialog: {
                    position: DialogPosition.BOTTOM,
                    speaker: '凯瑟琳女王',
                    content: '这里列出了你可以招募的兵种。不同兵种有不同的属性和技能，合理搭配是取胜的关键！',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '继续'
                }
            },
            {
                stepId: 'recruit_4',
                type: StepType.HIGHLIGHT,
                description: '选择兵种',
                targetPath: 'Canvas/RecruitPanel/UnitList/UnitItem_0',
                highlightShape: HighlightShape.RECTANGLE,
                highlightPadding: 5,
                dialog: {
                    position: DialogPosition.TOP,
                    speaker: '凯瑟琳女王',
                    content: '点击兵种卡片可以查看详细信息。让我们先招募一些枪兵吧！',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '好的'
                }
            },
            {
                stepId: 'recruit_5',
                type: StepType.WAIT_ACTION,
                description: '等待招募兵种',
                waitAction: {
                    actionType: WaitActionType.RECRUIT_UNIT,
                    timeout: 60000
                }
            },
            {
                stepId: 'recruit_6',
                type: StepType.DIALOG,
                description: '招募成功',
                dialog: {
                    position: DialogPosition.CENTER,
                    speaker: '凯瑟琳女王',
                    content: '非常好！你已经拥有了自己的军队。记得定期招募兵种来壮大实力！',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '谢谢指导'
                }
            }
        ],
        reward: {
            gold: 300
        },
        priority: 3,
        maxTriggerCount: 1
    },

    // ==================== 战斗引导 ====================
    {
        tutorialId: 'tutorial_battle',
        name: '初入战场',
        description: '学习战斗基础',
        type: TutorialType.MANDATORY,
        trigger: {
            type: TriggerType.FIRST_ENTER,
            sceneRestriction: ['Battle']
        },
        prerequisiteIds: ['tutorial_recruit'],
        steps: [
            {
                stepId: 'battle_1',
                type: StepType.DIALOG,
                description: '战场介绍',
                dialog: {
                    position: DialogPosition.TOP,
                    speaker: '凯瑟琳女王',
                    content: '欢迎来到战场！这里将是你展示策略和指挥能力的舞台。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '请继续'
                }
            },
            {
                stepId: 'battle_2',
                type: StepType.HIGHLIGHT,
                description: '高亮战场网格',
                targetPath: 'Canvas/BattlePanel/HexGrid',
                highlightShape: HighlightShape.RECTANGLE,
                highlightPadding: 10,
                dialog: {
                    position: DialogPosition.BOTTOM,
                    speaker: '凯瑟琳女王',
                    content: '这是一个六边形战场。每个兵种占据一个格子，移动距离由速度决定。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '了解了'
                }
            },
            {
                stepId: 'battle_3',
                type: StepType.HIGHLIGHT,
                description: '高亮专注点',
                targetPath: 'Canvas/BattlePanel/FocusBar',
                highlightShape: HighlightShape.RECTANGLE,
                highlightPadding: 5,
                dialog: {
                    position: DialogPosition.BOTTOM,
                    speaker: '凯瑟琳女王',
                    content: '这是专注点栏。每次攻击积累1点专注点，释放技能需要消耗1-3点。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '明白了'
                }
            },
            {
                stepId: 'battle_4',
                type: StepType.HIGHLIGHT,
                description: '高亮技能栏',
                targetPath: 'Canvas/BattlePanel/SkillBar',
                highlightShape: HighlightShape.RECTANGLE,
                highlightPadding: 5,
                dialog: {
                    position: DialogPosition.TOP,
                    speaker: '凯瑟琳女王',
                    content: '这是你的技能栏。点击技能可以在战斗中释放，扭转战局！',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '知道了'
                }
            },
            {
                stepId: 'battle_5',
                type: StepType.DIALOG,
                description: '战斗提示',
                dialog: {
                    position: DialogPosition.CENTER,
                    speaker: '凯瑟琳女王',
                    content: '战斗会自动进行，但你可以选择合适的时机释放技能。注意观察敌人的弱点！',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '开始战斗！'
                }
            },
            {
                stepId: 'battle_6',
                type: StepType.WAIT_ACTION,
                description: '等待战斗完成',
                waitAction: {
                    actionType: WaitActionType.FINISH_BATTLE,
                    timeout: 180000
                }
            }
        ],
        reward: {
            gold: 500,
            exp: 200
        },
        priority: 4,
        maxTriggerCount: 1
    },

    // ==================== 英雄系统引导 ====================
    {
        tutorialId: 'tutorial_hero',
        name: '英雄培养',
        description: '学习如何培养英雄',
        type: TutorialType.OPTIONAL,
        trigger: {
            type: TriggerType.LEVEL_REACH,
            condition: {
                type: 1, // ConditionType.PLAYER_LEVEL
                params: { level: 5 }
            }
        },
        prerequisiteIds: ['tutorial_battle'],
        steps: [
            {
                stepId: 'hero_1',
                type: StepType.DIALOG,
                description: '英雄介绍',
                dialog: {
                    position: DialogPosition.CENTER,
                    speaker: '凯瑟琳女王',
                    content: '英雄是军队的核心！强大的英雄能极大提升军队战斗力。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '请详细介绍'
                }
            },
            {
                stepId: 'hero_2',
                type: StepType.HIGHLIGHT,
                description: '高亮英雄按钮',
                targetPath: 'Canvas/TownPanel/HeroButton',
                highlightShape: HighlightShape.RECTANGLE,
                highlightPadding: 5,
                dialog: {
                    position: DialogPosition.BOTTOM,
                    speaker: '凯瑟琳女王',
                    content: '点击这里可以查看和管理你的英雄。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '去看看',
                    showArrow: true
                }
            },
            {
                stepId: 'hero_3',
                type: StepType.WAIT_ACTION,
                description: '等待打开英雄面板',
                waitAction: {
                    actionType: WaitActionType.TAP_BUTTON,
                    targetPath: 'Canvas/TownPanel/HeroButton',
                    timeout: 30000
                }
            },
            {
                stepId: 'hero_4',
                type: StepType.DIALOG,
                description: '英雄属性',
                dialog: {
                    position: DialogPosition.CENTER,
                    speaker: '凯瑟琳女王',
                    content: '英雄有四大属性：攻击、防御、咒力、知识。这些属性会影响军队的战斗力和魔法效果。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '了解了'
                }
            }
        ],
        reward: {
            gems: 30,
            exp: 50
        },
        priority: 10,
        maxTriggerCount: 1
    },

    // ==================== 技能系统引导 ====================
    {
        tutorialId: 'tutorial_skill',
        name: '技能使用',
        description: '学习如何在战斗中使用技能',
        type: TutorialType.OPTIONAL,
        trigger: {
            type: TriggerType.LEVEL_REACH,
            condition: {
                type: 1, // ConditionType.PLAYER_LEVEL
                params: { level: 3 }
            }
        },
        prerequisiteIds: ['tutorial_battle'],
        steps: [
            {
                stepId: 'skill_1',
                type: StepType.DIALOG,
                description: '技能介绍',
                dialog: {
                    position: DialogPosition.CENTER,
                    speaker: '凯瑟琳女王',
                    content: '技能可以在关键时刻改变战局！合理使用技能是取胜的关键。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '请继续'
                }
            },
            {
                stepId: 'skill_2',
                type: StepType.WAIT_ACTION,
                description: '等待进入战斗',
                waitAction: {
                    actionType: WaitActionType.START_BATTLE,
                    timeout: 120000
                }
            },
            {
                stepId: 'skill_3',
                type: StepType.HIGHLIGHT,
                description: '高亮技能栏',
                targetPath: 'Canvas/BattlePanel/SkillBar',
                highlightShape: HighlightShape.RECTANGLE,
                highlightPadding: 5,
                dialog: {
                    position: DialogPosition.TOP,
                    speaker: '凯瑟琳女王',
                    content: '点击技能图标可以释放技能。注意查看技能的专注点消耗！',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '知道了'
                }
            },
            {
                stepId: 'skill_4',
                type: StepType.WAIT_ACTION,
                description: '等待使用技能',
                waitAction: {
                    actionType: WaitActionType.USE_SKILL,
                    timeout: 60000
                }
            },
            {
                stepId: 'skill_5',
                type: StepType.DIALOG,
                description: '技能使用成功',
                dialog: {
                    position: DialogPosition.CENTER,
                    speaker: '凯瑟琳女王',
                    content: '很好！你已经学会了使用技能。记住，技能的选择时机非常重要！',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '谢谢指导'
                }
            }
        ],
        reward: {
            gems: 20
        },
        priority: 11,
        maxTriggerCount: 1
    },

    // ==================== 情境提示 ====================
    {
        tutorialId: 'tip_low_resource',
        name: '资源不足提示',
        description: '当资源不足时的提示',
        type: TutorialType.CONTEXTUAL,
        trigger: {
            type: TriggerType.MANUAL,
            condition: {
                type: 2, // ConditionType.RESOURCE
                params: { resourceId: 'gold', minValue: 0, maxValue: 100 }
            }
        },
        steps: [
            {
                stepId: 'low_resource_1',
                type: StepType.DIALOG,
                description: '资源不足提示',
                dialog: {
                    position: DialogPosition.CENTER,
                    speaker: '凯瑟琳女王',
                    content: '你的金币不足了！可以通过完成任务、战斗胜利或挂机收益来获取更多金币。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '知道了'
                }
            }
        ],
        priority: 100,
        maxTriggerCount: 3
    },

    {
        tutorialId: 'tip_idle_reward',
        name: '挂机收益提示',
        description: '提醒玩家领取挂机收益',
        type: TutorialType.CONTEXTUAL,
        trigger: {
            type: TriggerType.ENTER_SCENE,
            delay: 3000,
            sceneRestriction: ['Town']
        },
        steps: [
            {
                stepId: 'idle_reward_1',
                type: StepType.HIGHLIGHT,
                description: '高亮挂机收益',
                targetPath: 'Canvas/TownPanel/IdleReward',
                highlightShape: HighlightShape.RECTANGLE,
                highlightPadding: 10,
                dialog: {
                    position: DialogPosition.BOTTOM,
                    speaker: '凯瑟琳女王',
                    content: '你有挂机收益可以领取！点击这里领取资源。',
                    avatar: 'textures/heroes/catherine',
                    buttonText: '谢谢提醒',
                    showArrow: true
                }
            }
        ],
        priority: 50,
        maxTriggerCount: 5
    }
];

/**
 * 根据ID获取教程配置
 */
export function getTutorialById(tutorialId: string): TutorialConfig | undefined {
    return tutorials.find(t => t.tutorialId === tutorialId);
}

/**
 * 获取所有强制教程
 */
export function getMandatoryTutorials(): TutorialConfig[] {
    return tutorials.filter(t => t.type === TutorialType.MANDATORY);
}

/**
 * 获取所有可选教程
 */
export function getOptionalTutorials(): TutorialConfig[] {
    return tutorials.filter(t => t.type === TutorialType.OPTIONAL);
}

/**
 * 获取所有情境提示
 */
export function getContextualTutorials(): TutorialConfig[] {
    return tutorials.filter(t => t.type === TutorialType.CONTEXTUAL);
}