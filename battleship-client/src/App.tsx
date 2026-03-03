import "./App.css";
import { GameProvider, useGame } from "./context/GameContext";
import LobbyScreen from "./pages/Lobby";
import SetupScreen from "./pages/Setup";
import GameScreen from "./pages/Game";
import GameOver from "./pages/GameOver";
import Popup from "./components/Popup";

function AppContent() {
    const { screen, popup, closePopup, isConnected } = useGame();

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
                    onConfirm={popup.onConfirm}
                />
            )}
            {!isConnected && (
                <div className="popup-overlay">
                    <div className="popup-modal">
                        <div className="connecting-spinner" />
                        <p className="popup-text">Please wait</p>
                        <div className="popup-highlight">Connecting to server</div>
                    </div>
                </div>
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
