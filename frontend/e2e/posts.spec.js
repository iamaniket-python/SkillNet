import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser } from "./helpers.js";

test.describe("Posts", () => {
  test.beforeEach(async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user);
  });

  test("user can create a text post", async ({ page }) => {
    await page.click(".create-post-trigger");
    const postText = `Test post ${Date.now()}`;
    await page.fill(".create-post-form textarea", postText);
    await page.click('.create-post-footer button:has-text("Post")');

    await expect(page.locator(".post-content").first()).toContainText(postText);
  });

  test("user can like a post", async ({ page }) => {
    await page.click(".create-post-trigger");
    await page.fill(".create-post-form textarea", "Post to like");
    await page.click('.create-post-footer button:has-text("Post")');

    const likeBtn = page.locator(".post-action-btn").first();
    await likeBtn.click();
    await expect(likeBtn).toHaveClass(/liked/);
  });

  test("user can comment on a post", async ({ page }) => {
    await page.click(".create-post-trigger");
    await page.fill(".create-post-form textarea", "Post to comment on");
    await page.click('.create-post-footer button:has-text("Post")');

    await page.click('button:has-text("Comment")');
    const commentText = "Nice post!";
    await page.fill(".comment-form input", commentText);
    await page.click('.comment-form button:has-text("Post")');

    await expect(page.locator(".comment-text").first()).toContainText(commentText);
  });

  test("user can delete their own post", async ({ page }) => {
    await page.click(".create-post-trigger");
    const postText = `Post to delete ${Date.now()}`;
    await page.fill(".create-post-form textarea", postText);
    await page.click('.create-post-footer button:has-text("Post")');

    await page.click(".post-delete-btn");
    await page.click('button:has-text("Delete")'); // confirm modal

    await expect(page.locator(`.post-content:has-text("${postText}")`)).toHaveCount(0);
  });
});