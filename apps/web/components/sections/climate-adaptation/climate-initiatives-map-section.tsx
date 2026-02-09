// @ts-nocheck

"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Container from "@/components/layout/container";
import { MapPin, X, ChevronRight, Info } from "lucide-react";
import apiClient from "@/lib/api-client";

// Animation variants
const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

const statsVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        }
    }
};

const statItemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            duration: 0.4,
            ease: "easeOut"
        }
    }
};

const ClimateInitiavesMapSection = () => {
    const [selectedCountry, setSelectedCountry] = useState('rwanda');
    const [selectedProject, setSelectedProject] = useState(null);
    const [expandedCard, setExpandedCard] = useState(null);
    const [mapDimensions, setMapDimensions] = useState({ width: 0, height: 0 });
    
    // State for API data
    const [statsData, setStatsData] = useState({
        fellows: 0,
        projects: 0,
        communities: 0,
        countries: 2, // This is static as we know there are 2 countries
    });
    const [projectLocations, setProjectLocations] = useState([]);

    const mapRef = useRef(null);
    const mapIframeRef = useRef(null);

    // Countries data
    const countries = [
        { name: 'Rwanda', value: 'rwanda' },
        { name: 'Burkina Faso', value: 'burkina' },
    ];

    // Filtered locations based on selected country
    const filteredLocations = projectLocations.filter(
        (location) => location.country === selectedCountry
    );

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

    const getMarkerPosition = (position) => {
        const x = (position.x / 600) * mapDimensions.width;
        const y = (position.y / 400) * mapDimensions.height;
        return { x, y };
    };

    // Fetch data from APIs
    useEffect(() => {
        // Fetch projects data
        apiClient.get('/projects')
            .then(response => {
                const data = response.data;
                // Check if data is an array or has a projects property that's an array
                const projectsArray = Array.isArray(data) ? data : (data.projects || []);
                
                // Update stats with total projects count
                setStatsData(prev => ({
                    ...prev,
                    projects: projectsArray.length || 0
                }));
                
                // Process projects into location data
                const locations = projectsArray.map(project => ({
                    id: project.id,
                    title: project.name,
                    description: project.description || "A sustainable initiative to improve local communities",
                    image: project.image || '/images/food-system-1.png',
                    country: project.country?.toLowerCase() || 'rwanda',
                    location: project.location || 'Kigali',
                    address: project.address || `${project.location}, Rwanda`,
                    mapCoordinates: project.coordinates || { lat: -1.9403, lng: 29.8739 },
                    mapPosition: project.mapPosition || { x: 300, y: 200 },
                    mapUrl: project.mapUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63776.95946876503!2d29.591339705532292!3d-1.4968819286622052!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dc4e45426592c5%3A0x7bf59f53e5c2b097!2sMusanze%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712019657396!5m2!1sen!2sus",
                    contactPerson: project.contactPerson || 'Project Manager',
                    url: `/projects/${project.id}` || '/projects/default'
                }));
                
                setProjectLocations(locations);
                
                // Count unique communities
                const communities = new Set();
                projectsArray.forEach(project => {
                    if (project.community) {
                        communities.add(project.community);
                    }
                });
                
                setStatsData(prev => ({
                    ...prev,
                    communities: communities.size || 0
                }));
                
                console.log('Processed project locations:', locations);
            })
            .catch(error => console.error('Error fetching projects:', error));
        
        // Fetch team members to count fellows
        apiClient.get('/teams')
            .then(response => {
                const data = response.data;
                // Check if data is an array or has a teams property that's an array
                const teamsArray = Array.isArray(data) ? data : (data.teams || []);
                
                // Count team members with type 'fellow'
                const fellowsCount = teamsArray.filter(
                    member => member.team_type === 'fellow'
                ).length;
                
                setStatsData(prev => ({
                    ...prev,
                    fellows: fellowsCount || 0
                }));
                
                console.log('Fellows count:', fellowsCount);
            })
            .catch(error => console.error('Error fetching teams:', error));
    }, []);

    // Effects for map dimensions
    useEffect(() => {
        const updateMapDimensions = () => {
            if (mapRef.current) {
                // Batch DOM reads to avoid forced reflow
                requestAnimationFrame(() => {
                    if (mapRef.current) {
                        setMapDimensions({
                            width: mapRef.current.offsetWidth,
                            height: mapRef.current.offsetHeight
                        });
                    }
                });
            }
        };

        // Initial read - use requestAnimationFrame to batch with other DOM reads
        requestAnimationFrame(() => {
            if (mapRef.current) {
                setMapDimensions({
                    width: mapRef.current.offsetWidth,
                    height: mapRef.current.offsetHeight
                });
            }
        });
        window.addEventListener('resize', updateMapDimensions);

        return () => {
            window.removeEventListener('resize', updateMapDimensions);
        };
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
                        <span>Our Climate Initiatives </span>
                        <span className="text-primary-green">across Africa</span>
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto">
                        GanzAfrica operates in two countries, equipping young professionals with the skills and
                        opportunities to drive meaningful change in Africa's agri-food systems.
                    </p>
                </motion.div>

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
                                <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </motion.div>

                        <motion.button
                            className="bg-primary-green hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors w-full sm:w-auto"
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

                    {/* Stats grid - Now using dynamic data from API */}
                    <motion.div
                        className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-xl mx-auto mb-8"
                        variants={statsVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <motion.div className="text-center" variants={statItemVariants}>
                            <p className="text-3xl font-bold text-green-700">{statsData.fellows}</p>
                            <p className="text-sm text-gray-600">Fellows</p>
                        </motion.div>
                        <motion.div className="text-center" variants={statItemVariants}>
                            <p className="text-3xl font-bold text-green-700">{statsData.projects}</p>
                            <p className="text-sm text-gray-600">Projects</p>
                        </motion.div>
                        <motion.div className="text-center" variants={statItemVariants}>
                            <p className="text-3xl font-bold text-green-700">{statsData.communities}</p>
                            <p className="text-sm text-gray-600">Communities</p>
                        </motion.div>
                        <motion.div className="text-center" variants={statItemVariants}>
                            <p className="text-3xl font-bold text-green-700">{statsData.countries}</p>
                            <p className="text-sm text-gray-600">Countries</p>
                        </motion.div>
                    </motion.div>
                </div>

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
                        src={currentProject ?
                            `${currentProject.mapUrl}&markers=color:red%7Clabel:G%7C${currentProject.mapCoordinates.lat},${currentProject.mapCoordinates.lng}` :
                            filteredLocations[0]?.mapUrl}
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
                                        className={`rounded-full overflow-hidden transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${isSelected ? 'scale-110' : ''}`}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            border: `3px solid ${isSelected ? '#F59E0B' : '#047857'}`,
                                            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
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
                                            style={{ top: '100%', left: '50%' }}
                                        >
                                            {location.location}
                                        </div>
                                    )}
                                </div>

                                {/* Project card */}
                                {isSelected && (
                                    <div
                                        className={`absolute bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 z-20 ${isExpanded ? 'w-64' : 'w-52'}`}
                                        style={{
                                            top: '-105px',
                                            left: '-110px',
                                            transform: isExpanded ? 'scale(1.1)' : 'scale(1)'
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {/* Card content */}
                                        <div className="relative">
                                            {/* Project image */}
                                            <div className={`relative ${isExpanded ? 'h-32' : 'h-24'}`}>
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
                                                        <Link
                                                            href={location.url}
                                                            aria-label="Learn more about our project's location"
                                                            className="text-xs text-yellow-600 hover:text-yellow-800 font-medium inline-flex items-center"
                                                        >
                                                            Learn more
                                                            <ChevronRight className="ml-1 w-3 h-3" />
                                                        </Link>
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
                    Click on a project marker to view details. The map will zoom to the selected location.
                </div>
            </Container>
        </section>
    );
};

export default ClimateInitiavesMapSection;