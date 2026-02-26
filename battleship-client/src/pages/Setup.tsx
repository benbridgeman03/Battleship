// screens/SetupScreen.tsx
import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { Ships } from "../models/Ship";
import type { ShipPlacement } from "../models/Ship";
import GameBoard from "../components/GameBoard";
import connection from "../services/signalRService";
import type { Cell } from "../models/Cell";

function Setup() {
    const { myBoard, setMyBoard, selectedShip, setSelectedShip, horizontal, setHorizontal } = useGame();
    const [placedCounts, setPlacedCounts] = useState<Record<string, number>>({
        carrier: 0,
        battleship: 0,
        cruiser: 0,
        submarine: 0,
        destroyer: 0,
    });
    const [placements, setPlacements] = useState<ShipPlacement[]>([]);
    const [isReady, setIsReady] = useState(false);
    const allPlaced = Ships.every(ship => placedCounts[ship.name] >= ship.maxCount);

    useEffect(() => {
        function handleRightClick(e: MouseEvent) {
            if (selectedShip) {
                e.preventDefault();
                setHorizontal(prev => !prev);
            }
        }
        window.addEventListener("contextmenu", handleRightClick);
        return () => window.removeEventListener("contextmenu", handleRightClick);
    }, [selectedShip, setHorizontal]);

    function handlePlaceShip(x: number, y: number, ship = selectedShip, isHorizontal = horizontal) {
        if (!ship) return;
        if (placedCounts[ship.name] >= ship.maxCount) return;

        for (let i = 0; i < ship.size; i++) {
            const cx = isHorizontal ? x + i : x;
            const cy = isHorizontal ? y : y + i;
            if (cx >= 10 || cy >= 10) {
                alert("Ship placement is out of bounds!");
                return;
            }
            if (myBoard[cy][cx].ship !== null) {
                alert("Ships can't overlap!");
                return;
            }
        }

        setPlacements(prev => [...prev, {
            shipName: ship.name,
            startX: x,
            startY: y,
            horizontal: isHorizontal,
            size: ship.size
        }]);

        setMyBoard(prev => {
            const newCells = prev.map(row => row.map(cell => ({ ...cell })));
            for (let i = 0; i < ship.size; i++) {
                const cx = isHorizontal ? x + i : x;
                const cy = isHorizontal ? y : y + i;
                newCells[cy][cx].ship = ship.name;
            }
            return newCells;
        });

        setPlacedCounts(prev => ({
            ...prev,
            [ship.name]: prev[ship.name] + 1
        }));

        setSelectedShip(null);
    }

    function handleReady() {
        if(isReady){
            connection.invoke("PlayerUnready");
            setIsReady(false);
        }
        else if(!isReady){
            connection.invoke("PlayerReady", placements);
            setIsReady(true);
        }        
    }

    function placeRandom() {
        const grid: boolean[][] = Array.from({ length: 10 }, () => Array(10).fill(false));
        const newPlacements: ShipPlacement[] = [];

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
                        newPlacements.push({
                            shipName: ship.name,
                            startX: x,
                            startY: y,
                            horizontal: isHorizontal,
                            size: ship.size
                        });
                        placed = true;
                    }
                }
            }
        });

        setMyBoard(prev => {
            const newCells = prev.map(row => row.map(cell => ({ ...cell, ship: null as Cell["ship"] })));
            newPlacements.forEach(p => {
                for (let i = 0; i < p.size; i++) {
                    const cx = p.horizontal ? p.startX + i : p.startX;
                    const cy = p.horizontal ? p.startY : p.startY + i;
                    newCells[cy][cx].ship = p.shipName;
                }
            });
            return newCells;
        });

        setPlacements(newPlacements);
        setPlacedCounts({
            carrier: 0, battleship: 0, cruiser: 0, submarine: 0, destroyer: 0,
            ...newPlacements.reduce((acc, p) => {
                acc[p.shipName] = (acc[p.shipName] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        });
        setSelectedShip(null);
    }

    return (
        <div>
            <h1>{isReady ? "Ready!" : "Setup your ships"}</h1>
            {selectedShip && (
                <p>Placing: {selectedShip.name} — {horizontal ? "Horizontal" : "Vertical"} — Right click to rotate</p>
            )}
           {Ships.map((ship) => {
                const remaining = ship.maxCount - placedCounts[ship.name];
                const isFullyPlaced = remaining <= 0;

                return (
                    <div key={ship.name}>
                        <span>{ship.name} ({ship.size} cells) — {remaining} left</span>
                        <button 
                            onClick={() => setSelectedShip(ship)}
                            disabled={isFullyPlaced}
                        >
                            {isFullyPlaced ? "Placed" : selectedShip?.name === ship.name ? "Selected" : "Select"}
                        </button>
                    </div>
                );
            })}
            <button onClick={placeRandom}>{"Randomize"}</button>
            <GameBoard isOpponent={false} isSetup={true} cells={myBoard} setCells={setMyBoard} onCellClick={handlePlaceShip} />
            {allPlaced && <button onClick={handleReady}>{isReady ? "UnReady" : "Ready"}</button>}
        </div>
    );
}

export default Setup;