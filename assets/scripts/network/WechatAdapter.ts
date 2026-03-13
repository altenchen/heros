/**
 * 微信小游戏适配层
 * 提供微信小游戏API的封装
 */

/**
 * 微信平台检测
 */
export const isWechatPlatform = (): boolean => {
    return typeof wx !== 'undefined';
};

/**
 * 存储管理器
 */
export class StorageManager {
    private static instance: StorageManager | null = null;

    private constructor() {}

    static getInstance(): StorageManager {
        if (!StorageManager.instance) {
            StorageManager.instance = new StorageManager();
        }
        return StorageManager.instance;
    }

    /**
     * 保存数据
     */
    setItem(key: string, value: string): void {
        if (isWechatPlatform()) {
            try {
                wx.setStorageSync(key, value);
            } catch (e) {
                console.error('wx.setStorageSync failed', e);
            }
        } else {
            localStorage.setItem(key, value);
        }
    }

    /**
     * 读取数据
     */
    getItem(key: string): string | null {
        if (isWechatPlatform()) {
            try {
                return wx.getStorageSync(key) || null;
            } catch (e) {
                console.error('wx.getStorageSync failed', e);
                return null;
            }
        } else {
            return localStorage.getItem(key);
        }
    }

    /**
     * 删除数据
     */
    removeItem(key: string): void {
        if (isWechatPlatform()) {
            try {
                wx.removeStorageSync(key);
            } catch (e) {
                console.error('wx.removeStorageSync failed', e);
            }
        } else {
            localStorage.removeItem(key);
        }
    }

    /**
     * 清空数据
     */
    clear(): void {
        if (isWechatPlatform()) {
            try {
                wx.clearStorageSync();
            } catch (e) {
                console.error('wx.clearStorageSync failed', e);
            }
        } else {
            localStorage.clear();
        }
    }
}

/**
 * 用户信息管理
 */
export class UserManager {
    private static instance: UserManager | null = null;
    private userInfo: WechatUserInfo | null = null;

    private constructor() {}

    static getInstance(): UserManager {
        if (!UserManager.instance) {
            UserManager.instance = new UserManager();
        }
        return UserManager.instance;
    }

    /**
     * 登录
     */
    async login(): Promise<string | null> {
        if (!isWechatPlatform()) {
            return `mock_openid_${Date.now()}`;
        }

        return new Promise((resolve) => {
            wx.login({
                success: (res) => {
                    if (res.code) {
                        // 发送code到服务器换取openid
                        resolve(res.code);
                    } else {
                        console.error('登录失败', res.errMsg);
                        resolve(null);
                    }
                },
                fail: () => {
                    resolve(null);
                }
            });
        });
    }

    /**
     * 获取用户信息
     */
    async getUserInfo(): Promise<WechatUserInfo | null> {
        if (!isWechatPlatform()) {
            return {
                nickName: '测试玩家',
                avatarUrl: '',
                gender: 0,
                city: '',
                province: '',
                country: '',
                language: ''
            };
        }

        if (this.userInfo) {
            return this.userInfo;
        }

        return new Promise((resolve) => {
            wx.getUserInfo({
                success: (res) => {
                    this.userInfo = res.userInfo;
                    resolve(res.userInfo);
                },
                fail: () => {
                    resolve(null);
                }
            });
        });
    }

    /**
     * 检查是否有用户信息权限
     */
    async checkUserInfoAuth(): Promise<boolean> {
        if (!isWechatPlatform()) {
            return true;
        }

        return new Promise((resolve) => {
            wx.getSetting({
                success: (res) => {
                    resolve(!!res.authSetting['scope.userInfo']);
                },
                fail: () => {
                    resolve(false);
                }
            });
        });
    }

    /**
     * 请求用户信息权限
     */
    async requestUserInfoAuth(): Promise<boolean> {
        if (!isWechatPlatform()) {
            return true;
        }

        // 创建按钮引导用户授权
        return new Promise((resolve) => {
            const button = wx.createUserInfoButton({
                type: 'text',
                text: '获取用户信息',
                style: {
                    left: 10,
                    top: 76,
                    width: 200,
                    height: 40,
                    lineHeight: 40,
                    backgroundColor: '#ff0000',
                    color: '#ffffff',
                    textAlign: 'center',
                    fontSize: 16,
                    borderRadius: 4
                }
            });

            button.onTap((res) => {
                button.destroy();
                if (res.userInfo) {
                    this.userInfo = res.userInfo;
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
}

/**
 * 分享管理器
 */
export class ShareManager {
    private static instance: ShareManager | null = null;

    private constructor() {}

    static getInstance(): ShareManager {
        if (!ShareManager.instance) {
            ShareManager.instance = new ShareManager();
        }
        return ShareManager.instance;
    }

    /**
     * 分享给好友
     */
    async shareToFriend(title: string, imageUrl?: string, query?: string): Promise<boolean> {
        if (!isWechatPlatform()) {
            console.log('分享给好友:', title);
            return true;
        }

        return new Promise((resolve) => {
            wx.shareAppMessage({
                title,
                imageUrl,
                query,
                success: () => {
                    resolve(true);
                },
                fail: () => {
                    resolve(false);
                }
            });
        });
    }

    /**
     * 分享到群
     */
    async shareToGroup(title: string, imageUrl?: string, query?: string): Promise<boolean> {
        if (!isWechatPlatform()) {
            console.log('分享到群:', title);
            return true;
        }

        return new Promise((resolve) => {
            wx.shareAppMessage({
                title,
                imageUrl,
                query,
                success: (res) => {
                    if (res.shareTickets && res.shareTickets.length > 0) {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                },
                fail: () => {
                    resolve(false);
                }
            });
        });
    }

    /**
     * 设置菜单分享信息
     */
    setupMenuShare(title: string, imageUrl?: string, query?: string): void {
        if (!isWechatPlatform()) {
            return;
        }

        wx.onShareAppMessage(() => {
            return {
                title,
                imageUrl,
                query
            };
        });
    }
}

/**
 * 排行榜管理器
 */
export class RankManager {
    private static instance: RankManager | null = null;

    private constructor() {}

    static getInstance(): RankManager {
        if (!RankManager.instance) {
            RankManager.instance = new RankManager();
        }
        return RankManager.instance;
    }

    /**
     * 上传分数
     */
    async uploadScore(score: number): Promise<boolean> {
        if (!isWechatPlatform()) {
            return true;
        }

        return new Promise((resolve) => {
            wx.setUserCloudStorage({
                KVDataList: [{
                    key: 'score',
                    value: JSON.stringify({
                        wxgame: {
                            score,
                            update_time: Date.now()
                        }
                    })
                }],
                success: () => {
                    resolve(true);
                },
                fail: () => {
                    resolve(false);
                }
            });
        });
    }

    /**
     * 获取好友排行榜
     */
    async getFriendRank(): Promise<RankItem[]> {
        if (!isWechatPlatform()) {
            return [];
        }

        return new Promise((resolve) => {
            wx.getFriendCloudStorage({
                keyList: ['score'],
                success: (res) => {
                    const data = res.data.map(item => {
                        const scoreData = JSON.parse(item.KVDataList[0]?.value || '{}');
                        return {
                            openid: item.openid,
                            nickname: item.nickname,
                            avatarUrl: item.avatarUrl,
                            score: scoreData.wxgame?.score || 0
                        };
                    }).sort((a, b) => b.score - a.score);

                    resolve(data);
                },
                fail: () => {
                    resolve([]);
                }
            });
        });
    }

    /**
     * 获取群排行榜
     */
    async getGroupRank(shareTicket: string): Promise<RankItem[]> {
        if (!isWechatPlatform()) {
            return [];
        }

        return new Promise((resolve) => {
            wx.getGroupCloudStorage({
                shareTicket,
                keyList: ['score'],
                success: (res) => {
                    const data = res.data.map(item => {
                        const scoreData = JSON.parse(item.KVDataList[0]?.value || '{}');
                        return {
                            openid: item.openid,
                            nickname: item.nickname,
                            avatarUrl: item.avatarUrl,
                            score: scoreData.wxgame?.score || 0
                        };
                    }).sort((a, b) => b.score - a.score);

                    resolve(data);
                },
                fail: () => {
                    resolve([]);
                }
            });
        });
    }
}

/**
 * 支付管理器
 */
export class PaymentManager {
    private static instance: PaymentManager | null = null;

    private validProducts = [
        'recruit_scroll',
        'resource_boost',
        'skin_unlock'
    ];

    private constructor() {}

    static getInstance(): PaymentManager {
        if (!PaymentManager.instance) {
            PaymentManager.instance = new PaymentManager();
        }
        return PaymentManager.instance;
    }

    /**
     * 检查产品是否有效
     */
    isValidProduct(productId: string): boolean {
        return this.validProducts.includes(productId);
    }

    /**
     * 发起支付
     */
    async pay(productId: string, price: number): Promise<boolean> {
        if (!this.isValidProduct(productId)) {
            console.error('无效的产品ID');
            return false;
        }

        if (!isWechatPlatform()) {
            console.log('模拟支付:', productId, price);
            return true;
        }

        return new Promise((resolve) => {
            wx.requestMidasPayment({
                mode: 'game',
                env: 0,
                offerId: productId,
                currencyType: 'CNY',
                platform: 'android',
                buyQuantity: 1,
                success: () => {
                    resolve(true);
                },
                fail: () => {
                    resolve(false);
                }
            });
        });
    }
}

/**
 * 防沉迷管理器
 */
export class AntiAddictionManager {
    private static instance: AntiAddictionManager | null = null;
    private playStartTime: number = 0;
    private maxPlayTime: number = 90 * 60 * 1000; // 1.5小时

    private constructor() {}

    static getInstance(): AntiAddictionManager {
        if (!AntiAddictionManager.instance) {
            AntiAddictionManager.instance = new AntiAddictionManager();
        }
        return AntiAddictionManager.instance;
    }

    /**
     * 开始计时
     */
    startTimer(): void {
        this.playStartTime = Date.now();
    }

    /**
     * 检查游戏时间
     */
    checkTimeLimit(): { exceeded: boolean; remainingTime: number } {
        const elapsed = Date.now() - this.playStartTime;
        const remaining = Math.max(0, this.maxPlayTime - elapsed);

        return {
            exceeded: elapsed >= this.maxPlayTime,
            remainingTime: remaining
        };
    }

    /**
     * 显示防沉迷提示
     */
    showTimeLimitAlert(): void {
        if (isWechatPlatform()) {
            wx.showModal({
                title: '健康游戏提醒',
                content: '您已连续游戏1.5小时，请适当休息。',
                showCancel: false,
                success: () => {
                    // 强制退出游戏
                }
            });
        } else {
            alert('您已连续游戏1.5小时，请适当休息。');
        }
    }
}

/**
 * 类型定义
 */
interface WechatUserInfo {
    nickName: string;
    avatarUrl: string;
    gender: number;
    city: string;
    province: string;
    country: string;
    language: string;
}

interface RankItem {
    openid: string;
    nickname: string;
    avatarUrl: string;
    score: number;
}