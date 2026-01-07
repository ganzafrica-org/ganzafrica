// @ts-nocheck

"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { DecoratedHeading } from "@/components/layout/headertext";
import { CircleCheck } from "lucide-react";
import { useDict } from '@/context/dictionary';

// Custom CheckCircle component with color fill
const ColoredCheckCircle = ({
  color,
  className,
}: {
  color: string;
  className?: string;
}) => {
  return (
    <div className={`relative ${className}`}>
      <div
        className="absolute inset-0 rounded-full"
        style={{ backgroundColor: color, zIndex: 1 }}
      ></div>
      <CircleCheck className="relative z-10 text-white w-full h-full" />
    </div>
  );
};

interface WhyGanzAfricaSectionProps {
  locale: string;
}

export default function WhyGanzAfricaSection({
  locale,
}: WhyGanzAfricaSectionProps) {
  const dict = useDict();
  const sectionRef = useRef<HTMLDivElement>(null);
  const bulletPointsRef = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (!sectionRef.current) return;

    // Animate bullet points
    const bulletPoints = bulletPointsRef.current.filter(Boolean);

    gsap.fromTo(
      bulletPoints,
      {
        opacity: 0,
        y: 30,
      },
      {
        opacity: 1,
        y: 0,
        stagger: 0.2,
        duration: 0.7,
        ease: "power2.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      },
    );

    return () => {
      if (typeof window !== "undefined") {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary-green/5 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-orange/5 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
      
      <div className="container mx-auto px-5 md:px-40 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left side - Enhanced Content Card */}
          <div className="w-full lg:w-1/2 lg:-mr-12 relative z-20 ">
            <div className="bg-white/95 backdrop-blur-sm rounded-md p-3 sm:p-4 md:p-5 lg:p-6 shadow-2xl border border-white/20 hover:shadow-3xl transition-all duration-500 h-auto sm:h-[450px] lg:h-[550px] flex flex-col">
              {/* Enhanced Heading */}
              <div className="mb-2 sm:mb-3 lg:mb-4">
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-1 sm:mb-2">
                  <span className="text-gray-900">
                    {dict.home?.why_section?.heading_first || "Why"}{" "}
                  </span>
                  <span className="bg-gradient-to-r from-primary-green to-secondary-green bg-clip-text text-transparent">
                    {dict.home?.why_section?.heading_second || "GanzAfrica?"}
                  </span>
                </h2>
                {/* <div className="w-10 sm:w-12 h-0.5 sm:h-1 bg-gradient-to-r from-primary-green to-primary-orange rounded-full"></div> */}
              </div>

              {/* Enhanced Bullet Points */}
              <div className="flex-1 space-y-1.5 sm:space-y-2 lg:space-y-3 overflow-hidden">
                {/* Bullet Point 1 */}
                <div
                  ref={(el) => {
                    bulletPointsRef.current[0] = el;
                    return undefined;
                  }}
                  className="group flex items-start gap-1.5 sm:gap-2 lg:gap-3 p-0.5 sm:p-1 lg:p-2 rounded-lg hover:bg-gray-50/50 transition-all duration-300"
                >
                  <div className="mt-0.5 relative flex-shrink-0">
                    <div 
                      className="absolute -inset-0.5 sm:-inset-1 md:-inset-1.5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: "rgba(255, 140, 0, 0.2)" }}
                    ></div>
                    <ColoredCheckCircle
                      color="#f8b712"
                      className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-6 lg:w-6 xl:h-7 xl:w-7 relative z-10 transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="text-sm sm:text-base lg:text-base font-bold text-gray-900 mb-0.5 transition-colors duration-300 leading-tight"
                      style={{ color: "gray-900" }}
                      onMouseEnter={(e) => e.target.style.color = "  #f8b712"}
                      onMouseLeave={(e) => e.target.style.color = "#111827"}
                    >
                      {dict.home?.why_section?.point1_title ||
                        "We train and inspire future leaders"}
                    </h4>
                    <p className="text-sm text-gray-600 leading-tight">
                      {dict.home?.why_section?.point1_desc ||
                        "Create, connect, and develop a pool of committed and value-driven young Africans who can adapt new and emerging technologies in land, agriculture, and environment sub-sectors."}
                    </p>
                  </div>
                </div>

                {/* Bullet Point 2 */}
                <div
                  ref={(el) => {
                    bulletPointsRef.current[1] = el;
                    return undefined;
                  }}
                  className="group flex items-start gap-1.5 sm:gap-2 lg:gap-3 p-0.5 sm:p-1 lg:p-2 rounded-lg hover:bg-gray-50/50 transition-all duration-300"
                >
                  <div className="mt-0.5 relative flex-shrink-0">
                    <div 
                      className="absolute -inset-0.5 sm:-inset-1 md:-inset-1.5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: "rgba(7, 51, 146, 0.2)" }}
                    ></div>
                    <ColoredCheckCircle
                      color="#073392"
                      className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-6 lg:w-6 xl:h-7 xl:w-7 relative z-10 transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="text-sm sm:text-base lg:text-base font-bold text-gray-900 mb-0.5 transition-colors duration-300 leading-tight"
                      style={{ color: "gray-900" }}
                      onMouseEnter={(e) => e.target.style.color = "#073392"}
                      onMouseLeave={(e) => e.target.style.color = "#111827"}
                    >
                      {dict.home?.why_section?.point2_title ||
                        "We drive continental collaboration"}
                    </h4>
                    <p className="text-sm text-gray-600 leading-tight">
                      {dict.home?.why_section?.point2_desc ||
                        "Build a continental coalition of informed and empowered young experts who can innovate, co-create and scale solutions in land, agriculture, and environment sub-sectors."}
                    </p>
                  </div>
                </div>

                {/* Bullet Point 3 */}
                <div
                  ref={(el) => {
                    bulletPointsRef.current[2] = el;
                    return undefined;
                  }}
                  className="group flex items-start gap-1.5 sm:gap-2 lg:gap-3 p-0.5 sm:p-1 lg:p-2 rounded-lg hover:bg-gray-50/50 transition-all duration-300"
                >
                  <div className="mt-0.5 relative flex-shrink-0">
                    <div 
                      className="absolute -inset-0.5 sm:-inset-1 md:-inset-1.5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: "rgba(255, 215, 0, 0.3)" }}
                    ></div>
                    <ColoredCheckCircle
                      color="#FFD700"
                      className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-6 lg:w-6 xl:h-7 xl:w-7 relative z-10 transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="text-sm sm:text-base lg:text-base font-bold text-gray-900 mb-0.5 transition-colors duration-300 leading-tight"
                      style={{ color: "gray-900" }}
                      onMouseEnter={(e) => e.target.style.color = "#FFD700"}
                      onMouseLeave={(e) => e.target.style.color = "#111827"}
                    >
                      {dict.home?.why_section?.point3_title ||
                        "We create intergenerational links"}
                    </h4>
                    <p className="text-sm text-gray-600 leading-tight">
                      {dict.home?.why_section?.point3_desc ||
                        "Enhance cross-generational linkages between experienced and retired professionals and young practitioners, enhancing the co-creation of blended solutions combining novel and traditional ideals."}
                    </p>
                  </div>
                </div>

                {/* Bullet Point 4 */}
                <div
                  ref={(el) => {
                    bulletPointsRef.current[3] = el;
                    return undefined;
                  }}
                  className="group flex items-start gap-1.5 sm:gap-2 lg:gap-3 p-0.5 sm:p-1 lg:p-2 rounded-lg hover:bg-gray-50/50 transition-all duration-300"
                >
                  <div className="mt-0.5 relative flex-shrink-0">
                    <div 
                      className="absolute -inset-0.5 sm:-inset-1 md:-inset-1.5 rounded-full blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ backgroundColor: "rgba(7, 51, 146, 0.2)" }}
                    ></div>
                    <ColoredCheckCircle
                      color="#073392"
                      className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-6 lg:w-6 xl:h-7 xl:w-7 relative z-10 transform group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="text-sm sm:text-base lg:text-base font-bold text-gray-900 mb-0.5 transition-colors duration-300 leading-tight"
                      style={{ color: "gray-900" }}
                      onMouseEnter={(e) => e.target.style.color = "#073392"}
                      onMouseLeave={(e) => e.target.style.color = "#111827"}
                    >
                      {dict.home?.why_section?.point4_title ||
                        "We promote innovative solutions"}
                    </h4>
                    <p className="text-sm text-gray-600 leading-tight">
                      {dict.home?.why_section?.point4_desc ||
                        "Support the development of innovative, scalable solutions that address critical challenges in food systems, climate resilience, and sustainable agricultural practices across the continent."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Enhanced Image */}
          <div className="w-full lg:w-1/2 mb-8 lg:mb-0">
            <div className="relative group">
              <div className="absolute -inset-4 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative rounded-md overflow-hidden shadow-2xl h-[350px] sm:h-[450px] lg:h-[550px] transform transition-transform duration-500 group-hover:scale-[1.02]">
                <Image
                  src="/images/2-fellows.jpg"
                  alt={
                    dict.about?.fellows_photo_alt ||
                    "GanzAfrica fellows collaborating"
                  }
                  fill
                  priority
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}