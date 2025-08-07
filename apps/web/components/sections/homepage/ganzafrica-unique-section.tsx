"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { PlayCircle, PauseCircle } from "lucide-react";

interface KeyElement {
  title: string;
  description: string;
  icon: React.ReactNode; // Changed to ReactNode for inline SVGs
  color: string;
  titleColor: string;
  iconBgColor: string;
}

interface GanzAfricaUniqueSectionProps {
  locale: string;
  dict: any;
}

export default function GanzAfricaUniqueSection({
                                                  locale,
                                                  dict,
                                                }: GanzAfricaUniqueSectionProps) {
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Get section content from dictionary with fallbacks
  const sectionTitle =
      dict?.unique?.title || "3 Key Elements that make GanzAfrica unique ";

  // Define custom SVG icons for each element
  const DataIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 17L12 22L21 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 12L12 17L21 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
  );

  const ImplementationIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
  );

  const PublicSectorIcon = () => (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21H21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 21V17H15V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 9H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 13H15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
  );

  // Define the key elements with content from dictionary
  const keyElements: KeyElement[] = [
    {
      title: dict?.unique?.elements?.data?.title || "Data and Evidence",
      description:
          dict?.unique?.elements?.data?.description ||
          "We champion a data & evidence-based approach, equipping our fellows with key skills in data analytics to support evidence-informed decisions and policies.",
      icon: <DataIcon />, // Custom SVG icon
      color: "  #f8b712", 
      titleColor: "  #f8b712", 
      iconBgColor: "  #f8b712", 
    },
    {
      title: dict?.unique?.elements?.implementation?.title || "Implementation",
      description:
          dict?.unique?.elements?.implementation?.description ||
          "We go beyond ideas, cultivating a generation of young african leaders with the skills and resources to translate their vision into reality, implementing solutions to improve community livelihoods in Africa.",
      icon: <ImplementationIcon />, // Custom SVG icon
      color: "#073392", // primary-blue
      titleColor: "#073392", // primary-blue
      iconBgColor: "#073392", // primary-blue
    },
    {
      title:
          dict?.unique?.elements?.public_sector?.title || "The Public Sector",
      description:
          dict?.unique?.elements?.public_sector?.description ||
          "We aim to solve endemic and important public sector challenges, based on the belief that only solutions at this level lead to large-scale and long-lasting impact in agriculture and food systems.",
      icon: <PublicSectorIcon />, // Custom SVG icon
      color: "#FFD700", // secondary-yellow
      titleColor: "#FFD700", // secondary-yellow
      iconBgColor: "#FFD700", // secondary-yellow
    },
  ];

  // Handler for video play/pause button
  const handleVideoPlayback = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  return (
      <section className="py-12 md:py-12 bg-[#E5EAF6]">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 items-start">
            {/* Title positioned above the cards */}
            <div className="md:col-start-2 mb-0 mt-12">
              <h2 className="text-xl md:text-2xl lg:text-3xl font-bold leading-tight">
                <span className="text-black">3 Key Elements that make </span>
                <span className="text-primary-green">GanzAfrica unique</span>
              </h2>
            </div>
            {/* Left column with video */}
            <div className="md:row-start-2">
              {/* Video with play button overlay */}
              <div className="relative rounded-xl overflow-hidden aspect-video bg-black/10">
                <video
                    ref={videoRef}
                    src="/videos/farmers-in-field.mp4" // Your video file path
                    poster="/images/famer-feild.png" // Optional: keep the thumbnail as a poster
                    className="w-full h-full object-cover"
                    onEnded={() => setVideoPlaying(false)}
                />

                {/* Play/Pause button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                      onClick={handleVideoPlayback}
                      className="w-12 h-12 md:w-16 md:h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-white/30"
                      aria-label={videoPlaying ? "Pause video" : "Play video"}
                  >
                    {videoPlaying ? (
                        <PauseCircle className="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg" />
                    ) : (
                        <PlayCircle className="w-8 h-8 md:w-12 md:h-12 text-white drop-shadow-lg" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Right column with key elements */}
            <div className="space-y-6 h-full flex flex-col justify-between md:row-start-2">
              {keyElements.map((element, index) => (
                  <div
                      key={element.title}
                      className="bg-white rounded-lg overflow-hidden shadow-sm flex flex-col md:flex-row flex-1"
                  >
                    {/* Colored sidebar */}
                    <div
                        className="w-full md:w-2 h-2 md:h-auto"
                        style={{ backgroundColor: element.color }}
                    ></div>

                    {/* Content */}
                    <div className="flex-1 p-5">
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div className="flex-shrink-0 mt-0.5">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: element.iconBgColor }}
                          >
                            {element.icon}
                          </div>
                        </div>

                        {/* Text content */}
                        <div className="flex-1">
                          <h3 
                            className="text-base font-bold mb-2"
                            style={{ color: element.titleColor }}
                          >
                            {element.title}
                          </h3>
                          <p className="text-sm text-gray-700 leading-relaxed">
                            {element.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
          </div>
        </div>
      </section>
  );
}