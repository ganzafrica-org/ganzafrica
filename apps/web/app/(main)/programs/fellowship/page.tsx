import React from "react";
import FellowshipPageContent from "@/components/FellowshipPageContent";

type Params = Promise<{ locale: string }>;

export default async function FellowshipPage({ params }: { params: Params }) {
  const { locale } = await params;

  return (
    <>
      <FellowshipPageContent locale={locale} />
    </>
  );
}