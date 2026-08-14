import type Phaser from "phaser";
import { QUEST_TEXT } from "../constants";
import { NPC } from "./NPC";
import type { DialoguePage } from "../ui/DialogueBox";

/**
 * Ports objects/Sorcier + objects/Necronomicon__quest + open_portal.gml /
 * sorcier_insults.gml. The quest dialogue tree:
 *   1. intro (salutation + quest text)
 *   2. choice: accept / refuse
 *   3a. accept -> opens the portal to the graveyard
 *   3b. refuse -> an insult, portal stays closed, can talk again later
 */
export class Sorcerer extends NPC {
  private questAccepted = false;
  private openPortal: () => void;
  private isPortalOpen: () => boolean;
  private pendingInsult = false;
  private pendingAcceptMessage = false;

  constructor(scene: Phaser.Scene, x: number, y: number, openPortal: () => void, isPortalOpen: () => boolean) {
    super(scene, x, y, "npc-sorcier", "Le Sorcier");
    this.openPortal = openPortal;
    this.isPortalOpen = isPortalOpen;
  }

  update() {
    this.showQuestIcon(!this.questAccepted && !this.isPortalOpen());
  }

  talk(): DialoguePage[] | null {
    if (this.isPortalOpen()) return null;

    if (this.pendingInsult) {
      this.pendingInsult = false;
      return [{ speaker: this.speakerName, lines: [QUEST_TEXT.insult] }];
    }

    if (this.pendingAcceptMessage) {
      this.pendingAcceptMessage = false;
      return [{ speaker: this.speakerName, lines: [QUEST_TEXT.npcReplies[0]] }];
    }

    return [
      { speaker: this.speakerName, lines: [QUEST_TEXT.salutation, ...QUEST_TEXT.intro] },
      { speaker: this.speakerName, lines: [], choices: QUEST_TEXT.answers },
    ];
  }

  onDialogueClosed(choice?: number) {
    if (choice === undefined) return;

    if (choice === 0) {
      this.questAccepted = true;
      this.pendingAcceptMessage = true;
      this.openPortal();
    } else {
      this.pendingInsult = true;
    }
  }
}
