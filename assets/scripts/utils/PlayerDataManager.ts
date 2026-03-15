/**
 * MVP 简化版玩家数据管理器
 */

import {
    PlayerData,
    Faction,
    ResourceType
} from '../config/GameTypes';

/**
 * 简化版玩家数据
 */
export interface SimplePlayerData {
    id: string;
    name: string;
    level: number;
    gold: number;
    gems: number;
}

/**
 * 玩家数据管理器
 */
export class PlayerDataManager {
    private static instance: PlayerDataManager | null = null;
    private playerData: SimplePlayerData | null = null;

    private constructor() {}

    static getInstance(): PlayerDataManager {
        if (!PlayerDataManager.instance) {
            PlayerDataManager.instance = new PlayerDataManager();
        }
        return PlayerDataManager.instance;
    }

    /**
     * 创建新玩家
     */
    createNewPlayer(id: string, name: string): SimplePlayerData {
        this.playerData = {
            id,
            name,
            level: 1,
            gold: 10000,
            gems: 100
        };

        this.saveToLocal();
        return this.playerData;
    }

    /**
     * 获取玩家数据
     */
    getPlayerData(): SimplePlayerData | null {
        if (!this.playerData) {
            this.loadFromLocal();
        }
        return this.playerData;
    }

    /**
     * 增加金币
     */
    addGold(amount: number): void {
        if (this.playerData) {
            this.playerData.gold += amount;
            this.saveToLocal();
        }
    }

    /**
     * 消耗金币
     */
    useGold(amount: number): boolean {
        if (this.playerData && this.playerData.gold >= amount) {
            this.playerData.gold -= amount;
            this.saveToLocal();
            return true;
        }
        return false;
    }

    /**
     * 增加钻石
     */
    addGems(amount: number): void {
        if (this.playerData) {
            this.playerData.gems += amount;
            this.saveToLocal();
        }
    }

    /**
     * 消耗钻石
     */
    useGems(amount: number): boolean {
        if (this.playerData && this.playerData.gems >= amount) {
            this.playerData.gems -= amount;
            this.saveToLocal();
            return true;
        }
        return false;
    }

    /**
     * 保存到本地存储
     */
    private saveToLocal(): void {
        if (this.playerData) {
            try {
                const dataStr = JSON.stringify(this.playerData);
                localStorage.setItem('mvp_player_data', dataStr);
            } catch (e) {
                console.error('Failed to save player data:', e);
            }
        }
    }

    /**
     * 从本地存储加载
     */
    private loadFromLocal(): void {
        try {
            const dataStr = localStorage.getItem('mvp_player_data');
            if (dataStr) {
                this.playerData = JSON.parse(dataStr);
            }
        } catch (e) {
            console.error('Failed to load player data:', e);
        }
    }

    /**
     * 清除玩家数据
     */
    clearData(): void {
        this.playerData = null;
        localStorage.removeItem('mvp_player_data');
    }
}

/** 玩家数据管理器单例 */
export const playerDataManager = PlayerDataManager.getInstance();