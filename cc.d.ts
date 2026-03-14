/**
 * Cocos Creator 3.x Type Definitions
 * Minimal definitions for TypeScript compilation
 */

declare module 'cc' {
    // ============ Core Types ============
    export type Constructor<T = unknown> = new (...args: unknown[]) => T;

    // ============ Math Types ============
    export class Vec2 {
        x: number;
        y: number;
        constructor(x?: number, y?: number);
        static readonly ZERO: Vec2;
        static readonly ONE: Vec2;
        clone(): Vec2;
        set(x: number, y: number): Vec2;
        add(other: Vec2): Vec2;
        subtract(other: Vec2): Vec2;
        multiply(scalar: number): Vec2;
        length(): number;
        normalize(): Vec2;
    }

    export class Vec3 {
        x: number;
        y: number;
        z: number;
        constructor(x?: number, y?: number, z?: number);
        static readonly ZERO: Vec3;
        static readonly ONE: Vec3;
        clone(): Vec3;
        set(x: number, y: number, z?: number): Vec3;
        add(other: Vec3): Vec3;
        subtract(other: Vec3): Vec3;
        multiply(scalar: number): Vec3;
        length(): number;
        normalize(): Vec3;
    }

    export class Color {
        r: number;
        g: number;
        b: number;
        a: number;
        constructor(r?: number, g?: number, b?: number, a?: number);
        static readonly WHITE: Color;
        static readonly BLACK: Color;
        static readonly RED: Color;
        static readonly GREEN: Color;
        static readonly BLUE: Color;
        static readonly YELLOW: Color;
        static readonly TRANSPARENT: Color;
        clone(): Color;
        set(r: number, g: number, b: number, a?: number): Color;
        toHEX(): string;
        static fromHEX(hex: string): Color;
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
        intersects(other: Rect): boolean;
        clone(): Rect;
    }

    export class Quat {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x?: number, y?: number, z?: number, w?: number);
        static fromEuler(x: number, y: number, z: number): Quat;
    }

    export class Mat4 {
        static fromTranslation(out: Mat4, v: Vec3): Mat4;
        static fromRotation(out: Mat4, rad: number, axis: Vec3): Mat4;
        static fromScale(out: Mat4, v: Vec3): Mat4;
    }

    // ============ Event System ============
    export interface EventInfo {
        type: string;
        bubbles: boolean;
        target: unknown;
        currentTarget: unknown;
        propagationStopped: boolean;
    }

    export type EventCallback = (event: EventInfo) => void;

    export class EventTarget {
        on(type: string, callback: EventCallback, target?: unknown): unknown;
        once(type: string, callback: EventCallback, target?: unknown): unknown;
        off(type: string, callback?: EventCallback, target?: unknown): void;
        emit(type: string, ...args: unknown[]): void;
        targetOff(typeOrTarget: unknown): void;
    }

    // ============ Node ============
    export class Node extends EventTarget {
        uuid: string;
        name: string;
        active: boolean;
        parent: Node | null;
        children: Node[];
        components: Component[];
        layer: number;
        eulerAngles: Vec3;
        scale: Vec3;
        worldPosition: Vec3;
        worldScale: Vec3;
        uiTransform: UITransform | null;

        static readonly EventType: {
            TRANSFORM_CHANGED: string;
            SIZE_CHANGED: string;
            ACTIVE_IN_HIERARCHY_CHANGED: string;
            CHILD_ADDED: string;
            CHILD_REMOVED: string;
        };

        constructor(name?: string);

        addChild(child: Node): void;
        removeChild(child: Node): void;
        removeAllChildren(): void;
        getChildByPath(path: string): Node | null;
        getChildByName(name: string): Node | null;
        getChildByUuid(uuid: string): Node | null;
        getChildren(): Node[];

        getComponent<T extends Component>(classConstructor: Constructor<T>): T | null;
        getComponent<T extends Component>(className: string): T | null;
        getComponentInChildren<T extends Component>(classConstructor: Constructor<T>): T | null;
        getComponentInChildren<T extends Component>(className: string): T | null;
        getComponents<T extends Component>(classConstructor: Constructor<T>): T[];
        getComponentsInChildren<T extends Component>(classConstructor: Constructor<T>): T[];

        addComponent<T extends Component>(classConstructor: Constructor<T>): T;
        removeComponent(component: Component): void;

        setPosition(x: number | Vec3, y?: number, z?: number): void;
        getPosition(): Vec3;
        setRotation(rotation: Quat): void;
        setRotationFromEuler(x: number, y: number, z: number): void;
        getRotation(): Quat;
        setScale(scale: Vec3 | number, y?: number, z?: number): void;
        getScale(): Vec3;

        destroy(): boolean;
        isDestroyed(): boolean;
        isValid: boolean;

        on(type: string, callback: EventCallback, target?: unknown, useCapture?: boolean): unknown;
        once(type: string, callback: EventCallback, target?: unknown, useCapture?: boolean): unknown;
        off(type: string, callback?: EventCallback, target?: unknown, useCapture?: boolean): void;

        emit(type: string, ...args: unknown[]): void;

        walk(callback: (node: Node) => void): void;
    }

    // ============ Component ============
    export class Component {
        node: Node;
        name: string;
        enabled: boolean;
        enabledInHierarchy: boolean;
        isValid: boolean;

        onLoad?(): void;
        start?(): void;
        update?(dt: number): void;
        lateUpdate?(dt: number): void;
        onEnable?(): void;
        onDisable?(): void;
        onDestroy?(): void;

        getComponent<T extends Component>(classConstructor: Constructor<T>): T | null;
        getComponent<T extends Component>(className: string): T | null;
        getComponentInChildren<T extends Component>(classConstructor: Constructor<T>): T | null;
        getComponents<T extends Component>(classConstructor: Constructor<T>): T[];
        getComponentsInChildren<T extends Component>(classConstructor: Constructor<T>): T[];

        schedule(callback: () => void, interval?: number, repeat?: number, delay?: number): void;
        scheduleOnce(callback: () => void, delay?: number): void;
        unschedule(callback: () => void): void;
        unscheduleAllCallbacks(): void;
    }

    // ============ UI Components ============
    export class UITransform extends Component {
        contentSize: Size;
        anchorPoint: Vec2;

        setContentSize(size: Size | number, height?: number): void;
        getContentSize(): Size;
        setAnchorPoint(point: Vec2 | number, y?: number): void;
        getAnchorPoint(): Vec2;

        convertToNodeSpaceAR(worldPoint: Vec3): Vec3;
        convertToWorldSpaceAR(nodePoint: Vec3): Vec3;
        getBoundingBox(): Rect;
        getBoundingBoxToWorld(): Rect;
    }

    export class Label extends Component {
        string: string;
        fontSize: number;
        lineHeight: number;
        horizontalAlign: number;
        verticalAlign: number;
        color: Color;
        overflow: number;
        enableWrapText: boolean;
        maxWidth: number;

        static readonly HorizontalAlign: {
            LEFT: number;
            CENTER: number;
            RIGHT: number;
        };
        static readonly VerticalAlign: {
            TOP: number;
            CENTER: number;
            BOTTOM: number;
        };
        static readonly Overflow: {
            NONE: number;
            CLAMP: number;
            SHRINK: number;
            RESIZE_HEIGHT: number;
        };
    }

    export class Sprite extends Component {
        spriteFrame: SpriteFrame | null;
        type: number;
        sizeMode: number;
        color: Color;
        trim: boolean;
        grayscale: boolean;

        static readonly Type: {
            SIMPLE: number;
            SLICED: number;
            TILED: number;
            FILLED: number;
        };
        static readonly SizeMode: {
            CUSTOM: number;
            TRIMMED: number;
            RAW: number;
        };
    }

    export class Button extends Component {
        interactable: boolean;
        transition: number;
        target: Node | null;
        clickEvents: EventHandler[];

        static readonly Transition: {
            NONE: number;
            COLOR: number;
            SPRITE: number;
            SCALE: number;
        };
    }

    export class EditBox extends Component {
        string: string;
        placeholder: string;
        maxLength: number;
        inputMode: number;
        inputFlag: number;
        returnType: number;
        tabIndex: number;
        textHorizontalAlignment: number;
        textVerticalAlignment: number;
        textColor: Color;
        placeholderLabel: Label | null;
        textLabel: Label | null;
        background: Sprite | null;

        static readonly InputMode: {
            ANY: number;
            EMAIL_ADDR: number;
            NUMERIC: number;
            PHONE_NUMBER: number;
            URL: number;
            DECIMAL: number;
            SINGLE_LINE: number;
        };
        static readonly InputFlag: {
            PASSWORD: number;
            SENSITIVE: number;
            INITIAL_CAPS_WORD: number;
            INITIAL_CAPS_SENTENCE: number;
            INITIAL_CAPS_ALL_CHARACTERS: number;
            LOWERCASE_ALL_CHARACTERS: number;
            UPPERCASE_ALL_CHARACTERS: number;
        };
        static readonly KeyboardReturnType: {
            DEFAULT: number;
            DONE: number;
            SEND: number;
            SEARCH: number;
            GO: number;
            NEXT: number;
        };

        focus(): void;
        blur(): void;
    }

    export class ProgressBar extends Component {
        barSprite: Sprite | null;
        mode: number;
        totalLength: number;
        progress: number;
        reverse: boolean;

        static readonly Mode: {
            HORIZONTAL: number;
            VERTICAL: number;
            FILLED: number;
        };
    }

    export class Slider extends Component {
        handle: Node | null;
        direction: number;
        progress: number;
        sliderEvents: EventHandler[];

        static readonly Direction: {
            HORIZONTAL: number;
            VERTICAL: number;
        };
    }

    export class Toggle extends Component {
        isChecked: boolean;
        checkMark: Sprite | null;
        background: Sprite | null;
        checkEvents: EventHandler[];
    }

    export class ToggleContainer extends Component {
        allowSwitchOff: boolean;
        checkEvents: EventHandler[];
    }

    export class ScrollView extends Component {
        content: Node | null;
        horizontal: boolean;
        vertical: boolean;
        inertia: boolean;
        elasticity: number;
        brake: number;
        horizontalScrollBar:ScrollBar | null;
        verticalScrollBar: ScrollBar | null;
        scrollEvents: EventHandler[];

        scrollToBottom(timeInSecond?: number, attenuated?: boolean): void;
        scrollToTop(timeInSecond?: number, attenuated?: boolean): void;
        scrollToLeft(timeInSecond?: number, attenuated?: boolean): void;
        scrollToRight(timeInSecond?: number, attenuated?: boolean): void;
        scrollToOffset(offset: Vec2, timeInSecond?: number, attenuated?: boolean): void;
        getScrollOffset(): Vec2;
        getMaxScrollOffset(): Vec2;
        stopAutoScroll(): void;
    }

    export class ScrollBar extends Component {
        handle: Node | null;
        direction: number;
        autoHide: boolean;
        autoHideTime: number;

        static readonly Direction: {
            HORIZONTAL: number;
            VERTICAL: number;
        };
    }

    export class Layout extends Component {
        type: number;
        resizeMode: number;
        horizontalDirection: number;
        verticalDirection: number;
        cellSize: Size;
        startAxis: number;
        paddingLeft: number;
        paddingRight: number;
        paddingTop: number;
        paddingBottom: number;
        spacingX: number;
        spacingY: number;
        affectedByScale: boolean;

        static readonly Type: {
            NONE: number;
            HORIZONTAL: number;
            VERTICAL: number;
            GRID: number;
        };
        static readonly ResizeMode: {
            NONE: number;
            CHILD: number;
            CONTAINER: number;
        };
        static readonly HorizontalDirection: {
            LEFT_TO_RIGHT: number;
            RIGHT_TO_LEFT: number;
        };
        static readonly VerticalDirection: {
            TOP_TO_BOTTOM: number;
            BOTTOM_TO_TOP: number;
        };
        static readonly AxisDirection: {
            HORIZONTAL: number;
            VERTICAL: number;
        };
        updateLayout(): void;
    }

    export class Widget extends Component {
        isAlignTop: boolean;
        isAlignBottom: boolean;
        isAlignLeft: boolean;
        isAlignRight: boolean;
        isAlignHorizontalCenter: boolean;
        isAlignVerticalCenter: boolean;
        top: number;
        bottom: number;
        left: number;
        right: number;
        horizontalCenter: number;
        verticalCenter: number;
        target: Node | null;
        alignMode: number;

        updateAlignment(): void;
    }

    export class Mask extends Component {
        type: number;
        inverted: boolean;
        segments: number;
        spriteFrame: SpriteFrame | null;

        static readonly Type: {
            RECT: number;
            ELLIPSE: number;
            IMAGE_STENCIL: number;
        };
    }

    export class PageView extends Component {
        content: Node | null;
        sizeMode: number;
        direction: number;
        scrollThreshold: number;
        autoPageTurningThreshold: number;
        currentPage: number;
        indicator: PageViewIndicator | null;
        pageTurningSpeed: number;
        pageEvents: EventHandler[];

        static readonly Direction: {
            HORIZONTAL: number;
            VERTICAL: number;
        };
        static readonly SizeMode: {
            UNIFIED: number;
            FREE: number;
        };

        setCurrentPageIndex(index: number): void;
        scrollToPage(index: number, timeInSecond?: number): void;
        getPages(): Node[];
        getCurrentPageIndex(): number;
    }

    export class PageViewIndicator extends Component {
        spriteFrame: SpriteFrame | null;
        layout: Layout | null;
        cellSize: Size;
        step: number;
    }

    // ============ Resources ============
    export class Asset {
        uuid: string;
        name: string;
        isValid: boolean;
    }

    export class SpriteFrame extends Asset {
        rect: Rect;
        originalSize: Size;
        texture: Texture2D | null;
        offsetX: Vec2;
        rotated: boolean;

        reset(data: unknown): void;
    }

    export class Texture2D extends Asset {
        width: number;
        height: number;
        pixelFormat: number;
    }

    export class Prefab extends Asset {
        data: Node;
    }

    export class AudioClip extends Asset {
        duration: number;
    }

    export class Font extends Asset {}
    export class JsonAsset extends Asset {
        json: unknown;
    }
    export class TextAsset extends Asset {
        text: string;
    }

    // ============ Resources Module ============
    export namespace resources {
        export function load(path: string, type: typeof Asset, callback: (error: Error | null, asset: Asset) => void): void;
        export function load<T extends Asset>(path: string, callback: (error: Error | null, asset: T) => void): void;
        export function load(path: string, callback: (error: Error | null, asset: Asset) => void): void;
        export function loadDir(path: string, type: typeof Asset, callback: (error: Error | null, assets: Asset[]) => void): void;
        export function release(asset: Asset | Asset[]): void;
        export function release(path: string): void;
        export function getAssetByUuid<T extends Asset>(uuid: string): T | null;
    }

    // ============ AssetManager ============
    export namespace assetManager {
        export interface AssetManager {
            loadAny<T = unknown>(uuid: string, options: unknown, callback: (error: Error | null, asset: T) => void): void;
            loadAny<T = unknown>(uuid: string, callback: (error: Error | null, asset: T) => void): void;
            releaseAsset(asset: Asset): void;
            getAssetByUuid<T extends Asset>(uuid: string): T | null;
            assets: unknown;
        }

        export const bundle: {
            load<T extends Asset>(path: string, type: typeof Asset, callback: (error: Error | null, asset: T) => void): void;
            load<T extends Asset>(path: string, callback: (error: Error | null, asset: T) => void): void;
            release(path: string, type?: typeof Asset): void;
        };
    }

    export const assetManager: assetManager.AssetManager;

    // ============ Director ============
    export namespace director {
        export function getScene(): Scene | null;
        export function loadScene(sceneName: string, onLaunched?: (error: Error | null) => void): void;
        export function preloadScene(sceneName: string, onProgress?: (completedCount: number, totalCount: number) => void, onLoaded?: (error: Error | null) => void): void;
        export function getRunningScene(): Scene | null;
        export function getSceneByName(name: string): Scene | null;
        export function pause(): void;
        export function resume(): void;
        export function getDeltaTime(): number;
        export function getTotalTime(): number;
        export function addPersistRootNode(node: Node): void;
        export function removePersistRootNode(node: Node): void;
        export function isPersistRootNode(node: Node): boolean;

        export const EVENT: {
            AFTER_SCENE_LAUNCH: string;
            BEFORE_SCENE_LAUNCH: string;
        };
    }

    export const director: typeof import('./director');

    // ============ Scene ============
    export class Scene extends Asset {
        name: string;
        nodes: Node[];
        renderScene: unknown;

        getChildByPath(path: string): Node | null;
        getChildByName(name: string): Node | null;
    }

    // ============ Game ============
    export class game {
        static readonly EVENT_HIDE = 'game-hide';
        static readonly EVENT_SHOW = 'game-show';
        static readonly EVENT_PAUSE = 'game-pause';
        static readonly EVENT_RESUME = 'game-resume';

        static frameTime: number;
        static frame: number;
        static totalTime: number;

        static pause(): void;
        static resume(): void;
        static step(): void;
        static end(): void;
        static isPersistRootNode(node: Node): boolean;
    }

    // ============ Scheduler ============
    export class Scheduler {
        schedule(callback: () => void, target: unknown, interval?: number, repeat?: number, delay?: number, paused?: boolean): void;
        scheduleOnce(callback: () => void, target: unknown, delay?: number, paused?: boolean): void;
        unschedule(callback: () => void, target: unknown): void;
        unscheduleAllForTarget(target: unknown): void;
        pauseTarget(target: unknown): void;
        resumeTarget(target: unknown): void;
    }

    // ============ Input ============
    export class input {
        static readonly EventType: {
            TOUCH_START: string;
            TOUCH_MOVE: string;
            TOUCH_END: string;
            TOUCH_CANCEL: string;
            MOUSE_DOWN: string;
            MOUSE_MOVE: string;
            MOUSE_UP: string;
            MOUSE_WHEEL: string;
            KEY_DOWN: string;
            KEY_UP: string;
        };

        static on(type: string, callback: EventCallback, target?: unknown): unknown;
        static off(type: string, callback?: EventCallback, target?: unknown): void;
        static once(type: string, callback: EventCallback, target?: unknown): unknown;
    }

    export class EventTouch {
        type: string;
        bubbles: boolean;
        target: unknown;
        currentTarget: unknown;
        touch: Touch | null;
        getUILocation(): Vec2;
        getUIStartPosition(): Vec2;
        getDelta(): Vec2;
        getStartLocation(): Vec2;
        getLocation(): Vec2;
        propagatStopped: boolean;
        stopPropagation(): void;
    }

    export class Touch {
        getID(): number;
        getLocation(): Vec2;
        getStartLocation(): Vec2;
        getUIStartPosition(): Vec2;
        getUILocation(): Vec2;
        getDelta(): Vec2;
    }

    // ============ Animation ============
    export class Animation extends Component {
        clips: AnimationClip[];
        defaultClip: AnimationClip | null;
        currentClip: AnimationClip | null;

        play(name?: string): AnimationState;
        playAdditive(name?: string): AnimationState;
        stop(name?: string): void;
        pause(name?: string): void;
        resume(name?: string): void;
        getAnimationState(name: string): AnimationState | null;
        getClips(): AnimationClip[];
        on(type: string, callback: EventCallback, target?: unknown): unknown;
        off(type: string, callback?: EventCallback, target?: unknown): void;

        static readonly EventType: {
            PLAY: string;
            STOP: string;
            PAUSE: string;
            RESUME: string;
            LASTFRAME: string;
            FINISHED: string;
        };
    }

    export class AnimationClip extends Asset {
        name: string;
        duration: number;
        speed: number;
        wrapMode: number;
        sample: number;

        static readonly WrapMode: {
            Default: number;
            Normal: number;
            Once: number;
            Loop: number;
            PingPong: number;
            Reverse: number;
            LoopReverse: number;
            PingPongReverse: number;
        };
    }

    export class AnimationState {
        name: string;
        duration: number;
        speed: number;
        time: number;
        repeatCount: number;
        isPlaying: boolean;
        isPaused: boolean;
        clip: AnimationClip;
        wrapMode: number;

        play(): void;
        pause(): void;
        resume(): void;
        stop(): void;
        setTime(time: number): void;
    }

    // ============ Action ============
    export class Action {
        clone(): Action;
        reverse(): Action | null;
    }

    export class FiniteTimeAction extends Action {
        duration: number;
        getDuration(): number;
        setDuration(d: number): void;
        repeatForever(): ActionInterval;
    }

    export class ActionInterval extends FiniteTimeAction {
        getElapsed(): number;
        setAmplitudeRate(amp: number): void;
        getAmplitudeRate(): number;
        isDone(): boolean;
        step(dt: number): void;
        startWithTarget(target: unknown): void;
    }

    export class ActionInstant extends FiniteTimeAction {}

    export namespace tween {
        export interface Tween<T> {
            to(duration: number, props: unknown, opts?: unknown): Tween<T>;
            by(duration: number, props: unknown, opts?: unknown): Tween<T>;
            set(props: unknown): Tween<T>;
            delay(duration: number): Tween<T>;
            call(callback: () => void): Tween<T>;
            hide(): Tween<T>;
            show(): Tween<T>;
            removeSelf(): Tween<T>;
            sequence(...actions: Tween<T>[]): Tween<T>;
            parallel(...actions: Tween<T>[]): Tween<T>;
            repeat(repeatTimes: number, action?: Tween<T>): Tween<T>;
            repeatForever(action: Tween<T>): Tween<T>;
            reverseTime(action: Tween<T>): Tween<T>;
            start(): Tween<T>;
            stop(): Tween<T>;
            clone(target: T): Tween<T>;
        }

        export function tween<T>(target: T): Tween<T>;
    }

    export const tween: typeof tween.tween;

    // ============ UI Helper ============
    export function instantiate(prefab: Prefab): Node;

    export class EventHandler {
        target: Node | null;
        component: string;
        handler: string;
        customEventData: string;

        emitEvents(events: EventHandler[], customEventData?: unknown): void;
    }

    // ============ find ============
    export function find(path: string, referenceNode?: Node): Node | null;

    // ============ Camera ============
    export class Camera extends Component {
        projection: number;
        priority: number;
        visibility: number;
        clearFlags: number;
        clearColor: Color;
        near: number;
        far: number;
        fov: number;
        orthoHeight: number;

        static readonly ProjectionType: {
            ORTHO: number;
            PERSPECTIVE: number;
        };
        static readonly ClearFlag: {
            SOLID_COLOR: number;
            DEPTH_ONLY: number;
            STENCIL_ONLY: number;
            DONT_CLEAR: number;
            SKYBOX: number;
        };

        screenPointToRay(x: number, y: number, out: Ray): void;
        worldToScreen(point: Vec3, out?: Vec3): Vec3;
        screenToWorld(point: Vec3, out?: Vec3): Vec3;
    }

    export class Ray {
        o: Vec3;
        d: Vec3;
    }

    // ============ Physics ============
    export namespace physics {
        export class RigidBody extends Component {
            type: number;
            mass: number;
            allowSleep: boolean;
            linearDamping: number;
            angularDamping: number;
            useGravity: boolean;
            linearFactor: Vec3;
            angularFactor: Vec3;

            static readonly Type: {
                STATIC: number;
                KINEMATIC: number;
                DYNAMIC: number;
            };
        }

        export class Collider extends Component {
            isTrigger: boolean;
            material: PhysicsMaterial | null;
        }

        export class BoxCollider extends Collider {
            size: Vec3;
        }

        export class SphereCollider extends Collider {
            radius: number;
        }

        export class PhysicsMaterial {
            friction: number;
            restitution: number;
        }
    }

    // ============ Decorators ============
    export namespace _decorator {
        export function ccclass(name?: string): ClassDecorator;
        export function property(target: unknown, propertyKey: string, descriptor?: PropertyDescriptor): void;
        export function property(options?: PropertyOptions): PropertyDecorator;
        export function property(type: typeof Component | typeof Asset): PropertyDecorator;
        export function executeInEditMode(isExecuteInEditMode?: boolean): ClassDecorator;
        export function playOnFocus(isPlayOnFocus?: boolean): ClassDecorator;
        export function menu(path: string): ClassDecorator;
        export function executionOrder(order: number): ClassDecorator;
        export function disallowMultiple(isDisallowMultiple?: boolean): ClassDecorator;
        export function requireComponent(component: typeof Component): ClassDecorator;
        export function help(url: string): ClassDecorator;
        export function tooltip(text: string): PropertyDecorator;
        export function displayName(name: string): PropertyDecorator;
        export function readonly(isReadonly?: boolean): PropertyDecorator;
        export function range(min: number, max?: number, step?: number): PropertyDecorator;
        export function rangeStep(min: number, max: number, step: number): PropertyDecorator;
        export function slide(isSlide?: boolean): PropertyDecorator;
        export function editable(isEditable?: boolean): PropertyDecorator;
        export function visible(isVisible?: boolean): PropertyDecorator;
        export function type(ctor: unknown): PropertyDecorator;
        export function componentMenu(label: string): ClassDecorator;
    }

    export interface PropertyOptions {
        type?: typeof Component | typeof Asset | Function;
        visible?: boolean | (() => boolean);
        displayName?: string;
        tooltip?: string;
        multiline?: boolean;
        readonly?: boolean;
        min?: number;
        max?: number;
        step?: number;
        range?: number[];
        slide?: boolean;
        editorOnly?: boolean;
        override?: boolean;
        group?: string | { name: string; id: string };
        default?: unknown;
        formerlySerializedAs?: string;
    }

    // ============ Sys ============
    export namespace sys {
        export const platform: string;
        export const language: string;
        export const os: string;
        export const browserType: string;
        export const isNative: boolean;
        export const isMobile: boolean;

        export function openURL(url: string): void;
        export function copyTextToClipboard(text: string): void;
        export function getBatteryLevel(): number;

        export const Platform: {
            WINDOWS: string;
            ANDROID: string;
            IOS: string;
            MAC: string;
            WECHAT_GAME: string;
            WECHAT_GAME_SUB: string;
            HUAWEI_QUICK_GAME: string;
            XIAOMI_QUICK_GAME: string;
            OPPO_QUICK_GAME: string;
            VIVO_QUICK_GAME: string;
            BYTEDANCE_MINI_GAME: string;
            BAIDU_MINI_GAME: string;
        };
    }

    // ============ Screen ============
    export namespace screen {
        export function adaptTo(orientation: number, containerFit: number): void;
        export function getDevicePixelRatio(): number;
        export function getWindowSize(): Size;
        export function setOrientation(orientation: number): void;
        export const orientation: number;
    }

    // ============ Macro ============
    export namespace macro {
        export const KEY: {
            none: number;
            backspace: number;
            tab: number;
            enter: number;
            shift: number;
            ctrl: number;
            alt: number;
            pause: number;
            capsLock: number;
            escape: number;
            space: number;
            pageUp: number;
            pageDown: number;
            end: number;
            home: number;
            left: number;
            up: number;
            right: number;
            down: number;
            insert: number;
            Delete: number;
            '0': number;
            '1': number;
            '2': number;
            '3': number;
            '4': number;
            '5': number;
            '6': number;
            '7': number;
            '8': number;
            '9': number;
            a: number;
            b: number;
            c: number;
            d: number;
            e: number;
            f: number;
            g: number;
            h: number;
            i: number;
            j: number;
            k: number;
            l: number;
            m: number;
            n: number;
            o: number;
            p: number;
            q: number;
            r: number;
            s: number;
            t: number;
            u: number;
            v: number;
            w: number;
            x: number;
            y: number;
            z: number;
            num0: number;
            num1: number;
            num2: number;
            num3: number;
            num4: number;
            num5: number;
            num6: number;
            num7: number;
            num8: number;
            num9: number;
            '*': number;
            '+': number;
            '-': number;
            numDel: number;
            '/': number;
            f1: number;
            f2: number;
            f3: number;
            f4: number;
            f5: number;
            f6: number;
            f7: number;
            f8: number;
            f9: number;
            f10: number;
            f11: number;
            f12: number;
            numLock: number;
            scrollLock: number;
            ';': number;
            semicolon: number;
            equal: number;
            '=': number;
            ',': number;
            comma: number;
            dash: number;
            '.': number;
            period: number;
            forwardSlash: number;
            '`': number;
            grave: number;
            '[': number;
            openBracket: number;
            backslash: number;
            ']': number;
            closeBracket: number;
            quote: number;
            dpadLeft: number;
            dpadRight: number;
            dpadUp: number;
            dpadDown: number;
            dpadCenter: number;
        };
    }

    // ============ Misc ============
    export function isValid(value: unknown): boolean;
    export function clamp(value: number, min: number, max: number): number;
    export function clamp01(value: number): number;
    export function lerp(a: number, b: number, t: number): number;
    export function random(): number;
    export function randomRange(min: number, max: number): number;
    export function randomRangeInt(min: number, max: number): number;
    export function degreesToRadians(degrees: number): number;
    export function radiansToDegrees(radians: number): number;

    // ============ AudioSource ============
    export class AudioSource extends Component {
        clip: AudioClip | null;
        loop: boolean;
        playOnAwake: boolean;
        volume: number;
        mute: boolean;
        currentTime: number;
        duration: number;
        state: number;

        play(): void;
        pause(): void;
        stop(): void;
        playOneShot(clip: AudioClip, volumeScale?: number): void;

        static readonly AudioSourceState: {
            INIT: number;
            PLAYING: number;
            PAUSED: number;
            STOPPED: number;
        };
    }

    // ============ JsonAsset ============
    export class jsonAsset {
        static from(text: string): JsonAsset;
    }

    // ============ Spine ============
    export namespace spine {
        export class Skeleton extends Component {
            skeletonData: SkeletonData | null;
            defaultSkin: string;
            premultipliedAlpha: boolean;
            timeScale: number;

            setAnimation(trackIndex: number, name: string, loop: boolean): spine.TrackEntry | null;
            addAnimation(trackIndex: number, name: string, loop: boolean, delay?: number): spine.TrackEntry | null;
            setMix(fromName: string, toName: string, duration: number): void;
            setSkin(skinName: string): void;
            setAttachment(slotName: string, attachmentName: string): void;
            clearTracks(): void;
            clearTrack(trackIndex: number): void;
            setToSetupPose(): void;
            setBonesToSetupPose(): void;
            setSlotsToSetupPose(): void;
            findBone(name: string): unknown | null;
            findSlot(name: string): unknown | null;
            getAttachment(slotName: string, attachmentName: string): unknown | null;
            getState(): unknown;
        }

        export class SkeletonData extends Asset {
            skeletonJson: unknown;
            atlasText: string;
            textures: Texture2D[];
            textureNames: string[];
        }

        export class TrackEntry {
            animationEnd: number;
            animationStart: number;
            delay: number;
            trackTime: number;
            trackEnd: number;
            loop: boolean;
            loopCount: number;
            alpha: number;
            eventThreshold: number;
            mixDuration: number;
            mixTime: number;
            animation: unknown;
            next: TrackEntry | null;
            previous: TrackEntry | null;
        }
    }

    // ============ DragonBones ============
    export namespace dragonBones {
        export class ArmatureDisplay extends Component {
            dragonAsset: DragonBonesAsset | null;
            dragonAtlasAsset: DragonBonesAtlasAsset | null;
            armatureName: string;
            animationName: string;
            timeScale: number;

            playAnimation(name: string, playTimes: number): unknown;
            fadeTo(name: string, duration: number, loop?: number): unknown;
            stopAnimation(name?: string): void;
            hasAnimation(name: string): boolean;
            getAnimationNames(): string[];
        }

        export class DragonBonesAsset extends Asset {}
        export class DragonBonesAtlasAsset extends Asset {}
    }

    // ============ TiledMap ============
    export class TiledMap extends Component {
        tmxAsset: TiledMapAsset | null;

        getLayer(layerName: string): TiledLayer | null;
        getObjectGroup(groupName: string): TiledObjectGroup | null;
        getMapSize(): Size;
        getTileSize(): Size;
        getProperties(): Record<string, unknown>;
    }

    export class TiledLayer extends Component {
        getLayerName(): string;
        getTileGIDAt(x: number, y: number): number;
        setTileGIDAt(gid: number, x: number, y: number): void;
        getTileAt(x: number, y: number): Node | null;
        removeTileAt(x: number, y: number): void;
        getNodeAt(x: number, y: number): Node | null;
        getPositionAt(x: number, y: number): Vec2;
    }

    export class TiledObjectGroup extends Component {
        getObjectName(): string;
        getObjects(): unknown[];
        getObject(objectName: string): unknown | null;
    }

    export class TiledMapAsset extends Asset {}

    // ============ ParticleSystem ============
    export class ParticleSystem extends Component {
        duration: number;
        capacity: number;
        emissionRate: number;
        life: number;
        lifeVar: number;
        startSize: number;
        startSizeVar: number;
        endSize: number;
        endSizeVar: number;
        startColor: Color;
        startColorVar: Color;
        endColor: Color;
        endColorVar: Color;
        angle: number;
        angleVar: number;
        startSpin: number;
        startSpinVar: number;
        endSpin: number;
        endSpinVar: number;
        sourcePos: Vec2;
        posVar: Vec2;
        positionType: number;
        emitterMode: number;
        gravity: Vec2;
        speed: number;
        speedVar: number;
        radialAccel: number;
        radialAccelVar: number;
        tangentialAccel: number;
        tangentialAccelVar: number;
        rotationIsDir: boolean;
        startRadius: number;
        startRadiusVar: number;
        endRadius: number;
        endRadiusVar: number;
        rotatePerS: number;
        rotatePerSVar: number;
        playOnLoad: boolean;
        autoRemoveOnFinish: boolean;
        preview: boolean;
        rateOverTime: number;
        rateOverDistance: number;
        bursts: unknown[];
        texture: Texture2D | null;

        static readonly PositionType: {
            FREE: number;
            RELATIVE: number;
            GROUPED: number;
        };
        static readonly EmitterMode: {
            GRAVITY: number;
            RADIUS: number;
        };

        play(): void;
        pause(): void;
        stop(): void;
        clear(): void;
        isPlaying(): boolean;
        isPaused(): boolean;
        isFull(): boolean;
        resetSystem(): void;
        addParticle(): boolean;
    }

    // ============ RichText ============
    export class RichText extends Component {
        string: string;
        horizontalAlign: number;
        fontSize: number;
        fontFamily: string;
        lineHeight: number;
        maxWidth: number;
        imageAtlas: SpriteAtlas | null;
        handleTouchEvent: boolean;

        static readonly HorizontalAlign: {
            LEFT: number;
            CENTER: number;
            RIGHT: number;
        };
    }

    export class SpriteAtlas extends Asset {
        getSpriteFrame(key: string): SpriteFrame | null;
        getSpriteFrames(): SpriteFrame[];
    }

    // ============ Graphics ============
    export class Graphics extends Component {
        fillColor: Color;
        strokeColor: Color;
        lineWidth: number;
        miterLimit: number;
        lineCap: number;
        lineJoin: number;

        static readonly LineCap: {
            BUTT: number;
            ROUND: number;
            SQUARE: number;
        };
        static readonly LineJoin: {
            BEVEL: number;
            ROUND: number;
            MITER: number;
        };

        moveTo(x: number, y: number): void;
        lineTo(x: number, y: number): void;
        bezierCurveTo(c1x: number, c1y: number, c2x: number, c2y: number, x: number, y: number): void;
        quadraticCurveTo(cx: number, cy: number, x: number, y: number): void;
        arc(cx: number, cy: number, r: number, startAngle: number, endAngle: number, counterclockwise?: boolean): void;
        ellipse(cx: number, cy: number, rx: number, ry: number): void;
        circle(cx: number, cy: number, r: number): void;
        rect(x: number, y: number, w: number, h: number): void;
        roundRect(x: number, y: number, w: number, h: number, r: number): void;
        clear(): void;
        close(): void;
        stroke(): void;
        fill(): void;
    }

    // ============ WebView ============
    export class WebView extends Component {
        url: string;

        static readonly EventType: {
            LOADING: string;
            LOADED: string;
            ERROR: string;
        };

        loadURL(url: string): void;
        evaluateJS(str: string): void;
        setJavascriptInterfaceScheme(scheme: string): void;
        getOnJSCallback(): ((url: string) => void) | null;
        setOnJSCallback(callback: (url: string) => void): void;
    }

    // ============ VideoPlayer ============
    export class VideoPlayer extends Component {
        resource: VideoClip | null;
        remoteURL: string;
        currentTime: number;
        duration: number;
        volume: number;
        mute: boolean;
        keepAspectRatio: boolean;
        fullScreenOnAwake: boolean;
        stayOnBottom: boolean;

        static readonly EventType: {
            PLAYING: string;
            PAUSED: string;
            STOPPED: string;
            COMPLETED: string;
            META_LOADED: string;
            READY_TO_PLAY: string;
            ERROR: string;
        };

        play(): void;
        pause(): void;
        stop(): void;
        getDuration(): number;
        getCurrentTime(): number;
        seekTo(time: number): void;
        isPlaying(): boolean;
    }

    export class VideoClip extends Asset {}

    // ============ SafeArea ============
    export class SafeArea extends Component {
        isDebug: boolean;
    }

    // ============ UI Model Component ============
    export class UIMeshRenderer extends Component {
        material: Material | null;
    }

    export class Material extends Asset {
        name: string;
        effectAsset: EffectAsset | null;
        defines: Record<string, unknown>;
        properties: Record<string, unknown>;
    }

    export class EffectAsset extends Asset {}

    // ============ Lighting ============
    export class AmbientInfo {
        skyColorHDR: Vec4;
        skyColor: Vec4;
        skyIllumHDR: number;
        skyIllum: number;
        groundAlbedoHDR: Vec4;
        groundAlbedo: Vec4;
        skyColorLDR: Vec4;
        skyIllumLDR: number;
        groundAlbedoLDR: Vec4;
    }

    export class Vec4 {
        x: number;
        y: number;
        z: number;
        w: number;
        constructor(x?: number, y?: number, z?: number, w?: number);
        static readonly ZERO: Vec4;
        static readonly ONE: Vec4;
        clone(): Vec4;
        set(x: number, y: number, z: number, w: number): Vec4;
    }

    export class DirectionalLight extends Component {
        color: Color;
        useColorTemperature: boolean;
        colorTemperature: number;
        staticSettings: StaticDirectionalLightSettings;
        illuminanceHDR: number;
        illuminance: number;
        illuminanceLDR: number;
    }

    export class StaticDirectionalLightSettings {
        shadowEnabled: boolean;
        shadowPcf: number;
        shadowBias: number;
        shadowNormalBias: number;
        shadowSaturation: number;
        shadowDistance: number;
        shadowInvisibleOcclusionRange: number;
        shadowFixedArea: boolean;
        shadowOrthoSize: number;
    }

    export class PointLight extends Component {
        color: Color;
        useColorTemperature: boolean;
        colorTemperature: number;
        luminanceHDR: number;
        luminance: number;
        luminanceLDR: number;
        range: number;
        term: number;
    }

    export class SpotLight extends Component {
        color: Color;
        useColorTemperature: boolean;
        colorTemperature: number;
        luminanceHDR: number;
        luminance: number;
        luminanceLDR: number;
        range: number;
        term: number;
        spotAngle: number;
    }

    export class SphereLight extends Component {
        color: Color;
        useColorTemperature: boolean;
        colorTemperature: number;
        luminanceHDR: number;
        luminance: number;
        luminanceLDR: number;
        range: number;
        term: number;
        radius: number;
    }

    export class RangedDirectionalLight extends Component {
        color: Color;
        useColorTemperature: boolean;
        colorTemperature: number;
        illuminanceHDR: number;
        illuminance: number;
        illuminanceLDR: number;
        range: number;
    }

    // ============ Terrain ============
    export class Terrain extends Component {
        effectAsset: EffectAsset | null;
        getBlockCount(): number;
        getVertexCount(): number;
        getSize(): Vec3;
        getTileSize(): number;
        getHeight(i: number, j: number): number;
        setHeight(i: number, j: number, height: number): void;
        getNormal(i: number, j: number): Vec3;
        setNormal(i: number, j: number, normal: Vec3): void;
    }

    // ============ SkinnedMeshRenderer ============
    export class SkinnedMeshRenderer extends Component {
        mesh: Mesh | null;
        skeleton: Skeleton | null;
        materials: Material[];
    }

    export class Mesh extends Asset {
        struct: MeshStruct;
        hash: number;
    }

    export class MeshStruct {
        primitiveMode: number;
        positions: Float32Array;
        normals: Float32Array;
        uvs: Float32Array[];
        tangents: Float32Array;
        colors: Float32Array;
        indices: Uint16Array | Uint32Array;
        minPosition: Vec3;
        maxPosition: Vec3;
        boundingBox: AABB;
    }

    export class AABB {
        center: Vec3;
        halfExtents: Vec3;
    }

    export class Skeleton extends Asset {}

    // ============ AudioSourceState ============
    export const AudioSourceState: {
        INIT: number;
        PLAYING: number;
        PAUSED: number;
        STOPPED: number;
    };

    // ============ Debug ============
    export namespace debug {
        export function setDisplayStats(isShow: boolean): void;
        export function getDisplayStats(): boolean;
    }

    // ============ geometry ============
    export namespace geometry {
        export class Ray {
            o: Vec3;
            d: Vec3;
            constructor(ox?: number, oy?: number, oz?: number, dx?: number, dy?: number, dz?: number);
        }

        export class Plane {
            n: Vec3;
            d: number;
            constructor(nx?: number, ny?: number, nz?: number, d?: number);
        }

        export class Line {
            s: Vec3;
            e: Vec3;
            constructor(sx?: number, sy?: number, sz?: number, ex?: number, ey?: number, ez?: number);
        }

        export class AABB {
            center: Vec3;
            halfExtents: Vec3;
            constructor(cx?: number, cy?: number, cz?: number, hw?: number, hh?: number, hl?: number);
        }

        export class OBB {
            center: Vec3;
            orientation: Mat3;
            halfExtents: Vec3;
        }

        export class Mat3 {
            m00: number;
            m01: number;
            m02: number;
            m03: number;
            m04: number;
            m05: number;
            m06: number;
            m07: number;
            m08: number;
        }

        export class Sphere {
            center: Vec3;
            radius: number;
            constructor(cx?: number, cy?: number, cz?: number, r?: number);
        }

        export class Capsule {
            center: Vec3;
            radius: number;
            height: number;
            direction: number;
            constructor(cx?: number, cy?: number, cz?: number, r?: number, h?: number, d?: number);
        }

        export function intersect(a: unknown, b: unknown): number;
    }

    // ============ error & warn ============
    export function error(...args: unknown[]): void;
    export function warn(...args: unknown[]): void;
    export function log(...args: unknown[]): void;
    export function info(...args: unknown[]): void;
    export function assert(condition: boolean, ...args: unknown[]): void;
}