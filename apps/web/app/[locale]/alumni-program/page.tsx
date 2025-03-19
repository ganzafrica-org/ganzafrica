"use client";

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Container from '@/components/layout/container';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const activities = [
  {
    title: "Land Governance",
    description: "We support the development of equitable and effective land governance frameworks using research-based strategies and promoting sustainable benefits",
    color: "bg-primary-green"
  },
  {
    title: "Sustainable Agriculture",
    description: "Our work promotes agricultural productivity goals with innovative partnerships and leadership to achieve sustainable development",
    color: "bg-primary-green"
  },
  {
    title: "Climate Adaptation",
    description: "Our expertise supports the creation of climate resilience strategies that help communities adapt to changing environmental conditions",
    color: "bg-primary-green"
  }
];

const projects = [
  {
    id: 1,
    title: "Agriculture Management Information System",
    image: "/images/news/team-members-1.jpg",
    status: "In Progress",
    category: "Technology"
  },
  {
    id: 2,
    title: "Sustainable Farming Practices Research",
    image: "/images/news/team-members-2.jpg",
    status: "Completed",
    category: "Research"
  },
  {
    id: 3,
    title: "Climate-Smart Agriculture Initiative",
    image: "/images/news/maize.avif",
    status: "Active",
    category: "Climate"
  },
  {
    id: 4,
    title: "Land Rights Documentation System",
    image: "/images/news/team-members-1.jpg",
    status: "In Review",
    category: "Governance"
  },
  {
    id: 5,
    title: "Agricultural Data Analytics Platform",
    image: "/images/news/team-members-2.jpg",
    status: "Planning",
    category: "Technology"
  },
  {
    id: 6,
    title: "Community Farm Development Project",
    image: "/images/news/maize.avif",
    status: "Active",
    category: "Community"
  },
  {
    id: 7,
    title: "Soil Health Monitoring Program",
    image: "/images/news/team-members-1.jpg",
    status: "Active",
    category: "Research"
  },
  {
    id: 8,
    title: "Water Resource Management System",
    image: "/images/news/team-members-2.jpg",
    status: "In Progress",
    category: "Technology"
  },
  {
    id: 9,
    title: "Indigenous Farming Knowledge Database",
    image: "/images/news/maize.avif",
    status: "Planning",
    category: "Research"
  },
  {
    id: 10,
    title: "Agricultural Market Access Platform",
    image: "/images/news/team-members-1.jpg",
    status: "Active",
    category: "Technology"
  },
  {
    id: 11,
    title: "Sustainable Livestock Management",
    image: "/images/news/team-members-2.jpg",
    status: "In Review",
    category: "Research"
  },
  {
    id: 12,
    title: "Climate Resilience Training Program",
    image: "/images/news/maize.avif",
    status: "Active",
    category: "Climate"
  }
];

const SectionTitle = ({ title1, title2 }: { title1: string; title2: string }) => {
  const titleRef = useRef(null);

  useEffect(() => {
    gsap.from(titleRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out"
    });
  }, []);

  return (
    <div ref={titleRef} className="relative inline-flex items-center border-2 border-[#FFB800] rounded-lg p-0.5">
      <div className="px-6 py-2">
        <h2 className="text-xl font-bold">
          <span className="text-primary-green">{title1}</span>
          <span className="text-[#FFB800]">{title2}</span>
        </h2>
      </div>
      {/* Corner squares */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#FFB800]" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFB800]" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#FFB800]" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#FFB800]" />
    </div>
  );
};

const AlumniProgramPage = () => {
  const bannerRef = useRef(null);
  const imageRef = useRef(null);
  const contentRef = useRef(null);
  const featuresRef = useRef(null);
  const activitiesRef = useRef(null);
  const projectsRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = Math.ceil(projects.length / 3);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    // Banner animation
    gsap.from(bannerRef.current, {
      y: -50,
      opacity: 0,
      duration: 1,
      ease: "power3.out"
    });

    // Image and content animations
    gsap.from(imageRef.current, {
      x: -50,
      opacity: 0,
      duration: 1,
      delay: 0.3,
      ease: "power3.out"
    });

    gsap.from(contentRef.current, {
      x: 50,
      opacity: 0,
      duration: 1,
      delay: 0.3,
      ease: "power3.out"
    });

    // Features list stagger animation
    gsap.from(".feature-item", {
      y: 20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1,
      scrollTrigger: {
        trigger: featuresRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });

    // Activities cards animation
    gsap.from(".activity-card", {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.2,
      scrollTrigger: {
        trigger: activitiesRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse"
      }
    });
  }, []);

  return (
    <main className="bg-white">
      {/* Banner Section */}
      <div ref={bannerRef} className="bg-[#F5F5F5] py-8">
        <Container>
          <h1 className="text-3xl font-bold text-primary-green text-center">
            Alumni Program
          </h1>
        </Container>
      </div>

      {/* Program Overview Section */}
      <Container>
        <div className="py-10">
          <div className="flex flex-col lg:flex-row gap-12 items-start max-w-7xl mx-auto">
            {/* Left Column - Image */}
            <div ref={imageRef} className="lg:w-[42%] lg:mt-[60px]">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/news/team-members-1.jpg"
                  alt="Alumni Network"
                  fill
                  className="rounded-2xl object-cover"
                  priority
                />
              </div>
            </div>

            {/* Right Column - Content */}
            <div ref={contentRef} className="lg:w-[58%]">
              {/* Section Title */}
              <div className="mb-6">
                <SectionTitle title1="Program" title2=" Overview" />
              </div>

              {/* Description */}
              <div className="space-y-4">
                <p className="text-gray-800 text-base leading-relaxed">
                  The GanzAfrica Alumni Network connects former fellows who continue to drive positive change across Africa's
                  land, agriculture, and environmental sectors. Our growing community of over 40 professionals now works in
                  government agencies, international organizations, research institutions, and social enterprises.
                </p>
                <p className="text-gray-800 text-base leading-relaxed">
                  This powerful network facilitates knowledge sharing, collaboration, and continuous professional development
                  —amplifying the impact of individual members through collective action and support.
                </p>
              </div>

              {/* Features List */}
              <div ref={featuresRef} className="space-y-3 mt-6">
                <div className="feature-item flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FFB800] flex items-center justify-center">
                    <Image src="/images/leafwhite.png" alt="Leaf icon" width={16} height={16} className="w-4 h-4" />
                  </div>
                  <p className="text-gray-800 text-base">Intensive skill-building modules</p>
                </div>
                <div className="feature-item flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FFB800] flex items-center justify-center">
                    <Image src="/images/leafwhite.png" alt="Leaf icon" width={16} height={16} className="w-4 h-4" />
                  </div>
                  <p className="text-gray-800 text-base">Hands-on apprenticeships with industry leaders</p>
                </div>
                <div className="feature-item flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FFB800] flex items-center justify-center">
                    <Image src="/images/leafwhite.png" alt="Leaf icon" width={16} height={16} className="w-4 h-4" />
                  </div>
                  <p className="text-gray-800 text-base">Community-based project implementation</p>
                </div>
                <div className="feature-item flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#FFB800] flex items-center justify-center">
                    <Image src="/images/leafwhite.png" alt="Leaf icon" width={16} height={16} className="w-4 h-4" />
                  </div>
                  <p className="text-gray-800 text-base">Cross-disciplinary collaboration opportunities</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Activities Section */}
      <div ref={activitiesRef} className="bg-[#F5F5F5] py-16">
        <Container>
          {/* Section Title with yellow corners */}
          <div className="flex justify-center mb-12">
            <div className="relative inline-flex items-center border-2 border-[#FFB800] rounded-lg p-0.5">
              <div className="px-6 py-2">
                <h2 className="text-2xl font-bold">
                  <span className="text-primary-green">The </span>
                  <span className="text-[#FFB800]">Activities</span>
                </h2>
              </div>
              {/* Corner squares */}
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#FFB800]" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFB800]" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#FFB800]" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#FFB800]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activities.map((activity, index) => (
              <div 
                key={index}
                className="activity-card relative overflow-hidden"
              >
                {/* Card Body with Full Border Radius */}
                <div className="relative h-[400px] overflow-hidden pt-6">
                  {/* Main Card Content */}
                  <div className="h-full rounded-[32px] overflow-hidden relative">
                    {/* Background Image */}
                    <Image
                      src="/images/news/maize.avif"
                      alt="Activity background"
                      fill
                      className="object-cover"
                    />

                    {/* Semi-transparent Overlay */}
                    <div className="absolute inset-0 bg-black/40" />

                    {/* Content */}
                    <div className="relative z-10 h-full flex flex-col justify-end p-8 pb-12">
                      <p className="text-white text-lg leading-relaxed">
                        {activity.description}
                      </p>
                    </div>
                  </div>

                  {/* Title Tab - Positioned above the card */}
                  <div className="absolute -top-3 left-0 right-0 z-20">
                    <div className="relative mx-auto w-fit">
                      {/* Background Extension */}
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%+3rem)] h-8 bg-[#F5F5F5] rounded-t-[32px]" />
                      
                      {/* Title Container */}
                      <div className="relative bg-[#FFB800] text-white px-8 py-2 rounded-[32px] shadow-[0_0_15px_rgba(255,255,255,0.4)] border-[3px] border-white/40">
                        <h3 className="text-xl font-medium whitespace-nowrap">{activity.title}</h3>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </div>

      {/* Alumni Projects Section */}
      <div ref={projectsRef}>
        <Container>
          <div className="py-16">
            <div className="flex justify-between items-center mb-12">
              <div className="relative inline-flex items-center border-2 border-[#FFB800] rounded-lg p-0.5">
                <div className="px-6 py-2">
                  <h2 className="text-2xl font-bold">
                    <span className="text-primary-green">Alumni</span>
                    <span className="text-[#FFB800]"> Projects</span>
                  </h2>
                </div>
                {/* Corner squares */}
                <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#FFB800]" />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#FFB800]" />
                <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#FFB800]" />
                <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#FFB800]" />
              </div>
              <Link 
                href="/projects"
                className="inline-flex items-center text-primary-green hover:text-primary-green/80 font-medium gap-2"
              >
                <span className="text-sm italic">See More Projects</span>
                <div className="w-8 h-8 rounded-full bg-[#FFB800] flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </Link>
            </div>

            {/* Projects Grid with Sliding */}
            <div className="relative w-full">
              <div className="overflow-hidden">
                <div 
                  className="slider-container flex flex-nowrap transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(projects.length / 3) }).map((_, index) => (
                    <div key={index} className="flex gap-8 min-w-full flex-shrink-0">
                      {projects.slice(index * 3, (index + 1) * 3).map((project) => (
                        <div 
                          key={project.id}
                          className="project-card flex-1 group relative bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden"
                        >
                          <div className="relative w-full overflow-hidden">
                            {/* Top right cut-out */}
                            <div className="absolute -top-px -right-px w-[140px] h-[70px] bg-white">
                              <div className="absolute bottom-0 left-0 w-full h-full bg-white">
                                <div className="absolute bottom-0 left-0 w-full h-full bg-[#F5F5F5] rounded-bl-[48px]" />
                              </div>
                            </div>
                            
                            {/* Main content container */}
                            <div className="relative">
                              {/* Arrow button with CSS hover effect */}
                              <div className="absolute top-4 right-4 z-10">
                                <div className="arrow-button w-12 h-12 rounded-full bg-[#FFB800] group-hover:bg-[#00A651] flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl">
                                  <ArrowRight className="w-6 h-6 text-white transform -rotate-45 group-hover:-rotate-90 transition-transform duration-300" />
                                </div>
                              </div>

                              {/* Image section with CSS hover effect */}
                              <div className="card-image relative aspect-[16/9] w-full overflow-hidden">
                                <Image
                                  src={project.image}
                                  alt={project.title}
                                  fill
                                  className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#00A651]/90" />
                              </div>

                              {/* Title section */}
                              <div className="bg-[#00A651] p-6 relative">
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-[#FFB800] text-xs font-medium uppercase tracking-wider">{project.category}</span>
                                  </div>
                                  <h3 className="text-xl font-bold text-white leading-tight">
                                    {project.title}
                                  </h3>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={prevSlide}
                    disabled={currentSlide === 0}
                    className={`nav-arrow w-10 h-10 rounded-full border border-primary-green flex items-center justify-center ${
                      currentSlide === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-green hover:text-white'
                    } text-primary-green transition-all duration-300`}
                    aria-label="Previous slide"
                  >
                    ←
                  </button>

                  {/* Progress bar */}
                  <div className="progress-bar w-32 h-1 bg-gray-200 rounded-full">
                    <div 
                      className="h-full bg-primary-green rounded-full transition-all duration-500"
                      style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
                    />
                  </div>

                  <button 
                    onClick={nextSlide}
                    disabled={currentSlide === totalSlides - 1}
                    className={`nav-arrow w-10 h-10 rounded-full border border-primary-green flex items-center justify-center ${
                      currentSlide === totalSlides - 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-green hover:text-white'
                    } text-primary-green transition-all duration-300`}
                    aria-label="Next slide"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </main>
  );
};

export default AlumniProgramPage; 