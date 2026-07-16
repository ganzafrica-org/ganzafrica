import { db } from "../db/client";
import { job_opportunities } from "../db/schema";
import { eq, lte, and } from "drizzle-orm";
import { Logger } from "../config";
import axios from "axios";

const logger = new Logger("JobScraperService");

// Default sectors to scrape jobs for
const SECTORS = ["Land", "Agriculture", "Environment", "Communications", "ICT"];

interface ScrapedJob {
  title: string;
  company: string;
  location: string | null;
  description: string | null;
  applicationUrl: string;
  sector: string;
  jobType: string | null;
  isRemote: boolean;
  skills: string[];
  deadline: string | null;
}

/**
 * Map keywords to sectors based on job title/description
 */
const mapToSector = (title: string, description: string | null): string => {
  const text = `${title} ${description || ""}`.toLowerCase();

  if (
    text.includes("land") ||
    text.includes("gis") ||
    text.includes("surveyor") ||
    text.includes("geospatial") ||
    text.includes("mapping")
  ) {
    return "Land";
  }
  if (
    text.includes("agricult") ||
    text.includes("farm") ||
    text.includes("crop") ||
    text.includes("livestock") ||
    text.includes("agri")
  ) {
    return "Agriculture";
  }
  if (
    text.includes("environment") ||
    text.includes("climate") ||
    text.includes("sustainab") ||
    text.includes("conservation") ||
    text.includes("ecology")
  ) {
    return "Environment";
  }
  if (
    text.includes("communication") ||
    text.includes("media") ||
    text.includes("marketing") ||
    text.includes("public relation") ||
    text.includes("journalist")
  ) {
    return "Communications";
  }
  if (
    text.includes("software") ||
    text.includes("developer") ||
    text.includes("engineer") ||
    text.includes("data") ||
    text.includes("tech") ||
    text.includes("ict") ||
    text.includes("digital") ||
    text.includes("programming")
  ) {
    return "ICT";
  }

  // Default to ICT for tech-related remote jobs
  return "ICT";
};

/**
 * Scrape jobs from Remotive - Free API, no auth required
 * https://remotive.com/api/remote-jobs
 */
const scrapeRemotive = async (): Promise<ScrapedJob[]> => {
  const jobs: ScrapedJob[] = [];

  try {
    logger.info("Scraping Remotive API...");

    const response = await axios.get("https://remotive.com/api/remote-jobs", {
      params: {
        limit: 50,
      },
      timeout: 30000,
    });

    if (response.data?.jobs && Array.isArray(response.data.jobs)) {
      for (const job of response.data.jobs) {
        const sector = mapToSector(job.title || "", job.description || "");

        // Only include jobs in our target sectors
        if (SECTORS.includes(sector)) {
          jobs.push({
            title: job.title || "",
            company: job.company_name || "Unknown Company",
            location: job.candidate_required_location || "Remote",
            description: job.description ? job.description.substring(0, 2000) : null,
            applicationUrl: job.url || "",
            sector,
            jobType: job.job_type || "Full-time",
            isRemote: true,
            skills: job.tags || [],
            deadline: null,
          });
        }
      }
      logger.info(`Found ${jobs.length} relevant jobs from Remotive`);
    }
  } catch (error) {
    logger.error("Error scraping Remotive:", error);
  }

  return jobs;
};

/**
 * Scrape jobs from Arbeitnow - Free API, no auth required
 * https://www.arbeitnow.com/api/job-board-api
 */
const scrapeArbeitnow = async (): Promise<ScrapedJob[]> => {
  const jobs: ScrapedJob[] = [];

  try {
    logger.info("Scraping Arbeitnow API...");

    const response = await axios.get("https://www.arbeitnow.com/api/job-board-api", {
      timeout: 30000,
    });

    if (response.data?.data && Array.isArray(response.data.data)) {
      for (const job of response.data.data) {
        const sector = mapToSector(job.title || "", job.description || "");

        // Only include jobs in our target sectors
        if (SECTORS.includes(sector)) {
          jobs.push({
            title: job.title || "",
            company: job.company_name || "Unknown Company",
            location: job.location || "Remote",
            description: job.description ? job.description.substring(0, 2000) : null,
            applicationUrl: job.url || "",
            sector,
            jobType: job.job_types?.join(", ") || "Full-time",
            isRemote: job.remote === true,
            skills: job.tags || [],
            deadline: null,
          });
        }
      }
      logger.info(`Found ${jobs.length} relevant jobs from Arbeitnow`);
    }
  } catch (error) {
    logger.error("Error scraping Arbeitnow:", error);
  }

  return jobs;
};

/**
 * Scrape jobs from ReliefWeb API - Free, requires POST with JSON body
 * https://api.reliefweb.int/v1/jobs
 */
const scrapeReliefWeb = async (): Promise<ScrapedJob[]> => {
  const jobs: ScrapedJob[] = [];

  // ReliefWeb career categories that map to our sectors
  const categoryMappings: Record<string, string[]> = {
    Agriculture: [
      "Agriculture",
      "Food and Nutrition",
      "Livelihoods",
      "Environment & Climate Change",
    ],
    Environment: [
      "Environment & Climate Change",
      "Climate Change and Environment",
      "Contributions",
    ],
    ICT: [
      "Information and Communications Technology",
      "Information Technology",
      "Information Management",
    ],
    Communications: ["Public Information and Advocacy", "Communications", "Advocacy"],
    Land: ["Shelter and Non-Food Items", "Camp Coordination and Camp Management"],
  };

  // African countries to filter for
  const africanCountries = [
    "Rwanda",
    "Kenya",
    "Uganda",
    "Tanzania",
    "Ethiopia",
    "South Africa",
    "Nigeria",
    "Ghana",
    "Senegal",
    "Mozambique",
  ];

  try {
    logger.info("Scraping ReliefWeb API...");

    // Use POST request with JSON body (correct syntax for ReliefWeb API)
    const response = await axios.post(
      "https://api.reliefweb.int/v1/jobs",
      {
        appname: "ganzafrica-alumni",
        limit: 50,
        fields: {
          include: [
            "title",
            "body",
            "how_to_apply",
            "source",
            "country",
            "city",
            "type",
            "career_categories",
            "date.closing",
            "url",
          ],
        },
        filter: {
          operator: "AND",
          conditions: [
            {
              field: "country.name",
              value: africanCountries,
              operator: "OR",
            },
            {
              field: "status",
              value: "published",
            },
          ],
        },
        sort: ["date.created:desc"],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );

    if (response.data?.data && Array.isArray(response.data.data)) {
      for (const item of response.data.data) {
        const fields = item.fields;
        if (!fields) continue;

        // Determine sector based on career categories
        let sector = "ICT"; // default
        const categories = fields.career_categories?.map((c: any) => c.name) || [];

        for (const [sectorName, sectorCategories] of Object.entries(categoryMappings)) {
          if (
            categories.some((cat: string) =>
              sectorCategories.some(
                (sc) =>
                  cat.toLowerCase().includes(sc.toLowerCase()) ||
                  sc.toLowerCase().includes(cat.toLowerCase()),
              ),
            )
          ) {
            sector = sectorName;
            break;
          }
        }

        const location = fields.city?.[0]?.name
          ? `${fields.city[0].name}, ${fields.country?.[0]?.name || ""}`
          : fields.country?.[0]?.name || null;

        jobs.push({
          title: fields.title || "",
          company: fields.source?.[0]?.name || "Unknown Organization",
          location,
          description: fields.body ? fields.body.substring(0, 2000) : null,
          applicationUrl: fields.url || item.href || "",
          sector,
          jobType: fields.type?.[0]?.name || "Full-time",
          isRemote: false,
          skills: categories,
          deadline: fields.date?.closing || null,
        });
      }
      logger.info(`Found ${jobs.length} jobs from ReliefWeb`);
    }
  } catch (error: any) {
    // Log more details about the error
    if (error.response) {
      logger.error(
        `ReliefWeb API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`,
      );
    } else {
      logger.error("Error scraping ReliefWeb:", error.message);
    }
  }

  return jobs;
};

/**
 * Scrape all configured job sources
 */
export const scrapeJobs = async (): Promise<number> => {
  logger.info("Starting job scraping...");
  let totalScraped = 0;

  // Scrape from all sources
  const remotiveJobs = await scrapeRemotive();
  const arbeitnowJobs = await scrapeArbeitnow();
  const reliefWebJobs = await scrapeReliefWeb();

  const allJobs = [...remotiveJobs, ...arbeitnowJobs, ...reliefWebJobs];
  logger.info(`Total jobs found across all sources: ${allJobs.length}`);

  // Insert new jobs
  for (const job of allJobs) {
    if (!job.title || !job.company || !job.applicationUrl) continue;

    try {
      // Check if job already exists
      const existing = await db
        .select({ id: job_opportunities.id })
        .from(job_opportunities)
        .where(
          and(
            eq(job_opportunities.title, job.title),
            eq(job_opportunities.company, job.company),
            eq(job_opportunities.application_url, job.applicationUrl),
          ),
        )
        .limit(1);

      if (existing.length === 0) {
        // Calculate expiry date (30 days from now for scraped jobs, or use deadline if provided)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        await db.insert(job_opportunities).values({
          title: job.title,
          company: job.company,
          location: job.location,
          job_type: job.jobType,
          is_remote: job.isRemote,
          description: job.description,
          skills: job.skills,
          sector: job.sector,
          application_url: job.applicationUrl,
          deadline: job.deadline,
          source: "scraped",
          source_url: job.applicationUrl,
          expires_at: expiresAt,
        });

        totalScraped++;
      }
    } catch (dbError) {
      logger.error(`Error inserting job "${job.title}":`, dbError);
    }
  }

  logger.info(`Job scraping completed. Total new jobs added: ${totalScraped}`);
  return totalScraped;
};

/**
 * Delete expired jobs from database
 */
export const deleteExpiredJobs = async (): Promise<number> => {
  try {
    const result = await db
      .delete(job_opportunities)
      .where(lte(job_opportunities.expires_at, new Date()))
      .returning({ id: job_opportunities.id });

    logger.info(`Deleted ${result.length} expired jobs`);
    return result.length;
  } catch (error) {
    logger.error("Error deleting expired jobs", error);
    throw error;
  }
};

/**
 * Run the weekly job scraping and cleanup task
 */
export const runWeeklyJobTask = async (): Promise<{
  deleted: number;
  scraped: number;
}> => {
  logger.info("Running weekly job task...");

  let deletedCount = 0;
  let scrapedCount = 0;

  try {
    // First, delete expired jobs
    deletedCount = await deleteExpiredJobs();
    logger.info(`Cleaned up ${deletedCount} expired jobs`);

    // Then, scrape new jobs
    scrapedCount = await scrapeJobs();
    logger.info(`Scraped ${scrapedCount} new jobs`);
  } catch (error) {
    logger.error("Error in weekly job task:", error);
  }

  return { deleted: deletedCount, scraped: scrapedCount };
};
