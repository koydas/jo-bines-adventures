import Phaser from "phaser";

/** Frame counts per animated sprite, matching the extracted asset sequences. */
const ANIM_FRAMES: Record<string, number> = {
  "char-idle": 1,
  "char-run": 3,
  "char-punch": 6,
  "char-hit": 1,
  "skel-idle": 1,
  "skel-walk": 4,
  "skel-attack": 3,
  "ui-opening-portal": 4,
};

const STATIC_IMAGES: Record<string, string> = {
  "npc-marchand": "npc/marchand_0.png",
  "npc-sorcier": "npc/sorcier_0.png",
  "npc-guard": "npc/guard_0.png",
  "npc-trainer": "npc/trainer_0.png",
  "npc-necromancer": "npc/necromancer_0.png",

  "env-city-grass": "env/city_grass_0.png",
  "env-city-rocks": "env/city_rocks_0.png",
  "env-city-rocks-bg": "env/city_rocks_bg_0.png",
  "env-city-tree": "env/city_tree_0.png",
  "env-tuiles": "env/tuiles_0.png",
  "env-magasin-mur": "env/magasin_general_mur_0.png",
  "env-magasin-porte": "env/magasin_general_porte_0.png",
  "env-magasin": "env/magasin_general_0.png",
  "env-bureau": "env/bureau_0.png",
  "env-etagere": "env/etagere_0.png",
  "env-dead-flower": "env/dead_flower_0.png",
  "env-tomb1": "env/tomb1_0.png",
  "env-crypt-entrance": "env/crypt_entrance_0.png",
  "env-closed-gate": "env/closed_gate_0.png",
  "env-open-gate": "env/open_gate_0.png",
  "env-sign": "env/sign_0.png",
  "env-grass": "env/grass_0.png",

  "ui-potion": "ui/potion_0.png",
  "ui-healthbar-bg": "ui/healthbar_bg_0.png",
  "ui-healthbar-fill": "ui/healthbar_fill_0.png",
  "ui-price-tag": "ui/price_tag_0.png",
  "ui-small-bubble": "ui/small_bubble_0.png",
  "ui-medium-bubble": "ui/medium_bubble_0.png",
  "ui-large-bubble": "ui/large_bubble_0.png",
  "ui-discussion-choice": "ui/discussion_choice_0.png",
  "ui-quest-available": "ui/quest_available_0.png",
  "ui-buy-background": "ui/buy_background_0.png",
  "ui-selected": "ui/selected_0.png",
  "ui-portal": "ui/portal_0.png",
};

const ANIM_ASSET_PATH: Record<string, string> = {
  "char-idle": "character/idle/idle",
  "char-run": "character/run/run",
  "char-punch": "character/punch/punch",
  "char-hit": "character/hit/hit",
  "skel-idle": "skeleton/idle/idle",
  "skel-walk": "skeleton/walk/walk",
  "skel-attack": "skeleton/attack/attack",
  "ui-opening-portal": "ui/opening_portal",
};

export class BootScene extends Phaser.Scene {
  constructor() {
    super("Boot");
  }

  preload() {
    this.add
      .text(GAME_CENTER_X(this), GAME_CENTER_Y(this), "Chargement...", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "32px",
        color: "#ffffff",
      })
      .setOrigin(0.5);

    for (const [key, frames] of Object.entries(ANIM_FRAMES)) {
      const base = ANIM_ASSET_PATH[key];
      for (let i = 0; i < frames; i++) {
        this.load.image(`${key}-${i}`, `/assets/${base}_${i}.png`);
      }
    }

    for (const [key, path] of Object.entries(STATIC_IMAGES)) {
      this.load.image(key, `/assets/${path}`);
    }
  }

  create() {
    this.createAnim("char-idle", "char-idle", 1, 4, -1);
    this.createAnim("char-run", "char-run", 3, 12, -1);
    this.createAnim("char-punch", "char-punch", 6, 16, 0);
    this.createAnim("char-hit", "char-hit", 1, 4, 0);

    this.createAnim("skel-idle", "skel-idle", 1, 4, -1);
    this.createAnim("skel-walk", "skel-walk", 4, 10, -1);
    this.createAnim("skel-attack", "skel-attack", 3, 8, 0);

    this.createAnim("ui-opening-portal", "ui-opening-portal", 4, 8, 0);

    this.scene.start("MainMenu");
  }

  private createAnim(key: string, texturePrefix: string, frameCount: number, frameRate: number, repeat: number) {
    const frames = Array.from({ length: frameCount }, (_, i) => ({ key: `${texturePrefix}-${i}` }));
    this.anims.create({ key, frames, frameRate, repeat });
  }
}

function GAME_CENTER_X(scene: Phaser.Scene) {
  return scene.scale.width / 2;
}
function GAME_CENTER_Y(scene: Phaser.Scene) {
  return scene.scale.height / 2;
}
