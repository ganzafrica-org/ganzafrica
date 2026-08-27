/**
 * Documents page union: HR asked to see "all kinds of documents" — policies from hr_policies
 * (a separate table/feature) now appear alongside real hr_documents rows in the same list,
 * filterable/searchable the same way, but routed to the policies download endpoint on open
 * rather than the document-specific viewer (which only knows about hr_documents rows).
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import DocumentManagementPage from "@/app/documents/page";

const API = "http://localhost:3002/api";

afterEach(() => cleanup());

vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({ roles: ["hr"], user: { name: "Test HR" }, isAuthenticated: true }),
}));

function mockFeeds(documents: unknown[], policies: unknown[]) {
  server.use(
    http.get(`${API}/hr/documents`, () =>
      HttpResponse.json({
        data: documents,
        page: 1,
        limit: 200,
        total: documents.length,
        totalPages: 1,
      }),
    ),
    http.get(`${API}/hr/policies`, () =>
      HttpResponse.json({ data: policies, total: policies.length }),
    ),
  );
}

const realDoc = {
  id: "doc-1",
  document_name: "Onboarding Checklist",
  category: "Onboarding Materials",
  version: "1",
  description: "Steps for new hires",
  department: "HR",
  fileSize: "12 KB",
  downloads: 3,
  status: "PUBLISHED",
  access: {},
  contract_id: null,
  modifiedAt: "2026-06-01T00:00:00Z",
  createdBy: { id: null, fullName: "" },
};

const policy = {
  id: "pol-1",
  title: "Remote Work Policy",
  content: "Employees may work remotely up to 3 days a week.",
  category: "General",
  policyCategory: "GENERAL",
  version: "2",
  fileSize: "8 KB",
  downloads: 5,
  isActive: true,
  status: "PUBLISHED",
  createdById: null,
  modifiedAt: "2026-05-01T00:00:00Z",
  createdAt: "2026-05-01T00:00:00Z",
};

describe("DocumentManagementPage — unified feed (documents + policies)", () => {
  it("shows both real documents and policies in the same list, under the Policies & Procedures category", async () => {
    mockFeeds([realDoc], [policy]);
    renderWithClient(<DocumentManagementPage />);

    expect(await screen.findByText("Onboarding Checklist")).toBeInTheDocument();
    expect(await screen.findByText("Remote Work Policy")).toBeInTheDocument();

    const policyRow = screen.getByText("Remote Work Policy").closest("tr")!;
    expect(within(policyRow).getByText("Policies & Procedures")).toBeInTheDocument();
  });

  it("routes a policy row's download to the policies endpoint, not the documents one", async () => {
    mockFeeds([], [policy]);
    renderWithClient(<DocumentManagementPage />);

    const policyRow = (await screen.findByText("Remote Work Policy")).closest("tr")!;
    await userEvent.click(within(policyRow).getByRole("button"));

    // DropdownMenuItem (asChild) puts role="menuitem" on the merged <a>, overriding its implicit
    // link role — so this is a menuitem query, not a link query.
    const downloadItem = await screen.findByRole("menuitem", { name: /download/i });
    expect(downloadItem).toHaveAttribute("href", `${API}/hr/policies/pol-1/download`);
  });

  it("counts policies into the Total Documents stat", async () => {
    mockFeeds([realDoc], [policy]);
    renderWithClient(<DocumentManagementPage />);

    await screen.findByText("Onboarding Checklist");
    const totalDocsLabel = screen.getByText("Total Documents");
    const statCard = totalDocsLabel.closest("div")!.parentElement!;
    expect(within(statCard).getByText("2")).toBeInTheDocument();
  });
});
