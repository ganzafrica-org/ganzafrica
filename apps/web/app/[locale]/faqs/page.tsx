"use client";

import React, { useState } from "react";
import Image from "next/image";
import { getDictionary } from "@/lib/get-dictionary";
import { Leaf, Plus, Minus } from "lucide-react";

// FAQ Accordion Component
const FAQAccordionItem = ({
  title,
  content,
}: {
  title: string;
  content?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-200 py-4">
      <button
        className="w-full flex items-center justify-between text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-gray-800 font-medium">{title}</span>
        <span className="flex items-center justify-center w-6 h-6 rounded-full border border-emerald-600">
          {isOpen ? (
            <Minus className="w-4 h-4 text-emerald-600" />
          ) : (
            <Plus className="w-4 h-4 text-emerald-600" />
          )}
        </span>
      </button>
      {isOpen && content && (
        <div className="mt-2 text-gray-600 pr-8">{content}</div>
      )}
    </div>
  );
};

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section with Header */}
      <div
        className="relative h-[500px]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>

        {/* Header with cut-out sections */}
        <header className="relative z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center py-4">
              {/* Logo section with white background cut-out */}
              <div className="relative bg-white p-4 -ml-4 rounded-br-3xl">
                <div className="flex items-center">
                  <Leaf className="h-8 w-8 text-emerald-600" />
                  <span className="ml-2 text-xl font-bold text-emerald-600">
                    GanzAfrica
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full text-center">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Clear <span className="text-yellow-400">Answers</span> to Help You
              <br />
              Get Started
            </h1>
            <div className="text-6xl font-bold text-yellow-400">FAQs</div>
          </div>
        </div>
      </div>

      {/* Yellow Belt Section */}
      <div className="bg-yellow-400 py-4 relative overflow-hidden">
        <div className="flex justify-center items-center">
          <div className="marquee-container overflow-hidden w-full max-w-2xl mx-auto">
            <div className="marquee-content flex whitespace-nowrap animate-marquee">
              <div className="flex space-x-8 px-4 mx-4">
                <span className="text-base font-medium">• Food Systems</span>
                <span className="text-base font-medium">• Data & Evidence</span>
                <span className="text-base font-medium">• Co-creation</span>
                <span className="text-base font-medium">• Data & Evidence</span>
              </div>
              <div className="flex space-x-8 px-4 mx-4">
                <span className="text-base font-medium">• Food Systems</span>
                <span className="text-base font-medium">• Data & Evidence</span>
                <span className="text-base font-medium">• Co-creation</span>
                <span className="text-base font-medium">• Data & Evidence</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FAQ Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid md:grid-cols-12 gap-8">
          {/* Left Column */}
          <div className="md:col-span-4">
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">
              General FAQs
            </h2>
            <p className="text-gray-600 mb-8">
              Everything you need to know about GanzAfrica and how it works.
              Can't find an answer? Chat with our team.
            </p>
          </div>

          {/* Right Column */}
          <div className="md:col-span-8">
            <FAQAccordionItem
              title="What does the GanzAfrica fellowship include?"
              content="Our fellowship program includes rigorous training in data analysis, systems thinking, and evidence-based decision making. Fellows gain practical experience through placement in partner public institutions while receiving mentorship and professional development opportunities."
            />
            <FAQAccordionItem
              title="What does 'institutional transformation' mean?"
              content="Institutional transformation refers to our systematic approach to helping organizations adopt data-driven practices and innovative methodologies to enhance their operational efficiency and impact."
            />
            <FAQAccordionItem
              title="Can other institutions be added as partners?"
              content="Yes, we're always open to new partnerships with institutions that share our vision for agricultural transformation in Africa."
            />
            <FAQAccordionItem
              title="Is there a version for different sectors or regions?"
              content="We currently focus on agricultural transformation across various African regions, with programs tailored to local contexts and needs."
            />
            <FAQAccordionItem
              title="Is there a fellowship program available?"
              content="Yes, we offer regular fellowship programs throughout the year. Applications are accepted during specific intake periods."
            />
          </div>
        </div>

        {/* Program FAQs Section */}
        <div className="grid md:grid-cols-12 gap-8 mt-16">
          <div className="md:col-span-4">
            <h2 className="text-2xl font-bold text-emerald-600 mb-4">
              Program FAQs
            </h2>
            <p className="text-gray-600 mb-8">
              Everything you need to know about our fellowship process and
              placements.
            </p>
          </div>

          <div className="md:col-span-8">
            <FAQAccordionItem
              title="Is it a one-time placement?"
              content="The core fellowship program typically runs for a fixed term, allowing fellows to gain substantive experience in their host institutions. However, many fellows continue relationships with their institutions beyond the formal program period or join our alumni network."
            />
            <FAQAccordionItem
              title="Is there a fellowship program available?"
              content="Yes, we offer multiple fellowship opportunities throughout the year with different focus areas and partner institutions."
            />
            <FAQAccordionItem
              title="Do you have a mentorship program?"
              content="Yes, mentorship is a key component of our fellowship program, pairing fellows with experienced professionals in their field."
            />
            <FAQAccordionItem
              title="How does the placement process work?"
              content="Our placement process matches fellows' skills and interests with partner institutions' needs through a collaborative selection process."
            />
            <FAQAccordionItem
              title="What support is provided during the fellowship?"
              content="Fellows receive comprehensive support including professional development, mentorship, networking opportunities, and regular check-ins with program coordinators."
            />
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-marquee {
          animation: marquee 15s linear infinite;
        }
      `}</style>
    </div>
  );
}
