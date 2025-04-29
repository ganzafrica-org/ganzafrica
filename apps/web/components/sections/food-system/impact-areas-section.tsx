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
const ImpactCard = ({
  title,
  description,
  image,
}: {
  title: string;
  description: string;
  image: string;
}) => {
  return (
    <motion.div
      variants={itemVariants}
      className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full transform hover:-translate-y-1"
    >
      <div className="p-6">
        <div className="rounded-lg overflow-hidden mb-6 relative aspect-video">
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover"
          />
        </div>
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
          <div className="flex justify-end">
            <motion.div
              className="w-10 h-10 rounded-full bg-primary-green flex items-center justify-center cursor-pointer"
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(5, 150, 105, 0.8)",
              }}
              whileTap={{ scale: 0.95 }}
            >
              <ArrowRight className="w-5 h-5 text-white" />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const ImpactAreasSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <Container>
        <motion.div
          className="text-center mb-16"
          variants={titleVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            <span>Our Impact </span>
            <span className="text-primary-green">Areas</span>
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <ImpactCard
            title="Digital Systems"
            description="Leveraging technology to drive data collection and evidence-based decision making across food value chains."
            image="/images/food-system-1.png"
          />
          <ImpactCard
            title="Climate Change Adaptation"
            description="Supporting smallholder farmers with climate-smart agricultural techniques, regenerative farming practices, and appropriate technologies."
            image="/images/food-system-1.png"
          />
          <ImpactCard
            title="Policy Implementation"
            description="Leveraging technology to drive data collection and evidence-based decision making across food value chains."
            image="/images/food-system-1.png"
          />
          <ImpactCard
            title="Data & Evidence"
            description="Supporting smallholder farmers with climate-smart agricultural techniques, regenerative farming practices, and appropriate technologies."
            image="/images/food-system-1.png"
          />
        </motion.div>
      </Container>
    </section>
  );
};

export default ImpactAreasSection;
