'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { DecoratedHeading } from '@/components/layout/headertext';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Project {
    id: string;
    title: string;
    description: string;
    image: string;
}

interface ProjectsSectionProps {
    locale: string;
    dict: any;
}

export default function ProjectsSection({ locale, dict }: ProjectsSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Default projects data
    const projects: Project[] = [
        {
            id: 'food-systems',
            title: dict?.what_we_do?.food_systems ?? 'Food Systems',
            description: 'Lorem Ipsum is not simply random text.',
            image: '/images/ganzafrica-fellows.jpg'
        },
        {
            id: 'agriculture',
            title: 'Agriculture Farming',
            description: 'Lorem Ipsum is not simply random text.',
            image: '/images/ganzafrica-fellows.jpg'
        },
        {
            id: 'environmental',
            title: 'Environmental sustainability',
            description: 'Lorem Ipsum is not simply random text.',
            image: '/images/ganzafrica-fellows.jpg'
        },
        {
            id: 'climate',
            title: 'Climate Action',
            description: 'Lorem Ipsum is not simply random text.',
            image: '/images/ganzafrica-fellows.jpg'
        },
        {
            id: 'land',
            title: 'Land Management',
            description: 'Lorem Ipsum is not simply random text.',
            image: '/images/ganzafrica-fellows.jpg'
        }
    ];

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

    return (
        <section className="py-16 md:py-24 bg-secondary-green/10 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <DecoratedHeading
                        firstText={dict?.projects?.heading_first ?? "Our"}
                        secondText={dict?.projects?.heading_second ?? "Projects"}
                        firstTextColor="text-primary-green"
                        secondTextColor="text-primary-orange"
                        borderColor="border-primary-green"
                        cornerColor="bg-primary-orange"
                        className="mx-auto"
                    />
                </div>

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
                                        <Image
                                            src={project.image}
                                            alt={project.title}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 600px"
                                            priority
                                            className="object-cover"
                                        />
                                        <div className="absolute inset-0 bg-black/40" />
                                        <div className="absolute bottom-6 right-6 max-w-[80%] bg-primary-green/90 backdrop-blur-sm rounded-lg p-4">
                                            <h3 className="text-lg md:text-xl font-bold text-white mb-2">{project.title}</h3>
                                            <p className="text-sm text-white line-clamp-2">{project.description}</p>
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
                                style={{ left: `${(activeIndex * 100) / projects.length}%` }}
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
                    box-shadow: 0px 0.4rem 1.6rem rgba(0, 0, 0, 0.1);
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
                    box-shadow: 0px 0.4rem 1.6rem rgba(0, 0, 0, 0.5);
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