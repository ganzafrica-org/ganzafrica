"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Container from "@/components/layout/container";
import { ArrowRight } from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
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

const titleVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
    },
  },
};

// Card component for impact areas
const Card = ({
  title,
  description,
  image,
  className = ""
}: {
  title: string;
  description: string;
  image: string;
  className?: string;
}) => {
  return (
    <motion.div
      variants={itemVariants}
      className={`group relative overflow-hidden rounded-2xl ${className}`}
    >
      <Image
        src={image}
        alt={title}
        width={500}
        height={300}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Base overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 group-hover:opacity-0 transition-opacity duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-2xl font-bold text-white">{title}</h3>
        </div>
      </div>
      
      {/* Hover state content */}
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300">
        <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-white text-base mb-4">{description}</p>
          <motion.button
            className="w-10 h-10 rounded-full bg-primary-green flex items-center justify-center cursor-pointer hover:bg-primary-green/90 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <ArrowRight className="w-5 h-5 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const ImpactAreasSection = () => {
  return (
    <section className="py-16 bg-[#F5F5F5] bg-opacity-75">
      <Container>
        <motion.div
          className="text-center mb-12"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            <span>Our Impact </span>
            <span className="text-primary-green">Areas</span>
          </h2>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our holistic approach integrates knowledge, innovation, and policy
            engagement to build future leaders who can drive meaningful change
            in Africa's food systems
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 sm:px-6 md:px-7 lg:px-0"
        >
          <div className="h-[300px] sm:h-[400px]">
            <Card
              title="Digital Systems"
              description="We leverage cutting-edge technology to enhance the use of data and evidence to support decision-making, optimizing food value chains for greater efficiency, transparency, and sustainability."
              image="/images/_BAB8842.jpg"
              className="h-full"
            />
          </div>
          <div className="h-[300px] sm:h-[400px]">
            <Card
              title="Policy Implementation"
              description="We collaborate with government and all our stakeholders, to advance the implementation of policies to promote sustainable agriculture, improve food security, and create supportive environments for thriving food systems."
              image="/images/implementation.jpeg"
              className="h-full"
            />
          </div>
          <div className="h-[300px] sm:h-[400px] md:col-span-2 lg:col-span-1">
            <Card
              title="Data & Evidence"
              description="Without robust data and evidence, food system interventions risk being ineffective or even counterproductive. That's why we push for data and research to drive better practices, improve outcomes, and guide informed decisions that support sustainable, equitable food systems."
              image="/images/Mico (Trainer).jpeg"
              className="h-full"
            />
          </div>
        </motion.div>
      </Container>
    </section>
  );
};

export default ImpactAreasSection;
