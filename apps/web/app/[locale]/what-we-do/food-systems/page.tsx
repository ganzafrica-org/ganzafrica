"use client";

import React from 'react';
import Image from 'next/image';
import Container from '@/components/layout/container';
import { DecoratedHeading } from "@/components/layout/headertext";
import { Leaf, Globe, Sprout } from 'lucide-react';

// Separate client components
const CategoryCard = ({ 
  icon: Icon, 
  title, 
  description, 
  borderColor, 
  iconBgColor 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
  borderColor: string;
  iconBgColor: string;
}) => (
  <div 
    className={`flex items-start gap-4 p-6 bg-white rounded-lg shadow-md border-l-8 ${borderColor}`}
  >
    <div className={`w-12 h-12 rounded-full ${iconBgColor} flex items-center justify-center flex-shrink-0`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <h3 className="font-bold-caption text-primary-green mb-2">{title}</h3>
      <p className="font-regular-paragraph text-gray">{description}</p>
    </div>
  </div>
);

const ApproachCard = ({
  title,
  description
}: {
  title: string;
  description: string;
}) => (
  <div className="bg-white rounded-xl shadow-lg overflow-hidden">
    <div className="relative h-48 overflow-hidden">
      <Image
        src="/images/maize.avif"
        alt={title}
        layout="fill"
        objectFit="cover"
      />
    </div>
    <div className="p-6">
      <h3 className="font-bold-caption text-primary-green mb-4">{title}</h3>
      <p className="font-regular-paragraph text-gray">{description}</p>
    </div>
  </div>
);

const CategoryCards = () => (
  <div className="space-y-6">
    <CategoryCard
      icon={Leaf}
      title="Land Management"
      description="Sustainable land use is vital for food security, environmental resilience, and economic growth."
      borderColor="border-primary-orange"
      iconBgColor="bg-primary-orange"
    />

    <CategoryCard
      icon={Globe}
      title="Environment"
      description="Promoting environmental sustainability through climate resilience and ecosystem restoration."
      borderColor="border-primary-green"
      iconBgColor="bg-primary-green"
    />

    <CategoryCard
      icon={Sprout}
      title="Agriculture"
      description="Leading efforts to make agriculture more productive, innovative, and inclusive."
      borderColor="border-primary-orange"
      iconBgColor="bg-primary-orange"
    />
  </div>
);

const Index = () => {
  return (
    <main className="bg-background">
      {/* Hero Section */}
      <section className="bg-primary-green text-white py-20">
        <Container>
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="font-h1 mb-6">Food System</h1>
            <p className="font-medium-caption">
              Building a sustainable and resilient food system for Africa's future generations.
            </p>
          </div>
        </Container>
      </section>

      {/* Main Content Section */}
      <section className="py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div>
              <div className="mb-6">
                <DecoratedHeading
                  firstText="Food System"
                  secondText="Sustainable Future"
                  firstTextColor="text-primary-green"
                  secondTextColor="text-primary-orange"
                  borderColor="border-primary-orange"
                  cornerColor="bg-primary-orange"
                />
              </div>
              <p className="font-regular-paragraph text-gray mb-8">
                At GanzAfrica, we are committed to shaping a sustainable and prosperous Africa by empowering youth through training, mentorship, and placement programs in the fields of land management, environmental sustainability, and agriculture.
              </p>
              <button className="bg-primary-orange text-white px-8 py-3 rounded-lg shadow-md font-medium-paragraph">
                Check Out Our Projects
              </button>
            </div>

            {/* Right Column - Category Cards */}
            <CategoryCards />
          </div>
        </Container>
      </section>

      {/* Our Approach Section */}
      <section className="relative">
        <div className="absolute inset-0 h-[60%] bg-gradient-to-b bg-yellow-lighter "></div>
        <Container className="relative z-10 py-24">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="flex justify-center mb-8">
              <DecoratedHeading
                firstText="Our"
                secondText="Approach"
                firstTextColor="text-primary-green"
                secondTextColor="text-primary-orange"
                borderColor="border-primary-orange"
                cornerColor="bg-primary-orange"
              />
            </div>
            <p className="font-regular-paragraph text-gray">
              Through a holistic approach that integrates knowledge, innovation, and policy engagement, we equip future leaders to drive meaningful change.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ApproachCard
              title="Empowering Future Leaders"
              description="Equipping youth with knowledge, skills, and opportunities to drive meaningful change in food systems."
            />

            <ApproachCard
              title="A Holistic Approach to Sustainability"
              description="Combining education, innovation, and policy engagement for sustainable solutions."
            />

            <ApproachCard
              title="Building Resilient Food Systems"
              description="Creating resilient food systems that support communities and future generations."
            />
          </div>
        </Container>
      </section>
    </main>
  );
};

export default Index;