"use client";

import { 
  Database,
  Leaf,
  Laptop,
  Scale,
  Lightbulb,
  Rocket,
  Target,
  GraduationCap,
  Filter,
  ArrowUpRight,
} from "lucide-react";
import { OpportunityCard } from "@/components/layout/OpportunityCard";
import { useState } from "react";
import HeaderBelt from "@/components/layout/headerBelt";
import { motion } from "framer-motion";
import Image from "next/image";

type Status = "Open" | "Closed";
type OpportunityType = "all" | "fellowship" | "role";

interface FellowshipProgram {
  id: string;
  title: string;
  status: Status;
  description: string;
  duration: string;
  location: string;
  requirements: string[];
  icon: React.ReactNode;
  color: string;
  startDate: string;
  endDate: string;
}

interface GanzAfricaRole {
  id: string;
  title: string;
  status: Status;
  description: string;
  type: string;
  location: string;
  requirements: string[];
  icon: React.ReactNode;
  color: string;
  startDate: string;
  endDate: string;
}

const styles = `
  @keyframes fade-in {
    0% { opacity: 0; }
    100% { opacity: 1; }
  }
  
  @keyframes slide-up {
    0% { transform: translateY(20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  
  .animate-fade-in {
    animation: fade-in 1s ease-out;
  }
  
  .animate-slide-up {
    animation: slide-up 1s ease-out;
  }
`;

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

export default function OpportunitiesPage() {
  const [selectedStatus, setSelectedStatus] = useState<Status | "all">("all");
  const [selectedType, setSelectedType] = useState<OpportunityType>("all");

  const fellowshipPrograms: FellowshipProgram[] = [
    {
      id: "data-analytics",
      title: "Data Analytics Fellow",
      status: "Open",
      description: "Join our team of data experts working on transforming African food systems through evidence-based insights. You'll work with cutting-edge tools and methodologies to analyze complex datasets and drive policy decisions.",
      duration: "12 months",
      location: "Remote with occasional in-person meetings",
      requirements: [
        "Strong analytical and quantitative skills",
        "Experience with data visualization tools",
        "Knowledge of statistical analysis",
        "Passion for food systems transformation"
      ],
      icon: <Database className="w-6 h-6" />,
      color: "#045f3c",
      startDate: "2024-05-01",
      endDate: "2024-05-30"
    },
    {
      id: "sustainable-land",
      title: "Sustainable Land Use Fellow",
      status: "Closed",
      description: "Work at the intersection of agriculture, environment, and policy to develop sustainable land use practices. This role focuses on creating solutions that balance productivity with environmental conservation.",
      duration: "12 months",
      location: "Remote with field visits",
      requirements: [
        "Background in environmental science or agriculture",
        "Understanding of land use policies",
        "Field research experience",
        "Strong communication skills"
      ],
      icon: <Leaf className="w-6 h-6" />,
      color: "#7EED42",
      startDate: "2024-05-15",
      endDate: "2024-06-15"
    },
    {
      id: "digital-systems",
      title: "Digital Systems Fellow",
      status: "Open",
      description: "Drive digital transformation in African food systems by developing and implementing innovative digital solutions. This role combines technical expertise with systems thinking to create scalable impact.",
      duration: "12 months",
      location: "Remote",
      requirements: [
        "Software development experience",
        "Understanding of digital agriculture",
        "Systems thinking approach",
        "Project management skills"
      ],
      icon: <Laptop className="w-6 h-6" />,
      color: "#F8B712",
      startDate: "2024-06-01",
      endDate: "2024-06-30"
    }
  ];

  const ganzAfricaRoles: GanzAfricaRole[] = [
    {
      id: "innovation-lead",
      title: "Innovation & Impact Lead",
      status: "Open",
      description: "Lead our innovation initiatives and drive the development of new solutions for African food systems. This role combines strategic thinking with hands-on implementation to create lasting impact.",
      type: "Full-time",
      location: "Remote",
      requirements: [
        "5+ years in innovation management",
        "Experience in food systems",
        "Strong leadership skills",
        "Strategic planning expertise"
      ],
      icon: <Lightbulb className="w-6 h-6" />,
      color: "#F8B712",
      startDate: "2024-05-01",
      endDate: "2024-05-30"
    },
    {
      id: "growth-manager",
      title: "Growth & Partnerships Manager",
      status: "Closed",
      description: "Drive organizational growth through strategic partnerships and business development. This role focuses on expanding our impact through collaboration with key stakeholders across the continent.",
      type: "Full-time",
      location: "Remote",
      requirements: [
        "Partnership development experience",
        "Business development skills",
        "Strong network in Africa",
        "Strategic thinking"
      ],
      icon: <Rocket className="w-6 h-6" />,
      color: "#045f3c",
      startDate: "2024-05-15",
      endDate: "2024-06-15"
    }
  ];

  const filteredFellowshipPrograms = fellowshipPrograms.filter(program => 
    (selectedStatus === "all" || program.status === selectedStatus) &&
    (selectedType === "all" || selectedType === "fellowship")
  );

  const filteredGanzAfricaRoles = ganzAfricaRoles.filter(role => 
    (selectedStatus === "all" || role.status === selectedStatus) &&
    (selectedType === "all" || selectedType === "role")
  );

  return (
    <main className="min-h-screen bg-white font-rubik">
      <style jsx global>{styles}</style>
      {/* Hero Section */}
      <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/opportunities.jpg"
            alt="Opportunities"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/70 z-10"></div>

        {/* Content */}
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center items-center text-center z-20">
          <motion.h2
            className="text-white text-2xl sm:text-3xl md:text-4xl mb-2 leading-tight"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Be part of a <span className="text-yellow-400 font-bold">dynamic team</span> driving innovation
          </motion.h2>
          <motion.h1
            className="text-yellow-400 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            OPPORTUNITIES
          </motion.h1>
        </div>
      </section>

      {/* Moving Text Belt */}
      <HeaderBelt />

      {/* Content with standard page margins */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4 shrink-0">
            <div className="bg-white rounded-xl p-4 sticky top-4">
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Filter by Status</h4>
                  <div className="flex flex-col gap-2">
                    {["all", "Open", "Closed"].map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStatus(status as Status | "all")}
                        className={`px-4 py-1.5 rounded-full border text-sm transition-all ${
                          selectedStatus === status
                            ? "border-[#045f3c] bg-[#045f3c]/10 text-[#045f3c] font-medium"
                            : "border-gray-200 hover:border-[#045f3c] hover:bg-[#045f3c]/5 text-gray-600 hover:text-[#045f3c]"
                        }`}
                      >
                        {status === "all" ? "All" : status}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-800 mb-3">Filter by Type</h4>
                  <div className="flex flex-col gap-2">
                    {["all", "fellowship", "role"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setSelectedType(type as OpportunityType)}
                        className={`px-4 py-1.5 rounded-full border text-sm transition-all ${
                          selectedType === type
                            ? "border-[#045f3c] bg-[#045f3c]/10 text-[#045f3c] font-medium"
                            : "border-gray-200 hover:border-[#045f3c] hover:bg-[#045f3c]/5 text-gray-600 hover:text-[#045f3c]"
                        }`}
                      >
                        {type === "all" 
                          ? "All Types" 
                          : type === "fellowship" 
                            ? "Fellowship Programs" 
                            : "GanzAfrica Roles"}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Fellowship Programs Section */}
            {filteredFellowshipPrograms.length > 0 && (
              <section id="fellowship" className="mb-16">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold">
                    <span className="text-black">Fellowship </span>
                    <span className="text-[#045f3c]">Programs</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {filteredFellowshipPrograms.map((program) => (
                    <OpportunityCard
                      key={program.id}
                      title={program.title}
                      status={program.status}
                      description={program.description}
                      icon={program.icon}
                      color={program.color}
                      requirements={program.requirements}
                      type="fellowship"
                      duration={program.duration}
                      location={program.location}
                      startDate={program.startDate}
                      endDate={program.endDate}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* GanzAfrica Roles Section */}
            {filteredGanzAfricaRoles.length > 0 && (
              <section id="roles">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold">
                    <span className="text-black">GanzAfrica </span>
                    <span className="text-[#045f3c]">Open Roles</span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {filteredGanzAfricaRoles.map((role) => (
                    <OpportunityCard
                      key={role.id}
                      title={role.title}
                      status={role.status}
                      description={role.description}
                      icon={role.icon}
                      color={role.color}
                      requirements={role.requirements}
                      type="role"
                      location={role.location}
                      employmentType={role.type}
                      startDate={role.startDate}
                      endDate={role.endDate}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}