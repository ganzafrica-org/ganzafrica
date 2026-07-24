/**
 * Module-level fakes for external services, so tests never hit real Resend or DO Spaces.
 * Import this file (or the specific mock) at the top of a test that exercises email/upload
 * paths, then assert on `sentEmails` / `presignedUrls` / `uploadedObjects`.
 *
 * Usage in a test file:
 *   import { installExternalMocks, sentEmails } from "../mocks";
 *   installExternalMocks();
 */
import { vi } from "vitest";

export const sentEmails: Array<{ to: string | string[]; subject: string; html?: string }> = [];
export const presignedUrls: string[] = [];
export const uploadedObjects: Array<{ Bucket?: string; Key?: string; ACL?: string }> = [];

export function resetExternalMocks() {
  sentEmails.length = 0;
  presignedUrls.length = 0;
  uploadedObjects.length = 0;
}

/**
 * Registers vi.mock factories for resend + the S3 SDK + presigner. Call at module top level
 * (vi.mock is hoisted). Recording fakes let tests assert what would have been sent/uploaded.
 */
export function installExternalMocks() {
  vi.mock("resend", () => ({
    Resend: class {
      emails = {
        send: async (payload: { to: string | string[]; subject: string; html?: string }) => {
          sentEmails.push({ to: payload.to, subject: payload.subject, html: payload.html });
          return { data: { id: `test-email-${sentEmails.length}` }, error: null };
        },
      };
    },
  }));

  vi.mock("@aws-sdk/client-s3", async (importActual) => {
    const actual = await importActual<typeof import("@aws-sdk/client-s3")>();
    return {
      ...actual,
      S3Client: class {
        async send(cmd: { input?: { Bucket?: string; Key?: string; ACL?: string } }) {
          uploadedObjects.push({ ...(cmd?.input ?? {}) });
          return {};
        }
      },
    };
  });

  vi.mock("@aws-sdk/s3-request-presigner", () => ({
    getSignedUrl: async (_client: unknown, cmd: { input?: { Key?: string } }) => {
      const url = `https://test.spaces/${cmd?.input?.Key ?? "obj"}?sig=test`;
      presignedUrls.push(url);
      return url;
    },
  }));
}
