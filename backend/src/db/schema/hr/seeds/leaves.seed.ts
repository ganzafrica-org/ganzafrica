import { db } from "../../../client";
import { hr_leaves } from "../leave";
import { hr_users } from "../employee";
import Logger from "../../../../config/logger";
import { eq } from "drizzle-orm";

const logger = new Logger("LeavesSeed");

const seedData = [
  {
    employee_email: "bob.nkurunziza@gmail.com",
    type: "ANNUAL" as const,
    start_date: new Date("2024-08-01"),
    end_date: new Date("2024-08-07"),
    reason: "Family vacation",
    status: "APPROVED" as const,
  },
  {
    employee_email: "carol.mutesi@gmail.com",
    type: "SICK" as const,
    start_date: new Date("2024-09-10"),
    end_date: new Date("2024-09-12"),
    reason: "Medical appointment",
    status: "PENDING" as const,
  },
];

export async function seedLeaves() {
  logger.info("Seeding leaves...");
  try {
    for (const leave of seedData) {
      const [employee] = await db
        .select({ id: hr_users.id })
        .from(hr_users)
        .where(eq(hr_users.personal_email, leave.employee_email))
        .limit(1);

      if (!employee) {
        logger.warn(`Employee not found for ${leave.employee_email}, skipping`);
        continue;
      }

      const { employee_email, ...leaveData } = leave;

      await db
        .insert(hr_leaves)
        .values({ ...leaveData, user_id: employee.id })
        .onConflictDoNothing();
    }
    logger.info("Leaves seeded successfully");
  } catch (error) {
    logger.error("Error seeding leaves:", error);
    throw error;
  }
}

if (require.main === module) {
  seedLeaves()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}