"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  Upload,
  X,
  Check,
  Plus
} from 'lucide-react';
import Link from 'next/link';

const AddProjectPage = () => {
  const router = useRouter();
  
  // States for form data
  const [formData, setFormData] = useState({
    projectName: '',
    category: '',
    description: '',
    teamLead: '',
    startDate: '',
    endDate: '',
    location: '',
    status: 'pending',
    budget: '',
  });

  // States for dynamic data
  const [categories, setCategories] = useState([
    { id: '1', name: 'Food System' },
    { id: '2', name: 'Climate Adaptation' }, 
    { id: '3', name: 'Data & Evidence' },
    { id: '4', name: 'Water Conservation' },
    { id: '5', name: 'Renewable Energy' }
  ]);
  const [locations, setLocations] = useState([
    { id: '1', name: 'Kigali' },
    { id: '2', name: 'Musanze' },
    { id: '3', name: 'Rubavu' },
    { id: '4', name: 'Nyagatare' },
    { id: '5', name: 'Huye' }
  ]);
  const [teamMembers, setTeamMembers] = useState([
    { id: '1', name: 'Mukamana Fransine', role: 'Project Manager' },
    { id: '2', name: 'John Doe', role: 'Data Analyst' },
    { id: '3', name: 'Jane Smith', role: 'Climate Researcher' },
    { id: '4', name: 'Robert Johnson', role: 'Field Coordinator' },
    { id: '5', name: 'Emily Williams', role: 'Research Assistant' }
  ]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State for adding new category
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  // Attempt to fetch data from backend if available
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Try to fetch from backend API if it exists
        // Replace these with your actual API endpoints when ready
        /*
        const [categoriesResponse, locationsResponse, teamResponse] = await Promise.all([
          fetch('/api/categories').then(res => res.json()),
          fetch('/api/locations').then(res => res.json()),
          fetch('/api/team-members').then(res => res.json())
        ]);
        
        if (categoriesResponse?.data) setCategories(categoriesResponse.data);
        if (locationsResponse?.data) setLocations(locationsResponse.data);
        if (teamResponse?.data) setTeamMembers(teamResponse.data);
        */
      } catch (err) {
        console.log('Using local data instead of API');
        // Keep using the initial state values as fallback
      }
    };

    fetchData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTeamMemberSelect = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member && !selectedTeamMembers.some(m => m.id === memberId)) {
      setSelectedTeamMembers([...selectedTeamMembers, member]);
    }
  };

  const handleRemoveTeamMember = (memberId) => {
    setSelectedTeamMembers(selectedTeamMembers.filter(m => m.id !== memberId));
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    
    try {
      // Create a new category locally
      const newId = (Math.max(...categories.map(c => parseInt(c.id, 10))) + 1).toString();
      const newCategoryObj = { id: newId, name: newCategory.trim() };
      
      // Add the new category to the list
      setCategories([...categories, newCategoryObj]);
      
      // Set the form value to the new category
      setFormData({
        ...formData,
        category: newCategoryObj.id
      });
      
      // Reset states
      setNewCategory('');
      setShowCategoryModal(false);
      
      // When backend is available, add API call here:
      // await fetch('/api/categories', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ name: newCategory.trim() })
      // });
    } catch (err) {
      console.error('Error adding category:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setIsLoading(true);
    try {
      // Create project payload
      const projectData = {
        ...formData,
        teamMembers: selectedTeamMembers.map(member => member.id)
      };
      
      // Log the data that would be sent to the API
      console.log('Project data to submit:', projectData);
      
      // When backend is ready, add API call:
      // await fetch('/api/projects', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(projectData)
      // });
      
      // For now, simulate success and redirect
      setTimeout(() => {
        router.push('../');
      }, 1000);
    } catch (err) {
      console.error('Error creating project:', err);
      alert('Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with back button */}
      <div className="mb-6">
        <Link href="../" className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Projects
        </Link>
      </div>

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add New Project</h1>
        <p className="text-gray-500">Fill in the details to create a new project</p>
      </div>

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="col-span-2">
              <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="projectName"
                name="projectName"
                required
                value={formData.projectName}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter project name"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              
              <div className="flex">
                <select
                  id="category"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-l-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(true)}
                  className="px-4 bg-gray-200 rounded-r-md hover:bg-gray-300"
                  title="Add new category"
                >
                  <Plus className="w-5 h-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="pending">Pending</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                required
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter project description"
              ></textarea>
            </div>

            {/* Team Lead */}
            <div>
              <label htmlFor="teamLead" className="block text-sm font-medium text-gray-700 mb-1">
                Team Lead <span className="text-red-500">*</span>
              </label>
              <select
                id="teamLead"
                name="teamLead"
                required
                value={formData.teamLead}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select team lead</option>
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} ({member.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location <span className="text-red-500">*</span>
              </label>
              <select
                id="location"
                name="location"
                required
                value={formData.location}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                required
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                required
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                Budget (USD) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="budget"
                name="budget"
                required
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter project budget"
              />
            </div>

            {/* Project Document Upload */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Documents
              </label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="dropzone-file"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-8 h-8 mb-2 text-gray-500" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOCX, XLSX (MAX. 10MB)
                    </p>
                  </div>
                  <input id="dropzone-file" type="file" className="hidden" />
                </label>
              </div>
            </div>

            {/* Team Members */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Members
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Selected Team Members */}
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Selected Team Members</h3>
                  <div className="border border-gray-300 rounded-md p-3 min-h-32">
                    {selectedTeamMembers.length === 0 ? (
                      <p className="text-gray-500 text-sm">No team members selected</p>
                    ) : (
                      <ul className="space-y-2">
                        {selectedTeamMembers.map((member) => (
                          <li key={member.id} className="flex justify-between items-center text-sm">
                            <span>
                              <span className="font-medium">{member.name}</span> - {member.role}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveTeamMember(member.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Available Team Members */}
                <div>
                  <h3 className="text-sm font-medium text-gray-600 mb-2">Available Team Members</h3>
                  <div className="border border-gray-300 rounded-md p-3 min-h-32">
                    {teamMembers
                      .filter(member => !selectedTeamMembers.some(m => m.id === member.id))
                      .map((member) => (
                        <li key={member.id} className="flex justify-between items-center text-sm">
                          <span>
                            <span className="font-medium">{member.name}</span> - {member.role}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleTeamMemberSelect(member.id)}
                            className="text-green-500 hover:text-green-700"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        </li>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Form buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            <Link href="../" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-green-700 rounded-md text-white hover:bg-green-800"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectPage;