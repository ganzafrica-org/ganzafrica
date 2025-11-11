ALTER TYPE "public"."project_status" ADD VALUE 'overdue';--> statement-breakpoint
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
ALTER TABLE "tasks" ALTER COLUMN "status" SET DEFAULT 'todo';--> statement-breakpoint
ALTER TABLE "project_deliverables" ADD CONSTRAINT "project_deliverables_project_id_task_team_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."task_team_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "project_deliverables" ADD CONSTRAINT "project_deliverables_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_analytics" ADD CONSTRAINT "report_analytics_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_team_id_task_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."task_teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_project_id_task_team_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."task_team_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_files" ADD CONSTRAINT "report_files_category_id_report_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."report_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
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
ALTER TABLE "public"."tasks" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."task_status";--> statement-breakpoint
CREATE TYPE "public"."task_status" AS ENUM('overdue', 'todo', 'inprogress', 'review', 'done');--> statement-breakpoint
ALTER TABLE "public"."tasks" ALTER COLUMN "status" SET DATA TYPE "public"."task_status" USING "status"::"public"."task_status";