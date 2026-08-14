---
name: add-room
description: Scaffold a new playable room/scene for Jo Bine's Adventures (web/), following the Town/Graveyard WorldScene pattern. Use when asked to add a new room, level, area, or map to the game.
---

# Add a room

Reference first: `docs/scenes.md` (every existing scene) and
[ADR 0003](../../docs/adr/0003-scene-per-room-with-shared-worldscene-base.md)
(why rooms are `WorldScene` subclasses, and what's shared vs. per-room).

## 1. New scene class

Create `src/scenes/<Name>Scene.ts` extending `WorldScene`
(`src/scenes/WorldScene.ts`). Look at `TownScene.ts` (simpler — NPCs, a
shop, no per-frame combat loop) or `GraveyardScene.ts` (has enemies and a
combat loop in `update()`) as your template, whichever is closer to what
the new room needs. You must provide:

```ts
export class MyRoomScene extends WorldScene {
  protected roomWidth = MY_ROOM.width;

  constructor() {
    super("MyRoom"); // this is the scene key — must be unique, used by scene.start()
  }

  protected playerStart() {
    // where the player appears — a fixed spawn, or computed from
    // GameState.enteredViaPortal / another flag if this room has more
    // than one entrance
    return { x: ..., y: ... };
  }

  protected buildRoom() {
    // background, decoration, this.npcs, this.potion, this.portal, ...
  }
}
```

`WorldScene` already handles: constructing the `Player` from `GameState`,
camera follow, the HUD, the `DialogueBox`, reading input, the
action/item/up-button interaction priority, and syncing stats back to
`GameState` on shutdown. Don't reimplement any of that — if it's missing
something the new room needs, that's a sign to extend `WorldScene` itself
(see ADR 0003), not to route around it in the subclass.

## 2. Register the scene

Add the room constants (size, spawn point, entity coordinates) to
`src/constants.ts`, following `VILLE_ROOM`/`GRAVEYARD_ROOM`'s shape. Then
register the scene class in `src/main.ts`'s `scene: [...]` array — order
matters only in that `BootScene` must be first (it starts `MainMenu` when
done loading).

## 3. Connect it to the rest of the game

A room needs at least one way in and one way out. The existing pattern is
a `Portal` (`src/entities/Portal.ts`) gated by `GameState` flags — see
[ADR 0004](../../docs/adr/0004-cross-scene-state-via-gamestate-singleton.md).
If your new room is reached differently (e.g. always accessible from Town,
no unlock condition), you likely still want a `Portal`-like sprite for the
"walk in, press up" interaction, just without a gating condition, or a
simpler trigger zone if a full portal is overkill — check
`WorldScene.handleUp()` for how the interaction is currently portal-
specific and generalize if you add a second kind of transition trigger.

## 4. Populate it

Add whatever the room needs — NPCs, enemies, items, decoration — using
the other content skills (`add-npc`, `add-enemy`, `add-item`) rather than
inlining everything into `buildRoom()` from scratch.

## 5. Update the docs

Add a section to `docs/scenes.md` following the existing format (size,
spawn logic, contents, how you get in/out).

## 6. Verify

```bash
npm run build
npm run dev
```
Confirm: the room loads without errors, world bounds/camera bounds match
`roomWidth`, the player spawns in a sane place, and every way in and out
actually transitions to the right scene key.
