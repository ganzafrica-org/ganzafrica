import { Request, Response, NextFunction } from "express";
import * as payrollService from "../services/payroll.service";
import * as pdfService from "../services/pdf.service";
import * as payrollEmailService from "../services/payroll-email.service";
import { AppError } from "../middlewares";
import { Logger } from "../config";
import env from "../config/env";
import Papa from "papaparse";
import fs from "fs";

const logger = new Logger("PayrollController");

// Emails that get paid in USD (Format 1 USD employees) - from env var
const USD_SALARY_EMAILS = new Set(
  (env.USD_SALARY_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
);

/**
 * Parse CSV file into rows
 */
function parsePayrollCSV(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const fileContent = fs.readFileSync(filePath, "utf-8");
    Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => resolve(results.data),
      error: (error: any) => reject(error),
    });
  });
}

/**
 * Detect the payroll format from the CSV headers:
 * Format 1: has 'Basic Salary' + 'MEDICAL' columns (Rwanda RWF staff, some USD employees)
 * Format 2: has 'USD total' + 'WOP USD' columns (international, USD net)
 * Format 3: has 'Housing allowances' column (Burkina Faso XOF)
 * Format 4: has 'WOP' + 'Net USD' but NO 'Basic Salary' / 'MEDICAL' (Rwanda RWF withholding)
 */
function detectFormat(
  headers: string[],
): "format1" | "format2" | "format3" | "format4" {
  const h = headers.map((x) => x.toLowerCase());
  const has = (substr: string) => h.some((col) => col.includes(substr));

  if (has("housing allowance")) return "format3";
  if (has("usd total") || has("wop usd")) return "format2";
  if (has("basic salary") || has("basic_salary")) return "format1";
  if (has("wop") && has("net usd")) return "format4";
  return "format1"; // fallback
}

/**
 * Parse a numeric string (handles commas, dashes, spaces)
 */
function parseNumber(value: any): string {
  if (!value) return "0";
  const str = String(value).trim();
  if (str === "-" || str === "") return "0";
  return str.replace(/,/g, "") || "0";
}

/**
 * Parse date to YYYY-MM-DD. Supports DD.MM.YY and DD.MM.YYYY formats.
 */
function parseDate(value: any): string | undefined {
  if (!value) return undefined;
  const trimmed = String(value).trim();
  if (!trimmed) return undefined;

  // Period string e.g. "01-30.01.26" — extract the end day as the payment date
  const period = trimmed.match(/^\d{1,2}-(\d{1,2})\.(\d{2})\.(\d{2})$/);
  if (period) {
    const [, endDay, month, year] = period;
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    return `${fullYear}-${month.padStart(2, "0")}-${endDay.padStart(2, "0")}`;
  }

  // DD.MM.YY e.g. "27.01.26"
  const ddmmyy = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2})$/);
  if (ddmmyy) {
    const [, day, month, year] = ddmmyy;
    const fullYear = parseInt(year) < 50 ? `20${year}` : `19${year}`;
    return `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // DD.MM.YYYY e.g. "27.01.2026"
  const ddmmyyyy = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  const date = new Date(trimmed);
  if (!isNaN(date.getTime())) return date.toISOString().split("T")[0];
  return undefined;
}

/**
 * Format 1: Rwanda RWF staff (some employees get USD net)
 */
function processFormat1Row(
  row: any,
  userId: number | null,
  uploadedBy: number,
  filename: string,
): any | null {
  const email = (
    row["Email address"] ||
    row.Email ||
    row.email ||
    ""
  ).trim();
  const name = (row.Name || row.name || "").trim();
  if (!email || !name) return null;

  const dateOfPayment = parseDate(
    row["Date of payment"] ||
      row["date_of_payment"] ||
      row["Date of Payment"],
  );
  if (!dateOfPayment) return null;

  const isUsdEmployee = USD_SALARY_EMAILS.has(email.toLowerCase());

  return {
    user_id: userId,
    payroll_period: (row["Payroll Period"] || row["payroll_period"] || "").trim(),
    date_of_payment: dateOfPayment,
    name,
    email,
    staff_fellow_number:
      (row["Staff/Fellows Numbers"] || row["staff_fellow_number"] || "").trim() ||
      undefined,
    employee_tin_number:
      (row["Employee Tin Number"] || row["employee_tin_number"] || "").trim() ||
      undefined,
    employee_id:
      (row["Employees ID"] || row["employee_id"] || "").trim() || undefined,
    employee_rssb_no:
      (row["Employee RSSB NO"] || row["employee_rssb_no"] || "").trim() ||
      undefined,
    program: (row.Program || row.program || "").trim() || undefined,
    payroll_type: isUsdEmployee ? "rwf_usd" : "rwf",
    currency: "RWF",
    basic_salary: parseNumber(row["Basic Salary"] || row["basic_salary"]),
    other: parseNumber(row.Other || row.other),
    gross_salary: parseNumber(row["Gross Salary"] || row["gross_salary"]),
    medical_employer: parseNumber(
      row["MEDICAL 7.5% /employer contribution"] || row["medical_employer"],
    ),
    csr_employer: parseNumber(
      row["CSR 6% /Employer contribution/RSSB"] ||
        row["CSR 8% /Employer contribution/RSSB"] ||
        row["csr_employer"],
    ),
    maternity_employer: parseNumber(
      row["MATERNITY 0.3% /Employer contribution"] || row["maternity_employer"],
    ),
    total_employer_expenditure: parseNumber(
      row["TOTAL EXPENDITURE (EMPLOYER)"] || row["total_employer_expenditure"],
    ),
    medical_employee: parseNumber(
      row["MEDICAL 7.5%/Employee contribution/"] || row["medical_employee"],
    ),
    csr_employee: parseNumber(
      row["CSR 6%/Employee contribution/RSSB"] || row["csr_employee"],
    ),
    maternity_employee: parseNumber(
      row["MATERNITY 0.3% /Employee contribution"] || row["maternity_employee"],
    ),
    tpr: parseNumber(row["TPR 30%"] || row.tpr),
    net_salary_before_cbhi: parseNumber(
      row["Net Salary before CBHI"] || row["net_salary_before_cbhi"],
    ),
    cbhi: parseNumber(row["CBHI 0.5%"] || row.cbhi),
    // USD employees: net_salary stores the USD amount; others store RWF
    net_salary: isUsdEmployee
      ? parseNumber(row["Net Salary Paid in USD"] || row["net_salary_usd"])
      : parseNumber(row["Net Salary"] || row["net_salary"]),
    net_salary_usd: isUsdEmployee
      ? parseNumber(row["Net Salary Paid in USD"] || row["net_salary_usd"])
      : undefined,
    total_rra_rssb_cost: parseNumber(
      row["Total RRA/RSSB cost"] || row["total_rra_rssb_cost"],
    ),
    bnr_exchange_rate_date: parseDate(
      row["Date of BNR rate"] || row["BNR Date of Exchange Rate"],
    ),
    exchange_rate_used:
      parseNumber(
        row["NCBA Rate"] ||
          row["Exchange Rate Used"] ||
          row["exchange_rate_used"],
      ) || undefined,
    difference_due_to_exchange:
      parseNumber(
        row["Difference due to EXchange"] || row["difference_due_to_exchange"],
      ) || undefined,
    difference_in_rwf:
      parseNumber(row["Defference in RWF"] || row["difference_in_rwf"]) ||
      undefined,
    basic_salary_adjustment:
      parseNumber(
        row["Basic salary adjustment due to Exchange rate"] ||
          row["basic_salary_adjustment"],
      ) || undefined,
    uploaded_by: uploadedBy,
    source_filename: filename,
  };
}

/**
 * Format 2: International WOP, USD net
 * Columns: Payroll Period, Program name (=name), Employee ID, USD total, WOP USD, Net fees (USD), Gross RWF, WOP RWF, NET FEES RWF, Email
 */
function processFormat2Row(
  row: any,
  userId: number | null,
  uploadedBy: number,
  filename: string,
): any | null {
  const email = (row.Email || row.email || "").trim();
  const name = (row["Program name"] || row.Name || row.name || "").trim();
  if (!email || !name) return null;

  const period = (
    row["Payroll Period"] ||
    row["payroll_period"] ||
    ""
  ).trim();
  if (!period) return null;

  const wopUsd = parseNumber(row["WOP USD"] || row["wop_usd"]);
  const wopRwf = parseNumber(
    row["WOP RWF (1,457)"] || row["WOP RWF"] || row["wop_rwf"],
  );
  const grossUsd = parseNumber(row["USD total"] || row["gross_usd"]);
  const netUsd = parseNumber(row["Net fees"] || row["net_usd"]);

  // Derive rate from wop_rwf / wop_usd
  const wopUsdNum = parseFloat(wopUsd);
  const wopRwfNum = parseFloat(wopRwf);
  const exchangeRate =
    wopUsdNum > 0 && wopRwfNum > 0
      ? (wopRwfNum / wopUsdNum).toFixed(4)
      : undefined;

  const dateOfPayment = parseDate(
    row["Date of payment"] || row["Date of Payment"] || row["date_of_payment"],
  );

  return {
    user_id: userId,
    payroll_period: period,
    date_of_payment: dateOfPayment || period,
    name,
    email,
    employee_id:
      (row["Employee ID"] || row["employee_id"] || "").trim() || undefined,
    payroll_type: "wop_usd",
    currency: "USD",
    gross_usd: grossUsd,
    wop_usd: wopUsd,
    wop_rwf: wopRwf,
    exchange_rate_used: exchangeRate,
    net_salary: netUsd,
    net_salary_usd: netUsd,
    uploaded_by: uploadedBy,
    source_filename: filename,
  };
}

/**
 * Format 3: Burkina Faso XOF
 * Columns: Payroll Period, Name, Basic, Housing allowances 20%, Function allowance 5%, Transport allowance 5%, Gross, RATE, BF JAs Salary in USD, Email
 */
function processFormat3Row(
  row: any,
  userId: number | null,
  uploadedBy: number,
  filename: string,
): any | null {
  const email = (row.Email || row.email || "").trim();
  const name = (row.Name || row.name || "").trim();
  if (!email || !name) return null;

  const period = (
    row["Payroll Period"] ||
    row["payroll_period"] ||
    ""
  ).trim();
  if (!period) return null;

  const gross = parseNumber(row.Gross || row.gross_salary);
  const dateOfPayment = parseDate(
    row["Date of payment"] || row["Date of Payment"] || row["date_of_payment"],
  );

  return {
    user_id: userId,
    payroll_period: period,
    date_of_payment: dateOfPayment || period,
    name,
    email,
    payroll_type: "xof",
    currency: "XOF",
    basic_salary: parseNumber(row.Basic || row.basic_salary),
    housing_allowance: parseNumber(
      row["Housing allowances 20%"] ||
        row["Housing allowances"] ||
        row["housing_allowance"],
    ),
    function_allowance: parseNumber(
      row["Function allowance 5%"] ||
        row["Function allowance"] ||
        row["function_allowance"],
    ),
    transport_allowance: parseNumber(
      row["Transport allowance 5%"] ||
        row[" Transport allowance 5% "] ||
        row["transport_allowance"],
    ),
    gross_salary: gross,
    net_salary: gross, // no deductions for BF fellows
    uploaded_by: uploadedBy,
    source_filename: filename,
  };
}

/**
 * Format 4: Rwanda RWF with withholding tax (WOP)
 * Columns: Payroll Period, Employee Id, Name, Gross, WOP, Net, Net USD, Email
 */
function processFormat4Row(
  row: any,
  userId: number | null,
  uploadedBy: number,
  filename: string,
): any | null {
  const email = (row.Email || row.email || "").trim();
  const name = (row.Name || row.name || "").trim();
  if (!email || !name) return null;

  const period = (
    row["Payroll Period"] ||
    row["payroll_period"] ||
    ""
  ).trim();
  if (!period) return null;

  const dateOfPayment = parseDate(
    row["Date of payment"] || row["date_of_payment"],
  );

  return {
    user_id: userId,
    payroll_period: period,
    date_of_payment: dateOfPayment || period,
    name,
    email,
    employee_id:
      (
        row["Employee Id"] ||
        row["Employee ID"] ||
        row["employee_id"] ||
        ""
      ).trim() || undefined,
    payroll_type: "rwf_wop",
    currency: "RWF",
    gross_salary: parseNumber(row.Gross || row.gross_salary),
    wop_rwf: parseNumber(row.WOP || row.wop),
    net_salary: parseNumber(row.Net || row.net_salary),
    uploaded_by: uploadedBy,
    source_filename: filename,
  };
}

/**
 * Upload payroll from CSV — auto-detects format
 */
export async function uploadPayrollCSV(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    if (!req.file) throw new AppError("No file uploaded", 400);

    const uploadedBy = req.user?.id as unknown as number;
    if (!uploadedBy) throw new AppError("Unauthorized", 401);

    logger.info(`Processing payroll upload: ${req.file.originalname}`);

    const rows = await parsePayrollCSV(req.file.path);
    if (rows.length === 0) throw new AppError("CSV file is empty", 400);

    const headers = Object.keys(rows[0]);
    const format = detectFormat(headers);
    logger.info(`Detected payroll format: ${format}`);

    const validRecords: any[] = [];
    const invalidRecords: any[] = [];

    for (const row of rows) {
      const email = (
        row["Email address"] ||
        row.Email ||
        row.email ||
        ""
      ).trim();
      const name = (
        row.Name ||
        row["Program name"] ||
        row.name ||
        ""
      ).trim();

      // Skip totals / blank rows
      if (!email && !name) continue;

      // Optionally link to existing user (not required)
      const user = email
        ? await payrollService.findUserByEmail(email.toLowerCase())
        : null;

      let record: any = null;

      if (format === "format1") {
        record = processFormat1Row(row, user?.id ?? null, uploadedBy, req.file!.originalname);
      } else if (format === "format2") {
        record = processFormat2Row(row, user?.id ?? null, uploadedBy, req.file!.originalname);
      } else if (format === "format3") {
        record = processFormat3Row(row, user?.id ?? null, uploadedBy, req.file!.originalname);
      } else if (format === "format4") {
        record = processFormat4Row(row, user?.id ?? null, uploadedBy, req.file!.originalname);
      }

      if (!record) {
        invalidRecords.push({
          row,
          email,
          name,
          error: "Missing required fields (email or name)",
        });
        continue;
      }

      validRecords.push(record);
    }

    fs.unlinkSync(req.file.path);

    logger.info(
      `Processed ${rows.length} rows: ${validRecords.length} valid, ${invalidRecords.length} invalid (format: ${format})`,
    );

    res.status(200).json({
      message: "CSV processed successfully",
      detected_format: format,
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
    if (!payroll) throw new AppError("Payroll not found", 404);
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
    const payroll = await payrollService.updatePayroll(parseInt(id), req.body);
    res.status(200).json({ message: "Payroll updated successfully", data: payroll });
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
    res.status(200).json({ message: "Payroll deleted successfully" });
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
    if (!payrollData) throw new AppError("Payroll not found", 404);

    const { payroll } = payrollData;
    if (!payroll.payslip_file_key) throw new AppError("Payslip file not found", 404);

    const signedUrl = await pdfService.generateSignedPayslipUrl(
      payroll.payslip_file_key,
      60 * 60 * 24 * 7,
    );

    res.status(200).json({ url: signedUrl, expires_in: 3600 });
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
