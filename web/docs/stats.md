# Stats & balance values

Single source of truth: [`src/constants.ts`](../src/constants.ts). Every
number below is read from there at runtime — if you change a value, edit
that file and this table stays in sync only if you update it too (there's
no code generation here yet; treat this as documentation, not a build
artifact).

## Player

| Stat | Value | Notes |
|---|---|---|
| Max HP | 10 | `PLAYER_STATS.maxHp` |
| Damage per hit | 1–3 (random, floor) | `PLAYER_STATS.damageMin/Max`, rolled by `randomDamage()` (`src/utils/random.ts`) on every landed punch |
| Run speed | 600 px/s | `PLAYER_STATS.runSpeed` (equivalent to the original's 10 px/frame at 60 fps) |
| Attack cooldown | 1000 ms | `COOLDOWNS.attackMs` — minimum time between punches |
| Take-hit cooldown | 1000 ms | `COOLDOWNS.takeHitMs` — player is untouchable for this long after being hit |

Source: `Player` (`src/entities/Player.ts`), `PLAYER_STATS` / `COOLDOWNS`
in `src/constants.ts`.

## Skeleton (enemy)

| Stat | Value | Notes |
|---|---|---|
| Max HP | 10 | `SKELETON_STATS.maxHp` |
| Damage per hit | 1–3 (random, floor) | `SKELETON_STATS.damageMin/Max` |
| Walk speed | 300 px/s | `SKELETON_STATS.walkSpeed` |
| Aggro range | 1000 px | Distance from the player at which a skeleton becomes hostile. Once aggroed, a skeleton **stays** hostile for the rest of the room (matches the original's `in_combat = in_combat || ...` — no de-aggro) |
| Attack range | 300 px | Distance at which a skeleton switches from walking to attacking |
| Attack cooldown | 3000 ms | `SKELETON_STATS.attackCooldownMs` |
| Hit invincibility | 250 ms | A skeleton can't take damage again within 250ms of the last hit (`Skeleton.takeDamage`'s internal cooldown), so one punch animation doesn't multi-hit |
| Money dropped | 5$ | `SKELETON_STATS.money`, added to the player on death |
| XP dropped | 1 | `SKELETON_STATS.experience` |

Source: `Skeleton` (`src/entities/Skeleton.ts`), `SKELETON_STATS` in
`src/constants.ts`.

## Economy

| Item | Price |
|---|---|
| Potion (restores HP to max) | 5$ |

Source: `POTION_PRICE` in `src/constants.ts`, `Potion`
(`src/entities/Potion.ts`).

## World scale

The game reuses the original GameMaker room's pixel coordinates directly
— entities aren't rescaled, so a position like `x: 5216` means the same
place on screen in both projects. Base canvas is `1920×1080`
(`GAME_WIDTH`/`GAME_HEIGHT`), scaled to fit the device via
`Phaser.Scale.FIT`.

| Room | Width × Height |
|---|---|
| ville (Town) | 7000 × 1080 |
| Graveyard | 12000 × 1080 |

See [`scenes.md`](./scenes.md) for what's placed where.
