import AWS from 'aws-sdk';
import multer from 'multer';
import path from 'path';

// Configure Digital Ocean Spaces (compatible with AWS S3)
const spacesEndpoint = new AWS.Endpoint(process.env.DO_SPACES_ENDPOINT || '');
const s3 = new AWS.S3({
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DO_SPACES_KEY || '',
  secretAccessKey: process.env.DO_SPACES_SECRET || '',
  region: process.env.DO_SPACES_REGION || 'nyc3',
  s3ForcePathStyle: false,
});

const BUCKET_NAME = process.env.DO_SPACES_BUCKET || '';

// Multer configuration for memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mov|avi|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and documents are allowed.'));
  }
};

// Multer upload configuration
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

/**
 * Upload file to Digital Ocean Spaces
 */
export async function uploadToSpaces(file: Express.Multer.File, folder?: string): Promise<string> {
  try {
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname);
    const fileName = `${timestamp}-${Math.random().toString(36).substring(7)}${fileExt}`;
    const key = folder ? `${folder}/${fileName}` : fileName;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read', // Make files publicly accessible
    };

    const result = await s3.upload(uploadParams).promise();
    return result.Location;
  } catch (error) {
    console.error('Error uploading to Spaces:', error);
    throw new Error('Failed to upload file');
  }
}

/**
 * Delete file from Digital Ocean Spaces
 */
export async function deleteFromSpaces(fileUrl: string): Promise<void> {
  try {
    // Extract key from URL
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1); // Remove leading slash

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(deleteParams).promise();
  } catch (error) {
    console.error('Error deleting from Spaces:', error);
    throw new Error('Failed to delete file');
  }
}

/**
 * Get file info from Digital Ocean Spaces
 */
export async function getFileInfo(fileUrl: string) {
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1);

    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const result = await s3.headObject(params).promise();
    return {
      size: result.ContentLength,
      lastModified: result.LastModified,
      contentType: result.ContentType,
    };
  } catch (error) {
    console.error('Error getting file info:', error);
    throw new Error('Failed to get file info');
  }
}

/**
 * Generate presigned URL for direct uploads (optional for future use)
 */
export async function generatePresignedUrl(key: string, contentType: string): Promise<string> {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      Expires: 300, // 5 minutes
    };

    return await s3.getSignedUrlPromise('putObject', params);
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw new Error('Failed to generate upload URL');
  }
}