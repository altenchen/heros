/**
 * 资源管理器
 * 管理游戏资源的加载、缓存和释放
 */

import { EventCenter, GameEvent } from './EventTarget';

/**
 * 资源类型
 */
export enum ResourceType {
    IMAGE = 'image',
    AUDIO = 'audio',
    JSON = 'json',
    PREFAB = 'prefab',
    SPINE = 'spine',
    TEXT = 'text'
}

/**
 * 资源信息
 */
interface ResourceInfo {
    path: string;
    type: ResourceType;
    loaded: boolean;
    data: any;
    references: number;
}

/**
 * 资源管理器
 */
export class ResourceManager {
    private static instance: ResourceManager | null = null;
    private resources: Map<string, ResourceInfo> = new Map();
    private loadingPromises: Map<string, Promise<any>> = new Map();
    private baseUrl: string = '';

    private constructor() {}

    static getInstance(): ResourceManager {
        if (!ResourceManager.instance) {
            ResourceManager.instance = new ResourceManager();
        }
        return ResourceManager.instance;
    }

    /**
     * 设置资源基础路径
     */
    setBaseUrl(url: string): void {
        this.baseUrl = url;
    }

    /**
     * 加载资源
     */
    async load<T>(path: string, type: ResourceType): Promise<T> {
        const fullPath = this.baseUrl + path;

        // 检查是否已加载
        const cached = this.resources.get(fullPath);
        if (cached && cached.loaded) {
            cached.references++;
            return cached.data as T;
        }

        // 检查是否正在加载
        const loading = this.loadingPromises.get(fullPath);
        if (loading) {
            return loading as Promise<T>;
        }

        // 开始加载
        const loadPromise = this.doLoad<T>(fullPath, type);
        this.loadingPromises.set(fullPath, loadPromise);

        try {
            const data = await loadPromise;
            this.loadingPromises.delete(fullPath);
            return data;
        } catch (e) {
            this.loadingPromises.delete(fullPath);
            throw e;
        }
    }

    /**
     * 执行加载
     */
    private async doLoad<T>(path: string, type: ResourceType): Promise<T> {
        return new Promise((resolve, reject) => {
            const resourceInfo: ResourceInfo = {
                path,
                type,
                loaded: false,
                data: null,
                references: 1
            };

            switch (type) {
                case ResourceType.IMAGE:
                    this.loadImage(path)
                        .then(img => {
                            resourceInfo.data = img;
                            resourceInfo.loaded = true;
                            this.resources.set(path, resourceInfo);
                            resolve(img as T);
                        })
                        .catch(reject);
                    break;

                case ResourceType.JSON:
                    this.loadJson(path)
                        .then(json => {
                            resourceInfo.data = json;
                            resourceInfo.loaded = true;
                            this.resources.set(path, resourceInfo);
                            resolve(json as T);
                        })
                        .catch(reject);
                    break;

                case ResourceType.AUDIO:
                    this.loadAudio(path)
                        .then(audio => {
                            resourceInfo.data = audio;
                            resourceInfo.loaded = true;
                            this.resources.set(path, resourceInfo);
                            resolve(audio as T);
                        })
                        .catch(reject);
                    break;

                case ResourceType.TEXT:
                    this.loadText(path)
                        .then(text => {
                            resourceInfo.data = text;
                            resourceInfo.loaded = true;
                            this.resources.set(path, resourceInfo);
                            resolve(text as T);
                        })
                        .catch(reject);
                    break;

                default:
                    reject(new Error(`Unsupported resource type: ${type}`));
            }
        });
    }

    /**
     * 加载图片
     */
    private loadImage(path: string): Promise<HTMLImageElement> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error(`Failed to load image: ${path}`));
            img.src = path;
        });
    }

    /**
     * 加载JSON
     */
    private async loadJson(path: string): Promise<any> {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load json: ${path}`);
        }
        return response.json();
    }

    /**
     * 加载文本
     */
    private async loadText(path: string): Promise<string> {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Failed to load text: ${path}`));
        }
        return response.text();
    }

    /**
     * 加载音频
     */
    private loadAudio(path: string): Promise<HTMLAudioElement> {
        return new Promise((resolve, reject) => {
            const audio = new Audio();
            audio.oncanplaythrough = () => resolve(audio);
            audio.onerror = () => reject(new Error(`Failed to load audio: ${path}`));
            audio.src = path;
        });
    }

    /**
     * 批量加载资源
     */
    async loadBatch(resources: { path: string; type: ResourceType }[]): Promise<void> {
        const promises = resources.map(r => this.load(r.path, r.type));
        await Promise.all(promises);
    }

    /**
     * 获取已加载的资源
     */
    get<T>(path: string): T | null {
        const fullPath = this.baseUrl + path;
        const resource = this.resources.get(fullPath);
        return resource ? resource.data as T : null;
    }

    /**
     * 释放资源
     */
    release(path: string): void {
        const fullPath = this.baseUrl + path;
        const resource = this.resources.get(fullPath);

        if (resource) {
            resource.references--;
            if (resource.references <= 0) {
                this.resources.delete(fullPath);
            }
        }
    }

    /**
     * 释放所有资源
     */
    releaseAll(): void {
        this.resources.clear();
    }

    /**
     * 获取资源加载进度
     */
    getLoadingProgress(): { loaded: number; total: number } {
        const total = this.resources.size + this.loadingPromises.size;
        const loaded = this.resources.size;
        return { loaded, total };
    }
}

/**
 * 资源加载器（便捷方法）
 */
export const resources = {
    load: <T>(path: string, type: ResourceType): Promise<T> => {
        return ResourceManager.getInstance().load<T>(path, type);
    },

    loadJson: (path: string): Promise<any> => {
        return ResourceManager.getInstance().load(path, ResourceType.JSON);
    },

    loadImage: (path: string): Promise<HTMLImageElement> => {
        return ResourceManager.getInstance().load(path, ResourceType.IMAGE);
    },

    loadAudio: (path: string): Promise<HTMLAudioElement> => {
        return ResourceManager.getInstance().load(path, ResourceType.AUDIO);
    },

    get: <T>(path: string): T | null => {
        return ResourceManager.getInstance().get<T>(path);
    },

    release: (path: string): void => {
        ResourceManager.getInstance().release(path);
    }
};