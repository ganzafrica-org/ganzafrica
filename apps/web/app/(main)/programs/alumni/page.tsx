import React from "react";
import { getDictionary } from "@/lib/get-dictionary";
import AlumniPageContent from "@/components/AlumniPageContent";

type Params = Promise<{ locale: string }>;

export default async function AlumniPage({ params }: { params: Params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return <AlumniPageContent />;
}
