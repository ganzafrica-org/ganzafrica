/**
 * Shared object-storage helpers (Azure Blob). Private files — offer letters, employee documents,
 * signed copies, payslips, avatars, attachments — live in the private container and are served via
 * short-lived SAS links rather than public URLs. Genuinely public assets (website images) go to the
 * public container via the upload middleware.
 */
import {
  BlobServiceClient,
  BlobSASPermissions,
  generateBlobSASQueryParameters,
  StorageSharedKeyCredential,
} from "@azure/storage-blob";
import env from "../config/env";
import { Logger } from "../config";

const logger = new Logger("StorageService");
const MAX_SAS_SECONDS = 7 * 24 * 60 * 60;

const blobService = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING);
const privateContainer = blobService.getContainerClient(env.AZURE_STORAGE_CONTAINER_PRIVATE);

// The shared-key credential is needed to sign SAS tokens; parse it out of the connection string.
const accountKey = /AccountKey=([^;]+)/.exec(env.AZURE_STORAGE_CONNECTION_STRING)?.[1];
const sharedKeyCredential = accountKey
  ? new StorageSharedKeyCredential(env.AZURE_STORAGE_ACCOUNT, accountKey)
  : null;

/** Short-lived read URL (SAS) for a private object. Default 5 minutes; capped at Azure's 7-day max. */
export async function getPresignedDownload(key: string, expiresIn = 300): Promise<string> {
  if (expiresIn > MAX_SAS_SECONDS) {
    throw new Error("SAS URLs cannot exceed 7 days");
  }
  if (!sharedKeyCredential) {
    throw new Error("AZURE_STORAGE_CONNECTION_STRING must contain an AccountKey to sign SAS URLs");
  }
  const blob = privateContainer.getBlockBlobClient(key);
  const sas = generateBlobSASQueryParameters(
    {
      containerName: env.AZURE_STORAGE_CONTAINER_PRIVATE,
      blobName: key,
      permissions: BlobSASPermissions.parse("r"),
      startsOn: new Date(Date.now() - 60_000), // small clock-skew allowance
      expiresOn: new Date(Date.now() + expiresIn * 1000),
    },
    sharedKeyCredential,
  ).toString();
  logger.info(`SAS download for ${key}, expires in ${expiresIn}s`);
  return `${blob.url}?${sas}`;
}

/** Fetch a private object's full bytes (out-of-band text extraction, never the request path). */
export async function getObjectBuffer(key: string): Promise<Buffer> {
  return privateContainer.getBlockBlobClient(key).downloadToBuffer();
}

/** Upload bytes to the private container under `key` (e.g. generated payslip PDFs). */
export async function putObject(key: string, body: Buffer, contentType: string): Promise<void> {
  await privateContainer.getBlockBlobClient(key).uploadData(body, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  logger.info(`Uploaded ${key} (${body.length} bytes) to private storage`);
}

/** Delete a private object. No-op if it does not exist. */
export async function deleteObject(key: string): Promise<void> {
  await privateContainer.getBlockBlobClient(key).deleteIfExists();
  logger.info(`Deleted ${key} from private storage`);
}
