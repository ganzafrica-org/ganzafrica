import React from "react";
import { getDictionary } from "@/lib/get-dictionary";
import Header from "@/components/layout/header";
import HowToApplyPageContent from "@/components/HowToApplyPageContent";

type Params = { locale: string };

export default async function HowToApplyPage({ params }: { params: Params }) {
  const { locale } = params;
  const dict = await getDictionary(locale);

  return (
    <>
      <Header locale={locale} dict={dict as any} />
      <HowToApplyPageContent dict={dict} />
    </>
  );
}
