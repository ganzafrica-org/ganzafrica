"use client";

import React, { useState, useEffect } from 'react';
import Container from '@/components/layout/container';
import { DecoratedHeading } from "@/components/layout/headertext";
import Image from 'next/image';
import { ArrowUpRight, X, Linkedin, Mail, Leaf } from 'lucide-react';
import { default as HeaderBelt } from "@/components/layout/headerBelt";

type TeamMember = {
  id: number;
  name: string;
  role: string;
  image: string;
  category: 'fellows' | 'mentors' | 'alumni' | 'advisory';
  about: string;
  linkedin?: string;
  twitter?: string;
  email?: string;
};

type FilterCategory = 'all' | 'our-team' | 'mentors' | 'fellows' | 'alumni' | 'advisory';

const TeamMemberModal = ({ 
  member, 
  isOpen, 
  onClose 
}: { 
  member: TeamMember; 
  isOpen: boolean; 
  onClose: () => void;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl w-full max-w-[580px] overflow-hidden relative shadow-[0_8px_32px_rgba(0,0,0,0.12)] transform transition-all duration-500 ease-out" 
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 hover:bg-gray-100 rounded-full transition-all duration-200 ease-in-out z-10 group"
        >
          <X className="w-6 h-6 text-gray-500 transition-transform duration-200 ease-out group-hover:rotate-90" />
        </button>

        {/* Header Section with Image and Info */}
        <div className="p-6 flex items-start gap-6">
          {/* Profile Image */}
          <div className="w-[160px] h-[160px] rounded-xl overflow-hidden flex-shrink-0 shadow-lg relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Image
              src={member.image}
              alt={member.name}
              width={160}
              height={160}
              className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
              priority
            />
          </div>

          {/* User Info */}
          <div className="flex-1 pt-2">
            <h2 className="text-[28px] font-bold text-[#111827] leading-tight mb-2">
              {member.name}
            </h2>
            <p className="text-[17px] text-[#6B7280] tracking-wide">
              {member.role}
            </p>
          </div>
        </div>

        {/* Content Sections */}
        <div className="px-6">
          {/* About Section */}
          <div className="py-5 border-t border-[#E5E7EB]">
            <h3 className="text-[18px] font-bold text-[#111827] mb-4 relative inline-block">
              About
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary-green rounded-full"></div>
            </h3>
            <div className="max-h-[180px] overflow-y-auto custom-scrollbar pr-2">
              <p className="text-[15px] text-[#4B5563] leading-[1.7] tracking-wide">
                {member.about}
              </p>
            </div>
          </div>

          {/* Get In Touch Section */}
          <div className="py-5 border-t border-[#E5E7EB]">
            <h3 className="text-[18px] font-bold text-[#111827] mb-4 relative inline-block">
              Get In Touch
              <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary-green rounded-full"></div>
            </h3>
            <div className="flex items-center gap-4">
              {member.linkedin && (
                <a 
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#0A66C2] flex items-center justify-center transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-[#0A66C2]/25 group-hover:-translate-y-0.5">
                    <Linkedin className="w-5 h-5 text-white" />
                  </div>
                </a>
              )}
              {member.twitter && (
                <a 
                  href={member.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group"
                >
                  <div className="w-10 h-10 rounded-full bg-[#14171A] flex items-center justify-center transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-[#14171A]/25 group-hover:-translate-y-0.5">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                </a>
              )}
              {member.email && (
                <a 
                  href={`mailto:${member.email}`}
                  className="group"
                >
                  <div className="w-10 h-10 rounded-full bg-primary-green flex items-center justify-center transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-primary-green/25 group-hover:-translate-y-0.5">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Padding */}
        <div className="h-6"></div>
      </div>
    </div>
  );
};

const TeamMemberCard = ({ member, onOpenModal }: { member: TeamMember; onOpenModal: () => void }) => {
  const [imageLoading, setImageLoading] = useState(true);
  return (
      <div className="group h-full">
        <div className="relative rounded-xl overflow-hidden transition-all duration-300 ease-out h-full shadow-sm hover:shadow-md">
          {/* Main Card */}
          <div className="relative bg-gray-100 overflow-hidden h-full">
            {/* Loading Skeleton */}
            {imageLoading && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse z-[1]" />
            )}

            {/* Image Container */}
            <div className="relative aspect-[3/4] w-full">
              <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className={`object-cover object-center transition-transform duration-700 ease-out ${
                      imageLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-110 group-hover:rotate-1'
                  }`}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  priority={member.id <= 4}
                  onLoadingComplete={() => setImageLoading(false)}
              />
              {/* Optional overlay that appears on hover */}
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
            </div>

            {/* Top right arrow button with styled container */}
            <div className="absolute top-0 right-0 z-10">
              <div className="bg-white p-2 rounded-bl-xl relative">
                <button
                    onClick={onOpenModal}
                    aria-label="View team member details"
                    className="w-8 h-8 bg-primary-orange rounded-full flex items-center justify-center transition-all duration-300 ease-out hover:bg-primary-green"
                >
                  <ArrowUpRight className="w-4 h-4 text-white transform transition-transform group-hover:rotate-45" strokeWidth={2} />
                </button>
              </div>
            </div>

            {/* Name and Role section with top-right rounded corner */}
            <div className="absolute left-0 bottom-0 z-10">
              <div className="bg-white pt-3 pb-3 pl-4 pr-8 rounded-tr-xl">
                <h3 className="text-primary-green text-lg font-bold leading-tight">
                  {member.name}
                </h3>
                <p className="text-gray-600 text-sm mt-0.5">
                  {member.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

const FilterButton = ({ 
  label, 
  active, 
  onClick 
}: { 
  label: string; 
  active: boolean; 
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${
      active 
        ? 'border-primary-green bg-[#E8F5E9] text-primary-green' 
        : 'border-primary-green text-primary-green hover:bg-[#E8F5E9]'
    }`}
  >
    {label}
  </button>
);

// Update scrollbar styles with more polish
const styles = `
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #E5E7EB transparent;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }

  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
    border-radius: 20px;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #E5E7EB;
    border-radius: 20px;
    transition: background-color 0.3s ease;
  }

  .custom-scrollbar:hover::-webkit-scrollbar-thumb {
    background-color: #D1D5DB;
  }

  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #9CA3AF;
  }
`;

// Add the styles to the document
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style");
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

const TeamPage: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('advisory'); // Default to 'advisory' as requested
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Sarah Anderson",
      role: "Executive Director",
      image: "/images/team-members-1.jpg",
      category: "fellows",
      about: "Sarah Anderson is a visionary leader with over 15 years of experience in sustainable development and agricultural innovation. Her passion for empowering rural communities through technology and education has led to the successful implementation of numerous impactful programs across Africa.\n\nUnder her leadership, our organization has established strong partnerships with local communities, government agencies, and international organizations, creating sustainable solutions for agricultural challenges. Sarah's approach combines traditional farming wisdom with modern technological innovations.\n\nShe holds a Master's degree in Agricultural Economics and has been recognized with several awards for her contributions to sustainable agriculture and community development.",
      linkedin: "https://linkedin.com/in/sarah-anderson",
      twitter: "https://twitter.com/sarahanderson",
      email: "sarah.anderson@ganzafrica.org"
    },
    {
      id: 2,
      name: "David Kimani",
      role: "Agricultural Innovation Lead",
      image: "/images/team-members-2.jpg",
      category: "fellows",
      about: "David Kimani brings over a decade of hands-on experience in agricultural innovation and sustainable farming practices. His expertise in developing resilient farming systems has helped thousands of farmers across East Africa improve their yields and livelihoods.\n\nAs our Agricultural Innovation Lead, David focuses on integrating traditional farming knowledge with modern sustainable practices. He has successfully implemented several pilot programs that have shown remarkable results in improving crop yields while maintaining environmental sustainability.",
      linkedin: "https://linkedin.com/in/david-kimani",
      twitter: "https://twitter.com/davidkimani",
      email: "david.kimani@ganzafrica.org"
    },
    {
      id: 3,
      name: "Mary Njeri",
      role: "Community Engagement Manager",
      image: "/images/mary.jpg",
      category: "fellows",
      about: "Mary Njeri is a dedicated community engagement specialist with a deep understanding of rural development and community mobilization. Her work focuses on building strong relationships between our organization and local communities, ensuring that our programs are truly responsive to community needs and aspirations.",
      linkedin: "https://linkedin.com/in/mary-njeri",
      email: "mary.njeri@ganzafrica.org"
    },
    {
      id: 4,
      name: "James Ochieng",
      role: "Technology Solutions Director",
      image: "/images/team-group-photo.jpg",
      category: "mentors",
      about: "James Ochieng leads our technology initiatives, bringing innovative solutions to agricultural challenges. With a background in both software development and agriculture, he bridges the gap between traditional farming and modern technology.",
      linkedin: "https://linkedin.com/in/james-ochieng",
      twitter: "https://twitter.com/jamesochieng",
      email: "james.ochieng@ganzafrica.org"
    },
    {
      id: 5,
      name: "Dr. Elizabeth Wangari",
      role: "Research Advisory Board Chair",
      image: "/images/team.png",
      category: "advisory",
      about: "Dr. Elizabeth Wangari is a renowned agricultural researcher with over 20 years of experience in sustainable farming practices and climate-resilient agriculture. She leads our advisory board in providing strategic guidance for research initiatives and program development.",
      linkedin: "https://linkedin.com/in/elizabeth-wangari",
      email: "elizabeth.wangari@ganzafrica.org"
    },
    {
      id: 6,
      name: "John Mwangi",
      role: "Alumni Network Lead",
      image: "/images/team.webp",
      category: "alumni",
      about: "John Mwangi, a former fellow, now leads our growing alumni network, connecting past participants with current initiatives and fostering collaboration across our community.",
      linkedin: "https://linkedin.com/in/john-mwangi",
      twitter: "https://twitter.com/johnmwangi",
      email: "john.mwangi@ganzafrica.org"
    },
    {
      id: 7,
      name: "Grace Achieng",
      role: "Sustainable Agriculture Mentor",
      image: "/images/team-members-2.jpg",
      category: "mentors",
      about: "Grace Achieng brings extensive experience in sustainable agriculture and farmer education. She mentors our fellows in implementing eco-friendly farming practices.",
      linkedin: "https://linkedin.com/in/grace-achieng",
      email: "grace.achieng@ganzafrica.org"
    },
    {
      id: 8,
      name: "Dr. Thomas Mutua",
      role: "Technical Advisory Member",
      image: "/images/team-group-photo.jpg",
      category: "advisory",
      about: "Dr. Thomas Mutua specializes in agricultural technology and innovation. His expertise helps guide our technical initiatives and digital transformation projects.",
      linkedin: "https://linkedin.com/in/thomas-mutua",
      twitter: "https://twitter.com/thomasmutua",
      email: "thomas.mutua@ganzafrica.org"
    }
  ];

  const filteredMembers = teamMembers.filter(member => 
    activeFilter === 'all' ? true : 
    activeFilter === 'our-team' ? ['fellows', 'mentors'].includes(member.category) :
    member.category === activeFilter
  );

  return (
    <main className="bg-background min-h-screen">
      {/* Hero Section with Header */}
      <div className="relative h-[500px]"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1560493676-04071c5f467b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}>
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
                  <span className="ml-2 text-xl font-bold text-emerald-600">GanzAfrica</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <div className="relative z-10 flex items-center justify-center h-full text-center">
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl text-white">
              Our <span className="text-yellow-400 font-bold">Team</span> & <span className='text-yellow-400 font-bold'>Advisory</span><br />
              Board
            </h1>
            <div className="text-6xl font-bold text-yellow-400">Members</div>
          </div>
        </div>
      </div>

      {/* Yellow Belt Section */}
      <HeaderBelt />

      <div className="py-24">
        <Container>
          {/* Main Content with Sidebar Layout */}
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Filters Sidebar */}
            <div className="lg:w-[280px] flex-shrink-0">
              <div className="lg:sticky lg:top-24">
                <h2 className="font-medium text-gray-600 mb-6">Filter by Team</h2>
                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                  {/* Reordered filter buttons according to requirements */}
                  <FilterButton
                    label="All Members"
                    active={activeFilter === 'all'}
                    onClick={() => setActiveFilter('all')}
                  />
                  <FilterButton
                    label="Advisory Board"
                    active={activeFilter === 'advisory'}
                    onClick={() => setActiveFilter('advisory')}
                  />
                  <FilterButton
                    label="Our Team"
                    active={activeFilter === 'our-team'}
                    onClick={() => setActiveFilter('our-team')}
                  />
                  <FilterButton
                    label="Mentors"
                    active={activeFilter === 'mentors'}
                    onClick={() => setActiveFilter('mentors')}
                  />
                  <FilterButton
                    label="Fellows"
                    active={activeFilter === 'fellows'}
                    onClick={() => setActiveFilter('fellows')}
                  />
                  <FilterButton
                    label="Alumni"
                    active={activeFilter === 'alumni'}
                    onClick={() => setActiveFilter('alumni')}
                  />
                </div>
              </div>
            </div>

            {/* Team Members Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-gray-200 rounded-[24px] aspect-[3/4]" />
                    </div>
                  ))
                ) : (
                  filteredMembers.map((member) => (
                    <TeamMemberCard 
                      key={member.id} 
                      member={member}
                      onOpenModal={() => setSelectedMember(member)}
                    />
                  ))
                )}
              </div>
              
              {/* Empty State */}
              {!isLoading && filteredMembers.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No team members found in this category.</p>
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>

      {/* Modal */}
      {selectedMember && (
        <TeamMemberModal
          member={selectedMember}
          isOpen={!!selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}

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
    </main>
  );
};

export default TeamPage;