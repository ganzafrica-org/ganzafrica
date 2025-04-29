'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Play, Circle, Check, Pause, Volume2, VolumeX, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Container } from "@/components/container";
import { DecoratedHeading } from "@/components/decorated-heading";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import { default as HeaderBelt } from "@/components/layout/headerBelt";
import { useParams } from 'next/navigation';
import apiClient from '@/lib/api-client';

// Define the type for opportunities
type Opportunity = {
  id: string;
  title: string;
};

// Interface for the testimonial data from the API
interface Testimonial {
  id: number;
  author_name: string;
  position: string;
  image: string;
  description: string;
  company: string;
  occupation: string;
  date: string;
  rating: number;
  created_at: string;
  updated_at: string;
}

// Interface for the API response
interface TestimonialsResponse {
  testimonials: Testimonial[];
}

// Fallback testimonials in case of API failure
const fallbackTestimonials: Testimonial[] = [
  {
    id: 1,
    author_name: "Claude Mugabe",
    position: "Former Smart Water Management Fellow",
    description: "I have found immense value in my role as a Smart Water fellow at GanzAfrica... a pivotal aspect of my journey has been participating in the MINAGRI team where collaboration with fellows from diverse backgrounds was key. I am confident that the lessons learned at GanzAfrica will contribute significantly",
    image: "/images/ganzafrica-fellows.jpg",
    company: "GA",
    occupation: "fellow",
    date: new Date().toISOString(),
    rating: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    author_name: "Sarah Kimani",
    position: "Agrifood Systems Fellow",
    description: "The GanzAfrica fellowship transformed my career in agricultural innovation. Working alongside experienced mentors and a community of passionate professionals gave me the skills and network to make a real difference in my community.",
    image: "/images/ganzafrica-fellows.jpg",
    company: "GA",
    occupation: "fellow",
    date: new Date().toISOString(),
    rating: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    author_name: "John Mwangi",
    position: "Climate Change Fellow",
    description: "Being part of the GanzAfrica fellowship opened doors to incredible opportunities in climate action. The hands-on experience and mentorship I received helped me develop innovative solutions for sustainable agriculture.",
    image: "/images/ganzafrica-fellows.jpg",
    company: "GA",
    occupation: "fellow",
    date: new Date().toISOString(),
    rating: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 4,
    author_name: "Grace Mutua",
    position: "Data & Evidence Fellow",
    description: "The fellowship program at GanzAfrica equipped me with crucial skills in data analysis and evidence-based decision making. The collaborative environment and expert guidance helped me grow both professionally and personally.",
    image: "/images/ganzafrica-fellows.jpg",
    company: "GA",
    occupation: "fellow",
    date: new Date().toISOString(),
    rating: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 5,
    author_name: "David Okello",
    position: "Natural Resource Management Fellow",
    description: "Through the GanzAfrica fellowship, I gained practical experience in sustainable resource management. The program's focus on real-world challenges and innovative solutions has been invaluable for my career development.",
    image: "/images/ganzafrica-fellows.jpg",
    company: "GA",
    occupation: "fellow",
    date: new Date().toISOString(),
    rating: 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

const benefits = [
  {
    title: "Tackle Challenges",
    description: "Join a like-minded cohort to address major land, agricultural, and environmental challenges in Africa, making a meaningful impact in your community.",
    image: "/images/food-system.jpeg"
  },
  {
    title: "Gain Global Experience",
    description: "Work on transformative projects with world-class industry specialists, be mentored by experts, and participate in the co-creation of innovative solutions in our focus areas.",
    image: "/images/climate-adaptation.jpg"
  },
  {
    title: "Develop Your Skills",
    description: "Our fully funded program offers training, apprenticeships, and work experience to enhance your expertise and showcase your talent.",
    image: "/images/ganzafrica-fellows.jpg"
  }
];

const promises = [
  {
    number: "01",
    title: "Professional Development",
    description: "Provide up to 2 years of holistic training with a focus on data & analytics and leadership skills",
    color: "bg-[#00A15D]"
  },
  {
    number: "02",
    title: "A community of like-minded people",
    description: "Welcome fellows into a network of value-driven young Africans committed to leading Africa's transformation",
    color: "bg-[#FDB022]"
  },
  {
    number: "03",
    title: "Hands-On Experience",
    description: "Deliver work secondments with one of our partners to apply skills learned",
    color: "bg-[#00A15D]"
  }
];

const topics = [
  "Food Systems",
  "Data & Evidence",
  "Co-creation",
  "Food systems",
  "Data & Evidence",
  "Natural Resource Management",
  "Climate Change",
  "Sustainable Agriculture"
];

export default function FellowshipPage() {
  // Use useParams to get the locale from the URL
  const params = useParams<{ locale: string }>();
  const locale = params.locale as string;

  // You might need to implement a proper dictionary loading solution
  // For now we'll use an empty object
  const dict = {};

  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);
  const [visibleTopics, setVisibleTopics] = useState<string[]>([]);
  const topicsRef = useRef<HTMLDivElement>(null);
  const [featuredOpportunity, setFeaturedOpportunity] = useState<Opportunity | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const extendedTopics = [...topics, ...topics];
    setVisibleTopics(extendedTopics);

    const scrollAnimation = setInterval(() => {
      if (topicsRef.current) {
        if (topicsRef.current.scrollLeft >= (topicsRef.current.scrollWidth / 2)) {
          topicsRef.current.scrollLeft = 0;
        } else {
          topicsRef.current.scrollLeft += 1;
        }
      }
    }, 30);

    return () => clearInterval(scrollAnimation);
  }, []);

  // Fetch testimonials from the API
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<TestimonialsResponse>('/testimonials');
        setTestimonials(response.data.testimonials);
        setError(null);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
        // Set fallback testimonials in case of error
        setTestimonials(fallbackTestimonials);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  // Start automatic rotation when testimonials are loaded
  useEffect(() => {
    if (testimonials.length === 0) return;

    const startInterval = () => {
      // Clear any existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      intervalRef.current = setInterval(() => {
        setCurrentTestimonial(prev => (prev + 1) % testimonials.length);
      }, 5000); // Change every 5 seconds
    };

    startInterval();

    // Clear interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [testimonials.length]);

  // Reset interval when manually changing testimonial
  const handleTestimonialChange = (index: number) => {
    setCurrentTestimonial(index);

    // Don't clear the interval, just let it continue
    // This ensures the auto-slide never stops
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setVolume(newVolume);
      if (newVolume === 0) {
        setIsMuted(true);
      } else if (isMuted) {
        setIsMuted(false);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      videoContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
      <div className="min-h-screen bg-white font-sans">
        <Header locale={locale} dict={dict} />

        {/* Hero Section */}
        <section className="relative h-[400px] md:h-[500px]">
          <div className="absolute inset-0">
            <video
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-full object-cover"
            >
              <source src="/videos/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/60" />
          </div>
          <div className="relative z-10 h-full flex items-center justify-center">
            <div className="container mx-auto px-4 text-center">
              <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-3xl md:text-5xl font-bold text-white mb-4"
              >
                GanzAfrica <span className="text-primary-orange">Fellowship</span>
              </motion.h1>
              <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="text-white/90 text-base md:text-lg max-w-2xl mx-auto mb-6"
              >
                Join our transformative fellowship program designed to empower the next generation of African leaders in sustainable development.
              </motion.p>
              <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="flex items-center justify-center gap-4"
              >
                <Link href={`/${locale}/programs/fellowship/how-to-apply`}>
                  <Button className="bg-primary-orange hover:bg-primary-orange text-white font-semibold px-6 py-4 text-base">
                    How to Apply
                  </Button>
                </Link>
                <Link href={`/${locale}/opportunities/${featuredOpportunity?.id}/apply`}>
                  <Button className="bg-[#045F3C] hover:bg-[#045F3C]/90 text-white font-semibold px-6 py-4 text-base">
                    Apply now
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </section>
        <div className="flex justify-center">
          <HeaderBelt />
        </div>

        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-16 md:py-20 bg-white"
        >
          <div className="container mx-auto px-6 md:px-12 lg:px-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="order-2 md:order-1"
              >
                <img
                    src="/images/food-system-1.png"
                    alt="Food System"
                    className="rounded-lg w-full h-[500px] object-cover"
                />
              </motion.div>
              <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="order-1 md:order-2"
              >
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Discover tomorrow's{" "}
                  <span className="block text-[#045F3C]">leaders today</span>
                </h2>
                <p className="text-gray-600 text-lg mb-6">
                  A one-year program for those in early to mid career with exceptional ability and intellectual curiosity who aspire to become public leaders.
                </p>
                <p className="text-gray-600 text-lg mb-8">
                  Through our full-time Fellowship, we find people working on plans to make the world better in a big way. Then we help them become impactful leaders by connecting them with the tools, resources, and communities they need to bring their ideas to life.
                </p>

                <Link href={`/${locale}/about/team`}>
                  <Button className="bg-primary-orange hover:bg-primary-orange text-black font-medium px-8 py-3 text-lg rounded-lg">
                    Meet the Fellows
                  </Button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>

        <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-16 md:py-20 bg-gray-100 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[#F7F7F7]">
            <div className="absolute inset-0 bg-[url('/images/pattern.svg')] opacity-5"></div>
          </div>

          {/* Left Leaf */}
          <div className="absolute left-0 top-1/4 -translate-x-1/4 opacity-10">
            <img
                src="/images/leaf.png"
                alt="Decorative leaf"
                className="w-64 h-64 transform -rotate-12"
            />
          </div>

          {/* Right Leaf */}
          <div className="absolute right-0 bottom-1/4 translate-x-1/4 opacity-10">
            <img
                src="/images/leaf.png"
                alt="Decorative leaf"
                className="w-64 h-64 transform rotate-12"
            />
          </div>

          <div className="container mx-auto px-6 md:px-12 lg:px-20 relative z-10">
            <div className="relative">
              {/* Content Section - Now on top for mobile */}
              <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="w-full md:w-[50%] md:absolute md:top-12 md:right-0 bg-white p-6 rounded-lg shadow-lg mb-8 md:mb-0"
              >
                <motion.h2 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="text-4xl md:text-5xl font-bold mb-6"
                >
                  About the <span className="text-[#045F3C]">Fellowship</span>
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                  className="text-gray-600 text-lg mb-8"
                >
                  Our fully-funded program provides training, mentorship, and hands-on work experience in land governance, environmental management, agrifood systems, climate finance and other disciplines across our focus sectors. With specialized mentors guiding you, you'll gain professional development and collaborate with talented professionals. Plus, you'll have the opportunity to work on impactful projects with key global partners.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  <Link href={`/${locale}/programs/fellowship/how-to-apply`}>
                    <Button className="bg-[#FDB022] hover:bg-[#FDB022]/90 text-black font-medium px-8 py-3 text-lg rounded-lg transform hover:scale-105 transition-all duration-300">
                      How to Apply
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>

              {/* Video Section - Now on bottom for mobile */}
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-[60%] relative"
              >
                <div className="relative w-full h-[300px] md:h-[500px] rounded-lg overflow-hidden">
                  <video 
                    ref={videoRef}
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src="/videos/Farmers obervation 3.mp4" type="video/mp4" />
                  </video>
                  <div className="absolute inset-0 bg-black/30"></div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <button
                      onClick={togglePlay}
                      className="w-16 md:w-20 h-16 md:h-20 rounded-full bg-[#FDB022] flex items-center justify-center cursor-pointer hover:bg-[#FDB022]/90 transition-colors"
                      aria-label={isPlaying ? "Pause video" : "Play video"}
                    >
                      {isPlaying ? (
                        <Pause fill="white" className="w-8 h-8 text-white" />
                      ) : (
                        <Play fill="white" className="w-8 h-8 text-white ml-1" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* GanzAfrica's Promise Section */}
        <motion.section
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-24 md:py-32 bg-[#045F3C] relative overflow-hidden"
        >
          <div className="container mx-auto px-6 md:px-12 lg:px-20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
              <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2, duration: 0.8 }}
                  className="max-w-xl"
              >
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                  GanzAfrica's Promise <span className="text-[#00A15D]">to</span>
                  <br />
                  <span className="text-[#FDB022]">Fellows:</span>
                </h2>
                <p className="text-white/90 text-lg">
                  We are committed to providing a transformative experience that equips you with the skills, network, and opportunities to make a lasting impact in your field.
                </p>
              </motion.div>

              <motion.div
                  initial={{ opacity: 0, x: 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="space-y-8 relative"
              >
                {/* Dotted Line Connector */}
                <div className="absolute left-6 top-[24px] bottom-[24px] border-l-2 border-dashed border-white/20"></div>

                {promises.map((promise, index) => (
                    <motion.div
                        key={promise.number}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 * index, duration: 0.8 }}
                        className="flex items-start gap-6 relative"
                    >
                      <div className={`${promise.color} w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0`}>
                        {promise.number}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-2">{promise.title}</h3>
                        <p className="text-white/80">{promise.description}</p>
                      </div>
                    </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Testimonials Section */}
        <motion.section
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="py-12 md:py-16 bg-gray-50"
        >
          <Container>
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Checkout Fellows</h2>
              <h3 className="text-2xl md:text-3xl font-bold text-[#045F3C] mb-6 md:mb-8">Say about the Fellowship</h3>
            </div>

            {loading ? (
              <div className="max-w-5xl mx-auto px-4 md:px-12">
                {/* Loading skeleton */}
                <div className="flex justify-center items-center gap-4 md:gap-6 mb-6 md:mb-8">
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <div key={index} className="w-14 md:w-20 h-14 md:h-20 rounded-full bg-gray-200 animate-pulse" />
                  ))}
                </div>
                <div className="text-center">
                  <div className="h-20 md:h-24 bg-gray-200 animate-pulse rounded-lg mb-4 md:mb-6" />
                  <div className="h-5 md:h-6 w-28 md:w-40 bg-gray-200 animate-pulse rounded mx-auto" />
                </div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">{error}</div>
            ) : (
              <div className="max-w-5xl mx-auto px-4 md:px-12">
                {/* Profile Images Row */}
                <div className="flex justify-center items-center gap-3 md:gap-6 mb-6 md:mb-8">
                  {testimonials.map((testimonial, index) => {
                    const isActive = currentTestimonial === index;
                    const isPrevious = (currentTestimonial === index + 1) || (currentTestimonial === 0 && index === testimonials.length - 1);
                    const isNext = (currentTestimonial === index - 1) || (currentTestimonial === testimonials.length - 1 && index === 0);

                    return (
                      <div
                        key={testimonial.id}
                        className={`transition-all duration-500 transform cursor-pointer ${
                          isActive ? 'w-14 md:w-20 h-14 md:h-20 z-20 scale-110' :
                            isPrevious || isNext ? 'w-10 md:w-16 h-10 md:h-16 z-10 opacity-50 scale-90' :
                              'w-8 md:w-12 h-8 md:h-12 opacity-30 scale-75'
                        }`}
                        onClick={() => handleTestimonialChange(index)}
                      >
                        <div className={`rounded-full overflow-hidden transition-all duration-500 h-full w-full ${
                          isActive ? 'ring-2 md:ring-4 ring-yellow-400' : ''
                        }`}>
                          <Image
                            src={testimonial.image}
                            alt={testimonial.author_name}
                            width={isActive ? 80 : 64}
                            height={isActive ? 80 : 64}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Testimonial Content */}
                <div className="relative">
                  <div className="text-center px-2 md:px-16">
                    <div className="min-h-[120px] md:min-h-[150px] relative mb-4 md:mb-6">
                      {testimonials.map((testimonial, index) => (
                        <div
                          key={testimonial.id}
                          className={`absolute w-full transition-all duration-500 ${
                            index === currentTestimonial 
                              ? 'opacity-100 translate-y-0 z-10' 
                              : 'opacity-0 translate-y-4 pointer-events-none z-0'
                          }`}
                        >
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto line-clamp-4 md:line-clamp-none">
                            {testimonial.description}
                          </p>
                        </div>
                      ))}
                    </div>
                    <div className="min-h-[50px] md:min-h-[60px] relative">
                      {testimonials.map((testimonial, index) => (
                        <div
                          key={`name-${testimonial.id}`}
                          className={`absolute w-full transition-all duration-500 ${
                            index === currentTestimonial 
                              ? 'opacity-100 translate-y-0 z-10' 
                              : 'opacity-0 translate-y-4 pointer-events-none z-0'
                          }`}
                        >
                          <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-[#045F3C]">{testimonial.author_name}</h4>
                          <p className="text-gray-600 text-xs md:text-sm">{testimonial.position}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation Arrows */}
                  <button
                    onClick={() => handleTestimonialChange((currentTestimonial - 1 + testimonials.length) % testimonials.length)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-7 md:w-10 h-7 md:h-10 rounded-full bg-yellow-400 flex items-center justify-center hover:bg-yellow-500 transition-colors -translate-x-1/2 md:-translate-x-full"
                    aria-label="Previous testimonial"
                  >
                    <ArrowLeft className="w-3.5 md:w-5 h-3.5 md:h-5 text-white" />
                  </button>
                  <button
                    onClick={() => handleTestimonialChange((currentTestimonial + 1) % testimonials.length)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-7 md:w-10 h-7 md:h-10 rounded-full bg-[#045F3C] text-white flex items-center justify-center hover:bg-[#034830] transition-colors translate-x-1/2 md:translate-x-full"
                    aria-label="Next testimonial"
                  >
                    <ArrowRight className="w-3.5 md:w-5 h-3.5 md:h-5 text-white" />
                  </button>
                </div>
              </div>
            )}
          </Container>
        </motion.section>
      </div>
    );
  }

