"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Container from "@/components/layout/container";
import { MapPin, X, ChevronRight, Info, Search, Plus, Minus } from "lucide-react";
const SafePlus = Plus as unknown as React.ComponentType<any>;
const SafeMinus = Minus as unknown as React.ComponentType<any>;
const SafeX = X as unknown as React.ComponentType<any>;
import apiClient from "@/lib/api-client";
import Link from 'next/link';
const SafeLink = Link as unknown as React.ComponentType<any>;
import { useParams } from 'next/navigation';
import { useDict } from '@/context/dictionary';
import {TranslatableText} from "@/components/translate";


// --- DUMMY DATA FOR TESTING ---
const DUMMY_PROJECTS: any[] = [
    {
        id: "proj-1",
        name: "Kigali Urban Farming Initiative",
        description: "Empowering youth through vertical farming and hydroponics in the heart of Kigali.",
        country: "Rwanda",
        location: "Kigali",
        community: "Nyarugenge",
        address: "KN 2 Ave, Kigali, Rwanda",
        contactPerson: "Jean Bosco",
        media: {
            items: [{ tag: "feature", url: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=800", type: "image" }]
        }
    },
    {
        id: "proj-4",
        name: "Musanze Potato Cooperative",
        description: "Supporting local farmers in sustainable potato cultivation and market access in Northern Rwanda.",
        country: "Rwanda",
        location: "Musanze",
        community: "Musanze District",
        address: "Musanze, Northern Province, Rwanda",
        contactPerson: "Pierre Nkurunziza",
        media: {
            items: [{ tag: "feature", url: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?q=80&w=800", type: "image" }]
        }
    },
    {
        id: "proj-5",
        name: "Gasabo Youth Agricultural Hub",
        description: "Training center for young agripreneurs in modern farming techniques and business skills.",
        country: "Rwanda",
        location: "Gasabo",
        community: "Gasabo District",
        address: "Gasabo, Kigali, Rwanda",
        contactPerson: "Marie Claire Mukamana",
        media: {
            items: [{ tag: "feature", url: "https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=800", type: "image" }]
        }
    },
    {
        id: "proj-10",
        name: "Nyagatare Livestock Development",
        description: "Improving cattle rearing practices and veterinary services for pastoral communities.",
        country: "Rwanda",
        location: "Nyagatare",
        community: "Nyagatare District",
        address: "Nyagatare, Eastern Province, Rwanda",
        contactPerson: "Jean Baptiste Nsengiyumva",
        media: {
            items: [{ tag: "feature", url: "https://images.unsplash.com/photo-1560493676-04071c5f467b?q=80&w=800", type: "image" }]
        }
    },
    {
        id: "proj-11",
        name: "Bobo-Dioulasso Cotton Initiative",
        description: "Supporting cotton farmers with improved seeds and access to international markets.",
        country: "Burkina Faso",
        location: "Bobo-Dioulasso",
        community: "Hauts-Bassins Region",
        address: "Bobo-Dioulasso, Burkina Faso",
        contactPerson: "Amadou Traoré",
        media: {
            items: [{ tag: "feature", url: "https://images.unsplash.com/photo-1492496913980-501348b61469?q=80&w=800", type: "image" }]
        }
    },
    {
        id: "proj-16",
        name: "Dédougou Sorghum Research Station",
        description: "Research and development center for drought-resistant sorghum varieties adapted to Sahel conditions.",
        country: "Burkina Faso",
        location: "Dédougou",
        community: "Boucle du Mouhoun Region",
        address: "Dédougou, Burkina Faso",
        contactPerson: "Dr. Oumarou Zongo",
        media: {
            items: [{ tag: "feature", url: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800", type: "image" }]
        }
    },
    {
        id: "proj-17",
        name: "Muhanga Honey Production",
        description: "Training beekeepers and establishing honey collection centers for improved income generation.",
        country: "Rwanda",
        location: "Muhanga",
        community: "Muhanga District",
        address: "Muhanga, Southern Province, Rwanda",
        contactPerson: "Fabrice Nsengimana",
        media: {
            items: [{ tag: "feature", url: "https://images.unsplash.com/photo-1592419044706-39796d40f98c?q=80&w=800", type: "image" }]
        }
    },
    {
        id: "proj-18",
        name: "Nyamagabe Forest Conservation",
        description: "Community-based forest conservation and agroforestry program in Southern Rwanda.",
        country: "Rwanda",
        location: "Nyamagabe",
        community: "Nyamagabe District",
        address: "Nyamagabe, Southern Province, Rwanda",
        contactPerson: "Eugene Nzabonimana",
        media: {
            items: [{ tag: "feature", url: "https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800", type: "image" }]
        }
    },
];

// Define TypeScript interfaces
interface Coordinates {
    lat: number;
    lng: number;
    mapUrl?: string;
}


// Define TypeScript interfaces
interface Coordinates {
    lat: number;
    lng: number;
    mapUrl?: string;
}

interface Project {
    id: string;
    name?: string;
    description?: string;
    country?: string;
    location?: string;
    community?: string;
    address?: string;
    mapUrl?: string;
    contactPerson?: string;
    media?: {
        items?: Array<{
            tag?: string;
            url?: string;
            type?: string;
        }>;
    };
}

interface ProjectLocation {
    id: string;
    projectId: string;
    title: string;
    description: string;
    image: string;
    country: string;
    location: string;
    address: string;
    mapCoordinates: Coordinates;
    mapPosition: {
        x: number;
        y: number;
    };
    mapUrl: string | null;
    contactPerson: string;
    url: string;
}

interface CountryOption {
    name: string;
    value: string;
}

interface StatsData {
    projects: number;
    communities: number;
    countries: number;
}

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

const ClimateInitiativesMapSection = () => {
    const dict = useDict();
    // Get the locale from URL params
    const params = useParams();
    const locale = params.locale || 'en';

    const [selectedProject, setSelectedProject] = useState<string | null>(null);
    const [mapDimensions, setMapDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
    const [mapZoom, setMapZoom] = useState<number>(8); // Default zoom level
    const [mapCenter, setMapCenter] = useState<Coordinates | null>(null); // Track map center coordinates
    const [hoveredProject, setHoveredProject] = useState<string | null>(null);

    // State for API data
    const [statsData, setStatsData] = useState<StatsData>({
        projects: 0,
        communities: 0,
        countries: 2, // Fixed to 2 countries: Rwanda and Burkina Faso
    });
    const [projectLocations, setProjectLocations] = useState<ProjectLocation[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [multipleProjectsAtLocation, setMultipleProjectsAtLocation] = useState<Record<string, string[]>>({});

    // Ensure Rwanda is first in the list and selected by default
    const [countries, setCountries] = useState<CountryOption[]>([
        { name: 'Rwanda', value: 'rwanda' },
        { name: 'Burkina Faso', value: 'burkina faso' },
        { name: 'Other', value: 'other' }
    ]);
    // Set Rwanda as the default selected country
    const [selectedCountry, setSelectedCountry] = useState<string>('rwanda');

    const mapRef = useRef<HTMLDivElement>(null);
    const mapIframeRef = useRef<HTMLIFrameElement>(null);

    // Helper function to determine if a location is in Rwanda
    const isRwandaDistrict = (location: string | null | undefined): boolean => {
        if (!location) return false;

        const rwandaDistricts = [
            // Kigali Province
            'gasabo', 'kicukiro', 'nyarugenge', 'kigali',

            // Eastern Province
            'bugesera', 'gatsibo', 'kayonza', 'kirehe', 'ngoma', 'nyagatare', 'rwamagana',

            // Northern Province
            'burera', 'gicumbi', 'gakenke', 'musanze', 'rulindo',

            // Southern Province
            'huye', 'ruhango', 'nyamagabe', 'gisagara', 'muhanga', 'kamonyi', 'nyanza', 'nyaruguru',

            // Western Province
            'karongi', 'nyabihu', 'rubavu', 'rusizi', 'ngororero', 'nyamasheke', 'rutsiro',

            // General Rwanda terms
            'rwanda', 'kigali'
        ];

        const locationLower = location.toLowerCase().trim();

        // Check if the location includes any Rwanda district name
        return rwandaDistricts.some(district =>
            locationLower === district ||
            locationLower.includes(` ${district}`) ||
            locationLower.includes(`${district} `) ||
            locationLower.includes(`${district},`)
        );
    };

    // Helper function to get coordinates from location name
    const getCoordinatesForLocation = (location: string | null | undefined): Coordinates => {
        // Known specific locations with pre-defined map URLs
        const knownLocations = {
            // Kigali Province
            "kigali": {
                lat: -1.9441,
                lng: 30.0619,
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63817.18087378733!2d30.019363028729005!3d-1.944098787600761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42968f6b901%3A0xfba4f422b2a13a89!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712031042989!5m2!1sen!2sus"
            },
            "gasabo": { lat: -1.8952, lng: 30.0591 },
            "kicukiro": { lat: -1.9929, lng: 30.0567 },
            "nyarugenge": { lat: -1.9437, lng: 30.0611 },

            // Eastern Province
            "bugesera": { lat: -2.1564, lng: 30.2572 },
            "gatsibo": { lat: -1.5737, lng: 30.4560 },
            "kayonza": { lat: -1.9407, lng: 30.4583 },
            "kirehe": { lat: -2.2676, lng: 30.6531 },
            "ngoma": { lat: -2.1476, lng: 30.4638 },
            "nyagatare": { lat: -1.2977, lng: 30.3253 },
            "rwamagana": { lat: -1.9490, lng: 30.4351 },

            // Northern Province
            "burera": { lat: -1.4645, lng: 29.8250 },
            "gicumbi": { lat: -1.7036, lng: 30.0597 },
            "gakenke": { lat: -1.6963, lng: 29.7842 },
            "musanze": { lat: -1.4969, lng: 29.6259 },
            "rulindo": { lat: -1.7169, lng: 29.9844 },

            // Southern Province
            "huye": { lat: -2.6076, lng: 29.7429 },
            "ruhango": { lat: -2.0658, lng: 29.7767 },
            "nyamagabe": { lat: -2.4773, lng: 29.5664 },
            "gisagara": { lat: -2.6060, lng: 29.8729 },
            "muhanga": { lat: -1.9747, lng: 29.7561 },
            "kamonyi": { lat: -1.9978, lng: 29.9197 },
            "nyanza": { lat: -2.3516, lng: 29.7509 },
            "nyaruguru": { lat: -2.8084, lng: 29.5318 },

            // Western Province
            "karongi": { lat: -2.1579, lng: 29.3878 },
            "nyabihu": { lat: -1.6579, lng: 29.5006 },
            "rubavu": { lat: -1.6794, lng: 29.2336 },
            "rusizi": { lat: -2.5184, lng: 28.9066 },
            "ngororero": { lat: -1.8870, lng: 29.5865 },
            "nyamasheke": { lat: -2.3253, lng: 29.1208 },
            "rutsiro": { lat: -1.9520, lng: 29.3257 },

            // Burkina Faso
            "ouagadougou": {
                lat: 12.3714,
                lng: -1.5197,
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125171.40082591335!2d-1.6126624448655638!3d12.36712576629056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe2e9c23908451f%3A0x1f1d8074e9c2d0ab!2sOuagadougou%2C%20Burkina%20Faso!5e0!3m2!1sen!2sus!4v1712031172461!5m2!1sen!2sus"
            },
            "bobo-dioulasso": { lat: 11.1777, lng: -4.2958 },
            "koudougou": { lat: 12.2530, lng: -2.3748 },
            "banfora": { lat: 10.6376, lng: -4.7580 },
            "dédougou": { lat: 12.4634, lng: -3.4663 }
        };

        // Country defaults (used when specific location not found)
        const countryDefaults = {
            "rwanda": {
                lat: -1.9441,
                lng: 30.0619,
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63817.18087378733!2d30.019363028729005!3d-1.944098787600761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42968f6b901%3A0xfba4f422b2a13a89!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712031042989!5m2!1sen!2sus"
            },
            "burkina faso": {
                lat: 12.3714,
                lng: -1.5197,
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125171.40082591335!2d-1.6126624448655638!3d12.36712576629056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe2e9c23908451f%3A0x1f1d8074e9c2d0ab!2sOuagadougou%2C%20Burkina%20Faso!5e0!3m2!1sen!2sus!4v1712031172461!5m2!1sen!2sus"
            },
            "other": {
                lat: 0,
                lng: 20,
                mapUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31397.814232798383!2d20.053565!3d0.084886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1779fe8521916c39%3A0x2caec1cf01ad37f!2sAfrica!5e0!3m2!1sen!2sus!4v1681732186562!5m2!1sen!2sus"
            }
        };

        // If no location provided, return default central Africa coordinates
        if (!location) {
            return {
                lat: countryDefaults.other.lat,
                lng: countryDefaults.other.lng,
                mapUrl: countryDefaults.other.mapUrl
            } as Coordinates;
        }

        const locationLower = location.toLowerCase().trim();

        // Check if we have exact coordinates for this location
        if (locationLower in knownLocations) {
            const locationData = knownLocations[locationLower as keyof typeof knownLocations];
            // Return coordinates and map URL if available
            return {
                lat: locationData.lat,
                lng: locationData.lng,
                mapUrl: 'mapUrl' in locationData ? locationData.mapUrl : undefined
            } as Coordinates;
        }

        // If location has multiple parts (e.g. "Rubavu, Kigali"), use the first one
        if (locationLower.includes(',')) {
            const firstLocation = locationLower.split(',')[0]?.trim() || '';
            if (firstLocation in knownLocations) {
                const locationData = knownLocations[firstLocation as keyof typeof knownLocations];
                return {
                    lat: locationData.lat,
                    lng: locationData.lng,
                    mapUrl: 'mapUrl' in locationData ? locationData.mapUrl : undefined
                } as Coordinates;
            }
        }

        // Check if the location includes a country name and return its default coordinates
        if (locationLower.includes('rwanda')) {
            return {
                lat: countryDefaults.rwanda.lat,
                lng: countryDefaults.rwanda.lng,
                mapUrl: countryDefaults.rwanda.mapUrl
            } as Coordinates;
        }

        if (locationLower.includes('burkina')) {
            return {
                lat: countryDefaults["burkina faso"].lat,
                lng: countryDefaults["burkina faso"].lng,
                mapUrl: countryDefaults["burkina faso"].mapUrl
            } as Coordinates;
        }

        // Default to central Africa if nothing else matches
        return {
            lat: countryDefaults.other.lat,
            lng: countryDefaults.other.lng,
            mapUrl: countryDefaults.other.mapUrl
        } as Coordinates;
    };

    // Generate Google Maps URL with appropriate zoom level for a specific location
    const generateMapUrl = (coordinates: Coordinates | null, zoomLevel = 12): string | null => {
        if (!coordinates) return null;

        // If the coordinates include a pre-defined map URL, use that
        if (coordinates.mapUrl) {
            return coordinates.mapUrl;
        }

        // Otherwise use a dynamically generated one
        return `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d${250000 / Math.pow(2, zoomLevel)}!2d${coordinates.lng}!3d${coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sus!4v1712019657396!5m2!1sen!2sus`;
    };

    // Helper function to calculate map position from coordinates with better precision
    // country parameter allows calculating position based on project's country, not selected country ******************************
    const getMapPosition = (coordinates: Coordinates | null, country?: string) => {
// ****************************** MAP ******************************
        if (!coordinates) return { x: 300, y: 200 };

        // Get current map dimensions
        const mapWidth = mapDimensions.width || 600;
        const mapHeight = mapDimensions.height || 400;
// ****************************** MAP ******************************
        // Use provided country or fall back to selectedCountry for display purposes
        const countryForBounds = country || selectedCountry;
// ****************************** MAP ******************************
        let x: number, y: number;

        if (countryForBounds === 'rwanda') {
            // Rwanda-specific mapping (approximate bounds: lat -3 to 0, lng 28.5 to 31)
            const latNormalized = (coordinates.lat + 3) / 3; // 0 to 1 (south to north)
            const lngNormalized = (coordinates.lng - 28.5) / 2.5; // 0 to 1 (west to east)

            // Scale to map size (with padding)
            const padding = 40;
            x = padding + (lngNormalized * (mapWidth - padding * 2));
            y = mapHeight - padding - (latNormalized * (mapHeight - padding * 2)); // Flip Y (north is up)
        }
// ****************************** MAP ******************************
        else if (countryForBounds === 'burkina faso') {
// ****************************** MAP ******************************
            // Burkina Faso mapping (approximate bounds: lat 9 to 15, lng -6 to 3)
            const latNormalized = (coordinates.lat - 9) / 6; // 0 to 1 (south to north)
            const lngNormalized = (coordinates.lng + 6) / 9; // 0 to 1 (west to east)

            const padding = 40;
            x = padding + (lngNormalized * (mapWidth - padding * 2));
            y = mapHeight - padding - (latNormalized * (mapHeight - padding * 2)); // Flip Y (north is up)
        }
        else {
            // Default calculation for other countries
            // Convert from global coordinates to map coordinates
            const latNormalized = (90 - coordinates.lat) / 180; // 0 to 1 (north to south)
            const lngNormalized = (coordinates.lng + 180) / 360; // 0 to 1 (west to east)

            x = lngNormalized * mapWidth;
            y = latNormalized * mapHeight;
        }

        return { x, y };
    };

    // Function to handle clusters of projects at the same location
    const getClusteredPosition = (basePosition: { x: number; y: number }, index: number, total: number) => {
        if (total <= 1) return basePosition;

        // Calculate radius based on number of projects (larger clusters = larger radius)
        const radius = Math.min(15, 8 + (total * 2));

        // Calculate angle based on position in cluster
        const angle = (index / total) * 2 * Math.PI;

        // Calculate offset using circle placement
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;

        return {
            x: basePosition.x + offsetX,
            y: basePosition.y + offsetY
        };
    };

    // Function to get project images from media items
    const getProjectImage = (project: Project): string => {
        if (!project || !project.media || !project.media.items || project.media.items.length === 0) {
            return '/images/food-system-1.png'; // Default image
        }

        // Try to find a feature image first
        const featureImage = project.media.items.find(item =>
            item.tag === 'feature' && item.url && item.type === 'image'
        );

        // If no feature image, use the first available image
        const anyImage = project.media.items.find(item =>
            item.url && item.type === 'image'
        );

        return featureImage?.url ||
            anyImage?.url ||
            '/images/food-system-1.png';
    };

    // This effect is for initially focusing the map on Rwanda
    useEffect(() => {
        // Focus map on Rwanda when component mounts
        const rwandaCoords = { lat: -1.9403, lng: 29.8739 }; // Kigali, Rwanda
        setMapCenter(rwandaCoords);
    }, []);

    // Effect to handle project clustering
    useEffect(() => {
        if (!projectLocations || projectLocations.length === 0) return;

        // Group projects by location key (based on coordinates)
        const locationGroups: Record<string, string[]> = {};

        projectLocations.forEach(location => {
            if (!location.mapCoordinates) return;

            // Create a key for this location based on coordinates (rounded to reduce minor variations)
            const key = `${location.mapCoordinates.lat.toFixed(4)},${location.mapCoordinates.lng.toFixed(4)}`;

            if (!locationGroups[key]) {
                locationGroups[key] = [];
            }

            locationGroups[key].push(location.id);
        });

        // Filter to only include locations with multiple projects
        const multiLocations: Record<string, string[]> = {};
        Object.entries(locationGroups).forEach(([key, ids]) => {
            if (ids.length > 1) {
                multiLocations[key] = ids;
            }
        });

        setMultipleProjectsAtLocation(multiLocations);
    }, [projectLocations]);

    // Filtered locations based on selected country
    const filteredLocations = selectedCountry
        ? projectLocations.filter(location => location.country.toLowerCase() === selectedCountry.toLowerCase())
        : projectLocations;

    const currentProject = selectedProject
        ? projectLocations.find(p => p.id === selectedProject)
        : null;

    // Find all projects at the same location as the currently selected project
    const projectsAtSameLocation = currentProject ?
        projectLocations.filter(p =>
            p.mapCoordinates && currentProject.mapCoordinates &&
            p.mapCoordinates.lat.toFixed(4) === currentProject.mapCoordinates.lat.toFixed(4) &&
            p.mapCoordinates.lng.toFixed(4) === currentProject.mapCoordinates.lng.toFixed(4)
        ) : [];

    // Event handlers
    const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // Check if the click is outside of any card
        const target = e.target as HTMLElement;
        if (selectedProject &&
            !target.closest('.project-card') &&
            !target.closest('.map-control') &&
            !target.closest('.projects-carousel')) {
            setSelectedProject(null);
            // Reset map zoom when closing project view
            setMapZoom(8);

            // Reset map center to country default
            if (selectedCountry === 'rwanda') {
                setMapCenter({ lat: -1.9403, lng: 29.8739 }); // Kigali, Rwanda
            } else if (selectedCountry === 'burkina faso') {
                setMapCenter({ lat: 12.3714, lng: -1.5197 }); // Ouagadougou, Burkina Faso
            } else {
                setMapCenter(null); // Default view
            }
        }
    };

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const country = e.target.value;
        setSelectedCountry(country);
        setSelectedProject(null);
        // Reset map zoom when changing country
        setMapZoom(8);

        // Set map center based on selected country
        if (country === 'rwanda') {
            setMapCenter({ lat: -1.9403, lng: 29.8739 }); // Kigali, Rwanda
        } else if (country === 'burkina faso') {
            setMapCenter({ lat: 12.3714, lng: -1.5197 }); // Ouagadougou, Burkina Faso
        } else {
            setMapCenter(null); // Default view
        }
    };

    const handleProjectClick = (projectId: string) => {
        const project = projectLocations.find(p => p.id === projectId);

        // Close existing project
        if (selectedProject === projectId) {
            setSelectedProject(null);
            // Reset map zoom
            setMapZoom(8);

            // Reset map center to country default
            if (selectedCountry === 'rwanda') {
                setMapCenter({ lat: -1.9403, lng: 29.8739 }); // Kigali, Rwanda
            } else if (selectedCountry === 'burkina faso') {
                setMapCenter({ lat: 12.3714, lng: -1.5197 }); // Ouagadougou, Burkina Faso
            } else {
                setMapCenter(null); // Default view
            }
        } else {
            // Set new selected project
            setSelectedProject(projectId);
            // Increase map zoom for focus on location
            setMapZoom(14);

            // Center map on this project
            if (project && project.mapCoordinates) {
                setMapCenter(project.mapCoordinates);
            }
        }
    };

    const handleCloseProject = (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedProject(null);
        // Reset map zoom
        setMapZoom(8);

        // Reset map center to country default
        if (selectedCountry === 'rwanda') {
            setMapCenter({ lat: -1.9403, lng: 29.8739 }); // Kigali, Rwanda
        } else if (selectedCountry === 'burkina faso') {
            setMapCenter({ lat: 12.3714, lng: -1.5197 }); // Ouagadougou, Burkina Faso
        } else {
            setMapCenter(null); // Default view
        }
    };

    // Handle zoom in/out buttons
    const handleZoomIn = () => {
        setMapZoom(prev => Math.min(prev + 1, 18));
    };

    const handleZoomOut = () => {
        setMapZoom(prev => Math.max(prev - 1, 6));
    };

    // Show all projects at this location when clicking the cluster indicator
    const handleClusterClick = (locationKey: string, e: React.MouseEvent) => {
        e.stopPropagation();

        // Show a modal or expand the card to display all projects at this location
        // For now, we'll just select the first project in the cluster
        const projectsAtLocation = multipleProjectsAtLocation[locationKey];
        if (projectsAtLocation && projectsAtLocation.length > 0) {
            const firstProjectId = projectsAtLocation[0];
            if (firstProjectId) {
                handleProjectClick(firstProjectId);
            }
        }
    };

    // Mouse hover handlers for projects
    const handleProjectMouseEnter = (projectId: string) => {
        setHoveredProject(projectId);
    };

    const handleProjectMouseLeave = () => {
        setHoveredProject(null);
    };

    // Get appropriate position for marker based on map dimensions
    const getMarkerPosition = (position: { x: number; y: number }) => {
        const x = (position.x / 600) * mapDimensions.width;
        const y = (position.y / 400) * mapDimensions.height;
        return { x, y };
    };

    // Helper function to process projects array into locations
    const processProjectsData = (projectsArray: Project[]) => {
// ****************************** MAP ******************************
        // Update stats with total projects count
        setStatsData(prev => ({
            ...prev,
            projects: projectsArray.length || 0
        }));

        // Extract unique countries
        const uniqueCountries = new Set<string>();
        projectsArray.forEach(project => {
            if (project.country) {
                uniqueCountries.add(project.country.toLowerCase());
            }
        });

        // Keep countries fixed at 2
        setStatsData(prev => ({
            ...prev,
            countries: 2 // Fixed to 2 countries
        }));

        // Format countries for dropdown - make sure to always include Rwanda, Burkina Faso, and Other
        const countryOptions: CountryOption[] = [];

        // Always include Rwanda as the first option
        countryOptions.push({ name: 'Rwanda', value: 'rwanda' });

        // Add Burkina Faso if it exists
        if (uniqueCountries.has('burkina faso')) {
            countryOptions.push({ name: 'Burkina Faso', value: 'burkina faso' });
            // Remove from set to avoid duplication
            uniqueCountries.delete('burkina faso');
        } else {
            // Add anyway as second option
            countryOptions.push({ name: 'Burkina Faso', value: 'burkina faso' });
        }

        // Remove Rwanda from the set to avoid duplication
        uniqueCountries.delete('rwanda');

        // Add all other countries
        Array.from(uniqueCountries).sort().forEach(country => {
            countryOptions.push({
                name: country.charAt(0).toUpperCase() + country.slice(1),
                value: country.toLowerCase()
            });
        });

        // Always include "Other" as the last option
        countryOptions.push({ name: 'Other', value: 'other' });

        setCountries(countryOptions);

        // Process projects into location data
        const locations: ProjectLocation[] = [];
        const communities = new Set<string>();

        projectsArray.forEach(project => {
            // Determine project country based on location district
            let projectCountry = 'burkina faso'; // Default to Burkina Faso if not a Rwanda district

            // If project has explicit country, normalize it
            if (project.country) {
                const normalizedCountry = project.country.toLowerCase();
                if (normalizedCountry.includes('rwanda') || normalizedCountry.includes('rw')) {
                    projectCountry = 'rwanda';
                } else if (normalizedCountry.includes('burkina') || normalizedCountry.includes('bf')) {
                    projectCountry = 'burkina faso';
                }
            }

            // Check if location is a Rwanda district - this overrides the country field
            if (project.location && isRwandaDistrict(project.location)) {
                projectCountry = 'rwanda';
            }

            // Get project image from media items
            const projectImage = getProjectImage(project);

            // Handle project with multiple locations
            if (project.location) {
                // Split location if it contains commas (multiple locations)
                const locationsList = project.location.split(',').map(loc => loc.trim());

                // Add each location to the communities set
                locationsList.forEach(loc => {
                    if (loc) communities.add(loc);
                });

                // Create a map entry for each location
                locationsList.forEach((locationName, index) => {
                    // Get accurate coordinates for this location
                    const coordinates = getCoordinatesForLocation(locationName);

                    // Calculate proper map position based on real coordinates and project's country
                    const mapPosition = getMapPosition(coordinates, projectCountry);

                    // Generate map URL based on coordinates
                    const mapUrl = generateMapUrl(coordinates);

                    locations.push({
                        id: `${project.id}-${locationName}-${index}`,
                        projectId: project.id,
                        title: project.name || "Project",
                        description: project.description || "A sustainable initiative to improve local communities",
                        image: projectImage,
                        country: projectCountry,
                        location: locationName,
                        address: project.address || `${locationName}, ${project.country || 'Rwanda'}`,
                        mapCoordinates: coordinates,
                        mapPosition: mapPosition,
                        mapUrl: project.mapUrl || mapUrl,
                        contactPerson: project.contactPerson || 'Project Manager',
                        url: `/projects/${project.id}` || '/projects/default'
                    });
                });
            } else if (project.community) {
                // If project has community but no location, use community as location
                const communityName = project.community.trim();
                communities.add(communityName);

                const coordinates = getCoordinatesForLocation(communityName);
                const mapPosition = getMapPosition(coordinates, projectCountry);

                // Generate map URL based on coordinates
                const mapUrl = generateMapUrl(coordinates);

                locations.push({
                    id: `${project.id}-${communityName}`,
                    projectId: project.id,
                    title: project.name || "Project",
                    description: project.description || "A sustainable initiative to improve local communities",
                    image: projectImage,
                    country: projectCountry,
                    location: communityName,
                    address: project.address || `${communityName}, ${project.country || 'Rwanda'}`,
                    mapCoordinates: coordinates,
                    mapPosition: mapPosition,
                    mapUrl: project.mapUrl || mapUrl,
                    contactPerson: project.contactPerson || 'Project Manager',
                    url: `/projects/${project.id}` || '/projects/default'
                });
            } else {
                // Default location (country capital or something generic)
                const defaultLocation = project.country || 'Rwanda';
                communities.add(defaultLocation);

                const coordinates = getCoordinatesForLocation(defaultLocation);
                const mapPosition = getMapPosition(coordinates, projectCountry);

                // Generate map URL based on coordinates
                const mapUrl = generateMapUrl(coordinates);

                locations.push({
                    id: `${project.id}-default`,
                    projectId: project.id,
                    title: project.name || "Project",
                    description: project.description || "A sustainable initiative to improve local communities",
                    image: projectImage,
                    country: projectCountry,
                    location: defaultLocation,
                    address: project.address || `${defaultLocation}`,
                    mapCoordinates: coordinates,
                    mapPosition: mapPosition,
                    mapUrl: project.mapUrl || mapUrl,
                    contactPerson: project.contactPerson || 'Project Manager',
                    url: `/projects/${project.id}` || '/projects/default'
                });
            }
        });

        setProjectLocations(locations);

        // Update stats with communities count
        setStatsData(prev => ({
            ...prev,
            communities: communities.size || 0
        }));

        setIsLoading(false);
    };

    // Fetch data from APIs
    useEffect(() => {
        setIsLoading(true);

        // Fetch projects data - only fetch published projects for the website
        apiClient.get('/projects', {
            params: {
                is_published: true
            }
        })
            .then(response => {
                const data = response.data;
                // Check if data is an array or has a projects property that's an array
                const projectsArray: Project[] = Array.isArray(data) ? data : (data.projects || []);

                // Use dummy data if API returns empty array, otherwise use API data
                if (projectsArray.length === 0) {
                    console.log('No projects from API, using dummy data');
                    processProjectsData(DUMMY_PROJECTS);
                } else {
                    processProjectsData(projectsArray);
                }
            })
            // ****************************** MAP ******************************
            .catch(error => {
                console.error('Error fetching projects:', error);
// ****************************** MAP ******************************
                console.log('Using dummy data as fallback');
                // Use dummy data as fallback when API fails
                processProjectsData(DUMMY_PROJECTS);
            });
// ****************************** MAP ******************************
    }, []);

    // Effects
    useEffect(() => {
        const updateMapDimensions = () => {
            if (mapRef.current) {
                setMapDimensions({
                    width: mapRef.current.offsetWidth,
                    height: mapRef.current.offsetHeight
                });
            }
        };

        updateMapDimensions();
        window.addEventListener('resize', updateMapDimensions);

        // Add click event listener to handle clicks outside project cards
        // We need to use a wrapper function to convert React.MouseEvent to DOM MouseEvent
        const handleOutsideClickDOM = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (selectedProject &&
                !target.closest('.project-card') &&
                !target.closest('.map-control') &&
                !target.closest('.projects-carousel')) {
                setSelectedProject(null);
                // Reset map zoom when closing project view
                setMapZoom(8);

                // Reset map center to country default
                if (selectedCountry === 'rwanda') {
                    setMapCenter({ lat: -1.9403, lng: 29.8739 }); // Kigali, Rwanda
                } else if (selectedCountry === 'burkina faso') {
                    setMapCenter({ lat: 12.3714, lng: -1.5197 }); // Ouagadougou, Burkina Faso
                } else {
                    setMapCenter(null); // Default view
                }
            }
        };

        document.addEventListener('mousedown', handleOutsideClickDOM);

        return () => {
            window.removeEventListener('resize', updateMapDimensions);
            document.removeEventListener('mousedown', handleOutsideClickDOM);
        };
    }, [selectedProject, selectedCountry]);

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
                        <span><TranslatableText>Where we</TranslatableText></span>
                        <span className="text-primary-green"><TranslatableText> work</TranslatableText></span>
                    </h2>
                    <p className="text-gray-600 max-w-3xl mx-auto">
                        <TranslatableText>
                            GanzAfrica operates across Africa, equipping young professionals with the skills and
                            opportunities to drive meaningful change in Africa&apos;s agri-food systems.
                            We currently have projects in 2 countries.
                        </TranslatableText>
                    </p>
                </motion.div>

                <div className="flex flex-col items-center mb-10">
                    {/* Country selector and highlights button */}

                    {/* Stats grid - Using dynamic data from API */}
                    <motion.div
                        className="grid grid-cols-3 gap-6 max-w-xl mx-auto mb-8"
                        variants={statsVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <motion.div className="text-center" variants={statItemVariants}>
                            <p className="text-3xl font-bold text-green-700">
                                <TranslatableText>
                                    {isLoading ? '...' : statsData.projects}
                                </TranslatableText>
                            </p>
                            <p className="text-sm text-gray-600">
                                <TranslatableText>Projects</TranslatableText>
                            </p>
                        </motion.div>
                        {/* <motion.div className="text-center" variants={statItemVariants}>
              <p className="text-3xl font-bold text-green-700">
                {isLoading ? '...' : statsData.communities}
              </p>
              <p className="text-sm text-gray-600">Districts </p>
            </motion.div> */}
                        <motion.div className="text-center" variants={statItemVariants}>
                            <p className="text-3xl font-bold text-green-700">
                                {isLoading ? '...' : statsData.countries}
                            </p>
                            <p className="text-sm text-gray-600">
                                <TranslatableText>Countries</TranslatableText>
                            </p>
                        </motion.div>
                    </motion.div>
                </div>
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
                    <button className="bg-primary-green hover:bg-green-700 text-white px-4 py-3 rounded-md text-sm font-medium transition-colors">
                        <TranslatableText>
                            Highlights of our work
                        </TranslatableText>
                    </button>
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
                    {isLoading ? (
                        <div className="flex items-center justify-center h-full bg-gray-100">
                            <p className="text-gray-500">
                                <TranslatableText>
                                    Loading map...
                                </TranslatableText>
                            </p>
                        </div>
                    ) : filteredLocations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full bg-gray-100">
                            <p className="text-gray-700 font-medium text-lg mb-2">
                                <TranslatableText>
                                    No Projects Yet
                                </TranslatableText>
                            </p>
                            <p className="text-gray-500">
                                <TranslatableText>
                                    We don&apos;t have any projects in {selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1)} yet.
                                </TranslatableText>
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Google Maps iframe - using location of a current project if selected */}
                            <iframe
                                key={`${currentProject?.id || selectedCountry}-${mapZoom}`}
                                ref={mapIframeRef}
                                src={currentProject && currentProject.mapCoordinates && currentProject.mapCoordinates.mapUrl
                                    ? currentProject.mapCoordinates.mapUrl
                                    : mapCenter && mapCenter.mapUrl
                                        ? mapCenter.mapUrl
                                        : selectedCountry === 'rwanda'
                                            ? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63817.18087378733!2d30.019363028729005!3d-1.944098787600761!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19dca42968f6b901%3A0xfba4f422b2a13a89!2sKigali%2C%20Rwanda!5e0!3m2!1sen!2sus!4v1712031042989!5m2!1sen!2sus"
                                            : selectedCountry === 'burkina faso'
                                                ? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125171.40082591335!2d-1.6126624448655638!3d12.36712576629056!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xe2e9c23908451f%3A0x1f1d8074e9c2d0ab!2sOuagadougou%2C%20Burkina%20Faso!5e0!3m2!1sen!2sus!4v1712031172461!5m2!1sen!2sus"
                                                : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31397.814232798383!2d20.053565!3d0.084886!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1779fe8521916c39%3A0x2caec1cf01ad37f!2sAfrica!5e0!3m2!1sen!2sus!4v1681732186562!5m2!1sen!2sus"
                                }
                                width="100%"
                                height="100%"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title={`GanzAfrica Projects Map - ${selectedCountry.charAt(0).toUpperCase() + selectedCountry.slice(1)}`}
                            ></iframe>

                            {/* Map controls for zoom */}
                            <div className="absolute top-3 right-3 flex flex-col space-y-2 map-control z-10">
                                <button
                                    className="bg-white rounded-full w-8 h-8 shadow-md flex items-center justify-center hover:bg-gray-100"
                                    onClick={handleZoomIn}
                                >
                                    <SafePlus className="w-5 h-5 text-gray-700" />
                                </button>
                                <button
                                    className="bg-white rounded-full w-8 h-8 shadow-md flex items-center justify-center hover:bg-gray-100"
                                    onClick={handleZoomOut}
                                >
                                    <SafeMinus className="w-5 h-5 text-gray-700" />
                                </button>
                            </div>

                            {/* Project markers with in-map cards */}
                            {filteredLocations.map((location, locationIndex) => {
// ****************************** MAP ******************************
// Recalculate position based on current selected country and stored coordinates
                                // This ensures markers are positioned correctly when switching countries
                                const recalculatedMapPosition = getMapPosition(location.mapCoordinates, selectedCountry);
                                const basePosition = getMarkerPosition(recalculatedMapPosition);
// ****************************** MAP ******************************

                                // Check if this location is part of a cluster
                                let isInCluster = false;
                                let clusterKey = '';
                                let clusterIndex = 0;
                                let clusterTotal = 1;

                                if (location.mapCoordinates) {
                                    clusterKey = `${location.mapCoordinates.lat.toFixed(4)},${location.mapCoordinates.lng.toFixed(4)}`;

                                    if (multipleProjectsAtLocation[clusterKey]) {
                                        isInCluster = true;
                                        clusterTotal = (multipleProjectsAtLocation[clusterKey] ?? []).length;
                                        clusterIndex = (multipleProjectsAtLocation[clusterKey] ?? []).indexOf(location.id);

                                        // If index not found, use a default
                                        if (clusterIndex === -1) clusterIndex = locationIndex % clusterTotal;
                                    }
                                }

                                // Apply clustered positioning if this is part of a cluster
                                const position = isInCluster ?
                                    getClusteredPosition(basePosition, clusterIndex, clusterTotal) :
                                    basePosition;

                                const isSelected = selectedProject === location.id;
                                const isHovered = hoveredProject === location.id;

                                // Show total count for first marker in each cluster
                                const showClusterCount = isInCluster && clusterIndex === 0;

                                // But still render if map is not properly sized yet to avoid flickering
                                if (mapDimensions.width > 50 && mapDimensions.height > 50 &&
                                    (position.x < 0 || position.x > mapDimensions.width ||
                                        position.y < 0 || position.y > mapDimensions.height)) {
                                    return null;
                                }

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
                                            onMouseEnter={() => handleProjectMouseEnter(location.id)}
                                            onMouseLeave={handleProjectMouseLeave}
                                        >
                                            {/* Marker with profile image */}
                                            <div
                                                className={`rounded-full overflow-hidden transform -translate-x-1/2 -translate-y-1/2 transition-transform duration-200 ${isSelected ? 'scale-110 z-30' : 'hover:scale-105'}`}
                                                style={{
                                                    width: '40px',
                                                    height: '40px',
                                                    border: `3px solid ${isSelected ? '#F59E0B' : '#047857'}`,
                                                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
                                                }}
                                            >
                                                <img
                                                    src={location.image}
                                                    alt={location.title}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null;
                                                        target.src = '/images/food-system-1.png'; // Fallback image
                                                    }}
                                                />
                                            </div>

                                            {/* Location label - show on hover or when selected */}
                                            {(isSelected || isHovered) && (
                                                <div
                                                    className="absolute whitespace-nowrap text-center mt-1 text-xs font-medium bg-white px-2 py-1 rounded-md shadow-sm -translate-x-1/2"
                                                    style={{ top: '100%', left: '50%' }}
                                                >
                                                    {location.location}
                                                </div>
                                            )}

                                            {/* Cluster indicator - show for first marker in cluster */}
                                            {showClusterCount && clusterTotal > 1 && (
                                                <div
                                                    className="absolute bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                                                    style={{ top: '-8px', right: '-8px' }}
                                                    onClick={(e) => handleClusterClick(clusterKey, e)}
                                                >
                                                    {clusterTotal}
                                                </div>
                                            )}
                                        </div>

                                        {/* Project card - show on selection or hover */}
                                        {(isSelected || isHovered) && (
                                            <div
                                                className="absolute bg-white rounded-lg shadow-lg overflow-hidden z-20 project-card w-52"
                                                style={{
                                                    top: '-105px',
                                                    left: '-110px',
                                                    pointerEvents: isSelected ? 'auto' : 'none',
                                                    transition: isSelected ? 'all 0.3s ease' : 'none'
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                {/* Close button in top right corner */}
                                                <button
                                                    className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 z-30"
                                                    onClick={handleCloseProject}
                                                >
                                                    <SafeX className="w-4 h-4 text-gray-600" />
                                                </button>

                                                {/* Card content */}
                                                <div className="relative">
                                                    {/* Project image */}
                                                    <div className="relative h-24">
                                                        <img
                                                            src={location.image}
                                                            alt={location.title}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.onerror = null;
                                                                target.src = '/images/food-system-1.png'; // Fallback image
                                                            }}
                                                        />
                                                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-0.5 text-xs font-semibold rounded">
                                                            {location.location}
                                                        </div>
                                                    </div>

                                                    {/* Project info */}
                                                    <div className="p-3">
                                                        <h3 className="font-bold text-green-700 text-sm mb-1 line-clamp-1">
                                                            {location.title}
                                                        </h3>
                                                        <>
                                                            <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                                                {location.description}
                                                            </p>
                                                            <SafeLink
                                                                href={`/projects/${location.projectId}`}
                                                                className="text-xs text-yellow-600 hover:text-yellow-800 font-medium"
                                                            >
                                                                Learn more
                                                            </SafeLink>
                                                        </>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Show projects at the same location carousel - when a project is selected and has others at same location */}
                            {selectedProject && projectsAtSameLocation.length > 1 && (
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 projects-carousel">
                                    <div className="bg-white rounded-lg shadow-lg p-2 flex space-x-2 items-center">
                                        <p className="text-xs font-medium text-gray-700 mr-1">
                                            Projects in this location:
                                        </p>
                                        {projectsAtSameLocation.map((project) => (
                                            <div
                                                key={project.id}
                                                className="block group cursor-pointer"
                                                onClick={() => handleProjectClick(project.id)}
                                            >
                                                <img
                                                    src={project.image}
                                                    alt={project.title}
                                                    className="w-8 h-8 rounded-full object-cover border-2 border-transparent group-hover:border-yellow-500"
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.onerror = null;
                                                        target.src = '/images/food-system-1.png';
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </motion.div>

                {/* Instructions */}
                <div className="mt-4 text-center text-sm text-gray-600">
                    <TranslatableText>
                        Hover over a project marker to view details. Click a marker to focus the map on that location.
                        Use the + and - buttons to adjust zoom level. Numbers on markers indicate multiple projects in that location.
                    </TranslatableText>
                </div>
            </Container>
        </section>
    );
};

export default ClimateInitiativesMapSection;