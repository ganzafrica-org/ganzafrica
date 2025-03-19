// app/[locale]/climate-adaptation/page.tsx
import { getDictionary } from "@/lib/get-dictionary";
import Image from "next/image";
import {
  BiLeaf,
  BiLineChart,
  BiGroup,
  BiBookOpen,
  BiSearch,
  BiWorld,
} from "react-icons/bi";
import LanguageSwitcher from "@/components/layout/language-switcher";
import { FC } from "react";
import { DecoratedHeading } from "@/components/layout/headertext";
import CategoriesBanner from "@/components/layout/headerBanner";
import { Card, CardContent } from "@workspace/ui/components/card";

// Types for props
interface ApproachCardProps {
  title: string;
  content: string;
  iconBgColor: string;
  icon: React.ReactNode;
  isOutlined?: boolean;
  textColor?: string;
}

interface FocusAreaCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface StakeholderCardProps {
  type: "farmers" | "institutions" | "valuechain";
  title: string;
  description: string;
}

interface PageProps {
  params: { locale: string };
}

// Reusable Components
const ApproachCard: FC<ApproachCardProps> = ({
  title,
  content,
  iconBgColor,
  icon,
  isOutlined = false,
  textColor = "text-gray-700",
}) => (
  <div
    className={`${isOutlined ? "border-2 border-green-700 bg-white" : "bg-gray-50"} rounded-lg p-6 h-full flex flex-col`}
  >
    <div className="flex items-center mb-4">
      <div
        className={`${iconBgColor} w-12 h-12 rounded-full flex items-center justify-center mr-4`}
      >
        {icon}
      </div>
      <h3
        className={`text-xl font-bold ${title.includes("Data-Driven") ? "text-yellow-500" : title.includes("Community") ? "text-white" : "text-green-700"}`}
      >
        {title}
      </h3>
    </div>
    <p className={textColor}>{content}</p>
  </div>
);

const FocusAreaCard: FC<FocusAreaCardProps> = ({
  title,
  description,
  icon,
}) => (
  <div className="bg-text-gray rounded-3xl shadow-sm p-8 h-full flex flex-col relative overflow-hidden border border-gray">
    {/* Icon at the top - centered */}
    <div className="flex justify-center mb-4">
      <div className="text-yellow-500">{icon}</div>
    </div>
    
    {/* Content */}
    <div className="text-center">
      <h3 className="text-2xl font-bold text-black mb-4">{title}</h3>
      <p className="text-gray-700 text-center mb-8">{description}</p>
    </div>
    
    {/* Yellow Bar at Bottom - centered, not full width */}
    <div className="absolute bottom-0 left-1/4 right-1/4 h-2 bg-yellow-400 rounded-full"></div>
  </div>
);

export default async function ClimateAdaptationPage({
  params: { locale },
}: PageProps) {
  const dict = await getDictionary(locale);

  // Focus areas data - Arranged to match the desired layout
  const focusAreas = [
    {
      title: "Soil Health & Crop Suitability",
      description:
        "Conducting soil analysis and crop suitability assessments to optimize land use and promote sustainable agricultural production.",
      icon: <BiLeaf className="h-8 w-8" />,
    },
    {
      title: "Sustainable Land Management",
      description:
        "Implementing climate-smart land management practices to prevent soil degradation and enhance agricultural resilience.",
      icon: <BiLeaf className="h-8 w-8" />,
    },
    {
      title: "Sustainable Land Management",
      description:
        "Implementing climate-smart land management practices to prevent soil degradation and enhance agricultural resilience.",
      icon: <BiLeaf className="h-8 w-8" />,
    },
    {
      title: "Search Policy & GIS Mapping",
      description:
        "Utilizing advanced geographic information systems to identify climate vulnerability hotspots, model future scenarios, and develop evidence-based adaptation policies that strengthen regional agricultural planning and food security.",
      icon: <BiSearch className="h-8 w-8" />,
    },
    {
      title: "Community Engagement & Information Sharing",
      description:
        "Facilitating knowledge exchange networks, farmer field schools, and collaborative learning platforms that bridge scientific research with traditional farming wisdom to create locally appropriate climate adaptation solutions.",
      icon: <BiGroup className="h-8 w-8" />,
    },
  ];

  // Stakeholders data
  const stakeholders = [
    {
      type: "farmers" as const,
      title: "Farmers & Cooperatives",
      description: "Direct beneficiaries gaining practical skills in climate-smart agriculture techniques, resilient crop varieties, and sustainable resource management to secure livelihoods in changing conditions.",
    },
    {
      type: "institutions" as const,
      title: "Public Institutions",
      description: "Government agencies and research organizations strengthening climate adaptation governance frameworks and developing evidence-based policies that support agricultural sector transformation.",
    },
    {
      type: "valuechain" as const,
      title: "Value Chain Actors",
      description: "Agri-dealers, processors, and market intermediaries building climate-resilient supply chains and distribution networks to ensure stable food systems despite increasing climate disruptions.",
    },
  ];

  return (
    <main className="flex flex-col min-h-screen">
      {/* Language Switcher */}
      <div className="flex justify-end p-4">
        <LanguageSwitcher />
      </div>

      {/* Hero Section */}
      <section className="relative bg-green-800 h-96">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/tractor-field.jpg"
            alt="Agricultural field with tractor"
            fill
            priority
            className="object-cover opacity-60"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-green-800 to-green-700 opacity-40"></div>
        <div className="container mx-auto px-4 h-full flex flex-col justify-center relative z-10">
          <h2 className="text-white text-2xl font-medium mb-2">
            Rooted in <span className="font-bold">Excellence</span>,
          </h2>
          <h2 className="text-white text-2xl font-medium mb-6">
            Growing with <span className="font-bold">Agriculture</span>
          </h2>
          <h1 className="text-yellow-400 text-5xl font-bold tracking-wider">
            CLIMATE ADAPTATION
          </h1>
        </div>
      </section>

      {/* Categories Banner */}
      <div className="bg-yellow-400 py-4">
        <div className="container mx-auto">
          <ul className="flex flex-wrap justify-center space-x-8">
            {/* Removed categories array as requested */}
          </ul>
        </div>
      </div>

      {/* Title Section */}
      <section className="py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-10">
            <DecoratedHeading
              firstText="Building Climate Resilience in"
              secondText="Agriculture"
            />
          </div>
        </div>
      </section>
      {/* Content Section with Equal Heights */}
      <section className="py-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          {/* Text Content */}
          <div className="flex flex-col justify-center space-y-6">
            <p className="text-gray-800 leading-relaxed">
              At GanzAfrica, we are committed to enhancing local resilience to
              climate change through a data-driven, community-centered, and
              impact-oriented approach. Our initiative integrates cutting-edge scientific
              research, time-honored traditional knowledge, and innovative technologies to
              develop sustainable, scalable solutions that address the complex and pressing
              challenges posed by climate change in agricultural systems across Africa.
            </p>
            <p className="text-gray-800 leading-relaxed">
              By equipping farmers, policymakers, researchers, and stakeholders
              with the specialized knowledge, advanced tools, and adaptive strategies needed 
              to respond effectively to changing climate patterns, we aim to strengthen 
              climate-smart agriculture practices, enhance regional food security,
              and promote sustainable land and water management systems. Through
              collaborative stakeholder engagement, real-world demonstration projects, and
              evidence-based policy advocacy, GanzAfrica is driving a
              transformative shift towards climate-resilient food systems that
              can withstand environmental shocks while ensuring long-term
              agricultural productivity, ecosystem health, and economic stability for rural
              communities across the African continent.
            </p>
          </div>

          {/* Image Container */}
          <div className="h-full w-full">
            <div className="relative h-full w-full rounded-lg overflow-hidden bg-gray-200">
              <img
                src="/images/famer-feild.png"
                alt="Farmers and agricultural workers in the field"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
<section className="py-16 bg-[#F5F5F5] bg-opacity-75">
  <div className="container mx-auto px-4">
    <div className="flex flex-col md:flex-row gap-8 items-center text-center">
      {/* Left Column - Title and Description */}
            <div className="md:w-1/2 justify-center">
                 <div className="container mx-auto px-4">
          <div className="flex justify-center mb-10">
            <DecoratedHeading firstText="Our approach to" secondText="Climate Adaptation" />
          </div>
          </div>

        <div className="mb-8">
          <p className="text-gray-800 leading-relaxed text-left">
            At GanzAfrica, we are committed to shaping a sustainable and
            prosperous Africa by empowering agricultural communities and youth through 
            comprehensive training programs, personalized mentorship opportunities, and 
            strategic work placement initiatives in the interconnected fields of land
            management, environmental sustainability, and climate-resilient agriculture. 
            Our holistic approach integrates scientific knowledge, technological innovation, 
            and participatory policy engagement to build a new generation of agricultural 
            leaders capable of driving meaningful and lasting change in Africa's food systems 
            amid escalating climate challenges.
          </p>
        </div>
      </div>

      {/* Right Column - Four Cards in Grid */}
      <div className="md:w-3/5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1 - Data-Driven Decision Making */}
     <div className="bg-[#FEF8E7] hover:rounded-t-[41px]  rounded-b-lg shadow-sm h-full transition-all duration-300 hover:bg-green-800 group">
  <div className="p-6 flex flex-col h-full">
    <div className="flex items-start mb-4">
      {/* Icon Container */}
      <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0 transition-all duration-300 group-hover:bg-white">
        <svg
          className="w-6 h-6 text-white transition-all duration-300 group-hover:text-green-800"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 12H3M21 6H3M21 18H3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Card Title */}
      <h3 className="text-yellow-500 text-xl font-bold transition-all duration-300 group-hover:text-white">
        Data-Driven Decision Making
      </h3>
    </div>

    {/* Card Content */}
    <div className="flex-grow">
      <p className="text-gray-800 text-left transition-all duration-300 group-hover:text-white">
        We conduct comprehensive climate data inventory, vulnerability assessments,
        and advanced spatial analysis to identify high-risk agricultural zones.
        Our approach leverages satellite imagery, ground-level sensors, and
        predictive modeling to develop tailored adaptation strategies informed by
        real-time climate insights and long-term change projections.
      </p>
    </div>
  </div>
</div>


     {/* Card 2 - Community-Centered Adaptation */}
<div className="bg-green-800 hover:rounded-t-[41px]  rounded-b-lg shadow-sm h-full">
  <div className="p-6 flex flex-col h-full">
    <div className="flex items-start mb-4">
      <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0">
        <svg
          className="w-6 h-6 text-green-800"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 12H3M21 6H3M21 18H3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h3 className="text-white text-xl font-bold">
        Community-Centered Adaptation
      </h3>
    </div>
    <div className="flex-grow">
      <p className="text-white text-left">
        Through participatory local consultation and indigenous knowledge
        integration, we incorporate traditional farming practices that have
        withstood centuries of climate variability into modern adaptation
        policies. We ensure farmers, women's cooperatives, youth groups, and
        community leaders actively participate in adaptation planning and
        implementation.
      </p>
    </div>
  </div>
</div>


{/* Card 3 - Practical Learning & Innovation */}
<div className="bg-[#FEF8E7] hover:rounded-t-[41px]  rounded-b-lg shadow-sm h-full transition-all duration-300 hover:bg-green-800 group">
  <div className="p-6 flex flex-col h-full">
    <div className="flex items-start mb-4">
      {/* Icon container */}
      <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0 transition-all duration-300 group-hover:bg-white">
        <svg
          className="w-6 h-6 text-white transition-all duration-300 group-hover:text-green-800"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 12H3M21 6H3M21 18H3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Card title */}
      <h3 className="text-yellow-500 text-xl font-bold transition-all duration-300 group-hover:text-white">
        Practical Learning & Innovation
      </h3>
    </div>

    {/* Card content */}
    <div className="flex-grow">
      <p className="text-gray-800 text-left transition-all duration-300 group-hover:text-white">
        Our hands-on demonstration plot in Musanze functions as a living
        agricultural laboratory where farmers can experiment with and implement
        diverse climate-smart techniques including drought-resistant crop varieties,
        water conservation methods, intercropping systems, and sustainable soil
        management practices while fostering peer-to-peer knowledge exchange.
      </p>
    </div>
  </div>
</div>


          {/* Card 4 - Capacity Building & Sustainable Impact */}
        <div className="bg-[#FEF8E7] hover:rounded-t-[41px] rounded-b-lg shadow-sm h-full transition-all duration-300 hover:bg-green-800 group">
  <div className="p-6 flex flex-col h-full">
    <div className="flex items-start mb-4">
      {/* Icon Container */}
      <div className="bg-yellow-400 w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0 transition-all duration-300 group-hover:bg-white">
        <svg
          className="w-6 h-6 text-white transition-all duration-300 group-hover:text-green-800"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M21 12H3M21 6H3M21 18H3"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Card Title */}
      <h3 className="text-yellow-500 text-xl font-bold transition-all duration-300 group-hover:text-white">
        Capacity Building & Sustainable Impact
      </h3>
    </div>

    {/* Card Content */}
    <div className="flex-grow">
      <p className="text-gray-800 text-left transition-all duration-300 group-hover:text-white">
        We strengthen regional adaptation systems through specialized training
        programs, targeted mentorship opportunities, and collaborative
        knowledge-sharing networks, equipping smallholder farmers, agricultural
        extension officers, policymakers, and researchers with the practical tools
        and technical expertise needed to implement effective, long-term climate
        resilience strategies.
      </p>
    </div>
  </div>
</div>

        </div>
      </div>
    </div>
  </div>
</section>

      {/* Key Focus Areas Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-10">
            <DecoratedHeading
              firstText="Key Climate Adaptation"
              secondText="Focus Areas"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* First row - 3 cards */}
            {focusAreas.slice(0, 3).map((area, index) => (
              <FocusAreaCard
                key={index}
                title={area.title}
                description={area.description}
                icon={area.icon}
              />
            ))}
            
            {/* Second row - 2 cards centered */}
            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 mx-auto w-full md:w-2/3">
              {focusAreas.slice(3, 5).map((area, index) => (
                <FocusAreaCard
                  key={index + 3}
                  title={area.title}
                  description={area.description}
                  icon={area.icon}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Data On Climate Adaptation */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center mb-10">
            <DecoratedHeading firstText="Spacial Data on " secondText="Climate Adaptation" />
          </div>
        </div>
      </section>
    </main>
  );
}