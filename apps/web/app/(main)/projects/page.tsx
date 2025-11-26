import React from "react";
import ProjectsPageContent from "@/components/ProjectsPageContent";

type Params = { locale: string };

export default async function ProjectsPage({ params }: { params: Params }) {
  const { locale } = params;

  return (
    <>
      <ProjectsPageContent />
    </>
  );
}