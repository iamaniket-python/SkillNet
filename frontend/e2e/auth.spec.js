import { test, expect } from "@playwright/test";
import { generateTestUser, registerUser, loginUser } from "./helpers.js";

test.describe("Authentication", () => {
  test("user can register a new account", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user);
    await expect(page).toHaveURL("/feed");
    await expect(page.locator(".navbar-logo")).toBeVisible();
  });

  test("user can log out and log back in", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user);

    // logout
    await page.click(".navbar-profile");
    await page.click('button:has-text("Sign out")');
    await expect(page).toHaveURL("/login");

    // login again
    await loginUser(page, user);
    await expect(page).toHaveURL("/feed");
  });

  test("shows error on wrong password", async ({ page }) => {
    const user = generateTestUser();
    await registerUser(page, user);
    await page.click(".navbar-profile");
    await page.click('button:has-text("Sign out")');

    await page.goto("/login");
    await page.fill("#email", user.email);
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');

    await expect(page.locator(".auth-error")).toBeVisible();
  });

  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/feed");
    await expect(page).toHaveURL("/login");
  });
});