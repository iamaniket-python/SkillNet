import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser } from "./helpers.js";

test.describe("Connections", () => {
  test("user can send and accept a connection request", async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const user1 = generateTestUser();
    const user2 = generateTestUser();

    await registerUser(page1, user1);
    await registerUser(page2, user2);

    // user1 searches for user2 and connects
    await page1.goto(`/search?q=${user2.lastName}`);
    await page1.click('button:has-text("+ Connect")');

    // user2 checks pending requests and accepts
    await page2.goto("/network");
    await page2.click('button:has-text("Pending")');
    await page2.click('button:has-text("Accept")');

    // verify connection shows up for both
    await page2.click('button:has-text("Connections")');
    await expect(page2.locator(".network-list-item")).toContainText(user1.lastName);

    await context1.close();
    await context2.close();
  });
});