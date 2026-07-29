import { seedAssetCategories } from "./schema/hr/seeds/asset-categories.seed";
import Logger from "../config/logger";

const logger = new Logger("SeedRunner");

/**
 * Demo-data seeder. The hr_users-based employee/contract/leave/asset/document demo seeds were
 * removed with the hr_users retirement (MOD-01) — they populated the retired identity model.
 * Only reference-data seeds (asset categories) remain; demo employees now come through the real
 * flows (REC-05 hire, or `db:seed:*` domain seeders).
 */
async function runSeeds() {
  logger.info("Starting database seeding...");
  try {
    await seedAssetCategories();
    logger.info("All seeds completed successfully!");
    process.exit(0);
  } catch (error) {
    logger.error("Seeding failed:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeeds().catch(console.error);
}
