"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { DecoratedHeading } from "@/components/layout/headertext";

interface FellowsSectionProps {
  locale: string;
  dict: any;
}

type ImageItem = {
  id: number;
  src: string;
  alt: string;
};

export default function FellowsSection({ locale, dict }: FellowsSectionProps) {

  const [images, setImages] = useState<ImageItem[]>([
    {
      id: 1,
      src: "/images/ganzafrica-fellows.jpg",
      alt: "GanzAfrica fellows 1",
    },
    {
      id: 2,
      src: "/images/happy_fellows.jpg",
      alt: "GanzAfrica fellows 2",
    },
    {
      id: 3,
      src: "/images/jeannine_presenting.jpg",
      alt: "GanzAfrica fellows 3",
    },
    {
      id: 4,
      src: "/images/serge_presenting.jpg",
      alt: "GanzAfrica fellows 4",
    },
    {
      id: 5,
      src: "/images/fellows_in_field.jpeg",
      alt: "GanzAfrica fellows 5",
    },
  ]);

  const [mainImageIndex, setMainImageIndex] = useState(0);

  const [angle, setAngle] = useState(0);
  const animationRef = useRef<number>();

  const ROTATION_SPEED = 0.2; // degrees per frame
  const ORBIT_RADIUS = 200; // pixels

  // Setup animation
  useEffect(() => {
    const animate = () => {
      setAngle(prevAngle => (prevAngle + ROTATION_SPEED) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Rotate main image every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setMainImageIndex(prev => (prev + 1) % images.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [images.length]);

  // Function to calculate orbital positions
  const getOrbitingImages = () => {
    const orbitingImages = [];
    const totalOrbiting = images.length - 1;

    // Generate orbiting images (all except the main one)
    for (let i = 0; i < images.length; i++) {
      if (i === mainImageIndex) continue;

      // Calculate position in the orbit sequence
      const indexInOrbit = i < mainImageIndex ? i : i - 1;

      // Calculate the base angle for equal distribution (in degrees)
      const baseAngle = (360 / totalOrbiting) * indexInOrbit;

      // Add current rotation angle
      const currentAngle = (baseAngle + angle) % 360;
      const angleInRadians = (currentAngle * Math.PI) / 180;

      // Calculate x and y coordinates
      const x = Math.cos(angleInRadians) * ORBIT_RADIUS;
      const y = Math.sin(angleInRadians) * ORBIT_RADIUS;

      orbitingImages.push({
        image: images[i],
        position: { x, y },
        index: i
      });
    }

    return orbitingImages;
  };

  return (
    <section className="pt-16 pb-6 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="relative mx-auto">
          <div className="flex flex-col-reverse lg:flex-row items-center gap-4">
            {/* Image carousel section - on the left */}
            <div className="w-full lg:w-1/2 h-[360px] md:h-[460px] relative flex items-center justify-center">
              {/* Circle path indicator */}
              <div className="absolute w-[340px] h-[340px] rounded-full border border-gray-200 border-dashed"></div>

              {/* Main central image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`main-${mainImageIndex}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  className="absolute w-96 h-96 rounded-full overflow-hidden border-4 border-primary-green shadow-lg z-10"
                >
                  <Image
                    src={images[mainImageIndex]?.src || ""}
                    alt={images[mainImageIndex]?.alt || ""}
                    fill
                    priority
                    className="object-cover"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Orbiting images */}
              {getOrbitingImages().map(({ image, position, index }) => (
                <motion.div
                  key={`orbit-${image?.id}`}
                  className="absolute w-24 h-24 rounded-full overflow-hidden border-2 border-primary-orange shadow-md cursor-pointer z-20"
                  style={{
                    left: "50%",
                    top: "50%",
                    x: position.x,
                    y: position.y,
                    translateX: "-50%",
                    translateY: "-50%"
                  }}
                  onClick={() => setMainImageIndex(index)}
                  whileHover={{ scale: 1.1 }}
                >
                  <Image
                    src={image?.src || ""}
                    alt={image?.alt || ""}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </div>

            {/* Compact Content section - on the right */}
            <div className="w-full lg:w-1/2 lg:pl-6 -ml-[100px]">
              <motion.div 
                className="mb-6"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <motion.span 
                    className="text-black block"
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    {dict.home?.fellow_section?.heading_first || "Empower Youth to"}
                  </motion.span>
                  <motion.span 
                    className="text-primary-green block"
                    initial={{ x: -20, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    {dict.home?.fellow_section?.heading_second || "Transform Africa's Food Systems"}
                  </motion.span>
                </motion.h2>
                
                <motion.p 
                  className="text-gray-600 mb-6 border-l-4 border-primary-orange pl-4"
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.8 }}
                >
                  {dict.home?.fellow_section?.description ||
                    `Empowering youth with skills and opportunities to drive sustainable food systems transformation through training, mentorship, and hands-on experience.`}
                </motion.p>
              </motion.div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  {
                    key: 'training',
                    title: dict.home?.fellow_section?.Training || "Training",
                    desc: 'Sustainable agriculture & leadership',
                    delay: 0.9
                  },
                  {
                    key: 'careers',
                    title: dict.home?.fellow_section?.career_placement || "Careers",
                    desc: 'Direct pathways to employment',
                    delay: 1.0
                  },
                  {
                    key: 'mentorship',
                    title: dict.home?.fellow_section?.Mentorship || "Mentorship",
                    desc: 'Guidance from industry leaders',
                    delay: 1.1
                  },
                  {
                    key: 'data',
                    title: dict.home?.fellow_section?.data_solutions || "Data Impact",
                    desc: 'Tech-driven solutions',
                    delay: 1.2
                  }
                ].map((item, index) => (
                  <motion.div 
                    key={item.key}
                    className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ 
                      type: "spring",
                      stiffness: 100,
                      damping: 15,
                      delay: item.delay
                    }}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      <motion.div 
                        className="w-2 h-2 rounded-full bg-[#FFB800]"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ 
                          delay: item.delay + 0.3,
                          type: "spring",
                          stiffness: 500,
                          damping: 30
                        }}
                      />
                      <h4 className="font-semibold text-gray-900">
                        {item.title}
                      </h4>
                    </div>
                    <p className="text-gray-600 text-xs ml-4">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}