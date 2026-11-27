import type { HeroCard } from "./heroes";
import type { MainCard } from "./mainDeck";

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/** Hero art under /cards/heroes/ (served from repo cards/). */
export function heroArtUrl(hero: HeroCard): string {
  return `/cards/heroes/hero-${pad2(hero.id)}-${slugify(hero.name)}.jpg`;
}

/** Main deck art under /cards/main/. */
export function mainArtUrl(card: MainCard): string {
  return `/cards/main/main-${pad2(card.id)}-${slugify(card.title)}.jpg`;
}

/** Ship / mission art not in cards/ yet — return null for text-only frame. */
export function shipArtUrl(_shipName: string): string | null {
  return null;
}

export function missionArtUrl(_missionId: string): string | null {
  return null;
}
