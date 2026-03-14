/**
 * 签到模块
 * 导出签到系统相关类和配置
 */

export * from '../config/DailySigninTypes';
export { DailySigninManager, dailySigninManager } from './DailySigninManager';
export {
    monthlySigninRewards,
    continuousSigninBonus,
    defaultMonthlySignin,
    signinCycles,
    getSigninCycleById,
    getActiveSigninCycle,
    getRewardByDay,
    getContinuousBonus,
    calculateMakeupCost
} from '../config/signin.json';