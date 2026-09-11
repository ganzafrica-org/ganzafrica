import { afterEach, describe, it, expect } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { AssetsWithIssueCard } from "@/components/sections/home-cards/AssetsWithIssueCard";
import type { Asset } from "@/types/api";

const API = "http://localhost:3002/api";

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id: "asset-1",
    deviceName: "MacBook Pro M5",
    serialNumber: "SN-MACBOOK-001",
    categoryId: "cat-1",
    purchasePrice: null,
    status: "AVAILABLE",
    assignedToId: null,
    assignedAt: null,
    returnedAt: null,
    notes: null,
    hasIssue: "NO",
    isFlagged: false,
    createdAt: "",
    updatedAt: "",
    ...overrides,
  };
}

function mockAssets(assets: Asset[]) {
  server.use(
    http.get(`${API}/hr/assets`, () => HttpResponse.json({ success: true, data: assets })),
  );
}

describe("AssetsWithIssueCard", () => {
  it("shows only assets with an issue or a flag, not healthy ones", async () => {
    mockAssets([
      makeAsset({ id: "a1", deviceName: "Healthy Laptop", hasIssue: "NO", isFlagged: false }),
      makeAsset({ id: "a2", deviceName: "Broken Phone", hasIssue: "YES" }),
      makeAsset({ id: "a3", deviceName: "Flagged Monitor", isFlagged: true }),
    ]);
    renderWithClient(<AssetsWithIssueCard />);

    expect(await screen.findByText("Broken Phone")).toBeInTheDocument();
    expect(await screen.findByText("Flagged Monitor")).toBeInTheDocument();
    expect(screen.queryByText("Healthy Laptop")).not.toBeInTheDocument();
  });

  it("shows an empty state when nothing needs attention", async () => {
    mockAssets([makeAsset({ hasIssue: "NO", isFlagged: false })]);
    renderWithClient(<AssetsWithIssueCard />);

    expect(await screen.findByText("No assets need attention right now.")).toBeInTheDocument();
  });

  it("each row's Read more link deep-links to that specific asset", async () => {
    mockAssets([makeAsset({ id: "asset-42", deviceName: "Flagged Monitor", isFlagged: true })]);
    renderWithClient(<AssetsWithIssueCard />);

    const link = await screen.findByRole("link", { name: /read more/i });
    expect(link).toHaveAttribute("href", "/asset?asset=asset-42");
  });

  it("labels a flagged asset distinctly from a self-reported issue", async () => {
    mockAssets([
      makeAsset({ id: "a1", deviceName: "Issue Device", hasIssue: "YES", isFlagged: false }),
      makeAsset({ id: "a2", deviceName: "Flagged Device", isFlagged: true }),
    ]);
    renderWithClient(<AssetsWithIssueCard />);

    await screen.findByText("Issue Device");
    expect(screen.getByText("Issue")).toBeInTheDocument();
    expect(screen.getByText("Flagged")).toBeInTheDocument();
  });
});
