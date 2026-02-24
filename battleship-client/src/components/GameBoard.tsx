import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import connection from "../services/signalRService";
import type { Cell } from "../models/Cell";

interface GameBoardProps {
    isOpponent: boolean;
    isSetup?: boolean;
    cells: Cell[][];
    setCells: React.Dispatch<React.SetStateAction<Cell[][]>>;
    onCellClick?: (x: number, y: number) => void;
}

function GameBoard({ isOpponent, isSetup = false, cells, setCells, onCellClick }: GameBoardProps) {
    const { selectedShip, horizontal } = useGame();
    const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);

    useEffect(() => {
        const eventName = isOpponent ? "ShotFired" : "IncomingShot";

        connection.on(eventName, (x: number, y: number) => {
            setCells(prev => {
                const newCells = prev.map(row => row.map(cell => ({ ...cell })));
                newCells[y][x].isHit = true;
                return newCells;
            });
        });

        return () => {
            connection.off(eventName);
        };
    }, [isOpponent, setCells]);

    function handleClick(x: number, y: number) {
        if (isSetup && !isOpponent) {
            onCellClick?.(x, y);
            return;
        }
        if (!isOpponent) return;
        connection.invoke("Fire", x, y);
    }

    function getCellColor(cell: Cell, isOpponent: boolean, x: number, y: number): string {
        if (cell.isHit && cell.ship) return "red";
        if (cell.isHit && !cell.ship) return "white";
        if (!isOpponent && cell.ship) return "grey";

        if (hoveredCell && isSetup && selectedShip) {
            for (let i = 0; i < selectedShip.size; i++) {
                const cx = horizontal ? hoveredCell.x + i : hoveredCell.x;
                const cy = horizontal ? hoveredCell.y : hoveredCell.y + i;
                if (x === cx && y === cy) return "lightgreen";
            }
        }

        if (hoveredCell && isOpponent && x === hoveredCell.x && y === hoveredCell.y) {
            return "lightyellow";
        }

        return "lightblue";
    }

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
                        onClick={() => handleClick(x, y)}
                        style={{
                            width: 40,
                            height: 40,
                            backgroundColor: getCellColor(cell, isOpponent, x, y),
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