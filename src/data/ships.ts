export interface ShipCard {
  id: number;
  name: string;
  ability: string;
}

/** Ship Deck (10) — from docs/ships.md */
export const SHIPS: ShipCard[] = [
  { id: 1, name: "Sparrow", ability: "Once/turn: Move costs no phase if you move only 1 hex. (TBD in v1)" },
  { id: 2, name: "Ironclad", ability: "Attacks against you deal −2 damage (min 1)." },
  { id: 3, name: "Specter", ability: "Once/game: Hide without spending a phase. (TBD in v1)" },
  { id: 4, name: "Sunlance", ability: "Once/turn: +2 damage on one Attack. (TBD in v1)" },
  { id: 5, name: "Courier", ability: "Start: draw +1 main-deck card (6 opening)." },
  { id: 6, name: "Bastion", ability: "Once/game: prevent up to 5 damage. (TBD in v1)" },
  { id: 7, name: "Vagrant", ability: "After Move: peek one adjacent tile number. (TBD in v1)" },
  { id: 8, name: "Quarry", ability: "+1 AP regen (every 1 die roll instead of 2) while HP ≤ 10." },
  { id: 9, name: "Nomad", ability: "Once/turn: Scan your tile only for free (no phase). (TBD in v1)" },
  { id: 10, name: "Requiem", ability: "When you would lose: instead set HP to 1 once/game." },
];
