/**
 * One-off script: List pre-existing public-ACL document keys for HR review (MOD-05 §8)
 *
 * Purpose: Identify documents in S3/DB that were uploaded with public ACL (the security bug)
 * so HR can review and manually migrate them to private storage if needed.
 *
 * Usage: pnpm --filter ganzafrica-backend tsx scripts/list-public-documents.ts
 *
 * CRITICAL: Do NOT execute against production without explicit HR approval.
 * This script only LISTS keys for review—it does NOT modify anything.
 */

import { config } from "dotenv";
import path from "path";

// Load .env from backend directory
config({ path: path.resolve(__dirname, "../.env") });

import { db } from "../src/db/client";
import { hr_documents } from "../src/db/schema/hr/document";
import { Logger } from "../src/config";

const logger = new Logger("ListPublicDocuments");

async function main() {
  logger.info("Scanning for documents with public ACL (security audit)...");

  try {
    // Query all documents and check their ACL
    const docs = await db.select().from(hr_documents);

    const publicDocs = docs.filter((doc) => {
      const acl = doc.access;
      // Check if ACL is explicitly public (either through old DocumentAccessRule or new DocumentACL)
      // Public typically means: no ACL restrictions, or explicitly set to allow all
      return acl === null || (typeof acl === "object" && Object.keys(acl).length === 0);
    });

    logger.info(`Found ${publicDocs.length} documents with public/no ACL:`);
    logger.info("---");

    publicDocs.forEach((doc, idx) => {
      logger.info(`${idx + 1}. Document: ${doc.document_name}`);
      logger.info(`   ID: ${doc.id}`);
      logger.info(`   File Path: ${doc.file_path}`);
      logger.info(`   S3 Key: ${doc.file_path.replace(/^uploads\//, "")}`);
      logger.info(`   Category: ${doc.category}`);
      logger.info(`   Department: ${doc.department}`);
      logger.info(`   Status: ${doc.status}`);
      logger.info(`   Created: ${doc.created_at}`);
      logger.info("---");
    });

    logger.info(`\nSummary:`);
    logger.info(`Total documents: ${docs.length}`);
    logger.info(`Documents with public/no ACL: ${publicDocs.length}`);

    if (publicDocs.length > 0) {
      logger.warn("\nWARNING: These documents may be readable from S3 public URLs.");
      logger.warn(
        "Review the list above and coordinate with HR to migrate them to private storage if needed.",
      );
      if (publicDocs[0]) {
        logger.warn(
          "S3 key format for migration: " + publicDocs[0].file_path.replace(/^uploads\//, ""),
        );
      }
    } else {
      logger.info("\nGood news! No documents with public ACL found.");
    }
  } catch (error) {
    logger.error("Error reading documents:", error);
    process.exit(1);
  }
}

main().then(() => {
  logger.info("Audit complete.");
  process.exit(0);
});
