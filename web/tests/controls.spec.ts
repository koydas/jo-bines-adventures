import { test, expect } from "@playwright/test";
import "./global.d.ts";
import { holdKeyUntil, holdTouchUntil, startGame, tapKey, townPlayer, graveyardPlayer } from "./helpers";

/**
 * True end-to-end tests: these drive the character with the actual inputs
 * a player uses — held keys, tapped/held on-screen touch buttons — rather
 * than seeding state directly and only checking the outcome (that's what
 * tests/smoke.spec.ts does, faster but shallower). Where a test still
 * seeds some state (money, HP, an approximate starting position), it's
 * only to get within real walking distance of the interaction under test
 * quickly — the interaction itself is always driven by real input.
 *
 * See tests/helpers.ts for why movement is polled-until-condition rather
 * than held-for-a-fixed-duration.
 */

test.describe("movement — keyboard", () => {
  test("holding the right arrow walks the player right", async ({ page }) => {
    await startGame(page);
    const start = await townPlayer(page);

    // holdKeyUntil releases the key as soon as the condition passes, so
    // checking `action` afterwards would already see the post-release
    // idle state — capture whether we were running *during* the hold
    // instead, as part of the poll condition itself.
    let sawRunning = false;
    await holdKeyUntil(page, "ArrowRight", async () => {
      const player = await townPlayer(page);
      if (player.action === "run") sawRunning = true;
      return player.x > start.x + 20;
    });

    expect(sawRunning).toBe(true);
    await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.player.body.velocity.x), { timeout: 5_000 }).toBe(0);
    expect((await townPlayer(page)).action).toBe("idle");
  });

  test("holding the left arrow walks the player left", async ({ page }) => {
    await startGame(page);
    const start = await townPlayer(page);

    let sawRunning = false;
    await holdKeyUntil(page, "ArrowLeft", async () => {
      const player = await townPlayer(page);
      if (player.action === "run") sawRunning = true;
      return player.x < start.x - 20;
    });

    expect(sawRunning).toBe(true);
    await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.player.body.velocity.x), { timeout: 5_000 }).toBe(0);
  });

  test("the player can't be walked past the left edge of the room", async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => (window.__game.scene.keys.Town.player.x = 200));

    await page.keyboard.down("ArrowLeft");
    await expect.poll(async () => (await townPlayer(page)).x, { timeout: 15_000 }).toBeLessThan(80);
    // keep holding past the point it should hit the world bound
    // eslint-disable-next-line playwright/no-wait-for-timeout -- deliberately holding at the wall, nothing to poll toward
    await page.waitForTimeout(1000);
    await page.keyboard.up("ArrowLeft");

    expect((await townPlayer(page)).x).toBeGreaterThanOrEqual(0);
  });
});

test.describe("movement — touch controls", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("holding the on-screen right button walks the player right", async ({ page }) => {
    await startGame(page);
    const start = await townPlayer(page);
    const rightBtn = page.getByLabel("Droite");

    await holdTouchUntil(page, rightBtn, async () => (await townPlayer(page)).x > start.x + 20);

    await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.player.body.velocity.x), { timeout: 5_000 }).toBe(0);
  });

  test("holding the on-screen left button walks the player left", async ({ page }) => {
    await startGame(page);
    const start = await townPlayer(page);
    const leftBtn = page.getByLabel("Gauche");

    await holdTouchUntil(page, leftBtn, async () => (await townPlayer(page)).x < start.x - 20);

    await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.player.body.velocity.x), { timeout: 5_000 }).toBe(0);
  });
});

test.describe("buying a potion", () => {
  // A safe spot right next to the potion stand (5440) that doesn't also
  // overlap the Merchant (5216) — see the comment in tests/smoke.spec.ts's
  // equivalent seed position for why that matters (the action button
  // prioritizes talking to an NPC over buying).
  const NEAR_POTION_X = 5500;

  test("walking to the stand and pressing the action button buys a potion", async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.keys.Town;
      scene.player.money = 10;
      scene.player.x = 5150; // ~350px short — the walk itself is real, not teleported all the way
    });

    await holdKeyUntil(page, "ArrowRight", async () => (await townPlayer(page)).x >= NEAR_POTION_X);
    await tapKey(page, "Control");

    await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.player.nbPotions), { timeout: 10_000 }).toBe(1);
    expect((await townPlayer(page)).money).toBe(5);
  });

  test("can't buy without enough money", async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.keys.Town;
      scene.player.money = 0;
      scene.player.x = 5150;
    });

    await holdKeyUntil(page, "ArrowRight", async () => (await townPlayer(page)).x >= NEAR_POTION_X);
    await tapKey(page, "Control");

    // nothing to poll toward — assert the (lack of a) change holds after a beat
    await page.waitForTimeout(500);
    const player = await townPlayer(page);
    expect(player.nbPotions).toBe(0);
    expect(player.money).toBe(0);
  });
});

test.describe("buying a potion — touch controls", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });
  const NEAR_POTION_X = 5500;

  test("walking to the stand with the D-pad and buying with the touch action button", async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.keys.Town;
      scene.player.money = 10;
      scene.player.x = 5150;
    });

    const rightBtn = page.getByLabel("Droite");
    await holdTouchUntil(page, rightBtn, async () => (await townPlayer(page)).x >= NEAR_POTION_X);

    await page.getByLabel("Attaquer / Parler").dispatchEvent("touchstart");
    await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.player.nbPotions), { timeout: 10_000 }).toBe(1);
  });
});

test.describe("drinking a potion", () => {
  test("pressing the item button drinks a potion and restores HP", async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.keys.Town;
      scene.player.nbPotions = 1;
      scene.player.hp = 3;
    });

    await tapKey(page, "Shift");

    await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.player.hp), { timeout: 10_000 }).toBe(10);
    expect((await townPlayer(page)).nbPotions).toBe(0);
  });

  test("does nothing with zero potions in stock", async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => (window.__game.scene.keys.Town.player.hp = 3));

    await tapKey(page, "Shift");

    await page.waitForTimeout(500);
    expect((await townPlayer(page)).hp).toBe(3);
  });
});

test.describe("drinking a potion — touch controls", () => {
  test.use({ hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } });

  test("tapping the touch item button drinks a potion and restores HP", async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => {
      const scene = window.__game.scene.keys.Town;
      scene.player.nbPotions = 1;
      scene.player.hp = 2;
    });

    await page.getByLabel("Potion").dispatchEvent("touchstart");

    await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.player.hp), { timeout: 10_000 }).toBe(10);
  });
});

test.describe("walking into interactions", () => {
  test("walking up to the Sorcerer and pressing action opens dialogue", async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => (window.__game.scene.keys.Town.player.x = 600));

    await holdKeyUntil(page, "ArrowLeft", async () => (await townPlayer(page)).x <= 320);
    await tapKey(page, "Control");

    await expect.poll(() => page.evaluate(() => window.__game.scene.keys.Town.dialogue.visible), { timeout: 10_000 }).toBe(true);
    const shown = await page.evaluate(() => window.__game.scene.keys.Town.dialogue.currentPage());
    expect(shown?.speaker).toBe("Le Sorcier");
  });

  test("walking into an aggroed skeleton and punching it deals damage", async ({ page }) => {
    await startGame(page);
    await page.evaluate(() => window.__game.scene.keys.Town.scene.start("Graveyard"));
    await expect.poll(() => page.evaluate(() => window.__game.scene.isActive("Graveyard")), { timeout: 10_000 }).toBe(true);
    await page.evaluate(() => (window.__game.scene.keys.Graveyard.player.x = 950));

    // A more generous timeout than other movement tests: this room also
    // runs 6 skeletons' AI + combat overlap checks every frame, which
    // measurably slows effective game-time under CPU contention (see
    // docs/adr/0002 on delta-clamped physics/animation).
    await holdKeyUntil(page, "ArrowLeft", async () => (await graveyardPlayer(page)).x <= 650, 30_000);
    await tapKey(page, "Control");

    // the skeleton may counter-attack in the same exchange — either HP
    // total moving is evidence the punch (or its retaliation) connected
    await expect
      .poll(
        () =>
          page.evaluate(() => {
            const scene = window.__game.scene.keys.Graveyard;
            const anySkeletonHurt = scene["skeletons"].some((s: { hp: number }) => s.hp < 10);
            return anySkeletonHurt || scene.player.hp < 10;
          }),
        { timeout: 15_000 },
      )
      .toBe(true);
  });
});
