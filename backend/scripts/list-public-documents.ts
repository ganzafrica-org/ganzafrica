/**
 * One-off script: list hr_documents rows whose S3 object is still readable via a public URL
 * (the pre-MOD-05 privacy bug — uploads defaulted to ACL: "public-read") for HR review
 * (MOD-05 §8).
 *
 * This checks the actual object-storage ACL via S3's GetObjectAcl, NOT the app-level `access`
 * jsonb column — those are unrelated. A document can have a permissive `access` (many roles can
 * see it through our app) while still being S3-private (the only rule that matters for "can
 * someone fetch the raw URL without going through our app at all"), and vice versa.
 *
 * Usage: pnpm --filter ganzafrica-backend tsx scripts/list-public-documents.ts
 *
 * CRITICAL: Do NOT run against production without explicit HR approval. This script only LISTS
 * keys for review — it does NOT modify anything (no re-ACL, no re-link).
 */
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(__dirname, "../.env") });

import { S3Client, GetObjectAclCommand } from "@aws-sdk/client-s3";
import { db } from "../src/db/client";
import { hr_documents } from "../src/db/schema/hr/document";
import env from "../src/config/env";
import { Logger } from "../src/config";

const logger = new Logger("ListPublicDocuments");

const ALL_USERS_URI = "http://acs.amazonaws.com/groups/global/AllUsers";
const AUTHENTICATED_USERS_URI = "http://acs.amazonaws.com/groups/global/AuthenticatedUsers";

const s3Client = new S3Client({
  endpoint: env.DO_SPACES_ENDPOINT,
  region: env.DO_SPACES_REGION,
  credentials: {
    accessKeyId: env.DO_SPACES_ACCESS_KEY,
    secretAccessKey: env.DO_SPACES_SECRET_KEY,
  },
  forcePathStyle: false,
});

async function isPubliclyReadable(key: string): Promise<boolean | "unknown"> {
  try {
    const acl = await s3Client.send(
      new GetObjectAclCommand({ Bucket: env.DO_SPACES_BUCKET, Key: key }),
    );
    return (acl.Grants ?? []).some(
      (g) =>
        g.Permission &&
        ["READ", "FULL_CONTROL"].includes(g.Permission) &&
        (g.Grantee?.URI === ALL_USERS_URI || g.Grantee?.URI === AUTHENTICATED_USERS_URI),
    );
  } catch (err) {
    // Missing object, wrong credentials, etc. — flag for manual follow-up rather than guessing.
    logger.warn(`Could not read ACL for key "${key}": ${(err as Error).message}`);
    return "unknown";
  }
}

async function main() {
  logger.info("Scanning hr_documents for S3 objects with a public-read ACL...");

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
    const result = await isPubliclyReadable(doc.file_path);
    if (result !== false) flagged.push({ doc, public: result });
  }

  logger.info("---");
  for (const { doc, public: pub } of flagged) {
    logger.info(
      `${pub === "unknown" ? "[UNKNOWN]" : "[PUBLIC]  "} ${doc.document_name} (${doc.id})`,
    );
    logger.info(`   S3 key: ${doc.file_path}`);
    logger.info(`   category: ${doc.category}, status: ${doc.status}, created: ${doc.created_at}`);
    logger.info("---");
  }

  logger.info(
    `Summary: ${docs.length} documents scanned, ${flagged.filter((f) => f.public === true).length} confirmed public, ${
      flagged.filter((f) => f.public === "unknown").length
    } unknown (ACL check failed — review manually).`,
  );
  if (flagged.length) {
    logger.warn(
      "Coordinate with HR before re-ACL'ing: flip each confirmed-public key to private and, if the " +
        "document is still referenced elsewhere by its old public URL, re-link that reference to go " +
        "through GET /hr/documents/:id/download instead.",
    );
  } else {
    logger.info("No publicly-readable document objects found.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    logger.error("Audit failed:", err as Error);
    process.exit(1);
  });
