import { Request, Response } from "express";
import { db } from "../db/client";
import { job_opportunities } from "../db/schema";
import {
  eq,
  and,
  or,
  ilike,
  sql,
  desc,
  asc,
  count,
  gte,
  lte,
} from "drizzle-orm";
import { Logger } from "../config";
import { runWeeklyJobTask } from "../services/job-scraper.service";

const logger = new Logger("JobsController");

// Default sectors that should always be available
const DEFAULT_SECTORS = [
  "Land",
  "Agriculture",
  "Environment",
  "Communications",
  "ICT",
];

/**
 * Get job opportunities statistics
 */
export const getJobStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Total jobs
    const totalJobs = await db
      .select({ count: count() })
      .from(job_opportunities)
      .where(
        or(
          sql`${job_opportunities.expires_at} IS NULL`,
          gte(job_opportunities.expires_at, new Date()),
        ),
      );

    // Remote jobs
    const remoteJobs = await db
      .select({ count: count() })
      .from(job_opportunities)
      .where(
        and(
          eq(job_opportunities.is_remote, true),
          or(
            sql`${job_opportunities.expires_at} IS NULL`,
            gte(job_opportunities.expires_at, new Date()),
          ),
        ),
      );

    // Internal posts (source = internal)
    const internalJobs = await db
      .select({ count: count() })
      .from(job_opportunities)
      .where(
        and(
          eq(job_opportunities.source, "internal"),
          or(
            sql`${job_opportunities.expires_at} IS NULL`,
            gte(job_opportunities.expires_at, new Date()),
          ),
        ),
      );

    res.status(200).json({
      stats: {
        totalJobs: totalJobs[0]?.count || 0,
        remoteJobs: remoteJobs[0]?.count || 0,
        internalJobs: internalJobs[0]?.count || 0,
      },
    });
  } catch (error) {
    logger.error("Error fetching job stats", error);
    res.status(500).json({
      error: "Failed to fetch job statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get trending skills across all jobs
 */
export const getTrendingSkills = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const jobs = await db
      .select({ skills: job_opportunities.skills })
      .from(job_opportunities)
      .where(
        or(
          sql`${job_opportunities.expires_at} IS NULL`,
          gte(job_opportunities.expires_at, new Date()),
        ),
      );

    // Count skill occurrences
    const skillCounts: Record<string, number> = {};
    jobs.forEach((job) => {
      const skills = job.skills as string[] | null;
      if (skills && Array.isArray(skills)) {
        skills.forEach((skill) => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });

    // Sort by count and get top 15
    const trendingSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, count }));

    res.status(200).json({ skills: trendingSkills });
  } catch (error) {
    logger.error("Error fetching trending skills", error);
    res.status(500).json({
      error: "Failed to fetch trending skills",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all job opportunities with pagination and filters
 */
export const getAllJobs = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      page,
      limit,
      search,
      sector,
      job_type,
      location,
      remote,
      source,
      experience_level,
      sort,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      50,
      Math.max(1, parseInt(limit as string, 10) || 15),
    );
    const offset = (pageNum - 1) * limitNum;

    // Build conditions
    const conditions = [];

    // Only non-expired jobs
    conditions.push(
      or(
        sql`${job_opportunities.expires_at} IS NULL`,
        gte(job_opportunities.expires_at, new Date()),
      ),
    );

    // Search
    if (search && typeof search === "string") {
      conditions.push(
        or(
          ilike(job_opportunities.title, `%${search}%`),
          ilike(job_opportunities.company, `%${search}%`),
          ilike(job_opportunities.description, `%${search}%`),
        ),
      );
    }

    // Sector filter
    if (sector && sector !== "all") {
      conditions.push(eq(job_opportunities.sector, sector as string));
    }

    // Job type filter
    if (job_type && job_type !== "all") {
      conditions.push(eq(job_opportunities.job_type, job_type as string));
    }

    // Location filter
    if (location && location !== "all") {
      conditions.push(ilike(job_opportunities.location, `%${location}%`));
    }

    // Remote filter
    if (remote === "true") {
      conditions.push(eq(job_opportunities.is_remote, true));
    }

    // Source filter
    if (source && source !== "all") {
      conditions.push(eq(job_opportunities.source, source as string));
    }

    // Experience level filter
    if (experience_level && experience_level !== "all") {
      conditions.push(
        eq(job_opportunities.experience_level, experience_level as string),
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort order
    let orderBy;
    switch (sort) {
      case "oldest":
        orderBy = asc(job_opportunities.created_at);
        break;
      case "salary-high":
        orderBy = desc(job_opportunities.salary_max);
        break;
      case "salary-low":
        orderBy = asc(job_opportunities.salary_min);
        break;
      case "company":
        orderBy = asc(job_opportunities.company);
        break;
      case "views":
        orderBy = desc(job_opportunities.views);
        break;
      default:
        orderBy = desc(job_opportunities.created_at);
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(job_opportunities)
      .where(whereClause);

    const totalCount = totalResult[0]?.count || 0;
    const totalPages = Math.ceil(totalCount / limitNum);

    // Get jobs
    const jobs = await db
      .select()
      .from(job_opportunities)
      .where(whereClause)
      .orderBy(orderBy)
      .limit(limitNum)
      .offset(offset);

    // Get unique values for filters
    const allJobs = await db
      .select({
        sector: job_opportunities.sector,
        job_type: job_opportunities.job_type,
        location: job_opportunities.location,
        experience_level: job_opportunities.experience_level,
      })
      .from(job_opportunities)
      .where(
        or(
          sql`${job_opportunities.expires_at} IS NULL`,
          gte(job_opportunities.expires_at, new Date()),
        ),
      );

    const sectors = [
      ...new Set(allJobs.map((j) => j.sector).filter(Boolean)),
    ].sort();
    const jobTypes = [
      ...new Set(allJobs.map((j) => j.job_type).filter(Boolean)),
    ].sort();
    const locations = [
      ...new Set(allJobs.map((j) => j.location).filter(Boolean)),
    ].sort();
    const experienceLevels = [
      ...new Set(allJobs.map((j) => j.experience_level).filter(Boolean)),
    ].sort();

    res.status(200).json({
      jobs: jobs.map((job) => ({
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        jobType: job.job_type,
        isRemote: job.is_remote,
        salaryMin: job.salary_min,
        salaryMax: job.salary_max,
        salaryCurrency: job.salary_currency,
        description: job.description,
        requirements: job.requirements,
        skills: job.skills,
        sector: job.sector,
        experienceLevel: job.experience_level,
        applicationUrl: job.application_url,
        deadline: job.deadline,
        source: job.source,
        views: job.views,
        createdAt: job.created_at,
      })),
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasMore: pageNum < totalPages,
      },
      filters: {
        sectors: [...new Set([...DEFAULT_SECTORS, ...sectors])].sort(),
        jobTypes,
        locations,
        experienceLevels,
      },
    });
  } catch (error) {
    logger.error("Error fetching jobs", error);
    res.status(500).json({
      error: "Failed to fetch jobs",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get single job opportunity
 */
export const getJob = async (req: Request, res: Response): Promise<void> => {
  try {
    const jobId = parseInt(req.params.id, 10);

    if (isNaN(jobId)) {
      res.status(400).json({ error: "Invalid job ID" });
      return;
    }

    const job = await db
      .select()
      .from(job_opportunities)
      .where(eq(job_opportunities.id, jobId))
      .limit(1);

    if (job.length === 0) {
      res.status(404).json({ error: "Job not found" });
      return;
    }

    // Increment view count
    await db
      .update(job_opportunities)
      .set({ views: (job[0].views || 0) + 1 })
      .where(eq(job_opportunities.id, jobId));

    const j = job[0];
    res.status(200).json({
      job: {
        id: j.id,
        title: j.title,
        company: j.company,
        location: j.location,
        jobType: j.job_type,
        isRemote: j.is_remote,
        salaryMin: j.salary_min,
        salaryMax: j.salary_max,
        salaryCurrency: j.salary_currency,
        description: j.description,
        requirements: j.requirements,
        skills: j.skills,
        sector: j.sector,
        experienceLevel: j.experience_level,
        applicationUrl: j.application_url,
        deadline: j.deadline,
        source: j.source,
        sourceUrl: j.source_url,
        views: (j.views || 0) + 1,
        createdAt: j.created_at,
      },
    });
  } catch (error) {
    logger.error("Error fetching job", error);
    res.status(500).json({
      error: "Failed to fetch job",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Create a job opportunity (admin/internal)
 */
export const createJob = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const {
      title,
      company,
      location,
      jobType,
      isRemote,
      salaryMin,
      salaryMax,
      salaryCurrency,
      description,
      requirements,
      skills,
      sector,
      experienceLevel,
      applicationUrl,
      deadline,
    } = req.body;

    if (!title || !company || !sector) {
      res
        .status(400)
        .json({ error: "Title, company, and sector are required" });
      return;
    }

    const newJob = await db
      .insert(job_opportunities)
      .values({
        title,
        company,
        location: location || null,
        job_type: jobType || null,
        is_remote: isRemote || false,
        salary_min: salaryMin || null,
        salary_max: salaryMax || null,
        salary_currency: salaryCurrency || "USD",
        description: description || null,
        requirements: requirements || [],
        skills: skills || [],
        sector,
        experience_level: experienceLevel || null,
        application_url: applicationUrl || null,
        deadline: deadline || null,
        source: "internal",
        posted_by: parseInt(req.user.id, 10),
        expires_at: deadline
          ? new Date(new Date(deadline).getTime() + 30 * 24 * 60 * 60 * 1000)
          : null, // 30 days after deadline
      })
      .returning();

    res.status(201).json({
      message: "Job created successfully",
      job: newJob[0],
    });
  } catch (error) {
    logger.error("Error creating job", error);
    res.status(500).json({
      error: "Failed to create job",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Delete expired jobs (used by cron)
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
 * Manually trigger job scraping (for testing)
 */
export const triggerJobScraping = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    logger.info("Manual job scraping triggered");

    // Run the scraping task
    const result = await runWeeklyJobTask();

    res.status(200).json({
      message: "Job scraping completed successfully",
      result: {
        expiredJobsDeleted: result.deleted,
        newJobsAdded: result.scraped,
      },
    });
  } catch (error) {
    logger.error("Error during manual job scraping", error);
    res.status(500).json({
      error: "Failed to run job scraping",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
