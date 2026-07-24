import { db } from "../../../client";
import { hr_contracts } from "../contract";
import { hr_users } from "../employee";
import Logger from "../../../../config/logger";
import { eq } from "drizzle-orm";

const logger = new Logger("ContractSeed");

const seedData = [
  {
    employee_email: "alice.uwimana@gmail.com",
    job_title: "HR Manager",
    department: "Human Resources",
    work_location: "ganza-head-office",
    manager: "John Doe",
    report_to: "CEO",
    start_date: new Date("2023-01-01"),
    employment_term: "indefinite" as const,
    end_date: null,
    employment_type: "full-time" as const,
    days_per_week: null,
    compensation_type: "salaried" as const,
    salary_scale: "monthly" as const,
    currency: "RWF",
    base_monthly_rate: "500000.00",
    gross_annual_rate: "6000000.00",
    status: "ACTIVE" as const,
  },
  {
    employee_email: "bob.nkurunziza@gmail.com",
    job_title: "Agribusiness Expert",
    department: "Food System",
    work_location: "musanze",
    manager: "Alice Uwimana",
    report_to: "Alice Uwimana",
    start_date: new Date("2023-06-01"),
    employment_term: "definite" as const,
    end_date: new Date("2025-06-01"),
    employment_type: "full-time" as const,
    days_per_week: null,
    compensation_type: "salaried" as const,
    salary_scale: "monthly" as const,
    currency: "RWF",
    base_monthly_rate: "350000.00",
    gross_annual_rate: "4200000.00",
    status: "ACTIVE" as const,
  },
  {
    employee_email: "carol.mutesi@gmail.com",
    job_title: "IT Support Specialist",
    department: "IT",
    work_location: "work-from-home",
    manager: "Alice Uwimana",
    report_to: "Alice Uwimana",
    start_date: new Date("2024-01-15"),
    employment_term: "indefinite" as const,
    end_date: null,
    employment_type: "part-time" as const,
    days_per_week: 3,
    compensation_type: "hourly" as const,
    salary_scale: null,
    currency: "USD",
    base_monthly_rate: "1200.00",
    gross_annual_rate: "14400.00",
    status: "ACTIVE" as const,
  },
];

export async function seedContracts() {
  logger.info("Seeding contracts...");
  try {
    for (const contract of seedData) {
      const [employee] = await db
        .select({ id: hr_users.id })
        .from(hr_users)
        .where(eq(hr_users.personal_email, contract.employee_email))
        .limit(1);

      if (!employee) {
        logger.warn(`Employee not found for ${contract.employee_email}, skipping`);
        continue;
      }

      const { employee_email, ...contractData } = contract;

      await db
        .insert(hr_contracts)
        .values({ ...contractData, employee_id: employee.id })
        .onConflictDoNothing();
    }
    logger.info("Contracts seeded successfully");
  } catch (error) {
    logger.error("Error seeding contracts:", error);
    throw error;
  }
}

if (require.main === module) {
  seedContracts()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
