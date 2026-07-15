import { db } from "../../../client";
import { hr_documents } from "../document"; // Ensure this matches your schema file export location
import { hr_users } from "../employee";
import { hr_contracts } from "../contract"; // Reference to look up the Foreign Key contract links
import Logger from "../../../../config/logger";
import { eq, and } from "drizzle-orm";

const logger = new Logger("DocumentSeed");

// Seed data template detailing your specific categories and structural layouts
const seedData = [
  {
    document_name: "Company Wide Remote Work Policy",
    category: "Policies & Procedures" as const,
    version: "1.0.0",
    description:
      "Standard operational protocols governing working from home and remote workspace security setup guidelines.",
    department: "Human Resources",
    status: "PUBLISHED" as const,
    file_path: "uploads/documents/seed-remote-policy.pdf",
    file_size: "142.5 KB",
    creator_email: "alice.uwimana@gmail.com", // Used to look up created_by_id dynamically
    access: {
      type: "department",
      target: "All",
      permission: "see_only",
    },
    link_to_contract_email: null,
  },
  {
    document_name: "Onboarding Identity Authorization Request Form",
    category: "Forms & Applications" as const,
    version: "v2.1",
    description:
      "Requisition layout required by incoming personnel to acquire building access credentials and structural permissions.",
    department: "IT",
    status: "PUBLISHED" as const,
    file_path: "uploads/documents/seed-onboarding-form.pdf",
    file_size: "88.0 KB",
    creator_email: "carol.mutesi@gmail.com",
    access: {
      type: "department",
      target: "IT",
      permission: "edit",
    },
    link_to_contract_email: null,
  },
  {
    document_name: "Executive Employment Agreement Template - HR Manager",
    category: "Contract Templates" as const,
    version: "2026.1",
    description:
      "Executed definitive employment terms agreement copy attached to the primary human resources directory structure.",
    department: "Human Resources",
    status: "PUBLISHED" as const,
    file_path: "uploads/documents/seed-contract-alice.pdf",
    file_size: "1.2 MB",
    creator_email: "alice.uwimana@gmail.com",
    access: {
      type: "individual",
      target: "alice.uwimana@gmail.com",
      permission: "see",
      owner: "Alice Uwimana", // Owner property explicitly provided for Contract Templates category
    },
    link_to_contract_email: "alice.uwimana@gmail.com", // Marks this record to be linked to Alice's seed contract record
  },
];

export async function seedDocuments() {
  logger.info("Seeding system documents...");
  try {
    for (const doc of seedData) {
      // 1. Resolve Creator Identity User Reference Link
      const [creator] = await db
        .select({ id: hr_users.id })
        .from(hr_users)
        .where(eq(hr_users.personal_email, doc.creator_email))
        .limit(1);

      if (!creator) {
        logger.warn(
          `Skipping document '${doc.document_name}': Creator profile '${doc.creator_email}' not found.`,
        );
        continue;
      }

      // 2. Resolve Contract Foreign Key Link if applicable
      let linkedContractId: string | null = null;
      if (doc.category === "Contract Templates" && doc.link_to_contract_email) {
        // Query the linked employee record first
        const [targetEmployee] = await db
          .select({ id: hr_users.id })
          .from(hr_users)
          .where(eq(hr_users.personal_email, doc.link_to_contract_email))
          .limit(1);

        if (targetEmployee) {
          // Fetch contract belonging to that employee
          const [contractRecord] = await db
            .select({ id: hr_contracts.id })
            .from(hr_contracts)
            .where(eq(hr_contracts.employee_id, targetEmployee.id))
            .limit(1);

          if (contractRecord) {
            linkedContractId = contractRecord.id;
          }
        }

        if (!linkedContractId) {
          logger.warn(
            `Could not find a corresponding contract record to link for ${doc.link_to_contract_email}. Proceeding without link.`,
          );
        }
      }

      // 3. Persist record into the database
      await db
        .insert(hr_documents)
        .values({
          document_name: doc.document_name,
          category: doc.category,
          version: doc.version,
          description: doc.description,
          department: doc.department,
          status: doc.status,
          file_path: doc.file_path,
          file_size: doc.file_size,
          downloads: 0,
          access: doc.access,
          created_by_id: creator.id,
          contract_id: linkedContractId,
        })
        // Prevents duplications if re-running master seeds
        .onConflictDoNothing();
    }
    logger.info("Documents table seeded successfully");
  } catch (error) {
    logger.error("Error encountered seeding document structure rows:", error);
    throw error;
  }
}

// Runnable file configuration block
if (require.main === module) {
  seedDocuments()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
