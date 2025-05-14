"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contextTypeEnum = exports.verificationTypeEnum = exports.educationLevelEnum = exports.genderEnum = exports.applicationStatusEnum = exports.opportunityTypeEnum = exports.opportunityStatusEnum = exports.mentorshipStatusEnum = exports.mentorshipTypeEnum = exports.attendeeStatusEnum = exports.eventTypeEnum = exports.resourceAccessEnum = exports.resourceTypeEnum = exports.contentStatusEnum = exports.documentTypeEnum = exports.postingStatusEnum = exports.jobPostingTypeEnum = exports.jobTypeEnum = exports.projectMemberRoleEnum = exports.mediaTagEnum = exports.projectStatusEnum = exports.newsCategoryEnum = exports.newsStatusEnum = exports.twoFactorMethodEnum = exports.mediaTypeEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.mediaTypeEnum = (0, pg_core_1.pgEnum)("media_type", ["image", "video"]);
exports.twoFactorMethodEnum = (0, pg_core_1.pgEnum)("two_factor_method", [
    "authenticator",
    "sms",
    "email",
]);
// News related enums
exports.newsStatusEnum = (0, pg_core_1.pgEnum)("news_status", [
    "published",
    "not_published",
]);
exports.newsCategoryEnum = (0, pg_core_1.pgEnum)("news_category", [
    "all",
    "news",
    "blogs",
    "reports",
    "publications",
]);
exports.projectStatusEnum = (0, pg_core_1.pgEnum)("project_status", [
    "planned",
    "active",
    "completed",
    "cancelled",
    "on_hold",
]);
// Media tag enum
exports.mediaTagEnum = (0, pg_core_1.pgEnum)("media_tag", [
    "feature",
    "description",
    "others"
]);
exports.projectMemberRoleEnum = (0, pg_core_1.pgEnum)("project_member_role", [
    "lead",
    "member",
    "supervisor",
    "contributor",
]);
exports.jobTypeEnum = (0, pg_core_1.pgEnum)("job_type", ["fellowship", "employment"]);
exports.jobPostingTypeEnum = (0, pg_core_1.pgEnum)("job_posting_type", [
    "internal",
    "external",
    "partner",
]);
exports.postingStatusEnum = (0, pg_core_1.pgEnum)("posting_status", [
    "draft",
    "published",
    "closed",
]);
exports.documentTypeEnum = (0, pg_core_1.pgEnum)("document_type", [
    "cv",
    "cover_letter",
    "certificate",
    "other",
]);
exports.contentStatusEnum = (0, pg_core_1.pgEnum)("content_status", [
    "draft",
    "published",
    "archived",
]);
exports.resourceTypeEnum = (0, pg_core_1.pgEnum)("resource_type", [
    "document",
    "video",
    "guide",
    "research",
]);
exports.resourceAccessEnum = (0, pg_core_1.pgEnum)("resource_access", [
    "public",
    "fellow",
    "employee",
    "alumni",
]);
exports.eventTypeEnum = (0, pg_core_1.pgEnum)("event_type", [
    "public",
    "internal",
    "training",
]);
exports.attendeeStatusEnum = (0, pg_core_1.pgEnum)("attendee_status", [
    "registered",
    "attended",
    "cancelled",
]);
exports.mentorshipTypeEnum = (0, pg_core_1.pgEnum)("mentorship_type", [
    "fellow_mentor",
    "peer_mentor",
    "alumni_mentor",
]);
exports.mentorshipStatusEnum = (0, pg_core_1.pgEnum)("mentorship_status", [
    "active",
    "completed",
    "paused",
]);
// Opportunity status enum
exports.opportunityStatusEnum = (0, pg_core_1.pgEnum)('opportunity_status', [
    'draft',
    'published',
    'closed',
    'cancelled'
]);
// Opportunity type enum
exports.opportunityTypeEnum = (0, pg_core_1.pgEnum)('opportunity_type', [
    'fellowship',
    'employment'
]);
// Application status enum
exports.applicationStatusEnum = (0, pg_core_1.pgEnum)('application_status', [
    'submitted',
    'under_review',
    'shortlisted',
    'interviewed',
    'accepted',
    'rejected',
    'waitlisted',
    'withdrawn'
]);
// Gender enum
exports.genderEnum = (0, pg_core_1.pgEnum)('gender', [
    'male',
    'female',
    'non_binary',
    'prefer_not_to_say',
    'other'
]);
// Education level enum
exports.educationLevelEnum = (0, pg_core_1.pgEnum)('education_level', [
    'high_school',
    'associate_degree',
    'bachelors_degree',
    'masters_degree',
    'doctorate',
    'professional_certification',
    'other'
]);
exports.verificationTypeEnum = (0, pg_core_1.pgEnum)("verification_type", [
    "email",
    "phone",
]);
exports.contextTypeEnum = (0, pg_core_1.pgEnum)("context_type", [
    "project",
    "department",
    "personal_development",
    "other",
]);
