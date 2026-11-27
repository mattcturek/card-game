import type { EventCard } from "../data/events";
import type { HeroCard } from "../data/heroes";
import type { MainCard } from "../data/mainDeck";
import type { MissionCard } from "../data/missions";
import type { ShipCard } from "../data/ships";
import type { Hex } from "./hex";

export type PhaseAction = "Move" | "Attack" | "Scan" | "Hide";
export type TurnStage = "draw" | "phase" | "await-move-target" | "await-attack-target" | "game-over";

export interface Tile {
  hex: Hex;
  /** Event tier 0–3 */
  tier: 0 | 1 | 2 | 3;
  label?: string;
  missionIds?: string[];
}

export interface PlayerState {
  id: 0 | 1;
  name: string;
  ship: ShipCard;
  hero: HeroCard;
  mission: MissionCard;
  /** Mission destinations visited (for multi-stop stub) */
  visitedMissionKeys: string[];
  hp: number;
  ap: number;
  position: Hex;
  hand: MainCard[];
  hidden: boolean;
  /** Once/game Requiem used */
  requiemUsed: boolean;
  /** Keys this player has scanned */
  scannedKeys: Set<string>;
}

export interface GameState {
  players: [PlayerState, PlayerState];
  active: 0 | 1;
  turnNumber: number;
  phasesLeft: number;
  stage: TurnStage;
  tiles: Map<string, Tile>;
  mainDeck: MainCard[];
  mainDiscard: MainCard[];
  eventDecks: { 1: EventCard[]; 2: EventCard[]; 3: EventCard[] };
  /** Shared dice-roll counter for AP regen (+1 every 2 rolls) */
  diceRolls: number;
  /** Pending move distance after roll (player picks path) */
  pendingMoveSteps: number;
  log: string[];
  winner: 0 | 1 | null;
  winReason: string | null;
}
