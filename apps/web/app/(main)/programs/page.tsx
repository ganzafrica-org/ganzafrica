import {Metadata} from "next"

const baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "https://web.ganzafrica.org";

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: "Programs | GanzAfrica - Agriculture Training & Fellowship Programs",
    description: "Explore GanzAfrica's comprehensive programs: fellowship training, agriculture education, sustainable land management, and data literacy for African youth.",
    keywords: [
        "GanzAfrica programs",
        "agriculture training programs",
        "fellowship programs Africa",
        "sustainable land management training",
        "agriculture education Africa",
        "youth training programs",
        "data literacy programs"
    ],
    openGraph: {
        title: "Programs | GanzAfrica - Agriculture Training & Fellowship Programs",
        description: "Discover GanzAfrica's comprehensive training programs combining agriculture, sustainable land management, and data literacy for African youth.",
        siteName: "GanzAfrica",
        type: "website",
        url: `${baseUrl}/programs`,
        images: [{
            url: `${baseUrl}/images/og/programs.jpg`,
            width: 1200,
            height: 630,
            alt: "GanzAfrica Programs"
        }]
    },
    twitter: {
        card: "summary_large_image",
        title: "Programs | GanzAfrica",
        description: "Explore GanzAfrica's agriculture training and fellowship programs for African youth.",
        creator: "@GanzAfrica",
        images: [`${baseUrl}/images/og/programs.jpg`]
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-snippet": -1,
            "max-image-preview": "large",
            "max-video-preview": -1,
        },
    },
    alternates: {
        canonical: `${baseUrl}/programs`
    }
};


export default async function ProgramsPage(): Promise<JSX.Element> {
  return (
    <main>
      <div className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">Overview</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Overview of our various programs and initiatives.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">This is the Programs Page</h2>
        <p className="text-muted-foreground">
          This is a simple placeholder for content about GanzAfrica's programs.
        </p>
      </div>
    </main>
  );
}
