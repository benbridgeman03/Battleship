import { useEffect } from "react";
import connection from "../../services/signalRService";
import type { Cell } from "../../models/Cell";

export function useBoardEvents(
    isOpponent: boolean,
    setCells: React.Dispatch<React.SetStateAction<Cell[][]>>,
    showMessage: (text: string, highlight?: string, color?: string) => void
) {
    useEffect(() => {
        const eventName = isOpponent ? "ShotFired" : "IncomingShot";

        connection.on(eventName, (x: number, y: number, isHit: boolean, hitShipName: string, isSunk: boolean) => {
            setCells(prev => {
                const newCells = prev.map(row => row.map(cell => ({ ...cell })));
                newCells[y][x].isHit = true;
                newCells[y][x].isShipHit = isHit;
                return newCells;
            });

            if (isOpponent) {
                if (isSunk) {
                    showMessage(`You fired at ${x}, ${y}`, `Sunk their ${hitShipName}!`, "red");
                } else {
                    showMessage(`You fired at ${x}, ${y}`, isHit ? `Hit their ${hitShipName}!` : "Miss!", isHit ? "red" : "green");
                }
            } else {
                if (isSunk) {
                    showMessage(`Opponent fired at ${x}, ${y}`, `Your ${hitShipName} was sunk!`, "red");
                } else {
                    showMessage(`Opponent fired at ${x}, ${y}`, isHit ? `They hit your ${hitShipName}!` : "They missed!", isHit ? "red" : "green");
                }
            }
        });

        return () => {
            connection.off(eventName);
        };
    }, [isOpponent, setCells, showMessage]);
}
