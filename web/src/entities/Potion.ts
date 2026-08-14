import Phaser from "phaser";
import { POTION_PRICE } from "../constants";

/** Ports objects/Potion + objects/Item (price tag, buy prompt). */
export class Potion extends Phaser.Physics.Arcade.Sprite {
  readonly price = POTION_PRICE;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "ui-potion");
    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1);
    this.setScale(0.8);

    scene.add.image(x, y + 24, "ui-price-tag").setScale(0.5).setOrigin(0.5);
    scene.add
      .text(x, y + 24, `${this.price}$`, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#2b1500",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
  }
}
