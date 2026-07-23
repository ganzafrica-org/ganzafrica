ALTER TYPE "public"."notification_type" ADD VALUE 'LEAVE_PENDING_APPROVAL' BEFORE 'LEAVE_APPROVED';--> statement-breakpoint
CREATE TABLE "hr_leave_balances" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" uuid NOT NULL,
	"year" integer NOT NULL,
	"type" "leave_type" NOT NULL,
	"entitled_days" numeric(5, 1) NOT NULL,
	"carried_over_days" numeric(5, 1) DEFAULT '0' NOT NULL,
	"used_days" numeric(5, 1) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_leave_policies" (
	"id" serial PRIMARY KEY NOT NULL,
	"employment_type" text NOT NULL,
	"type" "leave_type" NOT NULL,
	"annual_days" numeric(5, 1) NOT NULL,
	"max_carry_over" numeric(5, 1) DEFAULT '0' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hr_org_holidays" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_leaves" ADD COLUMN "days" numeric(5, 1);--> statement-breakpoint
ALTER TABLE "hr_leaves" ADD COLUMN "approver_note" text;--> statement-breakpoint
ALTER TABLE "hr_leave_balances" ADD CONSTRAINT "hr_leave_balances_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "balance_uniq" ON "hr_leave_balances" USING btree ("employee_id","year","type");--> statement-breakpoint
CREATE UNIQUE INDEX "leave_policy_uniq" ON "hr_leave_policies" USING btree ("employment_type","type");--> statement-breakpoint
CREATE UNIQUE INDEX "org_holiday_date_uniq" ON "hr_org_holidays" USING btree ("date");