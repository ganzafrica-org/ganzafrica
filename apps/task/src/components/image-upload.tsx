'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/button';

interface ImageUploadProps {
  onImageChange: (file: File | null) => void;
  initialImage?: string;
  className?: string;
  label?: string;
  description?: string;
  isUploading?: boolean;
}

export function ImageUpload({ 
  onImageChange, 
  initialImage, 
  className,
  label = 'Profile Image',
  description = 'Upload a profile image (JPG, PNG, GIF up to 5MB)',
  isUploading = false
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, or GIF)');
      return false;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size should be less than 5MB');
      return false;
    }

    return true;
  };

  const handleFileChange = (file: File) => {
    if (!validateFile(file)) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    onImageChange(file);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    handleFileChange(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleFileChange(file);
  }, []);

  const handleRemoveImage = () => {
    setPreview(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className || ''}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {description && (
        <p className="text-sm text-gray-500">
          {description}
        </p>
      )}
      <div
        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {preview ? (
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-offset-2 ring-blue-500">
              <img 
                src={preview} 
                alt="Profile preview" 
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={handleRemoveImage}
              className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="rounded-full p-3 bg-gray-100">
              <ImageIcon className="h-6 w-6 text-gray-500" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700">
                Drag and drop or click to upload
              </p>
              <p className="text-xs text-gray-500">
                JPG, PNG, GIF up to 5MB
              </p>
            </div>
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="image/*"
          className="hidden"
          id="image-upload"
          aria-label="Upload profile image"
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="mt-4"
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Uploading...
            </>
          ) : (
            preview ? 'Change Image' : 'Select Image'
          )}
        </Button>
      </div>
    </div>
  );
}
