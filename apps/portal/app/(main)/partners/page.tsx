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
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

const PartnersPage = () => {
  const router = useRouter();

  // States for data and UI
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPartners, setTotalPartners] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // States for modal popups
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  interface Partner {
    id: string;
    name: string;
    logo?: string;
    website_url?: string;
    location?: string;
  }

  const [currentPartner, setCurrentPartner] = useState<Partner | null>(null);

  // State for dropdown menu
  const [openMenuId, setOpenMenuId] = useState(null);

  // States for form data
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    website_url: '',
    location: ''
  });

  // States for file upload
  const [logoFile, setLogoFile] = useState(null);
  const [uploadMethod, setUploadMethod] = useState('url'); // 'url' or 'upload'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // States for form errors and success
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Added state for delete success message
  const [deleteSuccess, setDeleteSuccess] = useState('');

  // Function to toggle dropdown menu
  const toggleMenu = (id) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
    }
  };

  // Add click outside listener to close dropdown
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

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

  // Fetch partners from API with dependency on relevant state changes
  useEffect(() => {
    const fetchPartners = async () => {
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

        // Make API request with apiClient
        const response = await apiClient.get('/partners', { params });

        if (response.data) {
          // Parse the response data based on structure
          let partnersData = [];
          if (Array.isArray(response.data)) {
            partnersData = response.data;
            setTotalPartners(response.data.length);
            setTotalPages(Math.ceil(response.data.length / limit));
          } else if (response.data.partners && Array.isArray(response.data.partners)) {
            partnersData = response.data.partners;

            // Extract pagination info if available
            const pagination = response.data.pagination || {};
            setTotalPartners(pagination.total || partnersData.length);
            setTotalPages(pagination.pages || Math.ceil(partnersData.length / limit));
          }

          setPartners(partnersData);
        }
      } catch (error) {
        console.error('Error fetching partners:', error);
        setPartners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPartners();
  }, [page, limit, searchTerm, sortBy, sortOrder]);

  // Handle pagination
  const goToPage = (newPage) => {
    setPage(newPage);
  };

  // Calculate sequential row number based on pagination
  const getRowNumber = (index) => {
    return ((page - 1) * limit) + index + 1;
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: '',
      logo: '',
      website_url: '',
      location: ''
    });
    setLogoFile(null);
    setUploadMethod('url');
    setFormError('');
    setFormSuccess('');
  };

  // Open add partner modal
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Open edit partner modal
  const openEditModal = (partner) => {
    setCurrentPartner(partner);
    setFormData({
      name: partner.name || '',
      logo: partner.logo || '',
      website_url: partner.website_url || '',
      location: partner.location || ''
    });
    setOpenMenuId(null);
    setShowEditModal(true);
  };

  // Open delete partner modal
  const openDeleteModal = (partner: Partner) => {
    setCurrentPartner(partner);
    setOpenMenuId(null);
    setShowDeleteModal(true);
  };

  // Open view partner modal
  const openViewModal = (partner:Partner) => {
    setCurrentPartner(partner);
    setOpenMenuId(null);
    setShowViewModal(true);
  };

  // Close all modals
  const closeAllModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setCurrentPartner(null);
    resetForm();
  };

  // Handle form input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle logo file change
  const handleLogoFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  // Handle upload method change
  const handleUploadMethodChange = (method: 'url' | 'upload'): void => {
    setUploadMethod(method);
    if (method === 'url') {
      setLogoFile(null);
    } else {
      setFormData({
        ...formData,
        logo: ''
      });
    }
  };

  // Handle file upload to backend
  const uploadFile = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);
      
      // Update the path to match your backend route structure
      const response = await apiClient.post('/uploads/file', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      // Return the file URL from the response
      if (response.data && response.data.success) {
        return response.data.file.url;
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Handle add partner submission
  const handleAddPartner = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      // Validate form
      if (!formData.name) {
        setFormError('Partner name is required');
        return;
      }

      let logoUrl = formData.logo;

      // If upload method is file and there's a file, process it
      if (uploadMethod === 'upload' && logoFile) {
        try {
          logoUrl = await uploadFile(logoFile);
        } catch (error) {
          setFormError('Failed to upload logo. Please try again.');
          return;
        }
      }

      // Prepare data for API
      const partnerData = {
        ...formData,
        logo: logoUrl
      };

      // Make API request
      await apiClient.post('/partners', partnerData);

      // Show success message
      setFormSuccess('Partner added successfully');

      // Reset form and close modal after a delay
      setTimeout(() => {
        closeAllModals();

        // Refresh partners list
        setPage(1);
      }, 1500);
    } catch (error) {
      console.error('Error adding partner:', error);
      setFormError(error.response?.data?.message || 'Failed to add partner. Please try again.');
    }
  };

  // Handle edit partner submission
  const handleEditPartner = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      // Validate form
      if (!formData.name) {
        setFormError('Partner name is required');
        return;
      }

      let logoUrl = formData.logo;

      // If upload method is file and there's a file, process it
      if (uploadMethod === 'upload' && logoFile) {
        try {
          logoUrl = await uploadFile(logoFile);
        } catch (error) {
          setFormError('Failed to upload logo. Please try again.');
          return;
        }
      }

      // Prepare data for API
      const partnerData = {
        ...formData,
        logo: logoUrl
      };

      // Make API request
      await apiClient.put(`/partners/${currentPartner.id}`, partnerData);

      // Show success message
      setFormSuccess('Partner updated successfully');

      // Reset form and close modal after a delay
      setTimeout(() => {
        closeAllModals();

        // Refresh partners list
        setPage(1);
      }, 1500);
    } catch (error) {
      console.error('Error updating partner:', error);
      setFormError(error.response?.data?.message || 'Failed to update partner. Please try again.');
    }
  };

  // Handle delete partner
  const handleDeletePartner = async () => {
    try {
      // Make API request
      await apiClient.delete(`/partners/${currentPartner.id}`);

      // Set delete success message
      setDeleteSuccess(`Partner "${currentPartner.name}" was successfully deleted`);

      // Close modal
      closeAllModals();

      // Refresh partners list by updating the page
      const updatedPartners = partners.filter(partner => partner.id !== currentPartner.id);
      setPartners(updatedPartners);
      
      // Update total count
      setTotalPartners(prev => prev - 1);
      
      // Check if we need to navigate to previous page
      if (updatedPartners.length === 0 && page > 1) {
        setPage(prev => prev - 1);
      } else {
        // Otherwise explicitly refresh the current page
        setPage(current => current);
      }
      
      // Clear the success message after 3 seconds
      setTimeout(() => {
        setDeleteSuccess('');
      }, 3000);
    } catch (error) {
      console.error('Error deleting partner:', error);
      setFormError(error.response?.data?.message || 'Failed to delete partner. Please try again.');
    }
  };

  // Render logo preview - Fixed to properly handle image errors
  const renderLogoPreview = (logoUrl) => {
    if (!logoUrl) return null;
    
    return (
      <div className="mt-2 p-2 border rounded-md">
        <img 
          src={logoUrl} 
          alt="Logo Preview" 
          className="h-16 object-contain" 
          onError={(e) => {
            console.error(`Failed to load image preview: ${logoUrl}`);
            e.target.onerror = null;
            e.target.src = '/api/placeholder/64/64';
          }}
        />
      </div>
    );
  };

  // Truncate text for display
  const truncateText = (text, maxLength = 30) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
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

  // Image error handling function
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
    ctx.fillText(fallbackText || 'P', canvas.width/2, canvas.height/2);
    
    // Replace image with canvas data
    e.target.onerror = null; // Prevent infinite error loop
    e.target.src = canvas.toDataURL('image/png');
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header with title and buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Partners</h1>
          <p className="text-gray-500 text-sm">Partners List</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowUp className="w-4 h-4 mr-2" />
            Import Partners
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800"
          >
            Add Partner
            <Plus className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Delete success message */}
      {deleteSuccess && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-start">
          <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
          <span>{deleteSuccess}</span>
        </div>
      )}

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">List of Partners</h2>
          <div className="flex">
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <form onSubmit={handleSearchSubmit}>
                <input 
                  type="text" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5" 
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </form>
            </div>
            <button 
              className="ml-2 p-2.5 bg-green-700 text-white rounded-lg"
              onClick={() => {
                // Open a filter modal or expand filter options
              }}
            >
              <Filter className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Partners table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading partners...</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No partners found</p>
              <button 
                onClick={openAddModal}
                className="mt-4 px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800"
              >
                Add your first partner
              </button>
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Logo</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Website</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {partners.map((partner, index) => (
                  <tr key={partner.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getRowNumber(index)}</td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="h-10 w-10 rounded-full border overflow-hidden bg-gray-100 flex items-center justify-center">
                        {partner.logo ? (
                          <img 
                            src={partner.logo} 
                            alt={partner.name} 
                            className="h-full w-full object-contain"
                            onLoad={() => console.log(`Successfully loaded image: ${partner.logo}`)}
                            onError={(e) => {
                              console.error(`Failed to load image: ${partner.logo}`);
                              e.target.onerror = null; // Prevent infinite error loops
                              
                              // Create fallback with initial letter
                              const fallbackText = partner.name?.charAt(0)?.toUpperCase() || 'P';
                              handleImageError(e, fallbackText);
                            }}
                          />
                        ) : (
                          <span className="text-gray-400 text-xs">{partner.name?.charAt(0)?.toUpperCase() || 'P'}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {partner.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {partner.website_url ? (
                        <a 
                          href={partner.website_url.startsWith('http') ? partner.website_url : `https://${partner.website_url}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-green-700 hover:underline flex items-center"
                        >
                          {truncateText(partner.website_url.replace(/^https?:\/\//, ''), 25)}
                          <LinkIcon className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {partner.location || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => toggleMenu(partner.id)}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {/* Dropdown menu */}
                      {openMenuId === partner.id && (
                        <div ref={menuRef} className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <button
                            onClick={() => openViewModal(partner)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View details
                          </button>
                          <button
                            onClick={() => openEditModal(partner)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(partner)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            <Trash className="w-4 h-4 mr-2 " />
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
        {partners.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {partners.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, totalPartners)} out of {totalPartners} entries
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
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button 
                className="p-2 text-gray-500 rounded hover:bg-gray-100"
                onClick={() => goToPage(totalPages)}
                disabled={page === totalPages}
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">Add New Partner</h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddPartner} className="p-6">
              {/* Form Error */}
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              
              {/* Form Success */}
              {formSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}
              
              {/* Partner Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter partner name"
                  required
                />
              </div>
              
              {/* Logo Upload Method Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partner Logo
                </label>
                <div className="flex space-x-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleUploadMethodChange('url')}
                    className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                      uploadMethod === 'url' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUploadMethodChange('upload')}
                    className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                      uploadMethod === 'upload' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Upload
                  </button>
                </div>
                
                {/* URL Input */}
                {uploadMethod === 'url' && (
                  <div>
                    <input
                      type="text"
                      name="logo"
                      value={formData.logo}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter logo URL"
                    />
                    {formData.logo && renderLogoPreview(formData.logo)}
                  </div>
                )}
                
                {/* File Upload */}
                {uploadMethod === 'upload' && (
                  <div>
                    <div className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center">
                      <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          {logoFile ? logoFile.name : 'Click to upload logo image'}
                        </p>
                        <input
                          id="logo-upload"
                          type="file"
                          onChange={handleLogoFileChange}
                          className="hidden"
                          accept="image/*"
                        />
                      </label>
                    </div>
                    
                    {isUploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-700 h-2.5 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Uploading: {uploadProgress}%
                        </p>
                      </div>
                    )}
                    
                    {logoFile && !isUploading && renderLogoPreview(URL.createObjectURL(logoFile))}
                  </div>
                )}
              </div>
              
              {/* Website URL */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="text"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              
              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="City, Country"
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-white rounded-md flex items-center"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Add Partner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Partner Modal */}
      {showEditModal && currentPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">Edit Partner</h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditPartner} className="p-6">
              {/* Form Error */}
              {formError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{formError}</span>
                </div>
              )}
              
              {/* Form Success */}
              {formSuccess && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{formSuccess}</span>
                </div>
              )}
              
              {/* Partner Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partner Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter partner name"
                  required
                />
              </div>
              
              {/* Logo Upload Method Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Partner Logo
                </label>
                <div className="flex space-x-2 mb-2">
                  <button
                    type="button"
                    onClick={() => handleUploadMethodChange('url')}
                    className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                      uploadMethod === 'url' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <LinkIcon className="w-4 h-4 mr-1" />
                    URL
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUploadMethodChange('upload')}
                    className={`px-3 py-1.5 text-sm rounded-md flex items-center ${
                      uploadMethod === 'upload' 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-gray-100 text-gray-700 border border-gray-200'
                    }`}
                  >
                    <ImageIcon className="w-4 h-4 mr-1" />
                    Upload
                  </button>
                </div>
                
                {/* URL Input */}
                {uploadMethod === 'url' && (
                  <div>
                    <input
                      type="text"
                      name="logo"
                      value={formData.logo}
                      onChange={handleInputChange}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Enter logo URL"
                    />
                    {formData.logo && renderLogoPreview(formData.logo)}
                  </div>
                )}
                
                {/* File Upload */}
                {uploadMethod === 'upload' && (
                  <div>
                    <div className="border-2 border-dashed border-gray-300 p-4 rounded-md text-center">
                      <label htmlFor="logo-upload-edit" className="cursor-pointer flex flex-col items-center">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">
                          {logoFile ? logoFile.name : 'Click to upload logo image'}
                        </p>
                        <input
                          id="logo-upload-edit"
                          type="file"
                          onChange={handleLogoFileChange}
                          className="hidden"
                          accept="image/*"
                        />
                      </label>
                    </div>
                    
                    {isUploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-green-700 h-2.5 rounded-full" 
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 text-center">
                          Uploading: {uploadProgress}%
                        </p>
                      </div>
                    )}
                    
                    {logoFile && !isUploading && renderLogoPreview(URL.createObjectURL(logoFile))}
                    {!logoFile && formData.logo && renderLogoPreview(formData.logo)}
                  </div>
                )}
              </div>
              
              {/* Website URL */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website URL
                </label>
                <input
                  type="text"
                  name="website_url"
                  value={formData.website_url}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="https://example.com"
                />
              </div>
              
              {/* Location */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="City, Country"
                />
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-700 text-white rounded-md flex items-center"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Update Partner'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Partner Modal */}
      {showDeleteModal && currentPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Partner</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-medium">{currentPartner.name}</span>? This action cannot be undone.
              </p>
              
              <div className="flex justify-center space-x-3">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeletePartner}
                  className="px-4 py-2 bg-red-600 text-white bg-red rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Partner Modal */}
      {showViewModal && currentPartner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">Partner Details</h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-center mb-6">
                <div className="h-20 w-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {currentPartner.logo ? (
                    <img 
                      src={currentPartner.logo} 
                      alt={currentPartner.name} 
                      className="h-full w-full object-contain"
                      onLoad={() => console.log(`Successfully loaded image in view modal: ${currentPartner.logo}`)}
                      onError={(e) => {
                        console.error(`Failed to load image in view modal: ${currentPartner.logo}`);
                        e.target.onerror = null;
                        // Create fallback with initial letter
                        const fallbackText = currentPartner.name?.charAt(0)?.toUpperCase() || 'P';
                        handleImageError(e, fallbackText);
                      }}
                    />
                  ) : (
                    <span className="text-gray-400 text-2xl">{currentPartner.name?.charAt(0)?.toUpperCase() || 'P'}</span>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Partner Name</h4>
                  <p className="mt-1">{currentPartner.name}</p>
                </div>
                
                {currentPartner.website_url && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Website</h4>
                    <p className="mt-1">
                      <a 
                        href={currentPartner.website_url.startsWith('http') ? currentPartner.website_url : `https://${currentPartner.website_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-700 hover:underline flex items-center"
                      >
                        {currentPartner.website_url}
                        <LinkIcon className="w-3 h-3 ml-1" />
                      </a>
                    </p>
                  </div>
                )}
                
                {currentPartner.location && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Location</h4>
                    <p className="mt-1">{currentPartner.location}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => {
                    closeAllModals();
                    openEditModal(currentPartner);
                  }}
                  className="px-4 py-2 bg-green-700 text-white rounded-md flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Partner
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartnersPage;