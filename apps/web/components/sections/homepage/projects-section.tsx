'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DecoratedHeading } from '@/components/layout/headertext';
import { ArrowRight } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

// Type definitions
type ProjectMedia = {
id: string;
tag: string;
url: string;
size: number;
type: string;
cover: boolean;
order: number;
title: string;
description: string;
};

type Project = {
id: number;
name: string;
description: string;
status: string;
start_date: string;
end_date: string;
created_by: number;
category_id: number;
media: {
    items: ProjectMedia[];
};
created_at: string;
updated_at: string;
};

type ProjectsResponse = {
projects: Project[];
pagination: {
    total: string;
    page: number;
    limit: number;
    pages: number;
};
};

type ProjectsSectionProps = {
locale: string;
dict: Record<string, any>;
};

const PROJECTS_PER_PAGE = 3;
const MAX_PROJECTS = 6;
const AUTO_SLIDE_INTERVAL = 5000; // 5 seconds

// Define color scheme for project cards
const CARD_COLORS = ['#f8b712', '#009758', '#073392'];
const CARD_CATEGORIES = ['Land', 'Agriculture', 'Environment'];

// Helper function to get project category and color
const getProjectCategory = (index: number) => {
  const colorIndex = index % CARD_COLORS.length;
  return {
    color: CARD_COLORS[colorIndex],
    category: CARD_CATEGORIES[colorIndex] || 'Project'
  };
};

export default function ProjectsSection({ locale, dict }: ProjectsSectionProps): JSX.Element {
const [projects, setProjects] = useState<Project[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);
const [activePage, setActivePage] = useState(0);
const [direction, setDirection] = useState(1); // 1 for right, -1 for left

// Memoized function to get fallback projects with your specific projects
const getFallbackProjects = useCallback((): Project[] => {
    return [
        {
            id: 1,
            name: 'Food Systems',
            description: 'We have cross cutting projects that tackles food system problems.',
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString(),
            created_by: 1,
            category_id: 1,
            media: {
                items: [
                    {
                        id: 'media-1',
                        tag: 'feature',
                        url: '/images/ganzafrica-fellows.jpg',
                        size: 1000,
                        type: 'image',
                        cover: false,
                        order: 1,
                        title: 'Food Systems',
                        description: ''
                    }
                ]
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 2,
            name: 'Agriculture Farming',
            description: 'Our fellows work closely with farmers on a daily basis.',
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString(),
            created_by: 1,
            category_id: 1,
            media: {
                items: [
                    {
                        id: 'media-2',
                        tag: 'feature',
                        url: '/images/harvest1.png',
                        size: 1000,
                        type: 'image',
                        cover: false,
                        order: 1,
                        title: 'Agriculture Farming',
                        description: ''
                    }
                ]
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        },
        {
            id: 3,
            name: 'Project Tracking System',
            description: 'A comprehensive monitoring and evaluation system for all our initiatives.',
            status: 'active',
            start_date: new Date().toISOString(),
            end_date: new Date().toISOString(),
            created_by: 1,
            category_id: 1,
            media: {
                items: [
                    {
                        id: 'media-3',
                        tag: 'feature',
                        url: '/images/famer-feild.png',
                        size: 1000,
                        type: 'image',
                        cover: false,
                        order: 1,
                        title: 'Project Tracking System',
                        description: ''
                    }
                ]
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }
    ];
}, []);

// Add a state to track if we're showing no projects message
const [noProjects, setNoProjects] = useState(false);

// Fetch projects from API with retry logic and rate limit handling
useEffect(() => {
    const fetchProjects = async () => {
        try {
            setLoading(true);
            setNoProjects(false);
            
            // Set a longer timeout and add retry logic
            const response = await apiClient.get<ProjectsResponse>('/projects', {
                params: {
                    limit: MAX_PROJECTS,
                    page: 1,
                    sort_by: 'created_at',
                    sort_order: 'desc',
                },
                timeout: 10000 // 10 seconds timeout
            }).catch(error => {
                // Check for rate limiting (429) or any other API error
                console.warn('API error, using fallback data', error.message);
                // Use fallback projects instead of empty array
                setProjects(getFallbackProjects());
                setLoading(false);
                return null; // Return null to indicate we've handled it
            });
            
            if (response) {
                if (response.data.projects && response.data.projects.length > 0) {
                    // Ensure each project has the required fields and media
                    const formattedProjects = response.data.projects.map(project => ({
                        ...project,
                        // Ensure media items have required fields
                        media: {
                            items: project.media?.items?.map((item, idx) => ({
                                id: item.id || `media-${idx}`,
                                tag: item.tag || 'feature',
                                url: item.url || '/images/placeholder.png',
                                size: item.size || 0,
                                type: item.type || 'image',
                                cover: item.cover || false,
                                order: item.order || idx,
                                title: item.title || project.name,
                                description: item.description || ''
                            })) || []
                        }
                    }));
                    
                    setProjects(formattedProjects);
                    setError(null);
                    setNoProjects(false);
                } else {
                    // If API returns empty array, use fallback projects
                    console.info('No projects from API, using fallback data');
                    setProjects(getFallbackProjects());
                }
                setLoading(false);
            }
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Unable to load projects');
            // Use fallback projects instead of empty array
            setProjects(getFallbackProjects());
            setNoProjects(false);
            setLoading(false);
        }
    };

    fetchProjects();
}, [getFallbackProjects]);

const changePage = useCallback((pageIndex: number) => {
    // Set direction based on which page is clicked
    const newDirection = pageIndex > activePage ? 1 : -1;
    setDirection(newDirection);
    setActivePage(pageIndex);
}, [activePage]);

// Auto change page every 5 seconds
useEffect(() => {
    const totalPages = Math.ceil(Math.min(projects.length, MAX_PROJECTS) / PROJECTS_PER_PAGE);
    if (totalPages <= 1) return; // Don't auto-slide if there's only one page
    
    const interval = setInterval(() => {
        const nextPage = (activePage + 1) % totalPages;
        changePage(nextPage);
    }, AUTO_SLIDE_INTERVAL);
    
    return () => clearInterval(interval);
}, [activePage, projects.length, changePage]);

// Get feature image URL helper with better fallback handling
const getFeatureImageUrl = useCallback((project: Project): string => {
    if (project.media?.items) {
        const featureImage = project.media.items.find(item => item.tag === 'feature');
        if (featureImage?.url) {
            return featureImage.url;
        }
    }
    
    // Use a single reliable placeholder instead of multiple images that might 404
    return '/images/placeholder.png';
}, []);

// Helper function to truncate description
const truncateDescription = useCallback((description: string, maxLength = 100): string => {
    if (!description) return '';
    if (description.length <= maxLength) return description;
    return `${description.substring(0, maxLength)}...`;
}, []);

// Project URL builder
const getProjectUrl = useCallback((projectId: number): string => {
    return `/${locale}/projects/${projectId}`;
}, [locale]);

// Add No Projects Available message - only show if both API and fallbacks fail
if (!loading && projects.length === 0) {
    return (
        <section className="bg-[#f2faf6] relative overflow-hidden py-8">
            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <div className="text-center mb-8">
                    <DecoratedHeading
                        firstText={dict?.projects?.heading_first ?? "Featured"}
                        secondText={dict?.projects?.heading_second ?? "Properties"}
                        className="mx-auto"
                    />
                </div>
                
                {/* No Projects Message */}
                <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-gray-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No Projects Available</h3>
                    <p className="text-gray-600 max-w-md mx-auto">
                        We don't have any projects running at the moment. Please check back later for upcoming properties.
                    </p>
                </div>
                
                {/* Call to action - can be modified or removed if not needed when no projects */}
                <div className="text-center mt-6">
                    <Link
                        href={`/${locale}/contact`}
                        className={cn(
                            "inline-flex items-center gap-2",
                            "bg-primary-green hover:bg-primary-green/90",
                            "text-white py-2.5 px-6 rounded-lg",
                            "transition-all duration-300 hover:shadow-lg",
                            "text-sm font-medium"
                        )}
                    >
                        <span>Contact Us</span>
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </section>
    );
}

// Limit to max 6 projects and divide into pages of 3
const limitedProjects = projects.slice(0, MAX_PROJECTS);
const totalPages = Math.ceil(limitedProjects.length / PROJECTS_PER_PAGE);
const currentProjects = limitedProjects.slice(
    activePage * PROJECTS_PER_PAGE, 
    activePage * PROJECTS_PER_PAGE + PROJECTS_PER_PAGE
);

return (
    <section className="relative overflow-hidden py-8 md:py-10 bg-secondary-green/5">
        {/* Subtle dot pattern */}
        <div className="absolute inset-0 opacity-20" style={{
            backgroundImage: 'radial-gradient(circle, #4a5568 1px, transparent 1px)',
            backgroundSize: '20px 20px',
            backgroundPosition: 'center',
            backgroundRepeat: 'repeat',
            pointerEvents: 'none'
        }} />
        
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="text-center mb-8">
                <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-3xl md:text-4xl font-bold">
                        {dict?.projects?.heading_first || "Featured"} <span className="text-primary-green">{dict?.projects?.heading_second || "Projects"}</span>
                    </h2>
                </motion.div>
            </div>

            {/* Error message */}
            {error && (
                <div className="text-center text-red-500 mb-8" role="alert">
                    {error}
                </div>
            )}

            {/* Projects grid with animation */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentProjects.map((project, index) => {
                    // Get color and category based on index
                    const { color, category } = getProjectCategory(index);
                    
                    return (
                        <motion.div 
                            key={project.id}
                            className="group relative overflow-hidden rounded-xl bg-white shadow-lg hover:shadow-xl transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            {/* Image container */}
                            <div className="relative h-48 overflow-hidden">
                                <Image
                                    src={getFeatureImageUrl(project)}
                                    alt={project.name}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                    <span className="text-white font-medium text-lg">{project.name}</span>
                                </div>
                            </div>
                            
                            {/* Content */}
                            <div className="p-6">
                                <div className="relative h-10 mb-4 overflow-hidden">
                                    {/* Title - always visible */}
                                    <div className="absolute inset-0 transition-all duration-300 group-hover:opacity-0">
                                        <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                                            {project.name}
                                        </h3>
                                    </div>
                                    
                                    {/* Category - visible on hover */}
                                    <div className="absolute inset-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <div className="flex items-center">
                                            <div 
                                                className="w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0"
                                                style={{ backgroundColor: `${color}20` }}
                                            >
                                                <div className="w-6 h-6" style={{ color }}>
                                                    {index % 3 === 0 ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                    ) : index % 3 === 1 ? (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                                                        </svg>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                            </div>
                                            <span 
                                                className="text-xs font-medium uppercase tracking-wider opacity-90"
                                                style={{ color }}
                                            >
                                                {category}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <p className="text-gray-600 mb-4 line-clamp-3">
                                    {truncateDescription(project.description, 120)}
                                </p>
                                
                                <Link
                                    href={getProjectUrl(project.id)}
                                    className="inline-flex items-center text-sm font-medium group"
                                    style={{ color }}
                                >
                                    <span className="border-b border-transparent group-hover:border-current transition-all duration-300">
                                        Learn more
                                    </span>
                                    <svg className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </Link>
                            </div>
                            
                            {/* Accent border */}
                            <div className="h-1 w-full" style={{ backgroundColor: color }}></div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Call to action */}
            <motion.div 
                className="text-center mt-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <Link
                    href={`/${locale}/projects`}
                    className={cn(
                        "group relative inline-flex items-center justify-center",
                        "bg-primary-green text-white py-4 px-8 rounded-lg",
                        "text-sm font-medium tracking-wider uppercase",
                        "overflow-hidden transition-all duration-300",
                        "hover:bg-opacity-90 hover:pl-10 hover:pr-6 "
                    )}
                >
                    <span className="relative z-10">
                        {dict?.cta?.view_all_projects || "View All Projects"}
                    </span>
                    <ArrowRight 
                        size={16} 
                        className="ml-2 transition-all duration-300 transform group-hover:translate-x-1" 
                    />
                    <span className="absolute left-0 top-0 w-0 h-full bg-primary-green transition-all duration-300 group-hover:w-full -z-1"></span>
                </Link>
            </motion.div>
            
            {/* Pagination Dots - only show if there are multiple pages */}
            {totalPages > 1 && (
                <div className="flex justify-center mt-6 gap-3">
                    {Array.from({ length: totalPages }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => changePage(i)}
                            className={cn(
                                "w-3 h-3 rounded-full transition-all duration-300",
                                activePage === i 
                                    ? "bg-primary-green shadow-lg" 
                                    : "bg-primary-orange/40"
                            )}
                            aria-label={`Go to page ${i + 1}`}
                            aria-current={activePage === i ? "true" : "false"}
                        />
                    ))}
                </div>
            )}
        </div>

        {/* Custom CSS for the perspective effect and button styling */}
        <style jsx global>{`
            .property-card {
                position: relative;
                border-radius: 24px;
                background: white;
                box-shadow: 0 6px 16px rgba(0,0,0,0.08);
                overflow: hidden;
                transition: all 0.3s ease;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            
            .property-card:hover {
                box-shadow: 0 12px 24px rgba(0,0,0,0.12);
            }
            
            .perspective-wrapper {
                perspective: 1000px;
            }
            
            .perspective-element {
                position: relative;
                height: 180px;
                width: 100%;
                overflow: hidden;
                transform-style: preserve-3d;
                border-radius: 24px 24px 0 0;
            }
            
            .perspective-image {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-size: cover;
                background-position: center;
                border-radius: 24px 24px 0 0;
                transform: translateZ(0) rotateY(-5deg) scale(1.05);
                transform-origin: right center;
                box-shadow: -8px 5px 10px rgba(0,0,0,0.1);
                transition: all 0.5s ease;
            }
            
            .property-card:hover .perspective-image {
                transform: translateZ(10px) rotateY(-8deg) scale(1.08);
            }
            
            /* View Project button styling */
            .view-project-button {
                display: inline-flex;
                align-items: center;
                justify-content: center;
                background-color: white;
                color: #117B34; /* primary-green color */
                font-weight: 600;
                font-size: 14px;
                padding: 8px 16px;
                border-radius: 9999px; /* fully rounded */
                border: 1px solid #E5E7EB;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
                transition: all 0.2s ease;
            }
            
            .view-project-button:hover {
                background-color: #F9FAFB;
                box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
            }
            
            @media (max-width: 768px) {
                .property-card {
                    max-width: 320px;
                    margin: 0 auto;
                }
            }
        `}</style>
    </section>
);
}