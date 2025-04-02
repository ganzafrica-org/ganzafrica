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
            ease: "easeOut"
        }
    }
};

const imageVariantLeft = {
    hidden: { opacity: 0, x: -30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut"
        }
    }
};

const imageVariantRight = {
    hidden: { opacity: 0, x: 30 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            duration: 0.7,
            ease: "easeOut"
        }
    }
};

const ApproachSection = () => {
    return (
        <section className="py-16 bg-gray-50">
            <Container>
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    {/* Left image */}
                    <motion.div
                        className="w-full md:w-1/4"
                        variants={imageVariantLeft}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="relative">
                            {/* This creates the transparent overlay with big rounded white borders */}
                            <div className="absolute inset-2.5 rounded-[20px] border-4 border-white z-10"></div>
                            <div className="relative overflow-hidden">
                                <Image
                                    src="/images/food-system-1.png"
                                    alt="Food in hands"
                                    width={300}
                                    height={500}
                                    className="w-full h-auto object-cover"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Center content */}
                    <motion.div
                        className="w-full md:w-2/4 text-center"
                        variants={fadeIn}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                            <span>Our Approach </span>
                            <br />
                            <span className="text-primary-green">to Food Systems</span>
                        </h2>
                        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                            We work collaboratively with local communities, governments, and private sector partners to transform
                            fragmented value chains into integrated, efficient systems that benefit all stakeholders – especially
                            smallholder farmers and rural communities.
                        </p>
                        <Link href="/projects">
                            <motion.button
                                className="bg-primary-orange hover:bg-yellow-500 text-white px-6 py-3 rounded-md font-medium transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Checkout our projects
                            </motion.button>
                        </Link>
                    </motion.div>

                    {/* Right image */}
                    <motion.div
                        className="w-full md:w-1/4"
                        variants={imageVariantRight}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                    >
                        <div className="relative">
                            {/* This creates the transparent overlay with big rounded white borders */}
                            <div className="absolute inset-2.5 rounded-[20px] border-4 border-white z-10"></div>
                            <div className="relative overflow-hidden">
                                <Image
                                    src="/images/food-system-1.png"
                                    alt="Food in hands"
                                    width={300}
                                    height={500}
                                    className="w-full h-auto object-cover"
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