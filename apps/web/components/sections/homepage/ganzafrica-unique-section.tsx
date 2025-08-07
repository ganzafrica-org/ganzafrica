"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { PlayCircle, PauseCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface KeyElement {
  title: string;
  description: string;
  icon: React.ReactNode; // Changed to ReactNode for inline SVGs
  color: string;
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
      dict?.unique?.title || "3 Key Elements that make GanzAfrica Unique";

  // Define custom SVG icons for each element
  const DataIcon = () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 7L12 12L21 7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 17L12 22L21 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 12L12 17L21 12" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
  );

  const ImplementationIcon = () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22 12H18L15 21L9 3L6 12H2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
  );

  const PublicSectorIcon = () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      color: "#f8b712", // Yellow
    },
    {
      title: dict?.unique?.elements?.implementation?.title || "Implementation",
      description:
          dict?.unique?.elements?.implementation?.description ||
          "We go beyond ideas, cultivating a generation of young african leaders with the skills and resources to translate their vision into reality, implementing solutions to improve community livelihoods in Africa.",
      icon: <ImplementationIcon />, // Custom SVG icon
      color: "#009758", // Green
    },
    {
      title:
          dict?.unique?.elements?.public_sector?.title || "The Public Sector",
      description:
          dict?.unique?.elements?.public_sector?.description ||
          "We aim to solve endemic and important public sector challenges, based on the belief that only solutions at this level lead to large-scale and long-lasting impact in agriculture and food systems.",
      icon: <PublicSectorIcon />, // Custom SVG icon
      color: "#073392", // Blue
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

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const videoContainer = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.6,
        ease: "easeOut"
      } 
    }
  };

  return (
      <section className="py-16 md:py-24 bg-[#E5EAF6] overflow-hidden relative">
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-50" style={{
          backgroundImage: 'radial-gradient(circle, #4a5568 0.5px, transparent 0.5px)',
          backgroundSize: '12px 12px',
          backgroundPosition: 'center',
          backgroundRepeat: 'repeat',
          pointerEvents: 'none'
        }} />
        <div className="container mx-auto px-4">
          <motion.div 
            className="grid md:grid-cols-2 gap-8 lg:gap-12 items-center"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={container}
          >
            {/* Left column with title and video */}
            <div>
              <motion.div 
                className="space-y-8"
                variants={item}
              >
                <motion.div 
                  className="space-y-2"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <h2 className="text-3xl md:text-4xl font-bold text-black">
                    {dict.home?.unique?.title_first || "3 Key Elements that make"}
                  </h2>
                  <h2 className="text-3xl md:text-4xl font-bold text-primary-green">
                    {dict.home?.unique?.title_second || "GanzAfrica Unique"}
                  </h2>
                </motion.div>
                <motion.div 
                  className="relative rounded-2xl overflow-hidden aspect-video bg-gray-200 shadow-2xl transform hover:shadow-3xl transition-all duration-300 hover:-translate-y-1"
                  variants={videoContainer}
                  whileHover={{ scale: 1.02 }}
                >
                  <video
                      ref={videoRef}
                      src="/videos/farmers-in-field.mp4"
                      poster="/images/famer-feild.png"
                      className="w-full h-full object-cover brightness-105"
                      onEnded={() => setVideoPlaying(false)}
                      onPlay={() => setVideoPlaying(true)}
                      onPause={() => setVideoPlaying(false)}
                      preload="auto"
                      muted
                      loop
                  >
                    Your browser does not support the video tag.
                  </video>
                  <motion.button
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#fef597] leading-tight mb-8">
                {sectionTitle}
              </h2>

              {/* Video with play button overlay */}
              <div className="relative rounded-2xl overflow-hidden aspect-video bg-gray-200">
                <video
                    ref={videoRef}
                    src="/videos/farmers-in-field.mp4"
                    poster="/images/famer-feild.png" // Using existing image with typo in filename
                    className="w-full h-full object-cover brightness-105"
                    onEnded={() => setVideoPlaying(false)}
                    onPlay={() => setVideoPlaying(true)}
                    onPause={() => setVideoPlaying(false)}
                    preload="auto"
                    playsInline
                    loop
                    muted
                />

                {/* Play/Pause button overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                      onClick={handleVideoPlayback}
                      className="absolute inset-0 w-full h-full flex items-center justify-center bg-black bg-opacity-30 transition-all duration-300 hover:bg-opacity-20 focus:outline-none"
                      aria-label={videoPlaying ? 'Pause video' : 'Play video'}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                  >
                    <AnimatePresence mode="wait">
                      {videoPlaying ? (
                          <motion.div
                            key="pause"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <PauseCircle className="w-16 h-16 text-white opacity-80 hover:opacity-100 transition-opacity" />
                          </motion.div>
                      ) : (
                          <motion.div
                            key="play"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2 }}
                            transition={{ duration: 0.2 }}
                          >
                            <PlayCircle className="w-16 h-16 text-white opacity-80 hover:opacity-100 transition-opacity" />
                          </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.div>
              </motion.div>
            </div>

            {/* Right column with key elements */}
            <div className="space-y-8">
              <motion.div 
                className="space-y-6 relative"
                variants={item}
              >
                <div className="absolute -left-6 top-0 bottom-0 w-6 bg-gradient-to-r from-transparent to-[#E5EAF6] z-10 pointer-events-none"></div>
                <div className="relative space-y-6 pl-2 pr-1 py-4 overflow-visible">
                  <div className="absolute -right-6 top-0 bottom-0 w-6 bg-gradient-to-l from-[#E5EAF6] to-transparent z-10 pointer-events-none"></div>
                  {keyElements.map((element, index) => (
                      <motion.div
                          key={index}
                          className={`p-6 rounded-lg bg-white bg-opacity-90 backdrop-blur-sm border-l-4`}
                          style={{ borderLeftColor: element.color }}
                          variants={item}
                          whileHover={{ 
                            scale: 1.02,
                            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
                          }}
                      >
                        <div className="flex items-start space-x-4">
                          <motion.div
                              className="flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center"
                              style={{ backgroundColor: element.color }}
                              whileHover={{ rotate: 10, scale: 1.1 }}
                              transition={{ type: "spring", stiffness: 300 }}
                          >
                            {React.cloneElement(element.icon as React.ReactElement, { 
                              className: 'w-6 h-6 text-white' 
                            })}
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold mb-2" style={{ color: element.color }}>
                              {element.title}
                            </h3>
                            <p className="text-gray-700">
                              {element.description}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
  );
}