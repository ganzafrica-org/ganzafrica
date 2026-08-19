/**
 * "On the Personal Details page, some duplicated information should be removed when adding a
 * personal profile" (Things-to-work-on.md) — step 2's job title/department/start date should
 * already be filled in from step 1, editable without corrupting step 1, and Employment Type must
 * NOT be carried over (different domains: profile.employment_type is staff/contractor/analyst/
 * fellow/intern; the contract's employmentType is full-time/part-time — same label, not the same
 * field).
 */
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { AddEmployeeSheet } from "@/components/sections/sheets/add-employee-sheet";

vi.mock("framer-motion", () => ({
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  motion: {
    div: ({
      children,
      initial: _initial,
      animate: _animate,
      exit: _exit,
      transition: _transition,
      ...rest
    }: Record<string, unknown> & { children?: React.ReactNode }) => <div {...rest}>{children}</div>,
  },
}));

const API = "http://localhost:3002/api";

beforeEach(() => {
  server.use(
    http.get(`${API}/hr/employees`, () => HttpResponse.json({ data: [], total: 0, pages: 1 })),
  );
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
});

/** Fills every step-1 field that has a step-2 counterpart, plus the required trio. */
async function fillProfileStepFully() {
  const textboxes = screen.getAllByRole("textbox");
  await userEvent.type(textboxes[0], "New"); // First Name
  await userEvent.type(textboxes[1], "Hire"); // Last Name
  await userEvent.type(screen.getByPlaceholderText("john@gmail.com"), "new.hire@example.com");
  await userEvent.type(textboxes[5], "Software Engineer"); // Job Title
  await userEvent.type(textboxes[6], "Engineering"); // Department

  // Employment Type (profile's own enum — staff/contractor/... — must NOT leak into step 2).
  const employmentTypeTrigger = screen
    .getByText("Select type")
    .closest('[role="combobox"]') as HTMLElement;
  await userEvent.click(employmentTypeTrigger);
  await userEvent.click(await screen.findByRole("option", { name: "contractor" }));

  const hiredDate = document.querySelector('input[type="date"]') as HTMLInputElement;
  await userEvent.type(hiredDate, "2026-04-15");

  await userEvent.click(screen.getByRole("button", { name: /^next$/i }));
}

describe("AddEmployeeSheet — Personal Details dedupe (step 1 -> step 2)", () => {
  it("pre-fills job title, department, and start date in step 2 from step 1, but not employment type", async () => {
    renderWithClient(<AddEmployeeSheet open onOpenChange={vi.fn()} />);

    await fillProfileStepFully();

    // Reveal the contract fields.
    await userEvent.click(screen.getByRole("switch"));

    expect(screen.getByPlaceholderText("e.g. Software Engineer")).toHaveValue("Software Engineer");
    expect(screen.getByPlaceholderText("e.g. Engineering")).toHaveValue("Engineering");
    const startDate = document.querySelector('input[type="date"]') as HTMLInputElement;
    expect(startDate).toHaveValue("2026-04-15");

    // The contract's Employment Type (full-time/part-time) must still be unset — profile's
    // "contractor" must not have leaked into this different field.
    expect(screen.getByText("Full-time or Part-time")).toBeInTheDocument();
  }, 15000);

  it("editing the pre-filled job title in step 2 does not write back and corrupt step 1", async () => {
    renderWithClient(<AddEmployeeSheet open onOpenChange={vi.fn()} />);

    await fillProfileStepFully();
    await userEvent.click(screen.getByRole("switch"));

    const contractJobTitle = screen.getByPlaceholderText("e.g. Software Engineer");
    await userEvent.clear(contractJobTitle);
    await userEvent.type(contractJobTitle, "Contract-only title");
    expect(contractJobTitle).toHaveValue("Contract-only title");

    await userEvent.click(screen.getByRole("button", { name: /^prev$/i }));

    const textboxes = screen.getAllByRole("textbox");
    expect(textboxes[5]).toHaveValue("Software Engineer"); // step 1's Job Title, untouched
  }, 15000);

  it("re-entering step 2 keeps the edited contract value instead of re-copying step 1 over it", async () => {
    renderWithClient(<AddEmployeeSheet open onOpenChange={vi.fn()} />);

    await fillProfileStepFully();
    await userEvent.click(screen.getByRole("switch"));

    const contractJobTitle = screen.getByPlaceholderText("e.g. Software Engineer");
    await userEvent.clear(contractJobTitle);
    await userEvent.type(contractJobTitle, "Contract-only title");

    await userEvent.click(screen.getByRole("button", { name: /^prev$/i }));
    await userEvent.click(screen.getByRole("button", { name: /^next$/i }));

    expect(screen.getByPlaceholderText("e.g. Software Engineer")).toHaveValue(
      "Contract-only title",
    );
  }, 15000);

  it("skip-contract path is unaffected: no contract fields shown, nothing pre-filled to worry about", async () => {
    const onOpenChange = vi.fn();
    server.use(
      http.post(`${API}/hr/employees`, () =>
        HttpResponse.json(
          { employee: { id: "e1", first_name: "New", last_name: "Hire" } },
          { status: 201 },
        ),
      ),
    );
    renderWithClient(<AddEmployeeSheet open onOpenChange={onOpenChange} />);

    await fillProfileStepFully();
    expect(screen.queryByPlaceholderText("e.g. Software Engineer")).not.toBeInTheDocument();
    expect(
      screen.getByText(/skipping — the employee will be created without a contract/i),
    ).toBeInTheDocument();
  });
});
