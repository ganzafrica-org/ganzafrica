import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// Drive the nav purely by role. Mock every heavy dependency the navbar pulls in.
// `roles` (plural, lowercase RBAC names — "hr", "employee", ...) is the real shape GET /auth/me
// returns; there is no singular `user.role` field on the wire.
const authState: { roles: string[] } = { roles: ["employee"] };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { name: "Test User" },
    roles: authState.roles,
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: vi.fn() }) }));

import { Navbar } from "@/components/navbar";

afterEach(cleanup);

describe("Recruitment nav item is permission-driven", () => {
  it("is hidden for an employee (no recruitment access)", () => {
    authState.roles = ["employee"];
    render(<Navbar />);
    expect(screen.queryByText("Recruitment")).not.toBeInTheDocument();
  });

  it("is visible for hr", () => {
    authState.roles = ["hr"];
    render(<Navbar />);
    expect(screen.getAllByText("Recruitment").length).toBeGreaterThanOrEqual(1);
  });

  it("is visible for admin", () => {
    authState.roles = ["admin"];
    render(<Navbar />);
    expect(screen.getAllByText("Recruitment").length).toBeGreaterThanOrEqual(1);
  });
});
