/**
 * 六边形战棋系统
 * 使用轴向坐标（Axial Coordinates）系统
 */

import { Hex, TerrainType } from '../config/GameTypes';
import { BATTLEFIELD_RADIUS } from '../config/GameTypes';
import { BattleUnit } from './BattleUnit';

// 重新导出 BattleUnit 类型供外部使用
export type { BattleUnit } from './BattleUnit';

/**
 * 六边形格子
 */
export class HexCell {
    q: number;              // 列坐标
    r: number;              // 行坐标
    terrain: TerrainType;   // 地形类型
    unit: BattleUnit | null; // 当前格子上的单位
    isWalkable: boolean;    // 是否可行走

    constructor(q: number, r: number) {
        this.q = q;
        this.r = r;
        this.terrain = TerrainType.GRASS;
        this.unit = null;
        this.isWalkable = true;
    }

    /**
     * 获取格子的唯一标识符
     */
    get key(): string {
        return `${this.q},${this.r}`;
    }

    /**
     * 获取立方体坐标的第三个分量
     */
    get s(): number {
        return -this.q - this.r;
    }

    /**
     * 检查格子是否为空
     */
    isEmpty(): boolean {
        return this.unit === null && this.isWalkable;
    }
}

/**
 * 六边形方向
 */
export const HEX_DIRECTIONS: Hex[] = [
    { q: 1, r: 0 },    // 右
    { q: 1, r: -1 },   // 右上
    { q: 0, r: -1 },   // 左上
    { q: -1, r: 0 },   // 左
    { q: -1, r: 1 },   // 左下
    { q: 0, r: 1 }     // 右下
];

/**
 * 六边形网格系统
 */
export class HexGrid {
    private grid: Map<string, HexCell> = new Map();
    private radius: number;

    constructor(radius: number = BATTLEFIELD_RADIUS) {
        this.radius = radius;
        this.initializeGrid();
    }

    /**
     * 初始化六边形网格
     */
    private initializeGrid(): void {
        for (let q = -this.radius; q <= this.radius; q++) {
            const r1 = Math.max(-this.radius, -q - this.radius);
            const r2 = Math.min(this.radius, -q + this.radius);
            for (let r = r1; r <= r2; r++) {
                const cell = new HexCell(q, r);
                this.grid.set(cell.key, cell);
            }
        }
    }

    /**
     * 获取指定坐标的格子
     */
    getCell(q: number, r: number): HexCell | undefined {
        return this.grid.get(`${q},${r}`);
    }

    /**
     * 获取指定Hex坐标的格子
     */
    getCellByHex(hex: Hex): HexCell | undefined {
        return this.getCell(hex.q, hex.r);
    }

    /**
     * 检查坐标是否在网格内
     */
    isValidHex(q: number, r: number): boolean {
        return this.grid.has(`${q},${r}`);
    }

    /**
     * 计算两个六边形之间的距离
     */
    static distance(a: Hex, b: Hex): number {
        return (Math.abs(a.q - b.q) + Math.abs(a.q + a.r - b.q - b.r) + Math.abs(a.r - b.r)) / 2;
    }

    /**
     * 获取两个格子之间的距离
     */
    getDistance(a: Hex, b: Hex): number {
        return HexGrid.distance(a, b);
    }

    /**
     * 获取指定范围内的所有格子
     */
    getRange(center: Hex, range: number): HexCell[] {
        const results: HexCell[] = [];

        for (let q = -range; q <= range; q++) {
            for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
                if (q === 0 && r === 0) continue; // 跳过中心点

                const cell = this.getCell(center.q + q, center.r + r);
                if (cell) {
                    results.push(cell);
                }
            }
        }

        return results;
    }

    /**
     * 获取指定范围内的所有有效坐标
     */
    getRangeHexes(center: Hex, range: number): Hex[] {
        const results: Hex[] = [];

        for (let q = -range; q <= range; q++) {
            for (let r = Math.max(-range, -q - range); r <= Math.min(range, -q + range); r++) {
                if (q === 0 && r === 0) continue;

                const newHex = { q: center.q + q, r: center.r + r };
                if (this.isValidHex(newHex.q, newHex.r)) {
                    results.push(newHex);
                }
            }
        }

        return results;
    }

    /**
     * 获取相邻的格子（6个方向）
     */
    getNeighbors(cell: HexCell): HexCell[] {
        const neighbors: HexCell[] = [];

        for (const dir of HEX_DIRECTIONS) {
            const neighbor = this.getCell(cell.q + dir.q, cell.r + dir.r);
            if (neighbor) {
                neighbors.push(neighbor);
            }
        }

        return neighbors;
    }

    /**
     * 获取相邻的空格子
     */
    getEmptyNeighbors(cell: HexCell): HexCell[] {
        return this.getNeighbors(cell).filter(c => c.isEmpty());
    }

    /**
     * 获取相邻的敌人
     */
    getAdjacentEnemies(cell: HexCell, team: 'player' | 'enemy'): BattleUnit[] {
        const enemies: BattleUnit[] = [];

        for (const neighbor of this.getNeighbors(cell)) {
            if (neighbor.unit && neighbor.unit.team !== team) {
                enemies.push(neighbor.unit);
            }
        }

        return enemies;
    }

    /**
     * 获取相邻的友军
     */
    getAdjacentAllies(cell: HexCell, team: 'player' | 'enemy'): BattleUnit[] {
        const allies: BattleUnit[] = [];

        for (const neighbor of this.getNeighbors(cell)) {
            if (neighbor.unit && neighbor.unit.team === team) {
                allies.push(neighbor.unit);
            }
        }

        return allies;
    }

    /**
     * 获取环形范围（仅边缘）
     */
    getRing(center: Hex, radius: number): HexCell[] {
        if (radius === 0) {
            const cell = this.getCellByHex(center);
            return cell ? [cell] : [];
        }

        const results: HexCell[] = [];
        let hex: Hex = { q: center.q, r: center.r - radius };

        for (let i = 0; i < 6; i++) {
            for (let j = 0; j < radius; j++) {
                const cell = this.getCell(hex.q, hex.r);
                if (cell) {
                    results.push(cell);
                }
                hex = {
                    q: hex.q + HEX_DIRECTIONS[i].q,
                    r: hex.r + HEX_DIRECTIONS[i].r
                };
            }
        }

        return results;
    }

    /**
     * 获取线形范围（从起点到终点）
     */
    getLine(start: Hex, end: Hex): HexCell[] {
        const distance = HexGrid.distance(start, end);
        const results: HexCell[] = [];

        for (let i = 0; i <= distance; i++) {
            const t = distance === 0 ? 0 : i / distance;
            const hex = this.hexLerp(start, end, t);
            const cell = this.getCell(hex.q, hex.r);
            if (cell) {
                results.push(cell);
            }
        }

        return results;
    }

    /**
     * 六边形线性插值
     */
    private hexLerp(a: Hex, b: Hex, t: number): Hex {
        return {
            q: Math.round(a.q + (b.q - a.q) * t),
            r: Math.round(a.r + (b.r - a.r) * t)
        };
    }

    /**
     * A*寻路算法
     * 返回从start到end的路径（不包含起点）
     */
    findPath(start: Hex, end: Hex, ignoreUnits: boolean = false): Hex[] {
        // 检查终点是否可达
        const endCell = this.getCellByHex(end);
        if (!endCell || (!ignoreUnits && endCell.unit)) {
            return [];
        }

        const openSet: Hex[] = [start];
        const cameFrom: Map<string, Hex> = new Map();
        const gScore: Map<string, number> = new Map();
        const fScore: Map<string, number> = new Map();

        const startKey = `${start.q},${start.r}`;
        gScore.set(startKey, 0);
        fScore.set(startKey, HexGrid.distance(start, end));

        while (openSet.length > 0) {
            // 找到fScore最小的节点
            let current = openSet[0];
            let currentIndex = 0;
            for (let i = 1; i < openSet.length; i++) {
                const key = `${openSet[i].q},${openSet[i].r}`;
                const currentKey = `${current.q},${current.r}`;
                if ((fScore.get(key) || Infinity) < (fScore.get(currentKey) || Infinity)) {
                    current = openSet[i];
                    currentIndex = i;
                }
            }

            // 到达终点
            if (current.q === end.q && current.r === end.r) {
                return this.reconstructPath(cameFrom, current);
            }

            // 从openSet移除current
            openSet.splice(currentIndex, 1);

            // 遍历邻居
            const currentCell = this.getCellByHex(current);
            if (!currentCell) continue;

            for (const neighborCell of this.getNeighbors(currentCell)) {
                // 检查是否可通行
                if (!ignoreUnits && neighborCell.unit) continue;
                if (!neighborCell.isWalkable) continue;

                const neighbor = { q: neighborCell.q, r: neighborCell.r };
                const currentKey = `${current.q},${current.r}`;
                const neighborKey = `${neighbor.q},${neighbor.r}`;

                // 计算tentative gScore
                const tentativeGScore = (gScore.get(currentKey) || Infinity) +
                    this.getTerrainCost(neighborCell);

                if (tentativeGScore < (gScore.get(neighborKey) || Infinity)) {
                    // 这是一条更好的路径
                    cameFrom.set(neighborKey, current);
                    gScore.set(neighborKey, tentativeGScore);
                    fScore.set(neighborKey, tentativeGScore + HexGrid.distance(neighbor, end));

                    if (!openSet.some(h => h.q === neighbor.q && h.r === neighbor.r)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }

        // 没有找到路径
        return [];
    }

    /**
     * 重建路径
     */
    private reconstructPath(cameFrom: Map<string, Hex>, current: Hex): Hex[] {
        const path: Hex[] = [current];
        let currentKey = `${current.q},${current.r}`;

        while (cameFrom.has(currentKey)) {
            current = cameFrom.get(currentKey)!;
            currentKey = `${current.q},${current.r}`;
            path.unshift(current);
        }

        // 移除起点
        path.shift();
        return path;
    }

    /**
     * 获取地形消耗
     */
    private getTerrainCost(cell: HexCell): number {
        switch (cell.terrain) {
            case TerrainType.GRASS:
                return 1;
            case TerrainType.SNOW:
                return 1.5;
            case TerrainType.SAND:
                return 1.5;
            case TerrainType.SWAMP:
                return 2;
            case TerrainType.LAVA:
                return 3;
            default:
                return 1;
        }
    }

    /**
     * 获取所有格子
     */
    getAllCells(): HexCell[] {
        return Array.from(this.grid.values());
    }

    /**
     * 获取所有空格子
     */
    getEmptyCells(): HexCell[] {
        return this.getAllCells().filter(cell => cell.isEmpty());
    }

    /**
     * 放置单位
     */
    placeUnit(hex: Hex, unit: BattleUnit): boolean {
        const cell = this.getCellByHex(hex);
        if (!cell || cell.unit) {
            return false;
        }
        cell.unit = unit;
        unit.position = hex;
        return true;
    }

    /**
     * 移除单位
     */
    removeUnit(hex: Hex): BattleUnit | null {
        const cell = this.getCellByHex(hex);
        if (!cell || !cell.unit) {
            return null;
        }
        const unit = cell.unit;
        cell.unit = null;
        return unit;
    }

    /**
     * 移动单位
     */
    moveUnit(from: Hex, to: Hex): boolean {
        const fromCell = this.getCellByHex(from);
        const toCell = this.getCellByHex(to);

        if (!fromCell || !toCell || !fromCell.unit || toCell.unit) {
            return false;
        }

        const unit = fromCell.unit;
        fromCell.unit = null;
        toCell.unit = unit;
        unit.position = to;

        return true;
    }

    /**
     * 设置地形
     */
    setTerrain(hex: Hex, terrain: TerrainType): void {
        const cell = this.getCellByHex(hex);
        if (cell) {
            cell.terrain = terrain;
            cell.isWalkable = terrain !== TerrainType.WALL && terrain !== TerrainType.OBSTACLE;
        }
    }

    /**
     * 获取玩家起始区域（左侧）
     */
    getPlayerStartArea(): HexCell[] {
        return this.getAllCells().filter(cell => cell.q <= -2);
    }

    /**
     * 获取敌人起始区域（右侧）
     */
    getEnemyStartArea(): HexCell[] {
        return this.getAllCells().filter(cell => cell.q >= 2);
    }

    /**
     * 清空网格
     */
    clear(): void {
        for (const cell of this.getAllCells()) {
            cell.unit = null;
            cell.terrain = TerrainType.GRASS;
            cell.isWalkable = true;
        }
    }

    /**
     * 重置网格
     */
    reset(): void {
        this.grid.clear();
        this.initializeGrid();
    }
}

/**
 * 六边形工具函数
 */
export class HexUtils {
    /**
     * 将轴向坐标转换为像素坐标（pointy-top布局）
     */
    static hexToPixel(hex: Hex, size: number): { x: number; y: number } {
        const x = size * (Math.sqrt(3) * hex.q + Math.sqrt(3) / 2 * hex.r);
        const y = size * (3 / 2 * hex.r);
        return { x, y };
    }

    /**
     * 将像素坐标转换为轴向坐标（pointy-top布局）
     */
    static pixelToHex(x: number, y: number, size: number): Hex {
        const q = (Math.sqrt(3) / 3 * x - 1 / 3 * y) / size;
        const r = (2 / 3 * y) / size;
        return HexUtils.hexRound({ q, r });
    }

    /**
     * 六边形坐标取整
     */
    static hexRound(hex: { q: number; r: number }): Hex {
        const s = -hex.q - hex.r;
        let q = Math.round(hex.q);
        let r = Math.round(hex.r);
        let sRounded = Math.round(s);

        const qDiff = Math.abs(q - hex.q);
        const rDiff = Math.abs(r - hex.r);
        const sDiff = Math.abs(sRounded - s);

        if (qDiff > rDiff && qDiff > sDiff) {
            q = -r - sRounded;
        } else if (rDiff > sDiff) {
            r = -q - sRounded;
        }

        return { q, r };
    }

    /**
     * 获取六边形的角落点（pointy-top布局）
     */
    static hexCorners(center: { x: number; y: number }, size: number): { x: number; y: number }[] {
        const corners: { x: number; y: number }[] = [];
        for (let i = 0; i < 6; i++) {
            const angleDeg = 60 * i - 30;
            const angleRad = Math.PI / 180 * angleDeg;
            corners.push({
                x: center.x + size * Math.cos(angleRad),
                y: center.y + size * Math.sin(angleRad)
            });
        }
        return corners;
    }
}