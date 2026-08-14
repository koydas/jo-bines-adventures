# 6. Render dialogue/HUD text with web fonts, not the original's per-letter bitmap font

Date: 2026-08-14

## Status

Accepted

## Context

The original game draws all text (dialogue, HUD numbers, instructions) by
looking up one sprite per character in a hand-authored map
(`write_text.gml`'s `global.Letters`, backed by individual letter sprites
like `A`, `E_accent_aigue`, `Number_0`, `Dollar_Sign`, ...) and blitting
them side by side. This exists because GameMaker's built-in font/text
drawing didn't give the pixel-art look the original wanted, and because it
needed accented French characters (`É`, `Ê`) the default font assets
didn't cover.

Porting that mechanism means bringing over ~40 individual letter sprites,
a lookup table, and manual line-wrapping/kerning logic — a lot of
surface area for a visual effect that a browser's own text rendering
mostly gives you for free, including proper accented-character support,
which every system font already handles correctly.

## Decision

Use Phaser's `Text` game objects with regular web font stacks
(`system-ui`, `Georgia`) throughout — `DialogueBox`, `Hud`, and every
scene's title/instructions text. No bitmap font, no per-letter sprite
lookup.

## Consequences

- Full, correct support for French accents and punctuation with zero
  extra asset work — a real gap in the original that this sidesteps
  entirely.
- Word-wrap, line-height, and layout come from `Phaser.GameObjects.Text`'s
  built-in `wordWrap`/`lineSpacing` options rather than hand-rolled
  character-width math.
- The visual result is a modern UI look (clean sans-serif dialogue text,
  a serif display font for titles) rather than the original's pixel-font
  aesthetic — a deliberate part of "modernizing" the game's presentation,
  not just its plumbing. If pixel-perfect visual parity with the original
  is wanted later, the letter sprites already exist in
  `platformer/sprites/` and could be extracted the same way
  `scripts/extract_sprites.py` extracts the other sprites — but that's a
  new decision, not a revert of this one.
