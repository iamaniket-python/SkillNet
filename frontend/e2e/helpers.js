export const generateTestUser = () => {
  const timestamp = Date.now();
  return {
    firstName: "Test",
    lastName: `User${timestamp}`,
    email: `testuser${timestamp}@example.com`,
    password: "TestPass123",
  };
};

export const registerUser = async (page, user) => {
  await page.goto("/register");
  await page.fill("#firstName", user.firstName);
  await page.fill("#lastName", user.lastName);
  await page.fill("#email", user.email);
  await page.fill("#password", user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/feed");
};

export const loginUser = async (page, user) => {
  await page.goto("/login");
  await page.fill("#email", user.email);
  await page.fill("#password", user.password);
  await page.click('button[type="submit"]');
  await page.waitForURL("/feed");
};