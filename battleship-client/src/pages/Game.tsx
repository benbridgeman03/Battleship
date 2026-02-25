// screens/GameScreen.tsx
import { useGame } from "../context/GameContext";
import GameBoard from "../components/GameBoard";

function Game() {
    const { myBoard, setMyBoard, opponentBoard, setOpponentBoard, isMyTurn, lastResult } = useGame();

    return (
        <div>
            <h1>Battleship</h1>
            {lastResult && (
                <div>
                    <p>{lastResult.split("\n")[0]}</p>
                    <h3 style={{ color: lastResult.includes("Hit") || lastResult.includes("hit") ? "red" : "green" }}>
                        {lastResult.split("\n")[1]}
                    </h3>
                </div>
            )}
            <h3>{isMyTurn ? "Your turn — fire!" : "Waiting for opponent..."}</h3>
            <div style={{ display: "flex", gap: "60px" }}>
                <div>
                    <h2>Your Board</h2>
                    <GameBoard isOpponent={false} cells={myBoard} setCells={setMyBoard} />
                </div>
                <div>
                    <h2>Opponent's Board</h2>
                    <GameBoard isOpponent={true} cells={opponentBoard} setCells={setOpponentBoard} />
                </div>
            </div>
        </div>
    );
}

export default Game;