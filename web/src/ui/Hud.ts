import Phaser from "phaser";
import type { Player } from "../entities/Player";

/**
 * Ports objects/Character's Draw_64 event (display_healthbar, display_money,
 * display_experience, display_nb_potions), redrawn with modern web text
 * instead of the original per-letter bitmap font.
 */
export class Hud {
  private player: Player;
  private container: Phaser.GameObjects.Container;
  private healthBg: Phaser.GameObjects.Image;
  private healthFill: Phaser.GameObjects.Image;
  private moneyText: Phaser.GameObjects.Text;
  private xpText: Phaser.GameObjects.Text;
  private potionText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, player: Player) {
    this.player = player;

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(900);

    this.healthBg = scene.add.image(30, 30, "ui-healthbar-bg").setOrigin(0, 0).setScale(0.22);
    this.healthFill = scene.add.image(35, 33, "ui-healthbar-fill").setOrigin(0, 0).setScale(0.22);

    const textStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontFamily: "system-ui, sans-serif",
      fontSize: "26px",
      color: "#ffffff",
      stroke: "#000000",
      strokeThickness: 4,
    };

    this.moneyText = scene.add.text(scene.scale.width - 40, 25, "0$", textStyle).setOrigin(1, 0);
    this.xpText = scene.add.text(scene.scale.width - 40, 55, "0xp", textStyle).setOrigin(1, 0);
    this.potionText = scene.add.text(scene.scale.width - 40, 95, "🧪 0", textStyle).setOrigin(1, 0);

    this.container.add([this.healthBg, this.healthFill, this.moneyText, this.xpText, this.potionText]);
  }

  update() {
    const pct = Phaser.Math.Clamp(this.player.hp / this.player.maxHp, 0, 1);
    this.healthFill.setCrop(0, 0, this.healthFill.width * pct, this.healthFill.height);
    this.moneyText.setText(`${this.player.money}$`);
    this.xpText.setText(`${this.player.experience}xp`);
    this.potionText.setText(`🧪 ${this.player.nbPotions}`);
  }

  destroy() {
    this.container.destroy();
  }
}
