/**
 * Shared fake for `@azure/storage-blob`, used by every integration test that goes through a real
 * multipart upload route (create-document-acl.test.ts, leave-attachments.test.ts,
 * document-templates.test.ts). `middlewares/upload.ts` and `storage.service.ts` both construct a
 * `BlobServiceClient` directly at module scope — that constructor call *is* inside Vitest's module
 * graph (unlike the old S3 setup, where multer-s3 buried the real AWS SDK requires one level
 * deeper, outside the graph — mocking those packages never actually worked) — so mocking
 * `@azure/storage-blob` itself here is what keeps these tests network-free while still exercising
 * the real Express route, real multer parsing, and real controller/service code.
 *
 * Usage in a test file:
 *   const { uploadedObjects } = vi.hoisted(() => ({ uploadedObjects: [] as { key: string }[] }));
 *   vi.mock("@azure/storage-blob", () => fakeAzureStorageBlobModule((info) => uploadedObjects.push(info)));
 */
import type { Readable } from "stream";

export interface FakeUploadInfo {
  container: string;
  key: string;
  size: number;
}

export function fakeAzureStorageBlobModule(onUpload?: (info: FakeUploadInfo) => void) {
  class FakeBlockBlobClient {
    constructor(
      public url: string,
      private container: string,
      private key: string,
    ) {}

    async uploadStream(stream: Readable) {
      const chunks: Buffer[] = [];
      await new Promise<void>((resolve, reject) => {
        stream.on("data", (chunk: Buffer) => chunks.push(chunk));
        stream.on("end", () => resolve());
        stream.on("error", reject);
      });
      onUpload?.({ container: this.container, key: this.key, size: Buffer.concat(chunks).length });
      return {};
    }

    async uploadData(data: Buffer) {
      onUpload?.({ container: this.container, key: this.key, size: data.length });
      return {};
    }

    async deleteIfExists() {
      return { succeeded: true };
    }

    async downloadToBuffer() {
      return Buffer.from("");
    }

    async exists() {
      return false;
    }

    async generateSasUrl() {
      return `${this.url}?sv=test&se=${new Date(Date.now() + 300_000).toISOString()}&sp=r&sig=test`;
    }
  }

  class FakeContainerClient {
    url: string;
    constructor(public containerName: string) {
      this.url = `https://test.blob.core.windows.net/${containerName}`;
    }
    getBlockBlobClient(key: string) {
      return new FakeBlockBlobClient(`${this.url}/${key}`, this.containerName, key);
    }
    getBlobClient(key: string) {
      return this.getBlockBlobClient(key);
    }
  }

  class FakeBlobServiceClient {
    getContainerClient(containerName: string) {
      return new FakeContainerClient(containerName);
    }
  }

  class FakeStorageSharedKeyCredential {
    constructor(
      public account: string,
      public key: string,
    ) {}
  }

  return {
    BlobServiceClient: FakeBlobServiceClient,
    StorageSharedKeyCredential: FakeStorageSharedKeyCredential,
    BlobSASPermissions: { parse: (s: string) => s },
  };
}
