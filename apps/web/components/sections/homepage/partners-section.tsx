'use client';

import React, { useEffect, useRef } from 'react';
import Image from 'next/image';

interface PartnersSectionProps {
    locale: string;
    dict: any;
}

export default function PartnersSection({ locale, dict }: PartnersSectionProps) {
    const row1Ref = useRef<HTMLDivElement>(null);
    const row2Ref = useRef<HTMLDivElement>(null);

    // Partner images (assuming these are the filenames in the images/partners directory)
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
        // Animation logic for scrolling effect
        const animateRow = (row: HTMLElement, direction: number) => {
            let currentPosition = 0;
            const speed = 0.5; // Adjust speed as needed

            const animate = () => {
                currentPosition += speed * direction;

                // Reset position when needed to create infinite loop
                if (Math.abs(currentPosition) >= row.scrollWidth / 2) {
                    currentPosition = 0;
                }

                row.style.transform = `translateX(${currentPosition}px)`;
                requestAnimationFrame(animate);
            };

            animate();
        };

        if (row1Ref.current && row2Ref.current) {
            // Duplicate content for seamless scrolling
            const row1 = row1Ref.current;
            const row2 = row2Ref.current;

            row1.innerHTML += row1.innerHTML;
            row2.innerHTML += row2.innerHTML;

            // Animate rows in opposite directions
            animateRow(row1, -1); // Left to right
            animateRow(row2, 1);  // Right to left
        }

        return () => {
            // Clean up animation on unmount (if needed)
        };
    }, []);

    return (
        <section className="py-10 bg-yellow-50 overflow-hidden">
            <div className="container mx-auto px-4 mb-8">
                <h2 className="text-primary-green text-3xl font-bold text-center relative mb-10">
          <span className="relative inline-block">
            {dict?.partners?.heading || "Our Partners"}
              <div className="absolute left-0 right-0 h-1 bg-primary-green bottom-0"></div>
            <div className="absolute w-2 h-2 bg-primary-orange -bottom-0.5 -left-0.5"></div>
            <div className="absolute w-2 h-2 bg-primary-orange -bottom-0.5 -right-0.5"></div>
          </span>
                </h2>
            </div>

            <div className="mb-10 overflow-hidden">
                <div ref={row1Ref} className="flex whitespace-nowrap">
                    {partnerRow1.map((partner, index) => (
                        <div key={`row1-${index}`} className="inline-block px-4 py-3">
                            <div className="bg-white rounded-lg shadow-sm p-4 w-44 h-24 flex items-center justify-center">
                                <Image
                                    src={`/images/partners/${partner}`}
                                    alt={`Partner ${index + 1}`}
                                    width={140}
                                    height={80}
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="overflow-hidden">
                <div ref={row2Ref} className="flex whitespace-nowrap">
                    {partnerRow2.map((partner, index) => (
                        <div key={`row2-${index}`} className="inline-block px-4 py-3">
                            <div className="bg-white rounded-lg shadow-sm p-4 w-44 h-24 flex items-center justify-center">
                                <Image
                                    src={`/images/partners/${partner}`}
                                    alt={`Partner ${index + 1}`}
                                    width={140}
                                    height={80}
                                    className="object-contain"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}