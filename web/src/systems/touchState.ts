/**
 * Shared mutable input state written by the DOM touch overlay
 * (TouchControls, created once for the whole app) and consumed by each
 * scene's InputManager (recreated on every scene transition).
 */
export const touchState = {
  left: false,
  right: false,
  actionQueued: false,
  itemQueued: false,
  upQueued: false,
  // Edge-triggered companions to left/right, for dialogue choice-cycling
  // (see WorldScene's dialogue branch): a quick tap's touchstart+touchend
  // can both fire within a single frame gap, so the continuous left/right
  // booleans above are sometimes never observed true by the game loop at
  // all — moveChoice() would just never see the press. These latch true on
  // touchstart and stay set until InputManager.read() consumes them, same
  // as actionQueued/itemQueued/upQueued.
  leftQueued: false,
  rightQueued: false,
};
