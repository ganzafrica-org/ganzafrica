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
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const allowedDocumentTypes = [
  'application/pdf',                                                      
  'application/msword',                                                   
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
  }
  return ""; // Default case, should not happen due to file filter
}

const spacesStorage = multerS3({
  s3: s3Client,
  bucket: env.DO_SPACES_BUCKET,
  acl: 'public-read', // Make files publicly accessible
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
  if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only images, videos, PDF, DOC, and DOCX files are allowed."));
  }
};

const upload = multer({ 
  storage: spacesStorage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

export default upload;