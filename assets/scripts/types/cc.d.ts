/**
 * Cocos Creator 类型声明
 * 用于解决 TypeScript 编译时找不到 cc 模块的问题
 */

declare module 'cc' {
    // ==================== 核心装饰器 ====================
    export const _decorator: {
        ccclass: (name?: string) => ClassDecorator;
        property: PropertyDecorator & {
            (type: any): PropertyDecorator;
            (options: PropertyOptions): PropertyDecorator;
        };
    };

    export interface PropertyOptions {
        type?: any;
        visible?: boolean;
        displayName?: string;
        tooltip?: string;
        min?: number;
        max?: number;
        step?: number;
        range?: [number, number] | [number, number, number];
        readonly?: boolean;
        serializable?: boolean;
        slide?: boolean;
    }

    // ==================== 核心类 ====================
    export class Component {
        node: Node;
        name: string;
        isValid: boolean;
        enabled: boolean;

        onLoad?(): void;
        start?(): void;
        update?(dt: number): void;
        lateUpdate?(dt: number): void;
        onDestroy?(): void;
        onEnable?(): void;
        onDisable?(): void;

        schedule(callback: Function, interval?: number, repeat?: number, delay?: number): void;
        scheduleOnce(callback: Function, delay?: number): void;
        unschedule(callback: Function): void;
        unscheduleAllCallbacks(): void;

        getComponent<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponent(type: string | Function): Component | null;
        getComponents<T extends Component>(type: new (...args: any[]) => T): T[];
        getComponents(type: string | Function): Component[];
        getComponentInChildren<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponentsInChildren<T extends Component>(type: new (...args: any[]) => T): T[];
    }

    export class Node {
        name: string;
        uuid: string;
        active: boolean;
        parent: Node | null;
        children: Node[];
        scale: Vec3;
        position: Vec3;
        eulerAngles: Vec3;
        width: number;
        height: number;
        isValid: boolean;
        layer: number;

        constructor(name?: string);

        getComponent<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponent(type: string | Function): Component | null;
        getComponents<T extends Component>(type: new (...args: any[]) => T): T[];
        getComponents(type: string | Function): Component[];
        getComponentInChildren<T extends Component>(type: new (...args: any[]) => T): T | null;
        getComponentsInChildren<T extends Component>(type: new (...args: any[]) => T): T[];

        addChild(child: Node): void;
        removeChild(child: Node): void;
        removeFromParent(): void;
        setParent(parent: Node | null, worldPositionStays?: boolean): void;
        destroy(): boolean;
        removeAllChildren(): void;
        destroyAllChildren(): void;
        addComponent<T extends Component>(type: new (...args: any[]) => T): T;
        addComponent(type: string | Function): Component;

        on(type: string, callback: Function, target?: any): void;
        on(type: 'touch-start' | 'touch-move' | 'touch-end' | 'touch-cancel', callback: (event: EventTouch) => void, target?: any): void;
        off(type: string, callback: Function, target?: any): void;
        emit(type: string, ...args: any[]): void;

        setPosition(x: number, y: number, z?: number): void;
        setPosition(pos: Vec3): void;
        getPosition(): Vec3;
        setScale(x: number, y: number, z?: number): void;
        setScale(scale: Vec3): void;
        getScale(): Vec3;

        getChildByName(name: string): Node | null;
        getChildByPath(path: string): Node | null;

        getSiblingIndex(): number;
        setSiblingIndex(index: number): void;

        static EventType: {
            TRANSFORM_CHANGED: string;
            SIZE_CHANGED: string;
            ANCHOR_CHANGED: string;
            ACTIVE_IN_HIERARCHY_CHANGED: string;
            CHILD_ADDED: string;
            CHILD_REMOVED: string;
            CHILD_REORDER: string;
            GROUP_CHANGED: string;
            TOUCH_START: string;
            TOUCH_MOVE: string;
            TOUCH_END: string;
            TOUCH_CANCEL: string;
            MOUSE_DOWN: string;
            MOUSE_UP: string;
            MOUSE_MOVE: string;
            MOUSE_WHEEL: string;
        };
    }

    // ==================== 数学类型 ====================
    export class Vec3 {
        x: number;
        y: number;
        z: number;

        static readonly ZERO: Vec3;
        static readonly ONE: Vec3;
        static readonly UNIT_X: Vec3;
        static readonly UNIT_Y: Vec3;
        static readonly UNIT_Z: Vec3;

        constructor(x?: number, y?: number, z?: number);

        set(x: number, y: number, z?: number): Vec3;
        clone(): Vec3;
        add(other: Vec3): Vec3;
        subtract(other: Vec3): Vec3;
        multiply(other: Vec3): Vec3;
        normalize(): Vec3;
        length(): number;

        static add(out: Vec3, a: Vec3, b: Vec3): Vec3;
        static subtract(out: Vec3, a: Vec3, b: Vec3): Vec3;
        static multiply(out: Vec3, a: Vec3, b: Vec3): Vec3;
        static normalize(out: Vec3, a: Vec3): Vec3;
        static distance(a: Vec3, b: Vec3): number;
    }

    export class Vec2 {
        x: number;
        y: number;

        static readonly ZERO: Vec2;
        static readonly ONE: Vec2;

        constructor(x?: number, y?: number);

        set(x: number, y: number): Vec2;
        clone(): Vec2;
        add(other: Vec2): Vec2;

        static distance(a: Vec2, b: Vec2): number;
    }

    export class Color {
        r: number;
        g: number;
        b: number;
        a: number;

        static readonly WHITE: Color;
        static readonly BLACK: Color;
        static readonly RED: Color;
        static readonly GREEN: Color;
        static readonly BLUE: Color;
        static readonly YELLOW: Color;
        static readonly GRAY: Color;
        static readonly CYAN: Color;
        static readonly MAGENTA: Color;
        static readonly ORANGE: Color;
        static readonly TRANSPARENT: Color;

        constructor(r?: number, g?: number, b?: number, a?: number);

        set(r: number, g: number, b: number, a?: number): Color;
        clone(): Color;
    }

    export class Size {
        width: number;
        height: number;

        constructor(width?: number, height?: number);
        clone(): Size;
    }

    export class Rect {
        x: number;
        y: number;
        width: number;
        height: number;

        constructor(x?: number, y?: number, width?: number, height?: number);
        contains(point: Vec2): boolean;
    }

    export class Quat {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x?: number, y?: number, z?: number, w?: number);
    }

    // ==================== UI组件 ====================
    export class Label extends Component {
        string: string;
        fontSize: number;
        lineHeight: number;
        color: Color;
        horizontalAlign: number;
        verticalAlign: number;
        overflow: number;
        enableWrapText: boolean;
        fontFamily: string;
    }

    export class Sprite extends Component {
        spriteFrame: SpriteFrame | null;
        color: Color;
        type: number;
        sizeMode: number;
    }

    export class Button extends Component {
        interactable: boolean;
        transition: number;
        normalColor: Color;
        pressedColor: Color;
        hoverColor: Color;
        disabledColor: Color;
        zoomScale: number;
        target: Node | null;
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
        totalLength: number;
    }

    export class EditBox extends Component {
        string: string;
        placeholder: string;
        maxLength: number;
        inputFlag: number;
        inputMode: number;
        returnType: number;
        fontSize: number;
        fontColor: Color;
    }

    export class Toggle extends Component {
        isChecked: boolean;
        checkMark: Sprite | null;
        node: Node;
    }

    export class Slider extends Component {
        progress: number;
        handle: Node | null;
        direction: number;
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
        cellSize: Size;
        startAxis: number;
        padding: number;
        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;
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

    export class Mask extends Component {
        type: number;
        spriteFrame: SpriteFrame | null;
        inverted: boolean;
    }

    export class UITransform extends Component {
        width: number;
        height: number;
        anchorX: number;
        anchorY: number;
        contentSize: Size;

        setContentSize(width: number, height: number): void;
        setContentSize(size: Size): void;
        getContentSize(): Size;
        convertToWorldSpaceAR(point: Vec3): Vec3;
        convertToNodeSpaceAR(point: Vec3): Vec3;
    }

    // ==================== 资源类 ====================
    export class Asset {
        name: string;
        isValid: boolean;
        destroy(): void;
    }

    export class SpriteFrame extends Asset {
        rect: Rect;
        originalSize: Size;
        offset: Vec2;
        rotated: boolean;
    }

    export class Texture2D extends Asset {
        width: number;
        height: number;
    }

    export class Prefab extends Asset {
        data: Node;
    }

    export class AudioClip extends Asset {
        duration: number;
    }

    export class AnimationClip extends Asset {
        duration: number;
        speed: number;
    }

    export class Material extends Asset {}

    // ==================== 工具函数 ====================
    export function instantiate(original: Prefab): Node;
    export function instantiate<T extends Asset>(original: T): T;
    export function clamp(value: number, min: number, max: number): number;
    export function lerp(a: number, b: number, t: number): number;
    export function find(path: string): Node | null;

    // ==================== 资源加载 ====================
    export class resources {
        static load(path: string, callback: (err: Error | null, asset: Asset) => void): void;
        static load<T extends Asset>(path: string, type: new (...args: any[]) => T, callback: (err: Error | null, asset: T) => void): void;
        static loadDir(path: string, callback: (err: Error | null, assets: Asset[]) => void): void;
        static release(path: string): void;
        static releaseAsset(asset: Asset): void;
    }

    export class loader {
        static load<T extends Asset>(url: string, callback: (err: Error | null, asset: T) => void): void;
        static load(url: string, options: any, callback: (err: Error | null, asset: Asset) => void): void;
        static release(url: string): void;
    }

    export class assetManager {
        static loadAny(urls: string | string[], callback: (err: Error | null, assets: any) => void): void;
        static releaseAsset(asset: Asset): void;
        static getBundle(name: string): AssetManager.Bundle | null;
        loadBundle(name: string, callback: (err: Error | null, bundle: AssetManager.Bundle) => void): void;
    }

    export namespace AssetManager {
        interface Bundle {
            name: string;
            load<T extends Asset>(path: string, type: new (...args: any[]) => T, callback: (err: Error | null, asset: T) => void): void;
            load(path: string, callback: (err: Error | null, asset: Asset) => void): void;
            release(path: string): void;
        }
    }

    // ==================== 动画系统 ====================
    export class tween<T> {
        constructor(target: T);

        to(duration: number, props: any, opts?: any): tween<T>;
        by(duration: number, props: any, opts?: any): tween<T>;
        delay(duration: number): tween<T>;
        call(callback: Function): tween<T>;
        repeat(times: number, tween?: tween<T>): tween<T>;
        repeatForever(tween: tween<T>): tween<T>;
        sequence(...tweens: tween<T>[]): tween<T>;
        parallel(...tweens: tween<T>[]): tween<T>;
        start(): tween<T>;
        stop(): tween<T>;

        static tween<T>(target: T): tween<T>;
        static stopAll(): void;
        static stopAllByTarget(target: any): void;
    }

    // ==================== 输入系统 ====================
    export class input {
        static on(type: string, callback: Function, target?: any): void;
        static off(type: string, callback: Function, target?: any): void;
    }

    export class Event {
        type: string;
        bubbles: boolean;
        target: any;
        currentTarget: any;

        constructor(type: string, bubbles?: boolean);
        stopPropagation(): void;
        stopImmediatePropagation(): void;
    }

    export class EventTouch extends Event {
        touch: Touch | null;
        touches: Touch[];
        allTouches: Touch[];

        getUILocation(): Vec2;
        getUIStartLocation(): Vec2;
        getLocation(): Vec2;
        getStartLocation(): Vec2;
        getDelta(): Vec2;
    }

    export class Touch {
        id: number;
        getLocation(): Vec2;
        getStartLocation(): Vec2;
        getUILocation(): Vec2;
        getUIStartLocation(): Vec2;
        getDelta(): Vec2;
    }

    // ==================== 游戏系统 ====================
    export class game {
        static frameTime: number;
        static deltaTime: number;
        static timeScale: number;
        static totalFrames: number;
        static isPersistRootNode(node: Node): boolean;
        static addPersistRootNode(node: Node): void;
        static removePersistRootNode(node: Node): void;

        static on(type: string, callback: Function, target?: any): void;
        static off(type: string, callback?: Function, target?: any): void;
        static pause(): void;
        static resume(): void;
        static end(): void;
    }

    export class director {
        static loadScene(sceneName: string, onLaunched?: (err: Error | null) => void): void;
        static preloadScene(sceneName: string, onProgress?: Function, onLoaded?: Function): void;
        static getScene(): Scene | null;
        static getSceneByName(sceneName: string): Scene | null;
        static getRunningScene(): Scene | null;
        static getDeltaTime(): number;
        static pause(): void;
        static resume(): void;

        static on(type: string, callback: Function, target?: any): void;
        static off(type: string, callback?: Function, target?: any): void;
    }

    export class Scene extends Asset {
        name: string;
        children: Node[];
        nodes: Node[];

        getChildByName(name: string): Node | null;
    }

    // ==================== 系统信息 ====================
    export class sys {
        static platform: string;
        static language: string;
        static languageCode: string;
        static isNative: boolean;
        static isMobile: boolean;
        static os: string;
        static osVersion: string;
        static networkType: string;
        static localStorage: Storage;
    }

    export class macro {
        static KEY: Record<string, number>;
        static MOUSE_BUTTON: Record<string, number>;
    }

    // ==================== 数学工具 ====================
    export namespace math {
        function clamp(value: number, min: number, max: number): number;
        function clamp01(value: number): number;
        function lerp(from: number, to: number, ratio: number): number;
        function random(): number;
        function randomRange(min: number, max: number): number;
        function randomRangeInt(min: number, max: number): number;
        function toRadian(degree: number): number;
        function toDegree(radian: number): number;
    }

    // ==================== 调试工具 ====================
    export class debug {
        static setDisplayStats(show: boolean): void;
        static isDisplayStats(): boolean;
    }

    export function log(message?: any, ...optionalParams: any[]): void;
    export function warn(message?: any, ...optionalParams: any[]): void;
    export function error(message?: any, ...optionalParams: any[]): void;
}