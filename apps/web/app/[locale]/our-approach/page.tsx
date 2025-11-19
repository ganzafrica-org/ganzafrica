import React from "react";
import { getDictionary } from "@/lib/get-dictionary";
import Header from "@/components/layout/header";
import OurApproachPageContent from "@/components/OurApproachPageContent";

type Params = { locale: string };

export default async function OurApproachPage({ params }: { params: Params }) {
  const { locale } = params;
  const dict = await getDictionary(locale);

  return (
    <>
      <Header locale={locale} />
      <OurApproachPageContent />
    </>
  );
}