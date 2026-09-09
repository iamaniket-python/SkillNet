import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser } from "./helpers.js";

test.describe("Messaging", () => {
  test("users can send and receive real-time messages", async ({ browser }) => {
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    const user1 = generateTestUser();
    const user2 = generateTestUser();

    await registerUser(page1, user1);
    await registerUser(page2, user2);

    await page1.goto(`/search?q=${user2.lastName}`);
    await page1.click(`.search-result-name:has-text("${user2.lastName}")`);
    await page1.click('button:has-text("Message")');

    const messageText = `Hello ${Date.now()}`;
    await page1.fill(".messages-chat-input input", messageText);
    await page1.click('.messages-chat-input button:has-text("Send")');

    await expect(page1.locator(".chat-bubble.sent").last()).toContainText(messageText);

    await page2.goto("/messages");
    await page2.click(".conversation-item");
    await expect(page2.locator(".chat-bubble.received").last()).toContainText(messageText, {
      timeout: 5000,
    });

    await context1.close();
    await context2.close();
  });
});