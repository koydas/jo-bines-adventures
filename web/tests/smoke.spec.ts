import { test, expect, type Page } from "@playwright/test";
import "./global.d.ts";

/**
 * End-to-end smoke tests against the production build. These aren't a
 * substitute for playing the game, but they catch "the build is broken" /
 * "a core loop no longer works" regressions automatically on every push —
 * see .github/workflows/smoke-tests.yml and the badge in README.md.
 *
 * Everything the game draws through Phaser (titles, dialogue, HUD, "Vous
 * avez perdu", ...) is rasterized to a <canvas> — there's no DOM text for
 * Playwright's getByText to find. So these tests assert on game state via
 * window.__game / window.__gameState (see the comment in src/main.ts)
 * instead of visible text, except for the on-screen touch controls, which
 * are real DOM elements (see src/systems/TouchControls.ts) and are
 * asserted on normally.
 *
 * Game time can run slower than wall-clock time under constrained/headless
 * rendering (animations and Arcade Physics are both delta-time driven, and
 * Phaser clamps delta on slow frames rather than trying to catch up — see
 * docs/adr/0002-port-to-typescript-and-phaser.md). Assertions below poll
 * with generous timeouts instead of using fixed waits, so this suite stays
 * reliable on slower CI runners.
 */

async function tapKey(page: Page, key: string) {
  await page.keyboard.down(key);
  await page.keyboard.up(key);
}

async function startGame(page: Page) {
  await page.goto("/");
  await page.waitForFunction(() => !!window.__game);
  await expect.poll(() => page.evaluate(() => window.__game.scene.isActive("MainMenu")), { timeout: 15_000 }).toBe(true);

  const viewport = page.viewportSize() ?? { width: 800, height: 600 };
  await page.mouse.click(viewport.width / 2, viewport.height / 2);

  await expect.poll(() => page.evaluate(() => window.__game.scene.isActive("Town")), { timeout: 15_000 }).toBe(true);
}

function townPlayer(page: Page) {
  return page.evaluate(() => {
    const p = window.__game.scene.keys.Town.player;
    return { x: p.x, hp: p.hp, maxHp: p.maxHp, money: p.money, nbPotions: p.nbPotions };
  });
}

/** Talks to the Sorcerer and accepts the quest, opening the portal. */
async function acceptQuest(page: Page) {
  await page.evaluate(() => (window.__game.scene.keys.Town.player.x = 288));

  // page 1: intro
  await tapKey(page, "Control");
  await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.dialogue.visible), { timeout: 10_000 }).toBe(true);

  // page 2: accept / refuse choice
  await tapKey(page, "Control");
  await expect
    .poll(() => page.evaluate(() => window.__game.scene.keys.Town.dialogue.currentPage()?.choices?.length ?? 0), {
      timeout: 10_000,
    })
    .toBeGreaterThan(0);

  // confirm the highlighted choice — index 0, "accept"
  await tapKey(page, "Control");
}

test.describe("boot & main menu", () => {
  test("loads and reaches the main menu", async ({ page }) => {
    await page.goto("/");
    await expect.poll(() => page.evaluate(() => window.__game?.scene.isActive("MainMenu")), { timeout: 15_000 }).toBe(true);
  });

  test("starting the game spawns the player in Town at full HP", async ({ page }) => {
    await startGame(page);
    const player = await townPlayer(page);
    expect(player.hp).toBe(player.maxHp);
    expect(player.money).toBe(0);
  });
});

test.describe("shop", () => {
  test("talking to the Merchant shows the welcome dialogue", async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => (window.__game.scene.keys.Town.player.x = 5216));
    await tapKey(page, "Control");

    await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.dialogue.visible), { timeout: 10_000 }).toBe(true);
    const shown = await page.evaluate(() => window.__game.scene.keys.Town.dialogue.currentPage());
    expect(shown?.speaker).toBe("Le Marchand");
    expect(shown?.lines.join(" ")).toMatch(/boutique/i);
  });

  test("buying a potion spends money and stocks one", async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.keys.Town;
      scene.player.money = 10; // earning it via combat is covered by the graveyard tests below
      // Just past the potion stand (5440) rather than exactly on it: the
      // Merchant sits at 5216, and overlapping()'s +60px mobile-friendly
      // padding means standing exactly at 5440 also (barely) overlaps the
      // Merchant's hitbox — the action button prioritizes NPCs, so that
      // would talk instead of buy. 5500 is unambiguously shop-only.
      scene.player.x = 5500;
    });
    await tapKey(page, "Control");

    await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.player.nbPotions), { timeout: 10_000 }).toBe(1);
    const player = await townPlayer(page);
    expect(player.money).toBe(5);
  });
});

test.describe("Sorcerer quest & the portal", () => {
  test("accepting the quest opens the portal", async ({ page }) => {
    await startGame(page);
    await acceptQuest(page);

    await expect.poll(() => page.evaluate(() => window.__gameState.portalOpened), { timeout: 15_000 }).toBe(true);
  });

  test("walking into the open portal enters the Graveyard", async ({ page }) => {
    await startGame(page);
    await acceptQuest(page);
    await expect.poll(() => page.evaluate(() => window.__gameState.portalOpened), { timeout: 15_000 }).toBe(true);

    await page.evaluate(() => (window.__game.scene.keys.Town.player.x = 32));
    await tapKey(page, "ArrowUp");

    await expect.poll(() => page.evaluate(() => window.__game.scene.isActive("Graveyard")), { timeout: 10_000 }).toBe(true);
  });
});

test.describe("combat in the Graveyard", () => {
  async function enterGraveyard(page: Page) {
    await startGame(page);
    // jump straight in, skipping the quest dialogue — that flow is covered above
    await page.evaluate(() => window.__game.scene.keys.Town.scene.start("Graveyard"));
    await expect.poll(() => page.evaluate(() => window.__game.scene.isActive("Graveyard")), { timeout: 10_000 }).toBe(true);
  }

  test("attacking a skeleton kills it and awards money/xp", async ({ page }) => {
    await enterGraveyard(page);
    await page.evaluate(() => (window.__game.scene.keys.Graveyard.player.x = 553));

    // repeatedly punch — the player also takes counter-damage from the
    // aggroed skeleton, same as real play; the graveyard has 6 skeletons
    // total and only 10 HP is needed to drop one, so a handful of swings
    // is enough regardless of a few missed windows
    for (let i = 0; i < 8; i++) {
      await tapKey(page, "Control");
      // eslint-disable-next-line playwright/no-wait-for-timeout -- pacing punches past the 1s attack cooldown
      await page.waitForTimeout(1200);
    }

    const player = await page.evaluate(() => window.__game.scene.keys.Graveyard.player);
    expect(player.money).toBeGreaterThan(0);
    expect(player.experience).toBeGreaterThan(0);
  });

  test("an aggroed skeleton attacks back and damages the player", async ({ page }) => {
    await enterGraveyard(page);
    await page.evaluate(() => (window.__game.scene.keys.Graveyard.player.x = 553));

    await expect
      .poll(() => page.evaluate(() => window.__game.scene.keys.Graveyard.player.hp), { timeout: 15_000 })
      .toBeLessThan(10);
  });

  test("dying transitions to Game Over, and restarting resets state", async ({ page }) => {
    await enterGraveyard(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.keys.Graveyard;
      scene.player.x = 553;
      scene.player.hp = 1; // one hit from death, keeps the test fast
    });

    await expect.poll(() => page.evaluate(() => window.__game.scene.isActive("GameOver")), { timeout: 15_000 }).toBe(true);

    const viewport = page.viewportSize() ?? { width: 800, height: 600 };
    await page.mouse.click(viewport.width / 2, viewport.height / 2);

    await expect.poll(() => page.evaluate(() => window.__game.scene.isActive("Town")), { timeout: 10_000 }).toBe(true);
    const player = await townPlayer(page);
    expect(player.hp).toBe(player.maxHp);
    expect(player.money).toBe(0);
  });
});

test.describe("mobile touch controls", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("the touch overlay is visible on a touch device", async ({ page }) => {
    await startGame(page);
    await expect(page.locator(".touch-controls")).toBeVisible();
    await expect(page.getByLabel("Gauche")).toBeVisible();
    await expect(page.getByLabel("Droite")).toBeVisible();
    await expect(page.getByLabel("Attaquer / Parler")).toBeVisible();
    await expect(page.getByLabel("Potion")).toBeVisible();
  });

  test("tapping the attack button plays the punch animation", async ({ page }) => {
    await startGame(page);
    await page.getByLabel("Attaquer / Parler").dispatchEvent("touchstart");

    await expect
      .poll(() => page.evaluate(() => window.__game.scene.keys.Town.player.action), { timeout: 10_000 })
      .toBe("attack");
  });
});

test.describe("desktop (no touch)", () => {
  // Forced explicitly rather than relying on the running project's
  // defaults, so this is deterministic under both the "desktop" and
  // "mobile" projects (see playwright.config.ts).
  test.use({ hasTouch: false, isMobile: false, viewport: { width: 1280, height: 720 } });

  test("the touch overlay is not shown on a non-touch device", async ({ page }) => {
    await startGame(page);
    await expect(page.locator(".touch-controls")).toBeHidden();
  });
});
