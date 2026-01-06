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
CREATE TYPE "public"."task_priority" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('overdue', 'todo', 'inprogress', 'review', 'done');--> statement-breakpoint
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
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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