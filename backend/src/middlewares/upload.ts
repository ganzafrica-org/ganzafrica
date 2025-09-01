import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure main uploads directory exists
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Ensure subdirectories exist
const documentDir = path.join(uploadDir, "document");
const imageDir = path.join(uploadDir, "image");
const videoDir = path.join(uploadDir, "video");

if (!fs.existsSync(documentDir)) {
  fs.mkdirSync(documentDir, { recursive: true });
}
if (!fs.existsSync(imageDir)) {
  fs.mkdirSync(imageDir, { recursive: true });
}
if (!fs.existsSync(videoDir)) {
  fs.mkdirSync(videoDir, { recursive: true });
}

// Define allowed file types
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
const allowedDocumentTypes = [
  'application/pdf',                                                      
  'application/msword',                                                   
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const allowedFileTypes = [...allowedImageTypes, ...allowedVideoTypes, ...allowedDocumentTypes];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Determine the appropriate directory based on file type
    if (allowedImageTypes.includes(file.mimetype)) {
      cb(null, path.join("uploads", "image"));
    } else if (allowedVideoTypes.includes(file.mimetype)) {
      cb(null, path.join("uploads", "video"));
    } else if (allowedDocumentTypes.includes(file.mimetype)) {
      cb(null, path.join("uploads", "document"));
    } else {
      cb(null, "uploads/"); // Fallback, though file filter should prevent this
    }
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
    cb(null, uniqueSuffix + "-" + originalName);
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
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  }
});

export default upload;