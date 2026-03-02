// screens/SetupScreen.tsx
import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { Ships } from "../../models/Ship";
import type { ShipPlacement } from "../../models/Ship";
import GameBoard from "../../components/GameBoard";
import connection from "../../services/signalRService";
import { placeShip, placeRandom, moveShip, clearBoard } from "./setupActions";

function Setup() {
    const { myBoard, setMyBoard, selectedShip, setSelectedShip, horizontal, setHorizontal, showAlert } = useGame();
    const [placedCounts, setPlacedCounts] = useState<Record<string, number>>({
        carrier: 0, battleship: 0, cruiser: 0, submarine: 0, destroyer: 0,
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

    function handleCellClick(x: number, y: number) {
        const cell = myBoard[y][x];
        if (cell.ship) {
            const result = moveShip(myBoard, x, y, placements, placedCounts);
            if (!result) return;
            setMyBoard(result.board);
            setPlacements(result.placements);
            setPlacedCounts(result.placedCounts);
            setSelectedShip(result.pickedUpShip);
            setHorizontal(result.pickedUpHorizontal);
        } else if (selectedShip) {
            const result = placeShip(myBoard, x, y, selectedShip, horizontal, placedCounts);
            if ("error" in result) {
                showAlert(undefined, result.error, "red");
                return;
            }
            setMyBoard(result.board);
            setPlacements(prev => [...prev, result.placement]);
            setPlacedCounts(result.placedCounts);
            setSelectedShip(null);
        }
    }

    function handlePlaceRandom() {
        const result = placeRandom(myBoard);
        setMyBoard(result.board);
        setPlacements(result.placements);
        setPlacedCounts(result.placedCounts);
        setSelectedShip(null);
    }

    function handleClearBoard() {
        const result = clearBoard(myBoard);
        setMyBoard(result.board);
        setPlacements(result.placements);
        setPlacedCounts(result.placedCounts);
    }

    function handleReady() {
        if (isReady) {
            connection.invoke("PlayerUnready");
            setIsReady(false);
        } else {
            connection.invoke("PlayerReady", placements);
            setIsReady(true);
        }
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
            <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={handlePlaceRandom}>Randomize</button>
                <button onClick={handleClearBoard}>Clear Board</button>
            </div>
            <GameBoard isOpponent={false} isSetup={true} cells={myBoard} setCells={setMyBoard} onCellClick={handleCellClick} />
            {allPlaced && <button onClick={handleReady}>{isReady ? "UnReady" : "Ready"}</button>}
        </div>
    );
}

export default Setup;
