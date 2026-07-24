import { MetadataRoute } from "next";
import apiClient from "@/lib/api-client";

// Define the site URL
const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || "https://web.ganzafrica.org").replace(
  /\/$/,
  "",
);

// Define all static routes with priorities
const staticRoutes = [
  { path: "", priority: 1.0, changeFrequency: "monthly" as const },
  { path: "/about/who-we-are", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/about/our-story", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/about/our-approach", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/about/team", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/our-approach", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/our-impact", priority: 0.9, changeFrequency: "monthly" as const },
  { path: "/programs", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/programs/fellowship", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/programs/fellowship/how-to-apply", priority: 0.8, changeFrequency: "monthly" as const },
  { path: "/programs/alumni", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/programs/one-event", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/projects", priority: 0.9, changeFrequency: "weekly" as const },
  { path: "/newsroom", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/blogs", priority: 0.8, changeFrequency: "weekly" as const },
  { path: "/opportunities", priority: 0.9, changeFrequency: "daily" as const },
  { path: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
  { path: "/faqs", priority: 0.8, changeFrequency: "monthly" as const },
];

// Helper function to generate slug from title
function generateSlug(title: string): string {
  if (!title) return "";
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];

  // Add static routes
  staticRoutes.forEach((route) => {
    routes.push({
      url: `${baseUrl}${route.path}`,
      lastModified: new Date(),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
    });
  });

  try {
    // Fetch dynamic routes from API
    const [newsResponse, projectsResponse, opportunitiesResponse, blogsResponse, eventsResponse] =
      await Promise.allSettled([
        apiClient.get("/news", { params: { status: "published", limit: 1000 } }),
        apiClient.get("/projects", { params: { is_published: true, limit: 1000 } }),
        apiClient.get("/opportunities", { params: { status: "published", limit: 1000 } }),
        apiClient.get("/blogs", { params: { limit: 1000 } }),
        apiClient.get("/events", { params: { limit: 1000 } }),
      ]);

    // Add news articles
    if (newsResponse.status === "fulfilled") {
      const news = newsResponse.value.data?.news || newsResponse.value.data || [];
      news.forEach((article: { title: string; publish_date?: string; updated_at?: string }) => {
        if (article.title) {
          const slug = generateSlug(article.title);
          routes.push({
            url: `${baseUrl}/newsroom/${slug}`,
            lastModified: article.updated_at
              ? new Date(article.updated_at)
              : article.publish_date
                ? new Date(article.publish_date)
                : new Date(),
            changeFrequency: "weekly",
            priority: 0.7,
          });
        }
      });
    }

    // Add projects
    if (projectsResponse.status === "fulfilled") {
      const projects = projectsResponse.value.data?.projects || projectsResponse.value.data || [];
      projects.forEach((project: { id: string; updated_at?: string; created_at?: string }) => {
        if (project.id) {
          routes.push({
            url: `${baseUrl}/projects/${project.id}`,
            lastModified: project.updated_at
              ? new Date(project.updated_at)
              : project.created_at
                ? new Date(project.created_at)
                : new Date(),
            changeFrequency: "monthly",
            priority: 0.7,
          });
        }
      });
    }

    // Add opportunities
    if (opportunitiesResponse.status === "fulfilled") {
      const opportunities =
        opportunitiesResponse.value.data?.opportunities || opportunitiesResponse.value.data || [];
      opportunities.forEach(
        (opportunity: { id: string; updated_at?: string; created_at?: string }) => {
          if (opportunity.id) {
            routes.push({
              url: `${baseUrl}/opportunities/${opportunity.id}`,
              lastModified: opportunity.updated_at
                ? new Date(opportunity.updated_at)
                : opportunity.created_at
                  ? new Date(opportunity.created_at)
                  : new Date(),
              changeFrequency: "weekly",
              priority: 0.8,
            });
          }
        },
      );
    }

    // Add blog posts
    if (blogsResponse.status === "fulfilled") {
      const blogs = blogsResponse.value.data?.blogs || blogsResponse.value.data || [];
      blogs.forEach(
        (blog: { slug?: string; title?: string; updated_at?: string; created_at?: string }) => {
          const slug = blog.slug || (blog.title ? generateSlug(blog.title) : null);
          if (slug) {
            routes.push({
              url: `${baseUrl}/blogs/${slug}`,
              lastModified: blog.updated_at
                ? new Date(blog.updated_at)
                : blog.created_at
                  ? new Date(blog.created_at)
                  : new Date(),
              changeFrequency: "weekly",
              priority: 0.6,
            });
          }
        },
      );
    }

    // Add events
    if (eventsResponse.status === "fulfilled") {
      const events = eventsResponse.value.data?.events || eventsResponse.value.data || [];
      events.forEach((event: { id: string; updated_at?: string; created_at?: string }) => {
        if (event.id) {
          routes.push({
            url: `${baseUrl}/programs/one-event/${event.id}`,
            lastModified: event.updated_at
              ? new Date(event.updated_at)
              : event.created_at
                ? new Date(event.created_at)
                : new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
          });
        }
      });
    }
  } catch (error) {
    console.error("Error generating dynamic sitemap routes:", error);
    // Continue with static routes only if API fails
  }

  return routes;
}
