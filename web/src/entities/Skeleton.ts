import Phaser from "phaser";
import { SKELETON_GROUND_OFFSET, SKELETON_STATS } from "../constants";
import type { Player } from "./Player";

type SkeletonAction = "idle" | "walk" | "attack";

/**
 * Ports objects/Skeleton + objects/Ennemy (Create/Step/Collision) and the
 * ennemy_* scripts (stats, conditions, sprites, timers, loots).
 */
export class Skeleton extends Phaser.Physics.Arcade.Sprite {
  hp = SKELETON_STATS.maxHp;
  private player: Player;
  private inCombat = false;
  private action: SkeletonAction = "idle";
  private attackTimer = 0;
  private lastHitTime = 0;
  private facing: 1 | -1;
  private groundY: number;
  private onDeath: (skeleton: Skeleton) => void;

  constructor(scene: Phaser.Scene, x: number, y: number, facingLeft: boolean, player: Player, onDeath: (s: Skeleton) => void) {
    super(scene, x, y, "skel-idle-0");
    this.player = player;
    this.groundY = y;
    this.facing = facingLeft ? -1 : 1;
    this.onDeath = onDeath;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 1);
    this.getBody().setSize(140, 300).setOffset(130, 150);
    this.updateFlip();
    this.y = this.groundY + SKELETON_GROUND_OFFSET;
    this.play("skel-idle");
  }

  /**
   * scripts/move_toward_object's turn_toward_object(): `image_xscale` goes
   * *positive* (unflipped, its default) when facing left, negative
   * (flipped) when facing right — the mirror of the player's own
   * setFlipX(direction < 0) in Player.move() (character_actions.gml flips
   * *left*, i.e. the player's default art faces right instead). Using the
   * player's convention here flipped every skeleton to face away from
   * whatever it was actually turned toward.
   */
  private updateFlip() {
    this.setFlipX(this.facing > 0);
  }

  private getBody(): Phaser.Physics.Arcade.Body {
    return this.body as Phaser.Physics.Arcade.Body;
  }

  get isAttacking() {
    // Must also check isDead: a punch that kills this skeleton while its
    // action is still "attack" (takeDamage() disables the body but doesn't
    // touch action) would otherwise still read as attacking for the rest
    // of this same GraveyardScene.update() tick — overlapping() only
    // looks at sprite bounds, which stay valid until the death tween's
    // destroy() runs a beat later, so a defeated skeleton could land one
    // last hit on the player that killed it.
    return this.action === "attack" && !this.isDead;
  }

  get isDead() {
    return this.hp <= 0;
  }

  update(now: number) {
    if (this.isDead) return;

    const distance = Math.abs(this.player.x - this.x);
    this.inCombat = this.inCombat || distance <= SKELETON_STATS.aggroRange;

    if (!this.inCombat) {
      this.getBody().setVelocityX(0);
      return;
    }

    const inAttackRange = distance <= SKELETON_STATS.attackRange;
    const onAttackCooldown = this.attackTimer > 0 && now - this.attackTimer < SKELETON_STATS.attackCooldownMs;

    if (inAttackRange && !onAttackCooldown) {
      this.startAttack(now);
    } else if (!inAttackRange) {
      this.walkToward(this.player.x, SKELETON_STATS.walkSpeed);
    } else {
      this.getBody().setVelocityX(0);
    }
  }

  private walkToward(targetX: number, speed: number) {
    const padding = 100;
    const distance = Math.abs(targetX - this.x);
    this.facing = targetX < this.x ? -1 : 1;
    this.updateFlip();

    if (this.action !== "walk" && this.action !== "attack") {
      this.action = "walk";
      this.play("skel-walk", true);
    } else if (this.action === "walk") {
      this.play("skel-walk", true);
    }

    if (distance < padding) {
      this.getBody().setVelocityX(0);
    } else {
      this.getBody().setVelocityX(this.facing * speed);
    }
    this.y = this.groundY + SKELETON_GROUND_OFFSET;
  }

  private startAttack(now: number) {
    this.attackTimer = now;
    this.action = "attack";
    this.play("skel-attack", true);

    const attackSpeed = SKELETON_STATS.walkSpeed * 1.25;
    this.walkTowardOnce(this.player.x, attackSpeed);

    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.isDead) return;
      this.action = "idle";
      this.getBody().setVelocityX(0);
      this.play("skel-idle", true);
    });
  }

  private walkTowardOnce(targetX: number, speed: number) {
    const distance = Math.abs(targetX - this.x);
    this.facing = targetX < this.x ? -1 : 1;
    this.updateFlip();
    this.getBody().setVelocityX(distance < 100 ? 0 : this.facing * speed);
    this.y = this.groundY + SKELETON_GROUND_OFFSET;
  }

  takeDamage(amount: number, now: number) {
    if (this.isDead) return;
    if (this.lastHitTime > 0 && now - this.lastHitTime < SKELETON_STATS.hitInvincibilityMs) return;
    this.lastHitTime = now;
    this.hp -= amount;
    this.setTint(0xff8888);
    this.scene.time.delayedCall(100, () => this.clearTint());
    this.showDamageNumber(amount);

    if (this.hp <= 0) {
      this.hp = 0;
      this.player.money += SKELETON_STATS.money;
      this.player.experience += SKELETON_STATS.experience;
      this.getBody().setVelocity(0, 0);
      this.getBody().enable = false;
      this.scene.tweens.add({
        targets: this,
        alpha: 0,
        duration: 400,
        onComplete: () => {
          this.onDeath(this);
          this.destroy();
        },
      });
    }
  }

  /** Floating "-N" above the skeleton's head, ports scripts/get_damage_number's number (the original never drew it on-screen). */
  private showDamageNumber(amount: number) {
    const text = this.scene.add
      .text(this.x, this.y - this.displayHeight - 20, `-${amount}`, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "24px",
        color: "#ff4444",
        stroke: "#000000",
        strokeThickness: 4,
        fontStyle: "bold",
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.scene.tweens.add({
      targets: text,
      y: text.y - 40,
      alpha: 0,
      duration: 700,
      onComplete: () => text.destroy(),
    });
  }
}
