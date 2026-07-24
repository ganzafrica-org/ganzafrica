import { seedAssetCategories } from "./schema/hr/seeds/asset-categories.seed";
import { seedAssets } from "./schema/hr/seeds/assets.seed";
import { seedAssetMaintenance } from "./schema/hr/seeds/asset-maintenance.seed";
import { seedEmployees } from "./schema/hr/seeds/employee.seed";
import { seedContracts } from "./schema/hr/seeds/contract.seed";
import { seedLeaves } from "./schema/hr/seeds/leaves.seed";
import { seedDocuments } from "./schema/hr/seeds/document.seed";
import Logger from "../config/logger";

const logger = new Logger("SeedRunner");

async function runSeeds() {
  logger.info("Starting database seeding...");
  try {
    await seedEmployees();
    await seedContracts();
    await seedLeaves();
    await seedAssetCategories();
    await seedAssets();
    await seedAssetMaintenance();
    await seedDocuments();

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
