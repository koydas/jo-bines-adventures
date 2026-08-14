# Items & currencies

## Currencies

The player carries three counters, shown top-right in the HUD
(`src/ui/Hud.ts`) and persisted across scene transitions in `GameState`
(`src/state/GameState.ts`):

| Currency | Starts at | Gained from | Spent on |
|---|---|---|---|
| Money (`$`) | 0 | Killing a Skeleton (+5$ each, `SKELETON_STATS.money`) | Buying potions (5$ each) |
| Experience (`xp`) | 0 | Killing a Skeleton (+1 each, `SKELETON_STATS.experience`) | Nothing yet — no leveling system exists. A natural next step for a Trainer NPC (see [`npcs.md`](./npcs.md)) |
| Potions | 0 | Buying from the potion stand in Town | Drinking (fully restores HP) |

## Items

### Potion

- **File**: `src/entities/Potion.ts`
- **Price**: 5$ (`POTION_PRICE`)
- **Where**: one stand in ville, at `VILLE_ROOM.potion` (`x: 5440, y: 768`)
- **Buying**: walk up to it and press the action button (same button used
  to talk to NPCs and punch — see
  [`gameplay-mechanics.md`](./gameplay-mechanics.md#controls)). Fails
  silently with a "Pas assez d'argent..." floating message if the player
  can't afford it.
- **Using**: press the item button (🧪 on touch, Shift on keyboard) at any
  time outside of dialogue. `Player.drinkPotion()` sets `hp = maxHp` and
  decrements the potion count. No effect if the player has zero potions.

There is currently only one item in the game. To add another, use the
`add-item` skill (`.claude/skills/add-item/`) rather than copying `Potion`
by hand — it keeps the shop/HUD/buy-flow wiring consistent.
