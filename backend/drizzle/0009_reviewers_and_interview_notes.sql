CREATE TABLE "application_reviewers" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"reviewer_user_id" integer NOT NULL,
	"role" text,
	"assigned_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interview_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"author_user_id" integer NOT NULL,
	"stage" text NOT NULL,
	"rating" integer,
	"note" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "opportunities" ADD COLUMN "target_hires" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "application_reviewers" ADD CONSTRAINT "application_reviewers_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_reviewers" ADD CONSTRAINT "application_reviewers_reviewer_user_id_users_id_fk" FOREIGN KEY ("reviewer_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "application_reviewers" ADD CONSTRAINT "application_reviewers_assigned_by_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_notes" ADD CONSTRAINT "interview_notes_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interview_notes" ADD CONSTRAINT "interview_notes_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_reviewer_once" ON "application_reviewers" USING btree ("application_id","reviewer_user_id");--> statement-breakpoint
CREATE INDEX "application_reviewers_app_idx" ON "application_reviewers" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "application_reviewers_reviewer_idx" ON "application_reviewers" USING btree ("reviewer_user_id");--> statement-breakpoint
CREATE INDEX "interview_notes_app_idx" ON "interview_notes" USING btree ("application_id");