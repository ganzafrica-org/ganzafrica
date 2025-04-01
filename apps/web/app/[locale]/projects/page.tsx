"use client";

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Container from '@/components/layout/container';
import Link from 'next/link';
import { ArrowRight, Play, Volume2, Maximize, Search, Filter } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { DecoratedHeading } from "@/components/layout/headertext";
import { default as HeaderBanner } from "@/components/layout/headerBanner";
import { FC } from 'react';
import { LandGovernanceIcon, SustainableAgricultureIcon, ClimateAdaptationIcon, TechnologyIcon } from "@/components/ui/icons";

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

interface Project {
  id: number;
  title: string;
  image: string;
  description: string;
  status: string;
  category: string;
  location?: string;
  partners?: string[];
  date?: string;
  impact?: {
    communities: number;
    farmers: number;
    hectares?: number;
  }
}

interface ProjectCategoryProps {
  name: string;
  icon: React.ReactNode;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

interface ProjectCardProps {
  project: Project;
}

interface FeaturedProjectProps {
  project: Project;
}

// Sample projects data
const projects: Project[] = [
  {
    id: 1,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-1.jpg",
    description: "A digital platform that helps farmers track crop performance, predict yields, and manage resources efficiently.",
    status: "In Progress",
    category: "Technology",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 8700
    }
  },
  {
    id: 2,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-2.jpg",
    description: "Research initiative exploring eco-friendly farming methods that maintain soil health and biodiversity.",
    status: "Completed",
    category: "Research",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 5300
    }
  },
  {
    id: 3,
    title: "Sustainable Farming Initiative",
    image: "/images/news/maize.avif",
    description: "Supporting farmers to adapt to climate change through resilient farming techniques and crop diversification.",
    status: "Active",
    category: "Climate",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 9500
    }
  },
  {
    id: 4,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-1.jpg",
    description: "Digital system to document and secure land rights for smallholder farmers and communities.",
    status: "In Progress",
    category: "Governance",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 12000
    }
  },
  {
    id: 5,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-2.jpg",
    description: "Platform leveraging big data to provide insights for agricultural planning and policy-making.",
    status: "Planning",
    category: "Technology",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 4200
    }
  },
  {
    id: 6,
    title: "Sustainable Farming Initiative",
    image: "/images/news/maize.avif",
    description: "Developing community-owned farms to improve food security and provide income opportunities.",
    status: "Active",
    category: "Community",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 7800
    }
  },
  {
    id: 7,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-1.jpg",
    description: "Systematic soil testing and monitoring to improve agricultural productivity and sustainability.",
    status: "Active",
    category: "Research",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 8500
    }
  },
  {
    id: 8,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-2.jpg",
    description: "Comprehensive water management for agricultural sustainability in drought-prone regions.",
    status: "In Progress",
    category: "Technology",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 6200
    }
  },
  {
    id: 9,
    title: "Sustainable Farming Initiative",
    image: "/images/news/maize.avif",
    description: "Preserving and digitizing traditional farming practices and indigenous agricultural knowledge.",
    status: "Planning",
    category: "Research",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 5800
    }
  },
  {
    id: 10,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-1.jpg",
    description: "Digital marketplace connecting small-scale farmers directly to buyers and value chain opportunities.",
    status: "Active",
    category: "Technology",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 9800
    }
  },
  {
    id: 11,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-2.jpg",
    description: "Practices for livestock farming that minimize environmental impact while maximizing productivity.",
    status: "In Review",
    category: "Research",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 11500
    }
  },
  {
    id: 12,
    title: "Sustainable Farming Initiative",
    image: "/images/news/maize.avif",
    description: "Training rural communities to build resilience against climate change impacts on agriculture.",
    status: "Active",
    category: "Climate",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 10200
    }
  }
];

// Categories data
const categories = [
  {
    name: "All Projects",
    icon: <ArrowRight className="w-5 h-5" />,
    count: projects.length
  },
  {
    name: "Technology",
    icon: <TechnologyIcon className="w-5 h-5" />,
    count: projects.filter(p => p.category === "Technology").length
  },
  {
    name: "Research",
    icon: <SustainableAgricultureIcon className="w-5 h-5" />,
    count: projects.filter(p => p.category === "Research").length
  },
  {
    name: "Climate",
    icon: <ClimateAdaptationIcon className="w-5 h-5" />,
    count: projects.filter(p => p.category === "Climate").length
  },
  {
    name: "Governance",
    icon: <LandGovernanceIcon className="w-5 h-5" />,
    count: projects.filter(p => p.category === "Governance").length
  },
  {
    name: "Community",
    icon: <ArrowRight className="w-5 h-5" />,
    count: projects.filter(p => p.category === "Community").length
  }
];

// Project Category Button Component
const ProjectCategory: FC<ProjectCategoryProps> = ({ name, icon, count, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-lg w-full transition-all duration-300 ${
        isActive 
          ? 'bg-primary-green text-white shadow-md' 
          : 'bg-white hover:bg-gray-50 text-gray-700'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isActive ? 'bg-white text-primary-green' : 'bg-primary-green/10 text-primary-green'
        }`}>
          {icon}
        </div>
        <span className="font-medium">{name}</span>
      </div>
      <span className={`text-sm ${isActive ? 'bg-white text-primary-green' : 'bg-gray-100 text-gray-600'} px-2 py-0.5 rounded-full`}>
        {count}
      </span>
    </button>
  );
};

// Project Card Component - Updated to show country location instead of "2 Countries"
const ProjectCard: FC<ProjectCardProps> = ({ project }) => {
  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className="relative bg-white shadow-sm hover:shadow-xl transition-all duration-500 rounded-lg overflow-hidden cursor-pointer h-full transform hover:-translate-y-2">
        <div className="relative w-full overflow-hidden">
          {/* Main content container */}
          <div className="relative">
            {/* Status badge in top left */}
            <div className="absolute top-4 left-4 z-10 bg-white py-1 px-3 rounded-full text-xs font-medium shadow-md transform transition-transform duration-300 group-hover:scale-110">
              {project.status}
            </div>
            
            {/* Yellow circle with arrow icon in top right */}
            <div className="absolute top-4 right-4 z-10">
              <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center transition-all duration-500 shadow-lg transform group-hover:rotate-90">
                <ArrowRight className="w-6 h-6 text-white" />
              </div>
            </div>

            {/* Image section with overlay */}
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={project.image || '/images/default-image.jpg'}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Project title at the bottom */}
              <div className="absolute bottom-4 left-4 z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white text-xl font-bold">{project.title}</h3>
                <p className="text-white/90 text-sm mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with metrics */}
        <div className="px-6 py-4 flex justify-between items-center bg-white">
          <div className="flex items-center text-primary-green group-hover:text-primary-green/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="font-medium">{project.location}</span>
          </div>
          
          <div className="flex items-center text-primary-green group-hover:text-primary-green/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 mr-2">
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
            </svg>
            <span className="font-medium">{project.impact?.farmers.toLocaleString()}+ Impacted people</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Featured Project Component
const FeaturedProject: FC<FeaturedProjectProps> = ({ project }) => {
  return (
    <div className="group relative bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer">
      <div className="relative w-full overflow-hidden">
        {/* Main content container */}
        <div className="flex flex-col md:flex-row">
          {/* Image section */}
          <div className="md:w-1/2 relative aspect-video md:aspect-auto">
            <Image
              src={project.image || '/images/default-image.jpg'}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            {/* Green overlay with 30% opacity - exactly #045F3C with 0.3 opacity */}
            <div className="absolute inset-0 bg-[#045F3C] opacity-30"></div>
            
            {/* Status badge */}
            <div className="absolute top-4 left-4 bg-white py-1 px-3 rounded-full text-xs font-medium">
              {project.status}
            </div>
          </div>
          
          {/* Content section */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col">
            <h3 className="text-xl font-bold mb-3 text-gray-800">{project.title}</h3>
            
            <p className="text-gray-600 mb-4 flex-grow">
              {project.description}
            </p>
            
            {/* Location and impact */}
            <div className="flex flex-wrap gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary-green/10 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Location</div>
                  <div className="font-medium">{project.location}</div>
                </div>
              </div>
              
              {project.impact && (
                <>       
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary-green/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-primary-green">
                        <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Impacted People</div>
                      <div className="font-medium">3,200+</div>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* View Project */}
            <div className="mt-6">
              <Link href={`/projects/${project.id}`}>
                <div className="inline-flex items-center text-primary-green hover:text-primary-green/80 font-medium gap-2 group/button">
                  <span>View Project Details</span>
                  <div className="w-8 h-8 rounded-full bg-primary-orange flex items-center justify-center group-hover/button:bg-primary-green transition-colors">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectsPage = (): JSX.Element => {
  const [activeCategory, setActiveCategory] = useState<string>("All Projects");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const projectsPerPage = 6;
  
  const bannerRef = useRef<HTMLDivElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const projectsGridRef = useRef<HTMLDivElement>(null);
  
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Calculate pagination values
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const endIndex = startIndex + projectsPerPage;
  const currentProjects = filteredProjects.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm, statusFilter]);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    const halfMaxPages = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfMaxPages);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  // Featured project - use the first project or a default one if projects array is empty
  const featuredProject = projects[0] || {
    id: 0,
    title: "No Featured Project",
    image: "/images/default-image.jpg",
    description: "No project description available.",
    status: "N/A",
    category: "N/A",
    location: "N/A",
    impact: {
      communities: 0,
      farmers: 0,
      hectares: 0
    }
  };

  // Filter projects based on category, search term, and status
  useEffect(() => {
    let result = projects;
    
    // Filter by category
    if (activeCategory !== "All Projects") {
      result = result.filter(project => project.category === activeCategory);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(project => 
        project.title.toLowerCase().includes(term) || 
        project.description.toLowerCase().includes(term) ||
        project.location?.toLowerCase().includes(term) ||
        project.category.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(project => 
        project.status.toLowerCase().replace(/\s+/g, '-') === statusFilter
      );
    }
    
    setFilteredProjects(result);
  }, [activeCategory, searchTerm, statusFilter]);

  // Animation effects
  useEffect(() => {
    // Set page as loaded
    setIsPageLoaded(true);
    
    // Only run animations after page is fully loaded
    if (!isPageLoaded) return;

    // Banner animation
    if (bannerRef.current) {
      gsap.from(bannerRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      });
    }

    // Featured project animation
    if (featuredRef.current) {
      gsap.from(featuredRef.current, {
        y: 30,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out"
      });
    }

    // Project cards stagger animation
    if (projectsGridRef.current) {
      gsap.from(".project-card", {
        y: 50,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: projectsGridRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse"
        }
      });
    }

    // Animate category buttons
    gsap.from(".category-button", {
      x: -20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.5
    });
  }, [isPageLoaded, filteredProjects]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Add a class to hide content until page is loaded
  const pageClass = isPageLoaded ? "opacity-100 transition-opacity duration-500" : "opacity-0";

  return (
    <main className={`bg-white ${pageClass}`}>
      {/* Loading Animation */}
      {isLoading && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-primary-green border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/news/maize.avif"
            alt="Agricultural fields"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>
        
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 z-10"></div>
        
        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
            <span className="font-bold">Turning</span> <span className="font-normal">Ideas Into</span><br />
            <span className="font-bold">Action</span>
          </h1>
          <h2 className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6">
            PROJECTS
          </h2>
        </div>
      </section>

      {/* Banner Section */}
      <div ref={bannerRef} className="w-full overflow-hidden">
        <div className="flex justify-center">
          <HeaderBanner />
        </div>
      </div>

      {/* Featured Project Section */}
      <Container>
        <div className="py-10">
          <div className="flex justify-center mb-10">
            <DecoratedHeading firstText="Featured" secondText="Project" />
          </div>
          
          <div ref={featuredRef} className="max-w-7xl mx-auto">
            <FeaturedProject project={featuredProject} />
          </div>
        </div>
      </Container>


      {/* Projects Section */}
      <Container>
        <div className="py-10">
          <div className="flex justify-center mb-10">
            <DecoratedHeading firstText="Our" secondText="Projects" />
          </div>
          
          <div className="max-w-7xl mx-auto">
            {/* Search and Filter Bar */}
            <div className="mb-8 flex flex-col md:flex-row gap-4 transform transition-all duration-300">
              <div className="w-full md:w-2/3 relative">
                <input
                  type="text"
                  placeholder="Search projects by name, location, or category..."
                  className="w-full py-3 pl-12 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors duration-300 group-focus-within:text-primary-green" />
              </div>
              
              <div className="w-full md:w-1/3 flex items-center gap-2 bg-gray-100 rounded-lg p-2 transition-all duration-300 hover:bg-gray-200">
                <Filter className="w-5 h-5 text-gray-500 ml-2" />
                <span className="text-gray-500">Filter by status:</span>
                <select 
                  className="flex-grow bg-white border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent transition-all duration-300"
                  aria-label="Filter projects by status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">All</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="planning">Planning</option>
                  <option value="in-progress">In Progress</option>
                  <option value="in-review">In Review</option>
                </select>
              </div>
            </div>
            
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Categories Sidebar */}
              <div className="lg:w-1/4 space-y-3">
                {categories.map((category, index) => (
                  <div key={`category-${index}`} className="category-button">
                    <ProjectCategory
                      name={category.name}
                      icon={category.icon}
                      count={category.count}
                      isActive={activeCategory === category.name}
                      onClick={() => setActiveCategory(category.name)}
                    />
                  </div>
                ))}
              </div>
              
              {/* Projects Grid */}
              <div className="lg:w-3/4">
                {filteredProjects.length > 0 ? (
                  <div ref={projectsGridRef} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {currentProjects.map((project) => (
                      <div key={`project-${project.id}`} className="project-card">
                        <ProjectCard project={project} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-10 text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">No projects found</h3>
                    <p className="text-gray-500">
                      Try adjusting your search or filter criteria to find what you're looking for.
                    </p>
                    <button 
                      className="mt-4 text-primary-green font-medium"
                      onClick={() => {
                        setActiveCategory("All Projects");
                        setSearchTerm("");
                      }}
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Pagination Controls */}
            {filteredProjects.length > projectsPerPage && (
              <div className="mt-12 flex justify-center">
                <div className="flex items-center gap-2">
                  <button 
                    className="w-10 h-10 rounded-full border border-primary-green flex items-center justify-center text-primary-green hover:bg-primary-green hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    &lt;
                  </button>
                  
                  {getPageNumbers().map((page) => (
                    <button
                      key={page}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        currentPage === page
                          ? 'bg-primary-green text-white'
                          : 'border border-gray-300 text-gray-600 hover:border-primary-green hover:text-primary-green'
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                  
                  {currentPage < totalPages && (
                    <>
                      {currentPage < totalPages - 1 && <span className="mx-1">...</span>}
                      <button
                        className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:border-primary-green hover:text-primary-green transition-colors"
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                  
                  <button 
                    className="w-10 h-10 rounded-full border border-primary-green flex items-center justify-center text-primary-green hover:bg-primary-green hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Container>

      {/* Project Impacts Section */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="flex justify-center mb-10">
            <DecoratedHeading firstText="Project" secondText="Impacts" />
          </div>
          
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Impact Metric 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-md text-center">
              <div className="w-16 h-16 rounded-full bg-primary-green/10 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary-green">
                  <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-primary-green mb-2">12+</h3>
              <p className="text-gray-600">Countries Reached</p>
            </div>
            
            {/* Impact Metric 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-md text-center">
              <div className="w-16 h-16 rounded-full bg-primary-green/10 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-primary-green">
                  <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-primary-green mb-2">45,000+</h3>
              <p className="text-gray-600">Impacted People</p>
            </div>
            
            {/* Impact Metric 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-md text-center">
              <div className="w-16 h-16 rounded-full bg-primary-green/10 flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-4xl font-bold text-primary-green mb-2">120+</h3>
              <p className="text-gray-600">Projects Completed</p>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <Link href="/impact">
              <div className="inline-flex items-center text-primary-green hover:text-primary-green/80 font-medium gap-2 group/button">
                <span>Explore Our Impact In Detail</span>
                <div className="w-8 h-8 rounded-full bg-primary-orange flex items-center justify-center group-hover/button:bg-primary-green transition-colors">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
          </div>
        </Container>
      </section>

      {/* Floating Action Button for Filters */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-green/90 transition-colors duration-300"
        aria-label="Toggle quick filters panel"
      >
        <Filter className="w-6 h-6" />
      </button>

      {/* Quick Filters Panel */}
      <div className={`fixed bottom-0 right-0 w-64 bg-white shadow-xl rounded-t-2xl p-4 transform transition-transform duration-300 ${showFilters ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">Quick Filters</h3>
          <button 
            onClick={() => setShowFilters(false)} 
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close quick filters panel"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-2">
          {categories.map((category, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveCategory(category.name);
                setShowFilters(false);
              }}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                activeCategory === category.name
                  ? 'bg-primary-green text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-24 right-6 z-40 w-12 h-12 bg-primary-green text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-green/90 transition-all duration-300 transform hover:-translate-y-1"
          aria-label="Scroll to top of page"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
          </svg>
        </button>
      )}
    </main>
  );
};

export default ProjectsPage;