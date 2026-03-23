'use client'

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Image from 'next/image'
import { TranslatableText } from "@/components/translate/TranslatableText";
import React from "react";

export function WhyGanza() {
    const bulletPoints = [
        {
            title: "We train and inspire future leaders",
            description: "Create, connect, and develop a pool of committed and value-driven young Africans who can adapt new and emerging technologies in land, agriculture, and environment sub-sectors.",
            color: "#00A15D"
        },
        {
            title: "We drive continental collaboration",
            description: "Build a continental coalition of informed and empowered young experts who can innovate, co-create and scale solutions in land, agriculture, and environment sub-sectors.",
            color: "#073392"
        },
        {
            title: "We create intergenerational links",
            description: "Enhance cross-generational linkages between experienced and retired professionals and young practitioners, enhancing the co-creation of blended solutions combining novel and traditional ideals.",
            color: "#f8b712"
        },
        {
            title: "We promote innovative solutions",
            description: "Support the development of innovative, scalable solutions that address critical challenges in food systems, climate resilience, and sustainable agricultural practices across the continent.",
            color: "#f8b712"
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
        <section className="relative overflow-hidden px-4 py-20 md:py-25 sm:px-6 lg:px-8 bg-primary-green">
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
                <motion.div variants={itemVariants} className="text-white mb-12 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight mb-1 sm:mb-2 mr-1">
                        {/*<spa className="text-gray-900">*/}
                        <TranslatableText>Why </TranslatableText>
                        {/*</spa>*/}
                        <span className="text-primary-orange">
                    <TranslatableText> GanzAfrica?</TranslatableText>
                  </span>
                    </h2>
                </motion.div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-5 lg:gap-12">

                    {/* Remaining Points - Left Column (01, 02, 03) */}
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        className="space-y-12 lg:col-span-3 lg:pt-8 mt-12 lg:mt-0 order-2 lg:order-1"
                    >
                        {bulletPoints.slice(0, 3).map((item, index) => (
                            <motion.div
                                key={index}
                                variants={itemVariants}
                                className="flex"
                            >
                                <div className="mr-6">
                                    <div
                                        className="relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                                        style={{ backgroundColor: item.color }}
                                    >
                                        <span className="text-white font-bold">{`0${index + 1}`}</span>
                                    </div>
                                    {index < bulletPoints.slice(0, 3).length - 1 && (
                                        <div
                                            className="w-0.5 h-[calc(100%-3rem)] border-l-2 border-dotted ml-6 my-2"
                                            style={{ borderColor: `${item.color}99` }}
                                        />
                                    )}
                                </div>
                                <div>
                                    <h3
                                        className="text-xl font-bold mb-3 transition-colors duration-300 text-white"
                                        // style={{ color: item.color }}
                                    >
                                        <TranslatableText>{item.title}</TranslatableText>
                                    </h3>
                                    <p className="text-white/80 text-justify">
                                        <TranslatableText>{item.description}</TranslatableText>
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>

                    {/* Featured Item - Points 04 */}
                    <motion.article
                        variants={itemVariants}
                        className="lg:col-span-2 order-2"
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

                            {/* Floating Card for point 04 */}
                            <motion.div
                                variants={itemVariants}
                                className="absolute -bottom-6 left-0 right-0 mx-4 rounded-md bg-white p-6 shadow-2xl sm:mx-6"
                            >
                                <h3
                                    className="text-sm sm:text-base lg:text-xl font-bold text-gray-900 mb-2 transition-colors duration-300 leading-tight text-primary-orange"
                                >
                                    <div className="flex text-primary-orange items-center gap-4 mb-2">
                                        <div
                                            className="relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: bulletPoints[3].color }}
                                        >
                                            <span className="text-white font-bold text-sm">04</span>
                                        </div>
                                        <TranslatableText>{bulletPoints[3].title}</TranslatableText>
                                    </div>
                                </h3>
                                <p className="text-gray-600 leading-tight">
                                    <TranslatableText>
                                        {bulletPoints[3].description}
                                    </TranslatableText>
                                </p>
                            </motion.div>
                        </div>
                    </motion.article>

                </div>
            </motion.div>
        </section>
    )
}
