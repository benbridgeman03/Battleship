export interface HistoryEntry {
    player: "you" | "opponent";
    x: number;
    y: number;
    result: "hit" | "miss" | "sunk";
    shipName?: string;
}