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
};
