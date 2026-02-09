"use client";

import { Button } from "@ui/button";
import { AlumniCard } from "@/components/layout/AlumniCard";
import { Badge } from "@ui/badge";
import {
    PlayCircle,
    ArrowRight,
    CheckCircle2,
    Users,
    Briefcase,
    Calendar,
    Sprout,
    TreePine,
    Cloud,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { default as HeaderBelt } from "@/components/layout/headerBelt";
import { trackEvent, trackVideoEvent, trackPageView } from "@/components/analytics/google-analytics";
import {TranslatableText} from "@/components/translate";

// Normalize Next.js Link typing across React versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeLink = Link as unknown as React.ComponentType<any>;

export default function AlumniPageContent() {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [animateFirst, setAnimateFirst] = useState(false);
    const [animateSecond, setAnimateSecond] = useState(false);
    const [counters, setCounters] = useState({
        fellows: 0,
        projects: 0,
        events: 0,
    });
    const [isAnimating, setIsAnimating] = useState(false);
    const [hasCompletedAnimation, setHasCompletedAnimation] = useState(false);

    // Track page view
    useEffect(() => {
        trackPageView('/programs/alumni', 'Alumni Network');
    }, []);

    useEffect(() => {
        const scrollElement = scrollRef.current;
        if (!scrollElement) return;

        const scrollContent = scrollElement.children[0];
        if (!scrollContent) return;

        const scrollWidth = scrollContent.scrollWidth;
        let scrollPos = 0;

        const animate = () => {
            scrollPos = (scrollPos + 1) % scrollWidth;
            scrollElement.scrollLeft = scrollPos;
            requestAnimationFrame(animate);
        };

        animate();

        return () => {
            // Cleanup if needed
        };
    }, []);

    // Quote animation effect
    useEffect(() => {
        const interval = setInterval(() => {
            setAnimateFirst(true);
            setTimeout(() => {
                setAnimateSecond(true);
                setTimeout(() => {
                    setAnimateFirst(false);
                    setAnimateSecond(false);
                }, 300);
            }, 300);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Counter animation effect
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !isAnimating && !hasCompletedAnimation) {
                        setIsAnimating(true);

                        // Reset counters to 0
                        setCounters({ fellows: 0, projects: 0, events: 0 });

                        // Start animation after small delay
                        setTimeout(() => {
                            // Animate fellows counter
                            let fellowsCount = 0;
                            const fellowsInterval = setInterval(() => {
                                fellowsCount += 1;
                                setCounters((prev) => ({ ...prev, fellows: fellowsCount }));
                                if (fellowsCount >= 27) {
                                    clearInterval(fellowsInterval);
                                }
                            }, 60);

                            // Animate events counter
                            setTimeout(() => {
                                let eventsCount = 0;
                                const eventsInterval = setInterval(() => {
                                    eventsCount += 1;
                                    setCounters((prev) => ({ ...prev, events: eventsCount }));
                                    if (eventsCount >= 5) {
                                        clearInterval(eventsInterval);
                                        // Mark animation as completed
                                        setIsAnimating(false);
                                        setHasCompletedAnimation(true);
                                    }
                                }, 200);
                            }, 300);
                        }, 100);
                    } else if (!entry.isIntersecting && hasCompletedAnimation) {
                        // Reset when section leaves view - ready for next animation
                        setHasCompletedAnimation(false);
                    }
                });
            },
            {
                threshold: 0.2,
                rootMargin: "0px 0px -100px 0px",
            }
        );

        const statsSection = document.getElementById("stats-section");
        if (statsSection) {
            observer.observe(statsSection);
        }

        return () => {
            if (statsSection) {
                observer.unobserve(statsSection);
            }
        };
    }, [isAnimating, hasCompletedAnimation]);

    return (
        <main className="min-h-screen  font-rubik">
            {/* Background Pattern */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img
                    src="/images/leaf.jpg"
                    alt="Background Pattern"
                    className="w-full h-full object-cover opacity-[0.08]"
                />
            </div>

            {/* Hero Section - Full width */}
            <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
                <div className="absolute inset-0 bg-black/70">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        className="w-full h-full object-cover mix-blend-overlay"
                        onPlay={() => trackVideoEvent('play', 'Alumni Hero Video')}
                        onPause={() => trackVideoEvent('pause', 'Alumni Hero Video')}
                        onEnded={() => trackVideoEvent('complete', 'Alumni Hero Video')}
                    >
                        <source src="/videos/hero-video.mp4" type="video/mp4" />
                    </video>
                </div>

                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
                    <h2 className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6 mb-8">
                        <TranslatableText>ALUMNI NETWORK</TranslatableText>
                    </h2>
                    <h1 className="text-white text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight">
                        <TranslatableText>A lifetime of</TranslatableText>{" "}
                        <span className="font-normal">
              <TranslatableText>Connections</TranslatableText>
            </span>
                        ,{" "}
                        <TranslatableText>Opportunities</TranslatableText>{" "}
                        <span className="font-normal">
              <TranslatableText>and</TranslatableText>
            </span>{" "}
                        <br />
                        <TranslatableText>Impact</TranslatableText>
                    </h1>
                </div>
            </section>

            {/* Categories Bar - Full width */}
            <div className="flex justify-center">
                <HeaderBelt />
            </div>

            {/* Content with standard page margins */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-">
                {/* Mission Section */}
                <section className="py-8 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 items-center">
                        <div className="relative ml-0 -mr-35 md:ml-5 md:-mr-45 lg:ml-5 lg:-mr-24">
                            <div className="rounded-full overflow-hidden w-[340px] h-[340px] mx-auto border-4 border-primary-green shadow-xl bg-white ">
                                <img
                                    src="/images/launch event.jpg"
                                    alt="Mission"
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                />
                            </div>
                            <div className="absolute -bottom-8 left-24 w-44 h-44 rounded-full overflow-hidden border-4 border-[#F8B712] shadow-lg bg-white">
                                <img
                                    src="/images/Happy fellows.jpg"
                                    alt="Mission Detail"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                        <div className="mt-10 md:mt-5 lg:mt-0">
                            <h2 className="text-3xl font-bold mb-6">
                                <span className="text-black">Alumni Network </span>
                                <span className="text-[#045f3c]">Mission Statement</span>
                            </h2>
                            <p className="text-base text-gray-700 mb-6">Welcome to the GanzAfrica Alumni Network, a platform dedicated to creating strong bonds among young African professionals. Our goal is to foster trust, collaboration, and a vibrant exchange of ideas to shape sustainable and transformative solutions for Africa.</p>
                            <p className="italic text-lg text-black font-normal mb-6 border-l-4 border-[#045f3c] pl-4">
                                To cultivate a vibrant alumni community that drives the transformation of African food systems through evidence-based insights, mentorship, and collaboration—empowering current fellows and fostering partnerships that create lasting opportunities for sustainable impact.
                            </p>
                            <div className="flex gap-8 flex-wrap">
                                {[
                                    "Knowledge Sharing",
                                    "Mentorship",
                                    "Collaboration and Networking",
                                ].map((principle, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                        <div
                                            className="w-2 h-2 rounded-full"
                                            style={{ backgroundColor: "#f8b712" }}
                                        />
                                        <span className="text-base text-black font-normal">
                      {principle}
                    </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/*  Purpose Cards */}
            <section className="py-12 bg-neutral-100 relative overflow-hidden">
                <div className="absolute inset-0 bg-neutral-100">
                    <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
                </div>

                {/* Left Leaf */}
                <div className="absolute left-0 top-1/4 -translate-x-1/4 opacity-20 hidden sm:block">
                    <img
                        src="/images/leaf.png"
                        alt="Decorative leaf"
                        className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 transform -rotate-12"
                    />
                </div>

                {/* Right Leaf */}
                <div className="absolute right-0 bottom-1/4 translate-x-1/4 opacity-20 hidden sm:block">
                    <img
                        src="/images/leaf.png"
                        alt="Decorative leaf"
                        className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 transform rotate-12"
                    />
                </div>

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-4">
                            <span className="text-black">Purpose of the</span>
                            <span className="text-[#045f3c] ml-2">Alumni Network</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            {
                                title: "Networking and Professional Development",
                                description:
                                    "Enhancing professional connections among analysts, across industries and geographies, to share opportunities and professional advice.",
                                color: "#073392",
                                icon: <Users className="w-8 h-8" />,
                            },
                            {
                                title: "Knowledge Sharing & Data and Evidence Use",
                                description:
                                    "Sharing diverse experiences and expertise while championing data-driven decision-making to accelerate inclusive agri-food systems transformation.",
                                color: "#045f3c",
                                icon: <CheckCircle2 className="w-8 h-8" />
                            },
                            {
                                title: "Investing Back into the Fellowship Program",
                                description:
                                    "Providing a mechanism and pipeline for transitioned young analysts to invest into the training of successive cohorts of fellows.",
                                color: "#F8B712",
                                icon: <Briefcase className="w-8 h-8" />,
                            },
                            {
                                title: "Co-creating and Co-implementing Solutions",
                                description:
                                    "Encouraging and facilitating the collaboration, co-creation and co-implementation of solutions to major challenges in data and evidence generation and synthesis for policy impact.",
                                color: "#F97316",
                                icon: <ArrowRight className="w-8 h-8" />,
                            },
                        ].map((item, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-md p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                            >
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 mx-auto"
                                    style={{ backgroundColor: item.color }}
                                >
                                    <div className="text-white">{item.icon}</div>
                                </div>
                                <h3 className="text-lg font-bold text-gray-800 mb-3 text-center">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-sm text-center leading-relaxed">
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                {/* Projects Section */}
                <section className="py-20 relative">
                    {/* Simple, elegant header */}
                    <div className="text-center mb-20">
                        <h2 className="text-3xl font-bold mb-6">
                            <span className="text-black">Alumni</span>
                            <span className="text-[#045f3c] ml-2">Impact</span>
                        </h2>
                    </div>

                    {/* Creative card layout */}
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {[
                                {
                                    title: "Land Governance",
                                    description:
                                        "Equitable land administration systems that strengthen tenure security and promote sustainable use",
                                    icon: <TreePine className="w-12 h-12" />,
                                    color: "#073392",
                                    lightColor: "#e8f0ff",
                                },
                                {
                                    title: "Sustainable Agriculture",
                                    description:
                                        "Agricultural policies balancing productivity with environmental stewardship and social inclusion",
                                    icon: <Sprout className="w-12 h-12" />,
                                    color: "#005c3d",
                                    lightColor: "#e8f5f0",
                                },
                                {
                                    title: "Climate Adaptation",
                                    description:
                                        "Climate resilience strategies helping communities adapt to changing environmental conditions",
                                    icon: <Cloud className="w-12 h-12" />,
                                    color: "#f8b712",
                                    lightColor: "#fff8e1",
                                },
                            ].map((project, index) => (
                                <div key={index} className="group cursor-pointer">
                                    {/* Minimalist card design */}
                                    <div className="bg-white rounded-md p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                                        {/* Icon and title on same line */}
                                        <div className="flex items-center gap-4 mb-6">
                                            <div
                                                className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                                                style={{ backgroundColor: project.lightColor }}
                                            >
                                                <div style={{ color: project.color }}>
                                                    <div className="w-6 h-6">
                                                        {React.cloneElement(project.icon, {
                                                            className: "w-6 h-6",
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                                                {project.title}
                                            </h3>
                                        </div>

                                        {/* Creative accent line */}
                                        <div
                                            className="h-1 w-12 rounded-full transition-all duration-300 group-hover:w-full mb-4"
                                            style={{ backgroundColor: project.color }}
                                        ></div>

                                        <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors">
                                            {project.description}
                                        </p>
                                    </div>

                                    {/* Creative connecting element */}
                                    {index < 2 && (
                                        <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 translate-x-4 w-8 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Compact CTA button on right */}
                    <div className="flex justify-end mt-12">
                        <button className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#045f3c] text-[#045f3c] rounded-full hover:bg-[#045f3c] hover:text-white transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg">
                            <span>View All Projects</span>
                            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />

                            {/* Creative hover effect */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#073392] via-[#005c3d] to-[#f8b712] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                        </button>
                    </div>
                </section>
            </div>

            {/* Events Section */}
            <section className="py-8 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold">
                            <span className="text-black">Alumni</span>
                            <span className="text-[#045f3c] ml-2">Events</span>
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                id: "official-launch",
                                date: "April 4, 2025",
                                type: "Event",
                                title: "Lead Intentionally: Creating Impact in All Spaces",
                                image: "/images/launch event.jpg",
                            },
                            {
                                id: "lead-intentionally",
                                date: "July 12, 2025",
                                type: "Workshop",
                                title: "Lead Intentionally: Creating Impact in All Spaces",
                                image: "/images/Sustainable Agriculture Fellows(1).jpg",
                            },
                            {
                                id: "power-of-networks",
                                date: "May 12, 2025",
                                type: "Webinar",
                                title: "The Power of Networks: Turning Connections",
                                image: "/images/Sustainable Land Use Fellows.jpg",
                            },
                        ].map((eventItem) => (
                            <Link key={eventItem.id} href={``}>
                                <motion.div
                                    className="news-card perspective-wrapper group"
                                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                                >
                                    {/* Image with perspective effect */}
                                    <div className="perspective-element">
                                        <div className="perspective-image">
                                            <img
                                                src={eventItem.image}
                                                alt={eventItem.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {/* Badges moved to content area */}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 bg-white">
                                        <div className="flex items-center justify-between mb-3">
                      <span className="bg-white text-black text-xs font-semibold px-2.5 py-1 ">
                        {eventItem.date}
                      </span>
                                            <span
                                                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                                    eventItem.type === "Event"
                                                        ? "bg-primary-green text-white"
                                                        : eventItem.type === "Workshop"
                                                            ? "bg-[#073392] text-white"
                                                            : eventItem.type === "Webinar"
                                                                ? "bg-primary-orange text-white"
                                                                : "bg-primary-green text-white"
                                                }`}
                                            >
                        <TranslatableText>{eventItem.type}</TranslatableText>
                      </span>
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2">
                                            <TranslatableText>{eventItem.title}</TranslatableText>
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            Young professionals are at the forefront of accelerating CAADP implementation...
                                        </p>
                                        <span
                                            className="inline-flex items-center text-sm font-medium transition-all duration-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0"
                                            style={{
                                                color:
                                                    eventItem.type === "Event"
                                                        ? "#005C30"
                                                        : eventItem.type === "Workshop"
                                                            ? "#073392"
                                                            : eventItem.type === "Webinar"
                                                                ? "#F8B712"
                                                                : "#005C30",
                                            }}
                                        >
                      <span className="border-b border-transparent group-hover:border-current transition-all duration-300">
                        View Event
                      </span>
                      <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </span>
                                    </div>
                                </motion.div>
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Card styles aligned with Latest News */}
                <style jsx global>{`
          .news-card {
            position: relative;
            border-radius: 5px;
            background: white;
            box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
            overflow: hidden;
            transition: all 0.3s ease;
            height: 100%;
            display: flex;
            flex-direction: column;
          }
          .news-card:hover {
            box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
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
            border-radius: 5px 5px 0 0;
          }
          .perspective-image {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-size: cover;
            background-position: center;
            border-radius: 5px 5px 0 0;
            transform: translateZ(0) rotateY(-5deg) scale(1.05);
            transform-origin: right center;
            box-shadow: -8px 5px 10px rgba(0, 0, 0, 0.1);
            transition: all 0.5s ease;
          }
          .news-card:hover .perspective-image {
            transform: translateZ(10px) rotateY(-8deg) scale(1.08);
          }
          .view-news-button {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background-color: white;
            color: #117b34;
            font-weight: 600;
            font-size: 14px;
            padding: 8px 16px;
            border-radius: 9999px;
            border: 1px solid #e5e7eb;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
            transition: all 0.2s ease;
          }
          .view-news-button:hover {
            background-color: #f9fafb;
            box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
          }
          @media (max-width: 768px) {
            .news-card {
              max-width: 100%;
              margin: 0 auto;
            }
          }
        `}</style>
            </section>
        </main>
    );
}