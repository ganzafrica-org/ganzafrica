"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { TranslatableText } from "@/components/translate/TranslatableText";

interface ProgramCard {
    id: number;
    title: string;
    description: string;
    image: string;
    link: string;
}

const programs: ProgramCard[] = [
    {
        id: 1,
        title: "Fellowship Program",
        description: "Our fellowship program provides young leaders with the skills and opportunities to drive sustainable change in their communities across Africa. This immersive experience helps develop essential leadership qualities and technical expertise.",
        image: "/images/amiteam.jpg",
        link: "/programs/fellowship"
    },
    {
        id: 2,
        title: "Alumni Program",
        description: "Building a network of skilled professionals driving Africa's transformation in land, agriculture, and environment. Our alumni continue to innovate, lead, and create positive change across the continent.",
        image: "/images/alumni_program.jpg",
        link: "/programs/alumni"
    },
];

export default function ProgramSection() {
    const [hoveredId, setHoveredId] = useState<number | null>(null);

    return (
        <section className="flex flex-col px-0 bg-white">
            <div className="relative w-full min-h-[500px] flex flex-col md:flex-row items-center">
                {/* Header moved back to center */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-full text-center pointer-events-none">
                    <h2 className="font-h4 md:font-h3 backdrop-blur-sm inline-block px-8 py-4">
                        <span className="text-black">
                            <TranslatableText>Our Flag</TranslatableText>
                        </span>
                        <span className="text-primary-green">
                            <TranslatableText>ship Programs</TranslatableText>
                        </span>
                    </h2>
                </div>

                {/* Programs cards */}
                <div className="flex flex-col md:flex-row w-full h-full min-h-[700px]">
                    {programs.map((program) => {
                        const isHovered = hoveredId === program.id;

                        return (
                            <div
                                key={program.id}
                                className="relative flex-1 h-full min-h-[400px] md:min-h-[700px] cursor-pointer overflow-hidden group"
                                onMouseEnter={() => setHoveredId(program.id)}
                                onMouseLeave={() => setHoveredId(null)}
                            >
                                {/* Background Image */}
                                <div className="absolute inset-0 z-0">
                                    <Image
                                        src={program.image}
                                        alt={program.title}
                                        fill
                                        className={cn(
                                            "object-cover transition-all duration-700",
                                            isHovered ? "scale-105" : ""
                                        )}
                                    />
                                    {/* Overlay */}
                                    <div
                                        className={cn(
                                            "absolute inset-0 transition-all duration-500",
                                            isHovered
                                                ? "bg-primary-green/60"
                                                : "bg-black/40"
                                        )}
                                    />
                                </div>

                                {/* Content Container */}
                                <div className="relative z-10 h-full flex flex-col items-center justify-between p-12 md:p-24 pb-20 md:pb-32 text-center">
                                    <div className="flex flex-col items-center gap-12 md:gap-10 w-full mt-12 md:mt-16">
                                        <h3 className="font-h4 md:font-h3 font-bold tracking-wider">
                                            <span className="text-white">
                                                <TranslatableText>
                                                    {program.id === 1 ? "Fellowship" : "Alumni"}
                                                </TranslatableText>
                                            </span>
                                            {" "}
                                            <span className="text-primary-orange">
                                                <TranslatableText>Program</TranslatableText>
                                            </span>
                                        </h3>

                                        <p className="text-sm md:text-lg leading-relaxed text-white max-w-2xl transition-all duration-500">
                                            <TranslatableText>{program.description}</TranslatableText>
                                        </p>
                                    </div>

                                    <Link href={program.link} className="mt-10">
                                        <button className="text-primary-orange font-bold text-sm md:text-base border-2 border-primary-orange px-8 py-3 rounded-md hover:bg-primary-orange hover:text-white transition-all duration-300">
                                            <TranslatableText>Learn more</TranslatableText>
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
