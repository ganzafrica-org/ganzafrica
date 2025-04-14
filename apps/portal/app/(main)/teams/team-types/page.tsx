"use client";

import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Search, 
  Filter, 
  ArrowUp, 
  MoreHorizontal, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowRight,
  Eye,
  Edit,
  Trash,
  Plus,
  X
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Create an axios instance with retry configuration
const axiosInstance = axios.create({
  timeout: 10000,
});

// Add a retry interceptor
axiosInstance.interceptors.response.use(undefined, async (err) => {
  const { config, response } = err;
  
  // Only retry on 429 status code (too many requests) or network errors
  if ((response && response.status === 429) || !response) {
    // Set max retry count
    const maxRetries = 3;
    config.retryCount = config.retryCount || 0;
    
    if (config.retryCount < maxRetries) {
      // Increase retry count
      config.retryCount += 1;
      
      // Exponential backoff: wait longer for each retry
      const delay = Math.pow(2, config.retryCount) * 1000;
      console.log(`Retrying request (${config.retryCount}/${maxRetries}) after ${delay}ms...`);
      
      // Wait for the delay
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry the request
      return axiosInstance(config);
    }
  }
  
  // If we've reached max retries or it's not a 429 error, reject the promise
  return Promise.reject(err);
});

// Add a request interceptor to add a delay between requests
axiosInstance.interceptors.request.use(async (config) => {
  // Track time between requests to avoid overwhelming the API
  const now = Date.now();
  const lastRequestTime = window.lastAxiosRequestTime || 0;
  const minRequestInterval = 300; // minimum ms between requests
  
  if (now - lastRequestTime < minRequestInterval) {
    // Wait until the minimum interval has passed
    const delayMs = minRequestInterval - (now - lastRequestTime);
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  // Update the last request time
  window.lastAxiosRequestTime = Date.now();
  
  return config;
});

// Add a request throttling mechanism
const pendingRequests = {};

const throttledAxios = {
  get: (url, config = {}) => {
    const key = `${url}${JSON.stringify(config.params || {})}`;
    
    // If there's already a pending request with the same parameters, return that promise
    if (pendingRequests[key]) {
      return pendingRequests[key];
    }
    
    // Otherwise, make a new request
    const request = axiosInstance.get(url, config)
      .finally(() => {
        // Remove from pending requests when done
        delete pendingRequests[key];
      });
    
    pendingRequests[key] = request;
    return request;
  },
  post: (url, data, config = {}) => {
    return axiosInstance.post(url, data, config);
  },
  delete: (url, config = {}) => {
    return axiosInstance.delete(url, config);
  }
};

const TeamTypesPage = () => {
  const router = useRouter();
  
  // State for data and UI
  const [teamTypes, setTeamTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalTeamTypes, setTotalTeamTypes] = useState(0);
  
  // States for pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // State for dropdown menu
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // States for add team type modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeamType, setNewTeamType] = useState({ name: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Function to toggle dropdown menu
  const toggleMenu = (id) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
    }
  };

  // Function to handle action click
  const handleAction = async (action, teamTypeId) => {
    setOpenMenuId(null); // Close the menu
    
    switch(action) {
      case 'view':
        // Navigate to team type details page
        router.push(`/team-types/${teamTypeId}`);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this team type?')) {
          try {
            await throttledAxios.delete(`http://localhost:3002/api/team-types/${teamTypeId}`);
            // Refresh the team types list after deletion
            const updatedPage = teamTypes.length === 1 && page > 1 ? page - 1 : page;
            setPage(updatedPage);
          } catch (error) {
            console.error('Error deleting team type:', error);
            alert('Failed to delete team type. Please try again.');
          }
        }
        break;
      case 'update':
        // Navigate to update page
        router.push(`/team-types/edit/${teamTypeId}`);
        break;
      default:
        break;
    }
  };

  // Function to open add team type modal
  const openAddModal = () => {
    setNewTeamType({ name: '', description: '' });
    setError('');
    setShowAddModal(true);
  };

  // Function to close add team type modal
  const closeAddModal = () => {
    setShowAddModal(false);
  };

  // Function to handle input change in modal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTeamType(prev => ({ ...prev, [name]: value }));
  };

  // Function to handle submit in add team type modal
  const handleAddTeamType = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!newTeamType.name.trim()) {
      setError('Team type name is required');
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Make API request to create new team type
      const response = await throttledAxios.post(
        'http://localhost:3002/api/team-types', 
        newTeamType
      );
      
      console.log('Team type created:', response.data);
      
      // Close modal and refresh list
      closeAddModal();
      
      // Fetch updated list of team types
      setPage(1); // Reset to first page to show the new entry
      
    } catch (error) {
      console.error('Error creating team type:', error);
      setError(error.response?.data?.message || 'Failed to create team type. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle pagination
  const goToPage = (newPage) => {
    setPage(newPage);
  };

  // Calculate sequential row number based on pagination
  const getRowNumber = (index) => {
    return ((page - 1) * limit) + index + 1;
  };

  // Add click outside listener to close dropdown
  const menuRef = useRef(null);
  const modalRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
      
      if (modalRef.current && !modalRef.current.contains(event.target) && !event.target.closest('.modal-backdrop')) {
        closeAddModal();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, modalRef]);

  // Add debouncing for search
  const searchTimeoutRef = useRef(null);
  
  // Handle search input change with debounce
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    // Set a new timeout to trigger search after user stops typing
    searchTimeoutRef.current = setTimeout(() => {
      setPage(1); // Reset to first page when searching
    }, 500); // 500ms debounce
  };
  
  // Handle search submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Clear any existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    setPage(1); // Reset to first page when searching
  };

  // Fetch team types from API with dependency on relevant state changes
  useEffect(() => {
    const fetchTeamTypes = async () => {
      try {
        setLoading(true);
        
        // Add a delay between requests to avoid rate limiting
        const lastRequestTime = window.lastTeamTypeFetchTime || 0;
        const now = Date.now();
        const timeSinceLastRequest = now - lastRequestTime;
        
        // If last request was less than 500ms ago, delay this one
        if (timeSinceLastRequest < 500) {
          await new Promise(resolve => setTimeout(resolve, 500 - timeSinceLastRequest));
        }
        
        // Build query params
        const params = {
          page,
          limit,
          sort_by: sortBy,
          sort_order: sortOrder
        };
        
        // Add optional filters if they exist
        if (searchTerm) params.search = searchTerm;
        
        console.log('Fetching team types with params:', params);
        
        // Store the time of this request
        window.lastTeamTypeFetchTime = Date.now();
        
        // Make API request with throttled axios
        const response = await throttledAxios.get('http://localhost:3002/api/team-types', { params });
        
        console.log('API response:', response.data);
        
        if (response.data) {
          // Handle different response formats
          if (Array.isArray(response.data)) {
            setTeamTypes(response.data);
            setTotalTeamTypes(response.data.length);
            setTotalPages(Math.ceil(response.data.length / limit));
          } else if (response.data.teamTypes && Array.isArray(response.data.teamTypes)) {
            setTeamTypes(response.data.teamTypes);
            
            // Extract pagination info if available
            const pagination = response.data.pagination || {};
            setTotalTeamTypes(parseInt(pagination.total) || response.data.teamTypes.length);
            setTotalPages(pagination.pages || Math.ceil(response.data.teamTypes.length / limit));
          } else {
            console.error('Unexpected response format:', response.data);
            setTeamTypes([]);
            setTotalTeamTypes(0);
            setTotalPages(1);
          }
        }
      } catch (error) {
        console.error('Error fetching team types:', error);
        setTeamTypes([]);
        setTotalTeamTypes(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeamTypes();
  }, [page, limit, searchTerm, sortBy, sortOrder]);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header with title and buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Team Types</h1>
          <p className="text-gray-500 text-sm">Manage team role types</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowUp className="w-4 h-4 mr-2" />
            Import Team Types
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Team Type
          </button>
        </div>
      </div>

      <div className='bg-white'>
        {/* Team types list title */}
        <h2 className="text-lg font-bold mb-4">List of Team Types</h2>

        {/* Search and filter */}
        <div className="flex justify-end mb-4">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-gray-500" />
            </div>
            <form onSubmit={handleSearchSubmit}>
              <input 
                type="text" 
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded block w-full pl-10 p-2.5" 
                placeholder="Search"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </form>
          </div>
          <button 
            className="ml-2 p-2.5 bg-green-700 text-white rounded"
            onClick={() => {
              // Open a filter modal or expand filter options
            }}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {/* Team types table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
          {loading ? (
            <div className="text-center py-4">Loading team types...</div>
          ) : teamTypes.length === 0 ? (
            <div className="text-center py-4">No team types found</div>
          ) : (
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created at</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {teamTypes.map((teamType, index) => (
                  <tr key={teamType.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getRowNumber(index)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teamType.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {teamType.description || 'No description'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(teamType.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => toggleMenu(teamType.id)}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {/* Dropdown menu */}
                      {openMenuId === teamType.id && (
                        <div ref={menuRef} className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <button
                            onClick={() => handleAction('view', teamType.id)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View details
                          </button>
                          <button
                            onClick={() => handleAction('update', teamType.id)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleAction('delete', teamType.id)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash className="w-4 h-4 mr-2" />
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between py-3">
          <div className="text-sm text-gray-500">
            Showing {teamTypes.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, totalTeamTypes)} out of {totalTeamTypes} entries
          </div>
          <div className="flex items-center space-x-1">
            <button 
              className="p-2 text-gray-500 rounded hover:bg-gray-100"
              onClick={() => goToPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button 
              className="p-2 text-gray-500 rounded hover:bg-gray-100"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Display page numbers */}
            {[...Array(Math.min(totalPages, 3))].map((_, index) => {
              const pageNumber = page <= 2 ? index + 1 : page - 1 + index;
              if (pageNumber <= totalPages) {
                return (
                  <button 
                    key={pageNumber}
                    onClick={() => goToPage(pageNumber)}
                    className={`p-2 w-8 h-8 rounded-md ${
                      pageNumber === page
                        ? 'bg-green-700 text-white'
                        : 'hover:bg-gray-100 text-gray-700'
                    } flex items-center justify-center`}
                  >
                    {pageNumber}
                  </button>
                );
              }
              return null;
            })}
            
            <button 
              className="p-2 text-gray-500 rounded hover:bg-gray-100"
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || totalPages === 0}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              className="p-2 text-gray-500 rounded hover:bg-gray-100"
              onClick={() => goToPage(totalPages)}
              disabled={page === totalPages || totalPages === 0}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add Team Type Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center modal-backdrop">
          <div 
            ref={modalRef}
            className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl"
          >
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium">Add New Team Type</h3>
              <button 
                onClick={closeAddModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddTeamType} className="p-4">
              {error && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                  {error}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={newTeamType.name}
                  onChange={handleInputChange}
                  placeholder="Enter team type name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={newTeamType.description}
                  onChange={handleInputChange}
                  placeholder="Enter team type description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeAddModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 ${
                    submitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {submitting ? 'Adding...' : 'Add Team Type'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTypesPage;