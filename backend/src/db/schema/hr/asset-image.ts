// hr.asset-images.ts
import { boolean, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";
import { hr_assets } from "./assets";

export const hr_asset_images = pgTable("hr_asset_images", {
  id: uuid("id").primaryKey().defaultRandom(),
  asset_id: uuid("asset_id")
    .notNull()
    .references(() => hr_assets.id, { onDelete: "cascade" }),
  url: text("url").notNull(), // S3/Cloudflare/Supabase Storage URL
  storage_key: text("storage_key").notNull(), // path in bucket, for deletion
  is_primary: boolean("is_primary").notNull().default(false),
  sort_order: integer("sort_order").notNull().default(0),
  ...timestampFields,
});

export type AssetImage = typeof hr_asset_images.$inferSelect;
export type NewAssetImage = typeof hr_asset_images.$inferInsert;
