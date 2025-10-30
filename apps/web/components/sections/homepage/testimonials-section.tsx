'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { DecoratedHeading } from '@/components/layout/headertext';
import { cn } from '@/lib/utils';
import apiClient from '@/lib/api-client';

// Interface for the testimonial data from the API
interface Testimonial {
    id: number;
    author_name: string;
    position: string;
    image: string;
    description: string;
    company: string;
    occupation: string;
    date: string;
    rating: number;
    created_at: string;
    updated_at: string;
}

// Interface for the API response
interface TestimonialsResponse {
    testimonials: Testimonial[];
}

// Props for the component
interface TestimonialsSectionProps {
    locale: string;
    dict: any;
}

export default function TestimonialsSection({ locale, dict }: TestimonialsSectionProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch testimonials from the API
    useEffect(() => {
        const fetchTestimonials = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get<TestimonialsResponse>('/testimonials');
                setTestimonials(response.data.testimonials);
                setError(null);
            } catch (err) {
                console.error('Error fetching testimonials:', err);
                setError('Failed to load testimonials');
                // Set fallback testimonials in case of error
                setTestimonials([
                    {
                        id: 1,
                        author_name: "Madge Jennings",
                        position: dict?.testimonials?.roles?.fellow || "Fellow",
                        description: dict?.testimonials?.comments?.comment1 || "My experience with GanzAfrica has been transformative. The training and mentorship helped me develop crucial skills in agriculture and land management that I now apply daily in my work.",
                        image: "/images/1.jpg",
                        company: "GA",
                        occupation: "fellow",
                        date: new Date().toISOString(),
                        rating: 5,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    }
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchTestimonials();
    }, [dict?.testimonials?.roles?.fellow, dict?.testimonials?.comments?.comment1]);

    // Start automatic rotation when testimonials are loaded
    useEffect(() => {
        if (testimonials.length === 0) return;

        const startInterval = () => {
            intervalRef.current = setInterval(() => {
                setActiveIndex(prev => (prev + 1) % testimonials.length);
            }, 5000); // Change every 5 seconds
        };

        startInterval();

        // Clear interval on component unmount
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [testimonials.length]);

    // Reset interval when manually changing testimonial
    const handleAvatarClick = (index: number) => {
        setActiveIndex(index);

        // Reset the interval to prevent changing too soon after a click
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % testimonials.length);
        }, 5000);
    };

    // Divide testimonials into left and right side groups
    const getLeftSideTestimonials = () => {
        if (testimonials.length === 0) return [];
        // Use even indices for left side
        return testimonials.filter((_, index) => index % 2 === 0);
    };

    const getRightSideTestimonials = () => {
        if (testimonials.length === 0) return [];
        // Use odd indices for right side
        return testimonials.filter((_, index) => index % 2 !== 0);
    };

    // Show skeleton loading state that resembles the actual content
    if (loading && testimonials.length === 0) {
        return (
            <section className="py-8 md:py-12 lg:py-16 bg-secondary-green/5 relative overflow-hidden">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8 md:mb-12">
                        {/* Skeleton for heading */}
                        <div className="flex justify-center">
                            <div className="h-8 sm:h-10 md:h-12 w-48 sm:w-64 md:w-72 bg-gray-200 animate-pulse rounded-md"></div>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto">
                        <div className="relative">
                            {/* Skeleton for left avatars - hidden on smaller screens */}
                            <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2">
                                <div className="relative w-32 xl:w-40 h-80 xl:h-96">
                                    {[1, 2, 3, 4].map((_, index) => (
                                        <div
                                            key={`skeleton-left-${index}`}
                                            className="absolute animate-pulse"
                                            style={{
                                                top: `${index * 18}%`,
                                                left: '50%',
                                            }}
                                        >
                                            <div className="w-12 xl:w-16 h-12 xl:h-16 rounded-full bg-gray-200 border-2 border-white shadow-md"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Skeleton for center content */}
                            <div className="flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 lg:px-20">
                                {/* Skeleton for avatar */}
                                <div className="relative h-40 sm:h-48 w-full max-w-xs mb-6">
                                    <div className="w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 rounded-full bg-gray-200 animate-pulse mx-auto"></div>
                                    <div className="h-5 sm:h-6 w-32 sm:w-40 md:w-48 bg-gray-200 animate-pulse mx-auto mt-4 rounded"></div>
                                    <div className="h-3 sm:h-4 w-24 sm:w-28 md:w-32 bg-gray-200 animate-pulse mx-auto mt-2 rounded"></div>
                                </div>

                                {/* Skeleton for quote text - dynamic height */}
                                <div className="relative w-full min-h-[120px] sm:min-h-[140px] md:min-h-[160px]">
                                    <div className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 bg-gray-100 mb-4 mx-auto rounded"></div>
                                    <div className="space-y-2 sm:space-y-3">
                                        <div className="h-3 sm:h-4 w-full max-w-sm sm:max-w-md md:max-w-lg bg-gray-200 animate-pulse mx-auto rounded"></div>
                                        <div className="h-3 sm:h-4 w-full max-w-xs sm:max-w-sm md:max-w-md bg-gray-200 animate-pulse mx-auto rounded"></div>
                                        <div className="h-3 sm:h-4 w-full max-w-2xs sm:max-w-xs md:max-w-sm bg-gray-200 animate-pulse mx-auto rounded"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Skeleton for right avatars - hidden on smaller screens */}
                            <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2">
                                <div className="relative w-32 xl:w-40 h-80 xl:h-96">
                                    {[1, 2, 3, 4].map((_, index) => (
                                        <div
                                            key={`skeleton-right-${index}`}
                                            className="absolute animate-pulse"
                                            style={{
                                                top: `${index * 18}%`,
                                                right: '50%',
                                            }}
                                        >
                                            <div className="w-12 xl:w-16 h-12 xl:h-16 rounded-full bg-gray-200 border-2 border-white shadow-md"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile skeleton indicators */}
                        <div className="lg:hidden flex justify-center mt-6 sm:mt-8 gap-2 sm:gap-3">
                            {[1, 2, 3, 4].map((_, index) => (
                                <div key={`skeleton-nav-${index}`} className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-gray-200 animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-8 sm:py-10 md:py-12 lg:py-16 bg-primary-green relative overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 sm:mb-10 md:mb-12">
                    <div className="mx-auto">
                        <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center leading-tight">
                            <span className="text-primary-orange">{dict?.testimonials?.heading_first || "Our"}</span>{" "}
                            <span className="text-white">{dict?.testimonials?.heading_second || "Testimonials"}</span>
                        </h2>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div className="text-center text-red-500 mb-8 px-4">{error}</div>
                )}

                <div className="max-w-6xl mx-auto">
                    <div className="relative">
                        {/* Avatars on left side - responsive positioning */}
                        <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 z-10">
                            <div className="relative w-32 xl:w-40 h-80 xl:h-96">
                                {getLeftSideTestimonials().map((testimonial, index) => {
                                    const testimonialIndex = testimonials.findIndex(t => t.id === testimonial.id);
                                    const isActive = testimonialIndex === activeIndex;
                                    const angle = (360 / getLeftSideTestimonials().length) * index;
                                    const radius = 15; // Reduced for smaller screens

                                    return (
                                        <div
                                            key={`left-${testimonial.id}`}
                                            className={cn(
                                                "absolute transition-all duration-500 cursor-pointer",
                                                isActive
                                                    ? "ring-2 xl:ring-4 ring-primary-green/70 ring-offset-1 xl:ring-offset-2 scale-110"
                                                    : "opacity-80 hover:opacity-100 hover:scale-105"
                                            )}
                                            style={{
                                                animation: `floating ${8 + index}s linear infinite`,
                                                top: `${index * (100 / Math.max(getLeftSideTestimonials().length, 1))}%`,
                                                left: `${Math.sin(angle * Math.PI / 180) * radius + 50}%`,
                                                borderRadius: "50%",
                                                transformOrigin: "center center",
                                                transition: "all 0.3s ease-in-out"
                                            }}
                                            onClick={() => handleAvatarClick(testimonialIndex)}
                                        >
                                            <Avatar className={cn(
                                                "border-2 border-white shadow-md",
                                                isActive ? "w-16 xl:w-20 h-16 xl:h-20" : "w-12 xl:w-16 h-12 xl:h-16"
                                            )}>
                                                <AvatarImage src={testimonial.image} alt={testimonial.author_name} />
                                                <AvatarFallback className="text-sm xl:text-lg">{testimonial.author_name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Center content - fully responsive */}
                        <div className="flex flex-col items-center justify-center text-center px-4 sm:px-8 md:px-12 lg:px-20 xl:px-24">
                            {/* Avatar Images - responsive sizes */}
                            <div className="relative w-full max-w-xs sm:max-w-sm mb-6 sm:mb-8">
                                <div className="h-40 sm:h-44 md:h-48 relative perspective-container">
                                    {testimonials.map((testimonial, index) => (
                                        <div
                                            key={`center-${testimonial.id}`}
                                            className={cn(
                                                "absolute top-0 left-0 right-0 mx-auto transition-all duration-700 ease-in-out",
                                                index === activeIndex ? "opacity-100 transform-none" :
                                                    index < activeIndex ? "opacity-0 -translate-y-full rotate-x-70" : "opacity-0 translate-y-full rotate-x-negative-70"
                                            )}
                                        >
                                            <Avatar className="w-24 sm:w-28 md:w-32 h-24 sm:h-28 md:h-32 mx-auto border-2 sm:border-3 md:border-4 border-white shadow-lg">
                                                <AvatarImage src={testimonial.image} alt={testimonial.author_name} />
                                                <AvatarFallback className="text-xl sm:text-2xl md:text-3xl">{testimonial.author_name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <h3 className="mt-3 sm:mt-4 text-lg sm:text-xl md:text-2xl font-bold text-primary-orange leading-tight">
                                                {testimonial.author_name}
                                            </h3>
                                            <p className="text-xs sm:text-sm md:text-base text-white/90 mt-1">
                                                {testimonial.position} {testimonial.company && `at ${testimonial.company}`}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Quote Text - dynamic height based on content */}
                            <div className="relative w-full perspective-container">
                                <div className="min-h-[120px] sm:min-h-[140px] md:min-h-[160px] lg:min-h-[120px]">
                                    {testimonials.map((testimonial, index) => (
                                        <div
                                            key={`quote-${testimonial.id}`}
                                            className={cn(
                                                "absolute w-full transition-all duration-700 ease-in-out",
                                                index === activeIndex ? "opacity-100 transform-none relative" :
                                                    index < activeIndex ? "opacity-0 -translate-y-full rotate-x-70" : "opacity-0 translate-y-full rotate-x-negative-70"
                                            )}
                                        >
                                            <div className="relative px-2 sm:px-4">
                                                <svg className="w-6 sm:w-8 md:w-10 h-6 sm:h-8 md:h-10 text-primary-green/20 mb-3 sm:mb-4 mx-auto" fill="currentColor" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M10 8C4.477 8 0 12.477 0 18v14h12V18h-8c0-3.866 3.134-7 7-7h1V8h-2zm20 0c-5.523 0-10 4.477-10 10v14h12V18h-8c0-3.866 3.134-7 7-7h1V8h-2z"></path>
                                                </svg>
                                                <p className="text-white italic text-sm sm:text-base md:text-lg lg:text-xl max-w-full sm:max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto leading-relaxed break-words hyphens-auto">
                                                    {testimonial.description}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Avatars on right side - responsive positioning */}
                        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 z-10">
                            <div className="relative w-32 xl:w-40 h-80 xl:h-96">
                                {getRightSideTestimonials().map((testimonial, index) => {
                                    const testimonialIndex = testimonials.findIndex(t => t.id === testimonial.id);
                                    const isActive = testimonialIndex === activeIndex;
                                    const angle = (360 / getRightSideTestimonials().length) * index;
                                    const radius = 15; // Reduced for smaller screens

                                    return (
                                        <div
                                            key={`right-${testimonial.id}`}
                                            className={cn(
                                                "absolute transition-all duration-500 cursor-pointer",
                                                isActive
                                                    ? "ring-2 xl:ring-4 ring-primary-green/70 ring-offset-1 xl:ring-offset-2 scale-110"
                                                    : "opacity-80 hover:opacity-100 hover:scale-105"
                                            )}
                                            style={{
                                                animation: `floating ${7 + index}s linear infinite`,
                                                top: `${index * (100 / Math.max(getRightSideTestimonials().length, 1))}%`,
                                                right: `${Math.sin(angle * Math.PI / 180) * radius + 50}%`,
                                                borderRadius: "50%",
                                                transformOrigin: "center center",
                                                transition: "all 0.3s ease-in-out"
                                            }}
                                            onClick={() => handleAvatarClick(testimonialIndex)}
                                        >
                                            <Avatar className={cn(
                                                "border-2 border-white shadow-md",
                                                isActive ? "w-16 xl:w-20 h-16 xl:h-20" : "w-12 xl:w-16 h-12 xl:h-16"
                                            )}>
                                                <AvatarImage src={testimonial.image} alt={testimonial.author_name} />
                                                <AvatarFallback className="text-sm xl:text-lg">{testimonial.author_name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Mobile testimonial navigation - responsive sizing */}
                    <div className="lg:hidden flex flex-wrap justify-center mt-6 sm:mt-8 gap-2 sm:gap-3 px-4">
                        {testimonials.map((testimonial, index) => (
                            <button
                                key={`nav-${index}`}
                                onClick={() => handleAvatarClick(index)}
                                className={cn(
                                    "transition-all rounded-full overflow-hidden border-2 flex-shrink-0",
                                    index === activeIndex
                                        ? "scale-110 sm:scale-125 border-primary-green shadow-lg"
                                        : "scale-100 border-transparent opacity-70 hover:opacity-90 hover:scale-105"
                                )}
                                aria-label={`Go to testimonial ${index + 1}`}
                            >
                                <Avatar className="w-8 sm:w-10 md:w-12 h-8 sm:h-10 md:h-12">
                                    <AvatarImage src={testimonial.image} alt={testimonial.author_name} />
                                    <AvatarFallback className="text-xs sm:text-sm">{testimonial.author_name.charAt(0)}</AvatarFallback>
                                </Avatar>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes floating {
                    0% {
                        transform: rotate(0deg) translate(-10px) rotate(0deg);
                    }
                    100% {
                        transform: rotate(360deg) translate(-10px) rotate(-360deg);
                    }
                }

                .perspective-container {
                    perspective: 1000px;
                }

                .rotate-x-70 {
                    transform: rotateX(70deg);
                }

                .rotate-x-negative-70 {
                    transform: rotateX(-70deg);
                }

                /* Responsive text handling */
                @media (max-width: 640px) {
                    .hyphens-auto {
                        word-break: break-word;
                        overflow-wrap: break-word;
                    }
                }

                /* Ensure proper spacing on very small screens */
                @media (max-width: 375px) {
                    .container {
                        padding-left: 1rem;
                        padding-right: 1rem;
                    }
                }
            `}</style>
        </section>
    );
}