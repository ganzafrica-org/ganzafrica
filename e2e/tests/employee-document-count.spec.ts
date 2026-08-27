import { test, expect } from "@playwright/test";
import { openAsRole, HR_URL } from "./support/auth";

/**
 * Punch-list #1 — Personal Details' "Documents" count was stuck at 0. Root cause (see
 * employees-core.service.ts's getEmployeeDetail): the count only matched
 * hr_documents.created_by_employee_id, which is the *uploader*, not the document's subject — so a
 * document HR uploads and links to an employee's own contract (the common real-world case) was
 * never counted. Fixed to also count documents linked via a contract owned by the employee.
 *
 * This spec proves it live: HR creates a fresh employee, gives them a contract, uploads a document
 * against that contract (as HR, so created_by_employee_id is HR's own id, not the subject's — the
 * exact case that was broken), then opens Personal Details and confirms the count reflects it.
 */
test("Personal Details: the Documents count reflects a contract-linked document uploaded by HR, not just self-uploads", async ({
  browser,
}) => {
  const { context, page } = await openAsRole(browser, "hr");
  const api = context.request;

  await api.get("/api/hr/employees?limit=1");
  const csrfCookie = (await context.cookies()).find((c) => c.name === "ganzafrica_csrf");
  const csrfHeaders = csrfCookie ? { "X-CSRF-Token": csrfCookie.value } : {};

  const stamp = Date.now();
  const createEmp = await api.post("/api/hr/employees", {
    headers: csrfHeaders,
    data: {
      first_name: "E2E",
      last_name: `DocCount${stamp}`,
      personal_email: `e2e-doc-count-${stamp}@test.local`,
      employment_type: "staff",
    },
  });
  expect(createEmp.ok(), await createEmp.text()).toBeTruthy();
  const employee = (await createEmp.json()).employee;

  function documentsCountLink() {
    // Scope to the "Assets & documents" card (there's also an unrelated "Documents" nav link and
    // "Documents" text elsewhere on the page) — its Documents row's value is a link to /documents.
    const card = page
      .getByText("Assets & documents", { exact: true })
      .locator("xpath=ancestor::div[contains(@class,'col-span-2')][1]");
    return card
      .getByText("Documents", { exact: true })
      .locator("xpath=ancestor::div[1]")
      .getByRole("link");
  }

  // Personal Details before any document/contract: count is 0.
  await page.goto(`${HR_URL}/employees?employee=${employee.id}`);
  await expect(page.getByRole("heading", { name: `E2E DocCount${stamp}` })).toBeVisible({
    timeout: 15_000,
  });
  await expect(documentsCountLink()).toHaveText("0");

  const createContract = await api.post(`/api/hr/employees/${employee.id}/contracts`, {
    headers: csrfHeaders,
    data: {
      jobTitle: "E2E Doc Count Role",
      startDate: new Date().toISOString(),
      employmentTerm: "indefinite",
      employmentType: "full-time",
      compensationType: "salaried",
      currency: "RWF",
      status: "DRAFT",
    },
  });
  expect(createContract.ok(), await createContract.text()).toBeTruthy();
  const contract = await createContract.json();

  // Uploaded by HR (created_by_employee_id = HR's own employee id), linked to the subject's
  // contract — the case the count previously missed entirely.
  const uploadDoc = await api.post("/api/hr/documents", {
    headers: csrfHeaders,
    multipart: {
      document_name: `Signed agreement ${stamp}`,
      category: "Contract Templates",
      description: "e2e doc count coverage",
      department: "Programs",
      status: "PUBLISHED",
      contractId: contract.id,
      file: {
        name: "agreement.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("%PDF-1.4 e2e doc count"),
      },
    },
  });
  expect(uploadDoc.ok(), await uploadDoc.text()).toBeTruthy();

  await page.reload();
  await expect(page.getByRole("heading", { name: `E2E DocCount${stamp}` })).toBeVisible({
    timeout: 15_000,
  });
  await expect(documentsCountLink()).toHaveText("1", { timeout: 15_000 });
});
