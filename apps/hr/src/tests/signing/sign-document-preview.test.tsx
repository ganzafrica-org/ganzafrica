import { afterEach, describe, it, expect } from "vitest";
import { screen, cleanup } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { renderWithClient } from "../recruitment/test-utils";
import { SignDocumentPreview } from "@/components/signing/sign-document-preview";

const API = "http://localhost:3002/api";
afterEach(cleanup);

describe("SignDocumentPreview", () => {
  it("renders the base document once its presigned URL loads", async () => {
    server.use(
      http.get(`${API}/hr/signing/my/1/document`, () =>
        HttpResponse.json({ url: "https://signed.example/tpls/nda.pdf" }),
      ),
    );

    renderWithClient(<SignDocumentPreview requestId={1} title="NDA — Employee" />);

    const iframe = await screen.findByTitle("NDA — Employee");
    expect(iframe).toHaveAttribute("src", "https://signed.example/tpls/nda.pdf");
  });

  it("shows a fallback notice when the template has no attached file", async () => {
    server.use(http.get(`${API}/hr/signing/my/2/document`, () => HttpResponse.json({ url: null })));

    renderWithClient(<SignDocumentPreview requestId={2} title="Fields only" />);

    expect(
      await screen.findByText(/no document file is attached to this template/i),
    ).toBeInTheDocument();
  });

  it("shows an error notice when the fetch fails", async () => {
    server.use(
      http.get(`${API}/hr/signing/my/3/document`, () => HttpResponse.json({}, { status: 500 })),
    );

    renderWithClient(<SignDocumentPreview requestId={3} title="NDA" />);

    expect(await screen.findByText(/couldn't load the document/i)).toBeInTheDocument();
  });
});
