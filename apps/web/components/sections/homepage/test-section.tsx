"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { TranslatableText } from "@/components/translate/TranslatableText";

interface ProgramCard {
  id: number;
  title: string;
  period?: string;
  subtitle?: string;
  description: string;
  image: string;
  link: string;
}

const programs: ProgramCard[] = [
  {
    id: 1,
    title: "Fellowship Program",
    period: "(2017-2021)",
    subtitle: "LAYING THE FOUNDATION FOR TRANSFORMATION",
    description:
      "Our fellowship program provides young leaders with the skills and opportunities to drive sustainable change in their communities across Africa. This immersive experience helps develop essential leadership qualities and technical expertise.",
    image: "/images/amiteam.jpg",
    link: "/programs/fellowship",
  },
  {
    id: 2,
    title: "Alumni Program",
    period: "(2022-present)",
    subtitle: "SUSTAINABLY GROWING AFRICA'S FOOD SYSTEMS",
    description:
      "Building a network of skilled professionals driving Africa's transformation in land, agriculture, and environment. Our alumni continue to innovate, lead, and create positive change across the continent.",
    image: "/images/alumni_program.jpg",
    link: "/programs/alumni",
  },
];

export default function TestSection() {
  const [activeId, setActiveId] = useState<number>(2); // Default to Alumni Program expanded

  return (
    <section className="flex flex-col justify-center items-center bg-[#E5F9EE] px-4 md:px-10">
      <div className="relative min-h-[600px] w-[75%] mx-5 flex flex-col md:flex-row items-center justify-between gap-8">
        {/* Left side title */}
        <div className="flex flex-col items-start justify-center md:w-1/4">
          <h2 className="font-h4 md:font-h3 flex flex-col">
            <span className="text-primary-green">
              <TranslatableText>Our FlagShip </TranslatableText>
            </span>
            <span className="text-primary-orange">
              <TranslatableText>Programs</TranslatableText>
            </span>
          </h2>
        </div>

        {/* Programs cards */}
        <div className="flex flex-1 w-full h-[500px] gap-4">
          {programs.map((program) => {
            const isActive = activeId === program.id;

            return (
              <motion.div
                key={program.id}
                layout
                className={cn(
                  "relative h-full transition-all duration-700 ease-in-out cursor-pointer overflow-hidden rounded-md",
                  isActive ? "flex-[3]" : "flex-[0.5]",
                )}
                onClick={() => setActiveId(program.id)}
                onMouseEnter={() => setActiveId(program.id)}
              >
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={program.image}
                    alt={program.title}
                    fill
                    className={cn(
                      "object-cover transition-all duration-700",
                      isActive ? "scale-105" : "scale-100",
                    )}
                  />
                  {/* Overlay - Yellowish/Orangeish for comparison */}
                  <div
                    className={cn(
                      "absolute inset-0 transition-all duration-500",
                      isActive
                        ? "bg-primary-green/40" // Yellowish overlay
                        : "bg-primary-green/40",
                    )}
                  />
                </div>

                {/* Content Container */}
                <div className="relative z-10 h-full flex items-center justify-center p-6 overflow-hidden">
                  {isActive ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center text-center max-w-xl"
                    >
                      <h3 className="text-2xl md:text-3xl font-bold tracking-wider flex gap-2 mb-4">
                        <span className="text-primary-orange">
                          <TranslatableText>
                            {program.id === 1 ? "Fellowship" : "Alumni"}
                          </TranslatableText>
                        </span>
                        <span className="text-primary-green">
                          <TranslatableText>
                            {program.id === 1 ? "Program" : "Program"}
                          </TranslatableText>
                        </span>
                      </h3>

                      <p className="text-sm md:text-base leading-relaxed font-medium text-white mb-6">
                        <TranslatableText>{program.description}</TranslatableText>
                      </p>

                      <Link href={program.link}>
                        <button className="text-primary-orange font-bold text-sm md:text-base hover:underline">
                          <TranslatableText>Learn more</TranslatableText>
                        </button>
                      </Link>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center h-full w-full"
                    >
                      <h3
                        className="text-xl md:text-2xl font-bold whitespace-nowrap text-white"
                        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
                      >
                        <TranslatableText>
                          {program.id === 1 ? "Fellowship Program" : "Alumni Program"}
                        </TranslatableText>
                      </h3>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
