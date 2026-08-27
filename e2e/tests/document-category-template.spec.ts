import { test, expect } from "@playwright/test";
import { openAsRole } from "./support/auth";

/**
 * "Add the option to create a document template" (Things-to-work-on.md): HR can design how
 * documents in a category should look from the Documents page's Categories tab — a name plus
 * one of the four brand colors (green/yellow/blue/orange). This is a standalone, additive
 * entity (hr_document_category_templates), decoupled from the existing hr_documents.category
 * enum — auto-generating a document from a template is deferred follow-up work, not covered
 * here.
 */
test("HR creates a document category template with a chosen color, and it persists across reload", async ({
  browser,
}) => {
  // A full page reload against the dev server (on-demand route compilation) plus several
  // real network round trips can comfortably exceed the default 30s budget.
  test.setTimeout(60_000);

  const { context, page } = await openAsRole(browser, "hr", "/documents");

  await page.getByRole("tab", { name: "Categories" }).click();
  await page.getByTestId("design-template-entry").click();

  await expect(page.getByText("Document Category Templates")).toBeVisible();

  await page.getByTestId("new-category-template").click();

  const uniqueName = `E2E Category ${Date.now()}`;
  await page.getByPlaceholder("e.g. Onboarding Materials").fill(uniqueName);
  await page.getByTestId("color-swatch-blue").click();
  await expect(page.getByTestId("color-swatch-blue")).toHaveAttribute("aria-checked", "true");

  await page.getByTestId("save-category-template").click();

  const row = page.getByTestId(`category-template-row-${uniqueName}`);
  await expect(row).toBeVisible();
  await expect(row.getByText("Blue")).toBeVisible();

  // Reload and re-open the same sheet — the row must still be there (real DB persistence, not
  // just client-side query cache).
  await page.reload();
  await page.getByRole("tab", { name: "Categories" }).click();
  await page.getByTestId("design-template-entry").click();

  const rowAfterReload = page.getByTestId(`category-template-row-${uniqueName}`);
  await expect(rowAfterReload).toBeVisible();
  await expect(rowAfterReload.getByText("Blue")).toBeVisible();

  await context.close();
});
