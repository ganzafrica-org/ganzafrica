/**
 * Onboarding contract-signing rollout: seed a minimal "Employment Contract" signature template so
 * the contract_signing task kind has something to send. Field labels here are placeholders — HR
 * should review/adjust them via the existing template builder (Settings → E-Signing Templates);
 * this just unblocks the flow end-to-end rather than leaving it silently broken with no template.
 *
 * Without a base file (`file_key`), the template is fields-only — every signer sees "No document
 * file is attached to this template" and the signed result has nothing real to view or count as a
 * document. Pass a local file to upload as that base document:
 *
 *   pnpm db:seed:signing -- /path/to/employment-contract.pdf
 *
 * Re-running with a new path replaces the base file on the existing template (that's the intended
 * way to swap in a real document later). With no path and no existing file_key, a minimal
 * placeholder PDF is generated so the signing flow is still exercisable end-to-end.
 *
 *   pnpm db:seed:signing
 */
import fs from "fs";
import path from "path";
import { eq } from "drizzle-orm";
import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import PDFDocument from "pdfkit";
import { db } from "../src/db/client";
import { roles, user_roles, users } from "../src/db/schema";
import {
  addField,
  createTemplate,
  getTemplateByName,
  setTemplateFileKey,
} from "../src/services/signing.service";
import { Logger } from "../src/config";
import env from "../src/config/env";

const logger = new Logger("SeedSigningTemplate");

const TEMPLATE_NAME = "Employment Contract";

const sharedKeyCredential = new StorageSharedKeyCredential(
  env.AZURE_STORAGE_ACCOUNT,
  env.AZURE_STORAGE_ACCOUNT_KEY,
);
const blobServiceClient = new BlobServiceClient(env.AZURE_STORAGE_ENDPOINT, sharedKeyCredential);
const privateContainer = blobServiceClient.getContainerClient(env.AZURE_STORAGE_CONTAINER_PRIVATE);

async function firstHrUserId(): Promise<number> {
  const [hr] = await db
    .select({ userId: user_roles.user_id })
    .from(user_roles)
    .innerJoin(roles, eq(user_roles.role_id, roles.id))
    .where(eq(roles.name, "hr"))
    .limit(1);
  if (hr) return hr.userId;

  const [anyUser] = await db.select({ id: users.id }).from(users).limit(1);
  if (!anyUser) throw new Error("No users exist — run the RBAC seed first");
  return anyUser.id;
}

function generatePlaceholderPdf(): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fontSize(20).text("Employment Contract", { align: "center" });
    doc
      .moveDown()
      .fontSize(12)
      .text(
        "Placeholder base document — replace by re-running this seed script with a real file:\n" +
          "pnpm db:seed:signing -- /path/to/employment-contract.pdf",
      );
    doc.end();
  });
}

async function uploadBaseDocument(localPath?: string): Promise<string> {
  const buffer = localPath ? fs.readFileSync(localPath) : await generatePlaceholderPdf();
  const originalName = localPath ? path.basename(localPath) : "employment-contract-placeholder.pdf";
  const key = `document/${Date.now()}-${Math.round(Math.random() * 1e9)}-${originalName.replace(/[^a-zA-Z0-9.]/g, "_")}`;

  await privateContainer.getBlockBlobClient(key).uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: "application/pdf" },
  });
  return key;
}

async function main() {
  const localPath = process.argv[2];
  if (localPath && !fs.existsSync(localPath)) {
    throw new Error(`File not found: ${localPath}`);
  }

  const existing = await getTemplateByName(TEMPLATE_NAME);
  if (existing) {
    if (!localPath && existing.file_key) {
      logger.info(
        `Template "${TEMPLATE_NAME}" already exists (id ${existing.id}) with a base file — nothing to do.`,
      );
      return;
    }
    const fileKey = await uploadBaseDocument(localPath);
    await setTemplateFileKey(existing.id, fileKey);
    logger.info(`Updated "${TEMPLATE_NAME}" (id ${existing.id}) base file → ${fileKey}`);
    return;
  }

  const createdBy = await firstHrUserId();
  const fileKey = await uploadBaseDocument(localPath);
  const template = await createTemplate(
    {
      name: TEMPLATE_NAME,
      description:
        "Employment contract signature template seeded for LCM-01's contract_signing task. " +
        "Review and adjust fields via the template builder before relying on this in production.",
      file_key: fileKey,
    },
    createdBy,
  );

  // signer_index 0 = HR (signs first), 1 = the employee (signs second) — matches
  // startContractSigning's signerUserIds order in process.service.ts.
  await addField(template.id, {
    key: "hr_signature",
    label: "HR Representative Signature",
    type: "signature",
    required: true,
    signer_index: 0,
    sort_order: 0,
  });
  await addField(template.id, {
    key: "hr_sign_date",
    label: "HR Sign Date",
    type: "date",
    required: true,
    signer_index: 0,
    sort_order: 1,
  });
  await addField(template.id, {
    key: "employee_signature",
    label: "Employee Signature",
    type: "signature",
    required: true,
    signer_index: 1,
    sort_order: 2,
  });
  await addField(template.id, {
    key: "employee_sign_date",
    label: "Employee Sign Date",
    type: "date",
    required: true,
    signer_index: 1,
    sort_order: 3,
  });

  logger.info(`Created "${TEMPLATE_NAME}" (id ${template.id}) with 4 placeholder fields`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    logger.error("Signing template seed failed", error);
    process.exit(1);
  });
