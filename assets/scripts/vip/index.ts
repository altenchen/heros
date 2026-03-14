/**
 * VIP与充值模块
 * 导出VIP系统相关类和配置
 */

export * from '../config/VIPTypes';
export { VIPManager, vipManager } from './VIPManager';
export {
    vipLevelConfigs,
    paymentProducts,
    monthlyCardConfigs,
    growthFundConfigs,
    getVIPLevelConfig,
    getPaymentProduct,
    getMonthlyCardConfig,
    getGrowthFundConfig
} from '../config/vip.json';