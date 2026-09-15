/**
 * Shared object-storage helpers (Azure Blob Storage) — private files (offer letters, employee
 * documents, signed copies) are all served via short-lived expiring SAS links rather than public
 * URLs. `key` throughout is a blob name (path) within the private container, e.g.
 * "document/1699999999-123-agreement.pdf".
 */
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  BlobSASPermissions,
} from "@azure/storage-blob";
import env from "../config/env";
import { Logger } from "../config";

const logger = new Logger("StorageService");
const MAX_SAS_SECONDS = 7 * 24 * 60 * 60;

const sharedKeyCredential = new StorageSharedKeyCredential(
  env.AZURE_STORAGE_ACCOUNT,
  env.AZURE_STORAGE_ACCOUNT_KEY,
);
const blobServiceClient = new BlobServiceClient(env.AZURE_STORAGE_ENDPOINT, sharedKeyCredential);
const privateContainer = blobServiceClient.getContainerClient(env.AZURE_STORAGE_CONTAINER_PRIVATE);

/** Presigned (SAS) GET for a private blob. Default 5 minutes; capped at 7 days. */
export async function getPresignedDownload(key: string, expiresIn = 300): Promise<string> {
  if (expiresIn > MAX_SAS_SECONDS) {
    throw new Error("SAS URLs cannot exceed 7 days");
  }
  const blobClient = privateContainer.getBlobClient(key);
  const url = await blobClient.generateSasUrl({
    permissions: BlobSASPermissions.parse("r"),
    expiresOn: new Date(Date.now() + expiresIn * 1000),
  });
  logger.info(`Presigned download for ${key}, expires in ${expiresIn}s`);
  return url;
}

/** Fetch a private blob's full bytes (out-of-band text extraction, never the request path). */
export async function getObjectBuffer(key: string): Promise<Buffer> {
  const blobClient = privateContainer.getBlobClient(key);
  return blobClient.downloadToBuffer();
}
