export interface Ship {
    name: "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
    size: number;
    maxCount: number;
}


export const Ships: Ship[] = [
    { name: "carrier", size: 5, maxCount: 1 },
    { name: "battleship", size: 4, maxCount: 1 },
    { name: "cruiser", size: 3, maxCount: 1 },
    { name: "submarine", size: 3, maxCount: 1 },
    { name: "destroyer", size: 2, maxCount: 2 },
];

export interface ShipPlacement {
    shipName: "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
    startX: number;
    startY: number;
    horizontal: boolean;
    size: number;
}