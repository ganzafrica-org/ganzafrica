import { Request, Response } from "express";
import { db } from "../db/client";
import {
  users,
  roles,
  alumni_profiles,
  alumni_mentorships,
} from "../db/schema";
import { eq, and, sql, count, countDistinct } from "drizzle-orm";
import { AppError } from "../middlewares";
import { Logger } from "../config";

const logger = new Logger("AlumniController");

/**
 * Get alumni directory statistics
 * Returns total alumni count, active mentors count, countries count, industries count
 */
export const getAlumniStats = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Get the alumni role ID
    const alumniRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "alumni"))
      .limit(1);

    if (!alumniRole || alumniRole.length === 0) {
      res.status(200).json({
        stats: {
          totalAlumni: 0,
          alumniWithMentees: 0,
          countriesCount: 0,
          industriesCount: 0,
        },
      });
      return;
    }

    const alumniRoleId = alumniRole[0].id;

    // Get total alumni count
    const totalAlumniResult = await db
      .select({ count: count() })
      .from(users)
      .where(and(eq(users.role_id, alumniRoleId), eq(users.is_active, true)));

    const totalAlumni = totalAlumniResult[0]?.count || 0;

    // Get alumni with active mentees count
    const mentorsResult = await db
      .select({ count: countDistinct(alumni_mentorships.mentor_id) })
      .from(alumni_mentorships)
      .where(eq(alumni_mentorships.status, "active"));

    const alumniWithMentees = mentorsResult[0]?.count || 0;

    // Get unique countries count
    const countriesResult = await db
      .select({ count: countDistinct(alumni_profiles.country) })
      .from(alumni_profiles)
      .innerJoin(users, eq(alumni_profiles.user_id, users.id))
      .where(and(eq(users.role_id, alumniRoleId), eq(users.is_active, true)));

    const countriesCount = countriesResult[0]?.count || 0;

    // Get unique industries count
    const industriesResult = await db
      .select({ count: countDistinct(alumni_profiles.industry) })
      .from(alumni_profiles)
      .innerJoin(users, eq(alumni_profiles.user_id, users.id))
      .where(and(eq(users.role_id, alumniRoleId), eq(users.is_active, true)));

    const industriesCount = industriesResult[0]?.count || 0;

    res.status(200).json({
      stats: {
        totalAlumni,
        alumniWithMentees,
        countriesCount,
        industriesCount,
      },
    });
  } catch (error) {
    logger.error("Error fetching alumni stats", error);
    res.status(500).json({
      error: "Failed to fetch alumni statistics",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get all alumni with their profiles
 * Supports filtering by country, industry, graduation year, search, and pagination
 */
export const getAllAlumni = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { country, industry, graduationYear, search, page, limit } =
      req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(
      50,
      Math.max(1, parseInt(limit as string, 10) || 15),
    );

    // Get the alumni role ID
    const alumniRole = await db
      .select()
      .from(roles)
      .where(eq(roles.name, "alumni"))
      .limit(1);

    if (!alumniRole || alumniRole.length === 0) {
      res.status(200).json({ alumni: [] });
      return;
    }

    const alumniRoleId = alumniRole[0].id;

    // Build the query
    let query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar_url: users.avatar_url,
        title: alumni_profiles.title,
        company: alumni_profiles.company,
        location: alumni_profiles.location,
        country: alumni_profiles.country,
        industry: alumni_profiles.industry,
        bio: alumni_profiles.bio,
        graduation_year: alumni_profiles.graduation_year,
        fellow_role: alumni_profiles.fellow_role,
        skills: alumni_profiles.skills,
        phone: alumni_profiles.phone,
        linkedin: alumni_profiles.linkedin,
        twitter: alumni_profiles.twitter,
        github: alumni_profiles.github,
        website: alumni_profiles.website,
      })
      .from(users)
      .leftJoin(alumni_profiles, eq(users.id, alumni_profiles.user_id))
      .where(and(eq(users.role_id, alumniRoleId), eq(users.is_active, true)))
      .$dynamic();

    // Execute query
    const alumniList = await query;

    // Get mentee counts for each alumni
    const menteeCounts = await db
      .select({
        mentor_id: alumni_mentorships.mentor_id,
        count: count(),
      })
      .from(alumni_mentorships)
      .where(eq(alumni_mentorships.status, "active"))
      .groupBy(alumni_mentorships.mentor_id);

    const menteeCountMap = new Map(
      menteeCounts.map((m) => [m.mentor_id, m.count]),
    );

    // Format and filter the response
    let formattedAlumni = alumniList.map((alumni) => ({
      id: alumni.id,
      name: alumni.name,
      avatar: alumni.avatar_url,
      title: alumni.title || "",
      company: alumni.company || "",
      location: alumni.location || "",
      country: alumni.country || "",
      industry: alumni.industry || "",
      bio: alumni.bio || "",
      graduationYear: alumni.graduation_year || null,
      fellowRole: alumni.fellow_role || "",
      skills: (alumni.skills as string[]) || [],
      phone: alumni.phone || null,
      linkedin: alumni.linkedin || null,
      twitter: alumni.twitter || null,
      github: alumni.github || null,
      website: alumni.website || null,
      activeMenteesCount: menteeCountMap.get(alumni.id) || 0,
    }));

    // Apply filters
    if (country && country !== "all") {
      formattedAlumni = formattedAlumni.filter((a) => a.country === country);
    }

    if (industry && industry !== "all") {
      formattedAlumni = formattedAlumni.filter((a) => a.industry === industry);
    }

    if (graduationYear && graduationYear !== "all") {
      formattedAlumni = formattedAlumni.filter(
        (a) => a.graduationYear?.toString() === graduationYear,
      );
    }

    if (search && typeof search === "string") {
      const searchLower = search.toLowerCase();
      formattedAlumni = formattedAlumni.filter(
        (a) =>
          a.name.toLowerCase().includes(searchLower) ||
          a.company.toLowerCase().includes(searchLower) ||
          a.title.toLowerCase().includes(searchLower) ||
          a.skills.some((skill) => skill.toLowerCase().includes(searchLower)),
      );
    }

    // Get unique filter options
    const allCountries = [
      ...new Set(alumniList.map((a) => a.country).filter(Boolean)),
    ].sort();
    const allIndustries = [
      ...new Set(alumniList.map((a) => a.industry).filter(Boolean)),
    ].sort();
    const allYears = [
      ...new Set(alumniList.map((a) => a.graduation_year).filter(Boolean)),
    ].sort((a, b) => (b || 0) - (a || 0));

    // Apply pagination
    const totalCount = formattedAlumni.length;
    const totalPages = Math.ceil(totalCount / limitNum);
    const offset = (pageNum - 1) * limitNum;
    const paginatedAlumni = formattedAlumni.slice(offset, offset + limitNum);

    res.status(200).json({
      alumni: paginatedAlumni,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalCount,
        totalPages,
        hasMore: pageNum < totalPages,
      },
      filters: {
        countries: allCountries,
        industries: allIndustries,
        graduationYears: allYears,
      },
    });
  } catch (error) {
    logger.error("Error fetching alumni list", error);
    res.status(500).json({
      error: "Failed to fetch alumni list",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Get current user's alumni profile
 */
export const getAlumniProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = parseInt(req.user.id, 10);

    // Get user info
    const userResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar_url: users.avatar_url,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userResult || userResult.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const user = userResult[0];

    // Get alumni profile
    const profileResult = await db
      .select()
      .from(alumni_profiles)
      .where(eq(alumni_profiles.user_id, userId))
      .limit(1);

    const profile = profileResult[0] || null;

    res.status(200).json({
      profile: {
        id: profile?.id || null,
        userId: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar_url,
        title: profile?.title || null,
        company: profile?.company || null,
        location: profile?.location || null,
        country: profile?.country || null,
        industry: profile?.industry || null,
        bio: profile?.bio || null,
        graduationYear: profile?.graduation_year || null,
        fellowRole: profile?.fellow_role || null,
        skills: (profile?.skills as string[]) || [],
        phone: profile?.phone || null,
        linkedin: profile?.linkedin || null,
        twitter: profile?.twitter || null,
        github: profile?.github || null,
        website: profile?.website || null,
      },
    });
  } catch (error) {
    logger.error("Error fetching alumni profile", error);
    res.status(500).json({
      error: "Failed to fetch profile",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Update current user's alumni profile
 */
export const updateAlumniProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const userId = parseInt(req.user.id, 10);
    const {
      title,
      company,
      location,
      country,
      industry,
      bio,
      graduationYear,
      fellowRole,
      skills,
      phone,
      linkedin,
      twitter,
      github,
      website,
    } = req.body;

    // Check if profile exists
    const existingProfile = await db
      .select()
      .from(alumni_profiles)
      .where(eq(alumni_profiles.user_id, userId))
      .limit(1);

    let profile;

    if (existingProfile.length > 0) {
      // Update existing profile
      const updateResult = await db
        .update(alumni_profiles)
        .set({
          title,
          company,
          location,
          country,
          industry,
          bio,
          graduation_year: graduationYear,
          fellow_role: fellowRole,
          skills: skills || [],
          phone,
          linkedin,
          twitter,
          github,
          website,
          updated_at: new Date(),
        })
        .where(eq(alumni_profiles.user_id, userId))
        .returning();

      profile = updateResult[0];
    } else {
      // Create new profile
      const insertResult = await db
        .insert(alumni_profiles)
        .values({
          user_id: userId,
          title,
          company,
          location,
          country,
          industry,
          bio,
          graduation_year: graduationYear,
          fellow_role: fellowRole,
          skills: skills || [],
          phone,
          linkedin,
          twitter,
          github,
          website,
        })
        .returning();

      profile = insertResult[0];
    }

    // Get user info for response
    const userResult = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        avatar_url: users.avatar_url,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const user = userResult[0];

    res.status(200).json({
      profile: {
        id: profile.id,
        userId: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar_url,
        title: profile.title,
        company: profile.company,
        location: profile.location,
        country: profile.country,
        industry: profile.industry,
        bio: profile.bio,
        graduationYear: profile.graduation_year,
        fellowRole: profile.fellow_role,
        skills: (profile.skills as string[]) || [],
        phone: profile.phone,
        linkedin: profile.linkedin,
        twitter: profile.twitter,
        github: profile.github,
        website: profile.website,
      },
    });
  } catch (error) {
    logger.error("Error updating alumni profile", error);
    res.status(500).json({
      error: "Failed to update profile",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
