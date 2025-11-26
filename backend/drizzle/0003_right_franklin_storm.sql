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
ALTER TABLE "job_opportunities" ADD CONSTRAINT "job_opportunities_posted_by_users_id_fk" FOREIGN KEY ("posted_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;