import { pgEnum } from 'drizzle-orm/pg-core'
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video']);


export const baseRoleEnum = pgEnum('base_role', [
    'applicant',
    'fellow',
    'employee',
    'alumni',
])

export const twoFactorMethodEnum = pgEnum('two_factor_method', [
    'authenticator',
    'sms',
    'email',
])

export const cohortStatusEnum = pgEnum('cohort_status', [
    'planned',
    'active',
    'completed',
])

export const fellowStatusEnum = pgEnum('fellow_status', [
    'active',
    'graduated',
    'dropped',
])

export const projectStatusEnum = pgEnum('project_status', [
    'planned',
    'active',
    'completed',
])

export const projectMemberRoleEnum = pgEnum('project_member_role', [
    'lead',
    'member',
    'supervisor',
])

export const milestoneStatusEnum = pgEnum('milestone_status', [
    'pending',
    'in_progress',
    'completed',
    'failed'
])

export const jobTypeEnum = pgEnum('job_posting_type', [
    'fellowship',
    'employment',
])

export const jobPostingTypeEnum = pgEnum('job_posting_type', [
    'internal',
    'external',
    'partner'
])

export const postingStatusEnum = pgEnum('posting_status', [
    'draft',
    'published',
    'closed',
])

export const documentTypeEnum = pgEnum('document_type', [
    'cv',
    'cover_letter',
    'certificate',
    'other',
])

export const contentStatusEnum = pgEnum('content_status', [
    'draft',
    'published',
    'archived',
])

export const resourceTypeEnum = pgEnum('resource_type', [
    'document',
    'video',
    'guide',
    'research',
])

export const resourceAccessEnum = pgEnum('resource_access', [
    'public',
    'fellow',
    'employee',
    'alumni',
])

export const eventTypeEnum = pgEnum('event_type', [
    'public',
    'internal',
    'training',
])

export const attendeeStatusEnum = pgEnum('attendee_status', [
    'registered',
    'attended',
    'cancelled',
])

export const mentorshipTypeEnum = pgEnum('mentorship_type', [
    'fellow_mentor',
    'peer_mentor',
    'alumni_mentor',
])

export const mentorshipStatusEnum = pgEnum('mentorship_status', [
    'active',
    'completed',
    'paused',
])

export const mentorshipSessionStatusEnum = pgEnum('session_status',['scheduled', 'completed', 'cancelled'])

export const mentorshipGoalStatusEnum = pgEnum('goal_status', ['active', 'completed', 'dropped'])

export const applicationStageStatusEnum = pgEnum('application_stage_status', [
    'pending',
    'passed',
    'failed',
])

export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'unsubscribed'])

export const verificationTypeEnum = pgEnum('verification_type', ['email', 'phone'])

export const contextTypeEnum = pgEnum('context_type', ['project', 'department', 'personal_development', 'other'])