'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DecoratedHeading } from '@/components/layout/headertext';
import { ChevronLeft, ChevronRight, Eye, ArrowRight } from 'lucide-react';
import apiClient from '@/lib/api-client';


// Interface for the project data from the API
interface ProjectMedia {
    id: string;
    tag: string;
    url: string;
    size: number;
    type: string;
    cover: boolean;
    order: number;
    title: string;
    description: string;
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
    media: {
        items: ProjectMedia[];
    };
    created_at: string;
    updated_at: string;
}

interface ProjectsResponse {
    projects: Project[];
    pagination: {
        total: string;
        page: number;
        limit: number;
        pages: number;
    };
}

interface ProjectsSectionProps {
    locale: string;
    dict: any;
}

export default function ProjectsSection({ locale, dict }: ProjectsSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch projects from API
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get<ProjectsResponse>('/projects', {
                    params: {
                        limit: 10,
                        page: 1,
                        sort_by: 'created_at',
                        sort_order: 'desc',
                    }
                });
                setProjects(response.data.projects);
                setError(null);
            } catch (err) {
                console.error('Error fetching projects:', err);
                setError('Failed to load projects');
                // Set fallback projects in case of error
                setProjects([
                    {
                        id: 1,
                        name: 'Food Systems',
                        description: 'We have cross cutting projects that tackles food system problems.',
                        status: 'active',
                        start_date: new Date().toISOString(),
                        end_date: new Date().toISOString(),
                        created_by: 1,
                        category_id: 1,
                        location: 'Kigali',
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
                        location: 'Kigali',
                        media: {
                            items: [
                                {
                                    id: 'media-2',
                                    tag: 'feature',
                                    url: '/images/ganzafrica-fellows.jpg',
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
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const nextSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex + 1) % projects.length);
    };

    const prevSlide = () => {
        setActiveIndex((prevIndex) => (prevIndex - 1 + projects.length) % projects.length);
    };

    const getSlidePosition = (index: number) => {
        const diff = (index - activeIndex + projects.length) % projects.length;
        if (diff === 0) return 'position-3'; // center
        if (diff === 1 || diff === -4) return 'position-4'; // right middle
        if (diff === 2 || diff === -3) return 'position-5'; // far right
        if (diff === -1 || diff === 4) return 'position-2'; // left middle
        if (diff === -2 || diff === 3) return 'position-1'; // far left
        return 'position-none'; // hidden
    };

    const getFeatureImageUrl = (project: Project) => {
        if (project.media && project.media.items) {
            const featureImage = project.media.items.find(item => item.tag === 'feature');
            if (featureImage && featureImage.url) {
                return featureImage.url;
            }
        }
        // Fallback image if no feature image is found
        return '/images/placeholder.png';
    };

    // Helper function to truncate description
    const truncateTitle = (title: string, maxLength = 40) => {
        if (!title) return '';
        if (title.length <= maxLength) return title;
        return title.substring(0, maxLength) + '...';
    };

    const truncateDescription = (description: string, maxLength = 120) => {
        if (!description) return '';
        if (description.length <= maxLength) return description;
        return description.substring(0, maxLength) + '...';
    };


// Additionally, you can create different truncation lengths based on slide position
    const getTitleMaxLength = (slidePosition: string) => {
        switch (slidePosition) {
            case 'position-3': // center slide (main focus)
                return 50;
            case 'position-2': // left middle
            case 'position-4': // right middle
                return 30;
            default: // far positions
                return 20;
        }
    };

    const getDescriptionMaxLength = (slidePosition: string) => {
        switch (slidePosition) {
            case 'position-3': // center slide (main focus)
                return 150;
            case 'position-2': // left middle
            case 'position-4': // right middle
                return 80;
            default: // far positions
                return 60;
        }
    };
    // Project URL builder
    const getProjectUrl = (projectId: number) => {
        return `/${locale}/projects/${projectId}`;
    };

    // Show loading skeleton
    if (loading && projects.length === 0) {
        return (
            <section className="py-16 md:py-24 bg-secondary-green/10 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <div className="h-12 w-72 bg-gray-200 animate-pulse rounded-md mx-auto"></div>
                    </div>
                    <div className="relative mb-12">
                        <div className="h-[400px] md:h-[500px] relative flex justify-center items-center">
                            <div className="w-64 h-96 bg-gray-200 animate-pulse rounded-2xl mx-auto"></div>
                        </div>
                        <div className="flex justify-center items-center gap-3 mt-8">
                            <div className="w-32 md:w-40 h-1.5 bg-gray-200 animate-pulse rounded-full"></div>
                            <div className="p-2 rounded-full bg-gray-200 animate-pulse"></div>
                            <div className="p-2 rounded-full bg-gray-200 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    const activeProject = projects[activeIndex];

    return (
        <section className="py-16 md:py-24 bg-secondary-green/10 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <DecoratedHeading
                        firstText={dict?.projects?.heading_first ?? "Our"}
                        secondText={dict?.projects?.heading_second ?? "Projects"}
                        className="mx-auto"
                    />
                </div>

                {/* Error message */}
                {error && (
                    <div className="text-center text-red-500 mb-8">{error}</div>
                )}

                <div className="relative mb-12">
                    <div className="h-[400px] md:h-[500px] relative perspective-1000">
                        <div className="slider-content relative h-full w-full flex justify-center items-center">
                            {projects.map((project, idx) => (
                                <div
                                    key={project.id}
                                    className={`
                                        absolute rounded-2xl overflow-hidden transition-all duration-500
                                        ${getSlidePosition(idx)}
                                    `}
                                >
                                    <div className="relative w-full h-full">
                                        <img
                                            src={getFeatureImageUrl(project)}
                                            alt={project.name}
                                            className="w-full h-full object-cover"
                                        />

                                        <div className={`absolute inset-0 ${idx === activeIndex ? 'bg-black/20' : 'bg-black/80'}`} />


                                        {/* View project link - Only visible for center slide */}
                                        {idx === activeIndex && (
                                            <Link
                                                href={getProjectUrl(project.id)}
                                                className="absolute top-4 right-4 bg-white text-primary-green flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full hover:bg-primary-green hover:text-white transition-colors"
                                            >
                                                <Eye size={16} /> View Project
                                            </Link>
                                        )}

                                        <div className="absolute bottom-6 right-6 max-w-[80%] bg-primary-green/90 backdrop-blur-sm rounded-lg p-4">
                                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{truncateTitle(project.name)}</h3>
                                            <p className="text-sm text-white line-clamp-2">{truncateDescription(project.description)}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-center items-center gap-3 mt-8">
                        <div className="w-32 md:w-40 h-1.5 bg-primary-orange rounded-full overflow-hidden relative">
                            <div
                                className="h-full bg-secondary-green absolute left-0 top-0 transition-all duration-500 ease-in-out w-10"
                                style={{ left: `${(activeIndex * 100) / Math.max(projects.length, 1)}%` }}
                            />
                        </div>

                        <button
                            onClick={prevSlide}
                            className="p-2 rounded-full bg-white hover:bg-secondary-green transition-colors"
                            aria-label="Previous project"
                        >
                            <ChevronLeft className="w-6 h-6 text-primary-orange" />
                        </button>

                        <button
                            onClick={nextSlide}
                            className="p-2 rounded-full bg-white hover:bg-secondary-green transition-colors"
                            aria-label="Next project"
                        >
                            <ChevronRight className="w-6 h-6 text-primary-orange" />
                        </button>
                    </div>
                </div>

                {/* Call to action to view all projects */}
                <div className="text-center mt-12">
                    <Link
                        href={`/${locale}/projects`}
                        className="inline-flex items-center gap-2 bg-primary-green hover:bg-primary-green/90 text-white py-3 px-6 rounded-lg transition-colors"
                    >
                        <span>{dict?.cta?.view_all_projects || "View All Projects"}</span>
                        <ArrowRight size={18} />
                    </Link>
                </div>
            </div>

            <style jsx>{`
                .perspective-1000 {
                    perspective: 1000px;
                }
                
                .slider-content > div {
                    position: absolute;
                    height: 26rem;
                    width: 20rem;
                    transition: all 0.5s ease-in-out;
                    transform-style: preserve-3d;
                    box-shadow: 0px 0.4rem 1.6rem rgba(0, 0, 0, 0.3); /* Shadow for ALL slides */
                }

                .position-1 {
                    left: 15%;
                    transform: translate(-50%, 0) rotateY(-2deg) scale(0.8, 0.8);
                    opacity: 0.5;
                    z-index: 1;
                }

                .position-2 {
                    left: 32%;
                    transform: translate(-50%, 0) rotateY(-1deg) scale(0.9, 0.9);
                    opacity: 0.95;
                    z-index: 2;
                }

                .position-3 {
                    left: 50%;
                    transform: translate(-50%, 0) rotateY(0deg) scale(1, 1);
                    opacity: 1;
                    z-index: 4;
                    box-shadow: none
                }

                .position-4 {
                    left: 68%;
                    transform: translate(-50%, 0) rotateY(1deg) scale(0.9, 0.9);
                    opacity: 0.95;
                    z-index: 2;
                }

                .position-5 {
                    left: 85%;
                    transform: translate(-50%, 0) rotateY(2deg) scale(0.8, 0.8);
                    opacity: 0.5;
                    z-index: 1;
                }

                .position-none {
                    left: 50%;
                    transform: translate(-50%, 0) rotateY(0deg) scale(0.7, 0.7);
                    opacity: 0;
                    z-index: 0;
                }

                @media (max-width: 768px) {
                    .slider-content > div {
                        height: 20rem;
                        width: 14rem;
                    }
                }
            `}</style>
        </section>
    );
}