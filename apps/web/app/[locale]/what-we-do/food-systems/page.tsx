"use client"

import React, { useEffect, useRef } from 'react';
import { Leaf, Globe, Sprout } from 'lucide-react';
import Container from '@/components/layout/container';
import SectionTitle from '@/components/layout/SectionTitle';
import {Card} from '@/components/layout/card';
import CategoryCard from '@/components/layout/CategoryCard';
// import { BANNER_IMAGE, HANDS_IMAGE, PLANT_IMAGE, FARM_IMAGE } from '../../public/images';
import Image from 'next/image';


const Index = () => {
  // References for animation triggers
  const heroRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const approachRef = useRef<HTMLDivElement>(null);


  // Observer for scroll animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1,
    };


    const handleIntersect = (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    };


    const observer = new IntersectionObserver(handleIntersect, observerOptions);
   
    const refs = [heroRef, aboutRef, categoriesRef, approachRef];
   
    refs.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });


    return () => {
      refs.forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);


  return (
    <main className="bg-white overflow-hidden">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="bg-green text-white py-20"
      >
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold tracking-tight mb-6 opacity-0 animate-fade-in" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              Food System
            </h1>
            <p className="text-xl opacity-0 animate-fade-in-up" style={{ animationDelay: '0.4s', animationFillMode: 'forwards' }}>
              Building a sustainable and resilient food system for Africa's future generations.
            </p>
          </div>
        </Container>
      </section>


      {/* Main Content Section with Two Columns */}
      <section className="py-16 lg:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Left Column: Food System Banner - Centered vertically */}
            <div className="" style={{ animationDelay: '0.2s', animationFillMode: 'forwards' }}>
              <div className="space-y-6 max-w-lg mx-auto">
                <h2 className="text-3xl font-bold text-center">
                  <span className="text-green">Food System</span>{' '}
                  <span className="text-yellow-400">Sustainable Future</span>
                </h2>
                <p className="text-black text-center">
                  At GanzAfrica, we are committed to shaping a sustainable and prosperous Africa by empowering youth through training, mentorship, and placement programs in the fields of land management, environmental sustainability, and agriculture. Our holistic approach integrates knowledge, innovation, and policy engagement to build future leaders who can drive meaningful change in Africa's food systems.
                </p>
                <div className="flex justify-center mt-6">
                  <button className="bg-yellow-400 hover:bg-yellow-light text-white font-semibold py-2 px-6 rounded-md transition-all duration-300 shadow-sm">
                    Check Out Our Projects
                  </button>
                </div>
              </div>
            </div>


            {/* Right Column: Categories Section */}
            <div ref={categoriesRef} className="flex flex-col justify-center">
              <SectionTitle
                title={<>Transforming Food Systems for a <span className="text-yellow">Sustainable Future</span></>}
                className="mb-8"
              />
              <div className="space-y-6">
                {/* Land Management Card */}
                <CategoryCard
                  title="Land Management"
                  description="Sustainable land use is vital for food security, environmental resilience, and economic growth. GanzAfrica advocates for equitable land policies to empower youth, farmers, and marginalized communities."
                  icon={<Leaf className="w-5 h-5 text-white " />}
                  color="yellow-400"
                />


                {/* Environment Card */}
                <CategoryCard
                  title="Environment"
                  description="GanzAfrica promotes environmental sustainability by training youth in climate resilience, sustainable land and water management, and ecosystem restoration to build a greener, more resilient Africa."
                  icon={<Globe className="w-5 h-5 text-white" />}
                  color="primary-green"
                />


                {/* Agriculture Card */}
                <CategoryCard
                  title="Agriculture"
                  description="Agriculture is the largest employer in Africa, and GanzAfrica is leading efforts to make it more productive, innovative, and inclusive. We provide hands-on training in modern farming techniques."
                  icon={<Sprout className="w-5 h-5 text-white" />}
                  color="yellow-400"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>




  {/* Our Approach Section */}
  <section ref={approachRef} className="py-16 lg:py-24 relative">
        <div className="absolute top-0 left-0 right-0 h-1/2 bg-yellow-50"></div>
        <Container className="relative z-10">
          <SectionTitle
            title={
              <>
                Our <span className="text-gradient bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-primary-green">Approach</span>
              </>
            }
            subtitle="At GanzAfrica, we are committed to shaping a sustainable and prosperous Africa by empowering youth through training, mentorship, and hands-on experience."
            centered={true}
            className="mb-16"
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-black">
            {/* Card 1 */}
            <Card
              title="Empowering Future Leaders"
              description="At GanzAfrica, we are committed to shaping a sustainable and prosperous Africa by equipping youth with the knowledge, skills, and opportunities needed to drive meaningful change in food systems."
              icon={
                <img
                  src="/images/hero-test.jpg"
                  alt="Empowering Future Leaders"
                  className="w-full h-full object-cover"
                />
              }
              className="border-b-4 border-yellow bg-white"
              iconBgColor="bg-primary-green"
            />

            {/* Card 2 */}
            <Card
              title="A Holistic Approach to Sustainability"
              description="Our approach combines education, innovation, and policy engagement to develop solutions for sustainable agriculture, environmental conservation, and land management."
              icon={
                <img
                  src="/images/hero-test.jpg"
                  alt="Holistic Approach"
                  className="w-full h-full object-cover"
                />
              }
              className="border-b-4 border-primary-green bg-white"
              iconBgColor="bg-yellow"
            />

            {/* Card 3 */}
            <Card
              title="Building Resilient Food Systems"
              description="By focusing on land management, environmental sustainability, and modern agriculture, we aim to create resilient food systems that support communities and future generations."
              icon={
                <img
                  src="/images/hero-test.jpg"
                  alt="Resilient Food Systems"
                  className="w-full h-full object-cover"
                />
              }
              className="border-b-4 border-yellow bg-white"
              iconBgColor="bg-primary-green"
            />
          </div>
        </Container>
      </section>

    </main>
  );
};


export default Index;