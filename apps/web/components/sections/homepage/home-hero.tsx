'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { Button } from '@workspace/ui/components/button';

interface HomeHeroProps {
    locale: string;
    dict: any;
}

export default function HomeHero({ locale, dict }: HomeHeroProps) {
    const sectionRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const whiteOverlayRef = useRef<HTMLDivElement>(null);
    const initialContentRef = useRef<HTMLDivElement>(null);
    const finalContentRef = useRef<HTMLDivElement>(null);
    const [videoLoaded, setVideoLoaded] = useState(false);
    const [animationStarted, setAnimationStarted] = useState(false);

    // Handle video loading
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Function to handle when video can play
        const handleCanPlay = () => {
            setVideoLoaded(true);
            if (!animationStarted) {
                startTransition();
            }
        };

        // If video is already loaded
        if (video.readyState >= 3) {
            handleCanPlay();
        } else {
            // Otherwise wait for it to be ready
            video.addEventListener('canplay', handleCanPlay);
        }

        // Set a maximum timeout to start animation even if video is slow
        const timeoutId = setTimeout(() => {
            if (!animationStarted) {
                startTransition();
            }
        }, 5000); // Maximum wait time of 5 seconds

        return () => {
            video.removeEventListener('canplay', handleCanPlay);
            clearTimeout(timeoutId);
        };
    }, [animationStarted]);

    // Function to start the transition
    const startTransition = () => {
        if (animationStarted) return;
        setAnimationStarted(true);

        if (!sectionRef.current || !whiteOverlayRef.current || !initialContentRef.current || !finalContentRef.current || !videoContainerRef.current) return;

        // Set initial states
        gsap.set(whiteOverlayRef.current, {
            y: '-100%',
            clipPath: 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)'
        });
        gsap.set(finalContentRef.current, { opacity: 0 });

        // Initial video state (full screen)
        gsap.set(videoContainerRef.current, {
            clipPath: 'none',
            height: '100%',
            bottom: 0
        });

        // Create animation timeline
        const tl = gsap.timeline();

        // Start the transition with longer display of initial content
        tl.to(initialContentRef.current, {
            opacity: 0,
            duration: 7.5 // Increased from 4.5 to 7.5 seconds to keep text visible longer
        })
            // Then bring down the white overlay with curve animation
            .to(whiteOverlayRef.current, {
                y: '0%',
                duration: 1.2,
                ease: "power2.inOut",
                clipPath: 'url(#hero-clip)'
            })
            // At the same time, animate the video to the curved area
            .to(videoContainerRef.current, {
                clipPath: 'url(#hero-clip-inverted)',
                height: '35%',
                bottom: 0,
                duration: 1.2,
                ease: "power2.inOut"
            }, "<") // This starts at the same time as the previous animation
            // Then fade in the final content
            .to(finalContentRef.current, {
                opacity: 1,
                duration: 0.8
            });
    };

    return (
        <section ref={sectionRef} className="relative h-screen">
            {/* Video background container with clip path */}
            <div
                ref={videoContainerRef}
                className="absolute inset-x-0 z-10"
                style={{
                    height: '100%',
                    bottom: 0
                }}
            >
                {/* Green overlay on video - with improved visibility */}
                <div className="absolute inset-0 bg-secondary-green/60 z-20"></div>

                {/* Immediate Fallback Image (shows while video loads) */}
                <div className="absolute inset-0">
                    <Image
                        src="/images/hero-test.jpg"
                        alt="Hero background"
                        fill
                        priority
                        quality={75}
                        className="object-cover"
                    />
                </div>

                {/* Video Background - loaded with low priority */}
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                    preload="auto"
                >
                    <source src="/videos/hero-video.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Initial content - to be shown while video is fullscreen */}
            <div
                ref={initialContentRef}
                className="absolute inset-0 flex items-center justify-center z-30"
            >
                <div className="text-center text-white">
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto">
                        {dict?.home?.hero?.title || "Sustainable Solutions for Rwanda's Future"}
                    </h1>
                    <p className="text-xl md:text-2xl max-w-3xl mx-auto">
                        {dict?.home?.hero?.subtitle || "Empowering youth through sustainable land management"}
                    </p>
                </div>
            </div>

            {/* SVG definitions for both clip paths */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <svg className="absolute inset-0 w-full h-full">
                    <defs>
                        {/* Clip path for the white overlay (coming from top) */}
                        <clipPath id="hero-clip" clipPathUnits="objectBoundingBox">
                            <path d="M0,0 H1 V0.85 C0.83,0.7 0.66,0.65 0.5,0.65 C0.33,0.65 0.16,0.7 0,0.85 L0,0 Z" />
                        </clipPath>
                    </defs>
                </svg>
            </div>

            {/* White overlay that animates from top with curve */}
            <div
                ref={whiteOverlayRef}
                className="absolute inset-0 bg-white z-30"
                style={{
                    transform: 'translateY(-100%)',
                    clipPath: 'url(#hero-clip)',
                }}
            ></div>

            {/* Final content - appears after transition */}
            <div
                ref={finalContentRef}
                className="absolute inset-0 z-40 opacity-0 pt-24"
            >
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        <span className="text-primary-green">
                            {dict?.home?.hero?.title_after?.line1 || "A PROSPEROUS AND"} <br/>
                            {dict?.home?.hero?.title_after?.line2 || "SUSTAINABLE"}
                        </span>{" "}
                        <span className="text-primary-orange">
                            {dict?.home?.hero?.title_after?.line3 || "FUTURE FOR"} <br/>
                            {dict?.home?.hero?.title_after?.line4 || "AFRICA"}
                        </span>
                    </h1>

                    <p className="text-base md:text-lg max-w-3xl mx-auto mb-8 text-gray-800">
                        {dict?.home?.hero?.subtitle || "Empowering youth through sustainable land management, agriculture, and environmental initiatives"}
                    </p>

                    <Link href={`/${locale}/about`} prefetch={true}>
                        <Button
                            size="lg"
                            className="bg-primary-green hover:bg-primary-green/90 text-white font-medium px-6 py-3"
                        >
                            {dict?.cta?.discover_more || "Discover More"}
                        </Button>
                    </Link>
                </div>

                {/* Ganza leaf to stick out from side */}
                <div className="absolute -left-1 top-1/3 transform rotate-[31.83deg] -translate-x-1/4 z-50">
                    <Image
                        src="/images/leaf.png"
                        alt="Decorative leaf"
                        width={200}
                        height={200}
                        priority
                    />
                </div>

                <div className="absolute right-4 top-1/4 rotate-[-60deg] transform translate-x-1/4 z-50">
                    <Image
                        src="/images/leaf.png"
                        alt="Decorative leaf"
                        width={200}
                        height={200}
                        className="rotate-180"
                        priority
                    />
                </div>
            </div>
        </section>
    );
}