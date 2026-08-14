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

  /** Room-specific "approach + press Up" interactions besides the portal (e.g. TownScene's shop door). */
  protected upInteractables: Array<{ target: Phaser.GameObjects.Sprite; action: () => void }> = [];

  create() {
    this.physics.world.setBounds(0, 0, this.roomWidth, this.scale.height);
    // The player is the only body with collideWorldBounds on, and it never
    // moves vertically (no jump/gravity — see main.ts's gravity: {x:0,y:0}):
    // y is fully owned by Player's groundY+offset assignments.
    // PLAYER_GROUND_OFFSET pushes the body's bottom edge past the world's
    // bottom bound (GAME_HEIGHT), so with vertical bounds-checking left on,
    // Arcade clamped the body back up every physics step right after
    // Player's own code had just set it back down — a tug-of-war that
    // showed up as the idle "hop" and a sudden pop when starting to run.
    // (Body#checkCollision.up/down governs body-vs-body separation, not
    // world bounds — this is the actual switch for that, World#checkCollision.)
    this.physics.world.setBoundsCollision(true, true, false, false);
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
    getTouchControls()?.setSceneActive(true);

    this.buildRoom();

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.syncStateOut());
  }

  update(time: number, _delta: number) {
    this.player.setDepth(10);
    // Must run before the movement/action gating below: this is what
    // actually clears "attack"/"hit" once their fixed duration is up (see
    // Player.updateTimedAction() for why that's time-based rather than
    // tied to the punch/hit animation completing).
    this.player.updateTimedAction(time);

    const state = this.inputManager.read();

    if (this.dialogue.visible) {
      // Edge-triggered (leftPressed/rightPressed), not the continuous
      // left/right used for movement below: a quick D-pad tap's
      // touchstart+touchend can both land within a single frame gap, which
      // the continuous booleans can miss seeing entirely — see
      // touchState.leftQueued/rightQueued.
      if (state.leftPressed) this.dialogue.moveChoice(-1);
      if (state.rightPressed) this.dialogue.moveChoice(1);
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

  /**
   * Picks the *nearest* overlapping interaction rather than always
   * preferring NPCs: with the padded overlap zone (see `overlapping()`),
   * a player near the Potion stand can also be within range of a nearby
   * NPC (e.g. the Merchant, `VILLE_ROOM.marchand` vs `.potion`), and a
   * fixed NPCs-first order would swallow the buy action even when the
   * potion is clearly what the player walked up to. Each candidate's
   * trigger runs in distance order and only "claims" the button press if
   * it actually did something — an NPC with nothing to say (`talk()`
   * returning null) falls through to the next-nearest candidate instead
   * of eating the press.
   */
  private handleAction(now: number) {
    type Candidate = { distance: number; trigger: () => boolean };
    const candidates: Candidate[] = [];

    for (const npc of this.npcs) {
      if (!this.overlapping(npc)) continue;
      candidates.push({
        distance: this.distanceTo(npc),
        trigger: () => {
          const pages = npc.talk();
          if (!pages) return false;
          this.dialogue.show(pages, (choice) => npc.onDialogueClosed(choice));
          return true;
        },
      });
    }

    if (this.potion && this.overlapping(this.potion)) {
      const potion = this.potion;
      candidates.push({
        distance: this.distanceTo(potion),
        trigger: () => {
          if (this.player.buy(potion.price)) {
            this.flashMessage("Potion achetée !");
          } else {
            this.flashMessage("Pas assez d'argent...");
          }
          return true;
        },
      });
    }

    candidates.sort((a, b) => a.distance - b.distance);
    for (const candidate of candidates) {
      if (candidate.trigger()) return;
    }

    this.player.punch(now);
  }

  private distanceTo(target: Phaser.GameObjects.Sprite): number {
    return Math.abs(target.x - this.player.x);
  }

  private handleUp() {
    if (this.portal && this.overlapping(this.portal) && GameState.portalOpened) {
      this.onPortalEnter?.();
      return;
    }
    for (const { target, action } of this.upInteractables) {
      if (this.overlapping(target)) {
        action();
        return;
      }
    }
  }

  /**
   * Shows the contextual ▲ button for anything `handleUp()` actually acts
   * on: an open portal (see docs/adr/0004), or a registered upInteractable
   * (e.g. TownScene's shop door). Talking to an NPC or buying a potion goes
   * through the always-visible ⚔️ action button instead, so this hint
   * must not light up for those: they'd invite a tap that does nothing.
   *
   * This also has to avoid `npc.talk()` for the check — unlike a plain
   * boolean, `talk()` can have side effects (the Sorcerer clears its
   * pending follow-up message the moment it's called), so calling it
   * every frame just to peek at whether it returns non-null would
   * silently consume that state before the player ever presses anything.
   */
  private updateContextHint() {
    const tc = getTouchControls();
    if (!tc) return;
    const nearPortal = !!this.portal && GameState.portalOpened && this.overlapping(this.portal);
    const nearUpInteractable = this.upInteractables.some(({ target }) => this.overlapping(target));
    tc.setContextVisible(!this.dialogue.visible && (nearPortal || nearUpInteractable));
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
