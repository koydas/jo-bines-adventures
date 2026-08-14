# Gameplay mechanics

How the systems fit together, and where the code for each lives. For raw
numbers see [`stats.md`](./stats.md); for room layout see
[`scenes.md`](./scenes.md); for dialogue content see [`npcs.md`](./npcs.md).

## Controls

One input scheme drives keyboard, gamepad, and an on-screen touch overlay
at once — see [ADR 0005](./adr/0005-dom-based-touch-controls-overlay.md).
`InputManager.read()` (`src/systems/InputManager.ts`) is called once per
frame by `WorldScene.update()` and returns a plain `InputState`:

| Action | Keyboard | Touch | Gamepad |
|---|---|---|---|
| Move left/right | Arrow keys / A,D | left/right D-pad buttons | left stick / D-pad |
| Action (talk / buy / punch / confirm dialogue) | Ctrl or Space | ⚔️ button | A / X face button |
| Use item (drink potion) | Shift | 🧪 button | B face button |
| Enter portal | Up arrow / W | ▲ context button (only shown near a portal) | Up / stick up |

The **action** button is deliberately overloaded, same as the original:
what it does depends on what the player is overlapping when pressed (see
"The action button" below). Movement and the item button are the same in
every context.

Touch buttons write into a shared module-level `touchState`
(`src/systems/touchState.ts`) rather than being owned by one
`InputManager`, because `TouchControls` is created once for the whole app
(`src/systems/touchControlsInstance.ts`) and outlives any single scene,
while `InputManager` is recreated on every scene transition.

## Movement

`Player.moveLeft()`/`moveRight()` (`src/entities/Player.ts`) set an Arcade
Physics horizontal velocity (`PLAYER_STATS.runSpeed`) and flip the sprite
to face the movement direction. There's no gravity and no jumping — `y` is
pinned to the spawn height (`groundY`) whenever the player goes idle,
matching the original's fixed `original_y`. `WorldScene.update()` calls
`goIdle()` whenever neither direction is held and the player isn't mid
punch/hit.

## The action button

`WorldScene.handleAction(now)` decides what the action button does, in
priority order:

1. **Talk** — if overlapping an NPC whose `talk()` returns dialogue,
   open the `DialogueBox` with it.
2. **Buy** — else if overlapping the potion stand, attempt
   `Player.buy(price)`.
3. **Punch** — otherwise, `Player.punch(now)`.

This is a simplification of the original's per-room branching (which
disabled punching entirely while `in_city()`); since Town has no enemies
and the Graveyard has no shop/NPCs with a `talk()` that returns something,
the unified priority order produces the same behavior without needing to
know which room you're in.

`overlapping()` (`WorldScene.overlapping`) does a generous rectangle
intersection between the player's bounds and the target's — padded by
60px on the player's side — specifically so mobile play doesn't require
pixel-perfect positioning to trigger an interaction.

## Combat

Two independent checks run every frame in `GraveyardScene.update()`,
per live Skeleton:

- **Player hits Skeleton**: if `player.isAttacking` (mid-punch animation)
  and overlapping, `skeleton.takeDamage(randomDamage(1, 3), time)`. The
  skeleton has its own 500ms post-hit invincibility window (longer than
  the ~375ms punch animation) so one punch animation can't multi-hit it
  across several frames of overlap.
- **Skeleton hits player**: if `skeleton.isAttacking` and overlapping,
  `player.takeDamage(randomDamage(1, 3), time)`. The player has a 1000ms
  post-hit invincibility window (`COOLDOWNS.takeHitMs`).

**Skeleton AI** (`Skeleton.update(now)`, called every frame from
`GraveyardScene`):

1. Compute distance to the player. If within `aggroRange`, set
   `inCombat = true` — and it **stays** true for the rest of the room,
   there's no de-aggro (matches the original's `in_combat = in_combat ||
   ...`).
2. If not in combat, stand idle.
3. If in combat and within `attackRange` and off cooldown, attack: play
   the attack animation, lunge toward the player, and start the
   `attackCooldownMs` timer.
4. If in combat but out of attack range, walk toward the player
   (`walkToward`), stopping within 100px so it doesn't stack on top of
   the player.

**Death**: `Skeleton.takeDamage` destroys the skeleton once HP reaches 0
(after a short fade-out tween), awards `SKELETON_STATS.money`/`experience`
to the player, and calls back into the scene (`removeSkeleton`) to drop it
from the scene's tracked list. `Player.takeDamage` calls `onDeath()`
(passed in by whichever `WorldScene` created it) once HP reaches 0, which
syncs stats to `GameState` and transitions to `GameOver` after a short
delay.

## Dialogue

`DialogueBox` (`src/ui/DialogueBox.ts`) is a single reusable, bottom-anchored
UI component per scene — not per-NPC hand-drawn speech bubbles like the
original (see
[ADR 0006](./adr/0006-modern-text-rendering-instead-of-bitmap-font.md)).
It's driven by a small page model:

```ts
interface DialoguePage {
  speaker?: string;
  lines: string[];
  choices?: string[]; // if present, this page is a choice prompt instead of text
}
```

`WorldScene.handleAction()` calls `npc.talk()` to get a `DialoguePage[]`
and opens it with `dialogue.show(pages, onFinish)`. While the box is
visible, `WorldScene.update()` redirects input away from movement:

- left/right moves the cursor on a choice page (`dialogue.moveChoice`)
- the action button advances to the next page, or — on a choice page —
  confirms the highlighted option and closes the box, calling
  `onFinish(chosenIndex)`
- on the last page, confirming just closes the box (`onFinish()` with no
  argument)

`WorldScene` wires `onFinish` to `npc.onDialogueClosed(choice)`, so all
the actual quest-state logic (e.g. "accepting opens the portal") lives on
the NPC, not in the dialogue system or the scene.

## Shop

There's a single potion stand rather than the original's "walk through a
door to lock the camera into a shop view, then buy" choreography — see
[ADR 0007](./adr/0007-simplified-shop-and-decoration.md). Buying is just
the third step of the action button priority above:
`player.buy(potion.price)` deducts money and increments the potion count,
or does nothing (with a floating "Pas assez d'argent..." message) if the
player can't afford it.

## Quest & the portal

The Sorcerer's quest (see [`npcs.md`](./npcs.md#sorcerer-le-sorcier)) is
the only quest in the game right now, and it gates the only room
transition: accepting it sets `GameState.portalOpening = true`, which
`Portal.update()` (`src/entities/Portal.ts`) picks up to play the
4-frame opening animation once, then flips `GameState.portalOpened =
true` for good. `WorldScene.handleUp()` only fires the scene's
`onPortalEnter` callback if the player is overlapping the portal *and*
`GameState.portalOpened` — so the portal is inert until the quest is
accepted, in both rooms (there's a separate `Portal` instance per scene,
both reading the same `GameState` flags — see
[ADR 0004](./adr/0004-cross-scene-state-via-gamestate-singleton.md)).

## Death & restart

`Player.hp <= 0` triggers `die()` → the `onDeath` callback passed in at
construction → `WorldScene.onPlayerDeath()`, which syncs final stats into
`GameState` and, after a 600ms delay (long enough for the hit animation to
read as "you died" rather than "you got hit"), starts `GameOver`. Both
`GameOverScene` and `MainMenuScene` call `GameState.reset()` before
starting `Town`, so a fresh run always starts at full HP, 0
money/xp/potions, and a closed portal.
