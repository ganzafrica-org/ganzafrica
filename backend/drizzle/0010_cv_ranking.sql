CREATE TABLE "application_cv_scores" (
	"id" serial PRIMARY KEY NOT NULL,
	"application_id" integer NOT NULL,
	"score" numeric(6, 2) DEFAULT '0' NOT NULL,
	"matched" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"extracted_chars" integer DEFAULT 0 NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "application_cv_scores_application_id_unique" UNIQUE("application_id")
);
--> statement-breakpoint
CREATE TABLE "ranking_criteria" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"keyword" text NOT NULL,
	"weight" numeric(6, 2) DEFAULT '1' NOT NULL,
	"category" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "application_cv_scores" ADD CONSTRAINT "application_cv_scores_application_id_applications_id_fk" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_criteria" ADD CONSTRAINT "ranking_criteria_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "application_cv_score_once" ON "application_cv_scores" USING btree ("application_id");--> statement-breakpoint
CREATE INDEX "ranking_criteria_opportunity_id_idx" ON "ranking_criteria" USING btree ("opportunity_id");