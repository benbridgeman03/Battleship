import { useGame } from "../context/GameContext";

function GameOver() {
    const { isWinner } = useGame();

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h1>Game Over</h1>
            <p>{isWinner ? "You win!" : "You lose!"}</p>
            <p>Thanks for playing! Refresh to start a new game.</p>
        </div>
    );
}

export default GameOver;