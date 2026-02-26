// context/GameContext.tsx
import { createContext, useContext, useState, useRef, useEffect } from "react";
import connection from "../services/signalRService";
import type { Cell } from "../models/Cell";
import type { Ship } from "../models/Ship";

interface GameContextType {
    screen: "lobby" | "setup" | "game";
    setScreen: (s: "lobby" | "setup" | "game") => void;
    myBoard: Cell[][];
    setMyBoard: React.Dispatch<React.SetStateAction<Cell[][]>>;
    opponentBoard: Cell[][];
    setOpponentBoard: React.Dispatch<React.SetStateAction<Cell[][]>>;
    isMyTurn: boolean;
    selectedShip: Ship | null;
    setSelectedShip: (s: Ship | null) => void;
    horizontal: boolean;
    setHorizontal: React.Dispatch<React.SetStateAction<boolean>>;
    connection: typeof connection;
    message: { text?: string, highlight?: string, color?: string } | null;
    showMessage: ( text: string, highlight?: string, color?: string ) => void;
}

const GameContext = createContext<GameContextType | null>(null);

export function useGame() {
    const ctx = useContext(GameContext);
    if (!ctx) throw new Error("useGame must be inside GameProvider");
    return ctx;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
    const started = useRef(false);
    const [screen, setScreen] = useState<"lobby" | "setup" | "game">("lobby");
    const [isMyTurn, setIsMyTurn] = useState(false);
    const [selectedShip, setSelectedShip] = useState<Ship | null>(null);
    const [horizontal, setHorizontal] = useState(true);
    const [message, setMessage] = useState<{ text?: string, highlight?: string, color?: string } | null>(null);
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

    function showMessage(text?: string, highlight?: string, color?: string, duration: number = 2000) {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setMessage({ text, highlight, color });
        timeoutRef.current = setTimeout(() => setMessage(null), duration);
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
        connection.on("Error", (msg: string) => showMessage(undefined, msg, "red"));

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
            opponentBoard, setOpponentBoard,
            isMyTurn,
            selectedShip, setSelectedShip,
            horizontal, setHorizontal,
            connection,
            message, showMessage
        }}>
            {children}
        </GameContext.Provider>
    );
}