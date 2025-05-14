"use client";

import React, { useState, useEffect, useRef } from 'react';
import apiClient from '@/lib/api-client';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Plus,
  X,
  Upload,
  Image as ImageIcon,
  FileVideo,
  Check,
  AlertCircle,
  Loader,
  Calendar,
  ChevronDown,
  Tag as TagIcon,
  Link as LinkIcon
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const EditNewsPage = ({ params }) => {
  const router = useRouter();
  const newsId = params?.id;
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tags, setTags] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [useMediaUrl, setUseMediaUrl] = useState(false);

  // Valid enum values based on the validation error
  const categories = ['all', 'news', 'blogs', 'reports', 'publications'];
  const statuses = ['published', 'draft', 'archived'];

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    status: 'published',
    publish_date: new Date().toISOString(),
    category: 'news',
    key_lessons: '',
    media: {
      items: []
    }
  });

  // Temporary state for new media
  const [newMedia, setNewMedia] = useState({
    file: null,
    type: 'image',
    title: '',
    cover: false,
    url: '' // For URL input
  });

  // Selected tags for the news article
  const [selectedTags, setSelectedTags] = useState([]);

  // Fetch news data on component mount
  useEffect(() => {
    const fetchNewsData = async () => {
      if (!newsId) {
        setError('News ID is missing.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await apiClient.get(`/news/${newsId}`);
        
        if (response.data && response.data.news) {
          const news = response.data.news;
          
          // Convert ISO dates to local date format for input fields
          let publishDate = news.publish_date || new Date().toISOString();
          
          // Process tags
          const tagIds = news.tags ? news.tags.map(tag => tag.id) : [];
          setSelectedTags(tagIds);
          
          // Process media items - convert base64 back to object URLs if needed
          const mediaItems = news.media?.items || [];
          
          // Set the form data
          setFormData({
            title: news.title || '',
            content: news.content || '',
            summary: news.summary || '',
            status: news.status || 'published',
            publish_date: publishDate,
            category: news.category || 'news',
            key_lessons: news.key_lessons || '',
            media: {
              items: mediaItems
            }
          });
        } else {
          setError('News data not found.');
        }
      } catch (error) {
        console.error('Error fetching news data:', error);
        setError('Failed to load news data. Please try again later.');
        toast.error('Failed to load news article');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNewsData();
  }, [newsId]);

  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await apiClient.get('/news/tags');
        if (response.data && Array.isArray(response.data.tags)) {
          setTags(response.data.tags);
        } else if (Array.isArray(response.data)) {
          setTags(response.data);
        } else {
          console.error('Unexpected tags response format:', response.data);
          setTags([]);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
        setTags([]);
      }
    };

    fetchTags();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle text area change
  const handleTextAreaChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle between URL and file upload
  const toggleMediaUrlMode = () => {
    setUseMediaUrl(!useMediaUrl);
    // Reset the new media state
    setNewMedia({
      file: null,
      type: 'image',
      title: '',
      cover: false,
      url: ''
    });
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle URL input change
  const handleMediaUrlChange = (e) => {
    const url = e.target.value;
    setNewMedia(prev => ({
      ...prev,
      url,
      type: url.match(/\.(mp4|mov|avi|wmv)$/i) ? 'video' : 'image'
    }));
  };

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (10MB max)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        setError(`File size exceeds maximum limit of ${formatFileSize(maxSize)}`);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Validate file type
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      const validVideoTypes = ['video/mp4', 'video/webm', 'video/quicktime'];
      
      if (!validImageTypes.concat(validVideoTypes).includes(file.type)) {
        setError('File type not supported. Please upload images (JPEG, PNG, GIF, WEBP) or videos (MP4, WEBM, MOV)');
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }
      
      // Clear previous error if any
      setError('');

      const fileType = file.type.startsWith('image/') ? 'image' : 'video';

      setNewMedia(prev => ({
        ...prev,
        file,
        type: fileType
      }));
    }
  };

  // Handle media input change
  const handleMediaChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMedia(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  // Upload file to the backend server
  const uploadFileToServer = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create form data for file upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Make the upload request to the backend
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
        setUploadProgress(100);
        setIsUploading(false);
        return response.data.file.url;
      } else {
        throw new Error('Upload failed: Server returned unsuccessful response');
      }
    } catch (error) {
      console.error('Error uploading file to server:', error);
      setIsUploading(false);
      throw error; // Re-throw to handle in the calling function
    } finally {
      setIsUploading(false);
    }
  };

  // Toggle tag selection
  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // Generate a video thumbnail
  const generateVideoThumbnail = async (videoFile) => {
    return new Promise((resolve) => {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      videoElement.playsInline = true;
      videoElement.muted = true;

      // Create a URL for the video file
      const videoURL = URL.createObjectURL(videoFile);
      videoElement.src = videoURL;

      // Once the video metadata is loaded, capture the thumbnail
      videoElement.onloadedmetadata = () => {
        // Set current time to the first frame
        videoElement.currentTime = 1; // 1 second in to avoid black frames
      };

      // When the current time updates (after seeking)
      videoElement.onseeked = () => {
        // Create a canvas and draw the video frame
        const canvas = document.createElement('canvas');
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a data URL (thumbnail)
        const thumbnailUrl = canvas.toDataURL('image/jpeg', 0.7);

        // Clean up
        URL.revokeObjectURL(videoURL);

        // Return the thumbnail
        resolve(thumbnailUrl);
      };

      // Handle errors
      videoElement.onerror = () => {
        URL.revokeObjectURL(videoURL);
        console.error('Error generating video thumbnail');
        resolve(null);
      };
    });
  };

  // Get video duration
  const getVideoDuration = async (videoFile) => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      videoElement.preload = 'metadata';
      
      const videoURL = URL.createObjectURL(videoFile);
      videoElement.src = videoURL;
      
      videoElement.onloadedmetadata = () => {
        URL.revokeObjectURL(videoURL);
        resolve(videoElement.duration);
      };
      
      videoElement.onerror = () => {
        URL.revokeObjectURL(videoURL);
        reject(new Error('Error getting video duration'));
      };
    });
  };

  // Convert data URL to File object
  const dataURLtoFile = async (dataUrl, filename) => {
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    return new File([blob], filename, { type: 'image/jpeg' });
  };

  // Upload a thumbnail image to the server
  const uploadThumbnailToServer = async (dataUrl) => {
    try {
      // Convert data URL to File object
      const file = await dataURLtoFile(dataUrl, `thumbnail-${Date.now()}.jpg`);
      
      // Upload the file to the server
      return await uploadFileToServer(file);
    } catch (error) {
      console.error('Error uploading thumbnail to server:', error);
      return null;
    }
  };

  // Add media to media list
  const addMedia = async () => {
    try {
      setError('');
      
      if (useMediaUrl) {
        // Validate URL exists
        if (!newMedia.url || !newMedia.title) {
          setError('Please provide both URL and title for the media');
          return;
        }

        const mediaToAdd = {
          id: `media-${Date.now()}`,
          type: newMedia.type,
          url: newMedia.url,
          title: newMedia.title,
          cover: newMedia.cover,
          order: formData.media.items.length + 1,
          size: 0 // We don't know the size of URL media
        };

        // If this is a cover image, update all other media to not be cover
        const updatedItems = newMedia.cover
          ? formData.media.items.map(item => ({ ...item, cover: false }))
          : [...formData.media.items];

        setFormData(prev => ({
          ...prev,
          media: {
            items: [...updatedItems, mediaToAdd]
          }
        }));

      } else {
        // Validate file exists
        if (!newMedia.file || !newMedia.title) {
          setError('Please select a file and provide a title');
          return;
        }

        // Upload the file to the server
        let fileUrl;
        try {
          fileUrl = await uploadFileToServer(newMedia.file);
        } catch (error) {
          setError('Failed to upload file. Please try again.');
          return;
        }
        
        const mediaId = `media-${Date.now()}`;

        // For videos, generate and upload a thumbnail
        let thumbnailUrl = null;
        let duration = 0;
        
        if (newMedia.type === 'video') {
          try {
            // Get video duration
            duration = await getVideoDuration(newMedia.file);
            
            // Generate and upload thumbnail
            const thumbnailDataUrl = await generateVideoThumbnail(newMedia.file);
            if (thumbnailDataUrl) {
              thumbnailUrl = await uploadThumbnailToServer(thumbnailDataUrl);
            }
          } catch (error) {
            console.error('Error processing video:', error);
            // Continue without a thumbnail if there's an error
          }
        }

        // If this is a cover image, update all other media to not be cover
        const updatedItems = newMedia.cover
          ? formData.media.items.map(item => ({ ...item, cover: false }))
          : [...formData.media.items];
          
        const mediaToAdd = {
          id: mediaId,
          type: newMedia.type,
          url: fileUrl,
          title: newMedia.title,
          cover: newMedia.cover,
          order: formData.media.items.length + 1,
          size: newMedia.file.size,
          // For videos, add duration and thumbnail
          ...(newMedia.type === 'video' && {
            duration: duration,
            thumbnailUrl: thumbnailUrl
          })
        };

        // Update media items in form data
        setFormData(prev => ({
          ...prev,
          media: {
            items: [...updatedItems, mediaToAdd]
          }
        }));
      }

      // Reset new media form
      setNewMedia({
        file: null,
        type: 'image',
        title: '',
        cover: false,
        url: ''
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      toast.success('Media added successfully');

    } catch (error) {
      console.error('Error adding media:', error);
      setError('Failed to add media. Please try again.');
      toast.error('Failed to add media');
    }
  };

  // Select media for editing
  const selectMedia = (mediaId) => {
    if (selectedMedia && selectedMedia.id === mediaId) {
      setSelectedMedia(null);
    } else {
      const media = formData.media.items.find(item => item.id === mediaId);
      setSelectedMedia(media);
    }
  };

  // Toggle media as cover
  const toggleMediaCover = (mediaId) => {
    setFormData(prev => ({
      ...prev,
      media: {
        items: prev.media.items.map(item =>
            item.id === mediaId
                ? { ...item, cover: true }
                : { ...item, cover: false } // Ensure only one cover image
        )
      }
    }));

    // Update selectedMedia if it's the one being updated
    if (selectedMedia && selectedMedia.id === mediaId) {
      setSelectedMedia(prev => ({ ...prev, cover: true }));
    }
    
    toast.success('Cover image updated');
  };

  // Remove media from list
  const removeMedia = (mediaId) => {
    setFormData(prev => ({
      ...prev,
      media: {
        items: prev.media.items.filter(media => media.id !== mediaId)
      }
    }));

    if (selectedMedia && selectedMedia.id === mediaId) {
      setSelectedMedia(null);
    }
    
    toast.success('Media removed');
  };

  // Remove new media
  const removeNewMedia = () => {
    if (newMedia.file && !useMediaUrl) {
      // Clear URL for file
      setNewMedia({
        file: null,
        type: 'image',
        title: '',
        cover: false,
        url: ''
      });
    } else {
      // Clear URL input
      setNewMedia(prev => ({
        ...prev,
        url: ''
      }));
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle adding a new tag
  const handleAddTag = async () => {
    if (!newTagName.trim()) return;

    try {
      setAddingTag(true);

      const response = await apiClient.post('/news/tags', {
        name: newTagName.trim()
      });

      const newTag = response.data;

      // Add the new tag to the tags list
      setTags(prev => [...prev, newTag]);

      // Select the newly created tag
      setSelectedTags(prev => [...prev, newTag.id]);

      // Reset the new tag name
      setNewTagName('');

      // Close the modal
      setShowTagModal(false);
      
      toast.success('Tag added successfully');
    } catch (error) {
      console.error('Error adding tag:', error);
      setError('Failed to add tag. Please try again.');
      toast.error('Failed to add tag');
    } finally {
      setAddingTag(false);
    }
  };

  // Format date for input field
  const formatDate = (dateString) => {
    if (!dateString) return '';

    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  // Format file size display
  const formatFileSize = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Update publish_date with valid ISO string when date input changes
  const handleDateChange = (e) => {
    const dateValue = e.target.value; // Format: YYYY-MM-DD

    if (dateValue) {
      // Create a date object at noon to avoid timezone issues
      const date = new Date(`${dateValue}T12:00:00Z`);
      setFormData(prev => ({
        ...prev,
        publish_date: date.toISOString() // Convert to ISO string format
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        publish_date: ''
      }));
    }
  };

  // Image error handling function - Using the same approach as partners page
  const handleImageError = (e, fallbackText) => {
    console.error(`Failed to load image: ${e.target.src}`);
    // Create a canvas element for the fallback
    const canvas = document.createElement('canvas');
    canvas.width = 40;
    canvas.height = 40;
    const ctx = canvas.getContext('2d');
    
    // Fill background
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add text
    ctx.fillStyle = '#6b7280';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fallbackText || 'N', canvas.width/2, canvas.height/2);
    
    // Replace image with canvas data
    e.target.onerror = null; // Prevent infinite error loop
    e.target.src = canvas.toDataURL('image/png');
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    // Validate form data
    if (!formData.title || !formData.content) {
      setError('Please fill in all required fields (Title, Content)');
      setLoading(false);
      return;
    }

    try {
      // Prepare data for API
      const newsData = {
        ...formData,
        tags: selectedTags,
      };

      // Ensure we have a valid publish_date if status is published
      if (formData.status === 'published' && !formData.publish_date) {
        newsData.publish_date = new Date().toISOString();
      }

      try {
        const response = await apiClient.put(`/news/${newsId}`, newsData);
        console.log('News updated:', response.data);
        setSuccess(true);
        toast.success('News article updated successfully');

        // Navigate back to news list after a brief delay
        setTimeout(() => {
          router.push('/news');
        }, 2000);
      } catch (error) {
        console.error('Error updating news:', error);
        const errorMessage = error.response?.data?.message ||
            (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) :
                'Failed to update news article. Please try again.');
        setError(errorMessage);
        toast.error('Failed to update news article');
      }
    } catch (error) {
      console.error('Error processing media:', error);
      setError('Failed to process media files. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link href="/news" className="mr-4 p-2 bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit News Article</h1>
            <p className="text-gray-600">Loading article data...</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-700"></div>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center mb-6">
          <Link href="/news" className="mr-4 p-2 bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit News Article</h1>
            <p className="text-gray-600">Error loading article</p>
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-700 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
          <Link 
            href="/news" 
            className="mt-4 inline-flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
          >
            Return to News List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link href="/news" className="mr-4 p-2 bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Edit News Article</h1>
        </div>
        <p className="text-gray-600">News/Edit Article</p>
      </div>
      
      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">News article updated successfully! Redirecting...</span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {/* News article form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
        {/* Basic information */}
        <div className="mb-8 p-6">
          <div className="flex flex-col md:flex-row">
            {/* Left column - section title */}
            <div className="w-full md:w-1/4 pr-0 md:pr-8 mb-4 md:mb-0">
              <h2 className="text-xl font-bold">Article Details</h2>
              <p className="text-gray-600 text-sm">Basic information about the news article</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-full md:w-3/4">
              <div className="mb-6">
                {/* Title */}
                <label className="block text-sm font-medium mb-1">
                  Title<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  placeholder="Enter news title"
                  required
                />
              </div>
              
              <div className="mb-6">
                {/* Summary */}
                <label className="block text-sm font-medium mb-1">
                  Summary
                </label>
                <textarea
                  name="summary"
                  value={formData.summary}
                  onChange={handleTextAreaChange}
                  rows={3}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  placeholder="Enter a brief summary of the article"
                />
              </div>
              
              <div className="mb-6">
                {/* Content */}
                <label className="block text-sm font-medium mb-1">
                  Content<span className="text-red-500">*</span>
                </label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleTextAreaChange}
                  rows={10}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  placeholder="Enter the content of the article"
                  required
                />
              </div>
              
              <div className="mb-6">
                {/* Key Lessons */}
                <label className="block text-sm font-medium mb-1">
                  Key Lessons
                </label>
                <textarea
                  name="key_lessons"
                  value={formData.key_lessons}
                  onChange={handleTextAreaChange}
                  rows={3}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  placeholder="Enter key takeaways or lessons (separate with semicolons for multiple items)"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Status
                  </label>
                  <div className="relative">
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md appearance-none"
                    >
                      {statuses.map(status => (
                        <option key={status} value={status}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Published date - only show if status is published */}
                {formData.status === 'published' && (
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Publication Date<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        name="publish_date"
                        value={formatDate(formData.publish_date || new Date())}
                        onChange={handleDateChange}
                        className="w-full p-2.5 border border-gray-300 rounded-md"
                        required={formData.status === 'published'}
                      />
                    </div>
                  </div>
                )}<label className="block text-sm font-medium mb-1">
                    Category
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md appearance-none"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Status */}
                <div>
                </div>
              
              </div>
            </div>
          </div>
  
          {/* Horizontal line divider */}
          <hr className="border-t border-gray-200" />
  
          {/* Media Section */}
          <div className="mb-8 p-6">
            <div className="flex flex-col md:flex-row">
              {/* Left column - section title */}
              <div className="w-full md:w-1/4 pr-0 md:pr-8 mb-4 md:mb-0">
                <h2 className="text-xl font-bold">Media</h2>
                <p className="text-gray-600 text-sm">Add or edit images and videos for the article</p>
              </div>
              
              {/* Right column - form fields */}
              <div className="w-full md:w-3/4">
                {/* Toggle between URL and file upload */}
                <div className="flex justify-end items-center mb-4">
                  <div className="flex items-center">
                    <button
                      type="button"
                      onClick={toggleMediaUrlMode}
                      className={`text-sm py-1 px-3 rounded-md ${
                        useMediaUrl 
                          ? 'bg-green-700 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Use URL
                    </button>
                    <span className="mx-2 text-gray-400">|</span>
                    <button
                      type="button"
                      onClick={toggleMediaUrlMode}
                      className={`text-sm py-1 px-3 rounded-md ${
                        !useMediaUrl 
                          ? 'bg-green-700 text-white' 
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      Upload File
                    </button>
                  </div>
                </div>
  
                {useMediaUrl ? (
                  // URL input option
                  <div className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center mb-6">
                    <div className="flex flex-col items-center justify-center">
                      <LinkIcon className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-700 font-medium mb-1">Enter media URL</p>
                      <p className="text-gray-500 text-sm mb-3">Add images or videos from the web</p>
                      
                      <div className="w-full max-w-md mt-3">
                        <input
                          type="url"
                          value={newMedia.url}
                          onChange={handleMediaUrlChange}
                          className="w-full p-2.5 border border-gray-300 rounded-md"
                          placeholder="https://example.com/image.jpg"
                        />
                      </div>
                      
                      {newMedia.url && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-md w-full max-w-md">
                          <div className="flex items-center mb-3">
                            {newMedia.type === 'image' ? (
                              <ImageIcon className="w-5 h-5 text-blue-500 mr-2" />
                            ) : (
                              <FileVideo className="w-5 h-5 text-purple-500 mr-2" />
                            )}
                            <span className="text-sm font-medium">Preview</span>
                            <button
                              type="button"
                              onClick={removeNewMedia}
                              className="ml-auto text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          {/* URL preview - only for images */}
                          {newMedia.type === 'image' && (
                            <div className="mb-4 border rounded overflow-hidden">
                              <img 
                                src={newMedia.url} 
                                alt="Preview" 
                                className="w-full h-auto max-h-60 object-contain"
                                onLoad={() => console.log(`Successfully loaded image: ${newMedia.url}`)}
                                onError={(e) => {
                                  console.error(`Failed to load image: ${newMedia.url}`);
                                  e.target.onerror = null; // Prevent infinite error loops
                                  
                                  // Create fallback with initial letter
                                  const fallbackText = newMedia.title?.charAt(0)?.toUpperCase() || 'N';
                                  handleImageError(e, fallbackText);
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Media details form */}
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <label className="block text-sm mb-1 text-left">Title <span className="text-red-500">*</span></label>
                              <input
                                type="text"
                                name="title"
                                value={newMedia.title}
                                onChange={handleMediaChange}
                                placeholder="Media title"
                                className="w-full p-2.5 border border-gray-300 rounded-md"
                              />
                            </div>
                            
                            <div className="flex items-center justify-start">
                              <input
                                type="checkbox"
                                name="cover"
                                id="mediaCoverUrl"
                                checked={newMedia.cover}
                                onChange={handleMediaChange}
                                className="mr-2"
                              />
                              <label htmlFor="mediaCoverUrl" className="text-sm">
                                Use as cover image
                              </label>
                            </div>
                            
                            <div className="flex justify-end">
                              <button
                                type="button"
                                onClick={addMedia}
                                disabled={!newMedia.url || !newMedia.title}
                                className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md text-sm flex items-center"
                              >
                                <Plus className="w-4 h-4 mr-1" /> Add Media
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // File upload option
                  <div 
                    className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center mb-6 cursor-pointer"
                    onClick={!newMedia.file ? triggerFileInput : undefined}
                  >
                    {!newMedia.file ? (
                      <div className="flex flex-col items-center justify-center">
                        <Upload className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-gray-700 font-medium mb-1">Drag and drop a file here</p>
                        <p className="text-gray-500 text-sm mb-3">or click to browse</p>
                        <p className="text-xs text-gray-400">Supports images (JPEG, PNG, GIF, WEBP) and videos (MP4, WEBM, MOV) up to 10MB</p>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-md">
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            {newMedia.type === 'image' ? (
                              <ImageIcon className="w-5 h-5 text-blue-500 mr-2" />
                            ) : (
                              <FileVideo className="w-5 h-5 text-purple-500 mr-2" />
                            )}
                            <span className="text-sm font-medium">{newMedia.file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeNewMedia();
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                        
                        <div className="text-xs text-gray-500 mb-3">
                          Type: {newMedia.type.charAt(0).toUpperCase() + newMedia.type.slice(1)} | 
                          Size: {formatFileSize(newMedia.file.size)}
                        </div>
                        
                        {isUploading && (
                          <div className="mb-3">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-center">
                              Uploading: {uploadProgress}%
                            </div>
                          </div>
                        )}
                        
                        {/* Media details form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm mb-1">Title <span className="text-red-500">*</span></label>
                            <input
                              type="text"
                              name="title"
                              value={newMedia.title}
                              onChange={handleMediaChange}
                              placeholder="Media title"
                              className="w-full p-2.5 border border-gray-300 rounded-md"
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              name="cover"
                              id="mediaCover"
                              checked={newMedia.cover}
                              onChange={handleMediaChange}
                              className="mr-2"
                              onClick={(e) => e.stopPropagation()}
                            />
                            <label htmlFor="mediaCover" className="text-sm">
                              Use as cover image
                            </label>
                          </div>
                          
                          <div className="md:col-span-2 flex justify-end">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                addMedia();
                              }}
                              disabled={isUploading || !newMedia.title}
                              className="bg-green-700 hover:bg-green-800 text-white py-2 px-4 rounded-md text-sm flex items-center"
                            >
                              {isUploading ? (
                                <>
                                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <Plus className="w-4 h-4 mr-1" /> Add Media
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    <input
                      type="file"
                      id="fileUpload"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      className="hidden"
                      accept="image/*,video/*"
                    />
                  </div>
                )}
                
                {/* Display media list */}
                <h3 className="text-lg font-semibold mb-4">Media Gallery</h3>
                
                {formData.media.items.length === 0 ? (
                  <p className="text-gray-500 text-sm italic mb-4">No media added yet. Upload images or videos to enhance your article.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                    {formData.media.items.map(media => (
                      <div 
                        key={media.id} 
                        className={`border rounded-md overflow-hidden ${selectedMedia && selectedMedia.id === media.id ? 'ring-2 ring-green-500' : ''}`}
                      >
                        {/* Media preview */}
                        <div 
                          className="h-32 bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer relative"
                          onClick={() => selectMedia(media.id)}
                        >
                          {media.type === 'image' ? (
                            <img 
                              src={media.url} 
                              alt={media.title}
                              className="object-cover w-full h-full" 
                              onLoad={() => console.log(`Successfully loaded image: ${media.url}`)}
                              onError={(e) => {
                                console.error(`Failed to load image: ${media.url}`);
                                e.target.onerror = null; // Prevent infinite error loops
                                
                                // Create fallback with initial letter
                                const fallbackText = media.title?.charAt(0)?.toUpperCase() || 'I';
                                handleImageError(e, fallbackText);
                              }}
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              {media.thumbnailUrl ? (
                                <img 
                                  src={media.thumbnailUrl} 
                                  alt={media.title}
                                  className="object-cover w-full h-full"
                                  onLoad={() => console.log(`Successfully loaded video thumbnail: ${media.thumbnailUrl}`)}
                                  onError={(e) => {
                                    console.error(`Failed to load video thumbnail: ${media.thumbnailUrl}`);
                                    e.target.onerror = null; // Prevent infinite error loops
                                    
                                    // Create fallback with initial letter
                                    const fallbackText = media.title?.charAt(0)?.toUpperCase() || 'V';
                                    handleImageError(e, fallbackText);
                                  }}
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <FileVideo className="w-10 h-10 text-purple-500" />
                                </div>
                              )}
                            </div>
                          )}
                          {media.cover && (
                            <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-md">
                              Cover
                            </div>
                          )}
                        </div>
                        
                        {/* Media info */}
                        <div className="p-3">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-medium text-sm truncate">{media.title}</h4>
                            <button
                              type="button"
                              onClick={() => removeMedia(media.id)}
                              className="text-red-500 hover:text-red-700 ml-2 flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 text-xs">
                            <span className="px-2 py-1 bg-gray-100 rounded-full">
                              {media.type}
                            </span>
                            {media.size > 0 && (
                              <span className="px-2 py-1 bg-gray-100 rounded-full">
                                {formatFileSize(media.size)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Actions - show when media is selected */}
                        {selectedMedia && selectedMedia.id === media.id && (
                          <div className="p-3 border-t">
                            {!media.cover && media.type === 'image' && (
                              <button
                                type="button"
                                onClick={() => toggleMediaCover(media.id)}
                                className="text-xs bg-green-700 hover:bg-green-800 text-white px-2 py-1 rounded-md flex items-center"
                              >
                                <Check className="w-3 h-3 mr-1" /> Set as Cover Image
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
  
          {/* Horizontal line divider */}
          <hr className="border-t border-gray-200" />
  
          {/* Tags Section */}
          <div className="mb-8 p-6">
            <div className="flex flex-col md:flex-row">
              {/* Left column - section title */}
              <div className="w-full md:w-1/4 pr-0 md:pr-8 mb-4 md:mb-0">
                <h2 className="text-xl font-bold">Tags</h2>
                <p className="text-gray-600 text-sm">Categorize the news article</p>
              </div>
              
              {/* Right column - form fields */}
              <div className="w-full md:w-3/4">
                <div className="mb-4 flex justify-between items-center">
                  <label className="block text-sm font-medium">
                    Select tags for this article
                  </label>
                  <button 
                    type="button"
                    onClick={() => setShowTagModal(true)}
                    className="text-sm flex items-center text-green-700 hover:text-green-800"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add New Tag
                  </button>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="flex flex-wrap gap-2">
                    {tags.length === 0 ? (
                      <p className="text-gray-500 text-sm">No tags available. Create your first tag with the button above.</p>
                    ) : (
                      tags.map(tag => (
                        <div 
                          key={tag.id}
                          onClick={() => toggleTag(tag.id)}
                          className={`px-3 py-2 rounded-full cursor-pointer flex items-center ${
                            selectedTags.includes(tag.id)
                              ? 'bg-green-100 text-green-800 border border-green-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                          }`}
                        >
                          <TagIcon className="w-3 h-3 mr-1" />
                          <span className="text-sm">{tag.name}</span>
                          {selectedTags.includes(tag.id) && (
                            <Check className="w-3 h-3 ml-1 text-green-600" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          {/* Form buttons */}
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            <Link
              href="/news"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2 bg-green-700 rounded-md text-white hover:bg-green-800 flex items-center"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : 'Update Article'}
            </button>
          </div>
        </form>
  
        {/* Add Tag Modal */}
        {showTagModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 max-w-full">
              <h3 className="text-lg font-bold mb-4">Add New Tag</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Tag Name<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  placeholder="Enter tag name"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowTagModal(false);
                    setNewTagName('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={addingTag}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-green-700 rounded-md text-white hover:bg-green-800 flex items-center"
                  disabled={addingTag || !newTagName.trim()}
                >
                  {addingTag ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Tag
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
  
  export default EditNewsPage;