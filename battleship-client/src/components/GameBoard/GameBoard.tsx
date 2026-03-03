import { useState } from "react";
import { useGame } from "../../context/GameContext";
import { useBoardEvents } from "./useBoardEvents";
import { getCellColor } from "./boardUtils";
import { handleBoardClick } from "./boardActions";
import { ShipImageMap } from "../../models/Ship";
import type { Cell } from "../../models/Cell";
import "./GameBoard.css";

const CELL_SIZE = 40;

interface GameBoardProps {
    isOpponent: boolean;
    isSetup?: boolean;
    cells: Cell[][];
    setCells: React.Dispatch<React.SetStateAction<Cell[][]>>;
    onCellClick?: (x: number, y: number) => void;
}

function GameBoard({ isOpponent, isSetup = false, cells, setCells, onCellClick }: GameBoardProps) {
    const { selectedShip, horizontal, showPopup, myPlacements } = useGame();
    const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);

    useBoardEvents(isOpponent, setCells, showPopup);

    const placements = isOpponent ? [] : myPlacements;

    return (
        <div className="game-board">
            {placements.map((p, i) => (
                <img
                    key={`ship-${i}`}
                    className="ship-overlay"
                    src={ShipImageMap[p.shipName]}
                    alt={p.shipName}
                    style={{
                        left: p.startX * CELL_SIZE,
                        top: p.startY * CELL_SIZE,
                        width: CELL_SIZE,
                        height: p.size * CELL_SIZE,
                        ...(p.horizontal ? {
                            transformOrigin: "top left",
                            transform: `translateX(${p.size * CELL_SIZE}px) rotate(90deg)`,
                        } : {}),
                    }}
                />
            ))}
            {cells.map((row, y) =>
                row.map((cell, x) => (
                    <div
                        className={`game-board-cell${(isOpponent || isSetup) ? " clickable" : ""}`}
                        onMouseEnter={() => setHoveredCell({ x, y })}
                        onMouseLeave={() => setHoveredCell(null)}
                        key={`${x}-${y}`}
                        onClick={() => handleBoardClick(x, y, cell, isSetup, isOpponent, showPopup, onCellClick)}
                        style={{
                            backgroundColor: getCellColor(cell, isOpponent, x, y, hoveredCell, isSetup, selectedShip, horizontal),
                        }}
                    />
                ))
            )}
        </div>
    );
}

export default GameBoard;
