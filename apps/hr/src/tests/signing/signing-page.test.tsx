import { afterEach, describe, it, expect } from "vitest";
import { screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "../recruitment/test-utils";
import MySigningPage from "@/app/signing/page";

const API = "http://localhost:3002/api";
afterEach(cleanup);

function pendingRequest(overrides = {}) {
  return {
    id: 1,
    template_id: 3,
    subject: "NDA — Employee",
    signer_type: "internal",
    signer_name: "Jane",
    signer_email: "jane@x.com",
    status: "sent",
    signed_file_key: null,
    completed_at: null,
    created_at: "2026-06-01T00:00:00Z",
    fields: [{ key: "full_name", label: "Full name", type: "signature", required: true }],
    ...overrides,
  };
}

describe("MySigningPage", () => {
  it("lists pending documents and signs one (requires the field + the agreement)", async () => {
    let signed = false;
    server.use(
      http.get(`${API}/hr/signing/my`, () =>
        HttpResponse.json({ requests: signed ? [] : [pendingRequest()] }),
      ),
      http.get(`${API}/hr/signing/my/1/document`, () =>
        HttpResponse.json({ url: "https://signed.example/tpls/nda.pdf" }),
      ),
      http.post(`${API}/hr/signing/my/1/sign`, async ({ request }) => {
        const body = (await request.json()) as { field_values: Record<string, unknown> };
        expect(body.field_values.full_name).toBe("Jane Doe");
        signed = true;
        return HttpResponse.json({ signed: true });
      }),
    );

    renderWithClient(<MySigningPage />);

    // pending request shows up
    expect(await screen.findByText("NDA — Employee")).toBeInTheDocument();

    // open the sign dialog
    fireEvent.click(screen.getByRole("button", { name: /review.*sign/i }));
    expect(await screen.findByLabelText(/Full name/)).toBeInTheDocument();

    // the base document is fetched and shown before signing
    const preview = await screen.findByTitle("NDA — Employee");
    expect(preview).toHaveAttribute("src", "https://signed.example/tpls/nda.pdf");

    // fill the required field, check the legal agreement, then sign
    fireEvent.change(screen.getByLabelText(/Full name/), { target: { value: "Jane Doe" } });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: /^Sign document$/ }));

    // after signing, the list refetches and the empty state appears
    await waitFor(() => expect(screen.getByText(/all caught up/i)).toBeInTheDocument());
  });

  it("blocks signing until the agreement is checked", async () => {
    server.use(
      http.get(`${API}/hr/signing/my`, () => HttpResponse.json({ requests: [pendingRequest()] })),
      http.get(`${API}/hr/signing/my/1/document`, () =>
        HttpResponse.json({ url: "https://signed.example/tpls/nda.pdf" }),
      ),
    );

    renderWithClient(<MySigningPage />);
    fireEvent.click(await screen.findByRole("button", { name: /review.*sign/i }));

    fireEvent.change(await screen.findByLabelText(/Full name/), { target: { value: "Jane Doe" } });
    // do NOT check the agreement
    fireEvent.click(screen.getByRole("button", { name: /^Sign document$/ }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/confirm your intent/i);
  });
});
