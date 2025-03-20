'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { DecoratedHeading } from '@/components/layout/headertext';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NewsItem {
    id: string;
    title: string;
    category: string;
    date: string;
    image: string;
    slug: string;
    tag?: string;
}

interface LatestNewsSectionProps {
    locale: string;
    dict: any;
}

export default function LatestNewsSection({ locale, dict }: LatestNewsSectionProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Sample news data
    const newsItems: NewsItem[] = [
        {
            id: 'news-1',
            title: dict?.news?.items?.news1?.title || 'Youth Advancing CAADP Post-Malabo',
            category: dict?.about?.categories?.agriculture || 'Agriculture',
            date: 'Dec 12, 2022',
            image: '/images/2-fellows.jpg',
            slug: `/${locale}/news/youth-advancing-caadp-post-malabo`,
            tag: dict?.news?.tags?.fellowship || 'Fellowship'
        },
        {
            id: 'news-2',
            title: dict?.news?.items?.news2?.title || 'Our fellows reflecting on their work in retreat',
            category: dict?.about?.categories?.food_system || 'Food System',
            date: 'Jan 15, 2023',
            image: '/images/2-fellows.jpg',
            slug: `/${locale}/news/fellows-reflecting-work-retreat`,
            tag: dict?.news?.tags?.fellowship || 'Fellowship'
        },
        {
            id: 'news-3',
            title: dict?.news?.items?.news3?.title || 'Youth Advancing CAADP Post-Malabo',
            category: dict?.about?.categories?.agriculture || 'Agriculture',
            date: 'Mar 22, 2023',
            image: '/images/2-fellows.jpg',
            slug: `/${locale}/news/advancing-agricultural-policies`,
            tag: dict?.news?.tags?.policy || 'Policy'
        }
    ];

    // Split title into words for multi-line cutout effect
    const splitTitle = (title: string) => {
        const words = title.split(' ');
        const lines = [];
        let currentLine = '';

        words.forEach(word => {
            if ((currentLine + ' ' + word).length > 20) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = currentLine ? `${currentLine} ${word}` : word;
            }
        });

        if (currentLine) {
            lines.push(currentLine);
        }

        return lines;
    };

    return (
        <section className="py-16 md:py-24 bg-gray-50 relative overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 relative">
                    {/* See all link positioned absolutely to the right */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
                        <Link
                            href={`/${locale}/news`}
                            className="flex items-center text-primary-green hover:text-secondary-green transition-colors group"
                        >
                            <span className="mr-2 font-medium">{dict?.news?.see_all || "See New Updates"}</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                    </div>

                    {/* Decorated heading centered */}
                    <div className="w-full text-center">
                        <DecoratedHeading
                            firstText={dict?.news?.heading_first || "Latest"}
                            secondText={dict?.news?.heading_second || "News & Updates"}
                            firstTextColor="text-primary-green"
                            secondTextColor="text-primary-orange"
                            borderColor="border-primary-green"
                            cornerColor="bg-primary-orange"
                            className="mx-auto"
                        />
                    </div>

                    {/* Mobile-only link (appears below heading on small screens) */}
                    <div className="mt-6 md:hidden w-full flex justify-center">
                        <Link
                            href={`/${locale}/news`}
                            className="flex items-center text-primary-green hover:text-secondary-green transition-colors group"
                        >
                            <span className="mr-2 font-medium">{dict?.news?.see_all || "See New Updates"}</span>
                            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                    {newsItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.slug}
                            className={cn(
                                "relative block transition-all duration-500",
                                hoveredId === item.id
                                    ? "md:scale-110 z-10"
                                    : "scale-100 z-0"
                            )}
                            onMouseEnter={() => setHoveredId(item.id)}
                            onMouseLeave={() => setHoveredId(null)}
                        >
                            <div className="relative">
                                <div className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full">
                                    {/* Background image */}
                                    <Image
                                        src={item.image}
                                        alt={item.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 33vw"
                                        className={cn(
                                            "object-cover transition-transform duration-500",
                                            hoveredId === item.id ? "scale-110" : "scale-100"
                                        )}
                                    />
                                    <div className={cn(
                                        "absolute inset-0 bg-black transition-opacity duration-300",
                                        hoveredId === item.id ? "opacity-60" : "opacity-40"
                                    )}></div>

                                    {/* Badges on top left (visible when hovered) */}
                                    {hoveredId === item.id && (
                                        <div className="absolute flex flex-col top-4 left-4  gap-2 z-20">
                                            <div className="bg-white backdrop-blur-sm rounded-full px-3 py-1 text-secondary-green text-xs">
                                                {item.date}
                                            </div>

                                            {item.tag && (
                                                <div className="bg-transparent backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs border border-white">
                                                    <span className="inline-block w-2 h-2 bg-secondary-yellow rounded-full mr-2"></span>
                                                    {item.tag}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Top right cutout title (visible when hovered) */}
                                    {hoveredId === item.id && (
                                        <div className="absolute right-0 top-0 z-20">
                                            <div className="flex flex-col items-end">
                                                {/* Split title into lines for individual cutouts */}
                                                {splitTitle(item.title).map((line, index) => (
                                                    <h3
                                                        key={index}
                                                        className={cn(
                                                            "bg-white text-right py-2 px-4 text-lg font-bold text-gray-900",
                                                            index === 0 ? "rounded-l-3xl" : "",
                                                            index === splitTitle(item.title).length - 1 ? "rounded-bl-3xl" : "",
                                                            index !== 0 && index !== splitTitle(item.title).length - 1 ? "" : "",
                                                            index !== splitTitle(item.title).length - 1 ? "mb-0" : ""
                                                        )}
                                                        style={
                                                            index === 0
                                                                ? { borderBottomLeftRadius: "0" }
                                                                : index === splitTitle(item.title).length - 1
                                                                    ? { borderTopLeftRadius: "0" }
                                                                    : { borderRadius: "0", borderTopLeftRadius: "0", borderBottomLeftRadius: "0" }
                                                        }
                                                    >
                                                        {line}
                                                    </h3>
                                                ))}
                                            </div>

                                            {/* Arrow button below the cutout title */}
                                            <div className="flex justify-end mt-3">
                                                <motion.div
                                                    className="w-8 h-8 bg-secondary-yellow rounded-full flex items-center justify-center"
                                                    animate={{ rotate: 0 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <ArrowUpRight className="w-5 h-5 rotate-45 text-primary-green" />
                                                </motion.div>
                                            </div>
                                        </div>
                                    )}

                                    {/* The arrow button at top right (visible when not hovered) */}
                                    {hoveredId !== item.id && (
                                        <motion.div
                                            className="absolute top-4 right-4 z-20 w-8 h-8 bg-secondary-yellow rounded-full flex items-center justify-center"
                                            animate={{ rotate: -45 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <ArrowUpRight className="w-5 h-5 rotate-45 text-primary-green" />
                                        </motion.div>
                                    )}
                                </div>

                                {/* Title and category below image (visible when not hovered) */}
                                {hoveredId !== item.id && (
                                    <div className="py-3">
                                        {/* Category bullet */}
                                        <div className="flex items-center">
                                            <span className="inline-block w-2 h-2 bg-primary-green rounded-full mr-2"></span>
                                            <span className="text-sm font-medium">{item.category}</span>
                                        </div>
                                        <h3 className="text-lg font-bold mt-1">{item.title}</h3>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}