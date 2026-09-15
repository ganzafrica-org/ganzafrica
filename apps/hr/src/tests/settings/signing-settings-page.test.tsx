import { afterEach, describe, it, expect } from "vitest";
import { screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "@/tests/recruitment/test-utils";
import SigningSettingsPage from "@/app/settings/signing/page";

const API = "http://localhost:3002/api";
afterEach(() => {
  cleanup();
  server.resetHandlers();
});

describe("SigningSettingsPage", () => {
  it("loads the current toggle state and flips it via PUT", async () => {
    let stored = false;
    server.use(
      http.get(`${API}/hr/settings/require_multiple_signers`, () =>
        HttpResponse.json({ key: "require_multiple_signers", value: stored }),
      ),
      http.put(`${API}/hr/settings/require_multiple_signers`, async ({ request }) => {
        const body = (await request.json()) as { value: boolean };
        stored = body.value;
        return HttpResponse.json({ key: "require_multiple_signers", value: stored });
      }),
    );

    renderWithClient(<SigningSettingsPage />);

    const toggle = await screen.findByLabelText(/require multiple signers/i);
    await waitFor(() => expect(toggle).not.toBeDisabled());
    expect(toggle).not.toBeChecked();

    fireEvent.click(toggle);
    await waitFor(() => expect(stored).toBe(true));
  });

  it("reflects an already-enabled toggle from the server", async () => {
    server.use(
      http.get(`${API}/hr/settings/require_multiple_signers`, () =>
        HttpResponse.json({ key: "require_multiple_signers", value: true }),
      ),
    );

    renderWithClient(<SigningSettingsPage />);
    const toggle = await screen.findByLabelText(/require multiple signers/i);
    await waitFor(() => expect(toggle).toBeChecked());
  });
});
