import React from "react";
import Header from "@/components/layout/header";
import OurApproachPageContent from "@/components/OurApproachPageContent";

type Params = { locale: string };

export default async function OurApproachPage({ params }: { params: Params }) {

  return (
    <>
      <Header />
      <OurApproachPageContent />
    </>
  );
}