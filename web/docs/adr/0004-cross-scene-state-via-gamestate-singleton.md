# 4. Cross-scene state lives in a `GameState` singleton

Date: 2026-08-14

## Status

Accepted

## Context

The original game marks `objects/Character` and `objects/Portail` as
`persistent = true`, so GameMaker keeps the *same instance* alive across
room changes — the character's HP/money/XP and the portal's
opened/opening flags simply survive because nothing destroys them.

Phaser has no equivalent of GameMaker's persistent instances: every
`scene.start()` call tears down the current scene's game objects and
runs the target scene's `create()` from scratch, constructing a brand new
`Player` and (per-scene) `Portal`. Something has to carry player stats
and portal state across that boundary, since both need to survive going
from Town to the Graveyard and back.

Phaser does offer a built-in `game.registry` for exactly this kind of
cross-scene data. We chose not to use it.

## Decision

Introduce a plain TypeScript singleton, `GameState`
(`src/state/GameState.ts`), holding the fields that need to survive a
scene transition: `hp`, `maxHp`, `money`, `experience`, `nbPotions`,
`portalOpened`, `portalOpening`, and a one-shot `enteredViaPortal` flag
used to pick the correct spawn point on arrival.

- `WorldScene.create()` reads `GameState` into the freshly-constructed
  `Player`.
- `WorldScene` registers a `SHUTDOWN` listener that writes the `Player`'s
  current stats back into `GameState` — this is the only place stats are
  synced out, so it can't be missed by adding a new exit path later.
- Each scene's own `Portal` instance reads the shared
  `portalOpened`/`portalOpening` flags every frame (`Portal.update()`);
  there are two `Portal` objects (one per room) but one source of truth
  for whether it's open.
- `GameState.reset()` is called explicitly at the two places a fresh run
  starts (`MainMenuScene`, `GameOverScene`), rather than on every scene
  `create()`, so mid-game transitions (Town ⇄ Graveyard) don't
  accidentally wipe progress.

## Consequences

- Cross-scene fields are declared in one typed place with one shape,
  rather than scattered across `registry.set(key, value)` calls with no
  compile-time guarantee the key or the value's type is right on the
  read side.
- The sync points are explicit (`create()` reads, `SHUTDOWN` writes)
  instead of implicit, which is what let the portal-opening bug found
  during manual testing (state read before the animation had finished)
  get diagnosed quickly — the state's lifecycle is easy to reason about.
- This only works because there's exactly one `Player` alive at a time,
  which is true for this game (a single-player, single-screen-at-a-time
  side view). It would need rethinking for multiplayer or for showing two
  scenes at once (e.g. a HUD scene overlaid on a world scene).
