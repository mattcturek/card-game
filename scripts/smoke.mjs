/**
 * Lightweight smoke of core loop via dynamic import of built bundle is awkward;
 * instead duplicate minimal invariants by booting the page through fetch.
 */
const url = process.env.URL || "http://127.0.0.1:5173/";
const res = await fetch(url);
if (!res.ok) throw new Error(`dev server ${res.status}`);
const html = await res.text();
if (!html.includes("/src/main.ts")) throw new Error("index missing main.ts");
const main = await fetch(new URL("/src/main.ts", url));
if (!main.ok) throw new Error(`main.ts ${main.status}`);
const engine = await fetch(new URL("/src/game/engine.ts", url));
if (!engine.ok) throw new Error(`engine.ts ${engine.status}`);
console.log("OK: Vite serves index + engine");
