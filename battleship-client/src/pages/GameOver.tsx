import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";

function GameOver() {
    const { connection, isWinner, handleLeaveGame } = useGame();
    const [playAgain, setPlayAgain] = useState(false);
    const [voteCount, setVoteCount] = useState(0);

    useEffect(() => {
        connection.on("PlayAgainVote", (count: number) => setVoteCount(count));
        return () => { connection.off("PlayAgainVote"); };
    }, [connection]);

    function handlePlayAgain() {
        if(!playAgain){
            connection.invoke("PlayerPlayAgain");
            setPlayAgain(true);
        }
    }

    async function handleLeave() {
        await handleLeaveGame();
    }

    return (
        <div className="page">
            <div className="gameover-container">
                <h2>Game Over</h2>
                <div className={`gameover-result ${isWinner ? "victory" : "defeat"}`}>
                    {isWinner ? "Victory" : "Defeat"}
                </div>
                <div className="gameover-sub">
                    {isWinner ? "Enemy fleet destroyed. Well played, Commander." : "Your fleet has been sunk."}
                </div>
                <div className="gameover-actions">
                    <button
                        className={playAgain ? "btn-ghost" : "btn-primary"}
                        onClick={handlePlayAgain}
                        disabled={playAgain}
                    >
                        {playAgain ? `Waiting... (${voteCount}/2)` : `Play Again (${voteCount}/2)`}
                    </button>
                    <button onClick={handleLeave}>Leave</button>
                </div>
            </div>
        </div>
    );
}

export default GameOver;
