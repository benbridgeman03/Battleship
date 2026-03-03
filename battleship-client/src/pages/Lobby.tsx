// screens/LobbyScreen.tsx
import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";

function Lobby() {
    const { connection } = useGame();
    const [gameId, setGameId] = useState("");
    const [joinCode, setJoinCode] = useState("");

    useEffect(() => {
        connection.on("GameCreated", (id: string) => setGameId(id));
        return () => {
            connection.off("GameCreated");
        };
    }, [connection]);

    return (
        <div className="page">
            <div className="lobby-container">
                <div className="page-header">
                    <h1>Battleship</h1>
                </div>

                <div className="lobby-actions">
                    <div className="panel panel-glow lobby-section">
                        <button className="btn-primary" onClick={() => connection.invoke("CreateGame")}>
                            Create Game
                        </button>
                        {gameId && (
                            <>
                                <div className="lobby-code">{gameId}</div>
                                <div className="lobby-waiting">Waiting for opponent...</div>
                            </>
                        )}
                    </div>

                    <div className="divider" />

                    <div className="panel panel-glow lobby-section">
                        <input
                            placeholder="Enter game code"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                        />
                        <button onClick={() => connection.invoke("JoinGame", joinCode)}>
                            Join Game
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Lobby;
