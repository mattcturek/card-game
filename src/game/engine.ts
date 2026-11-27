import { TIER1, TIER2, TIER3, type EventCard } from "../data/events";
import { HEROES } from "../data/heroes";
import { MAIN_DECK, type MainCard } from "../data/mainDeck";
import { MISSIONS } from "../data/missions";
import { SHIPS } from "../data/ships";
import { BOARD_RADIUS } from "./constants";
import {
  hexDistance,
  hexesInRadius,
  hexKey,
  hexNeighbors,
  type Hex,
} from "./hex";
import type { GameState, PhaseAction, PlayerState, Tile } from "./types";

export { BOARD_RADIUS };
const MAX_HP = 20;
const MAX_AP = 20;
const STARTING_HAND = 5;
const PHASES_PER_TURN = 3;

function shuffle<T>(arr: T[], rng: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function cloneMain(c: MainCard): MainCard {
  return { ...c };
}

function pushLog(state: GameState, msg: string): void {
  state.log = [`[T${state.turnNumber} P${state.active + 1}] ${msg}`, ...state.log].slice(0, 80);
}

function activePlayer(state: GameState): PlayerState {
  return state.players[state.active];
}

function opponent(state: GameState): PlayerState {
  return state.players[state.active === 0 ? 1 : 0];
}

function buildBoard(): Map<string, Tile> {
  const tiles = new Map<string, Tile>();
  for (const hex of hexesInRadius(BOARD_RADIUS)) {
    const key = hexKey(hex);
    // Center and near-center lean quieter; outer ring more events
    const dist = hexDistance(hex, { q: 0, r: 0 });
    let tier: 0 | 1 | 2 | 3;
    if (dist === 0) tier = 0;
    else if (dist === 1) tier = (Math.abs(hex.q + hex.r) % 2 === 0 ? 0 : 1) as 0 | 1;
    else if (dist === 2) tier = ((Math.abs(hex.q) + Math.abs(hex.r)) % 3 || 1) as 1 | 2;
    else tier = ((Math.abs(hex.q * 3 + hex.r) % 4) as 0 | 1 | 2 | 3) || 1;

    tiles.set(key, { hex, tier });
  }

  // Place mission destination labels from missions.md stubs
  for (const m of MISSIONS) {
    for (const dk of m.destinationKeys) {
      const tile = tiles.get(dk);
      if (!tile) continue;
      tile.label = m.locationLabel.split("→")[0]?.trim() ?? m.name;
      tile.missionIds = [...(tile.missionIds ?? []), m.id];
      // Mission hexes keep a mild event chance
      if (tile.tier === 0) tile.tier = 1;
    }
  }

  // Friendly labels for known mission hexes (keys scale with BOARD_RADIUS)
  const labelByKey: Record<string, string> = {
    [`${BOARD_RADIUS},${-BOARD_RADIUS}`]: "Station 9",
    [`${-BOARD_RADIUS},0`]: "Clinic Pickup",
    [`${BOARD_RADIUS},0`]: "Mining Dropoff",
    [`${-Math.floor((BOARD_RADIUS * 2) / 3)},${BOARD_RADIUS}`]: "Derelict Ship",
    [`0,${-BOARD_RADIUS}`]: "Helios Refinery",
    [`${-BOARD_RADIUS},${BOARD_RADIUS}`]: "Red Dust",
  };
  for (const [key, label] of Object.entries(labelByKey)) {
    const tile = tiles.get(key);
    if (tile) tile.label = label;
  }

  return tiles;
}

function drawMain(state: GameState, player: PlayerState, n: number): void {
  for (let i = 0; i < n; i++) {
    if (state.mainDeck.length === 0) {
      if (state.mainDiscard.length === 0) {
        pushLog(state, "Main deck empty — cannot draw.");
        return;
      }
      state.mainDeck = shuffle(state.mainDiscard);
      state.mainDiscard = [];
      pushLog(state, "Main deck reshuffled from discard.");
    }
    const card = state.mainDeck.pop()!;
    player.hand.push(card);
  }
}

function recordDiceRoll(state: GameState, player: PlayerState): void {
  state.diceRolls += 1;
  const every = player.ship.name === "Quarry" && player.hp <= 10 ? 1 : 2;
  if (state.diceRolls % every === 0) {
    const before = player.ap;
    player.ap = Math.min(MAX_AP, player.ap + 1);
    if (player.ap > before) {
      pushLog(state, `${player.name} AP regen +1 → ${player.ap} (every ${every} dice roll${every > 1 ? "s" : ""}).`);
    }
  }
}

function dealDamage(state: GameState, target: PlayerState, amount: number, source: string): void {
  let dmg = amount;
  if (target.ship.name === "Ironclad") {
    dmg = Math.max(1, dmg - 2);
  }
  target.hp = Math.max(0, target.hp - dmg);
  pushLog(state, `${source}: ${target.name} takes ${dmg} dmg → HP ${target.hp}.`);
  if (target.hp <= 0) {
    if (target.ship.name === "Requiem" && !target.requiemUsed) {
      target.requiemUsed = true;
      target.hp = 1;
      pushLog(state, `${target.name}'s Requiem triggers — HP set to 1 (once/game).`);
      return;
    }
    state.stage = "game-over";
    state.winner = target.id === 0 ? 1 : 0;
    state.winReason = `${target.name}'s ship destroyed (HP ≤ 0).`;
    pushLog(state, `GAME OVER — ${state.players[state.winner].name} wins! ${state.winReason}`);
  }
}

/** Apply a simplified subset of event effects; others logged as TBD stub. */
function resolveEvent(state: GameState, player: PlayerState, event: EventCard): void {
  pushLog(
    state,
    `Event T${event.tier} ${event.polarity} «${event.title}»: ${event.rules}`,
  );

  switch (event.title) {
    case "Minor Hull Scratch":
      dealDamage(state, player, 1, event.title);
      break;
    case "Contaminated Air":
      dealDamage(state, player, 2, event.title);
      break;
    case "Power Spike":
      player.ap = Math.min(MAX_AP, player.ap + 1);
      pushLog(state, `${player.name} AP → ${player.ap}.`);
      break;
    case "Brownout":
      player.ap = Math.max(0, player.ap - 1);
      pushLog(state, `${player.name} AP → ${player.ap}.`);
      break;
    case "Hot Wire":
      player.ap = Math.min(MAX_AP, player.ap + 3);
      pushLog(state, `${player.name} AP → ${player.ap}.`);
      break;
    case "Med Bay Patch":
      player.hp = Math.min(MAX_HP, player.hp + 3);
      pushLog(state, `${player.name} HP → ${player.hp}.`);
      break;
    case "Miracle Patch":
      player.hp = Math.min(MAX_HP, player.hp + 5);
      pushLog(state, `${player.name} HP → ${player.hp}.`);
      break;
    case "Reactor Gift":
      player.ap = MAX_AP;
      pushLog(state, `${player.name} AP → 20.`);
      break;
    case "Sabotage Window":
      dealDamage(state, player, 5, event.title);
      break;
    case "Handshake Protocol":
      player.hp = Math.min(MAX_HP, player.hp + 1);
      pushLog(state, `${player.name} chooses +1 HP (stub) → ${player.hp}.`);
      break;
    case "Last Resort":
      if (player.hp <= 5) {
        player.hp = Math.min(MAX_HP, player.hp + 8);
        player.ap = Math.min(MAX_AP, player.ap + 5);
        pushLog(state, `${player.name} Last Resort → HP ${player.hp}, AP ${player.ap}.`);
      } else {
        pushLog(state, `Last Resort: no effect (HP > 5).`);
      }
      break;
    case "Toll Buoy":
      if (player.hand.length > 0) {
        const i = Math.floor(Math.random() * player.hand.length);
        const discarded = player.hand.splice(i, 1)[0]!;
        state.mainDiscard.push(discarded);
        pushLog(state, `${player.name} discards «${discarded.title}» (Toll Buoy stub).`);
      } else {
        dealDamage(state, player, 2, event.title);
      }
      break;
    default:
      // Simple polarity stubs for remaining events
      if (event.polarity === "-") {
        dealDamage(state, player, event.tier, `${event.title} (TBD stub dmg=${event.tier})`);
      } else {
        const heal = event.tier;
        player.hp = Math.min(MAX_HP, player.hp + heal);
        pushLog(state, `${event.title} (TBD stub): +${heal} HP → ${player.hp}.`);
      }
  }
}

function drawEvent(state: GameState, player: PlayerState, tier: 1 | 2 | 3): void {
  const deck = state.eventDecks[tier];
  if (deck.length === 0) {
    // Reshuffle from full tier list
    const source = tier === 1 ? TIER1 : tier === 2 ? TIER2 : TIER3;
    state.eventDecks[tier] = shuffle(source.map((e) => ({ ...e })));
    pushLog(state, `Tier ${tier} Event deck reshuffled.`);
  }
  const event = state.eventDecks[tier].pop()!;
  resolveEvent(state, player, event);
}

function markMissionVisit(state: GameState, player: PlayerState): void {
  const key = hexKey(player.position);
  const tile = state.tiles.get(key);
  if (!tile?.missionIds?.includes(player.mission.id)) return;
  if (!player.visitedMissionKeys.includes(key)) {
    player.visitedMissionKeys.push(key);
    pushLog(
      state,
      `${player.name} reached mission site «${tile.label ?? key}» (${player.visitedMissionKeys.length}/${player.mission.destinationKeys.length}).`,
    );
  }
}

function canClaimMission(player: PlayerState): boolean {
  return player.mission.destinationKeys.every((k) => player.visitedMissionKeys.includes(k));
}

export function createGame(): GameState {
  const tiles = buildBoard();
  const ships = shuffle(SHIPS);
  const heroes = shuffle(HEROES);
  const missions = shuffle(MISSIONS);
  const main = shuffle(MAIN_DECK.map(cloneMain));

  const makePlayer = (id: 0 | 1, name: string): PlayerState => {
    const ship = ships.pop()!;
    const hero = heroes.pop()!;
    const mission = missions.pop()!;
    const opening = ship.name === "Courier" ? STARTING_HAND + 1 : STARTING_HAND;
    const hand: MainCard[] = [];
    for (let i = 0; i < opening; i++) {
      const c = main.pop();
      if (c) hand.push(c);
    }
    return {
      id,
      name,
      ship,
      hero,
      mission,
      visitedMissionKeys: [],
      hp: MAX_HP,
      ap: MAX_AP,
      position: { q: 0, r: 0 },
      hand,
      hidden: false,
      requiemUsed: false,
      scannedKeys: new Set(),
    };
  };

  const state: GameState = {
    players: [makePlayer(0, "Player 1"), makePlayer(1, "Player 2")],
    active: 0,
    turnNumber: 1,
    phasesLeft: PHASES_PER_TURN,
    stage: "draw",
    tiles,
    mainDeck: main,
    mainDiscard: [],
    eventDecks: {
      1: shuffle(TIER1.map((e) => ({ ...e }))),
      2: shuffle(TIER2.map((e) => ({ ...e }))),
      3: shuffle(TIER3.map((e) => ({ ...e }))),
    },
    diceRolls: 0,
    pendingMoveSteps: 0,
    log: [],
    winner: null,
    winReason: null,
  };

  pushLog(
    state,
    `Setup complete. P1: ${state.players[0].ship.name} / ${state.players[0].hero.name}. P2: ${state.players[1].ship.name} / ${state.players[1].hero.name}.`,
  );
  pushLog(state, "Missions are secret — each player sees only their own. Completing = TBD (land on all dest tiles + claim).");
  pushLog(state, `${state.players[0].name}'s turn — Draw phase.`);
  return state;
}

export function doDrawPhase(state: GameState): GameState {
  if (state.stage !== "draw" || state.winner !== null) return state;
  const s = structuredCloneState(state);
  const p = activePlayer(s);
  drawMain(s, p, 1);
  pushLog(s, `${p.name} draws 1 → hand ${p.hand.length}.`);
  s.stage = "phase";
  s.phasesLeft = PHASES_PER_TURN;
  pushLog(s, `Choose an action (${s.phasesLeft} phases left): Move | Attack | Scan | Hide.`);
  return s;
}

function spendPhase(state: GameState): void {
  state.phasesLeft -= 1;
  if (state.winner !== null) return;
  if (state.phasesLeft <= 0) {
    endTurn(state);
  } else {
    state.stage = "phase";
    pushLog(state, `${state.phasesLeft} phase(s) left.`);
  }
}

function endTurn(state: GameState): void {
  if (state.winner !== null) return;
  const next = state.active === 0 ? 1 : 0;
  state.active = next as 0 | 1;
  if (next === 0) state.turnNumber += 1;
  state.phasesLeft = PHASES_PER_TURN;
  state.pendingMoveSteps = 0;
  state.stage = "draw";
  pushLog(state, `—— End of phase set. ${state.players[next].name}'s turn — Draw phase. ——`);
}

export function chooseAction(state: GameState, action: PhaseAction): GameState {
  if (state.stage !== "phase" || state.winner !== null) return state;
  const s = structuredCloneState(state);
  const p = activePlayer(s);

  switch (action) {
    case "Hide": {
      p.hidden = true;
      pushLog(s, `${p.name} Hides — cannot be Attacked until they Scan or Attack.`);
      spendPhase(s);
      break;
    }
    case "Scan": {
      doScan(s, p);
      spendPhase(s);
      break;
    }
    case "Attack": {
      const opp = opponent(s);
      if (p.ap <= 0) {
        pushLog(s, `Cannot Attack at 0 AP.`);
        return s;
      }
      if (opp.hidden) {
        pushLog(s, `${opp.name} is Hidden — cannot Attack until they Scan or Attack.`);
        return s;
      }
      const oppKey = hexKey(opp.position);
      if (!p.scannedKeys.has(oppKey)) {
        pushLog(s, `Must Scan target's tile before Attack (need scan on ${oppKey}).`);
        return s;
      }
      const dist = hexDistance(p.position, opp.position);
      if (dist > 1) {
        pushLog(s, `Target out of range (need same/adjacent tile; distance ${dist}).`);
        return s;
      }
      // Break hide by attacking
      p.hidden = false;
      let dmg = p.ap;
      if (p.hero.name === "Pilot Sera Nyx") {
        /* no attack effect */
      }
      dealDamage(s, opp, dmg, `${p.name} Attack (AP ${p.ap})`);
      p.ap = Math.max(0, p.ap - 1);
      pushLog(s, `${p.name} spends 1 AP → ${p.ap}.`);
      if (s.winner === null) spendPhase(s);
      break;
    }
    case "Move": {
      const roll = 1 + Math.floor(Math.random() * 6);
      recordDiceRoll(s, p);
      let steps = roll % 2 === 0 ? 2 : 1;
      if (p.hero.name === "Pilot Sera Nyx" && roll % 2 === 0) {
        steps += 1;
        pushLog(s, `Pilot Sera Nyx: even roll +1 hex.`);
      }
      s.pendingMoveSteps = steps;
      s.stage = "await-move-target";
      pushLog(
        s,
        `${p.name} Move roll d6=${roll} → ${steps} hex${steps > 1 ? "es" : ""}. Click a reachable hex, or Skip move.`,
      );
      break;
    }
  }
  return s;
}

function doScan(state: GameState, player: PlayerState): void {
  player.hidden = false;
  const keys = [hexKey(player.position), ...hexNeighbors(player.position).map(hexKey)];
  for (const k of keys) {
    if (state.tiles.has(k)) player.scannedKeys.add(k);
  }
  const opp = opponent(state);
  const revealed = player.scannedKeys.has(hexKey(opp.position))
    ? ` Opponent ${opp.name} on scanned tile.`
    : "";
  pushLog(
    state,
    `${player.name} Scans current + adjacent (${keys.filter((k) => state.tiles.has(k)).length} tiles).${revealed}`,
  );
}

export function getReachable(state: GameState): Hex[] {
  if (state.stage !== "await-move-target" || state.pendingMoveSteps <= 0) return [];
  const p = activePlayer(state);
  const steps = state.pendingMoveSteps;
  const out: Hex[] = [];
  for (const tile of state.tiles.values()) {
    const d = hexDistance(p.position, tile.hex);
    if (d >= 1 && d <= steps) out.push(tile.hex);
  }
  return out;
}

export function skipMove(state: GameState): GameState {
  if (state.stage !== "await-move-target") return state;
  const s = structuredCloneState(state);
  pushLog(s, `${activePlayer(s).name} skips Move.`);
  s.pendingMoveSteps = 0;
  spendPhase(s);
  return s;
}

export function confirmMove(state: GameState, target: Hex): GameState {
  if (state.stage !== "await-move-target") return state;
  const s = structuredCloneState(state);
  const p = activePlayer(s);
  const d = hexDistance(p.position, target);
  if (d < 1 || d > s.pendingMoveSteps || !s.tiles.has(hexKey(target))) {
    pushLog(s, `Invalid move target ${hexKey(target)}.`);
    return s;
  }
  p.position = { ...target };
  s.pendingMoveSteps = 0;
  const tile = s.tiles.get(hexKey(target))!;
  pushLog(
    s,
    `${p.name} moves to ${hexKey(target)}${tile.label ? ` (${tile.label})` : ""} [tier ${tile.tier}].`,
  );
  markMissionVisit(s, p);
  if (tile.tier >= 1 && tile.tier <= 3) {
    drawEvent(s, p, tile.tier as 1 | 2 | 3);
  }
  if (s.winner === null) spendPhase(s);
  return s;
}

/** Prototype mission claim — rules say complete steps TBD */
export function claimMission(state: GameState): GameState {
  if (state.winner !== null) return state;
  if (state.stage !== "phase" && state.stage !== "draw") return state;
  const s = structuredCloneState(state);
  const p = activePlayer(s);
  if (!canClaimMission(p)) {
    pushLog(
      s,
      `Cannot claim yet — visit all destinations first (${p.visitedMissionKeys.length}/${p.mission.destinationKeys.length}). ${p.mission.completeRule}`,
    );
    return s;
  }
  s.stage = "game-over";
  s.winner = p.id;
  s.winReason = `Completed secret mission «${p.mission.name}» (prototype claim; full resolve TBD).`;
  pushLog(s, `GAME OVER — ${p.name} wins! ${s.winReason}`);
  return s;
}

/** Play a hand card with minimal stubs for healing/lucky; others TBD */
export function playCard(state: GameState, handIndex: number): GameState {
  if (state.winner !== null) return state;
  if (state.stage !== "phase" && state.stage !== "draw") return state;
  const s = structuredCloneState(state);
  const p = activePlayer(s);
  if (handIndex < 0 || handIndex >= p.hand.length) return s;
  const card = p.hand.splice(handIndex, 1)[0]!;
  s.mainDiscard.push(card);
  pushLog(s, `${p.name} plays «${card.title}» (${card.type}): ${card.rules}`);

  switch (card.title) {
    case "Med Spray":
      p.hp = Math.min(MAX_HP, p.hp + 3);
      break;
    case "Field Surgery":
      p.hp = Math.min(MAX_HP, p.hp + 5);
      break;
    case "Repair Drones":
      p.hp = Math.min(MAX_HP, p.hp + 2);
      break;
    case "Rest Cycle":
      p.hp = Math.min(MAX_HP, p.hp + 4);
      break;
    case "Stim Pack":
      p.hp = Math.min(MAX_HP, p.hp + 2);
      p.ap = Math.min(MAX_AP, p.ap + 1);
      break;
    case "Miracle Gel":
      if (p.hp < 10) p.hp = 10;
      break;
    case "Jackpot Signal":
      drawMain(s, p, 2);
      break;
    case "Found Cache":
      p.ap = Math.min(MAX_AP, p.ap + 3);
      break;
    case "Hull Breach":
      dealDamage(s, p, 4, card.title);
      break;
    case "Fuel Leak":
      p.ap = Math.max(0, p.ap - 2);
      break;
    case "Ambush Scratch":
      dealDamage(s, p, 3, card.title);
      break;
    case "Glitch": {
      if (p.hand.length > 0) {
        const i = Math.floor(Math.random() * p.hand.length);
        const d = p.hand.splice(i, 1)[0]!;
        s.mainDiscard.push(d);
        pushLog(s, `Glitch discards «${d.title}».`);
      }
      break;
    }
    default:
      pushLog(s, `Card effect TBD in v1 — discarded after play for visibility.`);
  }
  pushLog(s, `${p.name} now HP ${p.hp} / AP ${p.ap}, hand ${p.hand.length}.`);
  return s;
}

export function missionProgress(player: PlayerState): string {
  return `${player.visitedMissionKeys.length}/${player.mission.destinationKeys.length} sites`;
}

export function isScannedBy(player: PlayerState, hex: Hex): boolean {
  return player.scannedKeys.has(hexKey(hex));
}

export function tileAt(state: GameState, hex: Hex): Tile | undefined {
  return state.tiles.get(hexKey(hex));
}

/** JSON clone + restore Map/Set fields (Sets must be new copies per clone). */
function structuredCloneState(state: GameState): GameState {
  const tiles = new Map(state.tiles);
  const raw = JSON.parse(JSON.stringify(state)) as GameState;
  raw.players[0].scannedKeys = new Set(state.players[0].scannedKeys);
  raw.players[1].scannedKeys = new Set(state.players[1].scannedKeys);
  raw.tiles = tiles;
  raw.players[0].position = { ...state.players[0].position };
  raw.players[1].position = { ...state.players[1].position };
  return raw;
}

export { hexKey };
