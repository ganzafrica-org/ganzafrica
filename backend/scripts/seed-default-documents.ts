/**
 * Seed the document library with GanzAfrica's real default documents (policies, handbooks,
 * forms) so new hires land on actual company material instead of an empty/dummy library.
 *
 * Reads every PDF in a directory and creates one hr_documents row per file via the real
 * createDocument service call (same path the UI's upload form uses), so uploads, ACL, and
 * search-text indexing all behave exactly like a normal HR-created document.
 *
 *   pnpm db:seed:documents -- /path/to/onboarding-default-docs
 *
 * Re-running is safe: a file whose document_name already has a non-archived row is skipped
 * rather than duplicated — re-run any time the directory's contents change to pick up new files.
 */
import fs from "fs";
import path from "path";
import { eq, and, ne } from "drizzle-orm";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import { db } from "../src/db/client";
import { employees, roles, user_roles, hr_documents } from "../src/db/schema";
import { createDocument, type DocumentCategory } from "../src/services/hr/document.service";
import { Logger } from "../src/config";
import env from "../src/config/env";

const logger = new Logger("SeedDefaultDocuments");

const sharedKeyCredential = new StorageSharedKeyCredential(
  env.AZURE_STORAGE_ACCOUNT,
  env.AZURE_STORAGE_ACCOUNT_KEY,
);
const blobServiceClient = new BlobServiceClient(env.AZURE_STORAGE_ENDPOINT, sharedKeyCredential);
const privateContainer = blobServiceClient.getContainerClient(env.AZURE_STORAGE_CONTAINER_PRIVATE);

async function firstHrEmployeeId(): Promise<string> {
  const [hr] = await db
    .select({ employeeId: employees.id })
    .from(employees)
    .innerJoin(user_roles, eq(user_roles.user_id, employees.user_id))
    .innerJoin(roles, eq(roles.id, user_roles.role_id))
    .where(eq(roles.name, "hr"))
    .limit(1);
  if (hr) return hr.employeeId;

  const [anyEmployee] = await db.select({ id: employees.id }).from(employees).limit(1);
  if (!anyEmployee) throw new Error("No employees exist — create one first");
  return anyEmployee.id;
}

function categoryFor(fileName: string): DocumentCategory {
  const lower = fileName.toLowerCase();
  if (lower.includes("form")) return "Forms & Applications";
  if (
    lower.includes("bribery") ||
    lower.includes("corruption") ||
    lower.includes("data protection") ||
    lower.includes("safeguard") ||
    lower.includes("whistleblow")
  ) {
    return "Compliance & Legal";
  }
  return "Policies & Procedures";
}

function departmentFor(fileName: string): string {
  return fileName.toLowerCase().includes("it policy") ? "IT" : "Human Resources";
}

function documentNameFor(fileName: string): string {
  return path.basename(fileName, path.extname(fileName)).replace(/\s+/g, " ").trim();
}

async function alreadySeeded(documentName: string): Promise<boolean> {
  const [row] = await db
    .select({ id: hr_documents.id })
    .from(hr_documents)
    .where(and(eq(hr_documents.document_name, documentName), ne(hr_documents.status, "ARCHIVED")))
    .limit(1);
  return !!row;
}

async function uploadDocument(
  localPath: string,
  fileName: string,
): Promise<{ key: string; size: number }> {
  const buffer = fs.readFileSync(localPath);
  const key = `document/${Date.now()}-${Math.round(Math.random() * 1e9)}-${fileName.replace(/[^a-zA-Z0-9.]/g, "_")}`;
  await privateContainer.getBlockBlobClient(key).uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: "application/pdf" },
  });
  return { key, size: buffer.length };
}

async function main() {
  // `pnpm run script -- arg` forwards the literal "--" into process.argv, so filter it out
  // rather than relying on a fixed index.
  const dir =
    process.argv.slice(2).find((a) => a !== "--") ??
    path.join(__dirname, "../../onboarding-default-docs");
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    throw new Error(`Directory not found: ${dir}`);
  }

  const files = fs.readdirSync(dir).filter((f) => f.toLowerCase().endsWith(".pdf"));
  if (!files.length) {
    logger.info(`No PDF files found in ${dir} — nothing to seed.`);
    return;
  }

  const createdById = await firstHrEmployeeId();
  let created = 0;
  let skipped = 0;

  for (const fileName of files) {
    const documentName = documentNameFor(fileName);
    if (await alreadySeeded(documentName)) {
      logger.info(`Skipping "${documentName}" — already seeded.`);
      skipped++;
      continue;
    }

    const localPath = path.join(dir, fileName);
    const { key, size } = await uploadDocument(localPath, fileName);
    await createDocument({
      document_name: documentName,
      category: categoryFor(fileName),
      description: `${documentName} — GanzAfrica company policy, seeded as a default onboarding reference document.`,
      department: departmentFor(fileName),
      status: "PUBLISHED",
      file: { key, size, originalName: fileName },
      createdById,
      // Visible to every employee (the "employee" role every hire gets) — signing stays
      // separately gated to whatever's actually routed through an onboarding task.
      access: { roles: ["employee"] },
    });
    logger.info(`Created "${documentName}" (${categoryFor(fileName)}) → ${key}`);
    created++;
  }

  logger.info(`Done. Created ${created}, skipped ${skipped} (already present).`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error("Default document seed failed", error);
    process.exit(1);
  });
