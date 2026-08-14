// Type-only augmentation matching the globals main.ts attaches to `window`
// (see the comment above `window.__game = game` in src/main.ts). Keeps
// `page.evaluate(() => window.__game...)` calls in this test suite typed
// without pulling the whole `src` program into Playwright's compilation.
import type { Game } from "phaser";
import type { GameState } from "../src/state/GameState";

declare global {
  interface Window {
    __game: Game;
    __gameState: typeof GameState;
  }
}

export {};
