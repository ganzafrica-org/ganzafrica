/**
 * HR/admin see the curated org-settings grid; everyone else only sees a card for their own
 * profile — the deleted cards (Roles and permissions, Billing, Entities, Groups, Expenses) never
 * had a real page behind them (or, for Roles, were a fully static mock disconnected from the
 * real RBAC system) and are gone for good, not just hidden from non-HR roles.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import SettingsPage from "@/app/settings/page";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const authState: { roles: string[] } = { roles: [] };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    roles: authState.roles,
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe("Settings index page", () => {
  it("HR sees the curated org-settings grid, not the deleted cards", () => {
    authState.roles = ["hr"];
    renderWithClient(<SettingsPage />);

    expect(screen.getByText("Approval policies")).toBeInTheDocument();
    expect(screen.getByText("Time off")).toBeInTheDocument();
    expect(screen.getByText("Onboarding settings")).toBeInTheDocument();
    expect(screen.getByText("Document signing")).toBeInTheDocument();

    expect(screen.queryByText("Roles and permissions")).not.toBeInTheDocument();
    expect(screen.queryByText(/billing/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Entities")).not.toBeInTheDocument();
    expect(screen.queryByText("Groups")).not.toBeInTheDocument();
    expect(screen.queryByText(/expenses/i)).not.toBeInTheDocument();
  });

  it("admin sees the same grid as hr", () => {
    authState.roles = ["admin"];
    renderWithClient(<SettingsPage />);

    expect(screen.getByText("Time off")).toBeInTheDocument();
    expect(screen.getByText("Document signing")).toBeInTheDocument();
  });

  it("a plain employee sees only a profile card, nothing org-wide", () => {
    authState.roles = ["employee"];
    renderWithClient(<SettingsPage />);

    expect(screen.getByText("My profile")).toBeInTheDocument();
    expect(screen.queryByText("Time off")).not.toBeInTheDocument();
    expect(screen.queryByText("Document signing")).not.toBeInTheDocument();
    expect(screen.queryByText("Approval policies")).not.toBeInTheDocument();
    expect(screen.queryByText("Onboarding settings")).not.toBeInTheDocument();
  });
});
