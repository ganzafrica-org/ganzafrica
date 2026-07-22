import {
  integer,
  pgTable,
  text,
  timestamp,
  jsonb,
  serial,
  varchar,
  index,
  uniqueIndex,
  boolean,
  date,
} from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";
import { project_categories } from "./projects";
import {
  opportunityStatusEnum,
  opportunityTypeEnum,
  applicationStatusEnum,
  genderEnum,
  educationLevelEnum,
} from "./enums";

// Opportunities Table - Base table for both fellowships and job positions
export const opportunities = pgTable(
  "opportunities",
  {
    id: serial("id").primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description").notNull(),
    type: opportunityTypeEnum("type").notNull(), // 'fellowship' or 'employment'
    status: opportunityStatusEnum("status").notNull().default("draft"),
    location_type: varchar("location_type", { length: 50 }).notNull().default("remote"), // 'remote', 'onsite', 'hybrid'
    location: varchar("location", { length: 255 }),
    application_deadline: date("application_deadline").notNull(),
    // Eligibility criteria stored as JSON
    eligibility_criteria: jsonb("eligibility_criteria").$type<{
      countries?: string[];
      min_education_level?: string;
      experience_years?: number;
      skills_required?: string[];
      other_requirements?: string[];
    }>(),

    // REC-06: how many hires this posting needs. Bulk close-out (notify remaining candidates) is
    // HR-gated on accepted offers >= target_hires; until then the pool stays live for more rounds.
    target_hires: integer("target_hires").notNull().default(1),

    // Custom questions/fields for this opportunity
    custom_questions: jsonb("custom_questions").$type<
      Array<{
        id: string;
        question: string;
        field_type: "text" | "textarea" | "select" | "multiselect" | "checkbox" | "radio" | "file";
        options?: string[];
        is_required: boolean;
        max_length?: number;
        order: number;
      }>
    >(),

    // Relations
    category_id: integer("category_id").references(() => project_categories.id),

    created_by: integer("created_by")
      .notNull()
      .references(() => users.id),
    ...timestampFields,
  },
  (table) => {
    return {
      typeIdx: index("opportunities_type_idx").on(table.type),
      statusIdx: index("opportunities_status_idx").on(table.status),
      categoryIdx: index("opportunities_category_id_idx").on(table.category_id),
      createdByIdx: index("opportunities_created_by_idx").on(table.created_by),
    };
  },
);

// Fellowship-specific details table (extends opportunities)
export const fellowship_details = pgTable(
  "fellowship_details",
  {
    id: serial("id").primaryKey(),
    opportunity_id: integer("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),
    program_name: varchar("program_name", { length: 200 }).notNull(),
    cohort: varchar("cohort", { length: 100 }),
    fellowship_type: varchar("fellowship_type", { length: 100 }), // 'research', 'professional', 'academic', etc.
    // Additional fellowship-specific fields
    learning_outcomes: jsonb("learning_outcomes").$type<string[]>(),
    program_structure: jsonb("program_structure").$type<{
      phases?: Array<{
        name: string;
        description: string;
        duration_weeks: number;
      }>;
      activities?: string[];
    }>(),

    ...timestampFields,
  },
  (table) => {
    return {
      opportunityIdx: uniqueIndex("fellowship_details_opportunity_id_idx").on(table.opportunity_id),
    };
  },
);

// Employment-specific details table (extends opportunities)
export const employment_details = pgTable(
  "employment_details",
  {
    id: serial("id").primaryKey(),
    opportunity_id: integer("opportunity_id")
      .notNull()
      .references(() => opportunities.id, { onDelete: "cascade" }),

    position_level: varchar("position_level", { length: 100 }), // 'entry', 'mid', 'senior', etc.
    employment_type: varchar("employment_type", { length: 100 }).notNull(), // 'full-time', 'part-time', 'contract', etc.
    department: varchar("department", { length: 100 }),
    // Additional employment-specific fields
    responsibilities: jsonb("responsibilities").$type<string[]>(),
    qualifications: jsonb("qualifications").$type<{
      required: string[];
      preferred: string[];
    }>(),

    ...timestampFields,
  },
  (table) => {
    return {
      opportunityIdx: uniqueIndex("employment_details_opportunity_id_idx").on(table.opportunity_id),
    };
  },
);

// Applications Table - Updated with GanzAfrica specific fields
export const applications = pgTable(
  "applications",
  {
    id: serial("id").primaryKey(),
    opportunity_id: integer("opportunity_id").references(() => opportunities.id, {
      onDelete: "cascade",
    }),

    // Personal Information
    first_name: varchar("first_name", { length: 100 }).notNull(),
    last_name: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    national_id: varchar("national_id", { length: 100 }).notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),

    // Education & Experience
    education_level: educationLevelEnum("education_level").notNull(),
    field_of_study: varchar("field_of_study", { length: 200 }).notNull(),
    career_experience: text("career_experience").notNull(),
    cv_url: varchar("cv_url", { length: 500 }).notNull(), // CV PDF upload
    supporting_docs_url: varchar("supporting_docs_url", { length: 500 }), // Supporting documents

    // Vision & Motivation
    motivation: text("motivation").notNull(),
    five_year_vision: text("five_year_vision").notNull(),

    // Community Impact
    desired_impact: text("desired_impact").notNull(),
    community_role: text("community_role").notNull(),
    national_strategy: text("national_strategy").notNull(),

    // Programme Relevance
    how_ganzafrica_can_help: text("how_ganzafrica_can_help").notNull(),
    contribution_to_ganzafrica: text("contribution_to_ganzafrica").notNull(),
    data_processing_consent: boolean("data_processing_consent").notNull().default(false),

    // Custom answers to opportunity-specific questions
    custom_answers: jsonb("custom_answers").$type<Record<string, any>>(),

    // REC-01: form the application was submitted against (null for pre-spec rows) + new
    // standard fields the versioned form always collects. Nullable so legacy rows are untouched.
    form_version: integer("form_version"),
    date_of_birth: date("date_of_birth"),
    country_of_residence: text("country_of_residence"),
    country_of_work: text("country_of_work"),
    has_work_permit: boolean("has_work_permit"),

    // REC-02: pipeline_stage is the recruitment pipeline's truth; legacy `status` below is kept
    // coherent by a service-level sync map. Nullable/defaulted so existing rows are untouched.
    pipeline_stage: text("pipeline_stage").notNull().default("submitted"),
    rejection_reason: text("rejection_reason"),
    flagged: boolean("flagged").notNull().default(false),
    flag_note: text("flag_note"),

    // Application status and tracking
    status: applicationStatusEnum("status").notNull().default("submitted"),
    submission_date: timestamp("submission_date", { withTimezone: true }).notNull().defaultNow(),

    // User reference if the applicant is a registered user
    user_id: integer("user_id").references(() => users.id),

    ...timestampFields,
  },
  (table) => {
    return {
      opportunityIdx: index("applications_opportunity_id_idx").on(table.opportunity_id),
      statusIdx: index("applications_status_idx").on(table.status),
      userIdx: index("applications_user_id_idx").on(table.user_id),
    };
  },
);

// Application Reviews Table - For storing reviewer feedback on applications
export const application_reviews = pgTable(
  "application_reviews",
  {
    id: serial("id").primaryKey(),
    application_id: integer("application_id")
      .notNull()
      .references(() => applications.id, { onDelete: "cascade" }),
    reviewer_id: integer("reviewer_id")
      .notNull()
      .references(() => users.id),

    score: integer("score"),
    comments: text("comments"), // Detailed feedback
    recommendation: varchar("recommendation", { length: 50 }), // 'accept', 'reject', 'waitlist', etc.

    ...timestampFields,
  },
  (table) => {
    return {
      applicationIdx: index("application_reviews_application_id_idx").on(table.application_id),
      reviewerIdx: index("application_reviews_reviewer_id_idx").on(table.reviewer_id),
      uniqueReview: uniqueIndex("unique_application_reviewer").on(
        table.application_id,
        table.reviewer_id,
      ),
    };
  },
);
