import { useState, useEffect } from "react";
import { useGame } from "../context/GameContext";

function GameOver() {
    const { connection, isWinner, setScreen, resetGame } = useGame();
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
        resetGame();
        await connection.stop();
        await connection.start();
        setScreen("lobby");
    }

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Game Over</h1>
            <p>{isWinner ? "You win!" : "You lose!"}</p>
            <p>Thanks for playing!</p>
            <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button onClick={handlePlayAgain}>Play Again ({voteCount}/2)</button>
                <button onClick={handleLeave}>Leave</button>
            </div>
        </div>
    );
}

export default GameOver;