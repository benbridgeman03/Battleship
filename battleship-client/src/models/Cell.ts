export interface Cell {
    ship: "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer" | null;
    isHit: boolean;
}

