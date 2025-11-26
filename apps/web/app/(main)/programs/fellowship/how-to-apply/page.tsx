import React from "react";
import HowToApplyPageContent from "@/components/HowToApplyPageContent";

type Params = { locale: string };

export default async function HowToApplyPage({ params }: { params: Params }) {
  const { locale } = params;

  return (
    <>
      <HowToApplyPageContent />
    </>
  );
}
