import ShipCarrierHull from "../assets/ships/ShipCarrierHull.png";
import ShipBattleshipHull from "../assets/ships/ShipBattleshipHull.png";
import ShipCruiserHull from "../assets/ships/ShipCruiserHull.png";
import ShipSubMarineHull from "../assets/ships/ShipSubMarineHull.png";
import ShipDestroyerHull from "../assets/ships/ShipDestroyerHull.png";

export interface Ship {
    name: "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
    size: number;
    maxCount: number;
    image: string;
}


export const Ships: Ship[] = [
    { name: "carrier", size: 5, maxCount: 1, image: ShipCarrierHull },
    { name: "battleship", size: 4, maxCount: 1, image: ShipBattleshipHull },
    { name: "cruiser", size: 3, maxCount: 1, image: ShipCruiserHull },
    { name: "submarine", size: 3, maxCount: 1, image: ShipSubMarineHull },
    { name: "destroyer", size: 2, maxCount: 2, image: ShipDestroyerHull },
];

export const ShipImageMap: Record<string, string> = {
    carrier: ShipCarrierHull,
    battleship: ShipBattleshipHull,
    cruiser: ShipCruiserHull,
    submarine: ShipSubMarineHull,
    destroyer: ShipDestroyerHull,
};

export interface ShipPlacement {
    shipName: "carrier" | "battleship" | "cruiser" | "submarine" | "destroyer";
    startX: number;
    startY: number;
    horizontal: boolean;
    size: number;
}