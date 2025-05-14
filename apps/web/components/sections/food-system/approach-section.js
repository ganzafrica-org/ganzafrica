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
    return (<section className="pt-16 pb-0 bg-gray-50">
      <Container>
        <div className="flex flex-col lg:flex-row items-stretch justify-between gap-8 max-w-7xl mx-auto">
          {/* Content section - 50% width */}
          <motion.div className="w-full lg:w-1/2 flex flex-col justify-center px-8 bg-[#F5F5F5] bg-opacity-75 py-16 rounded-[20px] " variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <p className="text-gray-600 mb-8 text-base text-justify max-w-2xl mx-auto">
              To GanzAfrica, food systems are far more than just the journey from farm to fork. They are complex, interconnected networks that shape livelihoods, health, and the environment. Food systems influence how land is used, how food is grown, how natural resources are managed, and how communities thrive or struggle. Yet, in many parts of Africa, these systems remain fragmented, unsustainable, and unable to fully serve the people who depend on them the most.
              <br />
              <br />
              GanzAfrica adopts a systems approach — a holistic framework that seeks to understand the complexity of food systems by examining how different elements interact and influence one another within the broader whole. Rather than addressing issues in isolation, we focus on the dynamic relationships between nature, people, and the economy. This holistic perspective enables us to drive meaningful transformation across the entire ecosystem — from land management and agricultural practices to environmental sustainability and market systems.
              <br />
              <br />
              We work collaboratively with local communities, governments, and private sector partners to transform fragmented value chains into integrated, resilient systems that benefit all stakeholders — especially smallholder farmers and rural communities who are often left behind.
            </p>
            <Link href={`/${"locale"}/projects`}>
              <motion.button className="bg-primary-orange hover:bg-yellow-500 text-white px-6 py-3 rounded-md font-medium transition-colors" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                Checkout our projects
              </motion.button>
            </Link>
          </motion.div>

          {/* Right image - now 50% width */}
          <motion.div className="w-full lg:w-1/2" variants={imageVariantRight} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }}>
            <div className="relative h-full">
              <div className="absolute inset-2.5 rounded-[20px] border-4 border-white z-10"></div>
              <div className="relative overflow-hidden h-full rounded-[20px]">
                <Image src="/images/harvest2.png" alt="Food in hands" fill className="object-cover"/>
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>);
};
export default ApproachSection;
