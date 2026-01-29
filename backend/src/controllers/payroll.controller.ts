import { Request, Response, NextFunction } from "express";
import * as payrollService from "../services/payroll.service";
import * as pdfService from "../services/pdf.service";
import * as payrollEmailService from "../services/payroll-email.service";
import { AppError } from "../middlewares";
import { Logger } from "../config";
import Papa from "papaparse";
import fs from "fs";

const logger = new Logger("PayrollController");

/**
 * Parse and validate CSV payroll data
 */
function parsePayrollCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, "utf-8");

    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        resolve(results.data);
      },
      error: (error: any) => {
        reject(error);
      },
    });
  });
}

/**
 * Match CSV row with user in database by email
 */
async function matchUserByEmail(email: string) {
  if (!email || !email.trim()) {
    return null;
  }

  const user = await payrollService.findUserByEmail(email.trim().toLowerCase());
  return user;
}

/**
 * Upload payroll from CSV file
 */
export async function uploadPayrollCSV(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) {
      throw new AppError("No file uploaded", 400);
    }

    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    logger.info(`Processing payroll upload: ${req.file.originalname}`);

    // Parse CSV
    const rows = await parsePayrollCSV(req.file.path);

    if (rows.length === 0) {
      throw new AppError("CSV file is empty", 400);
    }

    // Process and validate rows
    const validRecords: any[] = [];
    const invalidRecords: any[] = [];

    for (const row of rows) {
      const email = row.Email || row.email;
      const name = row.Name || row.name;

      if (!email || !name) {
        invalidRecords.push({
          row,
          error: "Missing email or name",
        });
        continue;
      }

      // Match with user in database
      const user = await matchUserByEmail(email);

      if (!user) {
        invalidRecords.push({
          row,
          email,
          name,
          error: "Email not found in users database",
        });
        continue;
      }

      // Parse numeric values
      const parseNumber = (value: any) => {
        if (!value) return "0";
        const cleaned = String(value).replace(/,/g, "");
        return cleaned || "0";
      };

      // Parse date to YYYY-MM-DD format
      const parseDate = (value: any) => {
        if (!value) return undefined;

        const trimmed = String(value).trim();
        if (!trimmed) return undefined;

        // Try to parse DD.MM.YY format (e.g., "18.12.25")
        const ddmmyyMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
        if (ddmmyyMatch) {
          const [, day, month, year] = ddmmyyMatch;
          const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
          return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
        }

        // Fallback to standard date parsing
        const date = new Date(trimmed);
        if (isNaN(date.getTime())) return undefined;
        return date.toISOString().split("T")[0];
      };

      const dateOfPayment = parseDate(
        row["Date of payment"] ||
          row["date_of_payment"] ||
          row["Date of Payment"],
      );

      if (!dateOfPayment) {
        invalidRecords.push({
          row,
          email,
          name,
          error: "Invalid or missing date of payment",
        });
        continue;
      }

      validRecords.push({
        user_id: user.id,
        payroll_period: row["Payroll Period"] || row["payroll_period"],
        date_of_payment: dateOfPayment,
        name,
        email: user.email,
        staff_fellow_number:
          row["Staff/Fellows Numbers"] || row["staff_fellow_number"],
        employee_tin_number:
          row["Employee Tin Number"] || row["employee_tin_number"],
        employee_id: row["Employees ID"] || row["employee_id"],
        employee_rssb_no: row["Employee RSSB NO"] || row["employee_rssb_no"],
        program: row["Program"] || row["program"],
        basic_salary: parseNumber(row["Basic Salary"] || row["basic_salary"]),
        other: parseNumber(row["Other"] || row["other"]),
        gross_salary: parseNumber(row["Gross Salary"] || row["gross_salary"]),
        medical_employer: parseNumber(
          row["MEDICAL 7.5% /employer contribution"] || row["medical_employer"],
        ),
        csr_employer: parseNumber(
          row["CSR 8% /Employer contribution/RSSB"] || row["csr_employer"],
        ),
        maternity_employer: parseNumber(
          row["MATERNITY 0.3% /Employer contribution"] ||
            row["maternity_employer"],
        ),
        total_employer_expenditure: parseNumber(
          row["TOTAL EXPENDITURE (EMPLOYER)"] ||
            row["total_employer_expenditure"],
        ),
        medical_employee: parseNumber(
          row["MEDICAL 7.5%/Employee contribution/"] || row["medical_employee"],
        ),
        csr_employee: parseNumber(
          row["CSR 6%/Employee contribution/RSSB"] || row["csr_employee"],
        ),
        maternity_employee: parseNumber(
          row["MATERNITY 0.3% /Employee contribution"] ||
            row["maternity_employee"],
        ),
        tpr: parseNumber(row["TPR 30%"] || row["tpr"]),
        net_salary_before_cbhi: parseNumber(
          row["Net Salary before CBHI"] || row["net_salary_before_cbhi"],
        ),
        cbhi: parseNumber(row["CBHI 0.5%"] || row["cbhi"]),
        net_salary: parseNumber(row["Net Salary"] || row["net_salary"]),
        total_rra_rssb_cost: parseNumber(
          row["Total RRA/RSSB cost"] || row["total_rra_rssb_cost"],
        ),
        bnr_exchange_rate_date: parseDate(row["BNR Date of Exchange Rate"]),
        exchange_rate_used: parseNumber(
          row["Exchange Rate Used"] || row["exchange_rate_used"],
        ),
        net_salary_usd: parseNumber(
          row["Net Salary Paid in USD"] || row["net_salary_usd"],
        ),
        difference_due_to_exchange: parseNumber(
          row["Difference due to EXchange"] ||
            row["difference_due_to_exchange"],
        ),
        difference_in_rwf: parseNumber(
          row["Defference in RWF"] || row["difference_in_rwf"],
        ),
        basic_salary_adjustment: parseNumber(
          row["Basic salary adjustment due to Exchange rate"] ||
            row["basic_salary_adjustment"],
        ),
        uploaded_by: userId,
        source_filename: req.file.originalname,
      });
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    logger.info(
      `Processed ${rows.length} rows: ${validRecords.length} valid, ${invalidRecords.length} invalid`,
    );

    res.status(200).json({
      message: "CSV processed successfully",
      summary: {
        total_rows: rows.length,
        valid_records: validRecords.length,
        invalid_records: invalidRecords.length,
      },
      valid_records: validRecords,
      invalid_records: invalidRecords,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create payroll records (bulk or single)
 */
export async function createPayrolls(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { payrolls: payrollData } = req.body;

    if (!Array.isArray(payrollData) || payrollData.length === 0) {
      throw new AppError("Invalid payroll data", 400);
    }

    let result;
    if (payrollData.length === 1) {
      result = await payrollService.createPayroll(payrollData[0]);
    } else {
      result = await payrollService.createPayrollBulk(payrollData);
    }

    res.status(201).json({
      message: `${payrollData.length} payroll record(s) created successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all payrolls with filters and pagination
 */
export async function getPayrolls(
  req: Request,
  res: Response,
  next: NextFunction,
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
      page,
      limit,
      sort_by,
      sort_order,
    } = req.query;

    const filters: any = {};
    if (user_id) filters.user_id = parseInt(user_id as string);
    if (payroll_period) filters.payroll_period = payroll_period as string;
    if (email) filters.email = email as string;
    if (name) filters.name = name as string;
    if (email_sent !== undefined) filters.email_sent = email_sent === "true";
    if (search) filters.search = search as string;
    if (start_date) filters.start_date = new Date(start_date as string);
    if (end_date) filters.end_date = new Date(end_date as string);

    const pagination: any = {};
    if (page) pagination.page = parseInt(page as string);
    if (limit) pagination.limit = parseInt(limit as string);
    if (sort_by) pagination.sort_by = sort_by as string;
    if (sort_order) pagination.sort_order = sort_order as "asc" | "desc";

    const result = await payrollService.getPayrolls(filters, pagination);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Get single payroll by ID
 */
export async function getPayrollById(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const payroll = await payrollService.getPayrollById(parseInt(id));

    if (!payroll) {
      throw new AppError("Payroll not found", 404);
    }

    res.status(200).json({ data: payroll });
  } catch (error) {
    next(error);
  }
}

/**
 * Update payroll
 */
export async function updatePayroll(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const payroll = await payrollService.updatePayroll(
      parseInt(id),
      updateData,
    );

    res.status(200).json({
      message: "Payroll updated successfully",
      data: payroll,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete payroll
 */
export async function deletePayroll(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;
    await payrollService.deletePayroll(parseInt(id));

    res.status(200).json({
      message: "Payroll deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get signed URL for payslip file
 */
export async function getPayslipSignedUrl(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { id } = req.params;

    const payrollData = await payrollService.getPayrollById(parseInt(id));

    if (!payrollData) {
      throw new AppError("Payroll not found", 404);
    }

    const { payroll } = payrollData;

    if (!payroll.payslip_file_key) {
      throw new AppError("Payslip file not found", 404);
    }

    // Generate signed URL (valid for 1 hour for viewing)
    const signedUrl = await pdfService.generateSignedPayslipUrl(
      payroll.payslip_file_key,
      60 * 60, // 1 hour
    );

    res.status(200).json({
      url: signedUrl,
      expires_in: 3600,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Send payslip email (single or batch)
 */
export async function sendPayslipEmails(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { payroll_ids } = req.body;

    if (!Array.isArray(payroll_ids) || payroll_ids.length === 0) {
      throw new AppError("Invalid payroll IDs", 400);
    }

    // Send emails in background (don't wait)
    payrollEmailService
      .sendPayslipsBatch(payroll_ids)
      .then((result: any) => {
        logger.info(
          `Email batch complete: ${result.successful}/${result.total} sent successfully`,
        );
      })
      .catch((error: any) => {
        logger.error("Error in background email sending:", error);
      });

    res.status(200).json({
      message: `Email sending initiated for ${payroll_ids.length} payslip(s)`,
      count: payroll_ids.length,
    });
  } catch (error) {
    next(error);
  }
}
