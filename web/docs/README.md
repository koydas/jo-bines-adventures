# Documentation

Reference documentation for the web port of Jo Bine's Adventures
(TypeScript + Phaser 3, in `web/`). This documents the current source of
truth for game content — when it disagrees with the original GameMaker
project in `_legacy/`, the code in `web/src` (and this doc set) wins,
since that's what ships.

- [`gameplay-mechanics.md`](./gameplay-mechanics.md) — movement, combat,
  dialogue, the shop, quests, and room transitions: how the systems work
  and where the code for each lives.
- [`stats.md`](./stats.md) — every numeric balance value (HP, damage,
  speed, cooldowns, prices) in one table, with its source file.
- [`items.md`](./items.md) — items and currencies (money, XP, potions).
- [`scenes.md`](./scenes.md) — every scene/room: purpose, dimensions,
  what's placed in it, and how you get in and out.
- [`npcs.md`](./npcs.md) — every NPC: dialogue tree, side effects, where
  they're placed.
- [`adr/`](./adr/) — Architecture Decision Records: the *why* behind
  structural choices (framework, scene architecture, state management,
  touch controls, ...). Read these before making a structural change.

## For content changes

If you're adding an NPC, item, enemy, or room rather than changing
mechanics, use the Claude Code skills in `.claude/skills/` instead of
writing the boilerplate by hand — they scaffold the entity/scene and tell
you which of these docs to update. See the "Content skills" section in the
top-level [`README.md`](../README.md).
