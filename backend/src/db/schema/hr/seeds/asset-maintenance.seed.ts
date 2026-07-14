import { db } from "../../../client";
import { hr_asset_maintenance } from "../asset-maintenance";
import { hr_assets } from "../assets";
import { hr_users } from "../employee";
import Logger from "../../../../config/logger";
import {eq} from "drizzle-orm";

const logger = new Logger("AssetMaintenanceSeed");

// Seed data using placeholders (names/titles) to look up actual UUIDs
const seedData = [
    {
        asset_name: "MacBook Pro 2023", // Assuming you have a name field in assets
        requester_email: "admin@company.com",
        title: "Screen Repair",
        description: "Cracked screen due to accidental drop.",
        status: "PENDING",
        price: "250.00",
    },
    {
        asset_name: "Office Chair Ergonomic",
        requester_email: "employee@company.com",
        title: "Hydraulic issue",
        description: "Chair does not hold height adjustment.",
        status: "APPROVED",
        price: "45.00",
    },
];

export async function seedAssetMaintenance() {
    logger.info("Seeding maintenance records...");

    try {
        for (const record of seedData) {
            // 1. Fetch valid IDs dynamically
            const [asset] = await db.select({ id: hr_assets.id })
                .from(hr_assets)
                .where(eq(hr_assets.device_name, record.asset_name))
                .limit(1);

            const [user] = await db.select({ id: hr_users.id })
                .from(hr_users)
                .where(eq(hr_users.personal_email, record.requester_email))
                .limit(1);

            if (!asset || !user) {
                logger.warn(`Skipping record: Asset or User not found for ${record.asset_name}`);
                continue;
            }

            // 2. Insert record using the discovered UUIDs
            await db.insert(hr_asset_maintenance)
                .values({
                    asset_id: asset.id,
                    requester_id: user.id,
                    title: record.title,
                    description: record.description,
                    status: record.status as any, // Cast to match enum
                    price: record.price,
                })
                .onConflictDoNothing(); // Adjust target if you add a unique slug/constraint
        }
        logger.info("Maintenance records seeded successfully");
    } catch (error) {
        logger.error("Error seeding maintenance:", error);
        throw error;
    }
}