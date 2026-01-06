CREATE TABLE "alumni_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"event_date" timestamp NOT NULL,
	"start_time" text,
	"end_time" text,
	"duration" text,
	"location" text,
	"is_virtual" boolean DEFAULT false,
	"meeting_url" text,
	"type" text NOT NULL,
	"category" text NOT NULL,
	"organizer" text NOT NULL,
	"organizer_id" integer,
	"max_attendees" integer,
	"is_paid" boolean DEFAULT false,
	"price" text,
	"currency" text DEFAULT 'USD',
	"status" text DEFAULT 'Open' NOT NULL,
	"image_url" text,
	"speakers" jsonb DEFAULT '[]'::jsonb,
	"agenda" jsonb DEFAULT '[]'::jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb,
	"views" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "event_registrations" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" text DEFAULT 'Registered' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "alumni_events" ADD CONSTRAINT "alumni_events_organizer_id_users_id_fk" FOREIGN KEY ("organizer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_alumni_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."alumni_events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;