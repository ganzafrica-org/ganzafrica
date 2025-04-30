// @ts-nocheck

"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/layout/container";
import { MapPin, X, ChevronRight, Info } from "lucide-react";
import { DecoratedHeading } from "@/components/layout/headertext";
import apiClient from '@/lib/api-client';

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

const statsVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const statItemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

interface LocationInfo {
  country: string;
  location: string;
}

function parseLocation(locationString: string | undefined): LocationInfo {
  if (!locationString) return { country: 'rwanda', location: 'Rwanda' };
  
  const locationLower = locationString.toLowerCase();
  
  // Detect country - more flexible approach
  let country: string = 'other'; // Default for unknown countries
  
  // Known country mappings
  const countryMappings: Record<string, string> = {
    'rwanda': 'rwanda',
    'burkina': 'burkina',
    'burkina faso': 'burkina',
    // Add more countries as needed
  };
  
  // Try to identify country from the location string
  Object.entries(countryMappings).forEach(([keyword, countryCode]) => {
    if (locationLower.includes(keyword)) {
      country = countryCode;
    }
  });
  
  // Extract specific location if present
  let location: string = locationString;
  if (locationString && locationString.includes(',')) {
    // Take first part before comma as specific location
    // @ts-ignore
    location = locationString.split(',')[0].trim();
  }
  
  return { country, location };
}

function getMapCoordinates(locationInfo: LocationInfo) {
  const { country, location } = locationInfo;
  
  // Known specific locations - can be expanded with more locations
  const knownLocations = {
    "kigali": { 
      lat: -1.9441, 
      lng: 30.0619,
      mapPosition: { x: 380, y: 300 },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63817.18087378733!2d30.019363028729005!3d-1.944098787600761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42968f6b901%3A0xfba4f422b2a13a89!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712031042989!5m2!1sen!2sus"
    }
  };
  
  // Country defaults (used when specific location not found)
  const countryDefaults = {
    "rwanda": {
      lat: -1.9441, 
      lng: 30.0619,
      mapPosition: { x: 380, y: 300 },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63817.18087378733!2d30.019363028729005!3d-1.944098787600761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42968f6b901%3A0xfba4f422b2a13a89!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712031042989!5m2!1sen!2sus"
    },
    "burkina": {
      lat: 12.3714, 
      lng: -1.5197,
      mapPosition: { x: 320, y: 230 },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125171.40082591335!2d-1.6126624448655638!3d12.36712576629056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe2e9c23908451f%3A0x1f1d8074e9c2d0ab!2sOuagadougou%2C%20Burkina%20Faso!5e0!3m2!1sen!2sus!4v1712031172461!5m2!1sen!2sus"
    },
    "other": {
      lat: 0, 
      lng: 20,
      mapPosition: { x: 350, y: 250 },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31397.814232798383!2d20.053565!3d0.084886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1779fe8521916c39%3A0x2caec1cf01ad37f!2sAfrica!5e0!3m2!1sen!2sus!4v1681732186562!5m2!1sen!2sus"
    }
  };
  
  // Try to find exact match for the location
  const locationKey = location.toLowerCase().trim() as keyof typeof knownLocations;
  if (locationKey in knownLocations) {
    return {
      mapCoordinates: { 
        lat: knownLocations[locationKey].lat, 
        lng: knownLocations[locationKey].lng 
      },
      mapPosition: knownLocations[locationKey].mapPosition,
      mapUrl: knownLocations[locationKey].mapUrl
    };
  }
  
  // Fall back to country defaults
  if (countryDefaults[country as keyof typeof countryDefaults]) {
    return {
      mapCoordinates: { 
        lat: countryDefaults[country].lat, 
        lng: countryDefaults[country].lng 
      },
      mapPosition: countryDefaults[country].mapPosition,
      mapUrl: countryDefaults[country].mapUrl
    };
  }
  
  // Ultimate fallback to other (default for unknown countries)
  return {
    mapCoordinates: { lat: 0, lng: 20 },
    mapPosition: { x: 350, y: 250 },
    mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31397.814232798383!2d20.053565!3d0.084886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1779fe8521916c39%3A0x2caec1cf01ad37f!2sAfrica!5e0!3m2!1sen!2sus!4v1681732186562!5m2!1sen!2sus"
  };
}

interface Project {
  id: number;
  name: string;
  description: string;
  location: string;
  status: string;
  created_at: string;
  category_id: string | number;
  media?: {
    items?: { tag: string; url: string }[];
  };
  contact_person?: string;
}

interface MapCoordinates {
  lat: number;
  lng: number;
}

interface MapPosition {
  x: number;
  y: number;
}

interface MapLocation {
  id: number;
  title: string;
  description: string;
  image: string;
  country: string;
  location: string;
  address: string;
  mapCoordinates: MapCoordinates;
  mapPosition: MapPosition;
  mapUrl: string;
  contactPerson: string;
  url: string;
}

function generateMapLocations(projects: Project[]): MapLocation[] {
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return [];
  }
  
  console.log("Generating map locations for projects:", projects.length);
  
  // @ts-ignore
  return projects.map((project, index) => {
    console.log(`Processing project ${index + 1}:`, project.id, project.name, project.location);
    
    // Make sure we have some location data - use defaults if needed
    const locationString = project.location || `Project ${project.id} Location`;
    
    // Parse the location string
    const locationInfo: LocationInfo = parseLocation(locationString);
    console.log(`  Parsed location:`, locationInfo);
    
    // Calculate a unique position based on project ID to avoid overlaps
    const defaultPosition: MapPosition = {
      x: 100 + (index % 5) * 100,  // Distribute horizontally
      y: 100 + Math.floor(index / 5) * 80  // Distribute vertically
    };
    
    // Simple default map coordinates based on country
    const defaultCoordinates: Record<string, MapCoordinates> = {
      'rwanda': { lat: -1.9441, lng: 30.0619 },
      'burkina': { lat: 12.3714, lng: -1.5197 },
      'other': { lat: 0, lng: 20 }, // Africa center
      'unknown': { lat: 0, lng: 0 } // Fallback
    };
    
    // Default map URLs
    const defaultMapUrls: Record<string, string> = {
      'rwanda': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63817.18087378733!2d30.019363028729005!3d-1.944098787600761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42968f6b901%3A0xfba4f422b2a13a89!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712031042989!5m2!1sen!2sus",
      'burkina': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125171.40082591335!2d-1.6126624448655638!3d12.36712576629056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe2e9c23908451f%3A0x1f1d8074e9c2d0ab!2sOuagadougou%2C%20Burkina%20Faso!5e0!3m2!1sen!2sus!4v1712031172461!5m2!1sen!2sus",
      'other': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31397.814232798383!2d20.053565!3d0.084886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1779fe8521916c39%3A0x2caec1cf01ad37f!2sAfrica!5e0!3m2!1sen!2sus!4v1681732186562!5m2!1sen!2sus",
      'unknown': "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31397.814232798383!2d20.053565!3d0.084886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1779fe8521916c39%3A0x2caec1cf01ad37f!2sAfrica!5e0!3m2!1sen!2sus!4v1681732186562!5m2!1sen!2sus"
    };
    
    // Use defaults when needed
    const country = locationInfo.country;
    const coordinates = defaultCoordinates[country] || defaultCoordinates.unknown;
    const mapUrl = defaultMapUrls[country] || defaultMapUrls.unknown;
    
    return {
      id: project.id,
      title: project.name || 'Untitled Project',
      description: project.description || 'No description available',
      image: project.media?.items?.find(item => item.tag === 'feature')?.url || '/images/news/maize.avif',
      country: country,
      location: locationInfo.location,
      address: locationString,
      mapCoordinates: coordinates,
      mapPosition: defaultPosition,
      mapUrl: mapUrl,
      contactPerson: project.contact_person || 'Project Contact',
      url: `/projects/${project.id}`
    };
  });
}

const FoodSystemsMapSection = () => {
  // States for data
  const [selectedCountry, setSelectedCountry] = useState("rwanda");
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [projectLocations, setProjectLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapIframeRef = useRef(null);

  // Stats state - will be populated from projects data
  const [stats, setStats] = useState([
    { label: "Fellows", count: 0 },
    { label: "Projects", count: 0 }
  ]);

  // Get unique countries from projects for the dropdown
  const getUniqueCountries = () => {
    // Start with default countries
    const defaultCountries = [
      { name: 'Rwanda', value: 'rwanda' },
      { name: 'Burkina Faso', value: 'burkina' }
    ];
    
    // Add any other countries from projects
    if (projectLocations && projectLocations.length > 0) {
      const countrySet = new Set(defaultCountries.map(c => c.value));
      
      projectLocations.forEach(location => {
        if (location.country && !countrySet.has(location.country)) {
          countrySet.add(location.country);
          defaultCountries.push({
            name: location.country.charAt(0).toUpperCase() + location.country.slice(1), // Capitalize
            value: location.country
          });
        }
      });
    }
    
    return defaultCountries;
  };
  
  const countries = getUniqueCountries();

  // Update map dimensions on resize and component mount
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

  // Fetch projects from API and update map locations
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        
        // Fetch all projects
        const response = await apiClient.get('/projects');
        
        if (response.data) {
          const projectsList = response.data.projects || [];
          console.log(`Fetched ${projectsList.length} projects from API`);

          // Generate map locations from projects
          const locations = generateMapLocations(projectsList);
          console.log(`Generated ${locations.length} map locations`);
            setProjectLocations(locations);
          
          // Update stats based on projects data
          const uniqueCountries = new Set();
          const uniqueCommunities = new Set();
          
          projectsList.forEach(project => {
            if (project.location) {
              const locationInfo = parseLocation(project.location);
              uniqueCountries.add(locationInfo.country);
              uniqueCommunities.add(locationInfo.location);
            }
          });

          setStats([
            { label: "Fellows", count: projectsList.length * 2 }, // Assuming 2 fellows per project
            { label: "Projects", count: projectsList.length }
          ]);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);

  // Don't filter by country for the map - show all projects
  // Instead, just set initial visibility based on selected country 
  const filteredLocations = projectLocations.filter(
    (location) => location.country === selectedCountry
  );

  // Get projects for the selected country (for initial view)
  const selectedCountryProjects = projectLocations.filter(
    (location) => location.country === selectedCountry
  );

  // Get current project for map
  const currentProject = selectedProject 
    ? projectLocations.find(p => p.id === selectedProject) 
    : null;

  // Event handlers
  const handleCountryChange = (e) => {
    setSelectedCountry(e.target.value);
    setSelectedProject(null);
    setExpandedCard(null);
  };

  const handleProjectClick = (projectId) => {
    if (selectedProject === projectId) {
      setExpandedCard(expandedCard === projectId ? null : projectId);
    } else {
      setSelectedProject(projectId);
      setExpandedCard(null);
    }
  };

  const handleExpandClick = (projectId, e) => {
    e.stopPropagation();
    setExpandedCard(expandedCard === projectId ? null : projectId);
  };

  // Make sure project positions are always visible within the map dimensions
  const getMarkerPosition = (position) => {
    if (!position || !mapDimensions.width || !mapDimensions.height) {
      // Default positions distributed across the map if position data is missing
      const defaultX = Math.random() * 0.8 * (mapDimensions.width || 600) + 0.1 * (mapDimensions.width || 600);
      const defaultY = Math.random() * 0.8 * (mapDimensions.height || 400) + 0.1 * (mapDimensions.height || 400);
      return { x: defaultX, y: defaultY };
    }
    
    // Scale position from reference dimensions (600x400) to actual map dimensions
    const x = (position.x / 600) * mapDimensions.width;
    const y = (position.y / 400) * mapDimensions.height;
    
    // Ensure positions are within map boundaries
    return { 
      x: Math.min(Math.max(x, 50), mapDimensions.width - 50),
      y: Math.min(Math.max(y, 50), mapDimensions.height - 50)
    };
  };

  return (
    <section className="py-16 bg-white">
      <Container>
        <motion.div
          variants={fadeIn}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span>Our Food Systems actions </span>
            <span className="text-primary-green">across Africa</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            GanzAfrica operates in multiple countries, equipping young professionals
            with the skills and opportunities to drive meaningful change in
            Africa's agri-food systems.
          </p>
        </motion.div>

        {loading ? (
          <div className="w-full h-64 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="flex flex-col items-center mb-10">
            {/* Country selector and highlights button */}
            <div className="flex justify-center items-center gap-4 mb-6">
              <div className="relative inline-block w-72">
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
            </div>

            {/* Stats grid */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl mx-auto mb-8"
              variants={statsVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
            >
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  className="text-center"
                  variants={statItemVariants}
                >
                  <p className="text-3xl font-bold text-green-700">
                    {stat.count}
                  </p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        )}

        {/* Map visualization */}
        <motion.div
          className="relative h-96 w-full rounded-lg overflow-hidden shadow-md border-2 border-gray-300"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          ref={mapRef}
        >
          {/* Google Maps iframe */}
          <iframe
            ref={mapIframeRef}
            src={currentProject ? 
                `${currentProject.mapUrl}&markers=color:red%7Clabel:G%7C${currentProject.mapCoordinates.lat},${currentProject.mapCoordinates.lng}` : 
                selectedCountryProjects.length > 0 ?
                  selectedCountryProjects[0]?.mapUrl ?? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31397.814232798383!2d20.053565!3d0.084886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1779fe8521916c39%3A0x2caec1cf01ad37f!2sAfrica!5e0!3m2!1sen!2sus!4v1681732186562!5m2!1sen!2sus" :
                  // Fallback maps for each country with no markers if no projects
                  selectedCountry === 'burkina' ?
                    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125171.40082591335!2d-1.6126624448655638!3d12.36712576629056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe2e9c23908451f%3A0x1f1d8074e9c2d0ab!2sOuagadougou%2C%20Burkina%20Faso!5e0!3m2!1sen!2sus!4v1712031172461!5m2!1sen!2sus" :
                    selectedCountry === 'rwanda' ?
                      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63817.18087378733!2d30.019363028729005!3d-1.944098787600761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42968f6b901%3A0xfba4f422b2a13a89!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712031042989!5m2!1sen!2sus" :
                      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31397.814232798383!2d20.053565!3d0.084886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1779fe8521916c39%3A0x2caec1cf01ad37f!2sAfrica!5e0!3m2!1sen!2sus!4v1681732186562!5m2!1sen!2sus"
            }
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="GanzAfrica Location"
          ></iframe>

          {/* Project markers */}
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
                      <div className={`relative ${isExpanded ? "h-32" : "h-24"}`}>
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
        </motion.div>

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-gray-600">
          Click on a project marker to view details. The map will zoom to
          the selected location.
        </div>
      </Container>
    </section>
  );
};

export default FoodSystemsMapSection;