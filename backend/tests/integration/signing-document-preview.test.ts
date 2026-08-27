import { describe, it, expect, beforeEach, vi } from "vitest";
import { resetDb } from "../setup";
import { makeUser } from "../factories";

vi.mock("../../src/services/email.service", () => ({
  sendEmail: vi.fn(async () => ({ id: "x" })),
}));
vi.mock("../../src/services/storage.service", () => ({
  getPresignedDownload: vi.fn(async (key: string) => `https://signed.example/${key}`),
}));

import * as signing from "../../src/services/signing.service";
import { mintLink, peekLink } from "../../src/services/secure-links.service";

describe("DOC-signing: previewing the document before signing", () => {
  let hrId: number;
  let employeeId: number;

  beforeEach(async () => {
    await resetDb();
    hrId = (await makeUser({ role: "hr" })).id;
    employeeId = (await makeUser({ role: "employee" })).id;
  });

  it("internal signer gets a presigned URL for their own request's template file", async () => {
    const tpl = await signing.createTemplate({ name: "NDA", file_key: "tpls/nda.pdf" }, hrId);
    const req = await signing.createRequest(
      { template_id: tpl.id, subject: "NDA", signer_type: "internal", signer_user_id: employeeId },
      hrId,
    );

    const { url } = await signing.getRequestDocumentUrl(req.id, employeeId);
    expect(url).toBe("https://signed.example/tpls/nda.pdf");
  });

  it("returns url: null for a fields-only template (no file_key)", async () => {
    const tpl = await signing.createTemplate({ name: "Fields only" }, hrId);
    const req = await signing.createRequest(
      { template_id: tpl.id, subject: "F", signer_type: "internal", signer_user_id: employeeId },
      hrId,
    );

    const { url } = await signing.getRequestDocumentUrl(req.id, employeeId);
    expect(url).toBeNull();
  });

  it("a user who isn't the signer and isn't HR/admin cannot view the document (403)", async () => {
    const tpl = await signing.createTemplate({ name: "NDA", file_key: "tpls/nda.pdf" }, hrId);
    const req = await signing.createRequest(
      { template_id: tpl.id, subject: "NDA", signer_type: "internal", signer_user_id: employeeId },
      hrId,
    );
    const stranger = await makeUser({ role: "employee" });

    await expect(signing.getRequestDocumentUrl(req.id, stranger.id)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("HR can view the document on a request they aren't the signer of", async () => {
    const tpl = await signing.createTemplate({ name: "NDA", file_key: "tpls/nda.pdf" }, hrId);
    const req = await signing.createRequest(
      { template_id: tpl.id, subject: "NDA", signer_type: "internal", signer_user_id: employeeId },
      hrId,
    );

    const { url } = await signing.getRequestDocumentUrl(req.id, hrId);
    expect(url).toBe("https://signed.example/tpls/nda.pdf");
  });

  it("external signer can view the document via token without consuming it", async () => {
    const tpl = await signing.createTemplate({ name: "Vendor", file_key: "tpls/vendor.pdf" }, hrId);
    const req = await signing.createRequest(
      {
        template_id: tpl.id,
        subject: "Vendor",
        signer_type: "external",
        signer_email: "ceo@acme.com",
      },
      hrId,
    );
    const { token } = await signing.sendRequest(req.id);

    const view = await signing.getTokenDocumentUrl(token!);
    expect(view).toMatchObject({ state: "valid", url: "https://signed.example/tpls/vendor.pdf" });
    // Peeking for the preview must not consume the link — signing still works afterwards.
    expect((await peekLink("sign_request", token!)).state).toBe("valid");

    await signing.signExternal(token!, {});
    expect(await signing.getTokenDocumentUrl(token!)).toMatchObject({ state: "signed" });
  });

  it("an expired token returns state: expired", async () => {
    const tpl = await signing.createTemplate({ name: "Vendor", file_key: "tpls/vendor.pdf" }, hrId);
    const req = await signing.createRequest(
      { template_id: tpl.id, subject: "V", signer_type: "external", signer_email: "x@y.com" },
      hrId,
    );
    const expiredToken = await mintLink("sign_request", req.id, new Date(Date.now() - 1000));

    expect(await signing.getTokenDocumentUrl(expiredToken)).toMatchObject({ state: "expired" });
  });

  it("an unknown token returns state: not_found", async () => {
    expect(await signing.getTokenDocumentUrl("not-a-real-token-000000")).toMatchObject({
      state: "not_found",
    });
  });
});
