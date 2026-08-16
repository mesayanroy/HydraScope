import { expect, test } from "@playwright/test";

test("homepage shell is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "HydraScope" })).toBeVisible();
});

test("health endpoint responds", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toMatchObject({
    status: "ok",
    service: "hydrascope",
  });
});
