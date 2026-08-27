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

  vi.mock("@azure/storage-blob", () => {
    const makeBlockBlobClient = (containerName: string, key: string) => ({
      url: `https://teststorage.blob.core.windows.net/${containerName}/${key}`,
      async uploadData(data: Buffer) {
        uploadedObjects.push({ Bucket: containerName, Key: key });
        return { requestId: "test", size: data.length };
      },
      async deleteIfExists() {
        return { succeeded: true };
      },
      async downloadToBuffer() {
        return Buffer.from("");
      },
    });
    return {
      BlobServiceClient: {
        fromConnectionString: () => ({
          getContainerClient: (name: string) => ({
            getBlockBlobClient: (key: string) => makeBlockBlobClient(name, key),
          }),
        }),
      },
      BlobSASPermissions: { parse: () => ({}) },
      generateBlobSASQueryParameters: (opts: { blobName?: string }) => {
        const url = `https://teststorage.blob.core.windows.net/uploads/${opts?.blobName ?? "obj"}?sig=test`;
        presignedUrls.push(url);
        return { toString: () => "sig=test" };
      },
      StorageSharedKeyCredential: class {},
    };
  });
}
