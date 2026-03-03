import ShipCarrierHull from "../assets/Ships/ShipCarrierHull.png";
import ShipBattleshipHull from "../assets/Ships/ShipBattleshipHull.png";
import ShipCruiserHull from "../assets/Ships/ShipCruiserHull.png";
import ShipSubMarineHull from "../assets/Ships/ShipSubMarineHull.png";
import ShipDestroyerHull from "../assets/Ships/ShipDestroyerHull.png";

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