"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/layout/container";
import Link from "next/link";

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

const imageVariantLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const imageVariantRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

const ApproachSection = () => {
  return (
    <section className="py-16 bg-gray-50">
      <Container>
        <div className="flex flex-col md:flex-row items-stretch justify-between gap-8 max-w-7xl mx-auto">
          {/* Left image - hidden on small and medium devices */}
          <motion.div
            className="w-full md:w-1/3 hidden lg:block lg:w-1/4"
            variants={imageVariantLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="relative h-full">
              {/* This creates the transparent overlay with big rounded white borders */}
              <div className="absolute inset-2.5 rounded-[20px] border-4 border-white z-10"></div>
              <div className="relative h-full rounded-[20px] overflow-hidden">
                <Image
                  src="/images/food-system-1.png"
                  alt="Food in hands"
                  width={300}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>

          {/* Center content - larger width on large screens */}
          <motion.div
            className="w-full md:w-1/2 lg:w-2/4 flex flex-col justify-center px-8 bg-[#F5F5F5] bg-opacity-75 py-16 rounded-[20px]"
            variants={fadeIn}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-left lg:text-center">
              <span>Our Approach</span>
              <br />
              <span className="text-primary-green mt-2 block">to Food Systems</span>
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto text-justify leading-relaxed">
              To GanzAfrica, Food Systems are far more than just the journey
              from farm to table. They are complex, interconnected networks that
              shape livelihoods, health, and the environment. That is why
              GanzAfrica adopts a systems thinking approach to examine how
              different elements interact and influence one another within the
              broader whole. This holistic perspective enables us to drive
              meaningful transformation across the entire ecosystem.
            </p>
            <div className="text-center">
              <Link href="/projects">
                <motion.button
                  className="bg-primary-orange hover:bg-yellow-500 text-white px-8 py-4 rounded-lg font-medium transition-colors text-lg shadow-md hover:shadow-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Checkout our projects
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Right image - shorter on mobile */}
          <motion.div
            className="w-full md:w-1/2 lg:w-1/4"
            variants={imageVariantRight}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="relative h-[300px] md:h-full">
              {/* This creates the transparent overlay with big rounded white borders */}
              <div className="absolute inset-2.5 rounded-[20px] border-4 border-white z-10"></div>
              <div className="relative h-full rounded-[20px] overflow-hidden">
                <Image
                  src="/images/food-system-1.png"
                  alt="Food in hands"
                  width={300}
                  height={500}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default ApproachSection;
