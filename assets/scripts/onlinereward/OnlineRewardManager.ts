/**
 * 在线奖励管理器
 * 管理在线时长奖励，处理奖励发放
 */

import { EventCenter } from '../utils/EventTarget';
import {
    OnlineRewardEventType,
    OnlineRewardConfig,
    OnlineRewardState,
    OnlineRewardPreview,
    OnlineRewardData,
    OnlineRewardClaimResult,
    OnlineRewardItem
} from '../config/OnlineRewardTypes';
import { onlineRewardConfigMap, onlineRewardConfigs } from '../config/online_reward.json';

/** 在线奖励管理器 */
export class OnlineRewardManager {
    private static instance: OnlineRewardManager | null = null;

    /** 在线状态 */
    private state: OnlineRewardState = {
        claimedRewardIds: [],
        todayOnlineMinutes: 0,
        lastClaimTime: 0,
        lastResetDate: ''
    };

    /** 在线计时器 */
    private onlineTimer: number = 0;

    /** 是否已初始化 */
    private initialized: boolean = false;

    /** 累计在线时间（用于更新） */
    private accumulatedTime: number = 0;

    private constructor() {}

    /**
     * 获取单例
     */
    static getInstance(): OnlineRewardManager {
        if (!OnlineRewardManager.instance) {
            OnlineRewardManager.instance = new OnlineRewardManager();
        }
        return OnlineRewardManager.instance;
    }

    /**
     * 初始化
     */
    init(): void {
        if (this.initialized) return;

        // 检查每日重置
        this._checkDailyReset();

        this.initialized = true;
        console.log('[OnlineRewardManager] 初始化完成');
    }

    /**
     * 更新在线时间（每帧调用）
     */
    update(deltaTime: number): void {
        if (!this.initialized) return;

        // 检查每日重置
        this._checkDailyReset();

        // 累积时间（毫秒转分钟）
        this.accumulatedTime += deltaTime;
        if (this.accumulatedTime >= 60) { // 每秒更新一次分钟计数
            this.state.todayOnlineMinutes += this.accumulatedTime / 60;
            this.accumulatedTime = 0;

            // 检查是否有可领取的奖励
            this._checkAvailableRewards();

            // 触发更新事件
            EventCenter.emit(OnlineRewardEventType.ONLINE_TIME_UPDATED, {
                todayMinutes: this.state.todayOnlineMinutes
            });
        }
    }

    /**
     * 获取在线奖励数据
     */
    getOnlineRewardData(): OnlineRewardData {
        const availableCount = this.getAvailableRewards().length;
        const nextReward = this.getNextReward();

        return {
            todayMinutes: this.state.todayOnlineMinutes,
            totalClaimed: this.state.claimedRewardIds.length,
            availableCount,
            nextRewardIn: nextReward ? nextReward.requiredMinutes - this.state.todayOnlineMinutes : 0
        };
    }

    /**
     * 获取奖励预览列表
     */
    getRewardPreviews(): OnlineRewardPreview[] {
        return onlineRewardConfigs.map(config => {
            const claimed = this.state.claimedRewardIds.includes(config.id);
            const available = !claimed && this.state.todayOnlineMinutes >= config.requiredMinutes;
            const progress = Math.min(100, (this.state.todayOnlineMinutes / config.requiredMinutes) * 100);
            const remainingMinutes = Math.max(0, config.requiredMinutes - this.state.todayOnlineMinutes);

            return {
                config,
                claimed,
                available,
                progress,
                remainingMinutes
            };
        });
    }

    /**
     * 获取可领取的奖励列表
     */
    getAvailableRewards(): OnlineRewardConfig[] {
        return onlineRewardConfigs.filter(config =>
            !this.state.claimedRewardIds.includes(config.id) &&
            this.state.todayOnlineMinutes >= config.requiredMinutes
        );
    }

    /**
     * 获取下一个奖励
     */
    getNextReward(): OnlineRewardConfig | null {
        const sorted = [...onlineRewardConfigs].sort((a, b) => a.requiredMinutes - b.requiredMinutes);
        return sorted.find(config =>
            !this.state.claimedRewardIds.includes(config.id) &&
            this.state.todayOnlineMinutes < config.requiredMinutes
        ) || null;
    }

    /**
     * 领取奖励
     */
    claimReward(rewardId: string, vipLevel: number = 0): OnlineRewardClaimResult {
        const config = onlineRewardConfigMap.get(rewardId);

        if (!config) {
            return { success: false, error: '奖励不存在' };
        }

        if (this.state.claimedRewardIds.includes(rewardId)) {
            return { success: false, error: '奖励已领取' };
        }

        if (this.state.todayOnlineMinutes < config.requiredMinutes) {
            return { success: false, error: '在线时长不足' };
        }

        // 计算奖励（含VIP加成）
        const rewards = this._calculateRewards(config, vipLevel);

        // 更新状态
        this.state.claimedRewardIds.push(rewardId);
        this.state.lastClaimTime = Date.now();

        EventCenter.emit(OnlineRewardEventType.REWARD_CLAIMED, {
            rewardId,
            rewards
        });

        return { success: true, rewards, rewardId };
    }

    /**
     * 一键领取所有奖励
     */
    claimAllRewards(vipLevel: number = 0): OnlineRewardItem[] {
        const available = this.getAvailableRewards();
        const allRewards: OnlineRewardItem[] = [];

        available.forEach(config => {
            const result = this.claimReward(config.id, vipLevel);
            if (result.success && result.rewards) {
                allRewards.push(...result.rewards);
            }
        });

        return allRewards;
    }

    /**
     * 检查是否有可领取的奖励
     */
    hasAvailableRewards(): boolean {
        return this.getAvailableRewards().length > 0;
    }

    /**
     * 获取今日在线分钟数
     */
    getTodayOnlineMinutes(): number {
        return this.state.todayOnlineMinutes;
    }

    /**
     * 格式化在线时间
     */
    formatOnlineTime(): string {
        const minutes = Math.floor(this.state.todayOnlineMinutes);
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}小时${mins}分钟`;
        }
        return `${mins}分钟`;
    }

    /**
     * 计算奖励（含VIP加成）
     */
    private _calculateRewards(config: OnlineRewardConfig, vipLevel: number): OnlineRewardItem[] {
        const vipBonus = config.vipBonus ? 1 + (vipLevel * config.vipBonus) : 1;

        return config.rewards.map(reward => ({
            ...reward,
            amount: Math.floor(reward.amount * vipBonus)
        }));
    }

    /**
     * 检查可领取奖励
     */
    private _checkAvailableRewards(): void {
        const available = this.getAvailableRewards();
        if (available.length > 0) {
            EventCenter.emit(OnlineRewardEventType.REWARD_AVAILABLE, {
                count: available.length
            });
        }
    }

    /**
     * 检查每日重置
     */
    private _checkDailyReset(): void {
        const today = new Date().toDateString();

        if (this.state.lastResetDate !== today) {
            // 每日重置
            this.state.claimedRewardIds = [];
            this.state.todayOnlineMinutes = 0;
            this.state.lastResetDate = today;

            EventCenter.emit(OnlineRewardEventType.DAILY_RESET, {
                date: today
            });

            console.log('[OnlineRewardManager] 每日重置完成');
        }
    }

    /**
     * 序列化数据
     */
    serialize(): any {
        return { ...this.state };
    }

    /**
     * 反序列化数据
     */
    deserialize(data: any): void {
        if (!data) return;

        this.state = {
            claimedRewardIds: data.claimedRewardIds || [],
            todayOnlineMinutes: data.todayOnlineMinutes || 0,
            lastClaimTime: data.lastClaimTime || 0,
            lastResetDate: data.lastResetDate || ''
        };

        // 检查是否需要重置
        this._checkDailyReset();
    }

    /**
     * 重置在线时间（用于测试）
     */
    resetOnlineTime(): void {
        this.state.todayOnlineMinutes = 0;
        this.state.claimedRewardIds = [];
    }
}

/** 导出单例 */
export const onlineRewardManager = OnlineRewardManager.getInstance();