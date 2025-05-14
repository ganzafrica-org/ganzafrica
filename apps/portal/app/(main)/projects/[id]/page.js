"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calendar, MapPin, User, Tag, Clock, CheckCircle, FileText, Image, Film, AlertCircle, Download, Eye, Building } from 'lucide-react';
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';
const ProjectDetailsPage = () => {
    const params = useParams();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categories, setCategories] = useState([]);
    const [activeTab, setActiveTab] = useState('details');
    const [selectedDocument, setSelectedDocument] = useState(null);
    // Improved function to handle image URLs with proper fallback
    const getValidImageSrc = (url) => {
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
                // Fetch categories first
                try {
                    const categoriesResponse = await apiClient.get('/categories');
                    console.log("Categories response:", categoriesResponse.data);
                    // Handle different response formats
                    if (categoriesResponse.data && Array.isArray(categoriesResponse.data.categories)) {
                        setCategories(categoriesResponse.data.categories);
                    }
                    else if (Array.isArray(categoriesResponse.data)) {
                        setCategories(categoriesResponse.data);
                    }
                    else {
                        console.log('Using fallback categories structure');
                        const categoriesMap = {
                            1: 'Food system',
                            2: 'Climate adaptation',
                            3: 'Data & Evidence'
                        };
                        // Convert to array format expected by the component
                        const categoriesArray = Object.entries(categoriesMap).map(([id, name]) => ({
                            id: Number(id),
                            name
                        }));
                        setCategories(categoriesArray);
                    }
                }
                catch (error) {
                    console.error('Error fetching categories:', error);
                }
                // Try to fetch project details from API
                try {
                    const response = await apiClient.get(`/projects/${params.id}`);
                    console.log("API Response:", response.data);
                    // Check if the response has a nested project object (as shown in the Swagger docs)
                    if (response.data && response.data.project) {
                        console.log("Setting project from nested project object");
                        setProject(response.data.project);
                    }
                    else if (response.data && response.data.id) {
                        // Direct project object
                        console.log("Setting project from direct response");
                        setProject(response.data);
                    }
                    else {
                        throw new Error("Invalid project data structure");
                    }
                }
                catch (apiError) {
                    console.error('Error fetching project from API:', apiError);
                    // If API fails, show error
                    setError('Failed to fetch project details. Please try again later.');
                }
            }
            catch (error) {
                console.error('Error in overall project data fetching:', error);
                setError('Failed to fetch project details. Please try again later.');
            }
            finally {
                setLoading(false);
            }
        };
        fetchProjectData();
    }, [params.id]);
    // Format date for display
    const formatDate = (dateString) => {
        if (!dateString)
            return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };
    // Get category name from category_id by directly inspecting the categories array
    const getCategoryName = (categoryId) => {
        if (!categoryId)
            return 'Not specified';
        // Try to find the category in the array
        // Use Number conversion to handle any type mismatches
        if (categories && categories.length > 0) {
            const category = categories.find(cat => Number(cat.id) === Number(categoryId));
            if (category) {
                return category.name;
            }
        }
        // If not found in the categories array, try a direct lookup by ID
        // This can happen if the API returned numbered keys instead of an array
        if (categories && (categoryId in categories)) {
            return categories[categoryId].name;
        }
        // Return just the ID as fallback
        return `Category ${categoryId}`;
    };
    // Get team member name
    const getTeamMemberName = (member) => {
        if (member.team && member.team.name) {
            return member.team.name;
        }
        return `Team Member ${member.team_id}`;
    };
    // Get partner name
    const getPartnerName = (partner) => {
        if (partner.partner && partner.partner.name) {
            return partner.partner.name;
        }
        return `Partner ${partner.partner_id}`;
    };
    // Get partner logo
    const getPartnerLogo = (partner) => {
        if (partner.partner && partner.partner.logo) {
            return partner.partner.logo;
        }
        return null;
    };
    // Extract team lead from project members
    const getTeamLead = () => {
        if (!project || !project.members || project.members.length === 0) {
            // If no members, use created_by as fallback for lead
            return 'Not assigned';
        }
        const lead = project.members.find(member => member.role === 'lead');
        if (lead) {
            // Return team name from the nested team object if available
            return getTeamMemberName(lead);
        }
        else {
            // Fallback to first team member
            return getTeamMemberName(project.members[0]);
        }
    };
    // Map status for display
    const getStatusBadge = (status) => {
        if (!status)
            return null;
        switch (status.toLowerCase()) {
            case 'completed':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">• Completed</span>;
            case 'planned':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">• Pending</span>;
            case 'active':
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">• In Progress</span>;
            default:
                return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">• {status}</span>;
        }
    };
    // Get file size in readable format
    const formatFileSize = (bytes) => {
        if (!bytes || bytes === 0)
            return 'Unknown size';
        if (bytes < 1024)
            return bytes + ' bytes';
        if (bytes < 1024 * 1024)
            return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };
    // Get file icon based on filename
    const getFileIcon = (filename) => {
        const extension = filename.split('.').pop()?.toLowerCase();
        switch (extension) {
            case 'pdf':
                return <FileText className="w-6 h-6 text-red-500"/>;
            case 'doc':
            case 'docx':
                return <FileText className="w-6 h-6 text-blue-500"/>;
            case 'xls':
            case 'xlsx':
                return <FileText className="w-6 h-6 text-green-500"/>;
            case 'ppt':
            case 'pptx':
                return <FileText className="w-6 h-6 text-orange-500"/>;
            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'gif':
                return <Image className="w-6 h-6 text-purple-500"/>;
            default:
                return <FileText className="w-6 h-6 text-gray-500"/>;
        }
    };
    // Open document in new tab
    const viewDocument = (document) => {
        setSelectedDocument(document);
        // Open document in a new tab if it's a common viewable format
        const url = document.file_url;
        if (url) {
            window.open(url, '_blank');
        }
    };
    // Download document
    const downloadDocument = (document) => {
        // Create an anchor element and trigger download
        if (document.file_url) {
            const a = document.createElement('a');
            a.href = document.file_url;
            a.download = document.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    };
    // Render media item
    const renderMediaItem = (media) => {
        return (<div key={media.id} className="bg-white p-4 border rounded-lg mb-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium">{media.title}</h3>
          <span className="text-xs px-2 py-1 bg-gray-100 rounded">{media.tag}</span>
        </div>
        
        {media.type === 'image' ? (<div className="mb-3">
            <img src={getValidImageSrc(media.url)} alt={media.title} className="w-full h-48 object-cover rounded" onError={(e) => {
                    // Fallback to placeholder on error
                    e.target.src = '/api/placeholder/400/300?text=Image+Not+Available';
                }}/>
          </div>) : media.type === 'video' ? (<div className="mb-3 relative">
            <div className="relative overflow-hidden rounded">
              <img src={media.thumbnailUrl || '/api/placeholder/400/320'} alt={`Thumbnail for ${media.title}`} className="w-full h-48 object-cover"/>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black bg-opacity-50 rounded-full p-3">
                  <Film className="text-white w-8 h-8"/>
                </div>
              </div>
            </div>
          </div>) : (<div className="mb-3 p-4 border border-dashed rounded flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400"/>
          </div>)}
        
        <div className="text-sm text-gray-500">
          {media.description && <p className="mb-1">{media.description}</p>}
          <p>Size: {formatFileSize(media.size)}</p>
          {media.isExternalUrl && <p className="text-xs text-blue-500">External URL</p>}
        </div>
      </div>);
    };
    if (loading) {
        return (<div className="p-6 max-w-full flex items-center justify-center min-h-[80vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project details...</p>
        </div>
      </div>);
    }
    if (error) {
        return (<div className="p-6 max-w-full">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2"/>
            <span>{error}</span>
          </div>
          <div className="mt-4">
            <Link href="/projects" className="text-red-700 font-medium hover:underline flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1"/> Back to Projects
            </Link>
          </div>
        </div>
      </div>);
    }
    // Debug output
    console.log("Current project state:", project);
    console.log("Categories:", categories);
    if (!project) {
        return (<div className="p-6 max-w-full">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded relative" role="alert">
          <div className="flex">
            <AlertCircle className="h-5 w-5 mr-2"/>
            <span>Project not found</span>
          </div>
          <div className="mt-4">
            <Link href="/projects" className="text-yellow-700 font-medium hover:underline flex items-center">
              <ArrowLeft className="w-4 h-4 mr-1"/> Back to Projects
            </Link>
          </div>
        </div>
      </div>);
    }
    return (<div className="p-6 max-w-full">
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href="/projects" className="text-green-700 hover:underline flex items-center mb-2">
            <ArrowLeft className="w-4 h-4 mr-1"/> Back to Projects
          </Link>
          <div className="flex items-center">
            <h1 className="text-2xl font-bold">{project.name}</h1>
            <div className="ml-4">
              {getStatusBadge(project.status)}
            </div>
          </div>
          <p className="text-gray-500 text-sm">Projects / View</p>
        </div>
        <Link href={`/projects/edit/${project.id}`} className="px-4 py-2 bg-green-700 rounded text-sm font-medium text-white hover:bg-green-800">
          Edit Project
        </Link>
      </div>

      {/* Project content with sidebar */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar navigation */}
        <div className="w-full md:w-1/4 bg-white p-4 rounded border border-gray-200">
          <ul>
            <li className="mb-6">
              <button onClick={() => setActiveTab('details')} className={`w-full text-left flex items-start ${activeTab === 'details' ? 'text-green-700' : 'text-gray-700'}`}>
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-3 h-3 rounded-full ${activeTab === 'details' ? 'bg-green-700' : 'bg-gray-300'}`}></div>
                </div>
                <div className="ml-4">
                  <p className="font-semibold">Project Details</p>
                  <p className="text-sm text-gray-500">The overview, vision, progress of the project</p>
                </div>
              </button>
            </li>
            <li className="mb-6">
              <button onClick={() => setActiveTab('team')} className={`w-full text-left flex items-start ${activeTab === 'team' ? 'text-green-700' : 'text-gray-700'}`}>
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-3 h-3 rounded-full ${activeTab === 'team' ? 'bg-green-700' : 'bg-gray-300'}`}></div>
                </div>
                <div className="ml-4">
                  <p className="font-semibold">The Team</p>
                  <p className="text-sm text-gray-500">Meet the people making it happen</p>
                </div>
              </button>
            </li>
            <li className="mb-6">
              <button onClick={() => setActiveTab('documents')} className={`w-full text-left flex items-start ${activeTab === 'documents' ? 'text-green-700' : 'text-gray-700'}`}>
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-3 h-3 rounded-full ${activeTab === 'documents' ? 'bg-green-700' : 'bg-gray-300'}`}></div>
                </div>
                <div className="ml-4">
                  <p className="font-semibold">Documents</p>
                  <p className="text-sm text-gray-500">Project documentation and files</p>
                </div>
              </button>
            </li>
            <li className="mb-6">
              <button onClick={() => setActiveTab('media')} className={`w-full text-left flex items-start ${activeTab === 'media' ? 'text-green-700' : 'text-gray-700'}`}>
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-3 h-3 rounded-full ${activeTab === 'media' ? 'bg-green-700' : 'bg-gray-300'}`}></div>
                </div>
                <div className="ml-4">
                  <p className="font-semibold">Media Gallery</p>
                  <p className="text-sm text-gray-500">Project images and videos</p>
                </div>
              </button>
            </li>
            <li className="mb-6">
              <button onClick={() => setActiveTab('partners')} className={`w-full text-left flex items-start ${activeTab === 'partners' ? 'text-green-700' : 'text-gray-700'}`}>
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-3 h-3 rounded-full ${activeTab === 'partners' ? 'bg-green-700' : 'bg-gray-300'}`}></div>
                </div>
                <div className="ml-4">
                  <p className="font-semibold">Partners</p>
                  <p className="text-sm text-gray-500">Project partner organizations</p>
                </div>
              </button>
            </li>
          </ul>
        </div>

        {/* Main content area */}
        <div className="w-full md:w-3/4">
          {/* Details tab */}
          {activeTab === 'details' && (<div className="bg-white p-6 rounded-lg border border-gray-200">
              {/* Project featured image */}
              <div className="mb-8">
                {project.media && project.media.items && project.media.items.length > 0 && (project.media.items.find(item => item.tag === 'feature' || item.cover) ? (<img src={getValidImageSrc(project.media.items.find(item => item.tag === 'feature' || item.cover)?.url || '/api/placeholder/800/400')} alt={project.name} className="w-full h-64 object-cover rounded-lg" onError={(e) => {
                    // Fallback to placeholder on error
                    e.target.src = '/api/placeholder/800/400?text=Image+Not+Available';
                }}/>) : (<div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <p className="text-gray-400">No featured image</p>
                  </div>))}
            </div>
            
            {/* Description */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Project Description</h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="whitespace-pre-line">{project.description || 'No description provided.'}</p>
              </div>
            </div>
            
            {/* Basic info section */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Tag className="w-4 h-4 text-gray-500 mr-2"/>
                    <span className="text-sm text-gray-500">Category</span>
                  </div>
                  <p className="font-medium">{getCategoryName(project.category_id)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <MapPin className="w-4 h-4 text-gray-500 mr-2"/>
                    <span className="text-sm text-gray-500">Location</span>
                  </div>
                  <p className="font-medium">{project.location || 'Not specified'}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2"/>
                    <span className="text-sm text-gray-500">Start Date</span>
                  </div>
                  <p className="font-medium">{formatDate(project.start_date)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Calendar className="w-4 h-4 text-gray-500 mr-2"/>
                    <span className="text-sm text-gray-500">End Date</span>
                  </div>
                  <p className="font-medium">{formatDate(project.end_date)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <User className="w-4 h-4 text-gray-500 mr-2"/>
                    <span className="text-sm text-gray-500">Team Lead</span>
                  </div>
                  <p className="font-medium">{getTeamLead()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center mb-2">
                    <Clock className="w-4 h-4 text-gray-500 mr-2"/>
                    <span className="text-sm text-gray-500">Created</span>
                  </div>
                  <p className="font-medium">{formatDate(project.created_at)}</p>
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Project Goals</h2>
              {project.goals && project.goals.items && project.goals.items.length > 0 ? (<div className="space-y-4">
                  {project.goals.items.map((goal) => (<div key={goal.id} className="p-4 bg-gray-50 rounded-lg border-l-4 border-green-700">
                      <div className="flex items-start mb-2">
                        <div className="mr-2 mt-1">
                          <CheckCircle className={`w-4 h-4 ${goal.completed ? 'text-green-600' : 'text-gray-400'}`}/>
                        </div>
                        <h3 className="font-medium">{goal.title}</h3>
                      </div>
                      <p className="text-gray-600 ml-6">{goal.description}</p>
                    </div>))}
                </div>) : (<div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
                  No goals defined for this project.
                </div>)}
            </div>

            {/* Outcomes */}
            <div className="mb-8">
              <h2 className="text-xl font-bold mb-4">Project Outcomes</h2>
              {project.outcomes && project.outcomes.items && project.outcomes.items.length > 0 ? (<div className="space-y-4">
                  {project.outcomes.items.map((outcome) => (<div key={outcome.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium">{outcome.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${outcome.status === 'completed' || outcome.status === 'achieved' ? 'bg-green-100 text-green-800' :
                        outcome.status === 'in-progress' ? 'bg-orange-100 text-orange-800' :
                            'bg-purple-100 text-purple-800'}`}>
                          {outcome.status.charAt(0).toUpperCase() + outcome.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-gray-600">{outcome.description}</p>
                    </div>))}
                </div>) : (<div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
                  No outcomes defined for this project.
                </div>)}
            </div>

            {/* Other Information */}
            {project.other_information && (<div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Other Relevant Information</h2>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="whitespace-pre-line">{project.other_information}</p>
                </div>
              </div>)}
          </div>)}

        {/* Team tab */}
        {activeTab === 'team' && (<div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-6">Project Team</h2>
            
            {project.members && project.members.length > 0 ? (<div className="space-y-6">
                {project.members.map((member) => (<div key={member.id} className="flex items-center gap-3">
                    {member.team && member.team.photo_url ? (<div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        <img src={getValidImageSrc(member.team.photo_url)} alt={getTeamMemberName(member)} className="w-full h-full object-cover" onError={(e) => {
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                                parent.innerHTML = `
                                <div class="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full dark:bg-gray-700">
                                  <span class="text-lg font-bold text-gray-700 dark:text-gray-300">
                                    ${getTeamMemberName(member).charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              `;
                            }
                        }}/>
                      </div>) : (<div className="w-12 h-12 flex items-center justify-center bg-gray-200 rounded-full dark:bg-gray-700 flex-shrink-0">
                        <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                          {getTeamMemberName(member).charAt(0).toUpperCase()}
                        </span>
                      </div>)}
                    <p className="text-gray-900 dark:text-white font-semibold text-lg">{getTeamMemberName(member)}</p>
                  </div>))}
              </div>) : (<div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
                No team members assigned to this project.
              </div>)}
          </div>)}

        {/* Documents tab */}
        {activeTab === 'documents' && (<div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-6">Project Documents</h2>
            
            {project.documents && project.documents.length > 0 ? (<div className="space-y-4">
                {project.documents.map((document, index) => (<div key={document.id || index} className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                    {getFileIcon(document.name)}
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium">{document.name}</h3>
                      <p className="text-xs text-gray-500">{formatFileSize(document.file_size)}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => viewDocument(document)} className="p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center" title="View document">
                        <Eye className="w-4 h-4"/>
                      </button>
                      <button onClick={() => downloadDocument(document)} className="p-2 bg-green-50 text-green-700 rounded hover:bg-green-100 flex items-center" title="Download document">
                        <Download className="w-4 h-4"/>
                      </button>
                    </div>
                  </div>))}
              </div>) : (<div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
                No documents uploaded for this project.
              </div>)}
          </div>)}

        {/* Partners tab */}
        {activeTab === 'partners' && (<div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-6">Project Partners</h2>
            
            {project.partners && project.partners.length > 0 ? (<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.partners.map((partner) => {
                    const partnerName = getPartnerName(partner);
                    const partnerLogo = getPartnerLogo(partner);
                    const partnerKey = partner.id || `partner-${partner.partner_id}`;
                    return (<div key={partnerKey} className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                        {partnerLogo ? (<img src={partnerLogo} alt={partnerName} className="max-w-full max-h-full object-contain" onError={(e) => {
                                // Fallback to icon
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement.innerHTML =
                                    `<div class="flex items-center justify-center w-full h-full">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-gray-400">
                                    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                                    <line x1="9" y1="22" x2="9" y2="16"></line>
                                    <line x1="15" y1="22" x2="15" y2="16"></line>
                                  </svg>
                                </div>`;
                            }}/>) : (<Building className="w-10 h-10 text-gray-400"/>)}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">{partnerName}</h3>
                        <p className="text-sm text-gray-600">Partner Organization</p>
                        {partner.partner?.location && (<p className="text-xs text-gray-500">{partner.partner.location}</p>)}
                      </div>
                    </div>);
                })}
              </div>) : (<div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
                No partner organizations assigned to this project.
              </div>)}
          </div>)}

        {/* Media tab */}
        {activeTab === 'media' && (<div className="bg-white p-6 rounded-lg border border-gray-200">
            <h2 className="text-xl font-bold mb-6">Project Media</h2>
            
            {project.media && project.media.items && project.media.items.length > 0 ? (<div>
                <div className="mb-6">
                  <h3 className="font-medium text-gray-500 mb-2">Feature Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.media.items
                    .filter(item => item.tag === 'feature')
                    .map(renderMediaItem)}
                    {project.media.items.filter(item => item.tag === 'feature').length === 0 && (<div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center col-span-full">
                        No feature media available.
                      </div>)}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-medium text-gray-500 mb-2">Description Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.media.items
                    .filter(item => item.tag === 'description')
                    .map(renderMediaItem)}
                    {project.media.items.filter(item => item.tag === 'description').length === 0 && (<div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center col-span-full">
                        No description media available.
                      </div>)}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-500 mb-2">Other Media</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {project.media.items
                    .filter(item => item.tag === 'others' || !['feature', 'description'].includes(item.tag))
                    .map(renderMediaItem)}
                    {project.media.items.filter(item => item.tag === 'others' || !['feature', 'description'].includes(item.tag)).length === 0 && (<div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center col-span-full">
                        No other media available.
                      </div>)}
                  </div>
                </div>
              </div>) : (<div className="p-4 bg-gray-50 rounded-lg text-gray-500 text-center">
                No media files uploaded for this project.
              </div>)}
          </div>)}
      </div>
    </div>
    
    {/* Document preview modal */}
    {selectedDocument && (<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
          <div className="p-4 flex justify-between items-center border-b">
            <h3 className="font-bold">{selectedDocument.name}</h3>
            <button onClick={() => setSelectedDocument(null)} className="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div className="p-4 overflow-auto max-h-[calc(90vh-8rem)]">
            {/* Content preview would go here */}
            <div className="flex justify-center">
              <a href={selectedDocument.file_url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-flex items-center">
                <Eye className="w-4 h-4 mr-2"/> Open Document in New Tab
              </a>
            </div>
          </div>
        </div>
      </div>)}
  </div>);
};
export default ProjectDetailsPage;
