import { afterEach, describe, it, expect, vi } from "vitest";
import { screen, waitFor, fireEvent, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import { RequestLeaveDialog } from "@/components/sections/leave/request-leave-dialog";

const API = "http://localhost:3002/api";

// Unmount before handlers reset, so a dialog's in-flight preview cannot bleed into the next test.
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

function fillRange() {
  fireEvent.change(screen.getByLabelText("First day"), { target: { value: "2026-03-02" } });
  fireEvent.change(screen.getByLabelText("Last day"), { target: { value: "2026-03-04" } });
}

describe("RequestLeaveDialog", () => {
  it("previews the working-day count once a range is chosen", async () => {
    server.use(
      http.post(`${API}/hr/me/leave/validate`, () =>
        HttpResponse.json({ days: 3, remaining: 20, sufficient: true }),
      ),
    );

    renderWithClient(<RequestLeaveDialog open onOpenChange={() => {}} />);
    fillRange();

    expect(await screen.findByText("3 working days")).toBeInTheDocument();
    expect(screen.getByText(/20 day\(s\) remaining/)).toBeInTheDocument();
  });

  it("disables submit and warns when the balance is insufficient", async () => {
    server.use(
      http.post(`${API}/hr/me/leave/validate`, () =>
        HttpResponse.json({ days: 30, remaining: 4, sufficient: false }),
      ),
    );

    renderWithClient(<RequestLeaveDialog open onOpenChange={() => {}} />);
    fillRange();

    expect(await screen.findByText(/exceeds your balance/)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /submit request/i })).toBeDisabled(),
    );
  });

  it("blocks a range that covers no working days", async () => {
    server.use(
      http.post(`${API}/hr/me/leave/validate`, () =>
        HttpResponse.json({ days: 0, remaining: 20, sufficient: true }),
      ),
    );

    renderWithClient(<RequestLeaveDialog open onOpenChange={() => {}} />);
    fillRange();

    expect(await screen.findByText(/covers no working days/)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /submit request/i })).toBeDisabled(),
    );
  });

  it("submits the draft and closes on success", async () => {
    const onOpenChange = vi.fn();
    server.use(
      http.post(`${API}/hr/me/leave/validate`, () =>
        HttpResponse.json({ days: 3, remaining: 20, sufficient: true }),
      ),
      http.post(`${API}/hr/me/leave`, async ({ request }) => {
        const body = (await request.json()) as { type: string; startDate: string };
        expect(body.type).toBe("ANNUAL");
        expect(body.startDate).toBe("2026-03-02");
        return HttpResponse.json({ leave: { id: "l1", status: "PENDING" } }, { status: 201 });
      }),
    );

    renderWithClient(<RequestLeaveDialog open onOpenChange={onOpenChange} />);
    fillRange();
    await screen.findByText("3 working days");

    fireEvent.click(screen.getByRole("button", { name: /submit request/i }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
  });

  it("surfaces a server rejection instead of closing", async () => {
    const onOpenChange = vi.fn();
    server.use(
      http.post(`${API}/hr/me/leave/validate`, () =>
        HttpResponse.json({ days: 3, remaining: 20, sufficient: true }),
      ),
      http.post(`${API}/hr/me/leave`, () =>
        HttpResponse.json({ message: "This overlaps an existing leave request" }, { status: 409 }),
      ),
    );

    renderWithClient(<RequestLeaveDialog open onOpenChange={onOpenChange} />);
    fillRange();
    await screen.findByText("3 working days");

    fireEvent.click(screen.getByRole("button", { name: /submit request/i }));

    expect(await screen.findByText(/overlaps an existing leave request/)).toBeInTheDocument();
    expect(onOpenChange).not.toHaveBeenCalledWith(false);
  });
});
