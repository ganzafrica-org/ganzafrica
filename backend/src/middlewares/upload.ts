import type { Request } from "express";
import multer from "multer";
import type { Request } from "express";
import { PassThrough } from "stream";
import {
  BlobServiceClient,
  StorageSharedKeyCredential,
  type ContainerClient,
} from "@azure/storage-blob";
import env from "../config/env";

// Azure equivalent of what @types/multer-s3 used to add — the storage engine below augments
// each uploaded file with these, same shape every controller already reads (see the
// "multer-s3 augments..." comments throughout).
declare global {
  namespace Express {
    namespace Multer {
      interface File {
        key?: string;
        location?: string;
        bucket?: string;
      }
    }
  }
}

const sharedKeyCredential = new StorageSharedKeyCredential(
  env.AZURE_STORAGE_ACCOUNT,
  env.AZURE_STORAGE_ACCOUNT_KEY,
);
const blobServiceClient = new BlobServiceClient(env.AZURE_STORAGE_ENDPOINT, sharedKeyCredential);
const publicContainer = blobServiceClient.getContainerClient(env.AZURE_STORAGE_CONTAINER_PUBLIC);
const privateContainer = blobServiceClient.getContainerClient(env.AZURE_STORAGE_CONTAINER_PRIVATE);

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
  if (env.AZURE_STORAGE_CDN_URL) {
    return location.replace(
      env.AZURE_STORAGE_ENDPOINT.replace(/\/$/, ""),
      env.AZURE_STORAGE_CDN_URL.replace(/\/$/, ""),
    );
  }
  return location;
}

interface MulterFile {
  mimetype: string;
  originalname: string;
}

interface MulterRequest extends Express.Request {}

const fileFilter = (req: MulterRequest, file: MulterFile, cb: multer.FileFilterCallback): void => {
  // Allow if mimetype is in allowed list (handle undefined/empty from some proxies)

  const mimetype = file.mimetype || "";
  if (mimetype && allowedFileTypes.includes(mimetype)) return cb(null, true);

  // Special handling for generic binary types - check file extension
  if (mimetype === "application/octet-stream" || mimetype === "application/x-binary") {
    const extension = file.originalname.toLowerCase().split(".").pop();
    const allowedExtensions = [
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
    ];

    if (extension && allowedExtensions.includes(extension)) {
      cb(null, true);
      return;
    }
  }

  // Check for common file extensions even with unknown mimetypes
  const extension = file.originalname.toLowerCase().split(".").pop();
  if (extension && commonExtensions.includes(extension)) return cb(null, true);

  if (extension && commonExtensions.includes(extension)) {
    cb(null, true);
    return;
  }

  cb(
    new Error(
      "Invalid file type. Allowed: images, videos, PDF, DOC, DOCX, XLS, XLSX, and other common formats.",
    ),
  );
};

/**
 * multer storage engine backed by an Azure Blob container — the Azure equivalent of the old
 * multer-s3 storage engine. Augments the uploaded file with `key` (the blob name) and `location`
 * (the blob's URL), the same two properties every call site already reads (see the "multer-s3
 * augments..." comments throughout the controllers — that augmentation shape is unchanged, only
 * the backend producing it is).
 */
class AzureBlobStorage implements multer.StorageEngine {
  constructor(private container: ContainerClient) {}

  _handleFile(
    _req: Request,
    file: Express.Multer.File,
    cb: (error?: any, info?: Partial<Express.Multer.File>) => void,
  ) {
    const subdir = getFileSubdirectory(file.mimetype);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    const blobName = `${subdir}/${uniqueSuffix}-${originalName}`;

    let size = 0;
    const counter = new PassThrough();
    counter.on("data", (chunk: Buffer) => {
      size += chunk.length;
    });
    file.stream.pipe(counter);

    const blockBlobClient = this.container.getBlockBlobClient(blobName);
    blockBlobClient
      .uploadStream(counter, 4 * 1024 * 1024, 5, {
        blobHTTPHeaders: { blobContentType: file.mimetype },
      })
      .then(() =>
        cb(null, {
          key: blobName,
          location: `${this.container.url}/${blobName}`,
          size,
          bucket: this.container.containerName,
        }),
      )
      .catch(cb);
  }

  _removeFile(_req: Request, file: Express.Multer.File, cb: (error: Error | null) => void) {
    const key = file.key;
    if (!key) return cb(null);
    this.container
      .getBlockBlobClient(key)
      .deleteIfExists()
      .then(() => cb(null))
      .catch(cb);
  }
}

const upload = multer({
  storage: new AzureBlobStorage(publicContainer),
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Private upload variant for documents and other sensitive files (served via short-lived SAS
// links — see storage.service.ts's getPresignedDownload — never a direct/public blob URL).
export const privateUpload = multer({
  storage: new AzureBlobStorage(privateContainer),
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export default upload;
