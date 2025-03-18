import { getDictionary } from "@/lib/get-dictionary";
import { Metadata } from "next";
import { generateMetadata as baseGenerateMetadata } from "@/lib/metadata";
import Script from "next/script";

// Simulated API call that would fetch projects
async function getProjects() {
  // For now, return mock data
  return [
    {
      id: 1,
      title: "Sustainable Agriculture Initiative",
      description: "Promoting sustainable farming practices in rural Rwanda.",
      image: "/images/projects/agriculture.jpg",
      slug: "sustainable-agriculture",
    },
    {
      id: 2,
      title: "Climate Change Adaptation",
      description: "Helping communities adapt to climate change impacts.",
      image: "/images/projects/climate.jpg",
      slug: "climate-adaptation",
    },
  ];
}

// Dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const dict = await getDictionary(params.locale);

  return baseGenerateMetadata({
    title: dict.projects.title,
    description:
      "Explore our impact-focused projects in sustainable agriculture and climate change adaptation in Rwanda.",
    locale: params.locale,
    imagePath: "/images/og/projects.jpg",
  });
}

// Static generation with ISR
export const revalidate = 3600; // Revalidate every hour

export default async function ProjectsPage({
  params,
}: {
  params: { locale: string };
}) {
  const locale = params.locale;
  const dict = await getDictionary(locale);

  // Fetch projects data
  const projects = await getProjects();

  // Structure data for JSON-LD
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Project",
        name: project.title,
        description: project.description,
        url: `https://ganzafrica.org/${locale}/projects/${project.slug}`,
      },
    })),
  };

  return (
    <main>
      {/* Structured data for SEO */}
      <Script
        id="projects-structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">{dict.projects.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Explore our impact-focused projects in sustainable agriculture and
            climate change adaptation.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-card rounded-lg overflow-hidden shadow-md"
              >
                <div className="h-48 bg-muted relative">
                  {/* This would be replaced with actual images in production */}
                  <div className="absolute inset-0 flex items-center justify-center bg-primary/10">
                    {project.title.substring(0, 1)}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-xl mb-2">{project.title}</h3>
                  <p className="text-muted-foreground mb-4">
                    {project.description}
                  </p>
                  <a
                    href={`/${locale}/projects/${project.slug}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {dict.cta.learn_more} →
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p>{dict.projects.no_projects}</p>
          </div>
        )}
      </div>
    </main>
  );
}

// export static params for static generation
export async function generateStaticParams() {
  return [{ locale: "en" }, { locale: "fr" }];
}
