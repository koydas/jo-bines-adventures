import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { BootScene } from "./scenes/BootScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { TownScene } from "./scenes/TownScene";
import { GraveyardScene } from "./scenes/GraveyardScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { initTouchControls } from "./systems/touchControlsInstance";
import { GameState } from "./state/GameState";

// Created once; persists across every scene transition (see TouchControls.ts).
initTouchControls();

export const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: "app",
  backgroundColor: "#141018",
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  input: {
    gamepad: true,
  },
  scene: [BootScene, MainMenuScene, TownScene, GraveyardScene, GameOverScene],
});

// Exposed intentionally (not gated to dev builds): this is a fully
// client-side game with no secrets, and the Playwright smoke suite
// (tests/smoke.spec.ts) drives/asserts on game state through these
// globals against the built production preview, not just `npm run dev`.
declare global {
  interface Window {
    __game: Phaser.Game;
    __gameState: typeof GameState;
  }
}
window.__game = game;
window.__gameState = GameState;
