"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from "@workspace/ui/components/textarea";
import { Calendar, AlertCircle, Loader } from "lucide-react";
import { useRouter } from 'next/navigation';


export default function CreateOpportunityPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    title: '',
    deadline: '',
    positions: '',
    location: '',
    briefDetails: '',
    responsibilities: '',
    requirements: '',
  });

  const [fileUploads, setFileUploads] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null); 

interface FormData {
    title: string;
    deadline: string;
    positions: string;
    location: string;
    briefDetails: string;
    responsibilities: string;
    requirements: string;
}

interface FileEvent extends React.ChangeEvent<HTMLInputElement> {
    target: HTMLInputElement & EventTarget;
}

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevFormData: FormData) => ({
        ...prevFormData,
        [name]: value
    }));
};

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      
      // Validate each file
      const validFiles = filesArray.filter(file => {
        // Check for valid image types
        const isValidImage = (file as File).type.match(/image\/(jpeg|jpg|png|gif)/i);
        
        // Check for valid video types
        const isValidVideo = file.type.match(/video\/(mp4|webm|ogg|quicktime)/i);
        
        if (!isValidImage && !isValidVideo) {
          setError(`File "${file.name}" is not a supported file type. Please upload only JPG, PNG, GIF images or MP4, WebM, OGG videos.`);
          return false;
        }
        
        // Different size limits for images and videos
        const isImage = file.type.startsWith('image/');
        const maxSize = isImage ? 5 * 1024 * 1024 : 50 * 1024 * 1024; // 5MB for images, 50MB for videos
        
        if (file.size > maxSize) {
          setError(`File "${file.name}" exceeds the size limit (${isImage ? '5MB' : '50MB'}).`);
          return false;
        }
        
        return true;
      });
      
      if (validFiles.length > 0) {
        setFileUploads([...fileUploads, ...validFiles]);
        
        if (validFiles.length === filesArray.length) {
          setError('');
        }
      }
    }
  };

  // Function to trigger file input click programmatically
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle drag and drop functionality
const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('border-blue-500');
};

const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500');
};

interface DropEvent extends React.DragEvent<HTMLDivElement> {
    dataTransfer: DataTransfer & {
        files: FileList;
    };
}

const handleDrop = (e: DropEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('border-blue-500');
    
    if (e.dataTransfer.files.length > 0) {
        // Create a new event-like object to pass to handleFileChange
        const fileEvent: FileEvent = {
            target: {
                files: e.dataTransfer.files
            }
        } as FileEvent;
        handleFileChange(fileEvent);
    }
};

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
        // Here you would normally submit to your API
        console.log('Submitting form data:', formData);
        console.log('Files:', fileUploads);
        
        // Simulate API call
        await new Promise<void>(resolve => setTimeout(resolve, 1000));
        
        // Success - redirect
        alert('Opportunity created successfully!');
        // router.push('/opportunities');
    } catch (err) {
        console.error('Error creating opportunity:', err);
        setError(err instanceof Error ? err.message : 'Failed to create opportunity. Please try again.');
    } finally {
        setIsLoading(false);
    }
};

  const handleCancel = () => {
    router.push('/opportunities');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Opportunities</h1>
        <p className="text-gray-600">Opportunities/Create New Opportunity</p>
      </div>
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6">
        {/* Opportunity Details Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Left column - section title */}
            <div className="w-full md:w-1/4 pr-0 md:pr-8 mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Opportunity Details</h2>
              <p className="text-gray-600 text-sm">
                Our holistic approach addresses challenges and leverages opportunities in 3 main sectors.
              </p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-full md:w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Opportunity Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium mb-1">
                    Opportunity Title<span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter opportunity title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Application deadline - changed to date input */}
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium mb-1">
                    Application deadline<span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="deadline"
                    name="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    required
                    className="w-full !appearance-none"
                    style={{ 
                      backgroundPosition: "right 0.5rem center",
                      paddingRight: "2.5rem"
                    }}
                  />
                </div>

                {/* No. of available positions - changed to number input */}
                <div>
                  <label htmlFor="positions" className="block text-sm font-medium mb-1">
                    No. of available positions
                  </label>
                  <Input
                    id="positions"
                    name="positions"
                    type="number"
                    min="1"
                    placeholder="Enter number of positions"
                    value={formData.positions}
                    onChange={handleInputChange}
                  />
                </div>

                {/* Job Location - changed to text input */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium mb-1">
                    Job Location
                  </label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="Enter job location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* Opportunity brief/details */}
              <div className="mb-6">
                <label htmlFor="briefDetails" className="block text-sm font-medium mb-1">
                  Opportunity brief/details<span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="briefDetails"
                  name="briefDetails"
                  placeholder="Details goes here ..."
                  value={formData.briefDetails}
                  onChange={handleInputChange}
                  className="w-full min-h-32"
                  required
                />
              </div>

              {/* Responsibilities and Requirements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="responsibilities" className="block text-sm font-medium mb-1">
                    Responsibilities<span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="responsibilities"
                    name="responsibilities"
                    placeholder="Details goes here ..."
                    value={formData.responsibilities}
                    onChange={handleInputChange}
                    className="w-full min-h-32"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="requirements" className="block text-sm font-medium mb-1">
                    Requirements and skills<span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    id="requirements"
                    name="requirements"
                    placeholder="Details goes here ..."
                    value={formData.requirements}
                    onChange={handleInputChange}
                    className="w-full min-h-32"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line divider */}
        <hr className="my-8 border-t border-gray-200" />

        {/* Files & Uploads Section */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row">
            {/* Left column - section title */}
            <div className="w-full md:w-1/4 pr-0 md:pr-8 mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Files & Uploads</h2>
              <p className="text-gray-600 text-sm">
                Images: JPG, PNG or GIF (up to 5MB)<br />
                Videos: MP4, WebM, OGG (up to 50MB)
              </p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-full md:w-3/4">
              <label className="block text-sm font-medium mb-2">Please attach any relevant files (images and videos)</label>
              {/* Improved drop zone with click functionality across the entire area */}
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center mb-4 cursor-pointer hover:border-blue-400 transition-colors"
                onClick={triggerFileInput}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex flex-col items-center justify-center">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-2">
                    <path d="M12 16V8M12 8L9 11M12 8L15 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 15V16C3 17.6569 3 18.4853 3.24224 19.0815C3.45738 19.6037 3.81948 20.0396 4.29285 20.3231C4.83076 20.6415 5.52731 20.7218 7 20.7218H17C18.4727 20.7218 19.1692 20.7218 19.7071 20.4034C20.1805 20.1199 20.5426 19.684 20.7578 19.1618C21 18.5656 21 17.7372 21 16.0803V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <p className="text-sm text-gray-500 mb-1">
                    <span className="text-blue-500 font-medium">Click to browse</span> or drag and drop files
                  </p>
                  <p className="text-xs text-gray-400">Upload images or videos related to this opportunity</p>
                </div>
                <input 
                  type="file" 
                  id="fileUpload"
                  ref={fileInputRef}
                  className="hidden" 
                  multiple
                  accept="image/jpeg,image/png,image/gif,video/mp4,video/webm,video/ogg,video/quicktime"
                  onChange={handleFileChange}
                />
              </div>

              {/* Display uploaded files */}
              {fileUploads.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Files:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fileUploads.map((file, index) => (
                      <div key={index} className="border rounded-md p-3 flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                            {file.type.startsWith('image/') ? (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {file.type.startsWith('image/') ? 'Image' : 'Video'} • {file.size > 1024 * 1024 
                              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
                              : `${(file.size / 1024).toFixed(1)} KB`}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const newFiles = [...fileUploads];
                            newFiles.splice(index, 1);
                            setFileUploads(newFiles);
                          }}
                          className="flex-shrink-0 ml-2 text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Form buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="px-6"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-800 hover:bg-green-900 text-white px-6 flex items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : 'Submit'}
          </Button>
        </div>
      </form>
    </div>
  );
}