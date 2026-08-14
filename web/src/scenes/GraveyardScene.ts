import { WorldScene } from "./WorldScene";
import { Skeleton } from "../entities/Skeleton";
import { SimpleNPC } from "../entities/NPC";
import { Portal } from "../entities/Portal";
import { GameState } from "../state/GameState";
import {
  GRASS_TILE_DENSITY,
  GRASS_TILE_GROUND_OFFSET,
  GRASS_TILE_SCALE,
  GRAVEYARD_ROOM,
  GRAVEYARD_TREE_GROUND_OFFSET,
  GRAVEYARD_TREE_SCALE,
  GUARD_LINES,
  PLAYER_STATS,
  PORTAL,
  SKELETON_STATS,
} from "../constants";
import { randomDamage } from "../utils/random";

/** Ports rooms/Graveyard (skeletons, the guard, the portal back to town). */
export class GraveyardScene extends WorldScene {
  protected roomWidth = GRAVEYARD_ROOM.width;
  private skeletons: Skeleton[] = [];

  constructor() {
    super("Graveyard");
  }

  protected playerStart() {
    GameState.enteredViaPortal = false;
    return { x: PORTAL.graveyardX + 100, y: 928 };
  }

  protected buildRoom() {
    this.cameras.main.setBackgroundColor("#241a2e");
    this.add.rectangle(this.roomWidth / 2, 980, this.roomWidth + 400, 220, 0x2c2036).setDepth(-5);

    const grassTile = this.textures.get("env-city-grass").getSourceImage() as HTMLImageElement;
    const tileWidth = grassTile.width * GRASS_TILE_SCALE;
    const step = tileWidth * GRASS_TILE_DENSITY;
    for (let x = -tileWidth; x < this.roomWidth + tileWidth; x += step) {
      // Depth -2: above the rocks/trees below (-3) — "par dessus les arbres" (see TownScene's identical fix).
      this.add
        .image(x, 880 + GRASS_TILE_GROUND_OFFSET, "env-city-grass")
        .setScale(GRASS_TILE_SCALE)
        .setOrigin(0.5, 1)
        .setTint(0x8f9bc9)
        .setDepth(-2);
    }

    const decorSpots = [700, 1600, 2500, 4000, 5200, 6300, 7400, 8500, 9600, 10500, 11400];
    decorSpots.forEach((x, i) => {
      if (i % 3 === 1) {
        this.add
          .image(x, 880 + GRAVEYARD_TREE_GROUND_OFFSET, "env-city-tree")
          .setScale(GRAVEYARD_TREE_SCALE)
          .setOrigin(0.5, 1)
          .setDepth(-3);
      } else {
        const key = i % 3 === 0 ? "env-tomb1" : "env-dead-flower";
        this.add.image(x, 880, key).setScale(0.35).setOrigin(0.5, 1).setDepth(-3);
      }
    });

    this.add.image(GRAVEYARD_ROOM.width - 400, 850, "env-crypt-entrance").setScale(0.5).setOrigin(0.5, 1);

    // Guard blocks the far edge of the graveyard.
    const guard = new SimpleNPC(this, GRAVEYARD_ROOM.guard.x, GRAVEYARD_ROOM.guard.y, "npc-guard", "Le Garde", GUARD_LINES);
    this.npcs = [guard];

    // Skeletons.
    this.skeletons = GRAVEYARD_ROOM.skeletons.map(
      (s) => new Skeleton(this, s.x, s.y, s.flip, this.player, (dead) => this.removeSkeleton(dead)),
    );

    // Portal back to town. y matches VILLE_ROOM.portal's — same sprite, same
    // top-left-origin correction (see the comment there).
    this.portal = new Portal(this, PORTAL.graveyardX, 1038);
    this.onPortalEnter = () => {
      GameState.enteredViaPortal = true;
      this.scene.start("Town");
    };
  }

  private removeSkeleton(skeleton: Skeleton) {
    this.skeletons = this.skeletons.filter((s) => s !== skeleton);
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.portal?.update();

    this.skeletons.forEach((skeleton) => {
      skeleton.update(time);

      if (this.player.isAttacking && this.overlapping(skeleton)) {
        skeleton.takeDamage(randomDamage(PLAYER_STATS.damageMin, PLAYER_STATS.damageMax), time);
      }

      if (skeleton.isAttacking && this.overlapping(skeleton)) {
        this.player.takeDamage(randomDamage(SKELETON_STATS.damageMin, SKELETON_STATS.damageMax), time);
      }
    });
  }
}
