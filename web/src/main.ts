import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants";
import { BootScene } from "./scenes/BootScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { TownScene } from "./scenes/TownScene";
import { GraveyardScene } from "./scenes/GraveyardScene";
import { GameOverScene } from "./scenes/GameOverScene";
import { initTouchControls } from "./systems/touchControlsInstance";

// Created once; persists across every scene transition (see TouchControls.ts).
initTouchControls();

const __game = new Phaser.Game({
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

if (import.meta.env.DEV) {
  (window as unknown as { __game: Phaser.Game }).__game = __game;
}
