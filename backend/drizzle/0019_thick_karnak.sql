ALTER TYPE "public"."policy_status" ADD VALUE 'ARCHIVED';--> statement-breakpoint
ALTER TABLE "hr_documents" ADD COLUMN "versions" jsonb DEFAULT '[]'::jsonb NOT NULL;