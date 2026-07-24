// hr.asset-categories.ts
import { pgTable, uuid, text, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { timestampFields } from "../common";

/**
 * Each row defines a category and its spec fields.
 * `spec_schema` is a JSONB array that drives the frontend form dynamically.
 *
 * Example spec_schema for "Electronics > Phone":
 * [
 *   { key: "brand",   label: "Brand",   type: "enum",   options: ["Apple","Samsung","Google"], required: true },
 *   { key: "color",   label: "Color",   type: "text",   required: false },
 *   { key: "storage", label: "Storage", type: "enum",   options: ["64GB","128GB","256GB"], required: true }
 * ]
 *
 * Supported field types: "text" | "number" | "enum" | "boolean"
 */
export const hr_asset_categories = pgTable("hr_asset_categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(), // e.g. "Phone", "Laptop", "Chair"
  parent_name: text("parent_name"), // e.g. "Electronics", "Furniture" — null = top-level
  slug: text("slug").notNull().unique(), // e.g. "electronics_phone", "furniture_chair"
  spec_schema: jsonb("spec_schema").notNull().default([]),
  is_active: boolean("is_active").notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  ...timestampFields,
});

export type AssetCategory = typeof hr_asset_categories.$inferSelect;
export type NewAssetCategory = typeof hr_asset_categories.$inferInsert;

// TypeScript types for the spec_schema structure (for use in your API/service layer)
export type SpecFieldType = "text" | "number" | "enum" | "boolean";

export interface SpecFieldDefinition {
  key: string; // stored as the key in hr_asset_specs
  label: string; // shown to user in form
  type: SpecFieldType;
  options?: string[]; // only when type === "enum"
  required: boolean;
  unit?: string; // e.g. "GB", "inches" — optional display hint
}
