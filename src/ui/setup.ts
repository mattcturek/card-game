import { heroArtUrl, mainArtUrl } from "../data/art";
import type { GameState } from "../game/types";

export type SetupHandlers = {
  beginGame: () => void;
  redeal: () => void;
};

/** Full-screen game-start deal: Mission, Hero, Ship, opening Main Deck hand. */
export function renderSetup(root: HTMLElement, state: GameState, handlers: SetupHandlers): void {
  root.innerHTML = "";

  const page = el("div", { class: "setup-page" });
  const hero = el("header", { class: "setup-hero" });
  hero.append(
    el("p", { class: "setup-kicker" }, "Game start"),
    el("h1", {}, "Deal your opening cards"),
    el(
      "p",
      { class: "setup-lead" },
      "Each player draws 1 Ship, 1 Hero, 1 secret Mission, and 5 Main Deck cards (Courier: 6). Review both hotseat hands, then begin.",
    ),
  );
  page.append(hero);

  const actions = el("div", { class: "setup-actions" });
  const begin = el("button", { class: "primary setup-begin", type: "button" }, "Begin game");
  begin.addEventListener("click", handlers.beginGame);
  const redeal = el("button", { type: "button" }, "Redeal");
  redeal.addEventListener("click", handlers.redeal);
  actions.append(begin, redeal);
  page.append(actions);

  const grid = el("div", { class: "setup-players" });
  for (const p of state.players) {
    grid.append(renderPlayerDeal(p, p.id === 0 ? "p1" : "p2"));
  }
  page.append(grid);

  page.append(
    el(
      "p",
      { class: "setup-footnote" },
      "During play, the opponent's mission stays hidden. Hero & Main Deck art from cards/; Ship & Mission are text stubs until art lands.",
    ),
  );

  root.append(page);
}

function renderPlayerDeal(
  p: GameState["players"][0],
  tone: "p1" | "p2",
): HTMLElement {
  const section = el("section", { class: `setup-player ${tone}` });
  section.append(el("h2", {}, `${p.name} — opening draw`));
  section.append(
    el(
      "div",
      { class: "setup-stats" },
      `Starts at center · HP ${p.hp} · AP ${p.ap} · Hand ${p.hand.length}`,
    ),
  );

  const draws = el("div", { class: "setup-draws" });

  // Order matches rulebook setup: Ship → Hero → Mission → Main Deck
  draws.append(
    revealCard({
      step: "1 · Ship",
      title: p.ship.name,
      type: "Ship",
      body: p.ship.ability,
      art: null,
    }),
    revealCard({
      step: "2 · Hero",
      title: p.hero.name,
      type: "Hero",
      body: p.hero.ability,
      art: heroArtUrl(p.hero),
    }),
    revealCard({
      step: "3 · Mission",
      title: p.mission.name,
      type: "Mission (secret)",
      body: `${p.mission.locationLabel}\n\n${p.mission.brief}\n\nComplication: ${p.mission.complication}`,
      art: null,
    }),
  );

  const handBlock = el("div", { class: "setup-hand-block" });
  handBlock.append(
    el(
      "h3",
      {},
      p.hand.length === 5
        ? "4 · Main Deck (5 cards)"
        : `4 · Main Deck (${p.hand.length} cards — Courier +1)`,
    ),
  );
  const hand = el("div", { class: "setup-hand" });
  for (const card of p.hand) {
    hand.append(
      revealCard({
        step: card.type,
        title: card.title,
        type: "Main Deck",
        body: card.rules,
        art: mainArtUrl(card),
        compact: true,
      }),
    );
  }
  handBlock.append(hand);
  draws.append(handBlock);

  section.append(draws);
  return section;
}

function revealCard(opts: {
  step: string;
  title: string;
  type: string;
  body: string;
  art: string | null;
  compact?: boolean;
}): HTMLElement {
  const card = el("article", {
    class: opts.compact ? "setup-card compact" : "setup-card",
  });
  card.append(el("div", { class: "setup-card-step" }, opts.step));

  if (opts.art) {
    const img = document.createElement("img");
    img.className = "setup-card-art";
    img.src = opts.art;
    img.alt = opts.title;
    img.loading = "lazy";
    img.addEventListener("error", () => {
      img.replaceWith(el("div", { class: "setup-card-art missing" }, "No art"));
    });
    card.append(img);
  } else {
    card.append(el("div", { class: "setup-card-art missing" }, opts.type));
  }

  card.append(el("div", { class: "setup-card-type" }, opts.type));
  card.append(el("h4", { class: "setup-card-title" }, opts.title));
  card.append(el("p", { class: "setup-card-body" }, opts.body));
  return card;
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
