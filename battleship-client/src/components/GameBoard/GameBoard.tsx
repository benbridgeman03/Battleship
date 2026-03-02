import { useState } from "react";
import { useGame } from "../../context/GameContext";
import { useBoardEvents } from "./useBoardEvents";
import { getCellColor } from "./boardUtils";
import { handleBoardClick } from "./boardActions";
import type { Cell } from "../../models/Cell";

interface GameBoardProps {
    isOpponent: boolean;
    isSetup?: boolean;
    cells: Cell[][];
    setCells: React.Dispatch<React.SetStateAction<Cell[][]>>;
    onCellClick?: (x: number, y: number) => void;
}

function GameBoard({ isOpponent, isSetup = false, cells, setCells, onCellClick }: GameBoardProps) {
    const { selectedShip, horizontal, showMessage } = useGame();
    const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);

    useBoardEvents(isOpponent, setCells, showMessage);

    return (
        <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(10, 40px)",
            gap: "2px"
        }}>
            {cells.map((row, y) =>
                row.map((cell, x) => (
                    <div
                        onMouseEnter={() => setHoveredCell({ x, y })}
                        onMouseLeave={() => setHoveredCell(null)}
                        key={`${x}-${y}`}
                        onClick={() => handleBoardClick(x, y, cell, isSetup, isOpponent, showMessage, onCellClick)}
                        style={{
                            width: 40,
                            height: 40,
                            backgroundColor: getCellColor(cell, isOpponent, x, y, hoveredCell, isSetup, selectedShip, horizontal),
                            border: "1px solid #333",
                            cursor: (isOpponent || isSetup) ? "pointer" : "default"
                        }}
                    />
                ))
            )}
        </div>
    );
}

export default GameBoard;
