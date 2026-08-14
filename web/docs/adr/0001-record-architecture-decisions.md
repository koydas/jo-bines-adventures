# 1. Record architecture decisions

Date: 2026-08-14

## Status

Accepted

## Context

The web port makes a number of structural choices that aren't obvious
from reading the code alone — why Phaser and not a hand-rolled canvas
engine, why one scene class per room instead of a data-driven room
system, why a `GameState` singleton instead of Phaser's built-in registry,
and so on. Without a record, each of these gets re-litigated (or
silently violated) the next time someone — human or Claude — touches the
code.

## Decision

We use lightweight Architecture Decision Records, one Markdown file per
decision in `docs/adr/`, numbered sequentially and never renumbered or
deleted — a superseded decision gets a new ADR that says so and links
back, following the format popularized by Michael Nygard.

Each ADR answers: what was decided, what problem it solves, and what it
costs. It does not need to be long. It should be written when the
decision is made, not reconstructed later.

## Consequences

- Anyone (including a Claude Code session with no prior context on this
  repo) can read `docs/adr/` and understand why the code is shaped the
  way it is before proposing to reshape it.
- Decisions that turn out to be wrong get superseded explicitly instead
  of quietly drifting.
- This adds a small amount of process: a structural change should come
  with an ADR (new or superseding one) in the same PR.
