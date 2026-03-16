'use client';

import React, { useState, useEffect } from 'react';
import { DecoratedHeading } from '@/components/layout/headertext';
import apiClient from '@/lib/api-client';

// Interface for the partner data from the API
interface Partner {
    id: number;
    name: string;
    logo: string;
    website_url: string;
    location: string;
    created_at: string;
    updated_at: string;
}

// Interface for the API response
interface PartnersResponse {
    partners: Partner[];
}

export default function PartnersSection() {
    const [partnerRow1, setPartnerRow1] = useState<string[]>([
        // 'minagri.jpg',
        'ministry-environment.jpg',
        // 'nla.jpg',
        'AMI 1.jpg',
        'Skillsbuilder 1.jpg',
        'aubreybarkerfund 1.jpg'
    ]);

    const [partnerRow2, setPartnerRow2] = useState<string[]>([
        'Kepler 1.jpg',
        'EPRN 1.jpg',
        'BFAP 1.jpg',
        'ala 1.jpg',
        'science-for-africa.jpg',
    ]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch partners from the API
    useEffect(() => {
        const fetchPartners = async () => {
            try {
                setLoading(true);
                const response = await apiClient.get<PartnersResponse>('/partners');
                const partners = response.data.partners;

                if (partners && partners.length > 0) {
                    // Split the partners into two rows
                    const midpoint = Math.ceil(partners.length / 2);
                    const row1Partners = partners.slice(0, midpoint);
                    const row2Partners = partners.slice(midpoint);

                    // Set the rows with URLs from API
                    setPartnerRow1(row1Partners.map(partner => partner.logo));
                    setPartnerRow2(row2Partners.map(partner => partner.logo));
                }

                setError(null);
            } catch (err) {
                console.error('Error fetching partners:', err);
                setError('Failed to load partners');
                // Keep the default rows if there's an error
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    return (
        <section className="py-10 md:py-14 bg-white overflow-hidden">
            <div className="container mx-auto px-4 mb-7">
                <div className="text-center mb-10">
                    <DecoratedHeading
                        firstText="Our"
                        secondText="Partners"
                        className="mx-auto"
                    />
                </div>
            </div>

            {/* First row */}
            <div className="slider-container mb-6 overflow-hidden w-full">
                <div className="slider w-full flex items-center overflow-hidden">
                    <div className="slider-items-right flex items-center whitespace-nowrap">
                        {[...partnerRow1, ...partnerRow1].map((partner, index) => (
                            <div key={`row1-${index}`} className="inline-block px-4">
                                <div className="bg-white rounded-lg shadow-md p-4 w-48 h-28 flex items-center justify-center">
                                    <img
                                        src={partner}
                                        alt={`Partner ${index % partnerRow1.length + 1}`}
                                        className="object-contain max-w-full max-h-12"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Second row - Right to Left */}
            <div className="slider-container overflow-hidden w-full">
                <div className="slider w-full flex items-center overflow-hidden">
                    <div className="slider-items-left flex items-center whitespace-nowrap">
                        {[...partnerRow2, ...partnerRow2].map((partner, index) => (
                            <div key={`row2-${index}`} className="inline-block px-4">
                                <div className="bg-white rounded-lg shadow-md p-4 w-48 h-28 flex items-center justify-center">
                                    <img
                                        src={partner}
                                        alt={`Partner ${index % partnerRow2.length + 1}`}
                                        className="object-contain max-w-full max-h-12"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Inline styles for animations */}
            <style>{`
        .slider-items-right {
          animation: scrollRight 25s linear infinite;
        }

        .slider-items-left {
          animation: scrollLeft 25s linear infinite;
        }

        @keyframes scrollRight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        @keyframes scrollLeft {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

                .slider-items-right:hover,
                .slider-items-left:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </section>
    );
}