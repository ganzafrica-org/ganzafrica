"use client";

import { Button } from "@ui/button";
import { AlumniCard } from "@/components/layout/AlumniCard";
import { Badge } from "@ui/badge";
import { 
  PlayCircle, 
  ArrowRight, 
  CheckCircle2, 
  Users, 
  Briefcase, 
  Calendar,
  Sprout,
  TreePine,
  Cloud,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { default as HeaderBelt } from "@/components/layout/headerBelt";



export default function Home() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [animateFirst, setAnimateFirst] = useState(false);
  const [animateSecond, setAnimateSecond] = useState(false);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const scrollContent = scrollElement.children[0];
    if (!scrollContent) return;
    
    const scrollWidth = scrollContent.scrollWidth;
    let scrollPos = 0;

    const animate = () => {
      scrollPos = (scrollPos + 1) % scrollWidth;
      scrollElement.scrollLeft = scrollPos;
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Cleanup if needed
    };
  }, []);

  // Quote animation effect
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimateFirst(true);
      setTimeout(() => {
        setAnimateSecond(true);
        setTimeout(() => {
          setAnimateFirst(false);
          setAnimateSecond(false);
        }, 300);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="min-h-screen bg-white font-rubik">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <img
          src="/images/leaf.jpg"
          alt="Background Pattern"
          className="w-full h-full object-cover opacity-[0.08]"
        />
      </div>

      {/* Hero Section - Full width */}
      <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        <div className="absolute inset-0 bg-black/70">
          <video 
            autoPlay 
            muted 
            loop 
            playsInline
            className="w-full h-full object-cover mix-blend-overlay"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
        </div>

        
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
        <h2
            className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6 mb-8"
          >
            ALUMNI NETWORK
          </h2>
          <h1
            className="text-white text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight"
          >
            A lifetime of <span className="font-normal">Connections</span>, Opportunities <span className="font-normal">and</span> <br/>
            Impact
          </h1>
        
        </div>
      </section>

      {/* Categories Bar - Full width */}
       <div className="flex justify-center">
               <HeaderBelt />
             </div>

      {/* Content with standard page margins */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Mission Section */}
        <section className="py-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="rounded-full overflow-hidden aspect-square border-8 border-[#F8B712] shadow-xl bg-white">
                <img
                  src="/images/launch event.jpg"
                  alt="Mission"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="absolute -bottom-8 -left-4 w-52 h-52 rounded-full overflow-hidden border-8 border-[#F8B712] shadow-lg bg-white">
                <img
                  src="/images/Happy fellows.jpg"
                  alt="Mission Detail"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-6">
                <span className="text-black">Mission </span>
                <span className="text-[#045f3c]">Statement</span>
              </h2>
              <p className="text-base text-gray-700 mb-6">
                Welcome to the GanzAfrica Alumni Network, a platform dedicated to creating strong bonds among young African professionals. Our goal is to foster trust, collaboration, and a vibrant exchange of ideas to shape sustainable and transformative solutions for Africa.
              </p>
              <p className="italic text-lg text-black font-medium mb-6 border-l-4 border-[#045f3c] pl-4">
                "To cultivate a vibrant alumni community that drives the transformation of African food systems through evidence-based insights, mentorship, and collaboration—empowering current fellows and fostering partnerships that create lasting opportunities for sustainable impact."
              </p>
              <div className="flex gap-8">
                {["Knowledge Sharing", "Mentorship", "Collaboration and Networking"].map((principle, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full text-primary-orange" />
                    <span className="text-base text-black font-medium">{principle}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AlumniCard className="bg-gradient-to-br from-[#073392] to-[#052a6b] text-white p-4 transform hover:scale-105 transition-transform duration-300 rounded-lg shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#0849a8] rounded-full -translate-y-14 translate-x-14 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#0849a8] rounded-full translate-y-12 -translate-x-12 opacity-60"></div>
                <div className="flex flex-col items-center relative z-10">
                  <div className="bg-white/10 p-2 rounded-full mb-2">
                    <Users className="w-6 h-6" />
                  </div>
                  <h3 className="text-base mb-2 font-medium">Transitioned Fellows</h3>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">27</p>
                </div>
              </AlumniCard>

              <AlumniCard className="bg-gradient-to-br from-[#005c3d] to-[#004532] text-white p-4 transform hover:scale-105 transition-transform duration-300 rounded-lg shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#006b47] rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#00a15d] rounded-full translate-y-12 -translate-x-12 opacity-40"></div>
                <div className="flex flex-col items-center relative z-10">
                  <div className="bg-white/10 p-2 rounded-full mb-2">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <h3 className="text-base mb-2 font-medium">Alumni Projects</h3>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">12+</p>
                </div>
              </AlumniCard>

              <AlumniCard className="bg-gradient-to-bl from-[#f8b712] to-[#d49a0f] text-black p-4 transform hover:scale-105 transition-transform duration-300 rounded-lg shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 w-28 h-28 bg-[#fcc332] rounded-full -translate-y-14 translate-x-14 opacity-50"></div>
                <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#ffdb4d] rounded-full translate-y-14 -translate-x-14 opacity-40"></div>
                <div className="flex flex-col items-center relative z-10">
                  <div className="bg-black/10 p-2 rounded-full mb-2">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h3 className="text-base mb-2 font-medium">Events</h3>
                  <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-black to-black/80">5+</p>
                </div>
              </AlumniCard>
            </div>
          </div>
        </section>

        {/* Purpose Section */}
        <section className="py-8 relative">
          <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-8 right-8 bg-gradient-to-br from-[#F8B712] to-[#E6A610] text-black px-6 py-4 rounded-xl shadow-2xl transform -rotate-1 z-20 border-2 border-white/20">
                <div className="relative">
                  <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[12px] border-r-[12px] border-t-[12px] border-l-transparent border-r-transparent border-t-[#F8B712]"></div>
                  <p className="text-lg font-semibold relative z-10 whitespace-nowrap leading-tight">
                    "<span className={`transition-all duration-500 ${animateFirst ? 'scale-105 text-blue-700 font-bold' : 'scale-100'}`}>Once a GanzAfrica's Fellow!</span> <span className={`transition-all duration-500 ${animateSecond ? 'scale-105 text-green-700 font-bold' : 'scale-100'}`}>Always a Changemaker...</span>"
                  </p>
                </div>
              </div>
              <img
                src="/images/form.jpg"
                alt="Purpose"
                className="rounded-lg shadow-xl relative z-10"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold mb-8">
                <span className="text-black">Purpose of the </span>
                <span className="text-[#045f3c]">Alumni Network</span>
              </h2>
              <div className="space-y-8">
                {[
                  {
                    title: "Networking and Professional Development",
                    description: "Enhancing professional connections among analysts, across industries and geographies, to share opportunities and professional advice.",
                    color: "#045f3c"
                  },
                  {
                    title: "Knowledge Sharing",
                    description: "Serve as a platform for sharing diverse experiences, skills and expertise among analysts in their different sectors and workstreams.",
                    color: "#009758"
                  },
                  {
                    title: "Investing Back into the Fellowship Program",
                    description: "Providing a mechanism and pipeline for transitioned young analysts to invest into the training of successive cohorts of fellows.",
                    color: "#7EED42"
                  },
                  {
                    title: "Co-creating and Co-implementing Solutions",
                    description: "Encouraging and facilitating the collaboration, co-creation and co-implementation of solutions to major challenges in data and evidence generation and synthesis for policy impact.",
                    color: "#F8B712"
                  },
                  {
                    title: "Championing Data and Evidence Use",
                    description: "Shaping and ingraining a collective vision and agenda to drive a culture of data and evidence use in policy and decision-making to accelerate inclusive agri-food systems transformation.",
                    color: "#D8D413"
                  }
                ].map((item, index, arr) => (
                  <div key={index} className="relative">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-6 h-6 flex-shrink-0" style={{ color: item.color }} />
                      <div>
                        <h3 className="text-lg font-bold text-[#045f3c] mb-1">{item.title}</h3>
                        <p className="text-gray-600 text-base">{item.description}</p>
                      </div>
                    </div>
                    {index < arr.length - 1 && (
                      <div className="absolute left-3 top-8 bottom-0 border-l-2 border-dotted border-black opacity-20 h-12"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-20 relative">
          {/* Simple, elegant header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl font-light mb-6">
              <span className="text-gray-800">Alumni </span>
              <span className="text-[#045f3c] font-medium">Impact</span>
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-[#073392] via-[#005c3d] to-[#f8b712] mx-auto rounded-full"></div>
          </div>

          {/* Creative card layout */}
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {[
                {
                  title: "Land Governance",
                  description: "Equitable land administration systems that strengthen tenure security and promote sustainable use",
                  icon: <TreePine className="w-12 h-12" />,
                  color: "#073392",
                  lightColor: "#e8f0ff"
                },
                {
                  title: "Sustainable Agriculture",
                  description: "Agricultural policies balancing productivity with environmental stewardship and social inclusion",
                  icon: <Sprout className="w-12 h-12" />,
                  color: "#005c3d",
                  lightColor: "#e8f5f0"
                },
                {
                  title: "Climate Adaptation",
                  description: "Climate resilience strategies helping communities adapt to changing environmental conditions",
                  icon: <Cloud className="w-12 h-12" />,
                  color: "#f8b712",
                  lightColor: "#fff8e1"
                }
              ].map((project, index) => (
                <div key={index} className="group cursor-pointer">
                  {/* Minimalist card design */}
                  <div className="bg-white rounded-3xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
                    {/* Icon and title on same line */}
                    <div className="flex items-center gap-4 mb-6">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                        style={{ backgroundColor: project.lightColor }}
                      >
                        <div style={{ color: project.color }}>
                          <div className="w-6 h-6">
                            {React.cloneElement(project.icon, { className: 'w-6 h-6' })}
                          </div>
                        </div>
                      </div>
                      <h3 className="text-xl font-semibold text-gray-800 group-hover:text-gray-900 transition-colors">
                        {project.title}
                      </h3>
                    </div>
                    
                    {/* Creative accent line */}
                    <div 
                      className="h-1 w-12 rounded-full transition-all duration-300 group-hover:w-full mb-4"
                      style={{ backgroundColor: project.color }}
                    ></div>
                    
                    <p className="text-gray-600 leading-relaxed mb-6 group-hover:text-gray-700 transition-colors">
                      {project.description}
                    </p>

                    {/* Subtle call-to-action */}
                    <div className="flex items-center text-sm font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <span style={{ color: project.color }}>Explore Projects</span>
                      <ArrowRight className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" style={{ color: project.color }} />
                    </div>
                  </div>

                  {/* Creative connecting element */}
                  {index < 2 && (
                    <div className="hidden lg:block absolute left-full top-1/2 transform -translate-y-1/2 translate-x-4 w-8 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Compact CTA button on right */}
          <div className="flex justify-end mt-12">
            <button className="group relative inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#045f3c] text-[#045f3c] rounded-full hover:bg-[#045f3c] hover:text-white transition-all duration-300 font-medium text-sm shadow-md hover:shadow-lg">
              <span>View All Projects</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
              
              {/* Creative hover effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#073392] via-[#005c3d] to-[#f8b712] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
            </button>
          </div>
        </section>

        {/* Events Section */}
        <section className="py-8 bg-gray-50 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold">
                <span className="text-black">Alumni </span>
                <span className="text-[#045f3c]">Events</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  id: "official-launch",
                  date: "April 4, 2025",
                  type: "Events",
                  title: "Official Launch of GA Alumni Network",
                  image: "/images/launch event.jpg"
                },
                {
                  id: "lead-intentionally",
                  date: "July 12, 2025",
                  type: "Workshop",
                  title: "Lead Intentionally: Creating Impact in All Spaces",
                  image: "/images/Sustainable Agriculture Fellows(1).jpg"
                },
                {
                  id: "power-of-networks",
                  date: "May 12, 2025",
                  type: "Webinar",
                  title: "The Power of Networks: Turning Connections",
                  image: "/images/Sustainable Land Use Fellows.jpg"
                }
              ].map((event, index) => (
                <Link 
                  key={index} 
                  href={`/programs/one-event/${event.id}`} 
                  className="block transform hover:scale-105 transition-transform duration-300"
                >
                  <AlumniCard className="overflow-hidden border-2 border-[#045f3c] group cursor-pointer h-full">
                    <div className="relative h-48">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute bottom-3 left-3 flex items-center gap-3">
                        <Badge className="bg-white text-black text-base px-3 py-1 group-hover:bg-[#F8B712] transition-colors duration-300">{event.date}</Badge>
                        <Badge className="bg-[#045f3c] text-white text-base px-3 py-1 group-hover:bg-[#F8B712] group-hover:text-black transition-colors duration-300">{event.type}</Badge>
                      </div>
                      <Button 
                        size="icon" 
                        className="absolute bottom-3 right-3 rounded-full bg-[#F8B712] hover:bg-[#045f3c] hover:text-white w-10 h-10 transition-colors duration-300"
                      >
                        <ArrowRight className="w-5 h-5" />
                      </Button>
                    </div>
                    <div className="p-5 group-hover:bg-[#045f3c] transition-colors duration-300">
                      <h3 className="font-bold text-lg mb-2 group-hover:text-white transition-colors duration-300 line-clamp-2">{event.title}</h3>
                      <p className="text-gray-600 text-sm group-hover:text-white/80 transition-colors duration-300">
                        Young professionals are at the forefront of accelerating CAADP implementation...
                      </p>
                    </div>
                  </AlumniCard>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}