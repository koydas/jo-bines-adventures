# 7. Simplify the shop interaction and background decoration placement

Date: 2026-08-14

## Status

Accepted

## Context

Two parts of the original `ville` room were expensive to port exactly and
low-value to get pixel-perfect:

1. **The general store.** The original flow is: walk up to
   `GeneralStoreDoor` and press up (`enter_house.gml`) → the store's
   `player_inside` flag flips, the camera locks and pans
   (`character_camera.gml`'s `camera_locked`) to frame the shop interior →
   *then* the player can walk up to the `Potion`/`Item` instance and buy
   it. It's a small, self-contained "enter a sub-area" state machine
   layered on top of the same room.
2. **Background decoration.** `rooms/ville/ville.yy` and
   `rooms/Graveyard/Graveyard.yy` place dozens of individual grass/rock/
   tree sprite instances at hand-picked coordinates (visible in the room
   JSON as long lists of `GMRSpriteGraphic` entries).

## Decision

- **Shop**: dropped the door/camera-lock/"inside" state entirely. The
  `Potion` stand is placed directly in the open room (at the original's
  item coordinates), and buying is just the normal action-button
  interaction (see
  [`gameplay-mechanics.md`](../gameplay-mechanics.md#shop)) — walk up,
  press action, done. The general store *building* is kept as background
  decoration for atmosphere; it's just not a separate interactive space
  anymore.
- **Decoration**: each room places a *representative, thinned-out* set of
  decoration sprites via a small loop over a hand-picked array of x
  positions (see `TownScene.buildRoom()`/`GraveyardScene.buildRoom()`),
  rather than reproducing every original instance's exact coordinate.
  Ground tiling (grass strip) is generated procedurally across the full
  room width instead of being copied tile-by-tile.

## Consequences

- Buying a potion is one interaction instead of two, which is a strictly
  easier and more mobile-friendly flow — no camera choreography to get
  right on a small screen.
- The general store building's exact silhouette/position was re-tuned by
  eye (see the commit history of `TownScene.buildRoom()`) rather than
  computed from the original room file's coordinates, because the
  original sprite's origin/scale weren't fully recoverable from the
  extracted assets alone.
- Decoration density and exact placement will visibly differ from the
  original room screenshots/builds if compared side by side. This is an
  accepted, deliberate gap — treat `rooms/*/​*.yy` as inspiration for
  "roughly this many trees, roughly here," not as a spec to match
  exactly, unless a future decision explicitly asks for pixel parity.
- If exact parity is wanted later, the room `.yy` files already contain
  every instance's precise coordinates (see how `VILLE_ROOM`/
  `GRAVEYARD_ROOM` in `src/constants.ts` were derived from them) — it's a
  data-entry task, not a redesign.
