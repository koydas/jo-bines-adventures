import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Shared helpers for both test suites:
 *  - tests/smoke.spec.ts — fast integration checks, mostly seeding state
 *    directly (teleporting the player, granting money) to get to the
 *    interaction under test quickly.
 *  - tests/controls.spec.ts — end-to-end checks that actually drive the
 *    character with the same input a player would use (held keys, tapped
 *    touch buttons), asserting the character actually moves/acts in
 *    response, not just that the resulting state is reachable.
 *
 * See the top of each file for which one you're looking at, and
 * docs/gameplay-mechanics.md#controls for the control scheme itself.
 */

export async function tapKey(page: Page, key: string) {
  await page.keyboard.down(key);
  await page.keyboard.up(key);
}

export async function startGame(page: Page) {
  await page.goto("/");
  await page.waitForFunction(() => !!window.__game);
  await expect.poll(() => page.evaluate(() => window.__game.scene.isActive("MainMenu")), { timeout: 15_000 }).toBe(true);

  const viewport = page.viewportSize() ?? { width: 800, height: 600 };
  await page.mouse.click(viewport.width / 2, viewport.height / 2);

  await expect.poll(() => page.evaluate(() => window.__game.scene.isActive("Town")), { timeout: 15_000 }).toBe(true);
}

export function townPlayer(page: Page) {
  return page.evaluate(() => {
    const p = window.__game.scene.keys.Town.player;
    return { x: p.x, hp: p.hp, maxHp: p.maxHp, money: p.money, nbPotions: p.nbPotions, action: p.action };
  });
}

export function graveyardPlayer(page: Page) {
  return page.evaluate(() => {
    const p = window.__game.scene.keys.Graveyard.player;
    return { x: p.x, hp: p.hp, maxHp: p.maxHp, money: p.money, action: p.action };
  });
}

/**
 * Holds a keyboard key down, polls `condition` until it's true (or gives
 * up), and always releases the key afterwards — including on failure, so
 * one failed assertion doesn't leave a key stuck down for the rest of the
 * test. This is deliberately condition-based rather than a fixed
 * duration: how far the character actually moves per real second varies a
 * lot with rendering performance (see docs/adr/0002 — Phaser clamps delta
 * on slow frames rather than catching up), so a fixed "hold for Nms" would
 * be flaky across machines. Polling for the outcome is not.
 */
export async function holdKeyUntil(page: Page, key: string, condition: () => Promise<boolean>, timeout = 20_000) {
  await page.keyboard.down(key);
  try {
    await expect.poll(condition, { timeout, intervals: [100] }).toBe(true);
  } finally {
    await page.keyboard.up(key);
  }
}

/** Same as holdKeyUntil, but for an on-screen touch button (see TouchControls.ts). */
export async function holdTouchUntil(page: Page, button: Locator, condition: () => Promise<boolean>, timeout = 20_000) {
  await button.dispatchEvent("touchstart");
  try {
    await expect.poll(condition, { timeout, intervals: [100] }).toBe(true);
  } finally {
    await button.dispatchEvent("touchend");
  }
}

/**
 * Arms an in-page watcher for `window.__game.scene.keys[sceneKey].player.action`
 * becoming `expected`, polling via requestAnimationFrame — call this
 * *before* triggering the action, then `readActionWatch` afterwards to get
 * the result. The player's own "attack"/"hit" states are deliberately
 * bounded to a fixed real-time window matching their animation
 * (`COOLDOWNS.attackDurationMs`/`hitStunMs`, ~250-375ms — see
 * Player.updateTimedAction()) and clear on their own once it elapses.
 * Arming the watcher first — rather than dispatching the input, awaiting
 * that, and only then starting to look — matters because *starting* a new
 * page.evaluate() round trip under this suite's tracing (`trace:
 * "retain-on-failure"`, always recording so it can be retained on
 * failure) can itself take longer than that window; by the time a
 * check-after-the-fact call is even running in the page, the state can
 * have already come and gone. A watcher already running in the page when
 * the action fires can't miss it — the same rAF loop that's about to
 * process the queued input is what makes the transition visible to it.
 */
export async function armActionWatch(page: Page, sceneKey: string, expected: string, timeoutMs = 5_000) {
  await page.evaluate(
    ({ sceneKey, expected, timeoutMs }) => {
      window.__actionWatch = new Promise<boolean>((resolve) => {
        const deadline = performance.now() + timeoutMs;
        function check() {
          if (window.__game.scene.keys[sceneKey].player.action === expected) return resolve(true);
          if (performance.now() >= deadline) return resolve(false);
          requestAnimationFrame(check);
        }
        check();
      });
    },
    { sceneKey, expected, timeoutMs },
  );
}

/** Reads the result armed by `armActionWatch` — call after triggering the action. */
export function readActionWatch(page: Page): Promise<boolean> {
  return page.evaluate(() => window.__actionWatch);
}
