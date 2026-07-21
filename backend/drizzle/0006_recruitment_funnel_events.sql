CREATE TABLE "opportunity_funnel_events" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"opportunity_id" integer NOT NULL,
	"event" text NOT NULL,
	"session_key" char(36) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "opportunity_funnel_events" ADD CONSTRAINT "opportunity_funnel_events_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "funnel_opp_event_idx" ON "opportunity_funnel_events" USING btree ("opportunity_id","event","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "funnel_dedup_idx" ON "opportunity_funnel_events" USING btree ("opportunity_id","event","session_key");