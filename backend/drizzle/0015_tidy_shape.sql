ALTER TYPE "public"."notification_type" ADD VALUE 'PROCESS_TASK_ASSIGNED';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'PROCESS_TASK_OVERDUE';--> statement-breakpoint
ALTER TYPE "public"."notification_type" ADD VALUE 'PROCESS_COMPLETED';--> statement-breakpoint
CREATE TABLE "process_instances" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer,
	"type" text NOT NULL,
	"employee_id" uuid NOT NULL,
	"status" text DEFAULT 'in_progress' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"offboarding_reason" text,
	"last_working_day" date,
	"grant_alumni" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "process_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"instance_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer NOT NULL,
	"assignee_user_id" integer,
	"visibility" text DEFAULT 'all' NOT NULL,
	"is_blocking" boolean DEFAULT false NOT NULL,
	"kind" text DEFAULT 'checklist' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"due_date" date,
	"completed_at" timestamp with time zone,
	"completed_by" integer,
	"notes" text,
	"link_ref" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "process_template_tasks" (
	"id" serial PRIMARY KEY NOT NULL,
	"template_id" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sort_order" integer NOT NULL,
	"default_assignee" text NOT NULL,
	"visibility" text DEFAULT 'all' NOT NULL,
	"due_offset_days" integer,
	"is_blocking" boolean DEFAULT false NOT NULL,
	"kind" text DEFAULT 'checklist' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "process_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"employment_types" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "process_instances" ADD CONSTRAINT "process_instances_template_id_process_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."process_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_instances" ADD CONSTRAINT "process_instances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_tasks" ADD CONSTRAINT "process_tasks_instance_id_process_instances_id_fk" FOREIGN KEY ("instance_id") REFERENCES "public"."process_instances"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_tasks" ADD CONSTRAINT "process_tasks_assignee_user_id_users_id_fk" FOREIGN KEY ("assignee_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_tasks" ADD CONSTRAINT "process_tasks_completed_by_users_id_fk" FOREIGN KEY ("completed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_template_tasks" ADD CONSTRAINT "process_template_tasks_template_id_process_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."process_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "process_templates" ADD CONSTRAINT "process_templates_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;