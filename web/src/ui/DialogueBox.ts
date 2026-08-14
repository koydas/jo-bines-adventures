import Phaser from "phaser";

export interface DialoguePage {
  speaker?: string;
  lines: string[];
  choices?: string[];
}

/**
 * A bottom-anchored dialogue box, modernized replacement for the original
 * per-NPC speech-bubble drawing (marchand_discussion_step_1,
 * sorcier_discussion_step_1/2/3, ...). Pages advance on the action button;
 * choice pages move the cursor with left/right (or up/down) and confirm
 * with the action button, same control feel as the original
 * (up/down changed current_discussion_choice).
 */
export class DialogueBox {
  private scene: Phaser.Scene;
  private container: Phaser.GameObjects.Container;
  private bg: Phaser.GameObjects.Rectangle;
  private speakerText: Phaser.GameObjects.Text;
  private bodyText: Phaser.GameObjects.Text;
  private choiceTexts: Phaser.GameObjects.Text[] = [];
  private hintText: Phaser.GameObjects.Text;

  private pages: DialoguePage[] = [];
  private pageIndex = 0;
  private choiceIndex = 0;
  private onFinish: ((choice?: number) => void) | null = null;

  visible = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    const width = scene.scale.width;
    const height = scene.scale.height;

    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(1000).setVisible(false);

    this.bg = scene.add
      .rectangle(width / 2, height - 130, width - 80, 200, 0x14101f, 0.88)
      .setStrokeStyle(3, 0xffffff, 0.5);

    this.speakerText = scene.add.text(70, height - 210, "", {
      fontFamily: "Georgia, serif",
      fontSize: "26px",
      color: "#ffd479",
      fontStyle: "bold",
    });

    this.bodyText = scene.add.text(70, height - 175, "", {
      fontFamily: "system-ui, sans-serif",
      fontSize: "26px",
      color: "#ffffff",
      wordWrap: { width: width - 160 },
      lineSpacing: 8,
    });

    this.hintText = scene.add
      .text(width - 70, height - 45, "▶ toucher pour continuer", {
        fontFamily: "system-ui, sans-serif",
        fontSize: "16px",
        color: "#aaaaaa",
      })
      .setOrigin(1, 0.5);

    this.container.add([this.bg, this.speakerText, this.bodyText, this.hintText]);
  }

  /** Read-only snapshot of what's currently on screen — used by the smoke
   * tests (tests/smoke.spec.ts) to assert on dialogue content, since it's
   * drawn to canvas and isn't otherwise inspectable from the DOM. */
  currentPage(): DialoguePage | null {
    return this.visible ? this.pages[this.pageIndex] : null;
  }

  private clearChoices() {
    this.choiceTexts.forEach((t) => t.destroy());
    this.choiceTexts = [];
  }

  show(pages: DialoguePage[], onFinish?: (choice?: number) => void) {
    this.pages = pages;
    this.pageIndex = 0;
    this.choiceIndex = 0;
    this.onFinish = onFinish ?? null;
    this.visible = true;
    this.container.setVisible(true);
    this.renderPage();
  }

  hide() {
    this.visible = false;
    this.container.setVisible(false);
    this.clearChoices();
  }

  private renderPage() {
    const page = this.pages[this.pageIndex];
    this.speakerText.setText(page.speaker ?? "");
    this.bodyText.setText(page.lines.join("\n"));
    this.clearChoices();

    if (page.choices) {
      this.hintText.setText("▶ toucher pour choisir");
      const startY = this.scene.scale.height - 100;
      page.choices.forEach((choice, i) => {
        const t = this.scene.add.text(90, startY + i * 34, `${i === this.choiceIndex ? "➤ " : "   "}${choice}`, {
          fontFamily: "system-ui, sans-serif",
          fontSize: "22px",
          color: i === this.choiceIndex ? "#ffd479" : "#dddddd",
        });
        this.choiceTexts.push(t);
        this.container.add(t);
      });
    } else {
      this.hintText.setText(this.pageIndex < this.pages.length - 1 ? "▶ toucher pour continuer" : "▶ toucher pour fermer");
    }
  }

  moveChoice(direction: -1 | 1) {
    const page = this.pages[this.pageIndex];
    if (!page.choices) return;
    this.choiceIndex = Phaser.Math.Clamp(this.choiceIndex + direction, 0, page.choices.length - 1);
    this.renderPage();
  }

  /** Advance to the next page, confirm a choice, or close the box. */
  confirm() {
    const page = this.pages[this.pageIndex];
    if (page.choices) {
      const chosen = this.choiceIndex;
      this.hide();
      this.onFinish?.(chosen);
      return;
    }

    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex++;
      this.renderPage();
    } else {
      this.hide();
      this.onFinish?.();
    }
  }
}
