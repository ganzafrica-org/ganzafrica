"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Briefcase,
  Building,
  GraduationCap,
  Award,
  Bookmark,
  Library,
  Globe,
  Mail,
  Phone,
  Users,
  FileText,
  ExternalLink,
  Share2,
  Heart,
  AlertCircle,
  Loader2,
  CheckCircle,
  DollarSign
} from 'lucide-react';

// Create an axios instance with retry configuration
const axiosInstance = axios.create({
  timeout: 10000,
});

// Add a retry interceptor
axiosInstance.interceptors.response.use(undefined, async (err) => {
  const { config, response } = err;
  
  if ((response && response.status === 429) || !response) {
    const maxRetries = 3;
    config.retryCount = config.retryCount || 0;
    
    if (config.retryCount < maxRetries) {
      config.retryCount += 1;
      const delay = Math.pow(2, config.retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return axiosInstance(config);
    }
  }
  
  return Promise.reject(err);
});

// Map category_id to icon components
const getCategoryIcon = (categoryId) => {
  switch (parseInt(categoryId)) {
    case 1:
      return <Briefcase className="h-5 w-5" />;
    case 2:
      return <Award className="h-5 w-5" />;
    case 3:
      return <GraduationCap className="h-5 w-5" />;
    case 4:
      return <Bookmark className="h-5 w-5" />;
    case 5:
      return <Library className="h-5 w-5" />;
    default:
      return <Briefcase className="h-5 w-5" />;
  }
};

// Function to generate a color class based on category
const getCategoryColorClass = (categoryId) => {
  switch (parseInt(categoryId)) {
    case 1: // Internship
      return "bg-blue-100 text-blue-800";
    case 2: // Grant
      return "bg-green-100 text-green-800";
    case 3: // Fellowship
      return "bg-purple-100 text-purple-800";
    case 4: // Scholarship
      return "bg-yellow-100 text-yellow-800";
    case 5: // Training Program
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Get category name from category_id
const getCategoryName = (categoryId, categories) => {
  return categories[categoryId] || 'Other';
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

// Calculate days remaining
const getDaysRemaining = (deadlineString) => {
  if (!deadlineString) return 'No deadline';
  
  const deadline = new Date(deadlineString);
  const today = new Date();
  
  // Set time to midnight for both dates for accurate day calculation
  deadline.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return 'Expired';
  } else if (diffDays === 0) {
    return 'Closes today';
  } else if (diffDays === 1) {
    return '1 day left';
  } else {
    return `${diffDays} days left`;
  }
};

// Function to generate logo placeholder based on title
const getLogoPlaceholder = (title) => {
  if (!title) return "OI";
  
  const words = title.split(' ');
  if (words.length === 1) {
    return title.substring(0, 2).toUpperCase();
  }
  
  return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
};

const OpportunityDetailsPage = ({ params }) => {
  const router = useRouter();
  const opportunityId = params?.id;
  
  // State for opportunity details
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState({});
  const [isFavorite, setIsFavorite] = useState(false);
  
  // Set default categories
  useEffect(() => {
    setCategories({
      1: 'Internship',
      2: 'Grant',
      3: 'Fellowship',
      4: 'Scholarship',
      5: 'Training Program'
    });
  }, []);
  
  // Fetch opportunity details
  useEffect(() => {
    const fetchOpportunity = async () => {
      if (!opportunityId) {
        setError('Opportunity ID is required');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        // In a real app, this would fetch from your API endpoint
        const response = await axiosInstance.get(`/api/opportunities/${opportunityId}`);
        
        if (response.data && response.data.opportunity) {
          setOpportunity(response.data.opportunity);
        } else {
          setError('Failed to load opportunity details');
        }
      } catch (err) {
        console.error('Error fetching opportunity:', err);
        setError('Failed to load opportunity. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOpportunity();
  }, [opportunityId]);
  
  // Toggle favorite status
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // In a real app, you would call an API to save this preference
  };
  
  // Share opportunity
  const shareOpportunity = () => {
    if (navigator.share) {
      navigator.share({
        title: opportunity?.title || 'Opportunity',
        text: opportunity?.short_description || 'Check out this opportunity',
        url: window.location.href,
      }).catch((error) => console.log('Error sharing', error));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Link copied to clipboard!'))
        .catch((err) => console.error('Could not copy link: ', err));
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 text-green-600 animate-spin" />
        <span className="ml-3 text-lg text-green-700">Loading opportunity details...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
            <p className="text-red-700 text-lg">{error}</p>
          </div>
          <Link 
            href="/opportunities" 
            className="mt-4 inline-flex items-center text-green-600 hover:text-green-800"
          >
            <ArrowLeft className="mr-1 h-4 w-4" /> Back to opportunities
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto p-6">
        {/* Back button */}
        <Link 
          href="/opportunities" 
          className="inline-flex items-center text-green-600 hover:text-green-800 mb-6"
        >
          <ArrowLeft className="mr-1 h-4 w-4" /> Back to opportunities
        </Link>
        
        {/* Opportunity header card */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
          <div className="border-b border-gray-200 p-6">
            <div className="flex justify-between items-start">
              <div className="flex items-start">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-bold ${
                  opportunity?.category_id ? getCategoryColorClass(opportunity.category_id).replace('bg-', 'bg-').replace('text-', 'text-')
                  : 'bg-gray-200 text-gray-700'
                }`}>
                  {opportunity?.organization_logo 
                    ? <img src={opportunity.organization_logo} alt="Logo" className="w-12 h-12 object-contain" />
                    : getLogoPlaceholder(opportunity?.title)
                  }
                </div>
                <div className="ml-4">
                  <h1 className="text-2xl font-bold text-gray-900">{opportunity?.title}</h1>
                  <p className="text-gray-600 mt-1">{opportunity?.organization_name || 'Organization'}</p>
                  <div className="flex mt-2">
                    {opportunity?.category_id && (
                      <span className={`px-3 py-1 text-sm font-medium rounded-full mr-2 ${getCategoryColorClass(opportunity.category_id)}`}>
                        {getCategoryIcon(opportunity.category_id)}
                        <span className="ml-1">{getCategoryName(opportunity.category_id, categories)}</span>
                      </span>
                    )}
                    
                    {opportunity?.location_type && (
                      <span className="px-3 py-1 text-sm font-medium rounded-full bg-indigo-100 text-indigo-800 mr-2">
                        {opportunity.location_type}
                      </span>
                    )}
                    
                    {opportunity?.status && (
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                        opportunity.status === 'published' ? 'bg-green-100 text-green-800' :
                        opportunity.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        opportunity.status === 'archived' ? 'bg-purple-100 text-purple-800' :
                        opportunity.status === 'closed' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button 
                  onClick={toggleFavorite}
                  className={`p-2 rounded-full ${isFavorite ? 'bg-red-50 text-red-500' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500' : ''}`} />
                </button>
                <button 
                  onClick={shareOpportunity}
                  className="p-2 rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
                >
                  <Share2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          
          {/* Key details section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gray-50">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <Calendar className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Application Deadline</p>
                <p className="font-medium">{formatDate(opportunity?.application_deadline)}</p>
                <p className={`text-sm mt-1 ${
                  getDaysRemaining(opportunity?.application_deadline).includes('Expired') ? 'text-red-500' :
                  getDaysRemaining(opportunity?.application_deadline).includes('today') || 
                  getDaysRemaining(opportunity?.application_deadline).includes('1 day') ? 'text-orange-500' :
                  'text-green-600'
                }`}>
                  {getDaysRemaining(opportunity?.application_deadline)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <MapPin className="h-5 w-5 text-green-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium">{opportunity?.location || 'Not specified'}</p>
                {opportunity?.location_type && (
                  <p className="text-sm text-gray-500 mt-1">{opportunity.location_type}</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-2 mr-3">
                <DollarSign className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Compensation</p>
                {opportunity?.stipend_amount ? (
                  <p className="font-medium">${opportunity.stipend_amount} per month</p>
                ) : (
                  <p className="font-medium">Not specified</p>
                )}
              </div>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="p-6 border-t border-gray-200 flex justify-end">
            <Link 
              href={`/opportunities/${opportunityId}/apply`}
              className="px-6 py-2.5 bg-green-700 text-white rounded-md hover:bg-green-800 shadow-sm transition-colors duration-200 font-medium"
            >
              Apply Now
            </Link>
          </div>
        </div>
        
        {/* Main content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left column - Details */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">About the Opportunity</h2>
              <div className="prose max-w-none">
                {opportunity?.description ? (
                  <div dangerouslySetInnerHTML={{ __html: opportunity.description }} />
                ) : (
                  <p>{opportunity?.short_description || 'No description provided.'}</p>
                )}
              </div>
            </div>
            
            {/* Requirements */}
            {opportunity?.requirements && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Requirements</h2>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: opportunity.requirements }} />
                </div>
              </div>
            )}
            
            {/* Responsibilities */}
            {opportunity?.responsibilities && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Responsibilities</h2>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: opportunity.responsibilities }} />
                </div>
              </div>
            )}
            
            {/* Benefits */}
            {opportunity?.benefits && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">Benefits</h2>
                <div className="prose max-w-none">
                  <div dangerouslySetInnerHTML={{ __html: opportunity.benefits }} />
                </div>
              </div>
            )}
            
            {/* Apply button for bottom of page */}
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-600 mb-4">Ready to apply for this opportunity?</p>
              <Link 
                href={`/opportunities/${opportunityId}/apply`}
                className="px-10 py-3 bg-green-700 text-white rounded-md hover:bg-green-800 shadow-sm transition-colors duration-200 font-medium"
              >
                Apply Now
              </Link>
            </div>
          </div>
          
          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Key dates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Key Dates</h3>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Posted on</p>
                    <p className="text-sm text-gray-600">{formatDate(opportunity?.created_at)}</p>
                  </div>
                </li>
                
                <li className="flex items-start">
                  <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Application Deadline</p>
                    <p className="text-sm text-gray-600">{formatDate(opportunity?.application_deadline)}</p>
                  </div>
                </li>
                
                {opportunity?.start_date && (
                  <li className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Start Date</p>
                      <p className="text-sm text-gray-600">{formatDate(opportunity.start_date)}</p>
                    </div>
                  </li>
                )}
                
                {opportunity?.end_date && (
                  <li className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">End Date</p>
                      <p className="text-sm text-gray-600">{formatDate(opportunity.end_date)}</p>
                    </div>
                  </li>
                )}
              </ul>
            </div>
            
            {/* Organization info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Organization Information</h3>
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 rounded-md flex items-center justify-center text-white font-bold ${
                  opportunity?.category_id ? getCategoryColorClass(opportunity.category_id).replace('bg-', 'bg-').replace('text-', 'text-')
                  : 'bg-gray-200 text-gray-700'
                }`}>
                  {opportunity?.organization_logo 
                    ? <img src={opportunity.organization_logo} alt="Logo" className="w-8 h-8 object-contain" />
                    : getLogoPlaceholder(opportunity?.organization_name || opportunity?.title)
                  }
                </div>
                <div className="ml-3">
                  <p className="font-medium">{opportunity?.organization_name || 'Organization'}</p>
                </div>
              </div>
              
              <ul className="space-y-3">
                {opportunity?.organization_website && (
                  <li className="flex items-start">
                    <Globe className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <a 
                      href={opportunity.organization_website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      Website <ExternalLink className="h-3 w-3 inline" />
                    </a>
                  </li>
                )}
                
                {opportunity?.contact_email && (
                  <li className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <a 
                      href={`mailto:${opportunity.contact_email}`}
                      className="text-sm text-blue-600 hover:underline"
                    >
                      {opportunity.contact_email}
                    </a>
                  </li>
                )}
                
                {opportunity?.contact_phone && (
                  <li className="flex items-start">
                    <Phone className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <a 
                      href={`tel:${opportunity.contact_phone}`}
                      className="text-sm text-gray-600"
                    >
                      {opportunity.contact_phone}
                    </a>
                  </li>
                )}
                
                {opportunity?.location && (
                  <li className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <p className="text-sm text-gray-600">{opportunity.location}</p>
                  </li>
                )}
              </ul>
            </div>
            
            {/* Application stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Application Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Applicants</span>
                  </div>
                  <span className="font-medium">{opportunity?.applicant_count || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Views</span>
                  </div>
                  <span className="font-medium">{opportunity?.view_count || 0}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-600">Time Left</span>
                  </div>
                  <span className={`text-sm font-medium ${
                    getDaysRemaining(opportunity?.application_deadline).includes('Expired') ? 'text-red-600' :
                    getDaysRemaining(opportunity?.application_deadline).includes('today') || 
                    getDaysRemaining(opportunity?.application_deadline).includes('1 day') ? 'text-orange-600' :
                    'text-green-600'
                  }`}>
                    {getDaysRemaining(opportunity?.application_deadline)}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Similar opportunities */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Similar Opportunities</h3>
              <p className="text-sm text-gray-500">More opportunities like this will appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityDetailsPage;