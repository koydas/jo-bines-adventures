import { WorldScene } from "./WorldScene";
import { Merchant } from "../entities/Merchant";
import { Sorcerer } from "../entities/Sorcerer";
import { Potion } from "../entities/Potion";
import { Portal } from "../entities/Portal";
import { GameState } from "../state/GameState";
import { VILLE_ROOM } from "../constants";

/** Ports rooms/ville (town square, general store, portal to the graveyard). */
export class TownScene extends WorldScene {
  protected roomWidth = VILLE_ROOM.width;

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
    const tileWidth = grassTile.width * 0.55;
    for (let x = -tileWidth; x < this.roomWidth + tileWidth; x += tileWidth) {
      this.add.image(x, 900, "env-city-grass").setScale(0.55).setOrigin(0.5, 1).setDepth(-4);
    }

    // Scattered decoration (rocks / trees), thinned out from the original room data.
    const decorSpots = [280, 970, 2080, 2470, 3230, 3700, 4230, 4990, 5620, 6220];
    decorSpots.forEach((x, i) => {
      const key = i % 2 === 0 ? "env-city-rocks" : "env-city-tree";
      this.add.image(x, 900, key).setScale(0.3).setOrigin(0.5, 1).setDepth(-3);
    });

    // General store building, sitting on the ground behind its counter/shelves.
    this.add.image(VILLE_ROOM.magasinMur.x, 900, "env-magasin-mur").setScale(0.32).setOrigin(0.5, 1).setDepth(-6);
    this.add.image(VILLE_ROOM.bureau.x, 900, "env-bureau").setScale(0.35).setOrigin(0.5, 1).setDepth(-1);
    VILLE_ROOM.etageres.forEach((e) => this.add.image(e.x, 900, "env-etagere").setScale(0.3).setOrigin(0.5, 1).setDepth(-1));
    this.add.image(VILLE_ROOM.generalStoreDoor.x, 900, "env-magasin-porte").setScale(0.5).setOrigin(0.5, 1).setDepth(-1);

    // NPCs.
    const merchant = new Merchant(this, VILLE_ROOM.marchand.x, VILLE_ROOM.marchand.y);
    const sorcerer = new Sorcerer(
      this,
      VILLE_ROOM.sorcier.x,
      VILLE_ROOM.sorcier.y,
      () => (GameState.portalOpening = true),
      () => GameState.portalOpened,
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
}
