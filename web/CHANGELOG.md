# Changelog

All notable changes to the web version of Jo Bine's Adventures are recorded
here. The original GameMaker project (`_legacy/`) had its own build
history up to `0.3.5` (see `_legacy/builds/html5/`); this changelog
picks up from there for the new web port.

## [0.4.0] - Unreleased

### Added
- English documentation set (`docs/`): gameplay mechanics, stats, items,
  scenes, and NPCs reference, plus Architecture Decision Records
  (`docs/adr/`).
- Claude Code skills (`.claude/skills/`) to scaffold new NPCs, items,
  enemies, and rooms consistently with the existing codebase.
- Playwright smoke test suite (`tests/`) and a GitHub Actions workflow
  running them on every push/PR, with a status badge in the README.

### Changed
- Improved `README.md` with clearer setup/deploy instructions and links to
  the new documentation.

## [0.3.0] - Initial web port

The first playable version of the TypeScript + Phaser 3 port: player
movement/combat, Skeleton enemies, the Marchand/Sorcier/Guard NPCs and the
Necronomicon quest, the potion shop, the ville ⇄ Graveyard portal, touch
controls for mobile, a PWA manifest for "Add to Home Screen" on iPhone, and
a Docker/nginx setup for self-hosting. See `README.md` for what was ported
1:1 from the original GameMaker scripts and what was simplified.
