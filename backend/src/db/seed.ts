import { seedAssetCategories } from "./schema/hr/seeds/asset-categories.seed";
import { seedAssets } from "./schema/hr/seeds/assets.seed";
import { seedAssetMaintenance } from "./schema/hr/seeds/asset-maintenance.seed";
import Logger from "../config/logger";

const logger = new Logger("SeedRunner");

async function runSeeds() {
  logger.info("Starting database seeding...");
  try {
    await seedAssetCategories();
    await seedAssets();
    await seedAssetMaintenance();
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
