import Phaser from "phaser";
import { touchState } from "./touchState";

/**
 * Unifies keyboard, on-screen touch controls and gamepad into a single
 * frame-by-frame input state, mirroring the control scheme from
 * _legacy/scripts/character_controls_rules/character_controls_rules.gml:
 *
 *  - left/right: move
 *  - action (ctrl in the original): attack / talk / buy / confirm
 *  - item (shift in the original): drink potion
 *  - up: enter a portal / door
 */
export interface InputState {
  left: boolean;
  right: boolean;
  /** Edge-triggered: true for exactly one read after the press. */
  actionPressed: boolean;
  itemPressed: boolean;
  upPressed: boolean;
}

export class InputManager {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyCtrl!: Phaser.Input.Keyboard.Key;
  private keyShift!: Phaser.Input.Keyboard.Key;
  private keySpace!: Phaser.Input.Keyboard.Key;

  // Gamepad buttons are level-triggered (pad.A stays true for every read()
  // while held), unlike the keyboard (JustDown) and touch (queued-flag)
  // paths. Track the previous frame's state so we can derive the same
  // "true for exactly one read" edge ourselves.
  private wasPadAction = false;
  private wasPadItem = false;
  private wasPadUp = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    const kb = scene.input.keyboard;
    if (kb) {
      this.cursors = kb.createCursorKeys();
      this.keyA = kb.addKey("A");
      this.keyD = kb.addKey("D");
      this.keyW = kb.addKey("W");
      this.keyCtrl = kb.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL);
      this.keyShift = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
      this.keySpace = kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }
  }

  private gamepad(): Phaser.Input.Gamepad.Gamepad | null {
    return this.scene.input.gamepad?.getPad(0) ?? null;
  }

  read(): InputState {
    const pad = this.gamepad();
    const padLeft = !!pad && (pad.axes[0]?.getValue() < -0.5 || pad.left);
    const padRight = !!pad && (pad.axes[0]?.getValue() > 0.5 || pad.right);
    const padAction = !!pad && (pad.A || pad.X);
    const padItem = !!pad && pad.B;
    const padUp = !!pad && (pad.up || (pad.axes[1]?.getValue() ?? 0) < -0.5);

    const left = !!this.cursors?.left.isDown || !!this.keyA?.isDown || padLeft || touchState.left;
    const right = !!this.cursors?.right.isDown || !!this.keyD?.isDown || padRight || touchState.right;

    // Rising edge only — see the wasPad* comment above.
    const padActionPressed = padAction && !this.wasPadAction;
    const padItemPressed = padItem && !this.wasPadItem;
    const padUpPressed = padUp && !this.wasPadUp;
    this.wasPadAction = padAction;
    this.wasPadItem = padItem;
    this.wasPadUp = padUp;

    const actionPressed =
      (!!this.keyCtrl && Phaser.Input.Keyboard.JustDown(this.keyCtrl)) ||
      (!!this.keySpace && Phaser.Input.Keyboard.JustDown(this.keySpace)) ||
      padActionPressed ||
      this.consume("actionQueued");

    const itemPressed =
      (!!this.keyShift && Phaser.Input.Keyboard.JustDown(this.keyShift)) || padItemPressed || this.consume("itemQueued");

    const upPressed =
      (!!this.cursors?.up && Phaser.Input.Keyboard.JustDown(this.cursors.up)) ||
      (!!this.keyW && Phaser.Input.Keyboard.JustDown(this.keyW)) ||
      padUpPressed ||
      this.consume("upQueued");

    return { left, right, actionPressed, itemPressed, upPressed };
  }

  private consume(flag: "actionQueued" | "itemQueued" | "upQueued"): boolean {
    const value = touchState[flag];
    touchState[flag] = false;
    return value;
  }
}
