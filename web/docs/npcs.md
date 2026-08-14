# NPCs

All NPCs extend the `NPC` base class (`src/entities/NPC.ts`), which
handles the shared bits: a static Arcade sprite, an optional floating
quest icon (`showQuestIcon`), and two hooks every scene calls into:

- `talk(): DialoguePage[] | null` — what to show in the
  [`DialogueBox`](./gameplay-mechanics.md#dialogue) when the player
  presses the action button while overlapping this NPC. `null` means
  "nothing to say right now" (the scene falls through to the next
  interaction, e.g. punching).
- `onDialogueClosed(choice?: number)` — called after the dialogue box
  closes, with the chosen option index if the last page had choices.
- `update()` — optional per-frame hook for NPCs with extra state (only
  the Sorcerer uses this, to keep its quest icon in sync).

`SimpleNPC` (also in `NPC.ts`) is a ready-made subclass for an NPC that
just shows a fixed block of text with no state — pass it a speaker name
and lines and it's done. Use it for anything that doesn't need a dialogue
tree; only write a dedicated class (like `Sorcerer`) when you need
choices or multi-step state.

## Merchant (`Le Marchand`)

- **File**: `src/entities/Merchant.ts`
- **Placed**: Town, `VILLE_ROOM.marchand` (`5216, 864`)
- **Dialogue**: a single fixed welcome message, `MARCHAND_LINES` in
  `src/constants.ts`. No choices, no state.

## Sorcerer (`Le Sorcier`)

- **File**: `src/entities/Sorcerer.ts`
- **Placed**: Town, `VILLE_ROOM.sorcier` (`288, 672`)
- **Dialogue tree** (text in `QUEST_TEXT`, `src/constants.ts`):
  1. Intro page: salutation + the three quest lines (the Necronomicon was
     stolen).
  2. Choice page: accept ("Je vais lui pêter la gueule !") or refuse
     ("J'ai bien trop peur de ce mec !").
  3. On accept: shows a confirmation line the next time you talk to him,
     and calls back into the scene to set `GameState.portalOpening =
     true` — see [ADR 0004](./adr/0004-cross-scene-state-via-gamestate-singleton.md).
     Once the portal is open, `talk()` returns `null` forever (matches
     the original's `if portal_is_open() { exit; }`).
  4. On refuse: shows the insult line (`QUEST_TEXT.insult`) the next time
     you talk to him, then the choice is offered again (you can change
     your mind).
- **Quest icon**: shown above his head as long as the quest hasn't been
  accepted and the portal isn't open (`Sorcerer.update()`).
- **Constructor takes two callbacks** rather than reaching into scene/game
  state directly: `openPortal: () => void` and
  `isPortalOpen: () => boolean`. This keeps the entity testable/reusable
  without hardcoding a dependency on `GameState`; `TownScene` is what
  wires them to the real `GameState.portalOpening`/`portalOpened` flags.

## Guard (`Le Garde`)

- **File**: `SimpleNPC` instance, constructed in `GraveyardScene`
- **Placed**: Graveyard, `GRAVEYARD_ROOM.guard` (`9392, 704` — a fixed
  position, matching the original object forcing its own coordinates on
  create)
- **Dialogue**: fixed lines, `GUARD_LINES` in `src/constants.ts`
  ("Rendu hors de la ville, je ne peux plus rien pour toi.").

## Not currently in the game: Trainer, Necromancer

Both exist as sprites and have dialogue/flavor text ported into
`src/constants.ts` (`TRAINER_LINES`) and asset files
(`public/assets/npc/trainer_0.png`, `necromancer_0.png`), but — matching
the original GameMaker project, where neither object was placed in any
room either — they aren't instantiated in any scene. They're good
starting points for a next quest (e.g. a combat trainer that teaches a new
move, or the Necromancer as the actual target of the Sorcerer's quest,
currently implied but never seen). Use the `add-npc` skill to place one.
