import React from "react";
import { getDictionary } from "@/lib/get-dictionary";
import FellowshipPageContent from "@/components/FellowshipPageContent";
import Header from "@/components/layout/header";

type Params = Promise<{ locale: string }>;

export default async function FellowshipPage({ params }: { params: Params }) {
  const { locale } = await params;
  const dict = await getDictionary(locale);

  return (
    <>
      <Header locale={locale} dict={dict as any} />
      <FellowshipPageContent dict={dict} locale={locale} />
    </>
  );
}