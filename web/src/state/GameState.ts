import { PLAYER_STATS } from "../constants";

/**
 * Cross-scene persistent state, standing in for GameMaker's `persistent`
 * flag (used on objects/Character and objects/Portail) and its `global.*`
 * variables, since Phaser scenes are recreated on each transition.
 */
class GameStateStore {
  hp = PLAYER_STATS.maxHp;
  maxHp = PLAYER_STATS.maxHp;
  money = 0;
  experience = 0;
  nbPotions = 0;

  portalOpened = false;
  portalOpening = false;

  /** Set right before a scene transition through the portal (enter_portal.gml). */
  enteredViaPortal = false;

  /**
   * The Sorcerer's follow-up reply the player hasn't heard yet (see
   * Sorcerer.ts). Lives here rather than on the Sorcerer entity itself:
   * TownScene builds a fresh Sorcerer instance every time the player
   * returns from the Graveyard, so a field on the entity is lost the
   * moment the player walks through the portal without talking to it
   * again first — this survives that round trip.
   */
  sorcererPendingReply: "accept" | "insult" | null = null;

  reset() {
    this.hp = PLAYER_STATS.maxHp;
    this.maxHp = PLAYER_STATS.maxHp;
    this.money = 0;
    this.experience = 0;
    this.nbPotions = 0;
    this.portalOpened = false;
    this.portalOpening = false;
    this.enteredViaPortal = false;
    this.sorcererPendingReply = null;
  }
}

export const GameState = new GameStateStore();
