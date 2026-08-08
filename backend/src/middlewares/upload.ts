import multer from "multer";
import multerS3 from "multer-s3";
import { S3Client } from "@aws-sdk/client-s3";
import env from "../config/env";

// Create S3 client for Digital Ocean Spaces
const s3Client = new S3Client({
  endpoint: env.DO_SPACES_ENDPOINT,
  region: env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: env.DO_SPACES_ACCESS_KEY,
    secretAccessKey: env.DO_SPACES_SECRET_KEY,
  },
  forcePathStyle: false, // Digital Ocean Spaces uses virtual-hosted-style URLs
});

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
  // Word documents
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  // Spreadsheets
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  // Presentations
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Text files
  "text/plain",
  "text/csv",
  "text/html",
  "text/css",
  "text/javascript",
  "application/json",
  // Archives
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  // Other common formats
  "application/rtf",
  "application/xml",
  "text/xml",
  "application/vnd.oasis.opendocument.text",
  "application/vnd.oasis.opendocument.spreadsheet",
  "application/vnd.oasis.opendocument.presentation",
  // Additional formats
  "application/octet-stream", // Generic binary
  "application/x-binary", // Generic binary
];
const allowedFileTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes];

/**
 * Helper function to determine subdirectory based on mimetype
 */
export function getFileSubdirectory(mimetype: string): string {
  if (allowedImageTypes.includes(mimetype)) {
    return "image";
  } else if (allowedVideoTypes.includes(mimetype)) {
    return "video";
  } else if (allowedDocumentTypes.includes(mimetype)) {
    return "document";
  } else if (mimetype.startsWith("image/")) {
    return "image";
  } else if (mimetype.startsWith("video/")) {
    return "video";
  } else if (mimetype.startsWith("audio/")) {
    return "document"; // Audio files go to documents
  } else if (mimetype.startsWith("application/") || mimetype.startsWith("text/")) {
    return "document";
  }
  return "document"; // Default fallback
}

export function getFileUrl(location: string): string {
  if (env.DO_SPACES_CDN_URL) {
    return location.replace(
      env.DO_SPACES_ENDPOINT.replace(/\/$/, ""),
      env.DO_SPACES_CDN_URL.replace(/\/$/, ""),
    );
  }
  return location;
}

const spacesStorage = multerS3({
  s3: s3Client,
  bucket: env.DO_SPACES_BUCKET,
  acl: "public-read", // Make files publicly accessible
  key: function (req, file, cb) {
    // Determine the appropriate directory based on file type
    const subdir = getFileSubdirectory(file.mimetype);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = uniqueSuffix + "-" + originalName;

    // Create key with subdirectory
    const key = `uploads/${subdir}/${filename}`;
    cb(null, key);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, {
      originalName: file.originalname,
      uploadedAt: new Date().toISOString(),
    });
  },
});

interface MulterFile {
  mimetype: string;
  originalname: string;
}

interface MulterRequest extends Express.Request {}

const fileFilter = (req: MulterRequest, file: MulterFile, cb: multer.FileFilterCallback): void => {
  // NOTE: If production shows "Only images, videos, PDF, DOC, and DOCX" the deployed
  // backend is outdated. Run: cd backend && npm run build && restart the server.
  console.log("File upload attempt:", {
    originalname: file.originalname,
    mimetype: file.mimetype,
    allowedTypes: allowedFileTypes.length,
  });

  // Allow if mimetype is in allowed list (handle undefined/empty from some proxies)
  const mimetype = file.mimetype || "";
  if (mimetype && allowedFileTypes.includes(mimetype)) {
    cb(null, true);
    return;
  }

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
      console.log("Allowed file with generic mimetype based on extension:", extension);
      cb(null, true);
      return;
    }
  }

  // Check for common file extensions even with unknown mimetypes
  const extension = file.originalname.toLowerCase().split(".").pop();
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

  if (extension && commonExtensions.includes(extension)) {
    console.log("Allowed file based on extension:", extension, "despite mimetype:", mimetype);
    cb(null, true);
    return;
  }

  console.log("Rejected file type:", mimetype, "for file:", file.originalname);
  cb(
    new Error(
      "Invalid file type. Allowed: images, videos, PDF, DOC, DOCX, XLS, XLSX, and other common formats.",
    ),
  );
};

const upload = multer({
  storage: spacesStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

// Private upload variant for documents and other sensitive files (ACL: private)
const privateSpacesStorage = multerS3({
  s3: s3Client,
  bucket: env.DO_SPACES_BUCKET,
  acl: "private", // Private access - no public read
  key: function (req, file, cb) {
    const subdir = getFileSubdirectory(file.mimetype);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    const filename = uniqueSuffix + "-" + originalName;
    const key = `uploads/${subdir}/${filename}`;
    cb(null, key);
  },
  contentType: multerS3.AUTO_CONTENT_TYPE,
  metadata: function (req, file, cb) {
    cb(null, {
      originalName: file.originalname,
      uploadedAt: new Date().toISOString(),
    });
  },
});

export const privateUpload = multer({
  storage: privateSpacesStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
});

export default upload;
