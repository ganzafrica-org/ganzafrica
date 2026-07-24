// hr.asset-specs.ts
import { pgTable, uuid, text, unique } from "drizzle-orm/pg-core";
import { hr_assets } from "./assets";

export const hr_asset_specs = pgTable(
  "hr_asset_specs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    asset_id: uuid("asset_id")
      .notNull()
      .references(() => hr_assets.id, { onDelete: "cascade" }),
    spec_key: text("spec_key").notNull(), // e.g. "brand", "ram", "color"
    spec_value: text("spec_value").notNull(), // always stored as text; cast in app layer
  },
  (t) => ({
    // One value per key per asset
    unique_asset_spec: unique().on(t.asset_id, t.spec_key),
  }),
);

export type AssetSpec = typeof hr_asset_specs.$inferSelect;
export type NewAssetSpec = typeof hr_asset_specs.$inferInsert;
