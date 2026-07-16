import { db } from "../../../client";
import { hr_asset_categories } from "../asset-categories";
import Logger from "../../../../config/logger";

const logger = new Logger("AssetCategorySeed");

const seedData = [
  // Electronics > Phone
  {
    name: "Phone",
    parent_name: "Electronics",
    slug: "electronics_phone",
    spec_schema: [
      {
        key: "brand",
        label: "Brand",
        type: "enum",
        options: ["Apple", "Samsung", "Google", "Other"],
        required: true,
      },
      {
        key: "storage",
        label: "Storage",
        type: "enum",
        options: ["64GB", "128GB", "256GB", "512GB"],
        required: true,
      },
      { key: "color", label: "Color", type: "text", required: false },
      { key: "os", label: "OS", type: "enum", options: ["iOS", "Android"], required: true },
    ],
  },

  // Electronics > Laptop
  {
    name: "Laptop",
    parent_name: "Electronics",
    slug: "electronics_laptop",
    spec_schema: [
      {
        key: "brand",
        label: "Brand",
        type: "enum",
        options: ["Dell", "HP", "Apple", "Lenovo", "Asus"],
        required: true,
      },
      { key: "generation", label: "Generation", type: "text", required: false },
      {
        key: "core",
        label: "Processor",
        type: "enum",
        options: ["i5", "i7", "i9", "M1", "M2", "M3"],
        required: true,
      },
      {
        key: "ram",
        label: "RAM",
        type: "enum",
        options: ["8GB", "16GB", "32GB", "64GB"],
        required: true,
      },
      {
        key: "hard_disk",
        label: "Storage",
        type: "enum",
        options: ["256GB", "512GB", "1TB", "2TB"],
        required: true,
      },
    ],
  },

  // Electronics > PC
  {
    name: "PC",
    parent_name: "Electronics",
    slug: "electronics_pc",
    spec_schema: [
      {
        key: "brand",
        label: "Brand",
        type: "enum",
        options: ["Dell", "HP", "Lenovo", "Custom"],
        required: true,
      },
      {
        key: "core",
        label: "Processor",
        type: "enum",
        options: ["i5", "i7", "i9", "Ryzen 5", "Ryzen 7", "Ryzen 9"],
        required: true,
      },
      {
        key: "ram",
        label: "RAM",
        type: "enum",
        options: ["8GB", "16GB", "32GB", "64GB"],
        required: true,
      },
      {
        key: "hard_disk",
        label: "Storage",
        type: "enum",
        options: ["256GB", "512GB", "1TB", "2TB"],
        required: true,
      },
    ],
  },

  // Electronics > Monitor
  {
    name: "Monitor",
    parent_name: "Electronics",
    slug: "electronics_monitor",
    spec_schema: [
      {
        key: "brand",
        label: "Brand",
        type: "enum",
        options: ["LG", "Samsung", "Dell", "BenQ", "Asus"],
        required: true,
      },
      { key: "size", label: "Size", type: "text", required: true, unit: "inches" },
      {
        key: "resolution",
        label: "Resolution",
        type: "enum",
        options: ["1080p", "1440p", "4K"],
        required: true,
      },
    ],
  },

  // Furniture > Chair
  {
    name: "Chair",
    parent_name: "Furniture",
    slug: "furniture_chair",
    spec_schema: [
      { key: "color", label: "Color", type: "text", required: true },
      {
        key: "material",
        label: "Material",
        type: "enum",
        options: ["Leather", "Fabric", "Mesh"],
        required: true,
      },
      { key: "quantity", label: "Quantity", type: "number", required: true },
    ],
  },

  // Furniture > Desk
  {
    name: "Desk",
    parent_name: "Furniture",
    slug: "furniture_desk",
    spec_schema: [
      { key: "color", label: "Color", type: "text", required: true },
      {
        key: "material",
        label: "Material",
        type: "enum",
        options: ["Wood", "Metal", "Glass"],
        required: true,
      },
      { key: "quantity", label: "Quantity", type: "number", required: true },
    ],
  },

  // Other > Miscellaneous
  {
    name: "Miscellaneous",
    parent_name: "Other",
    slug: "other_miscellaneous",
    spec_schema: [
      { key: "description", label: "Description", type: "text", required: false },
      { key: "quantity", label: "Quantity", type: "number", required: false },
    ],
  },
];

export async function seedAssetCategories() {
  logger.info("Seeding asset categories...");
  try {
    for (const category of seedData) {
      await db
        .insert(hr_asset_categories)
        .values(category)
        .onConflictDoNothing({ target: hr_asset_categories.slug });
    }
    logger.info("Asset categories seeded successfully");
  } catch (error) {
    logger.error("Error seeding asset categories:", error);
    throw error;
  }
}

if (require.main === module) {
  seedAssetCategories()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
