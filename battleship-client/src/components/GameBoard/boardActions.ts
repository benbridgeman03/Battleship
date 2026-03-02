import connection from "../../services/signalRService";
import type { Cell } from "../../models/Cell";

export function handleBoardClick(
    x: number,
    y: number,
    cell: Cell,
    isSetup: boolean,
    isOpponent: boolean,
    showMessage: (text: string) => void,
    onCellClick?: (x: number, y: number) => void
) {
    if (cell.isHit) {
        showMessage("This cell has already been targeted!");
        return;
    }
    if (isSetup && !isOpponent) {
        onCellClick?.(x, y);
        return;
    }
    if (!isOpponent) return;
    connection.invoke("Fire", x, y);
}
