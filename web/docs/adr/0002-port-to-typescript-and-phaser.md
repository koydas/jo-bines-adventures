# 2. Port the game to TypeScript + Phaser 3, out of GameMaker

Date: 2026-08-14

## Status

Accepted

## Context

The original game (`platformer/`) is a GameMaker Studio 2 project: GML
scripts and `.yy`/`.yyp` JSON-ish resource files, edited and compiled
through GameMaker's own IDE. Two goals drove wanting to change that:

1. **Play easily on iPhone.** GameMaker can export to HTML5 (there are
   zipped builds up to `0.3.5` in `platformer/builds/html5/`), so a
   browser build was already technically possible — but the game had no
   touch input at all (`character_controls_rules.gml` only reads
   keyboard and gamepad), so it wasn't actually playable on a phone
   without adding touch controls to the GML project first.
2. **Keep developing with Claude Code.** GameMaker Studio is a licensed,
   GUI-only IDE with no headless Linux build/run path available in this
   environment. Claude Code could edit the `.gml`/`.yy` text files, but
   could never compile, run, or screenshot the result to verify a change
   — every change would need a human to open GameMaker, export, and
   report back before the next change could be made.

## Decision

Rewrite the game as a new project (`web/`) in TypeScript, using
[Phaser 3](https://phaser.io) for rendering/animation/Arcade Physics/input,
built with Vite. Gameplay content (stats, dialogue text, room layout) is
re-derived from the original GML scripts and room files and re-implemented
in the new codebase — this is a rewrite of the engine layer, not an
automatic transpilation, so the two codebases can and do diverge in how
they implement the same behavior (see the "simplified" ADRs below for
where that divergence is deliberate).

Phaser 3 (over Phaser 4, or a hand-rolled `<canvas>` engine) specifically
because it's stable, extensively documented, has first-class Arcade
Physics for exactly this kind of 2D side-view game, and is well-proven on
mobile Safari.

## Consequences

- Claude Code can build, type-check, run, and screenshot-verify every
  change in this repository end-to-end, with no external IDE or human
  build step in the loop.
- The game runs anywhere a browser does, including installed to the
  iPhone home screen as a fullscreen PWA — no App Store, no native build.
- `platformer/` (GameMaker) and `web/` (Phaser) are now two separate
  implementations of the same game. `platformer/` is kept as the
  historical/reference version; `web/` is where active development
  happens. Content added to one does not automatically appear in the
  other.
- The original's bitmap-font text rendering, camera-lock shop
  choreography, and other GameMaker-specific mechanisms don't carry over
  directly — see ADR 0006 and ADR 0007 for what replaced them and why.
