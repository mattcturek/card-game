import { createGame } from "./game/engine";
import { renderApp, type GameController } from "./ui/render";
import "./style.css";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("#app missing");

let state = createGame();

const ctrl: GameController = {
  getState: () => state,
  setState: (next) => {
    state = next;
    renderApp(app, ctrl);
  },
};

renderApp(app, ctrl);
