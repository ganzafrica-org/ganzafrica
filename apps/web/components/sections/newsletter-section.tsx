"use client";

import React, { useState } from "react";
import Image from "next/image";
import { DecoratedHeading } from "@/components/layout/headertext";
import { trackFormSubmission } from "@/components/analytics/google-analytics";
import { TranslatableText } from "@/components/translate";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Replace with your actual API endpoint
      // const response = await fetch('/api/subscribe', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ email }),
      // });

      // if (response.ok) {
      //   setSubmitStatus('success');
      // } else {
      //   setSubmitStatus('error');
      // }

      // Simulate successful submission for now
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitStatus("success");

      // Track successful newsletter subscription
      trackFormSubmission("newsletter_subscribe", true);

      setEmail("");
    } catch (error) {
      setSubmitStatus("error");

      // Track failed newsletter subscription
      trackFormSubmission("newsletter_subscribe", false);
    } finally {
      setIsSubmitting(false);

      // Reset status after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    }
  };

  return (
    <section className="py-16 bg-gray-50 relative overflow-hidden">
      {/* Decorative leaves background */}
      <div className="absolute inset-0 z-0 opacity-10 pointer-events-none">
        <div className="absolute -top-10 -left-10 transform rotate-[31.83deg] w-[200px] aspect-square">
          <Image src="/images/leaf.png" alt="Decorative leaf" fill className="object-contain" />
        </div>
        <div className="absolute top-1/4 right-10 rotate-[-60deg] w-[200px] aspect-square">
          <Image src="/images/leaf.png" alt="Decorative leaf" fill className="object-contain" />
        </div>
        <div className="absolute bottom-10 left-1/3 transform rotate-[120deg] w-[150px] aspect-square">
          <Image src="/images/leaf.png" alt="Decorative leaf" fill className="object-contain" />
        </div>
        <div className="absolute -bottom-10 -right-10 transform rotate-[20deg] w-[180px] aspect-square">
          <Image src="/images/leaf.png" alt="Decorative leaf" fill className="object-contain" />
        </div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-center mb-16">
            <DecoratedHeading
              firstText="Subscribe To"
              secondText="Our Newsletter"
              className="mx-auto"
            />
          </div>

          <p className="text-gray-600 mb-8">
            <TranslatableText>
              Receive timely updates on GanzAfrica's programs, success stories, and upcoming
              opportunities.
            </TranslatableText>
          </p>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
          >
            <div className="flex-grow">
              <input
                type="email"
                placeholder="Enter email address"
                className="bg-white w-full px-4 py-3 rounded-md border border-gray focus:outline-none focus:ring-2 focus:ring-primary-green"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button
              type="submit"
              className={`px-6 py-3 bg-primary-orange text-primary-green font-medium rounded-md hover:bg-primary-orange/90 transition-colors ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
              disabled={isSubmitting}
            >
              <TranslatableText>{isSubmitting ? "Subscribing..." : "Subscribe"}</TranslatableText>
            </button>
          </form>

          {/* Status messages */}
          {submitStatus === "success" && (
            <p className="mt-4 text-primary-green">
              <TranslatableText>Thank you for subscribing to our newsletter!</TranslatableText>
            </p>
          )}
          {submitStatus === "error" && (
            <p className="mt-4 text-red-500">
              <TranslatableText>
                There was an error with your subscription. Please try again.
              </TranslatableText>
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
