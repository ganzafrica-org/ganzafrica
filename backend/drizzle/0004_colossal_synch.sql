CREATE TABLE "hr_signer_pool" (
	"id" serial PRIMARY KEY NOT NULL,
	"employee_id" uuid NOT NULL,
	"added_by" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "hr_signer_pool" ADD CONSTRAINT "hr_signer_pool_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hr_signer_pool" ADD CONSTRAINT "hr_signer_pool_added_by_users_id_fk" FOREIGN KEY ("added_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hr_signer_pool_employee_uniq" ON "hr_signer_pool" USING btree ("employee_id");