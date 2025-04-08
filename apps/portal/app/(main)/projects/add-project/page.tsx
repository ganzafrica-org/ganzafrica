"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft,
  Upload,
  X,
  Check,
  Plus,
  AlertCircle,
  Loader
} from 'lucide-react';
import Link from 'next/link';

// Type definitions
interface TeamMember {
  id: string;
  name: string;
  role: string;
}

interface Location {
  id: string;
  name: string;
}

interface Category {
  id: number;
  name: string;
  description?: string;
}

interface FormData {
  name: string;
  category_id: string;
  description: string;
  teamLead: string;
  start_date: string;
  end_date: string;
  location: string;
  status: 'planned' | 'active' | 'completed';
  budget: string;
  impacted_people: string;
  cover_image: string;
}

interface CategoryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: Category) => void;
}

// Category Dialog Component with fixed API URL
const CategoryDialog: React.FC<CategoryDialogProps> = ({ isOpen, onClose, onSave }) => {
  const [newCategory, setNewCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!newCategory.trim()) {
      setError('Category name is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Use explicit URL with port 3002 instead of relative URL
      const response = await fetch('http://localhost:3002/api/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          name: newCategory.trim(),
          description: description.trim() || undefined
        })
      });

      // Check if the response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
        } else {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
      }
      
      const result = await response.json();

      // Create a dummy category if the API doesn't return the expected format
      const newCategoryObj = result.data?.category || {
        id: Math.floor(Math.random() * 1000) + 1,
        name: newCategory.trim(),
        description: description.trim() || undefined
      };

      onSave(newCategoryObj);
      setNewCategory('');
      setDescription('');
    } catch (err) {
      console.error('Error creating category:', err);
      setError(err instanceof Error ? err.message : 'Failed to create category');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
        <div className="p-4 border-b">
          <h2 className="text-lg font-bold">Add New Category</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start">
              <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className="mb-4">
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="categoryName"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="Enter category name"
              required
            />
          </div>
          
          <div className="mb-4">
            <label htmlFor="categoryDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="categoryDescription"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              placeholder="Enter category description (optional)"
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-700 rounded-md text-white hover:bg-green-800 flex items-center"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : 'Save Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddProjectPage: React.FC = () => {
  const router = useRouter();
  
  // States for form data
  const [formData, setFormData] = useState<FormData>({
    name: '',
    category_id: '',
    description: '',
    teamLead: '',
    start_date: '',
    end_date: '',
    location: '',
    status: 'planned',
    budget: '',
    impacted_people: '',
    cover_image: ''
  });

  // States for dynamic data
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations] = useState<Location[]>([
    { id: '1', name: 'Kigali' },
    { id: '2', name: 'Musanze' },
    { id: '3', name: 'Rubavu' },
    { id: '4', name: 'Nyagatare' },
    { id: '5', name: 'Huye' }
  ]);
  const [teamMembers] = useState<TeamMember[]>([
    { id: '1', name: 'Mukamana Fransine', role: 'Project Manager' },
    { id: '2', name: 'John Doe', role: 'Data Analyst' },
    { id: '3', name: 'Jane Smith', role: 'Climate Researcher' },
    { id: '4', name: 'Robert Johnson', role: 'Field Coordinator' },
    { id: '5', name: 'Emily Williams', role: 'Research Assistant' }
  ]);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  
  // State for category dialog
  const [showCategoryDialog, setShowCategoryDialog] = useState<boolean>(false);

  // Fetch categories on component mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Use the correct port 3002 to match your API server
        const response = await fetch('http://localhost:3002/api/categories');
        const result = await response.json();
        
        if (result.success && result.data) {
          setCategories(result.data);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTeamMemberSelect = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (member && !selectedTeamMembers.some(m => m.id === memberId)) {
      setSelectedTeamMembers([...selectedTeamMembers, member]);
    }
  };

  const handleRemoveTeamMember = (memberId: string) => {
    setSelectedTeamMembers(selectedTeamMembers.filter(m => m.id !== memberId));
  };

  const handleAddCategory = (newCategory: Category) => {
    // Add the new category to the list
    setCategories([...categories, newCategory]);
    
    // Select the new category in the form
    setFormData({
      ...formData,
      category_id: newCategory.id.toString()
    });
    
    // Close the dialog
    setShowCategoryDialog(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Create project payload
      const projectData = {
        name: formData.name,
        description: formData.description,
        status: formData.status,
        category_id: formData.category_id ? Number(formData.category_id) : undefined,
        location: formData.location,
        impacted_people: formData.impacted_people ? Number(formData.impacted_people) : undefined,
        cover_image: formData.cover_image || undefined,
        start_date: formData.start_date,
        end_date: formData.end_date || undefined,
        budget: formData.budget ? Number(formData.budget) : undefined,
        team_members: selectedTeamMembers.map(member => Number(member.id))
      };
      
      // Submit to API with correct port
      const response = await fetch('http://localhost:3002/api/projects', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(projectData)
      });
      
      // Check if the response is OK before trying to parse JSON
      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
        } else {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
      }
      
      const result = await response.json();
      
      // Redirect to projects page on success
      router.push('/projects');
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Category Dialog */}
      <CategoryDialog 
        isOpen={showCategoryDialog}
        onClose={() => setShowCategoryDialog(false)}
        onSave={handleAddCategory}
      />
      
      {/* Header with back button */}
      <div className="mb-6">
        <Link href="/projects" className="flex items-center text-gray-600 hover:text-gray-800">
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Projects
        </Link>
      </div>

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Add New Project</h1>
        <p className="text-gray-500">Fill in the details to create a new project</p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Project Name */}
            <div className="col-span-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter project name"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              
              <div className="flex">
                <select
                  id="category_id"
                  name="category_id"
                  required
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full p-2.5 border border-gray-300 rounded-l-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id.toString()}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCategoryDialog(true)}
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
                <option value="planned">Planned</option>
                <option value="active">Active</option>
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
                rows={4}
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
              <label htmlFor="start_date" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="start_date"
                name="start_date"
                required
                value={formData.start_date}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* End Date */}
            <div>
              <label htmlFor="end_date" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                id="end_date"
                name="end_date"
                value={formData.end_date}
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

            {/* Impacted People */}
            <div>
              <label htmlFor="impacted_people" className="block text-sm font-medium text-gray-700 mb-1">
                Number of People Impacted
              </label>
              <input
                type="number"
                id="impacted_people"
                name="impacted_people"
                value={formData.impacted_people}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter number of people impacted"
              />
            </div>

            {/* Cover Image URL */}
            <div className="col-span-2">
              <label htmlFor="cover_image" className="block text-sm font-medium text-gray-700 mb-1">
                Cover Image URL
              </label>
              <input
                type="url"
                id="cover_image"
                name="cover_image"
                value={formData.cover_image}
                onChange={handleInputChange}
                className="w-full p-2.5 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                placeholder="Enter image URL"
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
                        <li key={member.id} className="flex justify-between items-center text-sm mb-2 list-none">
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
            <Link href="/projects" className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              className="px-4 py-2 bg-green-700 rounded-md text-white hover:bg-green-800 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProjectPage;