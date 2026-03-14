/**
 * 活动系统模块导出
 * 遵循阿里巴巴开发者手册规范
 */

export { ActivityManager, activityManager } from './ActivityManager';
export {
    ActivityType,
    ActivityState,
    ActivityPeriodType,
    TaskProgressType,
    ActivityConfig,
    ActivityProgress,
    ActivityTaskConfig,
    ActivityTaskProgress,
    ActivityTaskCondition,
    ActivityTaskReward,
    ActivityEventType,
    ActivityEventData,
    ActivityListResult,
    ActivityDetailResult,
    ClaimActivityResult
} from '../config/ActivityTypes';
export {
    activityConfigs,
    getActivityById,
    getActivitiesByType,
    getAllActivities
} from '../config/activity.json';