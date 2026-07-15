import { Request, Response, NextFunction } from "express";
/**
 * @swagger
 * /hr/payroll:
 *   get:
 *     summary: Get all payroll records
 *     tags: [HR Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: employeeId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: month
 *         schema:
 *           type: integer
 *       - in: query
 *         name: year
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Payroll records fetched
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HrPayroll'
 *   post:
 *     summary: Create payroll records
 *     tags: [HR Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               $ref: '#/components/schemas/HrPayroll'
 *     responses:
 *       201:
 *         description: Payroll records created
 *
 * /hr/payroll/upload:
 *   post:
 *     summary: Upload payroll CSV
 *     tags: [HR Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: CSV uploaded and processed
 *
 * /hr/payroll/{id}:
 *   get:
 *     summary: Get payroll details
 *     tags: [HR Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Payroll fetched
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HrPayroll'
 *   patch:
 *     summary: Update payroll record
 *     tags: [HR Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HrPayroll'
 *     responses:
 *       200:
 *         description: Payroll updated
 *   delete:
 *     summary: Delete payroll record
 *     tags: [HR Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Payroll deleted
 *
 * /hr/payroll/{id}/payslip:
 *   get:
 *     summary: Get payslip signed URL
 *     tags: [HR Payroll]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Signed URL fetched
 *
 * /hr/payroll/send-emails:
 *   post:
 *     summary: Send payslip emails
 *     tags: [HR Payroll]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payrollIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *     responses:
 *       200:
 *         description: Emails sent
 */
import * as payrollService from "../../services/hr/payroll.service";
import * as payslipTokenService from "../../services/hr/payslip-token.service";
import * as pdfService from "../../services/hr/pdf.service";
import * as payrollEmailService from "../../services/hr/payroll-email.service";
import { AppError } from "../../middlewares";
import { Logger } from "../../config";
import env from "../../config/env";
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
function detectFormat(headers: string[]): "format1" | "format2" | "format3" | "format4" {
  const h = headers.map((x) => x.toLowerCase().trim());
  const has = (substr: string) => h.some((col) => col.includes(substr));

  if (has("housing allowance") || has("housing allowances")) return "format3";
  if (has("gross fees") || has("wop usd") || has("consultant id")) return "format2";
  if (has("basic salary") || has("basic_salary")) return "format1";
  // Format 4: has WOP column but no "wop usd", no "basic salary", no "housing"
  if (has("wop")) return "format4";
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
 * Columns: Payroll Period, Employee No., Date of payment, Name, Employees ID, Email address,
 *   Program, Basic Salary, Gross Salary, CSR 6% /Employer contribution/RSSB,
 *   Employer_ Occupational Hazards contribution (2%), MATERNITY 0.3% /Employer contribution,
 *   CSR 6%/Employee contribution/RSSB, MATERNITY 0.3% /Employee contribution,
 *   TPR 30%, Net Salary before CBHI, CBHI 0.5%, Net Salary, Date of BNR rate, NCBA Rate, Net Salary Paid in USD
 */
function processFormat1Row(
  row: any,
  userId: number | null,
  uploadedBy: number,
  filename: string,
): any | null {
  const email = (row["Email address"] || row.Email || row.email || "").trim();
  const name = (row.Name || row.name || "").trim();
  if (!email || !name) return null;

  const dateOfPayment = parseDate(
    row["Date of payment"] || row["date_of_payment"] || row["Date of Payment"],
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
      (row["Employee No."] || row["Employee No"] || row["staff_fellow_number"] || "").trim() ||
      undefined,
    employee_id: (row["Employees ID"] || row["employee_id"] || "").trim() || undefined,
    program: (row.Program || row.program || "").trim() || undefined,
    payroll_type: isUsdEmployee ? "rwf_usd" : "rwf",
    currency: "RWF",
    basic_salary: parseNumber(row["Basic Salary"] || row["basic_salary"]),
    gross_salary: parseNumber(row["Gross Salary"] || row["gross_salary"]),
    csr_employer: parseNumber(row["CSR 6% /Employer contribution/RSSB"] || row["csr_employer"]),
    occupational_hazards: parseNumber(
      row["Employer_ Occupational Hazards contribution   (2%)"] ||
        row["Employer_ Occupational Hazards contribution (2%)"] ||
        row["occupational_hazards"],
    ),
    maternity_employer: parseNumber(
      row["MATERNITY 0.3% /Employer contribution"] || row["maternity_employer"],
    ),
    csr_employee: parseNumber(row["CSR 6%/Employee contribution/RSSB"] || row["csr_employee"]),
    maternity_employee: parseNumber(
      row["MATERNITY 0.3% /Employee contribution"] || row["maternity_employee"],
    ),
    tpr: parseNumber(row["TPR 30%"] || row.tpr),
    net_salary_before_cbhi: parseNumber(
      row["Net Salary before CBHI"] || row["net_salary_before_cbhi"],
    ),
    cbhi: parseNumber(row["CBHI 0.5%"] || row.cbhi),
    net_salary: parseNumber(row["Net Salary"] || row["net_salary"]),
    net_salary_usd: isUsdEmployee
      ? parseNumber(row["Net Salary Paid in USD"] || row["net_salary_usd"])
      : undefined,
    bnr_exchange_rate_date: parseDate(row["Date of BNR rate"] || row["bnr_exchange_rate_date"]),
    exchange_rate_used: parseNumber(row["NCBA Rate"] || row["exchange_rate_used"]) || undefined,
    uploaded_by: uploadedBy,
    source_filename: filename,
  };
}

/**
 * Format 2: International WOP/USD
 * Columns: Payroll Period, Date of payment, Program name (=name), Consultant ID,
 *   Gross fees, WOP USD, Date rate, NCBA Rate Used, WOP RWF, Net payments, Gross (RWF), Email
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

  const period = (row["Payroll Period"] || row["payroll_period"] || "").trim();
  if (!period) return null;

  const dateOfPayment = parseDate(
    row["Date of payment"] || row["Date of Payment"] || row["date_of_payment"],
  );

  const grossUsd = parseNumber(row["Gross fees"] || row["gross_usd"]);
  const wopUsd = parseNumber(row["WOP USD"] || row["wop_usd"]);
  const wopRwf = parseNumber(row["WOP RWF"] || row["wop_rwf"]);
  const netUsd = parseNumber(row["Net payments"] || row["net_usd"]);
  const grossRwf = parseNumber(row["Gross"] || row["gross_rwf"]);
  const ncbaRate = parseNumber(row["NCBA Rate Used"] || row["exchange_rate_used"]) || undefined;
  const dateRate = parseDate(row["Date rate"] || row["date_rate"]);

  return {
    user_id: userId,
    payroll_period: period,
    date_of_payment: dateOfPayment || period,
    name,
    email,
    staff_fellow_number:
      (row["Consultant ID"] || row["staff_fellow_number"] || "").trim() || undefined,
    payroll_type: "wop_usd",
    currency: "USD",
    gross_usd: grossUsd,
    wop_usd: wopUsd,
    date_rate: dateRate,
    exchange_rate_used: ncbaRate,
    wop_rwf: wopRwf,
    net_salary: netUsd,
    net_salary_usd: netUsd,
    gross_rwf: grossRwf,
    uploaded_by: uploadedBy,
    source_filename: filename,
  };
}

/**
 * Format 3: Burkina Faso XOF
 * Columns: Payroll Period, Date of payment, ID Number, Name,
 *   Basic, Housing allowances 20%, Function allowance 5%, Transport allowance 5%, Gross, Email
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

  const period = (row["Payroll Period"] || row["payroll_period"] || "").trim();
  if (!period) return null;

  const dateOfPayment = parseDate(
    row["Date of payment"] || row["Date of Payment"] || row["date_of_payment"],
  );
  const gross = parseNumber(row.Gross || row.gross_salary);

  return {
    user_id: userId,
    payroll_period: period,
    date_of_payment: dateOfPayment || period,
    name,
    email,
    employee_id: (row["ID Number"] || row["employee_id"] || "").trim() || undefined,
    payroll_type: "xof",
    currency: "XOF",
    basic_salary: parseNumber(row.Basic || row.basic_salary),
    housing_allowance: parseNumber(
      row["Housing allowances 20%"] || row["Housing allowances"] || row["housing_allowance"],
    ),
    function_allowance: parseNumber(
      row["Function allowance 5%"] || row["Function allowance"] || row["function_allowance"],
    ),
    transport_allowance: parseNumber(
      row[" Transport allowance 5% "] ||
        row["Transport allowance 5%"] ||
        row["transport_allowance"],
    ),
    gross_salary: gross,
    net_salary: gross,
    uploaded_by: uploadedBy,
    source_filename: filename,
  };
}

/**
 * Format 4: Rwanda RWF with withholding tax (WOP)
 * Columns: Payroll Period, Date of payment, Employee Id, Name, Gross, WOP, Net, Email
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

  const period = (row["Payroll Period"] || row["payroll_period"] || "").trim();
  if (!period) return null;

  const dateOfPayment = parseDate(row["Date of payment"] || row["date_of_payment"]);

  return {
    user_id: userId,
    payroll_period: period,
    date_of_payment: dateOfPayment || period,
    name,
    email,
    employee_id:
      (row["Employee Id"] || row["Employee ID"] || row["employee_id"] || "").trim() || undefined,
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
export async function uploadPayrollCSV(req: Request, res: Response, next: NextFunction) {
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
      const email = (row["Email address"] || row.Email || row.email || "").trim();
      const name = (row.Name || row["Program name"] || row.name || "").trim();

      // Skip totals / blank rows
      if (!email && !name) continue;

      // Optionally link to existing user (not required)
      const user = email ? await payrollService.findUserByEmail(email.toLowerCase()) : null;

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
export async function createPayrolls(req: Request, res: Response, next: NextFunction) {
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
export async function getPayrolls(req: Request, res: Response, next: NextFunction) {
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
export async function getPayrollById(req: Request, res: Response, next: NextFunction) {
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
export async function updatePayroll(req: Request, res: Response, next: NextFunction) {
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
export async function deletePayroll(req: Request, res: Response, next: NextFunction) {
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
export async function getPayslipSignedUrl(req: Request, res: Response, next: NextFunction) {
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
export async function sendPayslipEmails(req: Request, res: Response, next: NextFunction) {
  try {
    const { payroll_ids } = req.body;
    if (!Array.isArray(payroll_ids) || payroll_ids.length === 0) {
      throw new AppError("Invalid payroll IDs", 400);
    }

    payrollEmailService
      .sendPayslipsBatch(payroll_ids)
      .then((result: any) => {
        logger.info(`Email batch complete: ${result.successful}/${result.total} sent successfully`);
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

/**
 * Revoke all previously-emailed payslip links for a payroll. Old links immediately 410.
 */
export async function revokePayslipLinks(req: Request, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id);
    if (Number.isNaN(id)) throw new AppError("Invalid payroll ID", 400);

    const payroll = await payrollService.getPayrollById(id);
    if (!payroll) throw new AppError("Payroll not found", 404);

    const revoked = await payslipTokenService.revokeTokensForPayroll(id);
    res.status(200).json({ revoked });
  } catch (error) {
    next(error);
  }
}
