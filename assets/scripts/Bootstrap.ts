/**
 * 启动引导脚本
 * MVP简化版
 */

import { _decorator, Component, Node, sys, game } from 'cc';

const { ccclass, property } = _decorator;

/**
 * Bootstrap - 游戏启动引导
 */
@ccclass('Bootstrap')
export class Bootstrap extends Component {

    start(): void {
        console.log('Bootstrap: 游戏启动引导开始');

        // 检查运行环境
        this.checkEnvironment();

        // 初始化存储
        this.initStorage();

        console.log('Bootstrap: 游戏启动引导完成');
    }

    /**
     * 检查运行环境
     */
    private checkEnvironment(): void {
        // 检测平台
        const isWechat = sys.platform === sys.Platform.WECHAT_GAME;
        const isNative = sys.isNative;

        console.log('运行环境:', {
            platform: isWechat ? '微信小游戏' : (isNative ? '原生' : '浏览器'),
            language: sys.language,
            os: sys.os,
            isNative: sys.isNative
        });

        // 微信小游戏特殊处理
        if (isWechat) {
            console.log('微信小游戏环境');
        }
    }

    /**
     * 初始化存储
     */
    private initStorage(): void {
        // 检查 localStorage 是否可用
        try {
            const testKey = '__test__';
            localStorage.setItem(testKey, '1');
            localStorage.removeItem(testKey);
            console.log('存储系统初始化成功');
        } catch (e) {
            console.warn('localStorage 不可用，将使用内存存储');
        }
    }

    /**
     * 应用进入后台
     */
    onHide(): void {
        console.log('应用进入后台');
    }

    /**
     * 应用回到前台
     */
    onShow(): void {
        console.log('应用回到前台');
    }
}