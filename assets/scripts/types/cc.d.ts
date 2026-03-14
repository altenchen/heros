/**
 * Cocos Creator 类型声明
 * 用于解决 TypeScript 编译时找不到 cc 模块的问题
 */

declare module 'cc' {
    // 核心装饰器
    export const _decorator: {
        ccclass: (name: string) => ClassDecorator;
        property: PropertyDecorator;
    };

    // 基础类型
    export class Component {
        node: Node;
        protected onLoad?(): void;
        protected start?(): void;
        protected update?(dt: number): void;
        protected lateUpdate?(dt: number): void;
        protected onDestroy?(): void;
        protected onEnable?(): void;
        protected onDisable?(): void;
        scheduleOnce(callback: () => void, delay?: number): void;
        schedule(callback: () => void, interval: number, repeat?: number, delay?: number): void;
        unschedule(callback: () => void): void;
    }

    export class Node {
        name: string;
        active: boolean;
        position: Vec3;
        scale: Vec3;
        rotation: Quat;
        parent: Node | null;
        children: Node[];
        layer: number;
        static EventType: {
            TOUCH_START: string;
            TOUCH_MOVE: string;
            TOUCH_END: string;
            TOUCH_CANCEL: string;
            MOUSE_DOWN: string;
            MOUSE_UP: string;
            MOUSE_MOVE: string;
        };
        addChild(child: Node): void;
        removeChild(child: Node): void;
        removeAllChildren(): void;
        getChildByName(name: string): Node | null;
        getChildByPath(path: string): Node | null;
        getComponent<T extends Component>(component: new (...args: any[]) => T): T | null;
        getComponentInChildren<T extends Component>(component: new (...args: any[]) => T): T | null;
        getComponentsInChildren<T extends Component>(component: new (...args: any[]) => T): T[];
        setPosition(x: number, y?: number, z?: number): void;
        getPosition(): Vec3;
        on(type: string, callback: Function, target?: any): void;
        off(type: string, callback: Function, target?: any): void;
        emit(type: string, ...args: any[]): void;
        destroy(): void;
    }

    export class Vec3 {
        x: number;
        y: number;
        z: number;
        constructor(x?: number, y?: number, z?: number);
        static ZERO: Vec3;
        static ONE: Vec3;
        set(x: number, y?: number, z?: number): Vec3;
        clone(): Vec3;
    }

    export class Quat {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x?: number, y?: number, z?: number, w?: number);
    }

    export class Color {
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(r?: number, g?: number, b?: number, a?: number);
        static WHITE: Color;
        static BLACK: Color;
        static RED: Color;
        static GREEN: Color;
        static BLUE: Color;
        static YELLOW: Color;
        static TRANSPARENT: Color;
    }

    export class Label extends Component {
        string: string;
        fontSize: number;
        lineHeight: number;
        color: Color;
        horizontalAlign: number;
        verticalAlign: number;
        overflow: number;
        enableWrapText: boolean;
    }

    export class Sprite extends Component {
        spriteFrame: SpriteFrame | null;
        color: Color;
        type: number;
        sizeMode: number;
    }

    export class Button extends Component {
        interactable: boolean;
        node: Node;
        static EventType: {
            CLICK: string;
        };
    }

    export class ScrollView extends Component {
        content: Node | null;
        horizontal: boolean;
        vertical: boolean;
        inertia: boolean;
        elastic: boolean;
        scrollToBottom(timeInSecond?: number, attenuated?: boolean): void;
        scrollToTop(timeInSecond?: number, attenuated?: boolean): void;
    }

    export class ProgressBar extends Component {
        progress: number;
        barSprite: Sprite | null;
        mode: number;
        reverse: boolean;
    }

    export class EditBox extends Component {
        string: string;
        placeholder: string;
        maxLength: number;
        inputFlag: number;
        inputMode: number;
        returnType: number;
    }

    export class Toggle extends Component {
        isChecked: boolean;
        node: Node;
    }

    export class Slider extends Component {
        progress: number;
        node: Node;
    }

    export class PageView extends Component {
        currentIndex: number;
        pages: Node[];
        scrollToPage(index: number, timeInSecond?: number): void;
    }

    export class Layout extends Component {
        type: number;
        resizeMode: number;
        horizontalDirection: number;
        verticalDirection: number;
        cellSize: Vec3;
        startAxis: number;
        padding: number;
        spacingX: number;
        spacingY: number;
    }

    export class Widget extends Component {
        isAlignLeft: boolean;
        isAlignRight: boolean;
        isAlignTop: boolean;
        isAlignBottom: boolean;
        left: number;
        right: number;
        top: number;
        bottom: number;
    }

    export class SpriteFrame {
        name: string;
    }

    export class Prefab {
        name: string;
        data: Node;
    }

    export class Asset {
        name: string;
    }

    export class AudioClip extends Asset {
        duration: number;
    }

    export class AnimationClip extends Asset {
        duration: number;
        speed: number;
    }

    export class Material extends Asset {}

    // 工具函数
    export function instantiate<T extends Asset>(asset: T): T;
    export function clamp(value: number, min: number, max: number): number;
    export function lerp(a: number, b: number, t: number): number;

    // 资源加载
    export class resources {
        static load(path: string, callback: (err: Error | null, asset: Asset) => void): void;
        static load<T extends Asset>(path: string, type: new (...args: any[]) => T, callback: (err: Error | null, asset: T) => void): void;
        static loadDir(path: string, callback: (err: Error | null, assets: Asset[]) => void): void;
        static release(path: string): void;
    }

    // 导演
    export class director {
        static loadScene(sceneName: string, onLaunched?: (err: Error | null) => void): void;
        static getScene(): Scene | null;
        static getDeltaTime(): number;
        static getRunningScene(): Scene | null;
    }

    export class Scene {
        name: string;
        children: Node[];
    }

    // 系统事件
    export class sys {
        static isNative: boolean;
        static isMobile: boolean;
        static platform: string;
        static language: string;
        static os: string;
    }

    // 数学工具
    export class Math {
        static toRadian(degree: number): number;
        static toDegree(radian: number): number;
        static random(): number;
        static randomRange(min: number, max: number): number;
        static randomRangeInt(min: number, max: number): number;
    }
}