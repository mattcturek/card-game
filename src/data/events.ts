export interface EventCard {
  id: string;
  tier: 1 | 2 | 3;
  title: string;
  polarity: "+" | "-";
  rules: string;
}

function tier(
  t: 1 | 2 | 3,
  rows: Array<[number, string, "+" | "-", string]>,
): EventCard[] {
  return rows.map(([n, title, polarity, rules]) => ({
    id: `T${t}-${n}`,
    tier: t,
    title,
    polarity,
    rules,
  }));
}

/** Event decks from docs/decks-60.md — titles used; effects stubbed simply in engine */
export const TIER1: EventCard[] = tier(1, [
  [1, "Friendly Hail", "+", "Next Move: +1 hex."],
  [2, "Charted Eddy", "+", "Next Move: treat odd as even (move 2)."],
  [3, "Market Rumor", "+", "Learn one opponent’s current tile number."],
  [4, "Minor Hull Scratch", "-", "Lose 1 HP."],
  [5, "Calibration Drift", "-", "Next Scan fails; refund that phase."],
  [6, "Courier Packet", "+", "Gain 1 Favor (once: ignore a Tier 1 −)."],
  [7, "Quiet Watch", "+", "No further Events this phase."],
  [8, "Dockmaster’s Tip", "+", "Reveal one adjacent tile’s number."],
  [9, "Spare Parts Bin", "+", "Cancel next Tier 1 − you draw."],
  [10, "First Contact Ping", "-", "Next Tier 1 you draw counts as Tier 2."],
  [11, "Power Spike", "+", "Gain 1 AP (max 20)."],
  [12, "Brownout", "-", "Lose 1 AP."],
  [13, "Debris Field", "-", "Skip your next Move phase."],
  [14, "Lucky Find", "+", "Draw 1 Tier 1 Event."],
  [15, "Contaminated Air", "-", "Lose 2 HP."],
  [16, "Local Map Share", "+", "Look at any one tile number."],
  [17, "Soft Lock", "-", "Cannot Attack this turn."],
  [18, "Handshake Protocol", "+", "Choose: +1 HP or +1 AP."],
  [19, "Starfix", "+", "Reroll one die you just rolled."],
  [20, "Toll Buoy", "-", "Discard 1 card or lose 2 HP."],
]);

export const TIER2: EventCard[] = tier(2, [
  [1, "Customs Sweep", "-", "Skip next Move or lose 3 HP."],
  [2, "Micro-Meteor Swarm", "-", "Lose 3 HP or discard 1 card."],
  [3, "False Beacon", "-", "Opponent moves you 1 hex."],
  [4, "Crew Fatigue", "-", "Next Attack deals half AP (round down)."],
  [5, "Syndicate Tax", "-", "Lose 2 AP or gain Marked."],
  [6, "Nebula Static", "-", "Cannot play Interrupts until after your next turn."],
  [7, "Rival Shadow", "-", "One opponent may Move 1 hex toward you for free."],
  [8, "Leaking Coolant", "-", "Next two Moves: max 1 hex."],
  [9, "Contraband Sniff", "-", "Reveal yes/no if on a mission destination."],
  [10, "Dock Lockout", "-", "Next station land: spend an extra phase to leave."],
  [11, "Hot Wire", "+", "Gain 3 AP (max 20)."],
  [12, "Med Bay Patch", "+", "Gain 3 HP (max 20)."],
  [13, "Hard Burn", "+", "Move 2 without rolling (Move action)."],
  [14, "Spoofed ID", "+", "Ignore next − that would reveal mission info."],
  [15, "Boarding Drill", "-", "Lose 4 HP unless you Hide this turn."],
  [16, "Supply Drop", "+", "Draw 2 Tier 1 Events; keep 1."],
  [17, "Pursuit Wake", "-", "Opponent places a pursuit marker: −1 hex on your next Move."],
  [18, "Black Market Deal", "+", "Discard 1 card: gain 2 Favor."],
  [19, "System Crash", "-", "Lose one phase this turn."],
  [20, "Escort Contract", "+", "Until next turn, Attacks vs you −3 damage."],
]);

export const TIER3: EventCard[] = tier(3, [
  [1, "Raider Ambush", "-", "Lose 6 HP or skip your next full turn."],
  [2, "Core Breach Scare", "-", "Skip next turn; discard all Tier 1 in hand."],
  [3, "Identity Burn", "-", "Flagged: each land on 2+ also draw Tier 1."],
  [4, "Warp Shear", "-", "Move to random adjacent hex; draw that tile’s Event."],
  [5, "Betrayal Signal", "-", "Reveal one keyword from your Mission."],
  [6, "Boarders Away", "-", "Opponent chooses: steal 1 card, or you cannot Move next turn."],
  [7, "Black-Site Interdict", "-", "Cannot enter mission tiles until you spend 2 phases bribing/fighting."],
  [8, "Catastrophic Salvage Claim", "-", "Cannot complete Mission this round."],
  [9, "Life Support Triage", "-", "Choose: −5 HP, or −3 AP and skip a phase."],
  [10, "Hunter Fleet", "-", "Until cleared (Scan + spend 2 AP): opponent Interrupts auto-succeed once/turn vs you."],
  [11, "Miracle Patch", "+", "Gain 5 HP (max 20)."],
  [12, "Overcharge", "+", "Next Attack: deal AP+5, then −2 AP."],
  [13, "Ghost Lane", "+", "Move up to 3 hexes ignoring tile Events once."],
  [14, "Deep Cover", "+", "Hide: cannot be Attacked until you Scan or Attack."],
  [15, "Fleet Favor", "+", "Cancel any one − Event as it resolves."],
  [16, "Sabotage Window", "-", "Opponent deals 5 damage to you immediately."],
  [17, "Reactor Gift", "+", "Set AP to 20."],
  [18, "Dead Stick", "-", "AP = 0 until you roll dice twice (regen rules apply after)."],
  [19, "Open Hostilities", "-", "All players may Attack you without Scan this round."],
  [20, "Last Resort", "+", "If HP ≤ 5: gain 8 HP and 5 AP once."],
]);
