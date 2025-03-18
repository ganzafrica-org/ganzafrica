import { getDictionary } from "@/lib/get-dictionary";

export default async function CommunityHubPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  const dict = await getDictionary(locale);

  return (
    <main>
      <div className="bg-muted py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-4">{dict.community.title}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Connect with our community of fellows, mentors, and alumni.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">
          This is the Community Hub Page
        </h2>
        <p className="text-muted-foreground">
          This is a simple placeholder for the GanzAfrica community hub page.
        </p>
      </div>
    </main>
  );
}
