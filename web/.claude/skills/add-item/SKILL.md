---
name: add-item
description: Scaffold a new purchasable or usable item for Jo Bine's Adventures (web/), following the Potion pattern. Use when asked to add a new item, shop good, consumable, or equipment to the game.
---

# Add an item

Reference first: `docs/items.md` (the current item/currency model) and
`src/entities/Potion.ts` — today's only item, and the template to follow.

## Known limitation, read this first

The current code assumes **one** shop item: `WorldScene.potion` is a
single optional field, and `WorldScene.handleAction()` checks it
specifically (`if (this.potion && this.overlapping(this.potion))`). If
you're adding a **second purchasable item**, you must generalize this
before it'll work — don't bolt a second hardcoded field on:

1. In `WorldScene.ts`, replace `protected potion?: Potion;` with
   `protected shopItems: ShopItem[] = [];` where `ShopItem` is a small
   interface (`price: number`, plus whatever `Phaser.GameObjects.Sprite`
   already gives you for `getBounds()`).
2. In `handleAction()`, replace the single `this.potion` check with
   `this.shopItems.find((item) => this.overlapping(item))`.
3. Update `updateContextHint()`'s `nearPotion` check the same way.
4. Have `Potion` (and your new item) implement/extend that shape.

If you're adding a **consumable that isn't purchased** (found on the
ground, quest reward, etc.), you don't need any of the above — skip to
step 2 below and wire pickup however makes sense (e.g. an overlap in
`WorldScene.update()` that grants it and destroys the sprite, no button
press needed).

## 1. Decide what the item does

- **Purchasable + usable later** (like the Potion): needs a price, a
  place to buy it, an inventory count, and an effect when used.
- **Purchasable + instant effect** (e.g. a permanent stat boost): needs a
  price and a place to buy it, but no inventory count — apply the effect
  directly in the buy handler instead of incrementing a count.
- **Equipment** (changes player stats/appearance while "equipped"): this
  game has no equipment slot concept yet — you're introducing one, so
  also update `docs/gameplay-mechanics.md` to document it once it exists,
  and consider whether it belongs on `Player` directly (`src/entities/Player.ts`)
  as a new field alongside `nbPotions`.

## 2. Sprite

Same as NPCs — see `.claude/skills/add-npc/SKILL.md` step 2, but target
`public/assets/ui/` and the `ui-<name>` naming convention (matches
`ui-potion`, `ui-price-tag`) since items are drawn as UI/world props, not
characters.

## 3. Price & constants

Add a price constant to `src/constants.ts` next to `POTION_PRICE`. If the
item needs its own dialogue/flavor text (a price tag label, a pickup
message), add that too, in French, matching the existing tone.

## 4. Entity class

`src/entities/<Item>.ts`, modeled on `Potion.ts`: a
`Phaser.Physics.Arcade.Sprite` with a static body, `readonly price`, and
whatever visual extras (price tag, glow, ...) it needs. Keep the
constructor's only job "look right where it's placed" — buying/using logic
belongs in `WorldScene`/`Player`, not the entity.

## 5. Buying logic

`Player.buy(price)` already generalizes to "spend money, gain one of
whatever was bought" only for potions today
(`this.nbPotions++` is hardcoded in `Player.buy`). For a different
inventory item, either:
- extend `Player` with a second counter and a `buy(item)` overload that
  knows which counter to increment, or
- if the item's effect is instant (no inventory), skip `Player.buy`'s
  counter entirely and apply the effect directly where you handle the
  purchase in `WorldScene.handleAction()`.

## 6. Place it & update docs

Place it in the target room's `buildRoom()`, same as the Potion in
`TownScene.ts`. Update `docs/items.md` with the new item's entry
(price, where it's found, what it does), following the existing format.

## 7. Verify

```bash
npm run build
npm run dev
```
Confirm: the price tag/visual reads correctly, buying with insufficient
funds shows the "Pas assez d'argent..." message (or your item's
equivalent), buying with enough money deducts it, and using the item (if
applicable) has the intended effect.
