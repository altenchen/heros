/**
 * 每日签到管理器
 * 管理签到、补签、连续签到奖励
 * 遵循阿里巴巴开发者手册规范
 */

import {
    SigninState,
    SigninCycleType,
    SigninProgress,
    SigninResult,
    SigninPreview,
    SigninEventType,
    SigninEventData,
    RewardConfig as SigninRewardConfigItem,
    SigninRewardConfig,
    SigninCycleConfig
} from '../config/DailySigninTypes';
import { ResourceType } from '../config/GameTypes';
import {
    signinCycles,
    getActiveSigninCycle,
    getRewardByDay,
    getContinuousBonus,
    calculateMakeupCost
} from '../config/signin.json';
import { EventCenter } from '../utils/EventTarget';
import { playerDataManager } from '../utils/PlayerDataManager';
import { rewardManager } from '../utils/RewardManager';

/**
 * 签到管理器
 * 单例模式
 */
export class DailySigninManager {
    private static _instance: DailySigninManager | null = null;

    /** 签到进度 */
    private _progress: Map<string, SigninProgress> = new Map();

    /** 设置存储键 */
    private readonly SETTINGS_KEY = 'hmm_legacy_signin';

    private constructor() {}

    /**
     * 获取单例实例
     */
    static getInstance(): DailySigninManager {
        if (!DailySigninManager._instance) {
            DailySigninManager._instance = new DailySigninManager();
        }
        return DailySigninManager._instance;
    }

    /**
     * 初始化
     */
    init(): void {
        this._checkAndResetCycle();
        console.log('[DailySigninManager] 初始化完成');
    }

    /**
     * 检查并重置周期
     */
    private _checkAndResetCycle(): void {
        const now = Date.now();

        signinCycles.forEach(cycle => {
            let progress = this._progress.get(cycle.cycleId);

            if (!progress) {
                // 创建新进度
                progress = this._createNewProgress(cycle.cycleId);
                this._progress.set(cycle.cycleId, progress);
                return;
            }

            // 检查是否需要重置
            const needReset = this._checkCycleReset(cycle, progress, now);

            if (needReset) {
                // 发送周期重置事件
                EventCenter.emit(SigninEventType.CYCLE_RESET, {
                    cycleId: cycle.cycleId
                });

                // 重置进度
                progress = this._createNewProgress(cycle.cycleId);
                this._progress.set(cycle.cycleId, progress);

                console.log(`[DailySigninManager] 周期重置: ${cycle.name}`);
            } else {
                // 检查今日签到状态
                this._updateDailyState(progress, now);
            }
        });
    }

    /**
     * 创建新进度
     */
    private _createNewProgress(cycleId: string): SigninProgress {
        return {
            cycleId,
            signedDays: 0,
            continuousDays: 0,
            maxContinuousDays: 0,
            todaySigned: false,
            lastSignTime: 0,
            claimedDays: [],
            makeupCount: 0,
            makeupUsedCount: 0
        };
    }

    /**
     * 检查周期是否需要重置
     */
    private _checkCycleReset(cycle: SigninCycleConfig, progress: SigninProgress, now: number): boolean {
        switch (cycle.type) {
            case SigninCycleType.DAILY:
                // 每日签到，检查是否过了今天
                return !this._isSameDay(progress.lastSignTime, now);

            case SigninCycleType.WEEKLY:
                // 周签到，检查是否过了一周
                const weekDiff = Math.floor((now - progress.lastSignTime) / (7 * 24 * 60 * 60 * 1000));
                return weekDiff >= 1;

            case SigninCycleType.MONTHLY:
                // 月签到，检查是否过了月份
                const lastDate = new Date(progress.lastSignTime);
                const nowDate = new Date(now);
                const monthDiff = (nowDate.getFullYear() - lastDate.getFullYear()) * 12 +
                                  (nowDate.getMonth() - lastDate.getMonth());
                // 如果上月没签到超过7天，重置
                if (monthDiff >= 1) {
                    const dayDiff = Math.floor((now - progress.lastSignTime) / (24 * 60 * 60 * 1000));
                    return dayDiff > 7;
                }
                return false;

            default:
                return false;
        }
    }

    /**
     * 更新每日状态
     */
    private _updateDailyState(progress: SigninProgress, now: number): void {
        // 检查是否跨天
        if (progress.lastSignTime > 0 && !this._isSameDay(progress.lastSignTime, now)) {
            // 跨天了，重置今日签到状态
            progress.todaySigned = false;

            // 检查连续签到是否中断
            const dayDiff = Math.floor((now - progress.lastSignTime) / (24 * 60 * 60 * 1000));
            if (dayDiff > 1) {
                // 连续签到中断
                progress.continuousDays = 0;
                console.log('[DailySigninManager] 连续签到中断');
            }
        }
    }

    /**
     * 检查是否同一天
     */
    private _isSameDay(time1: number, time2: number): boolean {
        const date1 = new Date(time1);
        const date2 = new Date(time2);
        return date1.getFullYear() === date2.getFullYear() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getDate() === date2.getDate();
    }

    /**
     * 获取签到预览
     */
    getSigninPreview(cycleId?: string): SigninPreview | null {
        const cycle = cycleId ? signinCycles.find(c => c.cycleId === cycleId) : getActiveSigninCycle();

        if (!cycle) {
            return null;
        }

        let progress = this._progress.get(cycle.cycleId);
        if (!progress) {
            progress = this._createNewProgress(cycle.cycleId);
            this._progress.set(cycle.cycleId, progress);
        }

        const todayState = this._getTodayState(cycle, progress);
        const todayReward = cycle.rewards[progress.signedDays] || cycle.rewards[0];
        const makeupDays = this._getMakeupDays(cycle, progress);

        return {
            cycle,
            progress,
            todayState,
            todayReward,
            makeupDays
        };
    }

    /**
     * 获取今日状态
     */
    private _getTodayState(cycle: SigninCycleConfig, progress: SigninProgress): SigninState {
        if (progress.todaySigned) {
            return SigninState.SIGNED;
        }

        // 检查是否可以补签
        const makeupDays = this._getMakeupDays(cycle, progress);
        if (makeupDays.length > 0) {
            return SigninState.CAN_MAKEUP;
        }

        return SigninState.NOT_SIGNED;
    }

    /**
     * 获取可补签天数
     */
    private _getMakeupDays(cycle: SigninCycleConfig, progress: SigninProgress): number[] {
        const makeupDays: number[] = [];

        // 检查是否还能补签
        if (progress.makeupUsedCount >= (cycle.maxMakeupCount || 5)) {
            return makeupDays;
        }

        // 找出未签到的天数（除了今天）
        const now = Date.now();
        const today = new Date(now).getDate();

        for (let day = 1; day < today; day++) {
            if (!progress.claimedDays.includes(day)) {
                makeupDays.push(day);
            }
        }

        // 月签到：检查整个周期内的未签到天数
        if (cycle.type === SigninCycleType.MONTHLY && progress.signedDays < cycle.totalDays) {
            // 返回当前签到进度后的天数
            const nextDay = progress.signedDays + 1;
            if (nextDay <= cycle.totalDays && !progress.todaySigned) {
                // 今天可以补签过去的某一天
            }
        }

        return makeupDays;
    }

    /**
     * 签到
     */
    signin(cycleId?: string): SigninResult {
        const cycle = cycleId ? signinCycles.find(c => c.cycleId === cycleId) : getActiveSigninCycle();

        if (!cycle) {
            return {
                success: false,
                day: 0,
                rewards: [],
                error: '签到活动不存在'
            };
        }

        let progress = this._progress.get(cycle.cycleId);
        if (!progress) {
            progress = this._createNewProgress(cycle.cycleId);
            this._progress.set(cycle.cycleId, progress);
        }

        // 检查是否已签到
        if (progress.todaySigned) {
            return {
                success: false,
                day: progress.signedDays,
                rewards: [],
                error: '今日已签到'
            };
        }

        // 计算签到天数
        const signDay = progress.signedDays + 1;
        if (signDay > cycle.totalDays) {
            return {
                success: false,
                day: signDay,
                rewards: [],
                error: '本月签到已完成'
            };
        }

        // 获取奖励
        const rewardConfig = getRewardByDay(cycle.cycleId, signDay);
        if (!rewardConfig) {
            return {
                success: false,
                day: signDay,
                rewards: [],
                error: '奖励配置不存在'
            };
        }

        // 更新进度
        const now = Date.now();
        progress.signedDays = signDay;
        progress.continuousDays++;
        progress.maxContinuousDays = Math.max(progress.maxContinuousDays, progress.continuousDays);
        progress.todaySigned = true;
        progress.lastSignTime = now;
        progress.claimedDays.push(signDay);

        // 发放奖励
        this._grantRewards(rewardConfig.rewards);

        // 检查连续签到奖励
        let continuousBonus: SigninRewardConfigItem | undefined;
        const bonus = getContinuousBonus(cycle.cycleId, progress.continuousDays);
        if (bonus) {
            this._grantRewards([bonus]);
            continuousBonus = bonus;

            // 发送连续签到奖励事件
            EventCenter.emit(SigninEventType.CONTINUOUS_BONUS, {
                cycleId: cycle.cycleId,
                day: signDay,
                rewards: [bonus],
                continuousBonus: bonus
            });
        }

        // 发送签到成功事件
        const eventData: SigninEventData = {
            cycleId: cycle.cycleId,
            day: signDay,
            rewards: rewardConfig.rewards,
            continuousBonus
        };
        EventCenter.emit(SigninEventType.SIGNIN_SUCCESS, eventData);

        console.log(`[DailySigninManager] 签到成功: 第${signDay}天`);

        return {
            success: true,
            day: signDay,
            rewards: rewardConfig.rewards,
            continuousBonus
        };
    }

    /**
     * 补签
     */
    makeup(day: number, cycleId?: string): SigninResult {
        const cycle = cycleId ? signinCycles.find(c => c.cycleId === cycleId) : getActiveSigninCycle();

        if (!cycle) {
            return {
                success: false,
                day: 0,
                rewards: [],
                error: '签到活动不存在'
            };
        }

        let progress = this._progress.get(cycle.cycleId);
        if (!progress) {
            return {
                success: false,
                day: 0,
                rewards: [],
                error: '签到进度不存在'
            };
        }

        // 检查是否已签到该天
        if (progress.claimedDays.includes(day)) {
            return {
                success: false,
                day,
                rewards: [],
                error: '该天已签到'
            };
        }

        // 检查补签次数
        if (progress.makeupUsedCount >= (cycle.maxMakeupCount || 5)) {
            return {
                success: false,
                day,
                rewards: [],
                error: '补签次数已用完'
            };
        }

        // 计算补签费用
        const cost = calculateMakeupCost(cycle, progress.makeupUsedCount);

        // 检查资源是否足够
        const gold = playerDataManager.getResource(ResourceType.GOLD);
        const gems = playerDataManager.getResource(ResourceType.GEMS);

        if (gold < cost.gold || gems < cost.gems) {
            return {
                success: false,
                day,
                rewards: [],
                error: '资源不足'
            };
        }

        // 扣除资源
        playerDataManager.addResource(ResourceType.GOLD, -cost.gold!);
        playerDataManager.addResource(ResourceType.GEMS, -cost.gems!);

        // 获取奖励
        const rewardConfig = getRewardByDay(cycle.cycleId, day);
        if (!rewardConfig) {
            return {
                success: false,
                day,
                rewards: [],
                error: '奖励配置不存在'
            };
        }

        // 更新进度
        progress.signedDays++;
        progress.makeupUsedCount++;
        progress.claimedDays.push(day);

        // 发放奖励
        this._grantRewards(rewardConfig.rewards);

        // 发送补签成功事件
        const eventData: SigninEventData = {
            cycleId: cycle.cycleId,
            day,
            rewards: rewardConfig.rewards
        };
        EventCenter.emit(SigninEventType.MAKEUP_SUCCESS, eventData);

        console.log(`[DailySigninManager] 补签成功: 第${day}天，花费${cost.gold}金币 ${cost.gems}钻石`);

        return {
            success: true,
            day,
            rewards: rewardConfig.rewards,
            isMakeup: true
        };
    }

    /**
     * 发放奖励
     */
    private _grantRewards(rewards: SigninRewardConfigItem[]): void {
        // 转换为统一奖励配置格式
        const rewardConfigs = rewards.map(r => ({
            type: r.type,
            itemId: r.itemId,
            amount: r.amount
        }));

        // 使用统一奖励发放
        const results = rewardManager.grantRewards(rewardConfigs);

        results.forEach((result, index) => {
            if (!result.success) {
                console.warn(`[DailySigninManager] 发放奖励失败: ${rewards[index].type} ${rewards[index].itemId}`);
            }
        });
    }

    /**
     * 检查今日是否已签到
     */
    isTodaySigned(cycleId?: string): boolean {
        const cycle = cycleId ? signinCycles.find(c => c.cycleId === cycleId) : getActiveSigninCycle();

        if (!cycle) {
            return false;
        }

        const progress = this._progress.get(cycle.cycleId);
        return progress?.todaySigned || false;
    }

    /**
     * 获取签到进度
     */
    getProgress(cycleId?: string): SigninProgress | undefined {
        const cycle = cycleId ? signinCycles.find(c => c.cycleId === cycleId) : getActiveSigninCycle();

        if (!cycle) {
            return undefined;
        }

        return this._progress.get(cycle.cycleId);
    }

    /**
     * 获取连续签到天数
     */
    getContinuousDays(cycleId?: string): number {
        const progress = this.getProgress(cycleId);
        return progress?.continuousDays || 0;
    }

    /**
     * 获取补签剩余次数
     */
    getRemainingMakeupCount(cycleId?: string): number {
        const cycle = cycleId ? signinCycles.find(c => c.cycleId === cycleId) : getActiveSigninCycle();

        if (!cycle) {
            return 0;
        }

        const progress = this._progress.get(cycle.cycleId);
        if (!progress) {
            return cycle.maxMakeupCount || 5;
        }

        return (cycle.maxMakeupCount || 5) - progress.makeupUsedCount;
    }

    /**
     * 获取所有签到周期进度
     */
    getAllProgress(): Map<string, SigninProgress> {
        return new Map(this._progress);
    }

    /**
     * 序列化数据
     */
    serialize(): string {
        const data = {
            progress: Array.from(this._progress.entries())
        };
        return JSON.stringify(data);
    }

    /**
     * 反序列化数据
     */
    deserialize(data: string): void {
        try {
            const parsed = JSON.parse(data);
            if (parsed.progress) {
                this._progress = new Map(parsed.progress);
            }
            // 检查周期重置
            this._checkAndResetCycle();
            console.log('[DailySigninManager] 数据加载完成');
        } catch (e) {
            console.error('[DailySigninManager] 数据加载失败:', e);
        }
    }

    /**
     * 清除数据
     */
    clear(): void {
        this._progress.clear();
    }
}

// 导出单例
export const dailySigninManager = DailySigninManager.getInstance();