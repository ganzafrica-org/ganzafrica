/**
 * Onboarding contract-signing rollout: seed a minimal "Employment Contract" signature template so
 * the contract_signing task kind has something to send. Field labels here are placeholders — HR
 * should review/adjust them via the existing template builder (Settings → E-Signing Templates);
 * this just unblocks the flow end-to-end rather than leaving it silently broken with no template.
 *
 *   pnpm db:seed:signing
 *
 * Idempotent — the template is created once by name (matches seed-onboarding-template.ts).
 */
import { eq } from "drizzle-orm";
import { db } from "../src/db/client";
import { roles, user_roles, users } from "../src/db/schema";
import { addField, createTemplate, getTemplateByName } from "../src/services/signing.service";
import { Logger } from "../src/config";

const logger = new Logger("SeedSigningTemplate");

const TEMPLATE_NAME = "Employment Contract";

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

async function main() {
  const existing = await getTemplateByName(TEMPLATE_NAME);
  if (existing) {
    logger.info(`Template "${TEMPLATE_NAME}" already exists (id ${existing.id})`);
    return;
  }

  const createdBy = await firstHrUserId();
  const template = await createTemplate(
    {
      name: TEMPLATE_NAME,
      description:
        "Placeholder employment contract signature template seeded for LCM-01's contract_signing " +
        "task. Review and adjust fields via the template builder before relying on this in production.",
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
