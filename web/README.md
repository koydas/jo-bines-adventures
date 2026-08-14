# Les Aventures de Jo Bine — web edition

[![Smoke Tests](https://github.com/koydas/jo-bines-adventures/actions/workflows/smoke-tests.yml/badge.svg)](https://github.com/koydas/jo-bines-adventures/actions/workflows/smoke-tests.yml)
[![End-to-End Tests](https://github.com/koydas/jo-bines-adventures/actions/workflows/e2e-tests.yml/badge.svg)](https://github.com/koydas/jo-bines-adventures/actions/workflows/e2e-tests.yml)

A modern **TypeScript + [Phaser 3](https://phaser.io)** port of the original
GameMaker game (`_legacy/`), built to be played straight from a browser —
including iPhone Safari, with touch controls and "Add to Home Screen"
support — and to be easy to keep developing with Claude Code, without
needing GameMaker Studio installed. See
[ADR 0002](docs/adr/0002-port-to-typescript-and-phaser.md) for why.

Game content — stats, French dialogue text, room layout, combat/shop/quest
mechanics — is re-derived from the original GameMaker scripts and room
files. Every source file that ports one has a comment at the top pointing
to the original `.gml`/`.yy` it came from.

## Documentation

| | |
|---|---|
| [`docs/gameplay-mechanics.md`](docs/gameplay-mechanics.md) | How movement, combat, dialogue, the shop, quests, and room transitions work, and where the code for each lives |
| [`docs/stats.md`](docs/stats.md) | Every balance number (HP, damage, speed, cooldowns, prices) |
| [`docs/items.md`](docs/items.md) | Items and currencies |
| [`docs/scenes.md`](docs/scenes.md) | Every scene/room: purpose, size, contents, entry/exit |
| [`docs/npcs.md`](docs/npcs.md) | Every NPC: dialogue tree, side effects, placement |
| [`docs/adr/`](docs/adr/) | Architecture Decision Records — the *why* behind structural choices |
| [`CHANGELOG.md`](CHANGELOG.md) | Version history |

## Content skills

Adding an NPC, item, enemy, or room? Use the matching Claude Code skill
instead of writing the boilerplate by hand — each one scaffolds the
entity/scene consistently with the existing codebase and tells you which
doc to update:

- `.claude/skills/add-npc/` — a new character (dialogue, sprite, placement)
- `.claude/skills/add-item/` — a new purchasable or usable item
- `.claude/skills/add-enemy/` — a new enemy type (AI, stats, combat wiring)
- `.claude/skills/add-room/` — a new playable room/scene

## Development

```bash
npm install
npm run dev       # dev server at http://localhost:5173
npm run build     # type-check + production build into dist/
npm run preview   # serve the production build locally
```

Open `http://localhost:5173` in a browser, or on your iPhone via your
machine's local IP (e.g. `http://192.168.x.x:5173`, same Wi-Fi network),
to test the game.

### Re-extracting sprites from the GameMaker project

If you change a sprite in `_legacy/` (GameMaker Studio), re-run the
extraction script to sync `public/assets/`:

```bash
python3 scripts/extract_sprites.py
```

### Testing

Two Playwright suites, both driving the actual production build
(`vite preview`, not the dev server) on both a desktop and a touch/mobile
viewport, and both running in CI on every push:

```bash
npm run test:smoke   # fast integration checks (.github/workflows/smoke-tests.yml)
npm run test:e2e     # slower, controls-driven end-to-end checks (.github/workflows/e2e-tests.yml)
npm test             # both
```

- [`tests/smoke.spec.ts`](tests/smoke.spec.ts) seeds state directly
  (teleports the player, grants money) to reach an interaction quickly and
  checks the outcome — the core loops (menu → town → shop → quest →
  portal → combat → death/restart) in a few seconds each.
- [`tests/controls.spec.ts`](tests/controls.spec.ts) instead drives the
  character with the same input a player uses — held movement keys,
  tapped/held on-screen touch buttons — and asserts the character actually
  moves and reacts: walking with the keyboard and the touch D-pad, walking
  to and buying a potion, drinking one, walking into the Sorcerer and a
  Skeleton. Slower (real walking takes real time), but it's exercising the
  controls themselves, not just the state they lead to.

See [`tests/helpers.ts`](tests/helpers.ts) for the shared setup and for
why movement assertions poll for an outcome instead of holding a key for a
fixed duration.

## Deploying to your own server (Docker)

```bash
docker compose up -d --build
```

This builds the image (Node build → nginx serving static files) and
exposes it on port `8080`. If you already run a reverse proxy (Caddy,
Traefik, nginx) with HTTPS on your server, point it at this port instead
of publishing `8080` directly — **HTTPS is required** for "Add to Home
Screen" to work well on iPhone.

Without Docker:

```bash
npm run build
# serve dist/ with any static file server (nginx, Caddy, `npx serve dist`, ...)
```

## Playing on iPhone

1. Open the game's URL in Safari.
2. Tap the share button, then "Add to Home Screen" to install it as an app
   (fullscreen, no Safari chrome).
3. Touch controls (movement, potion, attack/talk) appear automatically on
   touch devices; keyboard/gamepad work too on desktop.

## What's ported vs. simplified

- **Ported faithfully**: stats (HP, damage, speeds, cooldowns), French
  dialogue/quest text, NPC/portal/shop positions, combat/NPC/portal
  mechanics.
- **Modernized**: text rendering uses a web font instead of the original's
  per-letter bitmap font ([ADR 0006](docs/adr/0006-modern-text-rendering-instead-of-bitmap-font.md));
  entering the general store is simplified to a direct buy point instead
  of the original's "enter the house, lock the camera" choreography
  ([ADR 0007](docs/adr/0007-simplified-shop-and-decoration.md)); background
  decoration (grass, rocks, trees) is placed procedurally rather than
  pixel-for-pixel from the original room files.
- **Room to grow**: `Necromancer` and `Trainer` exist as sprites/dialogue
  text but have no in-game logic in the original GameMaker project either
  — see [`docs/npcs.md`](docs/npcs.md#not-currently-in-the-game-trainer-necromancer)
  for why they're good starting points for a next quest.
