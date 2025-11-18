DROP TABLE "notifications" CASCADE;--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "is_published" boolean DEFAULT false NOT NULL;--> statement-breakpoint
DROP TYPE "public"."notification_priority";--> statement-breakpoint
DROP TYPE "public"."notification_type";