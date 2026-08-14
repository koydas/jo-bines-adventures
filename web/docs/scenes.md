# Scenes

The game is a `Phaser.Game` with five scenes, registered in `src/main.ts`.
Two of them (`TownScene`, `GraveyardScene`) share a common base class,
`WorldScene` (`src/scenes/WorldScene.ts`), which owns the player, HUD,
dialogue box, input reading, and the interaction rules that are the same
in every playable room (move, punch/talk/buy on the action button, drink a
potion, enter a portal). See
[ADR 0003](./adr/0003-scene-per-room-with-shared-worldscene-base.md) for
why it's structured this way.

## BootScene (`Boot`)

`src/scenes/BootScene.ts`. Not visible to the player — loads every sprite
frame, builds all `Phaser.Animations` (idle/run/punch/hit for the player,
idle/walk/attack for the Skeleton, the portal-opening animation), then
immediately starts `MainMenu`. If you add a new animated sprite, register
its frame count and animation config here (`ANIM_FRAMES`,
`ANIM_ASSET_PATH`) — the `add-npc`/`add-enemy` skills do this for you.

## MainMenuScene (`MainMenu`)

`src/scenes/MainMenuScene.ts`. Title, a static player sprite, the ported
instructions text (`INSTRUCTIONS_LINES`), and a "tap to start" prompt. Any
tap/click or keypress calls `GameState.reset()` and starts `Town`. This is
always the entry point (`scene: [BootScene, MainMenuScene, ...]` in
`main.ts`, and `Boot` hands off to it).

## TownScene (`Town`)

`src/scenes/TownScene.ts`, extends `WorldScene`. Ports `rooms/ville`.

- **Size**: 7000 × 1080.
- **Player spawn**: `VILLE_ROOM.playerStart` (`2848, 928`) on a fresh
  game; just past the portal (`VILLE_ROOM.portal.x + 120`) when arriving
  back from the Graveyard.
- **Contains**: the Merchant and Sorcerer NPCs, the potion stand, the
  portal to the Graveyard (invisible until the Sorcerer's quest is
  accepted), the general store building as background decoration, and
  procedurally-scattered grass/rock/tree decoration (see
  [ADR 0007](./adr/0007-simplified-shop-and-decoration.md) for why the
  decoration isn't pixel-for-pixel from the original room file).
- **Exit**: walk into the portal at `VILLE_ROOM.portal` (`32, 640`) and
  press "up" once it's open — transitions to `Graveyard`.

## GraveyardScene (`Graveyard`)

`src/scenes/GraveyardScene.ts`, extends `WorldScene`. Ports
`rooms/Graveyard`.

- **Size**: 12000 × 1080.
- **Player spawn**: always arrives next to the graveyard-side portal
  (`PORTAL.graveyardX + 100, 928`) — this room is only reachable through
  the portal.
- **Contains**: 6 Skeletons at the positions from the original room file
  (`GRAVEYARD_ROOM.skeletons`), the Guard NPC (fixed position, matching
  the original's hardcoded `x = 9392, y = 704`), a portal back to Town,
  and decoration (tombs, dead flowers, trees, a crypt entrance).
- **Exit**: walk into the portal at `PORTAL.graveyardX` (`8160, 640`) and
  press "up" — transitions back to `Town`.
- **Combat loop**: each frame, `GraveyardScene.update()` checks the
  player against every live Skeleton for overlap in both directions (see
  [`gameplay-mechanics.md`](./gameplay-mechanics.md#combat)).

## GameOverScene (`GameOver`)

`src/scenes/GameOverScene.ts`. Ports `objects/GameOver` /
`rooms/LosingScreen`. Shown when the player's HP hits 0
(`WorldScene.onPlayerDeath`, 600ms after death to let the hit animation
play). Any tap or keypress calls `GameState.reset()` and starts `Town`
again from scratch (full HP, 0 money/xp/potions, portal closed).

## Cross-scene state

Because Phaser recreates scene instances on every transition, player
stats and portal state can't live only on the `Player`/`Portal` objects —
they're mirrored into the `GameState` singleton
(`src/state/GameState.ts`) whenever a scene shuts down, and read back when
the next scene creates its `Player`/`Portal`. See
[ADR 0004](./adr/0004-cross-scene-state-via-gamestate-singleton.md).
