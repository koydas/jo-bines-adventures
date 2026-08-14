import { test, expect, type Page } from "@playwright/test";
import "./global.d.ts";
import { armActionWatch, readActionWatch, startGame, tapKey, townPlayer } from "./helpers";

/**
 * Fast integration/smoke checks against the production build: seed state
 * directly (teleport the player, grant money) to reach the interaction
 * under test quickly, then assert the outcome. These catch "the build is
 * broken" / "a core loop no longer works" regressions on every push — see
 * .github/workflows/smoke-tests.yml and the badge in README.md.
 *
 * For tests that actually drive the character with real input (held
 * movement keys, tapped touch buttons) end to end, see
 * tests/controls.spec.ts instead.
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
      // Standing exactly on the potion stand (5440): overlapping()'s +60px
      // mobile-friendly padding means the Merchant's hitbox (5216) is also
      // technically in range from here, but WorldScene.handleAction() picks
      // the *nearest* overlapping interaction, and nothing is nearer than
      // standing right on top of it — this exercises that disambiguation
      // directly instead of dodging it with a position further away.
      scene.player.x = 5440;
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
    // Headroom above the 30s poll below — see tests/controls.spec.ts's
    // identically-reasoned test.setTimeout for why this can't share the
    // global 30s per-test default.
    test.setTimeout(45_000);

    await enterGraveyard(page);
    await page.evaluate(() => {
      const player = window.__game.scene.keys.Graveyard.player;
      player.x = 553;
      // x:553 sits in a cluster of 3 skeletons (553/667/431, ~130px apart)
      // that all aggro together; damage rolls up to 3 (see
      // src/utils/random.ts), so three of them landing hits on their own
      // ~3s cooldowns can otherwise kill a 10-HP player within a few
      // seconds — before this test, which is about the *punch* landing,
      // not survival (see "an aggroed skeleton attacks back..." below for
      // that), gets a chance to land enough of its own.
      player.hp = 999;
      player.maxHp = 999;
    });

    // Punch repeatedly until a skeleton actually dies, rather than a fixed
    // number of attempts: damage rolls (1-3) and the skeleton's own
    // attack/movement AI mean the number of punches needed to land a kill
    // varies, and a fixed budget can occasionally fall short by chance —
    // this polls for the actual outcome instead of gambling on one.
    const punchAndCheckMoney = async () => {
      await tapKey(page, "Control");
      // eslint-disable-next-line playwright/no-wait-for-timeout -- pacing punches past the 1s attack cooldown
      await page.waitForTimeout(1100);
      return page.evaluate(() => window.__game.scene.keys.Graveyard.player.money);
    };
    await expect.poll(punchAndCheckMoney, { timeout: 30_000, intervals: [0] }).toBeGreaterThan(0);

    const experience = await page.evaluate(() => window.__game.scene.keys.Graveyard.player.experience);
    expect(experience).toBeGreaterThan(0);
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

    // Arm the watcher *before* dispatching the tap — see armActionWatch's
    // doc comment for why checking only after the tap (the naive
    // expect.poll approach) can miss this genuinely brief, fixed-duration
    // state entirely under this suite's tracing.
    await armActionWatch(page, "Town", "attack");
    await page.getByLabel("Attaquer / Parler").dispatchEvent("touchstart");

    expect(await readActionWatch(page)).toBe(true);
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
