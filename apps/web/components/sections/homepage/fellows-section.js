"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { DecoratedHeading } from "@/components/layout/headertext";
export default function FellowsSection({ locale, dict }) {
    const [images, setImages] = useState([
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
    const animationRef = useRef();
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
            if (i === mainImageIndex)
                continue;
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
    return (<section className="pt-16 md:pt-24 bg-white relative overflow-hidden">
        <div className="container mx-auto px-4">
        

          <div className="relative mx-auto px-4">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-8">
              {/* Image carousel section - on the left */}
              <div className="w-full lg:w-1/2 h-[400px] md:h-[500px] relative flex items-center justify-center">
                {/* Circle path indicator */}
                <div className="absolute w-[340px] h-[340px] rounded-full border border-gray-200 border-dashed"></div>

                {/* Main central image */}
                <AnimatePresence mode="wait">
                  <motion.div key={`main-${mainImageIndex}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.5 }} className="absolute w-96 h-96 rounded-full overflow-hidden border-4 border-primary-green shadow-lg z-10">
                    <Image src={images[mainImageIndex]?.src || ""} alt={images[mainImageIndex]?.alt || ""} fill priority className="object-cover"/>
                  </motion.div>
                </AnimatePresence>

                {/* Orbiting images */}
                {getOrbitingImages().map(({ image, position, index }) => (<motion.div key={`orbit-${image?.id}`} className="absolute w-24 h-24 rounded-full overflow-hidden border-2 border-primary-orange shadow-md cursor-pointer z-20" style={{
                left: "50%",
                top: "50%",
                x: position.x,
                y: position.y,
                translateX: "-50%",
                translateY: "-50%"
            }} onClick={() => setMainImageIndex(index)} whileHover={{ scale: 1.1 }}>
                      <Image src={image?.src || ""} alt={image?.alt || ""} fill className="object-cover"/>
                    </motion.div>))}
              </div>

              {/* Content section - on the right */}
              <div className="w-full lg:w-1/2">
              <div className="text-center mb-12">
            <DecoratedHeading firstText={dict.home?.fellow_section?.heading_first || "Empower Youth to"} secondText={dict.home?.fellow_section?.heading_second || "Transform Africa's Food Systems"} className="mx-auto"/>
          </div>
                <p className="text-gray-700 text-base mb-6">
                  {dict.home?.fellow_section?.description ||
            `GanzAfrica empowers Africa's youth with the skills, knowledge, and
                opportunities to drive sustainable food systems transformation.
                Through training, mentorship, and work placements, we equip young
                leaders to tackle challenges in agriculture, environmental
                stewardship, and land management. Our holistic approach integrates
                data literacy, evidence-based decision-making, and leadership
                development, bridging the gap between education and employment.`}
                </p>
                <div className="flex flex-wrap gap-3 my-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-[#FFB800]"></div>
                    <p className="text-gray-800 text-sm font-medium">
                      {dict.home?.fellow_section?.Training || "Training"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-[#FFB800]"></div>
                    <p className="text-gray-800 text-sm font-medium">
                      {dict.home?.fellow_section?.career_placement || "Career Placement"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-[#FFB800]"></div>
                    <p className="text-gray-800 text-sm font-medium">
                      {dict.home?.fellow_section?.Mentorship || "Mentorship"}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-[#FFB800]"></div>
                    <p className="text-gray-800 text-sm font-medium">
                      {dict.home?.fellow_section?.data_solutions || "Data Driven Impact"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>);
}
