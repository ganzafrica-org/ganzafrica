import { bigint, pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";
import { eventTypeEnum, attendeeStatusEnum } from "./enums";

export const events = pgTable("events", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: eventTypeEnum("type").notNull(),
  start_time: timestamp("start_time").notNull(),
  end_time: timestamp("end_time").notNull(),
  location: jsonb("location"),
  organizer_id: bigint("organizer_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  ...timestampFields,
});

export const event_attendees = pgTable("event_attendees", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  event_id: bigint("event_id", { mode: "number" })
    .notNull()
    .references(() => events.id),
  user_id: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  status: attendeeStatusEnum("status").notNull(),
  registered_at: timestamp("registered_at").notNull(),
});
