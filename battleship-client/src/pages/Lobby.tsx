// screens/LobbyScreen.tsx
import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";

function Lobby() {
    const { connection } = useGame();
    const [gameId, setGameId] = useState("");
    const [joinCode, setJoinCode] = useState("");
    const [isCreatingGame, setIsCreatingGame] = useState(false);

    useEffect(() => {
        connection.on("GameCreated", (id: string) => setGameId(id));
        return () => {
            connection.off("GameCreated");
        };
    }, [connection]);

    function handleCreateGame() {
        setIsCreatingGame(prev => {
            const newValue = !prev;

            if (newValue) {
                connection.invoke("CreateGame");
            }else{
                connection.invoke("CancelGame");
            }

            return newValue;
        });
    }

    return (
        <div className="page">
            <div className="lobby-container">
                <div className="page-header">
                    <h1>Battleship</h1>
                </div>

                <div className="lobby-actions">
                    <div className="panel panel-glow lobby-section">
                        <button className={isCreatingGame ? "btn-danger" : "btn-primary"} onClick={handleCreateGame}>
                                {isCreatingGame ? "Cancel" : "Create Game"}
                        </button>
                        {gameId && isCreatingGame && (
                            <>
                                <div className="lobby-code">{gameId}</div>
                                <div className="lobby-waiting">Waiting for opponent...</div>
                            </>
                        )}
                    </div>
                    
                    {!isCreatingGame && (
                    <div>
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
                    )}

                </div>
            </div>
        </div>
    );
}

export default Lobby;
