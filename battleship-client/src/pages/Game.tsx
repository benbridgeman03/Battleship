// screens/GameScreen.tsx
import { useEffect, useRef } from "react";
import { useGame } from "../context/GameContext";
import GameBoard from "../components/GameBoard";

function formatEntry(entry: { player: string; x: number; y: number; result: string; shipName?: string }) {
    const who = entry.player === "you" ? "You" : "Opponent";
    const coord = `(${entry.x}, ${entry.y})`;
    if (entry.result === "sunk") return `${who} fired at ${coord} - Sunk ${entry.shipName}!`;
    if (entry.result === "hit") return `${who} fired at ${coord} - Hit ${entry.shipName}!`;
    return `${who} fired at ${coord} - Miss`;
}

function Game() {
    const { myBoard, setMyBoard, opponentBoard, setOpponentBoard, isMyTurn, history } = useGame();
    const historyEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    return (
        <div>
            <h1>Battleship</h1>
            <h3>{isMyTurn ? "Your turn" : "Waiting for opponent..."}</h3>
            <div style={{ display: "flex", gap: "60px" }}>
                <div>
                    <h2>Your Board</h2>
                    <GameBoard isOpponent={false} cells={myBoard} setCells={setMyBoard} />
                </div>
                <div>
                    <h2>Opponent's Board</h2>
                    <GameBoard isOpponent={true} cells={opponentBoard} setCells={setOpponentBoard} />
                </div>
                <div style={{ minWidth: "250px" }}>
                    <h2>History</h2>
                    <div style={{
                        height: "420px",
                        overflowY: "auto",
                        border: "1px solid #333",
                        borderRadius: "8px",
                        padding: "0.5rem",
                        textAlign: "left",
                    }}>
                        {history.length === 0 && <p style={{ color: "#888" }}>No shots fired yet.</p>}
                        {history.map((entry, i) => (
                            <p key={i} style={{
                                margin: "0.25rem 0",
                                color: entry.result === "miss" ? "#888" : entry.result === "sunk" ? "#ff4444" : "#ffaa00",
                            }}>
                                {formatEntry(entry)}
                            </p>
                        ))}
                        <div ref={historyEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;