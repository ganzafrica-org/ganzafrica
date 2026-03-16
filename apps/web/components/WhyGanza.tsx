'use client'

import { motion } from 'framer-motion'
import { ArrowRight, CircleCheck } from 'lucide-react'
import Image from 'next/image'
import { TranslatableText } from "@/components/translate/TranslatableText";
import React from "react";

export function WhyGanza() {
    const bulletPoints = [
        {
            title: "We train and inspire future leaders",
            description: "Create, connect, and develop a pool of committed and value-driven young Africans who can adapt new and emerging technologies in land, agriculture, and environment sub-sectors.",
            color: "#f8b712"
        },
        {
            title: "We drive continental collaboration",
            description: "Build a continental coalition of informed and empowered young experts who can innovate, co-create and scale solutions in land, agriculture, and environment sub-sectors.",
            color: "#073392"
        },
        {
            title: "We create intergenerational links",
            description: "Enhance cross-generational linkages between experienced and retired professionals and young practitioners, enhancing the co-creation of blended solutions combining novel and traditional ideals.",
            color: "#FFD700"
        },
        {
            title: "We promote innovative solutions",
            description: "Support the development of innovative, scalable solutions that address critical challenges in food systems, climate resilience, and sustainable agricultural practices across the continent.",
            color: "#00A15D"
        }
    ];

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.6, ease: 'easeOut' },
        },
    }

    const imageVariants = {
        hidden: { opacity: 0, scale: 0.95 },
        visible: {
            opacity: 1,
            scale: 1,
            transition: { duration: 0.8, ease: 'easeOut' },
        },
    }

    return (
        <section className="relative overflow-hidden px-4 py-20 md:py-28 sm:px-6 lg:px-8">
            {/* Background organic shapes */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full opacity-40 blur-3xl" style={{ backgroundColor: '#FCF5E5' }} />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full opacity-30 blur-3xl" style={{ backgroundColor: '#FCF5E5' }} />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-100px' }}
                className="relative z-10 mx-auto max-w-7xl"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-1 sm:mb-2 mr-1">
                        {/*<spa className="text-gray-900">*/}
                        <TranslatableText>Why </TranslatableText>
                        {/*</spa>*/}
                        <span className="bg-gradient-to-r from-primary-green to-secondary-green bg-clip-text text-transparent">
                    <TranslatableText> GanzAfrica?</TranslatableText>
                  </span>
                    </h2>
                </motion.div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-6">
                    {/* Featured Item - Left Column */}
                    <motion.article
                        variants={itemVariants}
                        className="lg:col-span-2"
                    >
                        <div className="relative">
                            {/* Main Image */}
                            <motion.div
                                variants={imageVariants}
                                className="relative h-80 w-full overflow-hidden rounded-md shadow-lg lg:h-[450px]"
                            >
                                <Image
                                    src="/images/2-fellows.jpg"
                                    alt="GanzAfrica fellows collaborating"
                                    fill
                                    className="object-cover"
                                    priority
                                />
                            </motion.div>

                            {/* Floating Card for first point */}
                            <motion.div
                                variants={itemVariants}
                                className="absolute -bottom-6 left-0 right-0 mx-4 rounded-md bg-white p-6 shadow-2xl sm:mx-6"
                            >
                                <h4
                                    className="text-sm sm:text-base lg:text-base font-bold text-gray-900 mb-2 transition-colors duration-300 leading-tight"
                                    onMouseEnter={(e) => e.target.style.color = bulletPoints[0].color}
                                    onMouseLeave={(e) => e.target.style.color = "#111827"}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <CircleCheck className="h-5 w-5 flex-shrink-0" style={{ color: bulletPoints[0].color }} />
                                        <TranslatableText>{bulletPoints[0].title}</TranslatableText>
                                    </div>
                                </h4>
                                <p className="text-sm text-gray-600 leading-tight">
                                    <TranslatableText>
                                        {bulletPoints[0].description}
                                    </TranslatableText>
                                </p>
                            </motion.div>
                        </div>
                    </motion.article>

                    {/* Remaining Points - Right Column */}
                    <motion.div
                        variants={itemVariants}
                        className="space-y-6 lg:col-span-3 lg:pt-8 mt-12 lg:mt-0"
                    >
                        {bulletPoints.slice(1).map((item, index) => (
                            <motion.article
                                key={index}
                                variants={itemVariants}
                                transition={{ delay: index * 0.1 }}
                                className="group transition-all"
                            >
                                <div className="flex items-start">
                                    <CircleCheck className="h-6 w-6 flex-shrink-0" style={{ color: item.color }} />
                                    <div
                                        className="h-[2px] flex-grow rounded-full mt-3"
                                        style={{ backgroundColor: item.color }}
                                    />
                                </div>
                                <div className="pl-0 pt-3">
                                    <h3 
                                        className="mb-2 font-bold leading-snug sm:text-base transition-colors duration-300" 
                                        style={{ color: '#0F172A' }}
                                        onMouseEnter={(e) => e.target.style.color = item.color}
                                        onMouseLeave={(e) => e.target.style.color = '#0F172A'}
                                    >
                                        <TranslatableText>{item.title}</TranslatableText>
                                    </h3>
                                    <p className="mb-3 text-sm text-gray-600">
                                        <TranslatableText>{item.description}</TranslatableText>
                                    </p>
                                </div>
                            </motion.article>
                        ))}
                    </motion.div>
                </div>
            </motion.div>
        </section>
    )
}
