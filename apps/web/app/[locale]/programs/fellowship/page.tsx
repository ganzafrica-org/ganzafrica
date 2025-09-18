'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, Play, Circle, Check } from 'lucide-react';
import { Button } from "@workspace/ui/components/button";
import { Container } from "@/components/container";
import { DecoratedHeading } from "@/components/layout/headertext";
import Header from "@/components/layout/header";
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { motion } from 'framer-motion';
import { default as HeaderBelt } from "@/components/layout/headerBelt";
import { useParams } from 'next/navigation';
import { AudioMutedIcon, AudioUnmutedIcon, FullscreenIcon } from "@/components/ui/icons";
import apiClient from '@/lib/api-client';
import { trackEvent, trackVideoEvent } from '@/components/analytics/google-analytics';

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
    image: "/images/SHIR5142-Enhanced-NR.jpg"
  },
  {
    title: "Gain Global Experience",
    description: "Work on transformative projects with world-class industry specialists, be mentored by experts, and participate in the co-creation of innovative solutions in our focus areas.",
    image: "/images/Mico(Trainer).jpeg"
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
    color: "bg-[#073392]"
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
  const [visibleTopics, setVisibleTopics] = useState<string[]>([]);
  const topicsRef = useRef<HTMLDivElement>(null);
  const [featuredOpportunity, setFeaturedOpportunity] = useState<Opportunity | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  const [currentTestimonial, setCurrentTestimonial] = useState<number>(0);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials); // Initialize with fallback
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false); // Track animation state

// Navigation functions with animation handling
  const nextTestimonial = () => {
    if (isAnimating) return; // Prevent rapid clicks during animation

    setIsAnimating(true); // Start animation

    // Execute the navigation
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);

    // Allow new animations after a short delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Match this with your animation duration

    // Handle auto-cycling
    handleManualNavigation();
  };

  const prevTestimonial = () => {
    if (isAnimating) return; // Prevent rapid clicks during animation

    setIsAnimating(true); // Start animation

    // Execute the navigation
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);

    // Allow new animations after a short delay
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Match this with your animation duration

    // Handle auto-cycling
    handleManualNavigation();
  };

// Handle manual navigation - simpler version that just manages auto-cycling
  const handleManualNavigation = () => {
    // Stop auto cycling
    setIsAutoPlaying(false);

    // Track testimonial navigation
    trackEvent('testimonial_navigation', {
      page: 'fellowship',
      navigation_type: 'manual'
    });

    // Clear existing interval
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }

    // Resume auto cycling after 10 seconds of inactivity
    setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);
  };

// Direct selection of testimonial
  const handleTestimonialChange = (index: number) => {
    if (isAnimating || index === currentTestimonial) return; // Skip if animating or already on this testimonial

    setIsAnimating(true);

    // Update the current testimonial
    setCurrentTestimonial(index);

    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500);

    // Handle auto-cycling
    handleManualNavigation();
  };

// Fetch testimonials from API with guaranteed fallback display
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        setLoading(true);
        // Always start with fallback data
        setTestimonials(fallbackTestimonials);

        const response = await apiClient.get<TestimonialsResponse>('/testimonials');

        // Only update if we got valid data
        if (response.data.testimonials && response.data.testimonials.length > 0) {
          setTestimonials(response.data.testimonials);
        }
        setError(null);
      } catch (err) {
        console.error('Error fetching testimonials:', err);
        setError('Failed to load testimonials');
        // Already using fallback testimonials
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

// Set up auto cycling for testimonials
  useEffect(() => {
    // Clear any existing interval
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }

    // Only create a new interval if auto-playing is enabled and not currently animating
    if (isAutoPlaying && !isAnimating && testimonials.length > 1) {
      autoPlayRef.current = setInterval(() => {
        // Only advance if not in the middle of a manual animation
        if (!isAnimating) {
          setIsAnimating(true);
          setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);

          // Reset animation state after animation completes
          setTimeout(() => {
            setIsAnimating(false);
          }, 500);
        }
      }, 5000);
    }

    // Clean up interval on unmount or when dependencies change
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };
  }, [isAutoPlaying, testimonials.length, isAnimating]);

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



  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);

      trackEvent('video_mute_toggle', {
        video_title: 'Fellowship About Video',
        action: isMuted ? 'unmute' : 'mute',
        page: 'fellowship'
      });
    }
  };
  
  const toggleFullScreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
        trackEvent('video_fullscreen_toggle', {
          video_title: 'Fellowship About Video',
          action: 'exit_fullscreen',
          page: 'fellowship'
        });
      } else {
        videoRef.current.requestFullscreen();
        trackEvent('video_fullscreen_toggle', {
          video_title: 'Fellowship About Video',
          action: 'enter_fullscreen',
          page: 'fellowship'
        });
      }
    }
  };

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
                className="w-full h-full object-cover brightness-105"
                onPlay={() => trackVideoEvent('play', 'Fellowship Hero Video')}
                onPause={() => trackVideoEvent('pause', 'Fellowship Hero Video')}
                onEnded={() => trackVideoEvent('complete', 'Fellowship Hero Video')}
            >
              <source src="/videos/hero-video.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-black/40"></div>
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
                <Link href={`/${locale}/programs/fellowship/how-to-apply`} onClick={() => trackEvent('how_to_apply_click', {
                  source_page: 'fellowship',
                  location: 'hero_section'
                })}>
                  <Button className="bg-primary-orange hover:bg-primary-orange text-white font-semibold px-6 py-4 text-base">
                    How to Apply
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
          <div className="absolute left-0 top-1/4 -translate-x-1/4 opacity-10 hidden sm:block">
            <img
                src="/images/leaf.png"
                alt="Decorative leaf"
                className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 transform -rotate-12"
            />
          </div>

          {/* Right Leaf */}
          <div className="absolute right-0 bottom-1/4 translate-x-1/4 opacity-10 hidden sm:block">
            <img
                src="/images/leaf.png"
                alt="Decorative leaf"
                className="w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 transform rotate-12"
            />
          </div>

          <div className="container mx-auto px-4 sm:px-6 md:px-12 lg:px-20 relative z-10">
            <div className="relative flex flex-col md:block">
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="w-full md:w-[60%] mb-8 md:mb-0"
              >
                <div className="relative">
                  <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      src="/videos/farmer1.mp4"
                      autoPlay
                      muted
                      loop
                      playsInline
                      onPlay={() => trackVideoEvent('play', 'Fellowship About Video')}
                      onPause={() => trackVideoEvent('pause', 'Fellowship About Video')}
                      onEnded={() => trackVideoEvent('complete', 'Fellowship About Video')}
                    />
                    {/* Video Controls */}
                    <div className="absolute bottom-4 right-4 flex space-x-3">
                      <button 
                        onClick={toggleMute}
                        className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all"
                        aria-label={isMuted ? "Unmute video" : "Mute video"}
                      >
                        {isMuted ? <AudioMutedIcon /> : <AudioUnmutedIcon />}
                      </button>
                      <button 
                        onClick={toggleFullScreen}
                        className="bg-black bg-opacity-60 hover:bg-opacity-80 text-white p-2 rounded-full transition-all"
                        aria-label="View in full screen"
                      >
                        <FullscreenIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="w-full md:absolute md:top-12 md:right-0 md:w-[50%] bg-white p-4 sm:p-6 rounded-lg shadow-lg"
              >
                <DecoratedHeading
                  firstText="About the"
                  secondText="Fellowship"
                  className='mb-4 sm:mb-5'
                />
                <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8">
                  Our fully-funded program provides training, mentorship, and hands-on work experience in land governance, environmental management, agrifood systems, climate finance and other disciplines across our focus sectors. With specialized mentors guiding you, you'll gain professional development and collaborate with talented professionals. Plus, you'll have the opportunity to work on impactful projects with key global partners.
                </p>
                
                <Link href={`/${locale}/programs/fellowship/how-to-apply`} onClick={() => trackEvent('how_to_apply_click', {
                  source_page: 'fellowship',
                  location: 'about_section'
                })}>
                  <motion.button
                    className="bg-[#045F3C] hover:bg-[#045F3C]/90 text-white px-6 py-3 rounded-md font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    How to Apply
                  </motion.button>
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.section>

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
                    src="/images/SHIR5142-Enhanced-NR.jpg"
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
                <DecoratedHeading
                  firstText="Discover tomorrow's"
                  secondText="leaders today"
                />
                <p className="text-gray-600 text-sm md:text-base mb-6">
                  A one-year program for those in early to mid career with exceptional ability and intellectual curiosity who aspire to become public leaders.
                </p>
                <p className="text-gray-600 text-sm md:text-base mb-8">
                  Through our full-time Fellowship, we find people working on plans to make the world better in a big way. Then we help them become impactful leaders by connecting them with the tools, resources, and communities they need to bring their ideas to life.
                </p>
                <Link href={`/${locale}/about/team`} onClick={() => trackEvent('meet_fellows_click', {
                  source_page: 'fellowship',
                  location: 'leaders_section'
                })}>
                  <motion.button
                    className="bg-primary-orange hover:bg-yellow-500 text-white px-8 py-3 rounded-md font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Meet the Fellows
                  </motion.button>
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
            className="py-12 md:py-16 bg-white"
        >
          <div className="container mx-auto px-6 md:px-12 lg:px-16">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="text-center max-w-2xl mx-auto mb-8"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Benefits of <span className="text-[#045F3C]">Joining GanzAfrica</span>
              </h2>
              <p className="text-gray-600 text-base">
                Begin your journey of impact and growth with GanzAfrica. Discover the
                benefits of joining our program:
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {benefits.slice(0, 2).map((benefit, index) => (
                    <motion.div
                        key={benefit.title}
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2, duration: 0.8 }}
                        className="bg-white rounded-[16px] overflow-hidden border border-gray-100"
                    >
                      <div className="p-3">
                        <div className="rounded-xl overflow-hidden relative">
                          <img
                              src={benefit.image}
                              alt={benefit.title}
                              width={600}
                              height={200}
                              className="w-full h-[200px] object-cover"
                              style={{ objectPosition: "center center" }}
                          />
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                        <p className="text-gray-600 text-sm md:text-base leading-relaxed">{benefit.description}</p>
                      </div>
                    </motion.div>
                ))}
              </div>

              {/* Right Column */}
              <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                  className="bg-white rounded-[16px] overflow-hidden border border-gray-100 h-full"
              >
                <div className="p-3">
                  <div className="rounded-xl overflow-hidden relative h-[600px]">
                    <Image
                        src="/images/ganzafrica-fellows.jpg"
                        alt="Develop Your Skills"
                        width={800}
                        height={600}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: "center center",
                          objectFit: "cover"
                        }}
                        priority
                    />
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-2">Develop Your Skills</h3>
                  <p className="text-gray-600 text-sm md:text-base leading-relaxed">Our fully funded program offers training, apprenticeships, and work experience to enhance your expertise and showcase your talent.</p>
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

        <motion.section
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="py-12 md:py-16 bg-gray-50"
        >
          <Container>
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Checkout What Fellows </h2>
              <h3 className="text-2xl md:text-3xl font-bold text-[#045F3C] mb-6 md:mb-8">Say about Our Fellowship</h3>
            </div>

            {loading && testimonials.length === 0 ? (
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
                              className={`cursor-pointer transition-all duration-300 transform ${
                                  isActive
                                      ? 'w-14 md:w-20 h-14 md:h-20 z-20 scale-110'
                                      : isPrevious || isNext
                                          ? 'w-10 md:w-16 h-10 md:h-16 z-10 opacity-70 scale-90'
                                          : 'w-8 md:w-12 h-8 md:h-12 opacity-50 scale-75'
                              }`}
                              onClick={() => {
                                handleTestimonialChange(index);
                                trackEvent('testimonial_click', {
                                  testimonial_author: testimonial.author_name,
                                  testimonial_position: testimonial.position,
                                  page: 'fellowship'
                                });
                              }}
                          >
                            <div className={`rounded-full overflow-hidden h-full w-full transition-all duration-300 ${
                                isActive ? 'ring-2 md:ring-4 ring-yellow-400' : 'ring-1 ring-gray-200'
                            }`}>
                              <img
                                  src={testimonial.image}
                                  alt={testimonial.author_name}
                                  width={80}
                                  height={80}
                                  className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                      );
                    })}
                  </div>

                  {/* Testimonial Content */}
                  <div className="relative">
                    <div className="bg-white p-6 md:p-8 rounded-lg shadow-sm min-h-[250px] flex flex-col justify-center">
                      <div className="text-center px-2 md:px-16">
                        <motion.div
                            key={currentTestimonial}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5 }}
                            className="min-h-[120px] md:min-h-[150px] flex items-center justify-center mb-4 md:mb-6"
                        >
                          <p className="text-gray-600 text-sm md:text-base leading-relaxed max-w-2xl mx-auto">
                            {testimonials[currentTestimonial]?.description || testimonials[0]?.description}
                          </p>
                        </motion.div>

                        <motion.div
                            key={`name-${currentTestimonial}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="min-h-[50px] md:min-h-[60px]"
                        >
                          <h4 className="text-lg md:text-xl font-bold mb-1 md:mb-2 text-[#045F3C]">
                            {testimonials[currentTestimonial]?.author_name || testimonials[0]?.author_name}
                          </h4>
                          <p className="text-gray-600 text-xs md:text-sm">
                            {testimonials[currentTestimonial]?.position || testimonials[0]?.position}
                          </p>
                        </motion.div>
                      </div>
                    </div>

                    {/* Navigation Arrows - Positioned on sides */}
                    <button
                        onClick={prevTestimonial}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full text-primary-orange flex items-center justify-center hover:bg-yellow-500 transition-colors -translate-x-1/2 md:-translate-x-5"
                        aria-label="Previous testimonial"
                    >
                      <ArrowLeft className="w-5 h-5 text-white" />
                    </button>
                    <button
                        onClick={nextTestimonial}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#045F3C] text-white flex items-center justify-center hover:bg-[#034830] transition-colors translate-x-1/2 md:translate-x-5"
                        aria-label="Next testimonial"
                    >
                      <ArrowRight className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
            )}
          </Container>
        </motion.section>
      </div>
  );
}