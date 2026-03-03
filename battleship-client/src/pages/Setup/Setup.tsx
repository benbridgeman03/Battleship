// screens/SetupScreen.tsx
import { useEffect, useState } from "react";
import { useGame } from "../../context/GameContext";
import { Ships } from "../../models/Ship";
import type { ShipPlacement } from "../../models/Ship";
import GameBoard from "../../components/GameBoard";
import connection from "../../services/signalRService";
import { placeShip, placeRandom, moveShip, clearBoard } from "./setupActions";

function Setup() {
    const { myBoard, setMyBoard, selectedShip, setSelectedShip, horizontal, setHorizontal, setMyPlacements, showAlert } = useGame();
    const [placedCounts, setPlacedCounts] = useState<Record<string, number>>({
        carrier: 0, battleship: 0, cruiser: 0, submarine: 0, destroyer: 0,
    });
    const [placements, setPlacements] = useState<ShipPlacement[]>([]);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        setMyPlacements(placements);
    }, [placements, setMyPlacements]);
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
        <div className="page">
            <div className="page-header">
                <h1>{isReady ? "Standing By" : "Deploy Fleet"}</h1>
                {selectedShip && (
                    <div className="page-subtitle">
                        Placing {selectedShip.name} &mdash; {horizontal ? "Horizontal" : "Vertical"} &mdash; Right click to rotate
                    </div>
                )}
                {!selectedShip && !isReady && (
                    <div className="page-subtitle">Select a ship, then click the board to place it</div>
                )}
                {isReady && (
                    <div className="page-subtitle">Waiting for opponent to finish setup...</div>
                )}
            </div>

            <div className="setup-layout">
                <div className="setup-sidebar panel panel-glow">
                    <h2 style={{ marginBottom: "0.75rem" }}>Fleet</h2>
                    {Ships.map((ship) => {
                        const remaining = ship.maxCount - placedCounts[ship.name];
                        const isFullyPlaced = remaining <= 0;
                        const isSelected = selectedShip?.name === ship.name;

                        return (
                            <div
                                key={ship.name}
                                className={`ship-card${isSelected ? " selected" : ""}${isFullyPlaced ? " placed" : ""}`}
                                onClick={() => !isFullyPlaced && setSelectedShip(ship)}
                                style={{ cursor: isFullyPlaced ? "default" : "pointer" }}
                            >
                                <div className="ship-info">
                                    <span className="ship-name">{ship.name}</span>
                                    <span className="ship-meta">
                                        {remaining > 0 ? `${remaining} remaining` : "Deployed"}
                                    </span>
                                </div>
                                <div className="ship-dots">
                                    {Array.from({ length: ship.size }, (_, i) => (
                                        <div key={i} className="ship-dot" />
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    <div style={{ marginTop: "0.75rem" }} className="setup-actions">
                        <button onClick={handlePlaceRandom}>Randomize</button>
                        <button className="btn-ghost" onClick={handleClearBoard}>Clear</button>
                    </div>
                </div>

                <div className="setup-board-area">
                    <GameBoard isOpponent={false} isSetup={true} cells={myBoard} setCells={setMyBoard} onCellClick={handleCellClick} />
                    {allPlaced && (
                        <button
                            className={isReady ? "btn-danger" : "btn-primary"}
                            onClick={handleReady}
                            style={{ width: "100%" }}
                        >
                            {isReady ? "Cancel Ready" : "Ready"}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Setup;
