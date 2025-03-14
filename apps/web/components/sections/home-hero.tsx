'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

interface HomeHeroProps {
    locale: string;
    dict: any;
}

export default function HomeHero({ locale, dict }: HomeHeroProps) {
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const heroContentRef = useRef<HTMLDivElement>(null);
    const [videoTransitioned, setVideoTransitioned] = useState(false);

    // Handle initial animation
    useEffect(() => {
        if (!videoContainerRef.current || !heroContentRef.current) return;

        // Set initial state
        gsap.set(heroContentRef.current, { opacity: 0, y: 30 });

        const tl = gsap.timeline();

        // After a delay, transition the video to collapsed state
        setTimeout(() => {
            tl.to(videoContainerRef.current, {
                height: '40vh',
                borderBottomLeftRadius: '50% 20%',
                borderBottomRightRadius: '50% 20%',
                ease: "power2.inOut",
                duration: 1.2,
            })
                .to(heroContentRef.current, {
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    delay: -0.4,
                });

            setVideoTransitioned(true);
        }, 3000); // Set to 3 seconds for testing, change back to 10000 for production

        // Cleanup
        return () => {
            tl.kill();
        };
    }, []);

    return (
        <section className="relative pt-20">
            {/* Video Container with animated height - starts full screen, collapses to semi-circle */}
            <div
                ref={videoContainerRef}
                className="relative w-full h-screen overflow-hidden transition-all duration-1000"
            >
                {/* Green overlay on video */}
                <div className="absolute inset-0 bg-secondary-green/60 z-10"></div>

                {/* Video Background - fallback to image if video doesn't load */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/videos/hero-video.mp4" type="video/mp4" />
                    {/* Fallback if video tag is not supported or video fails to load */}
                    <Image
                        src="/images/hero-test.jpg"
                        alt="Hero background"
                        fill
                        priority
                        className="object-cover"
                    />
                </video>

                {/* SVG curve at the bottom - only visible after transition */}
                {videoTransitioned && (
                    <div className="absolute bottom-0 left-0 w-full">
                        <svg
                            viewBox="0 0 1440 100"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full text-white"
                            preserveAspectRatio="none"
                        >
                            <path
                                d="M0 100V20C240 60 480 80 720 80C960 80 1200 60 1440 20V100H0Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                )}

                {/* Decorative Leaves - only visible after transition */}
                {videoTransitioned && (
                    <>
                        <Image
                            src="/images/leaf.png"
                            alt="Decorative leaf"
                            width={150}
                            height={150}
                            className="absolute top-24 left-0 opacity-80 z-20"
                        />

                        <Image
                            src="/images/leaf.png"
                            alt="Decorative leaf"
                            width={150}
                            height={150}
                            className="absolute bottom-24 right-0 rotate-180 opacity-80 z-20"
                        />
                    </>
                )}

                {/* Initial content - shown while video is fullscreen */}
                {!videoTransitioned && (
                    <div className="absolute inset-0 flex items-center justify-center z-20">
                        <div className="text-center text-white">
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto">
                                {dict.home.hero.title || "Sustainable Solutions for Rwanda's Future"}
                            </h1>
                            <p className="text-xl md:text-2xl max-w-3xl mx-auto">
                                {dict.home.hero.subtitle || "Empowering youth through sustainable land management"}
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Hero Content - only appears after video collapses */}
            <div
                ref={heroContentRef}
                className="container mx-auto px-4 mt-10 text-center opacity-0"
            >
                <h1 className="text-5xl md:text-7xl font-bold mb-6">
                    <span className="text-primary-green">A PROSPEROUS AND <br/> SUSTAINABLE </span>
                    <span className="text-orange">FUTURE FOR <br/> AFRICA</span>
                </h1>

                <p className="text-lg md:text-xl max-w-3xl mx-auto mb-10 text-gray-800">
                    {dict.home.hero.subtitle || "Empowering youth through sustainable land management, agriculture, and environmental initiatives"}
                </p>

                <Link href={`/${locale}/about`} prefetch={true}>
                    <Button
                        size="lg"
                        className="bg-primary-green hover:bg-primary-green/90 text-white font-medium px-6 py-3"
                    >
                        {dict.cta.discover_more || "Discover More"}
                    </Button>
                </Link>
            </div>
        </section>
    );
}