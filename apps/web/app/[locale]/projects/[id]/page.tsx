"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Tag,
  Clock,
  CheckCircle,
  FileText,
  ImageIcon,
  Film,
  AlertCircle,
  Download,
  Users,
  Target,
  Award,
  XCircle,
  Building
} from 'lucide-react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';

// Define TypeScript interfaces for our data structures
interface Media {
  id: string;
  type: 'image' | 'video';
  url: string;
  caption?: string;
  title?: string;
  tag?: string;
  isExternalUrl?: boolean;
}

interface Goal {
  id: string;
  order: number;
  title: string;
  completed: boolean;
  description: string;
}

interface Outcome {
  id: string;
  order: number;
  title: string;
  status: string;
  description: string;
  metrics?: string[];
}

interface Member {
  id?: string | number;
  project_id?: number;
  user_id: number; // This is the key field we need
  role: string;
  image?: string;
  name?: string;
  start_date?: string | null;
  end_date?: string | null;
  is_active?: boolean;
  team?: {
    id: number;
    name: string;
    position?: string;
    photo_url?: string;
  };
}

interface Partner {
  id?: number;
  project_id?: number;
  partner_id: number;
  partner?: {
    id: number;
    name: string;
    logo?: string;
    website_url?: string;
    location?: string;
  };
}

interface Project {
  id: number;
  name: string;
  description: string;
  status: string;
  start_date: string;
  end_date: string;
  created_by: number;
  category_id: number;
  location: string;
  goals: {
    items: Goal[];
  };
  outcomes: {
    items: Outcome[];
  };
  media: {
    items: Media[];
  };
  other_information: string | null;
  created_at: string;
  updated_at: string;
  members: Member[];
  partners: Partner[];
}

interface Category {
  id: number | string;
  name: string;
  description?: string;
  icon?: string;
}

interface User {
  id: string;
  name: string;
  first_name?: string;
  last_name?: string;
}

const ProjectDetailsPage = () => {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState('details');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Improved function to handle image URLs with proper fallback
  const getValidImageSrc = (url: string | undefined): string => {
    if (!url || url.trim() === '') {
      return '/images/news/maize.avif'; // Default fallback image
    }
    return url;
  };

  // Fetch the project data
  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories first, before fetching the project
        try {
          const categoriesResponse = await apiClient.get('/categories');
          console.log("Categories response:", categoriesResponse.data);
          
          // Handle different possible API response formats
          if (categoriesResponse.data && Array.isArray(categoriesResponse.data.categories)) {
            setCategories(categoriesResponse.data.categories);
          } else if (Array.isArray(categoriesResponse.data)) {
            setCategories(categoriesResponse.data);
          } else if (categoriesResponse.data && typeof categoriesResponse.data === 'object') {
            // Handle case where response might be an object with category IDs as keys
            const categoryArray = Object.entries(categoriesResponse.data).map(([id, data]) => {
              const category = data as any;
              return {
                id: Number(id),
                name: category.name || `Category ${id}`
              };
            });
            setCategories(categoryArray);
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
          // Try alternate endpoint
          try {
            const altCategoriesResponse = await apiClient.get('/project-categories');
            if (altCategoriesResponse.data && Array.isArray(altCategoriesResponse.data)) {
              setCategories(altCategoriesResponse.data);
            }
          } catch (altError) {
            console.error('Error fetching from alternate categories endpoint:', altError);
          }
        }
        
        // Fetch project data
        const projectResponse = await apiClient.get(`/projects/${params.id}`);
        console.log("API Response:", projectResponse.data);
        
        // Check if the response has a nested project object or direct data
        let projectData;
        if (projectResponse.data && projectResponse.data.project) {
          console.log("Setting project from nested project object");
          projectData = projectResponse.data.project;
        } else if (projectResponse.data && projectResponse.data.id) {
          // Direct project object
          console.log("Setting project from direct response");
          projectData = projectResponse.data;
        } else {
          throw new Error("Invalid project data structure");
        }
        
        // Ensure members is always an array
        if (!projectData.members) {
          projectData.members = [];
        } else if (!Array.isArray(projectData.members)) {
          // If members is not an array, convert it
          console.log("Converting members to array format");
          projectData.members = Object.values(projectData.members);
        }
        
        // Ensure partners is always an array
        if (!projectData.partners) {
          projectData.partners = [];
        } else if (!Array.isArray(projectData.partners)) {
          console.log("Converting partners to array format");
          projectData.partners = Object.values(projectData.partners);
        }
        
        // Debug the members data
        console.log("Project members:", projectData.members);
        console.log("Project partners:", projectData.partners);
        
        // Make sure goals, outcomes and media are properly initialized
        if (!projectData.goals) projectData.goals = { items: [] };
        if (!projectData.outcomes) projectData.outcomes = { items: [] };
        if (!projectData.media) projectData.media = { items: [] };
        
        setProject(projectData);

        // Fetch users for member data
        try {
          const usersResponse = await apiClient.get('/users');
          if (usersResponse.data && Array.isArray(usersResponse.data)) {
            const usersData: User[] = usersResponse.data.map((user: { id: number; first_name: string; last_name: string }) => ({
              id: user.id.toString(),
              name: `${user.first_name || ''} ${user.last_name || ''}`.trim() || `User ${user.id}`,
              first_name: user.first_name,
              last_name: user.last_name
            }));
            setUsers(usersData);
          } else if (usersResponse.data && Array.isArray(usersResponse.data.users)) {
            // Alternative response format
            const usersData: User[] = usersResponse.data.users.map((user: { id: number; name?: string; first_name?: string; last_name?: string }) => ({
              id: user.id.toString(),
              name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || `User ${user.id}`,
              first_name: user.first_name,
              last_name: user.last_name
            }));
            setUsers(usersData);
          }
        } catch (error) {
          console.error('Error fetching users:', error);
        }

      } catch (error) {
        console.error('Error in project data fetching:', error);
        setError('Failed to load project details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjectData();
  }, [params.id]);

  // Format date for display
  const formatDate = (date: string | null | undefined): string => {
    if (!date) return 'Present';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get category name from category_id by directly inspecting the categories array
  const getCategoryName = (categoryId: number | undefined) => {
    if (!categoryId) return 'Not specified';
    
    console.log("Looking for category with ID:", categoryId);
    console.log("Available categories:", categories);
    
    // Try to find the category in the array with proper type handling
    if (categories && categories.length > 0) {
      const category = categories.find(cat => 
        Number(cat.id) === Number(categoryId)
      );
      
      if (category) {
        console.log("Found category:", category);
        return category.name;
      }
    }
    
    // Fallback to hardcoded values if needed
    const fallbackCategories: Record<number, string> = {
      1: 'Food system',
      2: 'Climate adaptation',
      3: 'Data & Evidence'
    };
    
    if (categoryId in fallbackCategories) {
      console.log("Using fallback category name");
      return fallbackCategories[categoryId];
    }
    
    // Last resort fallback
    return `Category ${categoryId}`;
  };

  // Get user name from user_id
  const getUserName = (userId: number | undefined) => {
    if (!userId) return 'Unknown';
    const user = users.find(u => u.id === userId.toString());
    return user ? user.name : `User ${userId}`;
  };

  // Get team member name
  const getTeamMemberName = (member: Member) => {
    if (member.team && member.team.name) {
      return member.team.name;
    }
    if (member.name) {
      return member.name;
    }
    return getUserName(member.user_id);
  };

  // Get partner name
  const getPartnerName = (partner: Partner) => {
    if (partner.partner && partner.partner.name) {
      return partner.partner.name;
    }
    return `Partner ${partner.partner_id}`;
  };

  // Get partner logo
  const getPartnerLogo = (partner: Partner) => {
    if (partner.partner && partner.partner.logo) {
      return partner.partner.logo;
    }
    return null;
  };

  // Extract team lead from project members
  const getTeamLead = () => {
    if (!project?.members) return null;
    const lead = project.members.find(member => member.role.toLowerCase().includes('lead'));
    return lead ? { name: getTeamMemberName(lead), role: lead.role } : null;
  };

  // Map status for display
  const getStatusBadge = (status: string | undefined) => {
    if (!status) return null;
    
    switch(status.toLowerCase()) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
            <Award className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">Completed</span>
          </span>
        );
      case 'planned':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">
            <Clock className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">Planned</span>
          </span>
        );
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
            <CheckCircle className="w-3 h-3 mr-1 flex-shrink-0" />
            <span className="truncate">Active</span>
          </span>
        );
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 truncate max-w-[100px]">• {status}</span>;
    }
  };

  // Get file size in readable format
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Render media item with proper error handling
  const renderMediaItem = (media: Media) => {
    return (
      <div key={media.id} className="relative aspect-video rounded-lg overflow-hidden">
        {media.type === 'image' ? (
          <img
            src={getValidImageSrc(media.url)}
            alt={media.title || 'Project media'}
            className="object-cover w-full h-full"
            onError={(e) => {
              e.currentTarget.src = '/images/news/maize.avif';
            }}
          />
        ) : (
          <div className="relative w-full h-full">
            <video
              src={media.url}
              controls
              className="w-full h-full object-cover"
              onError={(e) => {
                // Add fallback UI for video errors
                const parent = e.currentTarget.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <div class="w-full h-full flex items-center justify-center bg-gray-100">
                      <div class="text-center">
                        <div class="text-gray-400 mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                          </svg>
                        </div>
                        <p class="text-gray-500">Video could not be loaded</p>
                      </div>
                    </div>
                  `;
                }
              }}
            />
          </div>
        )}
        {media.caption && (
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-2 text-sm">
            <p className="truncate">{media.caption}</p>
          </div>
        )}
      </div>
    );
  };

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'planned':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getGoalStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_started':
      case 'not-started':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleThumbnailClick = (index: number) => {
    setActiveImageIndex(index);
  };

  const handlePrevImage = () => {
    if (!project?.media?.items) return;
    const nonFeaturedMedia = project.media.items.filter(item => item.tag !== 'feature');
    if (nonFeaturedMedia.length === 0) return;
    setActiveImageIndex(prev => (prev > 0 ? prev - 1 : nonFeaturedMedia.length - 1));
  };

  const handleNextImage = () => {
    if (!project?.media?.items) return;
    const nonFeaturedMedia = project.media.items.filter(item => item.tag !== 'feature');
    if (nonFeaturedMedia.length === 0) return;
    setActiveImageIndex(prev => (prev + 1) % nonFeaturedMedia.length);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-full flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-full">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>{error}</span>
          </div>
          <div className="mt-4">
            <Link href="/projects" className="text-red-700 font-medium hover:underline flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Debug output
  console.log("Current project state:", project);
  console.log("Available categories:", categories);
  console.log("Project category ID:", project?.category_id);
  console.log("Category name display:", getCategoryName(project?.category_id));
  
  if (!project) {
    return (
      <div className="p-6 max-w-full">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span>Project not found</span>
          </div>
          <div className="mt-4">
            <Link href="/projects" className="text-yellow-700 font-medium hover:underline flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Projects
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Find featured media
  const featuredMedia = project.media && project.media.items ? 
    project.media.items.find(item => item.tag === 'feature') : 
    null;

  // Get gallery media (non-featured)
  const galleryMedia = project.media && project.media.items ? 
    project.media.items.filter(item => item.tag !== 'feature') : 
    [];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative h-[50vh] sm:h-[70vh] md:h-[80vh] lg:h-[90vh] w-full overflow-hidden">
        {featuredMedia ? (
          <div className="relative w-full h-full">
            <img
              src={getValidImageSrc(featuredMedia.url)}
              alt={project.name}
              className="object-cover w-full h-full"
              onError={(e) => {
                e.currentTarget.src = '/images/news/maize.avif';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
          </div>
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-800 flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-600" />
              </div>
              <p className="text-gray-400 text-lg">No featured image available</p>
            </div>
          </div>
        )}
        
        {/* Hero Content */}
        <div className="absolute inset-0 flex items-end">
          <div className="container mx-auto px-4 pb-20">
            <div className="max-w-4xl">
              <Link
                href="/projects"
                className="inline-flex items-center text-white/80 hover:text-white transition-all duration-300 mb-12 group"
              >
                <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
                <span className="relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-px after:bg-white after:transition-all after:duration-300 group-hover:after:w-full">
                  Back to Projects
                </span>
              </Link>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-8 leading-tight break-words">
                {project.name}
              </h1>
              
              <div className="flex flex-wrap gap-4 text-white/90 mb-12 overflow-hidden max-w-full">
                <div className="overflow-x-auto">
                  <span className="flex items-center bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/10 hover:bg-white/20 transition-all duration-300 whitespace-nowrap">
                    <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    <span className="truncate">{formatDate(project.start_date)} - {formatDate(project.end_date)}</span>
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <span className="flex items-center bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/10 hover:bg-white/20 transition-all duration-300 whitespace-nowrap">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    <span className="truncate">{project.location || 'Not specified'}</span>
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <span className="flex items-center bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/10 hover:bg-white/20 transition-all duration-300 whitespace-nowrap">
                    <Tag className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                    <span className="truncate">{getCategoryName(project.category_id)}</span>
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <div className="bg-white/10 backdrop-blur-sm px-4 sm:px-6 py-2 sm:py-3 rounded-full border border-white/10 hover:bg-white/20 transition-all duration-300">
                    {getStatusBadge(project.status)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 lg:px-20 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-16 w-full overflow-hidden">
            {/* Description */}
            <div className="space-y-8">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="h-0.5 w-12 bg-primary-green flex-shrink-0"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-words">About the Project</h2>
              </div>
              <div className="break-words">
                <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed w-full">
                  {project.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* Goals */}
            {project.goals && project.goals.items && project.goals.items.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="h-0.5 w-12 bg-primary-green flex-shrink-0"></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-words">Project Goals</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {project.goals.items.map((goal) => (
                    <div
                      key={goal.id}
                      className="p-8 bg-gray-50 dark:bg-gray-800 rounded-2xl transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <div className="flex items-center gap-4 mb-4">
                        {goal.completed ? (
                          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <Target className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                          </div>
                        )}
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 break-words">{goal.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Outcomes */}
            {project.outcomes && project.outcomes.items && project.outcomes.items.length > 0 && (
              <div className="space-y-8">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="h-0.5 w-12 bg-[#045F3C] flex-shrink-0"></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-words">Project Outcomes</h2>
                </div>
                <div className="grid grid-cols-1 gap-8">
                  {project.outcomes.items.map((outcome) => (
                    <div 
                      key={outcome.id} 
                      className={`p-8 rounded-2xl transition-all duration-300 hover:shadow-lg ${
                        outcome.status === 'achieved' 
                          ? 'bg-gradient-to-br from-[#045F3C]/5 to-[#045F3C]/10 dark:from-[#045F3C]/20 dark:to-[#045F3C]/30 border border-[#045F3C]/20 dark:border-[#045F3C]/40' 
                          : outcome.status === 'in_progress' || outcome.status === 'in-progress'
                          ? 'bg-gradient-to-br from-[#FDB022]/5 to-[#FDB022]/10 dark:from-[#FDB022]/20 dark:to-[#FDB022]/30 border border-[#FDB022]/20 dark:border-[#FDB022]/40'
                          : 'bg-gradient-to-br from-[#045F3C]/5 to-[#045F3C]/10 dark:from-[#045F3C]/20 dark:to-[#045F3C]/30 border border-[#045F3C]/20 dark:border-[#045F3C]/40'
                      }`}
                    >
                      <div className="flex items-start gap-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                          outcome.status === 'achieved' 
                            ? 'bg-[#045F3C]/10 dark:bg-[#045F3C]/20' 
                            : outcome.status === 'in_progress' || outcome.status === 'in-progress'
                            ? 'bg-[#FDB022]/10 dark:bg-[#FDB022]/20'
                            : 'bg-[#045F3C]/10 dark:bg-[#045F3C]/20'
                        }`}>
                          <Award className={`w-8 h-8 ${
                            outcome.status === 'achieved' 
                              ? 'text-[#045F3C] dark:text-[#045F3C]/80' 
                              : outcome.status === 'in_progress' || outcome.status === 'in-progress'
                              ? 'text-[#FDB022] dark:text-[#FDB022]/80'
                              : 'text-[#045F3C] dark:text-[#045F3C]/80'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-4">
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white break-words">{outcome.title}</h3>
                            <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${
                              outcome.status === 'achieved' 
                                ? 'bg-[#045F3C]/10 text-[#045F3C] dark:bg-[#045F3C]/20 dark:text-[#045F3C]/80' 
                                : outcome.status === 'in_progress' || outcome.status === 'in-progress'
                                ? 'bg-[#FDB022]/10 text-[#FDB022] dark:bg-[#FDB022]/20 dark:text-[#FDB022]/80'
                                : 'bg-[#045F3C]/10 text-[#045F3C] dark:bg-[#045F3C]/20 dark:text-[#045F3C]/80'
                            }`}>
                              {outcome.status === 'achieved' ? 'Achieved' : 
                               (outcome.status === 'in_progress' || outcome.status === 'in-progress') ? 'In Progress' : 'Planned'}
                            </span>
                          </div>
                          <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed break-words">{outcome.description}</p>
                          
                          {/* Metrics */}
                          {outcome.metrics && outcome.metrics.length > 0 && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                              {outcome.metrics.map((metric, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <span className="w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mt-0.5 text-gray-600 dark:text-gray-300">•</span>
                                  <span className="text-gray-600 dark:text-gray-300">{metric}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Media Gallery - Only show if there are non-featured media items */}
            {galleryMedia.length > 0 && (
              <div className="space-y-6">
                <div className="flex justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="h-0.5 w-12 bg-primary-green flex-shrink-0"></div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-words">Project Highlights</h2>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 text-sm max-w-md">
                    Browse through this curated collection of images and videos that showcase key milestones.
                  </p>
                </div>

                <div className="relative group">
                  {/* Featured Media */}
                  <div className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 group">
                    {galleryMedia[activeImageIndex]?.type === 'image' ? (
                      <img
                        src={getValidImageSrc(galleryMedia[activeImageIndex]?.url)}
                        alt={galleryMedia[activeImageIndex]?.title || 'Featured media'}
                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.src = '/images/news/maize.avif';
                        }}
                      />
                    ) : galleryMedia[activeImageIndex]?.type === 'video' ? (
                      <div className="w-full h-full">
                        <video
                          src={galleryMedia[activeImageIndex]?.url}
                          controls
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Add fallback UI for video errors
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                  <div class="text-center">
                                    <div class="text-gray-400 mb-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                      </svg>
                                    </div>
                                    <p class="text-gray-500">Video could not be loaded</p>
                                  </div>
                                </div>
                              `;
                            }
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <ImageIcon className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {galleryMedia[activeImageIndex]?.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <button 
                          className="w-20 h-20 text-primary-orange rounded-full flex items-center justify-center hover:bg-yellow-500 transition-all duration-300 hover:scale-110 transform hover:shadow-xl"
                          aria-label="Play video"
                          title="Play video"
                        >
                          <div className="w-0 h-0 border-t-[15px] border-t-transparent border-l-[25px] border-l-white border-b-[15px] border-b-transparent ml-2"></div>
                        </button>
                      </div>
                    )}
                    {galleryMedia[activeImageIndex]?.caption && (
                      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent translate-y-4 transition-transform duration-300 group-hover:translate-y-0">
                        <p className="text-white text-lg">{galleryMedia[activeImageIndex].caption}</p>
                      </div>
                    )}
                  </div>

                  {/* Thumbnails Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-4 mt-4">
                    {galleryMedia.map((item, index) => (
                      <div
                        key={item.id}
                        className={`relative aspect-video rounded-lg overflow-hidden cursor-pointer group ${
                          index === activeImageIndex ? 'ring-2 ring-yellow-400' : ''
                        }`}
                        onClick={() => setActiveImageIndex(index)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            setActiveImageIndex(index);
                          }
                        }}
                        aria-label={`View ${item.title || `image ${index + 1}`}`}
                      >
                        {item.type === 'image' ? (
                          <img
                            src={getValidImageSrc(item.url)}
                            alt={item.title || `Gallery item ${index + 1}`}
                            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                            onError={(e) => {
                              e.currentTarget.src = '/images/news/maize.avif';
                            }}
                          />
                        ) : item.type === 'video' ? (
                          <div className="relative w-full h-full bg-gray-200 dark:bg-gray-700">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Film className="w-10 h-10 text-gray-400" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <FileText className="w-8 h-8 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300"></div>
                        {item.type === 'video' && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-8 h-8 text-primary-orange rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                              <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                            </div>
                          </div>
                        )}
                        {item.caption && (
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-white text-sm line-clamp-1">{item.caption}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Navigation Arrows */}
                  {galleryMedia.length > 1 && (
                    <div className="absolute top-1/2 -translate-y-1/2 left-4 right-4 flex justify-between pointer-events-none">
                      <button
                        onClick={handlePrevImage}
                        className="w-12 h-12 rounded-full text-primary-orange flex items-center justify-center hover:bg-yellow-500 transition-all duration-300 transform hover:scale-110 hover:shadow-lg pointer-events-auto opacity-0 group-hover:opacity-100 -translate-x-4 group-hover:translate-x-0"
                        aria-label="Previous image"
                        title="View previous image"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15 18l-6-6 6-6" />
                        </svg>
                      </button>
                      <button
                        onClick={handleNextImage}
                        className="w-12 h-12 rounded-full text-primary-orange flex items-center justify-center hover:bg-yellow-500 transition-all duration-300 transform hover:scale-110 hover:shadow-lg pointer-events-auto opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0"
                        aria-label="Next image"
                        title="View next image"
                      >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    </div>
                  )}

                  {/* Current Image Indicator */}
                  {galleryMedia.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                      {galleryMedia.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setActiveImageIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all duration-300 ${
                            index === activeImageIndex 
                              ? 'w-8 text-primary-orange' 
                              : 'bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Go to image ${index + 1}`}
                          title={`View image ${index + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Simplified with only Team Members and Partners */}
          <div className="lg:col-span-1 space-y-8">
            {/* Team Members - Updated to match example */}
            <div className="space-y-6">
              <div className="flex items-center gap-4 flex-wrap">
                <div className="h-0.5 w-12 bg-primary-green flex-shrink-0"></div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-words">Project Team</h2>
              </div>
              
              {project.members && Array.isArray(project.members) && project.members.length > 0 ? (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                  <div className="space-y-6">
                    {project.members.map((member, index) => {
                      const memberName = getTeamMemberName(member);
                      const memberKey = member.id || `member-${index}-${member.user_id}`;
                      const photoUrl = member.image || (member.team && member.team.photo_url);
                      
                      return (
                        <div 
                          key={memberKey}
                          className="flex items-center gap-3"
                        >
                          {photoUrl ? (
                            <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                              <img 
                                src={getValidImageSrc(photoUrl)}
                                alt={memberName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const parent = e.currentTarget.parentElement;
                                  if (parent) {
                                    parent.innerHTML = `
                                      <div class="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full dark:bg-gray-700">
                                        <span class="text-lg font-bold text-gray-700 dark:text-gray-300">
                                          ${memberName.charAt(0).toUpperCase()}
                                        </span>
                                      </div>
                                    `;
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full dark:bg-gray-700 flex-shrink-0">
                              <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                                {memberName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <p className="text-gray-900 dark:text-white font-semibold text-lg">{memberName}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl text-center">
                  <p className="text-gray-600 dark:text-gray-400">No team members assigned to this project</p>
                </div>
              )}
            </div>
            
            {/* Partners - Added to display logos and names */}
            {project.partners && project.partners.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="h-0.5 w-12 bg-primary-green flex-shrink-0"></div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white break-words">Partners</h2>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6">
                  <div className="grid grid-cols-2 gap-4">
                    {project.partners.map((partner, index) => {
                      const partnerName = getPartnerName(partner);
                      const partnerLogo = getPartnerLogo(partner);
                      const partnerKey = partner.id || `partner-${index}-${partner.partner_id}`;
                      
                      return (
                        <div 
                          key={partnerKey}
                          className="flex flex-col items-center text-center gap-3 p-4"
                        >
                          <div className="w-20 h-20 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                            {partnerLogo ? (
                              <img 
                                src={partnerLogo}
                                alt={partnerName}
                                className="max-w-full max-h-full object-contain"
                                onError={(e) => {
                                  // Fallback to icon
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.parentElement!.innerHTML = 
                                    `<div class="flex items-center justify-center w-full h-full">
                                      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                                        <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                                        <line x1="9" y1="22" x2="9" y2="16"></line>
                                        <line x1="15" y1="22" x2="15" y2="16"></line>
                                      </svg>
                                    </div>`;
                                }}
                              />
                            ) : (
                              <Building className="w-10 h-10 text-gray-400" />
                            )}
                          </div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{partnerName}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;