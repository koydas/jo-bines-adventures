import Phaser from "phaser";
import { COOLDOWNS, PLAYER_STATS } from "../constants";

export type PlayerAction = "idle" | "run" | "attack" | "hit";

/**
 * Ports objects/Character (Create/Step/Draw/Alarm/Destroy events) and the
 * scripts it pulls in (character_actions, character_stats, punch_movement,
 * take_damage, cooldowns, ...).
 */
export class Player extends Phaser.Physics.Arcade.Sprite {
  maxHp = PLAYER_STATS.maxHp;
  hp = PLAYER_STATS.maxHp;
  money = 0;
  experience = 0;
  nbPotions = 0;

  facing: 1 | -1 = 1;
  action: PlayerAction = "idle";

  private attackTimer = 0;
  private takeHitTimer = 0;
  private groundY: number;
  private onDeath: () => void;

  constructor(scene: Phaser.Scene, x: number, y: number, onDeath: () => void) {
    super(scene, x, y, "char-idle-0");
    this.groundY = y;
    this.onDeath = onDeath;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.setCollideWorldBounds(true);
    this.getBody().setSize(90, 260).setOffset(80, 160);

    this.play("char-idle");
  }

  private getBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  get isAttacking() {
    return this.action === "attack";
  }

  get isDead() {
    return this.hp <= 0;
  }

  moveLeft() {
    this.move(-1);
  }

  moveRight() {
    this.move(1);
  }

  private move(direction: 1 | -1) {
    if (this.action === "attack" || this.isDead) return;

    this.facing = direction;
    this.setFlipX(direction < 0);
    this.getBody().setVelocityX(direction * PLAYER_STATS.runSpeed);

    if (this.action !== "run") {
      this.action = "run";
      this.play("char-run", true);
    }
  }

  goIdle() {
    if (this.isDead) return;
    this.getBody().setVelocityX(0);
    this.y = this.groundY;
    this.action = "idle";
    this.play("char-idle", true);
  }

  stopHorizontal() {
    this.getBody().setVelocityX(0);
  }

  /** Returns true if the punch actually started (i.e. wasn't on cooldown). */
  punch(now: number): boolean {
    if (this.isDead) return false;
    if (this.isOnCooldown(this.attackTimer, COOLDOWNS.attackMs)) return false;

    this.action = "attack";
    this.attackTimer = now;
    this.getBody().setVelocityX(0);
    this.play("char-punch", true);
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.action === "attack") this.goIdle();
    });

    // punch_movement.gml: small forward lunge while attacking.
    const lunge = 60 * this.facing;
    this.scene.tweens.add({ targets: this, x: this.x + lunge, duration: 250, ease: "Sine.Out" });

    return true;
  }

  drinkPotion() {
    if (this.nbPotions <= 0 || this.isDead) return;
    this.nbPotions--;
    this.hp = this.maxHp;
  }

  buy(price: number): boolean {
    if (this.money < price) return false;
    this.money -= price;
    this.nbPotions++;
    return true;
  }

  takeDamage(amount: number, now: number) {
    if (this.isDead) return;
    if (this.isOnCooldown(this.takeHitTimer, COOLDOWNS.takeHitMs)) return;

    this.takeHitTimer = now;
    this.hp -= amount;

    // Set before playing the animation, same as punch()'s "attack": without
    // it, action is still "idle"/"run" (or an interrupted "attack") for the
    // rest of this frame, and the very next WorldScene.update() calls
    // goIdle() itself (nothing else is holding the hit state), swapping
    // char-hit back out before the player ever sees it.
    this.action = "hit";
    this.getBody().setVelocityX(0);
    this.play("char-hit", true);
    this.scene.cameras.main.shake(120, 0.004);
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.action === "hit" && !this.isDead) this.goIdle();
    });

    if (this.hp <= 0) {
      this.hp = 0;
      this.die();
    }
  }

  private die() {
    this.getBody().setVelocity(0, 0);
    this.action = "hit";
    this.onDeath();
  }

  private isOnCooldown(timer: number, cooldownMs: number): boolean {
    if (timer <= 0) return false;
    return this.scene.time.now - timer < cooldownMs;
  }
}
