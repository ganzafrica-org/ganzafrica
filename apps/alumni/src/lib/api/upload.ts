import apiClient from "../api-client";

export interface UploadedFile {
  name: string;
  filename: string;
  url: string;
  path: string;
  size: number;
  type: string;
  category: string;
}

export interface UploadFileResponse {
  success: boolean;
  message: string;
  file: UploadedFile;
}

export interface UploadFilesResponse {
  success: boolean;
  message: string;
  files: UploadedFile[];
}

/**
 * Upload a single file to the server
 * @param file - The file to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Upload response with file details
 */
export const uploadFile = async (
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadFileResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await apiClient.post("/uploads/file", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(progress);
      }
    },
  });

  return response.data;
};

/**
 * Upload multiple files to the server
 * @param files - The files to upload
 * @param onProgress - Optional callback for upload progress
 * @returns Upload response with files details
 */
export const uploadFiles = async (
  files: File[],
  onProgress?: (progress: number) => void
): Promise<UploadFilesResponse> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });

  const response = await apiClient.post("/uploads/files", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(progress);
      }
    },
  });

  return response.data;
};

/**
 * Get file size in human-readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Get file type category from mimetype
 */
export const getFileCategory = (mimetype: string): string => {
  if (mimetype.startsWith("image/")) return "Image";
  if (mimetype.startsWith("video/")) return "Video";
  if (mimetype.includes("pdf")) return "PDF";
  if (mimetype.includes("word") || mimetype.includes("document")) return "Document";
  return "File";
};
