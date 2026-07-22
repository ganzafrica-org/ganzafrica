import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// Drive the nav purely by role. Mock every heavy dependency the navbar pulls in.
const authState: { role: string } = { role: "EMPLOYEE" };
vi.mock("@/hooks/useAuth", () => ({
  useAuth: () => ({
    user: { role: authState.role },
    roles: [],
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));
vi.mock("next/navigation", () => ({ usePathname: () => "/" }));
vi.mock("next-themes", () => ({ useTheme: () => ({ theme: "light", setTheme: vi.fn() }) }));

import { Navbar } from "@/components/navbar";

afterEach(cleanup);

describe("Recruitment nav item is permission-driven", () => {
  it("is hidden for an EMPLOYEE (no recruitment access)", () => {
    authState.role = "EMPLOYEE";
    render(<Navbar />);
    expect(screen.queryByText("Recruitment")).not.toBeInTheDocument();
  });

  it("is visible for HR", () => {
    authState.role = "HR";
    render(<Navbar />);
    expect(screen.getAllByText("Recruitment").length).toBeGreaterThanOrEqual(1);
  });
});
