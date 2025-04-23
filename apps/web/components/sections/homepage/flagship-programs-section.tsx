"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DecoratedHeading } from "@/components/layout/headertext";

interface Program {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  date?: string;
  iconColor: string;
}

interface FlagshipProgramsSectionProps {
  locale: string;
  dict: any;
}

export default function FlagshipProgramsSection({
                                                  locale,
                                                  dict,
                                                }: FlagshipProgramsSectionProps) {
  // Get programs from dictionary or use defaults
  const programs: Program[] = [
    {
      id: "fellowship",
      title: dict?.programs?.fellowship?.title || "Fellowship Program",
      description:
          dict?.programs?.fellowship?.description ||
          "Our fellowship program provides young leaders with the skills and opportunities to drive sustainable change in their communities across Africa. This immersive experience helps develop essential leadership qualities and technical expertise.",
      image: "/images/ganzafrica-fellows.jpg",
      link: `/${locale}/programs/fellowship`,
      date: "Year-round",
      iconColor: "#4e958b" // primary-green equivalent
    },
    {
      id: "alumni",
      title: dict?.programs?.alumni?.title || "Alumni Program",
      description:
          dict?.programs?.alumni?.description ||
          "Building a network of skilled professionals driving Africa's transformation in land, agriculture, and environment. Our alumni continue to innovate, lead, and create positive change across the continent.",
      image: "/images/ganzafrica-fellows.jpg",
      link: `/${locale}/programs/alumni`,
      date: "Year-round",
      iconColor: "#C32361" // primary-orange equivalent
    },
  ];

  return (
      <section className="flagship-programs-section py-16 md:py-24 bg-white relative border-t border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <DecoratedHeading
                firstText={dict?.programs?.flagship_heading_first || "Our Flagship"}
                secondText={dict?.programs?.flagship_heading_second || "Programs"}
                className="mx-auto"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {programs.map((program) => (
                <article
                    key={program.id}
                    style={{
                      position: 'relative',
                      width: '350px',
                      height: '350px',
                      borderRadius: '3px',
                      boxShadow: '0 1px 4px rgba(0, 0, 0, 0.3)',
                      overflow: 'hidden',
                      margin: '1rem'
                    }}
                >
                  <div
                      style={{
                        width: 'auto',
                        height: '260px',
                        backgroundImage: `url(${program.image})`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        backgroundSize: 'cover',
                        borderRadius: '3px'
                      }}
                  ></div>
                  <div
                      style={{
                        width: 'auto',
                        height: '350px',
                        position: 'relative',
                        padding: '14px 24px',
                        background: 'white',
                        transition: '0.4s cubic-bezier(.17,.67,.5,1.03) 0.15s'
                      }}
                      className="card-infos" // For hover target
                  >
                    <h2
                        style={{
                          position: 'relative',
                          margin: '10px 0',
                          letterSpacing: '3px',
                          color: '#152536',
                          fontWeight: 'bold',
                          fontSize: '1rem',
                          textShadow: '0 0 0px rgba(21, 37, 54, 0.2)'
                        }}
                    >
                      {program.title}
                      <span
                          style={{
                            position: 'absolute',
                            top: '50%',
                            right: '0',
                            transform: 'translateY(-50%)',
                            width: '35px',
                            height: '23px',
                            backgroundColor: program.iconColor,
                            backgroundSize: '100% auto',
                            display: 'inline-block'
                          }}
                      ></span>
                    </h2>
                    <h3
                        style={{
                          marginBottom: '10px',
                          fontSize: '0.85rem',
                          color: 'rgba(21, 37, 54, 0.7)'
                        }}
                    >
                      {program.date || "Featured Program"}
                    </h3>
                    <p
                        style={{
                          lineHeight: '2',
                          fontSize: '0.95rem',
                          color: 'rgba(21, 37, 54, 0.7)',
                          opacity: 1,
                          transition: '0.5s cubic-bezier(.17,.67,.5,1.03) 0.25s'
                        }}
                        className="card-txt" // For hover target
                    >
                      {program.description}
                    </p>
                    <Link
                        href={program.link}
                        style={{
                          position: 'absolute',
                          left: '0',
                          bottom: '0',
                          margin: '10px 0',
                          padding: '20px 24px',
                          letterSpacing: '1px',
                          fontWeight: 'bold',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          opacity: 1,
                          transition: '0.5s cubic-bezier(.17,.67,.5,1.03) 0.25s',
                          textDecoration: 'none'
                        }}
                        className="card-details text-primary-green" // For hover target
                    >
                      {dict?.cta?.learn_more || "Learn More"}
                    </Link>
                  </div>
                </article>
            ))}
          </div>
        </div>

        {/* Inline styles for hover effects */}
        <style jsx>{`
        article:hover .card-infos {
          transform: translateY(-260px);
        }
        
        article:hover .card-seats,
        article:hover .card-txt,
        article:hover .card-details {
          opacity: 1;
        }
      `}</style>
      </section>
  );
}