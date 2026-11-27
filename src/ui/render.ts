import {
  claimMission,
  chooseAction,
  confirmMove,
  doDrawPhase,
  getReachable,
  hexKey,
  isScannedBy,
  missionProgress,
  playCard,
  skipMove,
  BOARD_RADIUS,
} from "../game/engine";
import { hexPolygonPoints, hexToPixel } from "../game/hex";
import type { GameState, PhaseAction } from "../game/types";

/** Slightly smaller hexes so the larger radius-8 map stays usable with scroll. */
const HEX_SIZE = 22;

export type GameController = {
  getState: () => GameState;
  setState: (s: GameState) => void;
};

export function renderApp(root: HTMLElement, ctrl: GameController): void {
  const state = ctrl.getState();
  root.innerHTML = "";

  const header = el("header", { class: "top" });
  header.append(
    el("h1", {}, "Card Game — Prototype"),
    el("div", { class: "sub" }, "Hotseat 2-player · rulebook stub v1 · missions complete = TBD claim"),
  );
  root.append(header);

  if (state.winner !== null) {
    root.append(
      el(
        "div",
        { class: "winner-banner" },
        `Winner: ${state.players[state.winner].name} — ${state.winReason}`,
      ),
    );
  }

  const layout = el("div", { class: "layout" });
  const mainCol = el("div");
  const sideCol = el("div");

  mainCol.append(renderHud(state, ctrl));
  mainCol.append(renderBoard(state, ctrl));
  mainCol.append(renderControls(state, ctrl));
  mainCol.append(renderHand(state, ctrl));

  sideCol.append(renderLog(state));
  sideCol.append(renderLegend());

  layout.append(mainCol, sideCol);
  root.append(layout);
}

function renderHud(state: GameState, ctrl: GameController): HTMLElement {
  const wrap = el("div", { class: "hud" });
  for (const p of state.players) {
    const card = el("div", {
      class: `player-card p${p.id + 1}${state.active === p.id ? " active" : ""}`,
    });
    card.append(el("div", { class: "name" }, p.name + (state.active === p.id ? " ▶" : "")));
    const stats = el("div", { class: "stat-row" });
    stats.append(
      el("span", { class: "stat" }, "HP ", el("strong", {}, String(p.hp))),
      el("span", { class: "stat" }, "AP ", el("strong", {}, String(p.ap))),
      el("span", { class: "stat" }, "Pos ", el("strong", {}, hexKey(p.position))),
    );
    card.append(stats);
    card.append(
      el(
        "div",
        { class: "meta" },
        `Ship: ${p.ship.name} — ${p.ship.ability}`,
        el("br"),
        `Hero: ${p.hero.name} — ${p.hero.ability}`,
        el("br"),
        p.hidden ? "Status: HIDDEN" : "Status: visible",
        ` · Hand ${p.hand.length} · Scanned ${p.scannedKeys.size} tiles`,
      ),
    );
    // Secret mission only shown for active player (hotseat)
    if (state.active === p.id) {
      const m = el("div", { class: "mission-secret" });
      m.append(
        el("strong", {}, `Secret Mission: ${p.mission.name}`),
        el("br"),
        `${p.mission.locationLabel} · Progress ${missionProgress(p)}`,
        el("br"),
        p.mission.brief,
        el("br"),
        el("em", {}, p.mission.completeRule),
      );
      card.append(m);
      if (p.visitedMissionKeys.length >= p.mission.destinationKeys.length && state.winner === null) {
        const btn = el("button", { class: "primary", type: "button" }, "Claim mission (TBD stub)");
        btn.addEventListener("click", () => {
          ctrl.setState(claimMission(ctrl.getState()));
        });
        card.append(btn);
      }
    } else {
      card.append(el("div", { class: "meta" }, "Secret mission hidden (hotseat)."));
    }
    wrap.append(card);
  }
  return wrap;
}

function renderBoard(state: GameState, ctrl: GameController): HTMLElement {
  const wrap = el("div", { class: "panel board-wrap" });
  wrap.append(el("h2", {}, "Hex Board"));

  const reachable = new Set(getReachable(state).map(hexKey));
  const active = state.players[state.active];
  const center = hexToPixel({ q: 0, r: 0 }, HEX_SIZE);
  const pad = HEX_SIZE * (BOARD_RADIUS * 2 + 2);
  const width = pad * 2;
  const height = pad * 2;
  const ox = width / 2 - center.x;
  const oy = height / 2 - center.y;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  // Show more of the enlarged map; panel still scrolls if needed
  svg.setAttribute("width", String(Math.min(920, width)));
  svg.setAttribute("height", String(Math.min(820, height)));

  for (const tile of state.tiles.values()) {
    const { x, y } = hexToPixel(tile.hex, HEX_SIZE);
    const cx = x + ox;
    const cy = y + oy;
    const key = hexKey(tile.hex);
    const poly = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    poly.setAttribute("points", hexPolygonPoints(cx, cy, HEX_SIZE - 1.5));
    const scanned = isScannedBy(active, tile.hex);
    const fill = tileFill(tile.tier, scanned, !!tile.label);
    poly.setAttribute("fill", fill);
    poly.setAttribute("stroke", "rgba(200,220,255,0.35)");
    poly.setAttribute("stroke-width", "1");
    poly.classList.add("hex-tile");
    if (reachable.has(key)) poly.classList.add("reachable");
    if (reachable.has(key)) {
      poly.addEventListener("click", () => {
        ctrl.setState(confirmMove(ctrl.getState(), tile.hex));
      });
    }
    svg.append(poly);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", String(cx));
    label.setAttribute("y", String(cy - 4));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("fill", "#dce8f8");
    label.setAttribute("font-size", "11");
    label.setAttribute("font-weight", "700");
    label.textContent = String(tile.tier);
    svg.append(label);

    if (tile.label) {
      const t = document.createElementNS("http://www.w3.org/2000/svg", "text");
      t.setAttribute("x", String(cx));
      t.setAttribute("y", String(cy + 10));
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("fill", "#e0a45a");
      t.setAttribute("font-size", "7.5");
      t.textContent = tile.label.length > 14 ? tile.label.slice(0, 12) + "…" : tile.label;
      svg.append(t);
    }
  }

  // Ships
  for (const p of state.players) {
    const { x, y } = hexToPixel(p.position, HEX_SIZE);
    const cx = x + ox;
    const cy = y + oy;
    const offset = p.id === 0 ? -8 : 8;
    const ship = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    ship.setAttribute("cx", String(cx + offset));
    ship.setAttribute("cy", String(cy + 6));
    ship.setAttribute("r", "7");
    ship.setAttribute("fill", p.id === 0 ? "#5b9fd4" : "#d47a5b");
    ship.setAttribute("stroke", "#fff");
    ship.setAttribute("stroke-width", "1.5");
    if (p.hidden) ship.setAttribute("opacity", "0.45");
    svg.append(ship);
    const tag = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tag.setAttribute("x", String(cx + offset));
    tag.setAttribute("y", String(cy + 9));
    tag.setAttribute("text-anchor", "middle");
    tag.setAttribute("fill", "#0b1220");
    tag.setAttribute("font-size", "8");
    tag.setAttribute("font-weight", "700");
    tag.textContent = String(p.id + 1);
    svg.append(tag);
  }

  wrap.append(svg);
  return wrap;
}

function tileFill(tier: number, scanned: boolean, mission: boolean): string {
  if (mission) return scanned ? "#3a4a28" : "#2a3820";
  const base = ["#1a2740", "#243a2e", "#3a3420", "#3a2228"][tier] ?? "#1a2740";
  const scannedTint = ["#243656", "#2e4e3c", "#4a4428", "#4a2e36"][tier] ?? base;
  return scanned ? scannedTint : base;
}

function renderControls(state: GameState, ctrl: GameController): HTMLElement {
  const panel = el("div", { class: "panel" });
  panel.append(el("h2", {}, "Turn Controls"));

  const status = el("div", { class: "status-line" });
  if (state.winner !== null) {
    status.textContent = "Game over.";
  } else if (state.stage === "draw") {
    status.textContent = `${state.players[state.active].name}: Draw phase — draw 1 card to begin.`;
  } else if (state.stage === "await-move-target") {
    status.textContent = `Move: pick a hex within ${state.pendingMoveSteps} step(s), or Skip.`;
  } else {
    status.textContent = `${state.players[state.active].name}: choose action · ${state.phasesLeft} phase(s) left · dice rolls ${state.diceRolls}`;
  }
  panel.append(status);

  const controls = el("div", { class: "controls" });

  const drawBtn = el("button", { class: "primary", type: "button" }, "Draw (start turn)");
  drawBtn.disabled = state.stage !== "draw" || state.winner !== null;
  drawBtn.addEventListener("click", () => ctrl.setState(doDrawPhase(ctrl.getState())));
  controls.append(drawBtn);

  const actions: PhaseAction[] = ["Move", "Attack", "Scan", "Hide"];
  for (const a of actions) {
    const btn = el("button", { type: "button" }, a);
    btn.disabled = state.stage !== "phase" || state.winner !== null;
    btn.addEventListener("click", () => ctrl.setState(chooseAction(ctrl.getState(), a)));
    controls.append(btn);
  }

  const skip = el("button", { type: "button" }, "Skip Move");
  skip.disabled = state.stage !== "await-move-target";
  skip.addEventListener("click", () => ctrl.setState(skipMove(ctrl.getState())));
  controls.append(skip);

  const reset = el("button", { class: "danger", type: "button" }, "New Game");
  reset.addEventListener("click", () => {
    window.location.reload();
  });
  controls.append(reset);

  panel.append(controls);
  return panel;
}

function renderHand(state: GameState, ctrl: GameController): HTMLElement {
  const panel = el("div", { class: "panel" });
  const p = state.players[state.active];
  panel.append(el("h2", {}, `${p.name} Hand (click to play — many effects TBD)`));
  const hand = el("div", { class: "hand" });
  p.hand.forEach((card, i) => {
    const c = el("button", { class: "card", type: "button" });
    c.append(
      el("div", { class: "ctype" }, card.type),
      el("div", { class: "ctitle" }, card.title),
      el("div", { class: "crules" }, card.rules),
    );
    c.disabled = state.winner !== null || (state.stage !== "phase" && state.stage !== "draw");
    c.addEventListener("click", () => ctrl.setState(playCard(ctrl.getState(), i)));
    hand.append(c);
  });
  if (p.hand.length === 0) hand.append(el("div", { class: "meta" }, "Hand empty."));
  panel.append(hand);
  return panel;
}

function renderLog(state: GameState): HTMLElement {
  const panel = el("div", { class: "panel" });
  panel.append(el("h2", {}, "Log"));
  const log = el("div", { class: "log" });
  for (const line of state.log) {
    log.append(el("div", {}, line));
  }
  panel.append(log);
  return panel;
}

function renderLegend(): HTMLElement {
  const panel = el("div", { class: "panel" });
  panel.append(el("h2", {}, "Legend"));
  panel.append(
    el(
      "div",
      { class: "legend" },
      "Tile number 0 = no Event · 1/2/3 = Tier Event.",
      el("br"),
      "Move: d6 even=2 hex, odd=1 (Sera Nyx: even +1).",
      el("br"),
      "Attack: need Scan on target tile; range same/adjacent; deal AP then −1 AP.",
      el("br"),
      "Hide: cannot be Attacked until you Scan or Attack.",
      el("br"),
      "AP regen: +1 every 2 dice rolls (Quarry: every 1 while HP ≤ 10).",
      el("br"),
      "Blue = P1 · Coral = P2. Click highlighted hexes to land.",
    ),
  );
  return panel;
}

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  attrs: Record<string, string> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else node.setAttribute(k, v);
  }
  for (const child of children) {
    node.append(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}
