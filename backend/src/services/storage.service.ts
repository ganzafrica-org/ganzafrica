/**
 * Shared object-storage helpers (DO Spaces / S3-compatible). Generalizes the presigned-download
 * pattern (was inline in pdf.service) so private files — offer letters, employee documents, signed
 * copies — are all served via short-lived expiring links rather than public URLs.
 */
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "../config/env";
import { Logger } from "../config";

const logger = new Logger("StorageService");
const MAX_PRESIGN_SECONDS = 7 * 24 * 60 * 60;

const s3Client = new S3Client({
  endpoint: env.DO_SPACES_ENDPOINT,
  region: env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: env.DO_SPACES_ACCESS_KEY,
    secretAccessKey: env.DO_SPACES_SECRET_KEY,
  },
  forcePathStyle: false,
});

/** Presigned GET for a private object. Default 5 minutes; capped at S3's 7-day ceiling. */
export async function getPresignedDownload(key: string, expiresIn = 300): Promise<string> {
  if (expiresIn > MAX_PRESIGN_SECONDS) {
    throw new Error("presigned URLs cannot exceed 7 days");
  }
  const command = new GetObjectCommand({ Bucket: env.DO_SPACES_BUCKET, Key: key });
  const url = await getSignedUrl(s3Client as never, command as never, { expiresIn });
  logger.info(`Presigned download for ${key}, expires in ${expiresIn}s`);
  return url;
}
