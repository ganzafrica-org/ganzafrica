'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@workspace/ui/components/button";
import Header from "@/components/layout/header";
import { Container } from "@/components/container";
import { Twitter, Linkedin, Mail, Phone, Users, Blocks, Briefcase, Users2 } from 'lucide-react';
import Image from 'next/image';

interface HowToApplyProps {
  locale: string;
  dict: any;
}

const applicationSteps = [
  {
    id: 1,
    title: "Applications Received",
    description: "Submit your application through our online portal. Make sure to include all required documents and information.",
    image: "/images/application-received.png"
  },
  {
    id: 2,
    title: "Applications Reviewed",
    description: "Our team carefully reviews each application, assessing qualifications, experience, and alignment with our mission.",
    image: "/images/application-review.png"
  },
  {
    id: 3,
    title: "Finalist Chosen",
    description: "Selected candidates proceed to interviews and additional assessments to determine final fellowship recipients.",
    image: "/images/finalist-chosen.png"
  },
  {
    id: 4,
    title: "Fellows Notified",
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

const FellowshipJourney = () => {
  return (
    <div className="w-full bg-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-20">
          GanzAfrica's Promise <span className="text-[#00A15D]">to</span>
          <br />
          <span className="text-[#FDB022]">Fellows:</span>
        </h2>
        <div className="relative">
          {/* Journey Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="flex flex-col items-center text-center relative">
              <p className="text-gray-800 text-lg max-w-[250px] mb-6">
                High-achieving young professionals are recruited as GanzAfrica fellows
              </p>
              <div className="w-[88px] h-[88px] bg-[#00A15D] rounded-full flex items-center justify-center relative z-10">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center text-center relative">
              <div className="w-[88px] h-[88px] bg-[#FDB022] rounded-full flex items-center justify-center mb-6 relative z-10">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <p className="text-gray-800 text-lg max-w-[250px]">
                GanzAfrica Academy provides capacity building on data-led approaches and leadership
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center text-center relative">
              <p className="text-gray-800 text-lg max-w-[250px] mb-6">
                Fellows are placed in public institutions and empowered to shape policy approaches
              </p>
              <div className="w-[88px] h-[88px] bg-[#00A15D] rounded-full flex items-center justify-center relative z-10">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col items-center text-center relative">
              <div className="w-[88px] h-[88px] bg-[#FDB022] rounded-full flex items-center justify-center mb-6 relative z-10">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <p className="text-gray-800 text-lg max-w-[250px]">
                Fellows receive mentorship from experts, advancing their careers, leadership skills, and providing ongoing support
              </p>
            </div>

            {/* Connecting Lines with Curves */}
            <div className="absolute top-[44%] left-[15%] right-[15%] hidden lg:block">
              {/* Main connecting line */}
              <div className="absolute w-full h-0.5 bg-[#00A15D]" />
              
              {/* Curved connectors using SVG */}
              <svg className="absolute left-[20%] -top-4 w-32 h-8" viewBox="0 0 128 32" fill="none">
                <path d="M0 16 C32 16, 96 16, 128 16" stroke="#00A15D" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
              
              <svg className="absolute left-[45%] -top-4 w-32 h-8" viewBox="0 0 128 32" fill="none">
                <path d="M0 16 C32 16, 96 16, 128 16" stroke="#00A15D" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
              
              <svg className="absolute left-[70%] -top-4 w-32 h-8" viewBox="0 0 128 32" fill="none">
                <path d="M0 16 C32 16, 96 16, 128 16" stroke="#00A15D" strokeWidth="2" strokeDasharray="4 4" />
              </svg>
            </div>

            {/* Vertical connectors for mobile */}
            <div className="lg:hidden absolute left-1/2 top-[88px] bottom-0 w-0.5 bg-[#00A15D] -translate-x-1/2">
              <div className="absolute top-0 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-t-2 border-r-2 border-[#00A15D]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function HowToApplyPage({ locale, dict }: HowToApplyProps) {
  const [isNotifying, setIsNotifying] = useState(false);

  const handleNotifyMe = () => {
    setIsNotifying(true);
    // Add notification logic here
    setTimeout(() => setIsNotifying(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header locale={locale} dict={dict} />

      {/* Hero Section */}
      <section className="relative h-[400px] bg-[url('/images/agriculture-bg.jpg')] bg-cover bg-center">
        <div className="absolute inset-0 bg-black/50" />
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
              <span className="text-[#FDB022]">online application</span>
            </motion.h1>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <div className="bg-[#FDB022] py-6">
        <Container>
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[#045F3C] font-semibold">Stay connected for updates via social media.</p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-[#045F3C] hover:text-[#034830] transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="text-[#045F3C] hover:text-[#034830] transition-colors">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-[#045F3C] hover:text-[#034830] transition-colors">
                <Mail className="w-6 h-6" />
              </a>
              <a href="#" className="text-[#045F3C] hover:text-[#034830] transition-colors">
                <Phone className="w-6 h-6" />
              </a>
            </div>
          </div>
        </Container>
      </div>

      {/* Application Status Section */}
      <Container className="py-12">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full">
            <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
            <p>Applications are currently closed</p>
          </div>
          <p className="mt-4 text-gray-600">
            Click here to be notified when the next Cohort opens, for now,
            <br />The Application is <span className="text-red-600">closed</span>.
          </p>
          <Button
            onClick={handleNotifyMe}
            className="mt-6 bg-[#045F3C] hover:bg-[#034830] text-white px-8 py-3"
          >
            {isNotifying ? 'Notifying...' : 'NOTIFY ME'}
          </Button>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-12">What To Expect</h2>
          
          <div className="relative">
            {/* Vertical Timeline Line */}
            <div className="absolute left-[28px] top-0 bottom-0 w-0.5 bg-[#FDB022]"></div>

            {/* Timeline Items */}
            {applicationSteps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                className="flex gap-6 mb-12 relative"
              >
                <div className="w-14 h-14 rounded-full bg-[#045F3C] flex items-center justify-center text-white font-bold text-xl flex-shrink-0 z-10">
                  {step.id}
                </div>
                <div className="flex-1 bg-white rounded-lg p-6 shadow-sm">
                  <h3 className="text-xl font-semibold text-[#045F3C] mb-2">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Container>

      {/* Eligibility Section */}
      <section className="bg-gray-50 py-16">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl font-bold mb-12 text-center">ELIGIBILITY</h2>
            <div className="bg-[#E1F3EC] rounded-lg p-8">
              <div className="space-y-6">
                {eligibilityCriteria.map((criteria, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-2 h-2 rounded-full bg-[#FDB022] mt-2"></div>
                    <div>
                      <h3 className="font-semibold text-[#045F3C]">{criteria.title}</h3>
                      <p className="text-gray-600 mt-1">{criteria.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Fellow Journey Section */}
      <section className="py-16 bg-[#FDB022]/10">
        <Container>
          <h2 className="text-3xl font-bold mb-12 text-center">FELLOW JOURNEY</h2>
          <div className="flex justify-center">
            <Image
              src="/images/fellow-journey.png"
              alt="Fellow Journey"
              width={1000}
              height={300}
              className="object-contain"
            />
          </div>
        </Container>
      </section>

      {/* Add the Fellowship Journey section */}
      <FellowshipJourney />
    </div>
  );
} 