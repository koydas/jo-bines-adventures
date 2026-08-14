import Phaser from "phaser";
import { INSTRUCTIONS_LINES } from "../constants";
import { GameState } from "../state/GameState";

/** Ports rooms/MainMenu + objects/Instructions. */
export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super("MainMenu");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#1b1425");

    this.add
      .text(width / 2, height * 0.22, "Les Aventures de\nJo Bine", {
        fontFamily: "Georgia, serif",
        fontSize: "56px",
        color: "#ffd479",
        align: "center",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.add.image(width / 2, height * 0.52, "char-idle-0").setScale(0.9);

    const instructions = INSTRUCTIONS_LINES.join("\n");
    this.add
      .text(width / 2, height * 0.82, instructions, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "22px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 10,
      })
      .setOrigin(0.5);

    const startText = this.add
      .text(width / 2, height * 0.94, "▶ Toucher pour commencer", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "26px",
        color: "#79ffb0",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    this.tweens.add({ targets: startText, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    this.input.once("pointerdown", () => this.start());
    this.input.keyboard?.once("keydown", () => this.start());
  }

  private start() {
    GameState.reset();
    this.scene.start("Town");
  }
}
