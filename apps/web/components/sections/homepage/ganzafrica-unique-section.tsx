"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { PlayCircle, PauseCircle, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { DecoratedHeading } from '@/components/layout/headertext';
import { useDict } from '@/context/dictionary';


interface KeyElement {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  imageUrl?: string;
  isHighlighted?: boolean;
}

interface GanzAfricaUniqueSectionProps {
  locale: string;
}

export default function GanzAfricaUniqueSection({
                                                  locale,
                                                }: GanzAfricaUniqueSectionProps) {
  const dict = useDict();
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
      icon: <DataIcon />,
      color: "#166534", // Deep amber
      imageUrl: "/images/Fellows3.jpeg",
    },
    {
      title: dict?.unique?.elements?.implementation?.title || "Implementation",
      description:
          dict?.unique?.elements?.implementation?.description ||
          "We go beyond ideas, cultivating a generation of young african leaders with the skills and resources to translate their vision into reality, implementing solutions to improve community livelihoods in Africa.",
      icon: <ImplementationIcon />,
      color: "#FFB800", // Deep blue
      imageUrl: "/images/Fellows1.jpeg",
      isHighlighted: true,
    },
    {
      title:
          dict?.unique?.elements?.public_sector?.title || "The Public Sector",
      description:
          dict?.unique?.elements?.public_sector?.description ||
          "We aim to solve endemic and important public sector challenges, based on the belief that only solutions at this level lead to large-scale and long-lasting impact in agriculture and food systems.",
      icon: <PublicSectorIcon />,
      color: "#073392",// Deep green
      imageUrl: "/images/amiteam.jpg",
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
      <section className="py-8 md:py-12 bg-neutral-100 relative overflow-hidden">
        {/* Background Pattern and Decorative Elements */}
        <div className="absolute inset-0 bg-neutral-100">
          <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-10"></div>
        </div>

        {/* Left Leaf */}
        <div className="absolute left-0 top-1/4 -translate-x-1/4 opacity-20 hidden sm:block">
          <img
            src="/images/leaf.png"
            alt="Decorative leaf"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 transform -rotate-12"
          />
        </div>

        {/* Right Leaf */}
        <div className="absolute right-0 bottom-1/4 translate-x-1/4 opacity-20 hidden sm:block">
          <img
            src="/images/leaf.png"
            alt="Decorative leaf"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 transform rotate-12"
          />
        </div>

        <div className="container mx-auto relative z-10 flex justify-center">
          <motion.div
            className="space-y-10"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            variants={container}
          >
            {/* Title */}
            <div>
              <motion.div
                className="space-y-6"
                variants={item}
              >
                <motion.div
                  className="space-y-2 flex justify-center  px-4"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                >
                  <DecoratedHeading
                    firstText={dict.home?.unique?.title_first || "3 Key Elements that make"}
                    secondText={dict.home?.unique?.title_second || "GanzAfrica Unique"}
                  />
                </motion.div>
                {/* <motion.div
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
                </motion.div> */}
              </motion.div>
            </div>

            {/* Key elements as cards below title */}
                <div className="space-y-6 max-w-6xl">
              <motion.div
                className="space-y-4 relative"
                variants={item}
              >
                <div className="absolute -left-6 top-0 bottom-0 w-6 bg-gradient-to-r from-transparent to-neutral-100 z-10 pointer-events-none"></div>
                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 pl-2 pr-1 py-4 overflow-visible mx-2 lg:mx-0 mb-[10rem]">
                  <div className="absolute -right-6 top-0 bottom-0 w-6 bg-gradient-to-l from-neutral-100 to-transparent z-10 pointer-events-none"></div>
                  {keyElements.map((element, index) => (
                    <motion.div
                      key={index}
                      className={`mb-5 md:mb-0 relative bg-white rounded-md transition-all z-0${
                        element.isHighlighted
                          ? "bg-amber-50 shadow-lg"
                          : "bg-slate-50 shadow-md hover:shadow-lg"
                      }`}
                      variants={item}
                      whileHover={{
                        scale: 1.02,
                        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)"
                      }}
                    >
                      {/* Icon - Overlapping Image and Content */}
                      <div className="absolute left-6 -top-10 z-20 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white shadow-lg"
                           style={{ backgroundColor: element.color }}>
                        {element.icon}
                      </div>

                      {/* Content Area */}
                      <div className="pt-12 px-8 pb-8">
                        {/* Title */}
                        <h3 className="mb-4 text-xl font-bold" style={{ color: element.color }}>
                          {element.title}
                        </h3>

                        {/* Description */}
                        <p className="mb-6 text-sm text-gray-700 leading-relaxed">
                          {element.description}
                        </p>
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