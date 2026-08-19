/**
 * MOD-01 §6 item 8 — profile self-edit: disallowed (HR-owned) fields are absent from the form
 * payload sent to PATCH /hr/employees/me/profile. The form only exposes SELF_EDITABLE_FIELDS, so
 * this proves it structurally rather than just asserting a server 422.
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import EditProfileModal from "@/components/sections/user-profile/edit-profile-modal";
import type { Employee } from "@/types/api";

const API = "http://localhost:3002/api";

afterEach(() => cleanup());

const employee: Employee = {
  id: "11111111-1111-1111-1111-111111111111",
  user_id: 1,
  first_name: "Ada",
  last_name: "Lovelace",
  work_email: "ada@example.com",
  personal_email: "ada@personal.example.com",
  employee_number: "GZ001",
  job_title: "Engineer",
  department: "Engineering",
  employment_type: "staff",
  status: "active",
  picture: null,
  phone: "0788000111",
  citizenship: "Rwandan",
  home_country: "Rwanda",
  home_city: "Kigali",
  hired_at: "2024-01-15",
  manager: null,
  account: { email: "ada@example.com", is_active: true },
  contract_currency: null,
  is_active: true,
};

const SELF_EDITABLE_FIELDS = [
  "phone",
  "picture",
  "personal_email",
  "home_city",
  "home_country",
  "citizenship",
];

describe("Profile self-edit", () => {
  it("sends only self-editable fields, never HR-owned ones like job_title or status", async () => {
    const captured: { body: Record<string, unknown> | null } = { body: null };
    server.use(
      http.patch(`${API}/hr/employees/me/profile`, async ({ request }) => {
        captured.body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ me: { ...employee, phone: "0788999999" } });
      }),
    );

    renderWithClient(<EditProfileModal isOpen employee={employee} onClose={vi.fn()} />);

    const phoneInput = await screen.findByPlaceholderText("Phone number");
    await userEvent.clear(phoneInput);
    await userEvent.type(phoneInput, "0788999999");

    await userEvent.click(screen.getByRole("button", { name: /^save$/i }));

    await waitFor(() => expect(captured.body).not.toBeNull());
    const keys = Object.keys(captured.body!);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      expect(SELF_EDITABLE_FIELDS).toContain(key);
    }
    expect(keys).not.toContain("job_title");
    expect(keys).not.toContain("department");
    expect(keys).not.toContain("status");
    expect(keys).not.toContain("manager_id");
    expect(captured.body!.phone).toBe("0788999999");
  });
});
