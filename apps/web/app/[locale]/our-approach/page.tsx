"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import HeaderBelt from "@/components/layout/headerBelt";
import WhereWeWorkSection from "@/components/sections/food-system/where-we-work-section";
import ImpactAreasSection from "@/components/sections/food-system/impact-areas-section";
import ApproachSection from "@/components/sections/food-system/approach-section";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const FoodSystemPage = ({}) => {
  return (
    <main className="bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/harvest3.png"
            alt="Food System"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/40 z-10"></div>

        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
        <motion.h2
            className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-5xl font-extrabold tracking-wider mt-6 mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            OUR APPROACH TO FOOD SYSTEMS
          </motion.h2>
          <motion.h1
            className="text-white text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <span className="font-normal">From Farm to Fork — and Far Beyond </span>
        
          </motion.h1>

        </div>
      </section>

      {/* Banner Section */}
      <div className="w-full overflow-hidden">
        <div className="flex justify-center">
          <HeaderBelt />
        </div>
      </div>
      
      {/* Page Content */}
      <motion.div initial="hidden" animate="visible" variants={fadeIn}>
        <ApproachSection />
        <WhereWeWorkSection />
        <ImpactAreasSection />
      </motion.div>
    </main>
  );
};

export default FoodSystemPage;