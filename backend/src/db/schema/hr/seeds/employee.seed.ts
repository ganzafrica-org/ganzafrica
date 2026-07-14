import { db } from "../../../client";
import { hr_users } from "../employee";
import Logger from "../../../../config/logger";
import * as bcrypt from "bcryptjs";

const logger = new Logger("EmployeeSeed");

const seedData = [
  {
    first_name: "Alice",
    last_name: "Uwimana",
    personal_email: "alice.uwimana@gmail.com",
    work_email: "alice@ganzafrica.org",
    phone: "+250788000001",
    citizenship: "Rwandan",
    home_country: "Rwanda",
    home_city: "Kigali",
    role: "HR" as const,
    status: "ACTIVE" as const,
    avatar_initials: "AU",
    profile_setup_completed: true,
    requires_password_reset: false,
  },
  {
    first_name: "Bob",
    last_name: "Nkurunziza",
    personal_email: "bob.nkurunziza@gmail.com",
    work_email: "bob@ganzafrica.org",
    phone: "+250788000002",
    citizenship: "Rwandan",
    home_country: "Rwanda",
    home_city: "Musanze",
    role: "EMPLOYEE" as const,
    status: "ACTIVE" as const,
    avatar_initials: "BN",
    profile_setup_completed: true,
    requires_password_reset: false,
  },
  {
    first_name: "Carol",
    last_name: "Mutesi",
    personal_email: "carol.mutesi@gmail.com",
    work_email: "carol@ganzafrica.org",
    phone: "+250788000003",
    citizenship: "Rwandan",
    home_country: "Rwanda",
    home_city: "Kigali",
    role: "IT" as const,
    status: "ACTIVE" as const,
    avatar_initials: "CM",
    profile_setup_completed: true,
    requires_password_reset: false,
  },
];

export const seedEmployees = async () => {
  logger.info("Seeding employees...");
  try {
    const passwordHash = await bcrypt.hash("TempPass123!", 10);

    for (const emp of seedData) {
      await db
        .insert(hr_users)
        .values({ ...emp, password_hash: passwordHash })
        // FIX: Swapped work_email for personal_email to match the database unique constraint layout
        .onConflictDoNothing({ target: hr_users.personal_email });
    }
    logger.info("Employees seeded successfully");
  } catch (error) {
    logger.error("Error seeding employees:", error);
    throw error;
  }
};

if (require.main === module) {
  seedEmployees()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}