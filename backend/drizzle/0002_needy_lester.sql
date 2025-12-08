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
ALTER TABLE "alumni_mentorships" ADD COLUMN "total_sessions" integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE "mentorship_goals" ADD CONSTRAINT "mentorship_goals_mentorship_id_alumni_mentorships_id_fk" FOREIGN KEY ("mentorship_id") REFERENCES "public"."alumni_mentorships"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mentorship_sessions" ADD CONSTRAINT "mentorship_sessions_mentorship_id_alumni_mentorships_id_fk" FOREIGN KEY ("mentorship_id") REFERENCES "public"."alumni_mentorships"("id") ON DELETE cascade ON UPDATE no action;