# 3. One Phaser scene per room, sharing a `WorldScene` base class

Date: 2026-08-14

## Status

Accepted

## Context

The original game has a handful of rooms (`MainMenu`, `ville`,
`Graveyard`, `LosingScreen`) with an `objects/Character` instance that's
`persistent = true` across room changes, and per-room instance placement
baked into each room's `.yy` file. We need an equivalent structure in
Phaser, where the natural unit of "a screen the player is in" is a
`Phaser.Scene`.

Two playable rooms — Town and the Graveyard — share almost everything:
spawning the player, following it with the camera, drawing the HUD,
reading input, handling the action/item/portal buttons, and the
NPC/potion/portal overlap checks. Only the room-specific content (which
NPCs, which enemies, the background decoration, room size) actually
differs.

## Decision

- One `Phaser.Scene` subclass per room: `MainMenuScene`, `TownScene`,
  `GraveyardScene`, `GameOverScene`, plus a non-visible `BootScene` for
  preloading.
- `TownScene` and `GraveyardScene` both extend an abstract `WorldScene`
  (`src/scenes/WorldScene.ts`), which owns the shared `create()`/`update()`
  logic and declares three things each subclass must provide:
  `roomWidth`, `playerStart()`, and `buildRoom()` (where the subclass
  populates `this.npcs`, `this.potion`, `this.portal`, and any
  room-specific entities like `GraveyardScene`'s skeleton list).

This is not a generic "data-driven room loader" — rooms are still plain
TypeScript classes, not JSON descriptions interpreted at runtime. Given
there are two rooms today, a data-driven system would be premature
abstraction; `WorldScene` already captures the actual duplication that
exists.

## Consequences

- Adding a new mechanic that applies to every room (e.g. a new button, a
  new HUD element) is a one-line change in `WorldScene`, not a change
  repeated per scene.
- Adding a new *room* means writing a new `WorldScene` subclass — see the
  `add-room` skill (`.claude/skills/add-room/`) — which is more ceremony
  than adding a row to a data file, but keeps room-specific logic
  (Graveyard's per-frame combat overlap checks, for example) in
  ordinary, type-checked code rather than a generic interpreter.
- If a third or fourth room makes the shared/per-room split awkward (e.g.
  a room with no player, or a minigame with different controls), that's
  a signal to revisit this ADR rather than forcing it into `WorldScene`.
