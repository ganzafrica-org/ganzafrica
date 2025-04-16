"use client";

import React from "react";
import Image from "next/image";
import { DecoratedHeading } from "@/components/layout/headertext";

interface PartnersSectionProps {
  locale: string;
  dict: any;
}

export default function PartnersSection({
  locale,
  dict,
}: PartnersSectionProps) {
  const partnerRow1 = [
    "minagri.jpg",
    "ministry-environment.jpg",
    "nla.jpg",
    "AMI 1.jpg",
    "Skillsbuilder 1.jpg",
    "aubreybarkerfund 1.jpg",
  ];

  const partnerRow2 = [
    "Kepler 1.jpg",
    "EPRN 1.jpg",
    "BFAP 1.jpg",
    "ala 1.jpg",
    "science-for-africa.jpg",
  ];

  return (
    <section className="py-16 md:py-24 bg-yellow-50 overflow-hidden">
      <div className="container mx-auto px-4 mb-8">
        <div className="text-center mb-16">
          <DecoratedHeading
            firstText={
              dict?.partners?.heading_first ??
              dict?.about?.partners?.heading_first ??
              "Our"
            }
            secondText={
              dict?.partners?.heading_second ??
              dict?.about?.partners?.heading_second ??
              "Partners"
            }
            firstTextColor="text-primary-green"
            secondTextColor="text-primary-orange"
            borderColor="border-primary-green"
            cornerColor="bg-primary-orange"
            className="mx-auto"
          />
        </div>
      </div>

      {/* First row - Right to Left */}
      <div className="slider-container mb-8 overflow-hidden w-full">
        <div className="slider w-full flex items-center overflow-hidden">
          <div className="slider-items-right flex items-center whitespace-nowrap">
            {/* Double the items to ensure smooth looping */}
            {[...partnerRow1, ...partnerRow1].map((partner, index) => (
              <div key={`row1-${index}`} className="inline-block px-6">
                <div className="bg-white rounded-lg shadow-md p-6 w-64 h-40 flex items-center justify-center">
                  <Image
                    src={`/images/partners/${partner}`}
                    alt={`Partner ${(index % partnerRow1.length) + 1}`}
                    width={200}
                    height={120}
                    className="object-contain max-w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second row - Left to Right */}
      <div className="slider-container overflow-hidden w-full">
        <div className="slider w-full flex items-center overflow-hidden">
          <div className="slider-items-left flex items-center whitespace-nowrap">
            {/* Double the items to ensure smooth looping */}
            {[...partnerRow2, ...partnerRow2].map((partner, index) => (
              <div key={`row2-${index}`} className="inline-block px-6">
                <div className="bg-white rounded-lg shadow-md p-6 w-64 h-40 flex items-center justify-center">
                  <Image
                    src={`/images/partners/${partner}`}
                    alt={`Partner ${(index % partnerRow2.length) + 1}`}
                    width={200}
                    height={120}
                    className="object-contain max-w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Styled JSX for animations */}
      <style jsx>{`
        .slider-items-right {
          animation: scrollRight 30s linear infinite;
        }

        .slider-items-left {
          animation: scrollLeft 30s linear infinite;
        }

        @keyframes scrollRight {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(-50%);
          }
          100% {
            transform: translateX(0);
          }
        }

        .slider-items-right:hover,
        .slider-items-left:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
