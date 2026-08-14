import { TouchControls } from "./TouchControls";

let instance: TouchControls | null = null;

export function initTouchControls(): TouchControls {
  if (!instance) instance = new TouchControls();
  return instance;
}

export function getTouchControls(): TouchControls | null {
  return instance;
}
