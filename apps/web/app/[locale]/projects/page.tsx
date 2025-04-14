"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Container from "@/components/layout/container";
import Link from "next/link";
import {
  ArrowRight,
  Play,
  Volume2,
  Maximize,
  Search,
  Filter,
  MapPin,
  X,
  ChevronRight,
  ExternalLink,
  Info,
} from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { DecoratedHeading } from "@/components/layout/headertext";
import { default as HeaderBelt } from "@/components/layout/headerBelt";
import { FC } from "react";
import {
  LandGovernanceIcon,
  SustainableAgricultureIcon,
  ClimateAdaptationIcon,
  TechnologyIcon,
} from "@/components/ui/icons";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
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
  };
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

// Add this interface with your other interfaces
interface ProjectCategoryProps {
  name: string;
  icon: React.ReactNode;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

const ProjectCategory: FC<ProjectCategoryProps> = ({
  name,
  icon,
  count,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between px-4 py-3 rounded-lg w-full transition-all duration-300 ${
        isActive
          ? "bg-primary-green text-white shadow-md"
          : "bg-white hover:bg-gray-50 text-gray-700"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isActive ? "bg-white" : "bg-primary-green/10"
          } text-primary-green`}
        >
          {icon}
        </div>
        <span className="font-medium">{name}</span>
      </div>
      <span
        className={`text-sm ${isActive ? "bg-white text-primary-green" : "bg-gray-100 text-gray-600"} px-2 py-0.5 rounded-full`}
      >
        {count}
      </span>
    </button>
  );
};

// First add the interface
interface ProjectCardProps {
  project: Project;
}

// Then add the ProjectCard component
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
                src={project.image || "/images/default-image.jpg"}
                alt={project.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Project title at the bottom */}
              <div className="absolute bottom-4 left-4 z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white text-xl font-bold">
                  {project.title}
                </h3>
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            <span className="font-medium">{project.location}</span>
          </div>

          <div className="flex items-center text-primary-green group-hover:text-primary-green/80 transition-colors">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
            </svg>
            <span className="font-medium">
              {project.impact?.farmers.toLocaleString()}+ Impacted people
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// Sample projects data
const projects: Project[] = [
  {
    id: 1,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-1.jpg",
    description:
      "A digital platform that helps farmers track crop performance, predict yields, and manage resources efficiently.",
    status: "In Progress",
    category: "Food System",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 8700,
    },
  },
  {
    id: 2,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-2.jpg",
    description:
      "Research initiative exploring eco-friendly farming methods that maintain soil health and biodiversity.",
    status: "Completed",
    category: "Food System",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 5300,
    },
  },
  {
    id: 3,
    title: "Sustainable Farming Initiative",
    image: "/images/news/maize.avif",
    description:
      "Supporting farmers to adapt to climate change through resilient farming techniques and crop diversification.",
    status: "Active",
    category: "Food System",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 9500,
    },
  },
  {
    id: 4,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-1.jpg",
    description:
      "Digital system to document and secure land rights for smallholder farmers and communities.",
    status: "In Progress",
    category: "Co-creation",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 12000,
    },
  },
  {
    id: 5,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-2.jpg",
    description:
      "Platform leveraging big data to provide insights for agricultural planning and policy-making.",
    status: "Planning",
    category: "Co-creation",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 4200,
    },
  },
  {
    id: 6,
    title: "Sustainable Farming Initiative",
    image: "/images/news/maize.avif",
    description:
      "Developing community-owned farms to improve food security and provide income opportunities.",
    status: "Active",
    category: "Climate Adaptation",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 7800,
    },
  },
  {
    id: 7,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-1.jpg",
    description:
      "Systematic soil testing and monitoring to improve agricultural productivity and sustainability.",
    status: "Active",
    category: "Climate Adaptation",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 8500,
    },
  },
  {
    id: 8,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-2.jpg",
    description:
      "Comprehensive water management for agricultural sustainability in drought-prone regions.",
    status: "In Progress",
    category: "Climate Adaptation",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 6200,
    },
  },
  {
    id: 9,
    title: "Sustainable Farming Initiative",
    image: "/images/news/maize.avif",
    description:
      "Preserving and digitizing traditional farming practices and indigenous agricultural knowledge.",
    status: "Planning",
    category: "Co-creation",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 5800,
    },
  },
  {
    id: 10,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-1.jpg",
    description:
      "Digital marketplace connecting small-scale farmers directly to buyers and value chain opportunities.",
    status: "Active",
    category: "Data & Evidence",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 9800,
    },
  },
  {
    id: 11,
    title: "Sustainable Farming Initiative",
    image: "/images/news/team-members-2.jpg",
    description:
      "Practices for livestock farming that minimize environmental impact while maximizing productivity.",
    status: "In Review",
    category: "Data & Evidence",
    location: "Rwanda",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 11500,
    },
  },
  {
    id: 12,
    title: "Sustainable Farming Initiative",
    image: "/images/news/maize.avif",
    description:
      "Training rural communities to build resilience against climate change impacts on agriculture.",
    status: "Active",
    category: "Co-creation",
    location: "Burkina Faso",
    impact: {
      communities: 2,
      farmers: 3200,
      hectares: 10200,
    },
  },
];

// Categories data
const categories = [
  {
    name: "All Projects",
    icon: <ArrowRight className="w-5 h-5" />,
    count: projects.length,
  },
  {
    name: "Food System",
    icon: <TechnologyIcon className="w-5 h-5" />,
    count: projects.filter((p) => p.category === "Food System").length,
  },
  {
    name: "Climate Adaptation",
    icon: <SustainableAgricultureIcon className="w-5 h-5" />,
    count: projects.filter((p) => p.category === "Climate Adaptation").length,
  },
  {
    name: "Data & Evidence",
    icon: <ClimateAdaptationIcon className="w-5 h-5" />,
    count: projects.filter((p) => p.category === "Data & Evidence").length,
  },
  {
    name: "Co-creation",
    icon: <LandGovernanceIcon className="w-5 h-5" />,
    count: projects.filter((p) => p.category === "Co-creation").length,
  },
];

const ProjectsPage = (): JSX.Element => {
  // 1. First declare all state variables
  const [selectedCountry, setSelectedCountry] = useState("rwanda");
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const mapRef = useRef<HTMLDivElement>(null);
  const mapIframeRef = useRef<HTMLIFrameElement>(null);

  // 2. Then declare your constant data
  const stats = [
    { label: "Fellows", count: 20 },
    { label: "Projects", count: "20+" },
    { label: "Communities", count: 15 },
    { label: "Countries", count: 2 },
  ];

  const countries = [
    { name: "Rwanda", value: "rwanda" },
    { name: "Burkina Faso", value: "burkina" },
  ];

  const projectLocations = [
    {
      id: 1,
      title: "Sustainable Farming Initiative",
      description:
        "The agricultural training program targets new sustainable farming practices to improve crop yields and food security.",
      image: "/images/maize.avif",
      country: "rwanda",
      location: "Musanze",
      address: "Kinigi Sector, Musanze District, Rwanda",
      mapCoordinates: { lat: -1.4969, lng: 29.6259 },
      mapPosition: { x: 300, y: 180 },
      mapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63776.95946876503!2d29.591339705532292!3d-1.4968819286622052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dc4e45426592c5%3A0x7bf59f53e5c2b097!2sMusanze%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712019657396!5m2!1sen!2sus",
      contactPerson: "Jean Bosco",
      url: "/projects/sustainable-farming",
    },
    {
      id: 2,
      title: "Rural Development Program",
      description:
        "Supporting rural communities with agricultural resources and training to create sustainable livelihoods.",
      image: "/images/maize.avif",
      country: "rwanda",
      location: "Nyabihu",
      address: "Mukamira Sector, Nyabihu District, Rwanda",
      mapCoordinates: { lat: -1.6579, lng: 29.5006 },
      mapPosition: { x: 220, y: 250 },
      mapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63780.843420073026!2d29.498345699999998!3d-1.6578639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dc5918838703c5%3A0xfb77da79fea2e4eb!2sNyabihu%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712019752780!5m2!1sen!2sus",
      contactPerson: "Marie Claire",
      url: "/projects/rural-development",
    },
    {
      id: 3,
      title: "Urban Innovation Hub",
      description:
        "Developing urban agricultural technologies and training young entrepreneurs in modern farming techniques.",
      image: "/images/maize.avif",
      country: "rwanda",
      location: "Kigali",
      address: "KN 5 Rd, Kigali Business Center, Kigali, Rwanda",
      mapCoordinates: { lat: -1.9441, lng: 30.0619 },
      mapPosition: { x: 380, y: 300 },
      mapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63817.18087378733!2d30.019363028729005!3d-1.944098787600761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42968f6b901%3A0xfba4f422b2a13a89!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712031042989!5m2!1sen!2sus",
      contactPerson: "Emmanuel Nkurunziza",
      url: "/projects/urban-innovation",
    },
    {
      id: 4,
      title: "Agribusiness Accelerator",
      description:
        "Supporting agricultural entrepreneurs to develop sustainable businesses and increase productivity.",
      image: "/images/maize.avif",
      country: "burkina",
      location: "Ouagadougou",
      address: "Ouagadougou, Burkina Faso",
      mapCoordinates: { lat: 12.3714, lng: -1.5197 },
      mapPosition: { x: 320, y: 230 },
      mapUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125171.40082591335!2d-1.6126624448655638!3d12.36712576629056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe2e9c23908451f%3A0x1f1d8074e9c2d0ab!2sOuagadougou%2C%20Burkina%20Faso!5e0!3m2!1sen!2sus!4v1712031172461!5m2!1sen!2sus",
      contactPerson: "Ibrahim Ouedraogo",
      url: "/projects/agribusiness-burkina",
    },
  ];

  // 3. Then declare derived/computed values that depend on state
  const filteredLocations = projectLocations.filter(
    (location) => location.country === selectedCountry,
  );

  const currentProject = selectedProject
    ? projectLocations.find((p) => p.id === selectedProject)
    : null;

  // 4. Then declare your event handlers
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCountry(e.target.value);
    setSelectedProject(null);
    setExpandedCard(null);
  };

  const handleProjectClick = (projectId: number) => {
    if (selectedProject === projectId) {
      setExpandedCard(expandedCard === projectId ? null : projectId);
    } else {
      setSelectedProject(projectId);
      setExpandedCard(null);
    }
  };

  const handleExpandClick = (projectId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCard(expandedCard === projectId ? null : projectId);
  };

  const getMarkerPosition = (position: { x: number; y: number }) => {
    const x = (position.x / 600) * mapDimensions.width;
    const y = (position.y / 400) * mapDimensions.height;
    return { x, y };
  };

  // 5. Then declare your effects
  useEffect(() => {
    const updateMapDimensions = () => {
      if (mapRef.current) {
        setMapDimensions({
          width: mapRef.current.offsetWidth,
          height: mapRef.current.offsetHeight,
        });
      }
    };

    updateMapDimensions();
    window.addEventListener("resize", updateMapDimensions);

    return () => {
      window.removeEventListener("resize", updateMapDimensions);
    };
  }, []);

  const [activeCategory, setActiveCategory] = useState<string>("All Projects");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredProjects, setFilteredProjects] = useState<Project[]>(projects);
  const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const projectsPerPage = 6;

  const bannerRef = useRef<HTMLDivElement>(null);
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

  // Filter projects based on category, search term, and status
  useEffect(() => {
    let result = projects;

    // Filter by category
    if (activeCategory !== "All Projects") {
      result = result.filter((project) => project.category === activeCategory);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (project) =>
          project.title.toLowerCase().includes(term) ||
          project.description.toLowerCase().includes(term) ||
          project.location?.toLowerCase().includes(term) ||
          project.category.toLowerCase().includes(term),
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter(
        (project) =>
          project.status.toLowerCase().replace(/\s+/g, "-") === statusFilter,
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
        ease: "power3.out",
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
          toggleActions: "play none none reverse",
        },
      });
    }

    // Animate category buttons
    gsap.from(".category-button", {
      x: -20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      ease: "power3.out",
      delay: 0.5,
    });
  }, [isPageLoaded, filteredProjects]);

  // Handle scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Add a class to hide content until page is loaded
  const pageClass = isPageLoaded
    ? "opacity-100 transition-opacity duration-500"
    : "opacity-0";

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
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl  mb-2 leading-tight">
            <span>Turning</span>{" "}
            <span className="text-yellow-400 font-bold ">Ideas</span>{" "}
            <span>Into</span> <br />
            <span>Action</span>
          </h1>
          <h2 className="text-yellow-400  text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6">
            PROJECTS
          </h2>
        </div>
      </section>

      {/* Banner Section */}
      <div ref={bannerRef} className="w-full overflow-hidden">
        <div className="flex justify-center">
          <HeaderBelt />
        </div>
      </div>

      {/* Projects Section */}
      <Container>
        <div className="py-10">
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
                  <div key={category.name} className="category-button">
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
                  <div
                    ref={projectsGridRef}
                    className="grid grid-cols-1 md:grid-cols-2 gap-8"
                  >
                    {currentProjects.map((project) => (
                      <div
                        key={`project-${project.id}`}
                        className="project-card"
                      >
                        <ProjectCard project={project} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-10 text-center">
                    <div className="w-16 h-16 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-2">
                      No projects found
                    </h3>
                    <p className="text-gray-500">
                      Try adjusting your search or filter criteria to find what
                      you're looking for.
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
                          ? "bg-primary-green text-white"
                          : "border border-gray-300 text-gray-600 hover:border-primary-green hover:text-primary-green"
                      }`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}

                  {currentPage < totalPages && (
                    <>
                      {currentPage < totalPages - 1 && (
                        <span className="mx-1">...</span>
                      )}
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

      {/* Map Section */}
      <section className="w-full bg-white py-8 px-4">
        <Container>
          {/* Styled header section */}
          <div className="text-center">
            <div className="flex justify-center mb-10">
              <DecoratedHeading firstText="Where We" secondText="Work" />
            </div>

            <p className="text-gray-600 mb-6 max-w-2xl mx-auto text-center">
              GanzAfrica operates in two countries, equipping young
              professionals with the skills and opportunities to drive
              meaningful change in Africa's agri-food systems.
            </p>

            {/* Country selector and highlights button */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="relative inline-block w-56">
                <select
                  value={selectedCountry}
                  onChange={handleCountryChange}
                  className="appearance-none bg-white border border-green-700 rounded-md py-2 pl-3 pr-10 w-full text-gray-700 focus:outline-none"
                >
                  {countries.map((country) => (
                    <option key={country.value} value={country.value}>
                      {country.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-green-700">
                  <svg
                    className="h-4 w-4 fill-current"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <button className="bg-primary-orange hover:bg-yellow-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                Highlights of our work
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-4 gap-6 max-w-xl mx-auto mb-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <p className="text-3xl font-bold text-green-700">
                    {stat.count}
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Map section with project locations */}
          <div className="py-2 bg-white">
            <div
              className="h-96 w-full rounded-lg overflow-hidden border-2 border-gray-300 relative"
              ref={mapRef}
            >
              {/* Google Maps iframe with marker */}
              <iframe
                ref={mapIframeRef}
                src={
                  currentProject
                    ? `${currentProject.mapUrl}&markers=color:red%7Clabel:G%7C${currentProject.mapCoordinates.lat},${currentProject.mapCoordinates.lng}`
                    : filteredLocations[0]?.mapUrl
                }
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="GanzAfrica Location"
              ></iframe>

              {/* Project markers with in-map cards */}
              {filteredLocations.map((location) => {
                const position = getMarkerPosition(location.mapPosition);
                const isSelected = selectedProject === location.id;
                const isExpanded = expandedCard === location.id;

                return (
                  <div
                    key={location.id}
                    className="absolute z-10"
                    style={{
                      left: `${position.x}px`,
                      top: `${position.y}px`,
                    }}
                  >
                    {/* Project marker */}
                    <div
                      className="relative cursor-pointer"
                      onClick={() => handleProjectClick(location.id)}
                    >
                      {/* Marker with profile image */}
                      <div
                        className={`rounded-full overflow-hidden transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${isSelected ? "scale-110" : ""}`}
                        style={{
                          width: "50px",
                          height: "50px",
                          border: `3px solid ${isSelected ? "#F59E0B" : "#047857"}`,
                          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                        }}
                      >
                        <img
                          src={location.image}
                          alt={location.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Location label */}
                      {isSelected && (
                        <div
                          className="absolute whitespace-nowrap text-center mt-1 text-xs font-medium bg-white px-2 py-1 rounded-md shadow-sm -translate-x-1/2"
                          style={{ top: "100%", left: "50%" }}
                        >
                          {location.location}
                        </div>
                      )}
                    </div>

                    {/* Project card */}
                    {isSelected && (
                      <div
                        className={`absolute bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 z-20 ${isExpanded ? "w-64" : "w-52"}`}
                        style={{
                          top: "-105px",
                          left: "-110px",
                          transform: isExpanded ? "scale(1.1)" : "scale(1)",
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Card content */}
                        <div className="relative">
                          {/* Project image */}
                          <div
                            className={`relative ${isExpanded ? "h-32" : "h-24"}`}
                          >
                            <img
                              src={location.image}
                              alt={location.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-0.5 text-xs font-semibold rounded">
                              {location.location}
                            </div>

                            {/* Expand/collapse button */}
                            <button
                              className="absolute bottom-2 right-2 bg-white rounded-full p-1 shadow-sm hover:bg-gray-100"
                              onClick={(e) => handleExpandClick(location.id, e)}
                            >
                              {isExpanded ? (
                                <X className="w-4 h-4 text-gray-600" />
                              ) : (
                                <Info className="w-4 h-4 text-gray-600" />
                              )}
                            </button>
                          </div>

                          {/* Project info */}
                          <div className="p-3">
                            <h3 className="font-bold text-green-700 text-sm mb-1 line-clamp-1">
                              {location.title}
                            </h3>

                            {isExpanded ? (
                              <>
                                <p className="text-xs text-gray-600 mb-2">
                                  {location.description}
                                </p>
                                <div className="flex items-start mb-2">
                                  <MapPin className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                  <p className="text-xs text-gray-600 ml-1">
                                    {location.address}
                                  </p>
                                </div>
                                <div className="text-xs text-gray-600 mb-3">
                                  Contact: {location.contactPerson}
                                </div>
                                <a
                                  href={location.url}
                                  className="text-xs text-yellow-600 hover:text-yellow-800 font-medium inline-flex items-center"
                                >
                                  Learn more
                                  <ChevronRight className="ml-1 w-3 h-3" />
                                </a>
                              </>
                            ) : (
                              <>
                                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                  {location.description}
                                </p>
                                <a
                                  href={location.url}
                                  className="text-xs text-yellow-600 hover:text-yellow-800 font-medium"
                                >
                                  View details
                                </a>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Instructions */}
            <div className="mt-4 text-center text-sm text-gray-600">
              Click on a project marker to view details. The map will zoom to
              the selected location.
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
};

export default ProjectsPage;
