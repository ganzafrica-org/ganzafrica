"use client";

import React, { useState, useEffect } from 'react';
import Container from '@/components/layout/container';
import { DecoratedHeading } from "@/components/layout/headertext";
import { ArrowUpRight, X, Linkedin, Mail, Leaf } from 'lucide-react';
import { default as HeaderBelt } from "@/components/layout/headerBelt";
import apiClient from '@/lib/api-client';
import { trackEvent } from '@/components/analytics/google-analytics';
import {TranslatableText} from "@/components/translate";


// Normalize lucide icon component types across React type versions
type SvgIconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
const XIcon = X as unknown as SvgIconComponent;
const LinkedinIcon = Linkedin as unknown as SvgIconComponent;
const MailIcon = Mail as unknown as SvgIconComponent;
const ArrowUpRightIcon = ArrowUpRight as unknown as SvgIconComponent;
const LeafIcon = Leaf as unknown as SvgIconComponent;

type TeamMember = {
    id: number;
    name: string;
    position: string;
    bio: string;
    photo_url: string;
    team_type: {
        id: number;
        name: string;
    };
    about?: string;
    linkedin?: string;
    email?: string;
    profile_link?: string;
    created_at: string;
};

type TeamType = {
    id: number;
    name: string;
};

type FilterCategory = string;

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

    // Count words in the bio
    const wordCount = member.bio.split(/\s+/).filter(word => word.length > 0).length;
    const shouldScroll = wordCount > 80;

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
                    <XIcon className="w-6 h-6 text-gray-500 transition-transform duration-200 ease-out group-hover:rotate-90" />
                </button>

                {/* Header Section with Image and Info */}
                <div className="p-6 flex items-start gap-6">
                    {/* Profile Image */}
                    <div className="w-[130px] h-[130px] rounded-xl overflow-hidden flex-shrink-0 shadow-lg relative group">
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <img
                            src={member.photo_url}
                            alt={member.name}
                            className="h-full w-full object-cover"
                        />
                    </div>

                    {/* User Info */}
                    <div className="flex-1 pt-2">
                        <h2 className="text-[24px] font-bold text-[#111827] leading-tight mb-2">
                            <TranslatableText>
                                {member.name}
                            </TranslatableText>
                        </h2>
                        <p className="text-[15px] text-[#6B7280] tracking-wide">
                            <TranslatableText>
                                {member.position}
                            </TranslatableText>
                        </p>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="px-6">
                    {/* About Section - With conditional scrolling */}
                    <div className="py-5 border-t border-[#E5E7EB]">
                        <h3 className="text-[18px] font-bold text-[#111827] mb-4 relative inline-block">
                            <TranslatableText>
                                About
                            </TranslatableText>
                            <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary-green rounded-full"></div>
                        </h3>
                        <div
                            className={`text-[15px] text-[#4B5563] leading-[1.7] tracking-wide break-words ${
                                shouldScroll ? 'max-h-[200px] overflow-y-auto custom-scrollbar pr-2' : ''
                            }`}
                        >
                            <p className="whitespace-normal break-words">
                                <TranslatableText>
                                    {member.bio}
                                </TranslatableText>
                            </p>
                        </div>
                    </div>

                    {/* Get In Touch Section */}
                    <div className="py-5 border-t border-[#E5E7EB]">
                        <h3 className="text-[18px] font-bold text-[#111827] mb-4 relative inline-block">
                            <TranslatableText>
                                Get In Touch
                            </TranslatableText>
                            <div className="absolute -bottom-1 left-0 w-12 h-0.5 bg-primary-green rounded-full"></div>
                        </h3>
                        <div className="flex items-center gap-4">
                            {/* Always show LinkedIn icon - conditionally active */}
                            {member.profile_link ? (
                                <a
                                    href={member.profile_link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="group"
                                    onClick={() => trackEvent('team_member_social_click', {
                                        member_name: member.name,
                                        member_position: member.position,
                                        member_team: member.team_type.name,
                                        social_platform: 'linkedin'
                                    })}
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary-orange flex items-center justify-center transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-[#0A66C2]/25 group-hover:-translate-y-0.5">
                                        <LinkedinIcon className="w-5 h-5 text-white" />
                                    </div>
                                </a>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <LinkedinIcon className="w-5 h-5 text-gray-400" />
                                </div>
                            )}

                            {/* Always show Email icon - conditionally active */}
                            {member.email ? (
                                <a
                                    href={`mailto:${member.email}`}
                                    className="group"
                                    onClick={() => trackEvent('team_member_social_click', {
                                        member_name: member.name,
                                        member_position: member.position,
                                        member_team: member.team_type.name,
                                        social_platform: 'email'
                                    })}
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary-green flex items-center justify-center transition-all duration-300 ease-out group-hover:shadow-lg group-hover:shadow-primary-green/25 group-hover:-translate-y-0.5">
                                        <MailIcon className="w-5 h-5 text-white" />
                                    </div>
                                </a>
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <MailIcon className="w-5 h-5 text-gray-400" />
                                </div>
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
        <div className="group h-full px-1.5">
            <div className="relative rounded-xl overflow-hidden transition-all duration-300 ease-out h-full shadow-sm hover:shadow-md">
                {/* Main Card */}
                <div className="relative bg-gray-100 overflow-hidden h-full">
                    {/* Loading Skeleton */}
                    {imageLoading && (
                        <div className="absolute inset-0 bg-gray-200 animate-pulse z-[1]" />
                    )}

                    {/* Image Container - Slightly narrower than square */}
                    <div className="relative aspect-[9/10] w-full">
                        <img
                            src={member.photo_url}
                            alt={member.name}
                            className={`h-full w-full object-cover object-center transition-transform duration-700 ease-out ${
                                imageLoading ? 'opacity-0' : 'opacity-100 group-hover:scale-110 group-hover:rotate-1'
                            }`}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            onLoad={() => setImageLoading(false)}
                            onError={() => setImageLoading(false)}
                        />
                        {/* Optional overlay that appears on hover */}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    </div>

                    {/* Top right arrow button with styled container */}
                    <div className="absolute top-0 right-0 z-10">
                        <div className="bg-white p-2 rounded-bl-xl relative">
                            <button
                                onClick={() => {
                                    onOpenModal();
                                    trackEvent('team_member_view_details', {
                                        member_name: member.name,
                                        member_position: member.position,
                                        member_team: member.team_type.name
                                    });
                                }}
                                aria-label="View team member details"
                                className="w-7 h-7 bg-primary-orange rounded-full flex items-center justify-center transition-all duration-300 ease-out hover:bg-primary-green"
                            >
                                <ArrowUpRightIcon className="w-3.5 h-3.5 text-white transform transition-transform group-hover:rotate-45" strokeWidth={2} />
                            </button>
                        </div>
                    </div>

                    {/* Name and Role section with top-right rounded corner */}
                    <div className="absolute left-0 bottom-0 z-10">
                        <div className="bg-white pt-2.5 pb-2.5 pl-3.5 pr-7 rounded-tr-xl">
                            <h3 className="text-primary-green text-base font-bold leading-tight">
                                {member.name}
                            </h3>
                            <p className="text-gray-600 text-sm mt-0.5">
                                <TranslatableText>
                                    {member.position}
                                </TranslatableText>
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
        onClick={() => {
            onClick();
            trackEvent('team_filter_change', {
                filter_category: label,
                page: 'team'
            });
        }}
        className={`px-5 py-2 rounded-full border text-sm font-medium transition-all duration-300 ${
            active
                ? 'border-primary-green bg-[#E8F5E9] text-primary-green'
                : 'border-primary-green text-primary-green hover:bg-[#E8F5E9]'
        }`}
    >
        <TranslatableText>{label}</TranslatableText>
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

// Function to normalize team type names for case-insensitive comparison
const normalizeTeamTypeName = (name: string): string => {
    // Check if name is undefined or null before calling trim() and toLowerCase()
    if (!name) return '';
    return name.trim().toLowerCase() || '';
};

const TeamPage = (): JSX.Element => {
    const [activeFilter, setActiveFilter] = useState<FilterCategory>('our team'); // Changed default to 'advisory board'
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [teamTypes, setTeamTypes] = useState<TeamType[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Fetch team types for filters
    useEffect(() => {
        const fetchTeamTypes = async () => {
            try {
                const response = await apiClient.get('/team-types');
                console.log('Team types response:', response.data);

                // Check the structure of the response and extract team types array
                if (response.data && response.data.teamTypes && Array.isArray(response.data.teamTypes)) {
                    // This handles the structure {teamTypes: Array(n)}
                    setTeamTypes(response.data.teamTypes);
                }
                else if (response.data && Array.isArray(response.data.types)) {
                    setTeamTypes(response.data.types);
                }
                else if (Array.isArray(response.data)) {
                    setTeamTypes(response.data);
                }
                else if (response.data && Array.isArray(response.data.team_types)) {
                    setTeamTypes(response.data.team_types);
                }
                else {
                    console.error('Unexpected team types response format:', response.data);
                    // Set default team types if response format is not as expected
                }
            } catch (error) {
                console.error('Error fetching team types:', error);
                setErrorMessage('Failed to load team types. Please try again later.');
            }
        };

        fetchTeamTypes();
    }, []);

    // Fetch team members
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setIsLoading(true);
                const response = await apiClient.get('/teams', { params: { sort_by: 'sort_order', sort_order: 'asc' } });

                if (response.data && response.data.teams) {
                    setTeamMembers(response.data.teams);
                } else {
                    setTeamMembers([]);
                }
                setErrorMessage(null);
            } catch (error) {
                console.error('Error fetching teams:', error);
                setErrorMessage('Failed to load team members. Please try again later.');
                setTeamMembers([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTeams();
    }, []);

    // Filter team members based on selected category
    const filteredMembers = teamMembers.filter(member => {
        if (!member.team_type?.name) return false;

        const teamTypeName = member.team_type.name.trim().toLowerCase();
        const filterName = activeFilter.trim().toLowerCase();

        // Handle common variations
        if ((teamTypeName.includes('advisor') || teamTypeName.includes('board')) &&
            (filterName.includes('advisor') || filterName.includes('board'))) {
            return true;
        }

        if (teamTypeName.includes('team') && filterName.includes('team')) {
            return true;
        }

        if (teamTypeName.includes('mentor') && filterName.includes('mentor')) {
            return true;
        }

        if (teamTypeName.includes('fellow') && filterName.includes('fellow')) {
            return true;
        }

        if ((teamTypeName.includes('alumni') || teamTypeName.includes('alum')) &&
            (filterName.includes('alumni') || filterName.includes('alum'))) {
            return true;
        }

        // Exact match fallback
        return teamTypeName === filterName;
    });

    // Convert team types to filter buttons
    const getFilterButtonLabel = (typeName: string): string => {
        // Capitalize the first letter of each word
        return typeName.split(' ').map(word =>
            word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        ).join(' ');
    };

    // Get appropriate subtitle based on filter
    const getSubtitle = (filter: string): string => {
        const normalizedFilter = normalizeTeamTypeName(filter);

        switch(normalizedFilter) {
            case 'advisory board':
                return 'Our <span class="font-normal">Advisory</span> <span class="font-normal">Board</span>';
            case 'our team':
                return 'Our <span class="font-normal">Core</span> <span class="font-normal">Team</span>';
            case 'mentors':
                return 'Our <span class="font-normal">Program</span> <span class="font-normal">Mentors</span>';
            case 'fellows':
                return 'Our <span class="font-normal">Innovation</span> <span class="font-normal">Fellows</span>';
            case 'alumni':
                return 'Our <span class="font-normal">Program</span> <span class="font-normal">Alumni</span>';
            default:
                return 'Our <span class="font-normal">Team</span> & <span class="font-normal">Advisory Board</span>';
        }
    };

    // Helper function to generate dynamic header text based on active filter
    const getDynamicHeaderText = (filter: string): string => {
        const normalizedFilter = normalizeTeamTypeName(filter);

        switch(normalizedFilter) {
            case 'advisory board':
                return 'Meet Our Advisors';
            case 'our team':
                return 'Meet Our Team';
            case 'mentors':
                return 'Meet Our Mentors';
            case 'fellows':
                return 'Meet Our Fellows';
            case 'alumni':
                return 'Meet Our Alumni';
            default:
                return 'Meet Our Experts';
        }
    };

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
                                    <LeafIcon className="h-8 w-8 text-emerald-600" />
                                    <span className="ml-2 text-xl font-bold text-emerald-600">
                      <TranslatableText>GanzAfrica</TranslatableText>
                  </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Content */}
                <div className="relative z-10 flex items-center justify-center h-full text-center mt-[-50px]">
                    <div className="space-y-8">
                        <div className="text-6xl font-bold text-primary-orange">{getDynamicHeaderText(activeFilter)}</div>
                        <h1 className="text-3xl md:text-5xl text-white"
                            dangerouslySetInnerHTML={{ __html: getSubtitle(activeFilter) }}>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Yellow Belt Section */}
            <HeaderBelt />

            <div className="py-24">
                <Container>
                    {/* Display error message if any */}
                    {errorMessage && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6" role="alert">
                            <span className="block sm:inline">{errorMessage}</span>
                        </div>
                    )}

                    {/* Main Content with Sidebar Layout */}
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Filters Sidebar */}
                        <div className="lg:w-[280px] flex-shrink-0">
                            <div className="lg:sticky lg:top-24">
                                <h2 className="font-medium text-gray-600 mb-6">
                                    <TranslatableText>Filter by Team</TranslatableText>
                                </h2>
                                <div className="grid grid-cols-2 gap-x-3 gap-y-4">
                                    {/* Dynamic filters based on team types from API */}
                                    {Array.isArray(teamTypes) && teamTypes.map((type) => (
                                        <FilterButton
                                            key={type.id}
                                            label={getFilterButtonLabel(type.name)}
                                            active={normalizeTeamTypeName(activeFilter) === normalizeTeamTypeName(type.name)}
                                            onClick={() => setActiveFilter(type.name)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Team Members Content Area */}
                        <div className="flex-1">
                            {isLoading ? (
                                // Loading skeletons
                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-7">
                                    {Array.from({ length: 6 }).map((_, index) => (
                                        <div key={index} className="animate-pulse mx-1">
                                            <div className="bg-gray-200 rounded-[24px] aspect-[9/10]" />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                                        {filteredMembers.map((member) => (
                                            <TeamMemberCard
                                                key={member.id}
                                                member={member}
                                                onOpenModal={() => setSelectedMember(member)}
                                            />
                                        ))}
                                    </div>

                                    {/* Empty State */}
                                    {filteredMembers.length === 0 && (
                                        <div className="text-center py-12">
                                            <p className="text-gray-500 text-lg">
                                                <TranslatableText>No team members found in this category.</TranslatableText>
                                            </p>
                                        </div>
                                    )}
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


        </main>
    );
};

export default TeamPage;