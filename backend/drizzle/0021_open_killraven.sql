ALTER TABLE "signature_requests" ALTER COLUMN "ref_id" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "signature_requests" ADD COLUMN "sequence_no" integer DEFAULT 1 NOT NULL;