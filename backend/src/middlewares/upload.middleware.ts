import { Request, Response, NextFunction } from 'express';
import { upload } from '../services/upload.service';

/**
 * Middleware that handles both JSON and multipart/form-data
 * If Content-Type is multipart/form-data, it processes the upload
 * Otherwise, it passes through to the next middleware
 */
export const handleOptionalUpload = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type') || '';
    
    // If it's multipart/form-data, use multer
    if (contentType.includes('multipart/form-data')) {
      return upload.single(fieldName)(req, res, next);
    }
    
    // Otherwise, just continue (for JSON requests)
    next();
  };
};

/**
 * Middleware for multiple file uploads
 */
export const handleOptionalMultipleUpload = (fieldName: string, maxFiles: number = 10) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const contentType = req.get('Content-Type') || '';
    
    if (contentType.includes('multipart/form-data')) {
      return upload.array(fieldName, maxFiles)(req, res, next);
    }
    
    next();
  };
};

/**
 * Middleware to handle mixed JSON and form data
 * When using multipart, some fields might be JSON strings that need parsing
 */
export const parseFormData = (jsonFields: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const contentType = req.get('Content-Type') || '';
      
      if (contentType.includes('multipart/form-data')) {
        // Parse JSON fields from form data
        for (const field of jsonFields) {
          if (req.body[field] && typeof req.body[field] === 'string') {
            try {
              req.body[field] = JSON.parse(req.body[field]);
            } catch (e) {
              // If parsing fails, leave as string
            }
          }
        }
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};