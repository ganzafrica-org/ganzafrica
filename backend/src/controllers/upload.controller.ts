import { Request, Response } from 'express';
import { uploadToSpaces, deleteFromSpaces, getFileInfo } from '../services/upload.service';

/**
 * Upload single file to Digital Ocean Spaces
 */
export const uploadFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const { folder = 'uploads' } = req.body;

    // Upload to Digital Ocean Spaces
    const fileUrl = await uploadToSpaces(req.file, folder);

    res.status(201).json({
      success: true,
      data: {
        filename: req.file.originalname,
        url: fileUrl,
        mimeType: req.file.mimetype,
        size: req.file.size,
        folder: folder,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
};

/**
 * Upload multiple files to Digital Ocean Spaces
 */
export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files provided' });
    }

    const { folder = 'uploads' } = req.body;

    const uploadPromises = files.map(async (file) => {
      const fileUrl = await uploadToSpaces(file, folder);
      
      return {
        filename: file.originalname,
        url: fileUrl,
        mimeType: file.mimetype,
        size: file.size,
        folder: folder,
      };
    });

    const uploadedFiles = await Promise.all(uploadPromises);

    res.status(201).json({
      success: true,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
};

/**
 * Delete file from Digital Ocean Spaces by URL
 */
export const deleteFileByUrl = async (req: Request, res: Response) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'File URL is required' });
    }

    // Delete from Digital Ocean Spaces
    await deleteFromSpaces(url);

    res.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};

/**
 * Get file info from Digital Ocean Spaces by URL
 */
export const getFileDetailsByUrl = async (req: Request, res: Response) => {
  try {
    const { url } = req.query;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ error: 'File URL is required' });
    }

    const fileInfo = await getFileInfo(url);

    res.json({
      success: true,
      data: {
        url,
        ...fileInfo,
      },
    });
  } catch (error) {
    console.error('Get file details error:', error);
    res.status(500).json({ error: 'Failed to get file details' });
  }
};