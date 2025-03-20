'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { DecoratedHeading } from '@/components/layout/headertext';

interface PartnersSectionProps {
    locale: string;
    dict: any;
}

export default function PartnersSection({ locale, dict }: PartnersSectionProps) {
    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);

    // Keep your existing partner image filenames
    const partnerRow1 = [
        'minagri.jpg',
        'ministry-environment.jpg',
        'nla.jpg',
        'AMI 1.jpg',
        'Skillsbuilder 1.jpg',
        'aubreybarkerfund 1.jpg'
    ];

    const partnerRow2 = [
        'Kepler 1.jpg',
        'EPRN 1.jpg',
        'BFAP 1.jpg',
        'ala 1.jpg',
        'science-for-africa.jpg',
    ];

    useEffect(() => {
        if (!row1Ref.current || !row2Ref.current) return;

        // Better animation logic for infinite scrolling with no gaps
        const row1 = row1Ref.current;
        const row2 = row2Ref.current;

        // Clone items multiple times to ensure we always have enough content
        const cloneItemsForRow = (row: HTMLElement, count: number = 3) => {
            const originalContent = row.innerHTML;
            let newContent = originalContent;

            // Clone multiple times to ensure enough content for any screen size
            for (let i = 0; i < count; i++) {
                newContent += originalContent;
            }

            row.innerHTML = newContent;
        };

        cloneItemsForRow(row1);
        cloneItemsForRow(row2);

        // Get the container widths to calculate the right reset position
        let row1Width = row1.scrollWidth / 4; // Divide by 4 since we cloned 3 times (original + 3 clones)
        let row2Width = row2.scrollWidth / 4;

        // Animation variables
        let row1Position = 0;
        let row2Position = 0;
        const speed = 0.3; // Slower for better visibility of partner logos

        // Animation functions
        const animate = () => {
            // First row (left to right)
            row1Position -= speed;
            if (row1Position <= -row1Width) {
                // Reset position by exactly one set width to create perfect loop
                row1Position += row1Width;
            }
            row1.style.transform = `translateX(${row1Position}px)`;

            // Second row (right to left)
            row2Position += speed;
            if (row2Position >= row2Width) {
                // Reset position by exactly one set width to create perfect loop
                row2Position -= row2Width;
            }
            row2.style.transform = `translateX(${row2Position}px)`;

            // Continue animation
            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        // Cleanup
        return () => {
            cancelAnimationFrame(animationId);
        };
    }, []);

    return (
        <section className="py-16 md:py-24 bg-yellow-50 overflow-hidden">
            <div className="container mx-auto px-4 mb-8">
                <div className="text-center mb-16">
                    <DecoratedHeading
                        firstText={dict?.partners?.heading_first ?? dict?.about?.partners?.heading_first ?? "Our"}
                        secondText={dict?.partners?.heading_second ?? dict?.about?.partners?.heading_second ?? "Partners"}
                        firstTextColor="text-primary-green"
                        secondTextColor="text-primary-orange"
                        borderColor="border-primary-green"
                        cornerColor="bg-primary-orange"
                        className="mx-auto"
                    />
                </div>
            </div>

            <div className="mb-16 overflow-hidden">
                <div ref={row1Ref} className="flex whitespace-nowrap">
                    {partnerRow1.map((partner, index) => (
                        <div key={`row1-${index}`} className="inline-block px-6 py-4">
                            <div className="bg-white rounded-lg shadow-md p-6 w-64 h-40 flex items-center justify-center">
                                <Image
                                    src={`/images/partners/${partner}`}
                                    alt={`Partner ${index + 1}`}
                                    width={200}
                                    height={120}
                                    className="object-contain max-w-full"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden">
                <div ref={row2Ref} className="flex whitespace-nowrap">
                    {partnerRow2.map((partner, index) => (
                        <div key={`row2-${index}`} className="inline-block px-6 py-4">
                            <div className="bg-white rounded-lg shadow-md p-6 w-64 h-40 flex items-center justify-center">
                                <Image
                                    src={`/images/partners/${partner}`}
                                    alt={`Partner ${index + 1}`}
                                    width={200}
                                    height={120}
                                    className="object-contain max-w-full"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}