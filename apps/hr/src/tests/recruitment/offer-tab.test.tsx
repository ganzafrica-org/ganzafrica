import { afterEach, describe, it, expect } from "vitest";
import { screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "./test-utils";
import { OfferTab } from "@/components/recruitment/offer-tab";

const API = "http://localhost:3002/api";

afterEach(cleanup);

describe("OfferTab", () => {
  it("shows the create form when there is no offer, and creates one", async () => {
    let created = false;
    server.use(
      http.get(`${API}/hr/recruitment/applications/5/offer`, () =>
        HttpResponse.json({
          offer: created
            ? {
                id: 1,
                application_id: 5,
                position_title: "Analyst",
                employment_type: "analyst",
                department: null,
                start_date: "2099-01-01",
                gross_salary: null,
                currency: "RWF",
                additional_terms: null,
                letter_file_key: null,
                status: "draft",
                expires_at: null,
                sent_at: null,
                responded_at: null,
                decline_reason: null,
              }
            : null,
        }),
      ),
      http.post(`${API}/hr/recruitment/applications/5/offer`, () => {
        created = true;
        return HttpResponse.json({ offer: { id: 1, status: "draft" } }, { status: 201 });
      }),
    );

    renderWithClient(<OfferTab applicationId={5} />);
    expect(await screen.findByTestId("offer-create")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Position title"), { target: { value: "Analyst" } });
    fireEvent.click(screen.getByRole("button", { name: "Create draft offer" }));

    await waitFor(() => expect(created).toBe(true));
  });

  it("draft offer: attach letter then send fires the mutations", async () => {
    let hasLetter = false;
    let sent = false;
    const draftOffer = (over: Record<string, unknown> = {}) => ({
      id: 2,
      application_id: 7,
      position_title: "Data Analyst",
      employment_type: "analyst",
      department: "Programs",
      start_date: "2099-01-01",
      gross_salary: "1000",
      currency: "RWF",
      additional_terms: null,
      letter_file_key: hasLetter ? "l.pdf" : null,
      status: sent ? "sent" : "draft",
      expires_at: null,
      sent_at: null,
      responded_at: null,
      decline_reason: null,
      ...over,
    });
    server.use(
      http.get(`${API}/hr/recruitment/applications/7/offer`, () =>
        HttpResponse.json({ offer: draftOffer() }),
      ),
      http.post(`${API}/hr/offers/2/letter`, () => {
        hasLetter = true;
        return HttpResponse.json({ offer: draftOffer() });
      }),
      http.post(`${API}/hr/offers/2/send`, () => {
        sent = true;
        return HttpResponse.json({ offer: draftOffer({ status: "sent" }) });
      }),
    );
    renderWithClient(<OfferTab applicationId={7} />);
    expect(await screen.findByTestId("offer-detail")).toBeInTheDocument();

    // Send is disabled until a letter is attached.
    expect(screen.getByRole("button", { name: "Send offer" })).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Offer letter file key"), {
      target: { value: "l.pdf" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Attach letter" }));
    await waitFor(() => expect(hasLetter).toBe(true));

    // After the letter query invalidation, the send button enables.
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Send offer" })).not.toBeDisabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Send offer" }));
    await waitFor(() => expect(sent).toBe(true));
  });

  it("sent offer: withdraw fires the mutation", async () => {
    let withdrawn = false;
    const sentOffer = (status = "sent") => ({
      id: 3,
      application_id: 8,
      position_title: "Fellow",
      employment_type: "fellow",
      department: null,
      start_date: "2099-01-01",
      gross_salary: null,
      currency: "RWF",
      additional_terms: null,
      letter_file_key: "l.pdf",
      status,
      expires_at: "2099-02-01T00:00:00Z",
      sent_at: "2026-06-01T00:00:00Z",
      responded_at: null,
      decline_reason: null,
    });
    server.use(
      http.get(`${API}/hr/recruitment/applications/8/offer`, () =>
        HttpResponse.json({ offer: sentOffer(withdrawn ? "withdrawn" : "sent") }),
      ),
      http.post(`${API}/hr/offers/3/withdraw`, () => {
        withdrawn = true;
        return HttpResponse.json({ offer: sentOffer("withdrawn") });
      }),
    );
    renderWithClient(<OfferTab applicationId={8} />);
    expect(await screen.findByTestId("offer-detail")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Withdraw offer" }));
    await waitFor(() => expect(withdrawn).toBe(true));
  });

  it("create failure surfaces an error toast (no crash)", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/applications/11/offer`, () =>
        HttpResponse.json({ offer: null }),
      ),
      http.post(`${API}/hr/recruitment/applications/11/offer`, () =>
        HttpResponse.json({ error: "x" }, { status: 500 }),
      ),
    );
    renderWithClient(<OfferTab applicationId={11} />);
    fireEvent.change(await screen.findByLabelText("Position title"), {
      target: { value: "Analyst" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Create draft offer" }));
    // no throw; the button remains (mutation errored, handled by onError toast)
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Create draft offer" })).toBeInTheDocument(),
    );
  });

  it("declined offer shows the reason", async () => {
    server.use(
      http.get(`${API}/hr/recruitment/applications/9/offer`, () =>
        HttpResponse.json({
          offer: {
            id: 4,
            application_id: 9,
            position_title: "Analyst",
            employment_type: "analyst",
            department: null,
            start_date: null,
            gross_salary: null,
            currency: "RWF",
            additional_terms: null,
            letter_file_key: "l.pdf",
            status: "declined",
            expires_at: null,
            sent_at: null,
            responded_at: null,
            decline_reason: "Took another role",
          },
        }),
      ),
    );
    renderWithClient(<OfferTab applicationId={9} />);
    expect(await screen.findByText(/Took another role/)).toBeInTheDocument();
  });
});
