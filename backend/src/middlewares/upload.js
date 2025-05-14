"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure main uploads directory exists
const uploadDir = path_1.default.join(__dirname, "../../uploads");
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
// Ensure subdirectories exist
const documentDir = path_1.default.join(uploadDir, "document");
const imageDir = path_1.default.join(uploadDir, "image");
const videoDir = path_1.default.join(uploadDir, "video");
if (!fs_1.default.existsSync(documentDir)) {
    fs_1.default.mkdirSync(documentDir, { recursive: true });
}
if (!fs_1.default.existsSync(imageDir)) {
    fs_1.default.mkdirSync(imageDir, { recursive: true });
}
if (!fs_1.default.existsSync(videoDir)) {
    fs_1.default.mkdirSync(videoDir, { recursive: true });
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
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // Determine the appropriate directory based on file type
        if (allowedImageTypes.includes(file.mimetype)) {
            cb(null, path_1.default.join("uploads", "image"));
        }
        else if (allowedVideoTypes.includes(file.mimetype)) {
            cb(null, path_1.default.join("uploads", "video"));
        }
        else if (allowedDocumentTypes.includes(file.mimetype)) {
            cb(null, path_1.default.join("uploads", "document"));
        }
        else {
            cb(null, "uploads/"); // Fallback, though file filter should prevent this
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, "_");
        cb(null, uniqueSuffix + "-" + originalName);
    },
});
const fileFilter = (req, file, cb) => {
    if (allowedFileTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error("Invalid file type. Only images, videos, PDF, DOC, and DOCX files are allowed."));
    }
};
const upload = (0, multer_1.default)({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    }
});
exports.default = upload;
