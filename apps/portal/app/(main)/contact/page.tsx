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
  Eye,
  Edit,
  Trash,
  Plus,
  X,
  Mail,
  Phone,
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
  Loader,
  MessageSquare
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';

const ContactsPage = () => {
  const router = useRouter();

  // States for data and UI
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  // States for pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalContacts, setTotalContacts] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // States for modal popups
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentContact, setCurrentContact] = useState(null);

  // State for dropdown menu
  const [openMenuId, setOpenMenuId] = useState(null);

  // States for form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    message: ''
  });

  // States for form errors and success
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

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

  // Fetch contacts from API with dependency on relevant state changes
  useEffect(() => {
    const fetchContacts = async () => {
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
        const response = await apiClient.get('/contacts', { params });

        if (response.data) {
          // Parse the response data based on structure
          let contactsData = [];
          if (Array.isArray(response.data)) {
            contactsData = response.data;
            setTotalContacts(response.data.length);
            setTotalPages(Math.ceil(response.data.length / limit));
          } else if (response.data.contacts && Array.isArray(response.data.contacts)) {
            contactsData = response.data.contacts;

            // Extract pagination info if available
            const pagination = response.data.pagination || {};
            setTotalContacts(pagination.total || contactsData.length);
            setTotalPages(pagination.pages || Math.ceil(contactsData.length / limit));
          }

          setContacts(contactsData);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
        setContacts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchContacts();
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
      email: '',
      phone: '',
      location: '',
      message: ''
    });
    setFormError('');
    setFormSuccess('');
  };

  // Open add contact modal
  const openAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Open edit contact modal
  const openEditModal = (contact) => {
    setCurrentContact(contact);
    setFormData({
      name: contact.name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      location: contact.location || '',
      message: contact.message || ''
    });
    setOpenMenuId(null);
    setShowEditModal(true);
  };

  // Open delete contact modal
  const openDeleteModal = (contact) => {
    setCurrentContact(contact);
    setOpenMenuId(null);
    setShowDeleteModal(true);
  };

  // Open view contact modal
  const openViewModal = (contact) => {
    setCurrentContact(contact);
    setOpenMenuId(null);
    setShowViewModal(true);
  };

  // Close all modals
  const closeAllModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setShowDeleteModal(false);
    setShowViewModal(false);
    setCurrentContact(null);
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

  // Handle add contact submission
  const handleAddContact = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      // Validate form
      if (!formData.name) {
        setFormError('Name is required');
        return;
      }

      if (formData.email && !validateEmail(formData.email)) {
        setFormError('Please enter a valid email address');
        return;
      }

      // Make API request
      await apiClient.post('/contacts', formData);

      // Show success message
      setFormSuccess('Contact added successfully');

      // Reset form and close modal after a delay
      setTimeout(() => {
        closeAllModals();

        // Refresh contacts list
        setPage(1);
      }, 1500);
    } catch (error) {
      console.error('Error adding contact:', error);
      setFormError(error.response?.data?.message || 'Failed to add contact. Please try again.');
    }
  };

  // Handle edit contact submission
  const handleEditContact = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    try {
      // Validate form
      if (!formData.name) {
        setFormError('Name is required');
        return;
      }

      if (formData.email && !validateEmail(formData.email)) {
        setFormError('Please enter a valid email address');
        return;
      }

      // Make API request
      await apiClient.put(`/contacts/${currentContact.id}`, formData);

      // Show success message
      setFormSuccess('Contact updated successfully');

      // Reset form and close modal after a delay
      setTimeout(() => {
        closeAllModals();

        // Refresh contacts list
        setPage(1);
      }, 1500);
    } catch (error) {
      console.error('Error updating contact:', error);
      setFormError(error.response?.data?.message || 'Failed to update contact. Please try again.');
    }
  };

  // Handle delete contact
  const handleDeleteContact = async () => {
    try {
      // Make API request
      await apiClient.delete(`/contacts/${currentContact.id}`);

      // Close modal
      closeAllModals();

      // Refresh contacts list
      setPage(1);
    } catch (error) {
      console.error('Error deleting contact:', error);
      setFormError(error.response?.data?.message || 'Failed to delete contact. Please try again.');
    }
  };

  // Validate email format
  const validateEmail = (email) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  // Format phone number for display
  const formatPhone = (phone) => {
    if (!phone) return '';
    // Format as needed for your region
    return phone;
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

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="p-6 max-w-full">
      {/* Header with title and buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-gray-500 text-sm">Manage your contacts</p>
        </div>
        <div className="flex space-x-3">
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowUp className="w-4 h-4 mr-2" />
            Import Contacts
          </button>
          <button 
            onClick={openAddModal}
            className="flex items-center px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800"
          >
            Add Contact
            <Plus className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Contacts Directory</h2>
          <div className="flex">
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <form onSubmit={handleSearchSubmit}>
                <input 
                  type="text" 
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5" 
                  placeholder="Search contacts..."
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

      {/* Contacts table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading contacts...</p>
            </div>
          ) : contacts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No contacts found</p>
              <button 
                onClick={openAddModal}
                className="mt-4 px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800"
              >
                Add your first contact
              </button>
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSortChange('name')}
                  >
                    Name
                    {sortBy === 'name' && (
                      <span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contacts.map((contact, index) => (
                  <tr key={contact.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getRowNumber(index)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.name || "N/A"}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.email ? (
                        <a 
                          href={`mailto:${contact.email}`} 
                          className="text-green-700 hover:underline flex items-center"
                        >
                          {truncateText(contact.email, 25)}
                          <Mail className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.phone ? (
                        <a 
                          href={`tel:${contact.phone}`} 
                          className="text-green-700 hover:underline flex items-center"
                        >
                          {formatPhone(contact.phone)}
                          <Phone className="w-3 h-3 ml-1" />
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {contact.location || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {truncateText(contact.message, 20) || <span className="text-gray-400">-</span>}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                      <button 
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => toggleMenu(contact.id)}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      {/* Dropdown menu */}
                      {openMenuId === contact.id && (
                        <div ref={menuRef} className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <button
                            onClick={() => openViewModal(contact)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View details
                          </button>
                          <button
                            onClick={() => openEditModal(contact)}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </button>
                          <button
                            onClick={() => openDeleteModal(contact)}
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
        {contacts.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {contacts.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, totalContacts)} out of {totalContacts} entries
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

      {/* Add Contact Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">Add New Contact</h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddContact} className="p-6">
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
              
              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter name"
                  required
                />
              </div>
              
              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="email@example.com"
                />
              </div>
              
              {/* Phone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="+1 (123) 456-7890"
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
              
              {/* Message */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Additional information about this contact..."
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
                  className="px-4 py-2 bg-green-700 text-white rounded-md"
                >
                  Add Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Contact Modal */}
      {showEditModal && currentContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">Edit Contact</h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditContact} className="p-6">
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
              
              {/* Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Enter name"
                  required
                />
              </div>
              
              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="email@example.com"
                />
              </div>
              
              {/* Phone */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="+1 (123) 456-7890"
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
              
              {/* Message */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Additional information about this contact..."
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
                  className="px-4 py-2 bg-green-700 text-white rounded-md"
                >
                  Update Contact
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Contact Modal */}
      {showDeleteModal && currentContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <Trash className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Contact</h3>
              <p className="text-gray-500 mb-6">
                Are you sure you want to delete <span className="font-medium">{currentContact.name}</span>? This action cannot be undone.
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
                  onClick={handleDeleteContact}
                  className="px-4 py-2 bg-red-600 text-white rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Contact Modal */}
      {showViewModal && currentContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">Contact Details</h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-4">
                <h2 className="text-xl font-bold">{currentContact.name}</h2>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <div className="space-y-4">
                  {currentContact.email && (
                    <div className="flex items-start">
                      <Mail className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                        <p className="mt-1">
                          <a 
                            href={`mailto:${currentContact.email}`} 
                            className="text-green-700 hover:underline"
                          >
                            {currentContact.email}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {currentContact.phone && (
                    <div className="flex items-start">
                      <Phone className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Phone</h4>
                        <p className="mt-1">
                          <a 
                            href={`tel:${currentContact.phone}`} 
                            className="text-green-700 hover:underline"
                          >
                            {formatPhone(currentContact.phone)}
                          </a>
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {currentContact.location && (
                    <div className="flex items-start">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Location</h4>
                        <p className="mt-1">{currentContact.location}</p>
                      </div>
                    </div>
                  )}
                  
                  {currentContact.message && (
                    <div className="flex items-start">
                      <MessageSquare className="w-5 h-5 text-gray-400 mt-0.5 mr-3" />
                      <div>
                        <h4 className="text-sm font-medium text-gray-500">Message</h4>
                        <p className="mt-1 text-gray-700 whitespace-pre-line">{currentContact.message}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end mt-6 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    closeAllModals();
                    openEditModal(currentContact);
                  }}
                  className="px-4 py-2 bg-green-700 text-white rounded-md flex items-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Contact
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContactsPage;