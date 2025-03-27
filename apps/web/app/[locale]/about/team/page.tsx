"use client";

import { useState, useEffect } from 'react';
import Container from '@/components/layout/container';
import { DecoratedHeading } from "@/components/layout/headertext";
import Image from 'next/image';
import { ArrowUpRight, X, Linkedin, Mail } from 'lucide-react';

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

interface TeamMemberModalProps {
  member: TeamMember; 
  isOpen: boolean; 
  onClose: () => void;
}

const TeamMemberModal = ({ 
  member, 
  isOpen, 
  onClose 
}: TeamMemberModalProps): JSX.Element | null => {
  if (!isOpen) return null;

  return (
          <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" 
        onClick={onClose}
        aria-modal="true"
        role="dialog"
      >
      <div 
        className="bg-white rounded-xl w-full max-w-[580px] overflow-hidden relative shadow-lg transform transition-all duration-500 ease-out" 
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
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
        {/* Bottom Padding */}
        <div className="h-6"></div>
      </div>
    </div>
  );
};

interface TeamMemberCardProps {
  member: TeamMember; 
  onOpenModal: () => void;
}

const TeamMemberCard = ({ 
  member, 
  onOpenModal 
}: TeamMemberCardProps): JSX.Element => {
  const [imageLoading, setImageLoading] = useState(true);

  return (
    <div className="group">
      <div className="relative bg-[#F5F5F5] rounded-[24px] overflow-hidden transition-all duration-500 ease-out hover:-translate-y-2 hover:shadow-2xl">
        <div className="relative w-full aspect-[4/4.8]">
          {/* Loading Skeleton */}
          {imageLoading && (
            <div className="absolute inset-0 bg-gray-200 animate-pulse z-[1]" />
          )}
          
          {/* Image Container */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-[1]" />
            <Image
              src={member.image}
              alt={member.name}
              fill
              className={`object-cover object-center transition-all duration-700 ease-out ${
                imageLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-[1.08]'
              }`}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              priority={member.id <= 4}
              onLoadingComplete={() => setImageLoading(false)}
            />
          </div>

          {/* Top Right Cutout with Button */}
          <div className="absolute -top-[1%] -right-[1%] z-[2]">
            <div className="relative">
              <div className="absolute -inset-4 bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)]" />
              <button
                onClick={onOpenModal}
                aria-label="View team member details"
                className="relative w-12 h-12 rounded-full bg-primary-orange flex items-center justify-center cursor-pointer transform transition-all duration-300 ease-out hover:scale-110 hover:rotate-12 hover:bg-primary-green shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-10"
              >
                <ArrowUpRight className="w-6 h-6 text-white transition-transform duration-300 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Name Section with Rounded Rectangle */}
          <div className="absolute -left-[5%] -bottom-[5%] w-[78%] z-[2]">
            <div className="relative bg-white rounded-2xl py-5 px-8 shadow-[0_8px_32px_rgba(0,0,0,0.06)] transition-transform duration-500 ease-out group-hover:translate-x-2">
              <h3 className="font-bold text-[22px] leading-tight text-primary-green mb-2">{member.name}</h3>
              <p className="text-gray-600 text-base font-medium tracking-wide opacity-90">{member.role}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface FilterButtonProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

const FilterButton = ({ 
  label, 
  active, 
  onClick 
}: FilterButtonProps): JSX.Element => (
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
// Use a client-side effect to add the scrollbar styles
const useScrollbarStyles = (): void => {
  useEffect(() => {
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

    const styleSheet = document.createElement("style");
    styleSheet.innerText = styles;
    document.head.appendChild(styleSheet);

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, []);
};

const TeamPage = (): JSX.Element => {
  // Apply scrollbar styles
  useScrollbarStyles();
  
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
            <span className="font-bold">Empowering</span> <span className="font-normal">Africa's Future</span><br />
            <span className="font-normal">Through</span> <span className="font-bold">Transformative</span>
          </h1>
          <h2 className="text-primary-orange text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-wider mt-6">
          COMMUNITY
          </h2>
        </div>
      </section>

      <Container>
        <div className="py-24">
          {/* Header */}
          <div className="text-center mb-16">
            <DecoratedHeading
              firstText="Our"
              secondText="Team"
              firstTextColor="text-primary-green"
              secondTextColor="text-primary-orange"
              borderColor="border-primary-orange"
              cornerColor="bg-primary-orange"
            />
            <p className="mt-6 text-gray-600 text-lg max-w-2xl mx-auto">
              Meet our dedicated team of professionals working to transform agricultural practices and empower communities across Africa.
            </p>
          </div>

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
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {isLoading ? (
                  // Loading skeletons
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={`skeleton-${index}`} className="animate-pulse">
                      <div className="bg-gray-200 rounded-[24px] aspect-[4/4.8]" />
                    </div>
                  ))
                ) : (
                  filteredMembers.map((member) => (
                    <TeamMemberCard 
                      key={`member-${member.id}`} 
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
        </div>
      </Container>

      {/* Modal */}
      <TeamMemberModal
        member={selectedMember!}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
      />
    </main>
  );
};

export default TeamPage;