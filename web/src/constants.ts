/**
 * Gameplay constants ported 1:1 from the original GameMaker project
 * (_legacy/scripts/character_stats, ennemy_stats, cooldowns, ...).
 *
 * Coordinates below reuse the exact pixel positions from the original
 * rooms (see _legacy/rooms, one folder per room, each with a .yy file)
 * so the world layout matches the original game.
 */

export const GAME_WIDTH = 1920;
export const GAME_HEIGHT = 1080;

// character_stats.gml
export const PLAYER_STATS = {
  maxHp: 10,
  damageMin: 1,
  damageMax: 3,
  runSpeed: 600, // 10 px/frame * 60fps
};

// ennemy_stats.gml / Skeleton Create
export const SKELETON_STATS = {
  maxHp: 10,
  damageMin: 1,
  damageMax: 3,
  walkSpeed: 300, // 5 px/frame * 60fps
  aggroRange: 1000,
  attackRange: 300,
  // Halved (was 3000) — combat felt too slow.
  attackCooldownMs: 1500,
  money: 5,
  experience: 1,
  // How long a skeleton is immune to further damage after being hit, so a
  // single punch (char-punch: 6 frames @ 16fps = 375ms, see BootScene)
  // can't roll and connect twice while the player and skeleton stay
  // overlapped for the whole animation. Must stay comfortably under the
  // player's own attack cooldown (COOLDOWNS.attackMs) so two separate
  // punches still both land. Halved along with attackMs to preserve that
  // margin (was 500).
  hitInvincibilityMs: 250,
};

// cooldowns.gml
export const COOLDOWNS = {
  // Both halved (were 1000) — combat felt too slow.
  attackMs: 500,
  takeHitMs: 500,
  // How long the player's "attack"/"hit" action lasts before Player reverts
  // it to idle on its own — matches char-punch/char-hit's nominal animation
  // length (see BootScene), but is a plain deadline checked against the
  // real clock rather than the animation's own completion event. See the
  // comment on Player.updateTimedActions() for why that distinction matters.
  attackDurationMs: 375,
  hitStunMs: 250,
};

// How many px above the idle canvas's bottom edge the character's real feet
// sit (sprites/character_idle_sprite.yy custom yorigin: 427-256=171).
// Player draws with setOrigin(0.5, 1) (anchors the *canvas* bottom edge, not
// the feet, at y), so without this the character floats above groundY.
//
// This used to be a separate value per animation, taken from each
// animation's own sprite yorigin (run=127, attack=125, hit=135 — smaller
// than idle's 171, since those source frames are trimmed tighter). That
// made every idle<->run transition snap the character ~44px up/down —
// visible as a "hop" each time the player starts or stops moving — and
// running still looked too high relative to standing still. Using idle's
// offset everywhere removes the pop and grounds every state the same way.
export const PLAYER_GROUND_OFFSET = 171;

// city_grass_0.png has ~113px of transparent canvas below the visible grass
// blades (31% of its 361px height — the tufts are drawn well above the
// canvas's own bottom edge). Both rooms draw it with setOrigin(0.5, 1),
// which anchors that bottom edge (not the blade tips) at the tile's y, so
// without this the ground tile floats noticeably above every other
// ground-anchored decor piece at the 0.55 scale both rooms use. The base
// 62px closes that measured gap exactly; +30px is a further by-eye nudge
// (15% of the tile's own 199px display height) requested on top of that.
export const GRASS_TILE_GROUND_OFFSET = Math.round(113 * 0.55) + Math.round(0.15 * 361 * 0.55); // ≈ 62 + 30 = 92px

// Tree scale/position, tuned by eye across a couple of feedback rounds
// (bigger, lower) rather than derived from a single measurement like the
// offsets above. city_tree_0.png has 172px of transparent canvas below the
// visible tree (14% of its 1236px height); TREE_GROUND_OFFSET below closes
// 40% of that gap at each room's current tree scale.
export const TOWN_TREE_SCALE = 1.08;
export const TOWN_TREE_GROUND_OFFSET = Math.round(0.4 * 172 * TOWN_TREE_SCALE); // ≈ 74px
export const GRAVEYARD_TREE_SCALE = 1.26;
export const GRAVEYARD_TREE_GROUND_OFFSET = Math.round(0.4 * 172 * GRAVEYARD_TREE_SCALE); // ≈ 87px

// Same class of bug as PLAYER_GROUND_OFFSET, just never corrected at all:
// sprites/skeleton_*_sprite.yy's custom yorigin puts the real feet ~47% of
// the canvas height above its bottom edge (idle=482-254, walk=442-233,
// attack=417-224 — unlike the player's frames, these three agree closely,
// so one shared value doesn't pop between states). Skeleton draws with
// setOrigin(0.5, 1) and set `y = groundY` with no offset at all, so it
// floated by that ~228px in every state.
export const SKELETON_GROUND_OFFSET = 228;

export const POTION_PRICE = 5;

export const ROOM_KEYS = {
  mainMenu: "MainMenu",
  ville: "ville",
  graveyard: "Graveyard",
  gameOver: "GameOver",
} as const;

// rooms/ville/ville.yy
export const VILLE_ROOM = {
  width: 7000,
  height: 1080,
  // portal_sprite.yy (and opening_portal_sprite.yy) both have "origin": 0
  // (top-left, xorigin/yorigin 0,0) — same legacy convention as sorcier
  // above — width 247, height 415. Portal.ts draws with setOrigin(0.5, 1)
  // (bottom-center), so the raw legacy y (640) put it ~415px too high:
  // invisible while closed, so unnoticed until the opening animation
  // revealed it floating in the sky right after talking to the sorcerer.
  // Converted the same way: x' = x + width/2 = 32+123.5, y' = y + height = 640+415.
  // y then nudged up 17px (PORTAL_SCALE below doubled the portal's size —
  // 3% of its new 581px display height) as a further by-eye tweak on top
  // of that already-corrected baseline.
  portal: { x: 155.5, y: 1038 },
  // sprites/sorcier_sprite.yy has "origin": 0 (top-left, xorigin/yorigin 0,0)
  // unlike every other NPC sprite (marchand/guard/trainer all use a custom
  // near-bottom origin), so the room's raw x/y (288, 672) is the sprite's
  // top-left corner in the legacy renderer, not its bottom-center. Player.ts
  // and NPC.ts both draw with setOrigin(0.5, 1) (bottom-center), so reusing
  // the raw coordinate put the sorcerer ~380px too high, floating in the
  // sky. Converted here using sorcier_sprite's own size (214x381):
  //   x' = x + width/2  = 288 + 107 = 395
  //   y' = y + height   = 672 + 381 = 1053
  sorcier: { x: 395, y: 1053 },
  generalStore: { x: 4377.5, y: 917 },
  generalStoreDoor: { x: 4608, y: 672 },
  potion: { x: 5440, y: 768 },
  marchand: { x: 5216, y: 864 },
  bureau: { x: 4832, y: 768 },
  etageres: [
    { x: 4768, y: 512 },
    { x: 5184, y: 512 },
  ],
  magasinMur: { x: 3680, y: -320 },
  playerStart: { x: 2848, y: 928 },
};

// rooms/Graveyard/Graveyard.yy
export const GRAVEYARD_ROOM = {
  width: 12000,
  height: 1080,
  skeletons: [
    { x: 4896, y: 864, flip: true },
    { x: 553, y: 865, flip: false },
    { x: 667, y: 867, flip: false },
    { x: 431, y: 868, flip: false },
    { x: 3424, y: 864, flip: false },
    { x: 3298, y: 872, flip: false },
  ],
  // objects/Guard/Create_0.gml forces this exact position
  guard: { x: 9392, y: 704 },
};

// Portail Create_0.gml
export const PORTAL = {
  cityX: 32,
  graveyardX: 8160,
};

// 2x Portal.ts's old 0.7 scale — requested bigger, on top of the
// position fix above.
export const PORTAL_SCALE = 1.4;

// scripts/marchand_discussion_step_1
export const MARCHAND_LINES = [
  "Bienvenue dans ma boutique Jo Bine !",
  "Va chercher ce que tu as besoin.",
];

// objects/Necronomicon__quest/Create_0.gml
export const QUEST_TEXT = {
  salutation: "Salut Jo Bine !",
  intro: [
    "Le nécromancien a volé le nécronomicon dans notre bibliothèque.",
    "Ce livre contient des sorts extrêmement puissants.",
    "Es-tu prêt à aller affronter le voleur ?",
  ],
  answers: ["Je vais lui pêter la gueule !", "J'ai bien trop peur de ce mec !"],
  npcReplies: ["Parfait ! Je t'ouvre un portail.", "Fais pas ta chochotte pis va lui régler son compte !"],
  insult: "Tu es vraiment une couille molle...",
};

// objects/Guard/Create_0.gml
export const GUARD_LINES = ["Rendu hors de la ville,", "je ne peux plus rien", "pour toi."];

// objects/Trainer/Create_0.gml
export const TRAINER_LINES = ["Prêt à apprendre ?"];

// objects/GameOver
export const GAME_OVER_LINES = ["Vous avez perdu", "Appuyez pour réessayer"];

// objects/Instructions/Draw_64.gml
export const INSTRUCTIONS_LINES = [
  "Pour attaquer ou parler, touche le bouton d'action",
  "Pour boire une potion, touche le bouton potion",
  "Pour entrer dans un portail ou une porte, approche-toi et appuie sur Haut",
  "Quand tu es prêt, touche l'écran pour commencer",
];
