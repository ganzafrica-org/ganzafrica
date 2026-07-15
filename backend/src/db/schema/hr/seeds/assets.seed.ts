import { db } from "../../../client";
import {
  hr_assets,
  hr_asset_categories,
  hr_asset_specs,
  hr_asset_images,
  hr_users,
  hr_asset_maintenance,
} from "../../hr";
import Logger from "../../../../config/logger";
import { eq } from "drizzle-orm";

const logger = new Logger("AssetSeed");

export async function seedAssets() {
  logger.info("Seeding assets...");
  try {
    // 1. Get Categories
    const categories = await db.select().from(hr_asset_categories);
    const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

    const phoneCatId = categoryMap.get("electronics_phone");
    const laptopCatId = categoryMap.get("electronics_laptop");
    const chairCatId = categoryMap.get("furniture_chair");

    if (!phoneCatId || !laptopCatId || !chairCatId) {
      logger.warn(
        "Required categories not found, skipping asset seed. Ensure categories are seeded first.",
      );
      return;
    }

    // 2. Sample Assets
    const assetsToInsert = [
      {
        device_name: "iPhone 15 Pro",
        serial_number: "SN-IPHONE-001",
        category_id: phoneCatId,
        purchase_price: "999.00",
        status: "AVAILABLE" as const,
      },
      {
        device_name: "MacBook Pro M3",
        serial_number: "SN-MACBOOK-001",
        category_id: laptopCatId,
        purchase_price: "2499.00",
        status: "AVAILABLE" as const,
      },
      {
        device_name: "Ergonomic Office Chair",
        serial_number: "SN-CHAIR-001",
        category_id: chairCatId,
        purchase_price: "350.00",
        status: "AVAILABLE" as const,
      },
    ];

    for (const assetData of assetsToInsert) {
      // Check if already exists
      const existing = await db
        .select()
        .from(hr_assets)
        .where(eq(hr_assets.serial_number, assetData.serial_number))
        .limit(1);
      if (existing.length > 0) continue;

      const [asset] = await db.insert(hr_assets).values(assetData).returning();

      // 3. Add Specs based on category
      if (assetData.serial_number === "SN-IPHONE-001") {
        await db
          .insert(hr_asset_specs)
          .values([
            { asset_id: asset.id, spec_key: "brand", spec_value: "Apple" },
            { asset_id: asset.id, spec_key: "storage", spec_value: "256GB" },
            { asset_id: asset.id, spec_key: "os", spec_value: "iOS" },
          ])
          .onConflictDoNothing();
      } else if (assetData.serial_number === "SN-MACBOOK-001") {
        await db
          .insert(hr_asset_specs)
          .values([
            { asset_id: asset.id, spec_key: "brand", spec_value: "Apple" },
            { asset_id: asset.id, spec_key: "core", spec_value: "M3" },
            { asset_id: asset.id, spec_key: "ram", spec_value: "16GB" },
            { asset_id: asset.id, spec_key: "hard_disk", spec_value: "512GB" },
          ])
          .onConflictDoNothing();
      } else if (assetData.serial_number === "SN-CHAIR-001") {
        await db
          .insert(hr_asset_specs)
          .values([
            { asset_id: asset.id, spec_key: "color", spec_value: "Black" },
            { asset_id: asset.id, spec_key: "material", spec_value: "Mesh" },
            { asset_id: asset.id, spec_key: "quantity", spec_value: "1" },
          ])
          .onConflictDoNothing();
      }

      // 4. Add a dummy image
      await db
        .insert(hr_asset_images)
        .values({
          asset_id: asset.id,
          url: "https://placehold.co/600x400?text=" + encodeURIComponent(assetData.device_name),
          storage_key: "seeds/assets/" + asset.id + ".png",
          is_primary: true,
          sort_order: 0,
        })
        .onConflictDoNothing();

      // 5. Add maintenance record if it's the laptop
      if (assetData.serial_number === "SN-MACBOOK-001") {
        const users = await db.select({ id: hr_users.id }).from(hr_users).limit(1);
        if (users.length > 0) {
          await db
            .insert(hr_asset_maintenance)
            .values({
              asset_id: asset.id,
              requester_id: users[0].id,
              title: "Keyboard Repair",
              description: "Some keys are sticky",
              status: "PENDING",
              price: "150.00",
            })
            .onConflictDoNothing();
        }
      }
    }

    logger.info("Assets seeded successfully");
  } catch (error) {
    logger.error("Error seeding assets:", error);
    throw error;
  }
}

if (require.main === module) {
  seedAssets()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
