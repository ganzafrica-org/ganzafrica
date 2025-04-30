// @ts-nocheck

"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { Button } from "@workspace/ui/components/button";
import { DecoratedHeading } from "@/components/layout/headertext";
import { ArrowRight } from "lucide-react";

interface FellowsSectionProps {
  locale: string;
  dict: any;
}

export default function FellowsSection({ locale, dict }: FellowsSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const countRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      gsap.registerPlugin(ScrollTrigger);
    }

    if (!sectionRef.current) return;

    return () => {
      if (typeof window !== "undefined") {
        ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      }
    };
  }, []);

  return (
      <section
          ref={sectionRef}
          className="pt-16 md:pt-24 bg-white relative overflow-hidden"
      >
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <DecoratedHeading
                firstText={dict.home?.fellow_section?.heading_first || "Empower Youth to"}
                secondText={dict.home?.fellow_section?.heading_second || "Transform Africa's Food Systems"}
                firstTextColor="text-black"
                secondTextColor="text-primary-green"
                borderColor="border-primary-green"
                cornerColor="bg-primary-orange"
                className="mx-auto"
            />
          </div>
        </div>

        <div className="relative container mx-auto px-4">

          <div className="relative z-10 flex flex-col lg:flex-row items-start gap-8">
            {/* Content section - reduced width */}
            <div ref={contentRef} className="w-full lg:basis-[45%] pt-8">
              <p className="text-gray-800 text-lg mb-8">
                {dict.home?.fellow_section?.description ||
                    `GanzAfrica empowers Africa's youth with the skills, knowledge, and
                opportunities to drive sustainable food systems transformation.
                Through training, mentorship, and work placements, we equip young
                leaders to tackle challenges in agriculture, environmental
                stewardship, and land management. Our holistic approach integrates
                data literacy, evidence-based decision-making, and leadership
                development, bridging the gap between education and employment.
                By fostering expertise and professional networks, GanzAfrica
                prepares youth to build resilient communities and contribute to a
                thriving Africa.`}
              </p>
              <div className="flex flex-wrap md:flex-nowrap gap-4 my-8">
                <div className="flex items-center space-x-8">
                  <div className="w-3 h-3 rounded-full bg-[#FFB800]"></div>
                  <p className="text-gray-800 font-medium">
                    {dict.home?.fellow_section?.Training || "Training"}
                  </p>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="w-3 h-3 rounded-full bg-[#FFB800]"></div>
                  <p className="text-gray-800 font-medium">
                    {dict.home?.fellow_section?.career_placement || "Career Placement"}
                  </p>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="w-3 h-3 rounded-full bg-[#FFB800]"></div>
                  <p className="text-gray-800 font-medium">
                    {dict.home?.fellow_section?.Mentorship || "Mentorship"}
                  </p>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="w-3 h-3 rounded-full bg-[#FFB800]"></div>
                  <p className="text-gray-800 font-medium">
                    {dict.home?.fellow_section?.data_solutions || "Data Driven Impact"}
                  </p>
                </div>
              </div>
            </div>
            {/* Image section - increased width */}
            <div className="relative w-full lg:basis-[55%]  mx-auto lg:mx-0 lg:-mb-16">
              <div className="relative rounded-2xl overflow-hidden shadow-md w-full h-[300px] md:h-[400px]">
                <Image
                    src={
                        dict.home?.fellow_section?.image_src ||
                        "/images/ganzafrica-fellows.jpg"
                    }
                    alt={dict.about?.fellows_photo_alt || "GanzAfrica fellows"}
                    fill
                    priority
                    className="object-cover"
                    style={{ objectPosition: '50% 30%' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}