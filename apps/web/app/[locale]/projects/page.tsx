import React from "react";
import { getDictionary } from "@/lib/get-dictionary";
import Header from "@/components/layout/header";
import ProjectsPageContent from "@/components/ProjectsPageContent";

type Params = { locale: string };

export default async function ProjectsPage({ params }: { params: Params }) {
  const { locale } = params;
  const dict = await getDictionary(locale);

  return (
    <>
      <Header locale={locale} dict={dict as any} />
      <ProjectsPageContent dict={dict} />
    </>
  );
}