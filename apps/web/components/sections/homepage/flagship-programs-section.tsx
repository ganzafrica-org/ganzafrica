"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { DecoratedHeading } from "@/components/layout/headertext";
import { trackEvent } from "@/components/analytics/google-analytics";

interface Program {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  date?: string;
  iconColor: string;
  icon: React.ReactNode; // Added icon property
}

interface FlagshipProgramsSectionProps {
  locale: string;
  dict: any;
}

export default function FlagshipProgramsSection({
                                                  locale,
                                                  dict,
                                                }: FlagshipProgramsSectionProps) {
  // Define SVG icons for each program
  const FellowshipIcon = () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 11.5C14.7614 11.5 17 9.26142 17 6.5C17 3.73858 14.7614 1.5 12 1.5C9.23858 1.5 7 3.73858 7 6.5C7 9.26142 9.23858 11.5 12 11.5Z" fill="white"/>
        <path d="M17 15.6C17 13.2 14.8 11.3 12 11.3C9.2 11.3 7 13.2 7 15.6V22.5H17V15.6Z" fill="white"/>
        <path d="M22.6 11.3C24.5 11.3 24.5 8.8 22.6 8.8C22.1 8.8 21.7 9.2 21.7 9.7V10.4C21.7 10.9 22.1 11.3 22.6 11.3Z" fill="white"/>
        <path d="M19.5 9.7C19.5 8.6 19.1 7.5 18.2 6.7C19.2 8.3 19 10.3 17.7 11.6L16.9 12.4C17.9 12.9 18.9 13.6 19.5 14.7V22.5H20.6C21.1 22.5 21.5 22.1 21.5 21.6V15.1C21.5 14 21 12.9 20.1 12.1C19.6 11.7 19.5 11 19.5 10.3V9.7Z" fill="white"/>
        <path d="M5.8 10.4V9.7C5.8 9.2 5.4 8.8 4.9 8.8C3 8.8 3 11.3 4.9 11.3C5.4 11.3 5.8 10.9 5.8 10.4Z" fill="white"/>
        <path d="M5.8 9.7V10.3C5.8 11 5.7 11.7 5.2 12.1C4.3 12.9 3.8 14 3.8 15.1V21.6C3.8 22.1 4.2 22.5 4.7 22.5H5.8V14.7C6.4 13.6 7.4 12.9 8.4 12.4L7.6 11.6C6.3 10.3 6.1 8.3 7.1 6.7C6.2 7.5 5.8 8.6 5.8 9.7Z" fill="white"/>
      </svg>
  );

  const AlumniIcon = () => (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L3 7L12 12L21 7L12 2Z" fill="white"/>
        <path d="M3 12L5 13.1V17.4C5 17.4 8.5 19.9 12 19.9C15.5 19.9 19 17.4 19 17.4V13.1L21 12" fill="white"/>
        <path d="M3 17L5 18.1V21.1L7.5 22.5L10 21.1V19.1L7.5 20.5L5 19.1" fill="white"/>
      </svg>
  );

  // Get programs from dictionary or use defaults
  const programs: Program[] = [
    {
      id: "fellowship",
      title: dict?.programs?.fellowship?.title || "Fellowship Program",
      description:
          dict?.programs?.fellowship?.description ||
          "Our fellowship program provides young leaders with the skills and opportunities to drive sustainable change in their communities across Africa. This immersive experience helps develop essential leadership qualities and technical expertise.",
      image: "/images/amiteam.jpg",
      link: `/${locale}/programs/fellowship`,
      date: "Year-round",
      iconColor: "#073392", // primary-blue
      icon: <FellowshipIcon />
    },
    {
      id: "alumni",
      title: dict?.programs?.alumni?.title || "Alumni Program",
      description:
          dict?.programs?.alumni?.description ||
          "Building a network of skilled professionals driving Africa's transformation in land, agriculture, and environment. Our alumni continue to innovate, lead, and create positive change across the continent.",
      image: "/images/alumni_program.jpg",
      link: `/${locale}/programs/alumni`,
      date: "Year-round",
      iconColor: "#F8B712", // primary-orange equivalent
      icon: <AlumniIcon />
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
                      {/* Replaced colored div with SVG icon */}
                      <span
                          style={{
                            position: 'absolute',
                            top: '50%',
                            right: '0',
                            transform: 'translateY(-50%)',
                            width: '35px',
                            height: '35px',
                            backgroundColor: program.iconColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '4px'
                          }}
                      >
                    {program.icon}
                  </span>
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
                        className="card-details text-[#073392]"
                        onClick={() => trackEvent('program_link_click', {
                          program_name: program.title,
                          program_id: program.id,
                          source_page: 'homepage'
                        })}
                    >
                      {dict?.cta?.learn_more || "Learn More"}
                    </Link>
                  </div>
                </article>
            ))}
          </div>
        </div>

        {/* Inline styles for hover effects */}
        <style>{`
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