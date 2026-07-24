"use client";

import { useState, useEffect } from "react";
import Africa from "@react-map/africa";
import HeaderBelt from "@/components/layout/headerBelt";
import { motion } from "framer-motion";
import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ImpactCard, impactData } from "@/components/sections/ImpactCard";
import Image from "next/image";

function CountryStats({
  countryName,
  stats,
}: {
  countryName: string;
  stats: readonly { value: string; label: string; description?: string }[];
}) {
  return (
    <div className="bg-white rounded-md shadow-lg p-8 sticky top-8 h-fit border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{countryName}</h3>
      <div className="flex flex-col gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="text-center p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-md border border-blue-100/50"
          >
            <div className="text-3xl font-bold text-green-600 mb-1">{stat.value}</div>
            <div className="font-semibold text-gray-700 text-sm uppercase tracking-wider">
              {stat.label}
            </div>
            {stat.description && (
              <div className="text-gray-500 text-xs mt-1">{stat.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OurImpactContent() {
  // 1. State for the selected country name
  const [selectedCountry, setSelectedCountry] = useState<string | null>("Rwanda");

  // 2. State for the selection color (defaults to blue)
  const [mapSelectColor, setMapSelectColor] = useState<string>("#3b82f6");

  const countryData = {
    Rwanda: {
      name: "Rwanda",
      stats: [
        { value: "25", description: "Alumni" },
        { value: "15", description: "Fellows" },
        { value: "10+", description: "Projects" },
        { value: "10", description: "Partners" },
        { value: "RWF 50M +", description: "Capital Mobilization" },
      ],
    },
    BurkinaFaso: {
      name: "Burkina Faso",
      stats: [
        { value: "5+", description: "Projects" },
        { value: "4", description: "Partners" },
        { value: "XOF 50 +", description: "Capital Mobilization" },
      ],
    },
  } as const;

  // 3. Updated selection handler
  const handleSelect = (name: string | null) => {
    // Check if name exists before proceeding
    if (name === "Rwanda" || name === "BurkinaFaso") {
      setMapSelectColor("#3b82f6");
      setSelectedCountry(name);
    } else {
      // This handles cases where 'name' is null or another country
      setSelectedCountry(name);
    }
  };

  const currentData =
    selectedCountry && selectedCountry in countryData
      ? countryData[selectedCountry as keyof typeof countryData]
      : null;

  return (
    <main className="flex flex-col min-h-screen">
      <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/form.jpg"
            alt="Opportunities"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-black/70 z-0"></div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
          <motion.h1
            className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6 mb-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            OUR IMPACT
          </motion.h1>
          <motion.h2 className="text-white text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight">
            Explore how GanzAfrica is driving transformation across Africa.
          </motion.h2>
        </div>
      </section>

      <HeaderBelt />

      <div className="max-w-7xl mx-auto px-5 mt-20">
        <div className="mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold my-2 leading-tight">
            Our Impact From Agricultural Programs in Africa
          </h1>
          <p className="text-gray-700 leading-relaxed max-w-2xl mb-12">
            Strengthening government capacity and agricultural systems across Africa.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 bg-white p-8 rounded-md shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-full flex justify-center">
                <Africa
                  type="select-single"
                  size={500}
                  // color="#ffff"
                  // selectedValue={selectedCountry || ""}
                  selectColor={mapSelectColor}
                  hoverColor="#eff6ff"
                  onSelect={handleSelect}
                />
              </div>

              <div className="mt-8 flex gap-4 flex-wrap">
                <button
                  onClick={() => handleSelect("Rwanda")}
                  className={`px-8 py-3 rounded-md font-bold transition-all ${
                    selectedCountry === "Rwanda"
                      ? "bg-primary-green text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Rwanda
                </button>
                <button
                  onClick={() => handleSelect("BurkinaFaso")}
                  className={`px-8 py-3 rounded-md font-bold transition-all ${
                    selectedCountry === "BurkinaFaso"
                      ? "bg-primary-green text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Burkina Faso
                </button>
              </div>
            </div>

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
                <div className="bg-white rounded-md shadow-lg p-8 sticky top-8 h-fit text-center border-2 border-dashed border-gray-200">
                  <h3 className="text-xl font-bold text-gray-400">Oops !</h3>
                  <p className="text-gray-400 mt-2">Weren't started working in this region.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-20">
            <h3 className="text-2xl font-bold text-primary-orange mb-6">Key Achievements</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {impactData.map((item, index) => (
                <ImpactCard key={index} title={item.title} description={item.description} />
              ))}
            </div>
          </div>

          <section className="mt-20 px-6 md:px-12 py-20 bg-primary-green text-white rounded-md text-center">
            <h2 className="text-4xl font-bold mb-6">Get involved</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact">
                <Button className="bg-white text-green-700 hover:bg-gray-100">Reach out</Button>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
