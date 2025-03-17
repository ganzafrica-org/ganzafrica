"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

interface HomeHeroProps {
  locale: string;
  dict: any;
}

export default function HomeHero({ locale, dict }: HomeHeroProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const whiteOverlayRef = useRef<HTMLDivElement>(null);
  const initialContentRef = useRef<HTMLDivElement>(null);
  const finalContentRef = useRef<HTMLDivElement>(null);
  const [transitioned, setTransitioned] = useState(false);

  // Handle initial animation
  useEffect(() => {
    if (
      !sectionRef.current ||
      !whiteOverlayRef.current ||
      !initialContentRef.current ||
      !finalContentRef.current
    )
      return;

    // Set initial states
    gsap.set(whiteOverlayRef.current, {
      y: "-100%", // Start completely off-screen above
      clipPath: "ellipse(100% 0% at 50% 0%)",
    });
    gsap.set(finalContentRef.current, { opacity: 0 });

    // Create animation timeline
    const tl = gsap.timeline();

    // After a delay, start the transition
    setTimeout(() => {
      // First fade out the initial content
      tl.to(initialContentRef.current, {
        opacity: 0,
        duration: 0.5,
      })
        // Then bring down the white overlay with curve animation
        .to(whiteOverlayRef.current, {
          y: "0%",
          duration: 1.2,
          ease: "power2.inOut",
          clipPath: "ellipse(100% 100% at 50% 0%)",
        })
        // Then fade in the final content
        .to(finalContentRef.current, {
          opacity: 1,
          duration: 0.8,
        });

      setTransitioned(true);
    }, 3000);

    // Cleanup
    return () => {
      tl.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative h-screen overflow-hidden">
      {/* Video background - full screen and fixed */}
      <div className="fixed inset-0 z-10">
        {/* Green overlay on video */}
        <div className="absolute inset-0 bg-secondary-green/60"></div>

        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/videos/hero-video.mp4" type="video/mp4" />
          <Image
            src="/images/hero-test.jpg"
            alt="Hero background"
            fill
            priority
            className="object-cover"
          />
        </video>
      </div>

      {/* Initial content - to be shown while video is fullscreen */}
      <div
        ref={initialContentRef}
        className="fixed inset-0 flex items-center justify-center z-20"
      >
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 max-w-4xl mx-auto">
            {dict.home.hero.title ||
              "Sustainable Solutions for Rwanda's Future"}
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            {dict.home.hero.subtitle ||
              "Empowering youth through sustainable land management"}
          </p>
        </div>
      </div>

      {/* White overlay that animates from top */}
      <div
        ref={whiteOverlayRef}
        className="fixed inset-0 bg-white z-30"
        style={{
          transform: "translateY(-100%)",
          clipPath: "ellipse(100% 0% at 50% 0%)",
        }}
      ></div>

      {/* Final content - appears after transition */}
      <div ref={finalContentRef} className="fixed inset-0 z-40 opacity-0 pt-24">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-primary-green">
              A PROSPEROUS AND <br /> SUSTAINABLE{" "}
            </span>
            <span className="text-orange">
              FUTURE FOR <br /> AFRICA
            </span>
          </h1>

          <p className="text-base md:text-lg max-w-3xl mx-auto mb-8 text-gray-800">
            {dict.home.hero.subtitle ||
              "Empowering youth through sustainable land management, agriculture, and environmental initiatives"}
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

        {/* Ganza leaf to stick out from side */}
        <div className="absolute -left-1 top-1/3 transform rotate-[31.83deg] -translate-x-1/4 z-50">
          <Image
            src="/images/leaf.png"
            alt="Decorative leaf"
            width={200}
            height={200}
          />
        </div>

        <div className="absolute right-4 top-1/4 rotate-[-60deg] transform translate-x-1/4 z-50">
          <Image
            src="/images/leaf.png"
            alt="Decorative leaf"
            width={200}
            height={200}
            className="rotate-180"
          />
        </div>
      </div>
    </section>
  );
}
