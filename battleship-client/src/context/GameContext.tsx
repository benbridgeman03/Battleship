// context/GameContext.tsx
import { createContext, useContext, useState, useRef, useEffect } from "react";
import connection from "../services/signalRService";
import type { Cell } from "../models/Cell";
import type { Ship, ShipPlacement } from "../models/Ship";
import type { HistoryEntry } from "../models/HistoryEntry";
import type { PopupType } from "../components/Popup";

interface PopupState {
    text?: string;
    highlight?: string;
    color?: string;
    requiresAck: PopupType;
    onConfirm?: () => void;
}

interface GameContextType {
    screen: "lobby" | "setup" | "game" | "gameover";
    setScreen: (s: "lobby" | "setup" | "game" |"gameover") => void;
    myBoard: Cell[][];
    setMyBoard: React.Dispatch<React.SetStateAction<Cell[][]>>;
    opponentBoard: Cell[][];
    setOpponentBoard: React.Dispatch<React.SetStateAction<Cell[][]>>;
    history: HistoryEntry[];
    addHistoryEntry: (entry: HistoryEntry) => void;
    isMyTurn: boolean;
    selectedShip: Ship | null;
    setSelectedShip: (s: Ship | null) => void;
    horizontal: boolean;
    setHorizontal: React.Dispatch<React.SetStateAction<boolean>>;
    myPlacements: ShipPlacement[];
    setMyPlacements: React.Dispatch<React.SetStateAction<ShipPlacement[]>>;
    connection: typeof connection;
    popup: PopupState | null;
    showPopup: (text?: string, highlight?: string, color?: string, duration?: number) => void;
    showAlert: (text?: string, highlight?: string, color?: string) => void;
    showConfirm: (opts: { text?: string; highlight?: string; color?: string; onConfirm: () => void }) => void;
    closePopup: () => void;
    handleLeaveGamePopup: () => void;
    resetGame: () => void;
    isWinner?: boolean;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame must be inside GameProvider");
    return ctx;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
    const started = useRef(false);
    const [screen, setScreen] = useState<"lobby" | "setup" | "game" | "gameover">("lobby");
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
    const [horizontal, setHorizontal] = useState(true);
    const [myPlacements, setMyPlacements] = useState<ShipPlacement[]>([]);
    const [popup, setPopup] = useState<PopupState | null>(null);
    const [isWinner, setIsWinner] = useState<boolean | undefined>(undefined);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const [myBoard, setMyBoard] = useState<Cell[][]>(
        Array(10).fill(null).map(() =>
            Array(10).fill(null).map(() => ({ ship: null, isHit: false, isShipHit: false }))
        )
    );
    const [opponentBoard, setOpponentBoard] = useState<Cell[][]>(
        Array(10).fill(null).map(() =>
            Array(10).fill(null).map(() => ({ ship: null, isHit: false, isShipHit: false }))
        )
    );

    const [history, setHistory] = useState<HistoryEntry[]>([]);

    function addHistoryEntry(entry: HistoryEntry) {
        setHistory(prev => [...prev, entry]);
    }

    function showPopup(text?: string, highlight?: string, color?: string, duration: number = 1000) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setPopup({ text, highlight, color, requiresAck: { type: "timeout" } });
        timeoutRef.current = setTimeout(() => setPopup(null), duration);
    }

    function showAlert(text?: string, highlight?: string, color?: string) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setPopup({ text, highlight, color, requiresAck: { type: "dismiss" } });
    }

    function showConfirm({ text, highlight, color, onConfirm }: { text?: string; highlight?: string; color?: string; onConfirm: () => void }) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setPopup({ text, highlight, color, requiresAck: { type: "confirm" }, onConfirm });
    }

    function closePopup() {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setPopup(null);
    }

    function handleLeaveGamePopup() {
        showConfirm({text: "Leave game?", color: "red", onConfirm: () => handleLeaveGame(),});
    }

    async function handleLeaveGame() {
        await connection.stop();
        await connection.start();
        resetGame();
        setScreen("lobby");
    }

    function resetGame() {
        const emptyBoard = () => Array(10).fill(null).map(() =>
            Array(10).fill(null).map(() => ({ ship: null, isHit: false, isShipHit: false }))
        );
        setMyBoard(emptyBoard());
        setOpponentBoard(emptyBoard());
        setHistory([]);
        setIsMyTurn(false);
        setSelectedShip(null);
        setHorizontal(true);
        setMyPlacements([]);
        setIsWinner(undefined);
    }

    useEffect(() => {
        if (!started.current) {
            started.current = true;
            connection.start()
                .then(() => console.log("Connected to SignalR!"))
                .catch((err: Error) => console.error("Connection failed: ", err));
        }

        connection.on("GameStarted", () => setScreen("setup"));
        connection.on("SetupComplete", () => setScreen("game"));
        connection.on("TurnUpdate", (myTurn: boolean) => setIsMyTurn(myTurn));
        connection.on("Error", (msg: string) => showPopup(undefined, msg, "red"));
        connection.on("OpponentDisconnected", () => {
            resetGame();
            setScreen("lobby");
            showAlert(undefined, "Opponent disconnected", "red");
        });
        connection.on("GameOver", (isWinner: boolean) => {
            setIsWinner(isWinner);
            setScreen("gameover");
        });
        connection.on("PlayAgain", () => {
            resetGame();
            setScreen("setup");
        });

        return () => {
            connection.off("GameStarted");
            connection.off("TurnUpdate");
            connection.off("Error");
        };
    }, []);

    return (
        <GameContext.Provider value={{
            screen, setScreen,
            myBoard, setMyBoard,
            history, addHistoryEntry,
            opponentBoard, setOpponentBoard,
            isMyTurn,
            selectedShip, setSelectedShip,
            horizontal, setHorizontal,
            myPlacements, setMyPlacements,
            connection,
            popup, showPopup, showAlert, showConfirm, closePopup, resetGame,
            handleLeaveGamePopup, 
            isWinner,
        }}>
            {children}
        </GameContext.Provider>
    );
}