'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@workspace/ui/components/button";
import Header from "@/components/layout/header";
import { Container } from "@/components/container";
import { Users, Blocks, Briefcase, Users2, ArrowRight } from 'lucide-react';
import { useParams } from 'next/navigation';
import { default as HeaderBelt } from "@/components/layout/headerBelt";
import Link from 'next/link';
import { trackEvent, trackPageView } from '@/components/analytics/google-analytics';

// Normalize Next.js Link typing across React versions
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SafeLink = Link as unknown as React.ComponentType<any>;

// Normalize lucide icon component types across React versions
type SvgIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const ArrowRightIcon = ArrowRight as unknown as SvgIconComponent;
const Users2Icon = Users2 as unknown as SvgIconComponent;
const BlocksIcon = Blocks as unknown as SvgIconComponent;
const BriefcaseIcon = Briefcase as unknown as SvgIconComponent;
const UsersIcon = Users as unknown as SvgIconComponent;


const applicationSteps = [
  {
    id: 1,
    title: "Fellowship Advertised",
    description: "GanzAfrica Fellowship opportunities are announced through our online channels and partner networks across Africa.",
    image: "/images/fellowship-advertised.png"
  },
  {
    id: 2,
    title: "Applications Received",
    description: "Submit your application through our online portal. Make sure to include all required documents and information.",
    image: "/images/application-received.png"
  },
  {
    id: 3,
    title: "Applications Reviewed",
    description: "Our team carefully reviews each application, assessing qualifications, experience, and alignment with our mission.",
    image: "/images/application-review.png"
  },
  {
    id: 4,
    title: "Interviews Conducted",
    description: "Selected candidates are invited to participate in oral and written interviews to further assess their suitability.",
    image: "/images/interviews-conducted.png"
  },
  {
    id: 5,
    title: "Finalists Selected & Notified",
    description: "Successful candidates are notified and begin their journey with GanzAfrica Fellowship Program.",
    image: "/images/fellows-notified.png"
  }
];

const eligibilityCriteria = [
  {
    title: "Up to 27 years old",
    description: "Young professionals at the start of their career journey"
  },
  {
    title: "A degree in a relevant discipline",
    description: "Academic background in agriculture, environmental science, data science, or related fields"
  },
  {
    title: "Commitment to leading Africa's transformation",
    description: "Demonstrated passion for sustainable development and positive change"
  }
];

const FloatingApplyButton = () => {
  const params = useParams<{ locale: string }>();
  const buttonRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);
  const scrollTimeout = useRef<number | null>(null);
  const footerSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const findFooterSection = () => {
      // Look for the section containing "Connect With Us" heading
      const headings = Array.from(document.querySelectorAll('h2, h3, h4, h5, h6'));
      console.log('All headings:', headings.map(h => h.textContent?.trim()));
      
      const connectSection = headings.find(el => 
        el.textContent?.trim().toLowerCase().includes('connect with us')
      );
      
      console.log('Found Connect With Us section:', connectSection);
      
      // If we found the section, go up to find a suitable parent
      if (connectSection) {
        const parentSection = connectSection.closest('section, footer, [class*="footer"], [class*="Footer"]') as HTMLElement;
        console.log('Parent section found:', parentSection);
        return parentSection || document.querySelector('footer') as HTMLElement;
      }
      
      // Fallback to any footer element
      return document.querySelector('footer, [class*="footer"], [class*="Footer"]') as HTMLElement;
    };

    const handleScroll = () => {
      if (!buttonRef.current) return;
      
      // Find the footer section if not already found
      if (!footerSectionRef.current) {
        footerSectionRef.current = findFooterSection();
        if (!footerSectionRef.current) {
          console.log('No footer section found yet');
          return;
        }
      }
      
      // Get positions
      const footerRect = footerSectionRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      const scrollPosition = window.scrollY;
      
      // Calculate the position where we want to start hiding the button
      // We'll start hiding when we're 1.5x the viewport height from the footer
      const viewportHeight = window.innerHeight;
      const hideThreshold = viewportHeight * 1.5; // Hide when 1.5 viewports away
      const distanceToFooter = footerRect.top - viewportHeight;
      
      console.log('Distance to footer:', distanceToFooter, 'Hide threshold:', hideThreshold);
      
      // Toggle visibility based on scroll position
      const shouldBeVisible = distanceToFooter > hideThreshold || distanceToFooter < 0;
      
      console.log('Button should be visible:', shouldBeVisible);
      
      // Only update state if it's different to prevent unnecessary re-renders
      if (shouldBeVisible !== isVisible) {
        console.log('Updating button visibility to:', shouldBeVisible);
        setIsVisible(shouldBeVisible);
      }
    };

    // Initial check with a slight delay to ensure DOM is ready
    const initTimer = setTimeout(() => {
      footerSectionRef.current = findFooterSection();
      handleScroll();
    }, 300); // Increased delay to ensure all content is loaded
    
    // Throttle the scroll event for better performance
    const throttledScroll = () => {
      if (scrollTimeout.current) {
        cancelAnimationFrame(scrollTimeout.current);
      }
      scrollTimeout.current = requestAnimationFrame(handleScroll);
    };
    
    // Add event listeners with passive for better performance
    window.addEventListener('scroll', throttledScroll, { passive: true });
    window.addEventListener('resize', throttledScroll, { passive: true });
    
    // Add intersection observer as a fallback
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setIsVisible(false);
          } else if (window.scrollY + window.innerHeight < entry.boundingClientRect.top + window.scrollY - 200) {
            setIsVisible(true);
          }
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
      }
    );
    
    // Start observing the footer section
    if (footerSectionRef.current) {
      observer.observe(footerSectionRef.current);
    } else {
      // If footer not found initially, try again after a delay
      const retryTimer = setTimeout(() => {
        const footer = findFooterSection();
        if (footer) {
          footerSectionRef.current = footer;
          observer.observe(footer);
        }
      }, 1000);
      
      return () => {
        clearTimeout(initTimer);
        if (scrollTimeout.current !== null) {
          cancelAnimationFrame(scrollTimeout.current);
          scrollTimeout.current = null;
        }
        window.removeEventListener('scroll', throttledScroll);
        window.removeEventListener('resize', throttledScroll);
        if (observer) {
          observer.disconnect();
        }
      };
    }
    
    // Clean up
    return () => {
      clearTimeout(initTimer);
      if (scrollTimeout.current !== null) {
        cancelAnimationFrame(scrollTimeout.current);
        scrollTimeout.current = null;
      }
      window.removeEventListener('scroll', throttledScroll);
      window.removeEventListener('resize', throttledScroll);
      if (footerSectionRef.current) {
        observer.unobserve(footerSectionRef.current);
      }
      observer.disconnect();
    };
  }, [isVisible]);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          ref={buttonRef}
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, x: 100 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            y: [0, -15, 0],
          }}
          exit={{ opacity: 0, x: 100 }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut"
            },
            x: { duration: 0.3 },
            opacity: { duration: 0.15 } // Faster fade out
          }}
        >
          <SafeLink href={`/${params.locale}/programs/fellowship/apply`} onClick={() => trackEvent('apply_now_click', {
            source_page: 'how_to_apply',
            location: 'button',
            application_type: 'fellowship'
          })}>
            <Button 
              className="bg-primary-orange hover:bg-primary-orange/90 text-white font-semibold px-6 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              style={{
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
              Apply Now
              <ArrowRightIcon className="w-5 h-5" />
            </Button>
          </SafeLink>
        </motion.div>
      )}
    </AnimatePresence>
  );
};



export default function HowToApplyPage() {
  // Get locale from URL params
  const params = useParams<{ locale: string }>();
  const locale = params.locale as string;
  const bannerRef = useRef<HTMLDivElement>(null);
  type Opportunity = {
    id: string;
    title: string;
    description: string;
  };

  const [featuredOpportunity, setFeaturedOpportunity] = useState<Opportunity | null>(null);

  // Track page view
  useEffect(() => {
    trackPageView('/programs/fellowship/how-to-apply', 'Fellowship How to Apply');
  }, []);

  // Example of how you might get dictionary data if needed
  // const dict = useDictionary(locale);

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <FloatingApplyButton />

      {/* Hero Section */}
      <section className="relative h-[500px] bg-[url('/images/Welcoming.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl md:text-6xl font-bold text-white mb-6"
            >
              Apply by completing our
              <br />
              <span className="text-primary-orange">online application</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-white/90 max-w-2xl mx-auto mb-8"
            >
              Join our fellowship program and become part of Africa's next generation of leaders in sustainable development
            </motion.p>
          </div>
        </div>
      </section>

        <div ref={bannerRef} className="w-full overflow-hidden">
        <div className="flex justify-center">
          <HeaderBelt />
        </div>
      </div>

        {/* Application Status Section */}
        <section className="relative py-20 bg-[url('/images/pattern-bg.png')] bg-repeat">
          <div className="absolute inset-0 bg-white/80"></div>
          <Container className="relative">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center mb-16">Application <span className='text-primary-green'>Process</span></h2>

              <div className="relative">
                {/* Vertical Timeline Line */}
                <div className="absolute left-[28px] top-0 bottom-0 w-1 bg-gradient-to-b from-[#FDB022] to-[#045F3C]"></div>

                {/* Timeline Items */}
                {applicationSteps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.2 }}
                        className="flex gap-8 mb-16 relative"
                    >
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#045F3C] to-[#00A15D] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 z-10 shadow-lg">
                        {step.id}
                      </div>
                      <div className="flex-1 bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                        <h3 className="text-2xl font-semibold text-[#045F3C] mb-3">{step.title}</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                      </div>
                    </motion.div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Eligibility Section */}
        <section className="relative py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="absolute inset-0 bg-[url('/images/dots-pattern.png')] opacity-5"></div>
          <Container className="relative">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-4xl mx-auto"
            >
              <div className="text-center mb-16">
                <h2 className="text-4xl font-bold mb-4">Eligibility</h2>
                <p className="text-gray-600 text-lg">Requirements for the GanzAfrica Fellowship Program</p>
              </div>
              <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
                <div className="space-y-8">
                  {eligibilityCriteria.map((criteria, index) => (
                      <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: index * 0.2 }}
                          className="flex items-start gap-6 relative"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-14 h-14 rounded-full bg-[#FDB022]/10 flex items-center justify-center">
                            <div className="w-4 h-4 rounded-full bg-[#FDB022]"></div>
                          </div>
                        </div>
                        <div>
                          <h3 className="text-2xl font-semibold text-[#045F3C] mb-3">{criteria.title}</h3>
                          <p className="text-gray-600 text-lg leading-relaxed">{criteria.description}</p>
                        </div>
                      </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Fellowship Journey Section */}
        <div className="bg-[#FFF9DB] py-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-12">
              <h2 className="text-5xl font-bold text-[#045F3C] relative inline-block tracking-tight">
                FELLOWSHIP JOURNEY
                <div className="absolute -bottom-4 left-0 w-[90%] h-1.5 bg-[#FDB022]"></div>
              </h2>
            </div>

            <div className="relative mt-24">
              {/* Journey Steps Container */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-4 gap-y-16 relative">
                {/* Step 1 */}
                <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0 }}
                >
                  <motion.p
                      className="text-[#045F3C] text-center mb-8 h-20 text-lg max-w-[280px] font-medium"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    High-achieving young professionals are recruited as GanzAfrica fellows
                  </motion.p>
                  <motion.div
                      className="w-28 h-28 rounded-full bg-[#FDB022] flex items-center justify-center relative z-10 shadow-lg"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}
                  >
                    <Users2Icon className="w-14 h-14 text-white" />
                  </motion.div>
                </motion.div>

                {/* Step 2 */}
                <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <motion.p
                      className="text-[#045F3C] text-center mb-8 h-20 text-lg max-w-[280px] font-medium"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 }}
                  >
                    GanzAfrica Academy provides capacity building on data-led approaches and leadership
                  </motion.p>
                  <motion.div
                      className="w-28 h-28 rounded-full bg-[#0000CC] flex items-center justify-center relative z-10 shadow-lg"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.7 }}
                  >
                    <BlocksIcon className="w-14 h-14 text-white" />
                  </motion.div>
                </motion.div>

                {/* Step 3 */}
                <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                  <motion.p
                      className="text-[#045F3C] text-center mb-8 h-20 text-lg max-w-[280px] font-medium"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.8 }}
                  >
                    Fellows are placed in public institutions and empowered to shape policy approaches
                  </motion.p>
                  <motion.div
                      className="w-28 h-28 rounded-full bg-[#00A15D] flex items-center justify-center relative z-10 shadow-lg"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 1 }}
                  >
                    <BriefcaseIcon className="w-14 h-14 text-white" />
                  </motion.div>
                </motion.div>

                {/* Step 4 */}
                <motion.div
                    className="flex flex-col items-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                >
                  <motion.p
                      className="text-[#045F3C] text-center mb-8 h-20 text-lg max-w-[280px] font-medium"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.1 }}
                  >
                    Fellows receive mentorship from experts, advancing their careers, leadership skills, and providing ongoing support
                  </motion.p>
                  <motion.div
                      className="w-28 h-28 rounded-full bg-[#045F3C] flex items-center justify-center relative z-10 shadow-lg"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, damping: 20, delay: 1.3 }}
                  >
                    <UsersIcon className="w-14 h-14 text-white" />
                  </motion.div>
                </motion.div>

                {/* Mobile Vertical Lines */}
                <div className="lg:hidden absolute left-1/2 top-[120px] bottom-0 w-0.5 bg-[#045F3C]"></div>
              </div>
            </div>
          </div>
        </div>

      {/* Floating Apply Now Button */}
      <AnimatePresence>
        <motion.div 
          className="fixed bottom-8 right-8 z-50"
          initial={{ opacity: 0, x: 100 }}
          animate={{ 
            opacity: 1, 
            x: 0,
            y: [0, -15, 0],
          }}
          exit={{ opacity: 0, x: 100 }}
          transition={{
            y: {
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse" as const,
              ease: "easeInOut"
            },
            x: { duration: 0.5 },
            opacity: { duration: 0.5 }
          }}
        >
          <SafeLink href={`/${params.locale}/programs/fellowship/apply`} onClick={() => trackEvent('apply_now_click', {
            source_page: 'how_to_apply',
            location: 'button',
            application_type: 'fellowship'
          })}>
            <Button 
              className="bg-primary-orange hover:bg-primary-orange/90 text-white font-semibold px-6 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
              style={{
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
              }}
            >
              Apply Now
              <ArrowRightIcon className="w-5 h-5" />
            </Button>
          </SafeLink>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};