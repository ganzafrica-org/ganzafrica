import React from "react";
import ContactUsContent from "@/components/ContactUsContent";

// This function will run server-side because it's inside a Server Component
type Params = Promise<{ locale: string }>;

// This is a Server Component
export default async function ContactUsPage({ params }: { params: Params }) {
  const { locale } = await params;

  return (
    <>
      <ContactUsContent />
    </>
  );
}
