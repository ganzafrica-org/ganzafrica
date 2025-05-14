'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card } from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Textarea } from '@workspace/ui/components/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@workspace/ui/components/select';
import { ArrowLeft, Upload, X, Image as ImageIcon, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { Avatar, AvatarImage, AvatarFallback } from '@workspace/ui/components/avatar';
import { cn } from '@workspace/ui/lib/utils';
import apiClient from '@/lib/api-client';

interface FormData {
  author_name: string;
  position: string;
  company: string;
  description: string;
  occupation: string;
  rating: number;
  image: string;
  date: string;
}

const initialFormData: FormData = {
  author_name: '',
  position: '',
  company: '',
  description: '',
  occupation: '',
  rating: 5,
  image: '',
  date: new Date().toISOString()
};

export default function AddTestimonialPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleInputChange = (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    } else {
      toast.error('Please upload an image file');
    }
  };

  const handleImageUpload = (file: File) => {
    // Store the file for later server upload
    setImageFile(file);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImagePreview(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    setFormData(prev => ({ ...prev, image: '' }));
    setUploadProgress(0);
    setUploadStatus('idle');
  };

  // Upload the image to the server and get a URL back
  const uploadImageToServer = async (file: File): Promise<string> => {
    try {
      setUploadProgress(0);
      setUploadStatus('uploading');
      
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Make the upload request
      const response = await apiClient.post('/uploads/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      // Check if upload was successful
      if (response.data && response.data.success) {
        console.log('File uploaded successfully:', response.data.file);
        setUploadStatus('success');
        return response.data.file.url;
      } else {
        setUploadStatus('error');
        throw new Error('File upload failed: Server returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadStatus('error');
      toast.error('Failed to upload image. Please try again.');
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!formData.author_name || !formData.position || !formData.company || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      let testimonialData = { ...formData };
      
      // If we have a file, upload it first
      if (imageFile) {
        try {
          const imageUrl = await uploadImageToServer(imageFile);
          testimonialData.image = imageUrl;
        } catch (error) {
          setIsLoading(false);
          return; // Exit early if image upload fails
        }
      }
      
      // Then submit the testimonial with the image URL
      const response = await apiClient.post('/testimonials', testimonialData);
      
      if (response.data) {
        toast.success('Testimonial added successfully');
        router.push('/testimonials');
      } else {
        throw new Error('Failed to add testimonial: No response data');
      }
    } catch (error: any) {
      console.error('Error adding testimonial:', error);
      toast.error(error.response?.data?.message || 'Failed to add testimonial. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get upload status text
  const getUploadStatusText = () => {
    switch (uploadStatus) {
      case 'uploading':
        return `Uploading: ${uploadProgress}%`;
      case 'success':
        return 'Upload complete!';
      case 'error':
        return 'Upload failed. Please try again.';
      default:
        return '';
    }
  };

  // Function to get upload status color
  const getUploadStatusColor = () => {
    switch (uploadStatus) {
      case 'uploading':
        return 'bg-blue-600';
      case 'success':
        return 'bg-green-600';
      case 'error':
        return 'bg-red-600';
      default:
        return 'bg-gray-600';
    }
  };

  return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-gray-600"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Add New Testimonial</h1>
            <p className="text-gray-600 text-sm mt-1">Create a new client testimonial</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image Upload Section */}
              <div className="space-y-4">
                <Label>Profile Image</Label>
                <div
                    className={cn(
                        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
                        isDragging ? "border-primary-green bg-green-50" : "border-gray-200 hover:border-gray-300",
                        imagePreview ? "p-4" : "h-48 flex flex-col items-center justify-center"
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleImageDrop}
                    onClick={() => document.getElementById('imageInput')?.click()}
                >
                  <input
                      type="file"
                      id="imageInput"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                  />

                  {imagePreview ? (
                      <div className="relative">
                        <Avatar className="w-32 h-32 mx-auto">
                          <AvatarImage src={imagePreview} alt="Preview" />
                          <AvatarFallback>
                            <ImageIcon className="w-16 h-16 text-gray-400" />
                          </AvatarFallback>
                        </Avatar>
                        <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage();
                            }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                  ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400 mb-4" />
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            Drop an image here, or click to select
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG up to 10MB
                          </p>
                        </div>
                      </>
                  )}
                </div>
                
                {/* Upload Progress Indicator */}
                {uploadStatus !== 'idle' && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className={`${getUploadStatusColor()} h-2.5 rounded-full transition-all duration-300`} 
                        style={{ width: uploadStatus === 'uploading' ? `${uploadProgress}%` : '100%' }}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 text-center ${
                      uploadStatus === 'error' ? 'text-red-500' : 
                      uploadStatus === 'success' ? 'text-green-500' : 
                      'text-gray-500'
                    }`}>
                      {getUploadStatusText()}
                    </p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="author_name" className="text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="author_name"
                      name="author_name"
                      value={formData.author_name}
                      onChange={handleInputChange}
                      placeholder="Enter full name"
                      required
                      className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium">
                    Position <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="position"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      placeholder="e.g. CEO, Project Manager"
                      required
                      className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="company" className="text-sm font-medium">
                    Company <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      placeholder="Enter company name"
                      required
                      className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="occupation" className="text-sm font-medium">
                    Occupation <span className="text-red-500">*</span>
                  </Label>
                  <Input
                      id="occupation"
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      placeholder="e.g. Fellow, Manager"
                      required
                      className="w-full"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Testimonial Quote <span className="text-red-500">*</span>
                </Label>
                <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter the testimonial quote..."
                    required
                    className="min-h-[120px]"
                />
                <p className="text-xs text-gray-500">
                  Write a meaningful quote that reflects the client's experience
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rating" className="text-sm font-medium">
                  Rating
                </Label>
                <Select
                    value={formData.rating.toString()}
                    onValueChange={(value) => handleSelectChange('rating', parseInt(value))}
                >
                  <SelectTrigger id="rating">
                    <SelectValue placeholder="Select a rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Star</SelectItem>
                    <SelectItem value="2">2 Stars</SelectItem>
                    <SelectItem value="3">3 Stars</SelectItem>
                    <SelectItem value="4">4 Stars</SelectItem>
                    <SelectItem value="5">5 Stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                    type="submit"
                    className="bg-primary-green hover:bg-green-700"
                    disabled={isLoading || uploadStatus === 'uploading'}
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </div>
                  ) : (
                    'Add Testimonial'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
  );
}