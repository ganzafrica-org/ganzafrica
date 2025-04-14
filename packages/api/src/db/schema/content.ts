import { bigint, pgTable, text, jsonb, timestamp } from "drizzle-orm/pg-core";
import { timestampFields } from "./common";
import { users } from "./users";
import {
  contentStatusEnum,
  resourceTypeEnum,
  resourceAccessEnum,
} from "./enums";

export const content_pages = pgTable("content_pages", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: jsonb("content").notNull(),
  meta_data: jsonb("meta_data"), // For SEO optimization
  status: contentStatusEnum("status").notNull(),
  author_id: bigint("author_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  published_at: timestamp("published_at"),
  ...timestampFields,
});

export const blog_posts = pgTable("blog_posts", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: jsonb("content").notNull(),
  meta_data: jsonb("meta_data"), // For SEO optimization
  status: contentStatusEnum("status").notNull(),
  author_id: bigint("author_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  published_at: timestamp("published_at"),
  ...timestampFields,
});

export const resources = pgTable("resources", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: resourceTypeEnum("type").notNull(),
  file_url: text("file_url").notNull(),
  access_level: resourceAccessEnum("access_level").notNull(),
  created_by: bigint("created_by", { mode: "number" })
    .notNull()
    .references(() => users.id),
  ...timestampFields,
});

export const dynamic_content_translations = pgTable(
  "dynamic_content_translations",
  {
    id: bigint("id", { mode: "number" }).primaryKey(),
    resource_type: resourceTypeEnum("resource_type").notNull(),
    resource_id: bigint("resource_id", { mode: "number" }).notNull(),
    language: text("language").notNull(),
    translated_fields: jsonb("translated_fields").notNull(),
    translator_id: bigint("translator_id", { mode: "number" })
      .notNull()
      .references(() => users.id),
    ...timestampFields,
  },
);
