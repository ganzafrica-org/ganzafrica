import { test, expect } from "@playwright/test";
import { openAsRole } from "./support/auth";

/**
 * Coverage for "Under Documents page, modify the way the document is view(I want you to use
 * PDFx)" (Things-to-work-on.md). The reference screenshot for that task (img_2.png) shows a
 * Sheet with a toolbar — page counter, zoom, rotate, download, print, more-options — sitting
 * above a dark scrollable canvas rendering the PDF inline.
 *
 * That toolbar is Chrome's own built-in native PDF viewer UI, not a custom-built one: it appears
 * automatically for any `<iframe src="...pdf">` pointed at a URL whose response is
 * `Content-Type: application/pdf` with no `Content-Disposition: attachment` — which is exactly
 * what `DocumentViewer`'s "pdf" branch (document-viewer.tsx) already does, backed by
 * `documentsService.getViewUrl()` (a 15-minute presigned S3/Spaces GET, no forced download
 * header — see backend `getViewUrl` in services/hr/document.service.ts).
 *
 * A real react-pdf/pdfjs-based replacement was investigated and rejected: those libraries read
 * the file via `fetch()`/XHR from the browser, which requires the storage bucket to answer CORS
 * preflights — this bucket doesn't (confirmed live: a same-origin `fetch()` against the presigned
 * URL throws "TypeError: Failed to fetch", blocked by CORS, while the plain `<iframe src>` this
 * app already uses loads fine because tag-based loads aren't subject to CORS). Swapping to
 * react-pdf would have broken the viewer, and fixing the CORS gap would require a backend change
 * outside this task's frontend-only scope.
 *
 * Headless Chromium does not ship the PDF-viewer extension that renders the native toolbar (a
 * documented Playwright/headless limitation, reproduced here too — see the task report), so this
 * spec can't assert the toolbar's pixels head-on. It instead asserts the mechanism that produces
 * that toolbar in a real browser: the Sheet embeds an `<iframe>` pointed straight at a same-tab,
 * `Content-Type: application/pdf` URL with no attachment disposition, and opening it never
 * navigates away from the Documents page or opens a new tab.
 */

test("PDF document opens inline in the detail Sheet via the native browser viewer", async ({
  browser,
}) => {
  const { context, page } = await openAsRole(browser, "hr", "/documents");

  // Fail fast (with a clear message) if a click on the PDF row ever opens a new tab instead of
  // staying inside the in-page Sheet.
  let popupOpened = false;
  context.on("page", () => {
    popupOpened = true;
  });

  // Capture every response from here on (rather than a single waitForResponse call after the
  // fact) so we can't race the iframe's own request, which may resolve before we'd get a chance
  // to start waiting for it.
  const responses: { url: string; status: number; headers: Record<string, string> }[] = [];
  page.on("response", (res) => {
    responses.push({ url: res.url(), status: res.status(), headers: res.headers() });
  });

  // Find a row for a PDF document. The seeded dev dataset always has at least one; skip if not.
  const pdfRow = page.getByText(/\.pdf$/i).first();
  await expect(pdfRow).toBeVisible({ timeout: 15_000 });
  const fileName = (await pdfRow.textContent())?.trim() ?? "";

  await pdfRow.click();

  // The Sheet shows the file's name as its heading (proves the Sheet opened, not a dead click).
  await expect(page.getByRole("heading", { name: fileName })).toBeVisible();

  // The viewer renders a bare iframe; wait for it to receive a real src (getViewUrl round-trip).
  const iframe = page.locator("iframe");
  await expect(iframe).toBeVisible();
  await expect(iframe).toHaveAttribute("src", /^https?:\/\//, { timeout: 15_000 });
  const src = await iframe.getAttribute("src");
  expect(src).toBeTruthy();

  // Give the iframe's own request time to complete — it fires asynchronously after the src
  // attribute is set, slightly after the response listener above is attached.
  await page.waitForTimeout(2000);

  // The Sheet opened in place — same document, same tab, still on /documents.
  expect(popupOpened).toBe(false);
  expect(page.url()).toContain("/documents");
  expect(context.pages().length).toBe(1);

  // getViewUrl succeeded.
  const viewUrlResponse = responses.find((r) => /\/hr\/documents\/[^/]+\/view-url/.test(r.url));
  expect(viewUrlResponse?.status).toBe(200);

  // Confirm the resource behind the iframe's src is actually inline-renderable: application/pdf
  // with no attachment disposition. This is the exact condition that makes Chrome's native
  // viewer (the toolbar in img_2.png) engage instead of downloading the file.
  const pdfResponse = responses.find((r) => src && r.url.startsWith(src.split("?")[0]));
  expect(pdfResponse, "expected a response for the iframe's pdf src").toBeTruthy();
  expect(pdfResponse!.headers["content-type"]).toContain("application/pdf");
  expect(pdfResponse!.headers["content-disposition"]).toBeUndefined();
});
