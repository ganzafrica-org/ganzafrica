"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Container from "@/components/layout/container";
import Link from "next/link";
import { ArrowRight, Play, Volume2, Maximize } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { DecoratedHeading } from "@/components/layout/headertext";
import { default as HeaderBanner } from "@/components/layout/headerBanner";
import { FC } from "react";
import {
  BikeIcon,
  LandGovernanceIcon,
  SustainableAgricultureIcon,
  ClimateAdaptationIcon,
} from "@/components/ui/icons";
import { default as HeaderBelt } from "@/components/layout/headerBelt";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface JourneyStep {
  id: string;
  title: string;
  duration: string;
  description: string;
}

interface Activity {
  title: string;
  description: string;
  color: string;
}

interface Project {
  id: number;
  title: string;
  image: string;
  status: string;
  category: string;
}

interface ValueCardProps {
  bgColor: string;
  iconBgColor: string;
  iconColor?: string;
  title: string;
  titleColor: string;
  textColor?: string;
  description: string;
  Icon?: React.FC<{ className?: string; color?: string }>;
  animationDirection?: string;
}

const activities: Activity[] = [
  {
    title: "Land Governance",
    description:
      "We support the development of equitable and effective land governance frameworks using research-based strategies and promoting sustainable benefits",
    color: "bg-primary-green",
  },
  {
    title: "Sustainable Agriculture",
    description:
      "Our work promotes agricultural productivity goals with innovative partnerships and leadership to achieve sustainable development",
    color: "bg-primary-green",
  },
  {
    title: "Climate Adaptation",
    description:
      "Our expertise supports the creation of climate resilience strategies that help communities adapt to changing environmental conditions",
    color: "bg-primary-green",
  },
];

const projects = [
  {
    id: 1,
    title: "Agriculture Management Information System",
    image: "/images/news/team-members-1.jpg",
    status: "In Progress",
    category: "Technology",
  },
  {
    id: 2,
    title: "Sustainable Farming Practices Research",
    image: "/images/news/team-members-2.jpg",
    status: "Completed",
    category: "Research",
  },
  {
    id: 3,
    title: "Climate-Smart Agriculture Initiative",
    image: "/images/news/maize.avif",
    status: "Active",
    category: "Climate",
  },
  {
    id: 4,
    title: "Land Rights Documentation System",
    image: "/images/news/team-members-1.jpg",
    status: "In Review",
    category: "Governance",
  },
  {
    id: 5,
    title: "Agricultural Data Analytics Platform",
    image: "/images/news/team-members-2.jpg",
    status: "Planning",
    category: "Technology",
  },
  {
    id: 6,
    title: "Community Farm Development Project",
    image: "/images/news/maize.avif",
    status: "Active",
    category: "Community",
  },
  {
    id: 7,
    title: "Soil Health Monitoring Program",
    image: "/images/news/team-members-1.jpg",
    status: "Active",
    category: "Research",
  },
  {
    id: 8,
    title: "Water Resource Management System",
    image: "/images/news/team-members-2.jpg",
    status: "In Progress",
    category: "Technology",
  },
  {
    id: 9,
    title: "Indigenous Farming Knowledge Database",
    image: "/images/news/maize.avif",
    status: "Planning",
    category: "Research",
  },
  {
    id: 10,
    title: "Agricultural Market Access Platform",
    image: "/images/news/team-members-1.jpg",
    status: "Active",
    category: "Technology",
  },
  {
    id: 11,
    title: "Sustainable Livestock Management",
    image: "/images/news/team-members-2.jpg",
    status: "In Review",
    category: "Research",
  },
  {
    id: 12,
    title: "Climate Resilience Training Program",
    image: "/images/news/maize.avif",
    status: "Active",
    category: "Climate",
  },
];

const SectionTitle = ({
  title1,
  title2,
}: {
  title1: string;
  title2: string;
}) => {
  const titleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!titleRef.current) return;

    gsap.from(titleRef.current, {
      y: 20,
      opacity: 0,
      duration: 0.8,
      ease: "power3.out",
    });
  }, []);

  return (
    <div
      ref={titleRef}
      className="relative inline-flex items-center border-2 border-primary-orange rounded-lg p-0.5"
    >
      <div className="px-6 py-2">
        <h2 className="text-xl font-bold">
          <span className="text-primary-green">{title1}</span>
          <span className="text-primary-orange">{title2}</span>
        </h2>
      </div>
      {/* Corner squares */}
      <div className="absolute -top-1 -left-1 w-2 h-2 bg-primary-orange" />
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary-orange" />
      <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-primary-orange" />
      <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-primary-orange" />
    </div>
  );
};

// Reusable Value Card component - Added animationDirection prop
const ValueCard: FC<ValueCardProps> = ({
  bgColor,
  iconBgColor,
  iconColor = "white",
  title,
  titleColor,
  textColor = "text-gray-800",
  description,
  Icon = BikeIcon,
  animationDirection,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current || !animationDirection) return;

    gsap.from(cardRef.current, {
      x:
        animationDirection === "left"
          ? -50
          : animationDirection === "right"
            ? 50
            : 0,
      opacity: 0,
      duration: 0.8,
      scrollTrigger: {
        trigger: cardRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
    });
  }, [animationDirection]);

  return (
    <div
      ref={cardRef}
      className={`w-full md:w-1/3 ${bgColor} rounded-3xl p-6 sm:p-8 relative mb-6 md:mb-0 pt-16 sm:pt-20`}
    >
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div
          className={`${iconBgColor} rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center shadow-md`}
        >
          <Icon className="w-6 h-6 sm:w-8 sm:h-8" color={iconColor} />
        </div>
      </div>

      <h3
        className={`text-xl sm:text-2xl font-bold text-center ${titleColor} mb-3 sm:mb-4`}
      >
        {title}
      </h3>

      <p className={`${textColor} text-center text-sm sm:text-base`}>
        {description}
      </p>
    </div>
  );
};

// Video Card component
interface VideoCardProps {
  videoSrc: string;
  title: string;
  description: string;
  isWide?: boolean;
}

const VideoCard: FC<VideoCardProps> = ({
  videoSrc,
  title,
  description,
  isWide = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Default to muted
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handlePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current
          .play()
          .catch((e) => console.error("Error playing video:", e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
    }
  };

  // Play on hover
  const handleMouseEnter = () => {
    if (videoRef.current && !isPlaying) {
      videoRef.current
        .play()
        .catch((e) => console.error("Error on hover play:", e));
      setIsPlaying(true);
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current && isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Toggle mute function
  const toggleMute = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation(); // Prevent triggering play/pause
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  // Toggle fullscreen function
  const toggleFullscreen = (e: React.MouseEvent<HTMLDivElement>): void => {
    e.stopPropagation(); // Prevent triggering play/pause
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err: Error) => console.error(err));
      } else {
        videoRef.current
          .requestFullscreen()
          .catch((err: Error) => console.error(err));
      }
    }
  };

  // Stop on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (videoRef.current && isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isPlaying]);

  return (
    <div
      ref={containerRef}
      className={`relative rounded-2xl overflow-hidden ${isWide ? "md:col-span-2" : ""}`}
      style={{ boxShadow: "none" }} // Explicitly remove any shadow
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="aspect-video w-full relative">
        <video
          ref={videoRef}
          src={videoSrc}
          className="w-full h-full object-cover"
          onEnded={handleVideoEnd}
          onClick={handlePlay}
          playsInline
          muted={isMuted} // Use state to control muted attribute
          preload="metadata" // Ensure metadata is loaded
        />

        {/* Green overlay that disappears when playing */}
        <div
          className={`absolute inset-0 bg-primary-green/30 transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`}
        ></div>

        {/* Content that disappears when playing */}
        <div
          className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-300 ${isPlaying ? "opacity-0" : "opacity-100"}`}
          onClick={handlePlay}
        >
          {/* Play button */}
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center cursor-pointer shadow-lg mb-4">
            <Play className="w-8 h-8 text-black ml-1" />
          </div>

          {/* Title and description inside the video */}
          <div className="text-center px-6 max-w-md">
            <h3
              className={`${isWide ? "text-xl" : "text-lg"} font-bold text-white drop-shadow-md`}
            >
              {title}
            </h3>
            <p
              className={`${isWide ? "text-base" : "text-sm"} text-white mt-2 drop-shadow-md`}
            >
              {description}
            </p>
          </div>
        </div>

        {/* Video control icons in bottom right - visible all the time */}
        <div className="absolute bottom-3 right-3 flex space-x-2">
          {/* Mute/Unmute button */}
          <div
            className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center cursor-pointer hover:bg-white/90 transition-colors"
            onClick={toggleMute}
          >
            {isMuted ? (
              <div className="relative">
                <Volume2 className="w-4 h-4 text-black" />
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-black transform -rotate-45"></div>
              </div>
            ) : (
              <Volume2 className="w-4 h-4 text-black" />
            )}
          </div>

          {/* Fullscreen button */}
          <div
            className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center cursor-pointer hover:bg-white/90 transition-colors"
            onClick={toggleFullscreen}
          >
            <Maximize className="w-4 h-4 text-black" />
          </div>
        </div>
      </div>
    </div>
  );
};

const AlumniProgramPage = (): JSX.Element => {
  const bannerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const journeyRef = useRef<HTMLDivElement>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);
  const projectsRef = useRef<HTMLDivElement>(null);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const totalSlides = Math.ceil(projects.length / 3);
  const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false);

  const nextSlide = (): void => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = (): void => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  useEffect(() => {
    // Set page as loaded
    setIsPageLoaded(true);

    // Only run animations after page is fully loaded
    if (!isPageLoaded) return;

    // Banner animation
    if (bannerRef.current) {
      gsap.from(bannerRef.current, {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
      });
    }

    // Image and content animations
    if (imageRef.current) {
      gsap.from(imageRef.current, {
        x: -50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });
    }

    if (contentRef.current) {
      gsap.from(contentRef.current, {
        x: 50,
        opacity: 0,
        duration: 1,
        delay: 0.3,
        ease: "power3.out",
      });
    }

    // Features list stagger animation
    if (featuresRef.current) {
      gsap.from(".feature-item", {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.1,
        scrollTrigger: {
          trigger: featuresRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
    }

    // Journey steps animation
    if (journeyRef.current) {
      gsap.from(".journey-step", {
        x: -30,
        opacity: 0,
        duration: 0.8,
        stagger: 0.3,
        scrollTrigger: {
          trigger: journeyRef.current,
          start: "top 80%",
          end: "bottom 20%",
          toggleActions: "play none none reverse",
        },
      });
    }

    // Projects section animation for arrows
    if (projectsRef.current) {
      // Add animation for arrow buttons
      gsap.fromTo(
        ".arrow-button",
        { y: 0 },
        {
          y: 5,
          duration: 1.2,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
        },
      );
    }
  }, [isPageLoaded]);

  // Add a class to hide content until page is loaded
  const pageClass = isPageLoaded
    ? "opacity-100 transition-opacity duration-500"
    : "opacity-0";

  return (
    <main className={`bg-white ${pageClass}`}>
      {/* Hero Section */}
      <section className="relative w-full h-[400px] sm:h-[500px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/team.png"
            alt="Agricultural fields"
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
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold mb-2 leading-tight">
            <span className="font-normal">Strengthening</span>{" "}
            <span className="font-bold text-yellow-400">Our Legacy, </span>
            <br />
            <span className="font-normal">Together</span>
          </h1>
          <h2 className="text-yellow-400 text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6">
            ALUMNI
          </h2>
        </div>
      </section>
      <HeaderBelt />
      {/* Program Overview Section */}
      <Container>
        <div className="py-10">
          <div className="flex flex-col lg:flex-row gap-12 items-start max-w-7xl mx-auto">
            {/* Left Column - Image */}
            <div ref={imageRef} className="lg:w-[42%] lg:mt-[60px]">
              <div className="relative aspect-[4/3] w-full">
                <Image
                  src="/images/news/team-members-1.jpg"
                  alt="Alumni Network"
                  fill
                  sizes="(max-width: 768px) 100vw, 42vw"
                  className="rounded-2xl object-cover"
                  priority
                />
              </div>
            </div>

            {/* Right Column - Content */}
            <div ref={contentRef} className="lg:w-[58%]">
              {/* Section Title */}
              <div className="flex justify-center mb-10">
                <DecoratedHeading firstText="Program" secondText="Overview" />
              </div>

              {/* Description */}
              <div className="space-y-4">
                <p className="text-gray-800 text-base leading-relaxed">
                  The GanzAfrica Alumni Network connects former fellows who
                  continue to drive positive change across Africa's land,
                  agriculture, and environmental sectors. Our growing community
                  of over 40 professionals now works in government agencies,
                  international organizations, research institutions, and social
                  enterprises.
                </p>
                <p className="text-gray-800 text-base leading-relaxed">
                  This powerful network facilitates knowledge sharing,
                  collaboration, and continuous professional development
                  —amplifying the impact of individual members through
                  collective action and support.
                </p>
              </div>

              {/* Features List */}
              <div ref={featuresRef} className="space-y-3 mt-6">
                <div className="feature-item flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-orange flex items-center justify-center">
                    <Image
                      src="/images/leafwhite.png"
                      alt="Leaf icon"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </div>
                  <p className="text-gray-800 text-base">
                    Intensive skill-building modules
                  </p>
                </div>
                <div className="feature-item flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-orange flex items-center justify-center">
                    <Image
                      src="/images/leafwhite.png"
                      alt="Leaf icon"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </div>
                  <p className="text-gray-800 text-base">
                    Hands-on apprenticeships with industry leaders
                  </p>
                </div>
                <div className="feature-item flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-orange flex items-center justify-center">
                    <Image
                      src="/images/leafwhite.png"
                      alt="Leaf icon"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </div>
                  <p className="text-gray-800 text-base">
                    Community-based project implementation
                  </p>
                </div>
                <div className="feature-item flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary-orange flex items-center justify-center">
                    <Image
                      src="/images/leafwhite.png"
                      alt="Leaf icon"
                      width={16}
                      height={16}
                      className="w-4 h-4"
                    />
                  </div>
                  <p className="text-gray-800 text-base">
                    Cross-disciplinary collaboration opportunities
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Alumni Videos Section - Using the same style as Fellowship Journey */}
      <div ref={journeyRef} className="py-16">
        <Container>
          <div className="flex justify-center mb-10">
            <DecoratedHeading firstText="Alumni" secondText="Videos" />
          </div>

          {/* Video Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Large video on the left */}
            <VideoCard
              videoSrc="/videos/farmer1.mp4"
              title="Impact Stories"
              description="Alumni share their experiences and the impact of their work in communities across Africa."
              isWide={true}
            />

            {/* Two smaller videos stacked on the right */}
            <div className="md:col-span-1 flex flex-col gap-6">
              <VideoCard
                videoSrc="/videos/farmer2.mp4"
                title="Networking Events"
                description="Alumni gather to share knowledge and build partnerships at our annual symposium."
              />

              <VideoCard
                videoSrc="/videos/farmer1.mp4"
                title="Mentorship Program"
                description="Experienced alumni provide guidance to new fellows in our mentorship initiative."
              />
            </div>
          </div>
        </Container>
      </div>

      {/* Alumni Activities Section - With animation from left and right (using Fellow Activities style) */}
      <section className="py-8 sm:py-12 md:py-16 bg-white" ref={activitiesRef}>
        <div className="flex justify-center mb-8 sm:mb-12 md:mb-16">
          <div className="relative inline-block">
            <div className="flex justify-center mb-6 sm:mb-10">
              <DecoratedHeading firstText="Alumni" secondText="Activities" />
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6 sm:gap-8 max-w-7xl mx-auto">
            <ValueCard
              bgColor="bg-yellow-50"
              iconBgColor="bg-primary-orange"
              title="Land Governance"
              titleColor="text-primary-orange"
              Icon={LandGovernanceIcon}
              description="We support the development of equitable and effective land administration systems that strengthen tenure security while promoting sustainable land use"
              animationDirection="left"
            />

            <ValueCard
              bgColor="bg-green-800"
              iconBgColor="bg-white"
              iconColor="#006837"
              title="Sustainable Agriculture"
              titleColor="text-white"
              textColor="text-white"
              Icon={SustainableAgricultureIcon}
              description="Our work promotes agricultural policies that balance productivity goals with environmental stewardship and social inclusion"
            />

            <ValueCard
              bgColor="bg-yellow-50"
              iconBgColor="bg-primary-orange"
              title="Climate Adaptation"
              titleColor="text-primary-orange"
              Icon={ClimateAdaptationIcon}
              description="Our expertise supports the creation of climate resilience strategies that help communities adapt to changing environmental conditions"
              animationDirection="right"
            />
          </div>
        </div>
      </section>

      {/* Alumni Projects Section - Using Fellowship Projects style */}
      <div ref={projectsRef}>
        <Container>
          <div className="py-16">
            <div className="flex justify-center mb-10">
              <DecoratedHeading firstText="Alumni" secondText="Projects" />
            </div>
            <div className="flex justify-end">
              <Link
                href="/projects"
                className="inline-flex items-center text-primary-green hover:text-primary-green/80 font-medium gap-2"
              >
                <span className="text-sm italic">See More Projects</span>
                <div className="w-8 h-8 rounded-full bg-primary-orange flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-white" />
                </div>
              </Link>
            </div>

            {/* Projects Grid with Sliding */}
            <div className="relative w-full">
              <div className="overflow-hidden">
                <div
                  className="slider-container flex flex-nowrap transition-transform duration-700 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {Array.from({ length: Math.ceil(projects.length / 3) }).map(
                    (_, index) => (
                      <div
                        key={`slide-${index}`}
                        className="flex gap-8 min-w-full flex-shrink-0"
                      >
                        {projects
                          .slice(index * 3, (index + 1) * 3)
                          .map((project) => (
                            <div
                              key={`project-${project.id}`}
                              className="project-card flex-1 group relative bg-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden cursor-pointer"
                            >
                              <div className="relative w-full overflow-hidden">
                                {/* Top right cut-out */}
                                <div className="absolute -top-px -right-px w-[140px] h-[70px] bg-white">
                                  <div className="absolute bottom-0 left-0 w-full h-full bg-white">
                                    <div className="absolute bottom-0 left-0 w-full h-full bg-[#F5F5F5] rounded-bl-[48px]" />
                                  </div>
                                </div>

                                {/* Main content container */}
                                <div className="relative">
                                  {/* Arrow button with CSS hover effect and animation */}
                                  <Link href={`/projects/${project.id}`}>
                                    <div className="absolute top-4 right-4 z-10">
                                      <div className="arrow-button w-12 h-12 rounded-full bg-primary-orange group-hover:bg-[#00A651] flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer">
                                        <ArrowRight className="w-6 h-6 text-white transform -rotate-45 group-hover:-rotate-90 transition-transform duration-300" />
                                      </div>
                                    </div>
                                  </Link>

                                  {/* Image section with CSS hover effect */}
                                  <div className="card-image relative aspect-[16/9] w-full overflow-hidden">
                                    <Image
                                      src={
                                        project.image ||
                                        "/images/default-image.jpg"
                                      }
                                      alt={project.title}
                                      fill
                                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                      className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />

                                    {/* Title section - completely plain white with no shadows or borders */}
                                    <div className="absolute -bottom-6 -left-3 bg-white py-2 px-4 w-64 z-10 rounded-tr-3xl rounded-br-3xl rounded-tl-3xl">
                                      <div className="font-medium text-sm">
                                        {project.title}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="mt-8 flex justify-center">
                <div className="flex items-center gap-4">
                  <button
                    onClick={prevSlide}
                    className={`nav-arrow w-10 h-10 rounded-full border border-primary-green flex items-center justify-center ${
                      currentSlide === 0
                        ? "opacity-50"
                        : "hover:bg-primary-green hover:text-white"
                    } text-primary-green transition-all duration-300`}
                    aria-label="Previous slide"
                  >
                    ←
                  </button>

                  {/* Progress bar */}
                  <div className="progress-bar w-32 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-green rounded-full transition-all duration-500"
                      style={{
                        width: `${((currentSlide + 1) / totalSlides) * 100}%`,
                      }}
                    />
                  </div>

                  <button
                    onClick={nextSlide}
                    className={`nav-arrow w-10 h-10 rounded-full border border-primary-green flex items-center justify-center ${
                      currentSlide === totalSlides - 1
                        ? "opacity-50"
                        : "hover:bg-primary-green hover:text-white"
                    } text-primary-green transition-all duration-300`}
                    aria-label="Next slide"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Alumni Testimonials Section */}
      <section className="py-16 bg-gray-50">
        <Container>
          <div className="flex justify-center mb-12">
            <DecoratedHeading firstText="Alumni" secondText="Testimonials" />
          </div>

          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-md relative">
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 rounded-full bg-primary-orange flex items-center justify-center">
                  <Image
                    src="/images/leafwhite.png"
                    alt="Icon"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
              </div>
              <div className="pt-4">
                <p className="text-gray-700 italic mb-6">
                  "The GanzAfrica Alumni Network has been invaluable in my
                  professional journey. The connections I've made and knowledge
                  gained continue to shape my work in sustainable agriculture
                  across Tanzania."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src="/images/news/team-members-1.jpg"
                      alt="Alumni portrait"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-green">
                      Sarah Nkosi
                    </h4>
                    <p className="text-sm text-gray-600">
                      Class of 2022, Agricultural Researcher
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-md relative">
              <div className="absolute -top-6 left-8">
                <div className="w-12 h-12 rounded-full bg-primary-orange flex items-center justify-center">
                  <Image
                    src="/images/leafwhite.png"
                    alt="Icon"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                </div>
              </div>
              <div className="pt-4">
                <p className="text-gray-700 italic mb-6">
                  "Being part of this network has opened doors I never thought
                  possible. The mentorship and ongoing support have been
                  critical to implementing climate-smart agricultural practices
                  in my community."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden mr-4">
                    <Image
                      src="/images/news/team-members-2.jpg"
                      alt="Alumni portrait"
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-bold text-primary-green">
                      Emmanuel Osei
                    </h4>
                    <p className="text-sm text-gray-600">
                      Class of 2021, Community Leader
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
};

export default AlumniProgramPage;
