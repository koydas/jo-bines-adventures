/**
 * Gameplay constants ported 1:1 from the original GameMaker project
 * (platformer/scripts/character_stats, ennemy_stats, cooldowns, ...).
 *
 * Coordinates below reuse the exact pixel positions from the original
 * rooms (see platformer/rooms, one folder per room, each with a .yy file)
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
  attackCooldownMs: 3000,
  money: 5,
  experience: 1,
};

// cooldowns.gml
export const COOLDOWNS = {
  attackMs: 1000,
  takeHitMs: 1000,
  invisibilityMs: 250,
};

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
  portal: { x: 32, y: 640 },
  sorcier: { x: 288, y: 672 },
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
  "Pour entrer dans un portail ou une porte, avance dedans",
  "Quand tu es prêt, touche l'écran pour commencer",
];
