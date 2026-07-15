import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  timestamp,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";

// Alumni profiles - extends user_profiles with alumni-specific data
export const alumni_profiles = pgTable("alumni_profiles", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title"), // Current job title
  company: text("company"), // Current company/organization
  location: text("location"), // City, State/Country
  country: text("country"),
  industry: text("industry"),
  bio: text("bio"),
  graduation_year: integer("graduation_year"),
  fellow_role: text("fellow_role"), // Role during fellowship (e.g., "Data Analyst", "Software Engineer")
  skills: jsonb("skills").$type<string[]>().default([]),
  phone: text("phone"), // For WhatsApp connect
  linkedin: text("linkedin"), // LinkedIn username/handle
  twitter: text("twitter"), // Twitter/X username
  github: text("github"), // GitHub username
  website: text("website"), // Personal website URL
  ...timestampFields,
});

// Mentorship relationships between alumni
export const alumni_mentorships = pgTable("alumni_mentorships", {
  id: serial("id").primaryKey(),
  mentor_id: integer("mentor_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  mentee_id: integer("mentee_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("active"), // active, completed, paused
  total_sessions: integer("total_sessions").default(0), // Target number of sessions
  started_at: timestamp("started_at").defaultNow(),
  ended_at: timestamp("ended_at"),
  ...timestampFields,
});

// Goals for mentorship relationships
export const mentorship_goals = pgTable("mentorship_goals", {
  id: serial("id").primaryKey(),
  mentorship_id: integer("mentorship_id")
    .notNull()
    .references(() => alumni_mentorships.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  completed_at: timestamp("completed_at"), // null = not completed, has value = completed
  ...timestampFields,
});

// Sessions for mentorship relationships
export const mentorship_sessions = pgTable("mentorship_sessions", {
  id: serial("id").primaryKey(),
  mentorship_id: integer("mentorship_id")
    .notNull()
    .references(() => alumni_mentorships.id, { onDelete: "cascade" }),
  title: text("title"),
  scheduled_at: timestamp("scheduled_at").notNull(),
  duration_minutes: integer("duration_minutes").default(60),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  notes: text("notes"),
  rating: integer("rating"), // Mentee satisfaction rating 1-5
  feedback: text("feedback"), // Mentee feedback after session
  ...timestampFields,
});

// Alumni achievements
export const alumni_achievements = pgTable("alumni_achievements", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(), // Recognition, Professional, Business Milestone, Academic, Competition, Community
  type: text("type"), // Award, Funding, Publication, Competition Win, etc.
  date: date("date"),
  organization: text("organization"), // Company or organization name
  location: text("location"),
  link: text("link"), // External link to news/press release
  image_url: text("image_url"), // Optional image
  tags: jsonb("tags").$type<string[]>().default([]),
  views: integer("views").default(0),
  ...timestampFields,
});

// Achievement likes
export const achievement_likes = pgTable("achievement_likes", {
  id: serial("id").primaryKey(),
  achievement_id: integer("achievement_id")
    .notNull()
    .references(() => alumni_achievements.id, { onDelete: "cascade" }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ...timestampFields,
});

// Achievement comments
export const achievement_comments = pgTable("achievement_comments", {
  id: serial("id").primaryKey(),
  achievement_id: integer("achievement_id")
    .notNull()
    .references(() => alumni_achievements.id, { onDelete: "cascade" }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  ...timestampFields,
});

// Job opportunities for alumni
export const job_opportunities = pgTable("job_opportunities", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  company: text("company").notNull(),
  location: text("location"),
  job_type: text("job_type"), // Full-time, Part-time, Contract, Internship
  is_remote: boolean("is_remote").default(false),
  salary_min: integer("salary_min"),
  salary_max: integer("salary_max"),
  salary_currency: text("salary_currency").default("USD"),
  description: text("description"),
  requirements: jsonb("requirements").$type<string[]>().default([]),
  skills: jsonb("skills").$type<string[]>().default([]),
  sector: text("sector").notNull(), // land, agriculture, environment, communications, ICT
  experience_level: text("experience_level"), // Entry, Junior, Mid-level, Senior, Executive
  application_url: text("application_url"),
  deadline: date("deadline"),
  source: text("source").notNull().default("internal"), // internal (posted by admin), scraped
  source_url: text("source_url"), // Original URL if scraped
  views: integer("views").default(0),
  posted_by: integer("posted_by").references(() => users.id, {
    onDelete: "set null",
  }), // null for scraped jobs
  expires_at: timestamp("expires_at"), // For cleanup of expired jobs
  ...timestampFields,
});

// Alumni resources
export const alumni_resources = pgTable("alumni_resources", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // Guide, Template, Video Course, Toolkit, Report, Cheat Sheet, Case Study, Webinar Recording, etc.
  category: text("category").notNull(), // Career Development, Entrepreneurship, Land Management, Agriculture, Environmental Conservation, Water Resources, etc.
  file_url: text("file_url").notNull(), // S3/DO Spaces URL to the file
  file_type: text("file_type"), // PDF, Excel, Word, Video, etc.
  file_size: text("file_size"), // e.g., "2.4 MB"
  thumbnail_url: text("thumbnail_url"), // Optional thumbnail image
  author_id: integer("author_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  author_name: text("author_name").notNull(), // Cached for performance
  author_title: text("author_title"), // Cached for performance
  tags: jsonb("tags").$type<string[]>().default([]),
  estimated_time: text("estimated_time"), // e.g., "2 hours", "30 minutes"
  pages: integer("pages"), // For documents
  duration: text("duration"), // For videos
  views: integer("views").default(0),
  downloads: integer("downloads").default(0),
  rating_sum: integer("rating_sum").default(0), // Sum of all ratings
  rating_count: integer("rating_count").default(0), // Number of ratings
  is_featured: boolean("is_featured").default(false), // Only admins can set this
  external_url: text("external_url"), // Optional link to external resource
  ...timestampFields,
});

// Resource likes
export const resource_likes = pgTable("resource_likes", {
  id: serial("id").primaryKey(),
  resource_id: integer("resource_id")
    .notNull()
    .references(() => alumni_resources.id, { onDelete: "cascade" }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ...timestampFields,
});

// Resource ratings
export const resource_ratings = pgTable("resource_ratings", {
  id: serial("id").primaryKey(),
  resource_id: integer("resource_id")
    .notNull()
    .references(() => alumni_resources.id, { onDelete: "cascade" }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  rating: integer("rating").notNull(), // 1-5
  review: text("review"), // Optional text review
  ...timestampFields,
});

// Resource downloads tracking
export const resource_downloads = pgTable("resource_downloads", {
  id: serial("id").primaryKey(),
  resource_id: integer("resource_id")
    .notNull()
    .references(() => alumni_resources.id, { onDelete: "cascade" }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ...timestampFields,
});

// Alumni Events
export const alumni_events = pgTable("alumni_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  event_date: timestamp("event_date").notNull(), // When the event happens
  start_time: text("start_time"), // e.g., "10:00 AM"
  end_time: text("end_time"), // e.g., "4:00 PM"
  duration: text("duration"), // e.g., "6 hours"
  location: text("location"), // Physical location or "Virtual Event"
  is_virtual: boolean("is_virtual").default(false),
  meeting_url: text("meeting_url"), // For virtual events
  type: text("type").notNull(), // Career, Networking, Workshop, Social, etc.
  category: text("category").notNull(), // Professional Development, Education, Social, etc.
  organizer: text("organizer").notNull(), // Who's organizing (Alumni Association, Chapter name, etc.)
  organizer_id: integer("organizer_id").references(() => users.id), // Optional: if organized by specific user
  max_attendees: integer("max_attendees"), // null = unlimited
  is_paid: boolean("is_paid").default(false),
  price: text("price"), // e.g., "Free", "$25", "50,000 RWF"
  currency: text("currency").default("USD"),
  status: text("status").notNull().default("Open"), // Open, Closed, Cancelled, Completed
  image_url: text("image_url"),
  speakers: jsonb("speakers")
    .$type<{ name: string; title: string; company: string }[]>()
    .default([]),
  agenda: jsonb("agenda").$type<{ time: string; activity: string }[]>().default([]),
  tags: jsonb("tags").$type<string[]>().default([]),
  views: integer("views").default(0),
  ...timestampFields,
});

// Event registrations
export const event_registrations = pgTable("event_registrations", {
  id: serial("id").primaryKey(),
  event_id: integer("event_id")
    .notNull()
    .references(() => alumni_events.id, { onDelete: "cascade" }),
  user_id: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("Registered"), // Registered, Cancelled, Attended, No-show
  ...timestampFields,
});
