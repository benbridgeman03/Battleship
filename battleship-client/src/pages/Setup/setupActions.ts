import { Ships } from "../../models/Ship";
import type { Ship, ShipPlacement } from "../../models/Ship";
import type { Cell } from "../../models/Cell";

interface PlaceShipResult {
    board: Cell[][];
    placement: ShipPlacement;
    placedCounts: Record<string, number>;
}

export function placeShip(
    board: Cell[][],
    x: number,
    y: number,
    ship: Ship,
    isHorizontal: boolean,
    placedCounts: Record<string, number>
): PlaceShipResult | { error: string } {
    if (placedCounts[ship.name] >= ship.maxCount) return { error: "Already placed maximum of this ship." };

    for (let i = 0; i < ship.size; i++) {
        const cx = isHorizontal ? x + i : x;
        const cy = isHorizontal ? y : y + i;
        if (cx >= 10 || cy >= 10) return { error: "Ship placement is out of bounds!" };
        if (board[cy][cx].ship !== null) return { error: "Ships can't overlap!" };
    }

    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    for (let i = 0; i < ship.size; i++) {
        const cx = isHorizontal ? x + i : x;
        const cy = isHorizontal ? y : y + i;
        newBoard[cy][cx].ship = ship.name;
    }

    return {
        board: newBoard,
        placement: { shipName: ship.name, startX: x, startY: y, horizontal: isHorizontal, size: ship.size },
        placedCounts: { ...placedCounts, [ship.name]: placedCounts[ship.name] + 1 },
    };
}

interface RandomPlacementResult {
    board: Cell[][];
    placements: ShipPlacement[];
    placedCounts: Record<string, number>;
}

export function placeRandom(baseBoard: Cell[][]): RandomPlacementResult {
    const grid: boolean[][] = Array.from({ length: 10 }, () => Array(10).fill(false));
    const placements: ShipPlacement[] = [];

    Ships.forEach(ship => {
        for (let count = 0; count < ship.maxCount; count++) {
            const GRID_SIZE = 10;
            let placed = false;

            while (!placed) {
                const isHorizontal = Math.random() < 0.5;
                const x = Math.floor(Math.random() * (isHorizontal ? GRID_SIZE - ship.size + 1 : GRID_SIZE));
                const y = Math.floor(Math.random() * (isHorizontal ? GRID_SIZE : GRID_SIZE - ship.size + 1));

                let valid = true;
                for (let i = 0; i < ship.size; i++) {
                    const cx = isHorizontal ? x + i : x;
                    const cy = isHorizontal ? y : y + i;
                    if (grid[cy][cx]) {
                        valid = false;
                        break;
                    }
                }

                if (valid) {
                    for (let i = 0; i < ship.size; i++) {
                        const cx = isHorizontal ? x + i : x;
                        const cy = isHorizontal ? y : y + i;
                        grid[cy][cx] = true;
                    }
                    placements.push({
                        shipName: ship.name,
                        startX: x,
                        startY: y,
                        horizontal: isHorizontal,
                        size: ship.size,
                    });
                    placed = true;
                }
            }
        }
    });

    const board = baseBoard.map(row => row.map(cell => ({ ...cell, ship: null as Cell["ship"] })));
    placements.forEach(p => {
        for (let i = 0; i < p.size; i++) {
            const cx = p.horizontal ? p.startX + i : p.startX;
            const cy = p.horizontal ? p.startY : p.startY + i;
            board[cy][cx].ship = p.shipName;
        }
    });

    const placedCounts: Record<string, number> = {
        carrier: 0, battleship: 0, cruiser: 0, submarine: 0, destroyer: 0,
    };
    placements.forEach(p => {
        placedCounts[p.shipName] = (placedCounts[p.shipName] || 0) + 1;
    });

    return { board, placements, placedCounts };
}

interface MoveShipResult {
    board: Cell[][];
    placements: ShipPlacement[];
    placedCounts: Record<string, number>;
    pickedUpShip: Ship;
    pickedUpHorizontal: boolean;
}

export function moveShip(
    board: Cell[][],
    x: number,
    y: number,
    placements: ShipPlacement[],
    placedCounts: Record<string, number>
): MoveShipResult | null {
    const cell = board[y][x];
    if (!cell.ship) return null;

    const shipName = cell.ship;
    const placement = placements.find(p => {
        if (p.shipName !== shipName) return false;
        for (let i = 0; i < p.size; i++) {
            const cx = p.horizontal ? p.startX + i : p.startX;
            const cy = p.horizontal ? p.startY : p.startY + i;
            if (cx === x && cy === y) return true;
        }
        return false;
    });
    if (!placement) return null;

    const ship = Ships.find(s => s.name === shipName);
    if (!ship) return null;

    const newBoard = board.map(row => row.map(c => ({ ...c })));
    for (let i = 0; i < placement.size; i++) {
        const cx = placement.horizontal ? placement.startX + i : placement.startX;
        const cy = placement.horizontal ? placement.startY : placement.startY + i;
        newBoard[cy][cx].ship = null as Cell["ship"];
    }

    return {
        board: newBoard,
        placements: placements.filter(p => p !== placement),
        placedCounts: { ...placedCounts, [shipName]: placedCounts[shipName] - 1 },
        pickedUpShip: ship,
        pickedUpHorizontal: placement.horizontal,
    };
}

export function clearBoard(board: Cell[][]): {
    board: Cell[][];
    placements: ShipPlacement[];
    placedCounts: Record<string, number>;
} {
    return {
        board: board.map(row => row.map(cell => ({ ...cell, ship: null as Cell["ship"] }))),
        placements: [],
        placedCounts: { carrier: 0, battleship: 0, cruiser: 0, submarine: 0, destroyer: 0 },
    };
}
