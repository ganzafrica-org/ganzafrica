-- Create report categories table
CREATE TABLE IF NOT EXISTS "report_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"color" varchar(7),
	"icon" varchar(50),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create project deliverables table
CREATE TABLE IF NOT EXISTS "project_deliverables" (
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create report files table
CREATE TABLE IF NOT EXISTS "report_files" (
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
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create report analytics table
CREATE TABLE IF NOT EXISTS "report_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" varchar(100) NOT NULL,
	"entity_id" integer NOT NULL,
	"entity_type" varchar(50) NOT NULL,
	"generated_by" integer NOT NULL,
	"date_range_start" timestamp with time zone,
	"date_range_end" timestamp with time zone,
	"filters_applied" jsonb,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create report templates table
CREATE TABLE IF NOT EXISTS "report_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"template_type" varchar(50) NOT NULL,
	"config" jsonb,
	"created_by" integer NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraints
DO $$ BEGIN
 ALTER TABLE "project_deliverables" ADD CONSTRAINT "project_deliverables_project_id_task_team_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "task_team_projects"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "project_deliverables" ADD CONSTRAINT "project_deliverables_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "report_files" ADD CONSTRAINT "report_files_team_id_task_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "task_teams"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "report_files" ADD CONSTRAINT "report_files_project_id_task_team_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "task_team_projects"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "report_files" ADD CONSTRAINT "report_files_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "report_files" ADD CONSTRAINT "report_files_uploaded_by_users_id_fk" FOREIGN KEY ("uploaded_by") REFERENCES "users"("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "report_files" ADD CONSTRAINT "report_files_category_id_report_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "report_categories"("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "report_analytics" ADD CONSTRAINT "report_analytics_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "users"("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "report_templates" ADD CONSTRAINT "report_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "users"("id");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "project_deliverables_project_id_idx" ON "project_deliverables" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "project_deliverables_uploaded_by_idx" ON "project_deliverables" USING btree ("uploaded_by");
CREATE INDEX IF NOT EXISTS "project_deliverables_file_type_idx" ON "project_deliverables" USING btree ("file_type");
CREATE INDEX IF NOT EXISTS "project_deliverables_is_final_idx" ON "project_deliverables" USING btree ("is_final");

CREATE INDEX IF NOT EXISTS "report_files_team_id_idx" ON "report_files" USING btree ("team_id");
CREATE INDEX IF NOT EXISTS "report_files_project_id_idx" ON "report_files" USING btree ("project_id");
CREATE INDEX IF NOT EXISTS "report_files_task_id_idx" ON "report_files" USING btree ("task_id");
CREATE INDEX IF NOT EXISTS "report_files_uploaded_by_idx" ON "report_files" USING btree ("uploaded_by");
CREATE INDEX IF NOT EXISTS "report_files_category_id_idx" ON "report_files" USING btree ("category_id");
CREATE INDEX IF NOT EXISTS "report_files_file_type_idx" ON "report_files" USING btree ("file_type");

CREATE INDEX IF NOT EXISTS "report_analytics_report_type_idx" ON "report_analytics" USING btree ("report_type");
CREATE INDEX IF NOT EXISTS "report_analytics_entity_id_idx" ON "report_analytics" USING btree ("entity_id");
CREATE INDEX IF NOT EXISTS "report_analytics_generated_by_idx" ON "report_analytics" USING btree ("generated_by");
CREATE INDEX IF NOT EXISTS "report_analytics_generated_at_idx" ON "report_analytics" USING btree ("generated_at");

CREATE INDEX IF NOT EXISTS "report_templates_template_type_idx" ON "report_templates" USING btree ("template_type");
CREATE INDEX IF NOT EXISTS "report_templates_created_by_idx" ON "report_templates" USING btree ("created_by");

-- Insert default report categories
INSERT INTO "report_categories" ("name", "description", "color", "icon") VALUES
('Documentation', 'Project documentation and guides', '#3B82F6', 'file-text'),
('Design', 'Design files and assets', '#10B981', 'palette'),
('Code', 'Source code and scripts', '#F59E0B', 'code'),
('Data', 'Data files and reports', '#8B5CF6', 'database'),
('Media', 'Images, videos, and audio files', '#EF4444', 'image'),
('Archive', 'Compressed files and archives', '#6B7280', 'archive')
ON CONFLICT DO NOTHING;

