"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Search, MoreHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Eye, Trash, Plus, X, Mail, CheckCircle, AlertCircle, Clock, ToggleLeft, ToggleRight, Download, Calendar, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
const NewsletterSubscribersPage = () => {
    const router = useRouter();
    // States for data and UI
    const [subscribers, setSubscribers] = useState([]);
    const [loading, setLoading] = useState(true);
    // States for pagination and filtering
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalSubscribers, setTotalSubscribers] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('subscribed_at');
    const [sortOrder, setSortOrder] = useState('desc');
    const [activeOnly, setActiveOnly] = useState(true);
    // States for modal popups
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [currentSubscriber, setCurrentSubscriber] = useState(null);
    // State for dropdown menu
    const [openMenuId, setOpenMenuId] = useState(null);
    // States for form data
    const [formData, setFormData] = useState({
        email: '',
        is_active: true
    });
    // States for form errors and success
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    // Function to toggle dropdown menu
    const toggleMenu = (id) => {
        if (openMenuId === id) {
            setOpenMenuId(null);
        }
        else {
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
    // Fetch subscribers from API with dependency on relevant state changes
    useEffect(() => {
        const fetchSubscribers = async () => {
            try {
                setLoading(true);
                // Build query params
                const params = {
                    page,
                    limit,
                    sort_by: sortBy,
                    sort_order: sortOrder,
                    active_only: activeOnly.toString()
                };
                // Add optional filters if they exist
                if (searchTerm)
                    params.search = searchTerm;
                // Make API request with apiClient
                const response = await apiClient.get('/newsletter/subscribers', { params });
                if (response.data) {
                    // Parse the response data based on structure
                    let subscribersData = [];
                    if (Array.isArray(response.data)) {
                        subscribersData = response.data;
                        setTotalSubscribers(response.data.length);
                        setTotalPages(Math.ceil(response.data.length / limit));
                    }
                    else if (response.data.subscribers && Array.isArray(response.data.subscribers)) {
                        subscribersData = response.data.subscribers;
                        // Extract pagination info if available
                        const pagination = response.data.pagination || {};
                        setTotalSubscribers(pagination.total || subscribersData.length);
                        setTotalPages(pagination.pages || Math.ceil(subscribersData.length / limit));
                    }
                    setSubscribers(subscribersData);
                }
            }
            catch (error) {
                console.error('Error fetching subscribers:', error);
                setSubscribers([]);
            }
            finally {
                setLoading(false);
            }
        };
        fetchSubscribers();
    }, [page, limit, searchTerm, sortBy, sortOrder, activeOnly]);
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
            email: '',
            is_active: true
        });
        setFormError('');
        setFormSuccess('');
    };
    // Open add subscriber modal
    const openAddModal = () => {
        resetForm();
        setShowAddModal(true);
    };
    // Open edit subscriber modal
    const openEditModal = (subscriber) => {
        setCurrentSubscriber(subscriber);
        setFormData({
            email: subscriber.email || '',
            is_active: subscriber.is_active !== undefined ? subscriber.is_active : true
        });
        setOpenMenuId(null);
        setShowEditModal(true);
    };
    // Open delete subscriber modal
    const openDeleteModal = (subscriber) => {
        setCurrentSubscriber(subscriber);
        setOpenMenuId(null);
        setShowDeleteModal(true);
    };
    // Open view subscriber modal
    const openViewModal = (subscriber) => {
        setCurrentSubscriber(subscriber);
        setOpenMenuId(null);
        setShowViewModal(true);
    };
    // Close all modals
    const closeAllModals = () => {
        setShowAddModal(false);
        setShowEditModal(false);
        setShowDeleteModal(false);
        setShowViewModal(false);
        setCurrentSubscriber(null);
        resetForm();
    };
    // Handle form input change
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };
    // Handle add subscriber submission
    const handleAddSubscriber = async (e) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');
        try {
            // Validate form
            if (!formData.email) {
                setFormError('Email is required');
                return;
            }
            if (!validateEmail(formData.email)) {
                setFormError('Please enter a valid email address');
                return;
            }
            // Make API request
            await apiClient.post('/newsletter/subscribe', { email: formData.email });
            // Show success message
            setFormSuccess('Subscriber added successfully');
            // Reset form and close modal after a delay
            setTimeout(() => {
                closeAllModals();
                // Refresh subscribers list
                setPage(1);
            }, 1500);
        }
        catch (error) {
            console.error('Error adding subscriber:', error);
            setFormError(error.response?.data?.message || 'Failed to add subscriber. Please try again.');
        }
    };
    // Handle subscriber status toggle
    const handleStatusToggle = async (subscriber) => {
        try {
            if (subscriber.is_active) {
                // Unsubscribe
                await apiClient.post(`/newsletter/unsubscribe/${subscriber.id}`);
            }
            else {
                // Resubscribe (using the subscribe endpoint with the same email)
                await apiClient.post('/newsletter/subscribe', { email: subscriber.email });
            }
            // Refresh the list
            const updatedSubscribers = subscribers.map(sub => {
                if (sub.id === subscriber.id) {
                    return { ...sub, is_active: !sub.is_active };
                }
                return sub;
            });
            setSubscribers(updatedSubscribers);
        }
        catch (error) {
            console.error('Error toggling subscriber status:', error);
            // Optionally show an error notification
        }
    };
    // Handle delete subscriber
    const handleDeleteSubscriber = async () => {
        try {
            // For newsletter subscribers, we'll use unsubscribe first to mark as inactive
            if (currentSubscriber.is_active) {
                await apiClient.post(`/newsletter/unsubscribe/${currentSubscriber.id}`);
            }
            // Then we'll use a delete endpoint if it exists, or just remove from UI
            // Note: If your API doesn't have a permanent delete, you can just filter out the item here
            try {
                await apiClient.delete(`/
            newsletter/subscribers/${currentSubscriber.id}`);
            }
            catch (error) {
                // If delete endpoint doesn't exist, just continue and remove from UI
                console.warn('No delete endpoint available for subscribers, just removing from UI');
            }
            // Close modal
            closeAllModals();
            // Remove from state
            setSubscribers(subscribers.filter(sub => sub.id !== currentSubscriber.id));
        }
        catch (error) {
            console.error('Error deleting subscriber:', error);
            setFormError(error.response?.data?.message || 'Failed to delete subscriber. Please try again.');
        }
    };
    // Export subscribers to CSV
    const exportSubscribers = () => {
        // Create CSV content
        const headers = ['Email', 'Status', 'Subscribed Date', 'Unsubscribed Date'];
        const csvContent = subscribers.map(sub => {
            return [
                sub.email || '',
                sub.is_active ? 'Active' : 'Inactive',
                formatDate(sub.subscribed_at) || '',
                formatDate(sub.unsubscribed_at) || '',
            ].join(',');
        });
        // Combine headers and rows
        const csv = [headers.join(','), ...csvContent].join('\n');
        // Create download link
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    // Validate email format
    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString)
            return '-';
        const date = new Date(dateString);
        if (isNaN(date.getTime()))
            return '-';
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
        }
        else {
            // Set new field and default to ascending
            setSortBy(field);
            setSortOrder('asc');
        }
    };
    // Toggle active only filter
    const toggleActiveOnly = () => {
        setActiveOnly(!activeOnly);
        setPage(1); // Reset to first page
    };
    return (<div className="p-6 max-w-full">
      {/* Header with title and buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Newsletter Subscribers</h1>
          <p className="text-gray-500 text-sm">Manage your newsletter subscribers</p>
        </div>
        <div className="flex space-x-3">
          <button onClick={exportSubscribers} className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
            <Download className="w-4 h-4 mr-2"/>
            Export CSV
          </button>
          <button onClick={openAddModal} className="flex items-center px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800">
            Add Subscriber
            <Plus className="w-4 h-4 ml-2"/>
          </button>
        </div>
      </div>

      {/* Search and filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold">Newsletter Subscribers</h2>
          <div className="flex items-center">
            <div className="mr-4 flex items-center">
              <label className="mr-2 text-sm text-gray-600">Show active only</label>
              <button onClick={toggleActiveOnly} className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors duration-300 focus:outline-none ${activeOnly ? 'bg-green-600' : 'bg-gray-300'}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${activeOnly ? 'translate-x-5' : 'translate-x-0'}`}></div>
              </button>
            </div>
            <div className="relative w-64">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500"/>
              </div>
              <form onSubmit={handleSearchSubmit}>
                <input type="text" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg block w-full pl-10 p-2.5" placeholder="Search by email..." value={searchTerm} onChange={handleSearchChange}/>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Subscribers table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (<div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading subscribers...</p>
            </div>) : subscribers.length === 0 ? (<div className="text-center py-8">
              <p className="text-gray-500">No subscribers found</p>
              <button onClick={openAddModal} className="mt-4 px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800">
                Add your first subscriber
              </button>
            </div>) : (<table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('email')}>
                    Email
                    {sortBy === 'email' && (<span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>)}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('is_active')}>
                    Status
                    {sortBy === 'is_active' && (<span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>)}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('subscribed_at')}>
                    Subscribed Date
                    {sortBy === 'subscribed_at' && (<span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>)}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSortChange('unsubscribed_at')}>
                    Unsubscribed Date
                    {sortBy === 'unsubscribed_at' && (<span className="ml-1">{sortOrder === 'asc' ? '↑' : '↓'}</span>)}
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {subscribers.map((subscriber, index) => (<tr key={subscriber.id || index} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{getRowNumber(index)}</td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <a href={`mailto:${subscriber.email}`} className="text-green-700 hover:underline flex items-center">
                        {subscriber.email}
                        <Mail className="w-3 h-3 ml-1"/>
                      </a>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${subscriber.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'}`}>
                        {subscriber.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(subscriber.subscribed_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(subscriber.unsubscribed_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                      <div className="flex items-center space-x-2">
                        <button className={`p-1 rounded-full ${subscriber.is_active ? 'text-green-600 hover:bg-green-100' : 'text-gray-400 hover:bg-gray-100'}`} onClick={() => handleStatusToggle(subscriber)} title={subscriber.is_active ? 'Unsubscribe' : 'Resubscribe'}>
                          {subscriber.is_active ? <ToggleRight className="w-5 h-5"/> : <ToggleLeft className="w-5 h-5"/>}
                        </button>
                        
                        <button className="text-gray-500 hover:text-gray-700" onClick={() => toggleMenu(subscriber.id)}>
                          <MoreHorizontal className="w-5 h-5"/>
                        </button>
                      </div>
                      
                      {/* Dropdown menu */}
                      {openMenuId === subscriber.id && (<div ref={menuRef} className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <button onClick={() => openViewModal(subscriber)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            <Eye className="w-4 h-4 mr-2"/>
                            View details
                          </button>
                          <button onClick={() => handleStatusToggle(subscriber)} className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                            {subscriber.is_active
                        ? <><ToggleLeft className="w-4 h-4 mr-2"/>Unsubscribe</>
                        : <><ToggleRight className="w-4 h-4 mr-2"/>Resubscribe</>}
                          </button>
                          <button onClick={() => openDeleteModal(subscriber)} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">
                            <Trash className="w-4 h-4 mr-2"/>
                            Delete
                          </button>
                        </div>)}
                    </td>
                  </tr>))}
              </tbody>
            </table>)}
        </div>

        {/* Pagination */}
        {subscribers.length > 0 && (<div className="flex items-center justify-between p-4 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Showing {subscribers.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, totalSubscribers)} out of {totalSubscribers} entries
            </div>
            <div className="flex items-center space-x-1">
              <button className="p-2 text-gray-500 rounded hover:bg-gray-100" onClick={() => goToPage(1)} disabled={page === 1}>
                <ChevronsLeft className="w-4 h-4"/>
              </button>
              <button className="p-2 text-gray-500 rounded hover:bg-gray-100" onClick={() => goToPage(Math.max(1, page - 1))} disabled={page === 1}>
                <ChevronLeft className="w-4 h-4"/>
              </button>
              
              {/* Display page numbers */}
              {[...Array(Math.min(totalPages, 3))].map((_, index) => {
                const pageNumber = page <= 2 ? index + 1 : page - 1 + index;
                if (pageNumber <= totalPages) {
                    return (<button key={pageNumber} onClick={() => goToPage(pageNumber)} className={`p-2 w-8 h-8 rounded-md ${pageNumber === page
                            ? 'bg-green-700 text-white'
                            : 'hover:bg-gray-100 text-gray-700'} flex items-center justify-center`}>
                      {pageNumber}
                    </button>);
                }
                return null;
            })}
              
              <button className="p-2 text-gray-500 rounded hover:bg-gray-100" onClick={() => goToPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                <ChevronRight className="w-4 h-4"/>
              </button>
              <button className="p-2 text-gray-500 rounded hover:bg-gray-100" onClick={() => goToPage(totalPages)} disabled={page === totalPages}>
                <ChevronsRight className="w-4 h-4"/>
              </button>
            </div>
          </div>)}
      </div>

      {/* Add Subscriber Modal */}
      {showAddModal && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">Add New Subscriber</h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <form onSubmit={handleAddSubscriber} className="p-6">
              {/* Form Error */}
              {formError && (<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"/>
                  <span>{formError}</span>
                </div>)}
              
              {/* Form Success */}
              {formSuccess && (<div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-md flex items-start">
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5"/>
                  <span>{formSuccess}</span>
                </div>)}
              
              {/* Email */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full p-2 border border-gray-300 rounded-md" placeholder="email@example.com" required/>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={closeAllModals} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-green-700 text-white rounded-md">
                  Add Subscriber
                </button>
              </div>
            </form>
          </div>
        </div>)}

      {/* View Subscriber Modal */}
      {showViewModal && currentSubscriber && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex justify-between items-center border-b px-6 py-4">
              <h3 className="text-lg font-medium">Subscriber Details</h3>
              <button onClick={closeAllModals} className="text-gray-400 hover:text-gray-500">
                <X className="w-5 h-5"/>
              </button>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-700 mb-2">
                  <UserPlus className="h-8 w-8"/>
                </div>
                <h2 className="text-xl font-bold">{currentSubscriber.email}</h2>
                <span className={`mt-2 px-3 py-1 inline-flex text-sm font-medium rounded-full ${currentSubscriber.is_active
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'}`}>
                {currentSubscriber.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5 mr-3"/>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Subscribed Date</h4>
                    <p className="mt-1 text-gray-700">{formatDate(currentSubscriber.subscribed_at)}</p>
                  </div>
                </div>

                {currentSubscriber.unsubscribed_at && (<div className="flex items-start">
                    <Clock className="w-5 h-5 text-gray-400 mt-0.5 mr-3"/>
                    <div>
                      <h4 className="text-sm font-medium text-gray-500">Unsubscribed Date</h4>
                      <p className="mt-1 text-gray-700">{formatDate(currentSubscriber.unsubscribed_at)}</p>
                    </div>
                  </div>)}
                
                {/* Additional metadata fields could be added here */}
              </div>
            </div>
            
            <div className="flex justify-end mt-6 pt-4 border-t">
              <button type="button" onClick={() => handleStatusToggle(currentSubscriber)} className={`mr-3 px-4 py-2 border rounded-md flex items-center ${currentSubscriber.is_active
                ? 'border-gray-300 text-gray-700'
                : 'border-green-300 text-green-700'}`}>
                {currentSubscriber.is_active ? (<>
                    <ToggleLeft className="w-4 h-4 mr-2"/>
                    Unsubscribe
                  </>) : (<>
                    <ToggleRight className="w-4 h-4 mr-2"/>
                    Resubscribe
                  </>)}
              </button>
              
              <button type="button" onClick={() => {
                closeAllModals();
                openDeleteModal(currentSubscriber);
            }} className="px-4 py-2 bg-red-600 text-white rounded-md flex items-center">
                <Trash className="w-4 h-4 mr-2"/>
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>)}
    
    {/* Delete Subscriber Modal */}
    {showDeleteModal && currentSubscriber && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <Trash className="h-6 w-6 text-red-600"/>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Subscriber</h3>
            <p className="text-gray-500 mb-6">
              Are you sure you want to delete <span className="font-medium">{currentSubscriber.email}</span>? This action cannot be undone.
            </p>
            
            <div className="flex justify-center space-x-3">
              <button type="button" onClick={closeAllModals} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md">
                Cancel
              </button>
              <button type="button" onClick={handleDeleteSubscriber} className="px-4 py-2 bg-red-600 text-white bg-red rounded-md">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>)}
  </div>);
};
export default NewsletterSubscribersPage;
