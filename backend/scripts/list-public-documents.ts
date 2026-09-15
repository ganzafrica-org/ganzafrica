/**
 * One-off script: list hr_documents rows whose blob lives in the PUBLIC Azure container instead
 * of the private one (MOD-05 §8's public-leak audit, adapted for Azure). Azure Blob Storage sets
 * public/private access at the CONTAINER level, not per-object like S3's ACL grants — so the
 * equivalent leak here is "this document's key resolves in the public container", not a
 * per-object ACL flag.
 *
 * This checks actual blob-storage location, NOT the app-level `access` jsonb column — those are
 * unrelated. A document can have a permissive `access` (many roles can see it through our app)
 * while still living in the private container (the only rule that matters for "can someone fetch
 * the raw URL without going through our app at all"), and vice versa.
 *
 * Usage: pnpm --filter ganzafrica-backend tsx scripts/list-public-documents.ts
 *
 * CRITICAL: Do NOT run against production without explicit HR approval. This script only LISTS
 * keys for review — it does NOT modify anything (no re-upload, no re-link).
 */
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../.env") });

import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { db } from "../src/db/client";
import { hr_documents } from "../src/db/schema/hr/document";
import env from "../src/config/env";
import { Logger } from "../src/config";

const logger = new Logger("ListPublicDocuments");

const sharedKeyCredential = new StorageSharedKeyCredential(
  env.AZURE_STORAGE_ACCOUNT,
  env.AZURE_STORAGE_ACCOUNT_KEY,
);
const blobServiceClient = new BlobServiceClient(env.AZURE_STORAGE_ENDPOINT, sharedKeyCredential);
const publicContainer = blobServiceClient.getContainerClient(env.AZURE_STORAGE_CONTAINER_PUBLIC);

async function isInPublicContainer(key: string): Promise<boolean | "unknown"> {
  try {
    return await publicContainer.getBlobClient(key).exists();
  } catch (err) {
    // Wrong credentials, transient network error, etc. — flag for manual follow-up rather than guessing.
    logger.warn(`Could not check public container for key "${key}": ${(err as Error).message}`);
    return "unknown";
  }
}

async function main() {
  logger.info(
    `Scanning hr_documents for blobs living in the public container ("${env.AZURE_STORAGE_CONTAINER_PUBLIC}")...`,
  );

  const docs = await db
    .select({
      id: hr_documents.id,
      document_name: hr_documents.document_name,
      file_path: hr_documents.file_path,
      category: hr_documents.category,
      status: hr_documents.status,
      created_at: hr_documents.created_at,
    })
    .from(hr_documents);

  const flagged: { doc: (typeof docs)[number]; public: boolean | "unknown" }[] = [];

  for (const doc of docs) {
    const result = await isInPublicContainer(doc.file_path);
    if (result !== false) flagged.push({ doc, public: result });
  }

  logger.info("---");
  for (const { doc, public: pub } of flagged) {
    logger.info(
      `${pub === "unknown" ? "[UNKNOWN]" : "[PUBLIC]  "} ${doc.document_name} (${doc.id})`,
    );
    logger.info(`   blob key: ${doc.file_path}`);
    logger.info(`   category: ${doc.category}, status: ${doc.status}, created: ${doc.created_at}`);
    logger.info("---");
  }

  logger.info(
    `Summary: ${docs.length} documents scanned, ${flagged.filter((f) => f.public === true).length} confirmed in the public container, ${
      flagged.filter((f) => f.public === "unknown").length
    } unknown (check failed — review manually).`,
  );
  if (flagged.length) {
    logger.warn(
      "Coordinate with HR before moving anything: re-upload each confirmed-public blob into the " +
        "private container and re-link the hr_documents row's file_path, then delete the public copy.",
    );
  } else {
    logger.info("No document blobs found in the public container.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error("Audit failed:", err as Error);
    process.exit(1);
  });
