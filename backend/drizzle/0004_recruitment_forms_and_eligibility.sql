CREATE TABLE "eligibility_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"field_key" text NOT NULL,
	"operator" text NOT NULL,
	"value" jsonb,
	"reject_message" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"hit_count" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunity_forms" (
	"id" serial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"definition" jsonb NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "form_version" integer;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "country_of_residence" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "country_of_work" text;--> statement-breakpoint
ALTER TABLE "applications" ADD COLUMN "has_work_permit" boolean;--> statement-breakpoint
ALTER TABLE "eligibility_rules" ADD CONSTRAINT "eligibility_rules_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_forms" ADD CONSTRAINT "opportunity_forms_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_forms" ADD CONSTRAINT "opportunity_forms_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "eligibility_rules_opportunity_id_idx" ON "eligibility_rules" USING btree ("opportunity_id");--> statement-breakpoint
CREATE UNIQUE INDEX "opportunity_forms_opp_version" ON "opportunity_forms" USING btree ("opportunity_id","version");--> statement-breakpoint
CREATE INDEX "opportunity_forms_opp_status_idx" ON "opportunity_forms" USING btree ("opportunity_id","status");