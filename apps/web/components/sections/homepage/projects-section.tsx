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
                    setProjects(response.data.projects);
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
        <section className="bg-[#f2faf6] relative overflow-hidden py-16">
            <div className="container mx-auto px-4 max-w-6xl relative z-10">
                <div className="text-center mb-16">
                    <DecoratedHeading
                        firstText={dict?.projects?.heading_first ?? "Featured"}
                        secondText={dict?.projects?.heading_second ?? "Properties"}
                        className="mx-auto"
                    />
                </div>
                
                {/* No Projects Message */}
                <div className="text-center py-16">
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
    <section className="bg-[#f2faf6] relative overflow-hidden py-16">
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-16">
                <DecoratedHeading
                    firstText={dict?.projects?.heading_first ?? "Featured"}
                    secondText={dict?.projects?.heading_second ?? "Properties"}
                    className="mx-auto"
                />
            </div>

            {/* Error message */}
            {error && (
                <div className="text-center text-red-500 mb-8" role="alert">
                    {error}
                </div>
            )}

            {/* Projects grid with animation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 overflow-hidden">
                {currentProjects.map((project) => (
                    <motion.div 
                        key={project.id} 
                        className="property-card perspective-wrapper"
                        initial={{ x: direction * 50, opacity: 0.5 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -direction * 50, opacity: 0.5 }}
                        transition={{ duration: 0.4, ease: "easeInOut" }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        {/* Featured image with fallback */}
                        <div className="perspective-element">
                            <div 
                                className="perspective-image" 
                                style={{ 
                                    backgroundImage: `url(${getFeatureImageUrl(project)})`,
                                    backgroundColor: '#117B34', // Backup color if image fails
                                }}
                                aria-label={`Image of ${project.name}`}
                            ></div>
                        </div>
                        
                        {/* Property information */}
                        <div className="p-5 bg-white">                                
                            {/* Property Name */}
                            <h3 className="text-base font-bold text-gray-900 mb-2">
                                {project.name}
                            </h3>

                            {/* Description */}
                            <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                {truncateDescription(project.description)}
                            </p>
                            
                            {/* View Project button */}
                            <Link
                                href={getProjectUrl(project.id)}
                                className="view-project-button"
                                aria-label={`View details for ${project.name}`}
                            >
                                View Project
                            </Link>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Call to action */}
            <div className="text-center mt-12">
                <Link
                    href={`/${locale}/projects`}
                    className={cn(
                        "inline-flex items-center gap-2",
                        "bg-primary-green hover:bg-primary-green/90",
                        "text-white py-2.5 px-6 rounded-lg",
                        "transition-all duration-300 hover:shadow-lg",
                        "text-sm font-medium"
                    )}
                >
                    <span>{dict?.cta?.view_all_projects || "View All Projects"}</span>
                    <ArrowRight size={16} />
                </Link>
            </div>
            
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