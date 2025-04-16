"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { DecoratedHeading } from "@/components/layout/headertext";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: number;
  name: string;
  role: string;
  comment: string;
  image: string;
}

interface TestimonialsSectionProps {
  locale: string;
  dict: any;
}

export default function TestimonialsSection({
  locale,
  dict,
}: TestimonialsSectionProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sample testimonials - in a real app, these would come from your dictionary
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Madge Jennings",
      role: dict?.testimonials?.roles?.fellow || "Fellow",
      comment:
        dict?.testimonials?.comments?.comment1 ||
        "My experience with GanzAfrica has been transformative. The training and mentorship helped me develop crucial skills in agriculture and land management that I now apply daily in my work.",
      image: "/images/1.jpg",
    },
    {
      id: 2,
      name: "James Mwangi",
      role: dict?.testimonials?.roles?.partner || "Partner",
      comment:
        dict?.testimonials?.comments?.comment2 ||
        "Working with GanzAfrica has significantly improved our organizational capacity. Their fellows bring fresh perspectives and data-driven approaches to our agricultural initiatives.",
      image: "/images/2.png",
    },
    {
      id: 3,
      name: "Amina Hassan",
      role: dict?.testimonials?.roles?.mentor || "Mentor",
      comment:
        dict?.testimonials?.comments?.comment3 ||
        "As a mentor with GanzAfrica, I've witnessed the incredible growth of young professionals. Their dedication to sustainable food systems is inspiring and gives me hope for Africa's future.",
      image: "/images/1.jpg",
    },
    {
      id: 4,
      name: "Robert Kagame",
      role: dict?.testimonials?.roles?.fellow || "Fellow",
      comment:
        dict?.testimonials?.comments?.comment4 ||
        "The GanzAfrica fellowship provided me with both theoretical knowledge and practical experience. I now lead climate adaptation projects that directly impact my community.",
      image: "/images/2.png",
    },
    {
      id: 5,
      name: "Sarah Okonkwo",
      role: dict?.testimonials?.roles?.partner || "Partner Organization",
      comment:
        dict?.testimonials?.comments?.comment5 ||
        "GanzAfrica fellows bring innovative thinking and technical expertise to our projects. Their understanding of local contexts combined with global best practices delivers real results.",
      image: "/images/1.jpg",
    },
  ];

  // Start automatic rotation
  useEffect(() => {
    const startInterval = () => {
      intervalRef.current = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000); // Change every 5 seconds
    };

    startInterval();

    // Clear interval on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [testimonials.length]);

  // Reset interval when manually changing testimonial
  const handleAvatarClick = (index: number) => {
    setActiveIndex(index);

    // Reset the interval to prevent changing too soon after a click
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
  };

  return (
    <section className="py-16 md:py-24 bg-secondary-green/5 relative overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <DecoratedHeading
            firstText={dict?.testimonials?.heading_first || "Our"}
            secondText={dict?.testimonials?.heading_second || "Testimonials"}
            firstTextColor="text-primary-green"
            secondTextColor="text-primary-orange"
            borderColor="border-primary-green"
            cornerColor="bg-primary-orange"
            className="mx-auto"
          />
        </div>

        <div className="max-w-5xl mx-auto">
          {" "}
          {/* Increased from max-w-4xl to max-w-5xl */}
          <div className="relative">
            {/* Avatars on left side - increased sizing */}
            <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2">
              <div className="relative w-40 h-96">
                {" "}
                {/* Increased width and height */}
                {testimonials.map((testimonial, index) => {
                  // Calculate position for floating effect
                  const isActive = index === activeIndex;
                  const angle = (360 / testimonials.length) * index;
                  const radius = 20; // pixels from center

                  return (
                    <div
                      key={`left-${testimonial.id}`}
                      className={cn(
                        "absolute transition-all duration-500 cursor-pointer",
                        isActive
                          ? "ring-4 ring-primary-green/70 ring-offset-2 scale-110"
                          : "opacity-80 hover:opacity-100 hover:scale-105",
                      )}
                      style={{
                        animation: `floating ${8 + index}s linear infinite`,
                        top: `${index * 18}%`,
                        left: `${Math.sin((angle * Math.PI) / 180) * radius + 50}%`,
                        borderRadius: "50%", // Ensure ring follows avatar shape
                        transformOrigin: "center center",
                        transition: "all 0.3s ease-in-out",
                      }}
                      onClick={() => handleAvatarClick(index)}
                    >
                      <Avatar
                        className={cn(
                          "border-2 border-white shadow-md",
                          isActive ? "w-20 h-20" : "w-16 h-16", // Increased sizes
                        )}
                      >
                        <AvatarImage
                          src={testimonial.image}
                          alt={testimonial.name}
                        />
                        <AvatarFallback className="text-lg">
                          {testimonial.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Center content - Photo and Quote - with better spacing */}
            <div className="flex flex-col items-center justify-center text-center px-4 md:px-20">
              {/* Avatar Images - increased size */}
              <div className="relative h-56 w-full max-w-xs mb-8 perspective-container">
                {testimonials.map((testimonial, index) => (
                  <div
                    key={`center-${testimonial.id}`}
                    className={cn(
                      "absolute top-0 left-0 right-0 mx-auto transition-all duration-700 ease-in-out",
                      index === activeIndex
                        ? "opacity-100 transform-none"
                        : index < activeIndex
                          ? "opacity-0 -translate-y-full rotate-x-70"
                          : "opacity-0 translate-y-full rotate-x-negative-70",
                    )}
                  >
                    <Avatar className="w-40 h-40 mx-auto border-4 border-white shadow-lg">
                      {" "}
                      {/* Increased from w-32 h-32 */}
                      <AvatarImage
                        src={testimonial.image}
                        alt={testimonial.name}
                      />
                      <AvatarFallback className="text-4xl">
                        {testimonial.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="mt-4 text-2xl font-bold text-primary-green">
                      {testimonial.name}
                    </h3>
                    <p className="text-md text-gray-600">{testimonial.role}</p>
                  </div>
                ))}
              </div>

              {/* Quote Text - improved with better wrapping and height */}
              <div className="relative min-h-[180px] md:min-h-[150px] w-full perspective-container">
                {" "}
                {/* Adjusted height */}
                {testimonials.map((testimonial, index) => (
                  <div
                    key={`quote-${testimonial.id}`}
                    className={cn(
                      "absolute w-full px-4 transition-all duration-700 ease-in-out",
                      index === activeIndex
                        ? "opacity-100 transform-none"
                        : index < activeIndex
                          ? "opacity-0 -translate-y-full rotate-x-70"
                          : "opacity-0 translate-y-full rotate-x-negative-70",
                    )}
                  >
                    <div className="relative">
                      <svg
                        className="w-10 h-10 text-primary-green/20 mb-4 mx-auto"
                        fill="currentColor"
                        viewBox="0 0 32 32"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10 8C4.477 8 0 12.477 0 18v14h12V18h-8c0-3.866 3.134-7 7-7h1V8h-2zm20 0c-5.523 0-10 4.477-10 10v14h12V18h-8c0-3.866 3.134-7 7-7h1V8h-2z"></path>
                      </svg>
                      <p className="text-gray-700 italic text-base md:text-lg max-w-3xl mx-auto leading-relaxed">
                        {testimonial.comment}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Avatars on right side - increased sizing */}
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2">
              <div className="relative w-40 h-96">
                {" "}
                {/* Increased width and height */}
                {testimonials.map((testimonial, index) => {
                  // Different animation timing for right side
                  const isActive = index === activeIndex;
                  const angle = (360 / testimonials.length) * index;
                  const radius = 20; // pixels from center

                  return (
                    <div
                      key={`right-${testimonial.id}`}
                      className={cn(
                        "absolute transition-all duration-500 cursor-pointer",
                        isActive
                          ? "ring-4 ring-primary-green/70 ring-offset-2 scale-110"
                          : "opacity-80 hover:opacity-100 hover:scale-105",
                      )}
                      style={{
                        animation: `floating ${7 + index}s linear infinite`,
                        top: `${index * 18}%`,
                        right: `${Math.sin((angle * Math.PI) / 180) * radius + 50}%`,
                        borderRadius: "50%", // Ensure ring follows avatar shape
                        transformOrigin: "center center",
                        transition: "all 0.3s ease-in-out",
                      }}
                      onClick={() => handleAvatarClick(index)}
                    >
                      <Avatar
                        className={cn(
                          "border-2 border-white shadow-md",
                          isActive ? "w-20 h-20" : "w-16 h-16", // Increased sizes
                        )}
                      >
                        <AvatarImage
                          src={testimonial.image}
                          alt={testimonial.name}
                        />
                        <AvatarFallback className="text-lg">
                          {testimonial.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Mobile testimonial navigation - improved with avatar indicators */}
          <div className="md:hidden flex justify-center mt-8 gap-3">
            {testimonials.map((testimonial, index) => (
              <button
                key={`nav-${index}`}
                onClick={() => handleAvatarClick(index)}
                className={cn(
                  "transition-all rounded-full overflow-hidden border-2",
                  index === activeIndex
                    ? "scale-125 border-primary-green"
                    : "scale-100 border-transparent opacity-70 hover:opacity-90",
                )}
                aria-label={`Go to testimonial ${index + 1}`}
              >
                <Avatar className="w-10 h-10">
                  <AvatarImage src={testimonial.image} alt={testimonial.name} />
                  <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                </Avatar>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes floating {
          0% {
            transform: rotate(0deg) translate(-10px) rotate(0deg);
          }
          100% {
            transform: rotate(360deg) translate(-10px) rotate(-360deg);
          }
        }

        .perspective-container {
          perspective: 1000px;
        }

        .rotate-x-70 {
          transform: rotateX(70deg);
        }

        .rotate-x-negative-70 {
          transform: rotateX(-70deg);
        }
      `}</style>
    </section>
  );
}
