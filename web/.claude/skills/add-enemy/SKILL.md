---
name: add-enemy
description: Scaffold a new enemy type for Jo Bine's Adventures (web/), following the Skeleton pattern (AI, stats, combat wiring). Use when asked to add a new monster, enemy, or boss to the game.
---

# Add an enemy

Reference first: `docs/gameplay-mechanics.md#combat` (the AI state
machine and the per-frame overlap checks) and `src/entities/Skeleton.ts` —
today's only enemy, and the template to follow.

## Known limitation, read this first

Combat overlap checks are currently hardcoded to one enemy type in
`GraveyardScene.update()`:

```ts
this.skeletons.forEach((skeleton) => {
  skeleton.update(time);
  if (this.player.isAttacking && this.overlapping(skeleton)) { ... }
  if (skeleton.isAttacking && this.overlapping(skeleton)) { ... }
});
```

If you're adding a **second enemy type to the same room**, either give it
its own tracked array + loop (quick, but duplicates the overlap logic), or
better: generalize to a common `Enemy` interface
(`hp`, `isAttacking`, `isDead`, `update(now)`, `takeDamage(amount, now)`)
that `Skeleton` and your new class both implement, and keep one
`this.enemies: Enemy[]` array with one loop. Prefer the interface — do
this generalization as part of adding the second enemy type rather than
leaving two near-identical loops.

## 1. Stats

Add a stats object to `src/constants.ts`, modeled on `SKELETON_STATS`
(`maxHp`, `damageMin/Max`, `walkSpeed`, `aggroRange`, `attackRange`,
`attackCooldownMs`, `money`, `experience`). Every one of these fields is
meaningful — see `docs/stats.md` for what each controls — don't skip one
without checking whether the AI logic needs it.

## 2. Sprite & animations

Enemies are animated (idle/walk/attack), so follow the animated-sprite
path: extract frames into `public/assets/<enemy>/{idle,walk,attack}/`
(add entries to `scripts/extract_sprites.py`'s `SPRITES` list, mirroring
the `skeleton_*_sprite` entries), then register them in
`src/scenes/BootScene.ts`'s `ANIM_FRAMES` + `ANIM_ASSET_PATH` (frame
counts) and add the three `createAnim(...)` calls in `BootScene.create()`
— copy the `skel-idle`/`skel-walk`/`skel-attack` lines and adjust the key
prefix and frame counts/rates.

## 3. Entity class

`src/entities/<Enemy>.ts`, modeled closely on `Skeleton.ts`:
constructor takes `(scene, x, y, facingLeft, player, onDeath)`; implement
the same AI shape (`inCombat` sticky aggro once in range, walk-then-attack
state machine, hit invincibility window, death → award money/xp to the
player → fade out → `onDeath(this)` callback). Deviate from that shape
deliberately (e.g. a ranged enemy that doesn't walk into melee range, or a
boss with attack phases) rather than by accident — if you deviate, note
why in a comment, since the next skill run (or the next Claude session)
will assume the Skeleton shape unless told otherwise.

## 4. Place it in a room

In the target scene's `buildRoom()`, construct instances and track them
in an array (or the generalized `this.enemies`, see the note above), same
as `GraveyardScene`'s `this.skeletons = GRAVEYARD_ROOM.skeletons.map(...)`.
Add spawn coordinates to `src/constants.ts` next to `GRAVEYARD_ROOM` (or
create a new room constant if this is a new room — see
`.claude/skills/add-room/SKILL.md`).

## 5. Wire combat

In the scene's `update()`, call `.update(time)` on every enemy and run the
two-way overlap check (player attacks enemy / enemy attacks player) shown
above — copy `GraveyardScene.update()`'s pattern exactly for the damage
rolls (`randomDamage(min, max)` from `src/utils/random.ts`).

## 6. Update the docs

Add the new enemy to `docs/stats.md` (a stats table like the Skeleton's)
and to `docs/gameplay-mechanics.md#combat` if its AI meaningfully differs
from the Skeleton's.

## 7. Verify

```bash
npm run build
npm run dev
```
Confirm: aggro triggers within the stated range, it stops at attack range
and attacks rather than walking into the player, damage numbers/cooldowns
feel right, and killing it awards the right money/xp and removes it from
the scene's tracked array (check for a leak: dead enemies should stop
appearing in future overlap checks).
