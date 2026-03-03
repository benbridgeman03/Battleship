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
    const { myBoard, setMyBoard, opponentBoard, setOpponentBoard, isMyTurn, history, handleLeaveGamePopup } = useGame();
    const historyEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [history]);

    return (
        <div className="page">
            <div className={`turn-indicator ${isMyTurn ? "your-turn" : "waiting"}`}>
                {isMyTurn ? "Your Turn — Fire!" : "Opponent's Turn..."}
            </div>

            <div className="game-layout">
                <div className="board-section">
                    <div className="board-label">Your Waters</div>
                    <GameBoard isOpponent={false} cells={myBoard} setCells={setMyBoard} />
                    <button className="btn-danger" style={{alignSelf: "flex-start"}} onClick={handleLeaveGamePopup}>
                        Leave Game
                    </button>
                </div>

                <div className="board-section">
                    <div className="board-label">Enemy Waters</div>
                    <GameBoard isOpponent={true} cells={opponentBoard} setCells={setOpponentBoard} />
                </div>

                <div className="history-panel panel panel-glow">
                    <div className="board-label" style={{ marginBottom: "0.5rem" }}>Battle Log</div>
                    <div className="history-scroll">
                        {history.length === 0 && (
                            <div className="history-empty">No shots fired yet.</div>
                        )}
                        {history.map((entry, i) => (
                            <div key={i}>
                                <div className={`history-entry ${entry.result}`}>
                                    {formatEntry(entry)}
                                </div>
                                {entry.result === "miss" && i < history.length - 1 && (
                                    <div className="history-divider" />
                                )}
                            </div>
                        ))}
                        <div ref={historyEndRef} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Game;
