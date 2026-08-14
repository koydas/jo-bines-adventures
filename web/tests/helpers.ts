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
