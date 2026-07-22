ALTER TABLE "hr_documents" ADD COLUMN "extracted_text" text;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD COLUMN "indexed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD COLUMN "retain_until" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "hr_documents" ADD COLUMN "archived_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "hr_documents_retain_until_idx" ON "hr_documents" USING btree ("retain_until");--> statement-breakpoint
CREATE INDEX "hr_documents_archived_at_idx" ON "hr_documents" USING btree ("archived_at");