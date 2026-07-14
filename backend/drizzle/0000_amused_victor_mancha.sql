CREATE TYPE "public"."application_status" AS ENUM('submitted', 'under_review', 'shortlisted', 'interviewed', 'accepted', 'rejected', 'waitlisted', 'withdrawn');--> statement-breakpoint
CREATE TYPE "public"."attendee_status" AS ENUM('registered', 'attended', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."content_status" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TYPE "public"."context_type" AS ENUM('project', 'department', 'personal_development', 'other');--> statement-breakpoint
CREATE TYPE "public"."document_type" AS ENUM('cv', 'cover_letter', 'certificate', 'other');--> statement-breakpoint
CREATE TYPE "public"."education_level" AS ENUM('high_school', 'associate_degree', 'bachelors_degree', 'masters_degree', 'doctorate', 'professional_certification', 'other');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('public', 'internal', 'training');--> statement-breakpoint
CREATE TYPE "public"."gender" AS ENUM('male', 'female', 'non_binary', 'prefer_not_to_say', 'other');--> statement-breakpoint
CREATE TYPE "public"."job_posting_type" AS ENUM('internal', 'external', 'partner');--> statement-breakpoint
CREATE TYPE "public"."job_type" AS ENUM('fellowship', 'employment');--> statement-breakpoint
CREATE TYPE "public"."media_tag" AS ENUM('feature', 'description', 'others');--> statement-breakpoint
CREATE TYPE "public"."media_type" AS ENUM('image', 'video');--> statement-breakpoint
CREATE TYPE "public"."mentorship_status" AS ENUM('active', 'completed', 'paused');--> statement-breakpoint
CREATE TYPE "public"."mentorship_type" AS ENUM('fellow_mentor', 'peer_mentor', 'alumni_mentor');--> statement-breakpoint
CREATE TYPE "public"."news_category" AS ENUM('all', 'news', 'blogs', 'reports', 'publications');--> statement-breakpoint
CREATE TYPE "public"."news_status" AS ENUM('published', 'not_published');--> statement-breakpoint
CREATE TYPE "public"."opportunity_status" AS ENUM('draft', 'published', 'closed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."opportunity_type" AS ENUM('fellowship', 'employment');--> statement-breakpoint
CREATE TYPE "public"."posting_status" AS ENUM('draft', 'published', 'closed');--> statement-breakpoint
CREATE TYPE "public"."project_member_role" AS ENUM('lead', 'member', 'supervisor', 'contributor');--> statement-breakpoint
CREATE TYPE "public"."project_status" AS ENUM('planned', 'active', 'completed', 'cancelled', 'on_hold', 'overdue');--> statement-breakpoint
CREATE TYPE "public"."resource_access" AS ENUM('public', 'fellow', 'employee', 'alumni');--> statement-breakpoint
CREATE TYPE "public"."resource_type" AS ENUM('document', 'video', 'guide', 'research');--> statement-breakpoint
CREATE TYPE "public"."task_project_status" AS ENUM('planning', 'active', 'on_hold', 'completed', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."task_team_role" AS ENUM('owner', 'admin', 'member', 'viewer');--> statement-breakpoint
CREATE TYPE "public"."task_team_status" AS ENUM('active', 'inactive', 'archived');--> statement-breakpoint
CREATE TYPE "public"."two_factor_method" AS ENUM('authenticator', 'sms', 'email');--> statement-breakpoint
CREATE TYPE "public"."verification_type" AS ENUM('email', 'phone');--> statement-breakpoint
CREATE TYPE "public"."asset_issue" AS ENUM('YES', 'NO');--> statement-breakpoint
CREATE TYPE "public"."asset_status" AS ENUM('AVAILABLE', 'ASSIGNED', 'UNDER_MAINTENANCE', 'DISPOSED');--> statement-breakpoint
CREATE TYPE "public"."contract_status" AS ENUM('ACTIVE', 'EXPIRED', 'TERMINATED');--> statement-breakpoint
CREATE TYPE "public"."contract_type" AS ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP');--> statement-breakpoint
CREATE TYPE "public"."policy_category" AS ENUM('Contract Templates', 'Policies & Procedures', 'Forms & Applications', 'Training Materials', 'Compliance & Legal', 'Onboarding Materials');--> statement-breakpoint
CREATE TYPE "public"."policy_status" AS ENUM('PUBLISHED', 'DRAFT');--> statement-breakpoint
CREATE TYPE "public"."hr_role" AS ENUM('EMPLOYEE', 'IT', 'HR');--> statement-breakpoint
CREATE TYPE "public"."leave_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED');--> statement-breakpoint
CREATE TYPE "public"."leave_type" AS ENUM('ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."maintenance_status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TYPE "public"."notification_priority" AS ENUM('LOW', 'NORMAL', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."notification_status" AS ENUM('UNREAD', 'READ', 'ARCHIVED');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('EMPLOYEE_CREATED', 'EMPLOYEE_STATUS_CHANGED', 'CONTRACT_CREATED', 'CONTRACT_UPDATED', 'CONTRACT_EXPIRING', 'LEAVE_REQUESTED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'LEAVE_CANCELLED', 'TICKET_CREATED', 'TICKET_STATUS_CHANGED', 'TICKET_ASSIGNED', 'ASSET_ASSIGNED', 'ASSET_RETURNED', 'ASSET_STATUS_CHANGED', 'DOCUMENT_PUBLISHED');--> statement-breakpoint
CREATE TYPE "public"."ticket_priority" AS ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');--> statement-breakpoint
CREATE TYPE "public"."user_status" AS ENUM('ACTIVE', 'ON_LEAVE', 'INACTIVE', 'TERMINATED');--> statement-breakpoint
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('overdue', 'todo', 'inprogress', 'review', 'done');--> statement-breakpoint
CREATE TABLE "achievement_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"achievement_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievement_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"achievement_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alumni_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"category" text NOT NULL,
	"type" text,
	"date" date,
	"organization" text,
	"location" text,
	"link" text,
	"image_url" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alumni_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"event_date" timestamp NOT NULL,
	"start_time" text,
	"end_time" text,
	"duration" text,
	"location" text,
	"is_virtual" boolean DEFAULT false,
	"meeting_url" text,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"organizer" text NOT NULL,
	"organizer_id" integer,
	"max_attendees" integer,
	"is_paid" boolean DEFAULT false,
	"price" text,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'Open' NOT NULL,
	"image_url" text,
	"speakers" jsonb DEFAULT '[]'::jsonb,
	"agenda" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alumni_mentorships" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentor_id" integer NOT NULL,
	"mentee_id" integer NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"total_sessions" integer DEFAULT 0,
	"started_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "alumni_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"title" text,
	"company" text,
	"location" text,
	"country" text,
	"industry" text,
	"bio" text,
	"graduation_year" integer,
	"fellow_role" text,
	"skills" jsonb DEFAULT '[]'::jsonb,
	"phone" text,
	"linkedin" text,
	"twitter" text,
	"github" text,
	"website" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "alumni_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "alumni_resources" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text,
	"file_size" text,
	"thumbnail_url" text,
	"author_id" integer NOT NULL,
	"author_name" text NOT NULL,
	"author_title" text,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"estimated_time" text,
	"pages" integer,
	"duration" text,
	"views" integer DEFAULT 0,
	"downloads" integer DEFAULT 0,
	"rating_sum" integer DEFAULT 0,
	"rating_count" integer DEFAULT 0,
	"is_featured" boolean DEFAULT false,
	"external_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" text DEFAULT 'Registered' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"company" text NOT NULL,
	"location" text,
	"job_type" text,
	"is_remote" boolean DEFAULT false,
	"salary_min" integer,
	"salary_max" integer,
	"salary_currency" text DEFAULT 'USD',
	"description" text,
	"requirements" jsonb DEFAULT '[]'::jsonb,
	"skills" jsonb DEFAULT '[]'::jsonb,
	"sector" text NOT NULL,
	"experience_level" text,
	"application_url" text,
	"deadline" date,
	"source" text DEFAULT 'internal' NOT NULL,
	"source_url" text,
	"views" integer DEFAULT 0,
	"posted_by" integer,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentorship_goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentorship_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mentorship_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"mentorship_id" integer NOT NULL,
	"title" text,
	"scheduled_at" timestamp NOT NULL,
	"duration_minutes" integer DEFAULT 60,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"rating" integer,
	"feedback" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_downloads" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_likes" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "resource_ratings" (
	"id" serial PRIMARY KEY NOT NULL,
	"resource_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"rating" integer NOT NULL,
	"review" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "audit_logs" (
	"id" integer PRIMARY KEY NOT NULL,
	"user_id" integer,
	"action" text NOT NULL,
	"resource_type" text NOT NULL,
	"resource_id" integer,
	"changes" jsonb,
	"ip_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50),
	"message" text NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"is_resolved" boolean DEFAULT false NOT NULL,
	"responded_at" timestamp,
	"location" varchar(100) DEFAULT 'global',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "newsletter_subscribers" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"subscribed_at" timestamp DEFAULT now() NOT NULL,
	"unsubscribed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "faqs" (
	"id" serial PRIMARY KEY NOT NULL,
	"question" text NOT NULL,
	"answer" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_asset_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"parent_name" text,
	"slug" text NOT NULL,
	"spec_schema" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hr_asset_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "hr_asset_images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"url" text NOT NULL,
	"storage_key" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_asset_maintenance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"requester_id" uuid NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" "maintenance_status" DEFAULT 'PENDING' NOT NULL,
	"rejection_reason" text,
	"price" numeric(12, 2),
	"maintenance_date" timestamp with time zone DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_asset_specs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"asset_id" uuid NOT NULL,
	"spec_key" text NOT NULL,
	"spec_value" text NOT NULL,
	CONSTRAINT "hr_asset_specs_asset_id_spec_key_unique" UNIQUE("asset_id","spec_key")
);
--> statement-breakpoint
CREATE TABLE "hr_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"device_name" text NOT NULL,
	"serial_number" text NOT NULL,
	"category_id" uuid NOT NULL,
	"purchase_price" numeric(12, 2),
	"status" "asset_status" DEFAULT 'AVAILABLE' NOT NULL,
	"assigned_to_id" uuid,
	"assigned_at" timestamp with time zone,
	"returned_at" timestamp with time zone,
	"notes" text,
	"has_issue" "asset_issue" DEFAULT 'NO' NOT NULL,
	"is_flagged" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hr_assets_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE "hr_contracts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"job_title" text NOT NULL,
	"department" text,
	"work_location" text,
	"manager" text,
	"report_to" text,
	"start_date" timestamp with time zone NOT NULL,
	"employment_term" text NOT NULL,
	"end_date" timestamp with time zone,
	"employment_type" text NOT NULL,
	"days_per_week" integer,
	"compensation_type" text NOT NULL,
	"salary_scale" text,
	"currency" text DEFAULT 'RWF' NOT NULL,
	"base_monthly_rate" numeric(14, 2),
	"gross_annual_rate" numeric(14, 2),
	"employment_agreement_url" text,
	"status" "contract_status" DEFAULT 'ACTIVE' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"document_name" text NOT NULL,
	"document_category" "policy_category" NOT NULL,
	"version" text NOT NULL,
	"description" text NOT NULL,
	"department" text NOT NULL,
	"file_path" text NOT NULL,
	"file_size" text NOT NULL,
	"downloads" integer DEFAULT 0 NOT NULL,
	"status" "policy_status" DEFAULT 'DRAFT' NOT NULL,
	"access" jsonb NOT NULL,
	"contract_id" uuid,
	"created_by_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"email" text NOT NULL,
	"created_by_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"platform_user_id" integer,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"personal_email" text NOT NULL,
	"work_email" text,
	"phone" text,
	"picture" text,
	"citizenship" text,
	"home_country" text,
	"home_city" text,
	"password_hash" text NOT NULL,
	"role" "hr_role" NOT NULL,
	"status" "user_status" DEFAULT 'ACTIVE' NOT NULL,
	"avatar_initials" text NOT NULL,
	"refresh_token_hash" text,
	"last_password_change" timestamp with time zone DEFAULT now() NOT NULL,
	"requires_password_reset" boolean DEFAULT false NOT NULL,
	"profile_setup_completed" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hr_users_platform_user_id_unique" UNIQUE("platform_user_id"),
	CONSTRAINT "hr_users_personal_email_unique" UNIQUE("personal_email")
);
--> statement-breakpoint
CREATE TABLE "hr_helpdesk_tickets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"submitted_by_id" uuid NOT NULL,
	"assigned_to_id" uuid,
	"status" "ticket_status" DEFAULT 'OPEN' NOT NULL,
	"priority" "ticket_priority" DEFAULT 'MEDIUM' NOT NULL,
	"answer" text,
	"answered_at" timestamp with time zone,
	"resolved_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_leaves" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"type" "leave_type" NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"reason" text NOT NULL,
	"status" "leave_status" DEFAULT 'PENDING' NOT NULL,
	"reviewed_by_id" uuid,
	"reviewed_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_notification_preferences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" integer NOT NULL,
	"email_enabled" boolean DEFAULT false NOT NULL,
	"contract_expiry" boolean DEFAULT true NOT NULL,
	"leave_updates" boolean DEFAULT true NOT NULL,
	"ticket_updates" boolean DEFAULT true NOT NULL,
	"asset_updates" boolean DEFAULT true NOT NULL,
	"policy_updates" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "hr_notification_preferences_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "hr_notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"recipient_id" integer NOT NULL,
	"type" "notification_type" NOT NULL,
	"priority" "notification_priority" DEFAULT 'NORMAL' NOT NULL,
	"status" "notification_status" DEFAULT 'UNREAD' NOT NULL,
	"title" varchar(255) NOT NULL,
	"message" text NOT NULL,
	"metadata" jsonb,
	"read_at" timestamp with time zone,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"bio" text,
	"phone" text,
	"address" text,
	"social_links" jsonb,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role_id" integer NOT NULL,
	"password_hash" text NOT NULL,
	"avatar_url" text,
	"two_factor_enabled" boolean DEFAULT false NOT NULL,
	"two_factor_method" "two_factor_method",
	"backup_codes" jsonb,
	"email_verified" boolean DEFAULT false NOT NULL,
	"phone_number" text,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"last_password_change" timestamp,
	"last_login" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"account_locked" boolean DEFAULT false NOT NULL,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"last_failed_attempt" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "project_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "project_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"file_url" varchar(1000) NOT NULL,
	"file_size" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"role" "project_member_role" DEFAULT 'member' NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"partner_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_updates" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"author_id" integer NOT NULL,
	"title" varchar(200),
	"content" jsonb NOT NULL,
	"media" jsonb,
	"update_type" varchar(50) DEFAULT 'general',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"full_description" text,
	"status" "project_status" DEFAULT 'planned' NOT NULL,
	"category_id" integer NOT NULL,
	"partner_id" integer,
	"goals" jsonb,
	"outcomes" jsonb,
	"location" varchar(255),
	"media" jsonb,
	"other_information" jsonb,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "password_reset_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"ip_address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" integer PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"refresh_token_hash" text,
	"expires_at" timestamp NOT NULL,
	"last_activity" timestamp NOT NULL,
	"ip_address" text NOT NULL,
	"user_agent" text NOT NULL,
	"device_info" jsonb,
	"is_valid" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor_credentials" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"method" text NOT NULL,
	"secret" text,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "two_factor_temp_tokens" (
	"id" integer PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" "verification_type" NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "team_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"position" varchar(200),
	"photo_url" varchar(255),
	"bio" text,
	"email" varchar(255),
	"profile_link" varchar(255),
	"skills" jsonb,
	"sort_order" integer,
	"team_type_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"logo" text,
	"website_url" varchar(255),
	"location" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "testimonials" (
	"id" serial PRIMARY KEY NOT NULL,
	"author_name" varchar(200) NOT NULL,
	"position" varchar(200),
	"image" text,
	"description" text NOT NULL,
	"company" varchar(200),
	"occupation" varchar(200),
	"date" timestamp with time zone DEFAULT now(),
	"rating" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"content" text NOT NULL,
	"status" "news_status" DEFAULT 'not_published' NOT NULL,
	"publish_date" timestamp with time zone,
	"category" "news_category" DEFAULT 'news' NOT NULL,
	"key_lessons" text,
	"media" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "news_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "news_tags_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "news_to_tags" (
	"news_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "news_to_tags_news_id_tag_id_pk" PRIMARY KEY("news_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"resource" text NOT NULL,
	"action" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" integer PRIMARY KEY NOT NULL,
	"role_id" integer NOT NULL,
	"permission_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "user_roles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"role_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_project_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(200),
	"role" "task_team_role" DEFAULT 'member' NOT NULL,
	"position" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"name" varchar(200),
	"role" "task_team_role" DEFAULT 'member' NOT NULL,
	"position" varchar(500),
	"is_active" boolean DEFAULT true NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_team_projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"status" "task_project_status" DEFAULT 'planning' NOT NULL,
	"start_date" timestamp with time zone,
	"end_date" timestamp with time zone,
	"color" varchar(7),
	"created_by" integer NOT NULL,
	"settings" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"avatar_url" varchar(500),
	"color" varchar(7),
	"status" "task_team_status" DEFAULT 'active' NOT NULL,
	"created_by" integer NOT NULL,
	"settings" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_assignees" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"task_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer,
	"title" varchar(500) NOT NULL,
	"description" text,
	"deliverables" text,
	"status" "task_status" DEFAULT 'todo' NOT NULL,
	"priority" "task_priority" DEFAULT 'medium' NOT NULL,
	"due_date" timestamp with time zone,
	"labels" jsonb DEFAULT '[]'::jsonb,
	"attachments" jsonb DEFAULT '[]'::jsonb,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_deliverables" (
	"id" serial PRIMARY KEY NOT NULL,
	"project_id" integer NOT NULL,
	"title" varchar(500) NOT NULL,
	"description" text,
	"file_type" varchar(50) NOT NULL,
	"file_size" integer,
	"file_path" varchar(1000) NOT NULL,
	"file_url" varchar(1000),
	"version" varchar(20) DEFAULT '1.0',
	"is_final" boolean DEFAULT false NOT NULL,
	"uploaded_by" integer NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" varchar(100) NOT NULL,
	"entity_id" integer NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"generated_by" integer NOT NULL,
	"date_range_start" timestamp with time zone,
	"date_range_end" timestamp with time zone,
	"filters_applied" jsonb,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"color" varchar(7),
	"icon" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_files" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer,
	"project_id" integer,
	"task_id" integer,
	"filename" varchar(500) NOT NULL,
	"original_filename" varchar(500),
	"file_type" varchar(50) NOT NULL,
	"file_size" integer NOT NULL,
	"file_path" varchar(1000) NOT NULL,
	"file_url" varchar(1000),
	"mime_type" varchar(100),
	"uploaded_by" integer NOT NULL,
	"category_id" integer,
	"is_public" boolean DEFAULT false NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"template_type" varchar(50) NOT NULL,
	"config" jsonb,
	"created_by" integer NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payrolls" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"payroll_period" text NOT NULL,
	"date_of_payment" date NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"staff_fellow_number" text,
	"employee_id" text,
	"program" text,
	"payroll_type" text DEFAULT 'rwf',
	"currency" text DEFAULT 'RWF',
	"basic_salary" numeric(15, 2),
	"gross_salary" numeric(15, 2),
	"csr_employer" numeric(15, 2),
	"occupational_hazards" numeric(15, 2),
	"maternity_employer" numeric(15, 2),
	"csr_employee" numeric(15, 2),
	"maternity_employee" numeric(15, 2),
	"tpr" numeric(15, 2),
	"net_salary_before_cbhi" numeric(15, 2),
	"cbhi" numeric(15, 2),
	"net_salary" numeric(15, 2) NOT NULL,
	"bnr_exchange_rate_date" date,
	"exchange_rate_used" numeric(10, 4),
	"net_salary_usd" numeric(15, 2),
	"gross_usd" numeric(15, 2),
	"wop_usd" numeric(15, 2),
	"date_rate" date,
	"wop_rwf" numeric(15, 2),
	"gross_rwf" numeric(15, 2),
	"housing_allowance" numeric(15, 2),
	"function_allowance" numeric(15, 2),
	"transport_allowance" numeric(15, 2),
	"payslip_file_url" text,
	"payslip_file_key" text,
	"email_sent" boolean DEFAULT false NOT NULL,
	"email_sent_at" timestamp,
	"email_error" text,
	"uploaded_by" integer NOT NULL,
	"source_filename" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "application_reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"reviewer_id" integer NOT NULL,
	"score" integer,
	"comments" text,
	"recommendation" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "applications" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"phone" varchar(50) NOT NULL,
	"national_id" varchar(100) NOT NULL,
	"city" varchar(100) NOT NULL,
	"country" varchar(100) NOT NULL,
	"education_level" "education_level" NOT NULL,
	"field_of_study" varchar(200) NOT NULL,
	"career_experience" text NOT NULL,
	"cv_url" varchar(500) NOT NULL,
	"supporting_docs_url" varchar(500),
	"motivation" text NOT NULL,
	"five_year_vision" text NOT NULL,
	"desired_impact" text NOT NULL,
	"community_role" text NOT NULL,
	"national_strategy" text NOT NULL,
	"how_ganzafrica_can_help" text NOT NULL,
	"contribution_to_ganzafrica" text NOT NULL,
	"data_processing_consent" boolean DEFAULT false NOT NULL,
	"custom_answers" jsonb,
	"status" "application_status" DEFAULT 'submitted' NOT NULL,
	"submission_date" timestamp with time zone DEFAULT now() NOT NULL,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employment_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"position_level" varchar(100),
	"employment_type" varchar(100) NOT NULL,
	"department" varchar(100),
	"responsibilities" jsonb,
	"qualifications" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "fellowship_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"program_name" varchar(200) NOT NULL,
	"cohort" varchar(100),
	"fellowship_type" varchar(100),
	"learning_outcomes" jsonb,
	"program_structure" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"type" "opportunity_type" NOT NULL,
	"status" "opportunity_status" DEFAULT 'draft' NOT NULL,
	"location_type" varchar(50) DEFAULT 'remote' NOT NULL,
	"location" varchar(255),
	"application_deadline" date NOT NULL,
	"eligibility_criteria" jsonb,
	"custom_questions" jsonb,
	"category_id" integer,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "achievement_comments" ADD CONSTRAINT "achievement_comments_achievement_id_alumni_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."alumni_achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievement_comments" ADD CONSTRAINT "achievement_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievement_likes" ADD CONSTRAINT "achievement_likes_achievement_id_alumni_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."alumni_achievements"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "achievement_likes" ADD CONSTRAINT "achievement_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_achievements" ADD CONSTRAINT "alumni_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_events" ADD CONSTRAINT "alumni_events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_mentorships" ADD CONSTRAINT "alumni_mentorships_mentor_id_users_id_fk" FOREIGN KEY ("mentor_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_mentorships" ADD CONSTRAINT "alumni_mentorships_mentee_id_users_id_fk" FOREIGN KEY ("mentee_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_profiles" ADD CONSTRAINT "alumni_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alumni_resources" ADD CONSTRAINT "alumni_resources_author_id_users_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_alumni_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."alumni_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_opportunities" ADD CONSTRAINT "job_opportunities_posted_by_users_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_goals" ADD CONSTRAINT "mentorship_goals_mentorship_id_alumni_mentorships_id_fk" FOREIGN KEY ("mentorship_id") REFERENCES "public"."alumni_mentorships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_sessions" ADD CONSTRAINT "mentorship_sessions_mentorship_id_alumni_mentorships_id_fk" FOREIGN KEY ("mentorship_id") REFERENCES "public"."alumni_mentorships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_downloads" ADD CONSTRAINT "resource_downloads_resource_id_alumni_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."alumni_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_downloads" ADD CONSTRAINT "resource_downloads_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_likes" ADD CONSTRAINT "resource_likes_resource_id_alumni_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."alumni_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_likes" ADD CONSTRAINT "resource_likes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_ratings" ADD CONSTRAINT "resource_ratings_resource_id_alumni_resources_id_fk" FOREIGN KEY ("resource_id") REFERENCES "public"."alumni_resources"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "resource_ratings" ADD CONSTRAINT "resource_ratings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_asset_images" ADD CONSTRAINT "hr_asset_images_asset_id_hr_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."hr_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_asset_maintenance" ADD CONSTRAINT "hr_asset_maintenance_asset_id_hr_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."hr_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_asset_maintenance" ADD CONSTRAINT "hr_asset_maintenance_requester_id_hr_users_id_fk" FOREIGN KEY ("requester_id") REFERENCES "public"."hr_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_asset_specs" ADD CONSTRAINT "hr_asset_specs_asset_id_hr_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."hr_assets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_assets" ADD CONSTRAINT "hr_assets_category_id_hr_asset_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."hr_asset_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_assets" ADD CONSTRAINT "hr_assets_assigned_to_id_hr_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."hr_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_contracts" ADD CONSTRAINT "hr_contracts_employee_id_hr_users_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."hr_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD CONSTRAINT "hr_documents_contract_id_hr_contracts_id_fk" FOREIGN KEY ("contract_id") REFERENCES "public"."hr_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD CONSTRAINT "hr_documents_created_by_id_hr_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."hr_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_otps" ADD CONSTRAINT "hr_otps_created_by_id_hr_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."hr_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_users" ADD CONSTRAINT "hr_users_platform_user_id_users_id_fk" FOREIGN KEY ("platform_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" ADD CONSTRAINT "hr_helpdesk_tickets_submitted_by_id_hr_users_id_fk" FOREIGN KEY ("submitted_by_id") REFERENCES "public"."hr_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_helpdesk_tickets" ADD CONSTRAINT "hr_helpdesk_tickets_assigned_to_id_hr_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."hr_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leaves" ADD CONSTRAINT "hr_leaves_user_id_hr_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."hr_users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_leaves" ADD CONSTRAINT "hr_leaves_reviewed_by_id_hr_users_id_fk" FOREIGN KEY ("reviewed_by_id") REFERENCES "public"."hr_users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_notification_preferences" ADD CONSTRAINT "hr_notification_preferences_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_notifications" ADD CONSTRAINT "hr_notifications_recipient_id_users_id_fk" FOREIGN KEY ("recipient_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_documents" ADD CONSTRAINT "project_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_members" ADD CONSTRAINT "project_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_partners" ADD CONSTRAINT "project_partners_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_partners" ADD CONSTRAINT "project_partners_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_updates" ADD CONSTRAINT "project_updates_author_id_teams_id_fk" FOREIGN KEY ("author_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "password_reset_tokens" ADD CONSTRAINT "password_reset_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_credentials" ADD CONSTRAINT "two_factor_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "two_factor_temp_tokens" ADD CONSTRAINT "two_factor_temp_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "verification_tokens" ADD CONSTRAINT "verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_team_type_id_team_types_id_fk" FOREIGN KEY ("team_type_id") REFERENCES "public"."team_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_to_tags" ADD CONSTRAINT "news_to_tags_news_id_news_id_fk" FOREIGN KEY ("news_id") REFERENCES "public"."news"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "news_to_tags" ADD CONSTRAINT "news_to_tags_tag_id_news_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "public"."news_tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_permission_id_permissions_id_fk" FOREIGN KEY ("permission_id") REFERENCES "public"."permissions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_project_members" ADD CONSTRAINT "task_project_members_project_id_task_team_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."task_team_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_project_members" ADD CONSTRAINT "task_project_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_team_members" ADD CONSTRAINT "task_team_members_team_id_task_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."task_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_team_members" ADD CONSTRAINT "task_team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_team_projects" ADD CONSTRAINT "task_team_projects_team_id_task_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."task_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_team_projects" ADD CONSTRAINT "task_team_projects_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_teams" ADD CONSTRAINT "task_teams_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_assignees" ADD CONSTRAINT "task_assignees_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_comments" ADD CONSTRAINT "task_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_task_team_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."task_team_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_deliverables" ADD CONSTRAINT "project_deliverables_project_id_task_team_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."task_team_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_deliverables" ADD CONSTRAINT "project_deliverables_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_analytics" ADD CONSTRAINT "report_analytics_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_team_id_task_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."task_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_project_id_task_team_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."task_team_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_category_id_report_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."report_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payrolls" ADD CONSTRAINT "payrolls_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_reviews" ADD CONSTRAINT "application_reviews_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_reviews" ADD CONSTRAINT "application_reviews_reviewer_id_users_id_fk" FOREIGN KEY ("reviewer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "applications" ADD CONSTRAINT "applications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employment_details" ADD CONSTRAINT "employment_details_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fellowship_details" ADD CONSTRAINT "fellowship_details_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_category_id_project_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."project_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities" ADD CONSTRAINT "opportunities_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "faqs_is_active_idx" ON "faqs" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "project_documents_project_id_idx" ON "project_documents" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_members_project_id_idx" ON "project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_members_team_id_idx" ON "project_members" USING btree ("team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_project_team" ON "project_members" USING btree ("project_id","team_id");--> statement-breakpoint
CREATE INDEX "project_partners_project_id_idx" ON "project_partners" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_partners_partner_id_idx" ON "project_partners" USING btree ("partner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_project_partner" ON "project_partners" USING btree ("project_id","partner_id");--> statement-breakpoint
CREATE INDEX "project_updates_project_id_idx" ON "project_updates" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_updates_author_id_idx" ON "project_updates" USING btree ("author_id");--> statement-breakpoint
CREATE INDEX "projects_category_id_idx" ON "projects" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "projects_partner_id_idx" ON "projects" USING btree ("partner_id");--> statement-breakpoint
CREATE INDEX "projects_status_idx" ON "projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "teams_team_type_id_idx" ON "teams" USING btree ("team_type_id");--> statement-breakpoint
CREATE INDEX "teams_email_idx" ON "teams" USING btree ("email");--> statement-breakpoint
CREATE INDEX "teams_sort_order_idx" ON "teams" USING btree ("sort_order");--> statement-breakpoint
CREATE INDEX "partners_name_idx" ON "partners" USING btree ("name");--> statement-breakpoint
CREATE INDEX "partners_location_idx" ON "partners" USING btree ("location");--> statement-breakpoint
CREATE INDEX "testimonials_author_name_idx" ON "testimonials" USING btree ("author_name");--> statement-breakpoint
CREATE INDEX "testimonials_company_idx" ON "testimonials" USING btree ("company");--> statement-breakpoint
CREATE INDEX "testimonials_rating_idx" ON "testimonials" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "news_status_idx" ON "news" USING btree ("status");--> statement-breakpoint
CREATE INDEX "news_category_idx" ON "news" USING btree ("category");--> statement-breakpoint
CREATE INDEX "news_publish_date_idx" ON "news" USING btree ("publish_date");--> statement-breakpoint
CREATE INDEX "news_to_tags_news_id_idx" ON "news_to_tags" USING btree ("news_id");--> statement-breakpoint
CREATE INDEX "news_to_tags_tag_id_idx" ON "news_to_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE UNIQUE INDEX "user_role_idx" ON "user_roles" USING btree ("user_id","role_id");--> statement-breakpoint
CREATE INDEX "task_project_members_project_id_idx" ON "task_project_members" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "task_project_members_user_id_idx" ON "task_project_members" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_project_user" ON "task_project_members" USING btree ("project_id","user_id");--> statement-breakpoint
CREATE INDEX "task_team_members_team_id_idx" ON "task_team_members" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "task_team_members_user_id_idx" ON "task_team_members" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_team_members_role_idx" ON "task_team_members" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_team_user" ON "task_team_members" USING btree ("team_id","user_id");--> statement-breakpoint
CREATE INDEX "task_team_projects_team_id_idx" ON "task_team_projects" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "task_team_projects_status_idx" ON "task_team_projects" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_team_projects_created_by_idx" ON "task_team_projects" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "task_teams_created_by_idx" ON "task_teams" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "task_teams_status_idx" ON "task_teams" USING btree ("status");--> statement-breakpoint
CREATE INDEX "task_teams_name_idx" ON "task_teams" USING btree ("name");--> statement-breakpoint
CREATE INDEX "task_assignees_task_id_idx" ON "task_assignees" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_assignees_user_id_idx" ON "task_assignees" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "task_comments_task_id_idx" ON "task_comments" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "task_comments_user_id_idx" ON "task_comments" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tasks_project_id_idx" ON "tasks" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "tasks_status_idx" ON "tasks" USING btree ("status");--> statement-breakpoint
CREATE INDEX "tasks_priority_idx" ON "tasks" USING btree ("priority");--> statement-breakpoint
CREATE INDEX "tasks_created_by_idx" ON "tasks" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "tasks_due_date_idx" ON "tasks" USING btree ("due_date");--> statement-breakpoint
CREATE INDEX "project_deliverables_project_id_idx" ON "project_deliverables" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "project_deliverables_uploaded_by_idx" ON "project_deliverables" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "project_deliverables_file_type_idx" ON "project_deliverables" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "project_deliverables_is_final_idx" ON "project_deliverables" USING btree ("is_final");--> statement-breakpoint
CREATE INDEX "report_analytics_report_type_idx" ON "report_analytics" USING btree ("report_type");--> statement-breakpoint
CREATE INDEX "report_analytics_entity_id_idx" ON "report_analytics" USING btree ("entity_id");--> statement-breakpoint
CREATE INDEX "report_analytics_generated_by_idx" ON "report_analytics" USING btree ("generated_by");--> statement-breakpoint
CREATE INDEX "report_analytics_generated_at_idx" ON "report_analytics" USING btree ("generated_at");--> statement-breakpoint
CREATE INDEX "report_files_team_id_idx" ON "report_files" USING btree ("team_id");--> statement-breakpoint
CREATE INDEX "report_files_project_id_idx" ON "report_files" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "report_files_task_id_idx" ON "report_files" USING btree ("task_id");--> statement-breakpoint
CREATE INDEX "report_files_uploaded_by_idx" ON "report_files" USING btree ("uploaded_by");--> statement-breakpoint
CREATE INDEX "report_files_category_id_idx" ON "report_files" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "report_files_file_type_idx" ON "report_files" USING btree ("file_type");--> statement-breakpoint
CREATE INDEX "report_templates_template_type_idx" ON "report_templates" USING btree ("template_type");--> statement-breakpoint
CREATE INDEX "report_templates_created_by_idx" ON "report_templates" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "application_reviews_application_id_idx" ON "application_reviews" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_reviews_reviewer_id_idx" ON "application_reviews" USING btree ("reviewer_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_application_reviewer" ON "application_reviews" USING btree ("application_id","reviewer_id");--> statement-breakpoint
CREATE INDEX "applications_opportunity_id_idx" ON "applications" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "applications_status_idx" ON "applications" USING btree ("status");--> statement-breakpoint
CREATE INDEX "applications_user_id_idx" ON "applications" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "employment_details_opportunity_id_idx" ON "employment_details" USING btree ("opportunity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "fellowship_details_opportunity_id_idx" ON "fellowship_details" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "opportunities_type_idx" ON "opportunities" USING btree ("type");--> statement-breakpoint
CREATE INDEX "opportunities_status_idx" ON "opportunities" USING btree ("status");--> statement-breakpoint
CREATE INDEX "opportunities_category_id_idx" ON "opportunities" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "opportunities_created_by_idx" ON "opportunities" USING btree ("created_by");