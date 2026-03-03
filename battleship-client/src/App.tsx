import "./App.css";
import { GameProvider, useGame } from "./context/GameContext";
import LobbyScreen from "./pages/Lobby";
import SetupScreen from "./pages/Setup";
import GameScreen from "./pages/Game";
import GameOver from "./pages/GameOver";
import Popup from "./components/Popup";

function AppContent() {
    const { screen, popup, closePopup } = useGame();

    return (
        <>
            {screen === "lobby" && <LobbyScreen />}
            {screen === "setup" && <SetupScreen />}
            {screen === "game" && <GameScreen />}
            {screen === "gameover" && <GameOver />}
            {popup && (
                <Popup
                    text={popup.text ?? ""}
                    highlight={popup.highlight}
                    color={popup.color}
                    requiresAck={popup.requiresAck}
                    onClose={closePopup}
                />
            )}
        </>
    );
}

function App() {
    return (
        <GameProvider>
            <AppContent />
        </GameProvider>
    );
}

export default App;
