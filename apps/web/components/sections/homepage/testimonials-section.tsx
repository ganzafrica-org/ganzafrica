'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@workspace/ui/components/avatar';
import { DecoratedHeading } from '@/components/layout/headertext';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Container from '@/components/layout/container';
import apiClient from '@/lib/api-client';
import { useDict } from '@/context/dictionary';
import {TranslatableText} from "@/components/translate";

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

export default function TestimonialsSection({ locale }: TestimonialsSectionProps) {
    const dict = useDict();
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    const nextTestimonial = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
        setTimeout(() => {
            setIsAnimating(false);
        }, 500);
    };

    const prevTestimonial = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
        setTimeout(() => {
            setIsAnimating(false);
        }, 500);
    };

    const handleTestimonialChange = (index: number) => {
        if (isAnimating || index === currentTestimonial) return;
        setIsAnimating(true);
        setCurrentTestimonial(index);
        setTimeout(() => {
            setIsAnimating(false);
        }, 500);
    };

    // YOUR ORIGINAL DATA FETCHING LOGIC - UNCHANGED
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

    // Auto-play functionality - matches your original timing
    useEffect(() => {
        if (testimonials.length === 0) return;

        const startInterval = () => {
            autoPlayRef.current = setInterval(() => {
                if (!isAnimating) {
                    nextTestimonial();
                }
            }, 5000);
        };

        startInterval();

        return () => {
            if (autoPlayRef.current) {
                clearInterval(autoPlayRef.current);
            }
        };
    }, [testimonials.length]);

    // Reset interval when manually changing testimonial
    const handleAvatarClick = (index: number) => {
        handleTestimonialChange(index);

        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
        }

        if (testimonials.length > 0) {
            autoPlayRef.current = setInterval(() => {
                if (!isAnimating) {
                    nextTestimonial();
                }
            }, 5000);
        }
    };

    // YOUR ORIGINAL SKELETON LOADING - ADAPTED TO NEW UI
    if (loading && testimonials.length === 0) {
        return (
            <motion.section
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="py-12 md:py-16 bg-gray-50"
            >
                <Container>
                    <div className="text-center mb-6 md:mb-8">
                        <div className="h-8 md:h-10 w-64 md:w-80 bg-gray-200 animate-pulse rounded-md mx-auto mb-4" />
                        <div className="h-7 md:h-8 w-72 md:w-96 bg-gray-200 animate-pulse rounded-md mx-auto" />
                    </div>

                    <div className="max-w-5xl mx-auto px-4 md:px-12">
                        <div className="flex justify-center items-center gap-4 md:gap-6 mb-6 md:mb-8">
                            {[1, 2, 3, 4, 5].map((_, index) => (
                                <div key={index} className="w-14 md:w-20 h-14 md:h-20 rounded-full bg-gray-200 animate-pulse" />
                            ))}
                        </div>
                        <div className="text-center">
                            <div className="h-20 md:h-24 bg-gray-200 animate-pulse rounded-lg mb-4 md:mb-6 mx-auto max-w-2xl" />
                            <div className="h-5 md:h-6 w-28 md:w-40 bg-gray-200 animate-pulse rounded mx-auto" />
                        </div>
                    </div>
                </Container>
            </motion.section>
        );
    }

    return (
        <motion.section
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="py-12 md:py-16 bg-gray-50 bg-[#045F3C] "
        >
            <Container>
                <div className="text-center mb-6 md:mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-2">
                        <TranslatableText>
                            {dict?.fellowship?.testimonials?.heading || "Checkout What Fellows"}
                        </TranslatableText>
                    </h2>
                    <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8">
                        <TranslatableText>
                            {dict?.fellowship?.testimonials?.heading2 || "Say about Our Fellowship"}
                        </TranslatableText>
                    </h3>
                </div>

                {error && (
                    <div className="text-center text-red-500 mb-8 px-4 max-w-2xl mx-auto">
                        <TranslatableText>
                            {error}
                        </TranslatableText>
                    </div>
                )}

                <div className="max-w-5xl mx-auto px-4 md:px-12">
                    {/* NEW HORIZONTAL AVATAR NAVIGATION UI */}
                    <div className="flex justify-center items-center gap-3 md:gap-6 mb-6 md:mb-8">
                        {testimonials.map((testimonial, index) => {
                            const isActive = currentTestimonial === index;
                            const isPrevious = (currentTestimonial === index + 1) || (currentTestimonial === 0 && index === testimonials.length - 1);
                            const isNext = (currentTestimonial === index - 1) || (currentTestimonial === testimonials.length - 1 && index === 0);

                            return (
                                <div
                                    key={testimonial.id}
                                    className={`cursor-pointer transition-all duration-300 transform ${
                                        isActive
                                            ? 'w-14 md:w-20 h-14 md:h-20 z-20 scale-110'
                                            : isPrevious || isNext
                                                ? 'w-10 md:w-16 h-10 md:h-16 z-10 opacity-70 scale-90'
                                                : 'w-8 md:w-12 h-8 md:h-12 opacity-50 scale-75'
                                    }`}
                                    onClick={() => handleAvatarClick(index)}
                                >
                                    <div className={`rounded-full overflow-hidden h-full w-full transition-all duration-300 ${
                                        isActive ? 'ring-2 md:ring-4 ring-yellow-400' : 'ring-1 ring-gray-200'
                                    }`}>
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.author_name}
                                            width={80}
                                            height={80}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* NEW TESTIMONIAL CONTENT UI */}
                    <div className="relative">
                        <div className="p-6 md:p-8 min-h-[250px] flex flex-col justify-center">
                            <div className="text-center px-2 md:px-16">
                                <motion.div
                                    key={`content-${currentTestimonial}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5 }}
                                    className="min-h-[120px] md:min-h-[150px] flex items-center justify-center mb-4 md:mb-6"
                                >
                                    <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto text-white">
                                        <TranslatableText>
                                            {testimonials[currentTestimonial]?.description}
                                        </TranslatableText>
                                    </p>
                                </motion.div>

                                <motion.div
                                    key={`author-${currentTestimonial}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.5, delay: 0.1 }}
                                    className="min-h-[50px] md:min-h-[60px]"
                                >
                                    <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-yellow-400">
                                        {testimonials[currentTestimonial]?.author_name}
                                    </h4>
                                    <p className="text-gray-600 text-xs md:text-sm text-white">{testimonials[currentTestimonial]?.position}</p>
                                </motion.div>
                            </div>
                        </div>

                        {/* NAVIGATION ARROWS */}
                        <button
                            onClick={prevTestimonial}
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-gray-300 text-gray-700 flex items-center justify-center text-[#045F3C] bg-white  hover:bg-yellow-400 hover:text-white transition-all duration-300 -translate-x-1/2 md:-translate-x-5 shadow-lg"
                            aria-label="Previous testimonial"
                            disabled={isAnimating || testimonials.length <= 1}
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={nextTestimonial}
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center text-[#045F3C] bg-white hover:bg-yellow-400 hover:text-white transition-all duration-300 translate-x-1/2 md:translate-x-5 shadow-lg"
                            aria-label="Next testimonial"
                            disabled={isAnimating || testimonials.length <= 1}
                        >
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </Container>
        </motion.section>
    );
}

// Props interface
interface TestimonialsSectionProps {
    locale: string;
}
