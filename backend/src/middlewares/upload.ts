import type { Request } from "express";
import multer from "multer";
import { BlobServiceClient, type ContainerClient } from "@azure/storage-blob";
import env from "../config/env";

// The Azure storage engine sets these on each uploaded file (mirrors what multer-s3 provided).
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    namespace Multer {
      interface File {
        /** Blob key/path within the container, e.g. `uploads/document/123-file.pdf`. */
        key?: string;
        /** Absolute blob URL (no SAS). Private objects need `getPresignedDownload` to be readable. */
        location?: string;
      }
    }
  }
}

const blobService = BlobServiceClient.fromConnectionString(env.AZURE_STORAGE_CONNECTION_STRING);
const privateContainer = blobService.getContainerClient(env.AZURE_STORAGE_CONTAINER_PRIVATE);
const publicContainer = blobService.getContainerClient(env.AZURE_STORAGE_CONTAINER_PUBLIC);

// Define allowed file types
const allowedImageTypes = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
  "image/bmp",
  "image/tiff",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];
const allowedVideoTypes = [
  "video/mp4",
  "video/webm",
  "video/ogg",
  "video/quicktime",
  "video/x-msvideo",
  "video/x-matroska",
  "video/avi",
];
const allowedDocumentTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "text/html",
  "text/css",
  "text/javascript",
  "application/json",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/rtf",
  "application/xml",
  "text/xml",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  "application/octet-stream",
  "application/x-binary",
];
const allowedFileTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes];

/** Determine the subdirectory (image / video / document) from a mimetype. */
export function getFileSubdirectory(mimetype: string): string {
  if (allowedImageTypes.includes(mimetype)) return "image";
  if (allowedVideoTypes.includes(mimetype)) return "video";
  if (allowedDocumentTypes.includes(mimetype)) return "document";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "document";
}

/**
 * Public URL for an object in the public container. Private objects are never public — read them
 * back through `getPresignedDownload` (a SAS URL) instead.
 */
export function getFileUrl(location: string): string {
  return location;
}

const commonExtensions = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "rtf",
  "zip",
  "rar",
  "7z",
  "json",
  "xml",
  "html",
  "css",
  "js",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "svg",
  "mp4",
  "webm",
  "ogg",
  "mov",
  "avi",
  "mkv",
  "bmp",
  "tiff",
  "ico",
];

const fileFilter: multer.Options["fileFilter"] = (_req, file, cb) => {
  const mimetype = file.mimetype || "";
  if (mimetype && allowedFileTypes.includes(mimetype)) return cb(null, true);

  // Some proxies send a generic/absent mimetype; fall back to the file extension.
  const extension = file.originalname.toLowerCase().split(".").pop();
  if (extension && commonExtensions.includes(extension)) return cb(null, true);

  cb(
    new Error(
      "Invalid file type. Allowed: images, videos, PDF, DOC, DOCX, XLS, XLSX, and other common formats.",
    ),
  );
};

function buildKey(file: Express.Multer.File): string {
  const subdir = getFileSubdirectory(file.mimetype);
  const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
  const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
  return `uploads/${subdir}/${uniqueSuffix}-${originalName}`;
}

/**
 * multer storage engine that streams the upload straight into Azure Blob. It sets the same fields
 * multer-s3 did — `key`, `location`, `size`, `contentType` — so existing controllers keep working.
 */
function azureStorage(container: ContainerClient): multer.StorageEngine {
  return {
    _handleFile(req: Request, file, cb) {
      const key = buildKey(file);
      const blockBlob = container.getBlockBlobClient(key);
      const chunks: Buffer[] = [];
      let size = 0;

      file.stream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
        size += chunk.length;
      });
      file.stream.on("error", cb);
      file.stream.on("end", () => {
        blockBlob
          .uploadData(Buffer.concat(chunks), {
            blobHTTPHeaders: { blobContentType: file.mimetype },
            metadata: { originalName: file.originalname, uploadedAt: new Date().toISOString() },
          })
          .then(() =>
            cb(null, {
              key,
              location: blockBlob.url,
              size,
              contentType: file.mimetype,
            } as Partial<Express.Multer.File>),
          )
          .catch(cb);
      });
    },
    _removeFile(_req, file, cb) {
      const key = (file as Express.Multer.File & { key?: string }).key;
      if (!key) return cb(null);
      container
        .getBlockBlobClient(key)
        .deleteIfExists()
        .then(() => cb(null))
        .catch(cb);
    },
  };
}

const limits = { fileSize: 100 * 1024 * 1024 }; // 100MB

/**
 * Default upload — PRIVATE by default. Files land in the private container and are read back via
 * short-lived SAS links (`getPresignedDownload`). This is the safe default for all internal files
 * (avatars, attachments, project/report files, HR assets).
 */
const upload = multer({ storage: azureStorage(privateContainer), fileFilter, limits });

/** Alias kept for existing imports; identical to the default private `upload`. */
export const privateUpload = upload;

/**
 * Public upload — ONLY for genuinely public website assets (news images, team/testimonial photos)
 * that anonymous visitors load directly. Stored in the public container with public read URLs.
 */
export const publicUpload = multer({ storage: azureStorage(publicContainer), fileFilter, limits });

export default upload;
