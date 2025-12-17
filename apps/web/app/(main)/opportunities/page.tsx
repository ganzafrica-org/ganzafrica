"use client";

import { 
  Database,
  Laptop,
  Lightbulb,
  Rocket,
  Target,
  GraduationCap,
  Search,
  Briefcase
} from "lucide-react";
import { useState, useEffect, SetStateAction } from "react";
import HeaderBelt from "@/components/layout/headerBelt";
import { motion } from "framer-motion";
import Image from "next/image";
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import apiClient from "@/lib/api-client";

type Status = "published" | "closed";
type OpportunityType = "all" | "fellowship" | "employment";

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
const pendingRequests: Record<string, Promise<any>> = {};

const throttledAxios = {
  get: (url: string, config = {}) => {
    const key = `${url}${JSON.stringify((config as AxiosRequestConfig).params || {})}`;
    
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
  }
};

// Get icon based on opportunity type
const getOpportunityIcon = (type: string | undefined) => {
  switch (type?.toLowerCase()) {
    case 'fellowship':
      return <GraduationCap className="w-6 h-6" />;
    case 'internship':
      return <Laptop className="w-6 h-6" />;
    case 'employment':
      return <Briefcase className="w-6 h-6" />;
    case 'grant':
      return <Database className="w-6 h-6" />;
    case 'scholarship':
      return <Target className="w-6 h-6" />;
    case 'training program':
    case 'training':
      return <Lightbulb className="w-6 h-6" />;
    default:
      return <Rocket className="w-6 h-6" />;
  }
};

// Get color based on opportunity type
const getOpportunityColor = (type: string | undefined) => {
  switch (type?.toLowerCase()) {
    case 'fellowship':
      return "#045f3c";
    case 'internship':
      return "primary-green";
    case 'employment':
      return "primary-green";
    case 'grant':
      return "#16a34a";
    case 'scholarship':
      return "#eab308";
    case 'training program':
    case 'training':
      return "#dc2626";
    default:
      return "#6366f1";
  }
};

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const styles = `
  @keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes slide-up {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  .animate-fade-in {
    animation: fade-in 1s ease-out;
  }
  
  .animate-slide-up {
    animation: slide-up 1s ease-out;
  }
`;

export default function OpportunitiesPage() {
  const params = useParams();
  const locale = params.locale || 'en';
  const [selectedStatus, setSelectedStatus] = useState<Status>("published");
  const [selectedType, setSelectedType] = useState<OpportunityType>("all");
  const [searchTerm, setSearchTerm] = useState('');
  
  // States for data and loading
  interface Opportunity {
    id: string;
    title: string;
    location?: string;
    status: Status;
    type?: string;
    description?: string;
    eligibility_criteria?: {
      requirements?: string;
    };
    duration?: string;
    application_deadline?: string;
    employment_type?: string;
  }
  
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch opportunities from API
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);

        // Make API request to get all opportunities
        const response = await apiClient.get('/opportunities');
        console.log('API response:', response.data);

        let allOpportunities = [];

        // Handle different response structures
        if (response.data && Array.isArray(response.data)) {
          allOpportunities = response.data;
        } else if (response.data && Array.isArray(response.data.opportunities)) {
          allOpportunities = response.data.opportunities;
        } else if (response.data && typeof response.data === 'object') {
          // Handle case where it's an object with opportunity data
          allOpportunities = Object.values(response.data);
        }

        // Filter opportunities to only include those with types 'fellowship' or 'employment'
        // and status 'published' or 'closed'
        const filteredOpportunities = allOpportunities.filter((opp: any) => {
          // Check if the opportunity is of the correct type
          const validType = opp.type && 
            (opp.type.toLowerCase() === 'fellowship' || 
             opp.type.toLowerCase() === 'employment' ||
             opp.type.toLowerCase() === 'internship' ||
             (opp.employment_type && typeof opp.employment_type === 'string'));

          // Check if the opportunity has the correct status
          const validStatus = opp.status && 
            (opp.status.toLowerCase() === 'published' || 
             opp.status.toLowerCase() === 'closed');

          return validType && validStatus;
        });

        console.log('Filtered opportunities:', filteredOpportunities);
        setOpportunities(filteredOpportunities);
        setError(null);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        setError('Failed to fetch opportunities. Please try again later.');
        setOpportunities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  // Filter opportunities by status and type based on user selection
  const filteredOpportunities = opportunities.filter(opportunity => {
    // Filter by status
    const statusMatch = opportunity.status && opportunity.status.toLowerCase() === selectedStatus.toLowerCase();
    
// Filter by type
let typeMatch = true;
if (selectedType !== "all") {
  if (selectedType === "fellowship") {
    typeMatch = opportunity.type?.toLowerCase() === "fellowship" || false;
  } else if (selectedType === "employment") {
    typeMatch = !!opportunity.type && 
      ["employment", "internship", "full-time", "part-time", "contract"].includes(opportunity.type.toLowerCase());
  }
}
    
    // Filter by search term
    const searchMatch = !searchTerm || 
      (opportunity.title && opportunity.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (opportunity.description && opportunity.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return statusMatch && typeMatch && searchMatch;
  });

  // Group opportunities by type for display sections
  const fellowshipOpportunities = filteredOpportunities.filter(
    opp => opp.type?.toLowerCase() === 'fellowship'
  );
  
  const employmentOpportunities = filteredOpportunities.filter(
    opp => ["employment", "internship", "full-time", "part-time", "contract"].includes((opp.type ?? "").toLowerCase())
  );

  // Format date for display
  const formatDate = (dateString: string | number | Date) => {
    if (!dateString) return 'N/A';
    
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Handle search input change
  const handleSearchChange = (e: { target: { value: SetStateAction<string>; }; }) => {
    setSearchTerm(e.target.value);
  };
  
  // Handle search form submission
  const handleSearchSubmit = (e: { preventDefault: () => void; }) => {
    e.preventDefault();
  };

  return (
    <main className="min-h-screen bg-white font-rubik">
      <style jsx global>{styles}</style>
      {/* Hero Section */}
      <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/form.jpg"
            alt="Opportunities"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 z-0"></div>

        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
        <motion.h1
            className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            OPPORTUNITIES
          </motion.h1>
          <motion.h2
            className="text-white text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Be part of a <span className=" font-normal">dynamic team</span> driving transformation
          </motion.h2>
          
        </div>
      </section>

      {/* Moving Text Belt */}
      <HeaderBelt />

      {/* Content with standard page margins */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4 shrink-0">
            <div className="bg-white rounded-xl p-4 sticky top-4 border border-gray-200 shadow-sm">
              <div className="space-y-6">
                {/* Search */}
                <div className="mb-4">
                  <form onSubmit={handleSearchSubmit}>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Search className="w-4 h-4 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        className="bg-gray-50 border border-gray-100 text-white text-sm rounded-md block w-full pl-10 p-2.5"
                        placeholder="Search opportunities"
                        value={searchTerm}
                        onChange={handleSearchChange}
                      />
                    </div>
                  </form>
                </div>
                
                {/* Status Filter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Filter by Status</h4>
                  <div className="flex flex-col gap-2">
                    {["published", "closed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status as Status)}
                        className={`px-4 py-1.5 rounded-full border text-sm transition-all ${
                          selectedStatus === status
                            ? "border-[#045f3c] bg-[#045f3c]/10 text-[#045f3c] font-medium"
                            : "border-gray-200 hover:border-[#045f3c] hover:bg-[#045f3c]/5 text-gray-600 hover:text-[#045f3c]"
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Type Filter */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Filter by Type</h4>
                  <div className="flex flex-col gap-2">
                    {["all", "fellowship", "employment"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type as OpportunityType)}
                        className={`px-4 py-1.5 rounded-full border text-sm transition-all ${
                          selectedType === type
                            ? "border-[#045f3c] bg-[#045f3c]/10 text-[#045f3c] font-medium"
                            : "border-gray-200 hover:border-[#045f3c] hover:bg-[#045f3c]/5 text-gray-600 hover:text-[#045f3c]"
                        }`}
                      >
                        {type === "all" 
                          ? "All Types" 
                          : type.charAt(0).toUpperCase() + type.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#045f3c]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg text-center">
                {error}
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
                <div className="text-gray-500 text-lg">No current openings, please check back later</div>
                <p className="text-gray-400 mt-2">We also list opportunities on our social media platforms.</p>
              </div>
            ) : (
              <div className="space-y-16">
                {/* Fellowship Opportunities Section */}
                {fellowshipOpportunities.length > 0 && (
                  <section id="fellowship" className="mb-16">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold">
                        <span className="text-black">Fellowship </span>
                        <span className="text-[#045f3c]">Programs</span>
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {fellowshipOpportunities.map((opportunity) => (
                        <div key={opportunity.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: getOpportunityColor('fellowship') + '20', color: getOpportunityColor('fellowship') }}>
                                  {getOpportunityIcon('fellowship')}
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">{opportunity.title}</h3>
                                  <p className="text-sm text-gray-500">{opportunity.location || 'Remote'}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                opportunity.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                              }`}>
                                {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-6 line-clamp-3">{opportunity.description || 'No description available'}</p>
                            
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
                              <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                                {(opportunity.eligibility_criteria?.requirements?.split('\n').filter(req => req.trim()) || ['No specific requirements listed']).slice(0, 3).map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                                {(opportunity.eligibility_criteria?.requirements?.split('\n').filter(req => req.trim()) || []).length > 3 && (
                                  <li>And more...</li>
                                )}
                              </ul>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                Duration: {opportunity.duration || 'Variable'}
                              </span>
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-50 text-primary-green border border-purple-100">
                                Deadline: {opportunity.application_deadline ? formatDate(opportunity.application_deadline) : 'Ongoing'}
                              </span>
                            </div>
                            
                            <div className="flex space-x-3">
                              <Link
                                href={`/${locale}/opportunities/${opportunity.id}`}
                                className="flex-1 py-2 px-4 bg-white border border-primary-green text-primary-green font-medium rounded-md text-center hover:bg-[#2563eb]/5 transition-colors"
                              >
                                View Details
                              </Link>
                              {opportunity.status === 'published' ? (
                                <Link 
                                  href={`/${locale}/opportunities/${opportunity.id}/apply`}
                                  className="flex-1 py-2 px-4 bg-primary-green text-white font-medium rounded-md text-center hover:primary-green transition-colors"
                                >
                                  Apply Now
                                </Link>
                              ) : (
                                <span className="flex-1 py-2 px-4 bg-gray-300 text-gray-600 font-medium rounded-md text-center cursor-not-allowed">
                                  Applications Closed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Employment Opportunities Section */}
                {employmentOpportunities.length > 0 && (
                  <section id="employment" className="mb-16">
                    <div className="text-center mb-12">
                      <h2 className="text-3xl font-bold">
                        <span className="text-black">Employment </span>
                        <span className="text-primary-green">Opportunities</span>
                      </h2>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                      {employmentOpportunities.map((opportunity) => (
                        <div key={opportunity.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center">
                                <div className="flex items-center justify-center w-12 h-12 rounded-full mr-4" style={{ backgroundColor: getOpportunityColor(opportunity.type) + '20', color: getOpportunityColor(opportunity.type) }}>
                                  {getOpportunityIcon(opportunity.type)}
                                </div>
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">{opportunity.title}</h3>
                                  <p className="text-sm text-gray-500">{opportunity.location || 'Remote'}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                opportunity.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                              }`}>
                                {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 mb-6 line-clamp-3">{opportunity.description || 'No description available'}</p>
                            
                            <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Requirements:</h4>
                              <ul className="text-sm text-gray-600 space-y-1 pl-5 list-disc">
                                {(opportunity.eligibility_criteria?.requirements?.split('\n').filter(req => req.trim()) || ['No specific requirements listed']).slice(0, 3).map((req, index) => (
                                  <li key={index}>{req}</li>
                                ))}
                                {(opportunity.eligibility_criteria?.requirements?.split('\n').filter(req => req.trim()) || []).length > 3 && (
                                  <li>And more...</li>
                                )}
                              </ul>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 mb-6">
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                                {opportunity.employment_type || opportunity.type || 'Job'}
                              </span>
                              <span className="px-3 py-1 text-xs font-medium rounded-full bg-purple-50 text-primary-green border border-purple-100">
                                Deadline: {opportunity.application_deadline ? formatDate(opportunity.application_deadline) : 'Ongoing'}
                              </span>
                            </div>
                            
                            <div className="flex space-x-3">
                              <Link
                                href={`/${locale}/opportunities/${opportunity.id}`}
                                className="flex-1 py-2 px-4 bg-white border border-primary-green text-primary-green font-medium rounded-md text-center hover:bg-[#2563eb]/5 transition-colors"
                              >
                                View Details
                              </Link>
                              {opportunity.status === 'published' ? (
                                <Link 
                                  href={`/${locale}/opportunities/${opportunity.id}/apply`}
                                  className="flex-1 py-2 px-4 bg-primary-green text-white font-medium rounded-md text-center hover:bg-primary-green transition-colors"
                                >
                                  Apply Now
                                </Link>
                              ) : (
                                <span className="flex-1 py-2 px-4 bg-gray-300 text-gray-600 font-medium rounded-md text-center cursor-not-allowed">
                                  Applications Closed
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}