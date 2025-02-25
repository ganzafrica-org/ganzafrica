// packages/api/src/db/indexes.ts
import { index, uniqueIndex, pgTableCreator } from 'drizzle-orm/pg-core'
import * as schema from './schema'

// Users & Authentication Indexes
export const usersEmailIndex = uniqueIndex('idx_users_email').on(schema.users.email)
export const usersBaseRoleIndex = index('idx_users_base_role').on(schema.users.base_role)
export const userProfilesUserIdIndex = index('idx_user_profiles_user_id').on(schema.user_profiles.user_id)
export const sessionsUserIdValidIndex = index('idx_sessions_user_id_valid').on(
    schema.sessions.user_id,
    schema.sessions.is_valid
)

// Content & Search Indexes
export const contentPagesSlugIndex = uniqueIndex('idx_content_pages_slug').on(schema.content_pages.slug)
export const blogPostsSlugIndex = uniqueIndex('idx_blog_posts_slug').on(schema.blog_posts.slug)
export const contentPagesStatusPublishedIndex = index('idx_content_pages_status_published').on(
    schema.content_pages.status,
    schema.content_pages.published_at
)
export const blogPostsStatusPublishedIndex = index('idx_blog_posts_status_published').on(
    schema.blog_posts.status,
    schema.blog_posts.published_at
)
// Note: GIN indexes for JSONB fields are not directly supported in Drizzle yet
// Will be implemented in SQL migrations or custom SQL

// Applications & Jobs Indexes
export const jobPostingsStatusPublishedIndex = index('idx_job_postings_status_published').on(
    schema.job_postings.status,
    schema.job_postings.published_at
)
export const applicationsApplicantIdIndex = index('idx_applications_applicant_id').on(
    schema.applications.applicant_id
)
export const applicationsJobPostingStageIndex = index('idx_applications_job_stage').on(
    schema.applications.job_posting_id,
    schema.applications.current_stage_id
)
export const applicationStageHistoryAppCreatedIndex = index('idx_app_stage_history_app_created').on(
    schema.application_stage_history.application_id,
    schema.application_stage_history.created_at
)

// Fellowship & Projects Indexes
export const fellowsUserIdIndex = index('idx_fellows_user_id').on(schema.fellows.user_id)
export const fellowsCohortIdIndex = index('idx_fellows_cohort_id').on(schema.fellows.cohort_id)
export const projectMembersUserIdIndex = index('idx_project_members_user_id').on(schema.project_members.user_id)
export const projectMembersProjectIdIndex = index('idx_project_members_project_id').on(schema.project_members.project_id)
export const fellowMilestoneProgressIndex = index('idx_fellow_milestone_progress').on(
    schema.fellow_milestone_progress.fellow_id,
    schema.fellow_milestone_progress.milestone_id
)

// Mentorship Indexes
export const mentorshipRelationshipsMentorIndex = index('idx_mentorship_mentor').on(
    schema.mentorship_relationships.mentor_id
)
export const mentorshipRelationshipsMenteeIndex = index('idx_mentorship_mentee').on(
    schema.mentorship_relationships.mentee_id
)
export const mentorshipRelationshipsStatusTypeIndex = index('idx_mentorship_status_type').on(
    schema.mentorship_relationships.status,
    schema.mentorship_relationships.type
)
export const mentorshipSessionsRelationshipDateIndex = index('idx_mentorship_sessions_rel_date').on(
    schema.mentorship_sessions.relationship_id,
    schema.mentorship_sessions.session_date
)
export const mentorshipGoalsRelationshipStatusIndex = index('idx_mentorship_goals_rel_status').on(
    schema.mentorship_goals.relationship_id,
    schema.mentorship_goals.status
)
// GIN indexes will be added in SQL migrations