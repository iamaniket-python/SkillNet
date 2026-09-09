# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: posts.spec.js >> Posts >> user can like a post
- Location: e2e\posts.spec.js:19:3

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator: locator('.post-action-btn').first()
Expected pattern: /liked/
Received string:  "post-action-btn "
Timeout: 5000ms

Call log:
  - Expect "toHaveClass" with timeout 5000ms
  - waiting for locator('.post-action-btn').first()
    14 × locator resolved to <button class="post-action-btn ">👍 Like</button>
       - unexpected value "post-action-btn "

```

```yaml
- button "👍 Like"
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { generateTestUser, registerUser } from "./helpers.js";
  3  | 
  4  | test.describe("Posts", () => {
  5  |   test.beforeEach(async ({ page }) => {
  6  |     const user = generateTestUser();
  7  |     await registerUser(page, user);
  8  |   });
  9  | 
  10 |   test("user can create a text post", async ({ page }) => {
  11 |     await page.click(".create-post-trigger");
  12 |     const postText = `Test post ${Date.now()}`;
  13 |     await page.fill(".create-post-form textarea", postText);
  14 |     await page.click('.create-post-footer button:has-text("Post")');
  15 | 
  16 |     await expect(page.locator(".post-content").first()).toContainText(postText);
  17 |   });
  18 | 
  19 |   test("user can like a post", async ({ page }) => {
  20 |     await page.click(".create-post-trigger");
  21 |     await page.fill(".create-post-form textarea", "Post to like");
  22 |     await page.click('.create-post-footer button:has-text("Post")');
  23 | 
  24 |     const likeBtn = page.locator(".post-action-btn").first();
  25 |     await likeBtn.click();
> 26 |     await expect(likeBtn).toHaveClass(/liked/);
     |                           ^ Error: expect(locator).toHaveClass(expected) failed
  27 |   });
  28 | 
  29 |   test("user can comment on a post", async ({ page }) => {
  30 |     await page.click(".create-post-trigger");
  31 |     await page.fill(".create-post-form textarea", "Post to comment on");
  32 |     await page.click('.create-post-footer button:has-text("Post")');
  33 | 
  34 |     await page.click('button:has-text("Comment")');
  35 |     const commentText = "Nice post!";
  36 |     await page.fill(".comment-form input", commentText);
  37 |     await page.click('.comment-form button:has-text("Post")');
  38 | 
  39 |     await expect(page.locator(".comment-text").first()).toContainText(commentText);
  40 |   });
  41 | 
  42 |   test("user can delete their own post", async ({ page }) => {
  43 |     await page.click(".create-post-trigger");
  44 |     const postText = `Post to delete ${Date.now()}`;
  45 |     await page.fill(".create-post-form textarea", postText);
  46 |     await page.click('.create-post-footer button:has-text("Post")');
  47 | 
  48 |     await page.click(".post-delete-btn");
  49 |     await page.click('button:has-text("Delete")'); // confirm modal
  50 | 
  51 |     await expect(page.locator(`.post-content:has-text("${postText}")`)).toHaveCount(0);
  52 |   });
  53 | });
```