"use client"

import { useState, useEffect, useRef } from "react"
import dynamic from "next/dynamic"
import HeaderBelt from "@/components/layout/headerBelt";
import { motion } from "framer-motion";
import MapComponent from "@/components/sections/homepage/MapComponent";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ImpactCard, impactData } from "@/components/sections/ImpactCard";
import Image from "next/image";

// ✅ CountryStats component
function CountryStats({
    countryName,
    stats
}: {
    countryName: string;
    stats: readonly { value: string; label: string; description?: string }[]
}) {
    return (
        <div className="bg-white rounded-md shadow-lg p-8 sticky top-8 h-fit">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {countryName}
            </h3>
            <div className="grid grid-cols-2 items-center lg:flex md:flex-col gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="text-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                        <div className="text-3xl font-bold text-primary-green mb-1">{stat.value}</div>
                        <div className="font-semibold text-gray-200">{stat.label}</div>
                        {stat.description && (
                            <div className="text-gray-200 mt-1">{stat.description}</div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default function AfricaPage() {
    const [selectedCountry, setSelectedCountry] = useState<string | null>("Rwanda")
    const [hoveredCountry, setHoveredCountry] = useState<string | null>(null)
    const mapContainerRef = useRef<HTMLDivElement>(null)

    // Handle hover events on map SVG paths
    useEffect(() => {
        const mapContainer = mapContainerRef.current
        if (!mapContainer) return

        const handleMouseOver = (e: Event) => {
            const target = e.target as SVGPathElement
            if (!target) return

            const id = target.id || target.getAttribute('data-country-code') || target.getAttribute('data-name') || ''
            const fill = target.getAttribute('fill') || ''

            // Check if this is Rwanda or Burkina Faso by ID or if it's already green
            if (id.includes('RW') || id.includes('Rwanda') || id.toLowerCase().includes('rwanda')) {
                setHoveredCountry("Rwanda")
            } else if (id.includes('BF') || id.includes('Burkina') || id.toLowerCase().includes('burkina')) {
                setHoveredCountry("Burkina Faso")
            } else if (fill === '#10b981' || fill === '#059669') {
                // If the path is green, it might be one of our countries
                // Try to determine by checking nearby elements or parent
                const parent = target.parentElement
                if (parent) {
                    const parentId = parent.id || ''
                    if (parentId.includes('RW') || parentId.includes('Rwanda')) {
                        setHoveredCountry("Rwanda")
                    } else if (parentId.includes('BF') || parentId.includes('Burkina')) {
                        setHoveredCountry("Burkina Faso")
                    }
                }
            }
        }

        const handleMouseOut = () => {
            setHoveredCountry(null)
        }

        // Use a MutationObserver to wait for the map to render
        const observer = new MutationObserver(() => {
            const paths = mapContainer.querySelectorAll('svg path')
            if (paths.length > 0) {
                paths.forEach(path => {
                    path.addEventListener('mouseover', handleMouseOver)
                    path.addEventListener('mouseout', handleMouseOut)
                })
                observer.disconnect()
            }
        })

        observer.observe(mapContainer, { childList: true, subtree: true })

        // Also try immediately in case map is already rendered
        const paths = mapContainer.querySelectorAll('svg path')
        if (paths.length > 0) {
            paths.forEach(path => {
                path.addEventListener('mouseover', handleMouseOver)
                path.addEventListener('mouseout', handleMouseOut)
            })
        }

        return () => {
            observer.disconnect()
            const paths = mapContainer.querySelectorAll('svg path')
            paths.forEach(path => {
                path.removeEventListener('mouseover', handleMouseOver)
                path.removeEventListener('mouseout', handleMouseOut)
            })
        }
    }, [])

    const countryData = {
        Rwanda: {
            name: "Rwanda",
            stats: [
                {
                    value: "25",
                    description: "Alumni",
                },
                {
                    value: "15",
                    description: "Fellows",
                },
                {
                    value: "10+",
                    description: "Projects",
                },
                {
                    value: "10",
                    description: "Partners",
                },
                {
                    value: "RWF 50M +",
                    description: "Capital Mobilization",
                },
            ],
        },
        "Burkina Faso": {
            name: "Burkina Faso",
            stats: [
                {
                    value: "5+",
                    description: "Projects",
                },
                {
                    value: "4",
                    description: "Partners",
                },
                {
                    value: "XOF 50 +",
                    description: "Capital Mobilization",
                },
            ],
        },
    } as const

    // Determine which country to show stats for (hover takes priority, then selected)
    const displayCountry = hoveredCountry || selectedCountry
    const currentData = displayCountry ? countryData[displayCountry as keyof typeof countryData] : null

    return (
        <main className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
                {/* Background Image */}
                <div className="absolute inset-0 z-0">
                    <Image
                        src="/images/form.jpg"
                        alt="Opportunities"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/70 z-0"></div>

                {/* Content */}
                <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
                    <motion.h1
                        className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6 mb-6"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.7, delay: 0.4 }}
                    >
                        OUR IMPACT
                    </motion.h1>
                    <motion.h2
                        className="text-white text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.7, delay: 0.2 }}
                    >
                        Explore how GanzAfrica is driving <span className=" font-normal">transformation and building a </span>dynamic team to empower communities across Africa.
                    </motion.h2>

                </div>
            </section>

            {/* Moving Text Belt */}
            <HeaderBelt />
            <div className="max-w-7xl mx-auto px-5 mt-30">
                {/* Header Section */}
                <div className="mb-12">
                    <div className="flex items-start gap-8 mb-8">
                        <div className="flex-1">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold my-2 leading-tight">
                                Our Impact From Agricultural Programs in Africa
                            </h1>
                            <p className="text-gray-700 leading-relaxed max-w-2xl">
                                During our agricultural initiatives over the past decade, we strengthened government capacity and
                                agricultural systems across Africa, helping farmers adopt sustainable practices and technologies. Here's
                                what we achieved:
                            </p>
                        </div>
                    </div>

                    {/* Main Map Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Map Section - 2 columns */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-5">
                                <div ref={mapContainerRef} className="w-full h-full overflow-hidden relative">
                                    <MapComponent />
                                </div>
                                <div className="mt-6 flex gap-4 flex-wrap">
                                    <button
                                        onClick={() => setSelectedCountry("Rwanda")}
                                        className={`px-6 py-2 rounded-md font-medium transition-all duration-200 transform hover:scale-105 ${selectedCountry === "Rwanda"
                                            ? "bg-gray-700 text-primary-green shadow-lg"
                                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                            }`}
                                    >
                                        Rwanda
                                    </button>
                                    <button
                                        onClick={() => setSelectedCountry("Burkina Faso")}
                                        className={`px-6 py-2 rounded-md font-medium transition-all duration-200 transform hover:scale-105 ${selectedCountry === "Burkina Faso"
                                            ? "bg-gray-700 text-primary-green shadow-lg"
                                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                            }`}
                                    >
                                        Burkina Faso
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section - 1 column */}
                        <div>
                            {currentData ? (
                                <CountryStats
                                    countryName={currentData.name}
                                    stats={currentData.stats.map(({ value, description }) => ({
                                        value,
                                        label: description,
                                    }))}
                                />
                            ) : (
                                <div className="bg-white rounded-md shadow-lg p-8 sticky top-8 h-fit">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                                        Select a Country
                                    </h3>
                                    <p className="text-gray-600 text-center">
                                        Hover over or click on Rwanda or Burkina Faso to see statistics
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Context */}
                    <div className="mt-12 bg-white py-8">
                        <h3 className="text-2xl font-bold text-primary-orange mb-4">Key Achievements</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {impactData.map((item, index) => (
                                <ImpactCard
                                    key={index}
                                    title={item.title}
                                    description={item.description}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Call to Action */}
                    <section className="px-6 md:px-12 py-20 md:py-32 bg-primary-green text-primary-foreground rounded-md">
                        <div className="max-w-4xl mx-auto text-center">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-balance">Get involved</h2>
                            <p className="text-xl mb-10 opacity-90">
                                Be part of transforming Africa's agricultural and environmental future. Whether you're a professional,
                                entrepreneur, or innovator, there's a role for you.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/contact">
                                    <Button className="bg-primary-foreground text-primary hover:bg-primary-foreground/90">Reach out</Button>
                                </Link>
                                <Link href="/about/who-we-are">
                                    <Button
                                        variant="outline"
                                        className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                                    >
                                        Learn More
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    )
}
