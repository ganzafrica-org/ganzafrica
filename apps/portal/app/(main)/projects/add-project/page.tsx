"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, X, Upload, Image, FileVideo, Check, AlertCircle, Loader, UserPlus, Calendar, ChevronDown } from 'lucide-react';
import Link from 'next/link';

const AddProjectPage = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);


  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'planned',
    start_date: '',
    end_date: '',
    category_id: '',
    location: '',
    goals: {
      items: []
    },
    outcomes: {
      items: []
    },
    media: {
      items: []
    },
    members: []
  });

  // Temporary state
  const [newGoal, setNewGoal] = useState({ title: '', description: '', completed: false });
  const [newOutcome, setNewOutcome] = useState({ title: '', description: '', status: 'pending' });
  const [newMember, setNewMember] = useState({ user_id: '', role: '' });
  const [newMedia, setNewMedia] = useState({ 
    file: null,
    type: 'image',
    title: '',
    tag: 'feature',
    cover: false
  });

  // Fetch categories and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await axios.get('http://localhost:3002/api/categories');
        // Check the structure of the response and extract categories array
        if (categoriesResponse.data && Array.isArray(categoriesResponse.data.categories)) {
          setCategories(categoriesResponse.data.categories);
        } else if (Array.isArray(categoriesResponse.data)) {
          setCategories(categoriesResponse.data);
        } else {
          console.error('Unexpected categories response format:', categoriesResponse.data);
          setCategories([]);
        }
        
 // Fetch roles
try {
  const rolesResponse = await axios.get('http://localhost:3002/api/roles');
  // Extract roles data based on response structure
  if (rolesResponse.data && Array.isArray(rolesResponse.data.roles)) {
    setRoles(rolesResponse.data.roles);
  } else if (Array.isArray(rolesResponse.data)) {
    setRoles(rolesResponse.data);
  }
} catch (error) {
  console.error('Error fetching roles:', error);
  setRoles([]);
}
        
        // Fetch users
        try {
          const usersResponse = await axios.get('http://localhost:3002/api/users');
          // Check the structure of the response and extract users array
          if (usersResponse.data && Array.isArray(usersResponse.data.users)) {
            setUsers(usersResponse.data.users);
          } else if (Array.isArray(usersResponse.data)) {
            setUsers(usersResponse.data);
          } else {
            console.error('Unexpected users response format:', usersResponse.data);
            // Set some mock users if response format is not as expected
            setUsers([
              { id: 1, first_name: 'Mukamana', last_name: 'Fransine' },
              { id: 2, first_name: 'John', last_name: 'Doe' },
              { id: 3, first_name: 'Jane', last_name: 'Smith' }
            ]);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
          // Set some mock users if API doesn't have users endpoint
          setUsers([
            { id: 1, first_name: 'Mukamana', last_name: 'Fransine' },
            { id: 2, first_name: 'John', last_name: 'Doe' },
            { id: 3, first_name: 'Jane', last_name: 'Smith' }
          ]);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        setError('Failed to load categories. Please try again.');
        setCategories([]);
      }
    };
    
    fetchData();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle goal input
  const handleGoalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewGoal(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Handle outcome input
  const handleOutcomeChange = (e) => {
    const { name, value } = e.target;
    setNewOutcome(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle member input
  const handleMemberChange = (e) => {
    const { name, value } = e.target;
    setNewMember(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle media input
  const handleMediaChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewMedia(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
      if (newMedia.type === 'image') {
        return `https://example.com/images/${file.name}`;
      } else {
        return `https://example.com/videos/${file.name}`;
      }
    }
  };

  // Add goal to goals list
  const addGoal = () => {
    if (!newGoal.title || !newGoal.description) return;
    
    const goalId = `goal-${Date.now()}`;
    const goalToAdd = {
      id: goalId,
      title: newGoal.title,
      description: newGoal.description,
      completed: newGoal.completed,
      order: formData.goals.items.length + 1
    };
    
    setFormData(prev => ({
      ...prev,
      goals: {
        items: [...prev.goals.items, goalToAdd]
      }
    }));
    
    // Reset new goal form
    setNewGoal({ title: '', description: '', completed: false });
  };

  // Add outcome to outcomes list
  const addOutcome = () => {
    if (!newOutcome.title || !newOutcome.description) return;
    
    const outcomeId = `outcome-${Date.now()}`;
    const outcomeToAdd = {
      id: outcomeId,
      title: newOutcome.title,
      description: newOutcome.description,
      status: newOutcome.status,
      order: formData.outcomes.items.length + 1
    };
    
    setFormData(prev => ({
      ...prev,
      outcomes: {
        items: [...prev.outcomes.items, outcomeToAdd]
      }
    }));
    
    // Reset new outcome form
    setNewOutcome({ title: '', description: '', status: 'pending' });
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
        description: '',
        tag: newMedia.tag,
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
        tag: 'feature',
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

  // Update media tag
  const updateMediaTag = (mediaId, tag) => {
    setFormData(prev => ({
      ...prev,
      media: {
        items: prev.media.items.map(item => 
          item.id === mediaId ? { ...item, tag } : item
        )
      }
    }));
    
    // Update selectedMedia if it's the one being updated
    if (selectedMedia && selectedMedia.id === mediaId) {
      setSelectedMedia(prev => ({ ...prev, tag }));
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

  // Add member to members list
  const addMember = () => {
    if (!newMember.user_id || !newMember.role) return;
    
    const memberToAdd = {
      user_id: parseInt(newMember.user_id),
      role: newMember.role
    };
    
    // Check if user is already a member
    const alreadyMember = formData.members.some(
      member => member.user_id === memberToAdd.user_id
    );
    
    if (alreadyMember) {
      alert('This user is already a project member');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      members: [...prev.members, memberToAdd]
    }));
    
    // Reset new member form
    setNewMember({ user_id: '', role: 'member' });
  };

  // Remove goal from list
  const removeGoal = (goalId) => {
    setFormData(prev => ({
      ...prev,
      goals: {
        items: prev.goals.items.filter(goal => goal.id !== goalId)
      }
    }));
  };

  // Remove outcome from list
  const removeOutcome = (outcomeId) => {
    setFormData(prev => ({
      ...prev,
      outcomes: {
        items: prev.outcomes.items.filter(outcome => outcome.id !== outcomeId)
      }
    }));
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

  // Remove member from list
  const removeMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.filter(member => member.user_id !== userId)
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    
    // Validate form data
    if (!formData.name || !formData.category_id || !formData.start_date) {
      setError('Please fill in all required fields (Project Name, Category, Start Date)');
      setLoading(false);
      return;
    }
    
    // Prepare data for API
    const projectData = {
      ...formData,
      category_id: parseInt(formData.category_id)
    };
    
    try {
      const response = await axios.post('http://localhost:3002/api/projects', projectData);
      console.log('Project created:', response.data);
      setSuccess(true);
      
      // Navigate back to projects list after a brief delay
      setTimeout(() => {
        router.push('/projects');
      }, 2000);
    } catch (error) {
      console.error('Error creating project:', error);
      setError(error.response?.data?.message || 'Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format file size display
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  // Get role name by ID
const getRoleNameById = (roleId: string | number): string => {
  const role = roles.find((r: { id: number; name: string }) => r.id.toString() === roleId.toString());
  return role ? role.name : roleId.toString();
};

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header with back button */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <Link href="/projects" className="mr-4 p-2 bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold">Add New Project</h1>
        </div>
        <p className="text-gray-600">Projects/Create Project</p>
      </div>
      
      {/* Success message */}
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">Project created successfully! Redirecting...</span>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}
      
      {/* Project form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md">
        {/* Basic project information */}
        <div className="mb-8 p-6">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Project Details</h2>
              <p className="text-gray-600 text-sm">What is the project all about?</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Project name */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Project Name<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md"
                    placeholder="Enter the project name"
                    required
                  />
                </div>
                
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Category<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md appearance-none"
                      required
                    >
                      <option value="">Select a category</option>
                      {Array.isArray(categories) && categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Start date */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Start Date<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md"
                      required
                    />
                    <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* End date */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md"
                    />
                    <Calendar className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
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
                      <option value="planned">Planned</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                
                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-md"
                    placeholder="Enter project location"
                  />
                </div>
              </div>
              
              {/* Description */}
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Overview<span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className="w-full p-2.5 border border-gray-300 rounded-md"
                  placeholder="Details go here..."
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line divider */}
        <hr className="border-t border-gray-200" />

        {/* Project goals & outcomes */}
        <div className="mb-8 p-6">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Goals & Outcomes</h2>
              <p className="text-gray-600 text-sm">What are you trying to achieve?</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Project goals */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Project goals/objective<span className="text-red-500">*</span>
                  </label>
                  
                  {/* Goals list */}
                  <div className="space-y-3 mb-4">
                    {formData.goals.items.map(goal => (
                      <div key={goal.id} className="p-3 bg-gray-50 rounded-md relative">
                        <button
                          type="button"
                          onClick={() => removeGoal(goal.id)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <h4 className="font-medium">{goal.title}</h4>
                        <p className="text-sm text-gray-600">{goal.description}</p>
                        <div className="mt-1 text-xs">
                          <span className={`px-2 py-1 rounded-full ${goal.completed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {goal.completed ? 'Completed' : 'Not completed'}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {formData.goals.items.length === 0 && (
                      <p className="text-gray-500 text-sm italic">No goals added yet.</p>
                    )}
                  </div>
                  
                  {/* Add goal form */}
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-sm mb-2">Add New Goal</h4>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          name="title"
                          value={newGoal.title}
                          onChange={handleGoalChange}
                          placeholder="Goal title"
                          className="w-full p-2.5 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <textarea
                          name="description"
                          value={newGoal.description}
                          onChange={handleGoalChange}
                          placeholder="Goal description"
                          rows={2}
                          className="w-full p-2.5 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="completed"
                          id="goalCompleted"
                          checked={newGoal.completed}
                          onChange={handleGoalChange}
                          className="mr-2"
                        />
                        <label htmlFor="goalCompleted" className="text-sm">
                          Completed
                        </label>
                      </div>
                      <button
                        type="button"
                        onClick={addGoal}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-md text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Goal
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Project outcomes */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Expected outcomes<span className="text-red-500">*</span>
                  </label>
                  
                  {/* Outcomes list */}
                  <div className="space-y-3 mb-4">
                    {formData.outcomes.items.map(outcome => (
                      <div key={outcome.id} className="p-3 bg-gray-50 rounded-md relative">
                        <button
                          type="button"
                          onClick={() => removeOutcome(outcome.id)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <h4 className="font-medium">{outcome.title}</h4>
                        <p className="text-sm text-gray-600">{outcome.description}</p>
                        <div className="mt-1 text-xs">
                          <span className={`px-2 py-1 rounded-full ${
                            outcome.status === 'achieved' ? 'bg-green-100 text-green-800' :
                            outcome.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {outcome.status.charAt(0).toUpperCase() + outcome.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                    
                    {formData.outcomes.items.length === 0 && (
                      <p className="text-gray-500 text-sm italic">No outcomes added yet.</p>
                    )}
                  </div>
                  
                  {/* Add outcome form */}
                  <div className="border-t pt-3">
                    <h4 className="font-medium text-sm mb-2">Add New Outcome</h4>
                    <div className="space-y-3">
                      <div>
                        <input
                          type="text"
                          name="title"
                          value={newOutcome.title}
                          onChange={handleOutcomeChange}
                          placeholder="Outcome title"
                          className="w-full p-2.5 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <textarea
                          name="description"
                          value={newOutcome.description}
                          onChange={handleOutcomeChange}
                          placeholder="Outcome description"
                          rows={2}
                          className="w-full p-2.5 border border-gray-300 rounded-md"
                        />
                      </div>
                      <div>
                        <label className="block text-sm mb-1">Status</label>
                        <div className="relative">
                          <select
                            name="status"
                            value={newOutcome.status}
                            onChange={handleOutcomeChange}
                            className="w-full p-2.5 border border-gray-300 rounded-md appearance-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="achieved">Achieved</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={addOutcome}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-md text-sm flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Outcome
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal line divider */}
        <hr className="border-t border-gray-200" />

        {/* Team members */}
        <div className="mb-8 p-6">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Team</h2>
              <p className="text-gray-600 text-sm">Who will be working on this project?</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
              <div className="mb-4 flex justify-between items-center">
                <label className="block text-sm font-medium">
                  Team Members<span className="text-red-500">*</span>
                </label>
                <a 
                  href="/users/add"
                  className="text-sm flex items-center text-green-700 hover:text-green-800"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Add New User
                </a>
              </div>
              
              {/* Members list */}
              {formData.members.length === 0 ? (
                <p className="text-gray-500 text-sm italic mb-4">No team members added yet.</p>
              ) : (
                <div className="bg-gray-50 rounded-md mb-4">
                  <div className="divide-y divide-gray-200">
                    {formData.members.map(member => {
                      const user = Array.isArray(users) ? users.find(u => u.id === member.user_id) : null;
                      const fullName = user ? `${user.first_name} ${user.last_name}` : `User ID: ${member.user_id}`;
                      
                      return (
                        <div key={member.user_id} className="grid grid-cols-12 p-3 items-center text-sm hover:bg-green-50">
                          <div className="col-span-6">{fullName}</div>
                          <div className="col-span-5 text-gray-600">{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</div>
                          <div className="col-span-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => removeMember(member.user_id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Add member form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-sm mb-1">Team Member</label>
                  <div className="relative">
                    <select
                      name="user_id"
                      value={newMember.user_id}
                      onChange={handleMemberChange}
                      className="w-full p-2.5 border border-gray-300 rounded-md appearance-none"
                    >
                      <option value="">Select a team member</option>
                      {Array.isArray(users) && users.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.first_name} {user.last_name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Role<span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                  <select
  name="role"
  value={newMember.role}
  onChange={handleMemberChange}
  className="w-full p-2.5 border border-gray-300 rounded-md appearance-none"
>
  <option value="">Select a role</option>
  {Array.isArray(roles) && roles.map(role => (
    <option key={role.id} value={role.id}>
      {role.name}
    </option>
  ))}
</select>
                    <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

              </div>
              
              <button
                type="button"
                onClick={addMember}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-1 px-3 rounded-md text-sm flex items-center"
              >
                <Plus className="w-4 h-4 mr-1" /> Add Team Member
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal line divider */}
        <hr className="border-t border-gray-200" />

        {/* Files & Media Section */}
        <div className="mb-8 p-6">
          <div className="flex">
            {/* Left column - section title */}
            <div className="w-1/4 pr-8">
              <h2 className="text-xl font-bold">Files & Media</h2>
              <p className="text-gray-600 text-sm">Please attach any relevant files</p>
            </div>
            
            {/* Right column - form fields */}
            <div className="w-3/4">
              {/* Upload area */}
              <div className="border-2 border-dashed border-gray-300 p-6 rounded-md text-center mb-6">
                <label htmlFor="fileUpload" className="cursor-pointer">
                  <div className="flex flex-col items-center justify-center">
                    <Upload className="h-12 w-12 text-gray-400 mb-3" />
                    <p className="text-gray-700 font-medium mb-1">Drag and drop files here</p>
                    <p className="text-gray-500 text-sm mb-3">or click to browse</p>
                    <p className="text-xs text-gray-400">Supports images (JPG, PNG, GIF) and videos (MP4, WebM)</p>
                  </div>
                </label>
                <input
                  type="file"
                  id="fileUpload"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*,video/*"
                />
              </div>
              
              {/* File preview */}
              {newMedia.file && (
                <div className="p-4 bg-gray-50 rounded-md mb-6">
                  <div className="flex items-center mb-3">
                    {newMedia.type === 'image' ? (
                      <Image className="w-6 h-6 mr-2 text-blue-500" />
                    ) : (
                      <FileVideo className="w-6 h-6 mr-2 text-purple-500" />
                    )}
                    <span className="text-sm font-medium">{newMedia.file.name}</span>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-4">
                    Type: {newMedia.type.charAt(0).toUpperCase() + newMedia.type.slice(1)} | 
                    Size: {formatFileSize(newMedia.file.size)}
                  </div>
                  
                  {isUploading && (
                    <div className="mb-4">
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
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm mb-1">Tag</label>
                      <div className="relative">
                        <select
                          name="tag"
                          value={newMedia.tag}
                          onChange={handleMediaChange}
                          className="w-full p-2.5 border border-gray-300 rounded-md appearance-none"
                        >
                          <option value="feature">Feature</option>
                          <option value="description">Description</option>
                          <option value="others">Others</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3 w-5 h-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        name="cover"
                        id="mediaCover"
                        checked={newMedia.cover}
                        onChange={handleMediaChange}
                        className="mr-2"
                      />
                      <label htmlFor="mediaCover" className="text-sm">
                        Use as cover image
                      </label>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={addMedia}
                        disabled={isUploading}
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
              
              {/* Display media list */}
              <h3 className="text-lg font-semibold mb-4">Project Media</h3>
              
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
                          <Image className="w-10 h-10 text-blue-500" />
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
                        
                        {media.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">{media.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-1 text-xs">
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {media.type}
                          </span>
                          <span className="px-2 py-1 bg-gray-100 rounded-full">
                            {formatFileSize(media.size)}
                          </span>
                          <span className={`px-2 py-1 rounded-full ${
                            media.tag === 'feature' ? 'bg-blue-100 text-blue-800' :
                            media.tag === 'description' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {media.tag}
                          </span>
                          {media.cover && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">
                              Cover
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Tag selection - show when media is selected */}
                      {selectedMedia && selectedMedia.id === media.id && (
                        <div className="p-3 border-t">
                          <div className="mb-2">
                            <label className="text-xs font-semibold mb-1 block">Change Display Tag:</label>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() => updateMediaTag(media.id, 'feature')}
                                className={`px-2 py-1 text-xs rounded-full ${media.tag === 'feature' ? 'bg-blue-600 text-white' : 'bg-blue-100 text-blue-800'}`}
                              >
                                Feature
                              </button>
                              <button
                                type="button"
                                onClick={() => updateMediaTag(media.id, 'description')}
                                className={`px-2 py-1 text-xs rounded-full ${media.tag === 'description' ? 'bg-purple-600 text-white' : 'bg-purple-100 text-purple-800'}`}
                              >
                                Description
                              </button>
                              <button
                                type="button"
                                onClick={() => updateMediaTag(media.id, 'others')}
                                className={`px-2 py-1 text-xs rounded-full ${media.tag === 'others' ? 'bg-green-600 text-white' : 'bg-green-100 text-green-800'}`}
                              >
                                Others
                              </button>
                            </div>
                          </div>
                          
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

        {/* Form buttons */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
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
            ) : 'Submit'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProjectPage;