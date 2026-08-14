---
name: add-npc
description: Scaffold a new NPC for Jo Bine's Adventures (web/) — a sprite, dialogue, and placement in a room scene. Use when asked to add, create, or place a new character/NPC/vendor/quest-giver in the game, or to give an existing unused NPC (Trainer, Necromancer) a dialogue tree and a spot in a room.
---

# Add an NPC

Reference first: `docs/npcs.md` (existing NPCs and the `NPC` base class
contract) and `docs/gameplay-mechanics.md#dialogue` (how `DialogueBox`
pages/choices work). Read both before writing code — this skill assumes
you already know that shape.

## 1. Decide: `SimpleNPC` or a custom class?

- **Fixed message, no choices, no state** (like the Guard) → don't write
  a new file. Construct a `SimpleNPC` inline where you place it:
  ```ts
  new SimpleNPC(this, x, y, "npc-<key>", "<Display Name>", MY_NPC_LINES)
  ```
- **Dialogue tree, choices, or the NPC needs to react to game state**
  (like the Sorcerer) → write a new class in `src/entities/<Name>.ts`
  extending `NPC` (`src/entities/NPC.ts`). Look at `Sorcerer.ts` as the
  template: override `talk()` to return different `DialoguePage[]`
  depending on internal state, and `onDialogueClosed(choice)` to react to
  the player's answer. If side effects need to reach outside the entity
  (like opening the portal), pass callbacks into the constructor rather
  than importing `GameState` directly into the entity — keep entities
  decoupled from global state, the scene wires them together.

## 2. Sprite

- If the sprite already exists in the original GameMaker project
  (`platformer/sprites/<name>_sprite/`), extract it:
  ```bash
  # add an entry to SPRITES in scripts/extract_sprites.py first, e.g.:
  # ("some_npc_sprite", "npc", "some_npc"),
  python3 scripts/extract_sprites.py
  ```
  This writes `public/assets/npc/<name>_0.png` (and `_1`, `_2`, ... if it's
  animated — most NPCs in this game are single-frame).
- If it's a brand new sprite with no GameMaker source, drop the PNG(s)
  directly into `public/assets/npc/`.
- Register the texture key in `src/scenes/BootScene.ts`'s
  `STATIC_IMAGES` map (single frame) or `ANIM_FRAMES`/`ANIM_ASSET_PATH`
  (animated, follow the `char-idle`/`skel-idle` entries as a template) —
  use the `npc-<name>` naming convention already used for
  `npc-marchand`, `npc-sorcier`, etc.

## 3. Dialogue text

Add the lines (and any choice text) as constants in `src/constants.ts`,
next to the other dialogue constants (`MARCHAND_LINES`, `QUEST_TEXT`,
`GUARD_LINES`). Keep dialogue in French, matching every other NPC in the
game, unless explicitly told otherwise. Comment each constant with which
original GML file it corresponds to if you're porting existing text (see
the existing comments for the pattern), or `// new dialogue` if it's
original content.

## 4. Place it in a room

In the target scene's `buildRoom()` (`src/scenes/TownScene.ts` or
`GraveyardScene.ts`), construct the NPC and push it into `this.npcs`:

```ts
const trainer = new SimpleNPC(this, x, y, "npc-trainer", "Le Trainer", TRAINER_LINES);
this.npcs.push(trainer);
```

Pick `x, y` sensibly relative to existing entities in that room (see
`docs/scenes.md` for each room's populated coordinates and dimensions) —
don't overlap another NPC or the portal.

If the NPC needs a per-frame update (like the Sorcerer's quest icon),
your custom class already gets one for free — `WorldScene.update()` calls
`npc.update()` on every NPC in `this.npcs` every frame.

## 5. Update the docs

Add an entry to `docs/npcs.md` following the existing format (file,
placed-at coordinates, dialogue summary, any special behavior).

## 6. Verify

```bash
npm run build   # tsc + vite build must both pass
npm run dev
```
Walk up to the NPC and confirm the action button (Ctrl/Space on keyboard)
triggers the dialogue, and that it reads correctly in French with proper
accents. If you have Playwright available, `npm run test:smoke` covers
the general dialogue flow (see `tests/smoke.spec.ts`) but won't know
about your new NPC specifically — consider adding a case if it's quest-
relevant like the Sorcerer.
