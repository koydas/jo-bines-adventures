import type Phaser from "phaser";
import { WorldScene } from "./WorldScene";
import { Merchant } from "../entities/Merchant";
import { Sorcerer } from "../entities/Sorcerer";
import { Potion } from "../entities/Potion";
import { Portal } from "../entities/Portal";
import { GameState } from "../state/GameState";
import {
  GAME_HEIGHT,
  GRASS_TILE_DENSITY,
  GRASS_TILE_GROUND_OFFSET,
  GRASS_TILE_SCALE,
  TOWN_TREE_GROUND_OFFSET,
  TOWN_TREE_SCALE,
  VILLE_ROOM,
} from "../constants";

/** Ports rooms/ville (town square, general store, portal to the graveyard). */
export class TownScene extends WorldScene {
  protected roomWidth = VILLE_ROOM.width;
  private shopFront!: Phaser.GameObjects.Image;
  private shopOpen = false;

  constructor() {
    super("Town");
  }

  protected playerStart() {
    if (GameState.enteredViaPortal) {
      GameState.enteredViaPortal = false;
      return { x: VILLE_ROOM.portal.x + 120, y: VILLE_ROOM.playerStart.y };
    }
    return VILLE_ROOM.playerStart;
  }

  protected buildRoom() {
    this.cameras.main.setBackgroundColor("#6fb7de");

    this.add.rectangle(this.roomWidth / 2, 980, this.roomWidth + 400, 220, 0x4a7a3c).setDepth(-5);

    // Ground tiling.
    const grassTile = this.textures.get("env-city-grass").getSourceImage() as HTMLImageElement;
    const tileWidth = grassTile.width * GRASS_TILE_SCALE;
    const step = tileWidth * GRASS_TILE_DENSITY;
    for (let x = -tileWidth; x < this.roomWidth + tileWidth; x += step) {
      // Depth -2: above the rocks/trees below (-3) — "par dessus les arbres".
      this.add.image(x, 900 + GRASS_TILE_GROUND_OFFSET, "env-city-grass").setScale(GRASS_TILE_SCALE).setOrigin(0.5, 1).setDepth(-2);
    }

    // A rock "pavé" (paved path) from the sorcerer to the general store's
    // door, per feedback — dense/overlapping like the grass tiling above,
    // rather than the sparse one-off rocks in decorSpots below. Anchored at
    // GAME_HEIGHT so it sits right at the very bottom of the screen.
    const rockTile = this.textures.get("env-city-rocks").getSourceImage() as HTMLImageElement;
    const rockScale = 0.6; // 2x, per feedback (rockStep below scales with it, so spacing stays proportional)
    const rockStep = rockTile.width * rockScale * 0.5;
    for (let x = VILLE_ROOM.sorcier.x; x <= VILLE_ROOM.generalStoreDoor.x; x += rockStep) {
      this.add.image(x, GAME_HEIGHT, "env-city-rocks").setScale(rockScale).setOrigin(0.5, 1).setDepth(-3);
    }

    // Scattered decoration (rocks / trees), thinned out from the original room data.
    const decorSpots = [280, 970, 2080, 2470, 3230, 3700, 4230, 4990, 5620, 6220];
    decorSpots.forEach((x, i) => {
      if (i % 2 === 0) {
        this.add.image(x, 900, "env-city-rocks").setScale(0.3).setOrigin(0.5, 1).setDepth(-3);
      } else {
        this.add
          .image(x, 900 + TOWN_TREE_GROUND_OFFSET, "env-city-tree")
          .setScale(TOWN_TREE_SCALE)
          .setOrigin(0.5, 1)
          .setDepth(-3);
      }
    });

    // General store building, sitting on the ground behind its counter/shelves.
    this.add.image(VILLE_ROOM.magasinMur.x, 900, "env-magasin-mur").setScale(0.32).setOrigin(0.5, 1).setDepth(-6);
    this.add.image(VILLE_ROOM.bureau.x, 900, "env-bureau").setScale(0.35).setOrigin(0.5, 1).setDepth(-1);
    VILLE_ROOM.etageres.forEach((e) => this.add.image(e.x, 900, "env-etagere").setScale(0.3).setOrigin(0.5, 1).setDepth(-1));

    // Storefront: ports objects/GeneralStore + GeneralStoreDoor +
    // enter_house.gml. In the legacy game this opaque facade (depth 300)
    // draws in FRONT of the counter/shelves/merchant (depth 400-500),
    // hiding them from outside; walking up to the door and pressing Up
    // toggles player_inside, which fades the facade to alpha 0.1 to reveal
    // the interior. That whole object/interaction was missing from the
    // port, so the counter/shelves/merchant just sat in the open street.
    // Sized explicitly (not scaled from the source PNG) to span the known
    // interior cluster (door 4608 .. potion 5440) rather than guess at the
    // legacy room's implicit camera scale.
    this.shopFront = this.add
      .image(5040, 920, "env-magasin")
      .setOrigin(0.5, 1)
      .setDisplaySize(1250, 1250 * (1743 / 2577))
      .setDepth(1);

    const shopDoor = this.add
      .sprite(VILLE_ROOM.generalStoreDoor.x, 900, "env-magasin-porte")
      .setScale(0.5)
      .setOrigin(0.5, 1)
      .setDepth(2);
    this.upInteractables.push({ target: shopDoor, action: () => this.toggleShop() });

    // NPCs.
    const merchant = new Merchant(this, VILLE_ROOM.marchand.x, VILLE_ROOM.marchand.y);
    const sorcerer = new Sorcerer(
      this,
      VILLE_ROOM.sorcier.x,
      VILLE_ROOM.sorcier.y,
      () => (GameState.portalOpening = true),
      () => GameState.portalOpened,
      () => GameState.sorcererPendingReply,
      (reply) => (GameState.sorcererPendingReply = reply),
    );
    this.npcs = [merchant, sorcerer];

    // Shop item.
    this.potion = new Potion(this, VILLE_ROOM.potion.x, VILLE_ROOM.potion.y);

    // Portal to the graveyard.
    this.portal = new Portal(this, VILLE_ROOM.portal.x, VILLE_ROOM.portal.y);
    this.onPortalEnter = () => {
      GameState.enteredViaPortal = true;
      this.scene.start("Graveyard");
    };
  }

  update(time: number, delta: number) {
    super.update(time, delta);
    this.portal?.update();
  }

  /** enter_house.gml's alpha toggle (1 outside, 0.1 once inside) — approach the door and press Up to open/close. */
  private toggleShop() {
    this.shopOpen = !this.shopOpen;
    this.shopFront.setAlpha(this.shopOpen ? 0.1 : 1);
  }
}
