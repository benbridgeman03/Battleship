import { useEffect, useState } from "react";
import { useGame } from "../context/GameContext";

function GameOver() {
    const { connection } = useGame();
    const { isWinner } = useGame();
    const [PlayAgain, setPlayAgain] = useState(false);

    function handlePlayAgain() {
        if(!PlayAgain){
            connection.invoke("PlayerPlayAgain");
            setPlayAgain(true);
        } 
    }

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Game Over</h1>
            <p>{isWinner ? "You win!" : "You lose!"}</p>
            <p>Thanks for playing!</p>
            <button onClick={handlePlayAgain}>{PlayAgain ? "Waiting for opponent..." : "Play Again"}</button>
        </div>
    );
}

export default GameOver;