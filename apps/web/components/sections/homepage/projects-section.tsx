'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { DecoratedHeading } from '@/components/layout/headertext';
import { ChevronLeft, ChevronRight, Eye, ArrowRight, Pause, Play } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable';

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

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 1,
    name: 'Food Systems',
    description: 'We have cross cutting projects that tackle food system problems.',
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
];

// ProjectCard sub-component
function ProjectCard({ project, isActive, imageUrl, onView, progress }: {
  project: Project;
  isActive: boolean;
  imageUrl: string;
  onView: () => void;
  progress?: number; // 0-1 for progress bar
}) {
  return (
    <motion.div
      className={`absolute left-1/2 top-0 w-[85vw] max-w-md h-full rounded-2xl shadow-xl bg-black/10 overflow-hidden transition-all duration-500 ease-in-out ${isActive ? 'z-20 scale-100 opacity-100' : 'z-10 scale-90 opacity-60'}`}
      style={{ transform: 'translate(-50%, 0)' }}
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: isActive ? 1 : 0.6, scale: isActive ? 1 : 0.9 }}
      transition={{ duration: 0.5, type: 'spring' }}
    >
      <Image
        src={imageUrl}
        alt={project.name}
        fill
        className="object-cover rounded-2xl"
        priority={isActive}
        placeholder="blur"
        blurDataURL="/images/placeholder.png"
      />
      {/* Glassmorphism overlay for text */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[90%] bg-white/30 backdrop-blur-md rounded-lg px-4 py-3 flex flex-col items-start shadow-lg border border-white/30">
        <span className="text-primary-green font-bold text-lg md:text-xl truncate w-full drop-shadow">{project.name}</span>
        <span className="text-gray-900/90 text-xs md:text-sm mt-1 truncate w-full">{project.description.length > 60 ? project.description.slice(0, 60) + '...' : project.description}</span>
      </div>
      {/* Top pill button for active card */}
      {isActive && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30">
          <button
            onClick={onView}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-white text-primary-green font-semibold rounded-full shadow text-sm border border-primary-green focus:outline-none focus:ring-2 focus:ring-primary-green"
            aria-label="View Project"
          >
            <Eye size={16} /> View Project
          </button>
        </div>
      )}
      {/* Autoplay progress bar */}
      {isActive && typeof progress === 'number' && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-primary-green/20">
          <div
            className="h-full bg-primary-green transition-all"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

export default function ProjectsSection({ locale, dict }: ProjectsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [autoPlayProgress, setAutoPlayProgress] = useState(0); // 0-1 progress
  const autoPlayInterval = useRef<NodeJS.Timeout>();
  const autoPlayStart = useRef<number>(Date.now());

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await apiClient.get<ProjectsResponse>('/projects', {
          params: { limit: 10, page: 1, sort_by: 'created_at', sort_order: 'desc' }
        });
        setProjects(response.data.projects.length ? response.data.projects : FALLBACK_PROJECTS);
      } catch (err) {
        setProjects(FALLBACK_PROJECTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    let progressTimer: NodeJS.Timeout;
    if (isAutoPlaying && !isHovering && projects.length > 0) {
      autoPlayStart.current = Date.now();
      setAutoPlayProgress(0);
      autoPlayInterval.current = setInterval(() => {
        setActiveIndex((i) => (i + 1) % projects.length);
        autoPlayStart.current = Date.now();
        setAutoPlayProgress(0);
      }, 5000);
      progressTimer = setInterval(() => {
        setAutoPlayProgress(Math.min((Date.now() - autoPlayStart.current) / 5000, 1));
      }, 50);
    }
    return () => {
      clearInterval(autoPlayInterval.current);
      if (progressTimer) clearInterval(progressTimer);
    };
  }, [isAutoPlaying, isHovering, projects.length]);

  const handlers = useSwipeable({
    onSwipedLeft: () => setActiveIndex((i) => (i + 1) % projects.length),
    onSwipedRight: () => setActiveIndex((i) => (i - 1 + projects.length) % projects.length),
    preventScrollOnSwipe: true,
    trackMouse: true
  });

  const getFeatureImageUrl = (project: Project) => {
    const item = project.media?.items.find((m) => m.tag === 'feature');
    return item?.url || '/images/placeholder.png';
  };

  const truncate = (str: string, len = 150) => (str.length <= len ? str : str.slice(0, len) + '...');
  const getProjectUrl = (id: number) => `/${locale}/projects/${id}`;

  const getCardStyle = (index: number) => {
    const offset = index - activeIndex;
    if (offset === 0) {
      // Center card
      return 'z-20 scale-100 translate-x-0 opacity-100';
    } else if (offset === -1) {
      // Left card
      return 'z-10 scale-90 -translate-x-1/2 opacity-60';
    } else if (offset === 1) {
      // Right card
      return 'z-10 scale-90 translate-x-1/2 opacity-60';
    } else {
      // Hidden cards
      return 'z-0 scale-75 opacity-0 pointer-events-none';
    }
  };

  if (loading && projects.length === 0) {
    return (
      <section className="py-16 md:py-24 bg-secondary-green/10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <DecoratedHeading
              firstText={dict?.projects?.heading_first || 'Our'}
              secondText={dict?.projects?.heading_second || 'Projects'}
              className="mx-auto"
            />
          </div>
          <div className="h-[400px] md:h-[500px] flex items-center justify-center">
            <div className="animate-pulse bg-gray-200 rounded-lg w-full h-full"></div>
          </div>
        </div>
      </section>
    );
  }

  const currentProject = projects[activeIndex];
  if (!currentProject) return null;

  return (
    <section className="py-16 md:py-24 bg-secondary-green/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <DecoratedHeading
            firstText={dict?.projects?.heading_first || 'Our'}
            secondText={dict?.projects?.heading_second || 'Projects'}
            className="mx-auto"
          />
        </div>

        <div
          className="relative flex items-center justify-center h-[420px] md:h-[520px] mb-24"
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          {...handlers}
        >
          {/* Use flexbox to center the three cards as a group */}
          <div className="flex items-center justify-center w-full h-full gap-0 md:gap-8">
            {[-1, 0, 1].map((offset) => {
              const idx = (activeIndex + offset + projects.length) % projects.length;
              const project = projects[idx];
              if (!project) return null;
              const isActive = offset === 0;
              const cardClass =
                isActive
                  ? 'z-20 scale-100 opacity-100'
                  : 'z-10 scale-90 opacity-60';
              return (
                <div
                  key={project.id}
                  className={`transition-all duration-500 ease-in-out ${cardClass}`}
                  style={{ width: '85vw', maxWidth: '28rem', height: '100%' }}
                >
                  <ProjectCard
                    project={project}
                    isActive={isActive}
                    imageUrl={getFeatureImageUrl(project)}
                    onView={() => window.location.href = getProjectUrl(project.id)}
                    progress={isAutoPlaying && isActive ? autoPlayProgress : undefined}
                  />
                </div>
              );
            })}
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {projects.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === activeIndex ? 'bg-primary-green w-8' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                title={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Navigation Controls at bottom center */}
          <div className="flex justify-center gap-4 mt-4 absolute left-1/2 -translate-x-1/2 bottom-0 z-30">
            <button 
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
              title={isAutoPlaying ? "Pause slideshow" : "Play slideshow"}
            >
              {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button 
              onClick={() => setActiveIndex((i) => (i - 1 + projects.length) % projects.length)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Previous slide"
              title="Previous slide"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={() => setActiveIndex((i) => (i + 1) % projects.length)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Next slide"
              title="Next slide"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link
            href={`/${locale}/projects`}
            className="inline-flex items-center gap-2 bg-primary-green hover:bg-primary-green/90 transition-colors text-white py-3 px-6 rounded-lg"
          >
            <span>{dict?.cta?.view_all_projects || 'View All Projects'}</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
