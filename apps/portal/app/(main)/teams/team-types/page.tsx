"use client";

import React, { useState, useEffect, useRef } from 'react';
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
  X,
  Loader
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

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

  // States for edit team type modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTeamType, setEditTeamType] = useState({ id: '', name: '', description: '' });
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState('');

  // States for view details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedTeamType, setSelectedTeamType] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState('');

  // Function to toggle dropdown menu
  const toggleMenu = (id) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
    }
  };

  // Function to fetch team type details
  const fetchTeamTypeDetails = async (id) => {
    try {
      setLoadingDetails(true);
      setDetailsError('');
      
      console.log(`Fetching team type details for ID: ${id}`);
      
      const response = await apiClient.get(`/team-types/${id}`);
      
      console.log('Team type details full response:', response);
      console.log('Team type details response data:', response.data);
      
      // Create a fallback object in case we can't find valid data
      const fallbackTeamType = {
        name: 'Data unavailable',
        description: 'No description available',
        created_at: null
      };
      
      // Handle different potential response structures
      if (response.data) {
        if (response.data.teamType) {
          // Case: { teamType: { ... } }
          console.log('Found teamType in response.data.teamType');
          setSelectedTeamType(response.data.teamType);
        } else if (response.data.name !== undefined) {
          // Case: Direct team type object { name: "...", ... }
          console.log('Response data appears to be the team type directly');
          setSelectedTeamType(response.data);
        } else if (Array.isArray(response.data) && response.data.length > 0) {
          // Case: Array with the first item being the team type
          console.log('Response data is an array, using first item');
          setSelectedTeamType(response.data[0]);
        } else {
          // No recognizable format found
          console.error('Could not find team type data in response:', response.data);
          setSelectedTeamType(fallbackTeamType);
          setDetailsError('Could not parse team type details');
        }
      } else {
        console.error('No data in response');
        setSelectedTeamType(fallbackTeamType);
        setDetailsError('No details found for this team type');
      }
    } catch (error) {
      console.error('Error fetching team type details:', error);
      console.error('Error details:', error.response || error.message || error);
      setDetailsError('Failed to load team type details. Please try again.');
      setSelectedTeamType({
        name: 'Error loading data',
        description: 'An error occurred while loading team type details',
        created_at: null
      });
    } finally {
      setLoadingDetails(false);
    }
  };

  // Function to open details modal
  const openDetailsModal = (id) => {
    if (!id) {
      console.error('Attempted to open details with invalid ID:', id);
      setDetailsError('Invalid team type ID');
      setShowDetailsModal(true);
      return;
    }
    
    console.log('Opening details modal for team type ID:', id);
    fetchTeamTypeDetails(id);
    setShowDetailsModal(true);
  };

  // Function to close details modal
  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedTeamType(null);
    setDetailsError('');
  };

  // Function to open edit modal
  const openEditModal = async (teamTypeId) => {
    try {
      setEditError('');
      setEditSubmitting(false);
      
      // Fetch the team type details
      setLoadingDetails(true);
      const response = await apiClient.get(`/team-types/${teamTypeId}`);
      setLoadingDetails(false);
      
      let teamTypeData;
      
      // Handle different response formats
      if (response.data && response.data.teamType) {
        teamTypeData = response.data.teamType;
      } else if (response.data && typeof response.data === 'object') {
        teamTypeData = response.data;
      } else {
        throw new Error('Could not retrieve team type data');
      }
      
      // Set the edit team type data
      setEditTeamType({
        id: teamTypeId,
        name: teamTypeData.name || '',
        description: teamTypeData.description || ''
      });
      
      // Show the edit modal
      setShowEditModal(true);
    } catch (error) {
      console.error('Error fetching team type for edit:', error);
      toast.error(error.response?.data?.message || 'Failed to load team type details for editing');
    }
  };

  // Function to close edit modal
  const closeEditModal = () => {
    setShowEditModal(false);
    setEditTeamType({ id: '', name: '', description: '' });
    setEditError('');
  };

  // Function to handle input change in edit modal
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditTeamType(prev => ({ ...prev, [name]: value }));
  };

  // Function to handle submit in edit team type modal
  const handleEditTeamType = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!editTeamType.name.trim()) {
      setEditError('Team type name is required');
      return;
    }
    
    try {
      setEditSubmitting(true);
      setEditError('');
      
      console.log(`Updating team type with ID: ${editTeamType.id}`);
      console.log('Update payload:', { name: editTeamType.name, description: editTeamType.description });
      
      // Make API request to update team type
      // Using PATCH instead of PUT as it might be what the API expects
      const response = await apiClient.patch(
        `/team-types/${editTeamType.id}`, 
        {
          name: editTeamType.name,
          description: editTeamType.description
        }
      );
      
      console.log('Team type update response:', response.data);
      
      // Update the team type in the local state
      setTeamTypes(prevTeamTypes => 
        prevTeamTypes.map(teamType => 
          teamType.id === editTeamType.id 
            ? { ...teamType, name: editTeamType.name, description: editTeamType.description }
            : teamType
        )
      );
      
      // Close modal
      closeEditModal();
      
      // Show success message
      toast.success('Team type updated successfully');
      
    } catch (error) {
      console.error('Error updating team type:', error);
      console.error('Error details:', error.response || error.message || error);
      setEditError(error.response?.data?.message || 'Failed to update team type. Please try again.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Function to handle action click
  const handleAction = async (action, teamTypeId) => {
    setOpenMenuId(null); // Close the menu
    
    switch(action) {
      case 'view':
        // Open details modal
        openDetailsModal(teamTypeId);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this team type?')) {
          try {
            console.log(`Deleting team type with ID: ${teamTypeId}`);
            // Use the specified DELETE endpoint
            await apiClient.delete(`/team-types/${teamTypeId}`);
            console.log('Delete successful');
            
            // Update the list directly without page refresh
            const updatedTeamTypes = teamTypes.filter(teamType => teamType.id !== teamTypeId);
            setTeamTypes(updatedTeamTypes);
            
            // Update the total count
            setTotalTeamTypes(prev => prev - 1);
            
            // If we deleted the last item on the current page, go to previous page
            // But only if we're not already on the first page
            if (updatedTeamTypes.length === 0 && page > 1) {
              setPage(page - 1);
            } else {
              // Recalculate total pages
              const newTotalPages = Math.ceil((totalTeamTypes - 1) / limit);
              setTotalPages(newTotalPages);
            }
            
            // Show success message in a toast notification
            toast.success('Team type deleted successfully');
          } catch (error) {
            console.error('Error deleting team type:', error);
            console.error('Error details:', error.response || error.message || error);
            toast.error(error.response?.data?.message || 'Failed to delete team type. Please try again.');
          }
        }
        break;
      case 'update':
        // Open edit modal instead of navigating
        openEditModal(teamTypeId);
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
      const response = await apiClient.post(
        '/team-types', 
        newTeamType
      );
      
      console.log('Team type created:', response.data);
      
      // Close modal and refresh list
      closeAddModal();
      
      // Show success message
      toast.success('Team type created successfully');
      
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
  const detailsModalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
      
      if (modalRef.current && !modalRef.current.contains(event.target) && !event.target.closest('.modal-backdrop')) {
        closeAddModal();
      }
      
      if (detailsModalRef.current && !detailsModalRef.current.contains(event.target) && !event.target.closest('.modal-backdrop')) {
        closeDetailsModal();
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, modalRef, detailsModalRef]);

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
        
        // Make API request with apiClient
        const response = await apiClient.get('/team-types', { params });
        
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
        toast.error(error.response?.data?.message || 'Failed to load team types');
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
                            onClick={() => {
                              console.log('View action clicked for team type:', teamType);
                              handleAction('view', teamType.id);
                            }}
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

      {/* View Team Type Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center modal-backdrop">
          <div 
            ref={detailsModalRef}
            className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl"
          >
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium">Team Type Details</h3>
              <button 
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              {loadingDetails ? (
                <div className="flex justify-center items-center py-8">
                  <Loader className="w-8 h-8 text-green-700 animate-spin" />
                </div>
              ) : detailsError ? (
                <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded mb-4">
                  {detailsError}
                </div>
              ) : selectedTeamType ? (
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Name</h4>
                    <p className="text-lg font-medium">{selectedTeamType.name || 'N/A'}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Description</h4>
                    <p className="text-md">{selectedTeamType.description || 'No description provided'}</p>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Created At</h4>
                    <p className="text-md">{selectedTeamType.created_at ? formatDate(selectedTeamType.created_at) : 'N/A'}</p>
                  </div>
                  
                  {/* Add any additional fields from the team type that you want to display */}
                  {selectedTeamType.updated_at && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
                      <p className="text-md">{formatDate(selectedTeamType.updated_at)}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">No team type details available</div>
              )}
              
              <div className="flex justify-end mt-4">
                <button
                  onClick={closeDetailsModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Team Type Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center modal-backdrop">
          <div 
            className="bg-white rounded-lg max-w-md w-full mx-4 shadow-xl"
          >
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-lg font-medium">Edit Team Type</h3>
              <button 
                onClick={closeEditModal}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditTeamType} className="p-4">
              {editError && (
                <div className="mb-4 p-2 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
                  {editError}
                </div>
              )}
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-name">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="edit-name"
                  name="name"
                  value={editTeamType.name}
                  onChange={handleEditInputChange}
                  placeholder="Enter team type name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-description">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editTeamType.description}
                  onChange={handleEditInputChange}
                  placeholder="Enter team type description"
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className={`px-4 py-2 text-sm font-medium text-white bg-green-700 rounded-md hover:bg-green-800 ${
                    editSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
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