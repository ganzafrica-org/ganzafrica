CREATE TABLE "leave_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"leave_id" uuid NOT NULL,
	"email_type" text NOT NULL,
	"recipient_user_id" integer NOT NULL,
	"sent_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "leave_emails" ADD CONSTRAINT "leave_emails_leave_id_hr_leaves_id_fk" FOREIGN KEY ("leave_id") REFERENCES "public"."hr_leaves"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "leave_emails" ADD CONSTRAINT "leave_emails_recipient_user_id_users_id_fk" FOREIGN KEY ("recipient_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "leave_email_once" ON "leave_emails" USING btree ("leave_id","email_type","recipient_user_id");