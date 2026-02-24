import { GameProvider, useGame } from "./context/GameContext";
import LobbyScreen from "./pages/Lobby";
import SetupScreen from "./pages/Setup";
import GameScreen from "./pages/Game";

function AppContent() {
    const { screen } = useGame();

    if (screen === "lobby") return <LobbyScreen />;
    if (screen === "setup") return <SetupScreen />;
    if (screen === "game") return <GameScreen />;
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