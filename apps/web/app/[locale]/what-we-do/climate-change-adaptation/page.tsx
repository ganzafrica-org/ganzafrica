"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import HeaderBelt from "@/components/layout/headerBelt";
import ClimateResilienceSection from "@/components/sections/climate-adaptation/climate-resilience-section";
import ApproachToClimateSection from "@/components/sections/climate-adaptation/approach-to-climate-section";
import KeyFocusAreasSection from "@/components/sections/climate-adaptation/key-focus-areas-section";
import ClimateInitiativesMapSection from "@/components/sections/climate-adaptation/climate-initiatives-map-section";
import PartnersSection from "@/components/sections/climate-adaptation/partners-section";
import NewsletterSection from "@/components/sections/newsletter-section";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  }
};

const ClimateAdaptationPage = ({ locale, dict }) => {
  return (
      <main className="bg-white">
        {/* Hero Section */}
        <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <Image
                src="/images/climate-adaptation.jpg"
                alt="Climate Adaptation"
                fill
                sizes="100vw"
                className="object-cover"
                priority
            />
          </div>

          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/70 z-10"></div>

          {/* Content */}
          <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
            <motion.h1
                className="text-white text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
            >
              <span>Rooted in </span>
              <span className="text-yellow-400 font-bold">Excellence</span>
              <span>, </span>
              <span className="text-yellow-400 font-bold">Growing </span>
              <span>with </span>
              <span className="text-yellow-400 font-bold">Agriculture</span>
            </motion.h1>
            <motion.h2
                className="text-yellow-400 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
            >
              CLIMATE ADAPTATION
            </motion.h2>
          </div>
        </section>

        {/* Banner Section */}
        <div className="w-full overflow-hidden">
          <div className="flex justify-center">
            <HeaderBelt />
          </div>
        </div>

        {/* Page Content */}
        <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeIn}
        >
          <ClimateResilienceSection />
          <ApproachToClimateSection />
          <KeyFocusAreasSection />
          <ClimateInitiativesMapSection />
          <PartnersSection />
          <NewsletterSection locale={locale} dict={dict} />
        </motion.div>
      </main>
  );
};

export default ClimateAdaptationPage;