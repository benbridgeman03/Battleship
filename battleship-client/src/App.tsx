import { GameProvider, useGame } from "./context/GameContext";
import LobbyScreen from "./pages/Lobby";
import SetupScreen from "./pages/Setup";
import GameScreen from "./pages/Game";
import GameOver from "./pages/GameOver";

function AppContent() {
    const { screen } = useGame();

    if (screen === "lobby") return <LobbyScreen />;
    if (screen === "setup") return <SetupScreen />;
    if (screen === "game") return <GameScreen />;
    if(screen === "gameover") return <GameOver />;
    return null;
}

function App() {
    return (
        <GameProvider>
            <AppContent />
        </GameProvider>
    );
}

export default App;