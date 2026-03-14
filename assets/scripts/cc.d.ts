/**
 * Cocos Creator 类型存根
 * 用于在非编辑器环境下提供类型定义
 */

declare module 'cc' {
    // ==================== 核心装饰器 ====================
    export const ccclass: (name?: string) => ClassDecorator;
    export const property: PropertyDecorator & MethodDecorator & {
        (options?: PropertyOptions): PropertyDecorator & MethodDecorator;
        (type: any): PropertyDecorator & MethodDecorator;
    };

    export const _decorator: {
        ccclass: (name?: string) => ClassDecorator;
        property: PropertyDecorator & MethodDecorator & {
            (options?: PropertyOptions): PropertyDecorator & MethodDecorator;
            (type: any): PropertyDecorator & MethodDecorator;
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
        formerlySerializedAs?: string;
        group?: { name: string; id: string } | string;
        slide?: boolean;
        unit?: string;
        multiline?: boolean;
        editable?: boolean;
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

        getComponent<T extends Component>(type: Constructor<T>): T | null;
        getComponent(type: string): Component | null;
        getComponents<T extends Component>(type: Constructor<T>): T[];
        getComponents(type: string): Component[];

        addChild(node: Node): void;
        removeChild(node: Node): void;

        // UI扩展方法（UIButton等组件提供）
        setEnabled?(enabled: boolean): void;
        setOnClick?(callback: (data?: any) => void, data?: any): void;
        setLabel?(text: string): void;
        setText?(text: string): void;
        setIcon?(spriteFrame: any): void;
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

        constructor(name?: string);

        getComponent<T extends Component>(type: Constructor<T>): T | null;
        getComponent(type: string | Function): Component | null;
        getComponents<T extends Component>(type: Constructor<T>): T[];
        getComponents(type: string | Function): Component[];

        getComponentInChildren<T extends Component>(type: Constructor<T>): T | null;
        getComponentInChildren(type: string | Function): Component | null;
        getComponentsInChildren<T extends Component>(type: Constructor<T>): T[];
        getComponentsInChildren(type: string | Function): Component[];

        addChild(child: Node): void;
        removeChild(child: Node): void;
        removeFromParent(): void;
        destroy(): boolean;

        addComponent<T extends Component>(type: Constructor<T>): T;
        addComponent(type: string | Function): Component;

        setParent(parent: Node | null, worldPositionStays?: boolean): void;

        on(type: string, callback: Function, target?: any): void;
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

        removeAllChildren(): void;
        destroyAllChildren(): void;

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
            MOUSE_ENTER: string;
            MOUSE_LEAVE: string;
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
        divide(other: Vec3): Vec3;
        normalize(): Vec3;
        length(): number;
        lengthSqr(): number;

        static add(out: Vec3, a: Vec3, b: Vec3): Vec3;
        static subtract(out: Vec3, a: Vec3, b: Vec3): Vec3;
        static multiply(out: Vec3, a: Vec3, b: Vec3): Vec3;
        static divide(out: Vec3, a: Vec3, b: Vec3): Vec3;
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
        subtract(other: Vec2): Vec2;
        multiply(other: Vec2): Vec2;

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
        static readonly TRANSPARENT: Color;
        static readonly CYAN: Color;
        static readonly MAGENTA: Color;
        static readonly ORANGE: Color;

        constructor(r?: number, g?: number, b?: number, a?: number);

        set(r: number, g: number, b: number, a?: number): Color;
        clone(): Color;
        toHEX(): string;
        toRGBValue(): number;
    }

    // ==================== UI组件 ====================
    export class Label extends Component {
        string: string;
        fontSize: number;
        lineHeight: number;
        horizontalAlign: HorizontalTextAlignment;
        verticalAlign: VerticalTextAlignment;
        color: Color;
        enableWrapText: boolean;
        overflow: Overflow;
        fontFamily: string;
        cacheMode: CacheMode;
    }

    export enum HorizontalTextAlignment {
        LEFT = 0,
        CENTER = 1,
        RIGHT = 2
    }

    export enum VerticalTextAlignment {
        TOP = 0,
        CENTER = 1,
        BOTTOM = 2
    }

    export enum Overflow {
        NONE = 0,
        CLAMP = 1,
        SHRINK = 2,
        RESIZE_HEIGHT = 3
    }

    export enum CacheMode {
        NONE = 0,
        BITMAP = 1,
        CHAR = 2
    }

    export class Sprite extends Component {
        spriteFrame: SpriteFrame | null;
        type: SpriteFrameType;
        sizeMode: SizeMode;
        color: Color;
    }

    export enum SpriteFrameType {
        SIMPLE = 0,
        SLICED = 1,
        TILED = 2,
        FILLED = 3
    }

    export enum SizeMode {
        CUSTOM = 0,
        FIT = 1,
        RAW = 2
    }

    export class Button extends Component {
        interactable: boolean;
        transition: Transition;
        normalColor: Color;
        pressedColor: Color;
        hoverColor: Color;
        disabledColor: Color;
        duration: number;
        zoomScale: number;
        target: Node | null;

        node: Node & {
            on(type: 'click', callback: Function, target?: any): void;
        };

        static EventType: {
            CLICK: string;
            TOGGLE: string;
        };
    }

    export enum Transition {
        NONE = 0,
        COLOR = 1,
        SPRITE = 2,
        SCALE = 3
    }

    export class EditBox extends Component {
        string: string;
        placeholder: string;
        inputMode: InputMode;
        inputFlag: InputFlag;
        maxLength: number;
        returnType: KeyboardReturnType;
        tabIndex: number;
        textHorizontalAlignment: HorizontalTextAlignment;
        textVerticalAlignment: VerticalTextAlignment;
        fontSize: number;
        fontColor: Color;
        placeholderFontSize: number;
        placeholderFontColor: Color;
        backgroundImage: SpriteFrame | null;

        focus(): void;
        blur(): void;
    }

    export enum InputMode {
        ANY = 0,
        EMAIL_ADDR = 1,
        NUMERIC = 2,
        PHONE_NUMBER = 3,
        URL = 4,
        DECIMAL = 5,
        SINGLE_LINE = 6
    }

    export enum InputFlag {
        PASSWORD = 0,
        SENSITIVE = 1,
        INITIAL_CAPS_WORD = 2,
        INITIAL_CAPS_SENTENCE = 3,
        INITIAL_CAPS_ALL_CHARACTERS = 4,
        LOW_ALL_CHARACTERS = 5
    }

    export enum KeyboardReturnType {
        DEFAULT = 0,
        DONE = 1,
        SEND = 2,
        SEARCH = 3,
        GO = 4,
        NEXT = 5
    }

    export class ScrollView extends Component {
        content: Node | null;
        horizontal: boolean;
        vertical: boolean;
        inertia: boolean;
        elastic: boolean;
        bounceDuration: number;
        brake: number;
        horizontalScrollBar: ScrollBar | null;
        verticalScrollBar: ScrollBar | null;
        scrollEvents: ScrollEventHandler[];
    }

    export interface ScrollEventHandler {
        target: Component | null;
        component: string;
        handler: string;
        customEventData: string;
    }

    export class ScrollBar extends Component {}

    export class Layout extends Component {
        type: LayoutType;
        resizeMode: ResizeMode;
        horizontalDirection: HorizontalDirection;
        verticalDirection: VerticalDirection;
        cellSize: Size;
        startAxis: AxisDirection;
        padding: number;
        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;
        spacingX: number;
        spacingY: number;
        horizontalGap: number;
        verticalGap: number;
        affectedByScale: boolean;
        autoResize: boolean;
    }

    export enum LayoutType {
        NONE = 0,
        HORIZONTAL = 1,
        VERTICAL = 2,
        GRID = 3
    }

    export enum ResizeMode {
        NONE = 0,
        CONTAINER = 1,
        CHILDREN = 2
    }

    export enum HorizontalDirection {
        LEFT_TO_RIGHT = 0,
        RIGHT_TO_LEFT = 1
    }

    export enum VerticalDirection {
        TOP_TO_BOTTOM = 0,
        BOTTOM_TO_TOP = 1
    }

    export enum AxisDirection {
        HORIZONTAL = 0,
        VERTICAL = 1
    }

    export class ProgressBar extends Component {
        barSprite: Sprite | null;
        mode: ProgressBarMode;
        totalLength: number;
        progress: number;
        reverse: boolean;
    }

    export enum ProgressBarMode {
        HORIZONTAL = 0,
        VERTICAL = 1,
        FILLED = 2
    }

    export class Slider extends Component {
        handle: Node | null;
        direction: SliderDirection;
        progress: number;
        slideEvents: SliderEventHandler[];
    }

    export enum SliderDirection {
        HORIZONTAL = 0,
        VERTICAL = 1
    }

    export interface SliderEventHandler {
        target: Component | null;
        component: string;
        handler: string;
        customEventData: string;
    }

    export class Toggle extends Component {
        isChecked: boolean;
        checkMark: Sprite | null;
        toggleGroup: ToggleGroup | null;
        checkEvents: ToggleEventHandler[];
    }

    export interface ToggleEventHandler {
        target: Component | null;
        component: string;
        handler: string;
        customEventData: string;
    }

    export class ToggleGroup extends Component {}

    export class Mask extends Component {
        type: MaskType;
        spriteFrame: SpriteFrame | null;
        threshold: number;
        inverted: boolean;
        segments: number;
    }

    export enum MaskType {
        RECT = 0,
        ELLIPSE = 1,
        GRAPHICS_STENCIL = 2,
        SPRITE_STENCIL = 3
    }

    export class Graphics extends Component {
        fillColor: Color;
        strokeColor: Color;
        lineWidth: number;

        clear(): void;
        close(): void;
        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void;
        quadraticCurveTo(cx: number, cy: number, x: number, y: number): void;
        arc(cx: number, cy: number, r: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
        ellipse(cx: number, cy: number, rx: number, ry: number): void;
        circle(cx: number, cy: number, r: number): void;
        rect(x: number, y: number, w: number, h: number): void;
        roundRect(x: number, y: number, w: number, h: number, r: number): void;
        fill(): void;
        stroke(): void;
    }

    export class UIOpacity extends Component {
        opacity: number;
    }

    export class UITransform extends Component {
        width: number;
        height: number;
        anchorX: number;
        anchorY: number;
        priority: number;
        contentSize: Size;

        setContentSize(width: number, height: number): void;
        setContentSize(size: Size): void;
        getContentSize(): Size;

        convertToWorldSpaceAR(point: Vec3): Vec3;
        convertToNodeSpaceAR(point: Vec3): Vec3;
        getBoundingBox(): Rect;
        getBoundingBoxToWorld(): Rect;
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

        texture: Texture2D | null;
    }

    export class Texture2D extends Asset {
        width: number;
        height: number;
    }

    export class Prefab extends Asset {
        data: Node;

        instantiate(): Node;
    }

    // ==================== 工具类 ====================
    export class Size {
        width: number;
        height: number;

        constructor(width?: number, height?: number);

        set(width: number, height: number): Size;
        clone(): Size;
        equals(other: Size): boolean;
    }

    export class Rect {
        x: number;
        y: number;
        width: number;
        height: number;

        constructor(x?: number, y?: number, width?: number, height?: number);

        contains(point: Vec2): boolean;
        intersects(rect: Rect): boolean;
        union(rect: Rect): Rect;
        clone(): Rect;
    }

    // ==================== 加载器 ====================
    export class resources {
        static load<T extends Asset>(path: string, type: Constructor<T>, callback: (err: Error | null, asset: T) => void): void;
        static load(path: string, callback: (err: Error | null, asset: Asset) => void): void;
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
    }

    // ==================== 动画系统 ====================
    export class tween<T> {
        constructor(target: T);

        to(duration: number, props: any, opts?: TweenOptions): tween<T>;
        by(duration: number, props: any, opts?: TweenOptions): tween<T>;
        toWorldPosition(duration: number, position: Vec3, opts?: TweenOptions): tween<T>;
        delay(duration: number): tween<T>;
        call(callback: Function): tween<T>;
        repeat(times: number, tween?: tween<T>): tween<T>;
        repeatForever(tween: tween<T>): tween<T>;
        sequence(...tweens: tween<T>[]): tween<T>;
        parallel(...tweens: tween<T>[]): tween<T>;
        start(): tween<T>;
        stop(): tween<T>;
        clone(): tween<T>;

        static tween<T>(target: T): tween<T>;
        static stopAll(): void;
        static stopAllByTarget(target: any): void;
    }

    export interface TweenOptions {
        easing?: string | ((t: number) => number);
        progress?: (start: number, end: number, current: number, ratio: number) => number;
        onUpdate?: (target: any, ratio: number) => void;
    }

    // ==================== 动作系统 ====================
    export class Action {
        clone(): Action;
        reverse(): Action | null;
    }

    export class FiniteTimeAction extends Action {
        duration: number;
        getDuration(): number;
        setDuration(duration: number): void;
        repeat(times: number): Repeat;
        repeatForever(): RepeatForever;
    }

    export class ActionInterval extends FiniteTimeAction {}
    export class ActionInstant extends FiniteTimeAction {}

    export class MoveTo extends ActionInterval {}
    export class MoveBy extends ActionInterval {}
    export class RotateTo extends ActionInterval {}
    export class RotateBy extends ActionInterval {}
    export class ScaleTo extends ActionInterval {}
    export class ScaleBy extends ActionInterval {}
    export class FadeTo extends ActionInterval {}
    export class FadeIn extends ActionInterval {}
    export class FadeOut extends ActionInterval {}
    export class Sequence extends ActionInterval {}
    export class Spawn extends ActionInterval {}
    export class Repeat extends ActionInterval {}
    export class RepeatForever extends ActionInterval {}
    export class DelayTime extends ActionInterval {}
    export class CallFunc extends ActionInstant {}

    // ==================== 输入系统 ====================
    export class input {
        static on(type: InputEventType, callback: Function, target?: any): void;
        static off(type: InputEventType, callback: Function, target?: any): void;
        static once(type: InputEventType, callback: Function, target?: any): void;
    }

    export enum InputEventType {
        TOUCH_START = 'touch-start',
        TOUCH_MOVE = 'touch-move',
        TOUCH_END = 'touch-end',
        TOUCH_CANCEL = 'touch-cancel',
        MOUSE_DOWN = 'mouse-down',
        MOUSE_MOVE = 'mouse-move',
        MOUSE_UP = 'mouse-up',
        MOUSE_WHEEL = 'mouse-wheel',
        KEY_DOWN = 'keydown',
        KEY_UP = 'keyup',
        DEVICEMOTION = 'devicemotion'
    }

    export class Event {
        type: string;
        bubbles: boolean;
        target: any;
        currentTarget: any;

        constructor(type: string, bubbles?: boolean);
        stopPropagation(): void;
        stopImmediatePropagation(): void;
        isStopped(): boolean;
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

    // ==================== 渲染系统 ====================
    export class Camera extends Component {
        priority: number;
        visibility: number;
        clearFlags: ClearFlags;
        clearColor: Color;
        orthoHeight: number;
        far: number;
        near: number;
        fov: number;
        projection: number;

        screenPointToRay(x: number, y: number): Ray;
        worldToScreen(worldPos: Vec3, out?: Vec3): Vec3;
        screenToWorld(screenPos: Vec3, out?: Vec3): Vec3;
    }

    export enum ClearFlags {
        NONE = 0,
        DEPTH_ONLY = 1,
        COLOR = 2,
        SKYBOX = 3,
        SOLID_COLOR = 4
    }

    export class Ray {
        o: Vec3;
        d: Vec3;

        constructor(originX?: number, originY?: number, originZ?: number, directionX?: number, directionY?: number, directionZ?: number);
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

        static on(type: GameEventType, callback: Function, target?: any): void;
        static off(type: GameEventType, callback?: Function, target?: any): void;
        static pause(): void;
        static resume(): void;
        static step(): void;
        static end(): void;
    }

    export type GameEventType = 'game-hide' | 'game-show' | 'game-pause' | 'game-resume' | 'game-init' | 'game-start' | 'game-restart';

    export class director {
        static loadScene(sceneName: string, onLaunched?: Function): void;
        static preloadScene(sceneName: string, onProgress?: Function, onLoaded?: Function): void;
        static getScene(): Scene | null;
        static getSceneByName(sceneName: string): Scene | null;
        static getRunningScene(): Scene | null;
        static pause(): void;
        static resume(): void;

        static addPersistRootNode(node: Node): void;
        static removePersistRootNode(node: Node): void;
        static isPersistRootNode(node: Node): boolean;

        static on(type: DirectorEventType, callback: Function, target?: any): void;
        static off(type: DirectorEventType, callback?: Function, target?: any): void;
    }

    export type DirectorEventType = 'load_scene_start' | 'load_scene_progress' | 'load_scene_end' | 'scene_launched' | 'before_scene_launch' | 'after_scene_launch';

    export class Scene extends Asset {
        name: string;
        nodes: Node[];

        getChildByName(name: string): Node | null;
    }

    // ==================== 查找和实例化 ====================
    export function find(path: string): Node | null;

    export function instantiate(original: Prefab | null): Node;
    export function instantiate<T extends Node>(original: T): T;

    // ==================== 其他工具 ====================
    export class sys {
        static platform: Platform;
        static language: string;
        static languageCode: string;
        static browserType: BrowserType;
        static isNative: boolean;
        static isMobile: boolean;
        static os: string;
        static osVersion: string;
        static networkType: string;
        static localStorage: Storage;
    }

    export type Platform = 'browser' | 'wechatgame' | 'android' | 'ios' | 'windows' | 'mac' | 'ohos' | 'huawei-quick-game' | 'oppo-quick-game' | 'vivo-quick-game' | 'xiaomi-quick-game';

    export type BrowserType = 'browser' | 'wechat' | 'wechatgame' | 'qq' | 'android' | 'ios';

    export class macro {
        static KEY: Record<string, number>;
        static MOUSE_BUTTON: Record<string, number>;
        static TOUCH: Record<string, number>;
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
        function approx(a: number, b: number, maxDiff: number): boolean;
    }

    // ==================== 类型定义 ====================
    export interface Constructor<T> {
        new (...args: any[]): T;
        prototype: T;
    }

    // ==================== 调试工具 ====================
    export class debug {
        static setDisplayStats(show: boolean): void;
        static isDisplayStats(): boolean;
    }

    export function log(message?: any, ...optionalParams: any[]): void;
    export function warn(message?: any, ...optionalParams: any[]): void;
    export function error(message?: any, ...optionalParams: any[]): void;

    // ==================== 缓动系统 ====================
    export function tween<T>(target: T): tween<T>;
}