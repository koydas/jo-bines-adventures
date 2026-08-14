import Phaser from "phaser";
import { Player } from "../entities/Player";
import { NPC } from "../entities/NPC";
import { Potion } from "../entities/Potion";
import { Portal } from "../entities/Portal";
import { Hud } from "../ui/Hud";
import { DialogueBox } from "../ui/DialogueBox";
import { InputManager } from "../systems/InputManager";
import { getTouchControls } from "../systems/touchControlsInstance";
import { GameState } from "../state/GameState";

/**
 * Shared scaffolding for the two playable rooms (ville / Graveyard), both
 * of which port objects/Character's Step event (movement, controls,
 * respawn-on-room-load) plus the shared interaction rules from
 * character_controls_rules.gml.
 */
export abstract class WorldScene extends Phaser.Scene {
  protected player!: Player;
  protected hud!: Hud;
  protected dialogue!: DialogueBox;
  protected inputManager!: InputManager;
  protected npcs: NPC[] = [];
  protected potion?: Potion;
  protected portal?: Portal;

  protected abstract roomWidth: number;
  protected abstract playerStart(): { x: number; y: number };

  /** Build environment, NPCs, enemies, portal, ... */
  protected abstract buildRoom(): void;

  protected onPortalEnter?: () => void;

  create() {
    this.physics.world.setBounds(0, 0, this.roomWidth, this.scale.height);
    this.cameras.main.setBounds(0, 0, this.roomWidth, this.scale.height);

    const start = this.playerStart();
    this.player = new Player(this, start.x, start.y, () => this.onPlayerDeath());
    this.player.hp = GameState.hp;
    this.player.maxHp = GameState.maxHp;
    this.player.money = GameState.money;
    this.player.experience = GameState.experience;
    this.player.nbPotions = GameState.nbPotions;

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
    this.cameras.main.setDeadzone(220, this.scale.height);

    this.hud = new Hud(this, this.player);
    this.dialogue = new DialogueBox(this);
    this.inputManager = new InputManager(this);

    this.buildRoom();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.syncStateOut());
  }

  update(time: number, _delta: number) {
    this.player.setDepth(10);

    const state = this.inputManager.read();

    if (this.dialogue.visible) {
      if (state.left) this.dialogue.moveChoice(-1);
      if (state.right) this.dialogue.moveChoice(1);
      if (state.actionPressed) this.dialogue.confirm();
      this.player.stopHorizontal();
      return;
    }

    if (!this.player.isDead) {
      if (state.left) this.player.moveLeft();
      else if (state.right) this.player.moveRight();
      else if (this.player.action !== "attack" && this.player.action !== "hit") this.player.goIdle();

      if (state.actionPressed) this.handleAction(time);
      if (state.itemPressed) this.player.drinkPotion();
      if (state.upPressed) this.handleUp();
    }

    this.npcs.forEach((npc) => npc.update());

    this.updateContextHint();
    this.hud.update();
  }

  private handleAction(now: number) {
    const npc = this.npcs.find((n) => this.overlapping(n));
    if (npc) {
      const pages = npc.talk();
      if (pages) {
        this.dialogue.show(pages, (choice) => npc.onDialogueClosed(choice));
        return;
      }
    }

    if (this.potion && this.overlapping(this.potion)) {
      if (this.player.buy(this.potion.price)) {
        this.flashMessage("Potion achetée !");
      } else {
        this.flashMessage("Pas assez d'argent...");
      }
      return;
    }

    this.player.punch(now);
  }

  private handleUp() {
    if (this.portal && this.overlapping(this.portal) && GameState.portalOpened) {
      this.onPortalEnter?.();
    }
  }

  private updateContextHint() {
    const tc = getTouchControls();
    if (!tc) return;
    const nearNpc = this.npcs.some((n) => this.overlapping(n) && n.talk() !== null);
    const nearPotion = !!this.potion && this.overlapping(this.potion);
    const nearPortal = !!this.portal && GameState.portalOpened && this.overlapping(this.portal);
    tc.setContextVisible(!this.dialogue.visible && (nearNpc || nearPotion || nearPortal));
  }

  protected overlapping(target: Phaser.GameObjects.Sprite): boolean {
    const a = this.player.getBounds();
    const b = target.getBounds();
    // Slightly generous so mobile touch play doesn't need pixel-perfect positioning.
    a.width += 60;
    a.x -= 30;
    return Phaser.Geom.Intersects.RectangleToRectangle(a, b);
  }

  private flashMessage(text: string) {
    const t = this.add
      .text(this.player.x, this.player.y - this.player.displayHeight - 40, text, {
        fontFamily: "system-ui, sans-serif",
        fontSize: "22px",
        color: "#ffd479",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5);
    this.tweens.add({ targets: t, y: t.y - 40, alpha: 0, duration: 900, onComplete: () => t.destroy() });
  }

  private onPlayerDeath() {
    this.syncStateOut();
    this.time.delayedCall(600, () => this.scene.start("GameOver"));
  }

  private syncStateOut() {
    GameState.hp = this.player.hp;
    GameState.maxHp = this.player.maxHp;
    GameState.money = this.player.money;
    GameState.experience = this.player.experience;
    GameState.nbPotions = this.player.nbPotions;
  }
}
