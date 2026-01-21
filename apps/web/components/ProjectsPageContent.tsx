"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
    Search,
    Filter,
    ArrowRight,
    MapPin,
    User,
    ChevronRight,
    ChevronLeft,
    X,
    Info
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { DecoratedHeading } from "@/components/layout/headertext";
import { default as HeaderBelt } from "@/components/layout/headerBelt";
import apiClient from '@/lib/api-client';
import { motion } from "framer-motion";
import ImpactAreasSection from "@/components/sections/food-system/impact-areas-section";
import { useDict } from '@/context/dictionary';
import { TranslatableText } from "@/components/translate/TranslatableText";

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

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

// Project Card Component (localized strings used where appropriate)
const ProjectCard: React.FC<any> = ({ project, getFeatureImage, getCategoryName }) => {
    const dict = useDict();
    const truncateDescription = (text: string | undefined): string => {
        if (!text) return dict?.projects?.cardFallback || "A sustainable project working with local communities to improve agriculture systems.";
        const words = text.split(' ');
        if (words.length <= 30) return text;
        return words.slice(0, 30).join(' ') + '...';
    };

    const formatDate = (dateString: string | null | undefined): string => {
        if (!dateString) return dict?.projects?.na || 'N/A';
        return new Date(dateString).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <Link href={`projects/${project.id}`} className="block group">
            <div className="relative bg-white shadow-sm hover:shadow-xl transition-all duration-500 rounded-lg overflow-hidden cursor-pointer h-full transform hover:-translate-y-2">
                <div className="relative w-full overflow-hidden">
                    <div className="relative">
                        <div className="absolute top-3 left-3 z-10 bg-white py-1 px-2 rounded-full text-xs font-medium shadow-md transform transition-transform duration-300 group-hover:scale-110">
                            <TranslatableText>
                                {project.status || dict?.projects?.statusActive || 'Active'}
                            </TranslatableText>
                        </div>
                        <div className="absolute top-3 right-3 z-10">
                            <div className="w-8 h-8 rounded-full text-primary-orange flex items-center justify-center transition-all duration-500 shadow-lg transform group-hover:rotate-90">
                                <ArrowRight className="w-4 h-4 text-white" />
                            </div>
                        </div>

                        <div className="relative aspect-[5/3] w-full overflow-hidden">
                            <div className="absolute inset-0 w-full h-full">
                                <img
                                    src={getFeatureImage(project)}
                                    alt={project.name}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/400/250?text=Image+Not+Available'; }}
                                />
                            </div>

                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                            <div className="absolute bottom-3 left-3 right-3 z-10 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                <h3 className="text-white text-lg font-bold">{project.name}</h3>
                                <p className="text-white/90 text-xs mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 line-clamp-3">
                                    {truncateDescription(project.description)}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-3 flex justify-between items-center bg-white">
                    <div className="flex items-center text-green-700 group-hover:text-green-600 transition-colors">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="font-medium text-sm">
                <TranslatableText>
                  {project.location || dict?.projects?.defaultLocation || 'Rwanda'}
                </TranslatableText>
              </span>
                    </div>

                    <div className="flex items-center text-green-700 group-hover:text-green-600 transition-colors">
                        <User className="w-4 h-4 mr-1" />
                        <span className="font-medium text-sm">{formatDate(project.created_at)}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

const CategoryButton: React.FC<any> = ({ name, icon, count, isActive, onClick }) => {
    return (
        <button
            onClick={onClick}
            className={`flex items-center justify-between px-4 py-3 rounded-lg w-full transition-all duration-300 ${
                isActive
                    ? 'bg-green-700 text-white shadow-md'
                    : 'bg-white border border-gray-200 hover:bg-gray-50 text-gray-700'
            }`}
        >
            <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isActive ? 'bg-white' : 'bg-green-100'
                } text-green-700`}>
                    {icon}
                </div>
                <span className="font-medium">{name}</span>
            </div>
            <span className={`text-sm ${isActive ? 'bg-white text-green-700' : 'bg-gray-200 text-gray-700'} px-2 py-0.5 rounded-full`}>
        {count}
      </span>
        </button>
    );
};

const Pagination: React.FC<any> = ({ currentPage, totalPages, onPageChange }) => {
    return (
        <div className="flex justify-center items-center mt-8 space-x-2">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-full border ${currentPage === 1 ? 'text-gray-400 border-gray-200' : 'text-green-700 border-green-600 hover:bg-green-50'}`}
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(totalPages)].map((_, index) => (
                <button
                    key={index}
                    onClick={() => onPageChange(index + 1)}
                    className={`w-10 h-10 rounded-full ${
                        currentPage === index + 1
                            ? 'bg-green-700 text-white'
                            : 'text-gray-700 border border-gray-200 hover:bg-gray-50'
                    }`}
                >
                    {index + 1}
                </button>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-full border ${currentPage === totalPages ? 'text-gray-400 border-gray-200' : 'text-green-700 border-green-600 hover:bg-green-50'}`}
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

interface Project {
    id: number;
    name: string;
    description: string;
    location: string;
    status: string;
    created_at: string;
    category_id: string | number;
    media?: {
        items?: { tag: string; url: string; cover?: boolean }[];
    };
    contact_person?: string;
}

export default function ProjectsPageContent() {
    const dict = useDict();
    const router = useRouter();
    const [projects, setProjects] = useState<Project[]>([]);
    const [allProjects, setAllProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [activeStatus, setActiveStatus] = useState('all');
    const [activeCategory, setActiveCategory] = useState('all');
    const [categoryCounts, setCategoryCounts] = useState<any>({});
    const [totalProjects, setTotalProjects] = useState(0);
    const [isPageLoaded, setIsPageLoaded] = useState(false);
    const projectsGridRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [projectsPerPage] = useState(6);
    const [totalPages, setTotalPages] = useState(1);

    const stats = [
        { label: dict?.projects?.stats?.fellows || "Fellows", count: 20 },
        { label: dict?.projects?.stats?.projects || "Projects", count: "20+" },
        { label: dict?.projects?.stats?.communities || "Communities", count: 15 },
        { label: dict?.projects?.stats?.countries || "Countries", count: 2 },
    ];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await apiClient.get('/categories');
                if (response.data) {
                    let categoriesData = response.data;
                    if (!Array.isArray(response.data) && response.data.categories && Array.isArray(response.data.categories)) {
                        categoriesData = response.data.categories;
                    }
                    const categoriesObj: Record<string, string> = {};
                    if (Array.isArray(categoriesData)) {
                        categoriesData.forEach(category => {
                            if (category && category.id && category.name) {
                                const categoryId = category.id.toString();
                                categoriesObj[categoryId] = category.name;
                            }
                        });
                        setCategories(categoriesObj);
                    }
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };

        fetchCategories();
    }, []);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const params: { search?: string; status?: string; category_id?: string } = {};
                if (searchTerm) params.search = searchTerm;
                if (activeStatus !== 'all') params.status = activeStatus;
                if (activeCategory !== 'all' && activeCategory !== (dict?.projects?.allProjects || 'All Projects')) {
                    const categoryId = Object.keys(categories).find(key => categories[key] === activeCategory);
                    if (categoryId) params.category_id = categoryId;
                }
                try {
                    const response = await apiClient.get('/projects', { params });
                    if (response.data) {
                        const projectsList = response.data.projects || [];
                        setAllProjects(projectsList);
                        const counts: any = { all: 0 };
                        projectsList.forEach((project: any) => {
                            counts.all = (counts.all || 0) + 1;
                            const catId = project.category_id;
                            if (catId) {
                                const catName = categories[catId as keyof typeof categories];
                                if (catName) counts[catName] = (counts[catName] || 0) + 1;
                            }
                        });
                        setCategoryCounts(counts);
                        setTotalProjects(counts.all || 0);
                        setTotalPages(Math.ceil(projectsList.length / projectsPerPage));
                    }
                } catch (error) {
                    console.error('API Error:', error);
                }
            } catch (error) {
                console.error('Error in fetch process:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchProjects();
    }, [searchTerm, activeStatus, activeCategory, categories]);

    useEffect(() => {
        const indexOfLastProject = currentPage * projectsPerPage;
        const indexOfFirstProject = indexOfLastProject - projectsPerPage;
        const currentProjects = allProjects.slice(indexOfFirstProject, indexOfLastProject);
        setProjects(currentProjects);
    }, [allProjects, currentPage, projectsPerPage]);

    useEffect(() => {
        const timer = setTimeout(() => setIsPageLoaded(true), 500);
        if (!isPageLoaded || loading) return;
        if (projectsGridRef.current) {
            gsap.from(".project-card", { y: 50, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power3.out" });
        }
        return () => clearTimeout(timer);
    }, [isPageLoaded, loading]);

    const getFeatureImage = (project: any): string => {
        if (project.media && project.media.items && project.media.items.length > 0) {
            const featureImage = project.media.items.find((item: any) => item.tag === 'feature' || item.cover === true);
            if (featureImage && featureImage.url) return featureImage.url;
            const descriptionImage = project.media.items.find((item: any) => item.tag === 'description');
            if (descriptionImage && descriptionImage.url) return descriptionImage.url;
            const otherImage = project.media.items.find((item: any) => item.tag === 'others' || item.tag === 'other');
            if (otherImage && otherImage.url) return otherImage.url;
            if (project.media.items[0] && project.media.items[0].url) return project.media.items[0].url;
        }
        return '/api/placeholder/400/250?text=No+Image';
    };

    const getCategoryName = (categoryId: any): string => {
        if (!categoryId) return '';
        return categories[categoryId] || categories[categoryId.toString()] || '';
    };

    const handleSearchChange = (e: any): void => { setSearchTerm(e.target.value); setCurrentPage(1); };
    const handleStatusChange = (e: any) => { setActiveStatus(e.target.value); setCurrentPage(1); };
    const handleCategoryClick = (category: string): void => { setActiveCategory(category); setCurrentPage(1); };
    const handlePageChange = (pageNumber: number): void => { setCurrentPage(pageNumber); if (projectsGridRef.current) projectsGridRef.current.scrollIntoView({ behavior: 'smooth' }); };

    const getCategoryIcon = (categoryName: string, index: number) => {
        switch(categoryName?.toLowerCase()) {
            case 'food system':
                return (
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42A8.962 8.962 0 0012 4c-4.97 0-9 4.03-9 9s4.02 9 9 9A9 9 0 0012 4c2.25 0 4.31.83 5.89 2.2zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" />
                    </svg>
                );
            default:
                return <ArrowRight className="w-5 h-5" />;
        }
    };

    const pageClass = isPageLoaded ? "opacity-100 transition-opacity duration-500" : "opacity-0";

    return (
        <div className={`${pageClass}`}>
            <HeaderBelt />
            <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image src="/images/news/maize.avif" alt={dict?.projects?.heroAlt || 'Agricultural fields'} fill sizes="100vw" className="object-cover" priority />
                </div>
                <div className="absolute inset-0 bg-black/70 z-0"></div>
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
                    <h2 className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6 mb-8">
                        <TranslatableText>{dict?.projects?.heroTitle || 'PROJECTS'}</TranslatableText>
                    </h2>
                    <h1 className="text-white text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight">
            <span>
              <TranslatableText>{dict?.projects?.heroSubtitle || 'Turning Ideas Into Action'}</TranslatableText>
            </span>
                    </h1>
                </div>
            </section>

            <HeaderBelt />

            <div className="max-w-6xl mx-auto px-4 py-8 bg-white">
                {loading && (
                    <div className="w-full h-64 flex items-center justify-center">
                        <div className="w-12 h-12 border-4 border-green-700 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                )}

                {!loading && (
                    <>
                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                            <div className="w-full md:w-2/3 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
                                <input type="text" placeholder={dict?.projects?.searchPlaceholder || 'Search projects by name, location, or category...'} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 bg-white" value={searchTerm} onChange={handleSearchChange} />
                            </div>
                            <div className="w-full md:w-1/3 flex items-center">
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Filter className="h-5 w-5 text-gray-400" /></div>
                                    <select className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 appearance-none bg-white" value={activeStatus} onChange={handleStatusChange}>
                                        <option value="all">{dict?.projects?.filterAll || 'Filter by status: All'}</option>
                                        <option value="planned">{dict?.projects?.statusPlanned || 'Planned'}</option>
                                        <option value="active">{dict?.projects?.statusActive || 'Active'}</option>
                                        <option value="completed">{dict?.projects?.statusCompleted || 'Completed'}</option>
                                        <option value="cancelled">{dict?.projects?.statusCancelled || 'Cancelled'}</option>
                                        <option value="on_hold">{dict?.projects?.statusOnHold || 'On Hold'}</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-8">
                            <div className="lg:w-1/4 space-y-3">
                                <div className="category-button">
                                    <CategoryButton name={dict?.projects?.allProjects || 'All Projects'} icon={<ArrowRight className="w-5 h-5" />} count={totalProjects} isActive={activeCategory === 'all'} onClick={() => handleCategoryClick('all')} />
                                </div>
                                {Object.entries(categories).reduce<any[]>((unique, [id, name]) => {
                                    if (!unique.some(item => item.name === name)) { unique.push({ id: parseInt(id), name, count: categoryCounts[name] || 0 }); }
                                    return unique;
                                }, []).map((category, index) => (
                                    category && (
                                        <div key={category.id} className="category-button">
                                            <CategoryButton name={category.name} icon={getCategoryIcon(category.name, index)} count={category.count} isActive={activeCategory === category.name} onClick={() => handleCategoryClick(category.name)} />
                                        </div>
                                    )
                                ))}
                            </div>

                            <div className="lg:w-3/4">
                                {projects.length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500">{dict?.projects?.noResults || 'No projects found matching your criteria'}</p>
                                    </div>
                                ) : (
                                    <>
                                        <div ref={projectsGridRef} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            {projects.map((project) => (
                                                <div key={project.id} className="project-card">
                                                    <ProjectCard project={project} getFeatureImage={getFeatureImage} getCategoryName={getCategoryName} />
                                                </div>
                                            ))}
                                        </div>
                                        {totalPages > 1 && (<Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />)}
                                    </>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
            <motion.div initial="hidden" animate="visible" variants={fadeIn}>
                <ImpactAreasSection />
            </motion.div>
        </div>
    );
}