"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.application_reviews = exports.applications = exports.employment_details = exports.fellowship_details = exports.opportunities = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const common_1 = require("./common");
const users_1 = require("./users");
const projects_1 = require("./projects");
const enums_1 = require("./enums");
// Opportunities Table - Base table for both fellowships and job positions
exports.opportunities = (0, pg_core_1.pgTable)('opportunities', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    title: (0, pg_core_1.varchar)('title', { length: 200 }).notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    type: (0, enums_1.opportunityTypeEnum)('type').notNull(), // 'fellowship' or 'employment'
    status: (0, enums_1.opportunityStatusEnum)('status').notNull().default('draft'),
    location_type: (0, pg_core_1.varchar)('location_type', { length: 50 }).notNull().default('remote'), // 'remote', 'onsite', 'hybrid'
    location: (0, pg_core_1.varchar)('location', { length: 255 }),
    application_deadline: (0, pg_core_1.date)('application_deadline').notNull(),
    // Eligibility criteria stored as JSON
    eligibility_criteria: (0, pg_core_1.jsonb)('eligibility_criteria').$type(),
    // Custom questions/fields for this opportunity
    custom_questions: (0, pg_core_1.jsonb)('custom_questions').$type(),
    // Relations
    category_id: (0, pg_core_1.integer)('category_id')
        .references(() => projects_1.project_categories.id),
    created_by: (0, pg_core_1.integer)('created_by')
        .notNull()
        .references(() => users_1.users.id),
    ...common_1.timestampFields,
}, (table) => {
    return {
        typeIdx: (0, pg_core_1.index)('opportunities_type_idx').on(table.type),
        statusIdx: (0, pg_core_1.index)('opportunities_status_idx').on(table.status),
        categoryIdx: (0, pg_core_1.index)('opportunities_category_id_idx').on(table.category_id),
        createdByIdx: (0, pg_core_1.index)('opportunities_created_by_idx').on(table.created_by),
    };
});
// Fellowship-specific details table (extends opportunities)
exports.fellowship_details = (0, pg_core_1.pgTable)('fellowship_details', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    opportunity_id: (0, pg_core_1.integer)('opportunity_id')
        .notNull()
        .references(() => exports.opportunities.id, { onDelete: 'cascade' }),
    program_name: (0, pg_core_1.varchar)('program_name', { length: 200 }).notNull(),
    cohort: (0, pg_core_1.varchar)('cohort', { length: 100 }),
    fellowship_type: (0, pg_core_1.varchar)('fellowship_type', { length: 100 }), // 'research', 'professional', 'academic', etc.
    // Additional fellowship-specific fields
    learning_outcomes: (0, pg_core_1.jsonb)('learning_outcomes').$type(),
    program_structure: (0, pg_core_1.jsonb)('program_structure').$type(),
    ...common_1.timestampFields,
}, (table) => {
    return {
        opportunityIdx: (0, pg_core_1.uniqueIndex)('fellowship_details_opportunity_id_idx').on(table.opportunity_id),
    };
});
// Employment-specific details table (extends opportunities)
exports.employment_details = (0, pg_core_1.pgTable)('employment_details', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    opportunity_id: (0, pg_core_1.integer)('opportunity_id')
        .notNull()
        .references(() => exports.opportunities.id, { onDelete: 'cascade' }),
    position_level: (0, pg_core_1.varchar)('position_level', { length: 100 }), // 'entry', 'mid', 'senior', etc.
    employment_type: (0, pg_core_1.varchar)('employment_type', { length: 100 }).notNull(), // 'full-time', 'part-time', 'contract', etc.
    department: (0, pg_core_1.varchar)('department', { length: 100 }),
    // Additional employment-specific fields
    responsibilities: (0, pg_core_1.jsonb)('responsibilities').$type(),
    qualifications: (0, pg_core_1.jsonb)('qualifications').$type(),
    ...common_1.timestampFields,
}, (table) => {
    return {
        opportunityIdx: (0, pg_core_1.uniqueIndex)('employment_details_opportunity_id_idx').on(table.opportunity_id),
    };
});
// Applications Table - Updated with GanzAfrica specific fields
exports.applications = (0, pg_core_1.pgTable)('applications', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    opportunity_id: (0, pg_core_1.integer)('opportunity_id')
        .references(() => exports.opportunities.id),
    // Personal Information
    first_name: (0, pg_core_1.varchar)('first_name', { length: 100 }).notNull(),
    last_name: (0, pg_core_1.varchar)('last_name', { length: 100 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull(),
    phone: (0, pg_core_1.varchar)('phone', { length: 50 }).notNull(),
    national_id: (0, pg_core_1.varchar)('national_id', { length: 100 }).notNull(),
    city: (0, pg_core_1.varchar)('city', { length: 100 }).notNull(),
    country: (0, pg_core_1.varchar)('country', { length: 100 }).notNull(),
    // Education & Experience
    education_level: (0, enums_1.educationLevelEnum)('education_level').notNull(),
    field_of_study: (0, pg_core_1.varchar)('field_of_study', { length: 200 }).notNull(),
    career_experience: (0, pg_core_1.text)('career_experience').notNull(),
    cv_url: (0, pg_core_1.varchar)('cv_url', { length: 500 }).notNull(), // CV PDF upload
    supporting_docs_url: (0, pg_core_1.varchar)('supporting_docs_url', { length: 500 }), // Supporting documents
    // Vision & Motivation
    motivation: (0, pg_core_1.text)('motivation').notNull(),
    five_year_vision: (0, pg_core_1.text)('five_year_vision').notNull(),
    // Community Impact
    desired_impact: (0, pg_core_1.text)('desired_impact').notNull(),
    community_role: (0, pg_core_1.text)('community_role').notNull(),
    national_strategy: (0, pg_core_1.text)('national_strategy').notNull(),
    // Programme Relevance
    how_ganzafrica_can_help: (0, pg_core_1.text)('how_ganzafrica_can_help').notNull(),
    contribution_to_ganzafrica: (0, pg_core_1.text)('contribution_to_ganzafrica').notNull(),
    data_processing_consent: (0, pg_core_1.boolean)('data_processing_consent').notNull().default(false),
    // Custom answers to opportunity-specific questions
    custom_answers: (0, pg_core_1.jsonb)('custom_answers').$type(),
    // Application status and tracking
    status: (0, enums_1.applicationStatusEnum)('status').notNull().default('submitted'),
    submission_date: (0, pg_core_1.timestamp)('submission_date', { withTimezone: true }).notNull().defaultNow(),
    // User reference if the applicant is a registered user
    user_id: (0, pg_core_1.integer)('user_id')
        .references(() => users_1.users.id),
    ...common_1.timestampFields,
}, (table) => {
    return {
        opportunityIdx: (0, pg_core_1.index)('applications_opportunity_id_idx').on(table.opportunity_id),
        statusIdx: (0, pg_core_1.index)('applications_status_idx').on(table.status),
        userIdx: (0, pg_core_1.index)('applications_user_id_idx').on(table.user_id),
    };
});
// Application Reviews Table - For storing reviewer feedback on applications
exports.application_reviews = (0, pg_core_1.pgTable)('application_reviews', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    application_id: (0, pg_core_1.integer)('application_id')
        .notNull()
        .references(() => exports.applications.id, { onDelete: 'cascade' }),
    reviewer_id: (0, pg_core_1.integer)('reviewer_id')
        .notNull()
        .references(() => users_1.users.id),
    score: (0, pg_core_1.integer)('score'),
    comments: (0, pg_core_1.text)('comments'), // Detailed feedback
    recommendation: (0, pg_core_1.varchar)('recommendation', { length: 50 }), // 'accept', 'reject', 'waitlist', etc.
    ...common_1.timestampFields,
}, (table) => {
    return {
        applicationIdx: (0, pg_core_1.index)('application_reviews_application_id_idx').on(table.application_id),
        reviewerIdx: (0, pg_core_1.index)('application_reviews_reviewer_id_idx').on(table.reviewer_id),
        uniqueReview: (0, pg_core_1.uniqueIndex)('unique_application_reviewer').on(table.application_id, table.reviewer_id),
    };
});
