ALTER TYPE "public"."policy_category" ADD VALUE 'Leave Attachment';--> statement-breakpoint
ALTER TABLE "hr_documents" ADD COLUMN "leave_id" uuid;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD CONSTRAINT "hr_documents_leave_id_hr_leaves_id_fk" FOREIGN KEY ("leave_id") REFERENCES "public"."hr_leaves"("id") ON DELETE cascade ON UPDATE no action;