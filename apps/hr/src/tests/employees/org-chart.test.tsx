/**
 * MOD-02 §6 item 6 — org chart renders a fixture tree from GET /hr/org-chart and a node click
 * navigates to the employee's detail sheet.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, fireEvent } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";

const API = "http://localhost:3002/api";

const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    roles: ["employee"],
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

import OrgChartPage from "@/app/employees/org-chart/page";

afterEach(() => {
  cleanup();
  pushMock.mockClear();
});

const ROOT_ID = "11111111-1111-1111-1111-111111111111";
const CHILD_ID = "22222222-2222-2222-2222-222222222222";

function mockTree() {
  server.use(
    http.get(`${API}/hr/org-chart`, () =>
      HttpResponse.json({
        tree: [
          {
            id: ROOT_ID,
            name: "Ada Lovelace",
            job_title: "CEO",
            department: "Leadership",
            picture: null,
            children: [
              {
                id: CHILD_ID,
                name: "Grace Hopper",
                job_title: "Engineer",
                department: "Engineering",
                picture: null,
                children: [],
              },
            ],
          },
        ],
      }),
    ),
  );
}

describe("Org chart page", () => {
  it("renders the fixture tree and navigates to the employee on a node click", async () => {
    mockTree();
    renderWithClient(<OrgChartPage />);

    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Grace Hopper")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Grace Hopper"));

    expect(pushMock).toHaveBeenCalledWith(`/employees?employee=${CHILD_ID}`);
  });

  it("shows an empty state when the org has no structure yet", async () => {
    server.use(http.get(`${API}/hr/org-chart`, () => HttpResponse.json({ tree: [] })));
    renderWithClient(<OrgChartPage />);
    expect(await screen.findByText("No org structure yet.")).toBeInTheDocument();
  });
});
