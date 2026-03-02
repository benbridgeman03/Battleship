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
        <div>
            <h1>Battleship</h1>
            <button onClick={() => connection.invoke("CreateGame")}>Create Game</button>
            {gameId && (
                <p>Your game code: <strong>{gameId}</strong><br />Waiting for opponent...</p>
            )}
            <hr />
            <input placeholder="Enter game code" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
            <button onClick={() => connection.invoke("JoinGame", joinCode)}>Join Game</button>
        </div>
    );
}

export default Lobby;