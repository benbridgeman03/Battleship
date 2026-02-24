// screens/LobbyScreen.tsx
import { useState } from "react";
import { useGame } from "../context/GameContext";

function Lobby() {
    const { connection } = useGame();
    const [gameId, setGameId] = useState("");
    const [joinCode, setJoinCode] = useState("");

    // gameId only matters here, so it stays local
    connection.on("GameCreated", (id: string) => setGameId(id));

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