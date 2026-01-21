"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@workspace/ui/components/button";
import { Container } from "@/components/container";
import { Users, Blocks, Briefcase, Users2, ArrowRight, Globe } from 'lucide-react';
import { useParams } from 'next/navigation';
import { default as HeaderBelt } from "@/components/layout/headerBelt";
import Link from 'next/link';
import { useDict } from '@/context/dictionary';
import { TranslatableText } from "./translate";

export default function HowToApplyPageContent() {
  const params = useParams<{ locale: string }>();
  const dict = useDict();

  const heroTitle = dict?.fellowship?.howToApply?.hero?.title || "Apply by completing our";
  const heroEmphasis = dict?.fellowship?.howToApply?.hero?.emphasis || "online application";
  const heroSubtitle = dict?.fellowship?.howToApply?.hero?.subtitle || "Join our fellowship program and become part of Africa's next generation of leaders in sustainable development";

  const defaultSteps = [
    {
      id: 1,
      title: dict?.fellowship?.howToApply?.steps?.[0]?.title || "Fellowship Advertised",
      description: dict?.fellowship?.howToApply?.steps?.[0]?.description || "GanzAfrica Fellowship opportunities are announced through our online channels and partner networks across Africa.",
      image: "/images/fellowship-advertised.png"
    },
    {
      id: 2,
      title: dict?.fellowship?.howToApply?.steps?.[1]?.title || "Applications Received",
      description: dict?.fellowship?.howToApply?.steps?.[1]?.description || "Submit your application through our online portal. Make sure to include all required documents and information.",
      image: "/images/application-received.png"
    },
    {
      id: 3,
      title: dict?.fellowship?.howToApply?.steps?.[2]?.title || "Applications Reviewed",
      description: dict?.fellowship?.howToApply?.steps?.[2]?.description || "Our team carefully reviews each application, assessing qualifications, experience, and alignment with our mission.",
      image: "/images/application-review.png"
    },
    {
      id: 4,
      title: dict?.fellowship?.howToApply?.steps?.[3]?.title || "Interviews Conducted",
      description: dict?.fellowship?.howToApply?.steps?.[3]?.description || "Selected candidates are invited to participate in oral and written interviews to further assess their suitability.",
      image: "/images/interviews-conducted.png"
    },
    {
      id: 5,
      title: dict?.fellowship?.howToApply?.steps?.[4]?.title || "Finalists Selected & Notified",
      description: dict?.fellowship?.howToApply?.steps?.[4]?.description || "Successful candidates are notified and begin their journey with GanzAfrica Fellowship Program.",
      image: "/images/fellows-notified.png"
    }
  ];

  const applicationSteps = dict?.fellowship?.howToApply?.steps ?? defaultSteps;

  const defaultEligibility = [
    {
      title: dict?.fellowship?.howToApply?.eligibility?.[0]?.title || "Up to 27 years old",
      description: dict?.fellowship?.howToApply?.eligibility?.[0]?.description || "Young professionals at the start of their career journey"
    },
    {
      title: dict?.fellowship?.howToApply?.eligibility?.[1]?.title || "A degree in a relevant discipline",
      description: dict?.fellowship?.howToApply?.eligibility?.[1]?.description || "Academic background in agriculture, environmental science, data science, or related fields"
    },
    {
      title: dict?.fellowship?.howToApply?.eligibility?.[2]?.title || "Commitment to leading Africa's transformation",
      description: dict?.fellowship?.howToApply?.eligibility?.[2]?.description || "Demonstrated passion for sustainable development and positive change"
    }
  ];

  const eligibilityCriteria = dict?.fellowship?.howToApply?.eligibility ?? defaultEligibility;

  const FloatingApplyButton = () => {
    const buttonRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(true);
    const scrollTimeout = useRef<number | null>(null);
    const footerSectionRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
      const findFooterSection = () => {
        const headings = Array.from(document.querySelectorAll('h2, h3, h4, h5, h6'));
        const connectSection = headings.find(el => el.textContent?.trim().toLowerCase().includes((dict?.common?.connectWithUs || 'connect with us')));
        if (connectSection) {
          const parentSection = connectSection.closest('section, footer, [class*="footer"], [class*="Footer"]') as HTMLElement;
          return parentSection || document.querySelector('footer') as HTMLElement;
        }
        return document.querySelector('footer, [class*="footer"], [class*="Footer"]') as HTMLElement;
      };

      const handleScroll = () => {
        if (!buttonRef.current) return;
        if (!footerSectionRef.current) {
          footerSectionRef.current = findFooterSection();
          if (!footerSectionRef.current) return;
        }
        const footerRect = footerSectionRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const hideThreshold = viewportHeight * 1.5;
        const distanceToFooter = footerRect.top - viewportHeight;
        const shouldBeVisible = distanceToFooter > hideThreshold || distanceToFooter < 0;
        if (shouldBeVisible !== isVisible) setIsVisible(shouldBeVisible);
      };

      const initTimer = setTimeout(() => {
        footerSectionRef.current = findFooterSection();
        handleScroll();
      }, 300);

      const throttledScroll = () => {
        if (scrollTimeout.current) cancelAnimationFrame(scrollTimeout.current);
        scrollTimeout.current = requestAnimationFrame(handleScroll);
      };

      window.addEventListener('scroll', throttledScroll, { passive: true });
      window.addEventListener('resize', throttledScroll, { passive: true });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) setIsVisible(false);
            else if (window.scrollY + window.innerHeight < entry.boundingClientRect.top + window.scrollY - 200) setIsVisible(true);
          });
        },
        { root: null, rootMargin: '0px', threshold: 0.1 }
      );

      if (footerSectionRef.current) observer.observe(footerSectionRef.current);
      else {
        const retryTimer = setTimeout(() => {
          const footer = findFooterSection();
          if (footer) {
            footerSectionRef.current = footer;
            observer.observe(footer);
          }
        }, 1000);

        return () => {
          clearTimeout(initTimer);
          clearTimeout(retryTimer as unknown as number);
          if (scrollTimeout.current !== null) { cancelAnimationFrame(scrollTimeout.current); scrollTimeout.current = null; }
          window.removeEventListener('scroll', throttledScroll);
          window.removeEventListener('resize', throttledScroll);
          if (observer) observer.disconnect();
        };
      }

      return () => {
        clearTimeout(initTimer);
        if (scrollTimeout.current !== null) { cancelAnimationFrame(scrollTimeout.current); scrollTimeout.current = null; }
        window.removeEventListener('scroll', throttledScroll);
        window.removeEventListener('resize', throttledScroll);
        if (footerSectionRef.current) observer.unobserve(footerSectionRef.current);
        observer.disconnect();
      };
    }, [isVisible, dict]);

    const applyLabel = dict?.fellowship?.howToApply?.applyButton || 'Apply Now';

    return (
      <AnimatePresence>
        {isVisible && (
          <motion.div 
            ref={buttonRef}
            className="fixed bottom-8 right-8 z-50"
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0, y: [0, -15, 0] }}
            exit={{ opacity: 0, x: 100 }}
            transition={{
              y: { duration: 2, repeat: Infinity, repeatType: "reverse" as const, ease: "easeInOut" },
              x: { duration: 0.3 },
              opacity: { duration: 0.15 }
            }}
          >
            <Link href={`/${params.locale}/programs/fellowship/apply`}>
              <Button 
                className="bg-primary-orange hover:bg-primary-orange/90 text-white font-semibold px-6 py-6 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              >
                {applyLabel}
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      <FloatingApplyButton />


      <section className="relative h-[500px] bg-[url('/images/Welcoming.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-4xl md:text-6xl font-bold text-white mb-6">
                <TranslatableText>
                    {heroTitle}
                </TranslatableText>
              <br />
              <span className="text-primary-orange"><TranslatableText>{heroEmphasis}</TranslatableText></span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-xl text-white/90 max-w-2xl mx-auto mb-8">
                <TranslatableText>{heroSubtitle}</TranslatableText>
            </motion.p>
          </div>
        </div>
      </section>

      {/* <div className="w-full overflow-hidden">
        <div className="flex justify-center"> */}
          <HeaderBelt />
        {/* </div> */}
      {/* </div> */}

      <section className="relative py-20 bg-[url('/images/pattern-bg.png')] bg-repeat">
        <div className="absolute inset-0 bg-white/80"></div>
        <Container className="relative">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">
                <TranslatableText>
                    {dict?.fellowship?.howToApply?.applicationProcessTitle || 'Application'}
                </TranslatableText>
                <TranslatableText>{dict?.fellowship?.howToApply?.applicationProcessHighlight || 'Process'}</TranslatableText>
                <span className='text-primary-green'></span></h2>
            <div className="relative">
              <div className="absolute left-[28px] top-0 bottom-0 w-1 bg-gradient-to-b from-[#FDB022] to-[#045F3C]"></div>
              {applicationSteps.map((step: any, index: number) => (
                <motion.div key={step.id} initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} className="flex gap-8 mb-16 relative">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#045F3C] to-[#00A15D] flex items-center justify-center text-white font-bold text-2xl flex-shrink-0 z-10 shadow-lg">{step.id}</div>
                  <div className="flex-1 bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <h3 className="text-2xl font-semibold text-[#045F3C] mb-3"><TranslatableText>{step.title}</TranslatableText></h3>
                    <p className="text-gray-600 text-lg leading-relaxed"><TranslatableText>{step.description}</TranslatableText></p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className="relative py-24 bg-gradient-to-b from-white to-gray-50">
        <div className="absolute inset-0 bg-[url('/images/dots-pattern.png')] opacity-5"></div>
        <Container className="relative">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4"><TranslatableText>{dict?.fellowship?.howToApply?.eligibilityTitle || 'Eligibility'}</TranslatableText></h2>
              <p className="text-gray-600 text-lg"><TranslatableText>{dict?.fellowship?.howToApply?.eligibilitySubtitle || 'Requirements for the GanzAfrica Fellowship Program'}</TranslatableText></p>
            </div>
            <div className="bg-white rounded-2xl p-10 shadow-xl border border-gray-100 hover:shadow-2xl transition-shadow duration-300">
              <div className="space-y-8">
                {eligibilityCriteria.map((criteria: any, index: number) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.2 }} className="flex items-start gap-6 relative">
                    <div className="flex-shrink-0"><div className="w-14 h-14 rounded-full bg-[#FDB022]/10 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-[#FDB022]"></div></div></div>
                    <div>
                      <h3 className="text-2xl font-semibold text-[#045F3C] mb-3"><TranslatableText>{criteria.title}</TranslatableText></h3>
                      <p className="text-gray-600 text-lg leading-relaxed"><TranslatableText>{criteria.description}</TranslatableText></p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      <div className="bg-[#FFF9DB] py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-12"><h2 className="text-5xl font-bold text-[#045F3C] relative inline-block tracking-tight"><TranslatableText>{dict?.fellowship?.howToApply?.journeyTitle || 'FELLOWSHIP JOURNEY'}</TranslatableText><div className="absolute -bottom-4 left-0 w-[90%] h-1.5 bg-[#FDB022]"></div></h2></div>

          <div className="relative mt-24">
            <div className="max-w-7xl grid grid-cols-1 lg:grid-cols-4 gap-x-4 gap-y-16 relative">
              <motion.div className="flex flex-col items-center gap-5" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0 }}>
                <motion.p className="text-[#045F3C] text-center mb-8 h-20 text-md max-w-[280px] font-medium" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}><TranslatableText>{dict?.fellowship?.howToApply?.journey?.[0] || 'High-achieving young professionals are recruited as GanzAfrica fellows'}</TranslatableText></motion.p>
                <motion.div className="w-28 h-28 rounded-full bg-[#FDB022] flex items-center justify-center relative z-10 shadow-lg" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.4 }}><Users2 className="w-14 h-14 text-white" /></motion.div>
              </motion.div>

              <motion.div className="flex flex-col items-center gap-5 " initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
                <motion.p className="text-[#045F3C] text-center mb-8 h-20 text-md max-w-[280px] font-medium" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}><TranslatableText>{dict?.fellowship?.howToApply?.journey?.[1] || 'GanzAfrica Academy provides capacity building on data-led approaches and leadership'}</TranslatableText></motion.p>
                <motion.div className="w-28 h-28 rounded-full bg-[#0000CC] flex items-center justify-center relative z-10 shadow-lg" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.7 }}><Blocks className="w-14 h-14 text-white" /></motion.div>
              </motion.div>

              <motion.div className="flex flex-col items-center gap-5 " initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}>
                <motion.p className="text-[#045F3C] text-center mb-8 h-20 text-md max-w-[280px] font-medium" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.8 }}><TranslatableText>{dict?.fellowship?.howToApply?.journey?.[2] || 'Fellows are placed in public institutions and empowered to shape policy approaches'}</TranslatableText></motion.p>
                <motion.div className="w-28 h-28 rounded-full bg-[#00A15D] flex items-center justify-center relative z-10 shadow-lg" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 1 }}><Briefcase className="w-14 h-14 text-white" /></motion.div>
              </motion.div>

              <motion.div className="flex flex-col items-center gap-5 " initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }}>
                <motion.p className="text-[#045F3C] text-center mb-8 h-20 text-md max-w-[280px] font-medium" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1.1 }}><TranslatableText>{dict?.fellowship?.howToApply?.journey?.[3] || 'Fellows receive mentorship from experts, advancing their careers, leadership skills, and providing ongoing support'}</TranslatableText></motion.p>
                <motion.div className="w-28 h-28 rounded-full bg-[#045F3C] flex items-center justify-center relative z-10 shadow-lg" initial={{ scale: 0 }} whileInView={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20, delay: 1.3 }}><Users className="w-14 h-14 text-white" /></motion.div>
              </motion.div>

              <div className="lg:hidden absolute left-1/2 top-[120px] bottom-0 w-0.5 bg-[#045F3C]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
