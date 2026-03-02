import type { Cell } from "../../models/Cell";
import type { Ship } from "../../models/Ship";

export function getCellColor(
    cell: Cell,
    isOpponent: boolean,
    x: number,
    y: number,
    hoveredCell: { x: number; y: number } | null,
    isSetup: boolean,
    selectedShip: Ship | null,
    horizontal: boolean
): string {
    if (isOpponent) {
        if (cell.isHit) return cell.isShipHit ? "red" : "white";
    } else {
        if (cell.isHit && cell.ship) return "red";
        if (cell.isHit && !cell.ship) return "white";
        if (cell.ship) return "grey";
    }

    if (hoveredCell && isSetup && selectedShip) {
        const previewCells = getShipPreviewCells(hoveredCell, selectedShip, horizontal);
        if (previewCells.some(c => c.x === x && c.y === y)) return "lightgreen";
    }

    if (hoveredCell && isOpponent && x === hoveredCell.x && y === hoveredCell.y) {
        return "lightyellow";
    }

    return "lightblue";
}

export function getShipPreviewCells(
    hoveredCell: { x: number; y: number },
    selectedShip: Ship,
    horizontal: boolean
): { x: number; y: number }[] {
    const cells: { x: number; y: number }[] = [];
    for (let i = 0; i < selectedShip.size; i++) {
        cells.push({
            x: horizontal ? hoveredCell.x + i : hoveredCell.x,
            y: horizontal ? hoveredCell.y : hoveredCell.y + i,
        });
    }
    return cells;
}
