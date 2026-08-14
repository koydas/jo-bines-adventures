import type Phaser from "phaser";
import { MARCHAND_LINES } from "../constants";
import { NPC } from "./NPC";
import type { DialoguePage } from "../ui/DialogueBox";

/** Ports objects/Marchand (marchand_discussion_step_1.gml). */
export class Merchant extends NPC {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, "npc-marchand", "Le Marchand");
  }

  talk(): DialoguePage[] {
    return [{ speaker: this.speakerName, lines: MARCHAND_LINES }];
  }
}
