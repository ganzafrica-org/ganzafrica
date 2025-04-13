"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
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
  Tag as TagIcon
} from 'lucide-react';
import Link from 'next/link';

const AddNewsPage = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [tags, setTags] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [addingTag, setAddingTag] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  
  // Valid enum values based on the validation error
  const categories = ['all', 'news', 'blogs', 'reports', 'publications'];
  const statuses = ['published', 'not_published'];

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    status: 'published', // Using valid enum value
    publish_date: new Date().toISOString(), // Setting a valid ISO date
    category: 'news', // Using valid enum value
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
    cover: false
  });

  // Selected tags for the news article
  const [selectedTags, setSelectedTags] = useState([]);

  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await axios.get('http://localhost:3002/api/news/tags');
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

  // Handle file selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
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

  // Upload file to server
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      setIsUploading(true);
      setUploadProgress(0);
      
      // Upload to your media endpoint
      const response = await axios.post('http://localhost:3002/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setIsUploading(false);
      // Return the URL from the response
      return response.data.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      setIsUploading(false);
      
      // For demo purposes, return a mock URL if the upload endpoint is not available
      if (file.type.startsWith('image/')) {
        return `https://example.com/images/${file.name}`;
      } else {
        return `https://example.com/videos/${file.name}`;
      }
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

  // Add media to media list
  const addMedia = async () => {
    if (!newMedia.file || !newMedia.title) return;
    
    try {
      // First upload the file
      const fileUrl = await uploadFile(newMedia.file);
      
      const mediaId = `media-${Date.now()}`;
      const mediaToAdd = {
        id: mediaId,
        type: newMedia.type,
        url: fileUrl,
        title: newMedia.title,
        cover: newMedia.cover,
        order: formData.media.items.length + 1,
        size: newMedia.file.size
      };
      
      // Add thumbnail URL for videos
      if (newMedia.type === 'video') {
        mediaToAdd.duration = 0; // You would calculate actual duration if possible
        mediaToAdd.thumbnailUrl = `https://example.com/thumbnails/${mediaId}.jpg`;
      }
      
      setFormData(prev => ({
        ...prev,
        media: {
          items: [...prev.media.items, mediaToAdd]
        }
      }));
      
      // Reset new media form
      setNewMedia({ 
        file: null,
        type: 'image',
        title: '',
        cover: false
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Error adding media:', error);
      setError('Failed to upload media. Please try again.');
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
  };

  // Remove featured image
  const removeNewMedia = () => {
    setNewMedia({
      file: null,
      type: 'image',
      title: '',
      cover: false
    });
    
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
      
      const response = await axios.post('http://localhost:3002/api/news/tags', {
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
    } catch (error) {
      console.error('Error adding tag:', error);
      setError('Failed to add tag. Please try again.');
    } finally {
      setAddingTag(false);
    }
  };

  // Format date for input field
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
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
    
    // Prepare data for API
    const newsData = {
      ...formData,
      tags: selectedTags
    };
    
    // Ensure we have a valid publish_date if status is published
    if (formData.status === 'published' && !formData.publish_date) {
      newsData.publish_date = new Date().toISOString();
    }
    
    try {
      const response = await axios.post('http://localhost:3002/api/news', newsData);
      console.log('News created:', response.data);
      setSuccess(true);
      
      // Navigate back to news list after a brief delay
      setTimeout(() => {
        router.push('/news');
      }, 2000);
    } catch (error) {
      console.error('Error creating news:', error);
      const errorMessage = error.response?.data?.message || 
                          (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : 
                          'Failed to create news article. Please try again.');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link href="/news" className="mr-4 p-2 bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Add News Article</h1>
        </div>
        <p className="text-gray-600">News/Create Article</p>
      </div>
      
      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">News article created successfully! Redirecting...</span>
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
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Article Details</h2>
              <p className="text-gray-600 text-sm">Basic information about the news article</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
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
                          {status === 'published' ? 'Published' : 'Not Published'}
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
                      <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line divider */}
        <hr className="border-t border-gray-200" />

        {/* Media Section */}
        <div className="mb-8 p-6">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Media</h2>
              <p className="text-gray-600 text-sm">Add images and videos to the article</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
              {/* Upload area */}
              <div 
                className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center mb-6 cursor-pointer"
                onClick={!newMedia.file ? triggerFileInput : undefined}
              >
                {!newMedia.file ? (
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-700 font-medium mb-1">Drag and drop a file here</p>
                    <p className="text-gray-500 text-sm mb-3">or click to browse</p>
                    <p className="text-xs text-gray-400">Supports images and videos (Max 10MB)</p>
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
              
              {/* Display media list */}
              <h3 className="text-lg font-semibold mb-4">Article Media</h3>
              
              {formData.media.items.length === 0 ? (
                <p className="text-gray-500 text-sm italic mb-4">No media added yet.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {formData.media.items.map(media => (
                    <div 
                      key={media.id} 
                      className={`border rounded-md overflow-hidden ${selectedMedia && selectedMedia.id === media.id ? 'ring-2 ring-green-500' : ''}`}
                    >
                      {/* Media preview */}
                      <div 
                        className="bg-gray-100 h-20 flex items-center justify-center cursor-pointer"
                        onClick={() => selectMedia(media.id)}
                      >
                        {media.type === 'image' ? (
                          <ImageIcon className="w-10 h-10 text-blue-500" />
                        ) : (
                          <FileVideo className="w-10 h-10 text-purple-500" />
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
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {formatFileSize(media.size)}
                          </span>
                          {media.cover && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              Cover
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
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Tags</h2>
              <p className="text-gray-600 text-sm">Categorize the news article</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
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
                Submitting...
              </>
            ) : 'Publish'}
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

export default AddNewsPage;