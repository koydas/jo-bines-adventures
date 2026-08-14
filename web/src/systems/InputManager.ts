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
  leftPressed: boolean;
  rightPressed: boolean;
  actionPressed: boolean;
  itemPressed: boolean;
  upPressed: boolean;
}

interface PadState {
  left: boolean;
  right: boolean;
  action: boolean;
  item: boolean;
  up: boolean;
}

const NO_PAD_STATE: PadState = { left: false, right: false, action: false, item: false, up: false };

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
  //
  // Seeded from the actually-held state below rather than defaulted to
  // false: a new InputManager is constructed on every scene transition
  // (WorldScene.create()), and a button held across that transition (e.g.
  // holding "up" while walking through a portal) would otherwise look like
  // a brand-new press to the fresh instance — in the Graveyard specifically,
  // where the arrival point overlaps the return portal, that immediately
  // sends the player right back to Town, and back again, for as long as
  // the button stays held.
  private wasPadAction: boolean;
  private wasPadItem: boolean;
  private wasPadUp: boolean;
  private wasPadLeft: boolean;
  private wasPadRight: boolean;

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

    const initialPad = this.readPad();
    this.wasPadAction = initialPad.action;
    this.wasPadItem = initialPad.item;
    this.wasPadUp = initialPad.up;
    this.wasPadLeft = initialPad.left;
    this.wasPadRight = initialPad.right;
  }

  private gamepad(): Phaser.Input.Gamepad.Gamepad | null {
    return this.scene.input.gamepad?.getPad(0) ?? null;
  }

  private readPad(): PadState {
    const pad = this.gamepad();
    if (!pad) return NO_PAD_STATE;

    return {
      left: pad.axes[0]?.getValue() < -0.5 || pad.left,
      right: pad.axes[0]?.getValue() > 0.5 || pad.right,
      action: pad.A || pad.X,
      item: pad.B,
      up: pad.up || (pad.axes[1]?.getValue() ?? 0) < -0.5,
    };
  }

  read(): InputState {
    const pad = this.readPad();

    const left = !!this.cursors?.left.isDown || !!this.keyA?.isDown || pad.left || touchState.left;
    const right = !!this.cursors?.right.isDown || !!this.keyD?.isDown || pad.right || touchState.right;

    // Rising edge only — see the wasPad* comment above.
    const padActionPressed = pad.action && !this.wasPadAction;
    const padItemPressed = pad.item && !this.wasPadItem;
    const padUpPressed = pad.up && !this.wasPadUp;
    const padLeftPressed = pad.left && !this.wasPadLeft;
    const padRightPressed = pad.right && !this.wasPadRight;
    this.wasPadAction = pad.action;
    this.wasPadItem = pad.item;
    this.wasPadUp = pad.up;
    this.wasPadLeft = pad.left;
    this.wasPadRight = pad.right;

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

    // left/right above are level-triggered (continuous, for movement).
    // Dialogue choice-cycling wants a single step per press instead — see
    // touchState.leftQueued/rightQueued for why that can't just be "left
    // was true on this read and wasn't on the last one" for touch input.
    const leftPressed =
      (!!this.cursors?.left && Phaser.Input.Keyboard.JustDown(this.cursors.left)) ||
      (!!this.keyA && Phaser.Input.Keyboard.JustDown(this.keyA)) ||
      padLeftPressed ||
      this.consume("leftQueued");

    const rightPressed =
      (!!this.cursors?.right && Phaser.Input.Keyboard.JustDown(this.cursors.right)) ||
      (!!this.keyD && Phaser.Input.Keyboard.JustDown(this.keyD)) ||
      padRightPressed ||
      this.consume("rightQueued");

    return { left, right, leftPressed, rightPressed, actionPressed, itemPressed, upPressed };
  }

  private consume(flag: "actionQueued" | "itemQueued" | "upQueued" | "leftQueued" | "rightQueued"): boolean {
    const value = touchState[flag];
    touchState[flag] = false;
    return value;
  }
}
