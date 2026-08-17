import { test, expect } from "@playwright/test";

test.describe("HydraScope E2E Demo Journey Test Suite", () => {
  test("completes end-to-end security investigation flow on localhost", async ({ page }) => {
    // 1. Open HydraScope
    await page.goto("http://localhost:3000");

    // 2. Verify header & status badge
    await expect(page.locator("header")).toContainText("HYDRASCOPE");
    await expect(page.locator("header")).toContainText("HYDRA DB");

    // 3. Search compromised package
    const searchInput = page.locator("input[placeholder*='analyze package']");
    await searchInput.fill("evil-lib@2.0.0");

    // 4. Click ANALYZE button
    const analyzeButton = page.locator("button:has-text('ANALYZE')");
    await analyzeButton.click();

    // 5. Wait for analysis & verify stat row metrics
    await expect(page.locator("section:has-text('REPOS')")).toBeVisible();

    // 6. Verify Investigation Tabs work
    const vulnTab = page.locator("button:has-text('VULNERABILITY')");
    await vulnTab.click();
    await expect(page.locator("text=GHSA-evil-2026-9999")).toBeVisible();

    const exposureTab = page.locator("button:has-text('EXPOSURE')");
    await exposureTab.click();
    await expect(page.locator("text=EXPOSURE WINDOW")).toBeVisible();

    const maintainersTab = page.locator("button:has-text('MAINTAINERS')");
    await maintainersTab.click();
    await expect(page.locator("text=evil-actor")).toBeVisible();

    const typosquatsTab = page.locator("button:has-text('TYPOSQUATS')");
    await typosquatsTab.click();
    await expect(page.locator("text=evillib")).toBeVisible();

    const evidenceTab = page.locator("button:has-text('EVIDENCE')");
    await evidenceTab.click();
    await expect(page.locator("text=Verified Graph Evidence Chains")).toBeVisible();

    // 7. Verify AI Explanation panel
    await expect(page.locator("text=Why is this dangerous?")).toBeVisible();
    await expect(page.locator("text=Generated from HydraDB evidence")).toBeVisible();
  });
});
