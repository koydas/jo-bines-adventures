import Phaser from "phaser";
import { GAME_OVER_LINES } from "../constants";
import { GameState } from "../state/GameState";
import { getTouchControls } from "../systems/touchControlsInstance";

/** Ports objects/GameOver / rooms/LosingScreen. */
export class GameOverScene extends Phaser.Scene {
  constructor() {
    super("GameOver");
  }

  create() {
    const { width, height } = this.scale;
    this.cameras.main.setBackgroundColor("#1a0a0a");
    // See the comment on TouchControls.setSceneActive — this scene reads
    // input straight off the Phaser canvas, not touchState.
    getTouchControls()?.setSceneActive(false);

    this.add
      .text(width / 2, height * 0.4, GAME_OVER_LINES[0], {
        fontFamily: "Georgia, serif",
        fontSize: "54px",
        color: "#ff6b6b",
        fontStyle: "bold",
      })
      .setOrigin(0.5);

    const retry = this.add
      .text(width / 2, height * 0.55, GAME_OVER_LINES[1], {
        fontFamily: "system-ui, sans-serif",
        fontSize: "26px",
        color: "#ffffff",
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: retry, alpha: 0.3, duration: 700, yoyo: true, repeat: -1 });

    const restart = () => {
      GameState.reset();
      this.scene.start("Town");
    };

    this.input.once("pointerdown", restart);
    this.input.keyboard?.once("keydown", restart);
    this.input.gamepad?.once(Phaser.Input.Gamepad.Events.BUTTON_DOWN, restart);
  }
}
