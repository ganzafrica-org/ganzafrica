import { db } from "../db/client";
import { payrolls, users } from "../db/schema";
import { eq, and, desc, asc, sql, ilike, or } from "drizzle-orm";
import { AppError } from "../middlewares";
import { Logger } from "../config";
import { deletePayslipFromSpaces } from "./pdf.service";

const logger = new Logger("PayrollService");

export interface CreatePayrollData {
  user_id?: number | null;
  payroll_period: string;
  date_of_payment: string; // Format: "YYYY-MM-DD"
  name: string;
  email: string;
  staff_fellow_number?: string; // Format1: Employee No. / Format2: Consultant ID
  employee_id?: string;         // Format1: Employees ID / Format3: ID Number / Format4: Employee Id
  program?: string;
  payroll_type?: string; // 'rwf' | 'rwf_usd' | 'wop_usd' | 'xof' | 'rwf_wop'
  currency?: string;     // 'RWF' | 'USD' | 'XOF'
  // Format 1: Rwanda RWF/USD staff
  basic_salary?: string;
  gross_salary?: string;
  csr_employer?: string;
  occupational_hazards?: string;
  maternity_employer?: string;
  csr_employee?: string;
  maternity_employee?: string;
  tpr?: string;
  net_salary_before_cbhi?: string;
  cbhi?: string;
  net_salary: string;
  bnr_exchange_rate_date?: string;
  exchange_rate_used?: string;
  net_salary_usd?: string;
  // Format 2: International WOP/USD
  gross_usd?: string;
  wop_usd?: string;
  date_rate?: string;
  wop_rwf?: string;
  gross_rwf?: string;
  // Format 3: Burkina Faso XOF
  housing_allowance?: string;
  function_allowance?: string;
  transport_allowance?: string;
  uploaded_by: number;
  source_filename?: string;
}

export interface PayrollFilters {
  user_id?: number;
  payroll_period?: string;
  email?: string;
  name?: string;
  email_sent?: boolean;
  search?: string;
  start_date?: Date;
  end_date?: Date;
}

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
}

/**
 * Find user by email to match with payroll data
 */
export async function findUserByEmail(email: string) {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user || null;
  } catch (error) {
    logger.error("Error finding user by email:", error);
    return null;
  }
}

/**
 * Create a new payroll record
 */
export async function createPayroll(data: CreatePayrollData) {
  try {
    const [payroll] = await db.insert(payrolls).values(data).returning();

    logger.info(`Payroll created for user ${data.user_id}`, {
      payrollId: payroll.id,
    });
    return payroll;
  } catch (error) {
    logger.error("Error creating payroll:", error);
    throw new AppError("Failed to create payroll", 500);
  }
}

/**
 * Bulk create payroll records
 */
export async function createPayrollBulk(data: CreatePayrollData[]) {
  try {
    const result = await db.insert(payrolls).values(data).returning();

    logger.info(`Bulk created ${result.length} payroll records`);
    return result;
  } catch (error) {
    logger.error("Error bulk creating payrolls:", error);
    throw new AppError("Failed to bulk create payrolls", 500);
  }
}

/**
 * Get payroll by ID with user details
 */
export async function getPayrollById(id: number) {
  try {
    const [payroll] = await db
      .select({
        payroll: payrolls,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar_url: users.avatar_url,
        },
      })
      .from(payrolls)
      .leftJoin(users, eq(payrolls.user_id, users.id))
      .where(eq(payrolls.id, id))
      .limit(1);

    return payroll || null;
  } catch (error) {
    logger.error("Error getting payroll by ID:", error);
    throw new AppError("Failed to get payroll", 500);
  }
}

/**
 * Get paginated payrolls with filters
 */
export async function getPayrolls(
  filters: PayrollFilters = {},
  pagination: PaginationOptions = {},
) {
  try {
    const {
      user_id,
      payroll_period,
      email,
      name,
      email_sent,
      search,
      start_date,
      end_date,
    } = filters;

    const {
      page = 1,
      limit = 20,
      sort_by = "created_at",
      sort_order = "desc",
    } = pagination;

    const offset = (page - 1) * limit;

    // Build where conditions
    const conditions = [];

    if (user_id) {
      conditions.push(eq(payrolls.user_id, user_id));
    }

    if (payroll_period) {
      conditions.push(eq(payrolls.payroll_period, payroll_period));
    }

    if (email) {
      conditions.push(ilike(payrolls.email, `%${email}%`));
    }

    if (name) {
      conditions.push(ilike(payrolls.name, `%${name}%`));
    }

    if (email_sent !== undefined) {
      conditions.push(eq(payrolls.email_sent, email_sent));
    }

    if (search) {
      conditions.push(
        or(
          ilike(payrolls.name, `%${search}%`),
          ilike(payrolls.email, `%${search}%`),
          ilike(payrolls.payroll_period, `%${search}%`),
        ),
      );
    }

    if (start_date) {
      conditions.push(sql`${payrolls.date_of_payment} >= ${start_date}`);
    }

    if (end_date) {
      conditions.push(sql`${payrolls.date_of_payment} <= ${end_date}`);
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(payrolls)
      .where(whereClause);

    // Get paginated results with user details
    const validSortColumns = [
      "id",
      "name",
      "email",
      "payroll_period",
      "date_of_payment",
      "created_at",
      "net_salary",
      "email_sent",
    ];
    const sortColumnName = validSortColumns.includes(sort_by)
      ? sort_by
      : "created_at";
    const sortColumn = payrolls[sortColumnName as keyof typeof payrolls] as any;
    const orderFn = sort_order === "asc" ? asc : desc;

    const results = await db
      .select({
        payroll: payrolls,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
          avatar_url: users.avatar_url,
        },
      })
      .from(payrolls)
      .leftJoin(users, eq(payrolls.user_id, users.id))
      .where(whereClause)
      .orderBy(orderFn(sortColumn))
      .limit(limit)
      .offset(offset);

    return {
      data: results,
      pagination: {
        page,
        limit,
        total: count,
        total_pages: Math.ceil(count / limit),
      },
    };
  } catch (error) {
    logger.error("Error getting payrolls:", error);
    throw new AppError("Failed to get payrolls", 500);
  }
}

/**
 * Update payroll record
 */
export async function updatePayroll(
  id: number,
  data: Partial<CreatePayrollData>,
) {
  try {
    const [payroll] = await db
      .update(payrolls)
      .set({
        ...data,
        updated_at: sql`CURRENT_TIMESTAMP`,
      })
      .where(eq(payrolls.id, id))
      .returning();

    if (!payroll) {
      throw new AppError("Payroll not found", 404);
    }

    logger.info(`Payroll ${id} updated`);
    return payroll;
  } catch (error) {
    logger.error("Error updating payroll:", error);
    throw new AppError("Failed to update payroll", 500);
  }
}

/**
 * Update payslip file information
 */
export async function updatePayslipFile(
  id: number,
  fileUrl: string,
  fileKey: string,
) {
  try {
    const [payroll] = await db
      .update(payrolls)
      .set({
        payslip_file_url: fileUrl,
        payslip_file_key: fileKey,
        updated_at: new Date(),
      })
      .where(eq(payrolls.id, id))
      .returning();

    logger.info(`Payslip file updated for payroll ${id}`);
    return payroll;
  } catch (error) {
    logger.error("Error updating payslip file:", error);
    throw new AppError("Failed to update payslip file", 500);
  }
}

/**
 * Mark payroll email as sent
 */
export async function markEmailSent(
  id: number,
  success: boolean,
  error?: string,
) {
  try {
    const [payroll] = await db
      .update(payrolls)
      .set({
        email_sent: success,
        email_sent_at: success ? new Date() : null,
        email_error: error || null,
        updated_at: new Date(),
      })
      .where(eq(payrolls.id, id))
      .returning();

    logger.info(
      `Email status updated for payroll ${id}: ${success ? "sent" : "failed"}`,
    );
    return payroll;
  } catch (error) {
    logger.error("Error marking email sent:", error);
    throw new AppError("Failed to update email status", 500);
  }
}

/**
 * Delete payroll record
 */
export async function deletePayroll(id: number) {
  try {
    const [payroll] = await db
      .delete(payrolls)
      .where(eq(payrolls.id, id))
      .returning();

    if (!payroll) {
      throw new AppError("Payroll not found", 404);
    }

    // Also delete the PDF from Spaces if it exists
    if (payroll.payslip_file_key) {
      await deletePayslipFromSpaces(payroll.payslip_file_key).catch((err) => {
        logger.warn(`Could not delete payslip file from Spaces for payroll ${id}: ${err.message}`);
      });
    }

    logger.info(`Payroll ${id} deleted`);
    return payroll;
  } catch (error) {
    logger.error("Error deleting payroll:", error);
    throw new AppError("Failed to delete payroll", 500);
  }
}

/**
 * Get payrolls pending email send
 */
export async function getPendingEmailPayrolls(limit = 50) {
  try {
    const results = await db
      .select({
        payroll: payrolls,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(payrolls)
      .leftJoin(users, eq(payrolls.user_id, users.id))
      .where(
        and(
          eq(payrolls.email_sent, false),
          sql`${payrolls.payslip_file_url} IS NOT NULL`,
        ),
      )
      .limit(limit);

    return results;
  } catch (error) {
    logger.error("Error getting pending email payrolls:", error);
    throw new AppError("Failed to get pending payrolls", 500);
  }
}
