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
        if (cell.isHit) return cell.isShipHit ? "rgba(200,30,30,0.8)" : "rgba(255,255,255,0.6)";
    } else {
        if (cell.isHit && cell.ship) return "rgba(200,30,30,0.6)";
        if (cell.isHit && !cell.ship) return "rgba(255,255,255,0.6)";
        if (cell.ship) return "transparent";
    }

    if (hoveredCell && isSetup && selectedShip) {
        const previewCells = getShipPreviewCells(hoveredCell, selectedShip, horizontal);
        if (previewCells.some(c => c.x === x && c.y === y)) return "rgba(100,220,100,0.5)";
    }

    if (hoveredCell && isOpponent && x === hoveredCell.x && y === hoveredCell.y) {
        return "rgba(255,255,200,0.3)";
    }

    return "transparent";
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
