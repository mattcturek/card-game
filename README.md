# Card Game

Sci-fi RPG card game (TNG × Firefly tone).

## Playable prototype

Hotseat 2-player browser prototype of the core loop (hex board, ships/heroes/missions, main deck, events). Unclear rules are stubbed and labeled **TBD** in-game.

```bash
npm install
npm run dev
```

Open the URL Vite prints (default [http://localhost:5173](http://localhost:5173)).

```bash
npm run build
```

### Prototype loop

1. **Setup** — each player gets 1 random Ship, 1 Hero, 1 Mission (5 locked missions), and 5 Main Deck cards (Courier draws 6). Start at center hex with **20 HP / 20 AP** on a hex map of **radius 8** (**217** tiles; was radius 3 / 37).
2. **Turn** — Draw 1 → **3 phases**; each phase choose **Move | Attack | Scan | Hide**.
3. **Move** — roll d6 (even = 2 hex, odd = 1); optional skip. Landing on tile **1/2/3** draws that Tier Event (stub effects).
4. **Scan** — mark current + adjacent tiles scanned; breaks Hide.
5. **Attack** — requires Scan on target tile; range same/adjacent; deal current AP then −1 AP; HP ≤ 0 loses (Requiem once/game → HP 1).
6. **Hide** — cannot be Attacked until you Scan or Attack.
7. **AP regen** — +1 every 2 dice rolls (Quarry: every 1 while HP ≤ 10).

Missions: visit all destination tiles on your secret mission, then **Claim mission (TBD stub)**.

```
src/
  data/     # ships, heroes, missions, main deck, events
  game/     # hex math + turn engine
  ui/       # board / hand / controls / log
  main.ts
```

## Docs

- [Rulebook outline](docs/rulebook-outline.md)
- [Rules summary](docs/rules-summary.md)
- [60 Event cards (data)](docs/decks-60.md)
- [Card art index](docs/card-art-index.md)
- [Missions](docs/missions.md)
- [Board](docs/board.md)
- [Card types](docs/card-types.md)

## Cards (art + structure)

```
cards/
  tier-1/ … tier-3/   # Event card artwork
  manifest.json
```

See [cards/README.md](cards/README.md).
