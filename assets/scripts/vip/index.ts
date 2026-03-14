/**
 * VIP模块
 * 导出VIP系统相关类和配置
 */

export * from '../config/VIPTypes';
export { VIPManager, vipManager } from './VIPManager';
export {
    vipLevels,
    paymentProducts,
    monthlyCards,
    growthFunds,
    getVIPLevelConfig,
    getPaymentProductConfig,
    getMonthlyCardConfig,
    getGrowthFundConfig
} from '../config/vip.json';