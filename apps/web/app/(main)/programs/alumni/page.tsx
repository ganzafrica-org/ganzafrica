import React from "react";
import AlumniPageContent from "@/components/AlumniPageContent";

type Params = Promise<{ locale: string }>;

export default async function AlumniPage({ params }: { params: Params }) {

  return <AlumniPageContent />;
}
