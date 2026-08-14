import Phaser from "phaser";
import type { DialoguePage } from "../ui/DialogueBox";

/**
 * Ports objects/BaseNPC (quest icon, in_city visibility, collision range).
 */
export class NPC extends Phaser.Physics.Arcade.Sprite {
  readonly speakerName: string;
  protected questIcon?: Phaser.GameObjects.Image;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, speakerName: string) {
    super(scene, x, y, texture);
    this.speakerName = speakerName;

    scene.add.existing(this);
    scene.physics.add.existing(this, true);
    this.setOrigin(0.5, 1);
  }

  /** Override to add a floating "!" icon (objects/BaseNPC Draw_0: quest_availaible). */
  showQuestIcon(show: boolean) {
    if (show && !this.questIcon) {
      this.questIcon = this.scene.add.image(this.x + 40, this.y - this.displayHeight - 20, "ui-quest-available").setScale(0.5);
    }
    if (!show && this.questIcon) {
      this.questIcon.destroy();
      this.questIcon = undefined;
    }
  }

  /** Override in subclasses. Returning null means "nothing to say right now". */
  talk(): DialoguePage[] | null {
    return null;
  }

  /** Called after the dialogue box closes, with the chosen option index if any. */
  onDialogueClosed(_choice?: number) {
    // no-op by default
  }

  /** Per-frame hook for NPCs with extra state (e.g. Sorcerer's quest icon). */
  update() {
    // no-op by default
  }
}

/** A single-message NPC (objects/Guard, objects/Trainer). */
export class SimpleNPC extends NPC {
  private lines: string[];

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, speakerName: string, lines: string[]) {
    super(scene, x, y, texture, speakerName);
    this.lines = lines;
  }

  talk(): DialoguePage[] {
    return [{ speaker: this.speakerName, lines: this.lines }];
  }
}
