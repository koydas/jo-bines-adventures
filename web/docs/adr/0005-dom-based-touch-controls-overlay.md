# 5. Touch controls are a DOM overlay, not Phaser game objects

Date: 2026-08-14

## Status

Accepted

## Context

The original game has no touch input at all — `character_controls_rules.gml`
only reads `keyboard_check*` and `gamepad_*`. Playing on iPhone requires
adding on-screen controls (movement, action, item, and a contextual
"enter" button) from scratch. Two implementation options were realistic:
draw button sprites as Phaser game objects positioned in screen space
(`setScrollFactor(0)`), or render an HTML overlay with regular DOM
elements positioned over the canvas.

## Decision

Touch controls (`src/systems/TouchControls.ts`) are plain HTML `<button>`
elements, absolutely positioned in a `<div>` appended to `document.body`,
styled with a `<style>` tag injected once. They're created a single time
for the whole app (`src/systems/touchControlsInstance.ts`), independent of
whichever Phaser scene is currently active, and communicate with the game
purely by writing booleans/flags into a shared plain object,
`touchState` (`src/systems/touchState.ts`). Each scene's `InputManager`
reads `touchState` alongside keyboard/gamepad state every frame and clears
the edge-triggered flags after reading them.

Only shown when `'ontouchstart' in window || navigator.maxTouchPoints > 0`
— a keyboard/mouse player never sees the overlay.

## Consequences

- Button styling (safe-area insets for the iPhone notch/home indicator,
  backdrop blur, press feedback) is ordinary CSS, not manual Phaser
  layout math recomputed on every resize.
- Touch handling uses native `touchstart`/`touchend` events with
  `preventDefault()`, which is the reliable way to avoid iOS Safari's
  default touch behaviors (tap highlight, double-tap zoom, callout menus)
  interfering with rapid button taps — trying to replicate this through
  Phaser's input plugin would mean re-solving problems the DOM already
  solves.
- The overlay survives scene transitions untouched, so there's no
  flicker or re-layout when moving between Town and the Graveyard, and no
  need to recreate button listeners per scene.
- The tradeoff: input state now flows through a second, non-Phaser path
  (`touchState`) that `InputManager` has to merge with Phaser's own
  keyboard/gamepad reads. Anyone adding a new control must remember to
  wire it into both `TouchControls` (the button) and `InputManager` (the
  merge) — there's no single source of truth for "what buttons exist"
  the way there would be if input control were unified in one system.
