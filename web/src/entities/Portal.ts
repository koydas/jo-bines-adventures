import Phaser from "phaser";
import { GameState } from "../state/GameState";

/** Ports objects/Portail (Create/Draw/Step/Other_7). */
export class Portal extends Phaser.Physics.Arcade.Sprite {
  private animating = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "ui-portal");
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1);
    this.setScale(0.7);
    this.refresh();
  }

  /** Call once per frame; only reacts when GameState actually changes. */
  update() {
    if (GameState.portalOpening && !this.animating) {
      this.animating = true;
      this.setVisible(true);
      this.play("ui-opening-portal");
      this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
        GameState.portalOpening = false;
        GameState.portalOpened = true;
        this.animating = false;
        this.refresh();
      });
    }
  }

  private refresh() {
    if (this.animating) return;
    this.setVisible(GameState.portalOpened || GameState.portalOpening);
    if (GameState.portalOpened) this.setTexture("ui-portal");
  }
}
