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
  RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import axios from 'axios';

// Create an axios instance with retry configuration
const axiosInstance = axios.create({
  // Set a timeout to avoid hanging requests
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
  delete: (url, config = {}) => {
    return axiosInstance.delete(url, config);
  }
};

const ApplicationsPage = () => {
  const router = useRouter();
  // State for the active tab
  const [activeTab, setActiveTab] = useState('all');
  
  // States for data and UI
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opportunities, setOpportunities] = useState({});
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

  // State for expanded opportunity
  const [expandedOpportunities, setExpandedOpportunities] = useState({});

  // Add state to track if tab counts are loaded
  const [tabCountsLoaded, setTabCountsLoaded] = useState(false);

  // State for dropdown menu
  const [openMenuId, setOpenMenuId] = useState(null);
  
  // Function to toggle dropdown menu
  const toggleMenu = (id) => {
    if (openMenuId === id) {
      setOpenMenuId(null);
    } else {
      setOpenMenuId(id);
    }
  };

  // Function to toggle expanded opportunity
  const toggleOpportunity = (opportunityId) => {
    setExpandedOpportunities(prev => ({
      ...prev,
      [opportunityId]: !prev[opportunityId]
    }));
  };

  // Function to handle action click
  const handleAction = async (action, applicationId, opportunityId) => {
    setOpenMenuId(null); // Close the menu
    
    switch(action) {
      case 'view':
        // Navigate to application details page
        router.push(`/applications/${applicationId}`);
        break;
      case 'viewOpportunity':
        // Navigate to opportunity details page
        router.push(`/opportunities/${opportunityId}`);
        break;
      case 'delete':
        if (window.confirm('Are you sure you want to delete this application?')) {
          try {
            await throttledAxios.delete(`http://localhost:3002/api/opportunities/applications/${applicationId}`);
            // Refresh the applications list after deletion
            const updatedPage = applications.length === 1 && page > 1 ? page - 1 : page;
            setPage(updatedPage);
          } catch (error) {
            console.error('Error deleting application:', error);
            alert('Failed to delete application. Please try again.');
          }
        }
        break;
      case 'update':
        // Navigate to update page
        router.push(`/applications/edit/${applicationId}`);
        break;
      case 'status':
        // Open status change modal/form
        console.log(`Change status for application ${applicationId}`);
        break;
      default:
        break;
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

  // Map opportunity IDs to titles - we'll populate this from API data
  useEffect(() => {
    // Initialize with an empty object instead of hardcoded values
    setOpportunities({});
  }, []);

  // Function to extract applications from the response
  const extractApplicationsFromResponse = (response) => {
    if (!response) return [];
    
    // If the response is already an array, return it
    if (Array.isArray(response)) {
      return response;
    }
    
    // If response.applications.items exists and is an array (matches your console output)
    if (response.applications && 
        response.applications.items && 
        Array.isArray(response.applications.items)) {
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

  // Get opportunity name and type from opportunity_id
  const getOpportunityInfo = (application) => {
    // Always prioritize opportunity_title from the application itself
    let name = application.opportunity_title || opportunities[application.opportunity_id] || 'Unknown Opportunity';
    
    // Determine if it's a fellowship or employee position based on title or other properties
    let type = '';
    
    if (name.toLowerCase().includes('fellowship') || 
        application.opportunity_type === 'fellowship' ||
        (application.custom_answers && Object.keys(application.custom_answers).length > 0)) {
      type = 'Fellowship';
    } else if (name.toLowerCase().includes('employee') || 
              name.toLowerCase().includes('position') || 
              application.opportunity_type === 'employee' ||
              name.toLowerCase().includes('job')) {
      type = 'Employee';
    }
    
    return { name, type };
  };

  // Group applications by opportunity
  const groupApplicationsByOpportunity = (applications) => {
    const grouped = {};
    applications.forEach(app => {
      const opportunityId = app.opportunity_id;
      if (!grouped[opportunityId]) {
        grouped[opportunityId] = [];
      }
      grouped[opportunityId].push(app);
    });
    return grouped;
  };

  // Get a summary of applications for an opportunity
  const getOpportunitySummary = (applications) => {
    if (!applications || applications.length === 0) return {};
    
    // Get the first application to get shared information
    const firstApp = applications[0];
    const opportunityInfo = getOpportunityInfo(firstApp);
    
    // Count applications by status
    const statusCounts = applications.reduce((counts, app) => {
      const status = mapStatusForUI(app.status);
      counts[status] = (counts[status] || 0) + 1;
      return counts;
    }, {});
    
    return {
      id: firstApp.opportunity_id,
      name: opportunityInfo.name,
      type: opportunityInfo.type,
      totalApplications: applications.length,
      statusCounts
    };
  };

  // Fetch tab counts using the current applications
  const fetchTabCounts = async () => {
    try {
      // Count applications by type
      let fellowshipCount = 0;
      let employeeCount = 0;
      const allCount = applications.length;
      
      applications.forEach(application => {
        const opportunityInfo = getOpportunityInfo(application);
        if (opportunityInfo.type === 'Fellowship') {
          fellowshipCount++;
        } else if (opportunityInfo.type === 'Employee') {
          employeeCount++;
        }
      });
      
      setTabCounts({
        all: allCount,
        fellowship: fellowshipCount,
        employee: employeeCount
      });
      
      setTabCountsLoaded(true);
    } catch (error) {
      console.error('Error calculating tab counts:', error);
      // Use default values in case of error
      setTabCounts({
        all: applications.length || 0,
        fellowship: 0,
        employee: 0
      });
      setTabCountsLoaded(true);
    }
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
    'withdrawn': 'rejected'
  };
  
  return statusMap[apiStatus] || 'pending';
};

// Filter applications based on active tab
const getFilteredApplications = () => {
  if (activeTab === 'all') {
    return applications;
  } else if (activeTab === 'fellowship') {
    return applications.filter(app => {
      const opportunityInfo = getOpportunityInfo(app);
      return opportunityInfo.type === 'Fellowship';
    });
  } else if (activeTab === 'employee') {
    return applications.filter(app => {
      const opportunityInfo = getOpportunityInfo(app);
      return opportunityInfo.type === 'Employee';
    });
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

// Get applicant name from API response
const getApplicantName = (application) => {
  return application.full_name || 'Unknown Applicant';
};

// Fetch applications from API with dependency on relevant state changes
useEffect(() => {
  const fetchApplications = async () => {
    try {
      setLoading(true);
      
      // Add a delay between requests to avoid rate limiting
      const lastRequestTime = window.lastApplicationFetchTime || 0;
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
      
      // We're no longer filtering by status on the API since we're filtering by type
      
      console.log('Fetching applications with params:', params);
      
      // Store the time of this request
      window.lastApplicationFetchTime = Date.now();
      
      // Make API request with throttled axios
      const response = await throttledAxios.get('http://localhost:3002/api/opportunities/applications', { 
          params 
      });
        
      console.log('API response:', response.data);
      
      // Extract the applications from the response using our helper function
      const applicationsData = extractApplicationsFromResponse(response.data);
      console.log('Extracted applications:', applicationsData);
      
      // Set the applications with processed data
      setApplications(applicationsData);
      
      // Update total count for pagination
      setTotalApplications(applicationsData.length);
      setTotalPages(Math.ceil(applicationsData.length / limit) || 1);
      
      // Update tab counts and opportunities map
      if (applicationsData.length > 0) {
        // Create a map of opportunities from the application data
        const opportunityMap = {...opportunities};
        applicationsData.forEach(app => {
          if (app.opportunity_id && app.opportunity_title && !opportunityMap[app.opportunity_id]) {
            opportunityMap[app.opportunity_id] = app.opportunity_title;
          }
        });
        
        // Only update opportunities if we have new data
        if (Object.keys(opportunityMap).length > Object.keys(opportunities).length) {
          setOpportunities(opportunityMap);
        }
        
        // Update the tab counts
        setTimeout(() => {
          fetchTabCounts();
        }, 0);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
      setError(`Failed to fetch applications: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  fetchApplications();
}, [page, limit, searchTerm, sortBy, sortOrder]);

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
          <div className="text-center py-4">Loading applications...</div>
        ) : error ? (
          <div className="text-center py-4 text-red-600">{error}</div>
        ) : !filteredApplications || filteredApplications.length === 0 ? (
          <div className="text-center py-4">No applications found</div>
        ) : (
          <table className="w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opportunity</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applications</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {(() => {
                // Group applications by opportunity
                const groupedApplications = groupApplicationsByOpportunity(filteredApplications);
                let rowIndex = 0;
                
                // Create an array from the grouped object to render
                return Object.entries(groupedApplications).map(([opportunityId, apps], index) => {
                  const opportunitySummary = getOpportunitySummary(apps);
                  const isExpanded = expandedOpportunities[opportunityId];
                  rowIndex++; // Increment for the main row
                  
                  return (
                    <React.Fragment key={opportunityId}>
                      {/* Main opportunity row */}
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getRowNumber(index)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <button 
                              onClick={() => toggleOpportunity(opportunityId)}
                              className="mr-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                              {isExpanded ? (
                                <ChevronRight className="w-4 h-4 transform rotate-90 transition-transform" />
                              ) : (
                                <ChevronRight className="w-4 h-4 transition-transform" />
                              )}
                            </button>
                            <div>
                              {opportunitySummary.name}
                              {opportunitySummary.type && (
                                <span className={`ml-2 text-xs font-medium px-2 py-0.5 rounded-full ${
                                  opportunitySummary.type === 'Fellowship' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {opportunitySummary.type}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex space-x-2">
                            <span className="bg-gray-200 px-2 py-0.5 rounded text-xs font-medium">
                              {opportunitySummary.totalApplications} Total
                            </span>
                            {opportunitySummary.statusCounts.pending > 0 && (
                              <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-medium">
                                {opportunitySummary.statusCounts.pending} Pending
                              </span>
                            )}
                            {opportunitySummary.statusCounts.approved > 0 && (
                              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">
                                {opportunitySummary.statusCounts.approved} Approved
                              </span>
                            )}
                            {opportunitySummary.statusCounts.rejected > 0 && (
                              <span className="bg-red-100 text-red-800 px-2 py-0.5 rounded text-xs font-medium">
                                {opportunitySummary.statusCounts.rejected} Rejected
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500 relative">
                          <button 
                            onClick={() => handleAction('viewOpportunity', null, opportunityId)}
                            className="text-green-600 hover:text-green-800 mr-2"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded applications */}
                      {isExpanded && (
                        <>
                          {/* Subheader row */}
                          <tr className="bg-gray-50">
                            <td className="px-4 py-2 text-xs font-medium text-gray-500">No.</td>
                            <td className="px-4 py-2 text-xs font-medium text-gray-500">Applicant</td>
                            <td className="px-4 py-2 text-xs font-medium text-gray-500">
                              <div className="flex justify-between">
                                <span>Email / Phone</span>
                                <span>Applied On</span>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-xs font-medium text-gray-500">Status / Actions</td>
                          </tr>
                          
                          {/* Application rows */}
                          {apps.map((application, appIndex) => (
                            <tr key={`${opportunityId}-${application.id}`} className="hover:bg-gray-100 border-t border-gray-100">
                              <td className="pl-10 pr-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                {appIndex + 1}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                {getApplicantName(application)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex justify-between">
                                  <div>
                                    <div>{application.email || 'N/A'}</div>
                                    <div className="text-gray-500">{application.phone || 'N/A'}</div>
                                  </div>
                                  <div className="text-gray-500">
                                    {formatDate(application.submission_date || application.created_at)}
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap">
                                <div className="flex items-center justify-between">
                                  <div>
                                    {mapStatusForUI(application.status) === 'approved' && (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                        • Approved
                                      </span>
                                    )}
                                    {mapStatusForUI(application.status) === 'rejected' && (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                        • Rejected
                                      </span>
                                    )}
                                    {mapStatusForUI(application.status) === 'pending' && (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                                        • Pending
                                      </span>
                                    )}
                                    {!['approved', 'rejected', 'pending'].includes(mapStatusForUI(application.status)) && (
                                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                                        • {application.status || 'Unknown'}
                                      </span>
                                    )}
                                  </div>
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
                        </>
                      )}
                    </React.Fragment>
                  );
                });
              })()}
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
    </div>
  </div>
);
};

export default ApplicationsPage;