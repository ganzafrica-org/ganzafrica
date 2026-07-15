CREATE TABLE "auth_handoff_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"code_hash" char(64) NOT NULL,
	"user_id" integer NOT NULL,
	"target_app" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"used_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "auth_handoff_codes_code_hash_unique" UNIQUE("code_hash")
);
--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "previous_refresh_hash" text;--> statement-breakpoint
ALTER TABLE "sessions" ADD COLUMN "refresh_rotated_at" timestamp;--> statement-breakpoint
ALTER TABLE "auth_handoff_codes" ADD CONSTRAINT "auth_handoff_codes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;