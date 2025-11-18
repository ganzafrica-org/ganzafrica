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
  RefreshCw,
  CheckCircle,
  XCircle,
  Clock,
  ClipboardList,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";

const ApplicationsPage = () => {
  const router = useRouter();
  // State for the active tab
  const [activeTab, setActiveTab] = useState('all');

  // States for data and UI
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for pagination and filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalApplications, setTotalApplications] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // States for tab counts
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    'fellowship': 0,
    'employee': 0
  });

  // State for dropdown menu
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // State for status update modal
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  // State for delete confirmation dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [applicationToDelete, setApplicationToDelete] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Function to toggle dropdown menu
  const toggleMenu = (id) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
    }
  };

  // Open status update modal
  const openStatusUpdateModal = (application) => {
    setSelectedApplication(application);
    setNewStatus(application.status || 'pending');
    setShowStatusModal(true);
    setOpenMenuId(null);
  };

  // Function to update application status
  const updateApplicationStatus = async () => {
    if (!selectedApplication || !newStatus) return;
    
    try {
      setLoading(true);
      
      const response = await apiClient.put(
        `/applications/${selectedApplication.id}/status`,
        { status: newStatus }
      );
      
      // Update the application in the local state
      setApplications(prevApplications => 
        prevApplications.map(app => 
          app.id === selectedApplication.id 
            ? { ...app, status: newStatus }
            : app
        )
      );
      
      toast.success(`Application status updated to ${newStatus}`);
      setShowStatusModal(false);
    } catch (error) {
      console.error('Error updating application status:', error);
      toast.error(`Failed to update status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to handle action click
  const handleAction = async (action, applicationId) => {
    setOpenMenuId(null); // Close the menu

    // Find the application object
    const application = applications.find(app => app.id === applicationId);

    switch(action) {
      case 'view':
        // Navigate to application details page
        router.push(`/applications/${applicationId}`);
        break;
      case 'delete':
        setApplicationToDelete(applicationId);
        setIsDeleteDialogOpen(true);
        break;
      case 'update':
        // Navigate to update page
        router.push(`/applications/edit/${applicationId}`);
        break;
      case 'status':
        if (application) {
          openStatusUpdateModal(application);
        }
        break;
      default:
        break;
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!applicationToDelete) return;

    try {
      setLoading(true);
      await apiClient.delete(`/applications/${applicationToDelete}`);
      
      // Close dialog and reset state
      setIsDeleteDialogOpen(false);
      setApplicationToDelete(null);
      
      // Show success toast
      toast.success('Application deleted successfully');
      
      // Trigger refresh by updating refreshTrigger
      setRefreshTrigger(prev => prev + 1);
      
      // Adjust page if needed (if we deleted the last item on the page)
      if (applications.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } catch (error: any) {
      console.error('Error deleting application:', error);
      toast.error(error.response?.data?.message || 'Failed to delete application. Please try again.');
      setIsDeleteDialogOpen(false);
      setApplicationToDelete(null);
    } finally {
      setLoading(false);
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
  const statusModalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
      
      if (statusModalRef.current && 
          !statusModalRef.current.contains(event.target) && 
          showStatusModal) {
        setShowStatusModal(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef, statusModalRef, showStatusModal]);

  // Function to extract applications from the response
  const extractApplicationsFromResponse = (response) => {
    if (!response) return [];

    // If the response is already an array, return it
    if (Array.isArray(response)) {
      return response;
    }

    // If response.applications exists and has items property that is an array
    if (response.applications && 
        response.applications.items && 
        Array.isArray(response.applications.items)) {
      // Also capture the pagination info
      if (response.applications.pagination) {
        setTotalApplications(response.applications.pagination.total || 0);
        setTotalPages(response.applications.pagination.pages || 1);
      }
      return response.applications.items;
    }

    // If response.items exists and is an array
    if (response.items && Array.isArray(response.items)) {
      return response.items;
    }

    // If response.applications exists and is an array
    if (response.applications && Array.isArray(response.applications)) {
      return response.applications;
    }

    // If response.data exists and is an array
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }

    // Last resort: look for any array property in the response
    for (const key in response) {
      if (Array.isArray(response[key])) {
        return response[key];
      }

      // Check one level deeper
      if (typeof response[key] === 'object' && response[key] !== null) {
        for (const nestedKey in response[key]) {
          if (Array.isArray(response[key][nestedKey])) {
            return response[key][nestedKey];
          }
        }
      }
    }

    // If none of the above worked and response is an object, wrap it in an array
    if (typeof response === 'object' && response !== null && !Array.isArray(response)) {
      return [response];
    }

    return [];
  };

  // Get applicant name from application
  const getApplicantName = (application) => {
    // Try different possible name field combinations
    if (application.full_name) {
      return application.full_name;
    }
    
    if (application.first_name && application.last_name) {
      return `${application.first_name} ${application.last_name}`;
    }
    
    if (application.name) {
      return application.name;
    }
    
    return 'Unknown Applicant';
  };

  // Set application type based on fields or explicit type
  const setApplicationType = (application) => {
    // Check for explicit type field
    if (application.type === 'fellowship') {
      return 'fellowship';
    } else if (application.type === 'employment' || application.type === 'employee') {
      return 'employee';
    }
    
    // Infer from other fields if no explicit type
    const fields = application.field_of_study || '';
    const motivation = application.motivation || '';
    
    if (
      motivation.toLowerCase().includes('fellowship') || 
      application.opportunity_title?.toLowerCase().includes('fellowship')
    ) {
      return 'fellowship';
    } else if (
      motivation.toLowerCase().includes('job') || 
      motivation.toLowerCase().includes('employment') || 
      application.opportunity_title?.toLowerCase().includes('job') ||
      application.opportunity_title?.toLowerCase().includes('employment')
    ) {
      return 'employee';
    }
    
    // Default to fellowship if we can't determine
    return 'fellowship';
  };

  // Get a count of applications by type
  const updateTabCounts = (applicationsData) => {
    let allCount = applicationsData.length;
    let fellowshipCount = 0;
    let employeeCount = 0;
    
    applicationsData.forEach(app => {
      const appType = setApplicationType(app);
      if (appType === 'fellowship') {
        fellowshipCount++;
      } else if (appType === 'employee') {
        employeeCount++;
      }
    });
    
    setTabCounts({
      all: allCount,
      fellowship: fellowshipCount,
      employee: employeeCount
    });
  };

  // Map API status to UI status
  const mapStatusForUI = (apiStatus) => {
    const statusMap = {
      'under_review': 'pending',
      'approved': 'approved',
      'rejected': 'rejected',
      'pending': 'pending',
      'waitlisted': 'pending',
      'shortlisted': 'pending',
      'withdrawn': 'rejected',
      'submitted': 'pending'
    };

    return statusMap[apiStatus] || 'pending';
  };

  // Filter applications based on active tab
  const getFilteredApplications = () => {
    if (activeTab === 'all') {
      return applications;
    } else if (activeTab === 'fellowship') {
      return applications.filter(app => setApplicationType(app) === 'fellowship');
    } else if (activeTab === 'employee') {
      return applications.filter(app => setApplicationType(app) === 'employee');
    }
    return applications;
  };

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

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1); // Reset to first page when changing tabs
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';

    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Refresh applications data
  const refreshApplications = () => {
    setLoading(true);
    fetchApplications();
  };

  // Fetch applications from API
  const fetchApplications = async () => {
    try {
      // Build query params
      const params = {
        page,
        limit,
        sort_by: sortBy,
        sort_order: sortOrder
      };

      // Add optional filters if they exist
      if (searchTerm) params.search = searchTerm;
      if (activeTab !== 'all') params.type = activeTab;

      console.log('Fetching applications with params:', params);

      // Make API request with apiClient
      const response = await apiClient.get('/applications', {
        params
      });

      console.log('API response:', response.data);

      // Extract the applications from the response using our helper function
      const applicationsData = extractApplicationsFromResponse(response.data);
      console.log('Extracted applications:', applicationsData);

      // Set the applications with processed data
      setApplications(applicationsData);

      // Update total count for pagination if not already set by extract function
      if (!response.data.applications?.pagination) {
        setTotalApplications(applicationsData.length);
        setTotalPages(Math.ceil(applicationsData.length / limit) || 1);
      }

      // Update tab counts with the applications data
      updateTabCounts(applicationsData);
      
      setError(null); // Clear any previous errors
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
      setError(`Failed to fetch applications: ${error.message}`);
      toast.error(`Error loading applications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch applications from API with dependency on relevant state changes
  useEffect(() => {
    fetchApplications();
  }, [page, limit, searchTerm, sortBy, sortOrder, activeTab, refreshTrigger]);

  const filteredApplications = getFilteredApplications();

  return (
    <div className="p-6 max-w-full">
      {/* Header with title and buttons */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Applications</h1>
          <p className="text-gray-500 text-sm">Applications List</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={refreshApplications}
            className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button className="flex items-center px-4 py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50">
            <ArrowUp className="w-4 h-4 mr-2" />
            Export Applications
          </button>
          <Link href="/applications/add-applications" className="flex items-center px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800">
            Make an Application
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </div>
      </div>

      {/*  Tabs  */}
      <div className='bg-white'>
        <div className="flex border-b border-gray-200 mb-6 bg-white">
          <button
            onClick={() => handleTabChange('all')}
            className={`py-3 px-4 text-sm font-medium relative ${
              activeTab === 'all'
                ? 'border-b-2 border-green-700 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Applications
            <span className="ml-2 bg-gray-200 px-2 py-0.5 rounded text-xs font-medium">{tabCounts.all}</span>
          </button>
          <button
            onClick={() => handleTabChange('fellowship')}
            className={`py-3 px-4 text-sm font-medium relative ${
              activeTab === 'fellowship'
                ? 'border-b-2 border-green-700 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Fellowship
            <span className="ml-2 bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs font-medium">{tabCounts.fellowship}</span>
          </button>
          <button
            onClick={() => handleTabChange('employee')}
            className={`py-3 px-4 text-sm font-medium relative ${
              activeTab === 'employee'
                ? 'border-b-2 border-green-700 text-green-700'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Employee
            <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs font-medium">{tabCounts.employee}</span>
          </button>
        </div>

        {/* Application list title */}
        <h2 className="text-lg font-bold mb-4">
          {activeTab === 'all' ? 'All Applications' : 
           activeTab === 'fellowship' ? 'Fellowship Applications' : 
           'Employee Applications'}
        </h2>

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

        {/* Applications table */}
        <div className="overflow-x-auto rounded-lg border border-gray-200 mb-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-green-700 rounded-full mb-4"></div>
              <p>Loading applications...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 px-4">
              <div className="text-red-600 mb-4">
                <XCircle className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-red-600 font-medium">{error}</p>
              <button 
                onClick={refreshApplications}
                className="mt-4 px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
              >
                Try Again
              </button>
            </div>
          ) : !filteredApplications || filteredApplications.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="text-gray-400 mb-4">
                <ClipboardList className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-xl font-medium mb-2">No applications found</p>
              <p className="text-gray-500 mb-6">
                {searchTerm 
                  ? "Try adjusting your search criteria" 
                  : activeTab !== 'all' 
                    ? `No ${activeTab} applications available`
                    : "There are no applications in the system yet"}
              </p>
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No.</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application Type</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submission Date</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplications.map((application, index) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getRowNumber(index)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {getApplicantName(application)}
                          </div>
                          <div className="text-sm text-gray-500">{application.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        setApplicationType(application) === 'fellowship' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {setApplicationType(application) === 'fellowship' ? 'Fellowship' : 'Employment'}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(application.submission_date || application.created_at)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div>
                        {mapStatusForUI(application.status) === 'approved' && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center inline-flex">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </span>
                        )}
                        {mapStatusForUI(application.status) === 'rejected' && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center inline-flex">
                            <XCircle className="w-3 h-3 mr-1" />
                            Rejected
                          </span>
                        )}
                        {mapStatusForUI(application.status) === 'pending' && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800 flex items-center inline-flex">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </span>
                        )}
                        {!['approved', 'rejected', 'pending'].includes(mapStatusForUI(application.status)) && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {application.status || 'Unknown'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                       
                      
                     
                        <div className="relative">
                          <button 
                            className="text-gray-500 hover:text-gray-700"
                            onClick={() => toggleMenu(application.id)}
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          
                          {/* Dropdown menu */}
                          {openMenuId === application.id && (
                            <div ref={menuRef} className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                              <button
                                onClick={() => handleAction('view', application.id)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View details
                              </button>
                              <button
                                onClick={() => handleAction('update', application.id)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Update
                              </button>
                              <button
                                onClick={() => handleAction('status', application.id)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Change status
                              </button>
                              <button
                                onClick={() => handleAction('delete', application.id)}
                                className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                              >
                                <Trash className="w-4 h-4 mr-2" />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
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
            Showing {filteredApplications.length > 0 ? ((page - 1) * limit) + 1 : 0} to {Math.min(page * limit, totalApplications)} out of {totalApplications} entries
          </div>
          <div className="flex items-center space-x-1">
            <button 
              className="p-2 text-gray-500 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => goToPage(1)}
              disabled={page === 1}
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button 
              className="p-2 text-gray-500 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => goToPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            {/* Display page numbers */}
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              // Show proper page numbers around current page
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (page <= 3) {
                pageNumber = index + 1;
              } else if (page >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = page - 2 + index;
              }
              
              if (pageNumber > 0 && pageNumber <= totalPages) {
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
              className="p-2 text-gray-500 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => goToPage(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || totalPages === 0}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              className="p-2 text-gray-500 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => goToPage(totalPages)}
              disabled={page === totalPages || totalPages === 0}
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 overflow-auto bg-black bg-opacity-50 flex items-center justify-center">
          <div ref={statusModalRef} className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Update Application Status</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application ID: {selectedApplication?.id}
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applicant: {getApplicantName(selectedApplication)}
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Status: 
                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                  mapStatusForUI(selectedApplication?.status) === 'approved' ? 'bg-green-100 text-green-800' :
                  mapStatusForUI(selectedApplication?.status) === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {selectedApplication?.status || 'Pending'}
                </span>
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Status:
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="waitlisted">Waitlisted</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={updateApplicationStatus}
                className="px-4 py-2 bg-green-700 rounded-md text-sm font-medium text-white hover:bg-green-800"
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              Delete Application
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this application? This action cannot be undone and will permanently delete the application and all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsDeleteDialogOpen(false);
              setApplicationToDelete(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#b91c1c')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
            >
              Delete Application
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ApplicationsPage;