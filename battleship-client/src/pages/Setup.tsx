// screens/SetupScreen.tsx
import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";
import { Ships } from "../models/Ship";
import type { ShipPlacement } from "../models/Ship";
import GameBoard from "../components/GameBoard";
import connection from "../services/signalRService";

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

    function handlePlaceShip(x: number, y: number) {
        if (!selectedShip) return;
        if (placedCounts[selectedShip.name] >= selectedShip.maxCount) return;

        for (let i = 0; i < selectedShip.size; i++) {
            const cx = horizontal ? x + i : x;
            const cy = horizontal ? y : y + i;
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
            shipName: selectedShip.name,
            startX: x,
            startY: y,
            horizontal: horizontal,
            size: selectedShip.size
        }]);

        setMyBoard(prev => {
            const newCells = prev.map(row => row.map(cell => ({ ...cell })));
            for (let i = 0; i < selectedShip.size; i++) {
                const cx = horizontal ? x + i : x;
                const cy = horizontal ? y : y + i;
                newCells[cy][cx].ship = selectedShip.name;
            }
            return newCells;
            
        });

        setPlacedCounts(prev => ({
            ...prev,
            [selectedShip.name]: prev[selectedShip.name] + 1
        }));

        setSelectedShip(null);
    }

    function handleReady() {
        console.log(placements);
        connection.invoke("PlayerReady", placements);
        alert("Ready to play!");
    }

    return (
        <div>
            <h2>Place Your Ships</h2>
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
            <GameBoard isOpponent={false} isSetup={true} cells={myBoard} setCells={setMyBoard} onCellClick={handlePlaceShip} />
            {allPlaced && <button onClick={handleReady}>Ready!</button>}
        </div>
    );
}

export default Setup;