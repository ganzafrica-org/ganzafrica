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

// Location parsing and mapping utilities
function parseLocation(locationString) {
  if (!locationString) return { country: 'rwanda', location: 'Rwanda' };
  
  const locationLower = locationString.toLowerCase();
  
  // Detect country - more flexible approach
  let country = 'other'; // Default for unknown countries
  
  // Known country mappings
  const countryMappings = {
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
  let location = locationString;
  if (locationString && locationString.includes(',')) {
    // Take first part before comma as specific location
    location = locationString.split(',')[0].trim();
  }
  
  return { country, location };
}

function getMapCoordinates(locationInfo) {
  const { country, location } = locationInfo;
  
  // Known specific locations - can be expanded with more locations
  const knownLocations = {
    "kigali": { 
      lat: -1.9441, 
      lng: 30.0619,
      mapPosition: { x: 380, y: 300 },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63817.18087378733!2d30.019363028729005!3d-1.944098787600761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42968f6b901%3A0xfba4f422b2a13a89!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712031042989!5m2!1sen!2sus"
    },
    "musanze": { 
      lat: -1.4969, 
      lng: 29.6259,
      mapPosition: { x: 300, y: 180 },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63776.95946876503!2d29.591339705532292!3d-1.4968819286622052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dc4e45426592c5%3A0x7bf59f53e5c2b097!2sMusanze%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712019657396!5m2!1sen!2sus"
    },
    "nyabihu": { 
      lat: -1.6579, 
      lng: 29.5006,
      mapPosition: { x: 220, y: 250 },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63780.843420073026!2d29.498345699999998!3d-1.6578639!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dc5918838703c5%3A0xfb77da79fea2e4eb!2sNyabihu%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712019752780!5m2!1sen!2sus"
    },
    "ouagadougou": { 
      lat: 12.3714, 
      lng: -1.5197,
      mapPosition: { x: 320, y: 230 },
      mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125171.40082591335!2d-1.6126624448655638!3d12.36712576629056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe2e9c23908451f%3A0x1f1d8074e9c2d0ab!2sOuagadougou%2C%20Burkina%20Faso!5e0!3m2!1sen!2sus!4v1712031172461!5m2!1sen!2sus"
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
  const locationKey = location.toLowerCase().trim();
  if (knownLocations[locationKey]) {
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
  if (countryDefaults[country]) {
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

// Distribute project positions evenly across the map
function distributeProjectPositions(projects, country) {
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return [];
  }
  
  // Define map areas by country
  const mapAreas = {
    "rwanda": {
      width: 600,
      height: 400,
      xOffset: 150,
      yOffset: 100,
      spacing: 100 // Space between projects
    },
    "burkina": {
      width: 600,
      height: 400,
      xOffset: 150,
      yOffset: 100,
      spacing: 100
    },
    "other": {
      width: 600,
      height: 400,
      xOffset: 150,
      yOffset: 100,
      spacing: 100
    }
  };
  
  const mapArea = mapAreas[country] || mapAreas.other;
  const countryProjects = projects.filter(p => p.country === country);
  
  // Create a grid layout
  const projectsPerRow = Math.ceil(Math.sqrt(countryProjects.length));
  const cellWidth = mapArea.width / projectsPerRow;
  const cellHeight = mapArea.height / Math.ceil(countryProjects.length / projectsPerRow);
  
  // Place each project in a cell
  return countryProjects.map((project, index) => {
    const row = Math.floor(index / projectsPerRow);
    const col = index % projectsPerRow;
    
    // Add some randomness for natural distribution
    const randomOffset = {
      x: Math.random() * (cellWidth * 0.3) - (cellWidth * 0.15),
      y: Math.random() * (cellHeight * 0.3) - (cellHeight * 0.15)
    };
    
    const x = mapArea.xOffset + (col * cellWidth) + (cellWidth / 2) + randomOffset.x;
    const y = mapArea.yOffset + (row * cellHeight) + (cellHeight / 2) + randomOffset.y;
    
    return {
      ...project,
      mapPosition: { x, y }
    };
  });
}

function generateMapLocations(projects) {
  if (!projects || !Array.isArray(projects) || projects.length === 0) {
    return [];
  }
  
  const projectsWithBasicData = projects.map((project, index) => {
    // Make sure we have some location data - use defaults if needed
    const locationString = project.location || `Project ${project.id} Location`;
    
    // Parse the location string
    const locationInfo = parseLocation(locationString);
    
    // Get map coordinates and URL based on location
    const { mapCoordinates, mapPosition, mapUrl } = getMapCoordinates(locationInfo);
    
    // Get feature image or use fallback
    const image = project.media?.items?.find(item => item.tag === 'feature')?.url || '/images/news/maize.avif';
    
    // Create and return location object
    return {
      id: project.id,
      title: project.name || 'Untitled Project',
      description: project.description || 'No description available',
      image: image,
      country: locationInfo.country,
      location: locationInfo.location,
      address: locationString,
      mapCoordinates: mapCoordinates,
      mapPosition: mapPosition,
      mapUrl: mapUrl,
      contactPerson: project.contact_person || 'Project Contact',
      url: `/projects/${project.id}`
    };
  });
  
  // Group projects by country
  const countries = [...new Set(projectsWithBasicData.map(p => p.country))];
  let allProjectsDistributed = [];
  
  // Distribute projects for each country
  countries.forEach(country => {
    const countryProjects = distributeProjectPositions(projectsWithBasicData, country);
    allProjectsDistributed = [...allProjectsDistributed, ...countryProjects];
  });
  
  return allProjectsDistributed;
}

// Get feature image from project media
const getFeatureImage = (project) => {
  if (project.media && project.media.items && project.media.items.length > 0) {
    const featureImage = project.media.items.find((item) => item.tag === 'feature');
    if (featureImage) {
      return featureImage.url;
    }
  }
  // Return placeholder images in a pattern based on project ID
  const imageIndex = (project.id % 3) + 1;
  return `/images/news/team-members-${imageIndex}.jpg`;
};

const FoodSystemsMapSection = () => {
  const [selectedCountry, setSelectedCountry] = useState("rwanda");
  const [selectedProject, setSelectedProject] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);
  const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
  const [projectLocations, setProjectLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [countries, setCountries] = useState([
    { name: "Rwanda", value: "rwanda" },
    { name: "Burkina Faso", value: "burkina" }
  ]);
  const [stats, setStats] = useState([
    { label: "Fellows", count: 0 },
    { label: "Projects", count: 0 },
    { label: "Countries", count: 0 }
  ]);

  const mapRef = useRef(null);
  const mapIframeRef = useRef(null);
  
  // Fetch map data including projects and fellows from API
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        
        // Fetch both projects and fellows data in parallel
        // Only fetch published projects for the website
        const [projectsResponse, fellowsResponse] = await Promise.all([
          apiClient.get('/projects', {
            params: {
              is_published: true
            }
          }),
          apiClient.get('/fellows')
        ]);
        
        const projectsList = projectsResponse.data?.projects || [];
        const fellowsList = fellowsResponse.data?.fellows || [];
        
        if (projectsList.length > 0 || fellowsList.length > 0) {
          // Generate map locations from projects
          const locations = generateMapLocations(projectsList);
          setProjectLocations(locations);
          
          // Calculate stats for the selected country
          const countryProjects = projectsList.filter(p => {
            const locationInfo = parseLocation(p.location);
            return locationInfo.country === selectedCountry;
          });
          
          const countryFellows = fellowsList.filter(f => {
            const locationInfo = parseLocation(f.location || '');
            return locationInfo.country === selectedCountry;
          });
          
          // Update stats with actual data
          setStats([
            { label: "Fellows", count: countryFellows.length },
            { label: "Projects", count: countryProjects.length },
            { label: "Countries", count: 2 }
          ]);
          
          // Update countries list based on data
          const countriesSet = new Set();
          
          projectsList.forEach(project => {
            if (project.location) {
              const locationInfo = parseLocation(project.location);
              countriesSet.add(locationInfo.country);
            }
          });
          
          const uniqueCountries = Array.from(countriesSet).map(countryCode => {
            const name = countryCode === 'rwanda' ? 'Rwanda' : 
                      countryCode === 'burkina' ? 'Burkina Faso' : 
                      countryCode.charAt(0).toUpperCase() + countryCode.slice(1);
            return { name, value: countryCode };
          });
          
          // Make sure we always have Rwanda and Burkina Faso in the list
          const defaultCountries = [
            { name: 'Rwanda', value: 'rwanda' },
            { name: 'Burkina Faso', value: 'burkina' }
          ];
          
          const countryValues = uniqueCountries.map(c => c.value);
          defaultCountries.forEach(defaultCountry => {
            if (!countryValues.includes(defaultCountry.value)) {
              uniqueCountries.push(defaultCountry);
            }
          });
          
          setCountries(uniqueCountries);
        }
      } catch (error) {
        console.error('Error fetching map data:', error);
        
        // For demonstration, generate mock data if API fails
        const mockProjects = [
          {
            id: 1,
            name: "Sustainable Farming Initiative",
            description: "The agricultural training program targets new sustainable farming practices to improve crop yields and food security.",
            location: "Musanze, Rwanda",
            contact_person: "Jean Bosco"
          },
          {
            id: 2,
            name: "Rural Development Program",
            description: "Supporting rural communities with agricultural resources and training to create sustainable livelihoods.",
            location: "Nyabihu, Rwanda",
            contact_person: "Marie Claire"
          },
          {
            id: 3,
            name: "Agribusiness Accelerator",
            description: "Supporting agricultural entrepreneurs to develop sustainable businesses and increase productivity.",
            location: "Ouagadougou, Burkina Faso",
            contact_person: "Ibrahim Ouedraogo"
          },
          {
            id: 4,
            name: "Climate Adaptation Project",
            description: "Helping farmers adapt to changing climate conditions with resilient crop varieties and practices.",
            location: "Kigali, Rwanda",
            contact_person: "Alice Mutoni"
          }
        ];
        
        const locations = generateMapLocations(mockProjects);
        setProjectLocations(locations);
        
        // Filter mock data by selected country
        const countrySpecificMockProjects = mockProjects.filter(p => {
          const locationInfo = parseLocation(p.location);
          return locationInfo.country === selectedCountry;
        });
        
        setStats([
          { label: "Fellows", count: 0 }, // No mock fellows, just show 0 if API fails
          { label: "Projects", count: countrySpecificMockProjects.length },
          { label: "Countries", count: 2 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMapData();
  }, [selectedCountry]);
  
  // Filtered locations based on selected country
  const filteredLocations = projectLocations.filter(
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
    
    // When changing country, update the iframe URL to show the country
    if (mapIframeRef.current) {
      const countryProject = projectLocations.find(p => p.country === e.target.value);
      if (countryProject) {
        mapIframeRef.current.src = countryProject.mapUrl;
      }
    }
  };

  const handleProjectClick = (projectId) => {
    const project = projectLocations.find(p => p.id === projectId);
    
    if (selectedProject === projectId) {
      setExpandedCard(expandedCard === projectId ? null : projectId);
    } else {
      setSelectedProject(projectId);
      setExpandedCard(null);
      
      // Update the iframe to zoom to the exact project location
      if (mapIframeRef.current && project) {
        // Create a URL that centers on the exact coordinates with a higher zoom level
        const zoom = 14; // Higher zoom level for better detail
        const markerLabel = project.location.substring(0, 1).toUpperCase(); // Use first letter of location as marker label
        
        mapIframeRef.current.src = 
          `${project.mapUrl}&center=${project.mapCoordinates.lat},${project.mapCoordinates.lng}&zoom=${zoom}&markers=color:red%7Clabel:${markerLabel}%7C${project.mapCoordinates.lat},${project.mapCoordinates.lng}`;
      }
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
    
    // Ensure positions are within map boundaries with some padding
    return { 
      x: Math.min(Math.max(x, 50), mapDimensions.width - 50),
      y: Math.min(Math.max(y, 50), mapDimensions.height - 50)
    };
  };

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
    
    // Use ResizeObserver for more accurate size tracking
    if (typeof ResizeObserver !== 'undefined' && mapRef.current) {
      const resizeObserver = new ResizeObserver(updateMapDimensions);
      resizeObserver.observe(mapRef.current);
      
      return () => {
        if (mapRef.current) resizeObserver.unobserve(mapRef.current);
      };
    } else {
      // Fallback to window resize event
      window.addEventListener("resize", updateMapDimensions);
      return () => {
        window.removeEventListener("resize", updateMapDimensions);
      };
    }
  }, []);

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
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-8">
              <motion.div
                className="relative inline-block w-full sm:w-56"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
              >
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
              </motion.div>

              <motion.button
                className="bg-primary-green hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors w-full sm:w-auto"
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Highlights of our work
              </motion.button>
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
          {/* Google Maps iframe with marker */}
          <iframe
            ref={mapIframeRef}
            src={
              currentProject
                ? `${currentProject.mapUrl}&center=${currentProject.mapCoordinates.lat},${currentProject.mapCoordinates.lng}&zoom=14&markers=color:red%7Clabel:${currentProject.location.substring(0, 1).toUpperCase()}%7C${currentProject.mapCoordinates.lat},${currentProject.mapCoordinates.lng}`
                : filteredLocations.length > 0
                ? filteredLocations[0]?.mapUrl
                : selectedCountry === 'burkina'
                  ? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125171.40082591335!2d-1.6126624448655638!3d12.36712576629056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe2e9c23908451f%3A0x1f1d8074e9c2d0ab!2sOuagadougou%2C%20Burkina%20Faso!5e0!3m2!1sen!2sus!4v1712031172461!5m2!1sen!2sus"
                  : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63817.18087378733!2d30.019363028729005!3d-1.944098787600761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42968f6b901%3A0xfba4f422b2a13a89!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712031042989!5m2!1sen!2sus"
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
                      {/* Marker with profile image - enhanced visibility */}
                      <div
                        className={`rounded-full overflow-hidden transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${isSelected ? "scale-110" : ""}`}
                        style={{
                          width: "60px",
                          height: "60px",
                          border: `4px solid ${isSelected ? "#F59E0B" : "#047857"}`,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                          zIndex: isSelected ? 20 : 10,
                        }}
                      >
                        <img
                          src={location.image}
                          alt={location.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
    
                      {/* Location label - always visible */}
                      <div
                        className={`absolute whitespace-nowrap text-center mt-1 text-xs font-medium bg-white px-2 py-1 rounded-md shadow-md -translate-x-1/2 transition-all duration-300 ${isSelected ? 'text-green-700 font-bold' : 'text-gray-700'}`}
                        style={{ 
                          top: "100%", 
                          left: "50%",
                          opacity: isSelected ? 1 : 0.9,
                          transform: `translate(-50%, ${isSelected ? '8px' : '4px'}) scale(${isSelected ? 1.1 : 1})`,
                          boxShadow: isSelected ? '0 4px 8px rgba(0,0,0,0.2)' : '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      >
                        {location.location}
                      </div>
                    </div>
    
                    {/* Project card - improved styling */}
                    {isSelected && (
                      <div
                        className={`absolute bg-white rounded-lg shadow-xl overflow-hidden transition-all duration-300 z-30 ${isExpanded ? "w-72" : "w-60"}`}
                        style={{
                          top: "-120px",
                          left: "-110px",
                          transform: isExpanded ? "scale(1.05)" : "scale(1)",
                          borderTop: "3px solid #047857",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.2)"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/* Card content */}
                        <div className="relative">
                          {/* Project image */}
                          <div
                            className={`relative ${isExpanded ? "h-36" : "h-28"}`}
                          >
                            <img
                              src={location.image}
                              alt={location.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-yellow-500 text-white px-3 py-1 text-xs font-semibold rounded-md shadow-sm">
                              {location.location}
                            </div>
    
                            {/* Expand/collapse button */}
                            <button
                              className="absolute bottom-2 right-2 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-100 transition-all duration-200"
                              onClick={(e) => handleExpandClick(location.id, e)}
                            >
                              {isExpanded ? (
                                <X className="w-5 h-5 text-gray-700" />
                              ) : (
                                <Info className="w-5 h-5 text-green-700" />
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
                                  className="text-xs text-yellow-600 hover:text-yellow-800 font-medium inline-flex items-center bg-yellow-50 rounded-md px-2 py-1 transition-colors hover:bg-yellow-100"
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
                                  className="text-xs text-green-700 hover:text-green-800 font-medium inline-flex items-center"
                                >
                                  View details
                                  <ChevronRight className="ml-1 w-3 h-3" />
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