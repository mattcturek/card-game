import { createGame } from "./game/engine";
import { renderApp, type GameController } from "./ui/render";
import { renderSetup } from "./ui/setup";
import "./style.css";

const root = document.querySelector<HTMLDivElement>("#app");
if (!root) throw new Error("#app missing");
const app: HTMLDivElement = root;

type Mode = "setup" | "play";

let mode: Mode = "setup";
let state = createGame();

const ctrl: GameController = {
  getState: () => state,
  setState: (next) => {
    state = next;
    render();
  },
  returnToSetup: () => {
    mode = "setup";
    state = createGame();
    render();
  },
};

function render(): void {
  if (mode === "setup") {
    app.classList.add("mode-setup");
    app.classList.remove("mode-play");
    renderSetup(app, state, {
      beginGame: () => {
        mode = "play";
        render();
      },
      redeal: () => {
        state = createGame();
        render();
      },
    });
    return;
  }
  app.classList.remove("mode-setup");
  app.classList.add("mode-play");
  renderApp(app, ctrl);
}

render();
