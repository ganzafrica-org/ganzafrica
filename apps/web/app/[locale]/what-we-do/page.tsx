import { getDictionary } from "@/lib/get-dictionary";

export default async function WhatWeDoPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const dict = await getDictionary(locale);

  return (
    <main>
      <div className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">{dict.what_we_do.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {dict.what_we_do.description}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">This is the What We Do Page</h2>
        <p className="text-muted-foreground">
          This is a simple placeholder for content about GanzAfrica's activities
          and focus areas.
        </p>
      </div>
    </main>
  );
}
