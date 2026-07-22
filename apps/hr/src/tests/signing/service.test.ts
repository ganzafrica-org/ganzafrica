import { afterEach, describe, it, expect } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
import { signingService } from "@/services/signing.service";

const API = "http://localhost:3002/api";

afterEach(() => server.resetHandlers());

describe("signingService", () => {
  it("listMine → requests array with fields", async () => {
    server.use(
      http.get(`${API}/hr/signing/my`, () =>
        HttpResponse.json({
          requests: [
            {
              id: 1,
              template_id: 3,
              subject: "NDA",
              signer_type: "internal",
              signer_name: "Jane",
              signer_email: "jane@x.com",
              status: "sent",
              signed_file_key: null,
              completed_at: null,
              created_at: "2026-06-01T00:00:00Z",
              fields: [{ key: "full_name", label: "Full name", type: "signature", required: true }],
            },
          ],
        }),
      ),
    );
    const res = await signingService.listMine();
    expect(res).toHaveLength(1);
    expect(res[0].subject).toBe("NDA");
    expect(res[0].fields[0].key).toBe("full_name");
  });

  it("sign posts field_values to the right endpoint", async () => {
    server.use(
      http.post(`${API}/hr/signing/my/7/sign`, async ({ request }) => {
        const body = (await request.json()) as { field_values: Record<string, unknown> };
        expect(body.field_values.full_name).toBe("Jane Doe");
        return HttpResponse.json({ signed: true });
      }),
    );
    const res = await signingService.sign(7, { full_name: "Jane Doe" });
    expect(res.signed).toBe(true);
  });
});
