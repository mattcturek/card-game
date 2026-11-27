export type MainCardType =
  | "Instant"
  | "Move"
  | "Attack"
  | "Scan"
  | "Healing"
  | "Lucky"
  | "Unlucky";

export interface MainCard {
  id: number;
  title: string;
  type: MainCardType;
  rules: string;
}

/** Main Deck 50 — titles+rules from docs/main-deck-50.md (play effects stubbed in v1) */
export const MAIN_DECK: MainCard[] = [
  { id: 1, title: "Hard Interrupt", type: "Instant", rules: "Play anytime: cancel an opponent's action this phase." },
  { id: 2, title: "Counter Hail", type: "Instant", rules: "Play anytime: negate one Instant." },
  { id: 3, title: "Panic Burn", type: "Instant", rules: "Play anytime: Move 1 hex immediately." },
  { id: 4, title: "Shield Flare", type: "Instant", rules: "Play anytime: prevent next 3 damage." },
  { id: 5, title: "Focus Lock", type: "Instant", rules: "Play anytime: your next Attack this turn +3 damage." },
  { id: 6, title: "Fade Out", type: "Instant", rules: "Play anytime: you cannot be Attacked until your next turn." },
  { id: 7, title: "Priority Lane", type: "Instant", rules: "Play anytime: take an extra phase after this one resolves." },
  { id: 8, title: "Dead Air", type: "Instant", rules: "Play anytime: opponent cannot play Instant until their next turn." },
  { id: 9, title: "Afterburn", type: "Move", rules: "Move action: move 2 without rolling." },
  { id: 10, title: "Drift", type: "Move", rules: "Move 1; draw no Event on landing." },
  { id: 11, title: "Vector Change", type: "Move", rules: "Reroll Move die; must take new result." },
  { id: 12, title: "Lane Hop", type: "Move", rules: "Move to any adjacent hex of an adjacent hex (2 steps)." },
  { id: 13, title: "Full Sail", type: "Move", rules: "Move even result: +1 hex." },
  { id: 14, title: "Dock Approach", type: "Move", rules: "Move onto a station tile: +1 phase this turn." },
  { id: 15, title: "Evasive Zig", type: "Move", rules: "After Move: Attacks vs you −2 until next turn." },
  { id: 16, title: "Broadside", type: "Attack", rules: "Attack: +4 damage." },
  { id: 17, title: "Precision Strike", type: "Attack", rules: "Attack: deal 5 fixed (ignore AP). Costs 1 AP still." },
  { id: 18, title: "Barrage", type: "Attack", rules: "Attack twice this phase (second costs +1 AP)." },
  { id: 19, title: "Disable Shot", type: "Attack", rules: "Attack: target cannot Move next turn." },
  { id: 20, title: "Piercing Round", type: "Attack", rules: "Attack ignores −damage ship abilities." },
  { id: 21, title: "Overwatch", type: "Attack", rules: "Attack a ship within 2 hexes (must Scan range still)." },
  { id: 22, title: "Finisher", type: "Attack", rules: "If target HP ≤ 8: Attack deals double AP." },
  { id: 23, title: "Deep Scan", type: "Scan", rules: "Scan: also reveal tile numbers in range." },
  { id: 24, title: "Wide Array", type: "Scan", rules: "Scan radius +1 hex ring." },
  { id: 25, title: "Target Paint", type: "Scan", rules: "Scan: next Attack vs painted target +3." },
  { id: 26, title: "Ghost Detect", type: "Scan", rules: "Scan: reveal if any Hidden ship is adjacent." },
  { id: 27, title: "Survey Sweep", type: "Scan", rules: "Scan without spending a phase once." },
  { id: 28, title: "Intel Uplink", type: "Scan", rules: "Scan: draw 1 card." },
  { id: 29, title: "Med Spray", type: "Healing", rules: "Gain 3 HP." },
  { id: 30, title: "Field Surgery", type: "Healing", rules: "Gain 5 HP; skip next Attack phase." },
  { id: 31, title: "Repair Drones", type: "Healing", rules: "Gain 2 HP now and 2 at start of next turn." },
  { id: 32, title: "Rest Cycle", type: "Healing", rules: "Gain 4 HP; cannot Attack this turn." },
  { id: 33, title: "Stim Pack", type: "Healing", rules: "Gain 2 HP and 1 AP." },
  { id: 34, title: "Miracle Gel", type: "Healing", rules: "Set HP to 10 if HP < 10." },
  { id: 35, title: "Jackpot Signal", type: "Lucky", rules: "Draw 2." },
  { id: 36, title: "Found Cache", type: "Lucky", rules: "Gain 3 AP." },
  { id: 37, title: "Friendly Sector", type: "Lucky", rules: "Next Event you draw: ignore if −." },
  { id: 38, title: "Double Down", type: "Lucky", rules: "Duplicate next + card you play." },
  { id: 39, title: "Star Alignment", type: "Lucky", rules: "Reroll any die once." },
  { id: 40, title: "Windfall", type: "Lucky", rules: "Gain 1 Favor (ignore one − once)." },
  { id: 41, title: "Open Gate", type: "Lucky", rules: "Peek top 3 main deck; take 1." },
  { id: 42, title: "Second Chance", type: "Lucky", rules: "Return this from discard: undo last − on you." },
  { id: 43, title: "Glitch", type: "Unlucky", rules: "Discard a random card." },
  { id: 44, title: "Hull Breach", type: "Unlucky", rules: "Lose 4 HP." },
  { id: 45, title: "Fuel Leak", type: "Unlucky", rules: "Lose 2 AP." },
  { id: 46, title: "Bad Jump", type: "Unlucky", rules: "Opponent moves you 1 hex." },
  { id: 47, title: "Ambush Scratch", type: "Unlucky", rules: "Take 3 damage; cannot Hide this turn." },
  { id: 48, title: "Static Fog", type: "Unlucky", rules: "Cannot Scan next turn." },
  { id: 49, title: "Debt Mark", type: "Unlucky", rules: "Next Instant you play costs discard 1 extra." },
  { id: 50, title: "Blackout", type: "Unlucky", rules: "Skip Draw phase next turn." },
];
