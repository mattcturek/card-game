export interface HeroCard {
  id: number;
  name: string;
  ability: string;
}

/** Hero Deck (10) — from docs/heroes.md */
export const HEROES: HeroCard[] = [
  { id: 1, name: "Captain Rhea Vale", ability: "Once/turn: reroll your Move die. (TBD in v1)" },
  { id: 2, name: "Doc Maren Quill", ability: "Once/turn: heal 1 HP (max 20). (TBD in v1)" },
  { id: 3, name: "Gunner Jax Holt", ability: "Once/turn: Attack ignores “must Scan” once. (TBD in v1)" },
  { id: 4, name: "Pilot Sera Nyx", ability: "Even Move rolls: +1 hex." },
  { id: 5, name: "Ops Kade Morrow", ability: "Once/game: look at top 3 of main deck; reorder. (TBD in v1)" },
  { id: 6, name: "Broker Lina Cass", ability: "Once/turn: discard 1: draw 1. (TBD in v1)" },
  { id: 7, name: "Scout Torin Ash", ability: "Scan also reveals one diagonal/far adjacent (extra hex). (TBD in v1)" },
  { id: 8, name: "Engineer Milo Vex", ability: "Once/game: gain 3 AP. (TBD in v1)" },
  { id: 9, name: "Diplomat Ari Sol", ability: "Once/game: cancel one − Event targeting you. (TBD in v1)" },
  { id: 10, name: "Shadow Ren Cole", ability: "Once/game: play an Instant as if you had priority. (TBD in v1)" },
];
