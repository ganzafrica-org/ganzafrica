DROP INDEX "org_holiday_date_uniq";--> statement-breakpoint
ALTER TABLE "hr_org_holidays" ADD COLUMN "country" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "org_holiday_date_uniq" ON "hr_org_holidays" USING btree ("date","country");